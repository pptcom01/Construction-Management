import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { 
  Transaction, 
  Disbursement, 
  Subcontract, 
  SubcontractInspection, 
  SubcontractPaymentClaim, 
  MaterialBackchargeItem, 
  GoodsReceiptItem, 
  SupplierBilling, 
  RFQComparisonItem, 
  TodoTask 
} from '../types';
import { buildFrequentSuggestions, findMostFrequentBankForPayee, cleanPayeeName } from '../utils/databaseDatalist';
import { INITIAL_DISBURSEMENTS } from '../utils/disbursementData';

export interface DatabaseSuggestionsData {
  payees: string[];
  bankAccounts: string[];
  bankNames: string[];
  itemDescriptions: string[];
  projects: string[];
  companies: string[];
  expenseTypes: string[];
  boqTypes: string[];
  txCategories: string[];
  requesters: string[];
  inspectors: string[];
  receivers: string[];
  refDocNos: string[];
  expressPoNos: string[];
  deliveryOrderNos: string[];
  invoiceNos: string[];
  units: string[];
  remarks: string[];
  taxIds: string[];
  addresses: string[];
  positions: string[];
  locations: string[];
  todoTitles: string[];
  todoAssignees: string[];
  getBankForPayee: (payeeName: string) => string | null;
}

const DatabaseSuggestionsContext = createContext<DatabaseSuggestionsData | null>(null);

export interface DatabaseSuggestionsProviderProps {
  children: ReactNode;
  transactions?: Transaction[];
  disbursements?: Disbursement[];
  subcontracts?: Subcontract[];
  inspections?: SubcontractInspection[];
  paymentClaims?: SubcontractPaymentClaim[];
  backcharges?: MaterialBackchargeItem[];
  goodsReceipts?: GoodsReceiptItem[];
  billings?: SupplierBilling[];
  rfqItems?: RFQComparisonItem[];
  todoTasks?: TodoTask[];
}

