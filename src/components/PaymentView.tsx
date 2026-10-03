import { useState, useMemo } from 'react';
import { Disbursement, Transaction, ViewTab } from '../types';
import { compareDisbursementsDesc } from '../utils/accounting';
import { 
  CreditCard, Banknote, Search, Filter, CheckCircle2, 
  Clock, ShieldCheck, Printer, ExternalLink, Download, 
  Building2, Wallet, ChevronLeft, ChevronRight, FileText,
  TrendingDown, ArrowRight, Eye, RefreshCw, Award, Image,
  Sparkles, Check, BookOpen, Layers, CheckCheck, Calendar
} from 'lucide-react';
import { RecordPaymentModal } from './RecordPaymentModal';
import { PaymentVoucherModal } from './PaymentVoucherModal';
import { DailyTransferReportModal } from './DailyTransferReportModal';

interface PaymentViewProps {
  disbursements: Disbursement[];
  transactions?: Transaction[];
  onConfirmPayment: (
    id: string,
    paymentData: {
      payerAccount: string;
      chequeNo: string;
      paymentDate: string;
      transferAmount: number;
      fee: number;
      paymentMethod: string;
      documentLink: string;
      paymentSlipUrl?: string;
      paymentSlipName?: string;
      financeRecordedBy: string;
      financeSignature?: string;
      pvNo: string;
      paidAt: string;
      auditCertificateId: string;
      status: 'paid';
    }
  ) => void;
  onSyncToLedger: (paidList: Disbursement[]) => void;
  accountsList: string[];
  onNavigateTab?: (tab: ViewTab) => void;
  onViewTransactionInLedger?: (searchDoc: string) => void;
}

