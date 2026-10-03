import { useState, useMemo, FormEvent } from 'react';
import { 
  RFQComparisonItem, 
  MaterialBackchargeItem, 
  Subcontract,
  VendorQuotationItem 
} from '../types';
import { formatCurrency } from '../utils/accounting';
import { getActiveUserName } from '../services/userService';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ArrowRight, 
  Check, 
  X, 
  TrendingDown, 
  Building2, 
  DollarSign, 
  Send,
  AlertTriangle,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Download,
  Receipt
} from 'lucide-react';
import { SearchableCombobox } from './SearchableCombobox';

interface ProcurementViewProps {
  rfqItems: RFQComparisonItem[];
  backcharges: MaterialBackchargeItem[];
  subcontracts: Subcontract[];
  onAddRFQ: (item: Omit<RFQComparisonItem, 'id' | 'createdAt'>) => void;
  onUpdateRFQ: (id: string, updates: Partial<RFQComparisonItem>) => void;
  onAddBackcharge: (item: Omit<MaterialBackchargeItem, 'id' | 'createdAt'>) => void;
  onNavigateToSubcontracts?: () => void;
  onNavigateToBilling?: () => void;
}

export function ProcurementView({
  rfqItems,
  backcharges,
  subcontracts,
  onAddRFQ,
  onUpdateRFQ,
  onAddBackcharge,
  onNavigateToSubcontracts,
  onNavigateToBilling
}: ProcurementViewProps) {
  const [activeTab, setActiveTab] = useState<'backcharge' | 'rfq' | 'express_bridge'>('backcharge');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');

  // Modals
  const [isNewBackchargeOpen, setIsNewBackchargeOpen] = useState(false);
  const [isNewRFQOpen, setIsNewRFQOpen] = useState(false);
  const [activeRFQModal, setActiveRFQModal] = useState<RFQComparisonItem | null>(null);

  // Projects list
  const uniqueProjects = useMemo(() => {
    const set = new Set<string>();
    rfqItems.forEach(r => set.add(r.project));
    backcharges.forEach(b => set.add(b.project));
    subcontracts.forEach(s => set.add(s.project));
    return Array.from(set);
  }, [rfqItems, backcharges, subcontracts]);

  // Filtered lists
  const filteredBackcharges = useMemo(() => {
    return backcharges.filter(b => {
      const matchProj = selectedProjectFilter === 'all' || b.project === selectedProjectFilter;
      const q = searchQuery.toLowerCase();
      const matchQ = !q || 
        b.contractorName.toLowerCase().includes(q) ||
        b.contractNo.toLowerCase().includes(q) ||
        b.expressPoNo.toLowerCase().includes(q) ||
        b.materialDescription.toLowerCase().includes(q) ||
        b.vendorName.toLowerCase().includes(q);
      return matchProj && matchQ;
    });
  }, [backcharges, selectedProjectFilter, searchQuery]);

  const filteredRFQs = useMemo(() => {
    return rfqItems.filter(r => {
      const matchProj = selectedProjectFilter === 'all' || r.project === selectedProjectFilter;
      const q = searchQuery.toLowerCase();
      const matchQ = !q || 
        r.rfqNo.toLowerCase().includes(q) ||
        r.materialName.toLowerCase().includes(q) ||
        (r.expressPoNo && r.expressPoNo.toLowerCase().includes(q));
      return matchProj && matchQ;
    });
  }, [rfqItems, selectedProjectFilter, searchQuery]);

  // Summary Metrics
  const pendingBackchargeAmount = backcharges
    .filter(b => b.status === 'pending_deduction')
    .reduce((sum, b) => sum + b.amount, 0);

  const deductedBackchargeAmount = backcharges
    .filter(b => b.status === 'deducted')
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-[#005aa9] rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-base font-bold text-slate-900">
                ระบบฝ่ายจัดซื้อ & เชื่อมโยง Express (Procurement & Payables Bridge)
              </h1>
              <p className="text-xs text-slate-500">
                ควบคุมการสั่งซื้อวัสดุ, สอบราคา 3 เจ้า, และตัดหักค่าวัสดุเข้าสัญญาช่างเหมาอัตโนมัติ (Backcharge)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'backcharge' && (
            <button
              onClick={() => setIsNewBackchargeOpen(true)}
              className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกหักวัสดุสัญญาช่าง (Backcharge)</span>
            </button>
          )}

          {activeTab === 'rfq' && (
            <button
              onClick={() => setIsNewRFQOpen(true)}
              className="px-3.5 py-2 bg-[#005aa9] hover:bg-blue-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างใบเทียบราคา (RFQ)</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">ยอดวัสดุรอหักเงินช่าง (Pending DBM)</span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded">
              รอหักในใบเบิก
            </span>
          </div>
          <p className="text-lg font-black text-amber-700 font-mono mt-1">
            {formatCurrency(pendingBackchargeAmount)} <span className="text-xs font-sans font-normal text-slate-600">บาท</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {backcharges.filter(b => b.status === 'pending_deduction').length} รายการที่ช่างเบิกของไปแล้ว
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">ตัดหักในสัญญาสำเร็จแล้ว (Deducted)</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[10px] rounded">
              หักเงินแล้ว
            </span>
          </div>
          <p className="text-lg font-black text-emerald-700 font-mono mt-1">
            {formatCurrency(deductedBackchargeAmount)} <span className="text-xs font-sans font-normal text-slate-600">บาท</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ไม่ตกหล่น ป้องกันเงินรั่วไหล 100%
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">เชื่อมต่อกับ Express</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold text-[10px] rounded">
              Ready & Synced
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 mt-1.5 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#005aa9]" />
            รองรับเลข PO, DO และรหัสผู้จำหน่าย
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            พร้อมส่งออกเข้าโปรแกรมบัญชีตัวใหม่ในอนาคต
          </p>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('backcharge')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'backcharge'
                ? 'bg-white text-red-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-red-700" />
            หักวัสดุสัญญาช่าง (Backcharge) ({backcharges.length})
          </button>

          <button
            onClick={() => setActiveTab('rfq')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rfq'
                ? 'bg-white text-[#005aa9] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-blue-700" />
            สอบราคา & เทียบ 3 เจ้า (RFQ) ({rfqItems.length})
          </button>

          <button
            onClick={() => setActiveTab('express_bridge')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'express_bridge'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            ศูนย์เชื่อมต่อ Express & ERP
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={selectedProjectFilter}
            onChange={e => setSelectedProjectFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">ทุกโครงการ ({uniqueProjects.length})</option>
            {uniqueProjects.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหา PO, ร้านค้า, ช่างเหมา..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-48 sm:w-64 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ================= TAB 1: BACKCHARGE LIST ================= */}
      {activeTab === 'backcharge' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-red-50/40">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-700" />
                <h2 className="font-bold text-slate-800 text-sm">
                  รายการวัสดุที่สั่งซื้อให้ช่างเหมา / ตัดหักเข้าสัญญาจ้าง (Material Backcharges)
                </h2>
              </div>
              <p className="text-xs text-red-800 mt-0.5">
                * รายการที่นี่จะถูกส่งไปเป็น "รายการหัก (DBM)" ในใบเบิกค่าผลงานของช่างเหมาคนนั้นโดยอัตโนมัติ เพื่อไม่ให้ตกหล่น
              </p>
            </div>
            {onNavigateToSubcontracts && (
              <button
                onClick={onNavigateToSubcontracts}
                className="text-xs font-bold text-[#005aa9] hover:underline flex items-center gap-1 cursor-pointer"
              >
                ดูใบเบิกช่างเหมา &rarr;
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">เลขที่บันทึก / วันที่</th>
                  <th className="py-2.5 px-3">เลขอ้างอิง Express PO / DO</th>
                  <th className="py-2.5 px-3">ช่างเหมา & สัญญาที่หักเงิน</th>
                  <th className="py-2.5 px-3">รายการวัสดุ & ร้านค้า</th>
                  <th className="py-2.5 px-3 text-right">ปริมาณ</th>
                  <th className="py-2.5 px-3 text-right">ราคาต่อหน่วย</th>
                  <th className="py-2.5 px-3 text-right">ยอดเงินตัดหัก (บาท)</th>
                  <th className="py-2.5 px-3 text-center">สถานะการหักเงิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBackcharges.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      ไม่พบรายการบันทึกหักวัสดุ
                    </td>
                  </tr>
                ) : (
                  filteredBackcharges.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-900 block">{item.backchargeNo}</span>
                        <span className="text-[11px] text-slate-500 block">{item.receivedDate}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-900 font-mono font-bold rounded border border-blue-200 inline-block text-[11px]">
                          {item.expressPoNo}
                        </span>
                        {item.deliveryOrderNo && (
                          <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                            DO: {item.deliveryOrderNo}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{item.contractorName}</span>
                        <span className="text-[11px] font-mono text-[#005aa9] font-semibold block">
                          {item.contractNo}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          เซ็นรับ: {item.subcontractorReceiverName}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 block">{item.materialDescription}</span>
                        <span className="text-[11px] text-slate-500 block">ร้านค้า: {item.vendorName}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                        {item.quantity.toLocaleString()} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-red-700 text-sm">
                        -{formatCurrency(item.amount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.status === 'pending_deduction' ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            รอหักในใบเบิก
                          </span>
                        ) : item.status === 'deducted' ? (
                          <div>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              หักเงินแล้ว
                            </span>
                            {item.deductedClaimNo && (
                              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                                {item.deductedClaimNo}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                            ยกเลิก
                          </span>
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

      {/* ================= TAB 2: RFQ COMPARISON ================= */}
      {activeTab === 'rfq' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredRFQs.map(rfq => {
              const lowestPrice = Math.min(...rfq.quotations.map(q => q.unitPrice));

              return (
                <div key={rfq.id} className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
                  {/* RFQ Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-blue-100 text-[#005aa9] font-mono font-bold text-xs rounded">
                          {rfq.rfqNo}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {rfq.materialName} ({rfq.quantity.toLocaleString()} {rfq.unit})
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        โครงการ: <span className="font-semibold text-slate-700">{rfq.project}</span> &bull; สเปก: {rfq.spec}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {rfq.expressPoNo ? (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">เปิด PO ใน Express แล้ว</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-mono font-bold text-xs rounded border border-emerald-300">
                            {rfq.expressPoNo}
                          </span>
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded">
                          รออนุมัติเปิด PO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quotations Comparison Matrix */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      ตารางเปรียบเทียบข้อเสนอราคาจากร้านค้า ({rfq.quotations.length} เจ้า):
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {rfq.quotations.map((q, idx) => {
                        const isLowest = q.unitPrice === lowestPrice;
                        const isSelected = rfq.selectedVendor === q.vendorName;

                        return (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-lg border text-xs transition-all relative ${
                              isSelected
                                ? 'bg-blue-50/60 border-[#005aa9] ring-2 ring-blue-500/20'
                                : isLowest
                                ? 'bg-emerald-50/40 border-emerald-300'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#005aa9] text-white rounded text-[9px] font-bold">
                                เลือกเจ้านี้
                              </span>
                            )}
                            {isLowest && !isSelected && (
                              <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-700 text-white rounded text-[9px] font-bold">
                                ราคาต่ำสุด
                              </span>
                            )}

                            <h4 className="font-bold text-slate-900 pr-16">{q.vendorName}</h4>
                            
                            <div className="mt-2 space-y-1 font-mono">
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">ราคาต่อหน่วย:</span>
                                <span className="font-bold text-slate-900 text-sm">
                                  {formatCurrency(q.unitPrice)} บ./{rfq.unit}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">มูลค่ารวม:</span>
                                <span className="font-bold text-[#005aa9]">
                                  {formatCurrency(q.unitPrice * rfq.quantity)} บ.
                                </span>
                              </div>
                              <div className="flex justify-between font-sans text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                                <span>เครดิตเทอม:</span>
                                <span className="font-semibold text-slate-800">{q.creditDays === 0 ? 'เงินสด' : `${q.creditDays} วัน`}</span>
                              </div>
                              <div className="flex justify-between font-sans text-[11px] text-slate-600">
                                <span>ส่งของภายใน:</span>
                                <span className="font-semibold text-slate-800">{q.deliveryDays} วัน</span>
                              </div>
                            </div>

                            {q.notes && (
                              <p className="text-[11px] text-slate-500 mt-2 italic font-sans bg-white/70 p-1.5 rounded border border-slate-200">
                                "{q.notes}"
                              </p>
                            )}

                            {/* Action to choose vendor */}
                            {!rfq.expressPoNo && (
                              <div className="mt-3 pt-2 border-t border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const poNo = prompt('กรุณาระบุเลขที่ PO ใน Express ที่เปิดให้เจ้านี้ (เช่น PO68-0125):', `PO68-${Math.floor(1000 + Math.random() * 9000)}`);
                                    if (poNo) {
                                      onUpdateRFQ(rfq.id, {
                                        selectedVendor: q.vendorName,
                                        status: 'po_created',
                                        expressPoNo: poNo,
                                        approvalDate: new Date().toISOString().split('T')[0],
                                        approvedBy: 'ผู้มีอำนาจจัดซื้อ'
                                      });
                                    }
                                  }}
                                  className={`w-full py-1.5 rounded text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 ${
                                    isSelected
                                      ? 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>เลือก & บันทึกเลข PO Express</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: UNIVERSAL ACCOUNTING BRIDGE ================= */}
      {activeTab === 'express_bridge' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-[#009540]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  สถาปัตยกรรมเชื่อมโยง Express และความพร้อมสำหรับโปรแกรมบัญชีตัวใหม่ (Universal Accounting Bridge)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ระบบออกแบบให้รองรับโครงสร้างรหัสบัญชีสากล (Chart of Accounts) และฟอร์แมตข้อมูลมาตรฐาน
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  1. การทำงานร่วมกับโปรแกรม Express ในปัจจุบัน
                </span>
                <ul className="space-y-2 text-slate-600 list-disc pl-4">
                  <li><strong>อ้างอิงเลข PO Express โดยตรง:</strong> ไม่ต้องคีย์งานซ้ำ หน้างานระบุเลข PO เพื่อผูกกับสัญญาช่างได้ทันที</li>
                  <li><strong>ส่งออกข้อมูลวางบิล (Billing Export):</strong> รองรับการส่งออก Text / CSV ตรงตามฟิลด์โปรแกรม Express (เมนูซื้อ 4 / รับวางบิล)</li>
                  <li><strong>ตัดหักช่างเหมาอัตโนมัติ:</strong> ตัดปัญหาฝ่ายบัญชีลืมหักเงินช่างตอนจ่ายเงินงวด</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
                <span className="font-bold text-blue-950 block text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#005aa9]" />
                  2. ความพร้อมในการย้ายไปโปรแกรมบัญชี / ERP ตัวใหม่
                </span>
                <ul className="space-y-2 text-slate-600 list-disc pl-4">
                  <li><strong>หน้างานทำงานเหมือนเดิม 100%:</strong> เมื่อบริษัทเปลี่ยนโปรแกรมบัญชี ทีมวิศวกรและจัดซื้อหน้างานไม่ต้องเปลี่ยนวิธีทำงาน</li>
                  <li><strong>Standard Data Export:</strong> ส่งออกเป็น Standard CSV / Excel เพื่อนำเข้า Mango, SAP, FlowAccount, หรือ Peak</li>
                  <li><strong>พร้อมเปิด REST API:</strong> โครงสร้างข้อมูลพร้อมรองรับการยิง Webhook หรือ API Sync ทันทีในอนาคต</li>
                </ul>
              </div>
            </div>

            {/* Quick Export Actions */}
            <div className="p-4 bg-slate-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-800 block text-xs">
                  ส่งออกข้อมูลรายการตัดหักวัสดุ (Backcharges Export)
                </span>
                <span className="text-[11px] text-slate-500">
                  ดาวน์โหลดไฟล์สรุปเพื่อส่งให้ฝ่ายบัญชีใช้ปรับปรุงยอดหรือทำใบลดหนี้
                </span>
              </div>

              <button
                onClick={() => {
                  const headers = 'BackchargeNo,ExpressPONo,ContractNo,Contractor,Material,Amount,ReceivedDate,Status\n';
                  const rows = backcharges.map(b => 
                    `"${b.backchargeNo}","${b.expressPoNo}","${b.contractNo}","${b.contractorName}","${b.materialDescription}",${b.amount},"${b.receivedDate}","${b.status}"`
                  ).join('\n');
                  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `backcharges-export-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลด CSV สำหรับฝ่ายบัญชี</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: NEW BACKCHARGE ================= */}
      {isNewBackchargeOpen && (
        <NewBackchargeModal
          isOpen={isNewBackchargeOpen}
          onClose={() => setIsNewBackchargeOpen(false)}
          subcontracts={subcontracts}
          onSave={onAddBackcharge}
        />
      )}

      {/* ================= MODAL: NEW RFQ ================= */}
      {isNewRFQOpen && (
        <NewRFQModal
          isOpen={isNewRFQOpen}
          onClose={() => setIsNewRFQOpen(false)}
          projects={uniqueProjects}
          onSave={onAddRFQ}
        />
      )}
    </div>
  );
}

// =========================================================================
// SUB-MODAL 1: บันทึกหักวัสดุสัญญาช่าง (New Backcharge Modal)
// =========================================================================
interface NewBackchargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcontracts: Subcontract[];
  onSave: (item: Omit<MaterialBackchargeItem, 'id' | 'createdAt'>) => void;
}

function NewBackchargeModal({ isOpen, onClose, subcontracts, onSave }: NewBackchargeModalProps) {
  const [expressPoNo, setExpressPoNo] = useState('');
  const [deliveryOrderNo, setDeliveryOrderNo] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [selectedSubId, setSelectedSubId] = useState(subcontracts[0]?.id || '');
  const [materialDescription, setMaterialDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState('ลบ.ม.');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [siteReceiverName, setSiteReceiverName] = useState(() => getActiveUserName());
  const [subcontractorReceiverName, setSubcontractorReceiverName] = useState('');
  const [notes, setNotes] = useState('');

  const commonSuppliers = [
    'โรงงาน ป.ศิลาชัย คอนกรีต',
    'บจก. สุรินทร์คอนกรีตโปรดักส์',
    'หจก. ปิยะวิลล์คอนสตรัคชั่น',
    'บจก. ชลประทานซีเมนต์',
    'หจก. บุรีรัมย์ศิลาชัย',
    'บจก. บุรีรัมย์วัสดุภัณฑ์'
  ];

  const commonMaterials = [
    'คอนกรีตผสมเสร็จ 240 ksc หุ้มท่อ',
    'คอนกรีตผสมเสร็จ 280 ksc งานสะพาน',
    'ยางแอสฟัลต์คอนกรีต AC 60/70',
    'หินคลุก (Crushed Rock Base)',
    'ทรายหยาบถมคันทาง',
    'เหล็กเส้นกลม RB9 มอก.',
    'เหล็กข้ออ้อย DB12 มอก.',
    'เหล็กข้ออ้อย DB16 มอก.'
  ];

  const commonEngineers = [
    'วิศวกรภาคสนาม',
    'นายอานนท์ รุ่งเรือง (วิศวกรสนาม)',
    'นายสมชาย คำมี (โฟร์แมน)',
    'สมพร สโตร์'
  ];

  const selectedContract = useMemo(() => {
    return subcontracts.find(s => s.id === selectedSubId);
  }, [subcontracts, selectedSubId]);

  const amount = quantity * unitPrice;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedContract || quantity <= 0 || unitPrice <= 0 || !expressPoNo) {
      alert('กรุณากรอกข้อมูลและเลขที่ PO Express ให้ครบถ้วน');
      return;
    }

    const backchargeNo = `DBM-MAT-68-${String(Math.floor(100 + Math.random() * 900))}`;

    onSave({
      backchargeNo,
      expressPoNo,
      deliveryOrderNo: deliveryOrderNo || undefined,
      invoiceNo: invoiceNo || undefined,
      project: selectedContract.project,
      vendorName,
      subcontractId: selectedContract.id,
      contractNo: selectedContract.contractNo,
      contractorName: selectedContract.contractorName,
      materialDescription,
      quantity,
      unit,
      unitPrice,
      amount,
      receivedDate,
      siteReceiverName,
      subcontractorReceiverName: subcontractorReceiverName || selectedContract.contractorName,
      status: 'pending_deduction',
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col border border-slate-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-red-50/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-700" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                บันทึกตัดหักวัสดุเข้าสัญญาช่างเหมา (Material Backcharge)
              </h3>
              <p className="text-[11px] text-red-800">เชื่อมโยงเลข PO Express และวิ่งเข้าใบเบิกช่างเหมาอัตโนมัติ</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">เลขที่ PO ใน Express *</label>
              <input
                type="text"
                required
                list="dl-express-po"
                placeholder="เช่น PO68-0089"
                value={expressPoNo}
                onChange={e => setExpressPoNo(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">เลขที่ใบส่งของร้านค้า (DO)</label>
              <input
                type="text"
                list="dl-delivery-orders"
                placeholder="เช่น DO-9841"
                value={deliveryOrderNo}
                onChange={e => setDeliveryOrderNo(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">สัญญาจ้างช่างเหมาที่จะหักเงิน *</label>
            <select
              value={selectedSubId}
              onChange={e => setSelectedSubId(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-medium"
            >
              {subcontracts.map(s => (
                <option key={s.id} value={s.id}>
                  {s.contractNo} - {s.contractorName} ({s.contractTitle})
                </option>
              ))}
            </select>
            {selectedContract && (
              <span className="text-[11px] text-slate-500 block mt-1">
                โครงการ: <span className="font-semibold text-slate-700">{selectedContract.project}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <SearchableCombobox
                label="ชื่อร้านค้า / แพลนต์คอนกรีต"
                required
                value={vendorName}
                onChange={(val) => setVendorName(val)}
                options={commonSuppliers}
                datalistId="dl-payees"
                placeholder="เลือกหรือพิมพ์ชื่อร้านค้า"
                allowCustom={true}
                accentColor="blue"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">วันที่ส่งของเข้าหน้างาน *</label>
              <input
                type="date"
                required
                value={receivedDate}
                onChange={e => setReceivedDate(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <SearchableCombobox
              label="รายการวัสดุที่ส่งมอบให้ช่าง"
              required
              value={materialDescription}
              onChange={(val) => setMaterialDescription(val)}
              options={commonMaterials}
              datalistId="dl-item-descriptions"
              placeholder="เลือกหรือระบุวัสดุ"
              allowCustom={true}
              accentColor="blue"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ปริมาณ *</label>
              <input
                type="number"
                step="0.01"
                required
                value={quantity || ''}
                onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">หน่วย *</label>
              <input
                type="text"
                required
                list="dl-units"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ราคาต่อหน่วย (บาท) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={unitPrice || ''}
                onChange={e => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex justify-between items-center">
            <span className="font-bold text-red-900">ยอดเงินที่จะตัดหักช่างเหมา:</span>
            <span className="font-mono font-black text-red-700 text-base">
              -{formatCurrency(amount)} บาท
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <SearchableCombobox
                label="วิศวกร/ผู้รับของหน้างาน"
                value={siteReceiverName}
                onChange={(val) => setSiteReceiverName(val)}
                options={commonEngineers}
                datalistId="dl-receivers"
                placeholder="เลือกผู้รับของ"
                allowCustom={true}
                accentColor="blue"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 px-1">
                <span>* ดึงจากผู้ใช้งานระบบ</span>
                {siteReceiverName !== getActiveUserName() && (
                  <button
                    type="button"
                    onClick={() => setSiteReceiverName(getActiveUserName())}
                    className="text-[#005aa9] hover:underline font-semibold cursor-pointer"
                  >
                    ใช้ชื่อฉัน ({getActiveUserName()})
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">หัวหน้าช่าง/ผู้เซ็นรับ</label>
              <input
                type="text"
                list="dl-payees"
                placeholder="ชื่อหัวหน้าช่างที่เซ็นชื่อ"
                value={subcontractorReceiverName}
                onChange={e => setSubcontractorReceiverName(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">หมายเหตุ</label>
            <input
              type="text"
              list="dl-remarks"
              placeholder="เช่น มีใบส่งของตัวจริงแนบอยู่หน้างาน"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
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
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              บันทึกรายการหักเงิน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-MODAL 2: สร้างใบสอบราคา (New RFQ Modal)
// =========================================================================
interface NewRFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: string[];
  onSave: (item: Omit<RFQComparisonItem, 'id' | 'createdAt'>) => void;
}

function NewRFQModal({ isOpen, onClose, projects, onSave }: NewRFQModalProps) {
  const [project, setProject] = useState(projects[0] || '');
  const [materialName, setMaterialName] = useState('');
  const [spec, setSpec] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState('ลบ.ม.');
  const [targetBudgetUnitPrice, setTargetBudgetUnitPrice] = useState<number>(0);

  const commonMaterials = [
    'คอนกรีตผสมเสร็จ 240 ksc',
    'คอนกรีตผสมเสร็จ 280 ksc',
    'ยางแอสฟัลต์คอนกรีต AC 60/70',
    'หินคลุก (Crushed Rock Base)',
    'ทรายหยาบถมคันทาง',
    'เหล็กเส้นกลม RB9 มอก.',
    'เหล็กข้ออ้อย DB12 มอก.',
    'เหล็กข้ออ้อย DB16 มอก.',
    'ท่อ คสล. ชั้น 3 ศก. 1.00 ม.'
  ];

  // 3 Vendors Quotations
  const [vendor1, setVendor1] = useState<VendorQuotationItem>({
    vendorName: '',
    unitPrice: 0,
    taxIncluded: true,
    creditDays: 30,
    deliveryDays: 1,
    isRecommended: true,
    notes: ''
  });

  const [vendor2, setVendor2] = useState<VendorQuotationItem>({
    vendorName: '',
    unitPrice: 0,
    taxIncluded: true,
    creditDays: 30,
    deliveryDays: 2,
    isRecommended: false,
    notes: ''
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!materialName || quantity <= 0 || !vendor1.vendorName || vendor1.unitPrice <= 0) {
      alert('กรุณากรอกข้อมูลวัสดุและราคาผู้เสนอราคาอย่างน้อย 1 รายการ');
      return;
    }

    const rfqNo = `RFQ-68-${String(Math.floor(100 + Math.random() * 900))}`;
    const quotations = [vendor1];
    if (vendor2.vendorName && vendor2.unitPrice > 0) {
      quotations.push(vendor2);
    }

    onSave({
      rfqNo,
      project,
      materialName,
      spec,
      quantity,
      unit,
      targetBudgetUnitPrice,
      quotations,
      selectedVendor: vendor1.vendorName,
      status: 'comparing'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-slate-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-blue-50/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-[#005aa9]" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                สร้างใบสอบราคา & เปรียบเทียบร้านค้า (RFQ Sheet)
              </h3>
              <p className="text-[11px] text-blue-800">เปรียบเทียบข้อเสนอ 2-3 ร้านค้าก่อนส่งอนุมัติเปิด PO</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <SearchableCombobox
              label="โครงการ"
              required
              value={project}
              onChange={(val) => setProject(val)}
              options={projects}
              datalistId="dl-projects"
              placeholder="เลือกหรือพิมพ์โครงการ"
              allowCustom={true}
              accentColor="blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <SearchableCombobox
                label="ชื่อรายการวัสดุ"
                required
                value={materialName}
                onChange={(val) => setMaterialName(val)}
                options={commonMaterials}
                datalistId="dl-item-descriptions"
                placeholder="เลือกหรือพิมพ์ชื่อวัสดุ"
                allowCustom={true}
                accentColor="blue"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">สเปก / ข้อกำหนด</label>
              <input
                type="text"
                list="dl-item-descriptions"
                placeholder="เช่น Slump 10 ซม., ปูนซีเมนต์ Type 1"
                value={spec}
                onChange={e => setSpec(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ปริมาณที่ต้องการ *</label>
              <input
                type="number"
                step="0.01"
                required
                value={quantity || ''}
                onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">หน่วย *</label>
              <input
                type="text"
                required
                list="dl-units"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">งบประมาณเป้าหมาย (บ./หน่วย)</label>
              <input
                type="number"
                step="0.01"
                placeholder="ราคาใน BOQ"
                value={targetBudgetUnitPrice || ''}
                onChange={e => setTargetBudgetUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
          </div>

          {/* Vendor 1 */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block text-xs">
              ร้านค้าเจ้าที่ 1 (ร้านค้าที่แนะนำ / ชนะการคัดเลือก) *
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  type="text"
                  required
                  list="dl-payees"
                  placeholder="ชื่อร้านค้า / บจก."
                  value={vendor1.vendorName}
                  onChange={e => setVendor1({ ...vendor1, vendorName: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white font-semibold"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="ราคาต่อหน่วย"
                  value={vendor1.unitPrice || ''}
                  onChange={e => setVendor1({ ...vendor1, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-2 py-1 font-mono text-xs bg-white font-bold"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <input
                  type="number"
                  placeholder="เครดิตเทอม (วัน)"
                  value={vendor1.creditDays || ''}
                  onChange={e => setVendor1({ ...vendor1, creditDays: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-2 py-1 bg-white font-mono"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="หมายเหตุ / เงื่อนไขจัดส่ง"
                  value={vendor1.notes}
                  onChange={e => setVendor1({ ...vendor1, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2 py-1 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Vendor 2 */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block text-xs">
              ร้านค้าเจ้าที่ 2 (สำหรับเปรียบเทียบ)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  type="text"
                  list="dl-payees"
                  placeholder="ชื่อร้านค้า / บจก."
                  value={vendor2.vendorName}
                  onChange={e => setVendor2({ ...vendor2, vendorName: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="ราคาต่อหน่วย"
                  value={vendor2.unitPrice || ''}
                  onChange={e => setVendor2({ ...vendor2, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-2 py-1 font-mono text-xs bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <input
                  type="number"
                  placeholder="เครดิตเทอม (วัน)"
                  value={vendor2.creditDays || ''}
                  onChange={e => setVendor2({ ...vendor2, creditDays: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-2 py-1 bg-white font-mono"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="หมายเหตุ / เงื่อนไขจัดส่ง"
                  value={vendor2.notes}
                  onChange={e => setVendor2({ ...vendor2, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2 py-1 bg-white"
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
              className="px-4 py-2 bg-[#005aa9] hover:bg-blue-900 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              สร้างใบเปรียบเทียบราคา
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
