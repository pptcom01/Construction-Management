import { useState, useMemo } from 'react';
import { Disbursement } from '../types';
import { X, Printer, Calendar, Building2, Download, CheckCircle2 } from 'lucide-react';
import { getCompanyProfile } from '../utils/thaiBahtText';
import { compareDisbursementsDesc } from '../utils/accounting';

interface DailyTransferReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  disbursements: Disbursement[];
}

export function DailyTransferReportModal({
  isOpen,
  onClose,
  disbursements
}: DailyTransferReportModalProps) {
  // Today's Thai date string default
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const thaiYear = today.getFullYear() + 543;
    return `${today.getDate()}/${today.getMonth() + 1}/${thaiYear}`;
  });

  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [recordedByName, setRecordedByName] = useState('น.ส.กมลทิพย์ กรมทอง (การเงิน)');

  // Filter disbursements by paymentDate and company
  const paidVouchers = useMemo(() => {
    return disbursements.filter(d => {
      // Must have transfer amount or marked as paid
      const matchCompany = selectedCompany === 'ALL' || d.company === selectedCompany;
      
      // Match date or check if paymentDate matches
      let matchDate = true;
      if (selectedDate.trim() !== '') {
        const cleanSelected = selectedDate.trim();
        const dPayment = (d.paymentDate || '').trim();
        const dEntry = (d.entryDate || '').trim();
        matchDate = dPayment === cleanSelected || dPayment.includes(cleanSelected) || dEntry === cleanSelected;
      }

      return matchCompany && matchDate && (d.status === 'paid' || (d.transferAmount && d.transferAmount > 0));
    }).sort(compareDisbursementsDesc);
  }, [disbursements, selectedDate, selectedCompany]);

  // Summaries
  const summary = useMemo(() => {
    let totalTransfer = 0;
    let totalFees = 0;
    let count = 0;

    paidVouchers.forEach(v => {
      totalTransfer += (v.transferAmount || v.totalAmount);
      totalFees += (v.fee || 0);
      count++;
    });

    return {
      count,
      totalTransfer,
      totalFees,
      netAmount: totalTransfer
    };
  }, [paidVouchers]);

  // Project breakdown
  const projectSummary = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    paidVouchers.forEach(v => {
      const pKey = v.project || 'ไม่ระบุโครงการ';
      if (!map[pKey]) {
        map[pKey] = { count: 0, total: 0 };
      }
      map[pKey].count += 1;
      map[pKey].total += (v.transferAmount || v.totalAmount);
    });
    return Object.entries(map).map(([project, data]) => ({ project, ...data }));
  }, [paidVouchers]);

  const companyInfo = getCompanyProfile(selectedCompany === 'ALL' ? 'BTC' : selectedCompany);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatMoney = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
    return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Controls Bar (hidden during print) */}
        <div className="print:hidden bg-linear-to-r from-blue-50 via-white to-emerald-50 border-b border-blue-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#005aa9] flex items-center justify-center font-black shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                รายงานการโอนประจำวัน (Daily Transfer Report)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                สรุปรายการจ่ายเงินฝ่ายการเงิน และสรุปยอดแยกตามโครงการประจำวัน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <span className="text-[11px] font-bold text-slate-600 pl-2">วันที่:</span>
              <input
                type="text"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="วว/ดด/ปปปป เช่น 29/08/2569"
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold w-28 focus:ring-1 focus:ring-[#005aa9]"
              />
            </div>

            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="ALL">ทุกบริษัท (ALL)</option>
              <option value="BTC">BTC</option>
              <option value="BTCP">BTCP</option>
              <option value="TBTC">TBTC</option>
              <option value="BTC-PC">BTC-PC</option>
            </select>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#005aa9] hover:bg-[#004887] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-700/20 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์รายงาน A4</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Sheet */}
        <div id="printable-daily-report" className="p-4 sm:p-8 flex-1 overflow-y-auto print:max-h-none print:overflow-visible print:p-6 bg-white text-slate-900 font-['Sarabun',sans-serif]">
          
          {/* Header */}
          <div className="text-center pb-3 mb-4 border-b-2 border-black">
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              {companyInfo.fullName}
            </h1>
            <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
              {companyInfo.address} โทรศัพท์ {companyInfo.phone}
            </p>
            <div className="inline-block mt-2 px-4 py-1 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-sm font-bold text-blue-900">
                รายงานการโอนประจำวัน วันที่ {selectedDate || '-'}
              </h2>
            </div>
          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-center">
              <span className="text-[11px] font-bold text-emerald-800 block">จำนวนรายการ</span>
              <span className="text-xl font-black text-emerald-950 font-mono">{summary.count}</span>
            </div>

            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-center">
              <span className="text-[11px] font-bold text-blue-800 block">ยอดโอนรวม (บาท)</span>
              <span className="text-xl font-black text-blue-950 font-mono">{formatMoney(summary.totalTransfer)}</span>
            </div>

            <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl text-center">
              <span className="text-[11px] font-bold text-purple-800 block">ค่าธรรมเนียม (บาท)</span>
              <span className="text-xl font-black text-purple-950 font-mono">{formatMoney(summary.totalFees)}</span>
            </div>

            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-center">
              <span className="text-[11px] font-bold text-amber-800 block">ยอดสุทธิ (บาท)</span>
              <span className="text-xl font-black text-amber-950 font-mono">{formatMoney(summary.netAmount)}</span>
            </div>
          </div>

          {/* Transfer Table */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <span>รายละเอียดการโอนเงิน</span>
              <span className="text-[10px] text-slate-500 font-normal">({paidVouchers.length} รายการ)</span>
            </h3>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="bg-blue-700 text-white text-center font-bold">
                    <th className="border border-slate-300 py-1.5 px-1 w-10">ลำดับ</th>
                    <th className="border border-slate-300 py-1.5 px-2 text-left">ผู้รับเงิน / Payee</th>
                    <th className="border border-slate-300 py-1.5 px-2 text-left">บัญชีปลายทาง</th>
                    <th className="border border-slate-300 py-1.5 px-2">เลขอ้างอิง / เช็ค</th>
                    <th className="border border-slate-300 py-1.5 px-2 text-left">โครงการ</th>
                    <th className="border border-slate-300 py-1.5 px-2 text-left">รายการ / Description</th>
                    <th className="border border-slate-300 py-1.5 px-2 text-right">จำนวนเงิน (บาท)</th>
                    <th className="border border-slate-300 py-1.5 px-2">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {paidVouchers.length > 0 ? (
                    paidVouchers.map((voucher, idx) => (
                      <tr key={voucher.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="border border-slate-300 text-center py-1.5 font-mono">{idx + 1}</td>
                        <td className="border border-slate-300 py-1.5 px-2 font-bold text-slate-900">
                          {voucher.payeeName}
                          <span className="text-[10px] text-slate-500 block font-normal">{voucher.company}</span>
                        </td>
                        <td className="border border-slate-300 py-1.5 px-2 font-mono text-[10px]">
                          {voucher.payeeBankAccount || '-'}
                        </td>
                        <td className="border border-slate-300 py-1.5 px-2 text-center font-mono">
                          {voucher.chequeNo || voucher.refDocNo || voucher.dbmNo}
                        </td>
                        <td className="border border-slate-300 py-1.5 px-2 text-slate-800 max-w-[140px] truncate">
                          {voucher.project}
                        </td>
                        <td className="border border-slate-300 py-1.5 px-2 text-slate-700">
                          {voucher.items && voucher.items.length > 0 ? (
                            voucher.items.map((it, i) => (
                              <div key={i} className="text-[10px] truncate">
                                • {it.description} ({formatMoney(it.amount)})
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px]">{voucher.expenseType}</span>
                          )}
                        </td>
                        <td className="border border-slate-300 py-1.5 px-2 text-right font-mono font-bold text-slate-900">
                          {formatMoney(voucher.transferAmount || voucher.totalAmount)}
                        </td>
                        <td className="border border-slate-300 py-1.5 px-2 text-center">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                            {voucher.status === 'paid' ? 'จ่ายแล้ว' : voucher.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400 font-medium">
                        ไม่พบรายการโอนเงินในวันที่หรือเงื่อนไขที่เลือก (กรุณาเลือกวันที่หรือเปลี่ยนบริษัท)
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50 font-black text-blue-950">
                    <td colSpan={6} className="border border-slate-300 py-2 px-3 text-center text-xs">
                      รวมยอดการโอนเงินทั้งหมด ({paidVouchers.length} รายการ)
                    </td>
                    <td className="border border-slate-300 py-2 px-2 text-right font-mono text-sm">
                      {formatMoney(summary.totalTransfer)}
                    </td>
                    <td className="border border-slate-300"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Summary by Project */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-800 mb-2">สรุปยอดตามโครงการ (Summary by Project)</h3>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 text-center font-bold">
                    <th className="border border-slate-300 py-1.5 px-3 text-left w-3/5">โครงการ</th>
                    <th className="border border-slate-300 py-1.5 px-3 w-1/5">จำนวนรายการ</th>
                    <th className="border border-slate-300 py-1.5 px-3 text-right w-1/5">ยอดรวม (บาท)</th>
                  </tr>
                </thead>
                <tbody>
                  {projectSummary.length > 0 ? (
                    projectSummary.map((p, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="border border-slate-300 py-1.5 px-3 font-medium text-slate-900">{p.project}</td>
                        <td className="border border-slate-300 py-1.5 px-3 text-center font-mono">{p.count}</td>
                        <td className="border border-slate-300 py-1.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatMoney(p.total)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-3 text-center text-slate-400">
                        ไม่มีข้อมูลสรุปโครงการ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures Block (3 blocks) */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-4 border-t border-slate-200">
            <div className="border border-slate-300 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-500 mb-1">วันที่ {selectedDate || '...'}</div>
              <div className="border-b border-slate-400 h-10 mb-2"></div>
              <div className="font-bold text-xs text-slate-900">ผู้จัดทำรายงาน</div>
              <div className="text-[11px] text-slate-600 mt-1 font-medium">{recordedByName}</div>
            </div>

            <div className="border border-slate-300 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-500 mb-1">วันที่ {selectedDate || '...'}</div>
              <div className="border-b border-slate-400 h-10 mb-2"></div>
              <div className="font-bold text-xs text-slate-900">ผู้ตรวจสอบ</div>
              <div className="text-[11px] text-slate-400 mt-1">.................................................</div>
            </div>

            <div className="border border-slate-300 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-500 mb-1">วันที่ {selectedDate || '...'}</div>
              <div className="border-b border-slate-400 h-10 mb-2"></div>
              <div className="font-bold text-xs text-slate-900">ผู้อนุมัติ</div>
              <div className="text-[11px] text-slate-400 mt-1">.................................................</div>
            </div>
          </div>

          {/* Note Footer */}
          <div className="mt-4 p-2.5 bg-slate-50 border-l-4 border-emerald-500 rounded text-[10px] text-slate-600">
            <strong>หมายเหตุ:</strong> รายงานการโอนเงินประจำวัน วันที่ {selectedDate || '-'} • เอกสารบันทึกการเงินและใช้ประกอบการกระทบยอดบัญชีธนาคาร (Bank Reconciliation)
          </div>

        </div>

      </div>
    </div>
  );
}
