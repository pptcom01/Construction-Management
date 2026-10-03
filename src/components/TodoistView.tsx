import React, { useState, useMemo, FormEvent } from 'react';
import { TodoTask, ViewTab } from '../types';
import { formatCurrency } from '../utils/accounting';
import { SearchableCombobox } from './SearchableCombobox';
import { getActiveUserName } from '../services/userService';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Calendar, 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  Building2, 
  Search, 
  X,
  AlertCircle,
  Clock,
  RotateCcw,
  Check,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';

interface TodoistViewProps {
  tasks: TodoTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<TodoTask, 'id' | 'createdAt'>) => void;
  onUpdateTask?: (task: TodoTask) => void;
  onDeleteTask: (id: string) => void;
  onNavigateTab?: (tab: ViewTab) => void;
}

type TimeHorizon = 'today' | 'this_month' | 'overdue' | 'completed' | 'all';
type PriorityFilter = 'all' | 'urgent' | 'high' | 'medium' | 'low';
type CategoryFilter = 'all' | 'tax' | 'payroll' | 'contractor' | 'banking' | 'retention' | 'billing' | 'general';

export function TodoistView({
  tasks,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onNavigateTab
}: TodoistViewProps) {
  // Current active date reference
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Filter States
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('this_month');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');

  // New Task Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<'expense' | 'income'>('expense');
  const [dueDate, setDueDate] = useState('2026-09-15');
  const [priority, setPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('high');
  const [category, setCategory] = useState<'tax' | 'payroll' | 'contractor' | 'banking' | 'retention' | 'billing' | 'general'>('tax');
  const [amount, setAmount] = useState<string>('');
  const [project, setProject] = useState<string>('(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)');
  const [company, setCompany] = useState<string>('บจก. บุรีรัมย์ธงชัยก่อสร้าง');
  const [assignedTo, setAssignedTo] = useState<string>(() => getActiveUserName());

  const commonTaskTemplates = [
    'ยื่นแบบและชำระ ภ.ง.ด.1 (หัก ณ ที่จ่ายเงินเดือน)',
    'ยื่นแบบและชำระ ภ.ง.ด.3 (หัก ณ ที่จ่ายบุคคลธรรมดา)',
    'ยื่นแบบและชำระ ภ.ง.ด.53 (หัก ณ ที่จ่ายนิติบุคคล)',
    'ยื่นแบบและชำระ ภ.พ.30 (ภาษีมูลค่าเพิ่ม VAT)',
    'นำส่งเงินสมทบกองทุนประกันสังคม (สปส. 1-10)',
    'จ่ายเงินเดือนพนักงานประจำงวดสิ้นเดือน',
    'จ่ายค่าแรงงานรายวันคนงานไซต์ก่อสร้าง',
    'ตรวจรับค่างวดงานผู้รับเหมาช่วง (Subcontract)',
    'จ่ายค่างวดงานผู้รับเหมาช่วง',
    'ตัดจ่ายเช็คซัพพลายเออร์ค่าวัสดุก่อสร้าง',
    'ขอคืนเงินประกันผลงานสัญญาจ้าง (Retention)',
    'ต่ออายุหนังสือค้ำประกันสัญญา (Bank Guarantee)'
  ];

  const uniqueProjects = useMemo(() => {
    const fromTasks = tasks.map(t => t.project).filter((p): p is string => Boolean(p));
    const defaults = [
      '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
      '(39)ทล.214 สาย อ.ปราสาท-บ.ระแงง จ.สุรินทร์',
      '(40)โครงการก่อสร้างทางเลี่ยงเมืองบุรีรัมย์',
      '(41)งานปรับปรุงผิวจราจร แอสฟัลต์คอนกรีต สาย 226',
      'สำนักงานใหญ่ / ส่วนกลาง'
    ];
    return Array.from(new Set([...fromTasks, ...defaults]));
  }, [tasks]);

  const groupCompanies = [
    'บจก. บุรีรัมย์ธงชัยก่อสร้าง',
    'บจก. บุรีรัมย์ธงชัยพัฒนา',
    'บจก. บีทีซี เพิ่มพูนทรัพย์ คอนกรีต',
    'บจก. ไทย บุรีรัมย์ ธงชัยการก่อสร้าง'
  ];

  const commonAssignees = [
    'ฝ่ายการเงินและบัญชี',
    'ฝ่ายบุคคล (HR)',
    'ฝ่ายจัดซื้อ',
    'วิศวกรภาคสนาม',
    'ผู้จัดการโครงการ',
    'ฝ่ายนิติการ/สัญญา',
    'ผู้บริหาร'
  ];

  // Reschedule Task Modal State
  const [reschedulingTask, setReschedulingTask] = useState<TodoTask | null>(null);
  const [newDueDate, setNewDueDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // 1. One-Click Monthly Tax & Compliance Checklist Generator
  const handleGenerateTaxChecklist = () => {
    const defaultTaxItems: Omit<TodoTask, 'id' | 'createdAt'>[] = [
      {
        title: 'ยื่นแบบและชำระ ภ.ง.ด.1 (หักภาษี ณ ที่จ่ายเงินเดือนพนักงาน)',
        description: 'รวมยอดเงินเดือนพนักงานประมาณ 120 ราย ยื่นผ่าน e-Filing กรมสรรพากร',
        dueDate: `${selectedMonth}-15`,
        priority: 'urgent',
        category: 'tax',
        type: 'expense',
        completed: false,
        amount: 87500,
        company: 'บจก. บุรีรัมย์ธงชัยก่อสร้าง'
      },
      {
        title: 'ยื่นแบบและชำระ ภ.ง.ด.3 (หัก ณ ที่จ่ายบุคคลธรรมดา)',
        description: 'รวบรวมใบเสร็จค่าจ้างช่างและผู้รับเหมาบุคคลธรรมดาประจำเดือน',
        dueDate: `${selectedMonth}-15`,
        priority: 'urgent',
        category: 'tax',
        type: 'expense',
        completed: false,
        amount: 35000,
        company: 'บจก. บุรีรัมย์ธงชัยก่อสร้าง'
      },
      {
        title: 'ยื่นแบบและชำระ ภ.ง.ด.53 (หัก ณ ที่จ่ายนิติบุคคล)',
        description: 'ซัพพลายเออร์วัสดุ, ค่าคอนกรีต, ค่าอะไหล่, ค่าเช่าเครื่องจักร',
        dueDate: `${selectedMonth}-15`,
        priority: 'urgent',
        category: 'tax',
        type: 'expense',
        completed: false,
        amount: 150000,
        company: 'บจก. บุรีรัมย์ธงชัยก่อสร้าง'
      },
      {
        title: 'ยื่นแบบและชำระภาษีมูลค่าเพิ่ม ภ.พ.30 ประจำเดือน',
        description: 'สรุปภาษีซื้อ-ภาษีขาย รายการค้าโครงการ ทล.24 และส่วนกลาง',
        dueDate: `${selectedMonth}-23`,
        priority: 'high',
        category: 'tax',
        type: 'expense',
        completed: false,
        amount: 45000,
        company: 'บจก. บุรีรัมย์ธงชัยก่อสร้าง'
      },
      {
        title: 'นำส่งเงินสมทบกองทุนประกันสังคม (สปส.) ประจำเดือน',
        description: 'ชำระผ่านระบบ e-Payment สำนักงานประกันสังคม',
        dueDate: `${selectedMonth}-15`,
        priority: 'high',
        category: 'payroll',
        type: 'expense',
        completed: false,
        amount: 152000,
        company: 'บจก. บุรีรัมย์ธงชัยก่อสร้าง'
      },
      {
        title: 'รอบตัดจ่ายเงินเดือนพนักงาน (Payroll ประจำเดือน)',
        description: 'โอนจ่ายเงินเดือนพนักงานสำนักงานและฝ่ายสนามทุกโครงการ',
        dueDate: `${selectedMonth}-30`,
        priority: 'urgent',
        category: 'payroll',
        type: 'expense',
        completed: false,
        amount: 1850000,
        company: 'บจก. บุรีรัมย์ธงชัยก่อสร้าง'
      }
    ];

    defaultTaxItems.forEach(item => onAddTask(item));
  };

  // 2. Submit New Task Form
  const handleSubmitNewTask = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      priority,
      category,
      completed: false,
      type: taskType,
      amount: amount ? parseFloat(amount) : undefined,
      project: project.trim() || undefined,
      company: company.trim() || undefined,
      assignedTo: assignedTo.trim() || undefined
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setAmount('');
    setIsFormOpen(false);
  };

  // 3. Confirm Reschedule Task
  const handleConfirmReschedule = () => {
    if (!reschedulingTask || !newDueDate) return;
    if (onUpdateTask) {
      onUpdateTask({
        ...reschedulingTask,
        dueDate: newDueDate,
        originalDueDate: reschedulingTask.originalDueDate || reschedulingTask.dueDate,
        rescheduleReason: rescheduleReason.trim() || undefined
      });
    }
    setReschedulingTask(null);
    setNewDueDate('');
    setRescheduleReason('');
  };

  // 4. Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);
    const urgent = pending.filter(t => t.priority === 'urgent');
    const overdue = pending.filter(t => t.dueDate < todayStr);
    const thisMonth = pending.filter(t => t.dueDate.startsWith(selectedMonth));
    const totalAmount = pending.reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      total,
      pendingCount: pending.length,
      completedCount: completed.length,
      urgentCount: urgent.length,
      overdueCount: overdue.length,
      thisMonthCount: thisMonth.length,
      totalAmount
    };
  }, [tasks, todayStr, selectedMonth]);

  // 5. Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Time horizon
      if (timeHorizon === 'today') {
        if (task.dueDate !== todayStr) return false;
      } else if (timeHorizon === 'this_month') {
        if (!task.dueDate.startsWith(selectedMonth)) return false;
      } else if (timeHorizon === 'overdue') {
        if (task.completed || task.dueDate >= todayStr) return false;
      } else if (timeHorizon === 'completed') {
        if (!task.completed) return false;
      }

      // Category
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

      // Priority
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullText = `${task.title} ${task.description || ''} ${task.project || ''} ${task.company || ''} ${task.assignedTo || ''}`.toLowerCase();
        if (!fullText.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      // Completed last
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      // Overdue first, then ascending by due date
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [tasks, timeHorizon, categoryFilter, priorityFilter, searchQuery, todayStr, selectedMonth]);

  // Group by date
  const groupedTasks = useMemo(() => {
    const map = new Map<string, TodoTask[]>();
    filteredTasks.forEach(task => {
      const d = task.dueDate || 'ไม่ระบุวันที่';
      if (!map.has(d)) {
        map.set(d, []);
      }
      map.get(d)!.push(task);
    });
    return Array.from(map.entries()).sort(([dA], [dB]) => dA.localeCompare(dB));
  }, [filteredTasks]);

  return (
    <div className="space-y-4 pb-8 max-w-7xl mx-auto">
      
      {/* 1. Header Bar: Corporate Planning & Compliance Desk */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                วางแผนงาน & ภาระผูกพันองค์กร (Corporate Tasks & Planner)
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                Compliance Desk
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ติดตามกำหนดการยื่นภาษี (ภ.ง.ด./ภ.พ.), เงินสมทบ สปส., รอบจ่ายเงินเดือน, นัดหมาย และภาระผูกพันองค์กร
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleGenerateTaxChecklist}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 shadow-xs transition-all cursor-pointer"
            title="สร้างชุดงานภาษี ภ.ง.ด.1, 3, 53, ภ.พ.30, เงินเดือน และ สปส. ประจำเดือน"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>+ เช็คลิสต์ภาษี & สปส. ประจำเดือน</span>
          </button>

          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#005aa9] hover:bg-blue-800 text-white shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ เพิ่มภาระงานใหม่</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Pending Tasks */}
        <div 
          onClick={() => setTimeHorizon('this_month')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white shadow-xs ${
            timeHorizon === 'this_month' ? 'border-[#005aa9] ring-2 ring-[#005aa9]/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">ภาระงานเดือนนี้</span>
            <Calendar className="w-4 h-4 text-[#005aa9]" />
          </div>
          <div className="mt-1.5 text-xl font-mono font-black text-slate-900">
            {stats.thisMonthCount} <span className="text-xs font-normal text-slate-500">งาน</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">รอบเดือน {selectedMonth}</span>
        </div>

        {/* Metric 2: Urgent Tasks */}
        <div 
          onClick={() => { setPriorityFilter('urgent'); setTimeHorizon('all'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white shadow-xs ${
            priorityFilter === 'urgent' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-700">
            <span className="font-semibold">งานด่วนที่สุด</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1.5 text-xl font-mono font-black text-amber-700">
            {stats.urgentCount} <span className="text-xs font-normal text-amber-900">งาน</span>
          </div>
          <span className="text-[10px] text-amber-800 mt-0.5 block">ต้องดำเนินการทันที</span>
        </div>

        {/* Metric 3: Overdue */}
        <div 
          onClick={() => setTimeHorizon('overdue')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white shadow-xs ${
            timeHorizon === 'overdue' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-700">
            <span className="font-semibold">งานเกินกำหนด</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-1.5 text-xl font-mono font-black text-rose-700">
            {stats.overdueCount} <span className="text-xs font-normal text-rose-800">งาน</span>
          </div>
          <span className="text-[10px] text-rose-800 mt-0.5 block">ต้องเลื่อนหรือเคลียร์ด่วน</span>
        </div>

        {/* Metric 4: Completed */}
        <div 
          onClick={() => setTimeHorizon('completed')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white shadow-xs ${
            timeHorizon === 'completed' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-700">
            <span className="font-semibold">เสร็จสิ้นแล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-[#009540]" />
          </div>
          <div className="mt-1.5 text-xl font-mono font-black text-[#009540]">
            {stats.completedCount} <span className="text-xs font-normal text-emerald-900">งาน</span>
          </div>
          <span className="text-[10px] text-emerald-800 mt-0.5 block">ปิดภาระงานแล้ว</span>
        </div>
      </div>

      {/* 3. Filter & Control Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          
          {/* Time Horizon Buttons */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setTimeHorizon('this_month')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeHorizon === 'this_month'
                  ? 'bg-[#005aa9] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              เดือนนี้ ({stats.thisMonthCount})
            </button>

            <button
              onClick={() => setTimeHorizon('today')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeHorizon === 'today'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              วันนี้
            </button>

            <button
              onClick={() => setTimeHorizon('overdue')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeHorizon === 'overdue'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              เกินกำหนด ({stats.overdueCount})
            </button>

            <button
              onClick={() => setTimeHorizon('completed')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeHorizon === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              เสร็จแล้ว ({stats.completedCount})
            </button>

            <button
              onClick={() => setTimeHorizon('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeHorizon === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({stats.total})
            </button>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-1.5 self-start md:self-auto text-xs">
            <span className="text-slate-500 font-medium">รอบเดือน:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 font-bold text-slate-900 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-[#005aa9] cursor-pointer"
            >
              <option value="2026-08">สิงหาคม 2569</option>
              <option value="2026-09">กันยายน 2569 (ปัจจุบัน)</option>
              <option value="2026-10">ตุลาคม 2569</option>
              <option value="2026-11">พฤศจิกายน 2569</option>
              <option value="2026-12">ธันวาคม 2569</option>
            </select>
          </div>
        </div>

        {/* Secondary Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
            >
              <option value="all">ทุกหมวดหมู่ภาระงาน</option>
              <option value="tax">ภาษี & สรรพากร</option>
              <option value="payroll">เงินเดือน & ประกันสังคม (สปส.)</option>
              <option value="contractor">ผู้รับเหมา & ซัพพลายเออร์</option>
              <option value="banking">ธนาคาร & สินเชื่อ</option>
              <option value="billing">ค่างวดงาน & เรียกเก็บ</option>
              <option value="retention">เงินค้ำประกันผลงาน</option>
              <option value="general">งานทั่วไป / นิติการ</option>
            </select>

            {/* Priority Dropdown */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
            >
              <option value="all">ทุกระดับความเร่งด่วน</option>
              <option value="urgent">🔥 ด่วนที่สุด (Urgent)</option>
              <option value="high">สูง (High)</option>
              <option value="medium">ปานกลาง (Medium)</option>
              <option value="low">ทั่วไป (Low)</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาภาระงาน, ผู้รับผิดชอบ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#005aa9]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Task List Grouped by Date */}
      <div className="space-y-3">
        {groupedTasks.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-dashed border-slate-200 text-center">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">ไม่มีภาระงานในเงื่อนไขนี้</p>
            <p className="text-xs text-slate-400 mt-0.5">
              คลิกปุ่ม &quot;+ เช็คลิสต์ภาษี & สปส.&quot; หรือ &quot;+ เพิ่มภาระงานใหม่&quot; เพื่อบันทึกงานที่ต้องทำ
            </p>
          </div>
        ) : (
          groupedTasks.map(([dateKey, tasksInDate]) => {
            const isToday = dateKey === todayStr;
            const isOverdue = dateKey < todayStr;

            return (
              <div key={dateKey} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                {/* Date Header */}
                <div className={`px-4 py-2 border-b flex items-center justify-between text-xs font-bold ${
                  isToday 
                    ? 'bg-amber-50 text-amber-900 border-amber-200' 
                    : isOverdue 
                    ? 'bg-rose-50 text-rose-900 border-rose-200' 
                    : 'bg-slate-50 text-slate-800 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>กำหนดส่ง: <strong className="font-mono">{dateKey}</strong></span>
                    {isToday && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-600 text-white font-bold">
                        วันนี้
                      </span>
                    )}
                    {isOverdue && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-600 text-white font-bold">
                        เกินกำหนด
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-500 font-normal">
                    {tasksInDate.length} งาน
                  </span>
                </div>

                {/* Tasks List */}
                <div className="divide-y divide-slate-100">
                  {tasksInDate.map(task => (
                    <div 
                      key={task.id} 
                      className={`p-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/80 transition-colors ${
                        task.completed ? 'opacity-60 bg-slate-50/50' : ''
                      }`}
                    >
                      {/* Left: Checkbox & Info */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="mt-0.5 shrink-0 text-slate-400 hover:text-[#009540] transition-colors cursor-pointer"
                          title={task.completed ? 'ทำเครื่องหมายว่ายังไม่เสร็จ' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}
                        >
                          {task.completed ? (
                            <CheckSquare className="w-4 h-4 text-[#009540]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Priority Tag */}
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              task.priority === 'urgent'
                                ? 'bg-rose-100 text-rose-800'
                                : task.priority === 'high'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {task.priority === 'urgent' ? '🔥 ด่วนที่สุด' : task.priority === 'high' ? 'สูง' : 'ปกติ'}
                            </span>

                            {/* Category Tag */}
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                              {task.category === 'tax' ? 'ภาษี' :
                               task.category === 'payroll' ? 'เงินเดือน/สปส.' :
                               task.category === 'contractor' ? 'ผู้รับเหมา' :
                               task.category === 'banking' ? 'ธนาคาร' :
                               task.category === 'billing' ? 'ค่างวด' :
                               task.category === 'retention' ? 'เงินประกัน' : 'ทั่วไป'}
                            </span>

                            {/* Title */}
                            <span className={`text-xs sm:text-sm font-bold ${
                              task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}>
                              {task.title}
                            </span>

                            {/* Reschedule Note */}
                            {task.originalDueDate && task.originalDueDate !== task.dueDate && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                                <RotateCcw className="w-2.5 h-2.5 text-amber-600" />
                                เลื่อนจาก {task.originalDueDate} ({task.rescheduleReason || 'จัดรอบจ่ายใหม่'})
                              </span>
                            )}
                          </div>

                          {task.description && (
                            <p className="text-xs text-slate-500 mt-1 leading-snug">
                              {task.description}
                            </p>
                          )}

                          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                            {task.project && (
                              <span className="flex items-center gap-1 text-slate-600">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                {task.project}
                              </span>
                            )}
                            {task.assignedTo && (
                              <span>ผู้รับผิดชอบ: <strong className="text-slate-700">{task.assignedTo}</strong></span>
                            )}
                            {task.company && (
                              <span>{task.company}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        {task.amount !== undefined && task.amount > 0 && (
                          <div className="text-right font-mono">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                              {formatCurrency(task.amount)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans">ยอดผูกพัน</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          {/* Reschedule Button */}
                          <button
                            onClick={() => {
                              setReschedulingTask(task);
                              setNewDueDate(task.dueDate);
                              setRescheduleReason(task.rescheduleReason || '');
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="เลื่อนกำหนดการ"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="ลบภาระงานนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. New Task Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">เพิ่มภาระงาน & กำหนดการใหม่</h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewTask} className="p-4 space-y-3">
              <div>
                <SearchableCombobox
                  label="ชื่องาน / ภาระผูกพัน"
                  required
                  value={title}
                  onChange={(val) => setTitle(val)}
                  options={commonTaskTemplates}
                  datalistId="dl-todo-titles"
                  placeholder="เลือกหรือพิมพ์ชื่องาน/ภาระผูกพัน"
                  allowCustom={true}
                  accentColor="blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รายละเอียดเพิ่มเติม
                </label>
                <textarea
                  rows={2}
                  placeholder="รายละเอียดเอกสาร, เลขที่สัญญา หรือขั้นตอนปฏิบัติ"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#005aa9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    กำหนดวันที่ (Due Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#005aa9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ความเร่งด่วน *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#005aa9]"
                  >
                    <option value="urgent">🔥 ด่วนที่สุด (Urgent)</option>
                    <option value="high">สูง (High)</option>
                    <option value="medium">ปานกลาง (Medium)</option>
                    <option value="low">ทั่วไป (Low)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    หมวดหมู่งาน *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#005aa9]"
                  >
                    <option value="tax">ภาษี & สรรพากร</option>
                    <option value="payroll">เงินเดือน & สปส.</option>
                    <option value="contractor">ผู้รับเหมา & ซัพพลายเออร์</option>
                    <option value="banking">ธนาคาร & สินเชื่อ</option>
                    <option value="billing">ค่างวดงาน & เรียกเก็บ</option>
                    <option value="retention">เงินประกันผลงาน</option>
                    <option value="general">งานทั่วไป / นิติการ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ยอดเงินที่เกี่ยวข้อง (บาท)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00 (ไม่บังคับ)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#005aa9] font-mono"
                  />
                </div>
              </div>

              <div>
                <SearchableCombobox
                  label="โครงการที่เกี่ยวข้อง"
                  value={project}
                  onChange={(val) => setProject(val)}
                  options={uniqueProjects}
                  datalistId="dl-projects"
                  placeholder="เลือกหรือระบุโครงการ"
                  allowCustom={true}
                  accentColor="blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SearchableCombobox
                    label="บริษัทในเครือ"
                    value={company}
                    onChange={(val) => setCompany(val)}
                    options={groupCompanies}
                    datalistId="dl-companies"
                    placeholder="เลือกบริษัท"
                    allowCustom={true}
                    accentColor="blue"
                  />
                </div>

                <div>
                  <SearchableCombobox
                    label="ผู้รับผิดชอบ"
                    value={assignedTo}
                    onChange={(val) => setAssignedTo(val)}
                    options={commonAssignees}
                    datalistId="dl-assignees"
                    placeholder="เลือกหรือระบุผู้รับผิดชอบ"
                    allowCustom={true}
                    accentColor="blue"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#005aa9] hover:bg-blue-800 rounded-lg shadow-xs cursor-pointer"
                >
                  บันทึกภาระงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Reschedule Task Modal */}
      {reschedulingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-700" />
                <h3 className="text-sm font-bold text-amber-900">เลื่อนกำหนดการภาระงาน</h3>
              </div>
              <button
                onClick={() => setReschedulingTask(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <span className="text-xs text-slate-500 block">ภาระงาน:</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{reschedulingTask.title}</p>
                <span className="text-[11px] text-slate-400">กำหนดเดิม: {reschedulingTask.dueDate}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  กำหนดวันที่ใหม่ *
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เหตุผลในการเลื่อน
                </label>
                <input
                  type="text"
                  list="dl-remarks"
                  placeholder="เช่น รอเอกสารประกอบจากสรรพากร, เลื่อนตามรอบเงินเดือน"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReschedulingTask(null)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReschedule}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs cursor-pointer"
                >
                  ยืนยันการเลื่อนกำหนด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
