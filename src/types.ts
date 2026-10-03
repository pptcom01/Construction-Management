export interface Transaction {
  id: string;
  company: string;
  date: string; // e.g. "12/11/2568"
  isoDate: string; // "2025-11-12"
  docNo: string;
  description: string;
  account: string;
  project: string;
  category: string;
  debit: number; // รายรับ (Dr.)
  credit: number; // รายจ่าย (Cr.)
  remarks: string;
  runningBalance?: number;
  tags?: string[];
  status?: 'cleared' | 'pending' | 'reconciled';
  createdAt?: string;

  // PV & Bank Statement Reconciliation Links
  sourceType?: 'pv' | 'manual' | 'import' | 'billing';
  disbursementId?: string;
  pvNo?: string;
  dbmNo?: string;
  refDocNo?: string;
  payeeName?: string;
  paymentSlipUrl?: string;
  paymentSlipName?: string;
  auditCertificateId?: string;
  reconciledAt?: string;
  reconciledBy?: string;
  reconciliationNotes?: string;
  statementMatchId?: string;
}

export interface TodoTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'tax' | 'payroll' | 'contractor' | 'banking' | 'retention' | 'billing' | 'general';
  completed: boolean;
  type?: 'expense' | 'income'; // default expense
  project?: string;
  company?: string;
  amount?: number;
  relatedDocNo?: string;
  createdAt: string;
  assignedTo?: string;
  rescheduleReason?: string;
  originalDueDate?: string;
}

export interface ProjectStats {
  projectName: string;
  cleanName: string;
  code: string;
  totalIncome: number;
  totalExpense: number;
  netMargin: number;
  expenseByCategory: { category: string; amount: number; percentage: number }[];
  incomeByCategory: { category: string; amount: number }[];
  transactionCount: number;
  estimatedBudget?: number;
}

export interface AccountBalance {
  accountName: string;
  bankCode: string;
  accountNumber: string;
  company: string;
  type: string;
  totalIncome: number;
  totalExpense: number;
  calculatedBalance: number;
  latestBalance: number;
  isOverdraft?: boolean;
}

export interface MonthlyFinancialSummary {
  monthKey: string; // YYYY-MM
  displayMonth: string; // "พ.ย. 2568"
  income: number;
  expense: number;
  netCashFlow: number;
  interTransfer: number;
  runningBalance: number;
}

export interface DisbursementAttachment {
  id: string;
  name: string;
  url: string; // Data URL or Web link (e.g. Google Drive webViewLink)
  type: 'image' | 'pdf' | 'document';
  size?: number;
  uploadedAt: string;
  driveFileId?: string; // Google Drive File ID for direct management and clean-up
  storageProvider?: 'drive' | 'local';
}

export interface DisbursementItem {
  description: string;
  amount: number;
  unitPrice?: number;
  quantity?: number;
  withholdingTaxRate?: number; // 0, 0.01, 0.02, 0.03, 0.05
  withholdingTaxAmount?: number;
  vatRate?: number; // 0 or 0.07
  vatAmount?: number;
}

export interface Disbursement {
  id: string;
  recordedBy: string; // ผู้บันทึก / ผู้ขอเบิก
  dbmNo: string; // เลขที่เอกสาร DBM
  refDocNo: string; // เลขที่เอกสารอ้างอิง (OE, PS, PV, AE, DP, BT)
  company: string; // BTC, BTCP, BTC-PC, TBTC
  entryDate: string; // วันที่ลงข้อมูล
  dueDate: string; // วันครบกำหนดจ่าย
  expenseType: string; // ประเภทงาน/รายจ่าย
  boqType?: string; // ประเภทงาน BOQ
  payeeName: string; // ชื่อผู้รับเงิน
  payeeBankAccount: string; // บัญชีธนาคารผู้รับ
  payeeBankName?: string; // ธนาคารปลายทาง
  payeeBankBranch?: string; // สาขาธนาคารปลายทาง
  project: string; // โครงการ
  paymentMethod: string; // รูปแบบการจ่าย (โอน, เงินสด, บริษัท, อื่นๆ)
  remarks: string; // หมายเหตุ
  items: DisbursementItem[]; // รายการ 1-10
  subTotalAmount?: number; // ยอดรวมก่อนภาษี
  vatTotalAmount?: number; // ยอดภาษีมูลค่าเพิ่ม 7%
  taxDeductionTotalAmount?: number; // ยอดหัก ณ ที่จ่ายรวม
  retentionTotalAmount?: number; // ยอดหักประกันผลงาน
  totalAmount: number; // ยอดเงินสุทธิตามใบตั้งเบิก

