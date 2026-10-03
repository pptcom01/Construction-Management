/**
 * src/components/documents/DBMTemplate.tsx
 * เอกสารขอเบิกและบันทึกจ่าย (DBM - Disbursement & Payment Voucher Form)
 * ออกแบบตามโครงสร้างต้นฉบับ HTML 100%
 * ประกอบด้วย:
 * 1. ส่วนบน: ใบตั้งเบิกเงิน (Reimbursement Form)
 * 2. เส้นประคั่น: ตัดตามรอยปรุ (Tear Here)
 * 3. ส่วนล่าง: ใบบันทึกจ่าย (Payment Record)
 */

import React, { useState } from 'react';
import { CompanyInfo, DEFAULT_SAMPLE_COMPANY } from './types';
import { Disbursement } from '../../types';
import { numberToThaiBaht } from '../../utils/thaiBahtText';
import { Printer, Scissors, FileText, CheckCircle2, Wallet } from 'lucide-react';

export interface DBMItem {
  index?: number;
  description: string;
  amount: number;
}

export type DBMPrintMode = 'both' | 'phase1' | 'phase2';

export interface DBMTemplateProps {
  disbursement?: Disbursement;
  company?: CompanyInfo;
  docNo?: string;
  docDate?: string;
  refDocNo?: string;
  dueDate?: string;
  projectName?: string;
  expenseType?: string;
  payeeName?: string;
  payeeBankAccount?: string;
  paymentMethod?: string;
  items?: DBMItem[];
  totalAmount?: number;
  bahtText?: string;
  remarks?: string;
  // Signatures
  recordedBy?: string;
  recordedDate?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  isApproved?: boolean;
  payeeSignName?: string;
  payeeSignDate?: string;
  requesterSignature?: string;
  reviewerSignature?: string;
  approverSignature?: string;
  // Payment record section
  payerAccount?: string;
  chequeNo?: string;
  paymentDate?: string;
  transferAmount?: number;
  transferFee?: number;
  slipUrl?: string;
  financeOfficer?: string;
  financeDate?: string;
  verifyQrCode?: string;
  slipQrCode?: string;
  // Display mode & Print mode
  hidePaymentRecord?: boolean;
  printMode?: DBMPrintMode;
  onPrintModeChange?: (mode: DBMPrintMode) => void;
  showControlBar?: boolean;
}

export const DBM_SAMPLE_VERIFY_QR = "data:image/png;base64,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";

export const DBM_SAMPLE_SLIP_QR = "data:image/png;base64,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";

