import { useState, useEffect, FormEvent } from 'react';
import { Transaction, Disbursement } from '../types';
import { 
  X, 
  Save, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  FileText,
  Send,
  PenTool
} from 'lucide-react';
import { SearchableCombobox } from './SearchableCombobox';
import { BTCLogo } from './BTCLogo';
import { numberToThaiBaht } from '../utils/thaiBahtText';
import { getActiveUserName } from '../services/userService';
import { useDatabaseSuggestions } from '../context/DatabaseSuggestionsContext';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  editingTransaction?: Transaction | null;
  disbursements?: Disbursement[];
  projectsList: string[];
  accountsList: string[];
  companiesList: string[];
  initialType?: 'expense' | 'income';
}

export function NewTransactionModal({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  disbursements = [],
  projectsList,
  accountsList,
  companiesList,
  initialType = 'expense'
}: NewTransactionModalProps) {
  const [date, setDate] = useState('2026-08-29');
  const [docNo, setDocNo] = useState('');
  const [company, setCompany] = useState(companiesList[0] || 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด');
  const [account, setAccount] = useState(accountsList[0] || 'KTB BTC SA');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState(projectsList[0] || '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)');
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [category, setCategory] = useState('ค่าวัสดุก่อสร้าง');
  const [amount, setAmount] = useState<string>('');
  const [remarks, setRemarks] = useState('');
  const [recordedBy, setRecordedBy] = useState(getActiveUserName() || 'เจ้าหน้าที่การเงินและบัญชี');

  // Separated categories for Expense vs Income to prevent confusion
  const expenseCategories = [
    'ค่าวัสดุก่อสร้าง',
    'ค่าคอนกรีตผสมเสร็จ & ท่อระบายน้ำ',
    'ค่าเหล็กเส้น & ไวร์เมช',
    'ค่าหินคลุก & ทรายถม',
    'ค่าผลงานผู้รับเหมาช่วง',
    'งานสะพาน & โครงสร้าง',
    'งานกำแพงกันดิน MSE Wall',
    'ค่าน้ำมันเชื้อเพลิงดีเซล & หล่อลื่น',
    'ค่าอะไหล่ & ซ่อมบำรุงเครื่องจักร',
    'เงินเดือน & สำรองค่าแรง',
    'ภาษีหัก ณ ที่จ่าย ภ.ง.ด. 1, 3, 53',
    'ภาษีมูลค่าเพิ่ม ภ.พ.30',
    'เงินสมทบประกันสังคม (สปส.)',
    'กองทุน กยศ.',
    'ค่าสาธารณูปโภค (ไฟฟ้า, ประปา, สื่อสาร)',
    'ค่าธรรมเนียมธนาคาร, L/G, ดอกเบี้ยจ่าย',
    'โอนระหว่างบัญชีธนาคาร (ย้ายเงินสด)',
    'ค่าใช้จ่ายทั่วไป / เงินสดย่อย'
  ];

  const incomeCategories = [
    'รับค่างวดงานก่อสร้างทางหลวง',
    'รับค่างวดงานตามสัญญา',
    'รับเงินวางตั๋วสัญญาใช้เงิน (P/N)',
    'เงินให้กู้ยืม / คืนเงินยืมระหว่างกิจการ',
    'ดอกเบี้ยรับ & ผลตอบแทนเงินฝาก',
    'รายได้จากการขายเศษวัสดุ / เครื่องจักรเก่า',
    'โอนระหว่างบัญชีธนาคาร (ย้ายเงินสด)',
    'รายได้เบ็ดเตล็ดอื่น'
  ];

  // Helper date parser
  const parseToIsoDate = (dateStr?: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        let y = parseInt(parts[2], 10);
        if (y > 2500) y -= 543;
        return `${y}-${m}-${d}`;
      }
    }
    return new Date().toISOString().split('T')[0];
  };

  // Helper matching company
  const matchCompany = (compStr: string, list: string[]): string => {
    if (!compStr) return list[0] || '';
    const match = list.find(c => c.toLowerCase().includes(compStr.toLowerCase()) || compStr.toLowerCase().includes(c.toLowerCase()));
    if (match) return match;
    if (compStr.includes('BTC') || compStr.includes('บุรีรัมย์ธงชัย')) {
      return list.find(c => c.includes('บุรีรัมย์ธงชัย')) || list[0] || '';
    }
    if (compStr.includes('BTCP') || compStr.includes('บีทีซีพี')) {
      return list.find(c => c.includes('BTCP') || c.includes('บีทีซีพี')) || list[0] || '';
    }
    if (compStr.includes('BTC-PC') || compStr.includes('พีซี')) {
      return list.find(c => c.includes('BTC-PC') || c.includes('พีซี')) || list[0] || '';
    }
    if (compStr.includes('ไทย บุรีรัมย์') || compStr.includes('TBTC')) {
      return list.find(c => c.includes('ไทย บุรีรัมย์') || c.includes('TBTC')) || list[0] || '';
    }
    return list[0] || compStr;
  };

  // Helper matching project
  const matchProject = (projStr: string, list: string[]): string => {
    if (!projStr) return list[0] || '';
    if (list.includes(projStr)) return projStr;
    const match = list.find(p => {
      const pCode = p.match(/\((\d+)\)/)?.[1];
      const targetCode = projStr.match(/\((\d+)\)/)?.[1];
      if (pCode && targetCode && pCode === targetCode) return true;
      return p.toLowerCase().includes(projStr.toLowerCase()) || projStr.toLowerCase().includes(p.toLowerCase());
    });
    return match || list[0] || projStr;
  };

  // Helper matching category
  const matchCategory = (expenseType: string, boqType?: string): string => {
    const combined = `${expenseType} ${boqType || ''}`.toLowerCase();
    if (combined.includes('น้ำมัน') || combined.includes('ดีเซล') || combined.includes('เชื้อเพลิง')) {
      return 'ค่าน้ำมันเชื้อเพลิงดีเซล & หล่อลื่น';
    }
    if (combined.includes('คอนกรีต') || combined.includes('ท่อ') || combined.includes('ปูน')) {
      return 'ค่าคอนกรีตผสมเสร็จ & ท่อระบายน้ำ';
    }
    if (combined.includes('เหล็ก') || combined.includes('ไวร์เมช')) {
      return 'ค่าเหล็กเส้น & ไวร์เมช';
    }
    if (combined.includes('หิน') || combined.includes('ทราย') || combined.includes('ดิน')) {
      return 'ค่าหินคลุก & ทรายถม';
    }
    if (combined.includes('สะพาน') || combined.includes('โครงสร้าง')) {
      return 'งานสะพาน & โครงสร้าง';
    }
    if (combined.includes('กำแพง') || combined.includes('mse')) {
      return 'งานกำแพงกันดิน MSE Wall';
    }
    if (combined.includes('ซ่อม') || combined.includes('อะไหล่') || combined.includes('เครื่องจักร')) {
      return 'ค่าอะไหล่ & ซ่อมบำรุงเครื่องจักร';
    }
    if (combined.includes('เหมา') || combined.includes('ผู้รับเหมา')) {
      return 'ค่าผลงานผู้รับเหมาช่วง';
    }
    if (combined.includes('เงินเดือน') || combined.includes('แรง') || combined.includes('ค่าจ้าง')) {
      return 'เงินเดือน & สำรองค่าแรง';
    }
    if (combined.includes('ภาษี') || combined.includes('ภ.ง.ด') || combined.includes('ภงด')) {
      return 'ภาษีหัก ณ ที่จ่าย ภ.ง.ด. 1, 3, 53';
    }
    if (combined.includes('ประกันสังคม') || combined.includes('สปส')) {
      return 'เงินสมทบประกันสังคม (สปส.)';
    }
    return 'ค่าวัสดุก่อสร้าง';
  };

  // Handle DocNo change with seamless automatic data lookup
  const handleDocNoChange = (newDocNo: string) => {
    setDocNo(newDocNo);

    // Only auto-lookup if user entered at least 3 characters and is expense type
    if (type === 'expense' && newDocNo.trim().length >= 3 && disbursements.length > 0) {
      const clean = newDocNo.trim().toLowerCase();
      const matched = disbursements.find(d => 
        d.dbmNo.toLowerCase() === clean ||
        (d.pvNo && d.pvNo.toLowerCase() === clean) ||
        (d.refDocNo && d.refDocNo.toLowerCase() === clean) ||
        (d.chequeNo && d.chequeNo.toLowerCase() === clean)
      );

      if (matched) {
        // Auto fill fields
        const rawDate = matched.paymentDate || matched.entryDate;
        if (rawDate) setDate(parseToIsoDate(rawDate));
        
        if (matched.company) setCompany(matchCompany(matched.company, companiesList));

        if (matched.payerAccount) {
          const matchAcc = accountsList.find(a => 
            a.toLowerCase().includes(matched.payerAccount.toLowerCase()) || 
            matched.payerAccount.toLowerCase().includes(a.toLowerCase())
          );
          if (matchAcc) setAccount(matchAcc);
        }

        const pvText = matched.pvNo ? ` / PV: ${matched.pvNo}` : '';
        const itemDesc = matched.items && matched.items.length > 0 
          ? matched.items.map(i => i.description).filter(Boolean).join(', ') 
          : '';
        const detailPart = itemDesc || matched.expenseType || 'ค่าใช้จ่ายตามใบตั้งเบิก';
        setDescription(`[ใบตั้งเบิก ${matched.dbmNo}${pvText}] ${matched.payeeName} - ${detailPart}`);

        if (matched.project) setProject(matchProject(matched.project, projectsList));

        setCategory(matchCategory(matched.expenseType, matched.boqType));

        const netAmount = (matched.transferAmount && matched.transferAmount > 0) 
          ? matched.transferAmount 
          : (matched.totalAmount - (matched.taxDeductionTotalAmount || 0) - (matched.retentionTotalAmount || 0));
        setAmount(netAmount > 0 ? netAmount.toString() : (matched.totalAmount || 0).toString());

        const whtText = matched.taxDeductionTotalAmount && matched.taxDeductionTotalAmount > 0 
          ? `หัก ณ ที่จ่าย: ${matched.taxDeductionTotalAmount.toLocaleString()}` 
          : '';
        const bankText = matched.payeeBankAccount ? `บช.ผู้รับ: ${matched.payeeBankName || ''} ${matched.payeeBankAccount}` : '';
        const chqText = matched.chequeNo ? `เช็ค/Ref: ${matched.chequeNo}` : '';
        const remarksCombined = [matched.remarks, bankText, whtText, chqText].filter(Boolean).join(' | ');
        setRemarks(remarksCombined);
      }
    }
  };

  // Reset form when modal opens or editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      setDate(editingTransaction.isoDate || '2026-08-29');
      setDocNo(editingTransaction.docNo || '');
      setCompany(editingTransaction.company || companiesList[0]);
      setAccount(editingTransaction.account || accountsList[0]);
      setDescription(editingTransaction.description || '');
      setProject(editingTransaction.project || projectsList[0]);
      setCategory(editingTransaction.category || 'ค่าวัสดุก่อสร้าง');
      if (editingTransaction.debit > 0) {
        setType('income');
        setAmount(editingTransaction.debit.toString());
      } else {
        setType('expense');
        setAmount(editingTransaction.credit.toString());
      }
      setRemarks(editingTransaction.remarks || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setDocNo('');
      setDescription('');
      setAmount('');
      setRemarks('');
      const targetType = initialType || 'expense';
      setType(targetType);
      setCategory(targetType === 'income' ? incomeCategories[0] : expenseCategories[0]);
    }
  }, [editingTransaction, isOpen, initialType]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) {
      alert('กรุณาระบุจำนวนเงินที่มากกว่า 0');
      return;
    }

    const [y, m, d] = date.split('-');
    const thaiYear = parseInt(y, 10) + 543;
    const formattedThaiDate = `${d}/${m}/${thaiYear}`;

    const newTx: Omit<Transaction, 'id' | 'createdAt'> = {
      date: formattedThaiDate,
      isoDate: date,
      docNo: docNo.trim(),
      company,
      account,
      description: description.trim(),
      project,
      category: category.trim(),
      debit: type === 'income' ? numAmount : 0,
      credit: type === 'expense' ? numAmount : 0,
      remarks: remarks.trim()
    };

    onSave(newTx, editingTransaction?.id);
    onClose();
  };

  const suggestions = useDatabaseSuggestions();
  const isExpense = type === 'expense';
  const activeCategories = isExpense ? expenseCategories : incomeCategories;

  const dynamicCompanies = suggestions.companies.length > 0 ? suggestions.companies : companiesList;
  const dynamicAccounts = suggestions.bankAccounts.length > 0 ? suggestions.bankAccounts : accountsList;
  const dynamicProjects = suggestions.projects.length > 0 ? suggestions.projects : projectsList;
  const dynamicCategories = suggestions.txCategories.length > 0 ? suggestions.txCategories : activeCategories;

  const numAmount = parseFloat(amount) || 0;
  const thaiBahtText = numberToThaiBaht(numAmount);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-300 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Control Bar */}
        <div className="bg-slate-800 text-white px-5 sm:px-6 py-3.5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs border ${
              isExpense 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              {isExpense ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  {editingTransaction 
                    ? `แก้ไขรายการ: ${isExpense ? 'ใบสำคัญจ่าย (Payment Voucher)' : 'ใบสำคัญรับ (Receipt Voucher)'}` 
                    : isExpense ? 'แบบฟอร์มใบสำคัญจ่ายเงิน (Payment Voucher Form)' : 'แบบฟอร์มใบสำคัญรับเงิน (Receipt Voucher Form)'
                  }
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isExpense 
                    ? 'bg-rose-900/60 text-rose-200 border-rose-700' 
                    : 'bg-emerald-900/60 text-emerald-200 border-emerald-700'
                }`}>
                  {isExpense ? 'เงินจ่ายออก (Cr.)' : 'เงินรับเข้า (Dr.)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {isExpense 
                  ? 'ตัดเงินออกจากบัญชีธนาคาร • ยอดเงินจะบันทึกในช่องเครดิต (Credit) ในสมุดบัญชี' 
                  : 'นำเงินเข้าบัญชีธนาคาร • ยอดเงินจะบันทึกในช่องเดบิต (Debit) ในสมุดบัญชี'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Full Document Canvas */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-white text-xs space-y-4 text-slate-900 font-['Sarabun',sans-serif]">
            
            {/* Header Document Section */}
            <div className="border-b-2 border-slate-900 pb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2 flex items-center gap-3.5">
                <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                  <BTCLogo className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-base font-black text-slate-900 tracking-tight">
                    {company}
                  </h1>
                  <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                    31/2 ถนนอินจันทร์ณรงค์ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000<br />
                    เลขประจำตัวผู้เสียภาษี: <span className="font-mono font-bold text-slate-800">0315559001144</span> • โทร. 044-611134 • สำนักงานใหญ่
                  </p>
                </div>
              </div>

              <div className="text-left md:text-right border-t md:border-t-0 pt-2 md:pt-0 border-slate-200">
                <div className="inline-block md:text-right">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    {isExpense ? 'ใบสำคัญจ่ายเงิน' : 'ใบสำคัญรับเงิน'}
                  </h2>
                  <div className="text-[11px] font-mono font-bold text-slate-600 uppercase">
                    {isExpense ? 'PAYMENT VOUCHER (PV)' : 'RECEIPT VOUCHER (RV)'}
                  </div>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isExpense 
                        ? 'bg-rose-50 text-rose-800 border-rose-200' 
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {isExpense ? '🔴 บันทึกเครดิต (Credit / เงินออก)' : '🟢 บันทึกเดบิต (Debit / เงินเข้า)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields as Document Information Table */}
            <form id="ledger-form" onSubmit={handleSubmit} className="space-y-4 pt-1">
              
              {/* Document Meta Fields Grid */}
              <div className="bg-slate-50/70 border border-slate-300 rounded-lg p-3.5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Date */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">วันที่ทำรายการ (Date) *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005aa9] font-medium"
                    />
                  </div>

                  {/* Doc No */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      {isExpense ? 'เลขที่ใบสำคัญจ่าย / DBM / PV / เช็คอ้างอิง' : 'เลขที่ใบเสร็จรับเงิน / ใบแจ้งหนี้ / งวดงาน'}
                    </label>
                    <input
                      type="text"
                      list="dl-ref-doc-nos"
                      value={docNo}
                      onChange={(e) => handleDocNoChange(e.target.value)}
                      placeholder={isExpense ? "เช่น DBM-2568-001, PV68-08-012" : "เช่น REC-2568-001, งวดที่ 1"}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005aa9] font-mono font-medium"
                    />
                    {isExpense && (
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        * พิมพ์เลข DBM หรือ PV เพื่อดึงข้อมูลอัตโนมัติ
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Company */}
                  <SearchableCombobox
                    label="บริษัท / กิจการร่วมค้า"
                    required
                    value={company}
                    onChange={(val) => setCompany(val)}
                    options={dynamicCompanies}
                    datalistId="dl-companies"
                    placeholder="เลือกหรือพิมพ์ชื่อบริษัท"
                    allowCustom={true}
                    accentColor={isExpense ? 'rose' : 'emerald'}
                  />

                  {/* Bank Account */}
                  <SearchableCombobox
                    label={isExpense ? '🔴 ตัดจ่ายจากบัญชีธนาคาร (Source Bank Account)' : '🟢 นำฝากเข้าบัญชีธนาคาร (Target Bank Account)'}
                    required
                    value={account}
                    onChange={(val) => setAccount(val)}
                    options={dynamicAccounts}
                    datalistId="dl-bank-accounts"
                    placeholder="เลือกหรือพิมพ์บัญชีธนาคาร"
                    allowCustom={true}
                    accentColor={isExpense ? 'rose' : 'emerald'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Project */}
                  <SearchableCombobox
                    label="โครงการ / หน่วยงาน (Project)"
                    required
                    value={project}
                    onChange={(val) => setProject(val)}
                    options={dynamicProjects}
                    datalistId="dl-projects"
                    placeholder="เลือกหรือพิมพ์ชื่อโครงการ"
                    allowCustom={true}
                    accentColor={isExpense ? 'rose' : 'emerald'}
                  />

                  {/* Category */}
                  <SearchableCombobox
                    label={`หมวดหมู่งบประมาณ ${isExpense ? '(รายจ่าย - Expense)' : '(รายรับ - Income)'}`}
                    required
                    value={category}
                    onChange={(val) => setCategory(val)}
                    options={dynamicCategories}
                    datalistId="dl-tx-categories"
                    placeholder="เลือกหรือพิมพ์หมวดหมู่งาน"
                    allowCustom={true}
                    accentColor={isExpense ? 'rose' : 'emerald'}
                  />
                </div>
              </div>

              {/* Description / Particulars */}
              <div className="text-xs">
                <label className="font-bold text-slate-800 block mb-1">
                  {isExpense ? 'รายละเอียดรายการ / ผู้รับเงิน / วัตถุประสงค์การจ่าย *' : 'รายละเอียดรายการ / แหล่งที่มา / ผู้ว่าจ้าง *'}
                </label>
                <input
                  type="text"
                  required
                  list="dl-item-descriptions"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isExpense ? "เช่น ค่าเหล็กเส้น บริษัท เหล็กสยาม จำกัด (ส่งงานสะพาน)" : "เช่น รับค่างวดงานทางหลวงงวดที่ 4 ตอนที่ 2"}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005aa9] font-medium"
                />
              </div>

              {/* Financial Particulars Table / Amount Block */}
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>ตารางสรุปจำนวนเงินตามเอกสาร (Particulars & Amount)</span>
                  <span>สกุลเงิน: บาท (THB)</span>
                </div>

                <div className="p-4 bg-white space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-2">
                      <label className="font-bold text-xs text-slate-700 block mb-1">
                        {isExpense ? 'จำนวนเงินที่จ่ายสุทธิ (Amount Paid - Credit Cr.) *' : 'จำนวนเงินที่รับเข้าสุทธิ (Amount Received - Debit Dr.) *'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          required
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:ring-2 text-xl font-black font-mono shadow-inner ${
                            isExpense 
                              ? 'border-rose-300 text-rose-700 focus:ring-rose-500' 
                              : 'border-emerald-300 text-emerald-700 focus:ring-[#009540]'
                          }`}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">
                          THB
                        </span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg border text-right ${
                      isExpense ? 'bg-rose-50/60 border-rose-200' : 'bg-emerald-50/60 border-emerald-200'
                    }`}>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">ยอดเงินรวมสุทธิ</div>
                      <div className={`text-xl font-black font-mono mt-0.5 ${
                        isExpense ? 'text-rose-700' : 'text-emerald-700'
                      }`}>
                        {numAmount > 0 ? numAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </div>
                      <div className="text-[10px] text-slate-500">บาท (THB)</div>
                    </div>
                  </div>

                  {/* Thai Baht text */}
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs flex items-center gap-2">
                    <span className="font-bold text-slate-700 whitespace-nowrap">จำนวนเงินตัวอักษร:</span>
                    <span className="font-bold text-blue-900 tracking-wide">{thaiBahtText}</span>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="text-xs">
                <label className="font-bold text-slate-800 block mb-1">หมายเหตุเพิ่มเติม / รายละเอียดบัญชีปลายทาง</label>
                <input
                  type="text"
                  list="dl-remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="หมายเหตุเพิ่มเติม หรือรายละเอียดบัญชีปลายทาง (ถ้ามี)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005aa9]"
                />
              </div>

              {/* Document Signatures Box (ท้ายเอกสาร 2 บล็อกเสมือนจริง) */}
              <div className="pt-2 border-t border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  การลงนามรับรองเอกสาร (Signatures & Approvals)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Block 1: ผู้จัดทำ / ผู้บันทึก */}
                  <div className="border border-slate-300 rounded-lg p-3 text-center bg-slate-50/50 space-y-2">
                    <div className="text-xs font-bold text-slate-800">ผู้จัดทำ / ผู้บันทึกรายการ</div>
                    
                    <div className="h-10 flex items-center justify-center">
                      <div className="text-xs font-bold text-blue-800 font-mono bg-blue-50 px-3 py-1 rounded border border-blue-200">
                        {recordedBy || 'เจ้าหน้าที่การเงินและบัญชี'}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div className="flex items-center justify-center gap-1">
                        <span>(</span>
                        <input
                          type="text"
                          list="dl-requesters"
                          value={recordedBy}
                          onChange={(e) => setRecordedBy(e.target.value)}
                          className="text-center font-medium bg-transparent border-b border-dotted border-slate-400 focus:outline-hidden text-xs text-slate-800 w-44"
                          placeholder="ชื่อ-สกุลผู้บันทึก"
                        />
                        <span>)</span>
                      </div>
                      <div className="text-[10px] text-slate-500">เจ้าหน้าที่การเงินและบัญชี</div>
                      <div className="text-[10px] text-slate-400">วันที่ {date}</div>
                    </div>
                  </div>

                  {/* Block 2: ผู้ตรวจสอบและอนุมัติ */}
                  <div className="border border-slate-300 rounded-lg p-3 text-center bg-slate-50/50 space-y-2">
                    <div className="text-xs font-bold text-slate-800">ผู้มีอำนาจตรวจสอบ / อนุมัติ</div>
                    
                    <div className="h-10 flex items-center justify-center">
                      <span className="text-[10px] text-slate-400 italic">
                        [รอผู้มีอำนาจลงนามอนุมัติ]
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div>(....................................................)</div>
                      <div className="text-[10px] text-slate-500">ผู้จัดการฝ่ายบัญชีและการเงิน</div>
                      <div className="text-[10px] text-slate-400">วันที่ ......./......./.......</div>
                    </div>
                  </div>
                </div>
              </div>

            </form>
          </div>

        {/* Sticky Bottom Actions Bar */}
        <div className="px-6 py-3.5 bg-slate-800 border-t border-slate-700 flex items-center justify-between shrink-0 text-white">
          <div className="text-[11px] font-medium text-slate-300">
            สถานะเอกสาร: {isExpense ? (
              <span className="text-rose-400 font-bold">🔴 บันทึกรายจ่าย (Cr.)</span>
            ) : (
              <span className="text-emerald-400 font-bold">🟢 บันทึกรายรับ (Dr.)</span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 font-bold cursor-pointer transition-colors text-xs"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              form="ledger-form"
              className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.01] text-xs ${
                isExpense 
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/30' 
                  : 'bg-[#009540] hover:bg-[#007e36] shadow-emerald-900/30'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>
                {editingTransaction 
                  ? 'บันทึกการแก้ไขเอกสาร' 
                  : isExpense ? '🔴 บันทึกใบสำคัญจ่าย (Save PV)' : '🟢 บันทึกใบสำคัญรับ (Save RV)'
                }
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
