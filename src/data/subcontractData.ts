import { 
  ProjectBOQItem, 
  Subcontract, 
  SubcontractInspection, 
  SubcontractPaymentClaim, 
  RetentionLedgerRecord 
} from '../types';

// ==========================================
// 1. Initial 3-Tier BOQ Items
// ==========================================
export const INITIAL_BOQ_ITEMS: ProjectBOQItem[] = [
  {
    id: 'boq-01',
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    itemNo: '2.1',
    description: 'งานวางท่อระบายน้ำ คสล. มอก. ชั้น 3 ขนาด dia 1.00 ม. พร้อมบ่อพัก',
    unit: 'ม.',
    
    // Tier 1: BOQ ตามสัญญาโครงการ (Contract / Tender BOQ)
    contractQty: 4200,
    contractUnitRate: 3850,
    contractAmount: 16170000,

    // Tier 2: BOQ ที่วิศวกรสำรวจหน้างานจริง (Site Budget BOQ)
    engineerQty: 4350,
    engineerUnitCost: 3100,
    engineerAmount: 13485000,

    // Tier 3: รายการวัสดุที่ต้องใช้ (BOM)
    materials: [
      {
        id: 'mat-01',
        materialName: 'ท่อ คสล. มอก. ชั้น 3 dia 1.00 ม.',
        standardRatioPerUnit: 1.0,
        unit: 'ท่อน',
        totalRequiredQty: 4350,
        withdrawnQty: 2800,
        unitPrice: 1650
      },
      {
        id: 'mat-02',
        materialName: 'คอนกรีตผสมเสร็จ 240 ksc (หุ้มท่อ/บ่อพัก)',
        standardRatioPerUnit: 0.35,
        unit: 'ลบ.ม.',
        totalRequiredQty: 1522.5,
        withdrawnQty: 980,
        unitPrice: 2150
      },
      {
        id: 'mat-03',
        materialName: 'เหล็กเส้นกลมและข้ออ้อย (บ่อพักน้ำ)',
        standardRatioPerUnit: 8.5,
        unit: 'กก.',
        totalRequiredQty: 36975,
        withdrawnQty: 24500,
        unitPrice: 26.5
      }
    ],

    subcontractAllocatedQty: 4000, // ซอยจ้าง 2 สัญญา: สัญญา 1 (2,000 ม.) + สัญญา 2 (2,000 ม.)
    completedQty: 2400
  },
  {
    id: 'boq-02',
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    itemNo: '3.2',
    description: 'งานผิวทางแอสฟัลต์คอนกรีต หนา 5 ซม. (Asphalt Concrete Wearing Course)',
    unit: 'ตร.ม.',
    contractQty: 65000,
    contractUnitRate: 320,
    contractAmount: 20800000,

    engineerQty: 66200,
    engineerUnitCost: 260,
    engineerAmount: 17212000,

    materials: [
      {
        id: 'mat-04',
        materialName: 'แอสฟัลต์คอนกรีตผสมร้อน (AC Hot-mix)',
        standardRatioPerUnit: 0.118,
        unit: 'ตัน',
        totalRequiredQty: 7811.6,
        withdrawnQty: 4200,
        unitPrice: 1850
      },
      {
        id: 'mat-05',
        materialName: 'ยางแทคโค้ต (CSS-1)',
        standardRatioPerUnit: 0.3,
        unit: 'ลิตร',
        totalRequiredQty: 19860,
        withdrawnQty: 12000,
        unitPrice: 32
      }
    ],
    subcontractAllocatedQty: 50000,
    completedQty: 32000
  },
  {
    id: 'boq-03',
    project: '(06)ขยายผิวจราจร ทล.218',
    itemNo: '1.4',
    description: 'งานขุดดินตัดและคันทาง (Excavation & Embankment)',
    unit: 'ลบ.ม.',
    contractQty: 38000,
    contractUnitRate: 85,
    contractAmount: 3230000,

    engineerQty: 41000,
    engineerUnitCost: 65,
    engineerAmount: 2665000,

    materials: [
      {
        id: 'mat-06',
        materialName: 'ดินลูกรังคัดเลือก (Select Material)',
        standardRatioPerUnit: 1.15,
        unit: 'ลบ.ม.',
        totalRequiredQty: 47150,
        withdrawnQty: 38000,
        unitPrice: 42
      }
    ],
    subcontractAllocatedQty: 35000,
    completedQty: 31000
  }
];

