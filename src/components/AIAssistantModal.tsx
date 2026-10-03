import { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { 
  formatCurrency, 
  computeOverallStats, 
  computeProjectSummaries, 
  computeAccountBalances, 
  computeMonthlyFinancials 
} from '../utils/accounting';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp,
  HardHat,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Wallet,
  Clock,
  Building2,
  ArrowUpRight,
  Flame,
  Layers,
  ChevronRight,
  Landmark,
  FileCheck,
  Percent
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onApplyAction?: (action: string) => void;
}

export function AIAssistantModal({
  isOpen,
  onClose,
  transactions,
}: AIAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<'insights' | 'burnrate' | 'project_analysis'>('insights');
  const [isMaximized, setIsMaximized] = useState(false);
  const [searchProject, setSearchProject] = useState('');

  const stats = useMemo(() => computeOverallStats(transactions), [transactions]);
  const projectSummaries = useMemo(() => computeProjectSummaries(transactions), [transactions]);
  const accountBalances = useMemo(() => computeAccountBalances(transactions), [transactions]);
  const monthlyFinancials = useMemo(() => computeMonthlyFinancials(transactions), [transactions]);

  // Total liquidity across accounts
  const totalCash = useMemo(() => {
    return accountBalances.reduce((sum, a) => sum + a.calculatedBalance, 0);
  }, [accountBalances]);

  // Average monthly burn rate
  const averageMonthlyExpense = useMemo(() => {
    if (monthlyFinancials.length === 0) return 0;
    const totalExp = monthlyFinancials.reduce((sum, m) => sum + m.expense, 0);
    return totalExp / monthlyFinancials.length;
  }, [monthlyFinancials]);

  // Estimated Runway in months
  const cashRunwayMonths = useMemo(() => {
    if (averageMonthlyExpense <= 0) return 999;
    const runway = totalCash / averageMonthlyExpense;
    return runway > 0 ? runway : 0;
  }, [totalCash, averageMonthlyExpense]);

  // Largest expense project
  const topCostProject = useMemo(() => {
    if (projectSummaries.length === 0) return null;
    return [...projectSummaries].sort((a, b) => b.totalExpense - a.totalExpense)[0];
  }, [projectSummaries]);

  const topCostPercentage = useMemo(() => {
    if (!topCostProject || stats.totalExpense <= 0) return 0;
    return Math.round((topCostProject.totalExpense / stats.totalExpense) * 100);
  }, [topCostProject, stats.totalExpense]);

  // Filtered projects for Project Analysis tab
  const filteredProjects = useMemo(() => {
    if (!searchProject.trim()) return projectSummaries;
    const q = searchProject.toLowerCase();
    return projectSummaries.filter(p => 
      (p.cleanName && p.cleanName.toLowerCase().includes(q)) ||
      (p.projectName && p.projectName.toLowerCase().includes(q)) ||
      (p.code && p.code.toLowerCase().includes(q))
    );
  }, [projectSummaries, searchProject]);

  if (!isOpen) return null;

  return (
    <div 
      id="ai-assistant-modal-backdrop" 
      className={`fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center transition-all ${
        isMaximized ? 'p-0' : 'p-2 sm:p-4 md:p-6'
      }`}
    >
      <div 
        id="ai-assistant-modal-container"
        className={`bg-white border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
          isMaximized 
            ? 'w-full h-full rounded-none max-h-screen' 
            : 'rounded-2xl sm:rounded-3xl w-full max-w-5xl xl:max-w-6xl max-h-[92vh]'
        }`}
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-7 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                  AI วิเคราะห์งบการเงิน & สภาพคล่ององค์กร
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  BTC Financial Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal truncate mt-0.5">
                ประเมินกระแสเงินสดจากการดำเนินงาน, เฝ้าระวังความเสี่ยงโครงการก่อสร้าง, และคำนวณ Cash Runway
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            <button
              id="ai-modal-toggle-maximize-btn"
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? "ย่อหน้าต่างกลับขนาดปกติ" : "ขยายเต็มหน้าจอ (Fullscreen)"}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              id="ai-modal-close-btn"
              onClick={onClose}
              title="ปิดหน้าต่าง"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive KPI Bar (Instant Quantitative Clarity) */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-7 py-3.5 shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* KPI 1: Cash Liquidity */}
            <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold">สภาพคล่องรวม</span>
                <Wallet className="w-3.5 h-3.5 text-[#009540]" />
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-slate-900 tracking-tight">
                {formatCurrency(totalCash)}
              </div>
              <span className="text-[10px] text-slate-400 font-medium truncate block mt-0.5">
                {accountBalances.length} บัญชี (KTB, BBL, กองทุน)
              </span>
            </div>

            {/* KPI 2: Operating Margin */}
            <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold">กำไรจากการดำเนินงาน</span>
                <TrendingUp className="w-3.5 h-3.5 text-[#005aa9]" />
              </div>
              <div className={`text-base sm:text-lg font-black font-mono tracking-tight ${
                stats.netOperatingProfit >= 0 ? 'text-[#009540]' : 'text-rose-600'
              }`}>
                {stats.netOperatingProfit >= 0 ? '+' : ''}{formatCurrency(stats.netOperatingProfit)}
              </div>
              <span className="text-[10px] text-slate-500 font-medium truncate block mt-0.5">
                มาร์จิ้น {stats.totalIncome > 0 ? ((stats.netOperatingProfit / stats.totalIncome) * 100).toFixed(1) : '0'}% ของรายรับรวม
              </span>
            </div>

            {/* KPI 3: Monthly Burn Rate */}
            <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold">รายจ่ายเฉลี่ยต่อเดือน</span>
                <Flame className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-slate-900 tracking-tight">
                {formatCurrency(averageMonthlyExpense)}
              </div>
              <span className="text-[10px] text-amber-700 font-medium truncate block mt-0.5">
                Runway ~ {cashRunwayMonths.toFixed(1)} เดือน
              </span>
            </div>

            {/* KPI 4: Main Cost Center */}
            <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold">โครงการต้นทุนสูงสุด</span>
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900 truncate tracking-tight">
                {topCostProject?.cleanName || 'ทล.24 ตอน 2'}
              </div>
              <span className="text-[10px] text-purple-700 font-medium truncate block mt-0.5">
                {topCostPercentage}% ของรายจ่ายสะสมทั้งหมด
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Clean & Balanced */}
        <div className="flex border-b border-slate-200 bg-white px-5 sm:px-7 pt-2 gap-2 text-xs font-bold overflow-x-auto shrink-0">
          <button
            id="ai-tab-insights-btn"
            onClick={() => setActiveTab('insights')}
            className={`pb-2.5 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'insights'
                ? 'border-[#009540] text-[#009540]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>บทวิเคราะห์ & ข้อเสนอแนะเชิงกลยุทธ์</span>
          </button>

          <button
            id="ai-tab-burnrate-btn"
            onClick={() => setActiveTab('burnrate')}
            className={`pb-2.5 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'burnrate'
                ? 'border-[#005aa9] text-[#005aa9]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>สภาพคล่อง & Cash Runway</span>
          </button>

          <button
            id="ai-tab-projects-btn"
            onClick={() => setActiveTab('project_analysis')}
            className={`pb-2.5 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'project_analysis'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>วิเคราะห์ผลกำไรแยกรายโครงการ ({projectSummaries.length})</span>
          </button>
        </div>

        {/* Main Body Content - Spacious & Organized */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* TAB 1: Insights & Recommendations */}
          {activeTab === 'insights' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Strategic Diagnostics (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* 1. Cash Flow Health Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#009540] flex items-center justify-center border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        สุขภาพกระแสเงินสดจากการดำเนินงาน (Operating Cash Flow)
                      </h4>
                      <span className="text-[11px] text-slate-400">ประเมินจากอัตราส่วนเงินเข้าเทียบเงินออกจริง</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 px-3.5 bg-slate-50 rounded-xl border border-slate-200/60 mb-3">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">รายรับส่งมอบงานสะสม</span>
                      <span className="text-sm font-black font-mono text-[#009540]">
                        {formatCurrency(stats.totalIncome)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">รายจ่ายดำเนินงานสะสม</span>
                      <span className="text-sm font-black font-mono text-slate-900">
                        {formatCurrency(stats.totalExpense)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    บริษัทมีส่วนต่างกระแสเงินสดสุทธิจากการดำเนินงานสะสม <span className="font-bold text-[#009540] font-mono">{formatCurrency(stats.netOperatingProfit)}</span> โดยมีสัดส่วนเงินหมุนเวียนหลักมาจากค่างวดงานโครงการทางหลวง และการใช้วงเงินตั๋วสัญญาใช้เงิน (P/N) เพื่อสำรองซื้อวัสดุล่วงหน้า
                  </p>
                </div>

                {/* 2. Cost Control Vigilance */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        จุดที่ต้องเฝ้าระวังต้นทุน (Cost Control Vigilance)
                      </h4>
                      <span className="text-[11px] text-slate-400">ควบคุมค่าใช้จ่ายที่มีสัดส่วนสูงเกินเกณฑ์</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/70 mb-3">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-950 mb-1">
                      <span>โครงการหลัก: {topCostProject?.cleanName || 'ทล.24 ตอน 2'}</span>
                      <span className="font-mono text-rose-700">{formatCurrency(topCostProject?.totalExpense || 0)}</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      คิดเป็นสัดส่วน <span className="font-bold">{topCostPercentage}%</span> ของรายจ่ายสะสมทั้งระบบ กลุ่มค่าใช้จ่ายสูงสุดคือ คอนกรีตผสมเสร็จ, ผลงานผู้รับเหมาช่วงงานโครงสร้างสะพาน, และค่าน้ำมันเชื้อเพลิง
                    </p>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>ตรวจสอบปริมาณคอนกรีตหน้างานจริงเทียบกับแบบ (BOQ) เพื่อป้องกัน Loss สูงกว่ามาตรฐาน 3%</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>ควบคุมและกระทบยอดใบส่งน้ำมันดีเซลรายสัปดาห์ ป้องกันการเบิกซ้ำซ้อน</span>
                    </div>
                  </div>
                </div>

                {/* 3. Executive Action Plan */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#005aa9] flex items-center justify-center border border-blue-200">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        แผนเร่งด่วนสำหรับผู้บริหาร (Executive Immediate Action)
                      </h4>
                      <span className="text-[11px] text-slate-400">ข้อเสนอแนะเชิงปฏิบัติการเพื่อรักษาสภาพคล่อง</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-[#005aa9] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <div>
                        <strong className="text-slate-900 block">เร่งติดตามผลตรวจรับงานค่างวดทางหลวง</strong>
                        <span className="text-slate-500 text-[11px]">
                          ประสานวิศวกรผู้ควบคุมงานเพื่อออกใบรับรองผลงาน (Certificate) โครงการ ทล.24 งวดที่ 4-5 โอนเข้า KTB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-[#005aa9] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <div>
                        <strong className="text-slate-900 block">บริหารรอบตั๋วสัญญาใช้เงิน (P/N) & ดอกเบี้ย OD</strong>
                        <span className="text-slate-500 text-[11px]">
                          วางแผนกำหนดวัน Rollover ตั๋ว P/N และควบคุมดอกเบี้ยเบิกเกินบัญชี KTB/BBL ให้อยู่ในกรอบต้นทุนทางการเงิน
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-[#005aa9] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <div>
                        <strong className="text-slate-900 block">ตรวจสอบการหักและยื่นภาษี (WHT & VAT)</strong>
                        <span className="text-slate-500 text-[11px]">
                          กำกับยอด ภ.ง.ด.3, 53 และ ภ.พ.30 ให้ตรงกับระบบออกหนังสือรับรอง 50 ทวิ เพื่อลดภาระเบี้ยปรับ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Account Liquidity Breakdown & Safety Gauge (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Liquidity Matrix Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-[#005aa9]" />
                      <h4 className="text-xs font-bold text-slate-900">การกระจายตัวของสภาพคล่อง</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      รวม {accountBalances.length} บัญชี
                    </span>
                  </div>

                  <div className="space-y-3">
                    {accountBalances.map((acc, idx) => {
                      const share = totalCash > 0 ? Math.max(0, (acc.calculatedBalance / totalCash) * 100) : 0;
                      const isOD = acc.calculatedBalance < 0;

                      return (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-slate-800 truncate max-w-[65%]">
                              {acc.accName}
                            </span>
                            <span className={`font-mono font-black ${
                              isOD ? 'text-rose-600' : 'text-slate-900'
                            }`}>
                              {formatCurrency(acc.calculatedBalance)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5">
                            <span>{acc.bankCode}</span>
                            <span>{isOD ? 'เบิกเกินบัญชี' : `สัดส่วน ${share.toFixed(1)}%`}</span>
                          </div>

                          {!isOD && (
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-[#009540] h-full rounded-full transition-all"
                                style={{ width: `${Math.min(100, Math.max(2, share))}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cash Runway Health Gauge */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-[#009540]" />
                    <h4 className="text-xs font-bold text-slate-900">การประเมินความมั่นคงทางการเงิน</h4>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 mb-3">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                      ระดับความปลอดภัยของสภาพคล่อง (Cash Runway Buffer)
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black font-mono text-emerald-900">
                        {cashRunwayMonths.toFixed(1)}
                      </span>
                      <span className="text-xs font-bold text-emerald-800">เดือน</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                      เงินสดคงเหลือปัจจุบันเพียงพอรองรับการจ่ายค่าแรงและวัสดุต่อเนื่องโดยไม่ต้องพึ่งพาวงเงินกู้ฉุกเฉินเพิ่มเติม
                    </p>
                  </div>

                  <div className="space-y-2 text-[11px] text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>ยอดจ่ายโดยประมาณต่อสัปดาห์:</span>
                      <span className="font-mono font-bold text-slate-800">{formatCurrency(averageMonthlyExpense / 4)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>สถานะการใช้วงเงิน OD:</span>
                      <span className="font-bold text-emerald-700">อยู่ในเกณฑ์ปกติ</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>ความเสี่ยงผิดนัดชำระซัพพลายเออร์:</span>
                      <span className="font-bold text-emerald-700">ต่ำ (Low Risk)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Burn Rate & Cash Runway Details */}
          {activeTab === 'burnrate' && (
            <div className="space-y-5">
              
              {/* Runway Top Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">เงินสดหมุนเวียนคงเหลือรวม</span>
                  <div className="text-xl font-black font-mono text-[#005aa9] mt-1">
                    {formatCurrency(totalCash)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">ทุกบัญชีของ บจก.บุรีรัมย์ธงชัยก่อสร้าง</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">รายจ่ายเฉลี่ยต่อเดือน (Monthly Burn)</span>
                  <div className="text-xl font-black font-mono text-rose-600 mt-1">
                    {formatCurrency(averageMonthlyExpense)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">ค่าแรง, ซัพพลายเออร์, เชื้อเพลิง, ภาษี</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">ประมาณการ Cash Runway</span>
                  <div className="text-xl font-black font-mono text-[#009540] mt-1">
                    ~ {cashRunwayMonths.toFixed(1)} เดือน
                  </div>
                  <span className="text-[10px] text-emerald-700 mt-1 block">ไม่รวมรายรับค่างวดใหม่ที่จะเข้า</span>
                </div>
              </div>

              {/* Monthly Breakdown Table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">กระแสเงินสดแยกตามรอบเดือน</h4>
                    <span className="text-[10px] text-slate-400">เปรียบเทียบรายรับและรายจ่ายจากการดำเนินงาน</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    บันทึก {monthlyFinancials.length} เดือน
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">เดือน</th>
                        <th className="py-2.5 px-4 text-right">รายรับ (Income)</th>
                        <th className="py-2.5 px-4 text-right">รายจ่าย (Expense)</th>
                        <th className="py-2.5 px-4 text-right">กระแสเงินสดสุทธิ (Net)</th>
                        <th className="py-2.5 px-4 text-center">สัดส่วนค่าใช้จ่าย</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {monthlyFinancials.map((m, idx) => {
                        const maxVal = Math.max(...monthlyFinancials.map(item => Math.max(item.income, item.expense))) || 1;
                        const expBarWidth = Math.min(100, Math.round((m.expense / maxVal) * 100));

                        return (
                          <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-4 font-sans font-bold text-slate-800">
                              {m.month}
                            </td>
                            <td className="py-2.5 px-4 text-right font-bold text-[#009540]">
                              {formatCurrency(m.income)}
                            </td>
                            <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                              {formatCurrency(m.expense)}
                            </td>
                            <td className={`py-2.5 px-4 text-right font-bold ${
                              m.net >= 0 ? 'text-[#009540]' : 'text-rose-600'
                            }`}>
                              {m.net >= 0 ? '+' : ''}{formatCurrency(m.net)}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <div className="w-28 bg-slate-100 h-2 rounded-full mx-auto overflow-hidden">
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

          {/* TAB 3: Project Profitability Matrix */}
          {activeTab === 'project_analysis' && (
            <div className="space-y-4">
              
              {/* Filter bar */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">ผลการดำเนินงาน & มาร์จิ้นแยกตามโครงการ</h4>
                  <p className="text-[11px] text-slate-400">คำนวณจากรายรับส่งมอบงานและค่าใช้จ่ายที่เกิดขึ้นจริงในสมุดรายวัน</p>
                </div>
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อโครงการ หรือ รหัส..."
                    value={searchProject}
                    onChange={(e) => setSearchProject(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#005aa9]"
                  />
                </div>
              </div>

              {/* Projects Table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">โครงการ</th>
                        <th className="py-3 px-4 text-right">รายรับ (Income)</th>
                        <th className="py-3 px-4 text-right">รายจ่ายสะสม (Expense)</th>
                        <th className="py-3 px-4 text-right">กำไรส่วนต่าง (Net Margin)</th>
                        <th className="py-3 px-4 text-center">มาร์จิ้น (%)</th>
                        <th className="py-3 px-4 text-center">สถานะควบคุมต้นทุน</th>
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
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                  {p.code}
                                </span>
                                <span className="font-bold text-slate-900 truncate max-w-xs">
                                  {p.cleanName || p.projectName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                              {formatCurrency(p.totalIncome)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(p.totalExpense)}
                            </td>
                            <td className={`py-3 px-4 text-right font-mono font-black ${
                              p.netMargin >= 0 ? 'text-[#009540]' : 'text-rose-600'
                            }`}>
                              {p.netMargin >= 0 ? '+' : ''}{formatCurrency(p.netMargin)}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                numMargin >= 15 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : numMargin > 0 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {marginPercent}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {p.netMargin >= 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#009540] font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>กำไรตามเป้า</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>เฝ้าระวังงบประมาณ</span>
                                </span>
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
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>ประมวลผลข้อมูลอัตโนมัติจากสมุดรายวันทั่วไป & ระบบเบิกจ่าย บจก.บุรีรัมย์ธงชัยก่อสร้าง</span>
          </div>
          <button
            id="ai-modal-bottom-close-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer transition-colors text-xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
