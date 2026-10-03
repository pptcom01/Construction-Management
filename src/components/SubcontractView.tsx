import React, { useState, useMemo } from 'react';
import { 
  HardHat, 
  FileText, 
  CheckCircle2, 
  Plus, 
  Search, 
  Calendar, 
  DollarSign, 
  Layers, 
  AlertCircle, 
  Printer, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  User, 
  Fuel, 
  Trash2, 
  Sparkles,
  ExternalLink,
  Percent,
  Check,
  Package,
  X
} from 'lucide-react';
import { 
  Subcontract, 
  SubcontractInspection, 
  SubcontractPaymentClaim, 
  SubcontractDeduction,
  RetentionLedgerRecord, 
  ProjectBOQItem,
  MaterialBackchargeItem 
} from '../types';
import { formatCurrency } from '../utils/accounting';
import { SubcontractPrintModal } from './SubcontractPrintModal';
import { SearchableCombobox } from './SearchableCombobox';
import { SubcontractorContractTemplate } from './documents/SubcontractTemplates';

interface SubcontractViewProps {
  subcontracts: Subcontract[];
  inspections: SubcontractInspection[];
  paymentClaims: SubcontractPaymentClaim[];
  retentionLedger: RetentionLedgerRecord[];
  boqItems: ProjectBOQItem[];
  backcharges?: MaterialBackchargeItem[];
  onAddSubcontract: (contract: Omit<Subcontract, 'id' | 'totalInspectedQty' | 'totalApprovedAmount' | 'totalPaidAmount' | 'totalRetentionHeld' | 'totalRetentionRefunded'>) => void;
  onAddInspection: (inspection: Omit<SubcontractInspection, 'id' | 'createdAt' | 'status'>) => void;
  onAddPaymentClaim: (claim: Omit<SubcontractPaymentClaim, 'id' | 'createdAt'>) => void;
  onRefundRetention: (recordId: string, pvNo: string, refundDate: string) => void;
  onSendClaimToDBM?: (claim: SubcontractPaymentClaim) => void;
  onNavigateToBOQ?: () => void;
  onNavigateToProcurement?: () => void;
}