export function DatabaseSuggestionsProvider({
  children,
  transactions = [],
  disbursements = [],
  subcontracts = [],
  inspections = [],
  paymentClaims = [],
  backcharges = [],
  goodsReceipts = [],
  billings = [],
  rfqItems = [],
  todoTasks = []
}: DatabaseSuggestionsProviderProps) {

  const suggestions: DatabaseSuggestionsData = useMemo(() => {
    // รวมประวัติการเบิกจ่ายจาก Supabase เข้ากับฐานข้อมูลตั้งต้นของบริษัท (Real Company Records)
    const allDisbursements = disbursements && disbursements.length > 0
      ? [...disbursements, ...INITIAL_DISBURSEMENTS]
      : INITIAL_DISBURSEMENTS;

    // 1. รวบรวมข้อมูลผู้รับเงิน / ร้านค้า / ช่างเหมา / คู่ค้า
    const rawPayees: string[] = [
      ...allDisbursements.map(d => cleanPayeeName(d.payeeName)),
      ...allDisbursements.map(d => d.payeeName),
      ...transactions.map(t => t.payeeName || ''),
      ...subcontracts.map(s => s.contractorName),
      ...backcharges.map(b => b.vendorName),
      ...backcharges.map(b => b.contractorName || ''),
      ...goodsReceipts.map(g => g.vendorName),
      ...goodsReceipts.map(g => g.contractorName || ''),
      ...billings.map(b => b.vendorName),
      ...paymentClaims.flatMap(c => c.deductionItems?.map(d => d.storeOrVendorName || '') || []),
      ...rfqItems.flatMap(r => r.quotations?.map(q => q.vendorName) || [])
    ];

    const initialPayeeSeeds = [
      'หจก. บุรีรัมย์ศิลาชัย',
      'บจก. สุรินทร์คอนกรีตโปรดักส์',
      'หจก. ปิยะวิลล์คอนสตรัคชั่น',
      'บจก. ชลประทานซีเมนต์',
      'โรงงาน ป.ศิลาชัย คอนกรีต',
      'บจก. สยามซีเมนต์ (ท่าลาน)',
      'ปั๊มน้ำมัน ปตท. ท่องเที่ยวบุรีรัมย์',
      'ร้าน ส.สมพรพาณิชย์ บุรีรัมย์'
    ];

    const payees = buildFrequentSuggestions(rawPayees, {
      initialSeeds: initialPayeeSeeds,
      minLength: 2,
      limit: 150
    });

    // 2. รวบรวมบัญชีธนาคารปลายทางและต้นทาง
    const rawBankAccounts: string[] = [
      ...allDisbursements.map(d => d.payeeBankAccount),
      ...subcontracts.map(s => s.defaultBankAccount || ''),
      ...transactions.map(t => t.account),
      ...allDisbursements.map(d => d.payerAccount)
    ];

    const bankAccounts = buildFrequentSuggestions(rawBankAccounts, {
      minLength: 4,
      limit: 100
    });

    // 3. รวบรวมชื่อธนาคาร
    const rawBankNames: string[] = [
      ...allDisbursements.map(d => d.payeeBankName || ''),
      ...subcontracts.map(s => s.defaultBankName || ''),
      'ธนาคารกรุงเทพ (BBL)',
      'ธนาคารกสิกรไทย (KBANK)',
      'ธนาคารไทยพาณิชย์ (SCB)',
      'ธนาคารกรุงไทย (KTB)',
      'ธนาคารกรุงศรีอยุธยา (BAY)',
      'ธนาคารทหารไทยธนชาต (TTB)',
      'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)',
      'ธนาคารออมสิน (GSB)'
    ];

    const bankNames = buildFrequentSuggestions(rawBankNames, {
      minLength: 2,
      limit: 30
    });

    // 4. รวบรวมรายละเอียดรายการค่าใช้จ่าย / พัสดุ / บริการ (Item Descriptions)
    const rawItemDescriptions: string[] = [
      ...disbursements.flatMap(d => d.items?.map(it => it.description) || []),
      ...transactions.map(t => t.description),
      ...subcontracts.map(s => s.contractTitle || s.workCategory || ''),
      ...backcharges.map(b => b.materialDescription),
      ...goodsReceipts.map(g => g.materialDescription),
      ...billings.flatMap(b => b.items?.map(it => it.description) || []),
      ...rfqItems.map(r => r.materialName),
      ...paymentClaims.flatMap(c => c.deductionItems?.map(d => d.description || '') || [])
    ];

    const initialItemSeeds = [
      'ค่าน้ำมันเชื้อเพลิงดีเซล B7',
      'ค่าหินคลุก 3/4',
      'ค่าทรายถมหยาบ',
      'ค่าทรายขี้เป็ด',
      'ค่าคอนกรีตผสมเสร็จ 240 ksc cylinder',
      'ค่าคอนกรีตผสมเสร็จ 280 ksc cylinder',
      'ค่าคอนกรีตผสมเสร็จ 350 ksc cube',
      'ค่าเหล็กเส้นกลม RB9 มอก.',
      'ค่าเหล็กข้ออ้อย DB12 มอก.',
      'ค่าเหล็กข้ออ้อย DB16 มอก.',
      'ค่าเหล็กข้ออ้อย DB20 มอก.',
      'ค่าเหล็กข้ออ้อย DB25 มอก.',
      'ค่าลวดผูกเหล็ก เบอร์ 18',
      'ค่าตะแกรงเหล็กไวร์เมช 4 มม. @ 20x20 ซม.',
      'ค่าท่อระบายน้ำ คสล. ชั้น 3 ขนาด 0.60 ม.',
      'ค่าท่อระบายน้ำ คสล. ชั้น 3 ขนาด 0.80 ม.',
      'ค่าท่อระบายน้ำ คสล. ชั้น 3 ขนาด 1.00 ม.',
      'ค่ายางมะตอย แอสฟัลต์ติกคอนกรีต',
      'ค่ายาง Prime Coat (CSS-1)',
      'ค่ายาง Tack Coat (CRS-2)',
      'ค่าแรงช่างวางท่อระบายน้ำ คสล.',
      'ค่าแรงช่างผูกเหล็กและเทคอนกรีต',
      'ค่าแรงช่างติดตั้งกำแพงกันดิน MSE Wall',
      'ค่าจ้างขุดรื้อดินและถมบดอัดคันทาง',
      'ค่าซ่อมบำรุงและเปลี่ยนถ่ายน้ำมันเครื่องรถแบคโฮ',
      'ค่าอะไหล่ฟันบุ้งกี๋และใบมีดเกรดเดอร์',
      'ค่าเบี้ยเลี้ยงและสำรองจ่ายหน้างาน',
      'ค่าไฟฟ้าและสาธารณูปโภคแคมป์คนงาน'
    ];

    const itemDescriptions = buildFrequentSuggestions(rawItemDescriptions, {
      initialSeeds: initialItemSeeds,
      minLength: 2,
      limit: 200
    });

    // 5. รวบรวมโครงการก่อสร้าง (Projects)
    const rawProjects: string[] = [
      ...disbursements.map(d => d.project),
      ...transactions.map(t => t.project),
      ...subcontracts.map(s => s.project),
      ...backcharges.map(b => b.project),
      ...goodsReceipts.map(g => g.project),
      ...billings.map(b => b.project),
      ...rfqItems.map(r => r.project),
      ...todoTasks.map(t => t.project || '')
    ];

    const initialProjectSeeds = [
      '(38) ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
      '(39) ทางเลี่ยงเมืองบุรีรัมย์ ด้านทิศตะวันตก',
      '(40) ถนนผังเมืองรวม บุรีรัมย์ ระยะที่ 2',
      '(41) สะพานข้ามทางรถไฟ อ.กระสัง จ.บุรีรัมย์',
      'โครงการงานทางทั่วไปและศูนย์ซ่อมบำรุงจักรกล'
    ];

    const projects = buildFrequentSuggestions(rawProjects, {
      initialSeeds: initialProjectSeeds,
      minLength: 3,
      limit: 50
    });

    // 6. รวบรวมชื่อบริษัท / กิจการ (Companies)
    const rawCompanies: string[] = [
      ...disbursements.map(d => d.company),
      ...transactions.map(t => t.company),
      ...todoTasks.map(t => t.company || '')
    ];

    const initialCompanySeeds = [
      'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
      'บริษัท บีทีซีพี คอนสตรัคชั่น จำกัด',
      'บริษัท บีทีซี-พีซี จำกัด',
      'ห้างหุ้นส่วนจำกัด ไทย บุรีรัมย์ก่อสร้าง'
    ];

    const companies = buildFrequentSuggestions(rawCompanies, {
      initialSeeds: initialCompanySeeds,
      minLength: 2,
      limit: 20
    });

    // 7. หมวดหมู่ค่าใช้จ่าย DBM (Expense Types)
    const rawExpenseTypes: string[] = [
      ...disbursements.map(d => d.expenseType)
    ];

    const initialExpenseSeeds = [
      'จ่ายชำระ ค่าวัสดุก่อสร้าง',
      'ค่าคอนกรีตผสมเสร็จ & ท่อระบายน้ำ',
      'ค่าเหล็กเส้น & ไวร์เมช',
      'ค่าหินคลุก & ทรายถม',
      'ค่าผลงานผู้รับเหมาช่วง',
      'ค่าน้ำมันเชื้อเพลิงดีเซล & หล่อลื่น',
      'ค่าอะไหล่ & ซ่อมบำรุงเครื่องจักร',
      'เงินเดือน & สำรองค่าแรง',
      'ภาษีหัก ณ ที่จ่าย ภ.ง.ด. 1, 3, 53',
      'ภาษีมูลค่าเพิ่ม ภ.พ.30',
      'ค่าสาธารณูปโภค (ไฟฟ้า, ประปา, สื่อสาร)',
      'ค่าใช้จ่ายทั่วไป / เงินสดย่อย'
    ];

    const expenseTypes = buildFrequentSuggestions(rawExpenseTypes, {
      initialSeeds: initialExpenseSeeds,
      minLength: 2,
      limit: 40
    });

    // 8. หมวดงาน BOQ (BOQ Types)
    const rawBoqTypes: string[] = [
      ...disbursements.map(d => d.boqType || ''),
      ...subcontracts.map(s => s.workCategory || ''),
      ...backcharges.map(b => b.boqCategory || ''),
      ...goodsReceipts.map(g => g.boqCategory || '')
    ];

    const initialBoqSeeds = [
      'งานโครงสร้างและวัสดุ',
      'งานผิวทางแอสฟัลต์ติกคอนกรีต',
      'งานทางเท้าและท่อระบายน้ำ',
      'งานสะพานและท่อเหลี่ยม',
      'งานกำแพงกันดิน MSE Wall',
      'งานไฟฟ้าส่องสว่างและป้ายจราจร',
      'งานบำรุงรักษาเครื่องจักรและยานพาหนะ',
      'งานเบ็ดเตล็ดและอำนวยความสะดวก'
    ];

    const boqTypes = buildFrequentSuggestions(rawBoqTypes, {
      initialSeeds: initialBoqSeeds,
      minLength: 2,
      limit: 30
    });

    // 9. ผังบัญชี / หมวดหมู่ GL (Transaction Categories)
    const rawTxCategories: string[] = [
      ...transactions.map(t => t.category)
    ];

    const txCategories = buildFrequentSuggestions(rawTxCategories, {
      initialSeeds: [...initialExpenseSeeds, 'รับค่างวดงานก่อสร้างทางหลวง', 'รับค่างวดงานตามสัญญา', 'รับเงินวางตั๋วสัญญาใช้เงิน (P/N)', 'โอนระหว่างบัญชีธนาคาร (ย้ายเงินสด)'],
      minLength: 2,
      limit: 50
    });

    // 10. บุคลากร / ผู้ขอเบิก / ผู้บันทึก (Requesters / Recorders)
    const rawRequesters: string[] = [
      ...disbursements.map(d => d.recordedBy),
      ...disbursements.map(d => d.reviewerName || ''),
      ...disbursements.map(d => d.approverName || ''),
      ...disbursements.map(d => d.financeRecordedBy || ''),
      ...transactions.map(t => t.reconciledBy || ''),
      ...todoTasks.map(t => t.assignedTo || '')
    ];

    const initialRequesterSeeds = [
      'น.ส.ปวีณา ใยอุ่น',
      'นายสมพร แสนสุข (ฝ่ายสโตร์)',
      'นายอานนท์ รุ่งเรือง (วิศวกรสนาม)',
      'น.ส.กมลทิพย์ กรมทอง (ฝ่ายการเงิน)',
      'นายธีรพงษ์ ผู้จัดการโครงการ',
      'นายชูชาติ บุญมี (ช่างเครื่องจักร)',
      'เจ้าหน้าที่การเงินและบัญชี'
    ];

    const requesters = buildFrequentSuggestions(rawRequesters, {
      initialSeeds: initialRequesterSeeds,
      minLength: 2,
      limit: 30
    });

    // 11. ผู้ตรวจงาน (Inspectors)
    const rawInspectors: string[] = [
      ...inspections.map(i => i.inspectorName),
      'นายอานนท์ รุ่งเรือง (วิศวกรควบคุมงาน)',
      'นายสมหมาย ชำนาญการ (นายช่างตรวจรับ)',
      'นายกิตติศักดิ์ พัฒนา (หัวหน้าผู้ควบคุมงาน)',
      'นายธีรพงษ์ ผู้จัดการโครงการ'
    ];

    const inspectors = buildFrequentSuggestions(rawInspectors, {
      minLength: 2,
      limit: 30
    });

    // 12. ผู้ตรวจรับพัสดุหน้างาน (Receivers)
    const rawReceivers: string[] = [
      ...backcharges.map(b => b.siteReceiverName),
      ...goodsReceipts.map(g => g.receiverName),
      ...billings.flatMap(b => b.items?.map(it => it.receiverName || '') || []),
      'นายสมพร แสนสุข (สโตร์กลาง)',
      'นายอานนท์ รุ่งเรือง (วิศวกรสนาม)',
      'นายชลิต ชูชีพ (ผู้ช่วยสโตร์หน้างาน)'
    ];

    const receivers = buildFrequentSuggestions(rawReceivers, {
      minLength: 2,
      limit: 30
    });

    // 13. เลขที่เอกสารอ้างอิง / Prefix (Ref Doc Nos)
    const rawRefDocs: string[] = [
      ...disbursements.map(d => d.refDocNo),
      ...transactions.map(t => t.refDocNo || ''),
      ...transactions.map(t => t.docNo)
    ];

    const refDocNos = buildFrequentSuggestions(rawRefDocs, {
      minLength: 2,
      limit: 50
    });

    // 14. เลขที่ PO Express
    const rawExpressPo: string[] = [
      ...backcharges.map(b => b.expressPoNo),
      ...goodsReceipts.map(g => g.expressPoNo),
      ...billings.flatMap(b => b.items?.map(it => it.expressPoNo) || []),
      ...rfqItems.map(r => r.expressPoNo || '')
    ];

    const expressPoNos = buildFrequentSuggestions(rawExpressPo, {
      minLength: 2,
      limit: 50
    });

    // 15. เลขที่ใบส่งของร้านค้า (DO)
    const rawDOs: string[] = [
      ...backcharges.map(b => b.deliveryOrderNo || ''),
      ...goodsReceipts.map(g => g.deliveryOrderNo),
      ...billings.flatMap(b => b.items?.map(it => it.doNo) || [])
    ];

    const deliveryOrderNos = buildFrequentSuggestions(rawDOs, {
      minLength: 2,
      limit: 50
    });

    // 16. เลขที่ใบกำกับภาษี (Invoices)
    const rawInvoices: string[] = [
      ...goodsReceipts.map(g => g.invoiceNo || ''),
      ...billings.flatMap(b => b.items?.map(it => it.invoiceNo || '') || [])
    ];

    const invoiceNos = buildFrequentSuggestions(rawInvoices, {
      minLength: 2,
      limit: 50
    });

    // 17. หน่วยนับ (Units)
    const rawUnits: string[] = [
      ...subcontracts.map(s => s.unit),
      ...backcharges.map(b => b.unit),
      ...goodsReceipts.map(g => g.unit),
      ...billings.flatMap(b => b.items?.map(it => it.unit || '') || []),
      ...rfqItems.map(r => r.unit)
    ];

    const initialUnits = [
      'ตร.ม.',
      'ลบ.ม.',
      'ตัน',
      'เที่ยว',
      'ชุด',
      'เมตร',
      'กม.',
      'จุด',
      'ต้น',
      'ท่อน',
      'แผ่น',
      'เส้น',
      'ลิตร',
      'กิโลกรัม',
      'คัน',
      'งวด'
    ];

    const units = buildFrequentSuggestions(rawUnits, {
      initialSeeds: initialUnits,
      minLength: 1,
      limit: 30
    });

    // 18. หมายเหตุที่ใช้บ่อย (Remarks)
    const rawRemarks: string[] = [
      ...disbursements.map(d => d.remarks),
      ...transactions.map(t => t.remarks),
      ...backcharges.map(b => b.notes || ''),
      ...goodsReceipts.map(g => g.notes || '')
    ];

    const initialRemarks = [
      'สำรองจ่ายหน้างาน',
      'จ่ายชำระตามรอบวางบิล',
      'มัดจำล่วงหน้า 30%',
      'จ่ายค่างวดงานตามสัญญา',
      'หัก ณ ที่จ่าย 3% ตามระเบียบสรรพากร',
      'โอนชำระตรงเข้าบัญชีผู้รับเหมา'
    ];

    const remarks = buildFrequentSuggestions(rawRemarks, {
      initialSeeds: initialRemarks,
      minLength: 2,
      limit: 50
    });

    // 19. เลขประจำตัวผู้เสียภาษี (Tax IDs)
    const rawTaxIds: string[] = [
      ...subcontracts.map(s => s.taxId || ''),
      ...billings.map(b => b.vendorTaxId || ''),
      ...goodsReceipts.map(g => g.vendorTaxId || '')
    ];

    const taxIds = buildFrequentSuggestions(rawTaxIds, {
      minLength: 9,
      limit: 50
    });

    // 20. ที่อยู่ผู้รับจ้าง/ร้านค้า (Addresses)
    const rawAddresses: string[] = [
      ...subcontracts.map(s => s.contractorAddress || ''),
      ...billings.map(b => b.vendorAddress || '')
    ];

    const addresses = buildFrequentSuggestions(rawAddresses, {
      minLength: 5,
      limit: 50
    });

    // 21. ตำแหน่งผู้มีอำนาจลงนาม (Positions)
    const rawPositions: string[] = [
      ...subcontracts.map(s => s.contractorPosition || ''),
      'หุ้นส่วนผู้จัดการ',
      'กรรมการผู้จัดการ',
      'กรรมการผู้มีอำนาจลงนาม',
      'ผู้จัดการฝ่ายจัดซื้อ',
      'วิศวกรผู้ควบคุมงาน',
      'หัวหน้าผู้ควบคุมโครงการ'
    ];

    const positions = buildFrequentSuggestions(rawPositions, {
      minLength: 3,
      limit: 30
    });

    // 22. ช่วง กม. / สถานที่ (Locations)
    const rawLocations: string[] = [
      ...inspections.map(i => (i.startKm && i.endKm ? `${i.startKm} - ${i.endKm}` : i.workDescription || '')),
      ...subcontracts.map(s => s.contractLocation || (s.startKm && s.endKm ? `${s.startKm} - ${s.endKm}` : '')),
      'กม. 10+000 - กม. 15+000',
      'กม. 15+000 - กม. 20+000',
      'ช่วงงานสะพาน กม. 12+450',
      'บริเวณทางแยกต่างระดับ',
      'แคมป์พักคนงานและศูนย์ซ่อมบำรุง'
    ];

    const locations = buildFrequentSuggestions(rawLocations, {
      minLength: 3,
      limit: 30
    });

    // 23. ชื่องานภาระผูกพัน (Todo Titles)
    const rawTodoTitles: string[] = [
      ...todoTasks.map(t => t.title)
    ];

    const todoTitles = buildFrequentSuggestions(rawTodoTitles, {
      minLength: 3,
      limit: 40
    });

    // 24. ผู้รับผิดชอบงาน Todoist (Todo Assignees)
    const rawTodoAssignees: string[] = [
      ...todoTasks.map(t => t.assignedTo || '')
    ];

    const todoAssignees = buildFrequentSuggestions(rawTodoAssignees, {
      initialSeeds: initialRequesterSeeds,
      minLength: 2,
      limit: 30
    });

    // ฟังก์ชันจับคู่บัญชีธนาคารของผู้รับเงิน
    const getBankForPayee = (payeeName: string) => {
      return findMostFrequentBankForPayee(payeeName, allDisbursements, subcontracts, paymentClaims);
    };

    return {
      payees,
      bankAccounts,
      bankNames,
      itemDescriptions,
      projects,
      companies,
      expenseTypes,
      boqTypes,
      txCategories,
      requesters,
      inspectors,
      receivers,
      refDocNos,
      expressPoNos,
      deliveryOrderNos,
      invoiceNos,
      units,
      remarks,
      taxIds,
      addresses,
      positions,
      locations,
      todoTitles,
      todoAssignees,
      getBankForPayee
    };
  }, [
    transactions,
    disbursements,
    subcontracts,
    inspections,
    paymentClaims,
    backcharges,
    goodsReceipts,
    billings,
    rfqItems,
    todoTasks
  ]);

  return (
    <DatabaseSuggestionsContext.Provider value={suggestions}>
      {children}
      {/* HTML5 Datalists ลงทะเบียนไว้ในระดับ Root DOM เพื่อให้ทุก <input list="..."> เรียกใช้ได้ทันที */}
      <GlobalDatabaseDatalists suggestions={suggestions} />
    </DatabaseSuggestionsContext.Provider>
  );
}

