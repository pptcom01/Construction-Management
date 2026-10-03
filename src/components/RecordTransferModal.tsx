import { useState, useEffect, FormEvent } from 'react';
import { Disbursement } from '../types';
import { X, Save, CheckCircle2, ArrowRight, Link, Building2 } from 'lucide-react';
import QRCode from 'qrcode';
import { getActiveUserName } from '../services/userService';

interface RecordTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  disbursement: Disbursement | null;
  onSaveTransfer: (
    id: string,
    transferData: {
      payerAccount: string;
      chequeNo: string;
      paymentDate: string;
      transferAmount: number;
      fee: number;
      documentLink: string;
      financeRecordedBy: string;
      status: 'paid' | 'pending';
    }
  ) => void;
  accountsList: string[];
}

export function RecordTransferModal({
  isOpen,
  onClose,
  disbursement,
  onSaveTransfer,
  accountsList
}: RecordTransferModalProps) {
  const [payerAccount, setPayerAccount] = useState('');
  const [chequeNo, setChequeNo] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [fee, setFee] = useState<string>('0');
  const [documentLink, setDocumentLink] = useState('');
  const [financeRecordedBy, setFinanceRecordedBy] = useState(() => getActiveUserName());
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (disbursement) {
      setPayerAccount(disbursement.payerAccount || accountsList[0] || 'BBL #297-3-033893 (BTC กระแสรายวัน)');
      setChequeNo(disbursement.chequeNo || '');
      
      if (disbursement.paymentDate && disbursement.paymentDate !== '-') {
        setPaymentDate(disbursement.paymentDate);
      } else {
        const today = new Date();
        const thaiYear = today.getFullYear() + 543;
        setPaymentDate(`${today.getDate()}/${today.getMonth() + 1}/${thaiYear}`);
      }

      setTransferAmount(
        disbursement.transferAmount && disbursement.transferAmount > 0
          ? disbursement.transferAmount.toString()
          : disbursement.totalAmount.toString()
      );
      setFee(disbursement.fee ? disbursement.fee.toString() : '0');
      setDocumentLink(disbursement.documentLink || '');
      setFinanceRecordedBy(disbursement.financeRecordedBy || getActiveUserName());
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

  if (!isOpen || !disbursement) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const finalAmount = parseFloat(transferAmount) || disbursement.totalAmount;
    const finalFee = parseFloat(fee) || 0;

    onSaveTransfer(disbursement.id, {
      payerAccount: payerAccount.trim(),
      chequeNo: chequeNo.trim(),
      paymentDate: paymentDate.trim(),
      transferAmount: finalAmount,
      fee: finalFee,
      documentLink: documentLink.trim(),
      financeRecordedBy: financeRecordedBy.trim(),
      status: 'paid'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-linear-to-r from-blue-50 via-white to-emerald-50 border-b border-blue-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#005aa9] flex items-center justify-center font-black shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>บันทึกการโอนเงิน (ส่วนงานที่ 2: ฝ่ายการเงิน)</span>
                <span className="px-2 py-0.5 bg-blue-100 text-[#005aa9] text-[11px] font-mono font-bold rounded-md">
                  {disbursement.dbmNo}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                บันทึกยอดโอนจริง, บัญชีที่ตัดจ่าย, เลขที่เช็ค/สลิป และแนบ QR Code เอกสารโอน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* Summary Box of Voucher to pay */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold">ผู้รับเงิน (Payee):</span>
              <span className="font-bold text-slate-900 text-sm">{disbursement.payeeName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">บัญชีปลายทาง:</span>
              <span className="font-mono text-slate-700">{disbursement.payeeBankAccount || '-'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">โครงการ:</span>
              <span className="font-medium text-slate-800 truncate max-w-[320px]">{disbursement.project}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-700">ยอดที่ขอเบิกตามใบตั้งเบิก:</span>
              <span className="text-base font-black font-mono text-[#005aa9]">
                {disbursement.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Finance input fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">บัญชีธนาคารผู้สั่งจ่าย *</label>
              <select
                value={payerAccount}
                onChange={(e) => setPayerAccount(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9] font-mono text-xs"
              >
                {accountsList.map((acc, i) => (
                  <option key={i} value={acc}>{acc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">เลขที่เช็ค / เลขสลิป / Ref</label>
              <input
                type="text"
                value={chequeNo}
                onChange={(e) => setChequeNo(e.target.value)}
                placeholder="เช่น 01620875-1 หรือ เลขสลิป K-Cyber"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">วันที่โอนเงินจริง *</label>
              <input
                type="text"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                placeholder="เช่น 29/08/2569"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">ยอดเงินโอนจริง (บาท) *</label>
              <input
                type="number"
                step="any"
                required
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-[#009540] font-mono font-black text-right text-emerald-900 text-sm"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">ค่าธรรมเนียมโอน (บาท)</label>
              <input
                type="number"
                step="any"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9] font-mono text-right"
              />
            </div>
          </div>

          {/* Drive Link & QR Code preview */}
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-[#005aa9]" />
                <span>ลิงก์เอกสารการโอนเงิน / สลิปโอน (Google Drive URL)</span>
              </label>
              <input
                type="url"
                value={documentLink}
                onChange={(e) => setDocumentLink(e.target.value)}
                placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-mono"
              />
            </div>

            {qrCodeUrl && (
              <div className="flex items-center gap-4 p-2 bg-white rounded-lg border border-blue-100">
                <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 rounded border border-slate-200 p-0.5" />
                <div className="text-[11px] text-slate-600">
                  <span className="font-bold text-emerald-700 block">📱 สร้าง QR Code สำเร็จ</span>
                  QR Code นี้จะปรากฏบนใบสำคัญจ่ายท้ายเอกสารทันที เพื่อให้ผู้บริหารหรือผู้ตรวจสอบสแกนดูสลิปจากมือถือได้
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">ผู้บันทึกรายการฝ่ายการเงิน</label>
              {financeRecordedBy !== getActiveUserName() && (
                <button
                  type="button"
                  onClick={() => setFinanceRecordedBy(getActiveUserName())}
                  className="text-[11px] text-[#005aa9] hover:underline font-semibold cursor-pointer"
                >
                  ใช้ชื่อฉัน ({getActiveUserName()})
                </button>
              )}
            </div>
            <input
              type="text"
              value={financeRecordedBy}
              onChange={(e) => setFinanceRecordedBy(e.target.value)}
              placeholder="เช่น น.ส.กมลทิพย์ กรมทอง"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
            />
          </div>
          </div>

          {/* Footer Buttons (Sticky Bottom) */}
          <div className="shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold cursor-pointer transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#005aa9] hover:bg-[#004887] text-white font-bold shadow-md shadow-blue-700/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.01]"
              title="บันทึกจ่ายเงินและส่งต่อเข้าสมุดบัญชีแยกประเภท (GL) อัตโนมัติ"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกการโอนเงิน & ส่งเข้าสมุดบัญชี (Auto GL)</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
