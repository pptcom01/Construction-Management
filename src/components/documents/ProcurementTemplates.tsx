import React from 'react';
import { CompanyInfo } from './types';
import { DEFAULT_SAMPLE_COMPANY } from './types';

// -------------------------------------------------------------------------
// 1. ใบขอสอบราคา (RFQ) - ตามต้นฉบับเป๊ะ 100%
// -------------------------------------------------------------------------
export function RFQFormTemplate({
  company = DEFAULT_SAMPLE_COMPANY,
  docNo = 'RFQ-2026-08-001',
  docDate = '1 สิงหาคม 2569',
  dueDate = '15 สิงหาคม 2569 (17:00 น.)',
  projectName = 'โครงการก่อสร้างทางหลวงหมายเลข 24 ตอนประโคนชัย-บุรีรัมย์ ตอน 2',
  projectCode = 'BTC-HW24-2026',
  deliveryLocation = 'หน้างานตอน 2 กม. 205+000 ถ.สาย 24 อ.ประโคนชัย จ.บุรีรัมย์'
}: {
  company?: CompanyInfo;
  docNo?: string;
  docDate?: string;
  dueDate?: string;
  projectName?: string;
  projectCode?: string;
  deliveryLocation?: string;
}) {
  return (
    <div className="space-y-4 text-slate-900 text-xs leading-relaxed bg-white p-6 border border-slate-300 print:border-none print:p-0">
      {/* Header Box */}
      <div className="border border-slate-900 p-3 bg-white">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3 flex-1 pr-2">
            {company.logo ? (
              <img 
                src={company.logo} 
                alt={company.name} 
                className="w-12 h-12 object-contain shrink-0 rounded"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : null}
            <div className="space-y-0.5 min-w-0">
              <h1 className="text-base font-extrabold text-slate-950 tracking-tight">
                {company.name}
              </h1>
              <p className="text-[10px] font-bold text-slate-800">
                {company.nameEn || 'BURIRAM THONGCHAI CONSTRUCTION CO., LTD.'}
              </p>
              <p className="text-[9.5px] font-medium text-slate-700">
                {company.address}
              </p>
              <p className="text-[9.5px] text-slate-600">
                เลขประจำตัวผู้เสียภาษี: {company.taxId} | โทรศัพท์: {company.phone} {company.email ? `| E-Mail: ${company.email}` : ''}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 border-l border-slate-300 pl-4 space-y-1 min-w-[200px]">
            <span className="inline-block px-2 py-0.5 text-[8.5px] font-black border border-slate-900 bg-slate-100 text-slate-900 rounded tracking-wider uppercase">
              เอกสารส่งภายนอก / Official RFQ
            </span>
            <h2 className="text-base font-black text-slate-950 tracking-tight uppercase leading-tight pt-0.5">
              ใบขอสอบราคา
            </h2>
            <div className="text-[10px] font-bold text-slate-700 tracking-wider">
              (REQUEST FOR QUOTATION : RFQ)
            </div>
          </div>
        </div>
      </div>

      {/* Document Meta Information */}
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-7 border border-slate-900 p-2 space-y-1 bg-white">
          <p className="font-bold text-slate-900 text-[11px] border-b border-slate-200 pb-1">ข้อมูลโครงการ & หน่วยงานสอบราคา:</p>
          <p><strong className="text-slate-800">โครงการ:</strong> {projectName}</p>
          <p><strong className="text-slate-800">รหัสโครงการ:</strong> {projectCode}</p>
          <p><strong className="text-slate-800">ผู้ขอสอบราคา:</strong> ฝ่ายจัดซื้อและบริหารสัญญา</p>
          <p><strong className="text-slate-800">สถานที่ส่งมอบ:</strong> {deliveryLocation}</p>
        </div>
        <div className="col-span-5 border border-slate-900 p-2 space-y-1 bg-white">
          <p className="font-bold text-slate-900 text-[11px] border-b border-slate-200 pb-1">รายละเอียดเอกสาร & กำหนดเวลา:</p>
          <p><strong className="text-slate-800">เลขที่เอกสาร:</strong> {docNo}</p>
          <p><strong className="text-slate-800">วันที่ออกเอกสาร:</strong> {docDate}</p>
          <p className="text-rose-700 font-bold"><strong>กำหนดส่งข้อเสนอ:</strong> {dueDate}</p>
          <p><strong className="text-slate-800">สถานะ:</strong> เปิดรับข้อเสนอราคา (Active)</p>
        </div>
      </div>

      {/* Vendor Instruction Banner */}
      <div className="border border-amber-300 bg-amber-50/70 p-2.5 rounded-xs space-y-1 text-[10px]">
        <p className="font-extrabold text-amber-950">คำชี้แจงสำหรับผู้เสนอราคา / ร้านค้า (Vendor Instruction):</p>
        <p className="text-slate-800 leading-relaxed">
          โปรดกรอกราคาต่อหน่วย (Unit Price), จำนวนเงินรวม (Total Amount), ระยะเวลายืนราคา, เงื่อนไขเครดิตเทอม และกำหนดส่งมอบลงในตาราง แล้วลงนามพร้อมประทับตราบริษัทส่งกลับมายังฝ่ายจัดซื้อของ <strong>{company.name}</strong> ภายในวันกำหนด
        </p>
      </div>

      {/* Items Table */}
      <table className="w-full text-[10px] border-collapse border border-slate-900">
        <thead>
          <tr className="bg-slate-100 font-bold border-b border-slate-900 text-slate-900 text-center">
            <th className="border-r border-slate-900 p-1.5 w-10">ลำดับ</th>
            <th className="border-r border-slate-900 p-1.5 text-left">รายการสินค้า / วัสดุก่อสร้าง / งานเหมา</th>
            <th className="border-r border-slate-900 p-1.5 w-16">จำนวน</th>
            <th className="border-r border-slate-900 p-1.5 w-14">หน่วย</th>
            <th className="border-r border-slate-900 p-1.5 w-28 bg-slate-200/60">ราคาต่อหน่วย (เสนอ)</th>
            <th className="border-r border-slate-900 p-1.5 w-28 bg-slate-200/60">จำนวนเงินรวม (บาท)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300">
          <tr className="border-b border-slate-300">
            <td className="border-r border-slate-900 p-2 text-center font-bold">1</td>
            <td className="border-r border-slate-900 p-2 font-bold text-slate-950">
              คอนกรีตผสมเสร็จ 240 ksc (Cylinder) มอก.
              <span className="block text-[9.5px] font-normal text-slate-600">ผสมสารกันซึม สำหรับเทงานโครงสร้างสะพานและบ่อพัก</span>
            </td>
            <td className="border-r border-slate-900 p-2 text-center font-bold">150</td>
            <td className="border-r border-slate-900 p-2 text-center">ลบ.ม.</td>
            <td className="border-r border-slate-900 p-2 text-center text-slate-400 font-mono">....................</td>
            <td className="border-r border-slate-900 p-2 text-center text-slate-400 font-mono">....................</td>
          </tr>
          <tr className="border-b border-slate-300">
            <td className="border-r border-slate-900 p-2 text-center font-bold">2</td>
            <td className="border-r border-slate-900 p-2 font-bold text-slate-950">
              เหล็กเส้นข้ออ้อย DB12 SD40 (ยาว 10 ม.) มอก.
              <span className="block text-[9.5px] font-normal text-slate-600">เหล็กเกรดโรงใหญ่ (TATA / BSBM / SYS) มีใบ Certificate รับรองผลทดสอบ</span>
            </td>
            <td className="border-r border-slate-900 p-2 text-center font-bold">450</td>
            <td className="border-r border-slate-900 p-2 text-center">เส้น</td>
            <td className="border-r border-slate-900 p-2 text-center text-slate-400 font-mono">....................</td>
            <td className="border-r border-slate-900 p-2 text-center text-slate-400 font-mono">....................</td>
          </tr>
          <tr className="border-b border-slate-300">
            <td className="border-r border-slate-900 p-2 text-center font-bold">3</td>
            <td className="border-r border-slate-900 p-2 font-bold text-slate-950">
              เหล็กเส้นข้ออ้อย DB16 SD40 (ยาว 10 ม.) มอก.
              <span className="block text-[9.5px] font-normal text-slate-600">เหล็กเกรดโรงใหญ่ มีใบ Certificate รับรองผลทดสอบ</span>
            </td>
            <td className="border-r border-slate-900 p-2 text-center font-bold">380</td>
            <td className="border-r border-slate-900 p-2 text-center">เส้น</td>
            <td className="border-r border-slate-900 p-2 text-center text-slate-400 font-mono">....................</td>
            <td className="border-r border-slate-900 p-2 text-center text-slate-400 font-mono">....................</td>
          </tr>
          <tr className="border-b border-slate-300">
            <td className="border-r border-slate-900 p-2 text-center font-bold">4</td>
            <td className="border-r border-slate-900 p-2 font-bold text-slate-950">
              อิฐมวลเบา ขนาด 20 x 60 x 7.5 ซม. (เกรด G4)
              <span className="block text-[9.5px] font-normal text-slate-600">ได้มาตรฐาน มอก. พร้อมพาเลทหุ้มพลาสติกกันฝน</span>
            </td>
            <td className="border-r border-slate-900 p-2 text-center font-bold">2,400</td>
            <td className="border-r border-slate-900 p-2 text-center">ก้อน</td>
            <td className="border-r border-slate-900 p-2 text-center text-slate-400 font-mono">....................</td>
            <td className="border-r border-slate-900 p-2 text-center text-slate-400 font-mono">....................</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-slate-50 font-bold border-t border-slate-900">
            <td colSpan={4} className="p-2 border-r border-slate-900 text-right">รวมเงินค่าสินค้า / วัสดุก่อนภาษี:</td>
            <td colSpan={2} className="p-2 text-center text-slate-400 font-mono">........................................ บาท</td>
          </tr>
          <tr className="bg-slate-50 font-bold border-t border-slate-300">
            <td colSpan={4} className="p-1.5 border-r border-slate-900 text-right">ภาษีมูลค่าเพิ่ม 7% (VAT 7%):</td>
            <td colSpan={2} className="p-1.5 text-center text-slate-400 font-mono">........................................ บาท</td>
          </tr>
          <tr className="bg-slate-200/80 font-black border-t border-slate-900 text-slate-950">
            <td colSpan={4} className="p-2 border-r border-slate-900 text-right text-[11px]">จำนวนเงินรวมทั้งสิ้น (Grand Total):</td>
            <td colSpan={2} className="p-2 text-center text-slate-500 font-mono text-[11px]">........................................ บาท</td>
          </tr>
        </tfoot>
      </table>

      {/* Commercial Conditions Fillable Section */}
      <div className="border border-slate-900 bg-white p-2.5 space-y-1.5 text-[10px]">
        <p className="font-bold text-slate-900 border-b border-slate-200 pb-1">เงื่อนไขทางการค้าที่ผู้เสนอราคาต้องระบุ (Commercial Conditions):</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p>1. กำหนดยืนราคา: ................................. วัน (นับจากวันยื่นซองเสนอราคา)</p>
            <p>2. เงื่อนไขการชำระเงิน: เครดิตเทอม .................... วัน (หรือระบุเงื่อนไขอื่น)</p>
          </div>
          <div className="space-y-1">
            <p>3. กำหนดเวลาจัดส่งถึงหน้างาน: ภายใน .................... วัน หลังได้รับใบสั่งซื้อ (PO)</p>
            <p>4. การรับประกันสินค้า / วัสดุ: ................................. ปี/เดือน</p>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="border border-slate-900 bg-white">
        <div className="grid grid-cols-2 divide-x divide-slate-900 text-center">
          <div className="p-3 space-y-2">
            <p className="font-bold text-slate-800 text-[10.5px]">เจ้าหน้าที่จัดซื้อผู้ขอสอบราคา</p>
            <div className="pt-6">
              <div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1">( นายวิศวกร มั่นคง )</p>
              <p className="text-slate-600 text-[9.5px]">เจ้าหน้าที่จัดซื้อโครงการ • {company.name}</p>
              <p className="text-slate-500 text-[9px] mt-0.5">วันที่: {docDate}</p>
            </div>
          </div>
          <div className="p-3 space-y-2 bg-slate-50/50">
            <p className="font-bold text-slate-800 text-[10.5px]">ผู้เสนอราคา / ผู้มีอำนาจลงนามและประทับตรา</p>
            <div className="pt-6">
              <div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div>
              <p className="font-bold text-slate-400 mt-1">( .............................................................. )</p>
              <p className="text-slate-600 text-[9.5px]">ชื่อบริษัท/ร้านค้า: ..............................................................</p>
              <p className="text-slate-500 text-[9px] mt-0.5">วันที่: ........ / ........ / ................ (พร้อมประทับตราสำคัญ)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// 2. ตารางเปรียบเทียบราคา (Price Comparison Matrix) - ตามต้นฉบับเป๊ะ 100%
// -------------------------------------------------------------------------
export function ComparisonMatrixTemplate({
  company = DEFAULT_SAMPLE_COMPANY,
  docNo = 'CS-2026-08-012',
  docDate = '18 สิงหาคม 2569',
  projectName = 'โครงการก่อสร้างทางหลวงหมายเลข 24 ตอนประโคนชัย-บุรีรัมย์ ตอน 2',
  projectCode = 'BTC-HW24-2026',
  budget = 450000
}: {
  company?: CompanyInfo;
  docNo?: string;
  docDate?: string;
  projectName?: string;
  projectCode?: string;
  budget?: number;
}) {
  return (
    <div className="space-y-4 text-slate-900 text-xs leading-relaxed bg-white p-6 border border-slate-300 print:border-none print:p-0">
      {/* Header Box */}
      <div className="border border-slate-900 p-3 bg-white">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3 flex-1 pr-2">
            {company.logo ? (
              <img 
                src={company.logo} 
                alt={company.name} 
                className="w-12 h-12 object-contain shrink-0 rounded"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : null}
            <div className="space-y-0.5 min-w-0">
              <h1 className="text-base font-extrabold text-slate-950 tracking-tight">
                {company.name}
              </h1>
              <p className="text-[10px] font-bold text-slate-800">
                PROCUREMENT & CONTRACT MANAGEMENT DEPARTMENT
              </p>
              <p className="text-[9.5px] font-medium text-slate-700">
                รายงานการวิเคราะห์เปรียบเทียบราคาและคัดเลือกผู้ขาย (Vendor Selection Report)
              </p>
              <p className="text-[9.5px] text-slate-600">
                {company.address} • เลขประจำตัวผู้เสียภาษี: {company.taxId} • โทรศัพท์: {company.phone}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 border-l border-slate-300 pl-4 space-y-1 min-w-[210px]">
            <span className="inline-block px-2 py-0.5 text-[8.5px] font-black border border-slate-900 bg-purple-100 text-purple-950 rounded tracking-wider uppercase">
              เอกสารควบคุมภายใน / Internal Matrix
            </span>
            <h2 className="text-base font-black text-slate-950 tracking-tight uppercase leading-tight pt-0.5">
              ตารางเปรียบเทียบราคา
            </h2>
            <div className="text-[10px] font-bold text-slate-700 tracking-wider">
              (QUOTATION COMPARISON MATRIX)
            </div>
          </div>
        </div>
      </div>

      {/* Project & Doc Details Grid */}
      <div className="grid grid-cols-12 gap-2 text-[10px]">
        <div className="col-span-8 border border-slate-900 p-2 space-y-1 bg-white">
          <p><strong className="text-slate-800">โครงการ:</strong> {projectName}</p>
          <p><strong className="text-slate-800">รหัสโครงการ:</strong> {projectCode} | <strong className="text-slate-800">หมวดงาน:</strong> งานวัสดุโครงสร้าง (คอนกรีตและเหล็กเส้น)</p>
          <p><strong className="text-slate-800">งบประมาณที่ได้รับอนุมัติ (Budget):</strong> {budget.toLocaleString()}.00 บาท</p>
        </div>
        <div className="col-span-4 border border-slate-900 p-2 space-y-1 bg-white">
          <p><strong className="text-slate-800">เลขที่เปรียบเทียบ:</strong> {docNo}</p>
          <p><strong className="text-slate-800">วันที่จัดทำ:</strong> {docDate}</p>
          <p><strong className="text-slate-800">จำนวนผู้เสนอราคา:</strong> 3 ราย (ครบถ้วน)</p>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <table className="w-full text-[10px] border-collapse border border-slate-900">
        <thead>
          <tr className="bg-slate-100 font-bold border-b border-slate-900 text-slate-900 text-center">
            <th rowSpan={2} className="border-r border-slate-900 p-1.5 w-8">ลำดับ</th>
            <th rowSpan={2} className="border-r border-slate-900 p-1.5 text-left min-w-[130px]">รายการวัสดุ / สเปก</th>
            <th rowSpan={2} className="border-r border-slate-900 p-1.5 w-12">จำนวน</th>
            <th rowSpan={2} className="border-r border-slate-900 p-1.5 w-12">หน่วย</th>
            <th colSpan={2} className="border-r border-slate-900 p-1 bg-emerald-100/90 text-emerald-950 font-black border-b">
              ★ เจ้ารายที่ 1: บริษัท ซีแพคบุรีรัมย์คอนกรีต จำกัด (คัดเลือก)
            </th>
            <th colSpan={2} className="border-r border-slate-900 p-1 bg-slate-200 border-b">
              เจ้ารายที่ 2: บจก. สยามวัสดุภัณฑ์
            </th>
            <th colSpan={2} className="p-1 bg-slate-200 border-b">
              เจ้ารายที่ 3: หจก. อีสานค้าเหล็ก
            </th>
          </tr>
          <tr className="bg-slate-100 font-bold border-b border-slate-900 text-slate-900 text-center text-[9.5px]">
            <th className="border-r border-slate-900 p-1 w-16 bg-emerald-50">หน่วยละ</th>
            <th className="border-r border-slate-900 p-1 w-20 bg-emerald-50 text-emerald-950 font-black">รวมเงิน</th>
            <th className="border-r border-slate-900 p-1 w-16">หน่วยละ</th>
            <th className="border-r border-slate-900 p-1 w-20">รวมเงิน</th>
            <th className="border-r border-slate-900 p-1 w-16">หน่วยละ</th>
            <th className="p-1 w-20">รวมเงิน</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300">
          <tr>
            <td className="border-r border-slate-900 p-1.5 text-center font-bold">1</td>
            <td className="border-r border-slate-900 p-1.5 font-semibold text-slate-900">คอนกรีตผสมเสร็จ 240 ksc</td>
            <td className="border-r border-slate-900 p-1.5 text-center font-mono">150</td>
            <td className="border-r border-slate-900 p-1.5 text-center">ลบ.ม.</td>
            <td className="border-r border-slate-900 p-1.5 text-right font-mono bg-emerald-50/60 font-bold text-emerald-900">1,950</td>
            <td className="border-r border-slate-900 p-1.5 text-right font-mono bg-emerald-50/60 font-bold text-emerald-950">292,500</td>
            <td className="border-r border-slate-900 p-1.5 text-right font-mono">2,020</td>
            <td className="border-r border-slate-900 p-1.5 text-right font-mono">303,000</td>
            <td className="border-r border-slate-900 p-1.5 text-right font-mono">1,980</td>
            <td className="p-1.5 text-right font-mono">297,000</td>
          </tr>
          <tr>
            <td className="border-r border-slate-900 p-1.5 text-center font-bold">2</td>
            <td className="border-r border-slate-900 p-1.5 font-semibold text-slate-900">เหล็กข้ออ้อย DB12 SD40</td>
            <td className="border-r border-slate-900 p-1.5 text-center font-mono">450</td>
            <td className="border-r border-slate-900 p-1.5 text-center">เส้น</td>
            <td className="border-r border-slate-900 p-1.5 text-right font-mono bg-emerald-50/60 font-bold text-emerald-900">225</td>
            <td className="border-r border-slate-900 p-1.5 text-right font-mono bg-emerald-50/60 font-bold text-emerald-950">101,250</td>
            <td className="border-r border-slate-900 p-1.5 text-right font-mono">230</td>
            <td className="border-r border-slate-900 p-1.5 text-right font-mono">103,500</td>
            <td className="border-r border-slate-900 p-1.5 text-right font-mono">228</td>
            <td className="p-1.5 text-right font-mono">102,600</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 font-bold border-t border-slate-900">
            <td colSpan={4} className="p-1.5 border-r border-slate-900 text-right">รวมเงินก่อน VAT:</td>
            <td colSpan={2} className="p-1.5 border-r border-slate-900 text-right font-mono font-black bg-emerald-100/70 text-emerald-950">393,750.00</td>
            <td colSpan={2} className="p-1.5 border-r border-slate-900 text-right font-mono">406,500.00</td>
            <td colSpan={2} className="p-1.5 text-right font-mono">399,600.00</td>
          </tr>
          <tr className="bg-slate-100 font-bold border-t border-slate-300">
            <td colSpan={4} className="p-1.5 border-r border-slate-900 text-right">ภาษีมูลค่าเพิ่ม 7%:</td>
            <td colSpan={2} className="p-1.5 border-r border-slate-900 text-right font-mono font-bold bg-emerald-100/70 text-emerald-950">27,562.50</td>
            <td colSpan={2} className="p-1.5 border-r border-slate-900 text-right font-mono">28,455.00</td>
            <td colSpan={2} className="p-1.5 text-right font-mono">27,972.00</td>
          </tr>
          <tr className="bg-slate-200/90 font-black border-t border-slate-900 text-slate-950">
            <td colSpan={4} className="p-2 border-r border-slate-900 text-right text-[10.5px]">ยอดรวมสุทธิ (Grand Total):</td>
            <td colSpan={2} className="p-2 border-r border-slate-900 text-right font-mono font-black text-[11px] bg-emerald-200 text-emerald-950">
              421,312.50
            </td>
            <td colSpan={2} className="p-2 border-r border-slate-900 text-right font-mono text-[10.5px]">434,955.00</td>
            <td colSpan={2} className="p-2 text-right font-mono text-[10.5px]">427,572.00</td>
          </tr>
        </tfoot>
      </table>

      {/* Commercial & Technical Evaluation */}
      <div className="border border-slate-900 bg-white p-2.5 space-y-1.5 text-[10px]">
        <p className="font-bold text-slate-900 border-b border-slate-200 pb-1">ผลการประเมินเงื่อนไขทางการค้าและการจัดส่ง (Commercial Evaluation):</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-1.5 bg-emerald-50/80 border border-emerald-300 rounded space-y-0.5">
            <p className="font-bold text-emerald-950">1. บริษัท ซีแพคบุรีรัมย์คอนกรีต จำกัด (คัดเลือก)</p>
            <p>• เครดิตเทอม: <strong>45 วัน</strong></p>
            <p>• กำหนดส่ง: <strong>ภายใน 2 วัน</strong> (มีรถโม่พร้อม)</p>
            <p>• การรับประกัน: มอก. แท้ 100%</p>
          </div>
          <div className="p-1.5 bg-slate-50 border border-slate-300 rounded space-y-0.5">
            <p className="font-bold text-slate-900">2. บจก. สยามวัสดุภัณฑ์</p>
            <p>• เครดิตเทอม: 30 วัน</p>
            <p>• กำหนดส่ง: ภายใน 3 วัน</p>
            <p>• การรับประกัน: มอก.</p>
          </div>
          <div className="p-1.5 bg-slate-50 border border-slate-300 rounded space-y-0.5">
            <p className="font-bold text-slate-900">3. หจก. อีสานค้าเหล็ก</p>
            <p>• เครดิตเทอม: 30 วัน</p>
            <p>• กำหนดส่ง: ภายใน 4 วัน</p>
            <p>• การรับประกัน: มอก.</p>
          </div>
        </div>
      </div>

      {/* Reason for Selection & Committee Signatures */}
      <div className="border border-slate-900 bg-white p-2 text-[10px] space-y-1">
        <p className="font-bold text-slate-900">สรุปความเห็นของคณะกรรมการจัดซื้อ:</p>
        <p className="text-slate-800 leading-normal">
          คณะกรรมการได้พิจารณาแล้ว เห็นสมควรคัดเลือก <strong>บริษัท ซีแพคบุรีรัมย์คอนกรีต จำกัด</strong> เนื่องจากเสนอราคาต่ำสุด ถูกกว่าราคากลาง 28,687.50 บาท พร้อมทั้งให้ระยะเวลาเครดิตเทอมยาวนานที่สุด (45 วัน) และมีแพลนท์ปูนตั้งอยู่ใกล้โครงการทำให้จัดส่งได้รวดเร็วทันตามแผนงาน
        </p>
      </div>

      {/* 3 Signatures */}
      <div className="border border-slate-900 bg-white">
        <div className="grid grid-cols-3 divide-x divide-slate-900 text-center">
          <div className="p-2.5 space-y-1.5">
            <p className="font-bold text-slate-800 text-[10px]">ผู้จัดทำตารางเปรียบเทียบ</p>
            <div className="pt-5">
              <div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1">( นายวิศวกร มั่นคง )</p>
              <p className="text-slate-500 text-[9px]">เจ้าหน้าที่จัดซื้อโครงการ</p>
            </div>
          </div>
          <div className="p-2.5 space-y-1.5 bg-slate-50/50">
            <p className="font-bold text-slate-800 text-[10px]">ผู้ตรวจสอบด้านวิศวกรรม</p>
            <div className="pt-5">
              <div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1">( วิศวกร ชาญชัย สย.99887 )</p>
              <p className="text-slate-500 text-[9px]">วิศวกรประจำโครงการ</p>
            </div>
          </div>
          <div className="p-2.5 space-y-1.5">
            <p className="font-bold text-slate-800 text-[10px]">ผู้อนุมัติผลการคัดเลือก</p>
            <div className="pt-5">
              <div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1">( นายวิชัย นพสุวรรณวงศ์ )</p>
              <p className="text-slate-500 text-[9px]">กรรมการผู้จัดการ / ผู้มีอำนาจ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// 3. ใบขออนุมัติสั่งซื้อ (PA) - ตามต้นฉบับเป๊ะ 100%
// -------------------------------------------------------------------------
export function PAApprovalTemplate({
  company = DEFAULT_SAMPLE_COMPANY,
  paNo = 'PA-2026-08-044',
  docDate = '20 สิงหาคม 2569',
  vendorName = 'บริษัท ซีแพคบุรีรัมย์คอนกรีต จำกัด',
  projectName = 'โครงการก่อสร้างทางหลวงหมายเลข 24 ตอนประโคนชัย-บุรีรัมย์ ตอน 2',
  comparisonRef = 'CS-2026-08-012',
  deliveryLocation = 'หน้างานตอน 2 กม. 205+000 ถ.สาย 24 อ.ประโคนชัย จ.บุรีรัมย์',
  creditTerm = 'เครดิต 45 วัน นับจากวันตรวจรับของ'
}: {
  company?: CompanyInfo;
  paNo?: string;
  docDate?: string;
  vendorName?: string;
  projectName?: string;
  comparisonRef?: string;
  deliveryLocation?: string;
  creditTerm?: string;
}) {
  return (
    <div className="space-y-4 text-slate-900 text-xs leading-relaxed bg-white p-6 border border-slate-300 print:border-none print:p-0">
      {/* Header Box */}
      <div className="border border-slate-900 p-3 bg-white">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3 flex-1 pr-2">
            {company.logo ? (
              <img 
                src={company.logo} 
                alt={company.name} 
                className="w-12 h-12 object-contain shrink-0 rounded"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : null}
            <div className="space-y-0.5 min-w-0">
              <h1 className="text-base font-extrabold text-slate-950 tracking-tight">
                {company.name}
              </h1>
              <p className="text-[10px] font-bold text-slate-800">
                INTERNAL PROCUREMENT & PURCHASE AUTHORIZATION
              </p>
              <p className="text-[9.5px] font-medium text-slate-700">
                ฝ่ายบริหารงานจัดซื้อและพัสดุโครงการ
              </p>
              <p className="text-[9.5px] text-slate-600">
                {company.address} • เลขประจำตัวผู้เสียภาษี: {company.taxId} • โทรศัพท์: {company.phone}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 border-l border-slate-300 pl-4 space-y-1 min-w-[210px]">
            <span className="inline-block px-2 py-0.5 text-[8.5px] font-black border border-slate-900 bg-emerald-100 text-emerald-950 rounded tracking-wider uppercase">
              ใบขออนุมัติสั่งซื้อ / PA Note
            </span>
            <h2 className="text-base font-black text-slate-950 tracking-tight uppercase leading-tight pt-0.5">
              ใบอนุมัติสั่งซื้อวัสดุ
            </h2>
            <div className="text-[10px] font-bold text-slate-700 tracking-wider">
              (PROCUREMENT APPROVAL : PA)
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-12 gap-2 text-[10px]">
        <div className="col-span-7 border border-slate-900 p-2 space-y-1 bg-white">
          <p><strong className="text-slate-800">โครงการ:</strong> {projectName}</p>
          <p><strong className="text-slate-800">ผู้ขายที่เสนอสั่งซื้อ:</strong> <span className="font-bold text-emerald-900">{vendorName}</span></p>
          <p><strong className="text-slate-800">สถานที่ส่งมอบ:</strong> {deliveryLocation}</p>
          <p><strong className="text-slate-800">เงื่อนไขการชำระเงิน:</strong> {creditTerm}</p>
        </div>
        <div className="col-span-5 border border-slate-900 p-2 space-y-1 bg-white">
          <p><strong className="text-slate-800">เลขที่ PA:</strong> {paNo}</p>
          <p><strong className="text-slate-800">วันที่ขออนุมัติ:</strong> {docDate}</p>
          <p><strong className="text-slate-800">อ้างอิงตารางเปรียบเทียบ:</strong> {comparisonRef}</p>
          <p><strong className="text-slate-800">ประเภทงบประมาณ:</strong> งบประมาณหลักในสัญญา (BOQ Direct)</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-[10px] border-collapse border border-slate-900">
        <thead>
          <tr className="bg-slate-100 font-bold border-b border-slate-900 text-slate-900 text-center">
            <th className="border-r border-slate-900 p-1.5 w-10">ลำดับ</th>
            <th className="border-r border-slate-900 p-1.5 text-left">รายการวัสดุที่ขออนุมัติสั่งซื้อ</th>
            <th className="border-r border-slate-900 p-1.5 w-16">จำนวน</th>
            <th className="border-r border-slate-900 p-1.5 w-14">หน่วย</th>
            <th className="border-r border-slate-900 p-1.5 w-24">ราคา/หน่วย</th>
            <th className="p-1.5 w-28">จำนวนเงิน (บาท)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300">
          <tr>
            <td className="border-r border-slate-900 p-2 text-center font-bold">1</td>
            <td className="border-r border-slate-900 p-2 font-bold text-slate-950">คอนกรีตผสมเสร็จ 240 ksc (Cylinder) มอก.</td>
            <td className="border-r border-slate-900 p-2 text-center font-mono">150</td>
            <td className="border-r border-slate-900 p-2 text-center">ลบ.ม.</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono">1,950.00</td>
            <td className="p-2 text-right font-mono font-bold">292,500.00</td>
          </tr>
          <tr>
            <td className="border-r border-slate-900 p-2 text-center font-bold">2</td>
            <td className="border-r border-slate-900 p-2 font-bold text-slate-950">เหล็กเส้นข้ออ้อย DB12 SD40 (ยาว 10 ม.) มอก.</td>
            <td className="border-r border-slate-900 p-2 text-center font-mono">450</td>
            <td className="border-r border-slate-900 p-2 text-center">เส้น</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono">225.00</td>
            <td className="p-2 text-right font-mono font-bold">101,250.00</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-slate-50 font-bold border-t border-slate-900">
            <td colSpan={4} className="p-1.5 border-r border-slate-900 text-right">รวมเงินก่อนภาษี:</td>
            <td colSpan={2} className="p-1.5 text-right font-mono">393,750.00 บาท</td>
          </tr>
          <tr className="bg-slate-50 font-bold border-t border-slate-300">
            <td colSpan={4} className="p-1.5 border-r border-slate-900 text-right">ภาษีมูลค่าเพิ่ม 7%:</td>
            <td colSpan={2} className="p-1.5 text-right font-mono">+27,562.50 บาท</td>
          </tr>
          <tr className="bg-slate-900 font-black border-t border-slate-900 text-white">
            <td colSpan={4} className="p-2 border-r border-slate-700 text-right text-amber-300 text-[11px]">ยอดรวมสุทธิที่ขออนุมัติ:</td>
            <td colSpan={2} className="p-2 text-right font-mono text-amber-300 font-black text-sm">421,312.50 บาท</td>
          </tr>
        </tfoot>
      </table>

      <div className="border border-slate-900 p-2 text-[10px] bg-slate-50 flex justify-between items-center">
        <span>จำนวนเงินตัวอักษร: <strong>สี่แสนสองหมื่นหนึ่งพันสามร้อยสิบสองบาทห้าสิบสตางค์</strong></span>
        <span className="text-emerald-800 font-bold">✓ อยู่ในกรอบงบประมาณ (ประหยัดกว่า BOQ 28,687.50 บาท)</span>
      </div>

      {/* Signatures */}
      <div className="border border-slate-900 bg-white">
        <div className="grid grid-cols-4 divide-x divide-slate-900 text-center text-[9px]">
          <div className="p-2 space-y-1">
            <p className="font-bold text-slate-800">ผู้ขออนุมัติ (จัดซื้อ)</p>
            <div className="pt-5">
              <div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1">( นายวิศวกร มั่นคง )</p>
              <p className="text-slate-500 text-[8px]">เจ้าหน้าที่จัดซื้อ</p>
            </div>
          </div>
          <div className="p-2 space-y-1 bg-slate-50/50">
            <p className="font-bold text-slate-800">ผู้ตรวจสอบ (วิศวกร)</p>
            <div className="pt-5">
              <div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1">( วิศวกร ชาญชัย )</p>
              <p className="text-slate-500 text-[8px]">วิศวกรโครงการ</p>
            </div>
          </div>
          <div className="p-2 space-y-1">
            <p className="font-bold text-slate-800">ผู้ตรวจสอบงบประมาณ</p>
            <div className="pt-5">
              <div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1">( น.ส. รัตนา การเงิน )</p>
              <p className="text-slate-500 text-[8px]">ผู้จัดการฝ่ายบัญชี/การเงิน</p>
            </div>
          </div>
          <div className="p-2 space-y-1 bg-emerald-50/30">
            <p className="font-bold text-slate-800">ผู้อนุมัติสั่งซื้อ (MD)</p>
            <div className="pt-5">
              <div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1">( นายวิชัย นพสุวรรณวงศ์ )</p>
              <p className="text-slate-500 text-[8px]">กรรมการผู้จัดการ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