export function PaymentView({
  disbursements,
  transactions = [],
  onConfirmPayment,
  onSyncToLedger,
  accountsList,
  onNavigateTab,
  onViewTransactionInLedger
}: PaymentViewProps) {
  const [selectedTab, setSelectedTab] = useState<'approved' | 'paid' | 'all'>('approved');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected disbursement for payment modal (Steps 2-3)
  const [payingDisbursement, setPayingDisbursement] = useState<Disbursement | null>(null);
  // Selected disbursement for Payment Voucher & Certificate (Step 4 preview/print)
  const [pvDisbursement, setPvDisbursement] = useState<Disbursement | null>(null);
  const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);

  // Extract unique companies & projects
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

  // Statistics
  const stats = useMemo(() => {
    let readyToPayAmount = 0;
    let readyToPayCount = 0;
    let paidAmount = 0;
    let paidCount = 0;
    let totalTaxDeducted = 0;

    disbursements.forEach(d => {
      if (d.status === 'approved' || d.status === 'pending') {
        readyToPayAmount += d.totalAmount;
        readyToPayCount++;
      } else if (d.status === 'paid') {
        paidAmount += (d.transferAmount || d.totalAmount);
        paidCount++;
        
        d.items?.forEach(item => {
          if (item.description.includes('ภาษี') && item.amount < 0) {
            totalTaxDeducted += Math.abs(item.amount);
          }
        });
      }
    });

    return {
      readyToPayAmount,
      readyToPayCount,
      paidAmount,
      paidCount,
      totalTaxDeducted,
      totalCount: disbursements.length
    };
  }, [disbursements]);

  // Filter list (sorted from newest to oldest)
  const filteredList = useMemo(() => {
    return disbursements.filter(d => {
      // Tab filter
      let matchTab = true;
      if (selectedTab === 'approved') {
        matchTab = d.status === 'approved' || d.status === 'pending';
      } else if (selectedTab === 'paid') {
        matchTab = d.status === 'paid';
      }

      // Search filter
      const matchSearch = searchTerm === '' || 
        d.dbmNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.pvNo && d.pvNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        d.refDocNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.payeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.expenseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.chequeNo && d.chequeNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.payeeBankAccount && d.payeeBankAccount.includes(searchTerm));

      const matchCompany = selectedCompany === 'ALL' || d.company === selectedCompany;
      const matchProject = selectedProject === 'ALL' || d.project === selectedProject;

      return matchTab && matchSearch && matchCompany && matchProject;
    }).sort(compareDisbursementsDesc);
  }, [disbursements, selectedTab, searchTerm, selectedCompany, selectedProject]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const formatMoney = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
    return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleExportCSV = () => {
    const headers = [
      'เลขที่ PV', 'เลขที่ DBM', 'เอกสารอ้างอิง', 'บริษัท', 'โครงการ', 'ผู้รับเงิน',
      'บัญชีผู้รับ', 'ยอดเงินสุทธิ', 'สถานะ', 'วันที่จ่ายจริง', 'รูปแบบการชำระ',
      'บัญชีที่ตัดจ่าย', 'เลขที่เช็ค/Ref', 'ยอดเงินโอนจริง', 'ค่าธรรมเนียม', 'ผู้จ่ายเงิน', 'รหัสใบรับรองดิจิทัล'
    ];

    const rows = filteredList.map(d => [
      `"${d.pvNo || ''}"`,
      `"${d.dbmNo}"`,
      `"${d.refDocNo || ''}"`,
      `"${d.company || ''}"`,
      `"${d.project || ''}"`,
      `"${d.payeeName || ''}"`,
      `"${d.payeeBankAccount || ''}"`,
      d.totalAmount || 0,
      `"${d.status === 'paid' ? 'ชำระเงินแล้ว' : 'ผ่านการอนุมัติ (รอจ่าย)'}"`,
      `"${d.paymentDate || ''}"`,
      `"${d.paymentMethod || ''}"`,
      `"${d.payerAccount || ''}"`,
      `"${d.chequeNo || ''}"`,
      d.transferAmount || d.totalAmount || 0,
      d.fee || 0,
      `"${d.financeRecordedBy || ''}"`,
      `"${d.auditCertificateId || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BTC_Payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3.5">
      
      {/* Top Header: Clean, Direct & Professional */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white px-4 py-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            บันทึกจ่ายเงิน & ใบสำคัญจ่าย (PV)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการรายการอนุมัติรอจ่าย บันทึกการโอนเงิน/เช็ค และพิมพ์ใบสำคัญจ่ายโครงการ
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('transactions')}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="เปิดดูสมุดบัญชีแยกประเภทรายรับ-รายจ่าย (GL)"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">สมุดบัญชี GL</span>
            </button>
          )}

          {/* Daily Transfer Report Button */}
          <button
            onClick={() => setIsDailyReportOpen(true)}
            className="px-3 py-1.5 bg-[#005aa9] hover:bg-[#004887] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="ดูและพิมพ์รายงานสรุปการโอนเงินประจำวัน (Daily Transfer Report)"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>รายงานโอนประจำวัน</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="p-1.5 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="ส่งออก CSV"
          >
            <Download className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Interactive Status & Metric Filter Cards (Unified single source of truth) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        
        {/* 1. Ready to Pay (Approved) */}
        <div 
          onClick={() => { setSelectedTab('approved'); setCurrentPage(1); }}
          className={`p-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
            selectedTab === 'approved'
              ? 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-white border-amber-200 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-bold ${selectedTab === 'approved' ? 'text-amber-100' : 'text-amber-900'}`}>
              1. อนุมัติรอจ่าย ({stats.readyToPayCount})
            </span>
            <Clock className={`w-3.5 h-3.5 ${selectedTab === 'approved' ? 'text-white' : 'text-amber-600'}`} />
          </div>
          <div className={`text-base sm:text-lg font-bold font-mono ${selectedTab === 'approved' ? 'text-white' : 'text-amber-950'}`}>
            {formatMoney(stats.readyToPayAmount)}
          </div>
          <div className={`text-[10px] mt-0.5 font-medium ${selectedTab === 'approved' ? 'text-amber-100' : 'text-amber-700'}`}>
            {stats.readyToPayCount} รายการรอการเงินโอน &rarr;
          </div>
        </div>

        {/* 2. Paid (PV) */}
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
              2. จ่ายเงินแล้ว / PV ({stats.paidCount})
            </span>
            <CheckCircle2 className={`w-3.5 h-3.5 ${selectedTab === 'paid' ? 'text-white' : 'text-[#009540]'}`} />
          </div>
          <div className={`text-base sm:text-lg font-bold font-mono ${selectedTab === 'paid' ? 'text-white' : 'text-emerald-950'}`}>
            {formatMoney(stats.paidAmount)}
          </div>
          <div className={`text-[10px] mt-0.5 font-medium ${selectedTab === 'paid' ? 'text-emerald-100' : 'text-emerald-700'}`}>
            ออก PV & เชื่อม GL เรียบร้อย
          </div>
        </div>

        {/* 3. All */}
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
              ทั้งหมด ({disbursements.length})
            </span>
            <FileText className={`w-3.5 h-3.5 ${selectedTab === 'all' ? 'text-slate-300' : 'text-slate-400'}`} />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono">
            {formatMoney(stats.readyToPayAmount + stats.paidAmount)}
          </div>
          <div className={`text-[10px] mt-0.5 ${selectedTab === 'all' ? 'text-slate-300' : 'text-slate-400'}`}>
            รวมทุกรายการในระบบ
          </div>
        </div>

        {/* 4. Withholding Tax */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold">ภาษีหัก ณ ที่จ่ายรวม</span>
            <TrendingDown className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-base sm:text-lg font-bold text-blue-900 font-mono">
            {formatMoney(stats.totalTaxDeducted)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            ภ.ง.ด.3 / ภ.ง.ด.53
          </div>
        </div>

      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
          <div className="sm:col-span-6 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ PV, DBM, ผู้รับเงิน, บัญชี, โครงการ, เช็ค..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#005aa9] font-medium"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCompany}
              onChange={(e) => { setSelectedCompany(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#005aa9] font-semibold text-slate-700"
            >
              <option value="ALL">ทุกบริษัท (BTC, BTCP...)</option>
              {companiesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedProject}
              onChange={(e) => { setSelectedProject(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#005aa9] font-medium text-slate-700"
            >
              <option value="ALL">ทุกโครงการก่อสร้าง</option>
              {projectsList.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Payment Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                <th className="py-2.5 px-3">เลขที่ PV / DBM</th>
                <th className="py-2.5 px-2.5">บริษัท & โครงการ</th>
                <th className="py-2.5 px-2.5">ผู้รับเงิน & ข้อมูลบัญชี</th>
                <th className="py-2.5 px-2.5 text-right">ยอดสุทธิที่ต้องจ่าย</th>
                <th className="py-2.5 px-2.5">สถานะการชำระ</th>
                <th className="py-2.5 px-2.5">ข้อมูลการจ่ายจริง</th>
                <th className="py-2.5 px-3 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length > 0 ? (
                paginatedList.map((item) => {
                  const isPaid = item.status === 'paid';
                  const isApproved = item.status === 'approved' || item.status === 'pending';

                  // Cross-reference with General Ledger transaction
                  const linkedTx = transactions.find(t => 
                    (t.disbursementId && t.disbursementId === item.id) ||
                    (t.pvNo && item.pvNo && t.pvNo === item.pvNo) ||
                    (t.docNo && (t.docNo === item.pvNo || t.docNo === item.dbmNo || t.docNo === item.refDocNo)) ||
                    (t.description && (t.description.includes(item.dbmNo) || (item.pvNo && t.description.includes(item.pvNo))))
                  );

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                      
                      {/* PV & DBM Numbers */}
                      <td className="py-2.5 px-3">
                        {item.pvNo ? (
                          <button
                            onClick={() => setPvDisbursement(item)}
                            className="font-mono font-black text-blue-700 hover:text-blue-900 hover:underline cursor-pointer block text-xs"
                          >
                            {item.pvNo}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">ยังไม่ออก PV</span>
                        )}
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          DBM: <strong>{item.dbmNo}</strong> {item.refDocNo && `(${item.refDocNo})`}
                        </div>
                      </td>

                      {/* Company & Project */}
                      <td className="py-2.5 px-2.5 max-w-[200px]">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded">
                          {item.company}
                        </span>
                        <div className="font-bold text-slate-800 truncate mt-0.5" title={item.project}>
                          {item.project}
                        </div>
                      </td>

                      {/* Payee Name & Bank */}
                      <td className="py-2.5 px-2.5 max-w-[220px]">
                        <div className="font-extrabold text-slate-900 truncate" title={item.payeeName}>
                          {item.payeeName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{item.expenseType}</div>
                        {item.payeeBankAccount && (
                          <div className="text-[10px] text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                            <CreditCard className="w-3 h-3 text-slate-400" />
                            <span>{item.payeeBankAccount}</span>
                          </div>
                        )}
                      </td>

                      {/* Net Amount */}
                      <td className="py-2.5 px-2.5 text-right">
                        <div className="font-mono font-black text-slate-900 text-sm">
                          {formatMoney(item.transferAmount || item.totalAmount)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.items?.length || 1} รายการ
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-2.5">
                        {isPaid ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-[#009540] border border-emerald-300 rounded-full font-black text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              PAID (จ่ายแล้ว)
                            </span>
                            <div>
                              {linkedTx ? (
                                linkedTx.status === 'reconciled' || linkedTx.status === 'cleared' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold" title={`ตรวจสอบกระทบยอดตรง Statement ธนาคารแล้ว (ผู้ตรวจ: ${linkedTx.reconciledBy || 'สมุห์บัญชี'})`}>
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    ตรง Statement
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-semibold" title="บันทึกลงสมุดบัญชีรายรับ-รายจ่าย (GL) เรียบร้อยแล้ว อยู่ระหว่างรอกระทบยอด">
                                    <BookOpen className="w-3 h-3 text-blue-600" />
                                    ลงบัญชีแล้ว (รอตรวจ)
                                  </span>
                                )
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-semibold" title="บันทึกลงสมุดบัญชีรายรับ-รายจ่าย (GL) เรียบร้อยแล้ว">
                                  <BookOpen className="w-3 h-3 text-blue-600" />
                                  ลงบัญชีแล้ว (รอตรวจ)
                                </span>
                              )}
                            </div>
                          </div>
                        ) : isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-full font-bold text-[10px]">
                            <Clock className="w-3 h-3 text-amber-600" />
                            อนุมัติแล้ว (รอจ่าย)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-full font-medium text-[10px]">
                            {item.status === 'pending_review' ? 'รอตรวจสอบ' : item.status}
                          </span>
                        )}
                      </td>

                      {/* Real Payment Details */}
                      <td className="py-2.5 px-2.5 max-w-[200px]">
                        {isPaid ? (
                          <div className="space-y-0.5 text-[11px]">
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <span>วันที่โอน: {item.paymentDate || '-'}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate font-mono">
                              {item.payerAccount || 'BBL กระแสรายวัน'}
                            </div>
                            {item.chequeNo && (
                              <div className="text-[10px] text-blue-700 font-mono">
                                Ref: {item.chequeNo}
                              </div>
                            )}
                            {item.financeRecordedBy && (
                              <div className="text-[10px] text-emerald-700 font-medium truncate" title={`ผู้บันทึกจ่ายเงิน: ${item.financeRecordedBy}`}>
                                ผู้จ่ายเงิน: <span className="font-bold text-emerald-900">{item.financeRecordedBy}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            รอดำเนินการชำระเงิน
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center">
                        {isPaid ? (
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => setPvDisbursement(item)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              title="เปิดดูและพิมพ์ใบสำคัญจ่ายพร้อมใบรับรองดิจิทัล"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>พิมพ์ PV</span>
                            </button>

                            {onViewTransactionInLedger && (
                              <button
                                onClick={() => onViewTransactionInLedger(item.pvNo || item.dbmNo)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                title="เปิดดูรายการนี้ในสมุดบัญชีรายรับ-รายจ่าย (GL)"
                              >
                                <BookOpen className="w-3 h-3 text-slate-600" />
                                <span>ดูใน GL</span>
                              </button>
                            )}

                            {item.documentLink && (
                              <a
                                href={item.documentLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                                title="เปิดดูสลิป Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ) : isApproved ? (
                          <button
                            onClick={() => setPayingDisbursement(item)}
                            className="px-3 py-1.5 bg-linear-to-r from-emerald-600 to-[#005aa9] hover:from-emerald-700 hover:to-[#004887] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>บันทึกจ่าย</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">ยังไม่อนุมัติ</span>
                        )}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    ไม่พบรายการเอกสารในสถานะนี้
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
              แสดง {(currentPage - 1) * itemsPerPage + 1} ถึง {Math.min(currentPage * itemsPerPage, filteredList.length)} จากทั้งหมด {filteredList.length} รายการ
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

      {/* Steps 2-3 Record Payment Modal */}
      <RecordPaymentModal
        isOpen={!!payingDisbursement}
        onClose={() => setPayingDisbursement(null)}
        disbursement={payingDisbursement}
        disbursements={disbursements}
        onConfirmPayment={(id, data) => {
          onConfirmPayment(id, data);
          setPayingDisbursement(null);
          // Automatically open Payment Voucher Modal (Step 4)
          const updated = disbursements.find(d => d.id === id);
          if (updated) {
            setPvDisbursement({ ...updated, ...data });
          }
        }}
        accountsList={accountsList}
      />

      {/* Step 4 Payment Voucher (PV) & Digital Certificate Modal */}
      <PaymentVoucherModal
        isOpen={!!pvDisbursement}
        onClose={() => setPvDisbursement(null)}
        disbursement={pvDisbursement}
      />

      {/* Daily Transfer Report Modal */}
      <DailyTransferReportModal
        isOpen={isDailyReportOpen}
        onClose={() => setIsDailyReportOpen(false)}
        disbursements={disbursements}
      />

    </div>
  );
}
