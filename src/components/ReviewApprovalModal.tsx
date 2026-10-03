import React, { useState, FormEvent } from 'react';
import { Disbursement } from '../types';
import { 
  X, CheckCircle2, XCircle, FileText, UserCheck, ShieldCheck, 
  ExternalLink, Paperclip, Calendar, Building2, Eye, PenTool
} from 'lucide-react';
import { SignatureActionModal } from './SignatureActionModal';
import { BTCLogo } from './BTCLogo';
import { numberToThaiBaht, getCompanyProfile } from '../utils/thaiBahtText';
import { getActiveUserName } from '../services/userService';

interface ReviewApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  disbursement: Disbursement | null;
  onApprove: (id: string, reviewerData: {
    role: 'reviewer' | 'approver';
    name: string;
    signature: string;
    notes: string;
    status: 'approved' | 'rejected' | 'pending';
  }) => void;
}

export function ReviewApprovalModal({
  isOpen,
  onClose,
  disbursement,
  onApprove
}: ReviewApprovalModalProps) {
  const [role, setRole] = useState<'reviewer' | 'approver'>('reviewer');
  const [officerName, setOfficerName] = useState(() => getActiveUserName());
  const [signature, setSignature] = useState('');
  const [notes, setNotes] = useState('');
  const [previewAttachmentUrl, setPreviewAttachmentUrl] = useState<string | null>(null);
  const [showSignModal, setShowSignModal] = useState<boolean>(false);

  if (!isOpen || !disbursement) return null;

  const totalAmount = disbursement.totalAmount || 0;
  const thaiBahtText = numberToThaiBaht(totalAmount);

  const handleApproveButtonClick = () => {
    if (!officerName.trim()) {
      alert('กรุณาระบุชื่อผู้ตรวจสอบ/ผู้อนุมัติ');
      return;
    }
    // Open dedicated signature action modal
    setShowSignModal(true);
  };

  const handleConfirmSignatureAndSubmit = (signedUrl: string) => {
    setSignature(signedUrl);
    onApprove(disbursement.id, {
      role,
      name: officerName.trim(),
      signature: signedUrl,
      notes: notes.trim(),
      status: 'pending' // Ready for finance transfer
    });
    setShowSignModal(false);
    onClose();
  };

  const handleSubmit = (action: 'approved' | 'rejected') => {
    if (!officerName.trim()) {
      alert('กรุณาระบุชื่อผู้ตรวจสอบ/ผู้อนุมัติ');
      return;
    }
    if (action === 'approved') {
      handleApproveButtonClick();
      return;
    }

    onApprove(disbursement.id, {
      role,
      name: officerName.trim(),
      signature,
      notes: notes.trim(),
      status: 'rejected'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Control Bar */}
        <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between shrink-0 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  แบบฟอร์มเอกสารตรวจสอบและอนุมัติใบขอเบิกเงิน (Review & Approval Sheet)
                </h3>
                <span className="px-2 py-0.5 bg-blue-400 text-blue-950 text-[10px] font-bold rounded flex items-center gap-1 font-mono">
                  {disbursement.dbmNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-normal">
                ตรวจสอบรายละเอียดรายการเบิกจ่าย, หลักฐานที่แนบ, ลายเซ็นสดผู้ขอเบิก ก่อนอนุมัติส่งฝ่ายการเงิน
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

        {/* Modal Body - Full Document Canvas (No Awkward Grey Border) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-white text-xs space-y-4 text-slate-900">
          
          {/* 1. DOCUMENT LETTERHEAD & METADATA */}
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
              <div className="sm:w-72 bg-blue-50/50 border-2 border-slate-700 rounded-lg p-2.5 shadow-xs space-y-1.5 shrink-0">
                <div className="text-center font-bold text-slate-900 border-b border-slate-300 pb-1 text-xs">
                  ใบขอเบิกเงิน (DISBURSEMENT REQUEST)
                </div>
                
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-medium">เลขที่ใบขอเบิก (DBM)</span>
                    <div className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-black text-[#005aa9] text-xs truncate">
                      {disbursement.dbmNo}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-medium">วันที่ขอเบิก</span>
                    <div className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-semibold text-slate-800 text-xs truncate">
                      {disbursement.entryDate}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-medium">ผู้ขอเบิก</span>
                    <div className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-bold text-slate-800 text-[11px] truncate">
                      {disbursement.recordedBy}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-medium">เลขที่อ้างอิง</span>
                    <div className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-slate-700 text-[11px] truncate">
                      {disbursement.refDocNo || '-'}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* 2. PROJECT & PAYEE SUMMARY */}
            <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
              <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 font-bold text-slate-800 text-xs flex items-center justify-between">
                <span>ข้อมูลโครงการและผู้รับเงิน (Project & Payee Particulars)</span>
                <span className="text-[10px] text-slate-500 font-normal">บริษัท: {disbursement.company}</span>
              </div>

              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block font-medium">โครงการก่อสร้าง (Project)</span>
                  <div className="text-sm font-black text-slate-900">{disbursement.project}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    หมวดค่าใช้จ่าย: <strong className="text-slate-800">{disbursement.expenseType}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block font-medium">สั่งจ่ายให้แก่ (Payee)</span>
                  <div className="text-sm font-black text-slate-900">{disbursement.payeeName}</div>
                  <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                    เลขบัญชีปลายทาง: {disbursement.payeeBankAccount || 'ไม่มีระบุ'}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. LINE ITEMS TABLE */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold">
                  <tr>
                    <th className="py-2 px-3 w-12 text-center">ลำดับ</th>
                    <th className="py-2 px-3">รายการขอเบิกจ่ายและรายละเอียด</th>
                    <th className="py-2 px-3 text-right w-36">จำนวนเงิน (บาท)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {disbursement.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 text-slate-800 font-medium">
                        {item.description}
                      </td>
                      <td className={`py-2 px-3 text-right font-mono font-bold ${item.amount < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                        {item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50/60 border-t-2 border-slate-300 font-bold text-slate-900">
                    <td colSpan={2} className="py-2.5 px-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-950">ยอดรวมสุทธิทั้งสิ้น (Net Total):</span>
                        <span className="text-xs text-emerald-900 font-medium">({thaiBahtText})</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-950 text-sm">
                      {totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* 4. ATTACHED PROOFS & DOCUMENTS */}
            <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
              <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 font-bold text-slate-800 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                  <span>เอกสารแนบประกอบการพิจารณา ({disbursement.attachments?.length || 0} ไฟล์)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">คลิกเพื่อเปิดดูหลักฐานขยายใหญ่</span>
              </div>

              <div className="p-3">
                {disbursement.attachments && disbursement.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {disbursement.attachments.map((att) => (
                      <div 
                        key={att.id} 
                        className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs"
                      >
                        <span className="truncate flex-1 font-medium text-slate-800">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => setPreviewAttachmentUrl(att.url)}
                          className="px-2 py-0.5 bg-white hover:bg-slate-100 text-[#005aa9] border border-slate-200 rounded text-[10px] font-bold ml-2 shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          เปิดดู
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs text-center py-2">
                    ไม่มีไฟล์แนบในระบบ
                  </div>
                )}
              </div>
            </div>

            {/* 5. OFFICIAL 4-BLOCK SIGNATURES (สอดคล้องกับเอกสาร DBM จริง) */}
            <div className="border-2 border-slate-700 rounded-lg overflow-hidden bg-white">
              <div className="bg-slate-800 text-white px-3 py-1 text-center font-bold text-xs tracking-wider">
                ผู้มีอำนาจลงนามในเอกสาร (OFFICIAL DOCUMENT SIGNATURES)
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-300 text-center">
                
                {/* 1. ผู้ขอเบิก (Requester) */}
                <div className="p-2.5 flex flex-col justify-between space-y-1.5 bg-slate-50/50">
                  <div className="font-bold text-slate-700 text-[10.5px]">1. ผู้ขอเบิก (Requester)</div>
                  
                  <div className="min-h-[55px] flex items-center justify-center border-b border-dashed border-slate-300 pb-1">
                    {disbursement.requesterSignature ? (
                      <img 
                        src={disbursement.requesterSignature} 
                        alt="Requester Signature" 
                        className="max-h-11 object-contain bg-white rounded border border-slate-200 p-0.5" 
                      />
                    ) : (
                      <div className="text-[10px] text-slate-400">(ลงนามในเอกสารแล้ว)</div>
                    )}
                  </div>

                  <div className="text-[10.5px] text-slate-700 space-y-0.5">
                    <div className="font-bold truncate">({disbursement.recordedBy})</div>
                    <div className="text-[9.5px] text-slate-500">วันที่: {disbursement.entryDate}</div>
                  </div>
                </div>

                {/* 2. ผู้ตรวจสอบ (Reviewer) */}
                <div className={`p-2.5 flex flex-col justify-between space-y-1.5 ${role === 'reviewer' ? 'bg-blue-50/40' : 'bg-slate-50/50'}`}>
                  <div className="font-bold text-slate-700 text-[10.5px]">2. ผู้ตรวจสอบ (Reviewer)</div>
                  
                  <div className="min-h-[55px] flex flex-col items-center justify-center border-b border-dashed border-slate-300 pb-1">
                    {role === 'reviewer' && signature ? (
                      <div className="space-y-0.5">
                        <img src={signature} alt="Reviewer Sign" className="max-h-10 object-contain bg-white rounded border border-slate-200 p-0.5" />
                        <button
                          type="button"
                          onClick={() => setShowSignModal(true)}
                          className="text-[9.5px] text-blue-700 hover:underline block cursor-pointer"
                        >
                          ✍️ เปลี่ยน/เซ็นใหม่
                        </button>
                      </div>
                    ) : role === 'reviewer' ? (
                      <button
                        type="button"
                        onClick={() => setShowSignModal(true)}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <PenTool className="w-3 h-3" />
                        <span>✍️ เซ็นสด</span>
                      </button>
                    ) : (
                      <div className="text-[10px] text-slate-400">(รอการตรวจสอบ)</div>
                    )}
                  </div>

                  <div className="text-[10.5px] text-slate-700 space-y-0.5">
                    <div className="font-bold truncate">
                      ({role === 'reviewer' ? officerName : '................................'})
                    </div>
                    <div className="text-[9.5px] text-slate-500">วันที่: {disbursement.entryDate}</div>
                  </div>
                </div>

                {/* 3. ผู้อนุมัติ (Approver) */}
                <div className={`p-2.5 flex flex-col justify-between space-y-1.5 ${role === 'approver' ? 'bg-emerald-50/40' : 'bg-slate-50/50'}`}>
                  <div className="font-bold text-slate-700 text-[10.5px]">3. ผู้อนุมัติ (Approver)</div>
                  
                  <div className="min-h-[55px] flex flex-col items-center justify-center border-b border-dashed border-slate-300 pb-1">
                    {role === 'approver' && signature ? (
                      <div className="space-y-0.5">
                        <img src={signature} alt="Approver Sign" className="max-h-10 object-contain bg-white rounded border border-slate-200 p-0.5" />
                        <button
                          type="button"
                          onClick={() => setShowSignModal(true)}
                          className="text-[9.5px] text-emerald-700 hover:underline block cursor-pointer"
                        >
                          ✍️ เปลี่ยน/เซ็นใหม่
                        </button>
                      </div>
                    ) : role === 'approver' ? (
                      <button
                        type="button"
                        onClick={() => setShowSignModal(true)}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <PenTool className="w-3 h-3" />
                        <span>✍️ เซ็นสด</span>
                      </button>
                    ) : (
                      <div className="text-[10px] text-slate-400">(รอการอนุมัติ)</div>
                    )}
                  </div>

                  <div className="text-[10.5px] text-slate-700 space-y-0.5">
                    <div className="font-bold truncate">
                      ({role === 'approver' ? officerName : '................................'})
                    </div>
                    <div className="text-[9.5px] text-slate-500">วันที่: {disbursement.entryDate}</div>
                  </div>
                </div>

                {/* 4. ผู้จ่ายเงิน (Finance Officer) */}
                <div className="p-2.5 flex flex-col justify-between space-y-1.5 bg-slate-50/50">
                  <div className="font-bold text-slate-700 text-[10.5px]">4. ผู้จ่ายเงิน (Finance)</div>
                  
                  <div className="min-h-[55px] flex items-center justify-center border-b border-dashed border-slate-300 pb-1">
                    <div className="text-[10px] text-slate-400">(รอฝ่ายการเงินสั่งจ่าย)</div>
                  </div>

                  <div className="text-[10.5px] text-slate-700 space-y-0.5">
                    <div className="font-bold">({disbursement.status === 'paid' ? disbursement.financeRecordedBy || 'ฝ่ายการเงิน' : 'รอจ่ายเงิน'})</div>
                    <div className="text-[9.5px] text-slate-500">วันที่: {disbursement.paidAt ? disbursement.paidAt.split(' ')[0] : '-'}</div>
                  </div>
                </div>

              </div>
            </div>

            {/* 6. APPROVAL CONTROLS & NOTES ENTRY */}
            <div className="border border-blue-200 rounded-lg p-3 bg-blue-50/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-700" />
                  <span>กำหนดตำแหน่งและบันทึกการพิจารณา (Approval Particulars)</span>
                </span>
                
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 text-xs">
                    <input
                      type="radio"
                      name="role"
                      checked={role === 'reviewer'}
                      onChange={() => setRole('reviewer')}
                      className="text-[#005aa9]"
                    />
                    <span>ผู้ตรวจสอบ (Reviewer)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 text-xs">
                    <input
                      type="radio"
                      name="role"
                      checked={role === 'approver'}
                      onChange={() => setRole('approver')}
                      className="text-[#005aa9]"
                    />
                    <span>ผู้อนุมัติ (Approver)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 text-[11px]">ชื่อ-สกุล ผู้ลงนาม *</label>
                    {officerName !== getActiveUserName() && (
                      <button
                        type="button"
                        onClick={() => setOfficerName(getActiveUserName())}
                        className="text-[10px] text-[#005aa9] hover:underline font-semibold cursor-pointer"
                      >
                        ใช้ชื่อฉัน ({getActiveUserName()})
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    list="dl-requesters"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 text-[11px] block mb-1">
                    ความเห็นเพิ่มเติม / บันทึกเงื่อนไข (Notes)
                  </label>
                  <input
                    type="text"
                    list="dl-remarks"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="เช่น ตรวจสอบบิลและใบสั่งซื้อครบถ้วน อนุมัติเบิกจ่ายได้"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

          </div>

        {/* Sticky Bottom Actions Bar */}
        <div className="shrink-0 px-6 py-3.5 bg-slate-800 border-t border-slate-700 flex items-center justify-between flex-wrap gap-3 text-white">
          <button
            type="button"
            onClick={() => handleSubmit('rejected')}
            className="px-4 py-2 bg-red-600/90 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>ตีกลับ / ไม่อนุมัติ</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 font-bold text-xs cursor-pointer transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="button"
              onClick={handleApproveButtonClick}
              className="px-5 py-2.5 bg-linear-to-r from-emerald-600 to-[#005aa9] hover:from-emerald-700 hover:to-[#004887] text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/30 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>อนุมัติและส่งต่อฝ่ายการเงิน</span>
            </button>
          </div>
        </div>

      </div>

      {/* Lightbox Preview */}
      {previewAttachmentUrl && (
        <div 
          className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewAttachmentUrl(null)}
        >
          <div className="bg-white rounded-2xl p-4 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-xs">ภาพเอกสารแนบ</span>
              <button onClick={() => setPreviewAttachmentUrl(null)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={previewAttachmentUrl} alt="Attached Proof" className="max-h-[70vh] object-contain mx-auto rounded-lg" />
          </div>
        </div>
      )}

      {/* Dedicated Signature Action Modal on Approve */}
      <SignatureActionModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        onConfirm={handleConfirmSignatureAndSubmit}
        title={role === 'reviewer' ? 'ลงนามสดผู้ตรวจสอบใบตั้งเบิก' : 'ลงนามสดผู้อนุมัติใบตั้งเบิก'}
        subtitle={`ลงนามสดด้วยตนเองเพื่อส่งต่อฝ่ายการเงินดำเนินการสั่งจ่าย`}
        signerName={officerName}
        signerRole={role === 'reviewer' ? 'ผู้ตรวจสอบ (Reviewer)' : 'ผู้อนุมัติ (Approver)'}
        docNo={disbursement.dbmNo}
        docTitle={`${disbursement.expenseType || 'ใบตั้งเบิก'} - โครงการ ${disbursement.project}`}
        amount={totalAmount}
        actionType="approve"
        confirmButtonText="ยืนยันลายมือชื่อสดและอนุมัติ"
        initialSignature={signature}
      />

    </div>
  );
}