  // Requester Signature & Documents
  requesterSignature?: string; // Data URL of signature
  requesterSignedAt?: string;
  attachments?: DisbursementAttachment[]; // แนบหลักฐาน ใบเสนอราคา/ใบแจ้งหนี้/รูปถ่าย

  // Review & Approval Workflow
  reviewerName?: string; // ผู้ตรวจสอบ
  reviewerSignature?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  approverName?: string; // ผู้อนุมัติ
  approverSignature?: string;
  approvedAt?: string;
  approverNotes?: string;

  // Finance Payment (Workflow 2 / Step 3-4)
  payerAccount: string; // บัญชีธนาคารที่จ่าย (เลขที่บัญชี)
  chequeNo: string; // เลขที่เช็ค / เลขสลิป / Ref
  paymentDate: string; // วันที่จ่ายเงิน
  transferAmount: number; // ยอดเงินโอน
  fee: number; // ค่าธรรมเนียม
  documentLink?: string; // ลิงก์เอกสารการโอน (Google Drive)
  paymentSlipUrl?: string; // สลิปโอนเงิน (Data URL หรือ URL รูปภาพ)
  paymentSlipName?: string;
  financeRecordedBy?: string; // ผู้บันทึกรายการฝ่ายการเงิน / ผู้จ่ายเงิน
  financeSignature?: string; // ลายเซ็นสดผู้จ่ายเงิน (Payer Live Signature)
  pvNo?: string; // เลขที่ใบสำคัญจ่าย เช่น PV-6801-001
  paidAt?: string; // วันที่และเวลากดบันทึกจ่าย
  auditCertificateId?: string; // รหัสใบรับรองดิจิทัล เช่น CERT-BTC-2025-XXXX
  
  // Status flow: draft -> pending_review -> approved / rejected -> paid -> cancelled
  status: 'pending_review' | 'approved' | 'paid' | 'rejected' | 'pending' | 'cancelled';
  isSyncedToLedger?: boolean;

  // Postponed & Reschedule Tracking (การเลื่อนจ่าย)
  originalDueDate?: string; // กำหนดจ่ายเดิมก่อนเลื่อน
  rescheduleReason?: string; // เหตุผลที่ขอเลื่อน เช่น รอตรวจรับงาน, รอใบเสร็จ, หมุนเงินสด
  rescheduledAt?: string; // วันที่ทำการเลื่อน
  rescheduledBy?: string; // ผู้สั่งเลื่อน
}

export type ViewTab = 
  | 'dashboard' 
  | 'payment' 
  | 'disbursements' 
  | 'subcontracts' 
  | 'projects' 
  | 'transactions' 
  | 'reports' 
  | 'accounts' 
  | 'tax_summary' 
  | 'todoist' 
  | 'ai_analysis' 
  | 'boq' 
  | 'procurement' 
  | 'supplier_billing' 
  | 'document_templates'
  | 'user_management';

export type UserRole = 'admin' | 'manager' | 'user' | 'executive' | 'staff';

export interface AppUser {
  id: string;
  username: string;
  name: string;
  roleTitle: string;
  department: string;
  email?: string;
  role: 'admin' | 'manager' | 'user';
  password?: string;
  pin?: string;
  isActive: boolean;
  allowedTabs?: ViewTab[];
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
}

// ==========================================
// Procurement, RFQ & Material Backcharge
// ==========================================

export interface VendorQuotationItem {
  vendorName: string;
  unitPrice: number;
  taxIncluded: boolean;
  creditDays: number; // e.g. 0 (cash), 30, 60 days
  deliveryDays: number; // e.g. 3 days
  isRecommended?: boolean;
  notes?: string;
}

