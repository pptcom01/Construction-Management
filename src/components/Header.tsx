import { 
  Menu, 
  Search, 
  Sparkles, 
  Download, 
  Upload, 
  ReceiptText, 
  Database, 
  Lock, 
  ShieldCheck,
  UserCheck,
  LogOut,
  Shield
} from 'lucide-react';
import { ViewTab, UserRole, AppUser } from '../types';
import { useActiveUser } from '../services/userService';

interface HeaderProps {
  currentTab: ViewTab;
  onOpenMobileMenu: () => void;
  onOpenAI: () => void;
  onExportCSV: () => void;
  onImportCSVClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalTransactionsCount: number;
  isSupabaseConnected?: boolean;
  onOpenSupabaseStatus?: () => void;
  userRole?: UserRole;
  currentUser?: AppUser | null;
  onLogout?: () => void;
  onOpenUserProfile?: () => void;
}

export type DepartmentZone = 'project' | 'procurement' | 'finance' | 'accounting_executive';

interface TabMeta {
  department: DepartmentZone;
  departmentName: string;
  badgeColor: string;
  title: string;
  subtitle: string;
}

const TAB_METADATA: Record<ViewTab, TabMeta> = {
  // ฝ่ายโครงการ
  boq: {
    department: 'project',
    departmentName: 'ฝ่ายโครงการ',
    badgeColor: 'bg-blue-50 text-[#005aa9] border-blue-200',
    title: 'BOQ โครงการ',
    subtitle: 'บริหาร BOQ 3 ชั้น: สัญญาประมูล, งบวิศวะหน้างาน และโควตาถอดแบบวัสดุ (BOM) รายโครงการ'
  },
  subcontracts: {
    department: 'project',
    departmentName: 'ฝ่ายโครงการ',
    badgeColor: 'bg-blue-50 text-[#005aa9] border-blue-200',
    title: 'บริหารผู้รับเหมาช่วง & ตรวจรับงาน',
    subtitle: 'สัญญาจ้างช่างเหมา, ตรวจรับงานตาม กม., หักค่าวัสดุร้านค้า/ค่าปรับ, เบิกค่าผลงาน และคืนเงินประกัน'
  },
  projects: {
    department: 'project',
    departmentName: 'ฝ่ายโครงการ',
    badgeColor: 'bg-blue-50 text-[#005aa9] border-blue-200',
    title: 'ต้นทุน & กำไรโครงการ',
    subtitle: 'ภาพรวมกำไรขั้นต้น, สรุปรายรับ-รายจ่ายจริงเทียบโครงการ และแยกตามหมวดต้นทุน'
  },

  // ฝ่ายจัดซื้อ
  procurement: {
    department: 'procurement',
    departmentName: 'ฝ่ายจัดซื้อ',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    title: 'ตรวจรับพัสดุ & ตัดหักสัญญา (Goods Receipts & Allocation)',
    subtitle: 'ตรวจรับวัสดุหน้างานตามใบส่งของ DO, จัดสรรต้นทุนเข้าโครงการ/สต๊อกสโตร์, หักเงินสัญญาช่างเหมา และเทียบราคา 3 เจ้า'
  },
  supplier_billing: {
    department: 'procurement',
    departmentName: 'ฝ่ายจัดซื้อ',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    title: 'รับวางบิลร้านค้า & เช็คเอกสาร 3-Way Match',
    subtitle: 'รับวางบิลผู้ค้า, ตรวจใบกำกับภาษี-ใบส่งของมีลายเซ็นต์-สลิปชั่ง, ตรวจสอบตัดหักช่าง และส่งฝ่ายการเงินตั้งเบิก'
  },

  // ฝ่ายการเงิน
  disbursements: {
    department: 'finance',
    departmentName: 'ฝ่ายการเงิน',
    badgeColor: 'bg-emerald-50 text-[#009540] border-emerald-200',
    title: 'ใบขอตั้งเบิก (DBM)',
    subtitle: 'จัดทำใบขอตั้งเบิกเงินค่าใช้จ่าย, แนบเอกสารหลักฐาน และเสนอผู้บริหารพิจารณาอนุมัติจ่าย'
  },
  payment: {
    department: 'finance',
    departmentName: 'ฝ่ายการเงิน',
    badgeColor: 'bg-emerald-50 text-[#009540] border-emerald-200',
    title: 'บันทึกจ่ายเงิน & ใบสำคัญจ่าย (PV)',
    subtitle: 'คิวจ่ายเงินที่ได้รับอนุมัติแล้ว, บันทึกการโอนเงิน, แนบสลิป และพิมพ์ PV'
  },
  accounts: {
    department: 'finance',
    departmentName: 'ฝ่ายการเงิน',
    badgeColor: 'bg-emerald-50 text-[#009540] border-emerald-200',
    title: 'บัญชีธนาคาร & เงินยืมในเครือ',
    subtitle: 'ยอดเงินฝากทุกบัญชีธนาคาร (KTB, BBL), บัญชีเงินสดย่อย และเงินกู้ยืมระหว่างบริษัท'
  },

  // ฝ่ายบัญชี & ผู้บริหาร
  dashboard: {
    department: 'accounting_executive',
    departmentName: 'ฝ่ายบัญชี & ผู้บริหาร',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    title: 'แดชบอร์ดภาพรวมผู้บริหาร',
    subtitle: 'สรุปภาพรวมสภาพคล่อง, ผลประกอบการ 4 บริษัทในเครือ และสถานะกระแสเงินสด'
  },
  reports: {
    department: 'accounting_executive',
    departmentName: 'ฝ่ายบัญชี & ผู้บริหาร',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    title: 'รายงานการเงิน & งบกำไรขาดทุน (P&L)',
    subtitle: 'งบกำไรขาดทุนสะสม, วิเคราะห์รายรับ-รายจ่ายรายเดือน และสถานะสภาพคล่อง'
  },
  ai_analysis: {
    department: 'accounting_executive',
    departmentName: 'ฝ่ายบัญชี & ผู้บริหาร',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    title: 'AI วิเคราะห์งบการเงิน & สภาพคล่อง',
    subtitle: 'ประเมินกระแสเงินสดจากการดำเนินงาน, เฝ้าระวังความเสี่ยงโครงการ และ Cash Runway'
  },
  transactions: {
    department: 'accounting_executive',
    departmentName: 'ฝ่ายบัญชี & ผู้บริหาร',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    title: 'สมุดรายรับ-รายจ่าย (GL)',
    subtitle: 'สมุดรายวันทั่วไป, บัญชีแยกประเภท, บันทึกเดบิต/เครดิต และกระทบยอดสเตทเมนต์'
  },
  tax_summary: {
    department: 'accounting_executive',
    departmentName: 'ฝ่ายบัญชี & ผู้บริหาร',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    title: 'สรุปภาษี & ประกันสังคม',
    subtitle: 'ภ.ง.ด. 1, 3, 53, ภาษีมูลค่าเพิ่ม (ภ.พ.30) และเงินสมทบ สปส.'
  },
  todoist: {
    department: 'accounting_executive',
    departmentName: 'ฝ่ายบัญชี & ผู้บริหาร',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    title: 'ปฏิทินกำหนดจ่าย & ภาระผูกพัน',
    subtitle: 'กำหนดการยื่นภาษี, ส่งมอบงานงวด, ชำระหนี้คู่ค้า และรายการภาระงาน'
  },
  document_templates: {
    department: 'accounting_executive',
    departmentName: 'แบบฟอร์มเอกสาร',
    badgeColor: 'bg-blue-50 text-[#005aa9] border-blue-200',
    title: 'ตัวอย่างเอกสารมาตรฐาน (Standard Document Templates)',
    subtitle: 'ศูนย์รวมแบบฟอร์มเอกสาร 14 ฉบับมาตรฐานงานก่อสร้าง จัดซื้อ บัญชี และการเงิน พร้อมสั่งพิมพ์ A4'
  },
  user_management: {
    department: 'accounting_executive',
    departmentName: 'ฝ่ายบริหาร & สิทธิ์',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    title: 'การจัดการผู้ใช้งาน & กำหนดสิทธิ์ (User Management & RBAC)',
    subtitle: 'บริหารจัดการผู้ใช้งานในระบบ, กำหนดบทบาท Admin / Manager / User และควบคุมสิทธิ์การเข้าถึงเมนู'
  }
};

