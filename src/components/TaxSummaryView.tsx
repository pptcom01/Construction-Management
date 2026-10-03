import { useMemo, useState } from 'react';
import { Transaction } from '../types';
import { formatCurrency, compareTransactionsDesc } from '../utils/accounting';
import { 
  FileCheck2, 
  Receipt, 
  Building2, 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  Clock,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

interface TaxSummaryViewProps {
  transactions: Transaction[];
}

export function TaxSummaryView({ transactions }: TaxSummaryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter all tax and compliance transactions
  const taxRecords = useMemo(() => {
    return transactions.filter(t => {
      const desc = t.description.toLowerCase();
      const cat = t.category.toLowerCase();
      return desc.includes('ภงด') || desc.includes('ภ.ง.ด') ||
             desc.includes('ภพ.30') || desc.includes('ภ.พ.30') ||
             desc.includes('ประกันสังคม') || desc.includes('กยศ') ||
             desc.includes('อากรแสตมป์') || desc.includes('อ.ส.9') ||
             desc.includes('ภาษี') || desc.includes('สรรพากร') ||
             cat.includes('ภาษี') || cat.includes('ประกันสังคม');
    }).map(t => {
      let taxType = 'ภาษีอื่นๆ';
      const desc = t.description;

      if (desc.includes('ภงด.1') || desc.includes('ภ.ง.ด.1')) taxType = 'ภ.ง.ด.1 (ภาษีเงินเดือน)';
      else if (desc.includes('ภงด.3') || desc.includes('ภ.ง.ด.3')) taxType = 'ภ.ง.ด.3 (หักบุคคลธรรมดา)';
      else if (desc.includes('ภงด.53') || desc.includes('ภ.ง.ด.53')) taxType = 'ภ.ง.ด.53 (หักนิติบุคคล)';
      else if (desc.includes('ภ.พ.30') || desc.includes('ภพ.30') || desc.includes('ภ.พ 30')) taxType = 'ภ.พ.30 (ภาษีมูลค่าเพิ่ม VAT)';
      else if (desc.includes('ประกันสังคม')) taxType = 'เงินสมทบประกันสังคม (สปส.)';
      else if (desc.includes('กยศ')) taxType = 'เงินกู้ยืมเพื่อการศึกษา (กยศ.)';
      else if (desc.includes('ภงด.50') || desc.includes('ภ.ง.ด.50')) taxType = 'ภ.ง.ด.50 (ภาษีเงินได้นิติบุคคล)';
      else if (desc.includes('อากรแสตมป์') || desc.includes('อ.ส.9')) taxType = 'อากรแสตมป์สัญญา (อ.ส.9)';

      return {
        ...t,
        taxType
      };
    }).sort(compareTransactionsDesc);
  }, [transactions]);

  // Aggregate stats by tax type
  const taxGroupStats = useMemo(() => {
    const map = new Map<string, { totalPaid: number; totalRefund: number; count: number }>();
    taxRecords.forEach(t => {
      if (!map.has(t.taxType)) {
        map.set(t.taxType, { totalPaid: 0, totalRefund: 0, count: 0 });
      }
      const cur = map.get(t.taxType)!;
      cur.totalPaid += t.credit;
      cur.totalRefund += t.debit;
      cur.count += 1;
    });

    return Array.from(map.entries()).map(([taxType, val]) => ({
      taxType,
      totalPaid: val.totalPaid,
      totalRefund: val.totalRefund,
      netPaid: val.totalPaid - val.totalRefund,
      count: val.count
    })).sort((a, b) => b.totalPaid - a.totalPaid);
  }, [taxRecords]);

  // Total tax paid and refunded
  const { totalTaxPaid, totalTaxRefund } = useMemo(() => {
    let paid = 0;
    let refund = 0;
    taxRecords.forEach(t => {
      paid += t.credit || 0;
      refund += t.debit || 0;
    });
    return { totalTaxPaid: paid, totalTaxRefund: refund };
  }, [taxRecords]);

  // Companies list in tax records
  const companiesList = useMemo(() => {
    const set = new Set<string>();
    taxRecords.forEach(t => {
      if (t.company) set.add(t.company);
    });
    return Array.from(set).sort();
  }, [taxRecords]);

  // Filtered records for table
  const filteredRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return taxRecords.filter(t => {
      if (selectedCategory !== 'all' && t.taxType !== selectedCategory) return false;
      if (selectedCompany !== 'all' && t.company !== selectedCompany) return false;

      if (term) {
        const matchesDoc = t.docNo && t.docNo.toLowerCase().includes(term);
        const matchesDesc = t.description.toLowerCase().includes(term);
        const matchesProject = t.project && t.project.toLowerCase().includes(term);
        const matchesCompany = t.company && t.company.toLowerCase().includes(term);
        if (!matchesDoc && !matchesDesc && !matchesProject && !matchesCompany) return false;
      }

      return true;
    });
  }, [taxRecords, selectedCategory, selectedCompany, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

  // Export Tax CSV
  const handleExportTaxCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = [
      'วันที่',
      'เลขที่เอกสาร',
      'ประเภทภาษี',
      'บริษัท',
      'โครงการ',
      'รายละเอียด',
      'ยอดนำส่ง_Cr',
      'ยอดรับคืน_Dr'
    ];

    const rows = filteredRecords.map(r => [
      `"${r.date}"`,
      `"${r.docNo || ''}"`,
      `"${r.taxType}"`,
      `"${r.company || ''}"`,
      `"${r.project || ''}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`,
      r.credit || 0,
      r.debit || 0
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tax_compliance_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3.5 pb-6">
      {/* 1. Header: Clean, Direct & Professional */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white px-4 py-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[#005aa9]" />
            <span>สรุปภาษี, ประกันสังคม & กฎหมาย (Tax & Legal Compliance)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            รายงานการยื่นและนำส่งภาษีหัก ณ ที่จ่าย (ภ.ง.ด.1, 3, 53), ภาษีมูลค่าเพิ่ม (ภ.พ.30), ประกันสังคม (สปส.) และ กยศ.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportTaxCSV}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="ส่งออกรายงานภาษีเป็นไฟล์ CSV สำหรับยื่นสรรพากร"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Tax Category Filter Cards */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>หมวดหมู่ภาษีและประกันสังคม (คลิกการ์ดเพื่อกรองรายการ)</span>
          </span>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className="text-[11px] font-semibold text-[#005aa9] hover:underline cursor-pointer"
            >
              แสดงทุกประเภท &times;
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {/* Card: All Taxes */}
          <div
            onClick={() => {
              setSelectedCategory('all');
              setCurrentPage(1);
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold ${selectedCategory === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
                ทุกประเภท
              </span>
              <Layers className={`w-3.5 h-3.5 ${selectedCategory === 'all' ? 'text-slate-300' : 'text-slate-400'}`} />
            </div>
            <div className="text-sm font-bold font-mono tracking-tight">
              {formatCurrency(totalTaxPaid)}
            </div>
            <div className={`text-[9px] mt-0.5 ${selectedCategory === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
              {taxRecords.length} รายการสะสม
            </div>
          </div>

          {/* Cards for each tax group */}
          {taxGroupStats.map((tg, idx) => {
            const isSelected = selectedCategory === tg.taxType;
            let badgeColor = 'text-blue-700';
            if (tg.taxType.includes('ภ.ง.ด.1')) badgeColor = 'text-indigo-700';
            else if (tg.taxType.includes('ภ.ง.ด.3') || tg.taxType.includes('ภ.ง.ด.53')) badgeColor = 'text-amber-700';
            else if (tg.taxType.includes('ภ.พ.30')) badgeColor = 'text-emerald-700';
            else if (tg.taxType.includes('ประกันสังคม')) badgeColor = 'text-sky-700';

            return (
              <div
                key={idx}
                onClick={() => {
                  setSelectedCategory(isSelected ? 'all' : tg.taxType);
                  setCurrentPage(1);
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-[#005aa9] text-white border-[#005aa9] ring-2 ring-[#005aa9]/20'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold truncate max-w-[100px] ${
                    isSelected ? 'text-blue-100' : badgeColor
                  }`} title={tg.taxType}>
                    {tg.taxType.split(' ')[0]}
                  </span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                    isSelected ? 'bg-blue-800 text-blue-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tg.count}
                  </span>
                </div>
                <div className="text-sm font-bold font-mono tracking-tight">
                  {formatCurrency(tg.totalPaid)}
                </div>
                <div className={`text-[9px] mt-0.5 truncate ${
                  isSelected ? 'text-blue-200' : 'text-slate-400'
                }`} title={tg.taxType}>
                  {tg.taxType.split('(')[1] ? tg.taxType.split('(')[1].replace(')', '') : tg.taxType}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Search & Filter Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
          {/* Search Box */}
          <div className="relative sm:col-span-6 lg:col-span-5">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่เอกสาร, รายละเอียด, กรมสรรพากร..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#005aa9] font-medium"
            />
          </div>

          {/* Company Filter */}
          <div className="sm:col-span-4 lg:col-span-4">
            <select
              value={selectedCompany}
              onChange={(e) => { setSelectedCompany(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-[#005aa9]"
            >
              <option value="all">🏢 ทุกบริษัท / กิจการร่วมค้า</option>
              {companiesList.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(searchTerm || selectedCategory !== 'all' || selectedCompany !== 'all') && (
            <div className="sm:col-span-2 lg:col-span-3 flex items-center">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedCompany('all');
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer flex items-center gap-1"
              >
                <span>ล้างตัวกรอง</span>
              </button>
            </div>
          )}
        </div>

        {/* Compact E-Filing Deadline Badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-50/80 px-2.5 py-1.5 rounded-lg border border-amber-200/80">
          <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>
            <strong>กำหนดการยื่น e-Filing:</strong> ภ.ง.ด.1, 3, 53, สปส., กยศ. ยื่นภายในวันที่ 15-23 ของเดือนถัดไป • ภ.พ.30 ภายในวันที่ 23
          </span>
        </div>
      </div>

      {/* 4. Tax Ledger Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span>รายการนำส่งภาษีและประกันสังคม</span>
            <span className="text-slate-400 font-normal">
              ({filteredRecords.length} รายการ)
            </span>
          </h3>
          {selectedCategory !== 'all' && (
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {selectedCategory}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3 whitespace-nowrap">วันที่</th>
                <th className="py-2.5 px-3 whitespace-nowrap">เลขที่เอกสาร</th>
                <th className="py-2.5 px-3">ประเภทภาษี</th>
                <th className="py-2.5 px-3 min-w-[240px]">รายละเอียดรายการ</th>
                <th className="py-2.5 px-3 whitespace-nowrap">บริษัท / โครงการ</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">ยอดนำส่ง (Cr.)</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">ยอดรับคืน (Dr.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    ไม่พบรายการภาษีตามเงื่อนไขที่ระบุ
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-900">{tx.date}</td>
                    <td className="py-2 px-3 whitespace-nowrap font-mono text-slate-600">
                      {tx.docNo ? (
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold">{tx.docNo}</span>
                      ) : '-'}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {tx.taxType.split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800 leading-snug">
                      {tx.description}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-500">
                      <div className="font-medium text-slate-800 text-[11px] truncate max-w-[140px]" title={tx.company}>
                        {tx.company}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]" title={tx.project}>
                        {tx.project}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right font-bold font-mono text-rose-600 whitespace-nowrap">
                      {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold font-mono text-emerald-600 whitespace-nowrap">
                      {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination & Summary */}
        <div className="p-3 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="text-slate-500">
            แสดง <strong className="text-slate-800">{paginatedRecords.length}</strong> จากทั้งหมด <strong className="text-slate-800">{filteredRecords.length}</strong> รายการ
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="px-2 font-mono text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

