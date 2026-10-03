import { useState, useMemo } from 'react';
import { Transaction, Disbursement, TodoTask } from '../types';
import { formatCurrency } from '../utils/accounting';
import { 
  Building2, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Layers, 
  ArrowRight,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';

interface ExecutiveCorporateCashViewProps {
  disbursements: Disbursement[];
  tasks: TodoTask[];
  transactions?: Transaction[];
  onNavigateTab?: (tab: any) => void;
  onFilterProject?: (projectName: string) => void;
}

export function ExecutiveCorporateCashView({
  disbursements,
  tasks,
  transactions = [],
  onNavigateTab
}: ExecutiveCorporateCashViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [activeCompanyFilter, setActiveCompanyFilter] = useState<string>('all');

  // 1. Calculate Current Bank Cash Balance across bank accounts from transactions
  const corporateBankBalances = useMemo(() => {
    const bankMap: Record<string, number> = {};
    let totalAllBanks = 0;

    transactions.forEach(t => {
      const acct = t.account || 'ทั่วไป';
      if (!bankMap[acct]) bankMap[acct] = 0;
      const net = (t.debit || 0) - (t.credit || 0);
      bankMap[acct] += net;
      totalAllBanks += net;
    });

    return { bankMap, totalAllBanks };
  }, [transactions]);

  // 2. Company-Level Commitments & Inflow/Outflow Matrix
  const companyMatrix = useMemo(() => {
    const companies = ['บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด', 'ห้างหุ้นส่วนจำกัด ทรัพย์ธงชัยก่อสร้าง', 'บริษัท บุรีรัมย์คอนกรีต จำกัด'];
    
    // Add any company present in data
    disbursements.forEach(d => {
      if (d.company && !companies.includes(d.company)) companies.push(d.company);
    });

    return companies.map(comp => {
      // Disbursements for this company
      const compDbms = disbursements.filter(d => (d.company || '').includes(comp.slice(0, 10)) || d.company === comp);
      const pendingApproval = compDbms.filter(d => d.status === 'pending_review');
      const readyToPay = compDbms.filter(d => d.status === 'approved' || d.status === 'pending');
      const paid = compDbms.filter(d => d.status === 'paid');

      const pendingApprovalAmount = pendingApproval.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
      const readyToPayAmount = readyToPay.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
      const paidAmount = paid.reduce((sum, d) => sum + (d.totalAmount || 0), 0);

      // Tasks for this company
      const compTasks = tasks.filter(t => !t.completed && ((t.company || '').includes(comp.slice(0, 10)) || t.company === comp));
      const taskExpense = compTasks.filter(t => t.type !== 'income' && t.category !== 'billing').reduce((sum, t) => sum + (t.amount || 0), 0);
      const taskIncome = compTasks.filter(t => t.type === 'income' || t.category === 'billing').reduce((sum, t) => sum + (t.amount || 0), 0);

      // Total Obligations for company
      const totalObligations = readyToPayAmount + taskExpense;

      return {
        companyName: comp,
        shortName: comp.includes('บุรีรัมย์ธงชัย') ? 'BTC (สำนักงานใหญ่)' : comp.includes('ทรัพย์ธงชัย') ? 'STC (หจก. ทรัพย์ธงชัย)' : comp.includes('คอนกรีต') ? 'บุรีรัมย์คอนกรีต' : comp,
        pendingApprovalCount: pendingApproval.length,
        pendingApprovalAmount,
        readyToPayCount: readyToPay.length,
        readyToPayAmount,
        paidCount: paid.length,
        paidAmount,
        taskExpense,
        taskIncome,
        totalObligations
      };
    });
  }, [disbursements, tasks]);

  // 3. 4-Week Rolling Cash Forecast for selected month
  const fourWeekForecast = useMemo(() => {
    // Week definitions:
    // W1: Days 01-07
    // W2: Days 08-14
    // W3: Days 15-21 (Tax heavy period: WHT, Social Security, VAT)
    // W4: Days 22-end of month (Salaries & Progress claims)

    const weeks = [
      {
        weekNumber: 1,
        title: 'สัปดาห์ที่ 1 (1 - 7)',
        dateRange: `${selectedMonth}-01 ถึง ${selectedMonth}-07`,
        expectedInflow: 1850000, // ค่างวดสะสม/ลูกหนี้
        obligations: 0,
        items: [] as Array<{ title: string; amount: number; type: 'expense' | 'income'; tag: string }>,
        focus: 'ค่าน้ำมันดีเซลหน้างาน & จัดซื้อวัสดุเริ่มงวด'
      },
      {
        weekNumber: 2,
        title: 'สัปดาห์ที่ 2 (8 - 14)',
        dateRange: `${selectedMonth}-08 ถึง ${selectedMonth}-14`,
        expectedInflow: 3200000, // เบิกเงินงวดงาน ทล.24 งวด 1
        obligations: 0,
        items: [] as Array<{ title: string; amount: number; type: 'expense' | 'income'; tag: string }>,
        focus: 'ค่าคอนกรีตผสมเสร็จ & ผู้รับเหมาช่วงชุดโครงสร้าง'
      },
      {
        weekNumber: 3,
        title: 'สัปดาห์ที่ 3 (15 - 21)',
        dateRange: `${selectedMonth}-15 ถึง ${selectedMonth}-21`,
        expectedInflow: 2500000,
        obligations: 0,
        items: [] as Array<{ title: string; amount: number; type: 'expense' | 'income'; tag: string }>,
        focus: 'ภาษีสรรพากร (ภ.ง.ด.1/3/53), เงินสมทบ สปส. & ภ.พ.30'
      },
      {
        weekNumber: 4,
        title: 'สัปดาห์ที่ 4 (22 - 30)',
        dateRange: `${selectedMonth}-22 ถึง ${selectedMonth}-31`,
        expectedInflow: 4800000, // เงินค่างวดกรมทางหลวงงวดหลัก
        obligations: 0,
        items: [] as Array<{ title: string; amount: number; type: 'expense' | 'income'; tag: string }>,
        focus: 'เงินเดือนพนักงาน/ค่าแรงคนงานประจำเดือน & ซัพพลายเออร์ยางมะตอย'
      }
    ];

    // Distribute approved disbursements into weeks
    disbursements.filter(d => d.status === 'approved' || d.status === 'pending').forEach(d => {
      const dDate = d.dueDate || d.entryDate || `${selectedMonth}-15`;
      let day = 15;
      if (dDate.includes('-')) {
        const parts = dDate.split('-');
        day = parseInt(parts[2] || '15', 10);
      }

      let weekIdx = 0;
      if (day >= 1 && day <= 7) weekIdx = 0;
      else if (day >= 8 && day <= 14) weekIdx = 1;
      else if (day >= 15 && day <= 21) weekIdx = 2;
      else weekIdx = 3;

      weeks[weekIdx].obligations += (d.totalAmount || 0);
      weeks[weekIdx].items.push({
        title: `[${d.dbmNo}] ${d.payeeName} (${d.expenseType || 'ก่อสร้าง'})`,
        amount: d.totalAmount || 0,
        type: 'expense',
        tag: d.project ? d.project.slice(0, 15) : 'โครงการ'
      });
    });

    // Distribute scheduled tasks
    tasks.filter(t => !t.completed && t.dueDate.startsWith(selectedMonth)).forEach(t => {
      let day = 15;
      if (t.dueDate.includes('-')) {
        const parts = t.dueDate.split('-');
        day = parseInt(parts[2] || '15', 10);
      }

      let weekIdx = 0;
      if (day >= 1 && day <= 7) weekIdx = 0;
      else if (day >= 8 && day <= 14) weekIdx = 1;
      else if (day >= 15 && day <= 21) weekIdx = 2;
      else weekIdx = 3;

      if (t.type === 'income' || t.category === 'billing') {
        weeks[weekIdx].expectedInflow += (t.amount || 0);
        weeks[weekIdx].items.push({
          title: t.title,
          amount: t.amount || 0,
          type: 'income',
          tag: 'เงินรับ'
        });
      } else {
        weeks[weekIdx].obligations += (t.amount || 0);
        weeks[weekIdx].items.push({
          title: t.title,
          amount: t.amount || 0,
          type: 'expense',
          tag: t.category.toUpperCase()
        });
      }
    });

    return weeks.map(w => {
      const net = w.expectedInflow - w.obligations;
      const health: 'surplus' | 'balanced' | 'tight' = net > 1000000 ? 'surplus' : net >= 0 ? 'balanced' : 'tight';
      return { ...w, net, health };
    });
  }, [disbursements, tasks, selectedMonth]);

  // 4. Large Commitments (>100k) that executives should review for cash control
  const largeCommitments = useMemo(() => {
    return disbursements
      .filter(d => (d.status === 'approved' || d.status === 'pending_review') && (d.totalAmount || 0) >= 100000)
      .sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0))
      .slice(0, 5);
  }, [disbursements]);

  // Overall Month Totals
  const monthTotals = useMemo(() => {
    const totalObligations = fourWeekForecast.reduce((sum, w) => sum + w.obligations, 0);
    const totalExpectedInflow = fourWeekForecast.reduce((sum, w) => sum + w.expectedInflow, 0);
    const totalNetCash = totalExpectedInflow - totalObligations;
    return { totalObligations, totalExpectedInflow, totalNetCash };
  }, [fourWeekForecast]);

  return (
    <div className="space-y-3">

      {/* Header with Month Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600" />
                วางแผนกระแสเงินสด & ภาระผูกพันทั้งบริษัท (Corporate Cash Plan)
              </h2>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Executive Forecast
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              วิเคราะห์สภาพคล่องทั้งกลุ่มบริษัท • คาดการณ์เงินสดเข้า-ออก 4 สัปดาห์ล่วงหน้า • ควบคุมภาระผูกพันก้อนใหญ่
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600 font-medium">รอบเดือน:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                <option value="2026-08">สิงหาคม 2569</option>
                <option value="2026-09">กันยายน 2569 (ปัจจุบัน)</option>
                <option value="2026-10">ตุลาคม 2569</option>
                <option value="2026-11">พฤศจิกายน 2569</option>
                <option value="2026-12">ธันวาคม 2569</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Corporate Executive Summary (3 Key Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        
        {/* Inflow */}
        <div className="bg-white rounded-xl border border-emerald-200 p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#009540]" />
              ประมาณการเงินรับทั้งบริษัท (4 สัปดาห์)
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-[#009540]">
              Inflow
            </span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-emerald-800 font-mono tracking-tight">
            {formatCurrency(monthTotals.totalExpectedInflow)}
          </p>
          <div className="mt-1 text-[10px] text-slate-500">
            ค่างวดงานทางหลวง ทล.24 + ลูกหนี้การค้า + เงินเบิกสัญญา
          </div>
        </div>

        {/* Outflow / Obligations */}
        <div className="bg-white rounded-xl border border-rose-200 p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
              ภาระจ่ายรวมที่ครบกำหนด (4 สัปดาห์)
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-100 text-rose-800">
              Outflow
            </span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-rose-800 font-mono tracking-tight">
            {formatCurrency(monthTotals.totalObligations)}
          </p>
          <div className="mt-1 text-[10px] text-slate-500">
            คิวใบเบิกอนุมัติแล้ว + ค่าใช้จ่ายประจำ + ภาระภาษีสรรพากร
          </div>
        </div>

        {/* Net Projected Position */}
        <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              ดุลกระแสเงินสดสุทธิคาดการณ์
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
              monthTotals.totalNetCash >= 0 ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' : 'bg-rose-900/60 text-rose-300 border border-rose-700'
            }`}>
              {monthTotals.totalNetCash >= 0 ? 'เงินสดบวก' : 'เงินสตึงตัว'}
            </span>
          </div>
          <p className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${
            monthTotals.totalNetCash >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {monthTotals.totalNetCash >= 0 ? '+' : ''}{formatCurrency(monthTotals.totalNetCash)}
          </p>
          <div className="mt-1 text-[10px] text-slate-400">
            {monthTotals.totalNetCash >= 0 
              ? '✓ บริษัทมีกระแสเงินสดเพียงพอ ไม่มีความเสี่ยงขาดสภาพคล่อง' 
              : '⚠ ผู้บริหารควรพิจารณาเลื่อนจ่ายคู่ค้าบางราย หรือเบิกตั๋วสัญญาใช้เงิน (P/N)'}
          </div>
        </div>

      </div>

      {/* 2. 4-Week Rolling Cash Forecast Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              แผนกระแสเงินสด 4 สัปดาห์ (4-Week Rolling Projection) - เดือน {selectedMonth}
            </h3>
            <p className="text-[11px] text-slate-500">
              จำแนกการไหลเข้า-ออกของเงินในแต่ละสัปดาห์ ช่วยให้ผู้บริหารจัดสรรรอบจ่ายได้อย่างแม่นยำ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {fourWeekForecast.map(week => {
            const isSurplus = week.net >= 0;
            return (
              <div 
                key={week.weekNumber}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  week.health === 'tight' 
                    ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-300' 
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      {week.title}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSurplus ? 'bg-emerald-100 text-[#009540]' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isSurplus ? 'ดุลบวก' : 'ตึงตัว'}
                    </span>
                  </div>
                  
                  <div className="text-[10px] text-slate-500 font-mono mb-2">
                    {week.dateRange}
                  </div>

                  {/* Numbers */}
                  <div className="space-y-1.5 text-xs py-2 border-y border-slate-200/60">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        เงินรับคาดการณ์:
                      </span>
                      <span className="font-mono font-bold text-emerald-700">
                        +{formatCurrency(week.expectedInflow)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        ภาระจ่ายครบกำหนด:
                      </span>
                      <span className="font-mono font-bold text-rose-700">
                        -{formatCurrency(week.obligations)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 font-bold">
                      <span className="text-[11px] text-slate-800">ดุลสุทธิสัปดาห์:</span>
                      <span className={`font-mono text-xs ${isSurplus ? 'text-[#009540]' : 'text-rose-700'}`}>
                        {isSurplus ? '+' : ''}{formatCurrency(week.net)}
                      </span>
                    </div>
                  </div>

                  {/* Focus area */}
                  <div className="mt-2 text-[10px] text-slate-600 bg-white p-1.5 rounded border border-slate-200">
                    <span className="font-semibold text-slate-800">จุดโฟกัส: </span>
                    <span>{week.focus}</span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700">รายการผูกพัน ({week.items.length})</span>
                    <span className="text-blue-700 font-semibold">{week.items.filter(i => i.type === 'expense').length} จ่าย</span>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                    {week.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/80 p-1 rounded text-[9px] border border-slate-100">
                        <span className="truncate max-w-[120px]" title={item.title}>{item.title}</span>
                        <span className={`font-mono font-bold shrink-0 ${item.type === 'income' ? 'text-[#009540]' : 'text-slate-800'}`}>
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                    {week.items.length > 3 && (
                      <div className="text-center text-[9px] text-slate-400">
                        + อีก {week.items.length - 3} รายการ
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Corporate Multi-Entity Breakdown & High-Value Commitments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* Left 2 Columns: Multi-Entity Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-3 sm:p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-600" />
                ภาระผูกพันและดุลเงินสดจำแนกตามบริษัทในเครือ (Multi-Entity Matrix)
              </h3>
              <p className="text-[11px] text-slate-500">
                วิเคราะห์แยกตามนิติบุคคล เพื่อบริหารการโอนย้ายเงินระหว่างบริษัทและการหักล้างหนี้
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                  <th className="py-2 px-3">บริษัท / นิติบุคคล</th>
                  <th className="py-2 px-3 text-center">รออนุมัติ</th>
                  <th className="py-2 px-3 text-right">คิวพร้อมจ่าย (PV)</th>
                  <th className="py-2 px-3 text-right">จ่ายแล้วงวดนี้</th>
                  <th className="py-2 px-3 text-right">ภาระรวมที่ต้องเตรียม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companyMatrix.map((comp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">
                        {comp.shortName}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[220px]">
                        {comp.companyName}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {comp.pendingApprovalCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                          {comp.pendingApprovalCount} ฉบับ ({formatCurrency(comp.pendingApprovalAmount)})
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">-</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(comp.readyToPayAmount)}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {comp.readyToPayCount} ฉบับ
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-[#009540] font-semibold">
                      {formatCurrency(comp.paidAmount)}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {comp.paidCount} ฉบับ
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700 bg-rose-50/40">
                      {formatCurrency(comp.totalObligations)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Column: High-Value Executive Watchlist */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                ภาระก้อนใหญ่ที่ต้องพิจารณา (&gt; 100k)
              </h3>
              <p className="text-[10px] text-slate-500">
                รายการมูลค่าสูงที่ผู้บริหารมีอำนาจสั่งเจรจาหรือเลื่อนจ่าย
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {largeCommitments.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                ไม่มีรายการภาระผูกพันเกิน 100,000 บาท
              </div>
            ) : (
              largeCommitments.map(dbm => (
                <div key={dbm.id} className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="font-bold text-blue-900 truncate max-w-[140px]" title={dbm.payeeName}>
                      {dbm.payeeName}
                    </span>
                    <span className="font-mono font-bold text-rose-700">
                      {formatCurrency(dbm.totalAmount)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span className="truncate max-w-[150px]">{dbm.expenseType || 'ค่าใช้จ่าย'}</span>
                    <span className="px-1.5 py-0.2 rounded bg-white border border-slate-200 font-mono text-[9px]">
                      {dbm.dbmNo}
                    </span>
                  </div>
                  <div className="mt-1 pt-1 border-t border-slate-200/60 text-[9px] text-slate-500 flex justify-between items-center">
                    <span>โครงการ: {dbm.project ? dbm.project.slice(0, 15) : '-'}</span>
                    <span className="font-semibold text-amber-700">
                      {dbm.status === 'pending_review' ? 'รอลงนาม' : 'อนุมัติแล้ว'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab && onNavigateTab('disbursements')}
              className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>เปิดระบบใบตั้งเบิกทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
