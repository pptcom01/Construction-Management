import { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { 
  formatCurrency, 
  computeProjectSummaries, 
  compareTransactionsDesc,
  isTransferTransaction,
  isInitialBalanceTransaction,
  isLoanOrFinancingTransaction
} from '../utils/accounting';
import { 
  FolderKanban, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Layers, 
  HardHat, 
  Receipt, 
  Truck, 
  Fuel, 
  Wrench, 
  ChevronRight, 
  Search, 
  Table as TableIcon, 
  LayoutGrid,
  ArrowLeft,
  Building2,
  PieChart,
  Percent,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface ProjectsViewProps {
  transactions: Transaction[];
  selectedProjectName?: string;
  onSelectProject?: (pName: string) => void;
}

const BAR_COLORS = ['#005aa9', '#009540', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#64748b'];

export function ProjectsView({
  transactions,
  selectedProjectName: initialSelectedProject,
  onSelectProject
}: ProjectsViewProps) {
  const projectSummaries = useMemo(() => computeProjectSummaries(transactions), [transactions]);

  // Main navigation tab: 'matrix' (all projects comparison) vs 'deep_dive' (single project breakdown)
  const [activeTab, setActiveTab] = useState<'matrix' | 'deep_dive'>('matrix');

  const [activeProject, setActiveProject] = useState<string>(
    initialSelectedProject || (projectSummaries[0]?.projectName || '')
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [txSearchQuery, setTxSearchQuery] = useState<string>('');
  const [selectedTxCategory, setSelectedTxCategory] = useState<string>('all');
  const [txLimit, setTxLimit] = useState<number>(30);

  // Filtered summaries for Matrix view
  const filteredSummaries = useMemo(() => {
    if (!searchQuery.trim()) return projectSummaries;
    const q = searchQuery.toLowerCase();
    return projectSummaries.filter(p => 
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.projectName && p.projectName.toLowerCase().includes(q)) ||
      (p.cleanName && p.cleanName.toLowerCase().includes(q))
    );
  }, [projectSummaries, searchQuery]);

  // Overall combined project totals
  const overallProjectStats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalTransactions = 0;
    projectSummaries.forEach(p => {
      totalIncome += p.totalIncome;
      totalExpense += p.totalExpense;
      totalTransactions += p.transactionCount;
    });
    return {
      totalIncome,
      totalExpense,
      netMargin: totalIncome - totalExpense,
      totalTransactions,
      projectCount: projectSummaries.length
    };
  }, [projectSummaries]);

  // Selected project details
  const currentProjectStats = useMemo(() => {
    return projectSummaries.find(p => p.projectName === activeProject) || projectSummaries[0];
  }, [projectSummaries, activeProject]);

  // Selected project transactions (sorted from newest to oldest)
  const currentProjectTransactions = useMemo(() => {
    if (!currentProjectStats) return [];
    return transactions
      .filter(t => t.project === currentProjectStats.projectName)
      .sort(compareTransactionsDesc);
  }, [transactions, currentProjectStats]);

  // Distinct categories in the current project
  const projectCategories = useMemo(() => {
    const set = new Set<string>();
    currentProjectTransactions.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [currentProjectTransactions]);

  // Filtered transactions for current project ledger
  const filteredProjectTransactions = useMemo(() => {
    return currentProjectTransactions.filter(t => {
      if (selectedTxCategory !== 'all' && t.category !== selectedTxCategory) return false;
      if (txSearchQuery.trim()) {
        const q = txSearchQuery.toLowerCase();
        const desc = (t.description || '').toLowerCase();
        const doc = (t.docNo || '').toLowerCase();
        const rem = (t.remarks || '').toLowerCase();
        if (!desc.includes(q) && !doc.includes(q) && !rem.includes(q)) return false;
      }
      return true;
    });
  }, [currentProjectTransactions, selectedTxCategory, txSearchQuery]);

  // Top cost items in chart
  const costChartData = useMemo(() => {
    if (!currentProjectStats) return [];
    return currentProjectStats.expenseByCategory.slice(0, 8).map(c => ({
      name: c.category.length > 25 ? c.category.substring(0, 25) + '...' : c.category,
      amount: c.amount,
      percentage: c.percentage,
    }));
  }, [currentProjectStats]);

  // Key construction suppliers / subcontractors for this project
  const supplierSummary = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    currentProjectTransactions.forEach(t => {
      if (t.credit <= 0) return;
      if (isTransferTransaction(t) || isInitialBalanceTransaction(t) || isLoanOrFinancingTransaction(t)) return;
      // Extract payee from description e.g. (101-01-014 บจก.ทวีกิจก่อสร้างสุรินทร์)
      const match = t.description.match(/\((\d{3}-\d{2}-\d{3}\s+[^)]+)\)/) || t.description.match(/\((บจก\.[^)]+|บจ\.[^)]+|หจก\.[^)]+|หจ\.[^)]+|บมจ\.[^)]+|นาย[^)]+|นาง[^)]+|น\.ส\.[^)]+)\)/);
      const name = match ? match[1] : (t.description.split('(')[0] || 'ผู้รับเหมา/ซัพพลายเออร์');
      if (!map.has(name)) {
        map.set(name, { total: 0, count: 0 });
      }
      const cur = map.get(name)!;
      cur.total += t.credit;
      cur.count += 1;
    });
    return Array.from(map.entries()).map(([name, val]) => ({
      name,
      total: val.total,
      count: val.count,
    })).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [currentProjectTransactions]);

  const handleSelectAndDeepDive = (pName: string) => {
    setActiveProject(pName);
    setActiveTab('deep_dive');
    setTxSearchQuery('');
    setSelectedTxCategory('all');
    setTxLimit(30);
    if (onSelectProject) onSelectProject(pName);
  };

  return (
    <div className="space-y-3.5 pb-8">
      {/* 1. Header Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <FolderKanban className="w-5 h-5 text-[#005aa9]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                ภาพรวมกำไร & ต้นทุนโครงการ (Project Costing & Profitability)
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-900 border border-blue-200">
                {overallProjectStats.projectCount} โครงการ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ติดตามค่างวดงาน รายจ่ายจริง กำไรขั้นต้น และผู้รับเหมาช่วงแยกตามสัญญา
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-[#009540]"></span>
            <span>ตัดเงินยืม/เงินกู้/โอน ออกจากต้นทุนแล้ว</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-[#005aa9]" />
              <span>เปรียบเทียบทุกโครงการ</span>
            </button>
            <button
              onClick={() => setActiveTab('deep_dive')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'deep_dive'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <PieChart className="w-3.5 h-3.5 text-purple-600" />
              <span>วิเคราะห์เจาะลึกโครงการ</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Executive Combined KPIs (Clean 4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              สัญญาโครงการทั้งหมด
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
              Active Contracts
            </span>
          </div>
          <div className="mt-1">
            <span className="text-base sm:text-lg font-bold text-slate-900 font-mono">
              {overallProjectStats.projectCount} โครงการ
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            บันทึกรวม {overallProjectStats.totalTransactions} รายการบัญชี
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#009540]" />
              ค่างวดงาน / รายรับรวม
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">
              Contract Revenue
            </span>
          </div>
          <div className="mt-1">
            <span className="text-base sm:text-lg font-bold text-[#009540] font-mono">
              {formatCurrency(overallProjectStats.totalIncome)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            รายรับจริงจากค่างวดงานก่อสร้าง
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
              ต้นทุน & ค่าใช้จ่ายสะสม
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700">
              Cost to Date
            </span>
          </div>
          <div className="mt-1">
            <span className="text-base sm:text-lg font-bold text-rose-600 font-mono">
              {formatCurrency(overallProjectStats.totalExpense)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            วัสดุ, ค่าแรง, เครื่องจักร, ซ่อมบำรุง
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#005aa9]" />
              กำไรขั้นต้นรวม (Gross Margin)
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700">
              {overallProjectStats.totalIncome > 0
                ? `${((overallProjectStats.netMargin / overallProjectStats.totalIncome) * 100).toFixed(1)}%`
                : 'Margin'}
            </span>
          </div>
          <div className="mt-1">
            <span className={`text-base sm:text-lg font-bold font-mono ${
              overallProjectStats.netMargin >= 0 ? 'text-[#005aa9]' : 'text-amber-600'
            }`}>
              {formatCurrency(overallProjectStats.netMargin)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            ส่วนต่างเงินสดคงเหลือสุทธิ
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALL PROJECTS MATRIX (เปรียบเทียบทุกโครงการ) */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-3 sm:p-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900">ตารางเปรียบเทียบต้นทุนและกำไรทุกโครงการ</span>
              <span className="text-xs text-slate-500">({filteredSummaries.length} โครงการ)</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหารหัสหรือชื่อโครงการ..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005aa9] bg-white"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs shrink-0">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="มุมมองตาราง"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="มุมมองการ์ด"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-100/80">
                    <th className="py-2.5 px-3 w-20 text-center">รหัส</th>
                    <th className="py-2.5 px-3 min-w-[220px]">ชื่อโครงการ / สายทาง</th>
                    <th className="py-2.5 px-2.5 text-center">จำนวนรายการ</th>
                    <th className="py-2.5 px-3 text-right">ค่างวดงาน / รายรับ</th>
                    <th className="py-2.5 px-3 text-right">ต้นทุนสะสม / รายจ่าย</th>
                    <th className="py-2.5 px-3 text-right">กำไรสุทธิ / ผลต่าง</th>
                    <th className="py-2.5 px-3 text-center">สัดส่วนต้นทุน</th>
                    <th className="py-2.5 px-3 text-center w-28">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSummaries.map((p) => {
                    const costRatio = p.totalIncome > 0 
                      ? Math.min(100, Math.round((p.totalExpense / p.totalIncome) * 100))
                      : (p.totalExpense > 0 ? 100 : 0);
                    
                    return (
                      <tr
                        key={p.projectName}
                        className="hover:bg-blue-50/40 transition-colors"
                      >
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {p.code}
                          </span>
                        </td>

                        <td className="py-2 px-3">
                          <div className="font-bold text-slate-900">
                            {p.cleanName || p.projectName}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {p.projectName}
                          </div>
                        </td>

                        <td className="py-2 px-2.5 text-center whitespace-nowrap font-mono text-slate-600">
                          {p.transactionCount}
                        </td>

                        <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-[#009540] font-mono">
                          {formatCurrency(p.totalIncome)}
                        </td>

                        <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-rose-600 font-mono">
                          {formatCurrency(p.totalExpense)}
                        </td>

                        <td className={`py-2 px-3 text-right whitespace-nowrap font-bold font-mono ${
                          p.netMargin >= 0 ? 'text-[#005aa9]' : 'text-amber-600'
                        }`}>
                          {formatCurrency(p.netMargin)}
                        </td>

                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <div className="w-20 mx-auto">
                            <div className="flex items-center justify-between text-[10px] mb-0.5">
                              <span className="text-slate-500 font-medium">{costRatio}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  costRatio > 90 ? 'bg-rose-500' : costRatio > 75 ? 'bg-amber-500' : 'bg-[#009540]'
                                }`}
                                style={{ width: `${costRatio}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleSelectAndDeepDive(p.projectName)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#005aa9] bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer border border-blue-200 shadow-2xs"
                          >
                            <span>เจาะลึก</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                    <td colSpan={2} className="py-2.5 px-3 text-left font-bold text-xs">
                      รวมทุกโครงการ ({projectSummaries.length} โครงการ)
                    </td>
                    <td className="py-2.5 px-2.5 text-center text-xs font-mono">
                      {overallProjectStats.totalTransactions} รายการ
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#009540] font-mono text-xs">
                      {formatCurrency(overallProjectStats.totalIncome)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-600 font-mono text-xs">
                      {formatCurrency(overallProjectStats.totalExpense)}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono text-xs ${
                      overallProjectStats.netMargin >= 0 ? 'text-[#005aa9]' : 'text-amber-700'
                    }`}>
                      {formatCurrency(overallProjectStats.netMargin)}
                    </td>
                    <td colSpan={2} className="py-2.5 px-3 text-center text-[11px] text-slate-500">
                      สรุปยอดจริง
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            /* Cards View */
            <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredSummaries.map((p) => {
                const costRatio = p.totalIncome > 0 
                  ? Math.min(100, Math.round((p.totalExpense / p.totalIncome) * 100))
                  : (p.totalExpense > 0 ? 100 : 0);

                return (
                  <div
                    key={p.projectName}
                    onClick={() => handleSelectAndDeepDive(p.projectName)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer bg-white shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {p.code}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {p.transactionCount} รายการ
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2" title={p.projectName}>
                        {p.cleanName || p.projectName}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div>
                          <span className="text-[10px] block text-slate-400">รายรับ</span>
                          <span className="font-bold text-[#009540] font-mono">{formatCurrency(p.totalIncome)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] block text-slate-400">รายจ่าย</span>
                          <span className="font-bold text-rose-600 font-mono">{formatCurrency(p.totalExpense)}</span>
                        </div>
                      </div>

                      {/* Cost Ratio Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full ${
                            costRatio > 90 ? 'bg-rose-500' : costRatio > 75 ? 'bg-amber-500' : 'bg-[#009540]'
                          }`}
                          style={{ width: `${costRatio}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>ใช้ไป {costRatio}%</span>
                        <span className="font-bold text-[#005aa9] flex items-center gap-0.5">
                          เจาะลึก <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROJECT DEEP-DIVE (วิเคราะห์เจาะลึกรายโครงการ) */}
      {/* ========================================================================= */}
      {activeTab === 'deep_dive' && currentProjectStats && (
        <div className="space-y-3.5">
          {/* Project Selector & Navigation Header */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('matrix')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับสู่ตารางรวม</span>
              </button>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-bold text-slate-700">เลือกโครงการวิเคราะห์:</span>
            </div>

            <div className="w-full sm:w-96">
              <select
                value={currentProjectStats.projectName}
                onChange={(e) => setActiveProject(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#005aa9] cursor-pointer"
              >
                {projectSummaries.map(p => (
                  <option key={p.projectName} value={p.projectName}>
                    [{p.code}] {p.cleanName || p.projectName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Details Banner (Clean High-Contrast Light Theme) */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-blue-200 shadow-xs bg-linear-to-br from-white via-blue-50/30 to-slate-50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-black bg-[#005aa9] text-white shadow-2xs">
                    รหัสโครงการ {currentProjectStats.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    บันทึกแล้ว {currentProjectStats.transactionCount} รายการ
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {currentProjectStats.projectName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  สถานะโครงการ: สัญญาลงนามก่อสร้างและมีการเบิกจ่ายต่อเนื่อง
                </p>
              </div>

              {/* 3 Metric Badges for this project */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs shrink-0">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] text-emerald-800 font-bold block">ค่างวดงาน / รายรับ</span>
                  <span className="text-sm sm:text-base font-bold text-[#009540] font-mono">
                    {formatCurrency(currentProjectStats.totalIncome)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-rose-200 shadow-2xs">
                  <span className="text-[10px] text-rose-800 font-bold block">ต้นทุน & ค่าใช้จ่าย</span>
                  <span className="text-sm sm:text-base font-bold text-rose-600 font-mono">
                    {formatCurrency(currentProjectStats.totalExpense)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-200 shadow-2xs">
                  <span className="text-[10px] text-blue-900 font-bold block">ผลต่างกระแสเงินสด</span>
                  <span className={`text-sm sm:text-base font-bold font-mono ${
                    currentProjectStats.netMargin >= 0 ? 'text-[#005aa9]' : 'text-amber-600'
                  }`}>
                    {formatCurrency(currentProjectStats.netMargin)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Cost Breakdown Chart & Major Subcontractors */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-3.5">
            
            {/* Cost Categories Bar Chart */}
            <div className="lg:col-span-2 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    การกระจายตัวของหมวดหมู่ต้นทุนในโครงการ
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    จำแนกตามงานโครงสร้างสะพาน, คอนกรีต/เหล็ก, ค่าน้ำมัน และงานผู้รับเหมาช่วง
                  </p>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full mt-2">
                {costChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    ยังไม่มีข้อมูลการจำแนกหมวดหมู่
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costChartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#f1f5f9" />
                      <XAxis 
                        type="number" 
                        tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={130}
                        tick={{ fontSize: 10, fill: '#334155' }}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${formatCurrency(Number(value))}`, 'ยอดค่าใช้จ่าย']}
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '11px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                        {costChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Major Suppliers & Subcontractors in this project */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">
                คู่ค้าและผู้รับเหมาหลัก (Top Payees)
              </h4>
              <p className="text-[11px] text-slate-500 mb-2.5">
                ผู้รับจ้างช่วงและผู้จัดหาวัสดุมูลค่าสูงสุดในโครงการ
              </p>

              <div className="space-y-2 overflow-y-auto max-h-72 pr-1 text-xs flex-1">
                {supplierSummary.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">ไม่มีข้อมูลคู่ค้า</p>
                ) : (
                  supplierSummary.map((s, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100/80 transition-colors">
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-slate-900 block truncate text-xs" title={s.name}>
                          {s.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {s.count} รายการบิล
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 font-mono shrink-0 text-xs">
                        {formatCurrency(s.total)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Project Specific Ledger Table with Filters */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  สมุดบัญชีรายรับ-รายจ่ายโครงการ ({filteredProjectTransactions.length} รายการ)
                </h4>
                <p className="text-[11px] text-slate-500">
                  รายการบัญชีที่ผูกกับ {currentProjectStats.cleanName} (เรียงจากใหม่ไปเก่า)
                </p>
              </div>

              {/* In-table Filter Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={txSearchQuery}
                    onChange={(e) => setTxSearchQuery(e.target.value)}
                    placeholder="ค้นหาบิล/รายละเอียด..."
                    className="w-full pl-7 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005aa9] bg-white"
                  />
                </div>

                <select
                  value={selectedTxCategory}
                  onChange={(e) => setSelectedTxCategory(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-[#005aa9] cursor-pointer"
                >
                  <option value="all">ทุกหมวดหมู่ ({projectCategories.length})</option>
                  {projectCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
                    <th className="py-2 px-2.5">วันที่</th>
                    <th className="py-2 px-2.5">เลขที่เอกสาร</th>
                    <th className="py-2 px-2.5">รายละเอียดรายการ</th>
                    <th className="py-2 px-2.5">หมวดหมู่บัญชี</th>
                    <th className="py-2 px-2.5 text-right">รายรับ (Dr.)</th>
                    <th className="py-2 px-2.5 text-right">รายจ่าย (Cr.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredProjectTransactions.slice(0, txLimit).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-1.5 px-2.5 whitespace-nowrap font-medium text-slate-900">{tx.date}</td>
                      <td className="py-1.5 px-2.5 whitespace-nowrap font-mono text-slate-600">{tx.docNo || '-'}</td>
                      <td className="py-1.5 px-2.5 max-w-sm">
                        <div className="font-medium text-slate-800">{tx.description}</div>
                        {tx.remarks && <div className="text-[10px] text-slate-400">{tx.remarks}</div>}
                      </td>
                      <td className="py-1.5 px-2.5 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-medium">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-bold text-[#009540] whitespace-nowrap font-mono">
                        {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-bold text-rose-600 whitespace-nowrap font-mono">
                        {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                      </td>
                    </tr>
                  ))}
                  {filteredProjectTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                        ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination / Load more if transactions exceed limit */}
            {filteredProjectTransactions.length > txLimit && (
              <div className="mt-3 text-center">
                <button
                  onClick={() => setTxLimit(prev => prev + 50)}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#005aa9] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                >
                  แสดงรายการเพิ่มเติม (กำลังแสดง {txLimit} จาก {filteredProjectTransactions.length} รายการ)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