/**
 * Hook สำหรับเข้าถึงคำแนะนำจากฐานข้อมูล
 */
export function useDatabaseSuggestions(): DatabaseSuggestionsData {
  const context = useContext(DatabaseSuggestionsContext);
  if (!context) {
    // Fallback ปลอดภัยหากเรียกใช้นอก Provider
    return {
      payees: [],
      bankAccounts: [],
      bankNames: [],
      itemDescriptions: [],
      projects: [],
      companies: [],
      expenseTypes: [],
      boqTypes: [],
      txCategories: [],
      requesters: [],
      inspectors: [],
      receivers: [],
      refDocNos: [],
      expressPoNos: [],
      deliveryOrderNos: [],
      invoiceNos: [],
      units: [],
      remarks: [],
      taxIds: [],
      addresses: [],
      positions: [],
      locations: [],
      todoTitles: [],
      todoAssignees: [],
      getBankForPayee: () => null
    };
  }
  return context;
}

/**
 * Global Component ที่เรนเดอร์แท็ก <datalist> ทั้งหมดสู่ DOM
 * ทำให้ <input list="dl-..."> ทุกจุดในโปรแกรมสามารถใช้งาน autocomplete ได้อย่างแม่นยำ
 */
export function GlobalDatabaseDatalists({ suggestions }: { suggestions: DatabaseSuggestionsData }) {
  return (
    <div id="global-database-datalists-root" style={{ display: 'none' }} aria-hidden="true">
      {/* 1. ผู้รับเงิน / ร้านค้า / ช่างเหมา */}
      <datalist id="dl-payees">
        {suggestions.payees.map((val, idx) => (
          <option key={`payee-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 2. บัญชีธนาคาร */}
      <datalist id="dl-bank-accounts">
        {suggestions.bankAccounts.map((val, idx) => (
          <option key={`bank-acc-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 3. ชื่อธนาคาร */}
      <datalist id="dl-bank-names">
        {suggestions.bankNames.map((val, idx) => (
          <option key={`bank-name-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 4. รายละเอียดรายการค่าใช้จ่าย / พัสดุ (Item Descriptions) */}
      <datalist id="dl-item-descriptions">
        {suggestions.itemDescriptions.map((val, idx) => (
          <option key={`item-desc-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 5. โครงการก่อสร้าง */}
      <datalist id="dl-projects">
        {suggestions.projects.map((val, idx) => (
          <option key={`proj-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 6. บริษัทในเครือ */}
      <datalist id="dl-companies">
        {suggestions.companies.map((val, idx) => (
          <option key={`comp-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 7. หมวดค่าใช้จ่าย DBM */}
      <datalist id="dl-expense-types">
        {suggestions.expenseTypes.map((val, idx) => (
          <option key={`expense-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 8. หมวดงาน BOQ */}
      <datalist id="dl-boq-types">
        {suggestions.boqTypes.map((val, idx) => (
          <option key={`boq-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 9. หมวดบัญชี GL */}
      <datalist id="dl-tx-categories">
        {suggestions.txCategories.map((val, idx) => (
          <option key={`tx-cat-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 10. ผู้ขอเบิก / ผู้บันทึก */}
      <datalist id="dl-requesters">
        {suggestions.requesters.map((val, idx) => (
          <option key={`req-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 11. ผู้ตรวจงาน */}
      <datalist id="dl-inspectors">
        {suggestions.inspectors.map((val, idx) => (
          <option key={`insp-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 12. ผู้ตรวจรับพัสดุหน้างาน */}
      <datalist id="dl-receivers">
        {suggestions.receivers.map((val, idx) => (
          <option key={`rec-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 13. เลขที่เอกสารอ้างอิง */}
      <datalist id="dl-ref-doc-nos">
        {suggestions.refDocNos.map((val, idx) => (
          <option key={`ref-doc-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 14. เลขที่ PO Express */}
      <datalist id="dl-express-po">
        {suggestions.expressPoNos.map((val, idx) => (
          <option key={`express-po-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 15. เลขที่ใบส่งของ DO */}
      <datalist id="dl-delivery-orders">
        {suggestions.deliveryOrderNos.map((val, idx) => (
          <option key={`do-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 16. เลขที่ใบกำกับภาษี */}
      <datalist id="dl-invoices">
        {suggestions.invoiceNos.map((val, idx) => (
          <option key={`inv-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 17. หน่วยนับ */}
      <datalist id="dl-units">
        {suggestions.units.map((val, idx) => (
          <option key={`unit-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 18. หมายเหตุ */}
      <datalist id="dl-remarks">
        {suggestions.remarks.map((val, idx) => (
          <option key={`remark-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 19. เลขประจำตัวผู้เสียภาษี */}
      <datalist id="dl-tax-ids">
        {suggestions.taxIds.map((val, idx) => (
          <option key={`tax-id-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 20. ที่อยู่ */}
      <datalist id="dl-addresses">
        {suggestions.addresses.map((val, idx) => (
          <option key={`addr-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 21. ตำแหน่ง */}
      <datalist id="dl-positions">
        {suggestions.positions.map((val, idx) => (
          <option key={`pos-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 22. ช่วง กม. / สถานที่ */}
      <datalist id="dl-locations">
        {suggestions.locations.map((val, idx) => (
          <option key={`loc-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 23. ชื่องาน Todoist */}
      <datalist id="dl-todo-titles">
        {suggestions.todoTitles.map((val, idx) => (
          <option key={`todo-title-${idx}`} value={val} />
        ))}
      </datalist>

      {/* 24. ผู้รับผิดชอบ Todoist */}
      <datalist id="dl-todo-assignees">
        {suggestions.todoAssignees.map((val, idx) => (
          <option key={`todo-assignee-${idx}`} value={val} />
        ))}
      </datalist>
      <datalist id="dl-assignees">
        {suggestions.todoAssignees.map((val, idx) => (
          <option key={`assignee-${idx}`} value={val} />
        ))}
      </datalist>
    </div>
  );
}
