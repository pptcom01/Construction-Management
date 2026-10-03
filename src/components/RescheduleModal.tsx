import { useState, FormEvent } from 'react';
import { Disbursement } from '../types';
import { X, Calendar, Clock, AlertTriangle, ArrowRight, User } from 'lucide-react';
import { formatCurrency } from '../utils/accounting';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  disbursement: Disbursement | null;
  onConfirmReschedule: (
    id: string, 
    newDueDate: string, 
    reason: string, 
    rescheduledBy: string
  ) => void;
}

export function RescheduleModal({
  isOpen,
  onClose,
  disbursement,
  onConfirmReschedule
}: RescheduleModalProps) {
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [officerName, setOfficerName] = useState<string>('ฝ่ายการเงิน / ผู้บริหาร');

  if (!isOpen || !disbursement) return null;

  const currentDue = disbursement.dueDate || disbursement.entryDate;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newDueDate) {
      alert('กรุณาเลือกกำหนดจ่ายเงินใหม่');
      return;
    }
    if (!reason.trim()) {
      alert('กรุณาระบุเหตุผลในการขอเลื่อนกำหนดจ่าย');
      return;
    }

    onConfirmReschedule(
      disbursement.id,
      newDueDate,
      reason.trim(),
      officerName.trim() || 'ฝ่ายการเงิน'
    );
    onClose();
  };

  const presetReasons = [
    'รอตรวจรับงานหน้างานงวดถัดไป',
    'รอเอกสาร/ใบกำกับภาษี-ใบเสร็จตัวจริง',
    'รอผลทดสอบวัสดุ/BOQ หน้างาน',
    'จัดสรรรอบเงินสดจ่ายประจำสัปดาห์',
    'คู่ค้าขอปรับงวดส่งมอบของ'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-600/60">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">ขอเลื่อนกำหนดจ่ายเงิน (Reschedule)</h3>
              <p className="text-[11px] text-amber-100 font-mono">
                {disbursement.dbmNo} &bull; {disbursement.payeeName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          
          {/* Summary Banner */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[11px]">ยอดเงินสุทธิ</span>
              <span className="text-sm font-bold font-mono text-[#005aa9]">
                {formatCurrency(disbursement.totalAmount)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[11px]">โครงการ</span>
              <span className="font-semibold text-slate-800 truncate max-w-[160px] block">
                {disbursement.project.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Date Comparison */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
            <div>
              <label className="text-amber-800 font-semibold block mb-1 text-[11px]">
                กำหนดจ่ายเดิม
              </label>
              <div className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-1.5 rounded border border-amber-200">
                {currentDue || 'ไม่ได้ระบุ'}
              </div>
            </div>

            <div>
              <label className="text-amber-900 font-bold block mb-1 text-[11px] flex items-center gap-1">
                <span>กำหนดจ่ายใหม่</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-amber-300 bg-white font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-slate-700 font-bold block mb-1 text-[11px] flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>เหตุผลที่ขอเลื่อนกำหนดจ่าย *</span>
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ระบุเหตุผล เช่น รอเอกสารใบแจ้งหนี้ตัวจริง หรือเลื่อนตามรอบเงินสด..."
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            
            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {presetReasons.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setReason(preset)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-[10px] transition-colors cursor-pointer border border-slate-200"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Rescheduled By */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1 text-[11px] flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>ผู้ดำเนินการเลื่อน</span>
            </label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              placeholder="ระบุชื่อหรือตำแหน่งผู้ดำเนินการ"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>บันทึกการเลื่อนจ่าย</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