// ==========================================
// 2. Initial Subcontracts (รองรับ 1 BOQ หลายสัญญา & หลายรูปแบบภาษี)
// ==========================================
export const INITIAL_SUBCONTRACTS: Subcontract[] = [
  {
    id: 'sub-01',
    contractNo: 'SUB-67-001',
    contractTitle: 'งานวางท่อระบายน้ำ คสล. dia 1.00 ม. (ช่วง กม. 15+000 - 17+000)',
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    boqItemId: 'boq-01',
    contractorName: 'หจก. ปิยะวิลล์คอนสตรัคชั่น',
    entityType: 'corporate_vat', // นิติบุคคล จด VAT 7%
    taxId: '0323559001241',
    phone: '081-879-4521',
    defaultBankName: 'ธนาคารกรุงเทพ (BBL)',
    defaultBankAccount: '412-0-98214-5',
    defaultAccountName: 'หจก. ปิยะวิลล์คอนสตรัคชั่น',

    startKm: 'กม. 15+000',
    endKm: 'กม. 17+000',
    workCategory: 'งานระบายน้ำ',
    quantity: 2000,
    unit: 'ม.',
    unitRate: 1450, // ราคาจ้างเหมาเฉพาะค่าแรงและเครื่องจักรติดตั้ง
    contractAmount: 2900000,

    retentionRate: 0.05, // 5%
    warrantyPeriodMonths: 24,
    startDate: '2026-06-01',
    endDate: '2026-11-30',
    status: 'active',

    // ข้อมูลทางนิติกรรมสัญญา
    contractDate: '1 มิถุนายน 2569',
    employerName: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
    employerRep: 'นายวิชัย นพสุวรรณวงศ์',
    employerPosition: 'กรรมการผู้จัดการ',
    contractorRep: 'นายปิยะพงษ์ สิทธิชัย',
    contractorPosition: 'หุ้นส่วนผู้จัดการ',
    contractorAddress: 'เลขที่ 88/12 หมู่ที่ 5 ต.นอกเมือง อ.เมืองสุรินทร์ จ.สุรินทร์ 32000',
    dailyPenalty: 2900,
    dailyPenaltyText: 'สองพันเก้าร้อยบาทถ้วน',
    paymentDueDay: 5,
    installmentCount: 5,
    workDurationMonths: 6,

    totalInspectedQty: 1400,
    totalApprovedAmount: 2030000,
    totalPaidAmount: 1300000,
    totalRetentionHeld: 101500, // หักสะสมไว้ 5%
    totalRetentionRefunded: 0
  },
  {
    id: 'sub-02',
    contractNo: 'SUB-67-002',
    contractTitle: 'งานวางท่อระบายน้ำ คสล. dia 1.00 ม. (ช่วง กม. 17+000 - 19+000)',
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    boqItemId: 'boq-01', // BOQ เดียวกัน ซอยช่างอีกชุด
    contractorName: 'นายสมศักดิ์ ช่างเหล็ก (ช่างสมศักดิ์)',
    entityType: 'individual', // บุคคลธรรมดา ไม่มี VAT (หัก 3% ภ.ง.ด.3)
    taxId: '3310400192841',
    phone: '089-552-1923',
    defaultBankName: 'ธนาคารกสิกรไทย (KBANK)',
    defaultBankAccount: '048-2-84192-1',
    defaultAccountName: 'นายสมศักดิ์ ช่างเหล็ก',

    startKm: 'กม. 17+000',
    endKm: 'กม. 19+000',
    workCategory: 'งานระบายน้ำ',
    quantity: 2000,
    unit: 'ม.',
    unitRate: 1400,
    contractAmount: 2800000,

    retentionRate: 0.05,
    warrantyPeriodMonths: 12,
    startDate: '2026-06-15',
    endDate: '2026-12-15',
    status: 'active',

    // ข้อมูลทางนิติกรรมสัญญา
    contractDate: '15 มิถุนายน 2569',
    employerName: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
    employerRep: 'นายวิชัย นพสุวรรณวงศ์',
    employerPosition: 'กรรมการผู้จัดการ',
    contractorRep: 'นายสมศักดิ์ ช่างเหล็ก',
    contractorPosition: 'ผู้รับจ้าง',
    contractorAddress: 'เลขที่ 214 หมู่ที่ 2 ต.กังแอน อ.ปราสาท จ.สุรินทร์ 32140',
    dailyPenalty: 2800,
    dailyPenaltyText: 'สองพันแปดร้อยบาทถ้วน',
    paymentDueDay: 5,
    installmentCount: 4,
    workDurationMonths: 6,

    totalInspectedQty: 1000,
    totalApprovedAmount: 1400000,
    totalPaidAmount: 950000,
    totalRetentionHeld: 70000,
    totalRetentionRefunded: 0
  },
  {
    id: 'sub-03',
    contractNo: 'SUB-67-003',
    contractTitle: 'งานปูผิวทางแอสฟัลต์คอนกรีต (ช่วง กม. 10+000 - 18+000)',
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    boqItemId: 'boq-02',
    contractorName: 'บจก. พิชชญา เอ็นจิเนียริ่ง',
    entityType: 'corporate_vat',
    taxId: '0315562000892',
    phone: '086-339-1188',
    defaultBankName: 'ธนาคารกรุงไทย (KTB)',
    defaultBankAccount: '311-6-04981-2',
    defaultAccountName: 'บจก. พิชชญา เอ็นจิเนียริ่ง',

    startKm: 'กม. 10+000',
    endKm: 'กม. 18+000',
    workCategory: 'งานผิวทาง',
    quantity: 50000,
    unit: 'ตร.ม.',
    unitRate: 65,
    contractAmount: 3250000,

    retentionRate: 0.05,
    warrantyPeriodMonths: 24,
    startDate: '2026-07-01',
    endDate: '2026-10-31',
    status: 'active',

    totalInspectedQty: 32000,
    totalApprovedAmount: 2080000,
    totalPaidAmount: 1800000,
    totalRetentionHeld: 104000,
    totalRetentionRefunded: 0
  }
];