export interface RFQComparisonItem {
  id: string;
  rfqNo: string; // เช่น RFQ-68-001
  project: string;
  materialName: string;
  spec: string;
  quantity: number;
  unit: string;
  targetBudgetUnitPrice?: number;
  quotations: VendorQuotationItem[];
  selectedVendor?: string;
  status: 'draft' | 'comparing' | 'approved' | 'po_created' | 'cancelled';
  approvalDate?: string;
  approvedBy?: string;
  expressPoNo?: string; // เลขที่ PO ใน Express ที่นำไปเปิด
  createdAt: string;
}

export type MaterialAllocationType = 'subcontractor' | 'project_direct' | 'site_store';

export interface MaterialBackchargeItem {
  id: string;
  backchargeNo: string; // เช่น DBM-MAT-68-001 หรือ GR-DIR-68-001
  expressPoNo: string; // เลขที่ PO ใน Express เช่น "PO68-0125"
  deliveryOrderNo?: string; // เลขที่ใบส่งของร้านค้า (DO)
  invoiceNo?: string; // เลขที่ใบกำกับภาษี
  project: string;
  vendorName: string;
  
  // วัตถุประสงค์การจัดสรรต้นทุน (Cost Allocation)
  allocationType?: MaterialAllocationType; // 'subcontractor' (หักช่าง), 'project_direct' (เข้างานโครงการ), 'site_store' (เก็บสต๊อกคลัง/ใช้ทั่วไป)
  boqCategory?: string; // หมวดงาน BOQ (กรณีเข้างานโครงการโดยตรง)

  // สัญญาจ้างช่างเหมาที่รับของ
  subcontractId?: string;
  contractNo?: string;
  contractorName?: string;

  // ข้อมูลพัสดุ
  materialDescription: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number; // quantity * unitPrice
  receivedDate: string;
  siteReceiverName: string; // วิศวกร/หัวหน้าคนงานผู้รับของ
  subcontractorReceiverName?: string; // ตัวแทนช่างเหมาผู้เซ็นรับ

  // สถานะการหักเงิน
  status: 'pending_deduction' | 'deducted' | 'cancelled';
  deductedClaimId?: string;
  deductedClaimNo?: string;
  deductedAt?: string;

  notes?: string;
  createdAt: string;
}

export interface GoodsReceiptItem {
  id: string;
  grNo: string; // เช่น GR-68-001 (ใบตรวจรับพัสดุหน้างาน)
  expressPoNo: string; // เลขที่ PO ใน Express เช่น PO68-0112
  deliveryOrderNo: string; // เลขที่ใบส่งของร้านค้า (DO) เช่น DO-SRP-1205
  invoiceNo?: string; // เลขที่ใบกำกับภาษี (หากมี)
  project: string;
  vendorName: string;
  vendorTaxId?: string;
  
  // รายละเอียดสินค้าที่ตรวจรับจริง
  materialDescription: string;
  receivedQty: number;
  unit: string;
  unitPrice: number;
  amount: number; // receivedQty * unitPrice
  receivedDate: string; // วันที่ลงรับของ
  receiverName: string; // วิศวกร/สโตร์/หัวหน้างานที่ตรวจรับ
  hasSignature: boolean; // มีลายเซ็นต์ผู้รับในใบส่งของ
  hasReceiverSignature?: boolean;
  hasWeightSlip?: boolean; // มีสลิปชั่งน้ำหนัก

  // การจัดสรรต้นทุน (3 หมวดหมู่หลัก: หักสัญญาช่าง, เข้างานโครงการตรง, สต๊อกคลัง/ใช้ทั่วไป)
  allocationType?: MaterialAllocationType; // 'subcontractor' | 'project_direct' | 'site_store'
  boqCategory?: string; // เช่น งานท่อระบายน้ำ คสล., งานโครงสร้างทาง

  // การผูกตัดหักสัญญาช่าง (กรณี allocationType === 'subcontractor')
  isBackcharge?: boolean;
  subcontractId?: string;
  contractNo?: string;
  contractorName?: string;

