import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  HardDrive, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  Sparkles, 
  LogIn, 
  LogOut, 
  Layers, 
  ShieldCheck,
  FolderOpen,
  PlusCircle,
  X,
  Key,
  Settings
} from 'lucide-react';
import { 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken, 
  getCurrentGoogleUser,
  setManualAccessToken,
  auth 
} from '../services/googleAuthService';
import { 
  getOrCreateMasterSpreadsheet, 
  fetchMasterDataSheet, 
  appendMasterDataItem, 
  seedInitialMasterDataIfEmpty,
  MASTER_SCHEMAS,
  getSavedMasterSpreadsheetId
} from '../services/googleSheetsService';
import { getOrCreateDriveFolder } from '../services/googleDriveService';

interface GoogleMasterSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  sampleVendors: string[];
  sampleProjects: string[];
  sampleExpenseTypes: string[];
  onMasterDataLoaded?: (data: {
    vendors: Array<{ code: string; name: string }>;
    projects: Array<{ code: string; name: string }>;
    expenseTypes: Array<{ costCode: string; name: string }>;
  }) => void;
}

export function GoogleMasterSyncModal({
  isOpen,
  onClose,
  sampleVendors,
  sampleProjects,
  sampleExpenseTypes,
  onMasterDataLoaded
}: GoogleMasterSyncModalProps) {
  const [user, setUser] = useState<any>(getCurrentGoogleUser());
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>('');
  const [driveFolderId, setDriveFolderId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'projects' | 'expenses'>('overview');
  
  // Advanced Auth (Manual Access Token & Custom Client ID)
  const [showAdvancedAuth, setShowAdvancedAuth] = useState(false);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [customClientIdInput, setCustomClientIdInput] = useState(localStorage.getItem('btc_google_client_id') || '');

  // Sheet Preview data
  const [vendorsData, setVendorsData] = useState<any[]>([]);
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [expensesData, setExpensesData] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      checkAuthState();
    }
  }, [isOpen]);

  const checkAuthState = async () => {
    const currentToken = await getAccessToken();
    setToken(currentToken);
    setUser(getCurrentGoogleUser());

    const savedId = getSavedMasterSpreadsheetId();
    if (savedId) {
      setSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${savedId}/edit`);
    }

    if (currentToken && savedId) {
      loadSheetPreviews(savedId);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setStatusMessage('กำลังเปิดหน้าต่างยืนยันตัวตน Google Workspace...');
      const authResult = await googleSignIn();
      if (authResult) {
        setUser(authResult.user);
        setToken(authResult.accessToken);
        setStatusMessage('ยืนยันตัวตนสำเร็จ! กำลังเตรียมชีต Master Data...');
        
        // Auto-provision or verify sheets & drive
        await handleSetupAndSync();
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`เข้าสู่ระบบไม่สำเร็จ: ${err.message || err}`);
      setShowAdvancedAuth(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWithToken = async () => {
    if (!manualTokenInput.trim()) {
      setStatusMessage('โปรดวาง Access Token ก่อนกดเชื่อมต่อ');
      return;
    }
    try {
      setIsLoading(true);
      setStatusMessage('กำลังตรวจสอบ Access Token...');
      const authResult = await setManualAccessToken(manualTokenInput.trim());
      setUser(authResult.user);
      setToken(authResult.accessToken);
      setStatusMessage('เชื่อมต่อด้วย Access Token สำเร็จ! กำลังเตรียมชีต Master Data...');
      await handleSetupAndSync();
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`เชื่อมต่อด้วย Token ไม่สำเร็จ: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClientId = () => {
    if (customClientIdInput.trim()) {
      localStorage.setItem('btc_google_client_id', customClientIdInput.trim());
      setStatusMessage('บันทึก Google OAuth Client ID แล้ว สามารถกดเข้าสู่ระบบด้วย Google อีกครั้ง');
    } else {
      localStorage.removeItem('btc_google_client_id');
      setStatusMessage('รีเซ็ต Google OAuth Client ID กลับเป็นค่าเริ่มต้น');
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setStatusMessage('ออกจากระบบ Google แล้ว');
  };

  const handleSetupAndSync = async () => {
    try {
      setIsLoading(true);
      setStatusMessage('กำลังตรวจสอบและอัปเดตโครงสร้างชีต (Self-Healing & Auto-Migrate)...');

      // 1. Get or create Master Spreadsheet with all schemas
      const result = await getOrCreateMasterSpreadsheet();
      setSpreadsheetUrl(result.spreadsheetUrl);

      // 2. Ensure Google Drive Root Storage exists
      setStatusMessage('กำลังสร้าง/ตรวจสอบโฟลเดอร์ใน Google Drive: BTC_Enterprise_Storage...');
      const folderId = await getOrCreateDriveFolder('BTC_Enterprise_Storage');
      setDriveFolderId(folderId);

      // 3. Seed initial data if empty
      setStatusMessage('กำลังซิงค์รายการตั้งต้นเข้าสู่ Google Sheets...');
      await seedInitialMasterDataIfEmpty(
        result.spreadsheetId,
        sampleVendors,
        sampleProjects,
        sampleExpenseTypes
      );

      // 4. Fetch previews
      await loadSheetPreviews(result.spreadsheetId);

      setStatusMessage('โครงสร้างระบบพร้อมทำงาน 100%! เชื่อมต่อทั้ง Supabase, Sheets และ Drive สมบูรณ์');
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`การตั้งค่าขัดข้อง: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSheetPreviews = async (spreadsheetId: string) => {
    try {
      const [v, p, e] = await Promise.all([
        fetchMasterDataSheet(spreadsheetId, MASTER_SCHEMAS.Vendors.sheetTitle),
        fetchMasterDataSheet(spreadsheetId, MASTER_SCHEMAS.Projects.sheetTitle),
        fetchMasterDataSheet(spreadsheetId, MASTER_SCHEMAS.ExpenseTypes.sheetTitle)
      ]);

      setVendorsData(v);
      setProjectsData(p);
      setExpensesData(e);

      // Cache to localStorage for autocomplete across forms
      try {
        localStorage.setItem('btc_google_master_cache', JSON.stringify({
          contractors: v.map((item: any) => item.Name).filter(Boolean),
          projects: p.map((item: any) => item.Name).filter(Boolean),
          expenseCategories: e.map((item: any) => item.ExpenseType).filter(Boolean)
        }));
      } catch (cacheErr) {
        console.warn('Failed to save btc_google_master_cache', cacheErr);
      }

      if (onMasterDataLoaded) {
        onMasterDataLoaded({
          vendors: v.map((item: any) => ({ code: item.Code || '', name: item.Name || '' })),
          projects: p.map((item: any) => ({ code: item.Code || '', name: item.Name || '' })),
          expenseTypes: e.map((item: any) => ({ costCode: item.CostCode || '', name: item.ExpenseType || '' }))
        });
      }
    } catch (err) {
      console.error('Failed to load sheet previews:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                ระบบจัดการ Master Data (Google Sheets) & Storage (Drive)
              </h2>
              <p className="text-xs text-slate-500">
                สถาปัตยกรรมผสม: Supabase (ข้อมูลหลัก) + Google Sheets (ตัวเลือก/ผู้บริหารแก้ได้) + Drive (ไฟล์แนบ)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Google Account Status Banner */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {user ? (
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-300">
                  {user.email ? user.email.slice(0, 2).toUpperCase() : 'G'}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">
                  ?
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {user ? `เชื่อมต่อบัญชี: ${user.email}` : 'ยังไม่ได้เชื่อมต่อบัญชี Google Workspace'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {user 
                    ? 'ได้รับสิทธิ์เข้าถึง Google Sheets & Google Drive (File Scope) เรียบร้อย'
                    : 'คลิกเข้าสู่ระบบด้วย Google เพื่อเปิดการทำงานชีต Master Data และอัปโหลดไฟล์ลง Drive อัตโนมัติ'}
                </div>
              </div>
            </div>

            <div>
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSetupAndSync}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>ซิงค์ & ปรับโครงสร้างชีต</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-[#005aa9] hover:bg-[#004785] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบด้วย Google</span>
                </button>
              )}
            </div>
          </div>

          {/* Advanced Auth / Manual Token Setting */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden text-xs">
            <button
              onClick={() => setShowAdvancedAuth(!showAdvancedAuth)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-slate-700 hover:bg-slate-50 transition-colors font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                <span>ตัวเลือกการเชื่อมต่อสำรอง (Direct Access Token / OAuth Client ID)</span>
              </div>
              <span className="text-[11px] text-[#005aa9]">
                {showAdvancedAuth ? 'ซ่อนการตั้งค่า' : 'แสดงการตั้งค่า'}
              </span>
            </button>

            {showAdvancedAuth && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    เชื่อมต่อด้วย Access Token โดยตรง (OAuth 2.0 Access Token):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={manualTokenInput}
                      onChange={(e) => setManualTokenInput(e.target.value)}
                      placeholder="วาง Access Token (เช่น ya29.a0...)"
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                    <button
                      onClick={handleConnectWithToken}
                      disabled={isLoading || !manualTokenInput.trim()}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer"
                    >
                      เชื่อมต่อด้วย Token
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    * ใช้ในกรณีที่หน้าต่าง Google Sign-in ติดบล็อกสิทธิ์ Sandbox หรือต้องการเชื่อมต่อด้วย Token จาก Google OAuth Playground
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Google OAuth Client ID (กำหนดเองหากต้องการ):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customClientIdInput}
                      onChange={(e) => setCustomClientIdInput(e.target.value)}
                      placeholder="เช่น xxxxx.apps.googleusercontent.com"
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                    <button
                      onClick={handleSaveClientId}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs shrink-0 cursor-pointer"
                    >
                      บันทึก Client ID
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.includes('ล้มเหลว') || statusMessage.includes('ไม่สำเร็จ') || statusMessage.includes('ขัดข้อง')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-[#005aa9] border border-blue-200'
            }`}>
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Architecture Concept Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>1. Supabase Core</span>
              </div>
              <p className="text-[11px] text-slate-500">
                เก็บข้อมูลหลัก (Transactions, Disbursements, BOQ) มีความเสถียรและความปลอดภัยสูง
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>2. Google Sheets Master</span>
              </div>
              <p className="text-[11px] text-slate-500">
                เก็บตัวเลือก (ร้านค้า, โครงการ, ค่าใช้จ่าย) ให้ฝ่ายจัดการแก้ไขได้ง่าย พร้อมระบบ Auto-Migrate คอลัมน์ให้อัตโนมัติ
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <HardDrive className="w-4 h-4 text-[#005aa9]" />
                <span>3. Google Drive Storage</span>
              </div>
              <p className="text-[11px] text-slate-500">
                เก็บไฟล์แนบ/สลิป ตั้งชื่อตามเลขที่เอกสาร และมีระบบ Garbage Collector กำจัดไฟล์ขยะเมื่อมีการลบ
              </p>
            </div>
          </div>

          {/* Direct Links to Google Assets */}
          {spreadsheetUrl && (
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-emerald-950">ชีต Master Data กลางของระบบ:</div>
                  <div className="text-[11px] text-emerald-800 truncate max-w-md">
                    BTC_Enterprise_Master_Data (ฐานข้อมูลหลักองค์กร)
                  </div>
                </div>
              </div>
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>เปิดใน Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Tabs for Sheet Previews */}
          {user && spreadsheetUrl && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="flex items-center border-b border-slate-200 bg-slate-50 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('vendors')}
                  className={`px-4 py-2.5 transition-colors cursor-pointer ${
                    activeTab === 'vendors' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  คู่ค้า / ผู้รับเหมา ({vendorsData.length})
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`px-4 py-2.5 transition-colors cursor-pointer ${
                    activeTab === 'projects' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  โครงการ ({projectsData.length})
                </button>
                <button
                  onClick={() => setActiveTab('expenses')}
                  className={`px-4 py-2.5 transition-colors cursor-pointer ${
                    activeTab === 'expenses' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  หมวดหมู่ค่าใช้จ่าย ({expensesData.length})
                </button>
              </div>

              <div className="p-3 max-h-60 overflow-y-auto text-xs">
                {activeTab === 'vendors' && (
                  <div className="space-y-1">
                    {vendorsData.length === 0 ? (
                      <p className="text-slate-400 py-4 text-center">ยังไม่มีข้อมูลในชีต หรือกำลังโหลด...</p>
                    ) : (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] text-slate-400 uppercase border-b border-slate-100">
                            <th className="pb-1">Code</th>
                            <th className="pb-1">ชื่อผู้รับเหมา / ร้านค้า</th>
                            <th className="pb-1">หมวดหมู่</th>
                            <th className="pb-1">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {vendorsData.slice(0, 15).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-1.5 font-mono text-slate-500">{row.Code || '-'}</td>
                              <td className="py-1.5 font-bold text-slate-800">{row.Name || row.VendorName || '-'}</td>
                              <td className="py-1.5 text-slate-600">{row.Category || '-'}</td>
                              <td className="py-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                                  {row.Status || 'Active'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="space-y-1">
                    {projectsData.length === 0 ? (
                      <p className="text-slate-400 py-4 text-center">ยังไม่มีข้อมูลในชีต หรือกำลังโหลด...</p>
                    ) : (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] text-slate-400 uppercase border-b border-slate-100">
                            <th className="pb-1">Code</th>
                            <th className="pb-1">ชื่อโครงการ</th>
                            <th className="pb-1">บริษัท</th>
                            <th className="pb-1">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {projectsData.slice(0, 15).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-1.5 font-mono text-slate-500">{row.Code || '-'}</td>
                              <td className="py-1.5 font-bold text-slate-800">{row.Name || row.ProjectName || '-'}</td>
                              <td className="py-1.5 text-slate-600">{row.Company || 'BTC'}</td>
                              <td className="py-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#005aa9] font-bold text-[10px]">
                                  {row.Status || 'Active'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === 'expenses' && (
                  <div className="space-y-1">
                    {expensesData.length === 0 ? (
                      <p className="text-slate-400 py-4 text-center">ยังไม่มีข้อมูลในชีต หรือกำลังโหลด...</p>
                    ) : (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] text-slate-400 uppercase border-b border-slate-100">
                            <th className="pb-1">Cost Code</th>
                            <th className="pb-1">หมวดหมู่รายจ่าย</th>
                            <th className="pb-1">VAT</th>
                            <th className="pb-1">WHT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {expensesData.slice(0, 15).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-1.5 font-mono text-slate-500">{row.CostCode || '-'}</td>
                              <td className="py-1.5 font-bold text-slate-800">{row.ExpenseType || '-'}</td>
                              <td className="py-1.5 text-slate-600">{row.DefaultVatRate || '7%'}</td>
                              <td className="py-1.5 text-slate-600">{row.DefaultWhtRate || '0%'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            ระบบอัปเดตอัตโนมัติ ไม่กระทบข้อมูลเดิมที่มีอยู่
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
