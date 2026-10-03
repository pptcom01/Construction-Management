import { useState, useMemo, FormEvent } from 'react';
import { SupplierBilling, SupplierBillItem, GoodsReceiptItem } from '../types';
import { formatCurrency } from '../utils/accounting';
import { getActiveUserName } from '../services/userService';
import { 
  ReceiptText, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileText, 
  Printer, 
  Building2, 
  AlertCircle, 
  Check, 
  X, 
  Filter, 
  Download, 
  ChevronRight,
  ShieldCheck,
  Eye,
  FileCheck2,
  DollarSign,
  PackageCheck,
  Boxes,
  Scale,
  CheckSquare,
  Square,
  ArrowRightLeft,
  Truck,
  Sparkles
} from 'lucide-react';
import { SearchableCombobox } from './SearchableCombobox';

interface SupplierBillingViewProps {
  billings: SupplierBilling[];
  goodsReceipts?: GoodsReceiptItem[];
  onAddBilling: (billing: Omit<SupplierBilling, 'id' | 'createdAt'>) => void;
  onUpdateBilling: (id: string, updates: Partial<SupplierBilling>) => void;
  onAddGoodsReceipt?: (receipt: Omit<GoodsReceiptItem, 'id' | 'createdAt'>) => void;
  onNavigateToProcurement?: () => void;
}

