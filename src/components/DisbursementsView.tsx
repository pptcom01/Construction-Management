import { useState, useMemo } from 'react';
import { Disbursement } from '../types';
import { compareDisbursementsDesc } from '../utils/accounting';
import { 
  FileText, Plus, Search, Filter, ArrowUpDown, CheckCircle2, 
  Clock, AlertCircle, ExternalLink, Download, Printer, Edit2, 
  Trash2, RefreshCw, Check, Building2, ChevronLeft, ChevronRight,
  TrendingDown, DollarSign, Wallet, Calendar, QrCode, ArrowRight,
  ShieldCheck, UserCheck, Paperclip, PenTool, Upload, AlertTriangle
} from 'lucide-react';
import { ReviewApprovalModal } from './ReviewApprovalModal';
import { RescheduleModal } from './RescheduleModal';

interface DisbursementsViewProps {
  disbursements: Disbursement[];
  onAddDisbursement: () => void;
  onEditDisbursement: (disbursement: Disbursement) => void;
  onDeleteDisbursement: (id: string) => void;
  onViewDisbursement: (disbursement: Disbursement) => void;
  onOpenTransferModal: (disbursement: Disbursement) => void;
  onTogglePaid: (id: string) => void;
  onSyncToLedger: (disbursements: Disbursement[]) => void;
  onImportCSV?: () => void;
  onApproveDisbursement: (id: string, reviewerData: {
    role: 'reviewer' | 'approver';
    name: string;
    signature: string;
    notes: string;
    status: 'approved' | 'rejected' | 'pending';
  }) => void;
  onRescheduleDisbursement?: (id: string, newDueDate: string, reason: string, rescheduledBy: string) => void;
}

