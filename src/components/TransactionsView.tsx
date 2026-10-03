import { useState, useMemo, useEffect } from 'react';
import { Transaction, Disbursement } from '../types';
import { formatCurrency, compareTransactionsDesc } from '../utils/accounting';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Eye,
  FileText,
  ExternalLink,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  AlertCircle,
  X,
  CreditCard,
  Building2,
  Printer,
  ChevronRight,
  UserCheck,
  Hash,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Check
} from 'lucide-react';
import { PaymentVoucherModal } from './PaymentVoucherModal';

interface TransactionsViewProps {
  transactions: Transaction[];
  disbursements?: Disbursement[];
  onOpenNewTx: (type?: 'expense' | 'income') => void;
  onEditTx: (tx: Transaction) => void;
  onDeleteTx: (id: string) => void;
  onExportCSV: () => void;
  onImportCSV?: () => void;
  onReconcileTx?: (id: string, isReconciled: boolean, auditorName?: string, notes?: string) => void;
  onBatchReconcile?: (ids: string[], auditorName?: string) => void;
  onViewPV?: (dbm: Disbursement) => void;
  initialProjectFilter?: string;
  initialSearch?: string;
}

export function TransactionsView({
  transactions,
  disbursements = [],
  onOpenNewTx,
  onEditTx,
  onDeleteTx,
  onExportCSV,
  onImportCSV,
  onReconcileTx,
  onBatchReconcile,
  onViewPV,
  initialProjectFilter = 'all',
  initialSearch = ''
}: TransactionsViewProps) {
  const [search, setSearch] = useState(initialSearch);

  // Sync initialSearch if prop changes
  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedProject, setSelectedProject] = useState(initialProjectFilter);
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reconciled' | 'pv_only'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Selected transactions for batch reconciliation
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  
  // Inspection / Reconciliation Modal State
  const [inspectingTx, setInspectingTx] = useState<Transaction | null>(null);
  const [auditorName, setAuditorName] = useState('ผู้บริหาร / สมุห์บัญชี');
  const [auditNotes, setAuditNotes] = useState('');
  const [pvModalDbm, setPvModalDbm] = useState<Disbursement | null>(null);

  // Extract unique values for filter dropdowns
  const companies = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.company).filter(Boolean)));
  }, [transactions]);

  const projects = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.project).filter(Boolean))).sort();
  }, [transactions]);

  const accounts = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.account).filter(Boolean))).sort();
  }, [transactions]);

  // Status counts
  const statusStats = useMemo(() => {
    let pendingCount = 0;
    let pendingAmount = 0;
    let reconciledCount = 0;
    let reconciledAmount = 0;
    let pvCount = 0;
    let pvAmount = 0;

    transactions.forEach(t => {
      const isReconciled = t.status === 'reconciled' || t.status === 'cleared';
      const isPending = t.status === 'pending' || !t.status;
      const isPv = t.sourceType === 'pv' || !!t.pvNo || t.docNo?.startsWith('PV') || t.id.startsWith('tx_pv_') || t.id.startsWith('tx_dbm_');
      const amt = t.credit > 0 ? t.credit : t.debit;

      if (isPending) {
        pendingCount++;
        pendingAmount += amt;
      }
      if (isReconciled) {
        reconciledCount++;
        reconciledAmount += amt;
      }
      if (isPv) {
        pvCount++;
        pvAmount += amt;
      }
    });

    return {
      pendingCount,
      pendingAmount,
      reconciledCount,
      reconciledAmount,
      pvCount,
      pvAmount
    };
  }, [transactions]);

  // Overall Ledger Balance (Total income, expense, and net)
  const totalBalance = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      income += t.debit || 0;
      expense += t.credit || 0;
    });
    return { income, expense, net: income - expense };
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchDesc = (t.description || '').toLowerCase().includes(q);
        const matchDoc = (t.docNo || '').toLowerCase().includes(q);
        const matchProject = (t.project || '').toLowerCase().includes(q);
        const matchAccount = (t.account || '').toLowerCase().includes(q);
        const matchCat = (t.category || '').toLowerCase().includes(q);
        const matchRemarks = (t.remarks || '').toLowerCase().includes(q);
        const matchPayee = (t.payeeName || '').toLowerCase().includes(q);
        const matchPv = (t.pvNo || '').toLowerCase().includes(q);
        if (!matchDesc && !matchDoc && !matchProject && !matchAccount && !matchCat && !matchRemarks && !matchPayee && !matchPv) {
          return false;
        }
      }

      // Company
      if (selectedCompany !== 'all' && t.company !== selectedCompany) {
        return false;
      }

      // Project
      if (selectedProject !== 'all' && t.project !== selectedProject) {
        return false;
      }

      // Account
      if (selectedAccount !== 'all' && t.account !== selectedAccount) {
        return false;
      }

      // Type
      if (selectedType === 'income' && t.debit <= 0) return false;
      if (selectedType === 'expense' && t.credit <= 0) return false;
      if (selectedType === 'transfer') {
        const isTr = t.category.includes('โอน') || t.description.includes('โอนระหว่างบัญชี') || t.description.includes('โอนเงิน');
        if (!isTr) return false;
      }

      // Reconciliation Status Filter
      if (statusFilter === 'pending') {
        if (t.status === 'reconciled' || t.status === 'cleared') return false;
      } else if (statusFilter === 'reconciled') {
        if (t.status !== 'reconciled' && t.status !== 'cleared') return false;
      } else if (statusFilter === 'pv_only') {
        const isPv = t.sourceType === 'pv' || !!t.pvNo || t.docNo?.startsWith('PV') || t.id.startsWith('tx_pv_') || t.id.startsWith('tx_dbm_');
        if (!isPv) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return compareTransactionsDesc(a, b);
      if (sortBy === 'date_asc') return compareTransactionsDesc(b, a);
      if (sortBy === 'amount_desc') return Math.max(b.debit, b.credit) - Math.max(a.debit, a.credit);
      if (sortBy === 'amount_asc') return Math.max(a.debit, a.credit) - Math.max(b.debit, b.credit);
      return 0;
    });
  }, [transactions, search, selectedCompany, selectedProject, selectedAccount, selectedType, statusFilter, sortBy]);

  // Aggregate stats of filtered transactions
  const filteredSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach(t => {
      income += t.debit;
      expense += t.credit;
    });
    return {
      income,
      expense,
      net: income - expense,
      count: filteredTransactions.length
    };
  }, [filteredTransactions]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  // Selection handlers
  const handleSelectAllOnPage = () => {
    const pageIds = paginatedTransactions.map(t => t.id);
    const allSelected = pageIds.every(id => selectedTxIds.includes(id));
    if (allSelected) {
      setSelectedTxIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedTxIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectTx = (id: string) => {
    setSelectedTxIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchReconcileSelected = () => {
    if (selectedTxIds.length === 0) return;
    if (onBatchReconcile) {
      onBatchReconcile(selectedTxIds, auditorName);
      setSelectedTxIds([]);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCompany('all');
    setSelectedProject('all');
    setSelectedAccount('all');
    setSelectedType('all');
    setStatusFilter('all');
    setSortBy('date_desc');
    setCurrentPage(1);
    setSelectedTxIds([]);
  };

  // Find linked disbursement for inspection
  const getLinkedDisbursement = (tx: Transaction): Disbursement | undefined => {
    if (tx.disbursementId) {
      const found = disbursements.find(d => d.id === tx.disbursementId);
      if (found) return found;
    }
    if (tx.pvNo) {
      const found = disbursements.find(d => d.pvNo === tx.pvNo);
      if (found) return found;
    }
    if (tx.dbmNo) {
      const found = disbursements.find(d => d.dbmNo === tx.dbmNo);
      if (found) return found;
    }
    if (tx.docNo) {
      const found = disbursements.find(d => d.pvNo === tx.docNo || d.dbmNo === tx.docNo || d.refDocNo === tx.docNo);
      if (found) return found;
    }
    if (tx.description) {
      const found = disbursements.find(d => 
        (d.dbmNo && tx.description.includes(d.dbmNo)) ||
        (d.pvNo && tx.description.includes(d.pvNo))
      );
      if (found) return found;
    }
    return undefined;
  };

  const handleOpenInspectModal = (tx: Transaction) => {
    setInspectingTx(tx);
    setAuditNotes(tx.reconciliationNotes || '');
  };

  const handleConfirmReconcileModal = () => {
    if (!inspectingTx) return;
    if (onReconcileTx) {
      onReconcileTx(inspectingTx.id, true, auditorName, auditNotes);
    }
    setInspectingTx(null);
  };

  const handleRevertReconcileModal = () => {
    if (!inspectingTx) return;
    if (onReconcileTx) {
      onReconcileTx(inspectingTx.id, false, auditorName, auditNotes);
    }
    setInspectingTx(null);
  };

  const handleOpenPvVoucher = (tx: Transaction) => {
    const linkedDbm = getLinkedDisbursement(tx);
    if (linkedDbm) {
      setPvModalDbm(linkedDbm);
    } else {
      // Create synthetic disbursement for PV viewing
      const syntheticDbm: Disbursement = {
        id: tx.id,
        recordedBy: tx.reconciledBy || 'ระบบบัญชีอัตโนมัติ',
        dbmNo: tx.dbmNo || tx.docNo || 'DBM-AUTO',
        refDocNo: tx.refDocNo || '-',
        company: tx.company || 'BTC',
        entryDate: tx.date,
        dueDate: tx.isoDate,
        expenseType: tx.category || 'ค่าใช้จ่ายก่อสร้าง',
        payeeName: tx.payeeName || tx.description,
        payeeBankAccount: tx.account || '-',
        payeeBankName: 'ธนาคารกรุงเทพ',
        project: tx.project,
        paymentMethod: 'โอนเงินผ่านธนาคาร',
        remarks: tx.remarks || '',
        items: [
          { description: tx.description, amount: tx.credit || tx.debit }
        ],
        totalAmount: tx.credit || tx.debit,
        status: 'paid',
        pvNo: tx.pvNo || tx.docNo,
        payerAccount: tx.account,
        chequeNo: tx.remarks?.includes('เช็ค/Ref:') ? (tx.remarks.split('เช็ค/Ref:')[1]?.split('|')[0]?.trim() || '-') : '-',
        paymentDate: tx.date,
        transferAmount: tx.credit || tx.debit,
        fee: 0,
        financeRecordedBy: 'น.ส.กมลทิพย์ กรมทอง (ฝ่ายการเงิน)',
        paidAt: tx.createdAt,
        auditCertificateId: tx.auditCertificateId || 'BTC-CERT-AUTO',
        isSyncedToLedger: true
      };
      setPvModalDbm(syntheticDbm);
    }
  };

  return (
    <div className="space-y-3 pb-6">
      {/* Top Header: Clean, Direct & Professional */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white px-4 py-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            สมุดรายรับ-รายจ่าย (GL) & กระทบยอดบัญชี
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            สมุดบัญชีแยกประเภท ตรวจสอบกระทบยอด Statement ธนาคาร และบันทึกบัญชีรายรับ-รายจ่าย
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {selectedTxIds.length > 0 && onBatchReconcile && (
            <button
              onClick={handleBatchReconcileSelected}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer animate-pulse"
              title="ยืนยันกระทบยอดรายการที่เลือกพร้อมกัน"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>กระทบยอด ({selectedTxIds.length})</span>
            </button>
          )}

          {onImportCSV && (
            <button
              onClick={onImportCSV}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="นำเข้าไฟล์ CSV พร้อมระบบ Upsert ตรวจสอบข้อมูลซ้ำซ้อน"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">นำเข้า CSV</span>
            </button>
          )}

          <button
            onClick={onExportCSV}
            className="p-1.5 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="ส่งออก CSV"
          >
            <Download className="w-4 h-4 text-slate-600" />
          </button>

          <button
            onClick={() => onOpenNewTx('expense')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="เปิดแบบฟอร์มบันทึกรายจ่าย (Cr.) - เงินจ่ายออกจากบัญชี"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>บันทึกรายจ่าย (Cr.)</span>
          </button>

          <button
            onClick={() => onOpenNewTx('income')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#009540] hover:bg-[#007f36] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="เปิดแบบฟอร์มบันทึกรายรับ (Dr.) - เงินเข้าบัญชีธนาคาร"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>บันทึกรายรับ (Dr.)</span>
          </button>
        </div>
      </div>

      {/* Interactive Status & Metric Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* 1. Pending Recon */}
        <div
          onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
          className={`p-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-white border-amber-200 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-bold ${statusFilter === 'pending' ? 'text-amber-100' : 'text-amber-900'}`}>
              1. รอกระทบยอด ({statusStats.pendingCount})
            </span>
            <Clock className={`w-3.5 h-3.5 ${statusFilter === 'pending' ? 'text-white' : 'text-amber-600'}`} />
          </div>
          <div className={`text-base sm:text-lg font-bold font-mono ${statusFilter === 'pending' ? 'text-white' : 'text-amber-950'}`}>
            {formatCurrency(statusStats.pendingAmount)}
          </div>
          <div className={`text-[10px] mt-0.5 font-medium ${statusFilter === 'pending' ? 'text-amber-100' : 'text-amber-700'}`}>
            รอเทียบยอด Statement &rarr;
          </div>
        </div>

        {/* 2. Reconciled */}
        <div
          onClick={() => { setStatusFilter('reconciled'); setCurrentPage(1); }}
          className={`p-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'reconciled'
              ? 'bg-[#009540] text-white border-[#009540] ring-2 ring-emerald-600/20'
              : 'bg-white border-emerald-200 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-bold ${statusFilter === 'reconciled' ? 'text-emerald-100' : 'text-emerald-900'}`}>
              2. กระทบยอดตรงแล้ว ({statusStats.reconciledCount})
            </span>
            <CheckCircle2 className={`w-3.5 h-3.5 ${statusFilter === 'reconciled' ? 'text-white' : 'text-[#009540]'}`} />
          </div>
          <div className={`text-base sm:text-lg font-bold font-mono ${statusFilter === 'reconciled' ? 'text-white' : 'text-emerald-950'}`}>
            {formatCurrency(statusStats.reconciledAmount)}
          </div>
          <div className={`text-[10px] mt-0.5 font-medium ${statusFilter === 'reconciled' ? 'text-emerald-100' : 'text-emerald-700'}`}>
            ยอดตัดบัญชีตรง 100%
          </div>
        </div>

        {/* 3. PV Only */}
        <div
          onClick={() => { setStatusFilter('pv_only'); setCurrentPage(1); }}
          className={`p-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'pv_only'
              ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-600/20'
              : 'bg-white border-blue-200 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-bold ${statusFilter === 'pv_only' ? 'text-blue-100' : 'text-blue-900'}`}>
              3. จากใบสำคัญจ่าย PV ({statusStats.pvCount})
            </span>
            <FileText className={`w-3.5 h-3.5 ${statusFilter === 'pv_only' ? 'text-white' : 'text-blue-600'}`} />
          </div>
          <div className={`text-base sm:text-lg font-bold font-mono ${statusFilter === 'pv_only' ? 'text-white' : 'text-blue-950'}`}>
            {formatCurrency(statusStats.pvAmount)}
          </div>
          <div className={`text-[10px] mt-0.5 font-medium ${statusFilter === 'pv_only' ? 'text-blue-100' : 'text-blue-700'}`}>
            เชื่อมต่ออัตโนมัติจากการเงิน
          </div>
        </div>

        {/* 4. All Transactions */}
        <div
          onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
          className={`p-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-bold ${statusFilter === 'all' ? 'text-slate-200' : 'text-slate-500'}`}>
              ทั้งหมด ({transactions.length})
            </span>
            <CreditCard className={`w-3.5 h-3.5 ${statusFilter === 'all' ? 'text-slate-300' : 'text-slate-400'}`} />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono">
            {formatCurrency(totalBalance.net)}
          </div>
          <div className={`text-[10px] mt-0.5 ${statusFilter === 'all' ? 'text-slate-300' : 'text-slate-400'}`}>
            ยอดสุทธิ (รับ - จ่าย)
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="ค้นหาเลข PV, ผู้รับเงิน, รายการ..."
              className="w-full pl-8.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-xs"
            />
          </div>

          {/* Company Filter */}
          <div className="relative">
            <select
              value={selectedCompany}
              onChange={(e) => { setSelectedCompany(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-xs font-medium"
            >
              <option value="all">🏢 ทุกบริษัท / กิจการร่วมค้า</option>
              {companies.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div className="relative">
            <select
              value={selectedProject}
              onChange={(e) => { setSelectedProject(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-xs font-medium"
            >
              <option value="all">🚧 ทุกโครงการ / สายทาง</option>
              {projects.map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Bank Account Filter */}
          <div className="relative">
            <select
              value={selectedAccount}
              onChange={(e) => { setSelectedAccount(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-xs font-medium truncate"
            >
              <option value="all">💳 ทุกบัญชีธนาคาร</option>
              {accounts.map((a, i) => (
                <option key={i} value={a}>{a.length > 35 ? a.substring(0, 35) + '...' : a}</option>
              ))}
            </select>
          </div>

          {/* Type Filter & Reset */}
          <div className="relative flex gap-1">
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value as any); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-xs font-medium"
            >
              <option value="all">📊 ทุกประเภทรายการ</option>
              <option value="income">🟢 รายรับเท่านั้น (Dr.)</option>
              <option value="expense">🔴 รายจ่ายเท่านั้น (Cr.)</option>
              <option value="transfer">🔄 โอนระหว่างบัญชี</option>
            </select>

            <button
              onClick={resetFilters}
              title="ล้างตัวกรอง"
              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filtered Result Metrics Ribbon */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500 font-medium">ผลรวมรายการที่กรอง ({filteredTransactions.length} รายการ):</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">รายรับ:</span>
              <span className="font-bold text-emerald-600">{formatCurrency(filteredSummary.income)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">รายจ่าย:</span>
              <span className="font-bold text-rose-600">{formatCurrency(filteredSummary.expense)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">สุทธิ:</span>
              <span className={`font-bold ${filteredSummary.net >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                {formatCurrency(filteredSummary.net)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">เรียงตาม:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
            >
              <option value="date_desc">วันที่ (ใหม่สุดก่อน)</option>
              <option value="date_asc">วันที่ (เก่าสุดก่อน)</option>
              <option value="amount_desc">ยอดเงิน (มากไปน้อย)</option>
              <option value="amount_asc">ยอดเงิน (น้อยไปมาก)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 select-none">
                <th className="py-2.5 px-2.5 text-center w-8">
                  <input
                    type="checkbox"
                    onChange={handleSelectAllOnPage}
                    checked={paginatedTransactions.length > 0 && paginatedTransactions.every(t => selectedTxIds.includes(t.id))}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">วันที่</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">เลขที่เอกสาร / PV</th>
                <th className="py-2.5 px-2.5">บริษัท & บัญชีตัดเงิน</th>
                <th className="py-2.5 px-2.5 min-w-[200px]">รายละเอียดรายการ & ผู้รับเงิน</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">โครงการ</th>
                <th className="py-2.5 px-2.5 text-right whitespace-nowrap">รายรับ (Dr.)</th>
                <th className="py-2.5 px-2.5 text-right whitespace-nowrap">รายจ่าย (Cr.)</th>
                <th className="py-2.5 px-2.5 text-center whitespace-nowrap">สถานะกระทบยอด Statement</th>
                <th className="py-2.5 px-2.5 text-center whitespace-nowrap no-print">ตรวจสลิป / จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    ไม่พบรายการบัญชีที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const isSelected = selectedTxIds.includes(tx.id);
                  const isReconciled = tx.status === 'reconciled' || tx.status === 'cleared';
                  const isPv = tx.sourceType === 'pv' || !!tx.pvNo || tx.docNo?.startsWith('PV') || tx.id.startsWith('tx_pv_') || tx.id.startsWith('tx_dbm_');

                  return (
                    <tr 
                      key={tx.id} 
                      className={`hover:bg-blue-50/40 transition-colors group ${
                        isSelected ? 'bg-blue-50/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2 px-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectTx(tx.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Date */}
                      <td className="py-2 px-2.5 whitespace-nowrap font-medium text-slate-900">
                        {tx.date}
                      </td>

                      {/* Doc No & PV Badge */}
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-0.5">
                          {tx.docNo ? (
                            <span className="font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px] font-semibold border border-slate-200">
                              {tx.docNo}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}

                          {isPv && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[9px] font-bold border border-indigo-100">
                              <FileText className="w-2.5 h-2.5" />
                              ส่งต่อจาก PV
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Company & Bank Account */}
                      <td className="py-2 px-2.5 max-w-[180px]">
                        <span className="font-bold text-slate-900 block truncate" title={tx.company}>
                          {tx.company}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate" title={tx.account}>
                          {tx.account}
                        </span>
                      </td>

                      {/* Description & Payee */}
                      <td className="py-2 px-2.5">
                        <div className="font-medium text-slate-800 leading-snug">
                          {tx.description}
                        </div>
                        {tx.payeeName && (
                          <div className="text-[11px] text-blue-600 font-medium mt-0.5 flex items-center gap-1">
                            <span className="text-[10px] text-slate-400">ผู้รับเงิน:</span>
                            <span>{tx.payeeName}</span>
                          </div>
                        )}
                        {tx.remarks && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5 truncate max-w-xs" title={tx.remarks}>
                            {tx.remarks}
                          </div>
                        )}
                      </td>

                      {/* Project */}
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200" title={tx.project}>
                          {tx.project.length > 22 ? tx.project.substring(0, 22) + '...' : tx.project}
                        </span>
                      </td>

                      {/* Debit / Income */}
                      <td className="py-2 px-2.5 text-right whitespace-nowrap font-bold text-emerald-600 font-mono">
                        {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                      </td>

                      {/* Credit / Expense */}
                      <td className="py-2 px-2.5 text-right whitespace-nowrap font-bold text-rose-600 font-mono">
                        {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                      </td>

                      {/* Bank Statement Reconciliation Status */}
                      <td className="py-2 px-2.5 text-center whitespace-nowrap">
                        {isReconciled ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ตรง Statement แล้ว ✓
                            </span>
                            {tx.reconciledBy && (
                              <span className="text-[9px] text-slate-400 mt-0.5" title={`ตรวจเมื่อ: ${tx.reconciledAt || '-'}`}>
                                โดย: {tx.reconciledBy}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-2.5 h-2.5 text-amber-500" />
                              รอกระทบยอด
                            </span>
                            {onReconcileTx && (
                              <button
                                onClick={() => onReconcileTx(tx.id, true, auditorName)}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all cursor-pointer"
                                title="กดยืนยันว่ารายการนี้ตัดเงินตรงกับ Statement ธนาคารจริง"
                              >
                                ✓ ยืนยันตรง
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions & Verification Modal Trigger */}
                      <td className="py-2 px-2.5 text-center whitespace-nowrap no-print">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenInspectModal(tx)}
                            className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-[11px] transition-colors flex items-center gap-1 cursor-pointer border border-blue-200"
                            title="ตรวจสอบสลิปการโอน และใบสำคัญจ่าย PV"
                          >
                            <Eye className="w-3 h-3" />
                            <span>ตรวจสลิป/PV</span>
                          </button>
                          
                          <button
                            onClick={() => onEditTx(tx)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                            title="แก้ไขรายการ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTx(tx.id)}
                            className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>แสดง</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs"
            >
              <option value={25}>25 รายการ</option>
              <option value={50}>50 รายการ</option>
              <option value={100}>100 รายการ</option>
            </select>
            <span>จากทั้งหมด {filteredTransactions.length} รายการ</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
            >
              ก่อนหน้า
            </button>
            <span className="px-2 font-medium">
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>

      {/* Reconciliation & Slip Inspection Modal */}
      {inspectingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Bank Statement Verification
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Doc: {inspectingTx.docNo || inspectingTx.id}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  ตรวจสอบสลิป & ยืนยันการกระทบยอดกับ Statement ธนาคาร
                </h3>
              </div>
              <button
                onClick={() => setInspectingTx(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              
              {/* Reconciliation Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                inspectingTx.status === 'reconciled' || inspectingTx.status === 'cleared'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-3">
                  {inspectingTx.status === 'reconciled' || inspectingTx.status === 'cleared' ? (
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm">
                      {inspectingTx.status === 'reconciled' || inspectingTx.status === 'cleared'
                        ? 'สถานะ: ยืนยันกระทบยอดตรงกับ Statement เรียบร้อยแล้ว ✓'
                        : 'สถานะ: รอยืนยันการกระทบยอดกับ Statement ธนาคาร'}
                    </div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      {inspectingTx.status === 'reconciled' || inspectingTx.status === 'cleared'
                        ? `ตรวจสอบโดย: ${inspectingTx.reconciledBy || 'ผู้บริหาร'} เมื่อ ${inspectingTx.reconciledAt || '-'}`
                        : 'ตรวจทานยอดเงินที่ตัดจากบัญชีธนาคารจริงว่าตรงกับสลิปและใบสำคัญจ่าย (PV)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left Box: Transaction & Payment Info */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 pb-2 border-b border-slate-200">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>ข้อมูลรายการและการตัดบัญชี</span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">วันที่ทำรายการ:</span>
                      <span className="font-bold text-slate-900">{inspectingTx.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">เลขที่เอกสาร / PV:</span>
                      <span className="font-bold font-mono text-blue-600">{inspectingTx.docNo || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">บริษัท:</span>
                      <span className="font-semibold text-slate-900">{inspectingTx.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">โครงการ:</span>
                      <span className="font-semibold text-slate-900 text-right">{inspectingTx.project}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">บัญชีที่ตัดเงิน:</span>
                      <span className="font-semibold text-slate-900 text-right">{inspectingTx.account}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ผู้รับเงิน (Payee):</span>
                      <span className="font-bold text-slate-900 text-right">{inspectingTx.payeeName || inspectingTx.description}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="font-bold text-slate-700">ยอดเงินตัดบัญชี (Cr.):</span>
                      <span className="text-base font-bold font-mono text-rose-600">
                        {formatCurrency(inspectingTx.credit || inspectingTx.debit)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Box: Payment Slip & Audit Certificate */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 pb-2 border-b border-slate-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>หลักฐานการโอนเงิน & ใบสำคัญจ่าย</span>
                    </div>

                    {/* Proof of Transfer / Slip Box */}
                    <div className="mt-3">
                      {inspectingTx.paymentSlipUrl ? (
                        <div className="space-y-2">
                          <span className="text-[11px] text-slate-500 block">สลิปการโอนเงินที่แนบไว้:</span>
                          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white p-2">
                            <img
                              src={inspectingTx.paymentSlipUrl}
                              alt="Payment Slip"
                              className="max-h-36 object-contain mx-auto rounded"
                              referrerPolicy="no-referrer"
                            />
                            <a
                              href={inspectingTx.paymentSlipUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 block text-center text-[10px] text-blue-600 hover:underline font-semibold"
                            >
                              คลิกเพื่อดูรูปขนาดเต็ม ↗
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200/70 text-center space-y-1">
                          <FileText className="w-7 h-7 text-blue-500 mx-auto" />
                          <div className="font-semibold text-slate-800 text-xs">
                            มีบันทึกการจ่ายเงินในระบบ PV
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Cert ID: {inspectingTx.auditCertificateId || 'BTC-CERT-VERIFIED'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
                    <button
                      onClick={() => handleOpenPvVoucher(inspectingTx)}
                      className="w-full sm:flex-1 py-2 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-indigo-200 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>ดู/พิมพ์ใบสำคัญจ่าย (PV Voucher)</span>
                    </button>

                    {onViewPV && getLinkedDisbursement(inspectingTx) && (
                      <button
                        onClick={() => {
                          const targetDbm = getLinkedDisbursement(inspectingTx);
                          if (targetDbm) {
                            setInspectingTx(null);
                            onViewPV(targetDbm);
                          }
                        }}
                        className="w-full sm:w-auto py-2 px-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-purple-200 cursor-pointer"
                        title="ดูรายละเอียดใบขอเบิก DBM ต้นทางฉบับเต็ม"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>ดูใบขอเบิก DBM ต้นทาง</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Management Reconciliation Actions */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs flex items-center gap-1.5 text-emerald-300">
                    <UserCheck className="w-4 h-4" />
                    <span>การยืนยันกระทบยอดกับ Statement ธนาคารจริง</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      ชื่อผู้ตรวจสอบ / ผู้มีอำนาจอนุมัติกระทบยอด:
                    </label>
                    <input
                      type="text"
                      value={auditorName}
                      onChange={(e) => setAuditorName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      หมายเหตุการกระทบยอด (Audit Notes):
                    </label>
                    <input
                      type="text"
                      value={auditNotes}
                      onChange={(e) => setAuditNotes(e.target.value)}
                      placeholder="เช่น ยอดเงินตรงกับ Statement ประจำวันที่ 15/01/2568"
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  {inspectingTx.status === 'reconciled' || inspectingTx.status === 'cleared' ? (
                    <button
                      onClick={handleRevertReconcileModal}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-900/50 transition-all cursor-pointer"
                    >
                      ยกเลิกสถานะกระทบยอด (กลับสู่รอดำเนินการ)
                    </button>
                  ) : null}

                  <button
                    onClick={handleConfirmReconcileModal}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ ยืนยันยอดเงินตัดบัญชีตรงกับ Statement จริง</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full PV Voucher Modal */}
      {pvModalDbm && (
        <PaymentVoucherModal
          isOpen={!!pvModalDbm}
          onClose={() => setPvModalDbm(null)}
          disbursement={pvModalDbm}
        />
      )}
    </div>
  );
}
