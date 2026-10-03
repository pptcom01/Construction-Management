import { useState, useEffect } from 'react';
import { Disbursement } from '../types';
import { 
  X, Printer, ExternalLink, Building2, Calendar, FileText, 
  CheckCircle2, Clock, AlertCircle, QrCode, ArrowDownRight, Scissors,
  ShieldCheck, UserCheck, Eye, Paperclip
} from 'lucide-react';
import QRCode from 'qrcode';
import { numberToThaiBaht, getCompanyProfile } from '../utils/thaiBahtText';

interface DisbursementDetailModalProps {
  disbursement: Disbursement | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (disbursement: Disbursement) => void;
  onOpenTransferModal?: (disbursement: Disbursement) => void;
  onOpenReviewModal?: (disbursement: Disbursement) => void;
}

export function DisbursementDetailModal({
  disbursement,
  isOpen,
  onClose,
  onEdit,
  onOpenTransferModal,
  onOpenReviewModal
}: DisbursementDetailModalProps) {
  const isPaid = disbursement?.status === 'paid';
  // Default to phase 1 (Disbursement Request Voucher) so it is never mixed up
  const [printMode, setPrintMode] = useState<'phase1' | 'phase2' | 'both'>('phase1');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [previewAttachmentUrl, setPreviewAttachmentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (disbursement?.documentLink && disbursement.documentLink.trim().startsWith('http')) {
      QRCode.toDataURL(disbursement.documentLink.trim(), { width: 140, margin: 1 })
        .then(url => setQrCodeUrl(url))
        .catch(() => setQrCodeUrl(''));
    } else {
      setQrCodeUrl('');
    }
  }, [disbursement]);

  // Reset to phase1 whenever a new disbursement is opened
  useEffect(() => {
    if (disbursement) {
      setPrintMode('phase1');
    }
  }, [disbursement?.id]);

  if (!isOpen || !disbursement) return null;

  const companyProfile = getCompanyProfile(disbursement.company);
  const totalAmount = disbursement.totalAmount || 0;
  const thaiBahtText = numberToThaiBaht(totalAmount);

  const formatMoney = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
    return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePrint = (mode: 'phase1' | 'phase2' | 'both') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden print:p-0 print:bg-white print:static print:z-auto print:overflow-visible">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:border-none print:shadow-none print:max-w-none print:max-h-none print:rounded-none print:overflow-visible">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="print:hidden bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#009540] flex items-center justify-center font-black shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 font-mono">{disbursement.dbmNo}</h3>
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-[#009540] rounded-full font-bold text-[10px]">
                    <CheckCircle2 className="w-3 h-3" />
                    โอนเงินแล้ว
                  </span>
                ) : disbursement.status === 'pending_review' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold text-[10px]">
                    <Clock className="w-3 h-3 text-amber-700" />
                    รอตรวจ/อนุมัติ
                  </span>
                ) : disbursement.status === 'rejected' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-bold text-[10px]">
                    <AlertCircle className="w-3 h-3" />
                    ไม่อนุมัติ
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px]">
                    <Clock className="w-3 h-3" />
                    อนุมัติแล้ว (รอโอน)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-xs">
                {disbursement.project} {disbursement.refDocNo ? `• อ้างอิง: ${disbursement.refDocNo}` : ''}
              </p>
            </div>
          </div>

          {/* 3 Main Print Buttons & Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Button 1: Print Phase 1 (Voucher) */}
            <button
              type="button"
              onClick={() => handlePrint('phase1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
                printMode === 'phase1'
                  ? 'bg-blue-600 text-white shadow-blue-200'
                  : 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-200'
              }`}
              title="พิมพ์เฉพาะใบตั้งเบิก (ครึ่งบนของ A4) เพื่อเสนอตรวจและอนุมัติ"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">พิมพ์รอบ 1: ใบตั้งเบิก</span>
            </button>

            {/* Button 2: Print Phase 2 (Payment Voucher) */}
            <button
              type="button"
              onClick={() => handlePrint('phase2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
                printMode === 'phase2'
                  ? 'bg-amber-600 text-white shadow-amber-200'
                  : 'bg-white hover:bg-amber-50 text-amber-800 border border-amber-200'
              }`}
              title="ใส่กระดาษแผ่นเดิมจากรอบที่ 1 แล้วพิมพ์เฉพาะบันทึกจ่ายเงินต่อลงครึ่งล่าง"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">พิมพ์รอบ 2: บันทึกจ่ายเงิน</span>
            </button>

            {/* Button 3: Print Both (Single Pass) */}
            <button
              type="button"
              onClick={() => handlePrint('both')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
                printMode === 'both'
                  ? 'bg-[#009540] text-white shadow-emerald-200'
                  : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
              title="พิมพ์ทั้ง 2 ส่วนพร้อมกันในหน้าเดียว A4"
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">พิมพ์รวมรอบเดียว</span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1"></div>

            {disbursement.status === 'pending_review' && onOpenReviewModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReviewModal(disbursement);
                }}
                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ตรวจ/อนุมัติ</span>
              </button>
            )}

            {disbursement.status !== 'paid' && onOpenTransferModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTransferModal(disbursement);
                }}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>บันทึกโอน</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onEdit(disbursement);
              }}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-bold text-xs transition-colors cursor-pointer"
            >
              แก้ไข
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            EXACT A4 DOCUMENT CONTAINER (2/3 VOUCHER + 1/3 TRANSFER SECTION)
            ========================================================================= */}
        <div 
          id="official-a4-disbursement"
          className={`p-4 sm:p-8 flex-1 overflow-y-auto print:max-h-none print:overflow-visible print:p-0 bg-slate-100/70 text-black font-['Sarabun',sans-serif] ${
            printMode === 'phase1' ? 'print-phase1' : printMode === 'phase2' ? 'print-phase2' : 'print-both'
          }`}
        >
          <div className="max-w-[210mm] mx-auto border border-slate-300 print:border-none p-6 print:p-4 bg-white space-y-4 shadow-sm min-h-[297mm]">
            
            {/* Phase 2 Top Spacer (Reserves top 160mm on A4 for 2nd pass) */}
            {printMode === 'phase2' && (
              <div 
                className="phase2-spacer w-full h-[160mm] border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl flex flex-col items-center justify-center p-6 text-center text-blue-900 print:border-none print:bg-transparent print:p-0 print:m-0"
                style={{ minHeight: '160mm', height: '160mm' }}
              >
                <div className="print:hidden flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm text-blue-950">
                    พื้นที่ครึ่งบน (เว้นว่างไว้สำหรับใบตั้งเบิกเดิมที่มีลายเซ็นอนุมัติแล้ว)
                  </div>
                  <p className="text-xs text-blue-800 max-w-md">
                    กรุณานำกระดาษ A4 แผ่นเดิมที่พิมพ์ <strong>"ใบตั้งเบิกเงิน"</strong> ในรอบแรก ใส่กลับเข้าถาดเครื่องพิมพ์ เพื่อพิมพ์ส่วน <strong>"บันทึกจ่ายเงิน"</strong> ต่อลงครึ่งล่างในเอกสารใบเดียวกัน
                  </p>
                </div>
              </div>
            )}

            {/* ==========================================
                ส่วนที่ 1: ใบตั้งเบิก (2/3 ของหน้า A4)
                ========================================== */}
            {(printMode === 'phase1' || printMode === 'both') && (
            <div className="voucher-section space-y-3 relative">
              
              {/* PAID Stamp if paid */}
              {disbursement.status === 'paid' && (
                <div className="absolute top-0 right-32 z-10 pointer-events-none select-none rotate-[-12deg] opacity-90">
                  <div className="border-3 border-red-600 rounded-xl px-3 py-1 text-center bg-red-50/20 backdrop-blur-2xs">
                    <div className="text-xl font-black font-mono tracking-widest text-red-600 uppercase">
                      ★ PAID ★
                    </div>
                    <div className="text-[8px] font-bold text-red-700 uppercase">
                      ชำระเงินแล้ว {disbursement.paymentDate || ''}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Header with Company details */}
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
                <div className="text-right shrink-0">
                  <h2 className="text-xl font-black text-black tracking-tight whitespace-nowrap">ใบตั้งเบิก / ขออนุมัติจ่าย</h2>
                  <span className="text-[11px] font-mono text-slate-700 whitespace-nowrap">PAYMENT VOUCHER</span>
                  {disbursement.pvNo && (
                    <div className="text-xs font-mono font-black text-blue-800 mt-0.5 whitespace-nowrap">
                      PV: {disbursement.pvNo}
                    </div>
                  )}
                </div>
              </div>

              {/* Info Grid (Left & Right Column) */}
              <div className="grid grid-cols-3 gap-4 text-[11px] py-1 border-b border-slate-200">
                {/* Left Column (2 Cols wide) */}
                <div className="col-span-2 space-y-1">
                  <div className="flex">
                    <span className="font-bold text-slate-900 w-28">โครงการ :</span>
                    <span className="text-slate-800 font-medium flex-1">{disbursement.project}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-slate-900 w-28">ประเภทรายจ่าย :</span>
                    <span className="text-slate-800 flex-1">{disbursement.expenseType}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-slate-900 w-28">ประเภทงาน (BOQ) :</span>
                    <span className="text-slate-800 flex-1">{disbursement.boqType || disbursement.expenseType || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-slate-900 w-28">ผู้รับเงิน :</span>
                    <span className="text-slate-900 font-bold flex-1">{disbursement.payeeName}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-slate-900 w-28">บัญชีธนาคาร :</span>
                    <span className="font-mono text-slate-800 flex-1">{disbursement.payeeBankAccount || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-slate-900 w-28">รูปแบบการจ่าย :</span>
                    <span className="text-slate-800 flex-1">{disbursement.paymentMethod || 'โอนเงิน'}</span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">เลขที่เอกสาร :</span>
                    <span className="font-mono font-bold text-slate-900">{disbursement.dbmNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">วันที่เอกสาร :</span>
                    <span className="text-slate-800">{disbursement.entryDate || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">เอกสารอ้างอิง :</span>
                    <span className="font-mono text-slate-800">{disbursement.refDocNo || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">วันครบกำหนด :</span>
                    <span className={`text-slate-800 ${disbursement.originalDueDate ? 'font-bold text-amber-700' : ''}`}>
                      {disbursement.dueDate || '-'}
                    </span>
                  </div>
                  {disbursement.originalDueDate && (
                    <div className="pt-1 border-t border-amber-200 bg-amber-50/60 p-1.5 rounded text-[10px] space-y-0.5">
                      <div className="flex justify-between text-amber-900 font-semibold">
                        <span>กำหนดเดิม:</span>
                        <span className="line-through text-slate-500 font-mono">{disbursement.originalDueDate}</span>
                      </div>
                      <div className="text-amber-800 text-[10px]">
                        <span className="font-bold">เหตุผลเลื่อน: </span>
                        <span>{disbursement.rescheduleReason || 'ตามรอบเงินสด'}</span>
                      </div>
                      {disbursement.rescheduledBy && (
                        <div className="text-slate-500 text-[9px]">
                          โดย: {disbursement.rescheduledBy} ({disbursement.rescheduledAt ? disbursement.rescheduledAt.slice(0, 10) : ''})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-black overflow-hidden rounded-xs">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-white text-black border-b border-black text-center font-bold">
                      <th className="py-1 px-2 border-r border-black w-12">ลำดับ</th>
                      <th className="py-1 px-3 border-r border-black text-left">รายการ / Description</th>
                      <th className="py-1 px-2 border-r border-black text-center w-16">จำนวน</th>
                      <th className="py-1 px-2 border-r border-black text-right w-24">ราคา/หน่วย</th>
                      <th className="py-1 px-3 text-right w-32">จำนวนเงิน (บาท)</th>
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
                              <span className="text-red-700">({formatMoney(Math.abs(item.amount))})</span>
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

              {/* Total Amount & Thai Words */}
              <div className="border border-emerald-600 bg-emerald-50/40 p-2.5 rounded-lg flex items-center justify-between">
                <div className="flex-1 text-center font-bold text-xs text-slate-800">
                  ({thaiBahtText})
                </div>
                <div className="text-right pl-4">
                  <span className="text-xs font-bold text-slate-700 mr-3">รวมยอดสุทธิขอเบิก</span>
                  <span className="text-base font-black font-mono text-slate-950">
                    {formatMoney(disbursement.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Attached Proofs list if any */}
              {disbursement.attachments && disbursement.attachments.length > 0 && (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] space-y-1">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Paperclip className="w-3 h-3 text-[#005aa9]" />
                    เอกสารหลักฐานแนบ ({disbursement.attachments.length} รายการ):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {disbursement.attachments.map((att) => (
                      <button
                        key={att.id}
                        type="button"
                        onClick={() => setPreviewAttachmentUrl(att.url)}
                        className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-2.5 h-2.5" />
                        <span>{att.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {disbursement.remarks && (
                <div className="p-2 bg-amber-50/50 border-l-4 border-amber-400 rounded text-[11px] text-slate-800">
                  <strong>หมายเหตุ :</strong> {disbursement.remarks}
                </div>
              )}

              {/* 4 Signatures Grid with Live E-Signatures */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                
                {/* 1. ผู้ขอเบิก (Requester Live Signature) */}
                <div className="border border-slate-300 rounded-lg p-2 text-center bg-white flex flex-col justify-between min-h-[95px]">
                  <div className="h-10 flex items-center justify-center">
                    {disbursement.requesterSignature ? (
                      <img 
                        src={disbursement.requesterSignature} 
                        alt="Requester Signature" 
                        className="max-h-9 max-w-full object-contain" 
                      />
                    ) : (
                      <div className="border-b border-slate-400 w-24"></div>
                    )}
                  </div>
                  <div className="border-t border-slate-200 pt-1">
                    <div className="text-[9px] text-slate-500">วันที่ {disbursement.entryDate || '...'}</div>
                    <div className="text-[10px] font-bold text-slate-900">ผู้ขอเบิก (Requester)</div>
                    <div className="text-[9px] text-slate-600 truncate">{disbursement.recordedBy || '-'}</div>
                  </div>
                </div>

                {/* 2. ผู้ตรวจสอบ (Reviewer) */}
                <div className="border border-slate-300 rounded-lg p-2 text-center bg-white flex flex-col justify-between min-h-[95px]">
                  <div className="h-10 flex items-center justify-center">
                    {disbursement.reviewerSignature ? (
                      <img 
                        src={disbursement.reviewerSignature} 
                        alt="Reviewer Signature" 
                        className="max-h-9 max-w-full object-contain" 
                      />
                    ) : (
                      <div className="border-b border-slate-400 w-24"></div>
                    )}
                  </div>
                  <div className="border-t border-slate-200 pt-1">
                    <div className="text-[9px] text-slate-500">
                      วันที่ {disbursement.reviewedAt ? new Date(disbursement.reviewedAt).toLocaleDateString('th-TH') : '...'}
                    </div>
                    <div className="text-[10px] font-bold text-slate-900">ผู้ตรวจสอบ (Reviewer)</div>
                    <div className="text-[9px] text-slate-600 truncate">{disbursement.reviewerName || '........................'}</div>
                  </div>
                </div>

                {/* 3. ผู้อนุมัติ (Approver) */}
                <div className="border border-slate-300 rounded-lg p-2 text-center bg-white flex flex-col justify-between min-h-[95px]">
                  <div className="h-10 flex items-center justify-center">
                    {disbursement.approverSignature ? (
                      <img 
                        src={disbursement.approverSignature} 
                        alt="Approver Signature" 
                        className="max-h-9 max-w-full object-contain" 
                      />
                    ) : (
                      <div className="border-b border-slate-400 w-24"></div>
                    )}
                  </div>
                  <div className="border-t border-slate-200 pt-1">
                    <div className="text-[9px] text-slate-500">
                      วันที่ {disbursement.approvedAt ? new Date(disbursement.approvedAt).toLocaleDateString('th-TH') : '...'}
                    </div>
                    <div className="text-[10px] font-bold text-slate-900">ผู้อนุมัติ (Approver)</div>
                    <div className="text-[9px] text-slate-600 truncate">{disbursement.approverName || '........................'}</div>
                  </div>
                </div>

                {/* 4. ผู้รับเงิน (Payee) */}
                <div className="border border-slate-300 rounded-lg p-2 text-center bg-white flex flex-col justify-between min-h-[95px]">
                  <div className="h-10 flex items-center justify-center">
                    <div className="border-b border-slate-400 w-24"></div>
                  </div>
                  <div className="border-t border-slate-200 pt-1">
                    <div className="text-[9px] text-slate-500">วันที่ ....................</div>
                    <div className="text-[10px] font-bold text-slate-900">ผู้รับเงิน (Payee)</div>
                    <div className="text-[9px] text-slate-600 truncate">{disbursement.payeeName}</div>
                  </div>
                </div>

              </div>
            </div>
            )}

            {/* Phase 1 Lower Guide (Screen only, completely blank in print) */}
            {printMode === 'phase1' && (
              <div className="my-6 border-2 border-dashed border-emerald-300 bg-emerald-50/60 rounded-xl p-6 text-center print:hidden">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm text-emerald-950">
                    พื้นที่ครึ่งล่างเว้นว่างไว้สำหรับรอบที่ 2 (บันทึกจ่ายเงิน)
                  </div>
                  <p className="text-xs text-slate-600 max-w-md">
                    ระบบจะพิมพ์เฉพาะ <strong>"ใบตั้งเบิกเงิน"</strong> บนครึ่งบนของกระดาษ A4 เพื่อนำไปเสนอตรวจและอนุมัติ <br />
                    หลังจากบันทึกจ่ายเงินแล้ว ให้นำกระดาษแผ่นนี้ใส่กลับเข้าเครื่องพิมพ์ แล้วเลือก <strong>"พิมพ์รอบ 2: บันทึกจ่ายเงิน"</strong> เพื่อพิมพ์ต่อในกระดาษใบเดียวกัน
                  </p>
                </div>
              </div>
            )}

            {/* ==========================================
                เส้นประแบ่งหน้า (Section Divider ✂️)
                (แสดงเมื่อเลือก 'both' หรือ 'phase2')
                ========================================== */}
            {(printMode === 'both' || printMode === 'phase2') && (
              <div className="section-divider relative my-3 border-t-2 border-dashed border-slate-300 flex items-center justify-center">
                <span className="absolute bg-white px-3 text-slate-400 text-xs flex items-center gap-1 font-mono">
                  <Scissors className="w-3.5 h-3.5" /> ตัดตามรอยประ
                </span>
              </div>
            )}

            {/* ==========================================
                ส่วนที่ 2: บันทึกการโอน (1/3 ของหน้า A4)
                (แสดงเมื่อเลือก 'phase2' หรือ 'both')
                ========================================== */}
            {(printMode === 'phase2' || printMode === 'both') && (
              <div className="transfer-section pt-1">
                <div className="border-2 border-emerald-600 rounded-xl p-3 bg-white">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200 mb-2">
                    <h3 className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>ส่วนบันทึกรายการฝ่ายการเงิน (Finance Payment Record / PV)</span>
                    </h3>
                    {disbursement.status === 'paid' ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        โอนเงินแล้ว (PAID)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        รอการบันทึกโอนเงิน
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-4 items-start">
                    
                    {/* Finance Details Table (3 cols) */}
                    <div className="col-span-3 space-y-2">
                      <table className="w-full text-[11px] border border-emerald-500 text-center">
                        <thead>
                          <tr className="bg-emerald-50 text-emerald-950 font-bold border-b border-emerald-500">
                            <th className="p-1.5 border-r border-emerald-500 w-1/4">เลขที่บัญชีจ่าย</th>
                            <th className="p-1.5 border-r border-emerald-500 w-1/5">เลขที่เช็ค/Ref</th>
                            <th className="p-1.5 border-r border-emerald-500 w-1/5">วันที่โอน</th>
                            <th className="p-1.5 border-r border-emerald-500 w-1/5">จำนวนเงินโอน</th>
                            <th className="p-1.5 w-1/6">ค่าธรรมเนียม</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 border-r border-emerald-500 font-mono text-[10px]">
                              {disbursement.payerAccount || '-'}
                            </td>
                            <td className="p-2 border-r border-emerald-500 font-mono font-bold">
                              {disbursement.chequeNo || '-'}
                            </td>
                            <td className="p-2 border-r border-emerald-500">
                              {disbursement.paymentDate || '-'}
                            </td>
                            <td className="p-2 border-r border-emerald-500 font-mono font-bold text-emerald-900">
                              {formatMoney(disbursement.transferAmount || (disbursement.status === 'paid' ? disbursement.totalAmount : 0))}
                            </td>
                            <td className="p-2 font-mono">
                              {formatMoney(disbursement.fee || 0)}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Google Drive Link */}
                      <div className="text-[11px] text-slate-700 flex items-center gap-1.5 pt-1">
                        <strong className="text-slate-900">ลิงก์ใบโอน / สลิป:</strong>
                        {disbursement.documentLink ? (
                          <a
                            href={disbursement.documentLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 truncate max-w-[340px]"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate">{disbursement.documentLink}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">ไม่ได้ระบุลิงก์เอกสาร</span>
                        )}
                      </div>

                      {/* Finance Signature */}
                      <div className="pt-2 text-center w-52 mx-auto">
                        <div className="border-b border-slate-700 h-6 mb-1"></div>
                        <div className="text-[10px] text-slate-500">วันที่ {disbursement.paymentDate || '...'}</div>
                        <div className="text-[11px] font-bold text-slate-900">
                          {disbursement.financeRecordedBy || 'ฝ่ายการเงิน'}
                        </div>
                      </div>
                    </div>

                    {/* QR Code Column (1 col) */}
                    <div className="border border-dashed border-emerald-300 rounded-xl p-2.5 text-center bg-emerald-50/30 flex flex-col items-center justify-center">
                      <div className="text-[10px] font-bold text-emerald-800 mb-1 flex items-center gap-1">
                        <QrCode className="w-3 h-3" />
                        <span>QR Code สลิปโอน</span>
                      </div>
                      {qrCodeUrl ? (
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className="w-24 h-24 border border-slate-300 bg-white p-1 rounded shadow-xs"
                        />
                      ) : (
                        <div className="w-24 h-24 border border-dashed border-slate-300 bg-white/60 rounded flex items-center justify-center text-[10px] text-slate-400 text-center p-2">
                          ไม่มี QR Code (ยังไม่แนบลิงก์)
                        </div>
                      )}
                      <div className="text-[9px] text-slate-500 mt-1 leading-tight">
                        สแกนเพื่อเปิดดูสลิปโอนเงินจริง
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Lightbox for attached proof preview */}
      {previewAttachmentUrl && (
        <div 
          className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewAttachmentUrl(null)}
        >
          <div className="bg-white rounded-2xl p-4 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-xs">ภาพเอกสารหลักฐาน</span>
              <button onClick={() => setPreviewAttachmentUrl(null)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={previewAttachmentUrl} alt="Proof" className="max-h-[70vh] object-contain mx-auto rounded-lg" />
          </div>
        </div>
      )}

    </div>
  );
}