export function DisbursementsView({
  disbursements,
  onAddDisbursement,
  onEditDisbursement,
  onDeleteDisbursement,
  onViewDisbursement,
  onOpenTransferModal,
  onTogglePaid,
  onSyncToLedger,
  onImportCSV,
  onApproveDisbursement,
  onRescheduleDisbursement
}: DisbursementsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending_review' | 'pending_transfer' | 'postponed' | 'paid'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewingDisbursement, setReviewingDisbursement] = useState<Disbursement | null>(null);
  const [reschedulingDisbursement, setReschedulingDisbursement] = useState<Disbursement | null>(null);
  const itemsPerPage = 10;

  // Extract unique companies & projects for filtering
  const companiesList = useMemo(() => {
    const set = new Set<string>();
    disbursements.forEach(d => { if (d.company) set.add(d.company); });
    return Array.from(set).sort();
  }, [disbursements]);

  const projectsList = useMemo(() => {
    const set = new Set<string>();
    disbursements.forEach(d => { if (d.project) set.add(d.project); });
    return Array.from(set).sort();
  }, [disbursements]);

  // Calculations
  const stats = useMemo(() => {
    let totalRequested = 0;
    let totalPaid = 0;
    let totalPendingReview = 0;
    let totalPendingTransfer = 0;
    let totalPostponed = 0;
    let totalTaxDeducted = 0;
    let totalRetention = 0;
    let paidCount = 0;
    let pendingReviewCount = 0;
    let pendingTransferCount = 0;
    let postponedCount = 0;

    disbursements.forEach(d => {
      const isPostponed = Boolean(d.originalDueDate) || Boolean(d.rescheduleReason) || (d.status !== 'paid' && d.remarks && (d.remarks.includes('เลื่อน') || d.remarks.includes('รอตรวจรับ')));
      if (isPostponed) {
        totalPostponed += d.totalAmount;
        postponedCount++;
      }

      if (d.status !== 'cancelled' && d.status !== 'rejected') {
        totalRequested += d.totalAmount;
        
        if (d.status === 'paid') {
          totalPaid += (d.transferAmount || d.totalAmount);
          paidCount++;
        } else if (d.status === 'pending_review') {
          totalPendingReview += d.totalAmount;
          pendingReviewCount++;
        } else {
          // 'pending' or 'approved'
          totalPendingTransfer += d.totalAmount;
          pendingTransferCount++;
        }

        // Calculate tax & retention from items
        d.items?.forEach(item => {
          if (item.description.includes('ภาษี') && item.amount < 0) {
            totalTaxDeducted += Math.abs(item.amount);
          }
          if ((item.description.includes('ประกัน') || item.description.includes('ค้ำประกัน')) && item.amount < 0) {
            totalRetention += Math.abs(item.amount);
          }
        });
      }
    });

    return {
      totalRequested,
      totalPaid,
      totalPendingReview,
      totalPendingTransfer,
      totalPostponed,
      totalTaxDeducted,
      totalRetention,
      paidCount,
      pendingReviewCount,
      pendingTransferCount,
      postponedCount,
      totalCount: disbursements.length
    };
  }, [disbursements]);

  // Filtered list (sorted from newest to oldest)
  const filteredDisbursements = useMemo(() => {
    return disbursements.filter(d => {
      const matchSearch = searchTerm === '' || 
        d.dbmNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.refDocNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.payeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.expenseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.chequeNo && d.chequeNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        d.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.rescheduleReason && d.rescheduleReason.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.recordedBy && d.recordedBy.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCompany = selectedCompany === 'ALL' || d.company === selectedCompany;
      const matchProject = selectedProject === 'ALL' || d.project === selectedProject;
      
      let matchStatus = true;
      if (selectedTab === 'pending_review') {
        matchStatus = d.status === 'pending_review';
      } else if (selectedTab === 'pending_transfer') {
        matchStatus = d.status === 'pending' || d.status === 'approved';
      } else if (selectedTab === 'postponed') {
        matchStatus = Boolean(d.originalDueDate) || Boolean(d.rescheduleReason) || (d.status !== 'paid' && Boolean(d.remarks && (d.remarks.includes('เลื่อน') || d.remarks.includes('รอตรวจรับ'))));
      } else if (selectedTab === 'paid') {
        matchStatus = d.status === 'paid';
      }

      return matchSearch && matchCompany && matchProject && matchStatus;
    }).sort(compareDisbursementsDesc);
  }, [disbursements, searchTerm, selectedCompany, selectedProject, selectedTab]);

  const totalPages = Math.ceil(filteredDisbursements.length / itemsPerPage) || 1;
  const paginatedDisbursements = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDisbursements.slice(start, start + itemsPerPage);
  }, [filteredDisbursements, currentPage]);

  const handleExportCSV = () => {
    const headers = [
      'เลขที่เอกสาร DBM', 'เอกสารอ้างอิง', 'บริษัท', 'วันที่ลงข้อมูล', 'วันครบกำหนด',
      'โครงการ', 'ผู้ขอเบิก', 'ประเภทงาน/รายจ่าย', 'ผู้รับเงิน', 'บัญชีผู้รับ', 'ยอดเงินรวม',
      'สถานะ', 'ผู้ตรวจสอบ', 'ผู้อนุมัติ', 'บัญชีผู้จ่าย', 'เลขที่เช็ค/Ref', 'วันที่จ่ายเงิน', 'ยอดเงินโอน', 'ค่าธรรมเนียม', 'ลิงก์สลิป', 'หมายเหตุ'
    ];

    const rows = filteredDisbursements.map(d => [
      `"${d.dbmNo}"`,
      `"${d.refDocNo || ''}"`,
      `"${d.company || ''}"`,
      `"${d.entryDate || ''}"`,
      `"${d.dueDate || ''}"`,
      `"${d.project || ''}"`,
      `"${d.recordedBy || ''}"`,
      `"${d.expenseType || ''}"`,
      `"${d.payeeName || ''}"`,
      `"${d.payeeBankAccount || ''}"`,
      d.totalAmount || 0,
      `"${d.status === 'paid' ? 'โอนเงินแล้ว' : d.status === 'pending_review' ? 'รอตรวจสอบ' : 'รอการเงินโอน'}"`,
      `"${d.reviewerName || ''}"`,
      `"${d.approverName || ''}"`,
      `"${d.payerAccount || ''}"`,
      `"${d.chequeNo || ''}"`,
      `"${d.paymentDate || ''}"`,
      d.transferAmount || 0,
      d.fee || 0,
      `"${d.documentLink || ''}"`,
      `"${(d.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BTC_Disbursements_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatMoney = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
    return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-3.5">
      
      {/* Top Header: Clean, Direct & Professional */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white px-4 py-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            ใบขอตั้งเบิก (DBM)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดทำใบขอตั้งเบิก ตรวจสอบเอกสาร และเสนอผู้บริหารพิจารณาอนุมัติจ่าย
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Import / Export */}
          {onImportCSV && (
            <button
              onClick={onImportCSV}
              className="p-1.5 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="นำเข้าไฟล์ CSV"
            >
              <Upload className="w-4 h-4 text-slate-600" />
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="p-1.5 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="ส่งออก CSV"
          >
            <Download className="w-4 h-4 text-slate-600" />
          </button>

          {/* Primary Create Button */}
          <button
            onClick={onAddDisbursement}
            className="px-3.5 py-1.5 bg-[#009540] hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ สร้างใบขอตั้งเบิก</span>
          </button>
        </div>
      </div>

      {/* Interactive Status & Metric Filter Cards (Single source of truth, no redundant tabs below) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        
        {/* All Filter */}
        <div 
          onClick={() => { setSelectedTab('all'); setCurrentPage(1); }}
          className={`p-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
            selectedTab === 'all'
              ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-bold ${selectedTab === 'all' ? 'text-slate-200' : 'text-slate-500'}`}>
              ทั้งหมด ({stats.totalCount})
            </span>
            <FileText className={`w-3.5 h-3.5 ${selectedTab === 'all' ? 'text-slate-300' : 'text-slate-400'}`} />
          </div>
          <div className="text-base font-bold font-mono">
            {formatMoney(stats.totalRequested)}
          </div>
          <div className={`text-[10px] mt-0.5 ${selectedTab === 'all' ? 'text-slate-300' : 'text-slate-400'}`}>
            รายการขอเบิกทั้งหมด
          </div>
        </div>

        {/* 1. Pending Review */}
        <div 
          onClick={() => { setSelectedTab('pending_review'); setCurrentPage(1); }}
          className={`p-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
            selectedTab === 'pending_review'
              ? 'bg-purple-600 text-white border-purple-600 ring-2 ring-purple-600/20'
              : 'bg-white border-purple-200 hover:border-purple-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-bold ${selectedTab === 'pending_review' ? 'text-purple-100' : 'text-purple-900'}`}>
              1. รอตรวจ/อนุมัติ ({stats.pendingReviewCount})
            </span>
            <ShieldCheck className={`w-3.5 h-3.5 ${selectedTab === 'pending_review' ? 'text-white' : 'text-purple-600'}`} />
          </div>
          <div className={`text-base font-bold font-mono ${selectedTab === 'pending_review' ? 'text-white' : 'text-purple-950'}`}>
            {formatMoney(stats.totalPendingReview)}
          </div>
          <div className={`text-[10px] mt-0.5 font-medium ${selectedTab === 'pending_review' ? 'text-purple-100' : 'text-purple-700'}`}>
            คลิกกรองคิวรอตรวจ &rarr;
          </div>
        </div>

        {/* 2. Pending Transfer */}
        <div 
          onClick={() => { setSelectedTab('pending_transfer'); setCurrentPage(1); }}
          className={`p-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
            selectedTab === 'pending_transfer'
              ? 'bg-[#005aa9] text-white border-[#005aa9] ring-2 ring-[#005aa9]/20'
              : 'bg-white border-blue-200 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-bold ${selectedTab === 'pending_transfer' ? 'text-blue-100' : 'text-blue-900'}`}>
              2. รอโอนจ่าย ({stats.pendingTransferCount})
            </span>
            <Clock className={`w-3.5 h-3.5 ${selectedTab === 'pending_transfer' ? 'text-white' : 'text-[#005aa9]'}`} />
          </div>
          <div className={`text-base font-bold font-mono ${selectedTab === 'pending_transfer' ? 'text-white' : 'text-blue-950'}`}>
            {formatMoney(stats.totalPendingTransfer)}
          </div>
          <div className={`text-[10px] mt-0.5 font-medium ${selectedTab === 'pending_transfer' ? 'text-blue-100' : 'text-blue-700'}`}>
            คลิกกรองคิวรอโอน &rarr;
          </div>
        </div>

        {/* 3. Postponed Items */}
        <div 
          onClick={() => { setSelectedTab('postponed'); setCurrentPage(1); }}
          className={`p-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
            selectedTab === 'postponed'
              ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-600/20'
              : stats.postponedCount > 0 
                ? 'bg-white border-rose-200 hover:border-rose-400' 
                : 'bg-white border-slate-200 opacity-80'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-bold ${selectedTab === 'postponed' ? 'text-rose-100' : 'text-rose-900'}`}>
              เลื่อนจ่าย ({stats.postponedCount})
            </span>
            <AlertTriangle className={`w-3.5 h-3.5 ${selectedTab === 'postponed' ? 'text-white' : stats.postponedCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-base font-bold font-mono ${selectedTab === 'postponed' ? 'text-white' : 'text-rose-950'}`}>
            {formatMoney(stats.totalPostponed)}
          </div>
          <div className={`text-[10px] mt-0.5 font-medium ${selectedTab === 'postponed' ? 'text-rose-100' : 'text-rose-700'}`}>
            ชะลอตามข้อตกลง
          </div>
        </div>

        {/* 4. Paid */}
        <div 
          onClick={() => { setSelectedTab('paid'); setCurrentPage(1); }}
          className={`p-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
            selectedTab === 'paid'
              ? 'bg-[#009540] text-white border-[#009540] ring-2 ring-emerald-600/20'
              : 'bg-white border-emerald-200 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-bold ${selectedTab === 'paid' ? 'text-emerald-100' : 'text-emerald-900'}`}>
              3. โอนจ่ายแล้ว ({stats.paidCount})
            </span>
            <CheckCircle2 className={`w-3.5 h-3.5 ${selectedTab === 'paid' ? 'text-white' : 'text-[#009540]'}`} />
          </div>
          <div className={`text-base font-bold font-mono ${selectedTab === 'paid' ? 'text-white' : 'text-emerald-950'}`}>
            {formatMoney(stats.totalPaid)}
          </div>
          <div className={`text-[10px] mt-0.5 font-medium ${selectedTab === 'paid' ? 'text-emerald-100' : 'text-emerald-700'}`}>
            เสร็จสิ้น (ออก PV แล้ว)
          </div>
        </div>

      </div>

      {/* Filters & Search Toolbar (Streamlined) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
          
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ DBM, Ref, ผู้ขอเบิก, ผู้รับเงิน, เช็ค, โครงการ..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#005aa9] font-medium"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCompany}
              onChange={(e) => { setSelectedCompany(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#005aa9] font-semibold text-slate-700"
            >
              <option value="ALL">ทุกบริษัท (BTC, BTCP, TBTC...)</option>
              {companiesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedProject}
              onChange={(e) => { setSelectedProject(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#005aa9] font-medium text-slate-700"
            >
              <option value="ALL">ทุกโครงการก่อสร้าง</option>
              {projectsList.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                <th className="py-2.5 px-3">เลขที่เอกสาร DBM</th>
                <th className="py-2.5 px-2.5">บริษัท / วันที่</th>
                <th className="py-2.5 px-2.5">โครงการ & ผู้ขอเบิก</th>
                <th className="py-2.5 px-2.5">ผู้รับเงิน / ประเภทงาน</th>
                <th className="py-2.5 px-2.5 text-right">ยอดเงินเบิก</th>
                <th className="py-2.5 px-2.5">สถานะ & ลายเซ็น</th>
                <th className="py-2.5 px-2.5">ข้อมูลการโอนเงิน (การเงิน)</th>
                <th className="py-2.5 px-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDisbursements.length > 0 ? (
                paginatedDisbursements.map((dbm) => (
                  <tr key={dbm.id} className="hover:bg-blue-50/30 transition-colors">
                    
                    {/* DBM & Ref No */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewDisbursement(dbm)}
                          className="font-mono font-black text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                        >
                          {dbm.dbmNo}
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Ref: {dbm.refDocNo || '-'}
                      </div>
                    </td>

                    {/* Company & Date */}
                    <td className="py-2.5 px-2.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded">
                        {dbm.company}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {dbm.entryDate}
                      </div>
                      {Boolean(dbm.originalDueDate || dbm.rescheduleReason || (dbm.status !== 'paid' && dbm.remarks && (dbm.remarks.includes('เลื่อน') || dbm.remarks.includes('รอตรวจรับ')))) && (
                        <div className="mt-1">
                          <span 
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[9px] font-bold"
                            title={dbm.rescheduleReason || dbm.remarks || 'ขอเลื่อนกำหนดจ่าย'}
                          >
                            <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
                            <span>เลื่อนจ่าย{dbm.dueDate ? ` (${dbm.dueDate})` : ''}</span>
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Project & Requester */}
                    <td className="py-2.5 px-2.5 max-w-[200px]">
                      <div className="font-bold text-slate-800 truncate" title={dbm.project}>
                        {dbm.project}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="text-slate-400">ผู้ขอเบิก:</span>
                        <span className="font-bold text-[#005aa9] truncate">{dbm.recordedBy || '-'}</span>
                        {dbm.requesterSignature && (
                          <PenTool className="w-2.5 h-2.5 text-blue-600 shrink-0" title="มีลายเซ็นสดผู้ขอเบิก" />
                        )}
                        {dbm.attachments && dbm.attachments.length > 0 && (
                          <Paperclip className="w-2.5 h-2.5 text-slate-400 shrink-0" title={`มีเอกสารแนบ ${dbm.attachments.length} ไฟล์`} />
                        )}
                      </div>
                      {dbm.financeRecordedBy && (
                        <div className="text-[10px] text-emerald-700 flex items-center gap-1 mt-0.5 font-medium">
                          <span className="text-slate-400">ผู้จ่ายเงิน:</span>
                          <span className="truncate">{dbm.financeRecordedBy}</span>
                        </div>
                      )}
                    </td>

                    {/* Payee & Expense */}
                    <td className="py-2.5 px-2.5 max-w-[220px]">
                      <div className="font-bold text-slate-900 truncate" title={dbm.payeeName}>
                        {dbm.payeeName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate" title={dbm.expenseType}>
                        {dbm.expenseType}
                      </div>
                      {dbm.payeeBankAccount && (
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {dbm.payeeBankAccount}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-2.5 px-2.5 text-right">
                      <div className="font-mono font-black text-slate-900 text-sm">
                        {formatMoney(dbm.totalAmount)}
                      </div>
                      {dbm.items && dbm.items.length > 1 && (
                        <div className="text-[10px] text-slate-400">
                          {dbm.items.length} รายการย่อย
                        </div>
                      )}
                    </td>

                    {/* Status & Review action */}
                    <td className="py-2.5 px-2.5">
                      {dbm.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-[#009540] border border-emerald-200 rounded-full font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          โอนแล้ว
                        </span>
                      ) : dbm.status === 'pending_review' ? (
                        <button
                          onClick={() => setReviewingDisbursement(dbm)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-full font-bold text-[10px] cursor-pointer transition-colors"
                          title="คลิกเพื่อตรวจสอบและลงนามอนุมัติ"
                        >
                          <ShieldCheck className="w-3 h-3 text-purple-600" />
                          รอตรวจสอบ (คลิกตรวจ)
                        </button>
                      ) : dbm.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full font-bold text-[10px]">
                          <AlertCircle className="w-3 h-3" />
                          ไม่อนุมัติ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold text-[10px]">
                          <Check className="w-3 h-3" />
                          อนุมัติแล้ว (รอโอน)
                        </span>
                      )}
                    </td>

                    {/* Transfer Details / Drive Link */}
                    <td className="py-2.5 px-2.5 max-w-[200px]">
                      {dbm.status === 'paid' ? (
                        <div className="space-y-0.5 text-[11px]">
                          <div className="font-mono font-bold text-emerald-900">
                            โอน {formatMoney(dbm.transferAmount || dbm.totalAmount)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            วันที่: {dbm.paymentDate || '-'}
                          </div>
                          {dbm.documentLink ? (
                            <a
                              href={dbm.documentLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline text-[10px] flex items-center gap-1 font-medium mt-0.5"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>สลิป Google Drive</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400">ไม่มีไฟล์แนบ</span>
                          )}
                        </div>
                      ) : dbm.status === 'pending_review' ? (
                        <span className="text-[10px] text-slate-400 italic">
                          รอการอนุมัติก่อนโอน
                        </span>
                      ) : (
                        <button
                          onClick={() => onOpenTransferModal(dbm)}
                          className="px-2.5 py-1 bg-[#005aa9] hover:bg-[#004887] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                        >
                          <Wallet className="w-3 h-3" />
                          <span>บันทึกการโอน</span>
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {onRescheduleDisbursement && dbm.status !== 'paid' && (
                          <button
                            onClick={() => setReschedulingDisbursement(dbm)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="เลื่อนกำหนดจ่าย / บันทึกเหตุผล"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onViewDisbursement(dbm)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="ดูและพิมพ์ใบสำคัญจ่าย A4"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onEditDisbursement(dbm)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="แก้ไขใบตั้งเบิก"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`คุณต้องการลบใบตั้งเบิก ${dbm.dbmNo} ใช่หรือไม่?`)) {
                              onDeleteDisbursement(dbm.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="ลบรายการ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                    ไม่พบรายการใบตั้งเบิกตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              แสดง {(currentPage - 1) * itemsPerPage + 1} ถึง {Math.min(currentPage * itemsPerPage, filteredDisbursements.length)} จากทั้งหมด {filteredDisbursements.length} รายการ
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-bold text-slate-800">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Review & Approval Modal */}
      <ReviewApprovalModal
        isOpen={!!reviewingDisbursement}
        disbursement={reviewingDisbursement}
        onClose={() => setReviewingDisbursement(null)}
        onApprove={(id, data) => {
          onApproveDisbursement(id, data);
          setReviewingDisbursement(null);
        }}
      />

      {/* Reschedule Due Date Modal */}
      {reschedulingDisbursement && onRescheduleDisbursement && (
        <RescheduleModal
          isOpen={!!reschedulingDisbursement}
          onClose={() => setReschedulingDisbursement(null)}
          disbursement={reschedulingDisbursement}
          onConfirmReschedule={(id, newDate, reason, rescheduledBy) => {
            onRescheduleDisbursement(id, newDate, reason, rescheduledBy);
            setReschedulingDisbursement(null);
          }}
        />
      )}

    </div>
  );
}
