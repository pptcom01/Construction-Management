import { useMemo } from 'react';
import { Transaction, Disbursement, TodoTask, ViewTab, UserRole } from '../types';
import { 
  formatCurrency, 
  computeAccountBalances
} from '../utils/accounting';
import { 
  FileSpreadsheet, 
  CreditCard, 
  Clock, 
  ArrowRight,
  Building2,
  Calendar,
  BookOpen,
  Receipt,
  Wallet,
  Landmark,
  TrendingUp,
  TrendingDown,
  Layers,
  Lock,
  PieChart,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FolderKanban,
  ReceiptText,
  BarChart3
} from 'lucide-react';

interface DashboardViewProps {
  transactions: Transaction[];
  disbursements?: Disbursement[];
  todoTasks?: TodoTask[];
  userRole?: UserRole;
  onNavigateTab: (tab: ViewTab) => void;
  onFilterProject?: (projectName: string) => void;
  onRescheduleDisbursement?: (id: string, newDueDate: string, reason: string, rescheduledBy: string) => void;
}

export function DashboardView({ 
  transactions = [],
  disbursements = [], 
  todoTasks = [],
  userRole = 'executive',
  onNavigateTab, 
}: DashboardViewProps) {
  const isExecutive = userRole === 'admin' || userRole === 'manager' || userRole === 'executive';

  // 1. High-Level Treasury & Cash Position (Calculated from GL transactions)
  const accountBalances = useMemo(() => computeAccountBalances(transactions), [transactions]);
  const totalCash = useMemo(() => accountBalances.reduce((sum, a) => sum + a.calculatedBalance, 0), [accountBalances]);
  const totalIn = useMemo(() => accountBalances.reduce((sum, a) => sum + a.totalIncome, 0), [accountBalances]);
  const totalOut = useMemo(() => accountBalances.reduce((sum, a) => sum + a.totalExpense, 0), [accountBalances]);

  // 2. High-Level Disbursement Workflow Metrics
  const disbursementMetrics = useMemo(() => {
    const pendingReview = disbursements.filter(d => d.status === 'pending_review');
    const approved = disbursements.filter(d => d.status === 'approved' || d.status === 'pending');
    const paid = disbursements.filter(d => d.status === 'paid');

    const pendingReviewAmount = pendingReview.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
    const approvedAmount = approved.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
    const paidAmount = paid.reduce((sum, d) => sum + (d.transferAmount || d.totalAmount || 0), 0);

    return {
      pendingReviewCount: pendingReview.length,
      pendingReviewAmount,
      approvedCount: approved.length,
      approvedAmount,
      paidCount: paid.length,
      paidAmount,
      totalCount: disbursements.length
    };
  }, [disbursements]);

  // 3. High-Level Corporate Tasks & Commitments
  const pendingTasksCount = useMemo(() => {
    return todoTasks.filter(t => !t.completed).length;
  }, [todoTasks]);

  const urgentTasksCount = useMemo(() => {
    return todoTasks.filter(t => !t.completed && t.priority === 'urgent').length;
  }, [todoTasks]);

  // 4. Financial Summary of the 4 Corporate Entities (BTC Group)
  const companyPerformance = useMemo(() => {
    const companies = [
      { code: 'BTC', name: 'บจก. บุรีรัมย์ธงชัยก่อสร้าง', tag: 'ผู้รับเหมาหลัก' },
      { code: 'BTCP', name: 'บจก. บุรีรัมย์ธงชัยพัฒนา', tag: 'พัฒนาอสังหาริมทรัพย์' },
      { code: 'BTC-PC', name: 'บจก. บีทีซี เพิ่มพูนทรัพย์ คอนกรีต', tag: 'ผลิตคอนกรีตผสมเสร็จ' },
      { code: 'TBTC', name: 'บจก. ไทย บุรีรัมย์ ธงชัยการก่อสร้าง', tag: 'งานเครื่องจักร & ขนส่ง' }
    ];

    return companies.map(c => {
      // Income & Expense from transactions
      const txs = transactions.filter(t => {
        const cName = t.company || '';
        return cName.includes(c.code) || 
          (c.code === 'BTC' && !cName.includes('BTCP') && !cName.includes('BTC-PC') && !cName.includes('TBTC'));
      });

      const inc = txs.reduce((sum, t) => sum + (t.debit || 0), 0);
      const exp = txs.reduce((sum, t) => sum + (t.credit || 0), 0);
      const net = inc - exp;

      // Pending disbursements for this company
      const companyDisbursements = disbursements.filter(d => {
        const comp = d.company || '';
        return comp.includes(c.code) || 
          (c.code === 'BTC' && !comp.includes('BTCP') && !comp.includes('BTC-PC') && !comp.includes('TBTC'));
      });

      const pendingDbm = companyDisbursements
        .filter(d => d.status !== 'paid' && d.status !== 'rejected')
        .reduce((sum, d) => sum + (d.totalAmount || 0), 0);

      const paidDbm = companyDisbursements
        .filter(d => d.status === 'paid')
        .reduce((sum, d) => sum + (d.transferAmount || d.totalAmount || 0), 0);

      return {
        ...c,
        income: inc,
        expense: exp,
        netCash: net,
        pendingDbm,
        paidDbm
      };
    });
  }, [transactions, disbursements]);

  // 5. Expense Breakdown by Major Construction Category
  const expenseCategories = useMemo(() => {
    let material = 0;
    let labor = 0;
    let equipment = 0;
    let taxSocial = 0;
    let admin = 0;

    transactions.forEach(t => {
      const credit = t.credit || 0;
      if (credit <= 0) return;
      const desc = (t.description + ' ' + (t.category || '')).toLowerCase();

      if (desc.includes('วัสดุ') || desc.includes('คอนกรีต') || desc.includes('ปูน') || desc.includes('หิน') || desc.includes('เหล็ก') || desc.includes('ยาง')) {
        material += credit;
      } else if (desc.includes('ค่าแรง') || desc.includes('ผู้รับเหมา') || desc.includes('จ้างทำของ') || desc.includes('ช่าง')) {
        labor += credit;
      } else if (desc.includes('น้ำมัน') || desc.includes('เครื่องจักร') || desc.includes('ซ่อม') || desc.includes('อะไหล่') || desc.includes('เช่ารถ')) {
        equipment += credit;
      } else if (desc.includes('ภาษี') || desc.includes('ภ.ง.ด') || desc.includes('ภ.พ') || desc.includes('ประกันสังคม') || desc.includes('สปส')) {
        taxSocial += credit;
      } else {
        admin += credit;
      }
    });

    const total = material + labor + equipment + taxSocial + admin || 1;
    return [
      { name: 'ค่าวัสดุก่อสร้าง & คอนกรีต', amount: material, pct: Math.round((material / total) * 100), color: 'bg-[#005aa9]' },
      { name: 'ค่าแรง & ผู้รับเหมาช่วง', amount: labor, pct: Math.round((labor / total) * 100), color: 'bg-amber-500' },
      { name: 'ค่าเครื่องจักร, น้ำมัน & ซ่อมบำรุง', amount: equipment, pct: Math.round((equipment / total) * 100), color: 'bg-emerald-600' },
      { name: 'ภาษี & เงินสมทบประกันสังคม', amount: taxSocial, pct: Math.round((taxSocial / total) * 100), color: 'bg-purple-600' },
      { name: 'ค่าใช้จ่ายดำเนินงาน & ทั่วไป', amount: admin, pct: Math.round((admin / total) * 100), color: 'bg-slate-500' }
    ];
  }, [transactions]);

  return (
    <div className="space-y-4 pb-8 max-w-7xl mx-auto">
      
      {/* 1. Header Bar: Clean Executive Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-4 py-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              แดชบอร์ดภาพรวมผู้บริหาร (Executive Overview)
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-[#005aa9] border border-blue-200">
              BTC GROUP
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ศูนย์รวมข้อมูลสถิติภาพรวมระดับสูง สรุปผลประกอบการ 4 บริษัทในเครือ และสถานะกระแสเงินสด
          </p>
        </div>

        <div className="flex items-center gap-2">
        </div>
      </div>

      {/* 2. Top Tier: 4 Direct Executive Actionable KPI Cards with Clear Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Net Cash Balance */}
        <div 
          onClick={() => onNavigateTab('accounts')}
          className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">เงินสดคงเหลือสุทธิ (รวมทุกบัญชี)</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-[#009540]">
                <Wallet className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 font-mono text-xl font-black text-slate-900">
              {isExecutive ? formatCurrency(totalCash) : '••••••••'}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>รับ: <strong className="text-emerald-700">{isExecutive ? formatCurrency(totalIn) : '••••'}</strong></span>
              <span>จ่าย: <strong className="text-rose-700">{isExecutive ? formatCurrency(totalOut) : '••••'}</strong></span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#009540]">
            <span>ดูสถานะทุกบัญชีธนาคาร</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Pending Approval Queue */}
        <div 
          onClick={() => onNavigateTab('disbursements')}
          className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">คิวขอเบิกรอตรวจสอบ & อนุมัติ</span>
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 font-mono text-xl font-black text-amber-700">
              {formatCurrency(disbursementMetrics.pendingReviewAmount)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>รอตรวจอนุมัติ {disbursementMetrics.pendingReviewCount} รายการ</span>
              <span className="text-amber-800 font-semibold">ฝ่ายโครงการ</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
            <span>ไปหน้าตรวจสอบใบตั้งเบิก</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Ready to Pay (Finance Payment Queue) */}
        <div 
          onClick={() => onNavigateTab('payment')}
          className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">อนุมัติแล้ว รอฝ่ายการเงินโอนจ่าย</span>
              <span className="p-1.5 rounded-lg bg-blue-50 text-[#005aa9]">
                <CreditCard className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 font-mono text-xl font-black text-[#005aa9]">
              {formatCurrency(disbursementMetrics.approvedAmount)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>คิวรอจ่าย {disbursementMetrics.approvedCount} รายการ</span>
              <span className="text-[#005aa9] font-semibold">ฝ่ายการเงิน</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#005aa9]">
            <span>ไปหน้าบันทึกทำจ่าย & PV</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Corporate Tasks & Compliance */}
        <div 
          onClick={() => onNavigateTab('todoist')}
          className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-purple-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">แผนงาน & ภาระผูกพันประจำเดือน</span>
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                <Calendar className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 font-mono text-xl font-black text-slate-900">
              {pendingTasksCount} <span className="text-xs font-normal text-slate-500">งานที่ต้องทำ</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>งานด่วน {urgentTasksCount} รายการ</span>
              <span className="text-purple-700 font-semibold">ภาษี / เงินเดือน / สปส.</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
            <span>ไปหน้าวางแผนงาน & ปฏิทิน</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* 3. Mid Section: Two High-Level Analytical Dashboards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: 4-Company Financial Performance Summary (7 cols) */}
        <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">
                สรุปผลประกอบการ 4 บริษัทในเครือ (BTC Group Summary)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">
              ข้อมูลสะสมรวม
            </span>
          </div>

          <div className="divide-y divide-slate-100 mt-2 flex-1">
            {companyPerformance.map(comp => (
              <div key={comp.code} className="py-3 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-mono">
                      {comp.code}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {comp.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {comp.tag}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">ยอดขอเบิกรอจ่าย</span>
                    <span className="font-bold text-amber-700">{formatCurrency(comp.pendingDbm)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">จ่ายแล้วสะสม</span>
                    <span className="font-bold text-[#009540]">{formatCurrency(comp.paidDbm)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-sans">กระแสเงินสดสุทธิ</span>
                    <span className={`font-black ${comp.netCash >= 0 ? 'text-slate-900' : 'text-rose-700'}`}>
                      {formatCurrency(comp.netCash)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ต้องการดูรายละเอียดแยกตามสัญญาโครงการ?</span>
            <button
              onClick={() => onNavigateTab('projects')}
              className="text-[#005aa9] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              ดูต้นทุนรายโครงการ <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Expense Structure Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">
                  สัดส่วนโครงสร้างต้นทุนรายจ่าย
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">
                ตามหมวดหมู่
              </span>
            </div>

            <div className="space-y-3 mt-3">
              {expenseCategories.map(cat => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium truncate max-w-[200px]">{cat.name}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-slate-900">{formatCurrency(cat.amount)}</span>
                      <span className="text-[11px] text-slate-400 w-8 text-right">({cat.pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${cat.color}`} 
                      style={{ width: `${Math.min(cat.pct, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ดูงบกำไรขาดทุน P&L เต็มรูปแบบ</span>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-[#005aa9] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              เปิดรายงานการเงิน <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. Bottom Section: Clear Department Separation Map */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            แผนผังสายงาน 4 ฝ่ายหลัก (Department Responsibility Map)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            แยกหน้าที่รับผิดชอบชัดเจน ไม่แสดงข้อมูลและปุ่มบันทึกซ้ำซ้อน คลิกเลือกเพื่อเปิดระบบงานตามสายงาน
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          
          {/* Dept 1: Executive Suite */}
          <div 
            onClick={() => onNavigateTab('reports')}
            className="p-3.5 rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer bg-amber-50/30 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                  ผู้บริหาร
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">1. ฝ่ายบริหารองค์กร</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                แดชบอร์ดภาพรวม, งบกำไรขาดทุนสะสม (P&L), สถานะเงินสด 4 บริษัท และ AI วิเคราะห์ความเสี่ยง
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-amber-800">
              <span>ไปที่รายงานการเงิน & P&L</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Dept 2: Project Operations */}
          <div 
            onClick={() => onNavigateTab('boq')}
            className="p-3.5 rounded-xl border border-blue-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer bg-blue-50/30 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#005aa9] flex items-center justify-center font-bold">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#005aa9] border border-blue-200">
                  ฝ่ายโครงการ
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">2. ฝ่ายโครงการก่อสร้าง</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                BOQ โครงการ 3 ชั้น & โควตาวัสดุ BOM, สัญญาจ้างช่างเหมา, ตรวจรับงานตาม กม. และวิเคราะห์ต้นทุนกำไรโครงการ
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[#005aa9]">
              <span>ไปที่ BOQ โครงการ 3 ชั้น</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Dept 3: Finance & Treasury */}
          <div 
            onClick={() => onNavigateTab('disbursements')}
            className="p-3.5 rounded-xl border border-emerald-200 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer bg-emerald-50/30 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#009540] flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-[#009540] border border-emerald-200">
                  ฝ่ายการเงิน
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">3. ฝ่ายการเงิน & ธนาคาร</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                ออกใบขอตั้งเบิก (DBM) เสนอผู้บริหารอนุมัติจ่าย, บันทึกจ่ายเงิน (PV), แนบสลิปโอน และพิมพ์ใบสำคัญจ่าย
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[#009540]">
              <span>ไปที่ใบขอตั้งเบิก (DBM)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Dept 4: Accounting & Tax */}
          <div 
            onClick={() => onNavigateTab('transactions')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer bg-slate-50/60 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-bold">
                  <ReceiptText className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-300">
                  ฝ่ายบัญชี
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">4. ฝ่ายบัญชี & ภาษี</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                สมุดรายรับ-รายจ่าย (GL), สรุปภาษี & สปส., บัญชีเงินฝากธนาคาร & เงินยืมในเครือ และปฏิทินดิวภาษี/ภาระผูกพัน
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span>ไปที่สมุดบัญชี GL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
