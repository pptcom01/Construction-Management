import { useMemo, useState } from 'react';
import { Transaction } from '../types';
import { 
  formatCurrency, 
  computeOverallStats, 
  computeProjectSummaries, 
  computeMonthlyFinancials, 
  computeExpenseCategories,
  isTransferTransaction,
  isInitialBalanceTransaction,
  isLoanOrFinancingTransaction
} from '../utils/accounting';
import { 
  Printer, 
  Download, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Building2,
  FileSpreadsheet,
  Layers,
  CalendarRange
} from 'lucide-react';
import { BTCLogo } from './BTCLogo';

interface ReportsViewProps {
  transactions: Transaction[];
  onExportCSV: () => void;
}

export function ReportsView({ transactions, onExportCSV }: ReportsViewProps) {
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('all');
  const [reportType, setReportType] = useState<'pl' | 'project' | 'monthly'>('pl');

  const filteredTransactions = useMemo(() => {
    if (selectedCompanyFilter === 'all') return transactions;
    return transactions.filter(t => t.company === selectedCompanyFilter);
  }, [transactions, selectedCompanyFilter]);

  const stats = useMemo(() => computeOverallStats(filteredTransactions), [filteredTransactions]);
  const projectSummaries = useMemo(() => computeProjectSummaries(filteredTransactions), [filteredTransactions]);
  const monthlyFinancials = useMemo(() => computeMonthlyFinancials(filteredTransactions), [filteredTransactions]);
  const categories = useMemo(() => computeExpenseCategories(filteredTransactions), [filteredTransactions]);

  // Real data-driven revenue breakdown
  const revenueBreakdown = useMemo(() => {
    let contractIncome = 0;
    let pnIncome = 0;
    let otherIncome = 0;

    filteredTransactions.forEach(t => {
      if (t.debit <= 0) return;
      if (isTransferTransaction(t) || isInitialBalanceTransaction(t)) return;

      const desc = (t.description || '').toLowerCase();
      const cat = (t.category || '').toLowerCase();
      const text = `${desc} ${cat}`;

      if (text.includes('p/n') || text.includes('ตั๋วสัญญา') || text.includes('ตั๋ว')) {
        pnIncome += t.debit;
      } else if (text.includes('ดอกเบี้ย') || text.includes('ทดรอง') || text.includes('คืนเงิน') || text.includes('อื่นๆ')) {
        otherIncome += t.debit;
      } else {
        contractIncome += t.debit;
      }
    });

    const total = contractIncome + pnIncome + otherIncome;
    return {
      contractIncome,
      pnIncome,
      otherIncome,
      total: total > 0 ? total : stats.totalIncome
    };
  }, [filteredTransactions, stats.totalIncome]);

  // Breakdown of direct construction cost vs administrative
  const costBreakdown = useMemo(() => {
    let materialCost = 0;
    let subcontractorCost = 0;
    let fuelCost = 0;
    let sparePartsCost = 0;
    let salaryCost = 0;
    let taxCost = 0;
    let utilityCost = 0;
    let bankFeeCost = 0;
    let otherCost = 0;

    filteredTransactions.forEach(t => {
      if (t.credit <= 0) return;
      const isTransfer = isTransferTransaction(t);
      const isInitial = isInitialBalanceTransaction(t);
      const isLoan = isLoanOrFinancingTransaction(t);
      if (isTransfer || isInitial || isLoan) return;

      const desc = (t.description || '').toLowerCase();
      const cat = (t.category || '').toLowerCase();
      const text = `${desc} ${cat}`;

      if (text.includes('วัสดุ') || text.includes('ปูน') || text.includes('หิน') || text.includes('ทราย') || text.includes('เหล็ก') || text.includes('ยาง') || text.includes('ท่อ') || text.includes('คอนกรีต')) {
        materialCost += t.credit;
      } else if (text.includes('ผู้รับเหมา') || text.includes('ผลงาน') || text.includes('สะพาน') || text.includes('กำแพง') || text.includes('ตีเส้น')) {
        subcontractorCost += t.credit;
      } else if (text.includes('น้ำมัน') || text.includes('ดีเซล') || text.includes('ปั้ม') || text.includes('หล่อลื่น')) {
        fuelCost += t.credit;
      } else if (text.includes('อะไหล่') || text.includes('ซ่อม') || text.includes('ยางรถ') || text.includes('อู่')) {
        sparePartsCost += t.credit;
      } else if (text.includes('เงินเดือน') || text.includes('ค่าแรง') || text.includes('สำรองจ่าย')) {
        salaryCost += t.credit;
      } else if (text.includes('ภาษี') || text.includes('ภ.ง.ด') || text.includes('ภพ.30') || text.includes('ประกันสังคม') || text.includes('กยศ')) {
        taxCost += t.credit;
      } else if (text.includes('ไฟฟ้า') || text.includes('ประปา') || text.includes('โทรศัพท์') || text.includes('อินเทอร์เน็ต')) {
        utilityCost += t.credit;
      } else if (text.includes('ธรรมเนียม') || text.includes('ดอกเบี้ย') || text.includes('l/g') || text.includes('p/n')) {
        bankFeeCost += t.credit;
      } else {
        otherCost += t.credit;
      }
    });

    const directCost = materialCost + subcontractorCost + fuelCost + sparePartsCost + salaryCost;
    const adminCost = taxCost + utilityCost + bankFeeCost + otherCost;

    return {
      materialCost,
      subcontractorCost,
      fuelCost,
      sparePartsCost,
      salaryCost,
      taxCost,
      utilityCost,
      bankFeeCost,
      otherCost,
      directCost,
      adminCost,
      totalCost: directCost + adminCost
    };
  }, [filteredTransactions]);

  const handlePrint = () => {
    window.print();
  };

  const profitMarginPercent = stats.totalIncome > 0 
    ? ((stats.netOperatingProfit / stats.totalIncome) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="space-y-3.5 pb-8">
      {/* 1. Header Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-[#005aa9]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                ศูนย์รายงานการเงิน & งบกำไรขาดทุน (Financial Reports)
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-900 border border-blue-200">
                P&L Audited
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              งบกำไรขาดทุนจากการดำเนินงาน สรุปต้นทุนแยกตามโครงการ และกระแสเงินสดสุทธิ
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Company filter */}
          <select
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-[#005aa9] cursor-pointer"
          >
            <option value="all">🏢 รวมทุกบริษัท & กิจการร่วมค้า</option>
            <option value="บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด">บจก. บุรีรัมย์ธงชัยก่อสร้าง</option>
            <option value="กิจการร่วมค้า บีทีซีพี">กิจการร่วมค้า BTCP</option>
            <option value="กิจการร่วมค้า บีทีซี - พีซี">กิจการร่วมค้า BTC-PC</option>
          </select>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์รายงาน (Print / PDF)</span>
          </button>

          <button
            onClick={onExportCSV}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#009540] hover:bg-[#007f36] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Financial KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 no-print">
        {/* Total Revenue */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#009540]" />
              รายรับจากการดำเนินงาน
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">
              Operating Revenue
            </span>
          </div>
          <div className="mt-1">
            <span className="text-base sm:text-lg font-bold text-[#009540] font-mono">
              {formatCurrency(stats.totalIncome)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            ค่างวดงานก่อสร้าง & เงินเบิกตามงวดงาน
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
              ต้นทุน & ค่าใช้จ่ายรวม
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700">
              Total Costs
            </span>
          </div>
          <div className="mt-1">
            <span className="text-base sm:text-lg font-bold text-rose-600 font-mono">
              {formatCurrency(stats.totalExpense)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            ต้นทุนทางตรง + บริหารสำนักงาน + ภาษี
          </p>
        </div>

        {/* Net Operating Profit */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#005aa9]" />
              กำไรสุทธิจากการดำเนินงาน
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700">
              Net Profit
            </span>
          </div>
          <div className="mt-1">
            <span className={`text-base sm:text-lg font-bold font-mono ${
              stats.netOperatingProfit >= 0 ? 'text-[#005aa9]' : 'text-rose-600'
            }`}>
              {formatCurrency(stats.netOperatingProfit)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            ส่วนต่างรายรับหักค่าใช้จ่ายทั้งหมด
          </p>
        </div>

        {/* Net Profit Margin % */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-purple-600" />
              อัตรากำไรสุทธิ (Margin)
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700">
              Performance
            </span>
          </div>
          <div className="mt-1">
            <span className={`text-base sm:text-lg font-bold font-mono ${
              Number(profitMarginPercent) >= 0 ? 'text-purple-700' : 'text-rose-600'
            }`}>
              {profitMarginPercent}%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {Number(profitMarginPercent) >= 15 ? '✓ ผลการดำเนินงานอยู่ในเกณฑ์ดีเยี่ยม' : 'ตัวเลขผลตอบแทนจากการดำเนินงาน'}
          </p>
        </div>
      </div>

      {/* 3. Report Switcher Tabs Navigation */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1 no-print">
        <button
          onClick={() => setReportType('pl')}
          className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            reportType === 'pl' 
              ? 'bg-[#005aa9] text-white shadow-xs' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>งบกำไรขาดทุนจากการดำเนินงาน (P&L)</span>
        </button>
        <button
          onClick={() => setReportType('project')}
          className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            reportType === 'project' 
              ? 'bg-[#005aa9] text-white shadow-xs' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>สรุปต้นทุนแยกตามโครงการ (Project Costing)</span>
        </button>
        <button
          onClick={() => setReportType('monthly')}
          className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            reportType === 'monthly' 
              ? 'bg-[#005aa9] text-white shadow-xs' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CalendarRange className="w-3.5 h-3.5" />
          <span>กระแสเงินสดรายเดือน (Monthly Summary)</span>
        </button>
      </div>

      {/* 4. Main Content Sheet (Printable Layout) */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs print:border-0 print:shadow-none print:p-0">
        
        {/* Document Header: Hidden/Minimal on Screen, Full Official on Print */}
        <div className="pb-3 mb-3 border-b border-slate-200">
          {/* Print Only Header with Logo */}
          <div className="hidden print:flex flex-col items-center text-center gap-1 mb-3">
            <BTCLogo size="lg" showText={true} showPhone={true} />
            <h1 className="text-base font-black text-slate-900 mt-1">
              {selectedCompanyFilter === 'all' ? 'กลุ่มบริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด และ กิจการร่วมค้า' : selectedCompanyFilter}
            </h1>
            <p className="text-[11px] text-slate-500">
              ข้อมูลอ้างอิงจากสมุดรายวันบัญชีบริษัท • โทร: 044-611134 • วันที่พิมพ์: {new Date().toLocaleDateString('th-TH')}
            </p>
          </div>

          {/* Screen Minimal Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {reportType === 'pl' && 'งบกำไรขาดทุนจากการดำเนินงาน (Statement of Comprehensive Income)'}
                {reportType === 'project' && 'รายงานสรุปต้นทุนและกำไรขั้นต้นแยกตามโครงการ (Project Costing & Margin)'}
                {reportType === 'monthly' && 'รายงานสรุปรายรับ-รายจ่ายและกระแสเงินสดรายเดือน (Monthly Cash Flow)'}
              </h2>
              <p className="text-xs text-slate-500">
                บริษัท: {selectedCompanyFilter === 'all' ? 'ทุกบริษัทและกิจการร่วมค้า' : selectedCompanyFilter}
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              ข้อมูลปรับปรุงล่าสุด: {new Date().toLocaleDateString('th-TH')}
            </div>
          </div>
        </div>

        {/* View 1: Profit & Loss Statement */}
        {reportType === 'pl' && (
          <div className="space-y-3.5 max-w-4xl mx-auto text-xs sm:text-sm">
            
            {/* 1. Revenue Section */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-emerald-50/80 px-3.5 py-2.5 font-bold text-emerald-950 flex items-center justify-between border-b border-emerald-200/80">
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">1</span>
                  รายรับจากการดำเนินงาน (Operating Revenues)
                </span>
                <span className="text-[#009540] font-mono text-sm sm:text-base">
                  {formatCurrency(stats.totalIncome)}
                </span>
              </div>
              <div className="divide-y divide-slate-100 px-3.5 py-1 text-slate-700">
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>รับค่างวดงานก่อสร้างทางหลวงและโครงการ</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatCurrency(revenueBreakdown.contractIncome)}
                  </span>
                </div>
                {revenueBreakdown.pnIncome > 0 && (
                  <div className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>รับเงินวางตั๋วสัญญาใช้เงิน (P/N Against Work Done)</span>
                    </div>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatCurrency(revenueBreakdown.pnIncome)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>ดอกเบี้ยรับ, รับคืนเงินทดรอง & รายรับอื่นๆ</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatCurrency(revenueBreakdown.otherIncome)}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Direct Construction Costs */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-slate-50 px-3.5 py-2.5 font-bold text-slate-800 flex items-center justify-between border-b border-slate-200">
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[11px]">2</span>
                  ต้นทุนงานก่อสร้างทางตรง (Direct Construction Costs)
                </span>
                <span className="text-rose-600 font-mono text-sm sm:text-base">
                  {formatCurrency(costBreakdown.directCost)}
                </span>
              </div>
              <div className="divide-y divide-slate-100 px-3.5 py-1 text-slate-600">
                <div className="flex items-center justify-between py-1.5">
                  <span>• ค่าวัสดุก่อสร้าง (ปูน, หินคลุก, ยางมะตอย, ท่อ คสล.)</span>
                  <span className="font-mono font-medium text-slate-900">{formatCurrency(costBreakdown.materialCost)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span>• ค่าจ้างผลงานผู้รับเหมาช่วง (งานสะพาน, MSE Wall, ตีเส้น)</span>
                  <span className="font-mono font-medium text-slate-900">{formatCurrency(costBreakdown.subcontractorCost)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span>• ค่าน้ำมันเชื้อเพลิงดีเซล & น้ำมันหล่อลื่น</span>
                  <span className="font-mono font-medium text-slate-900">{formatCurrency(costBreakdown.fuelCost)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span>• ค่าอะไหล่ & ซ่อมบำรุงเครื่องจักรหนัก</span>
                  <span className="font-mono font-medium text-slate-900">{formatCurrency(costBreakdown.sparePartsCost)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span>• ค่าจ้างแรงงาน & ค่าครองชีพช่างสนาม</span>
                  <span className="font-mono font-medium text-slate-900">{formatCurrency(costBreakdown.salaryCost)}</span>
                </div>
              </div>
            </div>

            {/* Subtotal: Gross Profit Margin */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between font-bold text-xs sm:text-sm">
              <span className="text-[#005aa9] flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#005aa9]" />
                กำไรขั้นต้นจากการก่อสร้าง (Gross Profit Margin)
              </span>
              <span className="text-[#005aa9] font-mono text-sm sm:text-base font-bold">
                {formatCurrency(stats.totalIncome - costBreakdown.directCost)}
              </span>
            </div>

            {/* 3. Administrative & Tax Costs */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-slate-50 px-3.5 py-2.5 font-bold text-slate-800 flex items-center justify-between border-b border-slate-200">
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[11px]">3</span>
                  ค่าใช้จ่ายบริหาร, การเงิน & ภาษี (Admin & Finance Expenses)
                </span>
                <span className="text-slate-700 font-mono text-sm sm:text-base">
                  {formatCurrency(costBreakdown.adminCost)}
                </span>
              </div>
              <div className="divide-y divide-slate-100 px-3.5 py-1 text-slate-600">
                <div className="flex items-center justify-between py-1.5">
                  <span>• ภาษีหัก ณ ที่จ่าย ภ.ง.ด. 1, 3, 53 & สปส.</span>
                  <span className="font-mono font-medium text-slate-900">{formatCurrency(costBreakdown.taxCost)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span>• ค่าไฟฟ้า, ประปา & การสื่อสารสำนักงาน</span>
                  <span className="font-mono font-medium text-slate-900">{formatCurrency(costBreakdown.utilityCost)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span>• ค่าธรรมเนียมธนาคาร, หนังสือค้ำประกัน (L/G) & ดอกเบี้ย</span>
                  <span className="font-mono font-medium text-slate-900">{formatCurrency(costBreakdown.bankFeeCost)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span>• ค่าใช้จ่ายเบ็ดเตล็ด & เบิกชดเชย</span>
                  <span className="font-mono font-medium text-slate-900">{formatCurrency(costBreakdown.otherCost)}</span>
                </div>
              </div>
            </div>

            {/* 4. Net Operating Profit Highlight */}
            <div className="p-3.5 sm:p-4 bg-linear-to-r from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-400 rounded-xl flex items-center justify-between font-black text-sm sm:text-base shadow-xs">
              <div className="flex flex-col">
                <span className="text-emerald-950 font-bold">กำไรสุทธิจากการดำเนินงาน (Net Operating Profit)</span>
                <span className="text-[11px] font-normal text-slate-500">ผลต่างรายรับหักต้นทุนและค่าใช้จ่ายจริงทั้งหมด</span>
              </div>
              <span className={`font-mono text-lg sm:text-xl ${
                stats.netOperatingProfit >= 0 ? 'text-[#009540]' : 'text-rose-600'
              }`}>
                {formatCurrency(stats.netOperatingProfit)}
              </span>
            </div>
          </div>
        )}

        {/* View 2: Project Costing Report */}
        {reportType === 'project' && (
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">รหัส</th>
                    <th className="py-2.5 px-3">ชื่อโครงการ</th>
                    <th className="py-2.5 px-3 text-right">รายรับ (Dr.)</th>
                    <th className="py-2.5 px-3 text-right">รายจ่าย (Cr.)</th>
                    <th className="py-2.5 px-3 text-right">ผลต่าง (Margin)</th>
                    <th className="py-2.5 px-3 text-center">จำนวนรายการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {projectSummaries.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-mono font-bold text-[#005aa9]">{p.code}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{p.cleanName || p.projectName}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-[#009540]">
                        {formatCurrency(p.totalIncome)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-rose-600">
                        {formatCurrency(p.totalExpense)}
                      </td>
                      <td className={`py-2 px-3 text-right font-mono font-bold ${
                        p.netMargin >= 0 ? 'text-[#009540]' : 'text-amber-600'
                      }`}>
                        {formatCurrency(p.netMargin)}
                      </td>
                      <td className="py-2 px-3 text-center font-medium text-slate-500">
                        {p.transactionCount} รายการ
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={2} className="py-2.5 px-3">ยอดรวมทุกโครงการ</td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#009540]">{formatCurrency(stats.totalIncome)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-600">{formatCurrency(stats.totalExpense)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#005aa9]">{formatCurrency(stats.netOperatingProfit)}</td>
                    <td className="py-2.5 px-3 text-center">{filteredTransactions.length} รายการ</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* View 3: Monthly Summary */}
        {reportType === 'monthly' && (
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">งวดเดือน</th>
                    <th className="py-2.5 px-3 text-right">รายรับ (Inflow)</th>
                    <th className="py-2.5 px-3 text-right">รายจ่าย (Outflow)</th>
                    <th className="py-2.5 px-3 text-right">กระแสเงินสดสุทธิ (Net Cash Flow)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[...monthlyFinancials].reverse().map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-900">{m.displayMonth}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-[#009540]">
                        {formatCurrency(m.income)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-rose-600">
                        {formatCurrency(m.expense)}
                      </td>
                      <td className={`py-2 px-3 text-right font-mono font-bold ${
                        m.netCashFlow >= 0 ? 'text-[#005aa9]' : 'text-rose-600'
                      }`}>
                        {m.netCashFlow >= 0 ? '+' : ''}{formatCurrency(m.netCashFlow)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signatures for Print ONLY (hidden on screen) */}
        <div className="hidden print:grid grid-cols-3 gap-6 text-center text-xs text-slate-600 mt-10 pt-6 border-t border-slate-200">
          <div>
            <div className="border-b border-slate-300 w-36 mx-auto mb-1.5 pb-6"></div>
            <p className="font-semibold text-slate-800">ผู้จัดทำรายงาน</p>
            <p className="text-[10px] text-slate-400">แผนกบัญชีและการเงิน</p>
          </div>
          <div>
            <div className="border-b border-slate-300 w-36 mx-auto mb-1.5 pb-6"></div>
            <p className="font-semibold text-slate-800">ผู้ตรวจสอบบัญชี</p>
            <p className="text-[10px] text-slate-400">หัวหน้าแผนกบัญชี</p>
          </div>
          <div>
            <div className="border-b border-slate-300 w-36 mx-auto mb-1.5 pb-6"></div>
            <p className="font-semibold text-slate-800">กรรมการผู้จัดการ</p>
            <p className="text-[10px] text-slate-400">บจก. บุรีรัมย์ธงชัยก่อสร้าง</p>
          </div>
        </div>
      </div>
    </div>
  );
}

