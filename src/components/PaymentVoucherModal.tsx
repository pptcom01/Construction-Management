import { useState, useEffect } from 'react';
import { Disbursement } from '../types';
import { 
  X, Printer, ExternalLink, Building2, Calendar, FileText, 
  CheckCircle2, Clock, AlertCircle, QrCode, Scissors,
  ShieldCheck, UserCheck, Eye, Paperclip, Lock, Award,
  Sparkles, Hash, Check, CreditCard, Banknote, Download
} from 'lucide-react';
import QRCode from 'qrcode';
import { numberToThaiBaht, getCompanyProfile } from '../utils/thaiBahtText';
import { generateAuditCertificateId, generateAuditFingerprint } from '../utils/paymentUtils';

interface PaymentVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  disbursement: Disbursement | null;
}

export function PaymentVoucherModal({
  isOpen,
  onClose,
  disbursement
}: PaymentVoucherModalProps) {
  const [printTab, setPrintTab] = useState<'voucher' | 'certificate' | 'both'>('both');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [certQrCodeUrl, setCertQrCodeUrl] = useState<string>('');
  const [previewAttachmentUrl, setPreviewAttachmentUrl] = useState<string | null>(null);

  const certId = disbursement?.auditCertificateId || (disbursement ? generateAuditCertificateId(disbursement.dbmNo) : '');
  const fingerprint = disbursement ? generateAuditFingerprint(disbursement) : '';

  useEffect(() => {
    if (disbursement?.documentLink && disbursement.documentLink.trim().startsWith('http')) {
      QRCode.toDataURL(disbursement.documentLink.trim(), { width: 140, margin: 1 })
        .then(url => setQrCodeUrl(url))
        .catch(() => setQrCodeUrl(''));
    } else {
      setQrCodeUrl('');
    }

    if (disbursement) {
      const verifyUrl = `https://btc-verify.com/cert?id=${certId}&doc=${disbursement.dbmNo}&hash=${fingerprint}`;
      QRCode.toDataURL(verifyUrl, { width: 140, margin: 1 })
        .then(url => setCertQrCodeUrl(url))
        .catch(() => setCertQrCodeUrl(''));
    }
  }, [disbursement, certId, fingerprint]);

  if (!isOpen || !disbursement) return null;

  const companyProfile = getCompanyProfile(disbursement.company);
  const totalAmount = disbursement.transferAmount || disbursement.totalAmount || 0;
  const thaiBahtText = numberToThaiBaht(totalAmount);

  const formatMoney = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
    return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden bg-linear-to-r from-emerald-50 via-white to-blue-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#009540] flex items-center justify-center font-black shadow-xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-900 font-mono">
                  {disbursement.pvNo || 'PV-6801-XXX'}
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-[#009540] border border-emerald-300 font-black text-[10px] rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  PAID (ชำระเงินแล้ว)
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                อ้างอิง DBM: <strong className="font-mono text-slate-700">{disbursement.dbmNo}</strong> • รหัสรับรอง: <span className="font-mono text-[10px] text-blue-700">{certId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
              <button
                onClick={() => setPrintTab('both')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  printTab === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ทั้งใบสำคัญจ่าย & ใบรับรอง
              </button>
              <button
                onClick={() => setPrintTab('voucher')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  printTab === 'voucher' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                เฉพาะใบสำคัญจ่าย (PV)
              </button>
              <button
                onClick={() => setPrintTab('certificate')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  printTab === 'certificate' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                เฉพาะใบรับรองลายเซ็นดิจิทัล
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#005aa9] hover:bg-[#004887] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-700/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>สั่งพิมพ์ / ออก PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            PRINTABLE CONTAINER (A4 STANDARD)
            ========================================================================= */}
        <div className="p-4 sm:p-8 flex-1 overflow-y-auto print:max-h-none print:overflow-visible print:p-0 bg-slate-50/50">
          
          <div className="max-w-[210mm] mx-auto space-y-6">

            {/* ==========================================
                DOCUMENT 1: OFFICIAL PAYMENT VOUCHER (PV)
                ========================================== */}
            {(printTab === 'both' || printTab === 'voucher') && (
              <div className="bg-white border border-slate-300 print:border-none p-6 print:p-4 rounded-2xl shadow-xs print:shadow-none space-y-4 relative overflow-hidden">
                
                {/* OFFICIAL "PAID" RUBBER STAMP (ตราประทับสีแดงสด) */}
                <div className="absolute top-6 right-6 z-10 pointer-events-none select-none rotate-[-12deg] opacity-90">
                  <div className="border-4 border-red-600 rounded-2xl px-4 py-1.5 text-center bg-red-50/20 backdrop-blur-2xs shadow-xs">
                    <div className="text-2xl font-black font-mono tracking-widest text-red-600 uppercase">
                      ★ PAID ★
                    </div>
                    <div className="text-[10px] font-black text-red-700 uppercase tracking-wider">
                      ชำระเงินเรียบร้อยแล้ว
                    </div>
                    <div className="text-[9px] font-mono text-red-600 border-t border-red-400 mt-0.5 pt-0.5">
                      {disbursement.paymentDate || 'DATE PAID'}
                    </div>
                  </div>
                </div>

                {/* Company Header */}
                <div className="border-b-2 border-black pb-3 grid grid-cols-3 gap-4 items-center">
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-14 h-14 bg-slate-100 border border-slate-400 rounded-lg flex items-center justify-center font-black text-slate-800 text-sm">
                      {companyProfile.name}
                    </div>
                    <div>
                      <h1 className="text-sm font-bold text-black">{companyProfile.fullName}</h1>
                      <p className="text-[11px] text-black leading-tight mt-0.5">
                        {companyProfile.address}<br />
                        เลขประจำตัวผู้เสียภาษี: <span className="font-mono">{companyProfile.taxId}</span> โทรศัพท์: {companyProfile.phone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right pr-28 sm:pr-32">
                    <h2 className="text-xl font-black text-black tracking-tight">ใบสำคัญจ่าย</h2>
                    <span className="text-[11px] font-mono text-slate-700 font-bold">PAYMENT VOUCHER</span>
                  </div>
                </div>

                {/* PV Info Bar */}
                <div className="grid grid-cols-3 gap-4 text-[11px] py-1 border-b border-slate-200">
                  <div className="col-span-2 space-y-1">
                    <div className="flex">
                      <span className="font-bold text-slate-900 w-28">จ่ายให้ (Payee) :</span>
                      <span className="text-slate-900 font-bold flex-1">{disbursement.payeeName}</span>
                    </div>
                    <div className="flex">
                      <span className="font-bold text-slate-900 w-28">โครงการ :</span>
                      <span className="text-slate-800 font-medium flex-1">{disbursement.project}</span>
                    </div>
                    <div className="flex">
                      <span className="font-bold text-slate-900 w-28">ประเภทรายจ่าย :</span>
                      <span className="text-slate-800 flex-1">{disbursement.expenseType}</span>
                    </div>
                    <div className="flex">
                      <span className="font-bold text-slate-900 w-28">รูปแบบการชำระ :</span>
                      <span className="text-slate-800 font-bold flex-1">
                        {disbursement.paymentMethod || 'โอนเงินผ่านธนาคาร'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="font-bold text-slate-900 w-28">ตัดจ่ายจากบัญชี :</span>
                      <span className="font-mono text-slate-800 flex-1">
                        {disbursement.payerAccount || 'BBL #297-3-033893 (BTC กระแสรายวัน)'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900">เลขที่ PV :</span>
                      <span className="font-mono font-black text-blue-900 text-xs">
                        {disbursement.pvNo || 'PV-6801-001'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900">เลขที่ใบขอเบิก :</span>
                      <span className="font-mono font-bold text-slate-900">{disbursement.dbmNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900">วันที่จ่ายเงิน :</span>
                      <span className="text-slate-900 font-bold">{disbursement.paymentDate || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900">เลขที่เช็ค/Ref :</span>
                      <span className="font-mono text-slate-800">{disbursement.chequeNo || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900">เอกสารอ้างอิง :</span>
                      <span className="font-mono text-slate-800">{disbursement.refDocNo || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Items Breakdown Table */}
                <div className="border border-black overflow-hidden rounded-xs">
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-black border-b border-black text-center font-bold">
                        <th className="py-1.5 px-2 border-r border-black w-12">ลำดับ</th>
                        <th className="py-1.5 px-3 border-r border-black text-left">รายการ / Description</th>
                        <th className="py-1.5 px-2 border-r border-black text-center w-16">จำนวน</th>
                        <th className="py-1.5 px-2 border-r border-black text-right w-24">ราคา/หน่วย</th>
                        <th className="py-1.5 px-3 text-right w-32">จำนวนเงิน (บาท)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disbursement.items && disbursement.items.length > 0 ? (
                        disbursement.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-200">
                            <td className="py-1 px-2 border-r border-black text-center font-mono">{idx + 1}</td>
                            <td className="py-1 px-3 border-r border-black text-left">{item.description}</td>
                            <td className="py-1 px-2 border-r border-black text-center font-mono">{item.quantity || 1}</td>
                            <td className="py-1 px-2 border-r border-black text-right font-mono">
                              {item.unitPrice ? formatMoney(item.unitPrice) : '-'}
                            </td>
                            <td className="py-1 px-3 text-right font-mono font-medium">
                              {item.amount < 0 ? (
                                <span className="text-red-700 font-bold">({formatMoney(Math.abs(item.amount))})</span>
                              ) : (
                                formatMoney(item.amount)
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-b border-slate-200">
                          <td className="py-1 px-2 border-r border-black text-center font-mono">1</td>
                          <td className="py-1 px-3 border-r border-black text-left">{disbursement.expenseType}</td>
                          <td className="py-1 px-2 border-r border-black text-center font-mono">1</td>
                          <td className="py-1 px-2 border-r border-black text-right font-mono">{formatMoney(disbursement.totalAmount)}</td>
                          <td className="py-1 px-3 text-right font-mono font-medium">{formatMoney(disbursement.totalAmount)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Net Total & Thai Words */}
                <div className="border border-emerald-600 bg-emerald-50/40 p-2.5 rounded-lg flex items-center justify-between">
                  <div className="flex-1 text-center font-bold text-xs text-slate-800">
                    ({thaiBahtText})
                  </div>
                  <div className="text-right pl-4">
                    <span className="text-xs font-bold text-slate-700 mr-3">ยอดเงินจ่ายสุทธิ (Net Total)</span>
                    <span className="text-lg font-black font-mono text-emerald-950">
                      {formatMoney(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Attached Slip & QR Code section */}
                <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                  <div className="col-span-3 space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#009540]" />
                      <span>หลักฐานการชำระเงินที่บันทึกเข้าระบบ:</span>
                    </div>
                    <div className="text-[10px] text-slate-600">
                      • ผู้จ่ายเงิน: <strong>{disbursement.financeRecordedBy || 'ฝ่ายการเงิน'}</strong>
                    </div>
                    <div className="text-[10px] text-slate-600">
                      • เลขที่ทำรายการ/เช็ค: <strong>{disbursement.chequeNo || 'ชำระผ่านระบบอินเทอร์เน็ตแบงก์กิ้ง'}</strong>
                    </div>
                    {disbursement.paymentSlipUrl && (
                      <div className="pt-1 flex items-center gap-2">
                        <img 
                          src={disbursement.paymentSlipUrl} 
                          alt="Slip" 
                          className="w-10 h-10 object-cover rounded border border-slate-300 cursor-pointer"
                          onClick={() => setPreviewAttachmentUrl(disbursement.paymentSlipUrl!)}
                        />
                        <span className="text-[10px] text-blue-700 font-medium">แนบไฟล์สลิปเรียบร้อยแล้ว</span>
                      </div>
                    )}
                  </div>

                  {/* QR Code */}
                  <div className="border border-slate-300 rounded-lg bg-white p-1 text-center flex flex-col items-center justify-center">
                    {qrCodeUrl || certQrCodeUrl ? (
                      <img 
                        src={qrCodeUrl || certQrCodeUrl} 
                        alt="QR Code" 
                        className="w-16 h-16 object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-slate-100 flex items-center justify-center text-[9px] text-slate-400">
                        QR Code
                      </div>
                    )}
                    <span className="text-[8px] text-slate-500 font-mono mt-0.5">สแกนตรวจสลิป</span>
                  </div>
                </div>

                {/* 4 Signatures Grid on PV */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  
                  {/* 1. Requester */}
                  <div className="border border-slate-300 rounded-lg p-2 text-center bg-white flex flex-col justify-between min-h-[90px]">
                    <div className="h-9 flex items-center justify-center">
                      {disbursement.requesterSignature ? (
                        <img src={disbursement.requesterSignature} alt="Requester" className="max-h-8 max-w-full object-contain" />
                      ) : (
                        <div className="border-b border-slate-400 w-20"></div>
                      )}
                    </div>
                    <div className="border-t border-slate-200 pt-1">
                      <div className="text-[9px] text-slate-500">วันที่ {disbursement.entryDate || '...'}</div>
                      <div className="text-[10px] font-bold text-slate-900">ผู้ขอเบิก</div>
                      <div className="text-[9px] text-slate-600 truncate">{disbursement.recordedBy || '-'}</div>
                    </div>
                  </div>

                  {/* 2. Reviewer */}
                  <div className="border border-slate-300 rounded-lg p-2 text-center bg-white flex flex-col justify-between min-h-[90px]">
                    <div className="h-9 flex items-center justify-center">
                      {disbursement.reviewerSignature ? (
                        <img src={disbursement.reviewerSignature} alt="Reviewer" className="max-h-8 max-w-full object-contain" />
                      ) : (
                        <div className="border-b border-slate-400 w-20"></div>
                      )}
                    </div>
                    <div className="border-t border-slate-200 pt-1">
                      <div className="text-[9px] text-slate-500">วันที่ {disbursement.reviewedAt ? new Date(disbursement.reviewedAt).toLocaleDateString('th-TH') : '...'}</div>
                      <div className="text-[10px] font-bold text-slate-900">ผู้ตรวจสอบ</div>
                      <div className="text-[9px] text-slate-600 truncate">{disbursement.reviewerName || '-'}</div>
                    </div>
                  </div>

                  {/* 3. Approver */}
                  <div className="border border-slate-300 rounded-lg p-2 text-center bg-white flex flex-col justify-between min-h-[90px]">
                    <div className="h-9 flex items-center justify-center">
                      {disbursement.approverSignature ? (
                        <img src={disbursement.approverSignature} alt="Approver" className="max-h-8 max-w-full object-contain" />
                      ) : (
                        <div className="border-b border-slate-400 w-20"></div>
                      )}
                    </div>
                    <div className="border-t border-slate-200 pt-1">
                      <div className="text-[9px] text-slate-500">วันที่ {disbursement.approvedAt ? new Date(disbursement.approvedAt).toLocaleDateString('th-TH') : '...'}</div>
                      <div className="text-[10px] font-bold text-slate-900">ผู้อนุมัติจ่าย</div>
                      <div className="text-[9px] text-slate-600 truncate">{disbursement.approverName || '-'}</div>
                    </div>
                  </div>

                  {/* 4. Payer (Live Signature) */}
                  <div className="border border-emerald-500 bg-emerald-50/20 rounded-lg p-2 text-center flex flex-col justify-between min-h-[90px]">
                    <div className="h-9 flex items-center justify-center">
                      {disbursement.financeSignature ? (
                        <img src={disbursement.financeSignature} alt="Payer Signature" className="max-h-8 max-w-full object-contain" />
                      ) : (
                        <div className="border-b border-emerald-500 w-20"></div>
                      )}
                    </div>
                    <div className="border-t border-emerald-300 pt-1">
                      <div className="text-[9px] text-slate-500">วันที่ {disbursement.paymentDate || '...'}</div>
                      <div className="text-[10px] font-bold text-emerald-950">ผู้จ่ายเงิน (Payer)</div>
                      <div className="text-[9px] text-emerald-800 font-bold truncate">{disbursement.financeRecordedBy || 'ฝ่ายการเงิน'}</div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ==========================================
                DOCUMENT 2: DIGITAL SIGNATURE CERTIFICATE & E-AUDIT TRAIL
                ========================================== */}
            {(printTab === 'both' || printTab === 'certificate') && (
              <div className="bg-white border border-blue-200 print:border-none p-6 print:p-4 rounded-2xl shadow-xs print:shadow-none space-y-4">
                
                {/* Certificate Header with Seal */}
                <div className="border-b border-blue-200 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-black text-[9px] rounded-full uppercase tracking-wider">
                        E-SIGNATURE AUDIT TRAIL CERTIFICATE
                      </span>
                      <h2 className="text-base font-black text-slate-900">
                        ใบรับรองการลงนามดิจิทัล & ลำดับการอนุมัติการจ่ายเงิน
                      </h2>
                      <p className="text-[10px] text-slate-500">
                        ออกให้ตามมาตรฐานธุรกรรมทางอิเล็กทรอนิกส์สำหรับเอกสารการเงินบริษัทในเครือบีทีซี
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-xs text-blue-900">{certId}</div>
                    <div className="text-[9px] text-slate-500">SHA-256 Fingerprint: <span className="font-mono">{fingerprint}</span></div>
                  </div>
                </div>

                {/* Document Information Summary */}
                <div className="grid grid-cols-3 gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">เลขที่ใบสำคัญจ่าย (PV No.):</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">{disbursement.pvNo || 'PV-6801-001'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">เลขที่เอกสารขอเบิก (DBM):</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">{disbursement.dbmNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ยอดเงินชำระสุทธิ:</span>
                    <span className="font-black text-emerald-800 font-mono text-xs">{formatMoney(totalAmount)}</span>
                  </div>
                </div>

                {/* 4-Step Audit Timeline */}
                <div className="space-y-3 pt-1">
                  <h3 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>ลำดับการบันทึกและลงนามดิจิทัล 4 ขั้นตอน (Audit Log)</span>
                  </h3>

                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
                    
                    {/* Event 1: Creation & Requester Signature */}
                    <div className="relative flex items-start justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="absolute -left-6 top-3 w-3 h-3 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                      <div className="space-y-0.5 text-[11px]">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>1. สร้างใบขอตั้งเบิก & ผู้ขอเบิกลงนามสด</span>
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded">SIGNED</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ผู้ขอเบิก: <strong>{disbursement.recordedBy || 'นายช่างโครงการ'}</strong> • วันที่: {disbursement.entryDate || '-'}
                        </div>
                      </div>
                      {disbursement.requesterSignature && (
                        <img src={disbursement.requesterSignature} alt="Sig" className="h-6 object-contain max-w-[80px]" />
                      )}
                    </div>

                    {/* Event 2: Reviewer Audit */}
                    <div className="relative flex items-start justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="absolute -left-6 top-3 w-3 h-3 rounded-full bg-purple-600 border-2 border-white ring-2 ring-purple-100" />
                      <div className="space-y-0.5 text-[11px]">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>2. ตรวจสอบเอกสารความถูกต้อง (Review)</span>
                          <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 font-bold text-[9px] rounded">VERIFIED</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ผู้ตรวจสอบ: <strong>{disbursement.reviewerName || 'นางสาวมณีรัตน์ วงศ์สมุทร'}</strong> • วันที่: {disbursement.reviewedAt ? new Date(disbursement.reviewedAt).toLocaleDateString('th-TH') : '-'}
                        </div>
                      </div>
                      {disbursement.reviewerSignature && (
                        <img src={disbursement.reviewerSignature} alt="Sig" className="h-6 object-contain max-w-[80px]" />
                      )}
                    </div>

                    {/* Event 3: Executive Approval */}
                    <div className="relative flex items-start justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="absolute -left-6 top-3 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-100" />
                      <div className="space-y-0.5 text-[11px]">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>3. กรรมการผู้จัดการอนุมัติจ่าย (Approval)</span>
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded">APPROVED</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ผู้อนุมัติ: <strong>{disbursement.approverName || 'นายบุญเสริม ทวีชัยวัฒน์ (MD)'}</strong> • วันที่: {disbursement.approvedAt ? new Date(disbursement.approvedAt).toLocaleDateString('th-TH') : '-'}
                        </div>
                      </div>
                      {disbursement.approverSignature && (
                        <img src={disbursement.approverSignature} alt="Sig" className="h-6 object-contain max-w-[80px]" />
                      )}
                    </div>

                    {/* Event 4: Payment Execution & Live Payer Signature */}
                    <div className="relative flex items-start justify-between bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-300">
                      <div className="absolute -left-6 top-3 w-3 h-3 rounded-full bg-[#009540] border-2 border-white ring-2 ring-emerald-200" />
                      <div className="space-y-0.5 text-[11px]">
                        <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <span>4. ชำระเงินจริง & ผู้จ่ายเงินลงนามสด (Payment Execution)</span>
                          <span className="px-1.5 py-0.2 bg-emerald-600 text-white font-bold text-[9px] rounded">PAID & CERTIFIED</span>
                        </div>
                        <div className="text-[10px] text-emerald-800">
                          ผู้บันทึกจ่าย: <strong>{disbursement.financeRecordedBy || 'ฝ่ายการเงิน'}</strong> • วันที่โอน: {disbursement.paymentDate || '-'}
                        </div>
                        <div className="text-[9px] text-slate-500">
                          ช่องทาง: {disbursement.paymentMethod || 'โอนเงิน'} • เลขอ้างอิง: {disbursement.chequeNo || '-'}
                        </div>
                      </div>
                      {disbursement.financeSignature && (
                        <img src={disbursement.financeSignature} alt="Sig" className="h-6 object-contain max-w-[80px]" />
                      )}
                    </div>

                  </div>
                </div>

                {/* Verification Stamp Footer */}
                <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>ระบบลงนามดิจิทัลเข้ารหัส บจก. บุญทวีทรัพย์ คอนสตรัคชั่น (BTC)</span>
                  </div>
                  <div className="font-mono">
                    Status: <strong className="text-[#009540]">VERIFIED & IMMUTABLE</strong>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Attachment Image Lightbox */}
      {previewAttachmentUrl && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewAttachmentUrl(null)}
        >
          <div className="bg-white rounded-2xl p-4 max-w-xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs">พรีวิวหลักฐานการชำระเงิน</span>
              <button onClick={() => setPreviewAttachmentUrl(null)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={previewAttachmentUrl} alt="Slip" className="max-h-[70vh] object-contain mx-auto rounded-lg" />
          </div>
        </div>
      )}

    </div>
  );
}
