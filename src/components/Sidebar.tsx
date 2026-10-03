import { useState } from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  FolderKanban, 
  WalletCards, 
  FileSpreadsheet, 
  CheckSquare, 
  Download, 
  Upload, 
  Sparkles, 
  FileCheck2, 
  X, 
  TrendingUp, 
  CreditCard,
  Database,
  Briefcase,
  BarChart3,
  HardHat,
  Lock,
  ShieldCheck,
  Layers,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  FileText,
  Users
} from 'lucide-react';
import { ViewTab, UserRole, AppUser } from '../types';
import { BTCLogo } from './BTCLogo';
import { hasTabPermission } from '../services/userService';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenAI: () => void;
  onExportCSV: () => void;
  onImportCSVClick: () => void;
  onOpenSupabaseSettings?: () => void;
  isSupabaseConnected?: boolean;
  onOpenGoogleMasterSync?: () => void;
  isGoogleConnected?: boolean;
  userRole?: UserRole;
  currentUser?: AppUser | null;
  totalTransactionsCount: number;
  pendingTasksCount: number;
  disbursementsCount?: number;
  pendingDisbursementsCount?: number;
  netBalance: number;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onOpenAI,
  onExportCSV,
  onImportCSVClick,
  onOpenSupabaseSettings,
  isSupabaseConnected = false,
  onOpenGoogleMasterSync,
  isGoogleConnected = false,
  userRole = 'executive',
  currentUser,
  totalTransactionsCount,
  pendingTasksCount,
  disbursementsCount = 0,
  pendingDisbursementsCount = 0,
  netBalance
}: SidebarProps) {
  const isAllowed = (tab: ViewTab) => {
    if (!currentUser) return true;
    return hasTabPermission(currentUser, tab);
  };
  // Collapsible state for the 4 core departments (false = expanded, true = collapsed)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    project: false,
    procurement: false,
    finance: false,
    accounting_executive: false
  });

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const allCollapsed = Object.values(collapsedSections).every(Boolean);
  const toggleAllSections = () => {
    const nextState = !allCollapsed;
    setCollapsedSections({
      project: nextState,
      procurement: nextState,
      finance: nextState,
      accounting_executive: nextState
    });
  };

  const handleSelect = (tab: ViewTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const formattedBalance = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0
  }).format(netBalance);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-white text-slate-800 flex flex-col border-r border-slate-200 shadow-xl lg:shadow-none transition-transform duration-200 ease-in-out shrink-0
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-14 px-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <BTCLogo size="sm" showText={false} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 tracking-tight truncate">
                  BTC ก่อสร้าง & บัญชี
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-[#009540] shrink-0">
                  ERP
                </span>
              </div>
              <span className="text-[10px] text-slate-500 truncate block">
                บจก. บุรีรัมย์ธงชัยก่อสร้าง
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-2.5 px-2 space-y-2.5">
          {/* Quick Toggle: Expand/Collapse All */}
          <div className="flex items-center justify-between px-2 pt-0.5 text-[10px] text-slate-400">
            <span className="font-semibold uppercase tracking-wider">กลุ่มงานหลัก (4 ฝ่าย)</span>
            <button
              type="button"
              onClick={toggleAllSections}
              className="hover:text-slate-700 underline cursor-pointer transition-colors"
            >
              {allCollapsed ? 'ขยายทั้งหมด' : 'ย่อทั้งหมด'}
            </button>
          </div>

          {/* ZONE 1: ฝ่ายโครงการ (Project Operations) */}
          {([ 'boq', 'subcontracts', 'projects' ] as ViewTab[]).some(isAllowed) && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSection('project')}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5">
                  <FolderKanban className="w-3.5 h-3.5 text-[#005aa9] shrink-0" />
                  <span>ฝ่ายโครงการ</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-600">
                  <span className="text-[10px] font-medium">
                    {([ 'boq', 'subcontracts', 'projects' ] as ViewTab[]).filter(isAllowed).length}
                  </span>
                  {collapsedSections.project ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {!collapsedSections.project && (
                <div className="space-y-0.5 pl-1.5">
                  {/* 1. BOQ Management */}
                  {isAllowed('boq') && (
                    <button
                      onClick={() => handleSelect('boq')}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentTab === 'boq'
                          ? 'bg-[#005aa9] text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Layers className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'boq' ? 'text-white' : 'text-[#005aa9]'}`} />
                        <span className="truncate">BOQ โครงการ 3 ชั้น</span>
                      </div>
                    </button>
                  )}

                  {/* 2. Subcontractors & Inspections */}
                  {isAllowed('subcontracts') && (
                    <button
                      onClick={() => handleSelect('subcontracts')}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentTab === 'subcontracts'
                          ? 'bg-[#005aa9] text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <HardHat className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'subcontracts' ? 'text-white' : 'text-[#005aa9]'}`} />
                        <span className="truncate">บริหารผู้รับเหมาช่วง</span>
                      </div>
                    </button>
                  )}

                  {/* 3. Project Budget & Profit */}
                  {isAllowed('projects') && (
                    <button
                      onClick={() => handleSelect('projects')}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentTab === 'projects'
                          ? 'bg-[#005aa9] text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FolderKanban className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'projects' ? 'text-white' : 'text-[#005aa9]'}`} />
                        <span className="truncate">ต้นทุน & กำไรโครงการ</span>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ZONE 2: ฝ่ายจัดซื้อ (Procurement & Purchasing) */}
          {([ 'procurement', 'supplier_billing' ] as ViewTab[]).some(isAllowed) && (
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => toggleSection('procurement')}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>ฝ่ายจัดซื้อ</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-600">
                  <span className="text-[10px] font-medium">
                    {([ 'procurement', 'supplier_billing' ] as ViewTab[]).filter(isAllowed).length}
                  </span>
                  {collapsedSections.procurement ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {!collapsedSections.procurement && (
                <div className="space-y-0.5 pl-1.5">
                  {/* 1. Procurement & Material Backcharge */}
                  {isAllowed('procurement') && (
                    <button
                      onClick={() => handleSelect('procurement')}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentTab === 'procurement'
                          ? 'bg-[#005aa9] text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <ShoppingBag className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'procurement' ? 'text-white' : 'text-indigo-600'}`} />
                        <span className="truncate">ตรวจรับพัสดุ & ตัดหักช่าง</span>
                      </div>
                    </button>
                  )}

                  {/* 2. Supplier Billing Desk */}
                  {isAllowed('supplier_billing') && (
                    <button
                      onClick={() => handleSelect('supplier_billing')}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentTab === 'supplier_billing'
                          ? 'bg-[#005aa9] text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <ReceiptText className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'supplier_billing' ? 'text-white' : 'text-indigo-600'}`} />
                        <span className="truncate">รับวางบิลร้านค้า</span>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ZONE 3: ฝ่ายการเงิน (Finance & Treasury) */}
          {([ 'disbursements', 'payment', 'accounts' ] as ViewTab[]).some(isAllowed) && (
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => toggleSection('finance')}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5">
                  <WalletCards className="w-3.5 h-3.5 text-[#009540] shrink-0" />
                  <span>ฝ่ายการเงิน</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-600">
                  <span className="text-[10px] font-medium">
                    {([ 'disbursements', 'payment', 'accounts' ] as ViewTab[]).filter(isAllowed).length}
                  </span>
                  {collapsedSections.finance ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {!collapsedSections.finance && (
                <div className="space-y-0.5 pl-1.5">
                  {/* 1. DBM List */}
                  {isAllowed('disbursements') && (
                    <button
                      onClick={() => handleSelect('disbursements')}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentTab === 'disbursements'
                          ? 'bg-[#005aa9] text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileSpreadsheet className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'disbursements' ? 'text-white' : 'text-[#009540]'}`} />
                        <span className="truncate">ใบขอตั้งเบิก (DBM)</span>
                      </div>
                      {disbursementsCount > 0 && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium shrink-0 ${
                          currentTab === 'disbursements' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {disbursementsCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* 2. Payment & PV */}
                  {isAllowed('payment') && (
                    <button
                      onClick={() => handleSelect('payment')}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentTab === 'payment'
                          ? 'bg-[#005aa9] text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CreditCard className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'payment' ? 'text-white' : 'text-[#009540]'}`} />
                        <span className="truncate">บันทึกจ่ายเงิน & PV</span>
                      </div>
                      {pendingDisbursementsCount > 0 && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                          currentTab === 'payment' 
                            ? 'bg-amber-400 text-slate-900' 
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {pendingDisbursementsCount} รอจ่าย
                        </span>
                      )}
                    </button>
                  )}

                  {/* 3. Bank Accounts & Intercompany Loans */}
                  {isAllowed('accounts') && (
                    <button
                      onClick={() => handleSelect('accounts')}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentTab === 'accounts'
                          ? 'bg-[#005aa9] text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <WalletCards className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'accounts' ? 'text-white' : 'text-[#009540]'}`} />
                        <span className="truncate">บัญชีธนาคาร & เงินยืม</span>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ZONE 4: ฝ่ายบัญชี & ผู้บริหาร (Accounting & Executive) */}
          {([ 'dashboard', 'reports', 'ai_analysis', 'transactions', 'tax_summary', 'todoist', 'document_templates', 'user_management' ] as ViewTab[]).some(isAllowed) && (
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => toggleSection('accounting_executive')}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>ฝ่ายบัญชี & ผู้บริหาร</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-600">
                  <span className="text-[10px] font-medium">
                    {([ 'dashboard', 'reports', 'ai_analysis', 'transactions', 'tax_summary', 'todoist', 'document_templates', 'user_management' ] as ViewTab[]).filter(isAllowed).length}
                  </span>
                  {collapsedSections.accounting_executive ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {!collapsedSections.accounting_executive && (
                <div className="space-y-0.5 pl-1.5">
                  {/* 1. Executive Dashboard */}
                  {isAllowed('dashboard') && (
                    <button
                      onClick={() => handleSelect('dashboard')}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentTab === 'dashboard'
                          ? 'bg-[#005aa9] text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <LayoutDashboard className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'dashboard' ? 'text-white' : 'text-amber-600'}`} />
                        <span className="truncate">แดชบอร์ดภาพรวมผู้บริหาร</span>
                      </div>
                    </button>
                  )}

                  {/* 2. Financial Reports & P&L */}
                  {isAllowed('reports') && (
                    <button
                      onClick={() => handleSelect('reports')}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentTab === 'reports'
                          ? 'bg-[#005aa9] text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <BarChart3 className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'reports' ? 'text-white' : 'text-amber-600'}`} />
                        <span className="truncate">รายงานการเงิน & P&L</span>
                      </div>
                    </button>
                  )}

                  {/* 3. AI Financial Advisor */}
                  {isAllowed('ai_analysis') && (
                    <button
                      onClick={() => handleSelect('ai_analysis')}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentTab === 'ai_analysis'
                          ? 'bg-[#005aa9] text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Sparkles className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'ai_analysis' ? 'text-white' : 'text-amber-600'}`} />
                        <span className="truncate">AI วิเคราะห์งบการเงิน</span>
                      </div>
                    </button>
                  )}

                  {/* 4. Transactions GL */}
                  {isAllowed('transactions') && (
                    <button
                      onClick={() => handleSelect('transactions')}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentTab === 'transactions'
                          ? 'bg-[#005aa9] text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <ReceiptText className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'transactions' ? 'text-white' : 'text-slate-600'}`} />
                        <span className="truncate">สมุดรายรับ-รายจ่าย (GL)</span>
                      </div>
                      {totalTransactionsCount > 0 && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium shrink-0 ${
                          currentTab === 'transactions' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {totalTransactionsCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* 5. Tax & Social Security */}
                  {isAllowed('tax_summary') && (
                    <button
                      onClick={() => handleSelect('tax_summary')}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentTab === 'tax_summary'
                          ? 'bg-[#005aa9] text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck2 className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'tax_summary' ? 'text-white' : 'text-slate-600'}`} />
                        <span className="truncate">สรุปภาษี & ประกันสังคม</span>
                      </div>
                    </button>
                  )}

                  {/* 6. Planning & Due Dates */}
                  {isAllowed('todoist') && (
                    <button
                      onClick={() => handleSelect('todoist')}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentTab === 'todoist'
                          ? 'bg-[#005aa9] text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckSquare className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'todoist' ? 'text-white' : 'text-slate-600'}`} />
                        <span className="truncate">กำหนดจ่าย & ภาระผูกพัน</span>
                      </div>
                      {pendingTasksCount > 0 && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                          currentTab === 'todoist' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {pendingTasksCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* 7. Standard Document Templates */}
                  {isAllowed('document_templates') && (
                    <button
                      onClick={() => handleSelect('document_templates')}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentTab === 'document_templates'
                          ? 'bg-[#005aa9] text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'document_templates' ? 'text-white' : 'text-[#005aa9]'}`} />
                        <span className="truncate">แบบฟอร์มเอกสารมาตรฐาน</span>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold shrink-0 ${
                        currentTab === 'document_templates' ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#005aa9]'
                      }`}>
                        14 แบบ
                      </span>
                    </button>
                  )}

                  {/* 8. User Management & Permissions (Admin Only) */}
                  {isAllowed('user_management') && (
                    <button
                      onClick={() => handleSelect('user_management')}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentTab === 'user_management'
                          ? 'bg-[#005aa9] text-white font-semibold shadow-xs'
                          : 'text-purple-900 bg-purple-50/70 hover:bg-purple-100 hover:text-purple-950 border border-purple-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Users className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'user_management' ? 'text-white' : 'text-purple-700'}`} />
                        <span className="truncate font-bold">จัดการผู้ใช้งาน & สิทธิ์</span>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold shrink-0 ${
                        currentTab === 'user_management' ? 'bg-white/20 text-white' : 'bg-purple-200 text-purple-900'
                      }`}>
                        Admin
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* เครื่องมือ & จัดการข้อมูล (Compact & Clean) */}
          <div className="pt-2 border-t border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>เครื่องมือ & จัดการข้อมูล</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 px-0.5 pt-0.5">
              <button
                onClick={() => {
                  onImportCSVClick();
                  onCloseMobile();
                }}
                className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                title="นำเข้าไฟล์ CSV"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>นำเข้า CSV</span>
              </button>

              <button
                onClick={() => {
                  onExportCSV();
                  onCloseMobile();
                }}
                className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                title="ส่งออก CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>ส่งออก CSV</span>
              </button>
            </div>

            {onOpenSupabaseSettings && (
              <div className="px-0.5 pt-0.5">
                <button
                  onClick={() => {
                    onOpenSupabaseSettings();
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                    isSupabaseConnected 
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100' 
                      : 'bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Database className={`w-3.5 h-3.5 ${isSupabaseConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <span>ฐานข้อมูล Supabase</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                </button>
              </div>
            )}

            {onOpenGoogleMasterSync && (
              <div className="px-0.5 pt-0.5">
                <button
                  onClick={() => {
                    onOpenGoogleMasterSync();
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                    isGoogleConnected 
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100' 
                      : 'bg-blue-50/70 border-blue-200 text-[#005aa9] hover:bg-blue-100'
                  }`}
                  title="จัดการ Master Data ใน Google Sheets & ไฟล์ใน Google Drive"
                >
                  <div className="flex items-center gap-1.5">
                    <FileSpreadsheet className={`w-3.5 h-3.5 ${isGoogleConnected ? 'text-emerald-600' : 'text-[#005aa9]'}`} />
                    <span>Google Sheets & Drive</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${isGoogleConnected ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer: ยอดคงเหลือสุทธิ (GL) */}
        <div className="p-2.5 border-t border-slate-200 bg-slate-50/80 shrink-0">
          <div className="px-2.5 py-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 font-medium block truncate">
                ยอดคงเหลือสุทธิ (GL)
              </span>
              <p className="text-xs font-bold text-slate-900 font-mono truncate">
                {userRole === 'user' || userRole === 'staff' ? '฿ ••••••••' : formattedBalance}
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#009540] shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
}