export function DBMTemplate({
  disbursement,
  company = {
    name: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
    taxId: '0315559001144',
    address: '31/2 ถนนอินจันทร์ณรงค์  ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000',
    phone: '044-611134',
    email: 'brtc2024@gmail.com',
    logo: 'https://img2.pic.in.th/pic/Screenshot-2025-03-03-132721e6cc77cbcea28f01.png'
  },
  docNo = 'DBM26070001',
  docDate = '15 ส.ค. 2569',
  refDocNo = 'INV-2026/8942',
  dueDate = '20 ส.ค. 2569',
  projectName = 'โครงการก่อสร้างทางหลวงชนบท สาย บร.3012',
  expenseType = 'ค่าวัสดุก่อสร้างและอุปกรณ์',
  payeeName = 'หจก. บุรีรัมย์คอนกรีตและวัสดุภัณฑ์',
  payeeBankAccount = '045-2-34981-0',
  paymentMethod = 'โอนเงินผ่านธนาคาร',
  items = [
    { index: 1, description: 'ปูนซีเมนต์ปอร์ตแลนด์ Type 1 ตราช้าง (ถุง 50 กก.) (150 x 145.00)', amount: 21750.00 },
    { index: 2, description: 'เหล็กข้ออ้อย DB16 SD40T มอก. ความยาว 10 ม. (80 x 380.00)', amount: 30400.00 },
    { index: 3, description: 'ลวดผูกเหล็กเบอร์ 18 (ม้วนละ 3 กก.) (15 x 180.00)', amount: 2700.00 }
  ],
  totalAmount = 58141.00,
  bahtText = '( ห้าหมื่นแปดพันหนึ่งร้อยสี่สิบเอ็ดบาทถ้วน )',
  remarks = 'สั่งซื้อสำหรับงานเทฐานราก ตอม่อ สะพานข้ามคลอง ช่วง กม. 14+250',
  recordedBy = 'สมชาย ใจกล้า',
  recordedDate = '15 ส.ค. 2569',
  reviewedBy = 'วิชัย มั่นคง',
  reviewedDate = '16 ส.ค. 2569',
  approvedBy = 'นริศรา ภักดี',
  approvedDate = '16 ส.ค. 2569',
  isApproved = true,
  payeeSignName = 'หจก. บุรีรัมย์คอนกรีตและวัสดุภัณฑ์',
  payeeSignDate = '..............',
  payerAccount = 'ธนาคารกสิกรไทย (KBANK)',
  chequeNo = '-',
  paymentDate = '16 ส.ค. 2569',
  transferAmount = 58141.00,
  transferFee = 0.00,
  slipUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
  financeOfficer = 'สุพรรณี เงินงาม (ฝ่ายการเงิน)',
  financeDate = '16 ส.ค. 2569',
  verifyQrCode = DBM_SAMPLE_VERIFY_QR,
  slipQrCode = DBM_SAMPLE_SLIP_QR,
  hidePaymentRecord = false,
  printMode,
  onPrintModeChange,
  showControlBar = true,
  requesterSignature,
  reviewerSignature,
  approverSignature
}: DBMTemplateProps) {

  // Auto-map from Disbursement model when provided
  const finalDocNo = disbursement?.dbmNo || docNo;
  const finalDocDate = disbursement?.entryDate || docDate;
  const finalRefDocNo = disbursement?.refDocNo || refDocNo;
  const finalDueDate = disbursement?.dueDate || dueDate;
  const finalProjectName = disbursement?.project || projectName;
  const finalExpenseType = disbursement?.expenseType || expenseType;
  const finalPayeeName = disbursement?.payeeName || payeeName;
  const finalPayeeBankAccount = disbursement?.payeeBankAccount || payeeBankAccount;
  const finalPaymentMethod = disbursement?.paymentMethod || paymentMethod;
  const finalItems: DBMItem[] = disbursement?.items && disbursement.items.length > 0
    ? disbursement.items.map((it, idx) => ({
        index: idx + 1,
        description: it.quantity > 1 || it.unitPrice ? `${it.description} (${it.quantity} x ${(it.unitPrice || 0).toLocaleString()})` : it.description,
        amount: it.amount
      }))
    : items;
  const finalTotalAmount = disbursement?.totalAmount !== undefined ? disbursement.totalAmount : totalAmount;
  const finalBahtText = disbursement?.totalAmount !== undefined ? `( ${numberToThaiBaht(disbursement.totalAmount)} )` : bahtText;
  const finalRemarks = disbursement?.remarks || remarks;
  const finalRecordedBy = disbursement?.recordedBy || recordedBy;
  const finalRecordedDate = disbursement?.entryDate || recordedDate;
  const finalReviewedBy = disbursement?.reviewerName || reviewedBy;
  const finalReviewedDate = disbursement?.reviewedAt || reviewedDate;
  const finalApprovedBy = disbursement?.approverName || approvedBy;
  const finalApprovedDate = disbursement?.approvedAt || approvedDate;
  const finalIsApproved = disbursement ? (disbursement.status === 'approved' || disbursement.status === 'paid') : isApproved;
  const finalPayerAccount = disbursement?.payerAccount || payerAccount;
  const finalChequeNo = disbursement?.chequeNo || chequeNo;
  const finalPaymentDate = disbursement?.paymentDate || paymentDate;
  const finalTransferAmount = disbursement?.transferAmount !== undefined ? disbursement.transferAmount : transferAmount;
  const finalTransferFee = disbursement?.fee !== undefined ? disbursement.fee : transferFee;
  const finalFinanceOfficer = disbursement?.financeRecordedBy || financeOfficer;
  const finalFinanceDate = disbursement?.paymentDate || financeDate;
  const finalSlipUrl = disbursement?.paymentSlipUrl || slipUrl;

  const [internalMode, setInternalMode] = useState<DBMPrintMode>(printMode || 'both');
  const activeMode = printMode || internalMode;

  const handleSelectMode = (m: DBMPrintMode) => {
    setInternalMode(m);
    if (onPrintModeChange) onPrintModeChange(m);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatMoney = (val: number) => {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="w-full bg-slate-100 py-4 print:py-0 print:bg-white flex flex-col items-center text-slate-900 font-sans">
      
      {/* แถบควบคุมการพิมพ์ (Interactive Print Control Bar - Hidden on Print) */}
      {showControlBar && (
        <div className="w-full max-w-[210mm] mb-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
              <Printer className="w-3.5 h-3.5 text-[#005aa9]" />
              โหมดการพิมพ์:
            </span>

            {/* Mode 1: Requisition Only */}
            <button
              type="button"
              onClick={() => handleSelectMode('phase1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
                activeMode === 'phase1'
                  ? 'bg-blue-600 text-white shadow-blue-200'
                  : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200'
              }`}
              title="พิมพ์เฉพาะใบตั้งเบิกเงิน (ครึ่งบน A4) แล้วเว้นครึ่งล่างว่างไว้ สำหรับนำกลับมาพิมพ์รอบ 2"
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">รอบ 1: ใบตั้งเบิกเงิน (ครึ่งบน)</span>
            </button>

            {/* Mode 2: Payment Record Only */}
            <button
              type="button"
              onClick={() => handleSelectMode('phase2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
                activeMode === 'phase2'
                  ? 'bg-amber-600 text-white shadow-amber-200'
                  : 'bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200'
              }`}
              title="ใส่กระดาษแผ่นเดิมจากรอบที่ 1 แล้วพิมพ์เฉพาะใบบันทึกจ่ายต่อลงครึ่งล่าง"
            >
              <Wallet className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">รอบ 2: ใบบันทึกจ่าย (ต่อในกระดาษเดิม)</span>
            </button>

            {/* Mode 3: Both */}
            <button
              type="button"
              onClick={() => handleSelectMode('both')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
                activeMode === 'both'
                  ? 'bg-[#00873D] text-white shadow-emerald-200'
                  : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200'
              }`}
              title="พิมพ์ทั้งใบตั้งเบิกเงินและใบบันทึกจ่ายพร้อมกันใน 1 หน้า A4"
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">พิมพ์ครบทั้งชุด (1 หน้า A4)</span>
            </button>
          </div>

          {/* Direct Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-[#005aa9] hover:bg-[#004887] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="พิมพ์เอกสารออกทางเครื่องพิมพ์ หรือบันทึกเป็น PDF"
          >
            <Printer className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">สั่งพิมพ์ (Print / PDF)</span>
          </button>
        </div>
      )}

      {/* แผ่นเอกสาร A4 (A4 Sheet Simulation) */}
      <div 
        className="w-full max-w-[210mm] min-h-[297mm] bg-white p-[10mm] shadow-lg print:shadow-none print:p-[10mm] flex flex-col justify-between"
        style={{ fontSize: '11px', lineHeight: 1.4 }}
      >
        {/* Phase 2: Top Spacer (155mm) - Preserves top section space for second pass */}
        {activeMode === 'phase2' && (
          <div 
            className="w-full h-[155mm] border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl flex flex-col items-center justify-center p-6 text-center text-blue-900 print:border-none print:bg-transparent print:p-0 print:m-0"
            style={{ minHeight: '155mm', height: '155mm' }}
          >
            <div className="print:hidden flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                <FileText className="w-6 h-6" />
              </div>
              <div className="font-bold text-sm text-blue-950">
                พื้นที่ครึ่งบน (เว้นว่างไว้สำหรับใบตั้งเบิกเงินเดิมที่มีลายเซ็นอนุมัติแล้ว)
              </div>
              <p className="text-xs text-blue-800 max-w-md">
                กรุณานำกระดาษ A4 แผ่นเดิมที่พิมพ์ <strong>"ใบตั้งเบิกเงิน"</strong> และได้รับการลงนามอนุมัติแล้ว ใส่กลับเข้าถาดกระดาษของเครื่องพิมพ์ เพื่อพิมพ์เฉพาะส่วน <strong>"ใบบันทึกจ่าย"</strong> ต่อที่ครึ่งล่างในเอกสารใบเดียวกัน
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            ส่วนที่ 1: ใบตั้งเบิกเงิน (Reimbursement Form)
            (แสดงเมื่อเลือก 'phase1' หรือ 'both')
            ========================================================================= */}
        {(activeMode === 'phase1' || activeMode === 'both') && (
        <div className="flex flex-col gap-2.5">
          {/* Header */}
          <div className="flex justify-between items-center pb-2 gap-4" style={{ borderBottom: '2px solid #00873D' }}>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {company.logo ? (
                <img 
                  src={company.logo} 
                  alt={company.name} 
                  className="w-12 h-12 object-contain rounded shrink-0"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-11 h-11 rounded bg-emerald-800 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  BTC
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 leading-tight truncate">
                  {company.name}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                  {company.address}
                </div>
                <div className="text-[9.5px] text-slate-500 font-mono mt-0.5 flex flex-wrap gap-2.5">
                  <span className="whitespace-nowrap">เลขผู้เสียภาษี: <strong className="text-slate-700">{company.taxId}</strong></span>
                  {company.phone && <span className="whitespace-nowrap">โทร. {company.phone}</span>}
                  {company.email && <span className="whitespace-nowrap">E-Mail: <strong className="text-slate-700">{company.email}</strong></span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right shrink-0">
                <h1 className="text-lg sm:text-xl font-black tracking-normal leading-tight whitespace-nowrap" style={{ color: '#00873D' }}>
                  ใบตั้งเบิกเงิน
                </h1>
                <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-bold uppercase tracking-wider inline-block mt-1 whitespace-nowrap">
                  Reimbursement Form
                </span>
              </div>

              {verifyQrCode && (
                <div className="pl-3 border-l-2 border-slate-200 flex flex-col items-center text-center shrink-0">
                  <img 
                    src={verifyQrCode} 
                    alt="QR Verify" 
                    className="w-13 h-13 object-contain border border-slate-300 p-0.5 bg-white rounded" 
                  />
                  <div className="text-[7.5px] font-bold text-slate-800 mt-0.5 whitespace-nowrap">
                    สแกนตรวจ/อนุมัติในระบบ
                  </div>
                  <div className="text-[7px] font-mono text-slate-500 whitespace-nowrap">
                    {finalDocNo}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details Grid (7fr 5fr) */}
          <div className="grid grid-cols-12 gap-3 text-[11px]">
            {/* Left 7 cols */}
            <div className="col-span-7 pr-2 border-r border-slate-200 flex flex-col gap-1">
              <div className="flex items-baseline">
                <span className="font-bold text-slate-600 w-24 shrink-0">โครงการ/แผนก:</span>
                <span className="flex-1 border-b border-dashed border-slate-300 pb-0.5 text-slate-900 font-bold">
                  {finalProjectName}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-slate-600 w-24 shrink-0">ประเภทรายจ่าย:</span>
                <span className="flex-1 border-b border-dashed border-slate-300 pb-0.5 text-slate-900">
                  {finalExpenseType}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-slate-600 w-24 shrink-0">ชื่อผู้รับเงิน:</span>
                <span className="flex-1 border-b border-dashed border-slate-300 pb-0.5 text-slate-900 font-bold">
                  {finalPayeeName}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-slate-600 w-24 shrink-0">บัญชีธนาคาร:</span>
                <span className="flex-1 border-b border-dashed border-slate-300 pb-0.5 text-slate-900 font-mono">
                  {finalPayeeBankAccount}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-slate-600 w-24 shrink-0">รูปแบบการจ่าย:</span>
                <span className="flex-1 border-b border-dashed border-slate-300 pb-0.5 text-slate-900">
                  {finalPaymentMethod}
                </span>
              </div>
            </div>

            {/* Right 5 cols */}
            <div className="col-span-5 pl-1 flex flex-col gap-1">
              <div className="flex items-baseline">
                <span className="font-bold text-slate-600 w-24 shrink-0">เลขที่เอกสาร:</span>
                <span className="flex-1 border-b border-dashed border-slate-300 pb-0.5 font-bold font-mono text-xs text-slate-900">
                  {finalDocNo}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-slate-600 w-24 shrink-0">วันที่เอกสาร:</span>
                <span className="flex-1 border-b border-dashed border-slate-300 pb-0.5 text-slate-900">
                  {finalDocDate}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-slate-600 w-24 shrink-0">เอกสารอ้างอิง:</span>
                <span className="flex-1 border-b border-dashed border-slate-300 pb-0.5 text-slate-900 font-mono">
                  {finalRefDocNo || '-'}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-red-600 w-24 shrink-0">วันที่ต้องจ่าย:</span>
                <span className="flex-1 border-b border-dashed border-red-200 pb-0.5 text-red-600 font-bold font-mono">
                  {finalDueDate}
                </span>
              </div>
            </div>
          </div>

          {/* Table of items */}
          <table className="w-full border-collapse text-[11px] border border-slate-300">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
                <th className="border border-slate-300 p-1.5 text-center w-9">#</th>
                <th className="border border-slate-300 p-1.5 text-left">รายการ / คำอธิบาย</th>
                <th className="border border-slate-300 p-1.5 text-right w-36">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody>
              {finalItems.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-300">
                  <td className="border border-slate-300 p-1.5 text-center text-slate-600 font-mono">
                    {item.index ?? idx + 1}
                  </td>
                  <td className="border border-slate-300 p-1.5 text-slate-900">
                    {item.description}
                  </td>
                  <td className="border border-slate-300 p-1.5 text-right font-bold text-slate-900 font-mono">
                    {formatMoney(item.amount)}
                  </td>
                </tr>
              ))}
              {/* Blank spacer row */}
              <tr className="border-b border-slate-300">
                <td className="border border-slate-300 p-1.5 text-center">&nbsp;</td>
                <td className="border border-slate-300 p-1.5">&nbsp;</td>
                <td className="border border-slate-300 p-1.5 text-right">&nbsp;</td>
              </tr>
            </tbody>
          </table>

          {/* Totals Grid (8fr 4fr) */}
          <div className="grid grid-cols-12 gap-2 items-stretch">
            <div className="col-span-8 bg-slate-50 border border-slate-200 rounded p-1.5 flex items-center justify-center font-bold text-slate-800 text-center">
              {finalBahtText}
            </div>
            <div className="col-span-4 border-2 border-slate-900 bg-slate-100 rounded p-1.5 text-right">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                ยอดรวมสุทธิ / Total
              </div>
              <div className="text-base font-black text-slate-950 font-mono">
                {formatMoney(finalTotalAmount)} บาท
              </div>
            </div>
          </div>

          {/* Note Box */}
          {finalRemarks && (
            <div className="text-[10px] bg-amber-50 border border-amber-200 rounded p-1.5 text-amber-900">
              <strong>หมายเหตุ:</strong> {finalRemarks}
            </div>
          )}

          {/* 4 Signatures Grid */}
          <div className="grid grid-cols-4 gap-2 text-center pt-1">
            {/* 1. ผู้บันทึกข้อมูล */}
            <div className="border border-slate-200 rounded p-1.5 bg-slate-50/70">
              <div className="h-7 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center text-[10px] italic font-bold text-slate-800">
                {finalRecordedBy}
              </div>
              <div className="text-[9px] text-slate-500">ผู้บันทึกข้อมูล</div>
              <div className="text-[10px] font-bold text-slate-800 truncate">{finalRecordedBy}</div>
              <div className="text-[8px] text-slate-400 mt-0.5">วันที่: {finalRecordedDate}</div>
            </div>

            {/* 2. ผู้ตรวจสอบ */}
            <div className="border border-slate-200 rounded p-1.5 bg-slate-50/70">
              <div className="h-7 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center text-[10px] italic font-bold text-purple-800">
                {finalReviewedBy}
              </div>
              <div className="text-[9px] text-slate-500">ผู้ตรวจสอบ</div>
              <div className="text-[10px] font-bold text-slate-800 truncate">{finalReviewedBy}</div>
              <div className="text-[8px] text-slate-400 mt-0.5">วันที่: {finalReviewedDate}</div>
            </div>

            {/* 3. ผู้อนุมัติ */}
            <div className="border border-slate-200 rounded p-1.5 bg-slate-50/70 relative">
              {finalIsApproved && (
                <div className="absolute top-1 right-1 border border-emerald-600 bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded text-[7px] font-black tracking-wide rotate-[-6deg]">
                  ✓ APPROVED DIGITAL
                </div>
              )}
              <div className="h-7 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center text-[10px] italic font-bold text-emerald-800">
                {finalApprovedBy}
              </div>
              <div className="text-[9px] text-slate-500">ผู้อนุมัติ</div>
              <div className="text-[10px] font-bold text-slate-800 truncate">{finalApprovedBy}</div>
              <div className="text-[8px] text-slate-400 mt-0.5">วันที่: {finalApprovedDate}</div>
            </div>

            {/* 4. ผู้รับเงิน */}
            <div className="border border-slate-200 rounded p-1.5 bg-slate-50/70">
              <div className="h-7 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center text-[10px] italic"></div>
              <div className="text-[9px] text-slate-500">ผู้รับเงิน</div>
              <div className="text-[10px] font-bold text-slate-800 truncate">{payeeSignName}</div>
              <div className="text-[8px] text-slate-400 mt-0.5">วันที่: {payeeSignDate}</div>
            </div>
          </div>
        </div>
        )}

        {/* Phase 1 Lower Guide Box (Screen preview only, completely blank in print) */}
        {activeMode === 'phase1' && (
          <div className="my-6 border-2 border-dashed border-emerald-300 bg-emerald-50/60 rounded-xl p-6 text-center print:hidden">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Scissors className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-emerald-950">
                พื้นที่ครึ่งล่างเว้นว่างไว้สำหรับรอบที่ 2 (ใบบันทึกจ่าย)
              </div>
              <p className="text-xs text-slate-600 max-w-md">
                ระบบจะพิมพ์เฉพาะ <strong>"ใบตั้งเบิกเงิน"</strong> บนครึ่งบนของกระดาษ A4 เพื่อนำไปเสนอตรวจและอนุมัติ <br />
                เมื่อฝ่ายการเงินจ่ายเงินเรียบร้อย ให้นำกระดาษแผ่นนี้ใส่กลับเข้าเครื่องพิมพ์แล้วเลือกโหมด <strong>"รอบ 2: ใบบันทึกจ่าย"</strong> เพื่อพิมพ์ต่อในกระดาษใบเดียวกัน
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            เส้นประแบ่งรอยตัด (Tear Divider)
            ========================================================================= */}
        {(activeMode === 'both' || activeMode === 'phase2') && !hidePaymentRecord && (
          <div className="my-3 border-t-2 border-dashed border-slate-400 relative text-center">
            <span className="bg-white px-2.5 text-[10px] text-slate-500 font-semibold relative -top-2.5">
              ✂ ตัดตามรอยปรุ / Tear Here
            </span>
          </div>
        )}

        {/* =========================================================================
            ส่วนที่ 2: ใบบันทึกจ่าย (Payment Record)
            ========================================================================= */}
        {(activeMode === 'phase2' || activeMode === 'both') && !hidePaymentRecord && (
          <div className="flex flex-col gap-2.5">
            {/* Header */}
            <div className="flex justify-between items-center pb-2 gap-4" style={{ borderBottom: '2px solid #047857' }}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {company.logo ? (
                  <img 
                    src={company.logo} 
                    alt={company.name} 
                    className="w-12 h-12 object-contain rounded shrink-0"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-11 h-11 rounded bg-emerald-800 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                    BTC
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 leading-tight truncate">
                    {company.name}
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold uppercase mt-0.5 leading-snug">
                    Financial Transaction Log • {company.address}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <h2 className="text-lg sm:text-xl font-black tracking-normal leading-tight whitespace-nowrap" style={{ color: '#047857' }}>
                  ใบบันทึกจ่าย
                </h2>
                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold uppercase tracking-wider inline-block mt-1 whitespace-nowrap">
                  Payment Record
                </span>
              </div>
            </div>

            {/* Payment Details Grid (9fr 3fr) */}
            <div className="grid grid-cols-12 gap-2.5">
              {/* Left 9 cols */}
              <div className="col-span-9 flex flex-col gap-1.5">
                <table className="w-full border-collapse text-[11px] border border-emerald-600">
                  <thead>
                    <tr className="bg-emerald-50 text-emerald-900 font-bold border-b border-emerald-600">
                      <th className="border border-emerald-600 p-1.5 text-center">บัญชีสั่งจ่าย</th>
                      <th className="border border-emerald-600 p-1.5 text-center">เลขที่เช็ค</th>
                      <th className="border border-emerald-600 p-1.5 text-center">วันที่จ่าย</th>
                      <th className="border border-emerald-600 p-1.5 text-right">ยอดโอนจริง</th>
                      <th className="border border-emerald-600 p-1.5 text-right">ค่าโอน</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-emerald-600">
                      <td className="border border-emerald-600 p-1.5 text-center font-bold text-slate-800">
                        {finalPayerAccount}
                      </td>
                      <td className="border border-emerald-600 p-1.5 text-center font-mono">
                        {finalChequeNo}
                      </td>
                      <td className="border border-emerald-600 p-1.5 text-center font-mono">
                        {finalPaymentDate}
                      </td>
                      <td className="border border-emerald-600 p-1.5 text-right font-bold text-emerald-800 font-mono">
                        {formatMoney(finalTransferAmount)}
                      </td>
                      <td className="border border-emerald-600 p-1.5 text-right text-slate-500 font-mono">
                        {formatMoney(finalTransferFee)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-[10px] bg-slate-50 border border-slate-200 rounded p-1.5 flex items-center gap-1.5">
                  <strong>หลักฐานโอนเงิน:</strong>
                  <span className="text-slate-600 font-mono truncate">{finalSlipUrl}</span>
                </div>
              </div>

              {/* Right 3 cols: QR Slip */}
              <div className="col-span-3 border border-emerald-300 rounded bg-white p-1.5 flex flex-col items-center justify-between text-center">
                <div className="text-[8px] font-bold text-emerald-900">
                  QR สลิปโอนเงิน
                </div>
                {slipQrCode ? (
                  <img 
                    src={slipQrCode} 
                    alt="QR Slip" 
                    className="w-13 h-13 object-contain border border-slate-300 p-0.5 bg-white rounded my-0.5"
                  />
                ) : (
                  <div className="w-13 h-13 bg-slate-100 flex items-center justify-center text-[8px] text-slate-400 rounded">
                    ไม่มี QR
                  </div>
                )}
                <div className="text-[7px] font-bold text-slate-600 mt-0.5">
                  สแกนดูสลิปโอน
                </div>
              </div>
            </div>

            {/* Bottom Signatures (3 cols) */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              {/* 1. เจ้าหน้าที่การเงิน */}
              <div className="border border-emerald-200 rounded p-1.5 bg-emerald-50/70">
                <div className="h-7 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center text-[10px] italic"></div>
                <div className="text-[9px] text-slate-500">เจ้าหน้าที่การเงิน (ผู้บันทึก)</div>
                <div className="text-[10px] font-bold text-slate-800 truncate">{finalFinanceOfficer}</div>
                <div className="text-[8px] text-slate-400 mt-0.5">วันที่: {finalFinanceDate}</div>
              </div>

              {/* 2. ผู้ตรวจสอบการจ่าย */}
              <div className="border border-slate-200 rounded p-1.5 bg-slate-50/70">
                <div className="h-7 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center text-[10px] italic"></div>
                <div className="text-[9px] text-slate-500">ผู้ตรวจสอบการจ่าย</div>
                <div className="text-[10px] font-bold text-slate-800 truncate">&nbsp;</div>
                <div className="text-[8px] text-slate-400 mt-0.5">วันที่: ..............</div>
              </div>

              {/* 3. ผู้มีอำนาจอนุมัติจ่าย */}
              <div className="border border-slate-200 rounded p-1.5 bg-slate-50/70">
                <div className="h-7 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center text-[10px] italic"></div>
                <div className="text-[9px] text-slate-500">ผู้มีอำนาจอนุมัติจ่าย</div>
                <div className="text-[10px] font-bold text-slate-800 truncate">&nbsp;</div>
                <div className="text-[8px] text-slate-400 mt-0.5">วันที่: ..............</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DBMTemplate;