// ==========================================
// 3. Initial Inspections (นับครั้งอัตโนมัติ + ช่วง กม.)
// ==========================================
export const INITIAL_INSPECTIONS: SubcontractInspection[] = [
  {
    id: 'insp-01',
    subcontractId: 'sub-01',
    contractNo: 'SUB-67-001',
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    contractorName: 'หจก. ปิยะวิลล์คอนสตรัคชั่น',
    inspectionNo: 1,
    inspectionDate: '2026-07-15',
    inspectorName: 'วิศวกร ธนกร พลอยดี (PE)',
    startKm: 'กม. 15+000',
    endKm: 'กม. 15+800',
    workDescription: 'งานขุดร่องวางท่อ คสล. dia 1.00 ม. และเทคอนกรีตลีนฐานราก พร้อมวางท่อเสร็จเรียบร้อย',
    inspectedQty: 800,
    unit: 'ม.',
    unitRate: 1450,
    approvedAmount: 1160000,
    status: 'claimed',
    paymentClaimId: 'claim-01',
    notes: 'ระดับความลาดเอียงผ่านเกณฑ์กรมทางหลวง ตรวจสอบระดับด้วยกล้องระดับ',
    createdAt: '2026-07-15T14:30:00Z'
  },
  {
    id: 'insp-02',
    subcontractId: 'sub-01',
    contractNo: 'SUB-67-001',
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    contractorName: 'หจก. ปิยะวิลล์คอนสตรัคชั่น',
    inspectionNo: 2,
    inspectionDate: '2026-08-20',
    inspectorName: 'วิศวกร ธนกร พลอยดี (PE)',
    startKm: 'กม. 15+800',
    endKm: 'กม. 16+400',
    workDescription: 'งานวางท่อ คสล. dia 1.00 ม. พร้อมเทหุ้มคอนกรีตและสร้างบ่อพักรับน้ำ 6 แห่ง',
    inspectedQty: 600,
    unit: 'ม.',
    unitRate: 1450,
    approvedAmount: 870000,
    status: 'claimed',
    paymentClaimId: 'claim-02',
    notes: 'ทดสอบการระบายน้ำผ่าน บ่อพักเรียบร้อย',
    createdAt: '2026-08-20T16:00:00Z'
  },
  {
    id: 'insp-03',
    subcontractId: 'sub-02',
    contractNo: 'SUB-67-002',
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    contractorName: 'นายสมศักดิ์ ช่างเหล็ก (ช่างสมศักดิ์)',
    inspectionNo: 1,
    inspectionDate: '2026-08-10',
    inspectorName: 'วิศวกร ศิริชัย วัฒนกุล (PE)',
    startKm: 'กม. 17+000',
    endKm: 'กม. 18+000',
    workDescription: 'วางท่อ คสล. dia 1.00 ม. ฝั่งซ้ายทาง พร้อมบ่อพักน้ำ',
    inspectedQty: 1000,
    unit: 'ม.',
    unitRate: 1400,
    approvedAmount: 1400000,
    status: 'claimed',
    paymentClaimId: 'claim-03',
    notes: 'ผลการทดสอบแรงอัดคอนกรีตผ่านเกณฑ์',
    createdAt: '2026-08-10T11:00:00Z'
  },
  {
    id: 'insp-04',
    subcontractId: 'sub-01',
    contractNo: 'SUB-67-001',
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    contractorName: 'หจก. ปิยะวิลล์คอนสตรัคชั่น',
    inspectionNo: 3,
    inspectionDate: '2026-09-08',
    inspectorName: 'วิศวกร ธนกร พลอยดี (PE)',
    startKm: 'กม. 16+400',
    endKm: 'กม. 17+000',
    workDescription: 'งานวางท่อ คสล. dia 1.00 ม. ส่วนที่เหลือ 600 ม. บ่อพักพร้อมตะแกรงเหล็ก',
    inspectedQty: 600,
    unit: 'ม.',
    unitRate: 1450,
    approvedAmount: 870000,
    status: 'approved', // ยังไม่ได้ทำเรื่องเบิก รอให้ผู้ใช้กดทดสอบทำเบิกได้!
    notes: 'ตรวจงานผ่านแล้ว รอช่างส่งบิลหักค่าวัสดุเพื่อตั้งเบิกงวดที่ 3',
    createdAt: '2026-09-08T15:00:00Z'
  }
];