  // สถานะการวางบิล
  billingStatus: 'pending_billing' | 'billed' | 'cancelled';
  matchedBillingId?: string;
  matchedBillingNo?: string;
  matchedAt?: string;

  notes?: string;
  createdAt: string;
}

export interface SupplierBillItem {
  id: string;
  goodsReceiptId?: string; // อ้างอิงรหัสรายการตรวจรับพัสดุที่ถูกชนบิล
  grNo?: string; // เลขที่ใบตรวจรับสินค้า
  expressPoNo: string; // อ้างอิง PO Express
  doNo: string; // เลขที่ใบส่งของ
  invoiceNo?: string; // เลขที่ใบกำกับภาษี
  description: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  amount: number;
  receivedDate?: string;
  receiverName?: string;
  isBackcharge?: boolean;
  contractorName?: string;
}

export interface SupplierBilling {
  id: string;
  billingNo: string; // เช่น BILL-68-001
  vendorName: string;
  vendorTaxId?: string;
  vendorAddress?: string;
  project: string;
  receivedDate: string; // วันที่รับวางบิล
  creditDays: number; // เครดิตเทอม เช่น 30 วัน
  dueDate: string; // วันนัดชำระเงิน
  
  items: SupplierBillItem[];
  matchedReceiptIds?: string[]; // รายการพัสดุที่ถูกชนบิลในชุดเอกสารนี้
  subTotal: number;
  vatAmount: number;
  whtAmount: number;
  grandTotal: number;

  hasOriginalTaxInvoice: boolean;
  hasDeliverySlipWithSignature: boolean;
  hasWeightSlip?: boolean;

  // สถานะการจ่าย
  status: 'received' | 'verified' | 'ready_for_payment' | 'paid' | 'rejected';
  expressPvNo?: string; // เลขที่ใบสำคัญจ่ายใน Express เช่น PV68-0045
  paidDate?: string;
  paymentMethod?: string;
  paidAmount?: number;
  notes?: string;
  createdAt: string;
}

// ==========================================
// 3-Tier BOQ & Material Management
// ==========================================

export interface BOQMaterialItem {
  id: string;
  materialName: string; // e.g. "ท่อ คสล. มอก. ชั้น 3 dia 1.00 ม.", "คอนกรีตผสมเสร็จ 240 ksc"
  standardRatioPerUnit: number; // อัตราส่วนต่อหน่วยงานหลัก
  unit: string; // "ท่อน", "ลบ.ม.", "กก."
  totalRequiredQty: number; // โควตารวมที่ต้องใช้ตาม BOQ
  withdrawnQty: number; // ปริมาณที่เบิกใช้งานไปแล้ว
  unitPrice: number;
}

export interface ProjectBOQItem {
  id: string;
  project: string; // เช่น "(06) ขยายผิวจราจร ทล.218"
  itemNo: string; // เช่น "1.1", "2.1"
  description: string; // รายการงาน เช่น "งานวางท่อระบายน้ำ คสล. dia 1.00 ม."
  unit: string; // "ม.", "ตร.ม.", "ลบ.ม."
  
  // Tier 1: BOQ ตามสัญญาโครงการ (Contract / Tender BOQ)
  contractQty: number;
  contractUnitRate: number;
  contractAmount: number;

  // Tier 2: BOQ ที่วิศวกรสำรวจหน้างานจริง (Site Budget BOQ)
  engineerQty: number;
  engineerUnitCost: number; // ต้นทุนต่อหน่วยเป้าหมาย
  engineerAmount: number;

  // Tier 3: รายการวัสดุที่ต้องใช้ (BOM)
  materials: BOQMaterialItem[];

  // Allocation & Progress Tracking
  subcontractAllocatedQty: number; // รวมปริมาณงานที่ทำสัญญาจ้างช่างเหมาไปแล้ว
  completedQty: number; // ปริมาณงานที่ตรวจรับสะสม
}

// ==========================================
// Subcontractor Management & Progress Claims
// ==========================================

