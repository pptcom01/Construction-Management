import React from 'react';
import { CompanyInfo } from './types';
import { DEFAULT_SAMPLE_COMPANY } from './types';

// -------------------------------------------------------------------------
// 8. ใบแสดงปริมาณงาน ราคา และถอดรายการวัสดุ (BOQ & BOM) - ตามต้นฉบับเป๊ะ 100%
// -------------------------------------------------------------------------
export function ProjectBOQTemplate({
  company = DEFAULT_SAMPLE_COMPANY,
  boqNo = 'BTC-HW24-2026',
  docDate = '15 สิงหาคม 2569',
  projectName = 'โครงการก่อสร้างทางหลวงหมายเลข 24 ตอนประโคนชัย-บุรีรัมย์ ตอน 2',
  location = 'หน้างานตอน 2 กม. 205+000 ถ.สาย 24 อ.ประโคนชัย จ.บุรีรัมย์'
}: {
  company?: CompanyInfo;
  boqNo?: string;
  docDate?: string;
  projectName?: string;
  location?: string;
}) {
  return (
    <div className="space-y-3 text-slate-900 text-[9.5px] leading-tight bg-white p-6 border border-slate-300 print:border-none print:p-0">
      {/* Title Box */}
      <div className="border border-slate-900 p-2.5 mb-2 bg-white space-y-1">
        <div className="flex justify-end items-center">
          <span className="inline-block px-2.5 py-0.5 text-[8.5px] font-black border border-slate-900 bg-slate-100 text-slate-900 rounded tracking-wider uppercase">
            เอกสารต้นฉบับ / Original BOQ
          </span>
        </div>
        <div className="text-center">
          <h1 className="text-base font-black text-slate-950 tracking-tight uppercase">
            ใบแสดงปริมาณงาน ราคา และถอดรายการวัสดุ (BOQ & BOM Comprehensive Document)
          </h1>
          <div className="text-[9px] font-bold text-slate-700 tracking-wider">
            (CONTRACT BOQ, SITE ACTUAL, VARIANCE ANALYSIS & BOM MATERIAL BREAKDOWN)
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-12 gap-2 mb-2">
        <div className="col-span-7 border border-slate-900 bg-white">
          <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5">
            ส่วนที่ 1: ข้อมูลโครงการ (Project Details)
          </div>
          <div className="p-1.5 space-y-1">
            <p><strong className="w-28 inline-block">ชื่อโครงการ:</strong> {projectName}</p>
            <p><strong className="w-28 inline-block">สถานที่ก่อสร้าง:</strong> {location}</p>
            <p><strong className="w-28 inline-block">ผู้ว่าจ้าง:</strong> {company.name}</p>
          </div>
        </div>
        <div className="col-span-5 border border-slate-900 bg-white">
          <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5">
            ส่วนที่ 2: อ้างอิงเอกสาร (Doc Reference)
          </div>
          <div className="p-1.5 space-y-1">
            <p><strong className="w-24 inline-block">เลขที่ BOQ:</strong> <span className="font-mono font-bold">{boqNo}</span></p>
            <p><strong className="w-24 inline-block">วันที่สำรวจ:</strong> {docDate}</p>
            <p><strong className="w-24 inline-block">สกุลเงิน:</strong> THB (บาทไทย)</p>
          </div>
        </div>
      </div>

      {/* BOQ Table */}
      <div className="border border-slate-900 mb-2 overflow-x-auto">
        <table className="w-full text-[9px] border-collapse">
          <thead>
            <tr className="bg-slate-100 font-bold border-b border-slate-900 text-slate-900 text-center">
              <th rowSpan={2} className="border-r border-slate-900 p-1 w-10">รหัส</th>
              <th rowSpan={2} className="border-r border-slate-900 p-1 text-left min-w-[170px]">รายการงานและถอดประกอบวัสดุ (BOM)</th>
              <th rowSpan={2} className="border-r border-slate-900 p-1 w-10">หน่วย</th>
              <th colSpan={3} className="border-r border-slate-900 p-0.5 bg-slate-200">ตามสัญญา (Contract BOQ)</th>
              <th colSpan={3} className="border-r border-slate-900 p-0.5 bg-indigo-100 text-indigo-950">หน้างานจริง (Site Actual)</th>
              <th colSpan={2} className="border-r border-slate-900 p-0.5 bg-amber-100 text-amber-950">ผลต่าง (Variance)</th>
              <th rowSpan={2} className="p-1 w-20 text-left">หมายเหตุ</th>
            </tr>
            <tr className="bg-slate-100 font-bold border-b border-slate-900 text-slate-900 text-center text-[8px]">
              <th className="border-r border-slate-900 p-0.5 w-10">ปริมาณ</th>
              <th className="border-r border-slate-900 p-0.5 w-12">ราคา</th>
              <th className="border-r border-slate-900 p-0.5 w-14">รวมเงิน</th>
              <th className="border-r border-slate-900 p-0.5 w-10 bg-indigo-50 text-indigo-950">ปริมาณ</th>
              <th className="border-r border-slate-900 p-0.5 w-12 bg-indigo-50 text-indigo-950">ราคา</th>
              <th className="border-r border-slate-900 p-0.5 w-14 bg-indigo-50 text-indigo-950">รวมเงิน</th>
              <th className="border-r border-slate-900 p-0.5 w-12 bg-amber-50 text-amber-950">เงินต่าง</th>
              <th className="border-r border-slate-900 p-0.5 w-8 bg-amber-50 text-amber-950">%</th>
            </tr>
          </thead>
          <tbody>
            {/* 1.0 */}
            <tr className="bg-slate-200/80 font-bold border-t border-b border-slate-900">
              <td className="border-r border-slate-900 p-1 text-center font-mono">1.0</td>
              <td colSpan={2} className="border-r border-slate-900 p-1 text-left font-black text-slate-950">หมวดงานเตรียมการและงานดิน (Preliminary & Earthworks)</td>
              <td colSpan={2} className="border-r border-slate-900 p-1 text-right">รวมหมวดสัญญา:</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-black">80,350.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-1 text-right text-indigo-950">รวมหน้างาน:</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-black text-indigo-950">79,280.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-black text-emerald-800">+1,070.00</td>
              <td className="border-r border-slate-900 p-1 text-center font-mono">1.3%</td>
              <td className="p-1"></td>
            </tr>
            {/* 1.1 */}
            <tr className="hover:bg-slate-50 border-b border-slate-200">
              <td className="border-r border-slate-900 p-1 text-center font-mono font-medium">1.1</td>
              <td className="border-r border-slate-900 p-1 text-left font-bold text-slate-900">งานขุดดินฐานรากและกลบกลับ</td>
              <td className="border-r border-slate-900 p-1 text-center">ลบ.ม.</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono">45.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono">150.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-semibold">6,750.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono text-indigo-950 bg-indigo-50/40">52.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono text-indigo-950 bg-indigo-50/40">140.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-bold text-indigo-950 bg-indigo-50/40">7,280.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-bold text-rose-700">-530.00</td>
              <td className="border-r border-slate-900 p-1 text-center font-mono text-[8px] text-rose-700">-7.9%</td>
              <td className="p-1 text-[8px] text-slate-600">ขุดขยายตามชั้นดินจริง</td>
            </tr>
            <tr className="bg-slate-50/70 text-[8px] italic text-slate-700 border-b border-slate-100">
              <td className="border-r border-slate-900 p-0.5 text-center font-mono text-slate-400">└</td>
              <td className="border-r border-slate-900 p-0.5 pl-4 text-left"><span className="text-slate-500 font-sans">BOM:</span> ค่าขุดรถแม็คโครเล็ก</td>
              <td className="border-r border-slate-900 p-0.5 text-center">ลบ.ม.</td>
              <td colSpan={3} className="border-r border-slate-900 p-0.5 text-center text-slate-400 font-sans">ถอดปริมาณในไซต์</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">52.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">90.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-800">4,680.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-0.5 text-center text-slate-400">-</td>
              <td className="p-0.5 text-slate-500">เช่าเหมาวัน</td>
            </tr>
            <tr className="bg-slate-50/70 text-[8px] italic text-slate-700 border-b border-slate-100">
              <td className="border-r border-slate-900 p-0.5 text-center font-mono text-slate-400">└</td>
              <td className="border-r border-slate-900 p-0.5 pl-4 text-left"><span className="text-slate-500 font-sans">BOM:</span> ค่าแรงคนงานกลบดินแน่น</td>
              <td className="border-r border-slate-900 p-0.5 text-center">ลบ.ม.</td>
              <td colSpan={3} className="border-r border-slate-900 p-0.5 text-center text-slate-400 font-sans">ถอดปริมาณในไซต์</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">52.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">50.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-800">2,600.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-0.5 text-center text-slate-400">-</td>
              <td className="p-0.5 text-slate-500">แรงงานสัดส่วนจริง</td>
            </tr>
            {/* 1.2 */}
            <tr className="hover:bg-slate-50 border-b border-slate-200">
              <td className="border-r border-slate-900 p-1 text-center font-mono font-medium">1.2</td>
              <td className="border-r border-slate-900 p-1 text-left font-bold text-slate-900">งานเสาเข็มคอนกรีตอัดแรง I-26 (ยาว 21 ม.)</td>
              <td className="border-r border-slate-900 p-1 text-center">ต้น</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono">16.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono">4,600.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-semibold">73,600.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono text-indigo-950 bg-indigo-50/40">16.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono text-indigo-950 bg-indigo-50/40">4,500.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-bold text-indigo-950 bg-indigo-50/40">72,000.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-bold text-emerald-700">+1,600.00</td>
              <td className="border-r border-slate-900 p-1 text-center font-mono text-[8px] text-emerald-700">2.2%</td>
              <td className="p-1 text-[8px] text-slate-600">ลดค่าบริการรถตอก</td>
            </tr>
            <tr className="bg-slate-50/70 text-[8px] italic text-slate-700 border-b border-slate-100">
              <td className="border-r border-slate-900 p-0.5 text-center font-mono text-slate-400">└</td>
              <td className="border-r border-slate-900 p-0.5 pl-4 text-left"><span className="text-slate-500 font-sans">BOM:</span> เสาเข็มไอ I-26 มอก.</td>
              <td className="border-r border-slate-900 p-0.5 text-center">ต้น</td>
              <td colSpan={3} className="border-r border-slate-900 p-0.5 text-center text-slate-400 font-sans">ถอดปริมาณในไซต์</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">16.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">3,700.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-800">59,200.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-0.5 text-center text-slate-400">-</td>
              <td className="p-0.5 text-slate-500">สั่งซื้อตรงจากโรงงาน</td>
            </tr>
            <tr className="bg-slate-50/70 text-[8px] italic text-slate-700 border-b border-slate-100">
              <td className="border-r border-slate-900 p-0.5 text-center font-mono text-slate-400">└</td>
              <td className="border-r border-slate-900 p-0.5 pl-4 text-left"><span className="text-slate-500 font-sans">BOM:</span> ค่าตอกเสาเข็มด้วยปั้นจั่น</td>
              <td className="border-r border-slate-900 p-0.5 text-center">ต้น</td>
              <td colSpan={3} className="border-r border-slate-900 p-0.5 text-center text-slate-400 font-sans">ถอดปริมาณในไซต์</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">16.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">800.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-800">12,800.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-0.5 text-center text-slate-400">-</td>
              <td className="p-0.5 text-slate-500">ค่าแรงตอก</td>
            </tr>

            {/* 2.0 */}
            <tr className="bg-slate-200/80 font-bold border-t border-b border-slate-900">
              <td className="border-r border-slate-900 p-1 text-center font-mono">2.0</td>
              <td colSpan={2} className="border-r border-slate-900 p-1 text-left font-black text-slate-950">หมวดงานโครงสร้างอาคาร (Structural Works)</td>
              <td colSpan={2} className="border-r border-slate-900 p-1 text-right">รวมหมวดสัญญา:</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-black">324,150.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-1 text-right text-indigo-950">รวมหน้างาน:</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-black text-indigo-950">309,500.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-black text-emerald-800">+14,650.00</td>
              <td className="border-r border-slate-900 p-1 text-center font-mono">4.5%</td>
              <td className="p-1"></td>
            </tr>
            {/* 2.1 */}
            <tr className="hover:bg-slate-50 border-b border-slate-200">
              <td className="border-r border-slate-900 p-1 text-center font-mono font-medium">2.1</td>
              <td className="border-r border-slate-900 p-1 text-left font-bold text-slate-900">งานคอนกรีตโครงสร้าง (240 ksc cube)</td>
              <td className="border-r border-slate-900 p-1 text-center">ลบ.ม.</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono">65.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono">2,550.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-semibold">165,750.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono text-indigo-950 bg-indigo-50/40">68.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono text-indigo-950 bg-indigo-50/40">2,500.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-bold text-indigo-950 bg-indigo-50/40">170,000.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-bold text-rose-700">-4,250.00</td>
              <td className="border-r border-slate-900 p-1 text-center font-mono text-[8px] text-rose-700">-2.6%</td>
              <td className="p-1 text-[8px] text-slate-600">เพิ่มปริมาณคานคอดิน</td>
            </tr>
            <tr className="bg-slate-50/70 text-[8px] italic text-slate-700 border-b border-slate-100">
              <td className="border-r border-slate-900 p-0.5 text-center font-mono text-slate-400">└</td>
              <td className="border-r border-slate-900 p-0.5 pl-4 text-left"><span className="text-slate-500 font-sans">BOM:</span> คอนกรีตผสมเสร็จ CPAC 240 ksc</td>
              <td className="border-r border-slate-900 p-0.5 text-center">ลบ.ม.</td>
              <td colSpan={3} className="border-r border-slate-900 p-0.5 text-center text-slate-400 font-sans">ถอดปริมาณในไซต์</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">68.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">2,050.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-800">139,400.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-0.5 text-center text-slate-400">-</td>
              <td className="p-0.5 text-slate-500">รวมรถปั๊ม</td>
            </tr>
            <tr className="bg-slate-50/70 text-[8px] italic text-slate-700 border-b border-slate-100">
              <td className="border-r border-slate-900 p-0.5 text-center font-mono text-slate-400">└</td>
              <td className="border-r border-slate-900 p-0.5 pl-4 text-left"><span className="text-slate-500 font-sans">BOM:</span> ค่าแรงเทและเข้าแบบคอนกรีต</td>
              <td className="border-r border-slate-900 p-0.5 text-center">ลบ.ม.</td>
              <td colSpan={3} className="border-r border-slate-900 p-0.5 text-center text-slate-400 font-sans">ถอดปริมาณในไซต์</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">68.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">450.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-800">30,600.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-0.5 text-center text-slate-400">-</td>
              <td className="p-0.5 text-slate-500">ผูกเหมาค่าน้ำปูน</td>
            </tr>
            {/* 2.2 */}
            <tr className="hover:bg-slate-50 border-b border-slate-200">
              <td className="border-r border-slate-900 p-1 text-center font-mono font-medium">2.2</td>
              <td className="border-r border-slate-900 p-1 text-left font-bold text-slate-900">งานเหล็กเสริมโครงสร้าง (RB & DB)</td>
              <td className="border-r border-slate-900 p-1 text-center">กก.</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono">4,800.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono">33.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-semibold">158,400.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono text-indigo-950 bg-indigo-50/40">4,500.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono text-indigo-950 bg-indigo-50/40">31.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-bold text-indigo-950 bg-indigo-50/40">139,500.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-bold text-emerald-700">+18,900.00</td>
              <td className="border-r border-slate-900 p-1 text-center font-mono text-[8px] text-emerald-700">11.9%</td>
              <td className="p-1 text-[8px] text-slate-600">ประหยัดจากการตัดเหล็ก (Gain)</td>
            </tr>
            <tr className="bg-slate-50/70 text-[8px] italic text-slate-700 border-b border-slate-100">
              <td className="border-r border-slate-900 p-0.5 text-center font-mono text-slate-400">└</td>
              <td className="border-r border-slate-900 p-0.5 pl-4 text-left"><span className="text-slate-500 font-sans">BOM:</span> เหล็กเส้นข้ออ้อย DB12 / DB16 SD40</td>
              <td className="border-r border-slate-900 p-0.5 text-center">กก.</td>
              <td colSpan={3} className="border-r border-slate-900 p-0.5 text-center text-slate-400 font-sans">ถอดปริมาณในไซต์</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">3,500.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">25.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-800">87,500.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-0.5 text-center text-slate-400">-</td>
              <td className="p-0.5 text-slate-500">มอก. เกรดโรงใหญ่</td>
            </tr>
            <tr className="bg-slate-50/70 text-[8px] italic text-slate-700 border-b border-slate-100">
              <td className="border-r border-slate-900 p-0.5 text-center font-mono text-slate-400">└</td>
              <td className="border-r border-slate-900 p-0.5 pl-4 text-left"><span className="text-slate-500 font-sans">BOM:</span> เหล็กเส้นกลม RB9 SD30</td>
              <td className="border-r border-slate-900 p-0.5 text-center">กก.</td>
              <td colSpan={3} className="border-r border-slate-900 p-0.5 text-center text-slate-400 font-sans">ถอดปริมาณในไซต์</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">1,000.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">24.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-800">24,000.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-0.5 text-center text-slate-400">-</td>
              <td className="p-0.5 text-slate-500">ทำเหล็กปลอก</td>
            </tr>
            <tr className="bg-slate-50/70 text-[8px] italic text-slate-700 border-b border-slate-100">
              <td className="border-r border-slate-900 p-0.5 text-center font-mono text-slate-400">└</td>
              <td className="border-r border-slate-900 p-0.5 pl-4 text-left"><span className="text-slate-500 font-sans">BOM:</span> ลวดผูกเหล็ก #18 & ค่าแรงผูก</td>
              <td className="border-r border-slate-900 p-0.5 text-center">กก.</td>
              <td colSpan={3} className="border-r border-slate-900 p-0.5 text-center text-slate-400 font-sans">ถอดปริมาณในไซต์</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">4,500.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">6.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-800">27,000.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-0.5 text-center text-slate-400">-</td>
              <td className="p-0.5 text-slate-500">รวมอุปกรณ์ถัก</td>
            </tr>

            {/* 3.0 */}
            <tr className="bg-slate-200/80 font-bold border-t border-b border-slate-900">
              <td className="border-r border-slate-900 p-1 text-center font-mono">3.0</td>
              <td colSpan={2} className="border-r border-slate-900 p-1 text-left font-black text-slate-950">หมวดงานสถาปัตยกรรม (Architectural Works)</td>
              <td colSpan={2} className="border-r border-slate-900 p-1 text-right">รวมหมวดสัญญา:</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-black">193,200.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-1 text-right text-indigo-950">รวมหน้างาน:</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-black text-indigo-950">201,100.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-black text-rose-800">-7,900.00</td>
              <td className="border-r border-slate-900 p-1 text-center font-mono">-4.1%</td>
              <td className="p-1"></td>
            </tr>
            {/* 3.1 */}
            <tr className="hover:bg-slate-50 border-b border-slate-200">
              <td className="border-r border-slate-900 p-1 text-center font-mono font-medium">3.1</td>
              <td className="border-r border-slate-900 p-1 text-left font-bold text-slate-900">งานก่อผนังอิฐมวลเบา หนา 7.5 ซม.</td>
              <td className="border-r border-slate-900 p-1 text-center">ตร.ม.</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono">280.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono">330.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-semibold">92,400.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono text-indigo-950 bg-indigo-50/40">270.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono text-indigo-950 bg-indigo-50/40">320.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-bold text-indigo-950 bg-indigo-50/40">86,400.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-bold text-emerald-700">+6,000.00</td>
              <td className="border-r border-slate-900 p-1 text-center font-mono text-[8px] text-emerald-700">6.5%</td>
              <td className="p-1 text-[8px] text-slate-600">ปรับลดตามช่องเปิดประตู</td>
            </tr>
            <tr className="bg-slate-50/70 text-[8px] italic text-slate-700 border-b border-slate-100">
              <td className="border-r border-slate-900 p-0.5 text-center font-mono text-slate-400">└</td>
              <td className="border-r border-slate-900 p-0.5 pl-4 text-left"><span className="text-slate-500 font-sans">BOM:</span> อิฐมวลเบา Superblock 7.5cm</td>
              <td className="border-r border-slate-900 p-0.5 text-center">ก้อน</td>
              <td colSpan={3} className="border-r border-slate-900 p-0.5 text-center text-slate-400 font-sans">ถอดปริมาณในไซต์</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">2,250.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">21.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-800">47,250.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-0.5 text-center text-slate-400">-</td>
              <td className="p-0.5 text-slate-500">8.33 ก้อน/ตร.ม.</td>
            </tr>
            <tr className="bg-slate-50/70 text-[8px] italic text-slate-700 border-b border-slate-100">
              <td className="border-r border-slate-900 p-0.5 text-center font-mono text-slate-400">└</td>
              <td className="border-r border-slate-900 p-0.5 pl-4 text-left"><span className="text-slate-500 font-sans">BOM:</span> ปูนก่ออิฐมวลเบา + ปูนฉาบ</td>
              <td className="border-r border-slate-900 p-0.5 text-center">ตร.ม.</td>
              <td colSpan={3} className="border-r border-slate-900 p-0.5 text-center text-slate-400 font-sans">ถอดปริมาณในไซต์</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">270.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">65.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-800">17,550.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-0.5 text-center text-slate-400">-</td>
              <td className="p-0.5 text-slate-500">ลูกปูนถุงสำเร็จ</td>
            </tr>
            <tr className="bg-slate-50/70 text-[8px] italic text-slate-700 border-b border-slate-100">
              <td className="border-r border-slate-900 p-0.5 text-center font-mono text-slate-400">└</td>
              <td className="border-r border-slate-900 p-0.5 pl-4 text-left"><span className="text-slate-500 font-sans">BOM:</span> ค่าแรงก่อและฉาบผนัง</td>
              <td className="border-r border-slate-900 p-0.5 text-center">ตร.ม.</td>
              <td colSpan={3} className="border-r border-slate-900 p-0.5 text-center text-slate-400 font-sans">ถอดปริมาณในไซต์</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">270.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">110.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-800">29,700.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-0.5 text-center text-slate-400">-</td>
              <td className="p-0.5 text-slate-500">ช่างฝีมือ</td>
            </tr>
            {/* 3.2 */}
            <tr className="hover:bg-slate-50 border-b border-slate-200">
              <td className="border-r border-slate-900 p-1 text-center font-mono font-medium">3.2</td>
              <td className="border-r border-slate-900 p-1 text-left font-bold text-slate-900">งานปูกระเบื้องแกรนิตโต้ 60x60 ซม.</td>
              <td className="border-r border-slate-900 p-1 text-center">ตร.ม.</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono">180.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono">560.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-semibold">100,800.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono text-indigo-950 bg-indigo-50/40">185.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono text-indigo-950 bg-indigo-50/40">620.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-bold text-indigo-950 bg-indigo-50/40">114,700.00</td>
              <td className="border-r border-slate-900 p-1 text-right font-mono font-bold text-rose-700">-13,900.00</td>
              <td className="border-r border-slate-900 p-1 text-center font-mono text-[8px] text-rose-700">-13.8%</td>
              <td className="p-1 text-[8px] text-slate-600">เลือกลายพรีเมียม (Loss)</td>
            </tr>
            <tr className="bg-slate-50/70 text-[8px] italic text-slate-700 border-b border-slate-100">
              <td className="border-r border-slate-900 p-0.5 text-center font-mono text-slate-400">└</td>
              <td className="border-r border-slate-900 p-0.5 pl-4 text-left"><span className="text-slate-500 font-sans">BOM:</span> กระเบื้องแกรนิตโต้ผิวมัน 60x60</td>
              <td className="border-r border-slate-900 p-0.5 text-center">ตร.ม.</td>
              <td colSpan={3} className="border-r border-slate-900 p-0.5 text-center text-slate-400 font-sans">ถอดปริมาณในไซต์</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">185.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">420.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-800">77,700.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-0.5 text-center text-slate-400">-</td>
              <td className="p-0.5 text-slate-500">เกรดส่งออก</td>
            </tr>
            <tr className="bg-slate-50/70 text-[8px] italic text-slate-700 border-b border-slate-100">
              <td className="border-r border-slate-900 p-0.5 text-center font-mono text-slate-400">└</td>
              <td className="border-r border-slate-900 p-0.5 pl-4 text-left"><span className="text-slate-500 font-sans">BOM:</span> ปูนกาวปูกระเบื้อง + ยาแนว</td>
              <td className="border-r border-slate-900 p-0.5 text-center">ตร.ม.</td>
              <td colSpan={3} className="border-r border-slate-900 p-0.5 text-center text-slate-400 font-sans">ถอดปริมาณในไซต์</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">185.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">50.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-800">9,250.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-0.5 text-center text-slate-400">-</td>
              <td className="p-0.5 text-slate-500">ปูนกาวเวเบอร์</td>
            </tr>
            <tr className="bg-slate-50/70 text-[8px] italic text-slate-700 border-b border-slate-100">
              <td className="border-r border-slate-900 p-0.5 text-center font-mono text-slate-400">└</td>
              <td className="border-r border-slate-900 p-0.5 pl-4 text-left"><span className="text-slate-500 font-sans">BOM:</span> ค่าแรงปูกระเบื้อง</td>
              <td className="border-r border-slate-900 p-0.5 text-center">ตร.ม.</td>
              <td colSpan={3} className="border-r border-slate-900 p-0.5 text-center text-slate-400 font-sans">ถอดปริมาณในไซต์</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">185.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-600">150.00</td>
              <td className="border-r border-slate-900 p-0.5 text-right font-mono text-slate-800">27,750.00</td>
              <td colSpan={2} className="border-r border-slate-900 p-0.5 text-center text-slate-400">-</td>
              <td className="p-0.5 text-slate-500">งานตัดเนี๊ยบ</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Variance & Grand Total Summary */}
      <div className="grid grid-cols-12 gap-2 mb-2">
        <div className="col-span-6 border border-slate-900 p-2 bg-white space-y-1">
          <div className="font-bold text-[10px] text-slate-950 border-b border-slate-200 pb-1">สรุปผลต่างต้นทุนตรง (Direct Cost Analysis):</div>
          <div className="flex justify-between"><span>1. ต้นทุนตรงตามสัญญา:</span><span className="font-mono font-bold">597,700.00 บาท</span></div>
          <div className="flex justify-between"><span>2. ต้นทุนตรงใช้จริงหน้างาน:</span><span className="font-mono font-bold text-indigo-950">589,880.00 บาท</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
            <span>ผลต่างประหยัด / ส่วนเกิน:</span>
            <span className="font-mono text-emerald-700">+7,820.00 บาท (ประหยัด)</span>
          </div>
        </div>
        <div className="col-span-6 border border-slate-900 p-2 bg-amber-50/20 space-y-1">
          <div className="font-bold text-[10px] text-slate-950 border-b border-slate-200 pb-1">การคำนวณ Factor F และยอดรวมสุทธิ:</div>
          <div className="flex justify-between"><span>ต้นทุนตรงจริง:</span><span className="font-mono">589,880.00</span></div>
          <div className="flex justify-between"><span>ค่าดำเนินการและกำไร (Factor F ~ 1.15):</span><span className="font-mono">+88,482.00</span></div>
          <div className="flex justify-between"><span>ภาษีมูลค่าเพิ่ม 7%:</span><span className="font-mono">+47,485.34</span></div>
          <div className="flex justify-between p-1 bg-slate-900 text-white font-black rounded-xs">
            <span className="text-amber-300">มูลค่างานรวมสุทธิทั้งสิ้น:</span>
            <span className="font-mono text-amber-300 text-xs">725,847.34 บาท</span>
          </div>
          <p className="text-[8px] text-slate-600 text-right pt-0.5">(เจ็ดแสนสองหมื่นห้าพันแปดร้อยสี่สิบเจ็ดบาทสามสิบสี่สตางค์)</p>
        </div>
      </div>

      {/* Signatures */}
      <div className="border border-slate-900 bg-white">
        <div className="grid grid-cols-4 divide-x divide-slate-900 text-center text-[8.5px]">
          <div className="p-1.5 space-y-1">
            <p className="font-bold text-slate-800">ผู้สำรวจและถอดแบบ (QS)</p>
            <div className="pt-4"><div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div><p className="font-bold text-slate-900 mt-0.5">( นายฉัตรชัย ถอดแบบ )</p></div>
          </div>
          <div className="p-1.5 space-y-1 bg-slate-50/50">
            <p className="font-bold text-slate-800">วิศวกรผู้ควบคุมงาน</p>
            <div className="pt-4"><div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div><p className="font-bold text-slate-900 mt-0.5">( วิศวกร ชาญชัย )</p></div>
          </div>
          <div className="p-1.5 space-y-1">
            <p className="font-bold text-slate-800">ผู้ตรวจสอบงบประมาณ</p>
            <div className="pt-4"><div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div><p className="font-bold text-slate-900 mt-0.5">( น.ส. กรรณิการ์ คุมงบ )</p></div>
          </div>
          <div className="p-1.5 space-y-1 bg-slate-50/50">
            <p className="font-bold text-slate-800">ผู้อนุมัติ (MD)</p>
            <div className="pt-4"><div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div><p className="font-bold text-slate-900 mt-0.5">( นายวิชัย นพสุวรรณวงศ์ )</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// 9. ใบรับรองการลงนามอิเล็กทรอนิกส์ (Audit Trail) - ตามต้นฉบับเป๊ะ 100%
// -------------------------------------------------------------------------
export function DigitalCertificateTemplate({
  company = DEFAULT_SAMPLE_COMPANY,
  envelopeId = 'ENV-2026-0803-8891-X7',
  docTitle = 'BTC-HW24-2026 - โครงการก่อสร้างทางหลวงหมายเลข 24 ตอนประโคนชัย-บุรีรัมย์ ตอน 2',
  createdTime = '03/08/2569 09:15:22 (GMT+7)',
  completedTime = '03/08/2569 14:30:45 (GMT+7)',
  sha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855a90e'
}: {
  company?: CompanyInfo;
  envelopeId?: string;
  docTitle?: string;
  createdTime?: string;
  completedTime?: string;
  sha256?: string;
}) {
  return (
    <div className="space-y-3 text-slate-900 text-[9.5px] leading-tight bg-white p-6 border border-slate-300 print:border-none print:p-0">
      {/* Header Box */}
      <div className="border border-slate-900 p-3 bg-slate-900 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xs font-extrabold tracking-wide uppercase text-blue-300">ใบรับรองการลงนามอิเล็กทรอนิกส์</h2>
          <h1 className="text-base font-black text-white tracking-tight uppercase">CERTIFICATE OF COMPLETION & AUDIT TRAIL</h1>
        </div>
        <div className="text-right">
          <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-extrabold uppercase">
            ✓ COMPLETED / ลงนามสมบูรณ์
          </span>
          <div className="text-[8px] text-slate-400 mt-0.5 font-mono">ENVELOPE ID: {envelopeId}</div>
        </div>
      </div>

      {/* Section 1: Summary */}
      <div className="border border-slate-900 bg-white p-2">
        <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 mb-1.5 flex justify-between">
          <span>1. ข้อมูลสรุปการลงนามเอกสาร (Document Signing Summary)</span>
          <span className="font-mono text-[8px] text-slate-300">ISO/IEC 27001 Compliant</span>
        </div>
        <div className="grid grid-cols-12 gap-2 text-[8.5px]">
          <div className="col-span-7 space-y-1">
            <p><strong>ชื่อเอกสารต้นฉบับ:</strong> {docTitle}</p>
            <p><strong>ผู้สร้างเอกสาร:</strong> นายวิศวกร มั่นคง (สำนักงานวิศวกรรม)</p>
            <p><strong>สถานะกระบวนการ:</strong> <span className="text-emerald-700 font-bold">เสร็จสมบูรณ์ (ผู้ลงนามครบถ้วน 3/3 ท่าน)</span></p>
            <p><strong>กฎหมายรองรับ:</strong> พ.ร.บ. ว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์ พ.ศ. 2544 มาตรา 26</p>
          </div>
          <div className="col-span-5 border-l border-slate-200 pl-2 space-y-1 font-mono">
            <p><strong>สร้างเมื่อ:</strong> {createdTime}</p>
            <p><strong>ลงนามเสร็จ:</strong> {completedTime}</p>
            <p><strong>Timezone:</strong> Asia/Bangkok (UTC+07:00)</p>
          </div>
        </div>
      </div>

      {/* SHA-256 Digest */}
      <div className="border border-slate-900 bg-slate-50 p-2 font-mono text-[8px]">
        <div className="flex justify-between font-bold text-slate-900 mb-1">
          <span className="font-sans">2. รหัสแฮชตรวจสอบความสมบูรณ์ของเอกสาร (Cryptographic Document Digest)</span>
          <span className="text-blue-700">SHA-256 Verified</span>
        </div>
        <div className="bg-white p-1 border border-slate-300 rounded break-all select-all font-bold">
          SHA-256: {sha256}
        </div>
      </div>

      {/* Signers Audit Trail Logs */}
      <div className="border border-slate-900 bg-white">
        <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5">
          3. ประวัติการลงนามแบบรายละเอียดและลำดับเหตุการณ์ (Signers Audit Trail)
        </div>
        <div className="divide-y divide-slate-300 text-[8.5px]">
          {/* Signer 1 */}
          <div className="p-2 space-y-1">
            <div className="flex justify-between">
              <div><strong>1. นายวิศวกร มั่นคง</strong> <span className="text-slate-500">(ผู้จัดทำเอกสาร)</span></div>
              <span className="text-emerald-700 font-bold">✓ ลงนามสำเร็จ (10:12:04 น.)</span>
            </div>
            <div className="bg-slate-50 p-1 rounded font-mono text-[7.5px] text-slate-600 flex justify-between">
              <span>OTP Verified • IP: 182.52.41.112 • Chrome/Win11</span>
              <span className="text-blue-800 font-bold">Hash: 8f4b2a901ce47d2b8812e</span>
            </div>
          </div>
          {/* Signer 2 */}
          <div className="p-2 space-y-1 bg-slate-50/40">
            <div className="flex justify-between">
              <div><strong>2. นายสมศักดิ์ ตรวจงาน</strong> <span className="text-slate-500">(วิศวกรผู้ตรวจสอบ)</span></div>
              <span className="text-emerald-700 font-bold">✓ ลงนามสำเร็จ (11:45:18 น.)</span>
            </div>
            <div className="bg-white p-1 rounded border border-slate-200 font-mono text-[7.5px] text-slate-600 flex justify-between">
              <span>Digital Cert • IP: 171.96.20.45 • Safari/MacOS</span>
              <span className="text-blue-800 font-bold">Hash: 7d1a938c11e74f22c9081</span>
            </div>
          </div>
          {/* Signer 3 */}
          <div className="p-2 space-y-1">
            <div className="flex justify-between">
              <div><strong>3. {company.name}</strong> <span className="text-slate-500">(ผู้อนุมัติ / ผู้ว่าจ้าง)</span></div>
              <span className="text-emerald-700 font-bold">✓ ลงนามสำเร็จ (14:30:45 น.)</span>
            </div>
            <div className="bg-slate-50 p-1 rounded font-mono text-[7.5px] text-slate-600 flex justify-between">
              <span>ThaiD e-KYC • IP: 49.229.102.88 • iOS App</span>
              <span className="text-emerald-800 font-bold">Hash: 3c9e11502fa9b77f44391</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Compliance Notice */}
      <div className="border border-slate-900 bg-white p-2 text-[8px] text-slate-700 space-y-1">
        <p className="font-bold text-slate-900">ข้อกำหนดทางกฎหมายและการรับรองความถูกต้อง (Legal Compliance Notice):</p>
        <p className="leading-relaxed">
          ใบรับรองการลงนามฉบับนี้จัดทำขึ้นโดยระบบบันทึกรหัสประวัติ (Audit Trail System) ซึ่งรวบรวมข้อมูลเวลา IP Address ลายมือชื่อ และกระบวนการยืนยันตัวตนของผู้ลงนามทุกท่าน เอกสารนี้ได้รับการเข้ารหัสความปลอดภัยขั้นสูง และมีผลผูกพันทางกฎหมายตาม <strong>พระราชบัญญัติว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์ พ.ศ. 2544</strong> มาตรา 26
        </p>
      </div>

      <div className="border-t border-slate-300 pt-1 text-center text-[7.5px] text-slate-500 flex justify-between">
        <span>e-Signature Service Provider ID: TH-CERT-2026-991</span>
        <span className="font-mono">Page 1 of 1 (Certificate of Completion)</span>
      </div>
    </div>
  );
}
