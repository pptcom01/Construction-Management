import { useRef } from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { SubcontractPaymentClaim, Subcontract } from '../types';
import { formatCurrency } from '../utils/accounting';

interface SubcontractPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: SubcontractPaymentClaim;
  contract?: Subcontract;
}

export function SubcontractPrintModal({
  isOpen,
  onClose,
  claim,
  contract
}: SubcontractPrintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getEntityTypeName = (type: SubcontractPaymentClaim['entityType']) => {
    switch (type) {
      case 'individual':
        return 'บุคคลธรรมดา (หัก ณ ที่จ่าย 3% ตาม ภ.ง.ด.3)';
      case 'corporate_vat':
        return 'นิติบุคคล จดทะเบียนภาษีมูลค่าเพิ่ม (VAT 7% + หัก ณ ที่จ่าย 3% ตาม ภ.ง.ด.53)';
      case 'corporate_novat':
        return 'นิติบุคคล ไม่จดทะเบียนภาษีมูลค่าเพิ่ม (หัก ณ ที่จ่าย 3% ตาม ภ.ง.ด.53)';
      default:
        return '-';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200">
        
        {/* Modal Action Header (Hidden during Print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#005aa9]" />
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                พิมพ์ใบเบิกค่าผลงานและใบปะหน้าสรุปรายการ (Progress Payment Request)
              </h3>
              <p className="text-xs text-slate-500">
                เลขที่เอกสาร: <span className="font-semibold text-slate-700">{claim.claimNo}</span> | สัญญา: {claim.contractNo} (งวดที่ {claim.inspectionNo})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#005aa9] text-white hover:bg-blue-800 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              สั่งพิมพ์เอกสาร (Print / PDF)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div ref={printRef} className="p-8 sm:p-10 overflow-y-auto print:p-0 print:overflow-visible text-slate-800 text-xs sm:text-sm font-sans">
          
          {/* ================= PAGE 1: ใบเบิกค่าผลงาน (PROGRESS PAYMENT REQUEST) ================= */}
          <div className="border border-slate-300 rounded-lg p-6 bg-white shadow-xs mb-8 print:border-none print:shadow-none print:p-0 print:m-0 print:mb-12">
            
            {/* Header Document */}
            <div className="border-b-2 border-slate-800 pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                    กลุ่มบริษัท บุรีรัมย์ธงชัยก่อสร้าง (BTC GROUP)
                  </h1>
                  <p className="text-xs text-slate-600">
                    ฝ่ายบริหารโครงการก่อสร้าง &bull; ระบบควบคุมสัญญาผู้รับเหมาช่วง
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded font-bold text-xs uppercase tracking-wider text-slate-800">
                    ใบเบิกเงินค่าผลงานผู้รับเหมาช่วง
                  </span>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    PROGRESS PAYMENT REQUEST
                  </p>
                </div>
              </div>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-md border border-slate-200 mb-5">
              <div>
                <p className="text-slate-500">โครงการ / สายทาง:</p>
                <p className="font-bold text-slate-900 text-sm">{claim.project}</p>
                
                <p className="text-slate-500 mt-2">เลขที่สัญญาจ้างเหมา:</p>
                <p className="font-bold text-slate-800">{claim.contractNo} {contract?.contractTitle ? `(${contract.contractTitle})` : ''}</p>

                <p className="text-slate-500 mt-2">ผู้รับเหมาช่วง (คู่สัญญา):</p>
                <p className="font-bold text-slate-800">{claim.contractorName}</p>
                <p className="text-slate-500 text-[11px]">เลขประจำตัวผู้เสียภาษี: {contract?.taxId || claim.payeeTaxId}</p>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">เลขที่ใบเบิก:</span>
                  <span className="font-bold font-mono text-slate-900">{claim.claimNo}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-500">เบิกประจำงวดที่ (Inspection #):</span>
                  <span className="font-bold text-blue-900">งวดที่ {claim.inspectionNo}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-500">วันที่ทำรายการเบิก:</span>
                  <span className="font-semibold">{claim.claimDate}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-500">อ้างอิงเลขที่ DBM:</span>
                  <span className="font-bold text-slate-800 font-mono">{claim.dbmNo || 'รอออกเลขที่ DBM'}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block">สถานะทางภาษี:</span>
                  <span className="font-semibold text-slate-800 text-[11px] block">
                    {getEntityTypeName(claim.entityType)}
                  </span>
                </div>
              </div>
            </div>

            {/* Calculation Table */}
            <div className="border border-slate-300 rounded-md overflow-hidden mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                    <th className="py-2.5 px-3 w-12 text-center">ลำดับ</th>
                    <th className="py-2.5 px-3">รายการแสดงรายละเอียดการคำนวณเงินประจำงวด</th>
                    <th className="py-2.5 px-3 text-right w-36">จำนวนเงิน (บาท)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  <tr>
                    <td className="py-2 px-3 text-center text-slate-400 font-sans">1</td>
                    <td className="py-2 px-3 font-sans">
                      <span className="font-bold text-slate-900">มูลค่างานที่ตรวจรับและอนุมัติผ่านงวดนี้ (Approved Work Value)</span>
                      <p className="text-[11px] text-slate-500">ผลงานงวดที่ {claim.inspectionNo} ผ่านการตรวจรับความถูกต้องหน้างาน</p>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(claim.approvedWorkAmount)}
                    </td>
                  </tr>

                  <tr className="text-red-700 bg-red-50/20">
                    <td className="py-2 px-3 text-center text-slate-400 font-sans">2</td>
                    <td className="py-2 px-3 font-sans">
                      <span>หัก เงินประกันผลงาน (Retention) {(claim.retentionRate * 100).toFixed(0)}%</span>
                      <p className="text-[11px] text-slate-500">กันไว้เป็นเงินประกันความชำรุดบกพร่องตามสัญญา</p>
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      - {formatCurrency(claim.retentionAmount)}
                    </td>
                  </tr>

                  <tr className="text-red-700 bg-red-50/20">
                    <td className="py-2 px-3 text-center text-slate-400 font-sans">3</td>
                    <td className="py-2 px-3 font-sans">
                      <span>หัก ค่าวัสดุจากร้านค้าที่ผู้รับเหมาเบิกไปใช้ (Material Backcharges)</span>
                      <p className="text-[11px] text-slate-500">แจกแจงตามใบปะหน้าสรุปบิลร้านค้าแนบ ({claim.deductionItems.filter(d => d.type === 'material_store').length} บิล)</p>
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      - {formatCurrency(claim.materialDeductionsTotal)}
                    </td>
                  </tr>

                  <tr className="text-red-700 bg-red-50/20">
                    <td className="py-2 px-3 text-center text-slate-400 font-sans">4</td>
                    <td className="py-2 px-3 font-sans">
                      <span>หัก รายการหักอื่นๆ (ค่าปรับ, เครื่องจักรเสียหาย, น้ำมัน)</span>
                      <p className="text-[11px] text-slate-500">({claim.deductionItems.filter(d => d.type !== 'material_store').length} รายการ)</p>
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      - {formatCurrency(claim.otherDeductionsTotal)}
                    </td>
                  </tr>

                  {/* Tax Base */}
                  <tr className="bg-slate-50 font-sans font-bold border-t-2 border-slate-300">
                    <td colSpan={2} className="py-2.5 px-3 text-right text-slate-800">
                      มูลค่าฐานภาษี / ยอดค่างานคงเหลือก่อนภาษี (Tax Base Amount):
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-900 font-bold">
                      {formatCurrency(claim.taxBaseAmount)}
                    </td>
                  </tr>

                  {/* VAT 7% */}
                  {claim.vatAmount > 0 && (
                    <tr className="text-blue-900 bg-blue-50/20">
                      <td className="py-2 px-3 text-center text-slate-400 font-sans">5</td>
                      <td className="py-2 px-3 font-sans">
                        <span>บวก ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                        <p className="text-[11px] text-slate-500">คำนวณจากฐานภาษี 7% (สำหรับนิติบุคคลจด VAT)</p>
                      </td>
                      <td className="py-2 px-3 text-right font-semibold">
                        + {formatCurrency(claim.vatAmount)}
                      </td>
                    </tr>
                  )}

                  {/* WHT 3% */}
                  <tr className="text-amber-800 bg-amber-50/20">
                    <td className="py-2 px-3 text-center text-slate-400 font-sans">6</td>
                    <td className="py-2 px-3 font-sans">
                      <span>หัก ภาษีเงินได้ ณ ที่จ่าย (Withholding Tax 3%)</span>
                      <p className="text-[11px] text-slate-500">
                        {claim.entityType === 'individual' ? 'ตามแบบ ภ.ง.ด.3 (บุคคลธรรมดา)' : 'ตามแบบ ภ.ง.ด.53 (นิติบุคคล)'}
                      </p>
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      - {formatCurrency(claim.whtAmount)}
                    </td>
                  </tr>

                  {/* Grand Net Total */}
                  <tr className="bg-emerald-50 text-emerald-950 font-sans font-bold text-sm border-t-2 border-emerald-600">
                    <td colSpan={2} className="py-3 px-3 text-right">
                      ยอดเงินจ่ายสุทธิประจำงวด (Net Payable Amount):
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-base text-emerald-900">
                      {formatCurrency(claim.netPayableAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payee Details & Banking */}
            <div className="bg-slate-50 border border-slate-300 rounded-md p-4 mb-6">
              <h4 className="font-bold text-xs uppercase text-slate-700 tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#005aa9]" />
                ข้อมูลการโอนเงินเข้าบัญชีของผู้รับเงินงวดนี้ (Payee & Bank Account)
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-500">ชื่อบัญชีผู้รับเงิน:</p>
                  <p className="font-bold text-slate-900 text-sm">{claim.payeeName}</p>
                  {claim.isAuthorizedRepresentative && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] font-bold">
                      * จ่ายตามหนังสือมอบอำนาจ: {claim.authorizationRef || 'แนบเอกสารแล้ว'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-slate-500">ธนาคาร & เลขที่บัญชี:</p>
                  <p className="font-bold font-mono text-slate-900 text-sm">
                    {claim.payeeBankName} &bull; {claim.payeeBankAccount}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    เลขประจำตัวผู้เสียภาษี/บัตร ปชช.: {claim.payeeTaxId}
                  </p>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-4 gap-3 text-center text-xs pt-4 border-t border-slate-300">
              <div className="border border-slate-200 rounded p-3">
                <p className="text-slate-500 text-[11px]">ผู้ส่งมอบงาน / ผู้รับเหมาช่วง</p>
                <div className="h-12 border-b border-dashed border-slate-300 my-2"></div>
                <p className="font-semibold text-slate-800">({claim.payeeName})</p>
                <p className="text-[10px] text-slate-400 mt-0.5">วันที่ ...../...../..........</p>
              </div>

              <div className="border border-slate-200 rounded p-3">
                <p className="text-slate-500 text-[11px]">วิศวกรผู้ตรวจรับหน้างาน</p>
                <div className="h-12 border-b border-dashed border-slate-300 my-2"></div>
                <p className="font-semibold text-slate-800">(วิศวกรโครงการ / PE)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">วันที่ ...../...../..........</p>
              </div>

              <div className="border border-slate-200 rounded p-3">
                <p className="text-slate-500 text-[11px]">ผู้จัดการโครงการ (PM)</p>
                <div className="h-12 border-b border-dashed border-slate-300 my-2"></div>
                <p className="font-semibold text-slate-800">(ผู้จัดการโครงการ)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">วันที่ ...../...../..........</p>
              </div>

              <div className="border border-slate-200 rounded p-3 bg-slate-50">
                <p className="text-slate-500 text-[11px]">ผู้มีอำนาจอนุมัติจ่าย (BTC Group)</p>
                <div className="h-12 border-b border-dashed border-slate-300 my-2"></div>
                <p className="font-bold text-slate-900">(กรรมการผู้จัดการ)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">วันที่ ...../...../..........</p>
              </div>
            </div>

          </div>

          {/* ================= PAGE 2: ใบปะหน้าสรุปรายการหักละเอียด (DEDUCTIONS COVER SHEET) ================= */}
          <div className="border border-slate-300 rounded-lg p-6 bg-white shadow-xs print:border-none print:shadow-none print:p-0 print:m-0">
            
            <div className="border-b-2 border-slate-800 pb-3 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    ใบปะหน้าสรุปรายการหักค่าวัสดุร้านค้าและค่าใช้จ่ายอื่น ๆ (แนบใบเบิก)
                  </h2>
                  <p className="text-xs text-slate-600">
                    DETAILED DEDUCTIONS & MATERIAL BACKCHARGE COVER SHEET
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-slate-500">เอกสารแนบใบเบิกเลขที่:</p>
                  <p className="font-bold font-mono text-slate-900">{claim.claimNo}</p>
                </div>
              </div>
            </div>

            <div className="mb-4 text-xs text-slate-600 flex justify-between bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <span className="text-slate-500">โครงการ: </span>
                <span className="font-bold text-slate-800">{claim.project}</span>
                <span className="mx-2 text-slate-300">|</span>
                <span className="text-slate-500">สัญญา: </span>
                <span className="font-bold text-slate-800">{claim.contractNo}</span>
              </div>
              <div>
                <span className="text-slate-500">ผู้รับเหมาช่วง: </span>
                <span className="font-bold text-slate-800">{claim.contractorName}</span>
              </div>
            </div>

            {/* Deductions Items Table */}
            <div className="border border-slate-300 rounded-md overflow-hidden mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 w-28">ประเภทการหัก</th>
                    <th className="py-2.5 px-3">ชื่อร้านค้า / คลัง / เลขที่บิลส่งของ</th>
                    <th className="py-2.5 px-3">รายละเอียดค่าใช้จ่ายที่หัก</th>
                    <th className="py-2.5 px-3 w-24 text-center">วันที่บิล</th>
                    <th className="py-2.5 px-3 text-right w-32">จำนวนเงิน (บาท)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {claim.deductionItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">
                        ไม่มีรายการหักค่าวัสดุหรือค่าปรับในงวดนี้
                      </td>
                    </tr>
                  ) : (
                    claim.deductionItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50 font-sans">
                        <td className="py-2 px-3 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.type === 'material_store'
                              ? 'bg-blue-100 text-blue-900'
                              : item.type === 'fuel'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-red-100 text-red-900'
                          }`}>
                            {item.type === 'material_store' 
                              ? 'วัสดุร้านค้า' 
                              : item.type === 'fuel'
                              ? 'ค่าน้ำมัน'
                              : 'ค่าปรับ/เสียหาย'}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {item.storeOrVendorName || '-'}
                          {item.billOrDocNo && (
                            <span className="block text-[11px] font-mono text-slate-500">
                              บิล/ใบส่งของ: {item.billOrDocNo}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {item.description}
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-slate-600">
                          {item.date}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-red-700">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))
                  )}

                  {/* Summary Rows */}
                  <tr className="bg-slate-50 font-sans font-bold border-t-2 border-slate-300">
                    <td colSpan={5} className="py-2 px-3 text-right text-slate-700">
                      รวมรายการหักค่าวัสดุร้านค้า (Material Backcharges):
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-red-700">
                      {formatCurrency(claim.materialDeductionsTotal)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-sans font-bold">
                    <td colSpan={5} className="py-2 px-3 text-right text-slate-700">
                      รวมรายการหักค่าปรับและค่าเสียหายอื่นๆ:
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-red-700">
                      {formatCurrency(claim.otherDeductionsTotal)}
                    </td>
                  </tr>
                  <tr className="bg-red-50/50 font-sans font-black border-t border-red-200">
                    <td colSpan={5} className="py-2.5 px-3 text-right text-red-950">
                      ยอดรวมรายการหักทั้งสิ้น (Total Deductions):
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-base text-red-800">
                      {formatCurrency(claim.materialDeductionsTotal + claim.otherDeductionsTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Note & Confirmation */}
            <div className="bg-amber-50/60 border border-amber-200 rounded p-3 text-xs text-amber-900 mb-6">
              <p className="font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                หมายเหตุการตรวจสอบรายการหัก:
              </p>
              <p className="mt-0.5 text-[11px] text-amber-800">
                รายการหักทั้งหมดได้รับการตรวจสอบเทียบกับใบส่งของจริงจากร้านค้า/คลังหน้างาน และผู้รับเหมาช่วงได้ลงนามยินยอมให้หักกลบลบหนี้ออกจากยอดเงินค่าผลงานงวดนี้เรียบร้อยแล้ว
              </p>
            </div>

            {/* Deductions Approval Signatures */}
            <div className="grid grid-cols-3 gap-4 text-center text-xs pt-4 border-t border-slate-300">
              <div className="border border-slate-200 rounded p-3">
                <p className="text-slate-500 text-[11px]">ผู้ตรวจสอบบิลวัสดุหน้างาน (ธุรการ/พัสดุ)</p>
                <div className="h-10 border-b border-dashed border-slate-300 my-2"></div>
                <p className="font-semibold text-slate-800">(เจ้าหน้าที่พัสดุโครงการ)</p>
              </div>

              <div className="border border-slate-200 rounded p-3">
                <p className="text-slate-500 text-[11px]">วิศวกรผู้ควบคุมงาน</p>
                <div className="h-10 border-b border-dashed border-slate-300 my-2"></div>
                <p className="font-semibold text-slate-800">(วิศวกรโครงการ / PE)</p>
              </div>

              <div className="border border-slate-200 rounded p-3">
                <p className="text-slate-500 text-[11px]">ผู้ยินยอมให้หักค่าใช้จ่าย (ช่างเหมา)</p>
                <div className="h-10 border-b border-dashed border-slate-300 my-2"></div>
                <p className="font-semibold text-slate-800">({claim.payeeName})</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