export interface Subcontract {
  id: string;
  contractNo: string; // e.g. "SUB-67-001"
  contractTitle: string; // e.g. "งานวางท่อระบายน้ำ คสล. ช่วง กม. 10+000 - 15+000"
  project: string;
  boqItemId?: string; // เชื่อมโยงกับ BOQ ของโครงการ
  contractorName: string; // ชื่อช่างเหมา หรือ นิติบุคคล
  entityType: 'individual' | 'corporate_vat' | 'corporate_novat'; // บุคคลธรรมดา, นิติบุคคลมี VAT, นิติบุคคลไม่มี VAT
  taxId: string; // เลขประจำตัวผู้เสียภาษี / บัตร ปชช.
  phone?: string;
  defaultBankName: string;
  defaultBankAccount: string;
  defaultAccountName: string;

  // ขอบเขตและสถานที่
  startKm?: string; // "กม. 10+000"
  endKm?: string; // "กม. 15+000"
  workCategory: string; // "งานท่อระบายน้ำ", "งานผิวทาง", "งานโครงสร้างสะพาน"
  quantity: number; // ปริมาณงานตามสัญญา
  unit: string; // "ม.", "ตร.ม.", "ลบ.ม."
  unitRate: number; // ราคาต่อหน่วยสัญญาจ้าง
  contractAmount: number; // มูลค่าสัญญารวม

  // เงื่อนไขสัญญา
  retentionRate: number; // เช่น 0.05 (5%)
  warrantyPeriodMonths: number; // เช่น 12 เดือน หรือ 24 เดือน
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'terminated';

  // ข้อมูลทางนิติกรรมสัญญาเพิ่มเติม (Legal & Execution Details)
  contractDate?: string; // วันที่ทำสัญญา เช่น "15 ธันวาคม 2568"
  contractLocation?: string; // สถานที่ทำสัญญา
  contractLocationAddress?: string; // ที่อยู่สถานที่ทำสัญญา
  employerName?: string; // ชื่อผู้ว่าจ้าง เช่น "บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด"
  employerRep?: string; // ตัวแทนผู้ว่าจ้างผู้ลงนาม เช่น "นายวิชัย นพสุวรรณวงศ์"
  employerPosition?: string; // ตำแหน่งผู้ว่าจ้าง เช่น "กรรมการผู้จัดการ"
  employerAddress?: string; // ที่อยู่ผู้ว่าจ้าง
  contractorRep?: string; // ตัวแทนผู้รับจ้างผู้ลงนาม เช่น "นายปิยะพงษ์ สิทธิชัย"
  contractorPosition?: string; // ตำแหน่งตัวแทนผู้รับจ้าง เช่น "หุ้นส่วนผู้จัดการ"
  contractorAddress?: string; // ที่อยู่ตามทะเบียนของผู้รับจ้าง
  dailyPenalty?: number; // เบี้ยปรับล่าช้าต่อวัน (บาท/วัน) เช่น 3000
  dailyPenaltyText?: string; // คำอ่านเบี้ยปรับ เช่น "สามพันบาทถ้วน"
  paymentDueDay?: number; // กำหนดจ่ายเงินทุกวันที่...ของเดือน
  depositAmount?: number; // เงินมัดจำ/จ่ายล่วงหน้า
  installmentCount?: number; // จำนวนงวดงาน
  workDurationMonths?: number; // ระยะเวลาก่อสร้าง (เดือน)

  // สรุปยอดสะสม
  totalInspectedQty: number;
  totalApprovedAmount: number;
  totalPaidAmount: number;
  totalRetentionHeld: number; // ยอดเงินประกันสะสมที่ยังไม่คืน
  totalRetentionRefunded: number;
}

