/**
 * src/components/documents/AdditionalDocumentForms.tsx
 * รหัสแบบฟอร์มเอกสารมาตรฐานเพิ่มเติม 5 ฉบับ
 * ครบวงจรการเงิน บัญชี ภาษี และหักหนี้ช่างเหมา
 */

import { 
  CreditCard, 
  FileSpreadsheet, 
  FileCheck2, 
  Receipt, 
  Truck, 
  ShieldCheck,
  Building,
  CheckCircle
} from 'lucide-react';
import { thaiBahtText, fmtNum, CompanyInfo, DEFAULT_SAMPLE_COMPANY } from './types';
import { DBMTemplate } from './DBMTemplate';

export { DBMTemplate };

// -------------------------------------------------------------------------
// 10. ใบสำคัญจ่าย (PV - Payment Voucher)
// -------------------------------------------------------------------------
export function PaymentVoucherTemplate({
  company = DEFAULT_SAMPLE_COMPANY,
  pvNo = 'PV-6908-0042',
  pvDate = '25 สิงหาคม 2569',
  refDocNo = 'DBM-69-0219',
  payeeName = 'บริษัท ซีแพคบุรีรัมย์คอนกรีต จำกัด',
  payeeTaxId = '0315549000888',
  payeeBank = 'ธนาคารกรุงไทย บัญชีกระแสรายวัน 311-6-04289-1',
  projectName = 'โครงการก่อสร้างทางหลวงหมายเลข 24 ตอนประโคนชัย-บุรีรัมย์ ตอน 2',
  payerAccount = 'ธนาคารกสิกรไทย สาขาบุรีรัมย์ บัญชีเลขที่ 142-2-58912-3',
  grossAmount = 273000,
  vatAmount = 19110,
  whtPercent = 1,
  whtAmount = 2730,
  netPaid = 289380,
  paymentMethod = 'โอนเงิน KTB Corporate Banking (Ref: BTT-TRF-690825-01)',
  signerOfficer = 'น.ส. ศิริพร พงษ์สถิตย์ (การเงิน)',
  signerAuditor = 'นายวีระยุทธ สุวรรณโชติ (สมุห์บัญชี)',
  signerManager = 'นายสุรชัย ชัยณรงค์ (กรรมการผู้จัดการ)'
}: {
  company?: CompanyInfo;
  pvNo?: string;
  pvDate?: string;
  refDocNo?: string;
  payeeName?: string;
  payeeTaxId?: string;
  payeeBank?: string;
  projectName?: string;
  payerAccount?: string;
  grossAmount?: number;
  vatAmount?: number;
  whtPercent?: number;
  whtAmount?: number;
  netPaid?: number;
  paymentMethod?: string;
  signerOfficer?: string;
  signerAuditor?: string;
  signerManager?: string;
}) {
  return (
    <div className="space-y-3.5 text-slate-900 font-sans text-xs bg-white p-6 border border-slate-300 print:border-none print:p-0">
      {/* Header */}
      <div className="border-2 border-slate-900 p-3 bg-white flex justify-between items-start">
        <div className="flex items-center gap-3">
          {company.logo ? (
            <img 
              src={company.logo} 
              alt={company.name} 
              className="w-12 h-12 object-contain shrink-0 rounded"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          ) : (
            <span className="px-2 py-0.5 bg-slate-900 text-white font-black text-xs rounded-xs">BTC</span>
          )}
          <div className="space-y-0.5">
            <h1 className="text-base font-black text-slate-950">{company.name}</h1>
            <p className="text-[10px] text-slate-600">{company.address}</p>
            <p className="text-[10px] text-slate-600">
              เลขประจำตัวผู้เสียภาษี: <span className="font-mono font-bold text-slate-900">{company.taxId}</span> | โทร: {company.phone} {company.email ? `| E-Mail: ${company.email}` : ''}
            </p>
          </div>
        </div>
        <div className="text-right border-l border-slate-300 pl-4 space-y-1">
          <span className="px-2 py-0.5 text-[9px] font-black border border-emerald-800 bg-emerald-50 text-emerald-950 rounded uppercase">Official Payment Voucher</span>
          <h2 className="text-lg font-black text-slate-950">ใบสำคัญจ่าย</h2>
          <p className="font-mono font-bold text-xs text-indigo-900">เลขที่: {pvNo}</p>
          <p className="text-[10px] text-slate-600">วันที่: {pvDate}</p>
        </div>
      </div>

      {/* Payment & Payee Info */}
      <div className="grid grid-cols-12 gap-2 text-[10.5px]">
        <div className="col-span-7 border border-slate-900 p-2.5 space-y-1 bg-slate-50/50">
          <p><strong>จ่ายให้แก่ (Payee):</strong> <span className="font-bold text-slate-950">{payeeName}</span></p>
          <p><strong>เลขประจำตัวผู้เสียภาษี:</strong> {payeeTaxId}</p>
          <p><strong>บัญชีรับเงิน:</strong> {payeeBank}</p>
          <p><strong>โครงการ:</strong> {projectName}</p>
        </div>
        <div className="col-span-5 border border-slate-900 p-2.5 space-y-1 bg-slate-50/50">
          <p><strong>อ้างอิงใบตั้งเบิก:</strong> <span className="font-mono font-bold">{refDocNo}</span></p>
          <p><strong>จ่ายจากบัญชี:</strong> {payerAccount}</p>
          <p><strong>วิธีจ่ายเงิน:</strong> <span className="text-emerald-800 font-bold">{paymentMethod}</span></p>
          <p><strong>สถานะบัญชี:</strong> <span className="text-emerald-700 font-bold">✓ บันทึกตัดจ่ายบัญชี GL แล้ว</span></p>
        </div>
      </div>

      {/* Accounting Breakdown Table */}
      <table className="w-full text-[10.5px] border-collapse border border-slate-900">
        <thead>
          <tr className="bg-slate-100 font-bold border-b border-slate-900 text-slate-900 text-center">
            <th className="border-r border-slate-900 p-1.5 w-10">ลำดับ</th>
            <th className="border-r border-slate-900 p-1.5 text-left">รายการจ่าย / วัตถุประสงค์</th>
            <th className="border-r border-slate-900 p-1.5 text-center w-24">รหัสบัญชี GL</th>
            <th className="border-r border-slate-900 p-1.5 text-right w-28">เดบิต Dr. (บาท)</th>
            <th className="border-r border-slate-900 p-1.5 text-right w-28">เครดิต Cr. (บาท)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300">
          <tr>
            <td className="border-r border-slate-900 p-2 text-center">1</td>
            <td className="border-r border-slate-900 p-2 font-semibold">
              ค่าวัสดุก่อสร้าง - คอนกรีตผสมเสร็จ 240 ksc สเตชั่น 2 (ตามใบส่งของ DN-69-0822)
            </td>
            <td className="border-r border-slate-900 p-2 text-center font-mono text-slate-600">51-0200-01</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono font-bold">{fmtNum(grossAmount)}</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono text-slate-400">-</td>
          </tr>
          <tr>
            <td className="border-r border-slate-900 p-2 text-center">2</td>
            <td className="border-r border-slate-900 p-2 font-semibold">
              ภาษีซื้อ (Input VAT 7%)
            </td>
            <td className="border-r border-slate-900 p-2 text-center font-mono text-slate-600">11-5400-00</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono font-bold">{fmtNum(vatAmount)}</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono text-slate-400">-</td>
          </tr>
          <tr className="bg-rose-50/30 text-rose-900">
            <td className="border-r border-slate-900 p-2 text-center">3</td>
            <td className="border-r border-slate-900 p-2">
              ภาษีเงินได้หัก ณ ที่จ่ายค้างจ่าย (Withholding Tax {whtPercent}%)
            </td>
            <td className="border-r border-slate-900 p-2 text-center font-mono text-slate-600">21-3100-00</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono text-slate-400">-</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono font-bold text-rose-700">{fmtNum(whtAmount)}</td>
          </tr>
          <tr className="bg-emerald-50/40 text-emerald-950 font-bold">
            <td className="border-r border-slate-900 p-2 text-center">4</td>
            <td className="border-r border-slate-900 p-2">
              เงินฝากกระแสรายวัน/ออมทรัพย์ ธนาคารกสิกรไทย
            </td>
            <td className="border-r border-slate-900 p-2 text-center font-mono text-slate-600">11-1200-01</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono text-slate-400">-</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono font-bold text-emerald-800">{fmtNum(netPaid)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 font-extrabold border-t-2 border-slate-900 text-[11px]">
            <td colSpan={3} className="border-r border-slate-900 p-2 text-right">ยอดรวมดุลบัญชี (Total Balanced):</td>
            <td className="border-r border-slate-900 p-2 text-right text-indigo-950">{fmtNum(grossAmount + vatAmount)}</td>
            <td className="border-r border-slate-900 p-2 text-right text-indigo-950">{fmtNum(whtAmount + netPaid)}</td>
          </tr>
          <tr className="bg-emerald-50 border-t border-slate-300">
            <td colSpan={5} className="p-2 text-center text-emerald-950 font-extrabold text-[11px]">
              จำนวนเงินจ่ายสุทธิ: {fmtNum(netPaid)} บาท (-{thaiBahtText(netPaid)}-)
            </td>
          </tr>
        </tfoot>
      </table>

      {/* 4-Tier Signatures */}
      <div className="grid grid-cols-4 gap-2 border border-slate-900 p-2.5 text-center text-[10px]">
        <div className="border-r border-slate-200 pr-1">
          <p className="text-slate-600 font-semibold">ผู้จัดทำ (การเงิน)</p>
          <div className="border-b border-dashed border-slate-400 w-4/5 mx-auto pt-5"></div>
          <p className="mt-1 font-bold">({signerOfficer})</p>
        </div>
        <div className="border-r border-slate-200 pr-1">
          <p className="text-slate-600 font-semibold">ผู้ตรวจสอบ (บัญชี)</p>
          <div className="border-b border-dashed border-slate-400 w-4/5 mx-auto pt-5"></div>
          <p className="mt-1 font-bold">({signerAuditor})</p>
        </div>
        <div className="border-r border-slate-200 pr-1">
          <p className="text-emerald-900 font-bold">ผู้อนุมัติจ่าย (MD)</p>
          <div className="border-b border-dashed border-slate-400 w-4/5 mx-auto pt-5"></div>
          <p className="mt-1 font-extrabold text-emerald-900">({signerManager})</p>
        </div>
        <div>
          <p className="text-slate-600 font-semibold">ผู้รับเงิน / สลิปยืนยัน</p>
          <div className="border-b border-dashed border-slate-400 w-4/5 mx-auto pt-5"></div>
          <p className="mt-1 text-slate-500 font-mono text-[9px]">[ โอนเงินผ่านระบบธนาคาร ]</p>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// 11. ใบขออนุมัติเบิกจ่าย / ใบตั้งเบิก (DBM - Disbursement Requisition)
// -------------------------------------------------------------------------
export function DisbursementVoucherTemplate({
  company = DEFAULT_SAMPLE_COMPANY,
  dbmNo = 'DBM26070001',
  refDocNo = 'INV-2026/8942',
  entryDate = '15 ส.ค. 2569',
  dueDate = '20 ส.ค. 2569',
  projectName = 'โครงการก่อสร้างทางหลวงชนบท สาย บร.3012',
  expenseCategory = 'ค่าวัสดุก่อสร้างและอุปกรณ์',
  requesterName = 'สมชาย ใจกล้า',
  payeeName = 'หจก. บุรีรัมย์คอนกรีตและวัสดุภัณฑ์',
  payeeBank = '045-2-34981-0',
  totalAmount = 58141
}: {
  company?: CompanyInfo;
  dbmNo?: string;
  refDocNo?: string;
  entryDate?: string;
  dueDate?: string;
  projectName?: string;
  expenseCategory?: string;
  requesterName?: string;
  payeeName?: string;
  payeeBank?: string;
  totalAmount?: number;
}) {
  return (
    <DBMTemplate
      company={company}
      docNo={dbmNo}
      docDate={entryDate}
      refDocNo={refDocNo}
      dueDate={dueDate}
      projectName={projectName}
      expenseType={expenseCategory}
      recordedBy={requesterName}
      payeeName={payeeName}
      payeeBankAccount={payeeBank}
      totalAmount={totalAmount}
    />
  );
}

// -------------------------------------------------------------------------
// 12. หนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ)
// -------------------------------------------------------------------------
export function WithholdingTax50TwiTemplate({
  company = DEFAULT_SAMPLE_COMPANY,
  bookNo = '01/2569',
  docNo = 'WHT-6908-0118',
  docDate = '25 สิงหาคม 2569',
  payeeName = 'ทีมช่างสมานการช่าง (นายสมาน มีสุข)',
  payeeTaxId = '1-3199-00234-55-1',
  payeeAddress = '45 หมู่ 3 ต.ประโคนชัย อ.ประโคนชัย จ.บุรีรัมย์ 31140',
  incomeType = 'ค่าจ้างทำของ / ค่าบริการรับเหมาก่อสร้าง (ตามมาตรา 40(7) หรือ 40(8))',
  incomeAmount = 135000,
  taxRate = 3,
  taxAmount = 4050,
  taxFormType = 'ภ.ง.ด.3'
}: {
  company?: CompanyInfo;
  bookNo?: string;
  docNo?: string;
  docDate?: string;
  payeeName?: string;
  payeeTaxId?: string;
  payeeAddress?: string;
  incomeType?: string;
  incomeAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  taxFormType?: 'ภ.ง.ด.1ก' | 'ภ.ง.ด.2' | 'ภ.ง.ด.3' | 'ภ.ง.ด.53';
}) {
  return (
    <div className="space-y-3 text-slate-900 font-sans text-xs bg-white p-6 border border-slate-300 print:border-none print:p-0">
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-2">
        <div>
          <span className="inline-block px-1.5 py-0.5 bg-slate-900 text-white text-[9px] font-black uppercase rounded">แบบ 50 ทวิ</span>
          <h2 className="text-sm font-black mt-1">หนังสือรับรองการหักภาษี ณ ที่จ่าย</h2>
          <p className="text-[10px] text-slate-600">ตามมาตรา 50 ทวิ แห่งประมวลรัษฎากร</p>
        </div>
        <div className="text-right text-[10px]">
          <p><strong>เล่มที่:</strong> {bookNo}</p>
          <p><strong>เลขที่:</strong> <span className="font-mono font-bold text-slate-950">{docNo}</span></p>
          <p><strong>วันที่ออกหนังสือ:</strong> {docDate}</p>
        </div>
      </div>

      {/* Payer */}
      <div className="border border-slate-900 p-2 space-y-0.5 text-[10px] bg-slate-50/40">
        <p className="font-bold text-slate-950 text-[10.5px]">1. ผู้มีหน้าที่หักภาษี ณ ที่จ่าย:</p>
        <p><strong>ชื่อ:</strong> {company.name}</p>
        <p><strong>เลขประจำตัวผู้เสียภาษีอากร:</strong> <span className="font-mono font-bold text-slate-950 tracking-wider">{company.taxId}</span></p>
        <p><strong>ที่อยู่:</strong> {company.address}</p>
      </div>

      {/* Payee */}
      <div className="border border-slate-900 p-2 space-y-0.5 text-[10px] bg-slate-50/40">
        <p className="font-bold text-slate-950 text-[10.5px]">2. ผู้ถูกหักภาษี ณ ที่จ่าย:</p>
        <p><strong>ชื่อ:</strong> <span className="font-bold">{payeeName}</span></p>
        <p><strong>เลขประจำตัวประชาชน / ผู้เสียภาษี:</strong> <span className="font-mono font-bold text-slate-950 tracking-wider">{payeeTaxId}</span></p>
        <p><strong>ที่อยู่:</strong> {payeeAddress}</p>
      </div>

      <div className="flex items-center gap-4 text-[10px] font-bold p-1 bg-slate-100 border border-slate-300">
        <span>ลำดับที่ในแบบยื่นภาษี:</span>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={taxFormType === 'ภ.ง.ด.3'} readOnly />
          <span>(1) ภ.ง.ด.3 (บุคคลธรรมดา)</span>
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={taxFormType === 'ภ.ง.ด.53'} readOnly />
          <span>(2) ภ.ง.ด.53 (นิติบุคคล)</span>
        </label>
      </div>

      <table className="w-full text-[10px] border-collapse border border-slate-900">
        <thead>
          <tr className="bg-slate-100 font-bold border-b border-slate-900 text-center">
            <th className="border-r border-slate-900 p-1.5 text-left">ประเภทเงินได้พึงประเมินที่จ่าย</th>
            <th className="border-r border-slate-900 p-1.5 w-24">วัน เดือน ปี ที่จ่าย</th>
            <th className="border-r border-slate-900 p-1.5 text-right w-28">จำนวนเงินที่จ่าย</th>
            <th className="border-r border-slate-900 p-1.5 text-right w-28">ภาษีที่หักและนำส่ง ({taxRate}%)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-r border-slate-900 p-2">
              <span className="font-bold">{incomeType}</span>
              <span className="block text-[9px] text-slate-500">ค่างานงวดที่ 1 งานโครงสร้างสะพานข้ามคลองลำนางรอง สัญญา SC-2026-08-002</span>
            </td>
            <td className="border-r border-slate-900 p-2 text-center">{docDate}</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono font-bold">{fmtNum(incomeAmount)}</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono font-bold text-rose-800">{fmtNum(taxAmount)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
            <td colSpan={2} className="border-r border-slate-900 p-1.5 text-right">รวมเงินที่จ่ายและภาษีที่หักนำส่ง:</td>
            <td className="border-r border-slate-900 p-1.5 text-right font-mono">{fmtNum(incomeAmount)}</td>
            <td className="border-r border-slate-900 p-1.5 text-right font-mono text-rose-800 font-extrabold">{fmtNum(taxAmount)}</td>
          </tr>
          <tr className="bg-emerald-50/50 border-t border-slate-300">
            <td colSpan={4} className="p-2 text-center font-bold text-indigo-950 text-[10.5px]">
              รวมเงินภาษีที่หักนำส่ง (ตัวอักษร): (-{thaiBahtText(taxAmount)}-)
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="border border-slate-900 p-3 flex justify-between items-center text-[10px]">
        <div className="space-y-1">
          <p className="font-bold">เงื่อนไขการหักภาษี:</p>
          <p>[ ✓ ] (1) หัก ณ ที่จ่าย</p>
          <p>[   ] (2) ออกให้ตลอดไป</p>
        </div>
        <div className="text-center space-y-2 min-w-[220px]">
          <p className="font-bold">ลงชื่อ ..................................................... ผู้จ่ายเงิน</p>
          <p className="text-[9.5px]">({company.name})</p>
          <p className="text-[9px] text-slate-500">ประทับตรานิติบุคคล</p>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// 13. ใบแจ้งตัดหนี้ / หักเงินค่าวัสดุและเครื่องจักร (BACKCHARGE NOTE)
// -------------------------------------------------------------------------
export function MaterialBackchargeTemplate({
  company = DEFAULT_SAMPLE_COMPANY,
  backchargeNo = 'BC-6908-0015',
  date = '22 สิงหาคม 2569',
  subcontractNo = 'SC-2026-08-002',
  contractorName = 'ทีมช่างสมานการช่าง',
  projectName = 'โครงการก่อสร้างทางหลวงหมายเลข 24 ตอนประโคนชัย-บุรีรัมย์ ตอน 2',
  totalBackchargeAmount = 15000
}: {
  company?: CompanyInfo;
  backchargeNo?: string;
  date?: string;
  subcontractNo?: string;
  contractorName?: string;
  projectName?: string;
  totalBackchargeAmount?: number;
}) {
  return (
    <div className="space-y-4 text-slate-900 font-sans text-xs bg-white p-6 border border-slate-300 print:border-none print:p-0">
      <div className="border-b-2 border-rose-900 pb-3 flex justify-between items-start">
        <div>
          <h2 className="text-base font-black">{company.name}</h2>
          <h3 className="text-sm font-bold text-rose-900">ใบแจ้งหักเงินค่าวัสดุและเครื่องจักรช่างเหมา (MATERIAL & EQUIPMENT BACKCHARGE)</h3>
          <p className="text-[10px] text-slate-600">โครงการ: {projectName}</p>
        </div>
        <div className="text-right">
          <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-100 text-rose-900 rounded border border-rose-300">หักเงินค่างานงวด</span>
          <p className="font-mono font-bold text-sm text-rose-950 mt-1">เลขที่: {backchargeNo}</p>
          <p className="text-[10px] text-slate-500">วันที่: {date}</p>
        </div>
      </div>

      <div className="border border-slate-300 p-2.5 bg-slate-50 text-[10.5px]">
        <p><strong>ช่างเหมา / ผู้รับจ้างที่ถูกหักเงิน:</strong> <span className="font-bold text-slate-950">{contractorName}</span></p>
        <p><strong>สัญญาจ้างเหมาช่วงอ้างอิง:</strong> <span className="font-mono font-bold">{subcontractNo}</span></p>
        <p className="text-slate-600 text-[10px]">หมายเหตุ: บริษัทได้ทำการสั่งซื้อ/เบิกจ่ายวัสดุหรือเครื่องจักรให้แก่ช่างเหมาเพื่อใช้ในงานก่อสร้าง ยอดเงินนี้จะถูกนำไปหักลบในใบเบิกเงินงวดถัดไป</p>
      </div>

      <table className="w-full text-[10.5px] border border-slate-900">
        <thead className="bg-slate-100 font-bold border-b border-slate-900 text-center">
          <tr>
            <th className="p-2 border-r border-slate-900 w-10">ลำดับ</th>
            <th className="p-2 border-r border-slate-900 text-left">รายการวัสดุ / เครื่องจักรที่บริษัทออกให้แทน</th>
            <th className="p-2 border-r border-slate-900 w-28">อ้างอิง PO/ใบส่งของ</th>
            <th className="p-2 border-r border-slate-900 w-16">จำนวน</th>
            <th className="p-2 border-r border-slate-900 w-14">หน่วย</th>
            <th className="p-2 border-r border-slate-900 text-right w-24">ราคา/หน่วย</th>
            <th className="p-2 text-right w-28">รวมเงินหัก (บาท)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300">
          <tr>
            <td className="p-2 border-r border-slate-900 text-center font-bold">1</td>
            <td className="p-2 border-r border-slate-900 font-semibold">
              ลวดผูกเหล็ก เบอร์ 18 (สำหรับผูกเหล็กฐานราก)
            </td>
            <td className="p-2 border-r border-slate-900 text-center font-mono text-[9.5px]">DO-BTT-0412</td>
            <td className="p-2 border-r border-slate-900 text-center font-bold">10</td>
            <td className="p-2 border-r border-slate-900 text-center">ม้วน</td>
            <td className="p-2 border-r border-slate-900 text-right font-mono">650.00</td>
            <td className="p-2 text-right font-mono font-bold text-rose-800">6,500.00</td>
          </tr>
          <tr>
            <td className="p-2 border-r border-slate-900 text-center font-bold">2</td>
            <td className="p-2 border-r border-slate-900 font-semibold">
              น้ำมันดีเซล B7 (เติมรถแบ็คโฮงานขุดฐานราก)
            </td>
            <td className="p-2 border-r border-slate-900 text-center font-mono text-[9.5px]">ST-FUEL-6908</td>
            <td className="p-2 border-r border-slate-900 text-center font-bold">250</td>
            <td className="p-2 border-r border-slate-900 text-center">ลิตร</td>
            <td className="p-2 border-r border-slate-900 text-right font-mono">34.00</td>
            <td className="p-2 text-right font-mono font-bold text-rose-800">8,500.00</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-rose-50 border-t-2 border-slate-900 font-extrabold text-[11px]">
            <td colSpan={6} className="p-2 text-right text-rose-950">รวมยอดเงินหักตัดค่างานช่างทั้งสิ้น (Total Backcharge):</td>
            <td className="p-2 text-right text-rose-900 font-bold text-sm font-mono">{fmtNum(totalBackchargeAmount)} ฿</td>
          </tr>
          <tr className="bg-slate-50 border-t border-slate-300">
            <td colSpan={7} className="p-2 text-center text-rose-950 font-bold text-[10.5px]">
              (-{thaiBahtText(totalBackchargeAmount)}-)
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="grid grid-cols-3 gap-4 border border-slate-900 p-3 mt-4 text-center text-[10px]">
        <div>
          <p className="text-slate-600 font-semibold">วิศวกรผู้สั่งจ่าย / เบิกวัสดุ</p>
          <div className="border-b border-slate-400 mt-6 w-3/4 mx-auto"></div>
          <p className="mt-1 font-bold">(วิศวกรควบคุมงานสนาม)</p>
        </div>
        <div>
          <p className="text-slate-600 font-semibold">ตัวแทนช่างเหมา (ผู้รับของและยินยอมให้หัก)</p>
          <div className="border-b border-slate-400 mt-6 w-3/4 mx-auto"></div>
          <p className="mt-1 font-bold">({contractorName})</p>
        </div>
        <div>
          <p className="text-emerald-900 font-bold">ฝ่ายบัญชีต้นทุน (ผู้บันทึกตัดจ่าย)</p>
          <div className="border-b border-slate-400 mt-6 w-3/4 mx-auto"></div>
          <p className="mt-1 font-bold text-emerald-900">[ บันทึกตัดหักในระบบงวดงาน ]</p>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// 14. ใบรับวางบิลร้านค้า/ผู้ขาย (SUPPLIER BILLING RECEIPT)
// -------------------------------------------------------------------------
export function SupplierBillingSlipTemplate({
  company = DEFAULT_SAMPLE_COMPANY,
  billingNo = 'BILL-69-0084',
  receivedDate = '22 สิงหาคม 2569',
  vendorName = 'บริษัท ซีแพคบุรีรัมย์คอนกรีต จำกัด',
  vendorTaxId = '0315549000888',
  creditDays = 60,
  dueDate = '21 ตุลาคม 2569',
  projectName = 'โครงการก่อสร้างทางหลวงหมายเลข 24 ตอนประโคนชัย-บุรีรัมย์ ตอน 2',
  subTotal = 273000,
  vatAmount = 19110,
  grandTotal = 292110
}: {
  company?: CompanyInfo;
  billingNo?: string;
  receivedDate?: string;
  vendorName?: string;
  vendorTaxId?: string;
  creditDays?: number;
  dueDate?: string;
  projectName?: string;
  subTotal?: number;
  vatAmount?: number;
  grandTotal?: number;
}) {
  return (
    <div className="space-y-4 text-slate-900 font-sans text-xs bg-white p-6 border border-slate-300 print:border-none print:p-0">
      <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
        <div>
          <h2 className="text-base font-black">{company.name}</h2>
          <h3 className="text-sm font-bold text-blue-900">ใบรับวางบิลร้านค้า / คู่ค้า (SUPPLIER BILLING RECEIPT)</h3>
          <p className="text-[10px] text-slate-600">โครงการ: {projectName}</p>
        </div>
        <div className="text-right">
          <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-900 border border-blue-200 rounded">แผนกบัญชีเจ้าหนี้</span>
          <p className="font-mono font-bold text-sm text-blue-950 mt-1">เลขที่รับวางบิล: {billingNo}</p>
          <p className="text-[10px] text-slate-500">วันที่รับวางบิล: {receivedDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border border-slate-300 p-2.5 bg-slate-50 text-[10.5px]">
        <div>
          <p><strong>ผู้ขาย / ร้านค้านำวางบิล:</strong> <span className="font-bold">{vendorName}</span></p>
          <p><strong>เลขประจำตัวผู้เสียภาษี:</strong> {vendorTaxId}</p>
        </div>
        <div>
          <p><strong>เครดิตเทอมการค้า:</strong> {creditDays} วัน</p>
          <p className="text-emerald-800 font-bold text-[11px]"><strong>วันนัดชำระเงิน (Due Date):</strong> {dueDate}</p>
        </div>
      </div>

      <table className="w-full text-[10.5px] border border-slate-900">
        <thead className="bg-slate-100 font-bold border-b border-slate-900 text-center">
          <tr>
            <th className="p-2 border-r border-slate-900 w-10">ลำดับ</th>
            <th className="p-2 border-r border-slate-900 w-24">วันที่เอกสาร</th>
            <th className="p-2 border-r border-slate-900 w-28">เลขที่ใบกำกับภาษี</th>
            <th className="p-2 border-r border-slate-900 w-28">เลขที่ใบส่งของ (DO)</th>
            <th className="p-2 border-r border-slate-900 text-left">รายการพัสดุ</th>
            <th className="p-2 text-right w-28">จำนวนเงิน (บาท)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border-r border-slate-900 text-center font-bold">1</td>
            <td className="p-2 border-r border-slate-900 text-center">22/08/2569</td>
            <td className="p-2 border-r border-slate-900 text-center font-mono font-bold">INV-69-0822</td>
            <td className="p-2 border-r border-slate-900 text-center font-mono">DO-69-0822</td>
            <td className="p-2 border-r border-slate-900 font-semibold">คอนกรีตผสมเสร็จ 240 ksc จำนวน 150 ลบ.ม.</td>
            <td className="p-2 text-right font-mono font-bold">{fmtNum(subTotal)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-slate-50 border-t border-slate-900 font-bold text-[10.5px]">
            <td colSpan={5} className="p-1.5 text-right border-r border-slate-900">ยอดเงินก่อนภาษี (Sub Total):</td>
            <td className="p-1.5 text-right font-mono">{fmtNum(subTotal)}</td>
          </tr>
          <tr className="bg-slate-50 border-t border-slate-200 font-bold text-[10.5px]">
            <td colSpan={5} className="p-1.5 text-right border-r border-slate-900">ภาษีมูลค่าเพิ่ม (VAT 7%):</td>
            <td className="p-1.5 text-right font-mono">{fmtNum(vatAmount)}</td>
          </tr>
          <tr className="bg-blue-50 border-t border-slate-900 font-extrabold text-[11px]">
            <td colSpan={5} className="p-2 text-right border-r border-slate-900 text-blue-950">ยอดรวมทั้งสิ้นตามใบวางบิล (Grand Total):</td>
            <td className="p-2 text-right text-blue-900 font-mono text-sm">{fmtNum(grandTotal)} ฿</td>
          </tr>
          <tr className="bg-slate-50 border-t border-slate-300">
            <td colSpan={6} className="p-2 text-center text-blue-950 font-bold text-[10.5px]">
              (-{thaiBahtText(grandTotal)}-)
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="grid grid-cols-2 gap-6 border border-slate-900 p-3 mt-4 text-center text-[10px]">
        <div>
          <p className="text-slate-600 font-semibold">ผู้นำวางบิล (ผู้ส่งมอบเอกสาร)</p>
          <div className="border-b border-slate-400 mt-6 w-3/4 mx-auto"></div>
          <p className="mt-1 font-bold">({vendorName})</p>
        </div>
        <div>
          <p className="text-blue-900 font-bold">เจ้าหน้าที่บัญชีเจ้าหนี้ (ผู้รับวางบิล)</p>
          <div className="border-b border-slate-400 mt-6 w-3/4 mx-auto"></div>
          <p className="mt-1 font-bold text-blue-950">({company.name})</p>
        </div>
      </div>
    </div>
  );
}
