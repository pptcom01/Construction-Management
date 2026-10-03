import React from 'react';
import { CompanyInfo } from './types';
import { DEFAULT_SAMPLE_COMPANY } from './types';
import { numberToThaiBaht } from '../../utils/thaiBahtText';
import { Printer, FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';

// -------------------------------------------------------------------------
// 4. ใบขออนุมัติสั่งจ้าง (SA) - ตามต้นฉบับเป๊ะ 100%
// -------------------------------------------------------------------------
export function SAApprovalTemplate({
  company = DEFAULT_SAMPLE_COMPANY,
  saNo = 'SA-2026-08-019',
  docDate = '22 สิงหาคม 2569',
  contractorName = 'ห้างหุ้นส่วนจำกัด บุรีรัมย์ศิลาชัย 1999',
  projectName = 'โครงการก่อสร้างทางหลวงหมายเลข 24 ตอนประโคนชัย-บุรีรัมย์ ตอน 2',
  workDescription = 'จ้างเหมาค่าแรงและเครื่องจักร งานโครงสร้างชั้น 1-3',
  workDuration = '1 กันยายน 2569 ถึง 30 พฤศจิกายน 2569 (90 วัน)'
}: {
  company?: CompanyInfo;
  saNo?: string;
  docDate?: string;
  contractorName?: string;
  projectName?: string;
  workDescription?: string;
  workDuration?: string;
}) {
  return (
    <div className="space-y-4 text-slate-900 text-xs leading-relaxed bg-white p-6 border border-slate-300 print:border-none print:p-0">
      {/* Header Box */}
      <div className="border border-slate-900 p-3 bg-white">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-0.5 flex-1 pr-2">
            <h1 className="text-base font-extrabold text-slate-950 tracking-tight">
              {company.name}
            </h1>
            <p className="text-[10px] font-bold text-slate-800">
              SUBCONTRACT & LABOUR MANAGEMENT DIVISION
            </p>
            <p className="text-[9.5px] font-medium text-slate-700">
              เอกสารขออนุมัติจ้างเหมาช่วงงานก่อสร้าง (Subcontract Authorization)
            </p>
          </div>
          <div className="text-right shrink-0 border-l border-slate-300 pl-4 space-y-1 min-w-[210px]">
            <span className="inline-block px-2 py-0.5 text-[8.5px] font-black border border-slate-900 bg-amber-100 text-amber-950 rounded tracking-wider uppercase">
              ใบขออนุมัติสั่งจ้าง / SA Note
            </span>
            <h2 className="text-base font-black text-slate-950 tracking-tight uppercase leading-tight pt-0.5">
              ใบอนุมัติสั่งจ้างเหมา
            </h2>
            <div className="text-[10px] font-bold text-slate-700 tracking-wider">
              (SUBCONTRACT APPROVAL : SA)
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-12 gap-2 text-[10px]">
        <div className="col-span-7 border border-slate-900 p-2 space-y-1 bg-white">
          <p><strong className="text-slate-800">โครงการ:</strong> {projectName}</p>
          <p><strong className="text-slate-800">ผู้รับเหมาช่วงที่เสนอจ้าง:</strong> <span className="font-bold text-amber-950">{contractorName}</span></p>
          <p><strong className="text-slate-800">ลักษณะงานจ้าง:</strong> {workDescription}</p>
          <p><strong className="text-slate-800">ระยะเวลาปฏิบัติงาน:</strong> {workDuration}</p>
        </div>
        <div className="col-span-5 border border-slate-900 p-2 space-y-1 bg-white">
          <p><strong className="text-slate-800">เลขที่ SA:</strong> {saNo}</p>
          <p><strong className="text-slate-800">วันที่ขออนุมัติ:</strong> {docDate}</p>
          <p><strong className="text-slate-800">การแบ่งงวดงาน:</strong> 4 งวดงาน ตามความคืบหน้าจริง</p>
          <p><strong className="text-slate-800">การหักเงินประกัน:</strong> หัก 5% ของทุกงวดงาน (คืนหลัง 1 ปี)</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-[10px] border-collapse border border-slate-900">
        <thead>
          <tr className="bg-slate-100 font-bold border-b border-slate-900 text-slate-900 text-center">
            <th className="border-r border-slate-900 p-1.5 w-10">งวดที่</th>
            <th className="border-r border-slate-900 p-1.5 text-left">รายละเอียดผลงานที่ต้องส่งมอบในแต่ละงวด</th>
            <th className="border-r border-slate-900 p-1.5 w-16">สัดส่วน</th>
            <th className="border-r border-slate-900 p-1.5 w-28">มูลค่างาน (บาท)</th>
            <th className="border-r border-slate-900 p-1.5 w-24">หักประกัน 5%</th>
            <th className="p-1.5 w-28">ยอดจ่ายสุทธิ (บาท)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300">
          <tr>
            <td className="border-r border-slate-900 p-2 text-center font-bold">1</td>
            <td className="border-r border-slate-900 p-2 font-semibold">งานเทฐานรากและตอม่อแล้วเสร็จ 100%</td>
            <td className="border-r border-slate-900 p-2 text-center font-mono">25%</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono font-bold">125,000.00</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono text-rose-700">-6,250.00</td>
            <td className="p-2 text-right font-mono font-bold text-amber-950">118,750.00</td>
          </tr>
          <tr>
            <td className="border-r border-slate-900 p-2 text-center font-bold">2</td>
            <td className="border-r border-slate-900 p-2 font-semibold">งานคานคอดินและพื้นชั้น 1 แล้วเสร็จ 100%</td>
            <td className="border-r border-slate-900 p-2 text-center font-mono">25%</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono font-bold">125,000.00</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono text-rose-700">-6,250.00</td>
            <td className="p-2 text-right font-mono font-bold text-amber-950">118,750.00</td>
          </tr>
          <tr>
            <td className="border-r border-slate-900 p-2 text-center font-bold">3</td>
            <td className="border-r border-slate-900 p-2 font-semibold">งานเสา คาน และพื้นชั้น 2-3 แล้วเสร็จ 100%</td>
            <td className="border-r border-slate-900 p-2 text-center font-mono">30%</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono font-bold">150,000.00</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono text-rose-700">-7,500.00</td>
            <td className="p-2 text-right font-mono font-bold text-amber-950">142,500.00</td>
          </tr>
          <tr>
            <td className="border-r border-slate-900 p-2 text-center font-bold">4</td>
            <td className="border-r border-slate-900 p-2 font-semibold">งานคานหลังคา เก็บงานโครงสร้างและทำความสะอาดไซต์</td>
            <td className="border-r border-slate-900 p-2 text-center font-mono">20%</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono font-bold">100,000.00</td>
            <td className="border-r border-slate-900 p-2 text-right font-mono text-rose-700">-5,000.00</td>
            <td className="p-2 text-right font-mono font-bold text-amber-950">95,000.00</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-slate-900 font-black text-white">
            <td colSpan={3} className="p-2 border-r border-slate-700 text-right text-amber-300 text-[11px]">มูลค่างานรวมทั้งสิ้น (สัญญาจ้าง):</td>
            <td className="p-2 border-r border-slate-700 text-right font-mono text-amber-300 font-black text-xs">500,000.00</td>
            <td className="p-2 border-r border-slate-700 text-right font-mono text-rose-300 font-black text-xs">-25,000.00</td>
            <td className="p-2 text-right font-mono text-emerald-400 font-black text-xs">475,000.00 บาท</td>
          </tr>
        </tfoot>
      </table>

      <div className="border border-slate-900 p-2 text-[10px] bg-slate-50 flex justify-between items-center">
        <span>หมายเหตุภาษี: หักภาษี ณ ที่จ่าย (WHT) 3% ทุกครั้งที่มีการเบิกจ่ายค่างวดตามประมวลรัษฎากร</span>
        <span className="text-amber-800 font-bold">อัตราค่าปรับล่าช้า: 0.1% ต่อวัน</span>
      </div>

      {/* Signatures */}
      <div className="border border-slate-900 bg-white">
        <div className="grid grid-cols-3 divide-x divide-slate-900 text-center text-[9px]">
          <div className="p-2.5 space-y-1">
            <p className="font-bold text-slate-800">วิศวกรผู้ขออนุมัติสั่งจ้าง</p>
            <div className="pt-5">
              <div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1">( วิศวกร ชาญชัย สย.99887 )</p>
              <p className="text-slate-500 text-[8px]">วิศวกรควบคุมงาน</p>
            </div>
          </div>
          <div className="p-2.5 space-y-1 bg-slate-50/50">
            <p className="font-bold text-slate-800">ผู้จัดการฝ่ายสัญญาและจัดจ้าง</p>
            <div className="pt-5">
              <div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1">( นายสมศักดิ์ บริหารงาน )</p>
              <p className="text-slate-500 text-[8px]">หัวหน้าฝ่ายบริหารสัญญา</p>
            </div>
          </div>
          <div className="p-2.5 space-y-1 bg-amber-50/30">
            <p className="font-bold text-slate-800">ผู้อนุมัติสั่งจ้าง (MD)</p>
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

// -------------------------------------------------------------------------
// 5. สัญญาจ้างเหมา (Subcontract Agreement) - ตามต้นฉบับสัญญาจริงเป๊ะ 100%
// -------------------------------------------------------------------------
export interface SubcontractorContractTemplateProps {
  company?: CompanyInfo;
  contractNo?: string;
  projectName?: string;
  contractDate?: string;
  contractLocation?: string;
  contractLocationAddress?: string;
  // ผู้ว่าจ้าง (Employer)
  employerName?: string;
  employerRep?: string;
  employerPosition?: string;
  employerAddress?: string;
  // ผู้รับจ้าง (Contractor)
  contractorName?: string;
  contractorTaxId?: string;
  contractorRep?: string;
  contractorPosition?: string;
  contractorAddress?: string;
  // รายละเอียดงาน
  workScope?: string;
  // ค่าจ้างและเงื่อนไขการเงิน
  contractAmount?: number;
  contractAmountText?: string;
  paymentDueDay?: number;
  retentionPercent?: number;
  retentionReturnMonths?: number;
  // ระยะเวลาและค่าปรับ
  durationMonths?: number;
  startDate?: string;
  endDate?: string;
  dailyPenalty?: number;
  dailyPenaltyText?: string;
  showControlBar?: boolean;
}

export function SubcontractorContractTemplate({
  company = DEFAULT_SAMPLE_COMPANY,
  contractNo = 'BTC-0001/2568',
  projectName = 'โครงการก่อสร้างทางหลวงหมายเลข 2208 สาย อ.ประโคนชัย - บ.ระกา',
  contractDate = 'วันที่ 15 ธันวาคม พ.ศ.2564',
  contractLocation,
  contractLocationAddress,
  employerName,
  employerRep = 'นายวิชัย นพสุวรรณวงศ์',
  employerPosition = 'กรรมการผู้จัดการ',
  employerAddress,
  contractorName = 'ห้างหุ้นส่วนจำกัด ไบโอพลังไทย',
  contractorTaxId,
  contractorRep = 'นางสาวฐิรนันท์ วงศ์ชาญชัยศรี',
  contractorPosition = 'หุ้นส่วนผู้จัดการ',
  contractorAddress = 'เลขที่ 444/55 หมู่ที่ 4 ต.ปรุใหญ่ อ.เมืองนครราชสีมา จ.นครราชสีมา',
  workScope = 'งาน CLEARING AND GUBBING ,EARTH EXCAVATION,EARTH EMBANKMENT,SELECTED MATERIAL “A”,SUBBASE,BASE งานจ้างเหมาโครงการก่อสร้างทางหลวงหมายเลข 2208 สาย อ.ประโคนชัย - บ.ระกา',
  contractAmount = 33563027.60,
  contractAmountText,
  paymentDueDay = 5,
  retentionPercent = 5,
  retentionReturnMonths = 3,
  durationMonths = 6,
  startDate = '15 ธันวาคม พ.ศ.2564',
  endDate = '15 มิถุนายน พ.ศ.2565',
  dailyPenalty = 3000,
  dailyPenaltyText = 'สามพันบาทถ้วน',
  showControlBar = true
}: SubcontractorContractTemplateProps) {
  const effectiveEmployerName = employerName || company?.name || 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด';
  const effectiveContractLocation = contractLocation || company?.name || 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด';
  const effectiveContractLocationAddress = contractLocationAddress || 'สำนักงานตั้งอยู่เลขที่ 31/2 ถนนอินจันทร์ณรงค์ ตำบลในเมือง อำเภอเมือง จ.บุรีรัมย์ 31000';
  const effectiveEmployerAddress = employerAddress || 'เลขที่ 31/2 ถนนอินจันทร์ณรงค์ ตำบลในเมือง อำเภอเมือง จังหวัดบุรีรัมย์ 31000';

  const formattedAmount = Number(contractAmount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const resolvedAmountText = contractAmountText || numberToThaiBaht(contractAmount);

  return (
    <div className="space-y-6 text-slate-900 font-sans leading-relaxed">
      {/* Print-specific style for exact page-break handling */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 14mm 12mm 14mm;
          }
          .contract-page {
            page-break-after: always !important;
            break-after: page !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: 0 !important;
          }
          .contract-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}} />

      {/* Interactive Control Bar (Screen only, hidden on print) */}
      {showControlBar && (
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs print:hidden flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#005aa9] text-white rounded-lg">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-900">
                  สัญญาจ้างเหมาช่วงงานก่อสร้าง (3 หน้า A4 ฉบับจริงสมบูรณ์ 100%)
                </h4>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-[#009540]">
                  <ShieldCheck className="w-3 h-3" /> มีผลทางกฎหมาย 100%
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                เอกสารประกอบสัญญาตาม ป.พ.พ. พร้อมตราองค์กร, เลขหน้ากำกับ, จุดลงนามย่อ และกล่องประทับตรานิติบุคคล
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#005aa9] hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์สัญญา (Print A4 3 หน้า)</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================= PAGE 1 ======================= */}
      <div className="contract-page bg-white p-8 sm:p-12 border border-slate-300 shadow-sm max-w-[850px] mx-auto min-h-[297mm] flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:min-h-0 print:m-0">
        <div>
          {/* Corporate Header Bar (Consistent with Company Standard) */}
          <div className="border-b-2 border-slate-900 pb-3 mb-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-0.5 flex-1 pr-2">
                <div className="flex items-center gap-2">
                  {company?.logo ? (
                    <img 
                      src={company.logo} 
                      alt={company.name} 
                      className="w-10 h-10 object-contain shrink-0 rounded"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  ) : (
                    <span className="px-2 py-0.5 bg-[#005aa9] text-white text-[11px] font-black rounded tracking-wider">
                      {company?.logoText || 'BTC'}
                    </span>
                  )}
                  <h1 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                    {effectiveEmployerName}
                  </h1>
                </div>
                <p className="text-[10px] font-bold text-slate-700 tracking-wider">
                  BURIRAM THONGCHAI CONSTRUCTION CO., LTD. &bull; SUBCONTRACT MANAGEMENT DIVISION
                </p>
                <p className="text-[9.5px] text-slate-600 leading-snug">
                  {effectiveEmployerAddress} &bull; เลขประจำตัวผู้เสียภาษี: <span className="font-mono">{company?.taxId || '0315559001144'}</span> &bull; โทรศัพท์: {company?.phone || '044-611134'}
                </p>
              </div>

              {/* Document Classification Box */}
              <div className="text-right shrink-0 border-l border-slate-300 pl-4 space-y-0.5 min-w-[190px]">
                <span className="inline-block px-2 py-0.5 text-[8.5px] font-black border border-slate-900 bg-blue-50 text-blue-950 rounded tracking-wider uppercase">
                  สัญญาจ้างเหมาช่วง / SUBCONTRACT
                </span>
                <div className="text-[10px] font-bold text-slate-700 pt-0.5">
                  รหัสเอกสาร: <span className="font-mono text-slate-950">FM-SUB-01</span>
                </div>
                <div className="text-[11px] font-black text-slate-950">
                  เลขที่ : <span className="font-mono">{contractNo}</span>
                </div>
                <div className="text-[9.5px] text-slate-600">
                  วันที่ทำสัญญา: <span className="font-medium">{contractDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Title Box */}
          <div className="border border-slate-900 text-center py-2.5 px-4 mb-4 bg-slate-50/60">
            <h2 className="text-lg sm:text-xl font-bold text-slate-950 tracking-normal leading-tight">
              สัญญาจ้างเหมา
            </h2>
            <div className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider">
              (SUBCONTRACT AGREEMENT)
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1 border-t border-slate-300 pt-1">
              โครงการ: {projectName}
            </div>
          </div>

          {/* Meta Info Grid */}
          <div className="border border-slate-200 bg-slate-50/50 p-2.5 rounded text-[12.5px] mb-4">
            <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1 items-start text-slate-800">
              <span className="font-bold text-slate-900">สัญญาจ้างเหมา:</span>
              <div className="flex justify-between items-center">
                <span>{projectName}</span>
                <span className="font-bold">เลขที่ : <span className="font-semibold text-blue-900">{contractNo}</span></span>
              </div>

              <span className="font-bold text-slate-900">สัญญาทำที่:</span>
              <div>
                <div>{effectiveContractLocation}</div>
                <div className="text-slate-600 text-[11.5px]">{effectiveContractLocationAddress}</div>
              </div>

              <span className="font-bold text-slate-900">สัญญาทำเมื่อ:</span>
              <div>{contractDate}</div>
            </div>
          </div>

          {/* Between Parties */}
          <div className="text-center my-3 text-[13.5px] font-bold text-slate-900">
            ระหว่าง
          </div>

          {/* Employer (ผู้ว่าจ้าง) */}
          <p className="text-[13px] sm:text-[13.5px] text-slate-900 leading-[1.8] indent-8 text-justify">
            {effectiveEmployerName} โดย{employerRep} {employerPosition} ผู้มีอำนาจลงนามผูกพันนิติบุคคล สำนักงานตั้งอยู่ที่ {effectiveEmployerAddress} ซึ่งต่อไปในสัญญานี้เรียกว่า “ผู้ว่าจ้าง” ฝ่ายหนึ่ง
          </p>

          {/* With */}
          <div className="text-center my-2.5 text-[13.5px] font-bold text-slate-900">
            กับ
          </div>

          {/* Contractor (ผู้รับจ้าง) */}
          <p className="text-[13px] sm:text-[13.5px] text-slate-900 leading-[1.8] indent-8 text-justify">
            {contractorName} โดย{contractorRep} {contractorPosition} ผู้มีอำนาจลงนามผูกพันนิติบุคคล สำนักงานตั้งอยู่ที่ {contractorAddress} ซึ่งต่อไปในสัญญานี้เรียกว่า “ผู้รับจ้าง” อีกฝ่ายหนึ่ง
          </p>

          <p className="text-[13px] sm:text-[13.5px] text-slate-900 leading-[1.8] indent-8 mt-2.5">
            คู่สัญญาได้ตกลงกันมีข้อความดังต่อไปนี้
          </p>

          {/* ข้อ 1 */}
          <div className="mt-3.5 space-y-1.5 text-[13px] sm:text-[13.5px] text-slate-900 leading-[1.8] text-justify">
            <p className="font-bold text-slate-950">ข้อ 1 ข้อตกลงว่าจ้าง</p>
            <p className="indent-8">
              ผู้ว่าจ้างตกลงจ้างและผู้รับจ้างตกลงรับจ้าง {workScope} ให้เป็นไปตามความประสงค์ของผู้ว่าจ้าง
            </p>
            <p className="indent-8">
              ผู้รับจ้างตกลงที่จะจัดหาแรงงานที่มีความชำนาญ เครื่องมือ เครื่องใช้ ตลอดจนอุปกรณ์ต่าง ๆ ชนิดดี เพื่อใช้ในงานตามสัญญานี้ เพื่อให้งานที่รับจ้างดังกล่าว เป็นไปตามแผนงานและสำเร็จลุล่วงไปด้วยดีตามประสงค์ของผู้ว่าจ้างเพื่อให้งานก่อสร้างเป็นไปตามแผนงาน และสำเร็จลุล่วงไปได้ด้วยดี
            </p>
          </div>

          {/* ข้อ 2 (Start) */}
          <div className="mt-3.5 space-y-1 text-[13px] sm:text-[13.5px] text-slate-900 leading-[1.8]">
            <p className="font-bold text-slate-950">ข้อ 2 เอกสารอันเป็นส่วนหนึ่งของสัญญา</p>
            <div className="pl-6 space-y-0.5">
              <p>2.1 เอกสารประกอบสัญญาของ ผู้ว่าจ้าง</p>
              <p className="pl-6 text-slate-700">หนังสือรับรอง /ภพ.20/บัตรประชาชน/ทะเบียนบ้าน ผู้มีอำนาจลงนาม</p>
              <p>2.2 เอกสารประกอบสัญญาของ ผู้รับจ้าง</p>
            </div>
          </div>
        </div>

        {/* Security Legal Footer Page 1 */}
        <div className="pt-3 border-t border-slate-300 mt-6 text-[10px] text-slate-700">
          <div className="grid grid-cols-2 gap-8 mb-2">
            <div className="flex items-center gap-2">
              <span className="shrink-0 font-medium">ลงนามย่อ (ผู้ว่าจ้าง):</span>
              <span className="flex-1 border-b border-dotted border-slate-500"></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="shrink-0 font-medium">ลงนามย่อ (ผู้รับจ้าง):</span>
              <span className="flex-1 border-b border-dotted border-slate-500"></span>
            </div>
          </div>
          <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-200 pt-1">
            <span>เอกสารสัญญาจ้างเหมาช่วง &bull; {effectiveEmployerName} &bull; รหัส FM-SUB-01</span>
            <span className="font-bold text-slate-800">หน้า 1 จาก 3 (Page 1 of 3)</span>
          </div>
        </div>
      </div>

      {/* ======================= PAGE 2 ======================= */}
      <div className="contract-page bg-white p-8 sm:p-12 border border-slate-300 shadow-sm max-w-[850px] mx-auto min-h-[297mm] flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:min-h-0 print:m-0">
        <div>
          {/* Page 2 Header Ribbon */}
          <div className="border-b border-slate-900 pb-2 mb-4">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-950">{effectiveEmployerName}</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-700">สัญญาเลขที่: <span className="font-mono font-bold text-slate-900">{contractNo}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 hidden sm:inline truncate max-w-[280px]">
                  {projectName}
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-bold rounded border border-slate-300">
                  หน้า 2 จาก 3
                </span>
              </div>
            </div>
          </div>

          {/* Title Box Page 2 */}
          <div className="border border-slate-900 text-center py-2 px-4 mb-5 bg-slate-50/60">
            <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-normal leading-tight">
              สัญญาจ้างเหมา
            </h2>
            <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
              {projectName}
            </div>
          </div>

          {/* ข้อ 2 Continued */}
          <div className="text-[13px] sm:text-[13.5px] text-slate-900 leading-[1.8] space-y-1 mb-3.5">
            <div className="pl-12 text-slate-700">
              <p>หนังสือรับรอง/ภพ.20/บัตรประชาชน/ทะเบียนบ้าน ผู้มีอำนาจลงนาม</p>
            </div>
            <div className="pl-6">
              <p>2.3 รายละเอียดราคางานจัดจ้าง</p>
            </div>
          </div>

          {/* ข้อ 3 */}
          <div className="mt-3.5 space-y-1.5 text-[13px] sm:text-[13.5px] text-slate-900 leading-[1.8] text-justify">
            <p className="font-bold text-slate-950">ข้อ 3 ค่าจ้าง</p>
            <p className="indent-8">
              ผู้ว่าจ้างตกลงจ้าง และผู้รับจ้างตกลงรับเงินค่างานเป็นจำนวนเงิน {formattedAmount} บาท ({resolvedAmountText}) ราคาดังกล่าวยังไม่รวมภาษีมูลค่าเพิ่ม ส่วนค่าอากรและค่าใช้จ่ายอื่นที่เกี่ยวข้อง ผู้รับจ้างเป็นผู้รับผิดชอบ โดยถือราคาต่อหน่วยเป็นเกณฑ์ตามรายการแต่ละประเภท ดังที่ได้กำหนดไว้ในเอกสารแนบรายละเอียดราคางาน
            </p>
          </div>

          {/* ข้อ 4 */}
          <div className="mt-3.5 space-y-1.5 text-[13px] sm:text-[13.5px] text-slate-900 leading-[1.8] text-justify">
            <p className="font-bold text-slate-950">ข้อ 4 การจ่ายเงิน</p>
            <p className="indent-8">
              4.1 ผู้ว่าจ้างจ่ายค่าจ้างให้แก่ผู้รับจ้างตามปริมาณผลงานการก่อสร้างที่ผู้รับจ้างได้ทำงานตามสัญญานี้แล้วเสร็จในแต่ละเดือน ไม่เกินวันที่ {paymentDueDay} ของเดือนถัดไป (หากตรงกับวันหยุดทำการ จะจ่ายเงินให้ในวันถัดไป) โดยคู่สัญญาทั้งสองฝ่ายตกลงให้ตรวจสอบปริมาณผลงานการก่อสร้างที่ทำได้จริงนั้น เพื่อการจ่ายเงินค่าจ้างที่ทำงานตามสัญญานี้ ในอัตราค่าจ้างต่อหน่วยตามเอกสารแนบรายละเอียดราคางาน
            </p>
            <p className="indent-8">
              4.2 ผู้รับจ้างต้องออกใบแจ้งหนี้, ใบกำกับภาษี และใบเสร็จรับเงิน ตามจำนวนเงินที่ได้ไปแต่ละครั้งให้กับผู้ว่าจ้างด้วย โดยออกเป็นใบเสร็จรับเงินของ {effectiveEmployerName}
            </p>
          </div>

          {/* ข้อ 5 */}
          <div className="mt-3.5 space-y-1.5 text-[13px] sm:text-[13.5px] text-slate-900 leading-[1.8] text-justify">
            <p className="font-bold text-slate-950">ข้อ 5 การหักเงินประกันผลงาน</p>
            <p className="indent-8">
              ในการจ่ายเงินค่างานให้กับผู้รับจ้าง ผู้ว่าจ้างจะหักประกันผลงานร้อยละ {retentionPercent} ({retentionPercent === 5 ? 'ห้า' : numberToThaiBaht(retentionPercent).replace('บาทถ้วน', '')}) ของเงินที่ต้องจ่ายในแต่ละงวด เพื่อเป็นประกันผลงาน และผู้รับจ้างสามารถขอคืนเงินประกันผลงานได้เมื่อครบกำหนดระยะเวลา {retentionReturnMonths} เดือน หากผู้รับจ้างจะขอเงินประกันผลงานคืนก่อนครบกำหนด ผู้รับจ้างต้องวางหนังสือค้ำประกันของธนาคารแก่ผู้ว่าจ้างเพื่อเป็นหลักประกันแทน
            </p>
          </div>

          {/* ข้อ 6 */}
          <div className="mt-3.5 space-y-1.5 text-[13px] sm:text-[13.5px] text-slate-900 leading-[1.8] text-justify">
            <p className="font-bold text-slate-950">ข้อ 6 ระยะเวลาดำเนินงาน</p>
            <p className="indent-8">
              ผู้ว่าจ้างตกลงจ้าง และผู้รับจ้างตกลงรับจ้าง เป็นระยะเวลา {durationMonths} เดือน เริ่มตั้งแต่วันที่ {startDate} ถึง วันที่ {endDate}
            </p>
            <p className="indent-8">
              หากผู้รับจ้างไม่สามารถทำงานให้แล้วเสร็จตามเวลาที่กำหนดไว้ในสัญญานี้ ผู้รับจ้างยอมรับชำระค่าปรับให้แก่ผู้ว่าจ้างเป็นจำนวนเงินวันละ {Number(dailyPenalty).toLocaleString('en-US')} บาท ({dailyPenaltyText}) โดยหักจากผลงานในแต่ละงวดงาน
            </p>
          </div>
        </div>

        {/* Security Legal Footer Page 2 */}
        <div className="pt-3 border-t border-slate-300 mt-6 text-[10px] text-slate-700">
          <div className="grid grid-cols-2 gap-8 mb-2">
            <div className="flex items-center gap-2">
              <span className="shrink-0 font-medium">ลงนามย่อ (ผู้ว่าจ้าง):</span>
              <span className="flex-1 border-b border-dotted border-slate-500"></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="shrink-0 font-medium">ลงนามย่อ (ผู้รับจ้าง):</span>
              <span className="flex-1 border-b border-dotted border-slate-500"></span>
            </div>
          </div>
          <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-200 pt-1">
            <span>เอกสารสัญญาจ้างเหมาช่วง &bull; {effectiveEmployerName} &bull; รหัส FM-SUB-01</span>
            <span className="font-bold text-slate-800">หน้า 2 จาก 3 (Page 2 of 3)</span>
          </div>
        </div>
      </div>

      {/* ======================= PAGE 3 ======================= */}
      <div className="contract-page bg-white p-8 sm:p-12 border border-slate-300 shadow-sm max-w-[850px] mx-auto min-h-[297mm] flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:min-h-0 print:m-0">
        <div>
          {/* Page 3 Header Ribbon */}
          <div className="border-b border-slate-900 pb-2 mb-4">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-950">{effectiveEmployerName}</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-700">สัญญาเลขที่: <span className="font-mono font-bold text-slate-900">{contractNo}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 hidden sm:inline truncate max-w-[280px]">
                  {projectName}
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-bold rounded border border-slate-300">
                  หน้า 3 จาก 3
                </span>
              </div>
            </div>
          </div>

          {/* Title Box Page 3 */}
          <div className="border border-slate-900 text-center py-2 px-4 mb-5 bg-slate-50/60">
            <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-normal leading-tight">
              สัญญาจ้างเหมา
            </h2>
            <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
              {projectName}
            </div>
          </div>

          {/* ข้อ 7 */}
          <div className="space-y-1.5 text-[13px] sm:text-[13.5px] text-slate-900 leading-[1.8] text-justify">
            <p className="font-bold text-slate-950">ข้อ 7 สิทธิของผู้ว่าจ้างภายหลังบอกเลิกสัญญา</p>
            <p className="indent-8">
              ในกรณีที่ผู้ว่าจ้างบอกเลิกสัญญา ผู้ว่าจ้างอาจทำงานนั้นเองหรือว่าจ้างผู้อื่นให้ทำงานนั้นต่อได้ ผู้ว่าจ้างหรือผู้ที่รับจ้างทำงานนั้นต้องมีสิทธิใช้เครื่องใช้ในการก่อสร้างสิ่งก่อสร้างขึ้นชั่วคราวสำหรับงานก่อสร้างและวัสดุต่าง ๆ ซึ่งเห็นว่าจะต้องสงวนไว้เพื่อการปฏิบัติงานตามสัญญาตามที่จะเห็นสมควร
            </p>
            <p className="indent-8">
              ในกรณีดังกล่าวผู้ว่าจ้างมีสิทธิรับประกันต่าง ๆ ทั้งหมดหรือบางส่วนตามแต่จะเห็นสมควร นอกจากนั้นผู้รับจ้างจะต้องรับผิดชอบในค่าเสียหาย ซึ่งเป็นจำนวนเงินเกินกว่าหลักประกันและค่าเสียหายต่าง ๆ ที่เกิดขึ้น รวมทั้งค่าใช้จ่ายที่เพิ่มขึ้นในการทำงานนั้นต่อให้เสร็จตามสัญญา ซึ่งผู้ว่าจ้างจะหักเอาจากเงินประกันผลงานหรือจำนวนเงินใด ๆ ที่จะจ่ายให้แก่ผู้รับจ้างก็ได้
            </p>
          </div>

          {/* ข้อ 8 */}
          <div className="mt-3.5 space-y-1.5 text-[13px] sm:text-[13.5px] text-slate-900 leading-[1.8] text-justify">
            <p className="font-bold text-slate-950">ข้อ 8 การกำหนดค่าเสียหาย</p>
            <p className="indent-8">
              ค่าปรับหรือค่าเสียหายซึ่งเกิดขึ้นจากผู้รับจ้างตามสัญญานี้ ผู้ว่าจ้างมีสิทธิที่จะหักเอาจากจำนวนเงินค่าจ้างที่ค้างจ่าย
            </p>
            <p className="indent-8">
              หากมีเงินค่าจ้างตามสัญญาที่หักไว้จ่ายเป็นค่าปรับและค่าเสียหายแล้วยังเหลืออยู่อีกเท่าไร ผู้ว่าจ้างจะคืนให้แก่ผู้รับจ้างทั้งหมด
            </p>
          </div>

          {/* Closing Statement */}
          <p className="mt-5 text-[13px] sm:text-[13.5px] text-slate-900 leading-[1.8] indent-8 text-justify">
            สัญญานี้ทำขึ้นเป็นสองฉบับ มีข้อความถูกต้องตรงกัน คู่สัญญาได้อ่านและเข้าใจข้อความโดยละเอียดตลอดแล้ว จึงได้ลงลายมือชื่อพร้อมทั้งประทับตรา (ถ้ามี) ไว้เป็นสำคัญต่อหน้าพยานและคู่สัญญาต่างยึดถือไว้ฝ่ายละหนึ่งฉบับ
          </p>

          {/* Execution Signatures (ส่วนลงนามสัญญามาตรฐานทางกฎหมาย) */}
          <div className="mt-12 space-y-12">
            {/* Primary Signatories: Employer & Contractor */}
            <div className="grid grid-cols-2 gap-8 sm:gap-12 text-[13.5px] leading-relaxed">
              {/* Employer Column (ผู้ว่าจ้าง) */}
              <div className="flex flex-col items-center text-center">
                <div className="w-full max-w-[320px] space-y-2">
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="shrink-0 font-medium">ลงชื่อ</span>
                    <span className="flex-1 border-b border-dotted border-slate-800 min-w-[150px]"></span>
                    <span className="shrink-0 font-bold">ผู้ว่าจ้าง</span>
                  </div>
                  <div className="pt-1.5 space-y-1">
                    <p className="font-medium text-slate-950">
                      ( {employerRep || '.............................................................'} )
                    </p>
                    {employerPosition && (
                      <p className="text-xs text-slate-700">ตำแหน่ง {employerPosition}</p>
                    )}
                    <p className="text-xs font-semibold text-slate-900">{effectiveEmployerName}</p>
                    <p className="text-[11px] text-slate-500 pt-2 font-normal">( ประทับตราสำคัญนิติบุคคล )</p>
                  </div>
                </div>
              </div>

              {/* Contractor Column (ผู้รับจ้าง) */}
              <div className="flex flex-col items-center text-center">
                <div className="w-full max-w-[320px] space-y-2">
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="shrink-0 font-medium">ลงชื่อ</span>
                    <span className="flex-1 border-b border-dotted border-slate-800 min-w-[150px]"></span>
                    <span className="shrink-0 font-bold">ผู้รับจ้าง</span>
                  </div>
                  <div className="pt-1.5 space-y-1">
                    <p className="font-medium text-slate-950">
                      ( {contractorRep || '.............................................................'} )
                    </p>
                    {contractorPosition && (
                      <p className="text-xs text-slate-700">ตำแหน่ง {contractorPosition}</p>
                    )}
                    <p className="text-xs font-semibold text-slate-900">{contractorName}</p>
                    <p className="text-[11px] text-slate-500 pt-2 font-normal">( ประทับตราสำคัญนิติบุคคล )</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Witnesses (พยาน) */}
            <div className="grid grid-cols-2 gap-8 sm:gap-12 text-[13.5px] leading-relaxed pt-2">
              {/* Witness 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-full max-w-[320px] space-y-2">
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="shrink-0 font-medium">ลงชื่อ</span>
                    <span className="flex-1 border-b border-dotted border-slate-800 min-w-[150px]"></span>
                    <span className="shrink-0 font-bold">พยาน</span>
                  </div>
                  <div className="pt-1.5">
                    <p className="text-slate-600">
                      ( ............................................................. )
                    </p>
                  </div>
                </div>
              </div>

              {/* Witness 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-full max-w-[320px] space-y-2">
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="shrink-0 font-medium">ลงชื่อ</span>
                    <span className="flex-1 border-b border-dotted border-slate-800 min-w-[150px]"></span>
                    <span className="shrink-0 font-bold">พยาน</span>
                  </div>
                  <div className="pt-1.5">
                    <p className="text-slate-600">
                      ( ............................................................. )
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Legal Footer Page 3 */}
        <div className="pt-3 border-t border-slate-300 mt-6 text-[9px] text-slate-500 flex justify-between items-center">
          <span>เอกสารสัญญาจ้างเหมาช่วงฉบับจริง &bull; จัดทำ 2 ฉบับมีผลผูกพันตามกฎหมาย 100% &bull; {effectiveEmployerName}</span>
          <span className="font-bold text-slate-800">หน้า 3 จาก 3 (Page 3 of 3)</span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// 6. ใบส่งของ / ตรวจรับพัสดุหน้างาน (GRN) - ตามต้นฉบับเป๊ะ 100%
// -------------------------------------------------------------------------
export function DeliveryNoteTemplate({
  company = DEFAULT_SAMPLE_COMPANY,
  grnNo = 'GRN-2026-08-088',
  docDate = '25 สิงหาคม 2569 (เวลา 10:30 น.)',
  vendorName = 'บริษัท ซีแพคบุรีรัมย์คอนกรีต จำกัด',
  projectName = 'โครงการก่อสร้างทางหลวงหมายเลข 24 ตอนประโคนชัย-บุรีรัมย์ ตอน 2',
  location = 'หน้างานตอน 2 กม. 205+000 ถ.สาย 24 อ.ประโคนชัย จ.บุรีรัมย์',
  truckNo = '82-5541 บุรีรัมย์',
  driverName = 'นายสมพร มุ่งมั่น',
  poRef = 'PO-2026-08-044',
  invRef = 'INV-88912'
}: {
  company?: CompanyInfo;
  grnNo?: string;
  docDate?: string;
  vendorName?: string;
  projectName?: string;
  location?: string;
  truckNo?: string;
  driverName?: string;
  poRef?: string;
  invRef?: string;
}) {
  return (
    <div className="space-y-4 text-slate-900 text-xs leading-relaxed bg-white p-6 border border-slate-300 print:border-none print:p-0">
      {/* Header Box */}
      <div className="border border-slate-900 p-3 bg-white">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-0.5 flex-1 pr-2">
            <h1 className="text-base font-extrabold text-slate-950 tracking-tight">
              {company.name}
            </h1>
            <p className="text-[10px] font-bold text-slate-800">
              SITE WAREHOUSE & MATERIAL RECEIVING INSPECTION
            </p>
            <p className="text-[9.5px] font-medium text-slate-700">
              ฝ่ายคลังพัสดุและตรวจสอบคุณภาพหน้างาน (QC/Site Receiving)
            </p>
          </div>
          <div className="text-right shrink-0 border-l border-slate-300 pl-4 space-y-1 min-w-[210px]">
            <span className="inline-block px-2 py-0.5 text-[8.5px] font-black border border-slate-900 bg-sky-100 text-sky-950 rounded tracking-wider uppercase">
              ใบตรวจรับพัสดุ / GRN
            </span>
            <h2 className="text-base font-black text-slate-950 tracking-tight uppercase leading-tight pt-0.5">
              ใบส่งของ / ตรวจรับพัสดุ
            </h2>
            <div className="text-[10px] font-bold text-slate-700 tracking-wider">
              (GOODS RECEIVING NOTE : GRN)
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-12 gap-2 text-[10px]">
        <div className="col-span-7 border border-slate-900 p-2 space-y-1 bg-white">
          <p><strong className="text-slate-800">โครงการ:</strong> {projectName}</p>
          <p><strong className="text-slate-800">ผู้จัดส่ง / ร้านค้า:</strong> <span className="font-bold text-slate-900">{vendorName}</span></p>
          <p><strong className="text-slate-800">สถานที่ตรวจรับ:</strong> {location}</p>
          <p><strong className="text-slate-800">ทะเบียนรถขนส่ง:</strong> {truckNo} (พนักงานขับรถ: {driverName})</p>
        </div>
        <div className="col-span-5 border border-slate-900 p-2 space-y-1 bg-white">
          <p><strong className="text-slate-800">เลขที่ใบรับพัสดุ:</strong> {grnNo}</p>
          <p><strong className="text-slate-800">วันที่ส่งของ:</strong> {docDate}</p>
          <p><strong className="text-slate-800">อ้างอิงใบสั่งซื้อ:</strong> {poRef}</p>
          <p><strong className="text-slate-800">ใบกำกับภาษีร้านค้าเลขที่:</strong> {invRef}</p>
        </div>
      </div>

      {/* Inspection Items Table */}
      <table className="w-full text-[10px] border-collapse border border-slate-900">
        <thead>
          <tr className="bg-slate-100 font-bold border-b border-slate-900 text-slate-900 text-center">
            <th className="border-r border-slate-900 p-1.5 w-10">ลำดับ</th>
            <th className="border-r border-slate-900 p-1.5 text-left">รายการพัสดุ / สเปกสินค้า</th>
            <th className="border-r border-slate-900 p-1.5 w-16">จน. สั่งซื้อ</th>
            <th className="border-r border-slate-900 p-1.5 w-16 bg-sky-50">จน. ส่งจริง</th>
            <th className="border-r border-slate-900 p-1.5 w-14">หน่วย</th>
            <th className="border-r border-slate-900 p-1.5 w-24">ผลตรวจสภาพ</th>
            <th className="p-1.5 w-32">บันทึกหน้างาน / QC</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300">
          <tr>
            <td className="border-r border-slate-900 p-2 text-center font-bold">1</td>
            <td className="border-r border-slate-900 p-2 font-bold text-slate-950">คอนกรีตผสมเสร็จ 240 ksc (Slump 10±2.5 cm)</td>
            <td className="border-r border-slate-900 p-2 text-center font-mono">150</td>
            <td className="border-r border-slate-900 p-2 text-center font-mono font-bold bg-sky-50 text-sky-950">150</td>
            <td className="border-r border-slate-900 p-2 text-center">ลบ.ม.</td>
            <td className="border-r border-slate-900 p-2 text-center text-emerald-700 font-bold">✓ ผ่านเกณฑ์</td>
            <td className="p-2 text-slate-600 text-[9px]">เทส Slump ผ่าน 10.5 cm, เก็บ Cylinder 6 ลูก</td>
          </tr>
          <tr>
            <td className="border-r border-slate-900 p-2 text-center font-bold">2</td>
            <td className="border-r border-slate-900 p-2 font-bold text-slate-950">เหล็กเส้นข้ออ้อย DB12 SD40 ยาว 10 ม. (มอก.)</td>
            <td className="border-r border-slate-900 p-2 text-center font-mono">450</td>
            <td className="border-r border-slate-900 p-2 text-center font-mono font-bold bg-sky-50 text-sky-950">450</td>
            <td className="border-r border-slate-900 p-2 text-center">เส้น</td>
            <td className="border-r border-slate-900 p-2 text-center text-emerald-700 font-bold">✓ ผ่านเกณฑ์</td>
            <td className="p-2 text-slate-600 text-[9px]">เหล็กตรง ไม่มีสนิมขุม มีป้ายแท็กโรงงานครบ</td>
          </tr>
        </tbody>
      </table>

      <div className="border border-slate-900 p-2 text-[10px] bg-slate-50 space-y-1">
        <p className="font-bold text-slate-900">สรุปผลการตรวจสอบพัสดุ:</p>
        <p className="text-slate-800">
          [ ✓ ] ได้รับพัสดุถูกต้องครบถ้วนตามใบสั่งซื้อ สินค้าอยู่ในสภาพสมบูรณ์ ไม่มีความเสียหาย และอนุญาตให้นำเข้าจัดเก็บในคลังพัสดุหน้างานได้
        </p>
      </div>

      {/* Signatures */}
      <div className="border border-slate-900 bg-white">
        <div className="grid grid-cols-3 divide-x divide-slate-900 text-center text-[9px]">
          <div className="p-2.5 space-y-1">
            <p className="font-bold text-slate-800">พนักงานขับรถผู้ส่งสินค้า</p>
            <div className="pt-5">
              <div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1">( {driverName} )</p>
              <p className="text-slate-500 text-[8px]">{vendorName}</p>
            </div>
          </div>
          <div className="p-2.5 space-y-1 bg-slate-50/50">
            <p className="font-bold text-slate-800">เจ้าหน้าที่คลังผู้ตรวจนับ</p>
            <div className="pt-5">
              <div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1">( นายสมบัติ เก็บของ )</p>
              <p className="text-slate-500 text-[8px]">เจ้าหน้าที่คลังหน้างาน</p>
            </div>
          </div>
          <div className="p-2.5 space-y-1 bg-sky-50/30">
            <p className="font-bold text-slate-800">วิศวกรผู้รับรองคุณภาพ (QC)</p>
            <div className="pt-5">
              <div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1">( วิศวกร ชาญชัย สย.99887 )</p>
              <p className="text-slate-500 text-[8px]">วิศวกรโยธาควบคุมงาน</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// 7. ใบเบิกค่างวดผู้รับเหมา (Payment Certificate : IPC) - ตามต้นฉบับเป๊ะ 100%
// -------------------------------------------------------------------------
export function SubcontractorBillingTemplate({
  company = DEFAULT_SAMPLE_COMPANY,
  ipcNo = 'IPC-2026-09-001',
  docDate = '15 กันยายน 2569',
  payDate = '30 กันยายน 2569',
  contractorName = 'ห้างหุ้นส่วนจำกัด บุรีรัมย์ศิลาชัย 1999',
  contractRef = 'SUB-2026-08-009 (มูลค่า 500,000 บาท)',
  installmentNo = 1,
  installmentDesc = 'งานเทฐานรากและตอม่อแล้วเสร็จ 100%',
  claimPercent = 25,
  claimAmount = 125000,
  retentionPercent = 5,
  whtPercent = 3,
  projectName = 'โครงการก่อสร้างทางหลวงหมายเลข 24 ตอนประโคนชัย-บุรีรัมย์ ตอน 2'
}: {
  company?: CompanyInfo;
  ipcNo?: string;
  docDate?: string;
  payDate?: string;
  contractorName?: string;
  contractRef?: string;
  installmentNo?: number;
  installmentDesc?: string;
  claimPercent?: number;
  claimAmount?: number;
  retentionPercent?: number;
  whtPercent?: number;
  projectName?: string;
}) {
  const retentionVal = (claimAmount * retentionPercent) / 100;
  const taxableVal = claimAmount - retentionVal;
  const whtVal = (taxableVal * whtPercent) / 100;
  const netVal = taxableVal - whtVal;

  return (
    <div className="space-y-4 text-slate-900 text-xs leading-relaxed bg-white p-6 border border-slate-300 print:border-none print:p-0">
      {/* Header Box */}
      <div className="border border-slate-900 p-3 bg-white">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-0.5 flex-1 pr-2">
            <h1 className="text-base font-extrabold text-slate-950 tracking-tight">
              {company.name}
            </h1>
            <p className="text-[10px] font-bold text-slate-800">
              FINANCE & SUBCONTRACTOR PAYMENT CERTIFICATE
            </p>
            <p className="text-[9.5px] font-medium text-slate-700">
              ใบรับรองผลงานและการขอเบิกจ่ายเงินค่างวดผู้รับเหมาช่วง
            </p>
          </div>
          <div className="text-right shrink-0 border-l border-slate-300 pl-4 space-y-1 min-w-[210px]">
            <span className="inline-block px-2 py-0.5 text-[8.5px] font-black border border-slate-900 bg-indigo-100 text-indigo-950 rounded tracking-wider uppercase">
              ใบเบิกเงินค่างวด / IPC
            </span>
            <h2 className="text-base font-black text-slate-950 tracking-tight uppercase leading-tight pt-0.5">
              ใบเบิกค่างวดงาน
            </h2>
            <div className="text-[10px] font-bold text-slate-700 tracking-wider">
              (PAYMENT CERTIFICATE : IPC)
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-12 gap-2 text-[10px]">
        <div className="col-span-7 border border-slate-900 p-2 space-y-1 bg-white">
          <p><strong className="text-slate-800">โครงการ:</strong> {projectName}</p>
          <p><strong className="text-slate-800">ผู้รับจ้างช่วง:</strong> <span className="font-bold text-indigo-950">{contractorName}</span></p>
          <p><strong className="text-slate-800">อ้างอิงสัญญาจ้าง:</strong> สัญญาเลขที่ {contractRef}</p>
          <p><strong className="text-slate-800">งวดที่ขอเบิก:</strong> งวดที่ {installmentNo} ({installmentDesc})</p>
        </div>
        <div className="col-span-5 border border-slate-900 p-2 space-y-1 bg-white">
          <p><strong className="text-slate-800">เลขที่ใบเบิก:</strong> {ipcNo}</p>
          <p><strong className="text-slate-800">วันที่ตัดงวด:</strong> {docDate}</p>
          <p><strong className="text-slate-800">กำหนดวันจ่ายเงิน:</strong> {payDate}</p>
          <p><strong className="text-slate-800">สถานะ:</strong> ผ่านการตรวจรับผลงาน 100%</p>
        </div>
      </div>

      {/* Calculation Breakdown Table */}
      <table className="w-full text-[10px] border-collapse border border-slate-900">
        <thead>
          <tr className="bg-slate-100 font-bold border-b border-slate-900 text-slate-900 text-center">
            <th className="border-r border-slate-900 p-1.5 w-12">ลำดับ</th>
            <th className="border-r border-slate-900 p-1.5 text-left">รายละเอียดรายการคิดเงินและรายการหัก</th>
            <th className="border-r border-slate-900 p-1.5 w-24">ร้อยละ (%)</th>
            <th className="p-1.5 w-36 text-right">จำนวนเงิน (บาท)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300">
          <tr>
            <td className="border-r border-slate-900 p-2 text-center font-bold">1</td>
            <td className="border-r border-slate-900 p-2 font-bold text-slate-900">มูลค่าค่างานตามสัญญางวดที่ {installmentNo}</td>
            <td className="border-r border-slate-900 p-2 text-center font-mono">{claimPercent.toFixed(2)}%</td>
            <td className="p-2 text-right font-mono font-bold">{claimAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr className="bg-rose-50/40 text-rose-900">
            <td className="border-r border-slate-900 p-2 text-center font-bold">2</td>
            <td className="border-r border-slate-900 p-2">หัก เงินประกันผลงาน (Retention {retentionPercent}%)</td>
            <td className="border-r border-slate-900 p-2 text-center font-mono">{retentionPercent.toFixed(2)}%</td>
            <td className="p-2 text-right font-mono font-bold text-rose-700">-{retentionVal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr className="font-semibold bg-slate-50">
            <td className="border-r border-slate-900 p-2 text-center font-bold">3</td>
            <td className="border-r border-slate-900 p-2">คงเหลือค่างานประเมินจ่ายก่อนภาษี</td>
            <td className="border-r border-slate-900 p-2 text-center font-mono">-</td>
            <td className="p-2 text-right font-mono font-bold">{taxableVal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr className="bg-rose-50/40 text-rose-900">
            <td className="border-r border-slate-900 p-2 text-center font-bold">4</td>
            <td className="border-r border-slate-900 p-2">หัก ภาษีเงินได้ ณ ที่จ่าย (Withholding Tax {whtPercent}%)</td>
            <td className="border-r border-slate-900 p-2 text-center font-mono">{whtPercent.toFixed(2)}%</td>
            <td className="p-2 text-right font-mono font-bold text-rose-700">-{whtVal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-slate-900 font-black text-white">
            <td colSpan={3} className="p-2.5 border-r border-slate-700 text-right text-amber-300 text-xs">
              จำนวนเงินจ่ายสุทธิให้ผู้รับจ้างช่วง (Net Payment Payable):
            </td>
            <td className="p-2.5 text-right font-mono text-amber-300 font-black text-sm">
              {netVal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="border border-slate-900 p-2 text-[10px] bg-slate-50">
        (จำนวนเงินตัวอักษร: <strong className="underline">หนึ่งแสนหนึ่งหมื่นห้าพันหนึ่งร้อยแปดสิบเจ็ดบาทห้าสิบสตางค์</strong>)
      </div>

      {/* Signatures */}
      <div className="border border-slate-900 bg-white">
        <div className="grid grid-cols-3 divide-x divide-slate-900 text-center text-[9px]">
          <div className="p-2.5 space-y-1">
            <p className="font-bold text-slate-800">ผู้รับจ้างช่วงผู้ขอเบิกเงิน</p>
            <div className="pt-5">
              <div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1">( นายประสิทธิ์ ช่างทองคำ )</p>
              <p className="text-slate-500 text-[8px]">{contractorName}</p>
            </div>
          </div>
          <div className="p-2.5 space-y-1 bg-slate-50/50">
            <p className="font-bold text-slate-800">วิศวกรผู้ตรวจรับผลงาน</p>
            <div className="pt-5">
              <div className="border-b border-dotted border-slate-600 w-3/4 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1">( วิศวกร ชาญชัย สย.99887 )</p>
              <p className="text-slate-500 text-[8px]">วิศวกรโครงการ</p>
            </div>
          </div>
          <div className="p-2.5 space-y-1 bg-indigo-50/30">
            <p className="font-bold text-slate-800">ผู้อนุมัติจ่ายเงิน (MD)</p>
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
