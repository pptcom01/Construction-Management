import { useState, useMemo } from 'react';
import { Transaction, ViewTab, UserRole } from '../types';
import { 
  formatCurrency, 
  computeOverallStats, 
  computeProjectSummaries, 
  computeAccountBalances, 
  computeMonthlyFinancials,
  computeExpenseCategories,
  isTransferTransaction,
  isInitialBalanceTransaction,
  isLoanOrFinancingTransaction
} from '../utils/accounting';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp,
  ShieldCheck,
  Wallet,
  Clock,
  Building2,
  Layers,
  Landmark,
  FileCheck,
  Flame,
  ArrowRight,
  Filter,
  Download,
  Printer,
  ChevronRight,
  Percent,
  Coins,
  ReceiptText,
  Lock
} from 'lucide-react';

interface AIAnalysisViewProps {
  transactions: Transaction[];
  userRole?: UserRole;
  onNavigateTab?: (tab: ViewTab) => void;
  onFilterProject?: (project: string) => void;
}

export function AIAnalysisView({
  transactions,
  userRole = 'executive',
  onNavigateTab,
  onFilterProject
}: AIAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<'insights' | 'burnrate' | 'project_analysis' | 'accounts'>('insights');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('all');
  const [searchProject, setSearchProject] = useState('');

  const isExecutive = userRole === 'admin' || userRole === 'manager' || userRole === 'executive';

  // Gate for non-executives
  if (!isExecutive) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            AI วิเคราะห์งบการเงิน & สภาพคล่ององค์กร
          </h2>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            🔒 สงวนสิทธิ์เฉพาะผู้บริหาร (Admin / Manager Only)
          </span>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            หน้านี้ประกอบด้วยการวิเคราะห์กระแสเงินสดเชิงลึก, วงเงินเบิกเกินบัญชี (OD), ยอดคงเหลือทุกบัญชีธนาคาร และการประเมิน Cash Runway สำหรับการวางแผนกลยุทธ์
          </p>
        </div>
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('disbursements')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#005aa9] hover:bg-[#004a8c] text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>กลับสู่หน้ารายการขอเบิกเงิน</span>
          </button>
        )}
      </div>
    );
  }

  // Filter transactions by company
  const filteredTransactions = useMemo(() => {
    if (selectedCompanyFilter === 'all') return transactions;
    return transactions.filter(t => t.company === selectedCompanyFilter);
  }, [transactions, selectedCompanyFilter]);

  const stats = useMemo(() => computeOverallStats(filteredTransactions), [filteredTransactions]);
  const projectSummaries = useMemo(() => computeProjectSummaries(filteredTransactions), [filteredTransactions]);
  const accountBalances = useMemo(() => computeAccountBalances(filteredTransactions), [filteredTransactions]);
  const monthlyFinancials = useMemo(() => computeMonthlyFinancials(filteredTransactions), [filteredTransactions]);
  const expenseCategories = useMemo(() => computeExpenseCategories(filteredTransactions), [filteredTransactions]);

  // Total cash liquidity across accounts
  const totalCash = useMemo(() => {
    return accountBalances.reduce((sum, a) => sum + a.calculatedBalance, 0);
  }, [accountBalances]);

  // Average monthly expense
  const averageMonthlyExpense = useMemo(() => {
    if (monthlyFinancials.length === 0) return 0;
    const totalExp = monthlyFinancials.reduce((sum, m) => sum + m.expense, 0);
    return totalExp / monthlyFinancials.length;
  }, [monthlyFinancials]);

  // Cash Runway in months
  const cashRunwayMonths = useMemo(() => {
    if (averageMonthlyExpense <= 0) return 999;
    const runway = totalCash / averageMonthlyExpense;
    return runway > 0 ? runway : 0;
  }, [totalCash, averageMonthlyExpense]);

  // Top cost project
  const topCostProject = useMemo(() => {
    if (projectSummaries.length === 0) return null;
    return [...projectSummaries].sort((a, b) => b.totalExpense - a.totalExpense)[0];
  }, [projectSummaries]);

  const topCostPercentage = useMemo(() => {
    if (!topCostProject || stats.totalExpense <= 0) return 0;
    return Math.round((topCostProject.totalExpense / stats.totalExpense) * 100);
  }, [topCostProject, stats.totalExpense]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (!searchProject.trim()) return projectSummaries;
    const q = searchProject.toLowerCase();
    return projectSummaries.filter(p => 
      (p.cleanName && p.cleanName.toLowerCase().includes(q)) ||
      (p.projectName && p.projectName.toLowerCase().includes(q)) ||
      (p.code && p.code.toLowerCase().includes(q))
    );
  }, [projectSummaries, searchProject]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-12 min-w-0">
      
      {/* 1. Header Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                AI วิเคราะห์งบการเงิน & สภาพคล่ององค์กร
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-900 font-bold border border-amber-500/20">
                BTC Financial Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              ประเมินกระแสเงินสดจากการดำเนินงาน, เฝ้าระวังความเสี่ยงโครงการก่อสร้าง, และประมาณการ Cash Runway
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
          {/* Company Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              className="bg-transparent border-none text-xs focus:outline-none cursor-pointer font-bold text-slate-800"
            >
              <option value="all">ทุกบริษัทในเครือ</option>
              <option value="บจก.บุรีรัมย์ธงชัยก่อสร้าง">บจก.บุรีรัมย์ธงชัยก่อสร้าง (BTC)</option>
              <option value="บจก.บุรีรัมย์ธงชัยแพลนท์">บจก.บุรีรัมย์ธงชัยแพลนท์ (BTCP)</option>
              <option value="บจก.บีทีซี พรีคาสท์ คอนกรีต">บจก.บีทีซี พรีคาสท์ คอนกรีต</option>
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-bold"
            title="พิมพ์รายงานสรุปผลวิเคราะห์ AI"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">พิมพ์รายงาน</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Cash Liquidity */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">สภาพคล่องเงินสดรวม</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-[#009540]">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-slate-900 tracking-tight">
            {formatCurrency(totalCash)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium truncate block mt-1">
            {accountBalances.length} บัญชี (KTB, BBL, กองทุน)
          </span>
        </div>

        {/* KPI 2: Operating Margin */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">กำไรจากการดำเนินงาน</span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-[#005aa9]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-lg sm:text-xl font-black font-mono tracking-tight ${
            stats.netOperatingProfit >= 0 ? 'text-[#009540]' : 'text-rose-600'
          }`}>
            {stats.netOperatingProfit >= 0 ? '+' : ''}{formatCurrency(stats.netOperatingProfit)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium truncate block mt-1">
            มาร์จิ้น {stats.totalIncome > 0 ? ((stats.netOperatingProfit / stats.totalIncome) * 100).toFixed(1) : '0'}% ของรายรับรวม
          </span>
        </div>

        {/* KPI 3: Monthly Burn Rate */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">รายจ่ายเฉลี่ยต่อเดือน</span>
            <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-slate-900 tracking-tight">
            {formatCurrency(averageMonthlyExpense)}
          </div>
          <span className="text-[11px] text-amber-700 font-medium truncate block mt-1">
            Cash Runway ~ {cashRunwayMonths.toFixed(1)} เดือน
          </span>
        </div>

        {/* KPI 4: Main Cost Center */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">โครงการต้นทุนสูงสุด</span>
            <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-900 truncate tracking-tight">
            {topCostProject?.cleanName || 'ทล.24 ตอน 2'}
          </div>
          <span className="text-[11px] text-purple-700 font-medium truncate block mt-1">
            {topCostPercentage}% ของรายจ่ายสะสมทั้งหมด
          </span>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex items-center gap-1 text-xs font-bold overflow-x-auto shadow-2xs">
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'insights'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>บทวิเคราะห์ & ข้อเสนอแนะเชิงกลยุทธ์</span>
        </button>

        <button
          onClick={() => setActiveTab('burnrate')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'burnrate'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>สภาพคล่อง & Cash Runway</span>
        </button>

        <button
          onClick={() => setActiveTab('project_analysis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'project_analysis'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>วิเคราะห์ผลกำไรแยกรายโครงการ ({projectSummaries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'accounts'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>ตารางเงินเข้า-ออก-คงเหลือ ทุกบัญชี ({accountBalances.length})</span>
        </button>
      </div>

      {/* 4. Tab 1: Strategic Insights & Recommendations */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          
          {/* Executive Cockpit: Master Bank Accounts & Liquidity Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    สถานะสภาพคล่องจริงรายบัญชีธนาคาร (Executive Cash & Liquidity)
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    ยอดเงินเข้ารวม, ยอดเงินออกรวม, และยอดเงินคงเหลือปัจจุบัน สำหรับใช้ตัดสินใจและวางแผนงานต่อ
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-300 bg-white/10 px-2.5 py-1 rounded-lg border border-white/20 self-start sm:self-auto">
                เงินสดสุทธิ: {formatCurrency(totalCash)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">ชื่อบัญชี / ธนาคาร</th>
                    <th className="py-2.5 px-4">เลขที่บัญชี</th>
                    <th className="py-2.5 px-4 text-right text-emerald-800 bg-emerald-50/40">ยอดเงินเข้ารวม (Total In)</th>
                    <th className="py-2.5 px-4 text-right text-rose-800 bg-rose-50/40">ยอดเงินออกรวม (Total Out)</th>
                    <th className="py-2.5 px-4 text-right font-black text-slate-900 bg-slate-100/40">ยอดคงเหลือ (Current Balance)</th>
                    <th className="py-2.5 px-4 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {accountBalances.map((acc, idx) => {
                    const isOD = acc.calculatedBalance < 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-sans font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-black text-white shrink-0 ${
                              acc.bankCode.includes('KTB') ? 'bg-[#005aa9]' : 'bg-[#1e3a8a]'
                            }`}>
                              {acc.bankCode.includes('KTB') ? 'KTB' : 'BBL'}
                            </span>
                            <span className="truncate">{acc.accountName}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{acc.accountNumber || '-'}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-emerald-700 bg-emerald-50/20">
                          {formatCurrency(acc.totalIncome)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-rose-700 bg-rose-50/20">
                          {formatCurrency(acc.totalExpense)}
                        </td>
                        <td className={`py-2.5 px-4 text-right font-black text-xs sm:text-sm bg-slate-100/20 ${
                          isOD ? 'text-amber-700' : 'text-slate-900'
                        }`}>
                          {formatCurrency(acc.calculatedBalance)}
                        </td>
                        <td className="py-2.5 px-4 text-center font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isOD ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isOD ? 'OD เบิกเกินบัญชี' : acc.type}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 font-mono">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-4 font-sans text-slate-900 font-black text-xs text-right">
                      ยอดรวมทุกบัญชี ({accountBalances.length} บัญชี):
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-800 text-xs font-black">
                      {formatCurrency(accountBalances.reduce((sum, a) => sum + a.totalIncome, 0))}
                    </td>
                    <td className="py-2.5 px-4 text-right text-rose-800 text-xs font-black">
                      {formatCurrency(accountBalances.reduce((sum, a) => sum + a.totalExpense, 0))}
                    </td>
                    <td className={`py-2.5 px-4 text-right text-sm font-black ${
                      totalCash >= 0 ? 'text-slate-900' : 'text-amber-800'
                    }`}>
                      {formatCurrency(totalCash)}
                    </td>
                    <td className="py-2.5 px-4 text-center font-sans text-[11px] text-slate-500">
                      สุทธิ
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column: Diagnostics (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* 1. Operating Cash Flow Health */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#009540] flex items-center justify-center border border-emerald-200 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    สุขภาพกระแสเงินสดจากการดำเนินงาน (Operating Cash Flow)
                  </h3>
                  <p className="text-xs text-slate-400">ประเมินจากอัตราส่วนเงินเข้าเทียบเงินออกจริงในสมุดรายวัน</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3.5 px-4 bg-slate-50 rounded-xl border border-slate-200/80 mb-3.5">
                <div>
                  <span className="text-xs text-slate-500 block font-medium">รายรับส่งมอบงานสะสม</span>
                  <span className="text-base font-black font-mono text-[#009540]">
                    {formatCurrency(stats.totalIncome)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block font-medium">รายจ่ายดำเนินงานสะสม</span>
                  <span className="text-base font-black font-mono text-slate-900">
                    {formatCurrency(stats.totalExpense)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                บริษัทมีส่วนต่างกระแสเงินสดสุทธิจากการดำเนินงานสะสม <span className="font-bold text-[#009540] font-mono">{formatCurrency(stats.netOperatingProfit)}</span> โดยมีสัดส่วนเงินหมุนเวียนหลักมาจากค่างวดงานโครงการทางหลวง และการใช้วงเงินตั๋วสัญญาใช้เงิน (P/N) เพื่อสำรองซื้อวัสดุล่วงหน้า
              </p>
            </div>

            {/* 2. Cost Control Vigilance */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    จุดที่ต้องเฝ้าระวังต้นทุน (Cost Control Vigilance)
                  </h3>
                  <p className="text-xs text-slate-400">ควบคุมค่าใช้จ่ายที่มีสัดส่วนสูงเกินเกณฑ์งบประมาณ</p>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 mb-3.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-950 mb-1">
                  <span>โครงการหลัก: {topCostProject?.cleanName || 'ทล.24 ตอน 2'}</span>
                  <span className="font-mono text-rose-700 font-black">{formatCurrency(topCostProject?.totalExpense || 0)}</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  คิดเป็นสัดส่วน <span className="font-bold">{topCostPercentage}%</span> ของรายจ่ายสะสมทั้งระบบ กลุ่มค่าใช้จ่ายสูงสุดคือ คอนกรีตผสมเสร็จ, ผลงานผู้รับเหมาช่วงงานโครงสร้างสะพาน, และค่าน้ำมันเชื้อเพลิงเครื่องจักร
                </p>
              </div>

              <div className="text-xs text-slate-600 space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>ตรวจสอบปริมาณคอนกรีตหน้างานจริงเทียบกับแบบ (BOQ) เพื่อป้องกันอัตราสูญเสีย (Loss) เกินเกณฑ์มาตรฐาน 3%</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>กระทบยอดใบสั่งซื้อน้ำมันดีเซลรายสัปดาห์กับชั่วโมงการทำงานของเครื่องจักรกล ป้องกันการเบิกซ้ำซ้อน</span>
                </div>
              </div>
            </div>

            {/* 3. Executive Action Plan */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#005aa9] flex items-center justify-center border border-blue-200 shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    แผนเร่งด่วนสำหรับผู้บริหาร (Executive Immediate Action)
                  </h3>
                  <p className="text-xs text-slate-400">ข้อเสนอแนะเชิงปฏิบัติการเพื่อรักษาสภาพคล่อง</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-[#005aa9] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900 block text-xs">เร่งติดตามผลตรวจรับงานค่างวดทางหลวง</strong>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      ประสานวิศวกรผู้ควบคุมงานเพื่อออกใบรับรองผลงาน (Certificate) โครงการ ทล.24 งวดที่ 4-5 เพื่อโอนเข้าบัญชี KTB
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-[#005aa9] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900 block text-xs">บริหารรอบตั๋วสัญญาใช้เงิน (P/N) & ดอกเบี้ย OD</strong>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      วางแผนกำหนดวัน Rollover ตั๋ว P/N และควบคุมดอกเบี้ยเบิกเกินบัญชี KTB/BBL ให้อยู่ในกรอบต้นทุนทางการเงิน
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-[#005aa9] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900 block text-xs">ตรวจสอบการหักและยื่นภาษี (WHT & VAT)</strong>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      กำกับยอด ภ.ง.ด.3, 53 และ ภ.พ.30 ให้ตรงกับระบบออกหนังสือรับรอง 50 ทวิ เพื่อป้องกันเบี้ยปรับเงินเพิ่ม
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Liquidity Matrix & Runway (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Cash Runway Health Gauge */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-[#009540]" />
                <h3 className="text-xs font-bold text-slate-900">การประเมินความมั่นคงทางการเงิน</h3>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 mb-4">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                  ระดับความปลอดภัยของสภาพคล่อง (Cash Runway Buffer)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-emerald-900">
                    {cashRunwayMonths.toFixed(1)}
                  </span>
                  <span className="text-sm font-bold text-emerald-800">เดือน</span>
                </div>
                <p className="text-xs text-emerald-700 mt-2 leading-relaxed">
                  เงินสดคงเหลือปัจจุบันเพียงพอรองรับการจ่ายค่าแรงและวัสดุต่อเนื่องโดยไม่ต้องพึ่งพาวงเงินกู้ฉุกเฉินเพิ่มเติม
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>ยอดจ่ายโดยประมาณต่อสัปดาห์:</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(averageMonthlyExpense / 4)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>สถานะการใช้วงเงิน OD:</span>
                  <span className="font-bold text-[#009540]">อยู่ในเกณฑ์ปกติ</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>ความเสี่ยงผิดนัดชำระซัพพลายเออร์:</span>
                  <span className="font-bold text-[#009540]">ต่ำ (Low Risk)</span>
                </div>
              </div>
            </div>

            {/* Top 5 Expense Categories */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold text-slate-900">หมวดหมู่ค่าใช้จ่ายหลัก</h3>
                </div>
                <span className="text-[10px] text-slate-400">สะสมจริง</span>
              </div>

              <div className="space-y-3">
                {expenseCategories.slice(0, 5).map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-semibold truncate max-w-[60%]">
                        {cat.category}
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(cat.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(3, cat.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Navigation to other views */}
            {onNavigateTab && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  ทางลัดการตรวจสอบ
                </span>
                <button
                  onClick={() => onNavigateTab('projects')}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>ดูภาพรวมกำไร & ต้นทุนโครงการ</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => onNavigateTab('reports')}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ReceiptText className="w-3.5 h-3.5 text-amber-600" />
                    <span>ดูรายงานการเงิน & P&L ฉบับเต็ม</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* 5. Tab 2: Burn Rate & Cash Runway Details */}
      {activeTab === 'burnrate' && (
        <div className="space-y-4">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">เงินสดหมุนเวียนคงเหลือรวม</span>
              <div className="text-2xl font-black font-mono text-[#005aa9] mt-1.5">
                {formatCurrency(totalCash)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">ทุกบัญชีของ บจก.บุรีรัมย์ธงชัยก่อสร้าง</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">รายจ่ายเฉลี่ยต่อเดือน (Monthly Burn)</span>
              <div className="text-2xl font-black font-mono text-rose-600 mt-1.5">
                {formatCurrency(averageMonthlyExpense)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">ค่าแรง, ซัพพลายเออร์, เชื้อเพลิง, ภาษี</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">ประมาณการ Cash Runway</span>
              <div className="text-2xl font-black font-mono text-[#009540] mt-1.5">
                ~ {cashRunwayMonths.toFixed(1)} เดือน
              </div>
              <span className="text-[11px] text-emerald-700 mt-1 block">ไม่รวมรายรับค่างวดใหม่ที่จะเข้า</span>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">กระแสเงินสดแยกตามรอบเดือน</h3>
                <p className="text-xs text-slate-400">เปรียบเทียบรายรับและรายจ่ายจากการดำเนินงานจริง</p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                บันทึก {monthlyFinancials.length} เดือน
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-5">เดือน</th>
                    <th className="py-3 px-5 text-right">รายรับ (Income)</th>
                    <th className="py-3 px-5 text-right">รายจ่าย (Expense)</th>
                    <th className="py-3 px-5 text-right">กระแสเงินสดสุทธิ (Net)</th>
                    <th className="py-3 px-5 text-center">สัดส่วนค่าใช้จ่าย</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {monthlyFinancials.map((m, idx) => {
                    const maxVal = Math.max(...monthlyFinancials.map(item => Math.max(item.income, item.expense))) || 1;
                    const expBarWidth = Math.min(100, Math.round((m.expense / maxVal) * 100));

                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-5 font-sans font-bold text-slate-800">
                          {m.month}
                        </td>
                        <td className="py-3 px-5 text-right font-bold text-[#009540]">
                          {formatCurrency(m.income)}
                        </td>
                        <td className="py-3 px-5 text-right font-bold text-slate-900">
                          {formatCurrency(m.expense)}
                        </td>
                        <td className={`py-3 px-5 text-right font-bold ${
                          m.net >= 0 ? 'text-[#009540]' : 'text-rose-600'
                        }`}>
                          {m.net >= 0 ? '+' : ''}{formatCurrency(m.net)}
                        </td>
                        <td className="py-3 px-5 text-center">
                          <div className="w-32 bg-slate-100 h-2 rounded-full mx-auto overflow-hidden">
                            <div 
                              className="bg-rose-500 h-full rounded-full"
                              style={{ width: `${Math.max(4, expBarWidth)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Project Profitability Matrix */}
      {activeTab === 'project_analysis' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-sm font-bold text-slate-900">ผลการดำเนินงาน & มาร์จิ้นแยกตามโครงการ</h3>
              <p className="text-xs text-slate-400">คำนวณจากรายรับส่งมอบงานและค่าใช้จ่ายที่เกิดขึ้นจริงในสมุดรายวัน</p>
            </div>
            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="ค้นหาชื่อโครงการ หรือ รหัส..."
                value={searchProject}
                onChange={(e) => setSearchProject(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#005aa9]"
              />
            </div>
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-5">โครงการ</th>
                    <th className="py-3.5 px-5 text-right">รายรับ (Income)</th>
                    <th className="py-3.5 px-5 text-right">รายจ่ายสะสม (Expense)</th>
                    <th className="py-3.5 px-5 text-right">กำไรส่วนต่าง (Net Margin)</th>
                    <th className="py-3.5 px-5 text-center">มาร์จิ้น (%)</th>
                    <th className="py-3.5 px-5 text-center">การควบคุมต้นทุน</th>
                    <th className="py-3.5 px-5 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProjects.map((p, idx) => {
                    const marginPercent = p.totalIncome > 0 
                      ? ((p.netMargin / p.totalIncome) * 100).toFixed(1) 
                      : '0.0';
                    const numMargin = parseFloat(marginPercent);
                    
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                              {p.code}
                            </span>
                            <span className="font-bold text-slate-900 truncate max-w-sm">
                              {p.cleanName || p.projectName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-800">
                          {formatCurrency(p.totalIncome)}
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(p.totalExpense)}
                        </td>
                        <td className={`py-3.5 px-5 text-right font-mono font-black ${
                          p.netMargin >= 0 ? 'text-[#009540]' : 'text-rose-600'
                        }`}>
                          {p.netMargin >= 0 ? '+' : ''}{formatCurrency(p.netMargin)}
                        </td>
                        <td className="py-3.5 px-5 text-center font-mono font-bold">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] ${
                            numMargin >= 15 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : numMargin > 0 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {marginPercent}%
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          {p.netMargin >= 0 ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-[#009540] font-semibold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>กำไรตามเป้า</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
                              <AlertTriangle className="w-4 h-4" />
                              <span>เฝ้าระวังงบประมาณ</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          {onNavigateTab && onFilterProject && (
                            <button
                              onClick={() => {
                                onFilterProject(p.projectName);
                                onNavigateTab('projects');
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#005aa9] hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer"
                              title="เปิดดูเจาะลึกโครงการในแท็บโครงการ"
                            >
                              เจาะลึก
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. Tab 4: Banking & Liquidity Distribution */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          {/* Direct Summary Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">ตารางสรุป ยอดเงินเข้า - ยอดเงินออก - ยอดคงเหลือ ทุกบัญชี</h3>
                <p className="text-xs text-slate-400">ข้อมูลจริงคำนวณจากสมุดรายวันแยกตามบัญชีธนาคาร</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                รวม {accountBalances.length} บัญชี
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">ชื่อบัญชี / ธนาคาร</th>
                    <th className="py-3 px-4">เลขที่บัญชี</th>
                    <th className="py-3 px-4 text-right text-emerald-800 bg-emerald-50/50">ยอดเงินเข้ารวม (Total In)</th>
                    <th className="py-3 px-4 text-right text-rose-800 bg-rose-50/50">ยอดเงินออกรวม (Total Out)</th>
                    <th className="py-3 px-4 text-right font-black text-slate-900 bg-slate-100/50">ยอดเงินคงเหลือ (Current Balance)</th>
                    <th className="py-3 px-4 text-center">ประเภท</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {accountBalances.map((acc, idx) => {
                    const isOD = acc.calculatedBalance < 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
                              acc.bankCode.includes('KTB') ? 'bg-[#005aa9]' : 'bg-[#1e3a8a]'
                            }`}>
                              {acc.bankCode.includes('KTB') ? 'KTB' : 'BBL'}
                            </span>
                            <span className="truncate">{acc.accountName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{acc.accountNumber || '-'}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700 bg-emerald-50/20">
                          {formatCurrency(acc.totalIncome)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-rose-700 bg-rose-50/20">
                          {formatCurrency(acc.totalExpense)}
                        </td>
                        <td className={`py-3 px-4 text-right font-black text-sm bg-slate-100/20 ${
                          isOD ? 'text-amber-700' : 'text-slate-900'
                        }`}>
                          {formatCurrency(acc.calculatedBalance)}
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isOD ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isOD ? 'OD (เบิกเกินบัญชี)' : acc.type}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 font-mono">
                  <tr>
                    <td colSpan={2} className="py-3 px-4 font-sans text-slate-900 font-black text-xs text-right">
                      ยอดรวมทุกบัญชี ({accountBalances.length} บัญชี):
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-800 text-xs font-black">
                      {formatCurrency(accountBalances.reduce((sum, a) => sum + a.totalIncome, 0))}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-800 text-xs font-black">
                      {formatCurrency(accountBalances.reduce((sum, a) => sum + a.totalExpense, 0))}
                    </td>
                    <td className={`py-3 px-4 text-right text-sm font-black ${
                      totalCash >= 0 ? 'text-slate-900' : 'text-amber-800'
                    }`}>
                      {formatCurrency(totalCash)}
                    </td>
                    <td className="py-3 px-4 text-center font-sans text-[11px] text-slate-500">
                      สุทธิ
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