export function SubcontractView({
  subcontracts,
  inspections,
  paymentClaims,
  retentionLedger,
  boqItems,
  backcharges = [],
  onAddSubcontract,
  onAddInspection,
  onAddPaymentClaim,
  onRefundRetention,
  onSendClaimToDBM,
  onNavigateToBOQ,
  onNavigateToProcurement
}: SubcontractViewProps) {
  
  // Sub-tabs navigation
  const [activeTab, setActiveTab] = useState<'contracts' | 'inspections' | 'claims' | 'retention'>('contracts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');

  // Modals state
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [isNewInspectionOpen, setIsNewInspectionOpen] = useState(false);
  const [isNewClaimOpen, setIsNewClaimOpen] = useState(false);
  const [printClaim, setPrintClaim] = useState<SubcontractPaymentClaim | null>(null);
  const [viewContractModal, setViewContractModal] = useState<Subcontract | null>(null);
  const [selectedInspectionForClaim, setSelectedInspectionForClaim] = useState<SubcontractInspection | null>(null);
  const [refundTargetRecord, setRefundTargetRecord] = useState<RetentionLedgerRecord | null>(null);
  const [refundPvInput, setRefundPvInput] = useState('');

  // Extract unique projects
  const uniqueProjects = useMemo(() => {
    const set = new Set<string>();
    subcontracts.forEach(s => set.add(s.project));
    boqItems.forEach(b => set.add(b.project));
    return Array.from(set);
  }, [subcontracts, boqItems]);

  // Filtered subcontracts
  const filteredContracts = useMemo(() => {
    return subcontracts.filter(c => {
      const matchProj = selectedProjectFilter === 'all' || c.project === selectedProjectFilter;
      const q = searchQuery.toLowerCase();
      const matchQ = !q || 
        c.contractNo.toLowerCase().includes(q) || 
        c.contractorName.toLowerCase().includes(q) || 
        c.contractTitle.toLowerCase().includes(q) ||
        (c.startKm && c.startKm.toLowerCase().includes(q));
      return matchProj && matchQ;
    });
  }, [subcontracts, selectedProjectFilter, searchQuery]);

  // Filtered inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter(i => {
      const matchProj = selectedProjectFilter === 'all' || i.project === selectedProjectFilter;
      const q = searchQuery.toLowerCase();
      const matchQ = !q || 
        i.contractNo.toLowerCase().includes(q) || 
        i.contractorName.toLowerCase().includes(q) || 
        i.workDescription.toLowerCase().includes(q) ||
        i.startKm.toLowerCase().includes(q) ||
        i.endKm.toLowerCase().includes(q);
      return matchProj && matchQ;
    });
  }, [inspections, selectedProjectFilter, searchQuery]);

  // Filtered claims
  const filteredClaims = useMemo(() => {
    return paymentClaims.filter(cl => {
      const matchProj = selectedProjectFilter === 'all' || cl.project === selectedProjectFilter;
      const q = searchQuery.toLowerCase();
      const matchQ = !q || 
        cl.claimNo.toLowerCase().includes(q) || 
        cl.contractNo.toLowerCase().includes(q) || 
        cl.contractorName.toLowerCase().includes(q) ||
        cl.payeeName.toLowerCase().includes(q);
      return matchProj && matchQ;
    });
  }, [paymentClaims, selectedProjectFilter, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const targetContracts = selectedProjectFilter === 'all' 
      ? subcontracts 
      : subcontracts.filter(c => c.project === selectedProjectFilter);
    const targetInspections = selectedProjectFilter === 'all'
      ? inspections
      : inspections.filter(i => i.project === selectedProjectFilter);
    const targetClaims = selectedProjectFilter === 'all'
      ? paymentClaims
      : paymentClaims.filter(cl => cl.project === selectedProjectFilter);
    const targetRetention = selectedProjectFilter === 'all'
      ? retentionLedger
      : retentionLedger.filter(r => {
          const c = subcontracts.find(sub => sub.id === r.subcontractId);
          return c?.project === selectedProjectFilter;
        });

    const totalContractVal = targetContracts.reduce((sum, c) => sum + c.contractAmount, 0);
    const totalApprovedVal = targetInspections.reduce((sum, i) => sum + i.approvedAmount, 0);
    const totalNetClaimed = targetClaims.reduce((sum, cl) => sum + cl.netPayableAmount, 0);
    const totalRetentionHeld = targetRetention.filter(r => r.status === 'held').reduce((sum, r) => sum + r.retentionAmount, 0);
    const totalRetentionRefunded = targetRetention.filter(r => r.status === 'refunded').reduce((sum, r) => sum + r.retentionAmount, 0);

    return {
      totalContractVal,
      totalApprovedVal,
      totalNetClaimed,
      totalRetentionHeld,
      totalRetentionRefunded,
      contractCount: targetContracts.length
    };
  }, [subcontracts, inspections, paymentClaims, retentionLedger, selectedProjectFilter]);

  // Handle open claim modal preloaded with inspection
  const handleOpenClaimForInspection = (insp: SubcontractInspection) => {
    setSelectedInspectionForClaim(insp);
    setIsNewClaimOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & KPI Cards */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-[#005aa9] rounded-xl border border-blue-200">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  ระบบบริหารผู้รับเหมาช่วง & ตรวจรับงาน
                </h1>
                <span className="px-2 py-0.5 bg-blue-100 text-[#005aa9] font-bold text-xs rounded-full">
                  Subcontractor & BOQ Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ควบคุมสัญญาจ้าง, ตรวจรับผลงานตามช่วง กม., หักบิลวัสดุร้านค้า/ค่าปรับ, เบิกค่าผลงาน และล็อกคืนเงินประกัน
              </p>
            </div>
          </div>

          {/* Project Filter & Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Project Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 hover:border-slate-400 transition-colors rounded-lg px-2.5 py-1.5 shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-hidden cursor-pointer max-w-[200px] sm:max-w-[250px] truncate"
              >
                <option value="all">ทุกโครงการทั้งหมด ({uniqueProjects.length})</option>
                {uniqueProjects.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsNewContractOpen(true)}
              className="px-3.5 py-2 bg-[#005aa9] text-white hover:bg-blue-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              ทำสัญญาจ้างใหม่
            </button>
            <button
              onClick={() => setIsNewInspectionOpen(true)}
              className="px-3.5 py-2 bg-emerald-700 text-white hover:bg-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              บันทึกตรวจงาน (ครั้งที่...)
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-semibold block">มูลค่าสัญญาจ้างรวม ({metrics.contractCount} สัญญา)</span>
            <span className="text-base sm:text-lg font-black font-mono text-slate-900 mt-1 block">
              {formatCurrency(metrics.totalContractVal)}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              ซอยตามช่วง กม. และรายการ BOQ
            </span>
          </div>

          <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200">
            <span className="text-blue-900 font-semibold block">มูลค่างานที่ตรวจรับผ่านแล้ว</span>
            <span className="text-base sm:text-lg font-black font-mono text-[#005aa9] mt-1 block">
              {formatCurrency(metrics.totalApprovedVal)}
            </span>
            <span className="text-[11px] text-blue-700 mt-0.5 block">
              คิดเป็น {metrics.totalContractVal > 0 ? ((metrics.totalApprovedVal / metrics.totalContractVal) * 100).toFixed(1) : 0}% ของสัญญารวม
            </span>
          </div>

          <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-200">
            <span className="text-amber-900 font-semibold block flex items-center justify-between">
              เงินประกันผลงานสะสม (Retention)
              <Lock className="w-3 h-3 text-amber-700" />
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-amber-900 mt-1 block">
              {formatCurrency(metrics.totalRetentionHeld)}
            </span>
            <span className="text-[11px] text-amber-700 mt-0.5 block">
              * คืนเฉพาะบัญชีเดิมที่เคยถูกหักไว้
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-200">
            <span className="text-emerald-900 font-semibold block">ยอดเบิกจ่ายสุทธิแล้ว (Net Paid)</span>
            <span className="text-base sm:text-lg font-black font-mono text-emerald-800 mt-1 block">
              {formatCurrency(metrics.totalNetClaimed)}
            </span>
            <span className="text-[11px] text-emerald-700 mt-0.5 block">
              ผ่านการหักร้านค้าและคำนวณภาษี
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Search Toolbar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-2.5 sm:p-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Sub-tabs with smooth horizontal scrolling on narrow screens */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('contracts')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'contracts'
                  ? 'bg-white text-[#005aa9] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              สัญญาจ้างช่างเหมา ({filteredContracts.length})
            </button>

            <button
              onClick={() => setActiveTab('inspections')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'inspections'
                  ? 'bg-white text-[#005aa9] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              บันทึกตรวจงาน ({filteredInspections.length})
            </button>

            <button
              onClick={() => setActiveTab('claims')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'claims'
                  ? 'bg-white text-[#005aa9] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 shrink-0" />
              ใบเบิกค่าผลงาน & รายการหัก ({filteredClaims.length})
            </button>

            <button
              onClick={() => setActiveTab('retention')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'retention'
                  ? 'bg-white text-[#005aa9] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              คืนเงินประกันผลงาน ({retentionLedger.filter(r => r.status === 'held').length})
            </button>
          </div>

          {/* Search Box - Dedicated and clean */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหา สัญญา, ช่างเหมา, กม..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8.5 pr-8 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                title="ล้างคำค้นหา"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= TAB 1: SUBCONTRACTS LIST ================= */}
      {activeTab === 'contracts' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="font-bold text-slate-800 text-sm">
                รายการสัญญาจ้างผู้รับเหมาช่วง (Subcontract Master Records)
              </h2>
              <p className="text-xs text-slate-500">
                ควบคุมขอบเขตงาน, ปริมาณงาน, ราคาต่อหน่วย, บัญชีธนาคาร และการหักเงินประกันผลงาน
              </p>
            </div>
            <button
              onClick={() => setIsNewContractOpen(true)}
              className="px-3 py-1.5 bg-[#005aa9] text-white hover:bg-blue-800 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มสัญญาใหม่
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-4">เลขที่สัญญา & งาน</th>
                  <th className="py-3 px-4">ผู้รับเหมาช่วง / คู่สัญญา</th>
                  <th className="py-3 px-4">โครงการ & ช่วง กม.</th>
                  <th className="py-3 px-4 text-right">ปริมาณงาน</th>
                  <th className="py-3 px-4 text-right">ราคา/หน่วย</th>
                  <th className="py-3 px-4 text-right">มูลค่าสัญญา</th>
                  <th className="py-3 px-4 text-center">ประกัน (Ret.)</th>
                  <th className="py-3 px-4 text-right">ตรวจผ่านสะสม</th>
                  <th className="py-3 px-4 text-center">สัญญา</th>
                  <th className="py-3 px-4 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      ไม่พบข้อมูลสัญญาตามเงื่อนไขที่ค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map(c => {
                    const progressPercent = c.contractAmount > 0 ? (c.totalApprovedAmount / c.contractAmount) * 100 : 0;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-blue-900 block">{c.contractNo}</span>
                          <span className="font-semibold text-slate-800 block text-xs">{c.contractTitle}</span>
                          <span className="text-[11px] text-slate-500">{c.workCategory}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{c.contractorName}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              c.entityType === 'corporate_vat' 
                                ? 'bg-blue-100 text-blue-900' 
                                : c.entityType === 'individual'
                                ? 'bg-purple-100 text-purple-900'
                                : 'bg-slate-200 text-slate-800'
                            }`}>
                              {c.entityType === 'corporate_vat' ? 'นิติบุคคล (VAT 7%)' : c.entityType === 'individual' ? 'บุคคลธรรมดา' : 'นิติบุคคล (ไม่มี VAT)'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">{c.taxId}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {c.defaultBankName} &bull; {c.defaultBankAccount}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800 block">{c.project}</span>
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded font-mono text-[11px] font-semibold">
                            {c.startKm || '-'} ถึง {c.endKm || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                          {c.quantity.toLocaleString()} {c.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700">
                          {formatCurrency(c.unitRate)}/{c.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                          {formatCurrency(c.contractAmount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-mono font-bold text-[11px]">
                            {(c.retentionRate * 100).toFixed(0)}%
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {c.warrantyPeriodMonths} ด.
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-bold text-emerald-700 block">
                            {formatCurrency(c.totalApprovedAmount)}
                          </span>
                          <div className="w-24 ml-auto bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                            <div 
                              className="bg-[#005aa9] h-full rounded-full" 
                              style={{ width: `${Math.min(100, progressPercent)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {progressPercent.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setViewContractModal(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-[#005aa9] text-[#005aa9] hover:text-white border border-blue-200 rounded text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                            title="ดูและพิมพ์สัญญาจ้างเหมา (ตามแบบ 3 หน้า)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>สัญญา</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full font-bold text-[10px]">
                            ดำเนินการ
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: INSPECTIONS LIST ================= */}
      {activeTab === 'inspections' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="font-bold text-slate-800 text-sm">
                บันทึกการตรวจรับผลงานหน้างาน (Site Inspections)
              </h2>
              <p className="text-xs text-slate-500">
                ระบบนับครั้งที่ตรวจให้อัตโนมัติตามสัญญา, ระบุช่วง กม., ตรวจสอบปริมาณงานจริง และคำนวณมูลค่างานที่อนุมัติ
              </p>
            </div>
            <button
              onClick={() => setIsNewInspectionOpen(true)}
              className="px-3 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              บันทึกตรวจงานใหม่
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-4">สัญญา & ครั้งที่ตรวจ</th>
                  <th className="py-3 px-4">วันที่ & วิศวกรผู้ตรวจ</th>
                  <th className="py-3 px-4">ช่วง กม. ที่ตรวจรับ</th>
                  <th className="py-3 px-4">รายละเอียดขอบเขตงานที่ตรวจรับ</th>
                  <th className="py-3 px-4 text-right">ปริมาณงานตรวจผ่าน</th>
                  <th className="py-3 px-4 text-right">มูลค่างานที่อนุมัติ</th>
                  <th className="py-3 px-4 text-center">สถานะการเบิก</th>
                  <th className="py-3 px-4 text-center">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {filteredInspections.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      ไม่พบข้อมูลผลการตรวจงาน
                    </td>
                  </tr>
                ) : (
                  filteredInspections.map(insp => (
                    <tr key={insp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-blue-900">{insp.contractNo}</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-black text-[11px]">
                            ครั้งที่ {insp.inspectionNo}
                          </span>
                        </div>
                        <span className="text-slate-700 font-semibold block mt-0.5">{insp.contractorName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{insp.inspectionDate}</span>
                        <span className="text-[11px] text-slate-500 block">{insp.inspectorName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded font-mono font-semibold text-[11px]">
                          {insp.startKm} - {insp.endKm}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-slate-800 block leading-relaxed">{insp.workDescription}</span>
                        {insp.notes && (
                          <span className="text-[11px] text-slate-400 block mt-0.5 italic">
                            หมายเหตุ: {insp.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        {insp.inspectedQty.toLocaleString()} {insp.unit}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          @{formatCurrency(insp.unitRate)}/{insp.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-800 text-sm">
                        {formatCurrency(insp.approvedAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {insp.status === 'claimed' ? (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-full font-bold text-[10px]">
                            ทำเรื่องเบิกแล้ว
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold text-[10px]">
                            รอตั้งเบิก
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {insp.status === 'approved' ? (
                          <button
                            onClick={() => handleOpenClaimForInspection(insp)}
                            className="px-2.5 py-1.5 bg-[#005aa9] text-white hover:bg-blue-800 rounded font-bold text-[11px] flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            ตั้งเบิกค่าผลงาน
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const claim = paymentClaims.find(c => c.inspectionId === insp.id || c.claimNo.includes(`-${String(insp.inspectionNo).padStart(2, '0')}`));
                              if (claim) setPrintClaim(claim);
                            }}
                            className="px-2.5 py-1 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded font-semibold text-[11px] flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            ดูใบเบิก
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PAYMENT CLAIMS & DEDUCTIONS ================= */}
      {activeTab === 'claims' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="font-bold text-slate-800 text-sm">
                ใบขอเบิกค่าผลงาน & รายการหัก (Progress Payment Claims)
              </h2>
              <p className="text-xs text-slate-500">
                รวมยอดตรวจงาน หักเงินประกันผลงาน หักบิลวัสดุร้านค้า หักค่าปรับ และคำนวณภาษีอัตโนมัติ
              </p>
            </div>
            <button
              onClick={() => setIsNewClaimOpen(true)}
              className="px-3 py-1.5 bg-[#005aa9] text-white hover:bg-blue-800 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              สร้างใบเบิกค่าผลงานใหม่
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-4">เลขที่ใบเบิก & สัญญา</th>
                  <th className="py-3 px-4">ผู้รับเงินงวดนี้ (Payee)</th>
                  <th className="py-3 px-4 text-right">ค่างานตรวจผ่าน</th>
                  <th className="py-3 px-4 text-right text-red-700">หักประกัน 5%</th>
                  <th className="py-3 px-4 text-right text-red-700">หักร้านค้า/อื่นๆ</th>
                  <th className="py-3 px-4 text-right">ฐานภาษี</th>
                  <th className="py-3 px-4 text-right text-amber-800">ภาษี (VAT/หัก 3%)</th>
                  <th className="py-3 px-4 text-right text-emerald-900 font-black">ยอดจ่ายสุทธิ</th>
                  <th className="py-3 px-4 text-center">อ้างอิง DBM/PV</th>
                  <th className="py-3 px-4 text-center">พิมพ์ / ส่งต่อ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      ไม่พบข้อมูลใบเบิกค่าผลงาน
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map(claim => (
                    <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{claim.claimNo}</span>
                        <span className="font-semibold text-blue-900 block">
                          {claim.contractNo} (งวดที่ {claim.inspectionNo})
                        </span>
                        <span className="text-[11px] text-slate-400 block">{claim.claimDate}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{claim.payeeName}</span>
                        <span className="text-[11px] font-mono text-slate-500 block">
                          {claim.payeeBankName} &bull; {claim.payeeBankAccount}
                        </span>
                        {claim.isAuthorizedRepresentative && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded text-[9px] font-bold">
                            * ผู้รับมอบอำนาจ
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        {formatCurrency(claim.approvedWorkAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-red-700">
                        -{formatCurrency(claim.retentionAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-red-700">
                        -{formatCurrency(claim.materialDeductionsTotal + claim.otherDeductionsTotal)}
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {claim.deductionItems.length} รายการ
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        {formatCurrency(claim.taxBaseAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {claim.vatAmount > 0 && (
                          <span className="text-blue-700 block font-semibold">
                            +{formatCurrency(claim.vatAmount)} (VAT)
                          </span>
                        )}
                        <span className="text-amber-800 block font-semibold">
                          -{formatCurrency(claim.whtAmount)} (หัก 3%)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-900 text-sm">
                        {formatCurrency(claim.netPayableAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {claim.dbmNo ? (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded font-mono font-bold text-[10px] block">
                            {claim.dbmNo}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] block">-</span>
                        )}
                        {claim.pvNo && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded font-mono font-bold text-[10px] block mt-0.5">
                            {claim.pvNo}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setPrintClaim(claim)}
                            title="พิมพ์ใบเบิกและใบปะหน้า"
                            className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 text-slate-700 rounded font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            พิมพ์
                          </button>
                          
                          {!claim.dbmNo && onSendClaimToDBM && (
                            <button
                              onClick={() => onSendClaimToDBM(claim)}
                              title="ส่งขอตั้งเบิก DBM"
                              className="px-2 py-1 bg-blue-50 hover:bg-[#005aa9] text-[#005aa9] hover:text-white rounded font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-blue-200"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                              ส่ง DBM
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: RETENTION LEDGER & STRICT REFUND ================= */}
      {activeTab === 'retention' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-amber-50/40">
            <div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700" />
                <h2 className="font-bold text-slate-800 text-sm">
                  ทะเบียนเงินประกันผลงาน & ระบบล็อกคืนเข้าบัญชีเดิม (Retention Control)
                </h2>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                * กฎการควบคุมภายใน: บังคับโอนเงินประกันผลงานคืนเข้าบัญชีของผู้รับเงินเดิมที่เคยถูกหักไว้เท่านั้น เพื่อป้องกันข้อพิพาท
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">ยอดเงินประกันผลงานสะสมที่ยังไม่คืน:</span>
              <span className="font-mono font-black text-amber-900 text-base">
                {formatCurrency(metrics.totalRetentionHeld)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-4">สัญญา & โครงการ</th>
                  <th className="py-3 px-4">ใบเบิกที่หักเงิน</th>
                  <th className="py-3 px-4">วันที่หักเงิน</th>
                  <th className="py-3 px-4 text-right">ยอดเงินประกันที่หัก</th>
                  <th className="py-3 px-4 bg-amber-50/80 border-x border-amber-200 text-amber-950">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-800" />
                      บัญชีเดิมที่ระบบล็อกให้คืนเท่านั้น
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center">สถานะ</th>
                  <th className="py-3 px-4 text-center">การคืนเงินประกัน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {retentionLedger.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-900 block">{record.contractNo}</span>
                      <span className="font-semibold text-slate-800 block">{record.contractorName}</span>
                      <span className="text-[11px] text-slate-500 block">{record.project}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-800 block">{record.claimNo}</span>
                      <span className="text-[11px] text-slate-500 block">งวดที่ {record.inspectionNo}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {record.deductedDate}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-amber-900 text-sm">
                      {formatCurrency(record.retentionAmount)}
                    </td>
                    <td className="py-3 px-4 bg-amber-50/40 border-x border-amber-200">
                      <span className="font-bold text-slate-900 block flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {record.payeeName}
                      </span>
                      <span className="font-mono font-semibold text-blue-900 block text-xs mt-0.5">
                        {record.payeeBankName} &bull; {record.payeeBankAccount}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        เลขผู้เสียภาษี: {record.payeeTaxId}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {record.status === 'refunded' ? (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-full font-bold text-[10px]">
                          คืนเงินแล้ว ({record.refundPvNo})
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold text-[10px]">
                          ยังไม่ถึงกำหนดคืน
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {record.status === 'held' ? (
                        <button
                          onClick={() => {
                            setRefundTargetRecord(record);
                            setRefundPvInput(`PV-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-99`);
                          }}
                          className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[11px] flex items-center gap-1 mx-auto transition-colors cursor-pointer shadow-xs"
                        >
                          <Lock className="w-3 h-3" />
                          ทำเรื่องคืนเงินประกัน
                        </button>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px] block">
                          คืนเมื่อ {record.refundDate}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* ================= MODAL 1: NEW SUBCONTRACT ================= */}
      {isNewContractOpen && (
        <NewContractModal
          isOpen={isNewContractOpen}
          onClose={() => setIsNewContractOpen(false)}
          boqItems={boqItems}
          uniqueProjects={uniqueProjects}
          subcontracts={subcontracts}
          onSave={(contractData) => {
            onAddSubcontract(contractData);
            setIsNewContractOpen(false);
          }}
        />
      )}

      {/* ================= MODAL 2: NEW INSPECTION ================= */}
      {isNewInspectionOpen && (
        <NewInspectionModal
          isOpen={isNewInspectionOpen}
          onClose={() => setIsNewInspectionOpen(false)}
          subcontracts={subcontracts}
          inspections={inspections}
          onSave={(inspData) => {
            onAddInspection(inspData);
            setIsNewInspectionOpen(false);
          }}
        />
      )}

      {/* ================= MODAL 3: NEW PAYMENT CLAIM ================= */}
      {isNewClaimOpen && (
        <NewClaimModal
          isOpen={isNewClaimOpen}
          onClose={() => {
            setIsNewClaimOpen(false);
            setSelectedInspectionForClaim(null);
          }}
          subcontracts={subcontracts}
          inspections={inspections}
          preselectedInspection={selectedInspectionForClaim}
          backcharges={backcharges}
          onSave={(claimData) => {
            onAddPaymentClaim(claimData);
            setIsNewClaimOpen(false);
            setSelectedInspectionForClaim(null);
          }}
        />
      )}

      {/* ================= MODAL 4: PRINT VIEW ================= */}
      {printClaim && (
        <SubcontractPrintModal
          isOpen={!!printClaim}
          onClose={() => setPrintClaim(null)}
          claim={printClaim}
          contract={subcontracts.find(s => s.id === printClaim.subcontractId || s.contractNo === printClaim.contractNo)}
        />
      )}

      {/* ================= MODAL 5: REFUND RETENTION ================= */}
      {refundTargetRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-amber-900">
              <Lock className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-base text-slate-900">
                ทำเรื่องคืนเงินประกันผลงาน (Retention Refund)
              </h3>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-lg border border-amber-200 text-xs mb-4 space-y-1.5">
              <p className="font-bold text-slate-800">
                สัญญา: <span className="font-mono text-blue-900">{refundTargetRecord.contractNo}</span> ({refundTargetRecord.contractorName})
              </p>
              <p className="text-slate-600">
                หักจากใบเบิก: <span className="font-mono font-semibold">{refundTargetRecord.claimNo}</span> (งวดที่ {refundTargetRecord.inspectionNo})
              </p>
              <p className="text-amber-950 font-bold text-sm">
                ยอดเงินประกันที่จะคืน: {formatCurrency(refundTargetRecord.retentionAmount)} บาท
              </p>
              
              <div className="pt-2 mt-2 border-t border-amber-200">
                <span className="text-[11px] text-amber-900 block font-bold">
                  * กฎความปลอดภัย: บังคับโอนคืนเฉพาะบัญชีเดิมเท่านั้น
                </span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  {refundTargetRecord.payeeName}
                </span>
                <span className="font-mono font-semibold text-blue-900 block">
                  {refundTargetRecord.payeeBankName} &bull; {refundTargetRecord.payeeBankAccount}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  เลขที่ใบสำคัญจ่ายคืน (PV No.):
                </label>
                <input
                  type="text"
                  value={refundPvInput}
                  onChange={(e) => setRefundPvInput(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  placeholder="เช่น PV-6909-0012"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setRefundTargetRecord(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onRefundRetention(
                    refundTargetRecord.id, 
                    refundPvInput || 'PV-REFUND', 
                    new Date().toISOString().split('T')[0]
                  );
                  setRefundTargetRecord(null);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                ยืนยันการคืนเงินประกัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: SUBCONTRACT AGREEMENT PRINT ================= */}
      {viewContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto print:p-0 print:bg-white print:static print:z-auto">
          <div className="bg-slate-100 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300 print:border-none print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
            {/* Header toolbar */}
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center print:hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    สัญญาจ้างเหมา: {viewContractModal.contractNo}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {viewContractModal.contractorName} &bull; {viewContractModal.project}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#005aa9] hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์สัญญา (Print / PDF)</span>
                </button>
                <button
                  onClick={() => setViewContractModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contract Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-0 print:overflow-visible">
              <SubcontractorContractTemplate
                contractNo={viewContractModal.contractNo}
                projectName={viewContractModal.project}
                contractDate={viewContractModal.contractDate}
                contractLocation={viewContractModal.contractLocation}
                contractLocationAddress={viewContractModal.contractLocationAddress}
                employerName={viewContractModal.employerName}
                employerRep={viewContractModal.employerRep}
                employerPosition={viewContractModal.employerPosition}
                employerAddress={viewContractModal.employerAddress}
                contractorName={viewContractModal.contractorName}
                contractorTaxId={viewContractModal.taxId}
                contractorRep={viewContractModal.contractorRep}
                contractorPosition={viewContractModal.contractorPosition}
                contractorAddress={viewContractModal.contractorAddress}
                workScope={`${viewContractModal.contractTitle} (${viewContractModal.workCategory}) ${viewContractModal.startKm ? `ช่วง กม. ${viewContractModal.startKm} ถึง ${viewContractModal.endKm}` : ''} ${viewContractModal.project}`}
                contractAmount={viewContractModal.contractAmount}
                retentionPercent={Math.round(viewContractModal.retentionRate * 100)}
                retentionReturnMonths={viewContractModal.warrantyPeriodMonths || 12}
                startDate={viewContractModal.startDate}
                endDate={viewContractModal.endDate}
                dailyPenalty={viewContractModal.dailyPenalty}
                dailyPenaltyText={viewContractModal.dailyPenaltyText}
                paymentDueDay={viewContractModal.paymentDueDay}
                showControlBar={false}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// =========================================================================
// SUB-MODAL 1: ทำสัญญาจ้างใหม่
// =========================================================================
interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  boqItems: ProjectBOQItem[];
  uniqueProjects: string[];
  subcontracts?: Subcontract[];
  onSave: (contract: Omit<Subcontract, 'id' | 'totalInspectedQty' | 'totalApprovedAmount' | 'totalPaidAmount' | 'totalRetentionHeld' | 'totalRetentionRefunded'>) => void;
}

function NewContractModal({ isOpen, onClose, boqItems, uniqueProjects, subcontracts = [], onSave }: NewContractModalProps) {
  const [contractNo, setContractNo] = useState(`SUB-67-${String(Math.floor(Math.random() * 900) + 100)}`);
  const [contractTitle, setContractTitle] = useState('');
  const [project, setProject] = useState(uniqueProjects[0] || '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)');
  const [boqItemId, setBoqItemId] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [contractorRep, setContractorRep] = useState('');
  const [contractorPosition, setContractorPosition] = useState('ผู้มีอำนาจลงนาม');
  const [contractorAddress, setContractorAddress] = useState('');
  const [entityType, setEntityType] = useState<'individual' | 'corporate_vat' | 'corporate_novat'>('corporate_vat');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultBankName, setDefaultBankName] = useState('ธนาคารกรุงเทพ (BBL)');
  const [defaultBankAccount, setDefaultBankAccount] = useState('');
  const [startKm, setStartKm] = useState('กม. 10+000');
  const [endKm, setEndKm] = useState('กม. 15+000');
  const [workCategory, setWorkCategory] = useState('งานระบายน้ำ');
  const [quantity, setQuantity] = useState<number>(1000);
  const [unit, setUnit] = useState('ม.');
  const [unitRate, setUnitRate] = useState<number>(1450);
  const [retentionRate, setRetentionRate] = useState<number>(0.05);
  const [warrantyPeriodMonths, setWarrantyPeriodMonths] = useState<number>(24);
  const [contractDate, setContractDate] = useState(() => new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }));
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]);
  const [dailyPenalty, setDailyPenalty] = useState<number>(3000);
  const [paymentDueDay, setPaymentDueDay] = useState<number>(5);
  const [employerRep, setEmployerRep] = useState('นายวิชัย นพสุวรรณวงศ์');
  const [employerPosition, setEmployerPosition] = useState('กรรมการผู้จัดการ');

  const contractAmount = quantity * unitRate;

  // Master lists for combobox
  const allContractors = useMemo(() => {
    const list = new Set<string>();
    subcontracts.forEach(s => { if (s.contractorName) list.add(s.contractorName); });
    [
      'หจก. ปิยะวิลล์คอนสตรัคชั่น',
      'นายสมศักดิ์ ช่างเหล็ก',
      'หจก. บุรีรัมย์ศิลาชัย',
      'นายวิชัย การช่าง',
      'หจก. ชัยมงคลงานดิน',
      'ช่างสมานงานผิวทาง'
    ].forEach(c => list.add(c));
    return Array.from(list);
  }, [subcontracts]);

  const allWorkCategories = [
    'งานระบายน้ำและท่อเหลี่ยม',
    'งานผิวทางแอสฟัลต์คอนกรีต',
    'งานโครงสร้างทางและงานดิน',
    'งานสะพานและสะพานลอย',
    'งานทางเท้าและคันหิน',
    'งานป้ายจราจรและตีเส้น',
    'งานไฟฟ้าส่องสว่าง'
  ];

  const allBanks = [
    'ธนาคารกรุงเทพ (BBL)',
    'ธนาคารกสิกรไทย (KBANK)',
    'ธนาคารไทยพาณิชย์ (SCB)',
    'ธนาคารกรุงไทย (KTB)',
    'ธนาคารทหารไทยธนชาต (TTB)',
    'ธนาคารกรุงศรีอยุธยา (BAY)',
    'ธนาคารออมสิน (GSB)'
  ];

  // Filtered BOQ items matching project
  const matchingBoqItems = useMemo(() => {
    return boqItems.filter(b => b.project === project);
  }, [boqItems, project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractorName || quantity <= 0 || unitRate <= 0) {
      alert('กรุณากรอกข้อมูลสัญญาให้ครบถ้วน');
      return;
    }

    onSave({
      contractNo,
      contractTitle: contractTitle || `งาน${workCategory} (${startKm} - ${endKm})`,
      project,
      boqItemId: boqItemId || undefined,
      contractorName,
      entityType,
      taxId: taxId || '0000000000000',
      phone,
      defaultBankName,
      defaultBankAccount,
      defaultAccountName: contractorName,
      startKm,
      endKm,
      workCategory,
      quantity,
      unit,
      unitRate,
      contractAmount,
      retentionRate,
      warrantyPeriodMonths,
      startDate,
      endDate,
      status: 'active',
      contractDate,
      contractorRep,
      contractorPosition,
      contractorAddress,
      dailyPenalty,
      paymentDueDay,
      employerRep,
      employerPosition
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-slate-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-[#005aa9]" />
            <h3 className="font-bold text-slate-800 text-sm">
              ทำสัญญาจ้างผู้รับเหมาช่วงใหม่ (New Subcontract)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">เลขที่สัญญาจ้าง *</label>
              <input
                type="text"
                required
                value={contractNo}
                onChange={e => setContractNo(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <SearchableCombobox
                label="โครงการ / สายทาง"
                required
                value={project}
                onChange={(val) => setProject(val)}
                options={uniqueProjects}
                placeholder="เลือกหรือพิมพ์โครงการ"
                allowCustom={true}
                accentColor="blue"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              เชื่อมโยงกับ BOQ ของโครงการ (ไม่บังคับ แต่แนะนำเพื่อคุมโควตา)
            </label>
            <select
              value={boqItemId}
              onChange={e => setBoqItemId(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- ไม่เชื่อมโยง BOQ --</option>
              {matchingBoqItems.map(b => (
                <option key={b.id} value={b.id}>
                  ข้อ {b.itemNo} - {b.description} (โควตา {b.engineerQty.toLocaleString()} {b.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <SearchableCombobox
                label="ชื่อผู้รับเหมาช่วง / คู่สัญญา"
                required
                value={contractorName}
                onChange={(val) => setContractorName(val)}
                options={allContractors}
                datalistId="dl-payees"
                placeholder="เลือกหรือพิมพ์ค้นหาผู้รับเหมา"
                allowCustom={true}
                accentColor="blue"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ประเภทคู่สัญญาทางภาษี *</label>
              <select
                value={entityType}
                onChange={e => setEntityType(e.target.value as any)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="corporate_vat">นิติบุคคล มี VAT (บวก VAT 7% + หัก 3% ภ.ง.ด.53)</option>
                <option value="individual">บุคคลธรรมดา ไม่มี VAT (หัก 3% ภ.ง.ด.3)</option>
                <option value="corporate_novat">นิติบุคคล ไม่มี VAT (หัก 3% ภ.ง.ด.53)</option>
              </select>
            </div>
          </div>

          {/* ข้อมูลนิติบุคคลและผู้มีอำนาจลงนาม */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 block text-xs">ข้อมูลผู้รับจ้าง & ผู้มีอำนาจลงนามสัญญา</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 block mb-1">ชื่อผู้แทน / ผู้มีอำนาจลงนาม (ผู้รับจ้าง) *</label>
                <input
                  type="text"
                  list="dl-requesters"
                  placeholder="เช่น นายปิยะพงษ์ สิทธิชัย"
                  value={contractorRep}
                  onChange={e => setContractorRep(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">ตำแหน่งของผู้ลงนาม *</label>
                <input
                  type="text"
                  list="dl-positions"
                  placeholder="เช่น หุ้นส่วนผู้จัดการ / กรรมการผู้จัดการ"
                  value={contractorPosition}
                  onChange={e => setContractorPosition(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-slate-600 block mb-1">ที่อยู่ตามทะเบียน / ภ.พ.20 ของผู้รับจ้าง</label>
              <input
                type="text"
                list="dl-addresses"
                placeholder="เช่น เลขที่ 88/12 หมู่ที่ 5 ต.นอกเมือง อ.เมือง จ.สุรินทร์ 32000"
                value={contractorAddress}
                onChange={e => setContractorAddress(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">เลขประจำตัวผู้เสียภาษี / บัตร ปชช.</label>
              <input
                type="text"
                list="dl-tax-ids"
                placeholder="13 หลัก"
                value={taxId}
                onChange={e => setTaxId(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <SearchableCombobox
                label="ธนาคารเริ่มต้น"
                value={defaultBankName}
                onChange={(val) => setDefaultBankName(val)}
                options={allBanks}
                datalistId="dl-bank-names"
                placeholder="เลือกธนาคาร"
                allowCustom={true}
                accentColor="blue"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">เลขที่บัญชีธนาคาร</label>
              <input
                type="text"
                list="dl-bank-accounts"
                value={defaultBankAccount}
                onChange={e => setDefaultBankAccount(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Scope & Km */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 block text-xs">ขอบเขตงาน & ช่วง กม. ที่ปฏิบัติงาน</span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 block mb-1">ช่วง กม. เริ่มต้น</label>
                <input
                  type="text"
                  list="dl-locations"
                  placeholder="เช่น กม. 10+000"
                  value={startKm}
                  onChange={e => setStartKm(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">ช่วง กม. สิ้นสุด</label>
                <input
                  type="text"
                  list="dl-locations"
                  placeholder="เช่น กม. 15+000"
                  value={endKm}
                  onChange={e => setEndKm(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <SearchableCombobox
                  label="หมวดงาน"
                  value={workCategory}
                  onChange={(val) => setWorkCategory(val)}
                  options={allWorkCategories}
                  datalistId="dl-boq-types"
                  placeholder="เลือกหรือระบุหมวดงาน"
                  allowCustom={true}
                  accentColor="blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 block mb-1">ปริมาณงานตามสัญญา *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">หน่วยนับ</label>
                <input
                  type="text"
                  list="dl-units"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">ราคาต่อหน่วยสัญญาจ้าง (บาท) *</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="0.01"
                  value={unitRate}
                  onChange={e => setUnitRate(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-800">มูลค่าสัญญารวมคำนวณได้:</span>
              <span className="font-mono font-black text-blue-900 text-sm">
                {formatCurrency(contractAmount)} บาท
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">อัตราเงินประกันผลงาน (Retention)</label>
              <select
                value={retentionRate}
                onChange={e => setRetentionRate(Number(e.target.value))}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value={0.05}>หัก 5% ทุกงวด</option>
                <option value={0.10}>หัก 10% ทุกงวด</option>
                <option value={0}>ไม่หักเงินประกัน</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ระยะเวลารับประกันผลงาน (เดือน)</label>
              <input
                type="number"
                value={warrantyPeriodMonths}
                onChange={e => setWarrantyPeriodMonths(Number(e.target.value))}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* ระยะเวลาและเบี้ยปรับ */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 block text-xs">กำหนดการสัญญา & เบี้ยปรับ</span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 block mb-1">วันที่ทำสัญญา</label>
                <input
                  type="text"
                  placeholder="เช่น 15 ธันวาคม 2568"
                  value={contractDate}
                  onChange={e => setContractDate(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">วันเริ่มต้นสัญญา *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">วันสิ้นสุดสัญญา *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 block mb-1">เบี้ยปรับล่าช้าต่อวัน (บาท/วัน)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={dailyPenalty}
                  onChange={e => setDailyPenalty(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">กำหนดจ่ายเงินค่างวดทุกวันที่...ของเดือน</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={paymentDueDay}
                  onChange={e => setPaymentDueDay(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#005aa9] hover:bg-blue-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              บันทึกสัญญาจ้าง
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-MODAL 2: บันทึกตรวจงานใหม่ (Auto-Increment Inspection No)
// =========================================================================
interface NewInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcontracts: Subcontract[];
  inspections: SubcontractInspection[];
  onSave: (insp: Omit<SubcontractInspection, 'id' | 'createdAt' | 'status'>) => void;
}

function NewInspectionModal({ isOpen, onClose, subcontracts, inspections, onSave }: NewInspectionModalProps) {
  const [selectedContractId, setSelectedContractId] = useState(subcontracts[0]?.id || '');
  const selectedContract = useMemo(() => subcontracts.find(s => s.id === selectedContractId), [subcontracts, selectedContractId]);

  // Auto calculate next inspection number for this contract
  const autoInspectionNo = useMemo(() => {
    if (!selectedContract) return 1;
    const existingInsps = inspections.filter(i => i.subcontractId === selectedContract.id);
    if (existingInsps.length === 0) return 1;
    const maxNo = Math.max(...existingInsps.map(i => i.inspectionNo));
    return maxNo + 1;
  }, [selectedContract, inspections]);

  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspectorName, setInspectorName] = useState('วิศวกร ธนกร พลอยดี (PE)');
  const [startKm, setStartKm] = useState(selectedContract?.startKm || 'กม. 15+000');
  const [endKm, setEndKm] = useState(selectedContract?.endKm || 'กม. 16+000');
  const [workDescription, setWorkDescription] = useState('');
  const [inspectedQty, setInspectedQty] = useState<number>(100);
  const [notes, setNotes] = useState('');

  const unitRate = selectedContract?.unitRate || 0;
  const approvedAmount = inspectedQty * unitRate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract || inspectedQty <= 0) {
      alert('กรุณาระบุปริมาณงานที่ตรวจผ่าน');
      return;
    }

    onSave({
      subcontractId: selectedContract.id,
      contractNo: selectedContract.contractNo,
      project: selectedContract.project,
      contractorName: selectedContract.contractorName,
      inspectionNo: autoInspectionNo,
      inspectionDate,
      inspectorName,
      startKm,
      endKm,
      workDescription: workDescription || `ตรวจรับงาน ${selectedContract.workCategory} ช่วง ${startKm} ถึง ${endKm}`,
      inspectedQty,
      unit: selectedContract.unit,
      unitRate,
      approvedAmount,
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col border border-slate-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                บันทึกการตรวจงานหน้างาน (Site Inspection)
              </h3>
              <p className="text-[11px] text-slate-500">ระบบรันเลขครั้งที่ตรวจให้อัตโนมัติตามสัญญา</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">สัญญาหลักที่มาตรวจงาน *</label>
            <select
              value={selectedContractId}
              onChange={e => setSelectedContractId(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {subcontracts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.contractNo} - {c.contractorName} ({c.contractTitle})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex justify-between items-center">
            <div>
              <span className="text-blue-900 font-bold block">
                ตรวจรับผลงาน: <span className="text-[#005aa9] underline">ครั้งที่ {autoInspectionNo}</span>
              </span>
              <span className="text-[11px] text-blue-700 block">
                ราคาต่อหน่วยตามสัญญา: {formatCurrency(unitRate)} บาท/{selectedContract?.unit}
              </span>
            </div>
            <span className="px-2.5 py-1 bg-white text-blue-900 font-bold font-mono rounded border border-blue-300">
              Auto # {autoInspectionNo}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">วันที่เข้ามาตรวจสอบหน้างาน *</label>
              <input
                type="date"
                required
                value={inspectionDate}
                onChange={e => setInspectionDate(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">วิศวกรผู้ตรวจ *</label>
              <input
                type="text"
                required
                list="dl-inspectors"
                value={inspectorName}
                onChange={e => setInspectorName(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ช่วง กม. เริ่มต้น *</label>
              <input
                type="text"
                required
                list="dl-locations"
                value={startKm}
                onChange={e => setStartKm(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ช่วง กม. สิ้นสุด *</label>
              <input
                type="text"
                required
                list="dl-locations"
                value={endKm}
                onChange={e => setEndKm(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              รายละเอียดขอบเขตงานประจำงวดที่ตรวจรับและอนุมัติผ่าน *
            </label>
            <textarea
              required
              rows={2}
              placeholder="เช่น งานวางท่อ คสล. dia 1.00 ม. ฝั่งซ้ายทาง พร้อมเทคอนกรีตลีนและสร้างบ่อพัก 4 แห่ง"
              value={workDescription}
              onChange={e => setWorkDescription(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ปริมาณงานที่ทำได้และตรวจผ่าน *</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  required
                  min="0.1"
                  step="any"
                  value={inspectedQty}
                  onChange={e => setInspectedQty(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono font-bold text-xs bg-white focus:ring-2 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-600">{selectedContract?.unit}</span>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-700 block mb-1">มูลค่างานที่ผ่านอนุมัติเบิกจ่าย (บาท) *</span>
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-right">
                <span className="font-mono font-black text-emerald-900 text-sm">
                  {formatCurrency(approvedAmount)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">บันทึกเพิ่มเติม / หมายเหตุ</label>
            <input
              type="text"
              placeholder="เช่น ค่าระดับผ่านเกณฑ์, ทดสอบ Slump test ผ่าน"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              อนุมัติผลการตรวจรับ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-MODAL 3: สร้างใบเบิกค่าผลงาน & หักร้านค้า/อื่นๆ
// =========================================================================
interface NewClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcontracts: Subcontract[];
  inspections: SubcontractInspection[];
  preselectedInspection: SubcontractInspection | null;
  backcharges?: MaterialBackchargeItem[];
  onSave: (claim: Omit<SubcontractPaymentClaim, 'id' | 'createdAt'>) => void;
}

function NewClaimModal({ isOpen, onClose, subcontracts, inspections, preselectedInspection, backcharges = [], onSave }: NewClaimModalProps) {
  const eligibleInspections = useMemo(() => {
    return inspections.filter(i => i.status === 'approved');
  }, [inspections]);

  const [selectedInspId, setSelectedInspId] = useState(
    preselectedInspection?.id || eligibleInspections[0]?.id || inspections[0]?.id || ''
  );

  const selectedInsp = useMemo(() => {
    return inspections.find(i => i.id === selectedInspId);
  }, [inspections, selectedInspId]);

  const contract = useMemo(() => {
    if (!selectedInsp) return null;
    return subcontracts.find(s => s.id === selectedInsp.subcontractId);
  }, [selectedInsp, subcontracts]);

  const [claimDate, setClaimDate] = useState(new Date().toISOString().split('T')[0]);

  // Payee Override
  const [payeeName, setPayeeName] = useState(contract?.defaultAccountName || contract?.contractorName || '');
  const [payeeTaxId, setPayeeTaxId] = useState(contract?.taxId || '');
  const [payeeBankName, setPayeeBankName] = useState(contract?.defaultBankName || 'ธนาคารกสิกรไทย (KBANK)');
  const [payeeBankAccount, setPayeeBankAccount] = useState(contract?.defaultBankAccount || '');
  const [isAuthorizedRepresentative, setIsAuthorizedRepresentative] = useState(false);
  const [authorizationRef, setAuthorizationRef] = useState('');

  // Deductions list
  const [deductions, setDeductions] = useState<SubcontractDeduction[]>([
    {
      id: 'd-sample-1',
      type: 'material_store',
      storeOrVendorName: 'ร้าน ป.ศิลาชัย คอนกรีต',
      billOrDocNo: 'INV-4410',
      description: 'คอนกรีตผสมเสร็จ 240 ksc เบิกจากร้านค้า',
      amount: 45000,
      date: new Date().toISOString().split('T')[0]
    }
  ]);

  // New deduction input
  const [newDedType, setNewDedType] = useState<SubcontractDeduction['type']>('material_store');
  const [newDedStore, setNewDedStore] = useState('');
  const [newDedBill, setNewDedBill] = useState('');
  const [newDedDesc, setNewDedDesc] = useState('');
  const [newDedAmount, setNewDedAmount] = useState<number>(0);

  const handleAddDeduction = () => {
    if (newDedAmount <= 0 || !newDedDesc) return;
    setDeductions(prev => [
      ...prev,
      {
        id: `ded-${Date.now()}`,
        type: newDedType,
        storeOrVendorName: newDedStore,
        billOrDocNo: newDedBill,
        description: newDedDesc,
        amount: newDedAmount,
        date: new Date().toISOString().split('T')[0]
      }
    ]);
    setNewDedDesc('');
    setNewDedAmount(0);
    setNewDedBill('');
  };

  const handleRemoveDeduction = (id: string) => {
    setDeductions(prev => prev.filter(d => d.id !== id));
  };

  // Calculations
  const approvedWorkAmount = selectedInsp?.approvedAmount || 0;
  const retentionRate = contract?.retentionRate || 0.05;
  const retentionAmount = approvedWorkAmount * retentionRate;

  const materialDeductionsTotal = deductions
    .filter(d => d.type === 'material_store')
    .reduce((sum, d) => sum + d.amount, 0);

  const otherDeductionsTotal = deductions
    .filter(d => d.type !== 'material_store')
    .reduce((sum, d) => sum + d.amount, 0);

  const taxBaseAmount = Math.max(0, approvedWorkAmount - retentionAmount - materialDeductionsTotal - otherDeductionsTotal);

  const entityType = contract?.entityType || 'corporate_vat';
  const vatRate = entityType === 'corporate_vat' ? 0.07 : 0;
  const vatAmount = taxBaseAmount * vatRate;
  const whtRate = 0.03; // 3%
  const whtAmount = taxBaseAmount * whtRate;
  const netPayableAmount = taxBaseAmount + vatAmount - whtAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInsp || !contract) return;

    const claimNo = `CLM-${contract.contractNo}-${String(selectedInsp.inspectionNo).padStart(2, '0')}`;

    onSave({
      claimNo,
      subcontractId: contract.id,
      contractNo: contract.contractNo,
      project: contract.project,
      contractorName: contract.contractorName,
      inspectionId: selectedInsp.id,
      inspectionNo: selectedInsp.inspectionNo,
      claimDate,
      approvedWorkAmount,
      retentionRate,
      retentionAmount,
      materialDeductionsTotal,
      otherDeductionsTotal,
      deductionItems: deductions,
      taxBaseAmount,
      entityType,
      vatRate,
      vatAmount,
      whtRate,
      whtAmount,
      netPayableAmount,
      payeeName: payeeName || contract.contractorName,
      payeeTaxId: payeeTaxId || contract.taxId,
      payeeBankName,
      payeeBankAccount,
      isAuthorizedRepresentative,
      authorizationRef: isAuthorizedRepresentative ? authorizationRef : undefined,
      status: 'submitted'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col border border-slate-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#005aa9]" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                สร้างใบเบิกค่าผลงานผู้รับเหมาช่วง (Progress Payment Request)
              </h3>
              <p className="text-[11px] text-slate-500">
                ดึงผลงานตรวจรับ &bull; หักบิลวัสดุร้านค้า &bull; หักเงินประกัน &bull; คำนวณภาษีอัตโนมัติ
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">เลือกผลการตรวจงานที่อนุมัติแล้ว *</label>
              <select
                value={selectedInspId}
                onChange={e => setSelectedInspId(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {inspections.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.contractNo} (งวดที่ {i.inspectionNo}) - {i.contractorName} [{formatCurrency(i.approvedAmount)} บ.]
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">วันที่ทำเรื่องขอเบิก *</label>
              <input
                type="date"
                required
                value={claimDate}
                onChange={e => setClaimDate(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Inspection Summary */}
          {selectedInsp && (
            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 grid grid-cols-3 gap-2">
              <div>
                <span className="text-slate-500 block text-[11px]">สัญญา & ผู้รับเหมา:</span>
                <span className="font-bold text-slate-900 block">{selectedInsp.contractNo}</span>
                <span className="text-[11px] text-slate-700">{selectedInsp.contractorName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">ช่วง กม. ที่ตรวจผ่าน:</span>
                <span className="font-bold text-slate-800 font-mono block">{selectedInsp.startKm} - {selectedInsp.endKm}</span>
                <span className="text-[11px] text-slate-600">{selectedInsp.inspectedQty} {selectedInsp.unit}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">มูลค่างานที่ตรวจผ่าน (A):</span>
                <span className="font-mono font-black text-[#005aa9] text-base block">
                  {formatCurrency(approvedWorkAmount)}
                </span>
                <span className="text-[10px] text-red-700 font-semibold block">
                  หักประกัน 5%: -{formatCurrency(retentionAmount)}
                </span>
              </div>
            </div>
          )}

          {/* Section: Deductions & Store Materials */}
          <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-red-700" />
                รายการหักค่าวัสดุร้านค้าที่ช่างนำไปใช้ & ค่าปรับอื่นๆ (Backcharges)
              </span>
              <span className="font-mono font-bold text-red-700">
                รวมหัก: -{formatCurrency(materialDeductionsTotal + otherDeductionsTotal)} บ.
              </span>
            </div>

            {/* Smart Backcharge Link from Procurement */}
            {(() => {
              const pendingForContract = backcharges.filter(
                b => (b.subcontractId === contract?.id || b.contractNo === contract?.contractNo) && 
                     b.status === 'pending_deduction' &&
                     !deductions.some(d => d.billOrDocNo === b.expressPoNo || d.description.includes(b.backchargeNo))
              );
              if (pendingForContract.length === 0) return null;
              const pendingSum = pendingForContract.reduce((s, b) => s + b.amount, 0);

              return (
                <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="text-[11px] text-amber-900">
                    <span className="font-bold block">
                      ⚡ พบรายการวัสดุที่ฝ่ายจัดซื้อบันทึกหักช่างรายนี้ไว้ {pendingForContract.length} รายการ (รวม {formatCurrency(pendingSum)} บ.)
                    </span>
                    <span>คลิกปุ่มเพื่อดึงเข้าตารางหักเงินงวดนี้อัตโนมัติ (ป้องกันฝ่ายบัญชีลืมหักเงินช่าง)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newDeds: SubcontractDeduction[] = pendingForContract.map(b => ({
                        id: `ded-bc-${b.id}`,
                        type: 'material_store' as const,
                        storeOrVendorName: b.vendorName,
                        billOrDocNo: b.expressPoNo,
                        description: `หักวัสดุ: ${b.materialDescription} (${b.backchargeNo})`,
                        amount: b.amount,
                        date: b.receivedDate
                      }));
                      setDeductions(prev => [...prev, ...newDeds]);
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold shrink-0 cursor-pointer shadow-xs"
                  >
                    + ดึง {pendingForContract.length} รายการเข้ารายการหัก
                  </button>
                </div>
              );
            })()}

            {/* List existing deductions */}
            {deductions.length > 0 && (
              <div className="space-y-1.5">
                {deductions.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        d.type === 'material_store' ? 'bg-blue-100 text-blue-900' : 'bg-red-100 text-red-900'
                      }`}>
                        {d.type === 'material_store' ? 'วัสดุร้านค้า' : 'ค่าปรับ/อื่นๆ'}
                      </span>
                      <span className="font-semibold text-slate-800">{d.storeOrVendorName ? `${d.storeOrVendorName} : ` : ''}{d.description}</span>
                      {d.billOrDocNo && <span className="font-mono text-slate-500 text-[10px]">({d.billOrDocNo})</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-red-700">-{formatCurrency(d.amount)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeduction(d.id)}
                        className="text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add deduction inline form */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-5 gap-2 items-end">
              <div>
                <label className="text-[11px] text-slate-600 block mb-0.5">ประเภทการหัก</label>
                <select
                  value={newDedType}
                  onChange={e => setNewDedType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white"
                >
                  <option value="material_store">วัสดุร้านค้า</option>
                  <option value="fuel">ค่าน้ำมัน</option>
                  <option value="damage_penalty">ค่าปรับ/เสียหาย</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block mb-0.5">ชื่อร้านค้า / บิลเลขที่</label>
                <input
                  type="text"
                  placeholder="เช่น ร้าน ป.ศิลาชัย / B-12"
                  value={newDedStore}
                  onChange={e => setNewDedStore(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] text-slate-600 block mb-0.5">รายละเอียดรายการหัก</label>
                <input
                  type="text"
                  placeholder="เช่น คอนกรีต 240 ksc, เสาไฟฟ้าหัก"
                  value={newDedDesc}
                  onChange={e => setNewDedDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white"
                />
              </div>
              <div className="flex gap-1.5">
                <div className="flex-1">
                  <label className="text-[11px] text-slate-600 block mb-0.5">จำนวนเงิน (บ.)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={newDedAmount || ''}
                    onChange={e => setNewDedAmount(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddDeduction}
                  className="px-2.5 py-1 bg-red-700 text-white rounded text-xs font-bold hover:bg-red-800 cursor-pointer shrink-0 mt-auto mb-0.5"
                >
                  + เพิ่ม
                </button>
              </div>
            </div>
          </div>

          {/* Section: Payee Details (รองรับการเปลี่ยนตัวหรือผู้รับมอบอำนาจ) */}
          <div className="border border-slate-200 rounded-lg p-3.5 bg-white space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-900" />
                ผู้รับเงินงวดนี้ (สามารถระบุผู้รับมอบอำนาจได้)
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={isAuthorizedRepresentative}
                  onChange={e => setIsAuthorizedRepresentative(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[11px] font-semibold">มอบอำนาจให้ผู้อื่นรับเงินแทน</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 block mb-1">ชื่อบัญชีผู้รับเงินงวดนี้ *</label>
                <input
                  type="text"
                  required
                  value={payeeName}
                  onChange={e => setPayeeName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">ธนาคารผู้รับเงิน *</label>
                <input
                  type="text"
                  required
                  value={payeeBankName}
                  onChange={e => setPayeeBankName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">เลขที่บัญชีธนาคาร *</label>
                <input
                  type="text"
                  required
                  value={payeeBankAccount}
                  onChange={e => setPayeeBankAccount(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {isAuthorizedRepresentative && (
              <div className="p-2.5 bg-amber-50 rounded border border-amber-200">
                <label className="text-amber-900 font-bold block mb-1">
                  อ้างอิงเอกสารมอบอำนาจ (เช่น เลขที่/ลงวันที่หนังสือมอบอำนาจ) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น หนังสือมอบอำนาจ ลงวันที่ 10 กันยายน 2569"
                  value={authorizationRef}
                  onChange={e => setAuthorizationRef(e.target.value)}
                  className="w-full border border-amber-300 rounded px-2.5 py-1 text-xs bg-white"
                />
              </div>
            )}
          </div>

          {/* Section: Calculation Preview */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-lg space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">มูลค่างานที่ตรวจผ่าน (A):</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(approvedWorkAmount)} บ.</span>
            </div>
            <div className="flex justify-between text-xs text-red-700">
              <span>หัก เงินประกันผลงาน {(retentionRate * 100).toFixed(0)}% (B):</span>
              <span className="font-mono font-semibold">-{formatCurrency(retentionAmount)} บ.</span>
            </div>
            <div className="flex justify-between text-xs text-red-700">
              <span>หัก บิลวัสดุร้านค้า & ค่าปรับ (C+D):</span>
              <span className="font-mono font-semibold">-{formatCurrency(materialDeductionsTotal + otherDeductionsTotal)} บ.</span>
            </div>
            <div className="flex justify-between text-xs font-bold pt-1 border-t border-emerald-200">
              <span className="text-slate-800">มูลค่าฐานภาษี (Tax Base):</span>
              <span className="font-mono text-slate-900">{formatCurrency(taxBaseAmount)} บ.</span>
            </div>
            
            {vatAmount > 0 && (
              <div className="flex justify-between text-xs text-blue-900">
                <span>บวก ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                <span className="font-mono font-semibold">+{formatCurrency(vatAmount)} บ.</span>
              </div>
            )}
            
            <div className="flex justify-between text-xs text-amber-900">
              <span>หัก ณ ที่จ่าย 3% ({entityType === 'individual' ? 'ภ.ง.ด.3' : 'ภ.ง.ด.53'}):</span>
              <span className="font-mono font-semibold">-{formatCurrency(whtAmount)} บ.</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t-2 border-emerald-600">
              <span className="font-black text-slate-900 text-sm">ยอดเงินจ่ายสุทธิประจำงวด (Net Payable):</span>
              <span className="font-mono font-black text-emerald-950 text-lg">
                {formatCurrency(netPayableAmount)} บาท
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#005aa9] hover:bg-blue-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              ยืนยันสร้างใบเบิกค่าผลงาน
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
