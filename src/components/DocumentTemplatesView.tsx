import { useState, useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  CheckCircle2, 
  Award, 
  Building2, 
  DollarSign, 
  Layers, 
  ShieldCheck, 
  FileCheck, 
  BarChart2,
  CreditCard,
  FileSpreadsheet,
  FileCheck2,
  Receipt,
  Truck,
  Search,
  Building,
  Info,
  ChevronRight,
  Sparkles,
  Eye,
  Briefcase
} from 'lucide-react';
import { 
  CompanyInfo, 
  DEFAULT_SAMPLE_COMPANY, 
  GROUP_COMPANIES_INFO 
} from './documents/types';
import { INITIAL_SUBCONTRACTS } from '../data/subcontractData';
import { INITIAL_DISBURSEMENTS } from '../utils/disbursementData';
import {
  RFQFormTemplate,
  ComparisonMatrixTemplate,
  PAApprovalTemplate,
  SAApprovalTemplate,
  SubcontractorContractTemplate,
  DeliveryNoteTemplate,
  SubcontractorBillingTemplate,
  ProjectBOQTemplate,
  DigitalCertificateTemplate
} from './documents/StandardDocumentForms';
import {
  PaymentVoucherTemplate,
  DisbursementVoucherTemplate,
  WithholdingTax50TwiTemplate,
  MaterialBackchargeTemplate,
  SupplierBillingSlipTemplate,
  DBMTemplate
} from './documents/AdditionalDocumentForms';

export type DocumentCategory = 'all' | 'procurement' | 'project' | 'finance' | 'accounting_legal';

export interface DocumentMeta {
  id: string;
  code: string;
  title: string;
  category: DocumentCategory;
  categoryName: string;
  icon: any;
  purpose: string;
  department: string;
  standardRef: string;
  recommendedUse: string;
}

