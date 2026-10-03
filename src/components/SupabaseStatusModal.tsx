import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  RefreshCw, 
  ShieldCheck, 
  KeyRound, 
  Server, 
  Sliders, 
  Layers, 
  ArrowRight,
  Sparkles,
  Lock,
  Trash2
} from 'lucide-react';
import { 
  getActiveSupabaseConfig, 
  saveCustomSupabaseConfig, 
  clearCustomSupabaseConfig, 
  isSupabaseConfigured 
} from '../lib/supabase';
import { 
  checkSupabaseHealth, 
  tryAutoMigrateSchema, 
  SAFE_MIGRATION_SQL, 
  SupabaseHealthResult 
} from '../services/supabaseService';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  txCount: number;
  dbmCount: number;
  taskCount: number;
  onRefreshData?: () => void;
  isLoading?: boolean;
}

export function SupabaseStatusModal({
  isOpen,
  onClose,
  txCount,
  dbmCount,
  taskCount,
  onRefreshData,
  isLoading = false
}: SupabaseStatusModalProps) {
  const [activeTab, setActiveTab] = useState<'credentials' | 'schema' | 'diagnostic'>('credentials');
  
  // Custom credential state
  const [urlInput, setUrlInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [configSource, setConfigSource] = useState<'custom' | 'env' | 'none'>('none');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  
  // Diagnostic state
  const [isTesting, setIsTesting] = useState(false);
  const [healthResult, setHealthResult] = useState<SupabaseHealthResult | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Initialize input fields from current active config
  useEffect(() => {
    if (isOpen) {
      const cfg = getActiveSupabaseConfig();
      setUrlInput(cfg.url);
      setKeyInput(cfg.anonKey);
      setConfigSource(cfg.source);
      runHealthCheck();
    }
  }, [isOpen]);

  const runHealthCheck = async () => {
    setIsTesting(true);
    try {
      const res = await checkSupabaseHealth();
      setHealthResult(res);
    } catch (e: any) {
      console.error('Health check failed', e);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !keyInput.trim()) {
      alert('กรุณาระบุทั้ง Supabase Project URL และ Anon Key');
      return;
    }

    if (!urlInput.trim().startsWith('http')) {
      alert('Supabase URL ต้องขึ้นต้นด้วย https:// หรือ http://');
      return;
    }

    const success = saveCustomSupabaseConfig(urlInput, keyInput);
    if (success) {
      const updated = getActiveSupabaseConfig();
      setConfigSource(updated.source);
      setSaveSuccessMessage('บันทึกการเชื่อมต่อ Supabase สำเร็จ! กำลังโหลดข้อมูลสด...');
      runHealthCheck();
      if (onRefreshData) {
        onRefreshData();
      }
      setTimeout(() => {
        setSaveSuccessMessage(null);
      }, 3500);
    }
  };

  const handleClearCredentials = () => {
    if (confirm('คุณต้องการล้างการตั้งค่า Supabase ที่กรอกไว้ใช่หรือไม่?')) {
      clearCustomSupabaseConfig();
      const updated = getActiveSupabaseConfig();
      setUrlInput(updated.url);
      setKeyInput(updated.anonKey);
      setConfigSource(updated.source);
      setSaveSuccessMessage('ล้างข้อมูลเรียบร้อยแล้ว');
      runHealthCheck();
      if (onRefreshData) onRefreshData();
      setTimeout(() => setSaveSuccessMessage(null), 2500);
    }
  };

  const handleRunAutoMigration = async () => {
    setIsMigrating(true);
    setMigrationMessage(null);
    try {
      const res = await tryAutoMigrateSchema();
      if (res.success) {
        setMigrationMessage('✓ อัปเกรดโครงสร้างตารางสำเร็จแล้ว! ข้อมูลเดิมทั้งหมดยังอยู่ครบถ้วน');
        runHealthCheck();
      } else {
        setMigrationMessage('แจ้งเตือน: ' + res.message + ' (หากเพิ่งเริ่มใช้โปรเจกต์ใหม่ กรุณารัน SQL ในแท็บ "คำสั่ง SQL อัตโนมัติ" ก่อนครั้งแรก)');
      }
    } catch (err: any) {
      setMigrationMessage('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SAFE_MIGRATION_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 rounded-xl shadow-inner">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                ตั้งค่าฐานข้อมูล Supabase & ระบบ Auto-Migration
              </h3>
              <p className="text-xs text-emerald-200/80">
                100% Real Database — ข้อมูลเดิมไม่หาย (Zero Data Loss) พร้อมเชื่อมต่อโดยตรง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-4 pt-2 gap-2 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-lg border-b-2 transition-colors ${
              activeTab === 'credentials'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            ตั้งค่า URL & Key เชื่อมต่อ
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-lg border-b-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            คำสั่ง SQL & ระบบตารางอัตโนมัติ
          </button>
          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-lg border-b-2 transition-colors ${
              activeTab === 'diagnostic'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-blue-600" />
            สถานะตาราง & ความสมบูรณ์
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm text-slate-700 flex-1">
          
          {/* TAB 1: CREDENTIALS */}
          {activeTab === 'credentials' && (
            <div className="space-y-4">
              
              {/* Status Header Pill */}
              <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                isSupabaseConfigured
                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/90 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-start gap-3">
                  {isSupabaseConfigured ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {isSupabaseConfigured ? 'เชื่อมต่อ Supabase เรียบร้อยแล้ว' : 'ยังไม่ได้เชื่อมต่อกับ Supabase'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {configSource === 'custom' && 'แหล่งที่มา: บันทึกผ่านหน้าจอนี้ (Custom UI Credentials)'}
                      {configSource === 'env' && 'แหล่งที่มา: ไฟล์ Environment Variables (.env)'}
                      {configSource === 'none' && 'กรุณากรอก Project URL และ Anon Key เพื่อเริ่มใช้งานฐานข้อมูลจริง'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={runHealthCheck}
                  disabled={isTesting}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-emerald-600' : ''}`} />
                  ทดสอบการเชื่อมต่อ
                </button>
              </div>

              {saveSuccessMessage && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}

              {/* Credential Form */}
              <form onSubmit={handleSaveCredentials} className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>1. Supabase Project URL</span>
                    <a 
                      href="https://supabase.com/dashboard" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[11px] text-teal-700 hover:underline flex items-center gap-0.5 font-normal"
                    >
                      เปิด Supabase Dashboard <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-project-id.supabase.co"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                  <span className="text-[11px] text-slate-500 block">
                    ตัวอย่าง: <code>https://xxyyzz.supabase.co</code> (ดูได้ในเมนู Project Settings → API ใน Supabase)
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>2. Supabase Anon Public Key (API Key)</span>
                    <span className="text-[11px] text-slate-500 font-normal">public / anon key</span>
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                  <span className="text-[11px] text-slate-500 block">
                    คัดลอกจาก Project Settings → API → <strong>Project API keys (anon / public)</strong>
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200">
                  {configSource === 'custom' ? (
                    <button
                      type="button"
                      onClick={handleClearCredentials}
                      className="px-3 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      ล้างค่าที่กรอกไว้
                    </button>
                  ) : <div />}

                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    บันทึกการตั้งค่า & เชื่อมต่อทันที
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 2: SCHEMA & AUTO-MIGRATION */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              
              {/* Explanation Card */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  แนวทางการจัดการตารางอัตโนมัติ โดยที่ข้อมูลเดิมไม่สูญหาย (Zero Data Loss)
                </div>
                <p className="leading-relaxed text-slate-700">
                  เพื่อแก้ปัญหาการลืมรัน SQL หรือกลัวข้อมูลเดิมหายเวลาที่แอปพัฒนาฟีเจอร์ใหม่:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-700 leading-relaxed">
                  <li>
                    <strong>ปลอดภัยต่อข้อมูล 100%:</strong> ใช้คำสั่ง <code>CREATE TABLE IF NOT EXISTS</code> และ <code>ALTER TABLE ADD COLUMN IF NOT EXISTS</code> ซึ่งหมายถึง <u>จะไม่มีการ DROP TABLE หรือลบข้อมูลใดๆ ทั้งสิ้น</u> แม้จะรันซ้ำกี่ครั้งก็ตาม
                  </li>
                  <li>
                    <strong>ฟังก์ชัน Auto-Migration ผ่าน RPC:</strong> ในสคริปต์ด้านล่างมีฟังก์ชัน <code>auto_migrate_accounting_schema()</code> บรรจุไว้ด้วย เมื่อรันครั้งแรกเสร็จแล้ว ในอนาคตแอปจะสามารถสั่งอัปเกรดตารางเองได้อัตโนมัติผ่านปุ่มเดียว โดยไม่ต้องเปิด SQL Editor อีกเลย
                  </li>
                </ul>
              </div>

              {/* Auto-Migrate Button Action */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-teal-600" />
                    สั่งอัปเกรดโครงสร้างตารางอัตโนมัติ (Trigger Auto-Migration)
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    แอปจะเรียกใช้คำสั่งตรวจสอบและเพิ่มคอลัมน์ใหม่ที่ยังไม่มีให้ทันที ข้อมูลเดิมไม่ถูกแตะต้อง
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRunAutoMigration}
                  disabled={isMigrating || !isSupabaseConfigured}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 shrink-0 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isMigrating ? 'animate-spin' : ''}`} />
                  {isMigrating ? 'กำลังตรวจสอบ...' : 'รัน Auto-Migrate ทันที'}
                </button>
              </div>

              {migrationMessage && (
                <div className={`p-3 rounded-lg text-xs font-medium border ${
                  migrationMessage.startsWith('✓') 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  {migrationMessage}
                </div>
              )}

              {/* SQL Script Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    คำสั่ง SQL ปลอดภัย 100% (วางใน Supabase SQL Editor ครั้งแรก):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySQL}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium flex items-center gap-1 shadow-xs transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'คัดลอกแล้ว!' : 'คัดลอก SQL ทั้งหมด'}
                  </button>
                </div>

                <pre className="bg-slate-900 text-emerald-300 p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto max-h-56 border border-slate-800 leading-relaxed">
                  {SAFE_MIGRATION_SQL}
                </pre>
              </div>

            </div>
          )}

          {/* TAB 3: DIAGNOSTIC & DATA COUNTS */}
          {activeTab === 'diagnostic' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-blue-600" />
                  ผลการตรวจสอบความพร้อมของตารางใน Supabase
                </h4>
                <button
                  type="button"
                  onClick={runHealthCheck}
                  disabled={isTesting}
                  className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                  ตรวจสอบซ้ำ
                </button>
              </div>

              {/* Table Diagnostic Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* transactions */}
                <div className={`p-4 rounded-xl border ${
                  healthResult?.tables.transactions.exists 
                    ? 'bg-emerald-50/50 border-emerald-200' 
                    : 'bg-rose-50/50 border-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">1. transactions</span>
                    {healthResult?.tables.transactions.exists ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-2">
                    {healthResult?.tables.transactions.count ?? txCount} <span className="text-xs font-normal text-slate-500">แถว</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {healthResult?.tables.transactions.exists ? 'ตารางพร้อมใช้งาน' : 'ยังไม่พบตารางนี้ในฐานข้อมูล'}
                  </p>
                </div>

                {/* disbursements */}
                <div className={`p-4 rounded-xl border ${
                  healthResult?.tables.disbursements.exists 
                    ? 'bg-emerald-50/50 border-emerald-200' 
                    : 'bg-rose-50/50 border-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">2. disbursements</span>
                    {healthResult?.tables.disbursements.exists ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-2">
                    {healthResult?.tables.disbursements.count ?? dbmCount} <span className="text-xs font-normal text-slate-500">แถว</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {healthResult?.tables.disbursements.exists ? 'ตารางพร้อมใช้งาน' : 'ยังไม่พบตารางนี้ในฐานข้อมูล'}
                  </p>
                </div>

                {/* todo_tasks */}
                <div className={`p-4 rounded-xl border ${
                  healthResult?.tables.todoTasks.exists 
                    ? 'bg-emerald-50/50 border-emerald-200' 
                    : 'bg-rose-50/50 border-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">3. todo_tasks</span>
                    {healthResult?.tables.todoTasks.exists ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-2">
                    {healthResult?.tables.todoTasks.count ?? taskCount} <span className="text-xs font-normal text-slate-500">แถว</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {healthResult?.tables.todoTasks.exists ? 'ตารางพร้อมใช้งาน' : 'ยังไม่พบตารางนี้ในฐานข้อมูล'}
                  </p>
                </div>
              </div>

              {/* Auto-Migration RPC status */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${healthResult?.hasAutoMigrationRpc ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span>
                    ฟังก์ชันอัปเกรดอัตโนมัติในฐานข้อมูล (<code>auto_migrate_accounting_schema</code>):
                  </span>
                </div>
                <span className={`font-semibold ${healthResult?.hasAutoMigrationRpc ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {healthResult?.hasAutoMigrationRpc ? 'ติดตั้งแล้ว (รองรับ Auto-Migrate 100%)' : 'ยังไม่ได้ติดตั้ง (แนะนำรัน SQL ในแท็บที่ 2)'}
                </span>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            สถานะปัจจุบัน: {isSupabaseConfigured ? '🟢 ออนไลน์ (เชื่อมต่อสด)' : '⚪ รอการตั้งค่า'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
