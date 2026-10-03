import { useState, useEffect, useRef, FormEvent, DragEvent } from 'react';
import { Disbursement } from '../types';
import { 
  X, CheckCircle2, ArrowRight, Link, Building2, 
  CreditCard, Banknote, FileCheck, Upload, Image,
  Eye, Trash2, Clipboard, QrCode, AlertCircle, ShieldCheck,
  UserCheck, PenTool, Check
} from 'lucide-react';
import QRCode from 'qrcode';
import { SignatureActionModal } from './SignatureActionModal';
import { FileUploadZone } from './FileUploadZone';
import { BTCLogo } from './BTCLogo';
import { numberToThaiBaht } from '../utils/thaiBahtText';
import { generatePVNumber, generateAuditCertificateId } from '../utils/paymentUtils';
import { getActiveUserName } from '../services/userService';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  disbursement: Disbursement | null;
  disbursements?: Disbursement[];
  onConfirmPayment: (
    id: string,
    paymentData: {
      payerAccount: string;
      chequeNo: string;
      paymentDate: string;
      transferAmount: number;
      fee: number;
      paymentMethod: string;
      documentLink: string;
      paymentSlipUrl?: string;
      paymentSlipName?: string;
      financeRecordedBy: string;
      financeSignature?: string;
      pvNo: string;
      paidAt: string;
      auditCertificateId: string;
      status: 'paid';
    }
  ) => void;
  accountsList: string[];
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  disbursement,
  disbursements = [],
  onConfirmPayment,
  accountsList
}: RecordPaymentModalProps) {
  // Step 2 & 3 state
  const [payerAccount, setPayerAccount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'โอนเงินผ่านธนาคาร' | 'เช็คสั่งจ่าย' | 'เงินสด/เงินสดย่อย'>('โอนเงินผ่านธนาคาร');
  const [chequeNo, setChequeNo] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [fee, setFee] = useState<string>('0');
  const [documentLink, setDocumentLink] = useState('');
  const [paymentSlipUrl, setPaymentSlipUrl] = useState<string>('');
  const [paymentSlipName, setPaymentSlipName] = useState<string>('');
  const [financeRecordedBy, setFinanceRecordedBy] = useState(() => getActiveUserName());
  const [payerSignature, setPayerSignature] = useState<string>('');
  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [previewSlip, setPreviewSlip] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showQuickSignature, setShowQuickSignature] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize values when disbursement opens
  useEffect(() => {
    if (disbursement && isOpen) {
      setPayerAccount(disbursement.payerAccount || accountsList[0] || 'BBL #297-3-033893 (BTC กระแสรายวัน)');
      
      // Determine payment method default
      if (disbursement.paymentMethod?.includes('เช็ค')) {
        setPaymentMethod('เช็คสั่งจ่าย');
      } else if (disbursement.paymentMethod?.includes('เงินสด')) {
        setPaymentMethod('เงินสด/เงินสดย่อย');
      } else {
        setPaymentMethod('โอนเงินผ่านธนาคาร');
      }

      setChequeNo(disbursement.chequeNo || '');
      
      const today = new Date();
      const thaiYear = today.getFullYear() + 543;
      const formattedToday = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${thaiYear}`;
      setPaymentDate(disbursement.paymentDate && disbursement.paymentDate !== '-' ? disbursement.paymentDate : formattedToday);

      const netAmount = disbursement.transferAmount && disbursement.transferAmount > 0 
        ? disbursement.transferAmount 
        : disbursement.totalAmount;
      setTransferAmount(netAmount.toString());
      setFee(disbursement.fee ? disbursement.fee.toString() : '0');
      setDocumentLink(disbursement.documentLink || '');
      setPaymentSlipUrl(disbursement.paymentSlipUrl || '');
      setPaymentSlipName(disbursement.paymentSlipName || '');
      setFinanceRecordedBy(disbursement.financeRecordedBy || getActiveUserName());
      setPayerSignature(disbursement.financeSignature || '');
    }
  }, [disbursement, isOpen, accountsList]);

  // Generate QR Code dynamically whenever documentLink changes
  useEffect(() => {
    if (documentLink && documentLink.trim().startsWith('http')) {
      QRCode.toDataURL(documentLink.trim(), { width: 140, margin: 1 })
        .then(url => setQrCodeUrl(url))
        .catch(() => setQrCodeUrl(''));
    } else {
      setQrCodeUrl('');
    }
  }, [documentLink]);

  // Handle Paste (Ctrl+V) anywhere in modal to grab slip screenshot
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (uploadEvent) => {
              const dataUrl = uploadEvent.target?.result as string;
              setPaymentSlipUrl(dataUrl);
              setPaymentSlipName(`slip_clipboard_${Date.now()}.png`);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen || !disbursement) return null;

  const pvNumber = disbursement.pvNo || generatePVNumber(disbursements, paymentDate);
  const certId = disbursement.auditCertificateId || generateAuditCertificateId(disbursement.dbmNo);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPaymentSlipUrl(dataUrl);
      setPaymentSlipName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const formatMoney = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
    return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const executePayment = (signatureToUse?: string) => {
    const finalAmount = parseFloat(transferAmount) || disbursement.totalAmount;
    const finalFee = parseFloat(fee) || 0;
    const finalSig = signatureToUse !== undefined ? signatureToUse : payerSignature;

    // Generate or retain PV No
    const nowIso = new Date().toISOString();

    onConfirmPayment(disbursement.id, {
      payerAccount: payerAccount.trim(),
      chequeNo: chequeNo.trim(),
      paymentDate: paymentDate.trim(),
      transferAmount: finalAmount,
      fee: finalFee,
      paymentMethod,
      documentLink: documentLink.trim(),
      paymentSlipUrl,
      paymentSlipName,
      financeRecordedBy: financeRecordedBy.trim(),
      financeSignature: finalSig,
      pvNo: pvNumber,
      paidAt: nowIso,
      auditCertificateId: certId,
      status: 'paid'
    });

    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // If signature not provided yet, open signature modal for user to sign on confirmation!
    if (!payerSignature) {
      setShowSignModal(true);
      return;
    }

    executePayment();
  };

  const handleConfirmSignatureAndPay = (signedUrl: string) => {
    setPayerSignature(signedUrl);
    setShowSignModal(false);
    executePayment(signedUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header Bar */}
        <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between shrink-0 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  แบบฟอร์มเอกสารใบสำคัญจ่าย (Payment Voucher Form - PV)
                </h3>
                <span className="px-2 py-0.5 bg-emerald-400 text-emerald-950 text-[10px] font-bold rounded flex items-center gap-1">
                  <FileCheck className="w-3 h-3 text-emerald-950" />
                  แบบฟอร์มเอกสารจริง (Official Document)
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-normal">
                บันทึกการชำระเงินจริง • ออกเลขที่ใบสำคัญจ่าย PV • ลงลายมือชื่อสดสั่งจ่าย
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form - Full Document Canvas */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
          
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-white text-xs space-y-4 text-slate-900">
            
            {/* 1. DOCUMENT LETTERHEAD & PV HEADER */}
            <div className="border-b-2 border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                {/* Left: Company Details */}
                <div className="flex items-start gap-3">
                  <BTCLogo size="md" />
                  <div className="space-y-0.5">
                    <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                      บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด
                    </h2>
                    <p className="text-[11px] font-semibold text-slate-600">
                      BURIRAM THONGCHAI CONSTRUCTION CO., LTD.
                    </p>
                    <p className="text-[10px] text-slate-500">
                      เลขประจำตัวผู้เสียภาษี 0315559001144 • สำนักงานใหญ่
                    </p>
                    <p className="text-[10px] text-slate-500">
                      31/2 ถนนอินจันทร์ณรงค์ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000 • โทร. 044-611134 • E-Mail: brtc2024@gmail.com
                    </p>
                  </div>
                </div>

                {/* Right: Official Document Metadata Box */}
                <div className="sm:w-72 bg-emerald-50/50 border-2 border-slate-700 rounded-lg p-2.5 shadow-xs space-y-1.5 shrink-0">
                  <div className="text-center font-bold text-slate-900 border-b border-slate-300 pb-1 text-xs">
                    ใบสำคัญจ่าย (PAYMENT VOUCHER)
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">เลขที่ใบสำคัญ (PV No.)</span>
                      <div className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-black text-emerald-800 text-xs truncate">
                        {pvNumber}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">อ้างอิงใบขอเบิก (DBM)</span>
                      <div className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-800 text-xs truncate">
                        {disbursement.dbmNo}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">วันที่สั่งจ่ายจริง *</span>
                      <input
                        type="text"
                        required
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        placeholder="15/01/2568"
                        className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-800 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">รหัสกำกับสิทธิ์</span>
                      <div className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-slate-600 text-[9px] truncate" title={certId}>
                        {certId.slice(0, 10)}...
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* 2. VERIFIED PAYEE & DISBURSEMENT INFORMATION */}
              <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ข้อมูลรายการที่ผ่านการอนุมัติแล้ว (Approved Disbursement Details)</span>
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[10px] rounded">
                    อนุมัติโดย: {disbursement.approverName || 'ฝ่ายบริหาร'}
                  </span>
                </div>

                <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-500 block font-medium">สั่งจ่ายให้แก่ (Payee)</span>
                    <div className="text-sm font-black text-slate-900">{disbursement.payeeName}</div>
                    <div className="text-[11px] text-slate-600 flex items-center gap-1 font-mono mt-0.5">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      <span>เลขบัญชีปลายทาง: {disbursement.payeeBankAccount || 'ไม่มีระบุ'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">โครงการก่อสร้าง (Project)</span>
                    <div className="text-xs font-bold text-slate-800 truncate" title={disbursement.project}>
                      {disbursement.project}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      หมวดรายจ่าย: <strong className="text-slate-700">{disbursement.expenseType}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. ACTUAL PAYMENT PARTICULARS */}
              <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ข้อมูลการสั่งจ่ายเงินจริง (Payment Particulars)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    กรอกข้อมูลการชำระเงินจริงให้ตรงตามหลักฐานสลิป
                  </span>
                </div>

                <div className="p-3 space-y-3">
                  {/* Payment Method Selector */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                      รูปแบบการชำระเงิน (Payment Method) *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'โอนเงินผ่านธนาคาร', label: 'โอนเงินผ่านธนาคาร (Transfer)', icon: CreditCard },
                        { id: 'เช็คสั่งจ่าย', label: 'เช็คสั่งจ่าย (Cheque)', icon: Building2 },
                        { id: 'เงินสด/เงินสดย่อย', label: 'เงินสด/สดย่อย (Cash)', icon: Banknote }
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = paymentMethod === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPaymentMethod(item.id as any)}
                            className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-xs">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Accounts & Cheque/Ref */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                        จ่ายจากบัญชีธนาคารบริษัท (Source Account) *
                      </label>
                      <select
                        value={payerAccount}
                        onChange={(e) => setPayerAccount(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 font-mono text-xs font-bold text-slate-800"
                      >
                        {accountsList.map((acc, i) => (
                          <option key={i} value={acc}>{acc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                        {paymentMethod === 'เช็คสั่งจ่าย' ? 'เลขที่เช็คสั่งจ่าย *' : 'เลขที่ทำรายการ / เลขอ้างอิงสลิป / Ref'}
                      </label>
                      <input
                        type="text"
                        list="dl-ref-doc-nos"
                        value={chequeNo}
                        onChange={(e) => setChequeNo(e.target.value)}
                        placeholder={paymentMethod === 'เช็คสั่งจ่าย' ? 'เช่น 01620875-1' : 'เช่น TXN202501158941'}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Paid Amount, Fee & Thai Baht Text */}
                  <div className="bg-emerald-50/40 border border-emerald-200 rounded-lg p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <div>
                        <label className="font-bold text-slate-800 block mb-1 text-[11px]">
                          ยอดเงินจ่ายจริงสุทธิ (บาท) *
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-2.5 py-1.5 bg-white border-2 border-emerald-500 rounded-lg focus:ring-1 focus:ring-emerald-600 font-mono font-black text-right text-emerald-950 text-base"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                          ค่าธรรมเนียมธนาคาร (บาท)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={fee}
                          onChange={(e) => setFee(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 font-mono text-right text-xs"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <span className="text-[10px] text-slate-500 block font-medium">จำนวนเงินตัวอักษร:</span>
                        <div className="font-bold text-emerald-900 text-xs mt-0.5 leading-snug">
                          ({numberToThaiBaht(parseFloat(transferAmount) || disbursement.totalAmount)})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Google Drive / Document Link */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-[11px] flex items-center gap-1">
                      <Link className="w-3 h-3 text-blue-600" />
                      <span>ลิงก์เอกสารอ้างอิงออนไลน์ (Google Drive / Online Document Link)</span>
                    </label>
                    <input
                      type="url"
                      value={documentLink}
                      onChange={(e) => setDocumentLink(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 4. PAYMENT SLIP EVIDENCE SECTION */}
              <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-emerald-600" />
                    <span>หลักฐานการโอนเงิน / ภาพสลิปธนาคาร (Slip Evidence)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    ลากวางไฟล์ หรือกด <kbd className="font-mono font-bold text-blue-700">Ctrl+V</kbd> เพื่อวางภาพสลิปทันที
                  </span>
                </div>

                <div className="p-3">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : paymentSlipUrl 
                        ? 'border-emerald-300 bg-emerald-50/40' 
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />

                    {paymentSlipUrl ? (
                      <div className="flex items-center justify-between gap-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={paymentSlipUrl} 
                            alt="Payment Slip" 
                            className="w-12 h-12 object-cover rounded border border-emerald-300" 
                          />
                          <div className="text-left">
                            <div className="font-bold text-emerald-950 truncate max-w-xs">{paymentSlipName || 'สลิปการโอนเงิน'}</div>
                            <div className="text-[10px] text-emerald-700">แนบหลักฐานสลิปเรียบร้อยแล้ว</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewSlip(true)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-blue-700 border border-slate-200 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            ดูรูปสลิป
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentSlipUrl('');
                              setPaymentSlipName('');
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-3 text-slate-500 flex flex-col items-center justify-center gap-1">
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="font-bold text-xs text-slate-700">คลิกเพื่อเลือกไฟล์ หรือลากสลิปมาวางที่นี่</span>
                        <span className="text-[10px] text-slate-400">(รองรับ JPG, PNG, PDF หรือกด Ctrl+V เพื่อวางภาพสลิปทันที)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 5. OFFICIAL 2-PARTY SIGNATURES BLOCK */}
              <div className="border-2 border-slate-700 rounded-lg overflow-hidden bg-white">
                <div className="bg-slate-800 text-white px-3 py-1 text-center font-bold text-xs tracking-wider">
                  ผู้มีอำนาจลงนามสั่งจ่าย & รับรองใบสำคัญจ่าย (OFFICIAL PAYMENT SIGNATURES)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 text-center">
                  
                  {/* Left: ผู้มีอำนาจสั่งจ่าย / เจ้าหน้าที่การเงิน (Finance Officer / Payer) */}
                  <div className="p-3 flex flex-col justify-between space-y-2 bg-emerald-50/20">
                    <div className="font-bold text-slate-800 text-[11px] flex items-center justify-center gap-1">
                      <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ผู้มีอำนาจสั่งจ่าย / เจ้าหน้าที่การเงิน (Finance Officer)</span>
                    </div>

                    <div className="min-h-[75px] flex flex-col items-center justify-center border-b border-dashed border-slate-300 pb-2">
                      {payerSignature ? (
                        <div className="space-y-1">
                          <img 
                            src={payerSignature} 
                            alt="Payer Signature" 
                            className="h-12 max-w-[130px] object-contain mx-auto bg-white rounded border border-slate-200 p-0.5 shadow-xs" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignModal(true)}
                            className="text-[10px] text-emerald-700 hover:underline block font-semibold cursor-pointer"
                          >
                            ✍️ เปลี่ยน/เซ็นสดใหม่
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowSignModal(true)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>✍️ เซ็นชื่อสดสั่งจ่าย</span>
                        </button>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-700 space-y-0.5">
                      <div className="font-bold">({financeRecordedBy})</div>
                      <div className="text-[10px] text-slate-500">วันที่สั่งจ่าย: {paymentDate}</div>
                    </div>
                  </div>

                  {/* Right: ผู้รับเงิน / บันทึกบัญชี (Payee & Verification) */}
                  <div className="p-3 flex flex-col justify-between space-y-2 bg-slate-50/50">
                    <div className="font-bold text-slate-700 text-[11px] flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>ผู้รับเงิน / บันทึกบัญชี (Payee & Audit Verification)</span>
                    </div>

                    <div className="min-h-[75px] flex flex-col items-center justify-center border-b border-dashed border-slate-300 pb-2">
                      {qrCodeUrl ? (
                        <div className="flex items-center gap-2">
                          <img src={qrCodeUrl} alt="Audit QR" className="w-12 h-12 rounded border border-slate-200 shadow-xs" />
                          <div className="text-left text-[9px] text-slate-500">
                            <span className="font-bold text-emerald-700 block">✓ VERIFIED STAMP</span>
                            <span>{certId.slice(0, 14)}...</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400">
                          (โอนเงินเข้าบัญชีตามหลักฐานสลิป)
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-700 space-y-0.5">
                      <div className="font-bold">({disbursement.payeeName})</div>
                      <div className="text-[10px] text-slate-400">ผู้รับเงิน / ร้านค้าคู่สัญญา</div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          {/* Sticky Bottom Confirmation Bar */}
          <div className="shrink-0 px-6 py-3.5 bg-slate-800 border-t border-slate-700 flex items-center justify-between flex-wrap gap-3 text-white">
            <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>เมื่อกดยืนยัน ระบบจะเปลี่ยนสถานะเป็น <strong>"จ่ายเงินแล้ว" (Paid)</strong> และออกเลขที่ใบสำคัญจ่าย PV ทันที</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 font-bold cursor-pointer transition-colors text-xs"
              >
                ปิดหน้าต่าง
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-[#005aa9] hover:from-emerald-700 hover:to-[#004887] text-white font-extrabold text-xs shadow-md shadow-emerald-900/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันบันทึกจ่ายเงิน (Confirm Payment & Issue PV)</span>
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Slip Lightbox */}
      {previewSlip && paymentSlipUrl && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewSlip(false)}
        >
          <div className="bg-white rounded-2xl p-4 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <span className="font-bold text-xs text-slate-800">พรีวิวหลักฐานการโอนเงิน (Payment Slip)</span>
              <button onClick={() => setPreviewSlip(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img 
              src={paymentSlipUrl} 
              alt="Payment Slip Full" 
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl border border-slate-200 shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Dedicated Signature Action Modal on Payment Confirm */}
      <SignatureActionModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        onConfirm={handleConfirmSignatureAndPay}
        title="ลงนามด้วยลายมือชื่อสดสั่งจ่ายเงิน (Payment Live Signature)"
        subtitle="ลงนามสดด้วยตนเองเพื่อออกใบสำคัญจ่าย (PV) และประทับตรารับรองเอกสาร"
        signerName={financeRecordedBy}
        signerRole="ฝ่ายการเงิน (Treasury / Finance)"
        docNo={disbursement.dbmNo}
        docTitle={`จ่ายชำระ ${disbursement.payeeName} - โครงการ ${disbursement.project}`}
        amount={parseFloat(transferAmount) || disbursement.totalAmount}
        actionType="pay"
        confirmButtonText="ยืนยันลายมือชื่อสดและบันทึกจ่ายเงิน"
        initialSignature={payerSignature}
      />

    </div>
  );
}