// ==========================================
// 4. Initial Payment Claims (คำนวณหักร้านค้า, หักเงินประกัน, หักภาษี)
// ==========================================
export const INITIAL_PAYMENT_CLAIMS: SubcontractPaymentClaim[] = [
  {
    id: 'claim-01',
    claimNo: 'CLM-SUB-67-001-01',
    subcontractId: 'sub-01',
    contractNo: 'SUB-67-001',
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    contractorName: 'หจก. ปิยะวิลล์คอนสตรัคชั่น',
    inspectionId: 'insp-01',
    inspectionNo: 1,
    claimDate: '2026-07-18',

    approvedWorkAmount: 1160000,
    retentionRate: 0.05,
    retentionAmount: 58000, // หัก 5%

    // หักร้านค้าและค่าใช้จ่ายอื่นๆ
    materialDeductionsTotal: 125000,
    otherDeductionsTotal: 15000,
    deductionItems: [
      {
        id: 'ded-01',
        type: 'material_store',
        storeOrVendorName: 'ร้าน ป.ศิลาชัย คอนกรีต บจก.',
        billOrDocNo: 'INV-6707-0091',
        description: 'คอนกรีตผสมเสร็จ 240 ksc เบิกเกินสเปกหน้างาน',
        amount: 85000,
        date: '2026-07-10'
      },
      {
        id: 'ded-02',
        type: 'material_store',
        storeOrVendorName: 'ร้าน สุรินทร์การช่าง โลหะภัณฑ์',
        billOrDocNo: 'REC-4412',
        description: 'ลวดผูกเหล็กและเหล็กปลอกบ่อพักน้ำ',
        amount: 40000,
        date: '2026-07-12'
      },
      {
        id: 'ded-03',
        type: 'damage_penalty',
        description: 'ค่าซ่อมแซมเสาไฟฟ้าส่องสว่างริมทางเสียหายจากรถแบคโฮ',
        amount: 15000,
        date: '2026-07-14'
      }
    ],

    taxBaseAmount: 962000, // 1,160,000 - 58,000 - 125,000 - 15,000

    entityType: 'corporate_vat',
    vatRate: 0.07,
    vatAmount: 67340,
    whtRate: 0.03,
    whtAmount: 28860,
    netPayableAmount: 1000480, // 962,000 + 67,340 - 28,860

    payeeName: 'หจก. ปิยะวิลล์คอนสตรัคชั่น',
    payeeTaxId: '0323559001241',
    payeeBankName: 'ธนาคารกรุงเทพ (BBL)',
    payeeBankAccount: '412-0-98214-5',
    isAuthorizedRepresentative: false,

    dbmNo: 'DBM-6907-018',
    status: 'paid',
    paidDate: '2026-07-25',
    pvNo: 'PV-6907-0044',
    notes: 'จ่ายเรียบร้อย หักภาษี ภ.ง.ด. 53 ยอด 28,860 บาท',
    createdAt: '2026-07-18T10:00:00Z'
  },
  {
    id: 'claim-02',
    claimNo: 'CLM-SUB-67-001-02',
    subcontractId: 'sub-01',
    contractNo: 'SUB-67-001',
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    contractorName: 'หจก. ปิยะวิลล์คอนสตรัคชั่น',
    inspectionId: 'insp-02',
    inspectionNo: 2,
    claimDate: '2026-08-25',

    approvedWorkAmount: 870000,
    retentionRate: 0.05,
    retentionAmount: 43500,

    materialDeductionsTotal: 72000,
    otherDeductionsTotal: 0,
    deductionItems: [
      {
        id: 'ded-04',
        type: 'material_store',
        storeOrVendorName: 'ร้าน สุรินทร์วัสดุก่อสร้าง 1999',
        billOrDocNo: 'IV-88219',
        description: 'ปูนซีเมนต์ปอร์ตแลนด์ประเภท 1 จำนวน 300 ถุง',
        amount: 54000,
        date: '2026-08-18'
      },
      {
        id: 'ded-05',
        type: 'fuel',
        storeOrVendorName: 'ปั๊ม ปตท. ทล.24 สังขะ',
        billOrDocNo: 'FLT-0982',
        description: 'น้ำมันดีเซลเติมรถแบคโฮหน้างาน',
        amount: 18000,
        date: '2026-08-19'
      }
    ],

    taxBaseAmount: 754500, // 870,000 - 43,500 - 72,000

    entityType: 'corporate_vat',
    vatRate: 0.07,
    vatAmount: 52815,
    whtRate: 0.03,
    whtAmount: 22635,
    netPayableAmount: 784680,

    // งวดนี้ให้โอนเข้าบัญชีผู้จัดการโครงการผู้รับมอบอำนาจ!
    payeeName: 'นายไกรสร มีโชค (ผู้รับมอบอำนาจ หจก.ปิยะวิลล์)',
    payeeTaxId: '3320100448123',
    payeeBankName: 'ธนาคารกสิกรไทย (KBANK)',
    payeeBankAccount: '284-2-90118-4',
    isAuthorizedRepresentative: true,
    authorizationRef: 'หนังสือมอบอำนาจ ลงวันที่ 20 ส.ค. 2569',

    dbmNo: 'DBM-6908-042',
    status: 'paid',
    paidDate: '2026-08-30',
    pvNo: 'PV-6908-0105',
    notes: 'โอนเข้าบัญชีนายไกรสร มีโชค ตามหนังสือมอบอำนาจแนบ',
    createdAt: '2026-08-25T11:30:00Z'
  },
  {
    id: 'claim-03',
    claimNo: 'CLM-SUB-67-002-01',
    subcontractId: 'sub-02',
    contractNo: 'SUB-67-002',
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    contractorName: 'นายสมศักดิ์ ช่างเหล็ก (ช่างสมศักดิ์)',
    inspectionId: 'insp-03',
    inspectionNo: 1,
    claimDate: '2026-08-15',

    approvedWorkAmount: 1400000,
    retentionRate: 0.05,
    retentionAmount: 70000,

    materialDeductionsTotal: 85000,
    otherDeductionsTotal: 5000,
    deductionItems: [
      {
        id: 'ded-06',
        type: 'material_store',
        storeOrVendorName: 'ร้าน ประสาทคอนกรีตบล็อค',
        billOrDocNo: 'B-7712',
        description: 'ฝาบ่อพักคอนกรีต คสล. 40 ชุด',
        amount: 85000,
        date: '2026-08-05'
      },
      {
        id: 'ded-07',
        type: 'damage_penalty',
        description: 'ค่าปรับไม่สวมใส่อุปกรณ์ PPE ในเขตก่อสร้างทางหลวง',
        amount: 5000,
        date: '2026-08-08'
      }
    ],

    taxBaseAmount: 1240000, // 1,400,000 - 70,000 - 85,000 - 5,000

    entityType: 'individual', // บุคคลธรรมดา: ไม่มี VAT, หัก 3% (ภ.ง.ด.3)
    vatRate: 0,
    vatAmount: 0,
    whtRate: 0.03,
    whtAmount: 37200,
    netPayableAmount: 1202800, // 1,240,000 - 37,200

    payeeName: 'นายสมศักดิ์ ช่างเหล็ก',
    payeeTaxId: '3310400192841',
    payeeBankName: 'ธนาคารกสิกรไทย (KBANK)',
    payeeBankAccount: '048-2-84192-1',
    isAuthorizedRepresentative: false,

    dbmNo: 'DBM-6908-028',
    status: 'paid',
    paidDate: '2026-08-22',
    pvNo: 'PV-6908-0071',
    notes: 'บุคคลธรรมดา หัก ภ.ง.ด. 3 ยอด 37,200 บาท',
    createdAt: '2026-08-15T09:40:00Z'
  }
];