export const DOCUMENT_CATALOG: DocumentMeta[] = [
  // ฝ่ายจัดซื้อ (Procurement)
  {
    id: 'rfq_form',
    code: 'RFQ',
    title: '1. ใบขอสอบราคา (Request for Quotation)',
    category: 'procurement',
    categoryName: 'ฝ่ายจัดซื้อ',
    icon: FileCheck,
    purpose: 'ส่งให้ผู้ขาย/ร้านค้า กรอกราคาต่อหน่วยและเงื่อนไขการส่งมอบ',
    department: 'ฝ่ายจัดซื้อและบริหารสัญญา',
    standardRef: 'RFQ Standard Form v1.2',
    recommendedUse: 'ก่อนออกใบสั่งซื้อ หรือสอบราคาวัสดุเทียบ 3 ราย'
  },
  {
    id: 'comparison_matrix',
    code: 'CM',
    title: '2. ตารางเปรียบเทียบราคาผู้เสนอราคา (Quotation Comparison)',
    category: 'procurement',
    categoryName: 'ฝ่ายจัดซื้อ',
    icon: BarChart2,
    purpose: 'เปรียบเทียบข้อเสนอ 3 ร้านค้า ทั้งราคา เครดิต และเงื่อนไขขนส่ง',
    department: 'ฝ่ายจัดซื้อ / วิศวกรโครงการ / กรรมการผู้จัดการ',
    standardRef: 'Procurement Matrix Matrix-01',
    recommendedUse: 'เสนอขออนุมัติจัดซื้อจากผู้มีอำนาจตัดสินใจ'
  },
  {
    id: 'pa_approval',
    code: 'PA/PO',
    title: '3. ใบขออนุมัติสั่งซื้อวัสดุ (Purchase Authorization : PA)',
    category: 'procurement',
    categoryName: 'ฝ่ายจัดซื้อ',
    icon: CheckCircle2,
    purpose: 'ขออนุมัติวงเงินจัดซื้อวัสดุและส่งยืนยันให้ร้านค้าจัดส่ง',
    department: 'ฝ่ายจัดซื้อ / กรรมการผู้จัดการ',
    standardRef: 'PA Standard Workflow',
    recommendedUse: 'สั่งซื้อคอนกรีต, เหล็ก, หิน, ท่อ และวัสดุหลัก'
  },

  // ฝ่ายโครงการ (Project Operations)
  {
    id: 'sa_approval',
    code: 'SA',
    title: '4. ใบขออนุมัติสั่งจ้างผู้รับเหมาช่วง (Subcontractor Authorization)',
    category: 'project',
    categoryName: 'ฝ่ายโครงการ',
    icon: Award,
    purpose: 'วิศวกรเสนอขอเปิดสัญญาจ้างช่างเหมาช่วงเฉพาะงาน',
    department: 'วิศวกรสนาม / ผู้จัดการโครงการ / กรรมการผู้จัดการ',
    standardRef: 'Subcontract Auth Protocol',
    recommendedUse: 'ก่อนทำสัญญาจ้างเหมาช่วง (SC)'
  },
  {
    id: 'subcontractor_contract',
    code: 'SC',
    title: '5. สัญญาจ้างเหมาช่วงงานก่อสร้าง (Subcontract Agreement)',
    category: 'project',
    categoryName: 'ฝ่ายโครงการ',
    icon: FileText,
    purpose: 'นิติกรรมสัญญาจ้างเหมาช่วง แบ่งจ่าย 3 งวด พร้อมหักประกันผลงาน 5%',
    department: 'ฝ่ายโครงการ & นิติกร',
    standardRef: 'FIDIC Subcontract / กรมทางหลวง Standard',
    recommendedUse: 'ผูกพันสัญญากับช่างโครงสร้าง ช่างวางท่อ ช่างผิวทาง'
  },
  {
    id: 'delivery_note',
    code: 'DN',
    title: '6. ใบส่งของ & ตรวจรับพัสดุเข้าคลังสนาม (Delivery Note & Receipt)',
    category: 'project',
    categoryName: 'ฝ่ายโครงการ',
    icon: Building2,
    purpose: 'ตรวจรับวัสดุหน้างาน บันทึกผล Slump Test เก็บลูกปูน และระบุจุดเท',
    department: 'วิศวกรผู้ควบคุมงาน / เจ้าหน้าที่สโตร์สนาม',
    standardRef: 'Field Inspection Form GR-01',
    recommendedUse: 'รับคอนกรีต, เหล็กเส้น, หินคลุก ทุกเที่ยวรถ'
  },
  {
    id: 'project_boq',
    code: 'BOQ',
    title: '8. สรุปบัญชีแสดงปริมาณวัสดุและราคา (BOQ Analysis)',
    category: 'project',
    categoryName: 'ฝ่ายโครงการ',
    icon: Layers,
    purpose: 'เปรียบเทียบงบประมาณตามสัญญาประมูล กับต้นทุนที่จ่ายจริงหน้างาน',
    department: 'วิศวกรโครงการ / วิศวกรต้นทุน (QS)',
    standardRef: 'DOH Highway BOQ Standard',
    recommendedUse: 'วิเคราะห์ส่วนต่างกำไร/ขาดทุนรายหมวดงาน'
  },
  {
    id: 'material_backcharge',
    code: 'BC',
    title: '13. ใบตัดหนี้ / หักเงินค่าวัสดุและเครื่องจักร (Backcharge Note)',
    category: 'project',
    categoryName: 'ฝ่ายโครงการ',
    icon: Truck,
    purpose: 'แจ้งหักเงินช่างเหมาช่วง กรณีบริษัทออกค่าคอนกรีต เหล็ก น้ำมัน หรือเครื่องจักรให้',
    department: 'วิศวกรสนาม / สโตร์ / บัญชีต้นทุน',
    standardRef: 'Cost Allocation Standard CA-02',
    recommendedUse: 'ส่งฝ่ายการเงินหักลบในใบเบิกค่างานงวด (RQ)'
  },

  // ฝ่ายการเงิน (Finance & Treasury)
  {
    id: 'subcontractor_billing',
    code: 'RQ',
    title: '7. ใบขออนุมัติเบิกจ่ายค่างานผู้รับเหมาช่วง (Subcontractor Claim)',
    category: 'finance',
    categoryName: 'ฝ่ายการเงิน',
    icon: DollarSign,
    purpose: 'คำนวณเบิกค่างานงวด หักเงินยืมล่วงหน้า หักค่าวัสดุ หักประกัน 5% และหักภาษี 3%',
    department: 'วิศวกรผู้ตรวจงาน / ฝ่ายการเงิน / กรรมการผู้จัดการ',
    standardRef: 'Payment Requisition Claim-01',
    recommendedUse: 'เบิกจ่ายเงินงวดงานช่างเหมาทุกงวด'
  },
  {
    id: 'disbursement_voucher',
    code: 'DBM',
    title: '11. ใบขออนุมัติเบิกจ่าย / ใบตั้งเบิก (Disbursement Requisition)',
    category: 'finance',
    categoryName: 'ฝ่ายการเงิน',
    icon: FileSpreadsheet,
    purpose: 'ขออนุมัติเบิกเงินสด/โอนจ่ายค่าวัสดุย่อย ค่าน้ำมัน ค่าเดินทาง และค่าใช้จ่ายทั่วไป',
    department: 'ผู้ขอเบิกทุกฝ่าย / ผู้จัดการโครงการ / บัญชีการเงิน',
    standardRef: 'DBM Workflow Form v2.0',
    recommendedUse: 'ก่อนตั้งเบิกและส่งต่อให้ฝ่ายการเงินจัดทำ PV'
  },
  {
    id: 'payment_voucher',
    code: 'PV',
    title: '10. ใบสำคัญจ่าย (Payment Voucher)',
    category: 'finance',
    categoryName: 'ฝ่ายการเงิน',
    icon: CreditCard,
    purpose: 'เอกสารหลักฐานการจ่ายเงิน บันทึกบัญชี Dr./Cr. หักภาษี ณ ที่จ่าย และตัดบัญชีธนาคาร',
    department: 'ฝ่ายการเงิน & ฝ่ายบัญชี',
    standardRef: 'Accounting Voucher Form PV-Standard',
    recommendedUse: 'ออกคู่กับการโอนเงิน/สั่งจ่ายเช็คทุกรายการ'
  },

  // ฝ่ายบัญชี & กฎหมาย (Accounting & Legal)
  {
    id: 'wht_50_twi',
    code: '50 ทวิ',
    title: '12. หนังสือรับรองการหักภาษี ณ ที่จ่าย (Withholding Tax Certificate)',
    category: 'accounting_legal',
    categoryName: 'ฝ่ายบัญชี & ภาษี',
    icon: FileCheck2,
    purpose: 'ออกให้ผู้รับจ้าง/ผู้ให้บริการ ตามมาตรา 50 ทวิ (ภ.ง.ด.3 / ภ.ง.ด.53)',
    department: 'ฝ่ายบัญชีและภาษีอากร',
    standardRef: 'Revenue Department Standard Form 50 Twi',
    recommendedUse: 'ส่งมอบให้ช่างเหมาและคู่ค้าทุกครั้งที่มีการหักภาษี'
  },
  {
    id: 'supplier_billing',
    code: 'BILL',
    title: '14. ใบรับวางบิลร้านค้า / คู่ค้า (Supplier Billing Acceptance)',
    category: 'accounting_legal',
    categoryName: 'ฝ่ายบัญชี & ภาษี',
    icon: Receipt,
    purpose: 'หลักฐานการรับวางบิลระบุวันนัดจ่ายเงินเช็ค/โอนตามเครดิตเทอม',
    department: 'ฝ่ายบัญชีเจ้าหนี้ (AP)',
    standardRef: 'Accounts Payable Slip AP-01',
    recommendedUse: 'ออกให้ร้านค้าเมื่อนำส่งใบแจ้งหนี้และใบส่งของ'
  },
  {
    id: 'digital_certificate',
    code: 'CERT',
    title: '9. ใบรับรองการลงนามดิจิทัล (Digital Audit Certificate)',
    category: 'accounting_legal',
    categoryName: 'ฝ่ายบัญชี & ระบบ',
    icon: ShieldCheck,
    purpose: 'รับรองความถูกต้องของการอนุมัติแบบไร้กระดาษ พร้อมรหัส Checksum SHA-256',
    department: 'ฝ่ายบริหาร / ระบบสารสนเทศไอที',
    standardRef: 'Digital Signature Standard ISO/IEC 27001',
    recommendedUse: 'แนบท้ายเอกสารอนุมัติทางอิเล็กทรอนิกส์'
  }
];