export interface SubcontractInspection {
  id: string;
  subcontractId: string;
  contractNo: string;
  project: string;
  contractorName: string;
  inspectionNo: number; // เลขที่ตรวจงาน นับครั้งอัตโนมัติ (ครั้งที่ 1, 2, 3...)
  inspectionDate: string; // วันที่ตรวจสอบ
  inspectorName: string; // วิศวกรผู้ตรวจ
  startKm: string; // ช่วง กม. เริ่มต้น
  endKm: string; // ช่วง กม. สิ้นสุด
  workDescription: string; // รายละเอียดขอบเขตงานประจำงวดที่ตรวจรับและอนุมัติผ่าน
  inspectedQty: number; // ปริมาณงานที่ทำได้จริงและตรวจผ่าน
  unit: string;
  unitRate: number; // ราคาต่อหน่วยตามสัญญา
  approvedAmount: number; // มูลค่างานที่ผ่านอนุมัติเบิกจ่าย (inspectedQty * unitRate)
  notes?: string;
  status: 'approved' | 'claimed'; // 'approved' (รอตั้งเบิก) หรือ 'claimed' (ทำเรื่องเบิกแล้ว)
  paymentClaimId?: string;
  createdAt: string;
}

export interface SubcontractDeduction {
  id: string;
  type: 'material_store' | 'damage_penalty' | 'fuel' | 'other';
  storeOrVendorName?: string; // ชื่อร้านค้า/คลัง เช่น "ร้าน ป.ศิลาชัย คอนกรีต"
  billOrDocNo?: string; // เลขที่บิล/ใบส่งของ
  description: string; // รายละเอียด เช่น "ท่อ คสล. 1.00 ม. 20 ท่อน", "ซ่อมเครื่องจักร"
  amount: number;
  date: string;
}

export interface SubcontractPaymentClaim {
  id: string;
  claimNo: string; // e.g. "CLAIM-SUB-67-001-01"
  subcontractId: string;
  contractNo: string;
  project: string;
  contractorName: string;
  inspectionId: string;
  inspectionNo: number;
  claimDate: string; // วันที่ขอเบิก
  
  // การรวมยอดคำนวณสุทธิ
  approvedWorkAmount: number; // (A) มูลค่างานที่ตรวจรับผ่าน
  retentionRate: number; // 5%
  retentionAmount: number; // (B) หักเงินประกันผลงาน
  materialDeductionsTotal: number; // (C) หักรายการวัสดุร้านค้าที่ผู้รับเหมานำไปใช้
  otherDeductionsTotal: number; // (D) หักรายการอื่นๆ เช่น ค่าปรับ ค่าอุปกรณ์เสียหาย
  deductionItems: SubcontractDeduction[]; // รายการหักละเอียด
  
  taxBaseAmount: number; // ฐานภาษี = A - B - C - D
  
  entityType: 'individual' | 'corporate_vat' | 'corporate_novat';
  vatRate: number; // 0 หรือ 0.07
  vatAmount: number;
  whtRate: number; // 0.03 (3%)
  whtAmount: number;
  netPayableAmount: number; // ยอดจ่ายสุทธิ = TaxBase + VAT - WHT
  
  // ผู้รับเงินประจำงวด (รองรับการเปลี่ยนตัวหรือผู้รับมอบอำนาจ)
  payeeName: string;
  payeeTaxId: string;
  payeeBankName: string;
  payeeBankAccount: string;
  isAuthorizedRepresentative: boolean;
  authorizationRef?: string;
  
  // ลิงก์เชื่อมโยงระบบ DBM / การเงิน
  dbmNo?: string;
  createdDbmId?: string;
  status: 'draft' | 'submitted' | 'approved' | 'paid';
  paidDate?: string;
  pvNo?: string;
  notes?: string;
  createdAt: string;
}

export interface RetentionLedgerRecord {
  id: string;
  subcontractId: string;
  contractNo: string;
  project: string;
  contractorName: string;
  claimId: string;
  claimNo: string;
  inspectionNo: number;
  deductedDate: string;
  retentionAmount: number; // ยอดเงินประกันที่หักไว้ในงวดนี้
  
  // ข้อมูลบัญชีที่ถูกหักเงินจริง (Strict Locked Account)
  payeeName: string; // บังคับคืนเฉพาะบุคคลนี้เท่านั้น
  payeeBankName: string;
  payeeBankAccount: string;
  payeeTaxId: string;
  
  // สถานะการคืนเงิน
  status: 'held' | 'refunded';
  refundDate?: string;
  refundRefNo?: string;
  refundPvNo?: string;
  refundRemarks?: string;
}
