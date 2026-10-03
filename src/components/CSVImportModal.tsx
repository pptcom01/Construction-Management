import { useState, useRef, ChangeEvent, DragEvent, useMemo } from 'react';
import { 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileText, 
  Receipt, 
  Sparkles,
  ShieldCheck,
  ClipboardPaste,
  Download,
  Table,
  Check
} from 'lucide-react';
import { 
  parseLedgerCSV, 
  detectCSVType, 
  upsertTransactions, 
  upsertDisbursements,
  decodeFileContent,
  downloadCSVFile,
  getLedgerCSVTemplate,
  getDisbursementCSVTemplate,
  UpsertResult 
} from '../utils/csvParser';
import { parseDisbursements } from '../utils/disbursementData';
import { Transaction, Disbursement } from '../types';

export type ImportTarget = 'auto' | 'transactions' | 'disbursements';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  disbursements: Disbursement[];
  onImportTransactions: (transactions: Transaction[], stats: UpsertResult<Transaction>) => void;
  onImportDisbursements: (disbursements: Disbursement[], stats: UpsertResult<Disbursement>) => void;
  defaultTarget?: ImportTarget;
}

export function CSVImportModal({
  isOpen,
  onClose,
  transactions,
  disbursements,
  onImportTransactions,
  onImportDisbursements,
  defaultTarget = 'auto'
}: CSVImportModalProps) {
  const [inputMode, setInputMode] = useState<'file' | 'paste'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState('');
  const [pasteInput, setPasteInput] = useState('');
  const [detectedEncoding, setDetectedEncoding] = useState<string>('UTF-8');
  const [targetType, setTargetType] = useState<ImportTarget>(defaultTarget);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importedReport, setImportedReport] = useState<{
    type: 'transactions' | 'disbursements';
    stats: UpsertResult<any>;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect CSV type if set to auto
  const detectedType = useMemo((): 'transactions' | 'disbursements' => {
    if (!csvText) return 'transactions';
    if (targetType === 'transactions') return 'transactions';
    if (targetType === 'disbursements') return 'disbursements';
    
    const detected = detectCSVType(csvText);
    return detected === 'disbursement' ? 'disbursements' : 'transactions';
  }, [csvText, targetType]);

  // Parse and preview analysis
  const previewAnalysis = useMemo(() => {
    if (!csvText.trim()) return null;
    try {
      if (detectedType === 'transactions') {
        const parsed = parseLedgerCSV(csvText);
        const stats = upsertTransactions(transactions, parsed);
        return {
          type: 'transactions' as const,
          parsedCount: parsed.length,
          stats,
          sampleItems: parsed.slice(0, 4)
        };
      } else {
        const parsed = parseDisbursements(csvText);
        const stats = upsertDisbursements(disbursements, parsed);
        return {
          type: 'disbursements' as const,
          parsedCount: parsed.length,
          stats,
          sampleItems: parsed.slice(0, 4)
        };
      }
    } catch (e: any) {
      return null;
    }
  }, [csvText, detectedType, transactions, disbursements]);

  if (!isOpen) return null;

  const processFile = async (selectedFile: File, preferredEnc?: string) => {
    setFile(selectedFile);
    setErrorMsg(null);
    setImportedReport(null);

    try {
      const { text, encoding } = await decodeFileContent(selectedFile, preferredEnc);
      setDetectedEncoding(encoding);
      setCsvText(text);

      const type = targetType === 'auto' ? (detectCSVType(text) === 'disbursement' ? 'disbursements' : 'transactions') : targetType;
      if (type === 'transactions') {
        const parsed = parseLedgerCSV(text);
        if (parsed.length === 0) {
          setErrorMsg('ไม่พบข้อมูลรายการในไฟล์ หรือหัวตารางไม่ตรงกับรูปแบบสมุดบัญชี');
        }
      } else {
        const parsed = parseDisbursements(text);
        if (parsed.length === 0) {
          setErrorMsg('ไม่พบข้อมูลในไฟล์ หรือหัวตารางไม่ตรงกับระบบเบิกจ่าย');
        }
      }
    } catch (err: any) {
      setErrorMsg('ไม่สามารถอ่านโครงสร้างไฟล์ CSV ได้ กรุณาตรวจสอบว่าเป็นไฟล์ CSV หรือข้อความที่ถูกต้อง');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      processFile(dropped);
    }
  };

  const handlePasteChange = (val: string) => {
    setPasteInput(val);
    setCsvText(val);
    setErrorMsg(null);
    setImportedReport(null);
  };

  const handleExecuteImport = () => {
    if (!csvText.trim()) {
      setErrorMsg('กรุณาเลือกไฟล์หรือวางข้อมูลก่อนนำเข้า');
      return;
    }

    try {
      if (detectedType === 'transactions') {
        const parsed = parseLedgerCSV(csvText);
        if (parsed.length === 0) {
          setErrorMsg('ไม่พบข้อมูลรายการบัญชีในไฟล์ CSV');
          return;
        }

        const stats = upsertTransactions(transactions, parsed);
        onImportTransactions(stats.result, stats);
        setImportedReport({
          type: 'transactions',
          stats
        });
      } else {
        // disbursements
        const parsed = parseDisbursements(csvText);
        if (parsed.length === 0) {
          setErrorMsg('ไม่พบข้อมูลใบเบิกจ่ายในไฟล์ CSV');
          return;
        }

        const stats = upsertDisbursements(disbursements, parsed);
        onImportDisbursements(stats.result, stats);
        setImportedReport({
          type: 'disbursements',
          stats
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการประมวลผลไฟล์ CSV');
    }
  };

  const handleResetModal = () => {
    setFile(null);
    setCsvText('');
    setPasteInput('');
    setErrorMsg(null);
    setImportedReport(null);
  };

  const handleDownloadLedgerTemplate = () => {
    downloadCSVFile('แม่แบบ_สมุดบัญชีรายรับรายจ่าย.csv', getLedgerCSVTemplate());
  };

  const handleDownloadDisbursementTemplate = () => {
    downloadCSVFile('แม่แบบ_ระบบเบิกจ่าย_DBM.csv', getDisbursementCSVTemplate());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  นำเข้าไฟล์ข้อมูลอัจฉริยะ (Smart Upsert Import)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  ป้องกันข้อมูลซ้ำซ้อน 100%
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                รองรับทั้งระบบเบิกจ่าย (DBM) และสมุดบัญชีรายรับ-รายจ่าย • อัปเดตรายการเดิมก่อนเพิ่มใหม่
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs text-slate-700">
          
          {/* If already imported successfully, show results report */}
          {importedReport ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-2.5 text-[#009540] font-bold text-sm mb-1">
                  <CheckCircle2 className="w-5 h-5 text-[#009540] shrink-0" />
                  <span>นำเข้าและปรับปรุงฐานข้อมูลสำเร็จเรียบร้อย!</span>
                </div>
                <p className="text-xs text-slate-600">
                  ระบบได้ประมวลผลข้อมูลสำหรับ: <strong className="text-slate-900">{importedReport.type === 'disbursements' ? 'ระบบเบิกจ่าย & จ่ายเงิน (Disbursements)' : 'สมุดบัญชีรายรับ-รายจ่าย (Ledger Transactions)'}</strong>
                </p>
              </div>

              {/* KPI Summary Strip */}
              <div className="grid grid-cols-4 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 block">ทั้งหมดในไฟล์</span>
                  <span className="text-base font-black text-slate-900 font-mono">{importedReport.stats.total}</span>
                  <span className="text-[10px] text-slate-400 block">รายการ</span>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-center">
                  <span className="text-[10px] font-bold text-blue-700 block">อัปเดตข้อมูลเดิม</span>
                  <span className="text-base font-black text-blue-800 font-mono">{importedReport.stats.updated}</span>
                  <span className="text-[10px] text-blue-600 block">รายการ</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-emerald-700 block">เพิ่มใหม่</span>
                  <span className="text-base font-black text-[#009540] font-mono">{importedReport.stats.added}</span>
                  <span className="text-[10px] text-emerald-600 block">รายการ</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 block">ข้อมูลตรงกันเดิม</span>
                  <span className="text-base font-black text-slate-600 font-mono">{importedReport.stats.unchanged}</span>
                  <span className="text-[10px] text-slate-400 block">รายการ</span>
                </div>
              </div>

              {importedReport.stats.updatedDocNos.length > 0 && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <span className="font-bold text-blue-900 block mb-1">
                    ตัวอย่างเลขที่เอกสารที่ได้รับการอัปเดต ({importedReport.stats.updatedDocNos.length} รายการ):
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {importedReport.stats.updatedDocNos.slice(0, 15).map((doc, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-[10px] font-semibold">
                        {doc}
                      </span>
                    ))}
                    {importedReport.stats.updatedDocNos.length > 15 && (
                      <span className="text-[10px] text-blue-600 self-center">
                        และอีก {importedReport.stats.updatedDocNos.length - 15} รายการ
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={handleResetModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  นำเข้าไฟล์อื่นเพิ่มเติม
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-[#009540] hover:bg-[#007f36] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  เสร็จสิ้น & ปิดหน้าต่าง
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Template Download Utility Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    ดาวน์โหลดไฟล์แม่แบบตัวอย่าง (CSV Templates):
                  </span>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    เปิดแก้ไขใน Excel หรือ Google Sheets แล้วบันทึกกลับมานำเข้าได้ทันที
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadLedgerTemplate}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="ดาวน์โหลดไฟล์แม่แบบสมุดบัญชีรายรับ-รายจ่าย"
                  >
                    <FileText className="w-3 h-3 text-[#009540]" />
                    <span>แม่แบบสมุดบัญชี</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadDisbursementTemplate}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="ดาวน์โหลดไฟล์แม่แบบระบบเบิกจ่าย DBM"
                  >
                    <Receipt className="w-3 h-3 text-[#005aa9]" />
                    <span>แม่แบบเบิกจ่าย DBM</span>
                  </button>
                </div>
              </div>

              {/* Step 1: Target Selector (Auto, Ledger, Disbursement) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">1. เลือกระบบเป้าหมายที่ต้องการนำเข้า:</span>
                  {csvText && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      ตรวจพบรูปแบบอัตโนมัติ: <strong>{detectedType === 'disbursements' ? 'ระบบเบิกจ่าย (DBM)' : 'สมุดรายรับ-รายจ่าย'}</strong>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetType('auto')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      targetType === 'auto'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold ring-1 ring-indigo-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>ตรวจจับอัตโนมัติ</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal block leading-tight">
                      วิเคราะห์จากหัวคอลัมน์ในไฟล์
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('disbursements')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      targetType === 'disbursements'
                        ? 'border-[#005aa9] bg-blue-50 text-blue-950 font-bold ring-1 ring-[#005aa9]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-0.5 text-blue-900">
                      <Receipt className="w-3.5 h-3.5 text-[#005aa9]" />
                      <span>ระบบเบิกจ่าย & จ่ายเงิน</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal block leading-tight">
                      ใบขอเบิก DBM, โอนเงิน, เช็ค
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('transactions')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      targetType === 'transactions'
                        ? 'border-[#009540] bg-emerald-50 text-emerald-950 font-bold ring-1 ring-[#009540]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-0.5 text-emerald-900">
                      <FileText className="w-3.5 h-3.5 text-[#009540]" />
                      <span>สมุดบัญชีรายรับ-รายจ่าย</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal block leading-tight">
                      เดบิต, เครดิต, บัญชีธนาคาร
                    </span>
                  </button>
                </div>
              </div>

              {/* Step 2: Input Mode (File Upload vs Paste from Excel) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">2. วิธีการนำเข้าข้อมูล:</span>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setInputMode('file')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        inputMode === 'file'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📁 อัปโหลดไฟล์ CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('paste')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        inputMode === 'paste'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📋 วางข้อมูลจาก Excel (Paste)
                    </button>
                  </div>
                </div>

                {inputMode === 'file' ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#009540] rounded-2xl p-5 text-center cursor-pointer transition-all bg-slate-50 hover:bg-emerald-50/30 relative"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".csv,.txt,.tsv"
                      className="hidden"
                    />
                    <Upload className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                    <p className="font-bold text-slate-800 text-xs">
                      {file ? file.name : 'คลิกเพื่อเลือกไฟล์ CSV หรือลากไฟล์มาวางที่นี่'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      รองรับ UTF-8, Windows-874 (Excel ภาษาไทย), TSV, CSV
                    </p>
                    {file && (
                      <div className="mt-2 inline-flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-[10px] font-mono">
                          การเข้ารหัส: {detectedEncoding}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <textarea
                      value={pasteInput}
                      onChange={(e) => handlePasteChange(e.target.value)}
                      placeholder="คัดลอกตารางจาก Excel หรือ Google Sheets แล้วกด Ctrl+V วางที่นี่ได้เลย..."
                      rows={4}
                      className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009540] transition-all resize-y"
                    />
                    <p className="text-[10.5px] text-slate-500">
                      💡 เคล็ดลับ: ไฮไลท์ข้อมูลใน Excel &gt; กด Ctrl+C &gt; คลิกในช่องแล้วกด Ctrl+V ระบบจะจัดรูปแบบคอลัมน์ให้อัตโนมัติ
                    </p>
                  </div>
                )}
              </div>

              {/* Step 3: Upsert Protection Guarantee */}
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-200 rounded-xl flex items-start gap-2.5 shadow-2xs">
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5 border border-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-[#009540]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 text-emerald-600" />
                      ระบบ Smart Upsert: ป้องกันข้อมูลซ้ำซ้อน 100%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    ตรวจเลขที่เอกสารอัตโนมัติ: รายการเดิมจะได้รับการ <strong>อัปเดตข้อมูล</strong> (คงประวัติ/สถานะกระทบยอด) และ <strong>เพิ่มเฉพาะแถวใหม่</strong> ปลอดภัยต่อการนำเข้าซ้ำ
                  </p>
                </div>
              </div>

              {/* Preview Analysis Card */}
              {previewAnalysis && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        ผลวิเคราะห์: {previewAnalysis.type === 'disbursements' ? 'ระบบเบิกจ่าย (Disbursements)' : 'สมุดบัญชี (Ledger)'} (พบ {previewAnalysis.parsedCount} แถว)
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      ตรวจสอบแล้ว
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="p-1.5">
                      <span className="text-[10px] text-blue-700 font-bold block">จะได้รับการอัปเดต</span>
                      <span className="text-sm font-black text-blue-800 font-mono">{previewAnalysis.stats.updated}</span>
                      <span className="text-[10px] text-slate-400 block">รายการเดิมที่ตรงกัน</span>
                    </div>
                    <div className="p-1.5 border-x border-slate-100">
                      <span className="text-[10px] text-emerald-700 font-bold block">จะถูกเพิ่มใหม่</span>
                      <span className="text-sm font-black text-[#009540] font-mono">{previewAnalysis.stats.added}</span>
                      <span className="text-[10px] text-slate-400 block">รายการใหม่</span>
                    </div>
                    <div className="p-1.5">
                      <span className="text-[10px] text-slate-500 font-bold block">ข้อมูลตรงกันเดิม</span>
                      <span className="text-sm font-black text-slate-600 font-mono">{previewAnalysis.stats.unchanged}</span>
                      <span className="text-[10px] text-slate-400 block">รายการไม่เปลี่ยนแปลง</span>
                    </div>
                  </div>

                  {/* Mini Data Preview Table */}
                  {previewAnalysis.sampleItems.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                        <Table className="w-3.5 h-3.5 text-slate-500" />
                        ตัวอย่างข้อมูลที่ตรวจพบ (4 แถวแรก):
                      </span>
                      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                        <table className="w-full text-[10.5px] text-left">
                          <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                            <tr>
                              <th className="p-1.5">วันที่</th>
                              <th className="p-1.5">เลขที่เอกสาร</th>
                              <th className="p-1.5">รายการ / ผู้รับเงิน</th>
                              <th className="p-1.5 text-right">จำนวนเงิน</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {previewAnalysis.type === 'transactions' ? (
                              (previewAnalysis.sampleItems as Transaction[]).map((tx, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="p-1.5 text-slate-600 font-mono">{tx.date}</td>
                                  <td className="p-1.5 font-semibold text-slate-900 font-mono">{tx.docNo || '-'}</td>
                                  <td className="p-1.5 text-slate-700 truncate max-w-[200px]">{tx.description}</td>
                                  <td className="p-1.5 text-right font-mono font-semibold">
                                    {tx.debit > 0 ? (
                                      <span className="text-emerald-700">+{tx.debit.toLocaleString()}</span>
                                    ) : (
                                      <span className="text-rose-700">-{tx.credit.toLocaleString()}</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              (previewAnalysis.sampleItems as Disbursement[]).map((dbm, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="p-1.5 text-slate-600 font-mono whitespace-nowrap">{dbm.entryDate}</td>
                                  <td className="p-1.5 font-semibold text-blue-900 font-mono whitespace-nowrap">{dbm.dbmNo}</td>
                                  <td className="p-1.5 max-w-[280px]">
                                    <div className="text-slate-800 font-medium truncate">{dbm.payeeName}</div>
                                    <div className="text-[9.5px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                      <span>ผู้ขอเบิก: <strong className="text-blue-700">{dbm.recordedBy || '-'}</strong></span>
                                      {dbm.financeRecordedBy ? (
                                        <span className="text-emerald-700">
                                          • ผู้จ่ายเงิน: <strong className="text-emerald-800">{dbm.financeRecordedBy}</strong>
                                        </span>
                                      ) : (
                                        <span className="text-amber-600 italic">(ยังไม่บันทึกจ่าย)</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-1.5 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                                    {dbm.totalAmount.toLocaleString()}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!importedReport && (
          <div className="shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              {csvText.trim() ? `พร้อมประมวลผลสำหรับ ${detectedType === 'disbursements' ? 'ระบบเบิกจ่าย' : 'สมุดรายรับ-รายจ่าย'}` : 'กรุณาเลือกไฟล์หรือวางข้อความเพื่อเริ่มต้น'}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={!csvText.trim() || !previewAnalysis}
                className="px-5 py-2.5 rounded-xl bg-[#009540] hover:bg-[#007f36] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold shadow-md shadow-emerald-700/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Upload className="w-4 h-4" />
                <span>ยืนยันการนำเข้าข้อมูล</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