export function DocumentTemplatesView() {
  const [activeDocId, setActiveDocId] = useState<string>('payment_voucher');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCompanyKey, setSelectedCompanyKey] = useState<string>('BTC');
  const [selectedSubcontractId, setSelectedSubcontractId] = useState<string>('sample');
  const [selectedDisbursementId, setSelectedDisbursementId] = useState<string>('sample');

  const selectedSub = useMemo(() => {
    return INITIAL_SUBCONTRACTS.find(s => s.id === selectedSubcontractId);
  }, [selectedSubcontractId]);

  const selectedDbm = useMemo(() => {
    return INITIAL_DISBURSEMENTS.find(d => d.id === selectedDisbursementId);
  }, [selectedDisbursementId]);

  const currentCompany: CompanyInfo = useMemo(() => {
    return GROUP_COMPANIES_INFO[selectedCompanyKey] || DEFAULT_SAMPLE_COMPANY;
  }, [selectedCompanyKey]);

  // Filter documents based on category and search
  const filteredDocs = useMemo(() => {
    return DOCUMENT_CATALOG.filter(doc => {
      const matchCat = selectedCategory === 'all' || doc.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || 
        doc.title.toLowerCase().includes(q) ||
        doc.code.toLowerCase().includes(q) ||
        doc.purpose.toLowerCase().includes(q) ||
        doc.department.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeDocMeta = useMemo(() => {
    return DOCUMENT_CATALOG.find(d => d.id === activeDocId) || DOCUMENT_CATALOG[0];
  }, [activeDocId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Controller */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs print:hidden space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#005aa9] text-white rounded-lg">
                <FileText className="w-5 h-5" />
              </span>
              <h1 className="text-lg font-bold text-slate-900">
                ศูนย์รวมแบบฟอร์ม & ตัวอย่างเอกสารมาตรฐาน (Document Center)
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-[#009540]">
                14 ฉบับมาตรฐาน
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              แบบฟอร์มเอกสารมาตรฐานงานก่อสร้าง จัดซื้อ บัญชี และการเงิน พร้อมระบบจัดรูปแบบพิมพ์ A4 มาตรฐาน
            </p>
          </div>

          {/* Action Bar: Company Switcher & Print Button */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Company Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600 font-medium hidden sm:inline">บริษัท:</span>
              <select
                value={selectedCompanyKey}
                onChange={(e) => setSelectedCompanyKey(e.target.value)}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="BTC">BTC (บุรีรัมย์ธงชัยก่อสร้าง)</option>
                <option value="BTCP">BTCP (บุรีรัมย์ธงชัย แพลนท์)</option>
                <option value="TBTC">TBTC (ธงชัยบุรีรัมย์ก่อสร้าง)</option>
                <option value="BTC-PC">BTC-PC (ร่วมค้า บีทีซี-พีซี)</option>
              </select>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#009540] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสารนี้ (Print A4)</span>
            </button>
          </div>
        </div>

        {/* Official Company Letterhead Profile Box */}
        <div className="p-3.5 bg-gradient-to-r from-blue-50/70 via-slate-50 to-emerald-50/50 rounded-xl border border-blue-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            {currentCompany.logo ? (
              <img 
                src={currentCompany.logo} 
                alt={currentCompany.name} 
                className="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-slate-200 shadow-2xs shrink-0" 
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-[#005aa9] text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                BTC
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight truncate">
                  {currentCompany.name}
                </h3>
                {currentCompany.nameEn && (
                  <span className="text-[10px] text-slate-500 font-semibold truncate hidden sm:inline">
                    ({currentCompany.nameEn})
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ค่าเริ่มต้นหัวกระดาษแบบฟอร์มเอกสารมาตรฐาน
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                {currentCompany.address}
              </p>
              <div className="flex items-center gap-3 text-[10.5px] text-slate-500 mt-1 font-mono flex-wrap">
                <span>เลขผู้เสียภาษี: <strong className="text-slate-800">{currentCompany.taxId}</strong></span>
                <span>•</span>
                <span>โทร: <strong className="text-slate-800">{currentCompany.phone}</strong></span>
                {currentCompany.email && (
                  <>
                    <span>•</span>
                    <span>E-Mail: <strong className="text-slate-800 font-sans">{currentCompany.email}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 bg-white/80 border border-slate-200 rounded-lg px-2.5 py-1.5 shrink-0 self-stretch md:self-auto text-right md:text-left">
            <span className="font-bold text-slate-700 block">แม่แบบเอกสารที่เชื่อมโยง:</span>
            <span className="text-[10px] text-emerald-700 font-semibold">✓ 14 แบบฟอร์มดึงข้อมูลหัวกระดาษนี้อัตโนมัติ</span>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ทั้งหมด (14)
            </button>
            <button
              onClick={() => setSelectedCategory('procurement')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'procurement'
                  ? 'bg-[#005aa9] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ฝ่ายจัดซื้อ (3)
            </button>
            <button
              onClick={() => setSelectedCategory('project')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'project'
                  ? 'bg-[#005aa9] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ฝ่ายโครงการ (4)
            </button>
            <button
              onClick={() => setSelectedCategory('finance')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'finance'
                  ? 'bg-[#009540] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ฝ่ายการเงิน (3)
            </button>
            <button
              onClick={() => setSelectedCategory('accounting_legal')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'accounting_legal'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ฝ่ายบัญชี & ภาษี (4)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รหัส (PV, RFQ, 50ทวิ)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#005aa9]"
            />
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Document Selector Sidebar */}
        <div className="w-full lg:w-80 shrink-0 bg-white border border-slate-200 rounded-xl p-2.5 space-y-1.5 shadow-xs print:hidden max-h-[820px] overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>รายการแบบฟอร์ม ({filteredDocs.length})</span>
            <span className="text-[10px] text-slate-400">คลิกเพื่อดูตัวอย่าง</span>
          </div>

          {filteredDocs.map((doc) => {
            const Icon = doc.icon;
            const isActive = activeDocId === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition cursor-pointer border ${
                  isActive
                    ? 'bg-blue-50/80 border-[#005aa9] text-slate-900 shadow-xs ring-1 ring-[#005aa9]/20'
                    : 'bg-white border-transparent hover:bg-slate-50 text-slate-700 hover:border-slate-200'
                }`}
              >
                <span className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
                  isActive ? 'bg-[#005aa9] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-black shrink-0 ${
                      isActive ? 'bg-[#005aa9] text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {doc.code}
                    </span>
                    <span className="text-xs font-bold truncate">
                      {doc.title}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 line-clamp-1 mt-0.5">
                    {doc.purpose}
                  </p>
                  <div className="flex items-center gap-2 text-[9.5px] text-slate-400 mt-1">
                    <span>{doc.categoryName}</span>
                    <span>•</span>
                    <span className="truncate">{doc.standardRef}</span>
                  </div>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-[#005aa9] shrink-0 self-center" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Preview Sheet Area */}
        <div className="flex-1 w-full space-y-3">
          {/* Active Document Info Strip */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs print:hidden">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-md text-xs font-black bg-[#005aa9] text-white">
                {activeDocMeta.code}
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">{activeDocMeta.title}</h2>
                <p className="text-[11px] text-slate-500">
                  ฝ่ายที่รับผิดชอบ: <strong className="text-slate-800">{activeDocMeta.department}</strong> | มาตรฐาน: <span className="font-mono">{activeDocMeta.standardRef}</span>
                </p>
              </div>
            </div>
            
            {/* Real Data Linkage Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              {activeDocId === 'subcontractor_contract' && (
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-xs">
                  <span className="font-bold text-[#005aa9] whitespace-nowrap">ข้อมูลในระบบ:</span>
                  <select
                    value={selectedSubcontractId}
                    onChange={(e) => setSelectedSubcontractId(e.target.value)}
                    className="bg-white border border-blue-300 rounded px-2 py-0.5 font-medium text-slate-800 text-xs outline-none cursor-pointer max-w-[200px] truncate"
                  >
                    <option value="sample">📄 ข้อมูลตัวอย่างมาตรฐาน (Sample)</option>
                    {INITIAL_SUBCONTRACTS.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.contractNo} - {sub.contractorName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeDocId === 'disbursement_voucher' && (
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs">
                  <span className="font-bold text-[#009540] whitespace-nowrap">ข้อมูลในระบบ:</span>
                  <select
                    value={selectedDisbursementId}
                    onChange={(e) => setSelectedDisbursementId(e.target.value)}
                    className="bg-white border border-emerald-300 rounded px-2 py-0.5 font-medium text-slate-800 text-xs outline-none cursor-pointer max-w-[200px] truncate"
                  >
                    <option value="sample">📄 ข้อมูลตัวอย่างมาตรฐาน (Sample)</option>
                    {INITIAL_DISBURSEMENTS.slice(0, 25).map((dbm) => (
                      <option key={dbm.id} value={dbm.id}>
                        {dbm.dbmNo} - {dbm.payeeName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <span className="text-[10.5px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 shrink-0">
                หน้าตัวอย่าง A4 (Print-Ready)
              </span>
            </div>
          </div>

          {/* Document Sheet Display (Simulated A4 Paper) */}
          <div className="bg-slate-200/70 p-2 sm:p-5 rounded-xl border border-slate-300 overflow-x-auto shadow-inner print:p-0 print:bg-white print:border-none print:shadow-none">
            <div className="max-w-[850px] mx-auto bg-white shadow-xl rounded-sm overflow-hidden print:shadow-none print:max-w-none print:rounded-none">
              {/* 1. RFQ */}
              {activeDocId === 'rfq_form' && (
                <RFQFormTemplate company={currentCompany} />
              )}

              {/* 2. CM */}
              {activeDocId === 'comparison_matrix' && (
                <ComparisonMatrixTemplate company={currentCompany} />
              )}

              {/* 3. PA */}
              {activeDocId === 'pa_approval' && (
                <PAApprovalTemplate company={currentCompany} />
              )}

              {/* 4. SA */}
              {activeDocId === 'sa_approval' && (
                <SAApprovalTemplate company={currentCompany} />
              )}

              {/* 5. SC */}
              {activeDocId === 'subcontractor_contract' && (
                <SubcontractorContractTemplate 
                  company={currentCompany}
                  contractNo={selectedSub?.contractNo}
                  projectName={selectedSub?.project}
                  contractDate={selectedSub?.contractDate}
                  contractLocation={selectedSub?.contractLocation}
                  contractLocationAddress={selectedSub?.contractLocationAddress}
                  employerName={selectedSub?.employerName}
                  employerRep={selectedSub?.employerRep}
                  employerPosition={selectedSub?.employerPosition}
                  employerAddress={selectedSub?.employerAddress}
                  contractorName={selectedSub?.contractorName}
                  contractorTaxId={selectedSub?.taxId}
                  contractorRep={selectedSub?.contractorRep}
                  contractorPosition={selectedSub?.contractorPosition}
                  contractorAddress={selectedSub?.contractorAddress}
                  workScope={selectedSub ? `${selectedSub.contractTitle} (${selectedSub.workCategory}) ${selectedSub.startKm ? `ช่วง กม. ${selectedSub.startKm} ถึง ${selectedSub.endKm}` : ''} ${selectedSub.project}` : undefined}
                  contractAmount={selectedSub?.contractAmount}
                  retentionPercent={selectedSub ? Math.round(selectedSub.retentionRate * 100) : undefined}
                  retentionReturnMonths={selectedSub?.warrantyPeriodMonths || 12}
                  startDate={selectedSub?.startDate}
                  endDate={selectedSub?.endDate}
                  dailyPenalty={selectedSub?.dailyPenalty}
                  dailyPenaltyText={selectedSub?.dailyPenaltyText}
                  paymentDueDay={selectedSub?.paymentDueDay}
                />
              )}

              {/* 6. DN */}
              {activeDocId === 'delivery_note' && (
                <DeliveryNoteTemplate company={currentCompany} />
              )}

              {/* 7. RQ */}
              {activeDocId === 'subcontractor_billing' && (
                <SubcontractorBillingTemplate company={currentCompany} />
              )}

              {/* 8. BOQ */}
              {activeDocId === 'project_boq' && (
                <ProjectBOQTemplate company={currentCompany} />
              )}

              {/* 9. CERT */}
              {activeDocId === 'digital_certificate' && (
                <DigitalCertificateTemplate company={currentCompany} />
              )}

              {/* 10. PV (Additional) */}
              {activeDocId === 'payment_voucher' && (
                <PaymentVoucherTemplate company={currentCompany} />
              )}

              {/* 11. DBM (Additional) */}
              {activeDocId === 'disbursement_voucher' && (
                <DBMTemplate 
                  company={currentCompany} 
                  disbursement={selectedDbm || undefined}
                />
              )}

              {/* 12. 50 ทวิ (Additional) */}
              {activeDocId === 'wht_50_twi' && (
                <WithholdingTax50TwiTemplate company={currentCompany} />
              )}

              {/* 13. Backcharge (Additional) */}
              {activeDocId === 'material_backcharge' && (
                <MaterialBackchargeTemplate company={currentCompany} />
              )}

              {/* 14. Supplier Billing (Additional) */}
              {activeDocId === 'supplier_billing' && (
                <SupplierBillingSlipTemplate company={currentCompany} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