export function SupplierBillingView({
  billings,
  goodsReceipts = [],
  onAddBilling,
  onUpdateBilling,
  onAddGoodsReceipt,
  onNavigateToProcurement
}: SupplierBillingViewProps) {
  const [activeTab, setActiveTab] = useState<'billings' | 'receipts'>('billings');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'received' | 'verified' | 'ready_for_payment' | 'paid'>('all');
  const [receiptFilter, setReceiptFilter] = useState<'all' | 'pending_billing' | 'billed'>('all');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');

  // Modals
  const [isNewBillingOpen, setIsNewBillingOpen] = useState(false);
  const [preselectedVendor, setPreselectedVendor] = useState<string>('');
  const [preselectedReceiptIds, setPreselectedReceiptIds] = useState<string[]>([]);
  const [selectedBillingForPrint, setSelectedBillingForPrint] = useState<SupplierBilling | null>(null);
  const [isNewReceiptOpen, setIsNewReceiptOpen] = useState(false);

  // Projects list
  const uniqueProjects = useMemo(() => {
    const set = new Set<string>();
    billings.forEach(b => set.add(b.project));
    goodsReceipts.forEach(g => set.add(g.project));
    return Array.from(set);
  }, [billings, goodsReceipts]);

  // Filtered billings
  const filteredBillings = useMemo(() => {
    return billings.filter(b => {
      const matchProj = selectedProjectFilter === 'all' || b.project === selectedProjectFilter;
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchQ = !q ||
        b.billingNo.toLowerCase().includes(q) ||
        b.vendorName.toLowerCase().includes(q) ||
        (b.expressPvNo && b.expressPvNo.toLowerCase().includes(q)) ||
        b.items.some(i => i.expressPoNo.toLowerCase().includes(q) || i.doNo.toLowerCase().includes(q));
      return matchProj && matchStatus && matchQ;
    });
  }, [billings, selectedProjectFilter, statusFilter, searchQuery]);

  // Summary Metrics
  const totalDueAmount = billings
    .filter(b => b.status !== 'paid' && b.status !== 'rejected')
    .reduce((sum, b) => sum + b.grandTotal, 0);

  const totalPaidAmount = billings
    .filter(b => b.status === 'paid')
    .reduce((sum, b) => sum + b.grandTotal, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-[#009540] rounded-lg">
              <ReceiptText className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-base font-bold text-slate-900">
                ระบบโต๊ะรับวางบิลร้านค้า & เจ้าหนี้การค้า (Supplier Billing Acceptance Desk)
              </h1>
              <p className="text-xs text-slate-500">
                ตรวจเอกสารใบกำกับภาษี/ใบส่งของ, จับคู่ PO Express, คุมรอบเครดิตเทอม และนัดวันจ่ายเงิน
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsNewBillingOpen(true)}
          className="px-3.5 py-2 bg-[#009540] hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>บันทึกรับวางบิลใหม่</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">หนี้การค้ารอจ่าย (Total AP Payable)</span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded">
              รอชำระ
            </span>
          </div>
          <p className="text-lg font-black text-amber-700 font-mono mt-1">
            {formatCurrency(totalDueAmount)} <span className="text-xs font-sans font-normal text-slate-600">บาท</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {billings.filter(b => b.status !== 'paid' && b.status !== 'rejected').length} ฉบับรับวางบิลในระบบ
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-800 font-semibold flex items-center gap-1">
              <PackageCheck className="w-3.5 h-3.5 text-[#005aa9]" />
              สินค้าลงรับแล้ว-รอชนบิล
            </span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold text-[10px] rounded">
              {goodsReceipts.filter(g => g.billingStatus === 'pending_billing').length} รายการ
            </span>
          </div>
          <p className="text-lg font-black text-[#005aa9] font-mono mt-1">
            {formatCurrency(goodsReceipts.filter(g => g.billingStatus === 'pending_billing').reduce((s, g) => s + g.amount, 0))} <span className="text-xs font-sans font-normal text-slate-600">บาท</span>
          </p>
          <p className="text-[11px] text-blue-700 mt-0.5">
            ตรวจรับหน้างานแล้ว รอชุดเอกสารร้านค้า
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">จ่ายชำระแล้ว (Paid Out)</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[10px] rounded">
              เคลียร์แล้ว
            </span>
          </div>
          <p className="text-lg font-black text-emerald-700 font-mono mt-1">
            {formatCurrency(totalPaidAmount)} <span className="text-xs font-sans font-normal text-slate-600">บาท</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ตัดจ่ายสมบูรณ์ตามเลข PV ใน Express
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">ส่งออกไฟล์บัญชี Express</span>
            <button
              onClick={() => {
                const headers = 'BillingNo,Vendor,Project,ReceivedDate,DueDate,SubTotal,VAT,WHT,GrandTotal,ExpressPV,Status\n';
                const rows = filteredBillings.map(b => 
                  `"${b.billingNo}","${b.vendorName}","${b.project}","${b.receivedDate}","${b.dueDate}",${b.subTotal},${b.vatAmount},${b.whtAmount},${b.grandTotal},"${b.expressPvNo || ''}","${b.status}"`
                ).join('\n');
                const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `express-billing-export-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              Export CSV
            </button>
          </div>
          <p className="text-xs font-semibold text-slate-700 mt-1">
            รูปแบบไฟล์เชื่อมโยงฝ่ายบัญชี
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            ส่งข้อมูลเปิดใบสำคัญจ่าย (PV) ใน Express
          </p>
        </div>
      </div>

      {/* Navigation Tabs between Billings Acceptance and Goods Receipts */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('billings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'billings'
                ? 'bg-[#009540] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>ทะเบียนใบรับวางบิลร้านค้า ({billings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'receipts'
                ? 'bg-[#005aa9] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>รายการสินค้าที่ลงรับไว้ & ชนบิล ({goodsReceipts.length})</span>
            {goodsReceipts.filter(g => g.billingStatus === 'pending_billing').length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'receipts' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                รอชนบิล {goodsReceipts.filter(g => g.billingStatus === 'pending_billing').length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'receipts' && onAddGoodsReceipt && (
          <button
            onClick={() => setIsNewReceiptOpen(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>บันทึกตรวจรับสินค้าหน้างานใหม่ (GR)</span>
          </button>
        )}
      </div>

      {/* ================= VIEW 1: BILLINGS ACCEPTANCE REGISTER ================= */}
      {activeTab === 'billings' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ทั้งหมด ({billings.length})
              </button>
              <button
                onClick={() => setStatusFilter('received')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'received'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รับเอกสารแล้ว
              </button>
              <button
                onClick={() => setStatusFilter('verified')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'verified'
                    ? 'bg-white text-amber-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ตรวจเอกสารผ่าน
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'paid'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                จ่ายเงินแล้ว
              </button>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-2">
              <select
                value={selectedProjectFilter}
                onChange={e => setSelectedProjectFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">ทุกโครงการ</option>
                {uniqueProjects.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาใบวางบิล, ร้านค้า, PO..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-48 sm:w-64 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">เลขที่ใบวางบิล / วันที่รับ</th>
                    <th className="py-2.5 px-3">ร้านค้า & โครงการ</th>
                    <th className="py-2.5 px-3">รายการสินค้าที่ชนบิล (PO/DO)</th>
                    <th className="py-2.5 px-3 text-right">ยอดก่อน VAT</th>
                    <th className="py-2.5 px-3 text-right">VAT 7%</th>
                    <th className="py-2.5 px-3 text-right">หัก ณ ที่จ่าย</th>
                    <th className="py-2.5 px-3 text-right">ยอดสุทธิ (บาท)</th>
                    <th className="py-2.5 px-3">กำหนดจ่าย (Due Date)</th>
                    <th className="py-2.5 px-3 text-center">สถานะ / Express PV</th>
                    <th className="py-2.5 px-3 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBillings.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        ไม่พบข้อมูลการรับวางบิลร้านค้า
                      </td>
                    </tr>
                  ) : (
                    filteredBillings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-slate-900 block">{b.billingNo}</span>
                          <span className="text-[11px] text-slate-500 block">รับเมื่อ: {b.receivedDate}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">{b.vendorName}</span>
                          <span className="text-[11px] text-slate-500 block">{b.project}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            {b.hasOriginalTaxInvoice && (
                              <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 rounded text-[9px] font-semibold border border-emerald-200">
                                ใบกำกับฯ ตัวจริง
                              </span>
                            )}
                            {b.hasDeliverySlipWithSignature && (
                              <span className="px-1.5 py-0.2 bg-blue-50 text-blue-800 rounded text-[9px] font-semibold border border-blue-200">
                                ใบส่งของเซ็นครบ
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            {b.items.map((it, idx) => (
                              <div key={idx} className="text-[11px]">
                                <div className="font-mono">
                                  <span className="text-[#005aa9] font-bold">{it.expressPoNo}</span>
                                  <span className="text-slate-400 mx-1">&bull;</span>
                                  <span className="text-slate-700">{it.doNo}</span>
                                </div>
                                <div className="text-slate-500 truncate max-w-[200px]" title={it.description}>
                                  {it.description} {it.quantity ? `(${it.quantity} ${it.unit || ''})` : ''}
                                </div>
                              </div>
                            ))}
                            {b.matchedReceiptIds && b.matchedReceiptIds.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ชนบิลสินค้า {b.matchedReceiptIds.length} รายการ
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700">
                          {formatCurrency(b.subTotal)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          +{formatCurrency(b.vatAmount)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-red-600">
                          -{formatCurrency(b.whtAmount)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-slate-900 text-sm">
                          {formatCurrency(b.grandTotal)}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-slate-800 block">{b.dueDate}</span>
                          <span className="text-[11px] text-slate-500 block">เครดิต {b.creditDays} วัน</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {b.status === 'paid' ? (
                            <div>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                จ่ายเงินแล้ว
                              </span>
                              {b.expressPvNo && (
                                <span className="text-[10px] font-mono font-bold text-emerald-800 block mt-0.5">
                                  {b.expressPvNo}
                                </span>
                              )}
                            </div>
                          ) : b.status === 'verified' ? (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                              <FileCheck2 className="w-3 h-3" />
                              รอโอนเงิน
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              รับเอกสารแล้ว
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedBillingForPrint(b)}
                              title="พิมพ์ใบรับวางบิลและใบแนบรายการสินค้าที่ทำการชนบิล"
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#005aa9] rounded font-bold text-xs flex items-center gap-1 cursor-pointer border border-blue-200 transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>ใบรับวางบิล & รายการชนบิล</span>
                            </button>

                            {b.status !== 'paid' && (
                              <button
                                onClick={() => {
                                  const pv = prompt('กรุณาระบุเลขที่ PV ใน Express เมื่อจ่ายเงินแล้ว (เช่น PV68-0045):', b.expressPvNo || 'PV68-00');
                                  if (pv) {
                                    onUpdateBilling(b.id, {
                                      status: 'paid',
                                      expressPvNo: pv,
                                      paidDate: new Date().toISOString().split('T')[0]
                                    });
                                  }
                                }}
                                title="บันทึกจ่ายเงินแล้ว (ใส่เลข PV Express)"
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 rounded font-semibold text-xs flex items-center gap-1 cursor-pointer border border-emerald-200 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                ลงจ่าย
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: GOODS RECEIPTS & 3-WAY MATCHING ================= */}
      {activeTab === 'receipts' && (
        <div className="space-y-4">
          {/* Sub-filter Bar for Receipts */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setReceiptFilter('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  receiptFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ทั้งหมด ({goodsReceipts.length})
              </button>
              <button
                onClick={() => setReceiptFilter('pending_billing')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  receiptFilter === 'pending_billing'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รอร้านค้ามาวางบิล ({goodsReceipts.filter(g => g.billingStatus === 'pending_billing').length})
              </button>
              <button
                onClick={() => setReceiptFilter('billed')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  receiptFilter === 'billed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ชนบิลแล้ว ({goodsReceipts.filter(g => g.billingStatus === 'billed').length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedProjectFilter}
                onChange={e => setSelectedProjectFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">ทุกโครงการ</option>
                {uniqueProjects.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาเลข GR, PO, ใบส่งของ, พัสดุ..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-48 sm:w-64 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Receipts Table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">เลขที่ GR / วันที่รับ</th>
                    <th className="py-2.5 px-3">ร้านค้า & โครงการ</th>
                    <th className="py-2.5 px-3">PO Express & ใบส่งของ (DO)</th>
                    <th className="py-2.5 px-3">รายการพัสดุ / วัสดุ</th>
                    <th className="py-2.5 px-3 text-right">จำนวน</th>
                    <th className="py-2.5 px-3 text-right">ราคา/หน่วย</th>
                    <th className="py-2.5 px-3 text-right">มูลค่ารวม (บาท)</th>
                    <th className="py-2.5 px-3 text-center">ตรวจรับหน้างาน</th>
                    <th className="py-2.5 px-3 text-center">สถานะชนบิล</th>
                    <th className="py-2.5 px-3 text-center">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {goodsReceipts
                    .filter(g => {
                      const matchProj = selectedProjectFilter === 'all' || g.project === selectedProjectFilter;
                      const matchStatus = receiptFilter === 'all' || g.billingStatus === receiptFilter;
                      const q = searchQuery.toLowerCase();
                      const matchQ = !q ||
                        g.grNo.toLowerCase().includes(q) ||
                        g.vendorName.toLowerCase().includes(q) ||
                        g.expressPoNo.toLowerCase().includes(q) ||
                        g.deliveryOrderNo.toLowerCase().includes(q) ||
                        g.materialDescription.toLowerCase().includes(q);
                      return matchProj && matchStatus && matchQ;
                    })
                    .map(g => (
                      <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-[#005aa9] block">{g.grNo}</span>
                          <span className="text-[11px] text-slate-500 block">รับเมื่อ: {g.receivedDate}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">{g.vendorName}</span>
                          <span className="text-[11px] text-slate-500 block">{g.project}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono text-[11px]">
                            <span className="text-[#005aa9] font-bold">{g.expressPoNo}</span>
                            <span className="text-slate-400 mx-1">&bull;</span>
                            <span className="text-slate-700 font-semibold">{g.deliveryOrderNo}</span>
                          </div>
                          {g.invoiceNo && (
                            <span className="text-[10px] text-slate-500 font-mono block">Inv: {g.invoiceNo}</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-900 block">{g.materialDescription}</span>
                          <span className="text-[11px] text-slate-500">ผู้ตรวจรับ: {g.receiverName}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                          {g.receivedQty.toLocaleString()} {g.unit}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          {formatCurrency(g.unitPrice)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                          {formatCurrency(g.amount)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {g.hasReceiverSignature && (
                              <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 rounded text-[9px] font-semibold border border-emerald-200">
                                ✓ เซ็นรับครบ
                              </span>
                            )}
                            {g.hasWeightSlip && (
                              <span className="px-1.5 py-0.2 bg-purple-50 text-purple-800 rounded text-[9px] font-semibold border border-purple-200">
                                ⚖️ มีสลิปชั่ง
                              </span>
                            )}
                            {g.isBackcharge && (
                              <span className="px-1.5 py-0.2 bg-rose-50 text-rose-800 rounded text-[9px] font-bold border border-rose-200" title={`หักสัญญา: ${g.contractorName}`}>
                                ✂️ หักช่าง: {g.contractorName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {g.billingStatus === 'billed' ? (
                            <div>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                ชนบิลแล้ว
                              </span>
                              {g.matchedBillingNo && (
                                <span className="text-[10px] font-mono font-bold text-slate-600 block mt-0.5">
                                  {g.matchedBillingNo}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              รอร้านค้ามาวางบิล
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {g.billingStatus === 'pending_billing' ? (
                            <button
                              onClick={() => {
                                setPreselectedVendor(g.vendorName);
                                setPreselectedReceiptIds([g.id]);
                                setIsNewBillingOpen(true);
                              }}
                              className="px-2.5 py-1 bg-[#009540] hover:bg-emerald-800 text-white rounded font-bold text-xs flex items-center gap-1 cursor-pointer shadow-2xs mx-auto"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>⚡ ชนบิลนี้</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const matchedBill = billings.find(b => b.id === g.matchedBillingId || b.billingNo === g.matchedBillingNo);
                                if (matchedBill) {
                                  setSelectedBillingForPrint(matchedBill);
                                } else {
                                  alert(`ชนกับใบวางบิลเลขที่ ${g.matchedBillingNo || 'N/A'}`);
                                }
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs flex items-center gap-1 cursor-pointer border border-slate-200 mx-auto"
                            >
                              <FileText className="w-3 h-3" />
                              <span>ดูใบวางบิล</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRINT BILLING SLIP & RECONCILIATION STATEMENT MODAL ================= */}
      {selectedBillingForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col border border-slate-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-slate-700" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    ใบรับวางบิลและใบแนบรายการสินค้าที่ทำการชนบิล (Billing Acceptance Slip & Reconciliation Statement)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    เอกสารทางการสำหรับส่งมอบให้ร้านค้า และส่งฝ่ายบัญชีตั้งหนี้/เปิดใบสำคัญจ่าย (PV)
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedBillingForPrint(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-xs print:p-0 print:overflow-visible">
              <div className="border border-slate-300 p-6 rounded-lg space-y-5 bg-white shadow-xs">
                
                {/* Formal Corporate Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                  <div>
                    <h2 className="font-black text-slate-900 text-base">บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด</h2>
                    <p className="text-[11px] text-slate-500">BURIRAM THONGCHAI CONSTRUCTION CO., LTD.</p>
                    <p className="text-xs text-slate-700 font-semibold mt-1">
                      สำนักงานใหญ่: ถ.จิระ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000 | ฝ่ายจัดซื้อ & แผนกบัญชีเจ้าหนี้
                    </p>
                    <div className="mt-2 inline-block px-2.5 py-1 bg-slate-100 rounded text-slate-800 font-bold text-xs">
                      โครงการ: {selectedBillingForPrint.project}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="bg-[#009540] text-white px-3 py-1 rounded font-bold text-sm inline-block mb-1">
                      ใบรับวางบิล
                    </div>
                    <span className="font-black text-slate-900 text-base block">{selectedBillingForPrint.billingNo}</span>
                    <span className="text-xs text-slate-500 block">วันที่รับเอกสาร: {selectedBillingForPrint.receivedDate}</span>
                  </div>
                </div>

                {/* Vendor and Payment Due Meta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="space-y-1">
                    <span className="text-slate-500 text-[11px] block">ผู้จำหน่าย / ร้านค้า (Vendor Name):</span>
                    <span className="font-bold text-slate-900 text-sm block">{selectedBillingForPrint.vendorName}</span>
                    {selectedBillingForPrint.vendorTaxId && (
                      <span className="text-slate-600 font-mono text-xs block">
                        เลขประจำตัวผู้เสียภาษี: {selectedBillingForPrint.vendorTaxId}
                      </span>
                    )}
                  </div>
                  <div className="text-left md:text-right space-y-1 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-4">
                    <span className="text-slate-500 text-[11px] block">วันครบกำหนดนัดชำระเงิน (Payment Due Date):</span>
                    <span className="font-mono font-black text-[#005aa9] text-base block">
                      {selectedBillingForPrint.dueDate}
                    </span>
                    <span className="text-slate-600 text-xs block font-medium">
                      รอบเครดิตเทอม: <strong className="text-slate-900">{selectedBillingForPrint.creditDays}</strong> วัน (จ่ายเช็ค/โอนตามรอบการเงิน)
                    </span>
                  </div>
                </div>

                {/* 3-Way Match Verification Checklist Box */}
                <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                    <ShieldCheck className="w-4 h-4 text-[#009540]" />
                    <span>ผลการตรวจสอบชุดเอกสารชนบิล (3-Way Matching Verification):</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-800 font-semibold">
                      <span className="text-[#009540] font-black">✓</span> ใบกำกับภาษี/ใบเสร็จต้นฉบับ
                    </span>
                    <span className="flex items-center gap-1 text-slate-800 font-semibold">
                      <span className="text-[#009540] font-black">✓</span> ใบส่งของมีลายเซ็นผู้รับครบถ้วน
                    </span>
                    <span className="flex items-center gap-1 text-slate-800 font-semibold">
                      <span className="text-[#009540] font-black">✓</span> ชนกับใบสั่งซื้อ PO ใน Express
                    </span>
                  </div>
                </div>

                {/* Reconciled Line Items Detailed Table */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-[#005aa9]" />
                      ใบแนบรายการสินค้าและพัสดุที่ทำการชนบิล (Reconciled Material & Goods Statement)
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      จำนวน {selectedBillingForPrint.items.length} รายการ
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-2.5 text-center w-10">ลำดับ</th>
                          <th className="py-2 px-2.5">PO Express</th>
                          <th className="py-2 px-2.5">ใบส่งของ (DO)</th>
                          <th className="py-2 px-2.5">รายการพัสดุ / สินค้า</th>
                          <th className="py-2 px-2.5 text-right">จำนวน</th>
                          <th className="py-2 px-2.5 text-right">ราคา/หน่วย</th>
                          <th className="py-2 px-2.5 text-right">รวมเป็นเงิน (บาท)</th>
                          <th className="py-2 px-2.5 text-center">บันทึกตรวจรับ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {selectedBillingForPrint.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="py-2 px-2.5 text-center text-slate-500 font-sans">{idx + 1}</td>
                            <td className="py-2 px-2.5 text-[#005aa9] font-bold">{it.expressPoNo}</td>
                            <td className="py-2 px-2.5 text-slate-700 font-semibold">{it.doNo}</td>
                            <td className="py-2 px-2.5 font-sans font-medium text-slate-900">
                              {it.description}
                            </td>
                            <td className="py-2 px-2.5 text-right text-slate-800">
                              {it.quantity ? `${it.quantity.toLocaleString()} ${it.unit || ''}` : '-'}
                            </td>
                            <td className="py-2 px-2.5 text-right text-slate-600">
                              {it.unitPrice ? formatCurrency(it.unitPrice) : '-'}
                            </td>
                            <td className="py-2 px-2.5 text-right font-bold text-slate-900">
                              {formatCurrency(it.amount)}
                            </td>
                            <td className="py-2 px-2.5 text-center font-sans text-[11px]">
                              {it.isBackcharge ? (
                                <span className="text-rose-700 font-bold bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                                  หักช่าง: {it.contractorName}
                                </span>
                              ) : (
                                <span className="text-emerald-700 font-medium">
                                  {it.receiverName ? `เซ็นรับ (${it.receiverName})` : 'ตรวจรับสมบูรณ์'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial Totals Summary */}
                <div className="flex justify-end">
                  <div className="w-full sm:w-80 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span className="font-sans">รวมมูลค่าสินค้าก่อนภาษี:</span>
                      <span className="font-bold">{formatCurrency(selectedBillingForPrint.subTotal)} บาท</span>
                    </div>
                    <div className="flex justify-between text-blue-800">
                      <span className="font-sans">ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                      <span className="font-bold">+{formatCurrency(selectedBillingForPrint.vatAmount)} บาท</span>
                    </div>
                    <div className="flex justify-between text-red-700">
                      <span className="font-sans">หักภาษี ณ ที่จ่าย:</span>
                      <span className="font-bold">-{formatCurrency(selectedBillingForPrint.whtAmount)} บาท</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t-2 border-slate-300 font-black text-slate-900 text-sm">
                      <span className="font-sans">ยอดเงินสุทธิที่บริษัทนัดจ่าย:</span>
                      <span className="text-[#009540] text-base">{formatCurrency(selectedBillingForPrint.grandTotal)} บาท</span>
                    </div>
                  </div>
                </div>

                {/* Terms Note */}
                <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded border border-slate-200">
                  หมายเหตุ: บริษัทฯ ได้รับเอกสารวางบิลและตรวจสอบความถูกต้องของสินค้าและใบส่งของตามรายการข้างต้นครบถ้วนแล้ว การนัดจ่ายเงินจะดำเนินการผ่านการโอนบัญชีธนาคารหรือสั่งจ่ายเช็คตามกำหนดวันนัดชำระเงิน
                </div>

                {/* 3-Party Signatures */}
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
                  <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                    <p className="text-slate-600 text-[11px] font-bold">1. ผู้นำวางบิล (ตัวแทนร้านค้า/ผู้ขาย)</p>
                    <p className="text-[10px] text-slate-400 mb-6">ผู้ส่งมอบเอกสารและยืนยันยอดเรียกเก็บ</p>
                    <p className="font-semibold text-slate-800">(......................................................)</p>
                    <p className="text-[10px] text-slate-500 mt-1">วันที่ ......./......./............</p>
                  </div>

                  <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                    <p className="text-slate-600 text-[11px] font-bold">2. ผู้รับวางบิล & ตรวจรับสินค้า</p>
                    <p className="text-[10px] text-slate-400 mb-6">เจ้าหน้าที่จัดซื้อ / สโตร์โครงการ</p>
                    <p className="font-semibold text-slate-800">(......................................................)</p>
                    <p className="text-[10px] text-slate-500 mt-1">วันที่ ......./......./............</p>
                  </div>

                  <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                    <p className="text-slate-600 text-[11px] font-bold">3. ผู้ตรวจสอบบัญชีเจ้าหนี้</p>
                    <p className="text-[10px] text-slate-400 mb-6">แผนกบัญชีการเงิน (เตรียมเปิด PV ใน Express)</p>
                    <p className="font-semibold text-slate-800">(......................................................)</p>
                    <p className="text-[10px] text-slate-500 mt-1">วันที่ ......./......./............</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl print:hidden">
              <button
                onClick={() => setSelectedBillingForPrint(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#005aa9] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-blue-900"
              >
                <Printer className="w-4 h-4" />
                พิมพ์ใบรับวางบิลและใบแนบชนบิล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NEW BILLING MODAL (WITH 3-WAY MATCHING SELECTION) ================= */}
      {isNewBillingOpen && (
        <NewBillingModal
          isOpen={isNewBillingOpen}
          onClose={() => {
            setIsNewBillingOpen(false);
            setPreselectedVendor('');
            setPreselectedReceiptIds([]);
          }}
          projects={uniqueProjects}
          goodsReceipts={goodsReceipts}
          initialVendor={preselectedVendor}
          initialSelectedReceiptIds={preselectedReceiptIds}
          onSave={onAddBilling}
        />
      )}

      {/* ================= NEW GOODS RECEIPT MODAL ================= */}
      {isNewReceiptOpen && onAddGoodsReceipt && (
        <NewGoodsReceiptModal
          isOpen={isNewReceiptOpen}
          onClose={() => setIsNewReceiptOpen(false)}
          projects={uniqueProjects}
          onSave={onAddGoodsReceipt}
        />
      )}
    </div>
  );
}

// =========================================================================
// NEW BILLING MODAL WITH GOODS RECEIPT 3-WAY MATCH SELECTION
// =========================================================================
interface NewBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: string[];
  goodsReceipts: GoodsReceiptItem[];
  initialVendor?: string;
  initialSelectedReceiptIds?: string[];
  onSave: (billing: Omit<SupplierBilling, 'id' | 'createdAt'>) => void;
}

function NewBillingModal({
  isOpen,
  onClose,
  projects,
  goodsReceipts,
  initialVendor = '',
  initialSelectedReceiptIds = [],
  onSave
}: NewBillingModalProps) {
  const [vendorName, setVendorName] = useState(initialVendor);
  const [vendorTaxId, setVendorTaxId] = useState('');
  const [project, setProject] = useState(projects[0] || 'โครงการทางหลวงแผ่นดิน 226');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [creditDays, setCreditDays] = useState(30);

  // Selected Goods Receipts
  const [selectedReceiptIds, setSelectedReceiptIds] = useState<string[]>(initialSelectedReceiptIds);

  // Custom ad-hoc line items (e.g. freight, adjustments)
  const [customItems, setCustomItems] = useState<Array<{
    expressPoNo: string;
    doNo: string;
    description: string;
    amount: number;
  }>>([]);

  // Tax settings
  const [hasVat, setHasVat] = useState(true);
  const [whtRate, setWhtRate] = useState<number>(1); // 1% for construction materials, 3% for services/transport, 0% none
  const [hasOriginalTaxInvoice, setHasOriginalTaxInvoice] = useState(true);
  const [hasDeliverySlipWithSignature, setHasDeliverySlipWithSignature] = useState(true);

  // Auto calculate due date
  const dueDate = useMemo(() => {
    const d = new Date(receivedDate);
    d.setDate(d.getDate() + creditDays);
    return d.toISOString().split('T')[0];
  }, [receivedDate, creditDays]);

  // Find vendors with pending goods receipts for quick suggestions
  const vendorsWithPending = useMemo(() => {
    const map = new Map<string, number>();
    goodsReceipts.forEach(g => {
      if (g.billingStatus === 'pending_billing') {
        map.set(g.vendorName, (map.get(g.vendorName) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([vendor, count]) => ({ vendor, count }));
  }, [goodsReceipts]);

  // Master vendors list for combobox
  const allVendorsList = useMemo(() => {
    const list = new Set<string>();
    goodsReceipts.forEach(g => { if (g.vendorName) list.add(g.vendorName); });
    [
      'บจก. สุรินทร์คอนกรีตโปรดักส์',
      'หจก. ปิยะวิลล์คอนสตรัคชั่น',
      'โรงงาน ป.ศิลาชัย คอนกรีต',
      'บจก. ชลประทานซีเมนต์',
      'หจก. บุรีรัมย์ศิลาชัย',
      'บจก. บุรีรัมย์วัสดุภัณฑ์',
      'หจก. รวมสินคอนสตรัคชั่น'
    ].forEach(v => list.add(v));
    return Array.from(list);
  }, [goodsReceipts]);

  // Filter goods receipts available for matching for the chosen vendor
  const availableReceiptsForVendor = useMemo(() => {
    if (!vendorName) return [];
    return goodsReceipts.filter(g => 
      g.vendorName.toLowerCase().includes(vendorName.toLowerCase()) &&
      (g.billingStatus === 'pending_billing' || selectedReceiptIds.includes(g.id))
    );
  }, [goodsReceipts, vendorName, selectedReceiptIds]);

  // Selected Receipts objects
  const selectedReceiptsList = useMemo(() => {
    return goodsReceipts.filter(g => selectedReceiptIds.includes(g.id));
  }, [goodsReceipts, selectedReceiptIds]);

  // Financial Calculations
  const subTotalFromReceipts = useMemo(() => {
    return selectedReceiptsList.reduce((sum, g) => sum + g.amount, 0);
  }, [selectedReceiptsList]);

  const subTotalFromCustom = useMemo(() => {
    return customItems.reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [customItems]);

  const subTotal = subTotalFromReceipts + subTotalFromCustom;
  const vatAmount = hasVat ? subTotal * 0.07 : 0;
  const whtAmount = subTotal * (whtRate / 100);
  const grandTotal = subTotal + vatAmount - whtAmount;

  // Toggle selection
  const handleToggleReceipt = (id: string) => {
    setSelectedReceiptIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllAvailable = () => {
    const ids = availableReceiptsForVendor.map(g => g.id);
    setSelectedReceiptIds(ids);
  };

  const handleClearAll = () => {
    setSelectedReceiptIds([]);
  };

  // Add custom line item
  const handleAddCustomItem = () => {
    setCustomItems(prev => [
      ...prev,
      {
        expressPoNo: 'PO68-',
        doNo: 'DO-',
        description: 'ค่าขนส่ง / ปรับปรุงยอด',
        amount: 0
      }
    ]);
  };

  const handleRemoveCustomItem = (index: number) => {
    setCustomItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCustomItemChange = (index: number, field: string, value: any) => {
    setCustomItems(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!vendorName.trim()) {
      alert('กรุณาระบุชื่อร้านค้า / ผู้จำหน่าย');
      return;
    }

    if (selectedReceiptIds.length === 0 && customItems.length === 0) {
      alert('กรุณาเลือกรายการสินค้าที่ลงรับไว้เพื่อชนบิล อย่างน้อย 1 รายการ หรือเพิ่มรายการระบุเอง');
      return;
    }

    if (subTotal <= 0) {
      alert('มูลค่ารวมของเอกสารต้องมากกว่า 0 บาท');
      return;
    }

    const billingNo = `BILL-68-${String(Math.floor(100 + Math.random() * 900))}`;

    // Map selected receipts to Bill items
    const itemsFromReceipts: SupplierBillItem[] = selectedReceiptsList.map(r => ({
      id: `bi-${r.id}-${Date.now()}`,
      goodsReceiptId: r.id,
      grNo: r.grNo,
      expressPoNo: r.expressPoNo,
      doNo: r.deliveryOrderNo,
      invoiceNo: r.invoiceNo,
      description: r.materialDescription,
      quantity: r.receivedQty,
      unit: r.unit,
      unitPrice: r.unitPrice,
      amount: r.amount,
      receivedDate: r.receivedDate,
      receiverName: r.receiverName,
      isBackcharge: r.isBackcharge,
      contractorName: r.contractorName
    }));

    // Map custom items
    const itemsFromCustom: SupplierBillItem[] = customItems.map((c, i) => ({
      id: `bi-custom-${Date.now()}-${i}`,
      expressPoNo: c.expressPoNo,
      doNo: c.doNo,
      description: c.description,
      amount: c.amount
    }));

    const allItems = [...itemsFromReceipts, ...itemsFromCustom];

    onSave({
      billingNo,
      vendorName,
      vendorTaxId: vendorTaxId || undefined,
      project,
      receivedDate,
      creditDays,
      dueDate,
      items: allItems,
      matchedReceiptIds: selectedReceiptIds,
      subTotal,
      vatAmount,
      whtAmount,
      grandTotal,
      hasOriginalTaxInvoice,
      hasDeliverySlipWithSignature,
      status: 'received'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[94vh] flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-emerald-50/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-[#009540]" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                บันทึกรับวางบิลร้านค้า & ชนบิลสินค้าที่ลงรับไว้ (Supplier Billing & 3-Way Match)
              </h3>
              <p className="text-[11px] text-emerald-800">
                เลือกสินค้าที่ตรวจรับหน้างานไว้ เพื่อชนกับใบกำกับภาษี/ใบส่งของของร้านค้า ออกใบรับวางบิลได้ทันที
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Vendor Quick Suggestion Chips */}
          {vendorsWithPending.length > 0 && (
            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
              <span className="text-[11px] font-bold text-blue-900 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#005aa9]" />
                เลือกร้านค้าที่มีสินค้าตรวจรับหน้างานรอชนบิลอยู่ ({vendorsWithPending.length} ร้านค้า):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {vendorsWithPending.map(({ vendor, count }) => (
                  <button
                    key={vendor}
                    type="button"
                    onClick={() => {
                      setVendorName(vendor);
                      // Preselect project if available from receipt
                      const match = goodsReceipts.find(g => g.vendorName === vendor);
                      if (match) setProject(match.project);
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      vendorName === vendor
                        ? 'bg-[#005aa9] text-white border-blue-700 shadow-xs'
                        : 'bg-white text-blue-900 hover:bg-blue-100 border-blue-300'
                    }`}
                  >
                    <span>{vendor}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      vendorName === vendor ? 'bg-white/20 text-white' : 'bg-blue-200 text-blue-900'
                    }`}>
                      รอชน {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vendor and Project Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <SearchableCombobox
                label="ชื่อร้านค้า / ผู้จำหน่ายตามใบวางบิล"
                required
                value={vendorName}
                onChange={(val) => {
                  setVendorName(val);
                  const match = goodsReceipts.find(g => g.vendorName === val);
                  if (match) setProject(match.project);
                }}
                options={allVendorsList}
                datalistId="dl-payees"
                placeholder="เลือกหรือพิมพ์ค้นหาร้านค้า"
                searchPlaceholder="พิมพ์ชื่อร้านค้าเพื่อกรองหรือเพิ่ม..."
                allowCustom={true}
                accentColor="emerald"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">เลขประจำตัวผู้เสียภาษี 13 หลัก</label>
              <input
                type="text"
                list="dl-tax-ids"
                placeholder="03155xxxxxxxx"
                value={vendorTaxId}
                onChange={e => setVendorTaxId(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <SearchableCombobox
                label="โครงการ"
                required
                value={project}
                onChange={(val) => setProject(val)}
                options={projects}
                datalistId="dl-projects"
                placeholder="เลือกหรือพิมพ์โครงการ"
                allowCustom={true}
                accentColor="emerald"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">วันที่รับวางบิล *</label>
              <input
                type="date"
                required
                value={receivedDate}
                onChange={e => setReceivedDate(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">เครดิตเทอม (วัน) *</label>
              <input
                type="number"
                required
                value={creditDays}
                onChange={e => setCreditDays(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs font-bold"
              />
            </div>
          </div>

          {/* ================= RECONCILIATION: GOODS RECEIPTS SELECTION TABLE ================= */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div>
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-[#005aa9]" />
                  รายการสินค้าที่ลงรับไว้เพื่อชนบิล (Goods Receipts for 3-Way Matching)
                </span>
                <p className="text-[11px] text-slate-500">
                  {vendorName 
                    ? `พบรายการตรวจรับของ "${vendorName}" ทั้งหมด ${availableReceiptsForVendor.length} รายการ (เลือกแล้ว ${selectedReceiptIds.length} รายการ)`
                    : 'กรุณาระบุชื่อร้านค้าเพื่อแสดงรายการสินค้าที่ลงรับไว้'}
                </p>
              </div>

              {availableReceiptsForVendor.length > 0 && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleSelectAllAvailable}
                    className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded text-[11px] font-semibold cursor-pointer"
                  >
                    เลือกทั้งหมด ({availableReceiptsForVendor.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-semibold cursor-pointer"
                  >
                    ล้างการเลือก
                  </button>
                </div>
              )}
            </div>

            {availableReceiptsForVendor.length === 0 ? (
              <div className="p-4 text-center bg-white rounded-lg border border-dashed border-slate-300 text-slate-500">
                {vendorName ? (
                  <div>
                    <p className="font-semibold text-slate-700">ไม่พบรายการพัสดุตรวจรับที่ค้างวางบิลของร้านค้านี้</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ท่านสามารถใช้ปุ่มด้านล่างเพื่อเพิ่มรายการระบุเอง (เช่น ค่าขนส่ง หรือบิลที่ยังไม่ได้ลง GR)
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-400">กรุณาพิมพ์หรือคลิกเลือกร้านค้าด้านบนก่อน เพื่อดึงข้อมูลสินค้าที่ลงรับไว้</p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-2.5 text-center w-8">เลือก</th>
                      <th className="py-2 px-2">เลขที่ GR / วันที่</th>
                      <th className="py-2 px-2">PO Express & ใบส่งของ (DO)</th>
                      <th className="py-2 px-2">รายการพัสดุ</th>
                      <th className="py-2 px-2 text-right">จำนวน</th>
                      <th className="py-2 px-2 text-right">ราคา/หน่วย</th>
                      <th className="py-2 px-2.5 text-right">รวมเป็นเงิน</th>
                      <th className="py-2 px-2 text-center">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {availableReceiptsForVendor.map(g => {
                      const isSelected = selectedReceiptIds.includes(g.id);
                      return (
                        <tr 
                          key={g.id} 
                          onClick={() => handleToggleReceipt(g.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2 px-2.5 text-center" onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleReceipt(g.id)}
                              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <span className="font-mono text-[#005aa9] font-bold block">{g.grNo}</span>
                            <span className="text-[10px] text-slate-500 block">{g.receivedDate}</span>
                          </td>
                          <td className="py-2 px-2">
                            <div className="font-mono text-[11px]">
                              <span className="text-slate-900 font-bold">{g.expressPoNo}</span>
                              <span className="text-slate-400 mx-1">&bull;</span>
                              <span className="text-slate-600">{g.deliveryOrderNo}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <span className="font-medium text-slate-800 block">{g.materialDescription}</span>
                            <span className="text-[10px] text-slate-400">ผู้รับ: {g.receiverName}</span>
                          </td>
                          <td className="py-2 px-2 text-right font-mono">
                            {g.receivedQty.toLocaleString()} {g.unit}
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-slate-600">
                            {formatCurrency(g.unitPrice)}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(g.amount)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              {g.hasReceiverSignature && (
                                <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                                  ✓ เซ็นแล้ว
                                </span>
                              )}
                              {g.isBackcharge && (
                                <span className="text-[9px] text-rose-700 font-bold bg-rose-50 px-1 rounded">
                                  หัก: {g.contractorName}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Custom Manual Items (Optional for freight, charges) */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-bold text-slate-700">
                  รายการเพิ่มเติมที่ไม่มีในระบบตรวจรับพัสดุ (เช่น ค่าขนส่ง / ค่าปรับ):
                </span>
                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  เพิ่มรายการระบุเอง
                </button>
              </div>

              {customItems.length > 0 && (
                <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200">
                  {customItems.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        list="dl-express-po"
                        placeholder="PO Express"
                        value={c.expressPoNo}
                        onChange={e => handleCustomItemChange(i, 'expressPoNo', e.target.value)}
                        className="w-24 border border-slate-300 rounded px-2 py-1 font-mono text-[11px]"
                      />
                      <input
                        type="text"
                        list="dl-delivery-orders"
                        placeholder="เลขที่ DO"
                        value={c.doNo}
                        onChange={e => handleCustomItemChange(i, 'doNo', e.target.value)}
                        className="w-24 border border-slate-300 rounded px-2 py-1 font-mono text-[11px]"
                      />
                      <input
                        type="text"
                        list="dl-item-descriptions"
                        placeholder="คำอธิบายรายการ"
                        value={c.description}
                        onChange={e => handleCustomItemChange(i, 'description', e.target.value)}
                        className="flex-1 border border-slate-300 rounded px-2 py-1 text-[11px]"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="จำนวนเงิน"
                        value={c.amount || ''}
                        onChange={e => handleCustomItemChange(i, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-28 border border-slate-300 rounded px-2 py-1 font-mono text-[11px] text-right font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomItem(i)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Financial Totals & Tax Calculation Breakdown */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-sans font-semibold">มูลค่ารวมก่อนภาษี (Subtotal):</span>
              <span className="font-bold text-sm">{formatCurrency(subTotal)} บาท</span>
            </div>

            <div className="flex justify-between items-center text-blue-800">
              <label className="flex items-center gap-1.5 font-sans cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasVat}
                  onChange={e => setHasVat(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
              </label>
              <span className="font-bold">+{formatCurrency(vatAmount)} บาท</span>
            </div>

            <div className="flex justify-between items-center text-red-700">
              <div className="flex items-center gap-2 font-sans">
                <span>ภาษีหัก ณ ที่จ่าย (WHT):</span>
                <select
                  value={whtRate}
                  onChange={e => setWhtRate(parseFloat(e.target.value))}
                  className="border border-slate-300 bg-white rounded px-1.5 py-0.5 text-[11px] font-sans"
                >
                  <option value={1}>1% (ค่าวัสดุก่อสร้าง)</option>
                  <option value={3}>3% (ค่าบริการ / ขนส่ง)</option>
                  <option value={0}>0% (ไม่มีหัก)</option>
                </select>
              </div>
              <span className="font-bold">-{formatCurrency(whtAmount)} บาท</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t-2 border-slate-300 font-bold text-slate-900">
              <div>
                <span className="font-sans text-sm block">ยอดเงินสุทธิที่รับวางบิล (Grand Total):</span>
                <span className="text-[10px] text-slate-500 font-sans font-normal">
                  วันนัดชำระเงิน: <strong className="font-mono text-blue-900">{dueDate}</strong>
                </span>
              </div>
              <span className="text-emerald-800 text-lg font-black">{formatCurrency(grandTotal)} บาท</span>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="space-y-2 pt-1 border-t border-slate-200">
            <span className="font-bold text-slate-800 block text-xs">
              การตรวจสอบความครบถ้วนของเอกสาร (3-Way Matching Checklist):
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasOriginalTaxInvoice}
                onChange={e => setHasOriginalTaxInvoice(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 font-medium">
                มีใบกำกับภาษี / ใบเสร็จรับเงินต้นฉบับแนบมาถูกต้องครบถ้วน
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasDeliverySlipWithSignature}
                onChange={e => setHasDeliverySlipWithSignature(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 font-medium">
                มีใบส่งของหน้างานตัวจริงที่มีลายเซ็นผู้รับของครบถ้วน
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#009540] hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>บันทึกรับวางบิล & ชนบิลสินค้า ({selectedReceiptIds.length} รายการ)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// NEW GOODS RECEIPT MODAL (FOR QUICK SITE DELIVERY ENTRY)
// =========================================================================
interface NewGoodsReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: string[];
  onSave: (receipt: Omit<GoodsReceiptItem, 'id' | 'createdAt'>) => void;
}

function NewGoodsReceiptModal({ isOpen, onClose, projects, onSave }: NewGoodsReceiptModalProps) {
  const [vendorName, setVendorName] = useState('');
  const [project, setProject] = useState(projects[0] || 'โครงการทางหลวงแผ่นดิน 226');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expressPoNo, setExpressPoNo] = useState('PO68-');
  const [deliveryOrderNo, setDeliveryOrderNo] = useState('DO-');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [receivedQty, setReceivedQty] = useState<number>(0);
  const [unit, setUnit] = useState('ตัน');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [receiverName, setReceiverName] = useState(() => getActiveUserName());
  const [hasReceiverSignature, setHasReceiverSignature] = useState(true);
  const [hasWeightSlip, setHasWeightSlip] = useState(false);
  const [isBackcharge, setIsBackcharge] = useState(false);
  const [contractorName, setContractorName] = useState('');

  const commonVendors = [
    'บจก. สุรินทร์คอนกรีตโปรดักส์',
    'หจก. ปิยะวิลล์คอนสตรัคชั่น',
    'โรงงาน ป.ศิลาชัย คอนกรีต',
    'บจก. ชลประทานซีเมนต์',
    'หจก. บุรีรัมย์ศิลาชัย',
    'บจก. บุรีรัมย์วัสดุภัณฑ์',
    'หจก. รวมสินคอนสตรัคชั่น'
  ];

  const commonMaterials = [
    'ยางแอสฟัลต์คอนกรีต AC 60/70',
    'หินคลุก (Crushed Rock Base)',
    'ทรายหยาบถมคันทาง',
    'คอนกรีตผสมเสร็จ 240 ksc (Cylinder)',
    'คอนกรีตผสมเสร็จ 280 ksc (Cylinder)',
    'เหล็กเส้นกลม RB9 มอก.',
    'เหล็กข้ออ้อย DB12 มอก.',
    'เหล็กข้ออ้อย DB16 มอก.',
    'ท่อคอนกรีตเสริมเหล็ก คสล. คมล. มอก. ชั้น 3'
  ];

  const commonReceivers = [
    'สมพร สโตร์',
    'นายอานนท์ รุ่งเรือง (วิศวกรสนาม)',
    'นายสมชาย คำมี (โฟร์แมน)',
    'น.ส.ปวีณา ใยอุ่น'
  ];

  const amount = receivedQty * unitPrice;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!vendorName || !materialDescription || receivedQty <= 0 || unitPrice <= 0) {
      alert('กรุณากรอกข้อมูลร้านค้า รายการพัสดุ จำนวน และราคาต่อหน่วย');
      return;
    }

    const grNo = `GR-68-${String(Math.floor(100 + Math.random() * 900))}`;

    onSave({
      grNo,
      project,
      vendorName,
      expressPoNo,
      deliveryOrderNo,
      invoiceNo: invoiceNo || undefined,
      receivedDate,
      materialDescription,
      receivedQty,
      unit,
      unitPrice,
      amount,
      receiverName,
      hasSignature: hasReceiverSignature,
      hasReceiverSignature,
      hasWeightSlip,
      isBackcharge,
      contractorName: isBackcharge ? contractorName : undefined,
      billingStatus: 'pending_billing'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col border border-slate-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-blue-50/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-[#005aa9]" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                บันทึกตรวจรับพัสดุ / สินค้าหน้างาน (Goods Receipt - GR)
              </h3>
              <p className="text-[11px] text-blue-800">
                บันทึกตามใบส่งของจริง เพื่อนำไปชนบิลเมื่อร้านค้ามาวางบิล
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <SearchableCombobox
              label="ร้านค้า / ผู้จำหน่าย"
              required
              value={vendorName}
              onChange={(val) => setVendorName(val)}
              options={commonVendors}
              datalistId="dl-payees"
              placeholder="เลือกหรือพิมพ์ค้นหาร้านค้า"
              allowCustom={true}
              accentColor="blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <SearchableCombobox
                label="โครงการ"
                required
                value={project}
                onChange={(val) => setProject(val)}
                options={projects}
                datalistId="dl-projects"
                placeholder="เลือกหรือพิมพ์โครงการ"
                allowCustom={true}
                accentColor="blue"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">วันที่ตรวจรับ *</label>
              <input
                type="date"
                required
                value={receivedDate}
                onChange={e => setReceivedDate(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">เลขที่ PO ใน Express *</label>
              <input
                type="text"
                required
                list="dl-express-po"
                placeholder="PO68-0112"
                value={expressPoNo}
                onChange={e => setExpressPoNo(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs font-bold text-[#005aa9]"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">เลขที่ใบส่งของ (DO) *</label>
              <input
                type="text"
                required
                list="dl-delivery-orders"
                placeholder="DO-1205"
                value={deliveryOrderNo}
                onChange={e => setDeliveryOrderNo(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <SearchableCombobox
                label="รายการพัสดุ / สเปกวัสดุ"
                required
                value={materialDescription}
                onChange={(val) => setMaterialDescription(val)}
                options={commonMaterials}
                datalistId="dl-item-descriptions"
                placeholder="เลือกหรือพิมพ์วัสดุ"
                allowCustom={true}
                accentColor="blue"
              />
            </div>
            <div>
              <SearchableCombobox
                label="เจ้าหน้าที่ผู้ตรวจรับ (Receiver)"
                required
                value={receiverName}
                onChange={(val) => setReceiverName(val)}
                options={commonReceivers}
                datalistId="dl-receivers"
                placeholder="เลือกหรือพิมพ์ชื่อผู้รับ"
                allowCustom={true}
                accentColor="blue"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 px-1">
                <span>* ค่าเริ่มต้นดึงจากผู้ใช้งานระบบ</span>
                {receiverName !== getActiveUserName() && (
                  <button
                    type="button"
                    onClick={() => setReceiverName(getActiveUserName())}
                    className="text-[#005aa9] hover:underline font-semibold cursor-pointer"
                  >
                    ใช้ชื่อฉัน ({getActiveUserName()})
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">จำนวนตรวจรับ *</label>
              <input
                type="number"
                step="0.01"
                required
                value={receivedQty || ''}
                onChange={e => setReceivedQty(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">หน่วย *</label>
              <input
                type="text"
                required
                list="dl-units"
                placeholder="ตัน, ลบ.ม., เส้น"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ราคา/หน่วย (บาท) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={unitPrice || ''}
                onChange={e => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs font-bold"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center font-mono">
            <span className="font-sans font-semibold text-slate-700">มูลค่ารวมก่อน VAT:</span>
            <span className="text-[#005aa9] font-black text-sm">{formatCurrency(amount)} บาท</span>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasReceiverSignature}
                onChange={e => setHasReceiverSignature(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 font-medium">ใบส่งของมีลายเซ็นผู้รับหน้างานครบถ้วน</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasWeightSlip}
                onChange={e => setHasWeightSlip(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-slate-700 font-medium">มีสลิปชั่งน้ำหนักตาชั่งแนบมา (เช่น หิน ทราย ยาง เหล็ก)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBackcharge}
                onChange={e => setIsBackcharge(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="text-rose-700 font-semibold">รายการนี้สั่งซื้อเพื่อหักเงินช่างเหมาช่วง (Backcharge)</span>
            </label>

            {isBackcharge && (
              <div className="pl-6 pt-1">
                <input
                  type="text"
                  placeholder="ระบุชื่อผู้รับเหมาช่วง เช่น ช่างสมานงานผิวทาง"
                  value={contractorName}
                  onChange={e => setContractorName(e.target.value)}
                  className="w-full border border-rose-300 rounded px-2.5 py-1 text-xs"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#005aa9] hover:bg-blue-900 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              บันทึกตรวจรับพัสดุ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