export function Header({
  currentTab,
  onOpenMobileMenu,
  onOpenAI,
  onExportCSV,
  onImportCSVClick,
  searchQuery,
  onSearchChange,
  isSupabaseConnected = false,
  onOpenSupabaseStatus,
  userRole = 'executive',
  currentUser,
  onLogout,
  onOpenUserProfile,
}: HeaderProps) {
  const { activeUserName } = useActiveUser();
  const currentMeta = TAB_METADATA[currentTab] || {
    department: 'accounting_executive',
    departmentName: 'ฝ่ายบัญชี & ผู้บริหาร',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    title: 'ระบบบริหารงานก่อสร้าง & บัญชี',
    subtitle: 'บจก. บุรีรัมย์ธงชัยก่อสร้าง'
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs h-14 flex items-center shrink-0">
      <div className="w-full px-3 sm:px-4 lg:px-5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Mobile Menu Toggle & Department / Page Heading */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0"
              aria-label="เปิดเมนู"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {currentMeta.title}
                </h1>
                
                {/* Visual Department Badge */}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 hidden sm:inline-flex items-center gap-1 border ${currentMeta.badgeColor}`}>
                  {currentMeta.departmentName}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden md:block">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Search, AI & Clearly Separated Action Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Search Input */}
            <div className="relative hidden sm:block w-36 md:w-44 lg:w-52">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ค้นหา..."
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005aa9] focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Tools & Utilities Group */}
            <div className="flex items-center gap-1">
              {/* Supabase Status Icon Button */}
              {onOpenSupabaseStatus && (
                <button
                  type="button"
                  onClick={onOpenSupabaseStatus}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isSupabaseConnected 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                      : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  }`}
                  title={isSupabaseConnected ? 'สถานะ Supabase: เชื่อมต่อสำเร็จ' : 'เชื่อมต่อฐานข้อมูล Supabase'}
                >
                  <Database className="w-4 h-4" />
                </button>
              )}

              {/* AI Assistant Icon Button */}
              <button
                type="button"
                onClick={onOpenAI}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  currentTab === 'ai_analysis'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-amber-600 border-slate-200'
                }`}
                title="AI ผู้ช่วยวิเคราะห์งบการเงิน"
              >
                <Sparkles className={`w-4 h-4 ${currentTab === 'ai_analysis' ? 'text-white' : 'text-amber-600'}`} />
              </button>

              {/* Quick Export/Import */}
              <button
                type="button"
                onClick={onImportCSVClick}
                className="hidden md:inline-flex p-1.5 rounded-lg text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                title="นำเข้าไฟล์ CSV"
              >
                <Upload className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onExportCSV}
                className="hidden md:inline-flex p-1.5 rounded-lg text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                title="ส่งออก CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Active User Identity Pill with Role Badge */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenUserProfile}
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition-all cursor-pointer shrink-0 shadow-2xs"
                title="คลิกเพื่อดูหรือเปลี่ยนโปรไฟล์ผู้ใช้งาน"
              >
                <div className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center text-white shrink-0 ${
                  currentUser?.role === 'admin'
                    ? 'bg-purple-700'
                    : currentUser?.role === 'manager'
                      ? 'bg-[#005aa9]'
                      : 'bg-emerald-600'
                }`}>
                  {(currentUser?.name || activeUserName).charAt(0)}
                </div>
                <span className="max-w-[120px] truncate hidden sm:inline">
                  {currentUser?.name || activeUserName}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                  currentUser?.role === 'admin'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : currentUser?.role === 'manager'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {currentUser?.role || (userRole === 'executive' ? 'manager' : 'user')}
                </span>
              </button>

              {/* Logout Button */}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors cursor-pointer shrink-0"
                  title="ออกจากระบบ (Sign Out)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>



          </div>
        </div>
      </div>
    </header>
  );
}