// ==========================================
// 5. Initial Retention Ledger (Strict Locked Account Refund Trace)
// ==========================================
export const INITIAL_RETENTION_LEDGER: RetentionLedgerRecord[] = [
  {
    id: 'ret-01',
    subcontractId: 'sub-01',
    contractNo: 'SUB-67-001',
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    contractorName: 'หจก. ปิยะวิลล์คอนสตรัคชั่น',
    claimId: 'claim-01',
    claimNo: 'CLM-SUB-67-001-01',
    inspectionNo: 1,
    deductedDate: '2026-07-25',
    retentionAmount: 58000,

    // บัญชีเดิมที่หักไว้จริง (งวด 1: จ่าย หจก. ปิยะวิลล์)
    payeeName: 'หจก. ปิยะวิลล์คอนสตรัคชั่น',
    payeeBankName: 'ธนาคารกรุงเทพ (BBL)',
    payeeBankAccount: '412-0-98214-5',
    payeeTaxId: '0323559001241',

    status: 'held'
  },
  {
    id: 'ret-02',
    subcontractId: 'sub-01',
    contractNo: 'SUB-67-001',
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    contractorName: 'หจก. ปิยะวิลล์คอนสตรัคชั่น',
    claimId: 'claim-02',
    claimNo: 'CLM-SUB-67-001-02',
    inspectionNo: 2,
    deductedDate: '2026-08-30',
    retentionAmount: 43500,

    // บัญชีเดิมที่หักไว้จริง (งวด 2: จ่าย นายไกรสร มีโชค)
    // *** ระบบจะล็อกให้คืนเฉพาะนายไกรสร มีโชค ตามกฎการควบคุมภายใน ***
    payeeName: 'นายไกรสร มีโชค (ผู้รับมอบอำนาจ หจก.ปิยะวิลล์)',
    payeeBankName: 'ธนาคารกสิกรไทย (KBANK)',
    payeeBankAccount: '284-2-90118-4',
    payeeTaxId: '3320100448123',

    status: 'held'
  },
  {
    id: 'ret-03',
    subcontractId: 'sub-02',
    contractNo: 'SUB-67-002',
    project: '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)',
    contractorName: 'นายสมศักดิ์ ช่างเหล็ก (ช่างสมศักดิ์)',
    claimId: 'claim-03',
    claimNo: 'CLM-SUB-67-002-01',
    inspectionNo: 1,
    deductedDate: '2026-08-22',
    retentionAmount: 70000,

    payeeName: 'นายสมศักดิ์ ช่างเหล็ก',
    payeeBankName: 'ธนาคารกสิกรไทย (KBANK)',
    payeeBankAccount: '048-2-84192-1',
    payeeTaxId: '3310400192841',

    status: 'held'
  }
];
