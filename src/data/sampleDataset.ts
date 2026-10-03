import { Transaction } from '../types';
import { parseLedgerCSV } from '../utils/csvParser';
import { RAW_LEDGER_CSV } from './rawLedger';
import { RAW_LEDGER_CSV_PART2 } from './rawLedgerPart2';
import { RAW_LEDGER_CSV_PART3 } from './rawLedgerPart3';
import { compareTransactionsDesc } from '../utils/accounting';

const combinedCSV = `${RAW_LEDGER_CSV}\n${RAW_LEDGER_CSV_PART2}\n${RAW_LEDGER_CSV_PART3}`;
export const INITIAL_TRANSACTIONS: Transaction[] = parseLedgerCSV(combinedCSV).sort(compareTransactionsDesc);
export const initialTransactions = INITIAL_TRANSACTIONS;

export const INITIAL_TODOS = [
  {
    id: 'todo-1',
    title: 'ยื่นแบบและชำระ ภ.ง.ด.1 (หัก ณ ที่จ่ายเงินเดือนพนักงาน)',
    description: 'รวบรวมยอดภาษีหัก ณ ที่จ่ายเงินเดือนพนักงานประจำเดือน ยื่นผ่าน e-Filing กรมสรรพากร ภายในวันที่ 15',
    dueDate: '2026-09-15',
    priority: 'urgent' as const,
    category: 'tax' as const,
    completed: false,
    company: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
    amount: 87516.00,
    createdAt: '2026-08-28'
  },
  {
    id: 'todo-2',
    title: 'ยื่นแบบและชำระ ภ.ง.ด.3 และ ภ.ง.ด.53 (บุคคลธรรมดา/นิติบุคคล)',
    description: 'ตรวจสอบใบเสร็จรับเงิน/ใบกำกับภาษี และหนังสือรับรองการหักภาษี ณ ที่จ่าย ของผู้รับเหมาและซัพพลายเออร์',
    dueDate: '2026-09-15',
    priority: 'urgent' as const,
    category: 'tax' as const,
    completed: false,
    company: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
    amount: 219209.88,
    createdAt: '2026-08-28'
  },
  {
    id: 'todo-3',
    title: 'ยื่นแบบและชำระภาษีมูลค่าเพิ่ม ภ.พ.30 ประจำเดือนสิงหาคม 2569',
    description: 'กระทบยอดภาษีซื้อ (Input Tax) และภาษีขาย (Output Tax) ของโครงการ ทล.24 และสำนักงานใหญ่',
    dueDate: '2026-09-23',
    priority: 'high' as const,
    category: 'tax' as const,
    completed: false,
    company: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
    amount: 19778.00,
    createdAt: '2026-08-28'
  },
  {
    id: 'todo-4',
    title: 'จ่ายเงินสมทบประกันสังคม (สปส.) ประจำเดือนสิงหาคม (110 ราย)',
    description: 'โอนชำระเงินสมทบกองทุนประกันสังคมสำนักงานประกันสังคมจังหวัดบุรีรัมย์ ภายในวันที่ 15',
    dueDate: '2026-09-15',
    priority: 'high' as const,
    category: 'payroll' as const,
    completed: false,
    company: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
    amount: 146832.00,
    createdAt: '2026-08-28'
  },
  {
    id: 'todo-5',
    title: 'ติดตามตั๋วสัญญาใช้เงิน P/N และค่าผลงานค่างวด ทล.24 ตอน 2 งวดที่ 6',
    description: 'ประสานงานกับธนาคารกรุงเทพ เรื่องเอกสารเบิกจ่ายตั๋ว P/N against work done และรอรับเงินค่างวดงานทางหลวง',
    dueDate: '2026-09-10',
    priority: 'high' as const,
    category: 'banking' as const,
    completed: false,
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    company: 'กิจการร่วมค้า บีทีซี - พีซี',
    amount: 39577996.33,
    createdAt: '2026-08-28'
  },
  {
    id: 'todo-6',
    title: 'ตรวจสอบและคืนเงินประกันผลงาน (Retention 5-10%) ผู้รับเหมาช่วง',
    description: 'เช็คยอดประกันผลงาน หจ. ปิยะวิลล์, บจ. พิชชญา และ บจ. ไฮคอน ตามรอบตรวจรับงาน',
    dueDate: '2026-09-25',
    priority: 'medium' as const,
    category: 'retention' as const,
    completed: false,
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    amount: 1563972.62,
    createdAt: '2026-08-28'
  },
  {
    id: 'todo-7',
    title: 'สรุปค่าน้ำมันดีเซลและ Fleet Card ประจำเดือน ก.ย.',
    description: 'กระทบยอดค่าน้ำมันดีเซล บจก.จักราชการปิโตรเลียม, บจก.วายเอ็ม พลัส และ PTT Fleet Card หน้างาน',
    dueDate: '2026-09-30',
    priority: 'medium' as const,
    category: 'general' as const,
    completed: false,
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    createdAt: '2026-08-28'
  }
];
export const initialTodoTasks = INITIAL_TODOS;
