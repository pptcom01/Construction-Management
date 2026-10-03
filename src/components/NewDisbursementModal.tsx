import { useState, useEffect, useMemo, FormEvent } from 'react';
import { Disbursement, DisbursementItem, DisbursementAttachment } from '../types';
import { 
  X, Save, Plus, Trash2, FileText, Calculator, Building2, 
  Send, PenTool, CheckCircle2, Percent, Paperclip, AlertCircle 
} from 'lucide-react';
import { SignatureActionModal } from './SignatureActionModal';
import { FileUploadZone } from './FileUploadZone';
import { SearchableCombobox } from './SearchableCombobox';
import { BTCLogo } from './BTCLogo';
import { numberToThaiBaht } from '../utils/thaiBahtText';
import { getActiveUserName } from '../services/userService';
import { useDatabaseSuggestions } from '../context/DatabaseSuggestionsContext';

interface NewDisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (disbursement: Omit<Disbursement, 'id'>, existingId?: string) => void;
  editingDisbursement?: Disbursement | null;
  projectsList: string[];
  companiesList: string[];
  accountsList: string[];
}

export function NewDisbursementModal({
  isOpen,
  onClose,
  onSave,
  editingDisbursement,
  projectsList,
  companiesList,
  accountsList
}: NewDisbursementModalProps) {
  // Read Master Data cached from Google Sheets (if available)
  const [googleMasterData, setGoogleMasterData] = useState<{
    contractors: string[];
    projects: string[];
    expenseCategories: string[];
  }>({ contractors: [], projects: [], expenseCategories: [] });

  useEffect(() => {
    if (isOpen) {
      try {
        const cached = localStorage.getItem('btc_google_master_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          setGoogleMasterData({
            contractors: parsed.contractors || [],
            projects: parsed.projects || [],
            expenseCategories: parsed.expenseCategories || []
          });
        }
      } catch (e) {
        console.error('Failed to parse google master cache', e);
      }
    }
  }, [isOpen]);

  // Standard Staff / Requesters
  const standardStaff = [
    'น.ส.ปวีณา ใยอุ่น',
    'นายสมพร แสนสุข (ฝ่ายสโตร์)',
    'นายอานนท์ รุ่งเรือง (วิศวกรสนาม)',
    'น.ส.กมลทิพย์ กรมทอง (ฝ่ายการเงิน)',
    'นายธีรพงษ์ ผู้จัดการโครงการ',
    'นายชูชาติ บุญมี (ช่างเครื่องจักร)'
  ];

  // Standard BOQ Work Categories
  const standardBoqCategories = [
    'งานโครงสร้างและวัสดุ',
    'งานผิวทางแอสฟัลต์ติกคอนกรีต',
    'งานทางเท้าและท่อระบายน้ำ',
    'งานสะพานและท่อเหลี่ยม',
    'งานกำแพงกันดิน MSE Wall',
    'งานไฟฟ้าส่องสว่างและป้ายจราจร',
    'งานบำรุงรักษาเครื่องจักรและยานพาหนะ',
    'งานเบ็ดเตล็ดและอำนวยความสะดวก'
  ];

  // Standard Expense Categories
  const standardExpenseCategories = [
    'จ่ายชำระ ค่าวัสดุก่อสร้าง',
    'ค่าคอนกรีตผสมเสร็จ & ท่อระบายน้ำ',
    'ค่าเหล็กเส้น & ไวร์เมช',
    'ค่าหินคลุก & ทรายถม',
    'ค่าผลงานผู้รับเหมาช่วง',
    'ค่าน้ำมันเชื้อเพลิงดีเซล & หล่อลื่น',
    'ค่าอะไหล่ & ซ่อมบำรุงเครื่องจักร',
    'เงินเดือน & สำรองค่าแรง',
    'ภาษีหัก ณ ที่จ่าย ภ.ง.ด. 1, 3, 53',
    'ภาษีมูลค่าเพิ่ม ภ.พ.30',
    'ค่าสาธารณูปโภค (ไฟฟ้า, ประปา, สื่อสาร)',
    'ค่าใช้จ่ายทั่วไป / เงินสดย่อย'
  ];

  // Real database suggestions engine
  const suggestions = useDatabaseSuggestions();

  // Combined merged list with fallback, prioritized by real database frequency ("สะกดที่ใช้บ่อยสุด")
  const mergedProjects = suggestions.projects.length > 0
    ? suggestions.projects
    : Array.from(new Set([...(googleMasterData.projects || []), ...projectsList])).filter(Boolean);

  const mergedPayees = suggestions.payees.length > 0
    ? suggestions.payees
    : Array.from(new Set([
        ...(googleMasterData.contractors || []),
        'บจก. สุรินทร์คอนกรีตโปรดักส์',
        'หจก. ปิยะวิลล์คอนสตรัคชั่น',
        'โรงงาน ป.ศิลาชัย คอนกรีต',
        'บจก. ชลประทานซีเมนต์',
        'หจก. บุรีรัมย์ศิลาชัย'
      ])).filter(Boolean);

  // ตัวเลือกผู้รับเงินพร้อมแสดงเลขบัญชีและสถานะประวัติใน Dropdown ทันที
  const payeeOptions = useMemo(() => {
    return mergedPayees.map(name => {
      const bank = suggestions.getBankForPayee(name);
      return {
        value: name,
        label: name,
        subLabel: bank ? `🏦 บัญชี: ${bank}` : undefined,
        badge: bank ? 'มีประวัติบัญชี' : undefined
      };
    });
  }, [mergedPayees, suggestions]);

  const mergedExpenses = suggestions.expenseTypes.length > 0
    ? suggestions.expenseTypes
    : Array.from(new Set([...(googleMasterData.expenseCategories || []), ...standardExpenseCategories])).filter(Boolean);

  const mergedBoqs = suggestions.boqTypes.length > 0
    ? suggestions.boqTypes
    : standardBoqCategories;

  const mergedStaff = suggestions.requesters.length > 0
    ? suggestions.requesters
    : standardStaff;

  // [ 2. กรอกข้อมูลเอกสาร ]
  const [recordedBy, setRecordedBy] = useState(() => getActiveUserName());
  const [dbmNo, setDbmNo] = useState('');
  const [refDocNo, setRefDocNo] = useState('');
  const [company, setCompany] = useState(companiesList[0] || 'BTC');
  const [entryDate, setEntryDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [expenseType, setExpenseType] = useState('จ่ายชำระ ค่าวัสดุก่อสร้าง');
  const [boqType, setBoqType] = useState('งานโครงสร้างและวัสดุ');
  const [payeeName, setPayeeName] = useState('');
  const [payeeBankAccount, setPayeeBankAccount] = useState('');
  const [project, setProject] = useState(projectsList[0] || '(38) ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)');
  const [paymentMethod, setPaymentMethod] = useState('โอน');
  const [remarks, setRemarks] = useState('');

  // Structured Items: description, unitPrice, quantity, amount, vatRate, withholdingTaxRate
  const [items, setItems] = useState<DisbursementItem[]>([
    { description: 'ค่าวัสดุก่อสร้าง / งานเหมา', quantity: 1, unitPrice: 0, amount: 0, vatRate: 0, withholdingTaxRate: 0 }
  ]);

  // Attachments
  const [attachments, setAttachments] = useState<DisbursementAttachment[]>([]);

  // [ 3. ลงนามสดผู้ขอเบิก (Requester Live Signature) ]
  const [requesterSignature, setRequesterSignature] = useState('');
  const [showSignModal, setShowSignModal] = useState(false);

  // Keep existing finance fields untouched if editing
  const [payerAccount, setPayerAccount] = useState(accountsList[0] || 'BBL #297-3-033893');
  const [chequeNo, setChequeNo] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [transferAmount, setTransferAmount] = useState<number | undefined>(undefined);
  const [fee, setFee] = useState<number>(0);
  const [documentLink, setDocumentLink] = useState<string | undefined>(undefined);
  const [financeRecordedBy, setFinanceRecordedBy] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<Disbursement['status']>('pending_review');

  useEffect(() => {
    if (editingDisbursement) {
      setRecordedBy(editingDisbursement.recordedBy || getActiveUserName());
      setDbmNo(editingDisbursement.dbmNo || '');
      setRefDocNo(editingDisbursement.refDocNo || '');
      setCompany(editingDisbursement.company || 'BTC');
      setEntryDate(editingDisbursement.entryDate || '');
      setDueDate(editingDisbursement.dueDate || '');
      setExpenseType(editingDisbursement.expenseType || '');
      setBoqType(editingDisbursement.boqType || editingDisbursement.expenseType || '');
      setPayeeName(editingDisbursement.payeeName || '');
      setPayeeBankAccount(editingDisbursement.payeeBankAccount || '');
      setProject(editingDisbursement.project || projectsList[0]);
      setPaymentMethod(editingDisbursement.paymentMethod || 'โอน');
      setRemarks(editingDisbursement.remarks || '');
      
      setItems(
        editingDisbursement.items && editingDisbursement.items.length > 0
          ? editingDisbursement.items.map(it => ({
              description: it.description || '',
              quantity: it.quantity || 1,
              unitPrice: it.unitPrice || it.amount || 0,
              amount: it.amount || 0,
              vatRate: it.vatRate || 0,
              withholdingTaxRate: it.withholdingTaxRate || 0
            }))
          : [{ description: editingDisbursement.expenseType || '', quantity: 1, unitPrice: editingDisbursement.totalAmount, amount: editingDisbursement.totalAmount, vatRate: 0, withholdingTaxRate: 0 }]
      );
      
      setAttachments(editingDisbursement.attachments || []);
      setRequesterSignature(editingDisbursement.requesterSignature || '');
      setPayerAccount(editingDisbursement.payerAccount || accountsList[0]);
      setChequeNo(editingDisbursement.chequeNo || '');
      setPaymentDate(editingDisbursement.paymentDate || '');
      setTransferAmount(editingDisbursement.transferAmount);
      setFee(editingDisbursement.fee || 0);
      setDocumentLink(editingDisbursement.documentLink);
      setFinanceRecordedBy(editingDisbursement.financeRecordedBy);
      setStatus(editingDisbursement.status || 'pending_review');
    } else {
      // Initialize fresh new voucher
      const today = new Date();
      const thaiYear = today.getFullYear() + 543;
      const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${thaiYear}`;
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const generatedDbm = `DBM26${String(today.getMonth() + 1).padStart(2, '0')}${randomNum}`;

      setRecordedBy(getActiveUserName());
      setDbmNo(generatedDbm);
      setRefDocNo(`PS690${randomNum.toString().substring(0, 3)}`);
      setCompany('BTC');
      setEntryDate(formattedDate);
      setDueDate('');
      setExpenseType('จ่ายชำระ ค่าวัสดุก่อสร้าง');
      setBoqType('งานโครงสร้างและวัสดุ');
      setPayeeName('');
      setPayeeBankAccount('');
      setProject('(38) ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)');
      setPaymentMethod('โอน');
      setRemarks('');
      setItems([{ description: 'ค่าวัสดุก่อสร้าง / งานเหมา', quantity: 1, unitPrice: 0, amount: 0, vatRate: 0, withholdingTaxRate: 0 }]);
      setAttachments([]);
      setRequesterSignature('');
      setPayerAccount(accountsList[0] || 'BBL #297-3-033893');
      setChequeNo('');
      setPaymentDate('');
      setTransferAmount(undefined);
      setFee(0);
      setDocumentLink(undefined);
      setFinanceRecordedBy(undefined);
      setStatus('pending_review');
    }
  }, [editingDisbursement, isOpen, accountsList, projectsList, companiesList]);

  // เมื่อเปลี่ยนชื่อผู้รับเงิน (Payee) ดึงบัญชีธนาคารปลายทางจากประวัติขึ้นมาแสดงอัตโนมัติ
  useEffect(() => {
    if (payeeName && !payeeBankAccount) {
      const matched = suggestions.getBankForPayee(payeeName);
      if (matched) {
        setPayeeBankAccount(matched);
      }
    }
  }, [payeeName, suggestions]);

  if (!isOpen) return null;

  // Calculate sum of items
  const calculatedTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const thaiText = numberToThaiBaht(calculatedTotal);

  const handleAddItem = () => {
    if (items.length >= 10) {
      alert('สามารถเพิ่มรายการย่อยได้สูงสุด 10 รายการ');
      return;
    }
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, amount: 0, vatRate: 0, withholdingTaxRate: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      alert('ต้องมีอย่างน้อย 1 รายการ');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof DisbursementItem, value: any) => {
    const updated = [...items];
    const target = { ...updated[index] };

    if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? Number(value) || 0 : target.quantity || 1;
      const price = field === 'unitPrice' ? Number(value) || 0 : target.unitPrice || 0;
      target[field] = Number(value) || 0;
      target.amount = Number((qty * price).toFixed(2));
    } else if (field === 'amount') {
      target.amount = typeof value === 'string' ? parseFloat(value) || 0 : Number(value) || 0;
      target.unitPrice = target.amount;
      target.quantity = 1;
    } else {
      (target as any)[field] = value;
    }

    updated[index] = target;
    setItems(updated);
  };

  // Helper auto tax deduction & VAT buttons
  const applyTaxDeduction = (rate: number) => {
    const baseAmount = items[0]?.amount || 0;
    if (baseAmount <= 0) {
      alert('กรุณาระบุจำนวนเงินในรายการแรกก่อนคำนวณภาษีหัก ณ ที่จ่าย');
      return;
    }
    const taxAmt = -(baseAmount * rate);
    const taxDesc = `หัก ภาษีหัก ณ ที่จ่าย (${rate * 100}%)`;
    setItems([...items, { description: taxDesc, quantity: 1, unitPrice: taxAmt, amount: Number(taxAmt.toFixed(2)) }]);
  };

  const applyVat7 = () => {
    const baseAmount = items[0]?.amount || 0;
    if (baseAmount <= 0) {
      alert('กรุณาระบุจำนวนเงินในรายการแรกก่อนคำนวณ VAT 7%');
      return;
    }
    const vatAmt = baseAmount * 0.07;
    const vatDesc = `ภาษีมูลค่าเพิ่ม VAT 7%`;
    setItems([...items, { description: vatDesc, quantity: 1, unitPrice: vatAmt, amount: Number(vatAmt.toFixed(2)) }]);
  };

  const applyRetentionDeduction = (rate: number = 0.05) => {
    const baseAmount = items[0]?.amount || 0;
    if (baseAmount <= 0) {
      alert('กรุณาระบุจำนวนเงินในรายการแรกก่อนคำนวณหักเงินประกันผลงาน');
      return;
    }
    const retAmt = -(baseAmount * rate);
    const retDesc = `หัก เงินประกันผลงาน (${rate * 100}%)`;
    setItems([...items, { description: retDesc, quantity: 1, unitPrice: retAmt, amount: Number(retAmt.toFixed(2)) }]);
  };

  const executeSave = (signatureToUse?: string) => {
    const finalSig = signatureToUse !== undefined ? signatureToUse : requesterSignature;
    const data: Omit<Disbursement, 'id'> = {
      recordedBy: recordedBy.trim(),
      dbmNo: dbmNo.trim(),
      refDocNo: refDocNo.trim(),
      company,
      entryDate: entryDate.trim(),
      dueDate: dueDate.trim(),
      expenseType: expenseType.trim(),
      boqType: boqType.trim(),
      payeeName: payeeName.trim(),
      payeeBankAccount: payeeBankAccount.trim(),
      project,
      paymentMethod,
      remarks: remarks.trim(),
      items: items.filter(it => it.description.trim() !== '' || it.amount !== 0),
      totalAmount: calculatedTotal,
      
      // Step 3: Requester Live Signature & Attachments
      requesterSignature: finalSig || undefined,
      requesterSignedAt: finalSig ? new Date().toISOString() : undefined,
      attachments: attachments,

      // Step 4: Status becomes "pending_review" (รอตรวจสอบ)
      status: editingDisbursement?.status === 'paid' ? 'paid' : 'pending_review',

      payerAccount: payerAccount.trim(),
      chequeNo: chequeNo.trim(),
      paymentDate: paymentDate.trim(),
      transferAmount: transferAmount,
      fee: fee,
      documentLink: documentLink?.trim() || undefined,
      financeRecordedBy: financeRecordedBy?.trim() || undefined,
      isSyncedToLedger: status === 'paid'
    };

    onSave(data, editingDisbursement?.id);
    onClose();
  };

  // [ 4. บันทึกและส่งเอกสาร ]
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!dbmNo.trim()) {
      alert('กรุณาระบุเลขที่เอกสาร DBM');
      return;
    }
    if (!payeeName.trim()) {
      alert('กรุณาระบุชื่อผู้รับเงิน / บริษัทคู่ค้า');
      return;
    }
    if (!recordedBy.trim()) {
      alert('กรุณาระบุชื่อผู้ขอเบิก (Requester)');
      return;
    }
    if (calculatedTotal <= 0) {
      if (!confirm('ยอดรวมสุทธิเป็น 0 หรือติดลบ คุณแน่ใจหรือไม่ว่าต้องการบันทึก?')) {
        return;
      }
    }

    // If no signature yet, open signature modal for user to sign upon pressing save!
    if (!requesterSignature) {
      setShowSignModal(true);
      return;
    }

    executeSave();
  };

  const handleConfirmSignatureAndSubmit = (signedUrl: string) => {
    setRequesterSignature(signedUrl);
    setShowSignModal(false);
    executeSave(signedUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header Bar */}
        <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between shrink-0 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#005aa9] text-white flex items-center justify-center font-bold shrink-0 shadow">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {editingDisbursement ? 'แก้ไขใบขอตั้งเบิก (Disbursement Voucher)' : 'แบบฟอร์มเอกสารใบขอตั้งเบิกค่าใช้จ่าย (Disbursement Voucher Form)'}
                </h3>
                <span className="px-2 py-0.5 bg-amber-400 text-amber-950 text-[10px] font-bold rounded flex items-center gap-1">
                  <Send className="w-3 h-3 text-amber-950" />
                  แบบฟอร์มเอกสารจริง (Official Document)
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-normal">
                กรอกข้อมูลลงบนแผ่นเอกสารทางการ • เซ็นสด • ตรวจสอบความถูกต้องก่อนส่งต่อฝ่ายอนุมัติ
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

        {/* Form Body - Full Document Canvas (No Awkward Grey Border) */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
          
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-white text-xs space-y-4 text-slate-900">
            
            {/* 1. DOCUMENT LETTERHEAD & OFFICIAL HEADER */}
            <div className="border-b-2 border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                {/* Left: Company Details */}
                <div className="flex items-start gap-3">
                  <BTCLogo size="md" />
                  <div className="space-y-0.5">
                    <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                      บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด
                    </h2>
                    <p className="text-[11px] font-semibold text-slate-600">
                      BURIRAM THONGCHAI CONSTRUCTION CO., LTD.
                    </p>
                    <p className="text-[10px] text-slate-500">
                      เลขประจำตัวผู้เสียภาษี 0315559001144 • สำนักงานใหญ่
                    </p>
                    <p className="text-[10px] text-slate-500">
                      31/2 ถนนอินจันทร์ณรงค์ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000 • โทร. 044-611134 • E-Mail: brtc2024@gmail.com
                    </p>
                  </div>
                </div>

                {/* Center / Right: Official Document Metadata Box */}
                <div className="sm:w-72 bg-slate-50 border-2 border-slate-700 rounded-lg p-2.5 shadow-xs space-y-1.5 shrink-0">
                  <div className="text-center font-bold text-slate-900 border-b border-slate-300 pb-1 text-xs">
                    ใบขอตั้งเบิกค่าใช้จ่าย (DBM)
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">เลขที่เอกสาร *</span>
                      <input
                        type="text"
                        required
                        value={dbmNo}
                        onChange={(e) => setDbmNo(e.target.value)}
                        placeholder="DBM26080001"
                        className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">เลขอ้างอิง</span>
                      <input
                        type="text"
                        list="dl-ref-doc-nos"
                        value={refDocNo}
                        onChange={(e) => setRefDocNo(e.target.value)}
                        placeholder="PS69..."
                        className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">วันที่ขอเบิก *</span>
                      <input
                        type="text"
                        required
                        value={entryDate}
                        onChange={(e) => setEntryDate(e.target.value)}
                        placeholder="29/08/2569"
                        className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">กำหนดจ่าย</span>
                      <input
                        type="text"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        placeholder="05/09/2569"
                        className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-800 text-xs"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* 2. OFFICIAL PARTY & PROJECT INFORMATION GRID */}
              <div className="border border-slate-300 rounded-lg bg-white relative">
                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 font-bold text-slate-800 text-xs flex items-center justify-between rounded-t-lg">
                  <span>ข้อมูลผู้รับเงินและโครงการ (Payee & Project Details)</span>
                  <span className="text-[10px] text-slate-500 font-normal">กรุณาตรวจสอบชื่อบัญชีและธนาคารปลายทางให้ถูกต้อง</span>
                </div>
                
                <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <SearchableCombobox
                      label="สั่งจ่ายให้ / ร้านค้า / ผู้รับเหมา (Payee) *"
                      required
                      value={payeeName}
                      onChange={(val) => {
                        setPayeeName(val);
                        const matchedBank = suggestions.getBankForPayee(val);
                        if (matchedBank) {
                          setPayeeBankAccount(matchedBank);
                        }
                      }}
                      onSelectOption={(opt) => {
                        const matchedBank = suggestions.getBankForPayee(opt.value);
                        if (matchedBank) {
                          setPayeeBankAccount(matchedBank);
                        }
                      }}
                      options={payeeOptions}
                      datalistId="dl-payees"
                      placeholder="พิมพ์ค้นหา หรือพิมพ์เพิ่มชื่อผู้รับเงิน"
                      searchPlaceholder="ค้นหาหรือพิมพ์ชื่อร้านค้า/ผู้รับเงิน..."
                      allowCustom={true}
                      accentColor="blue"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700 block text-xs">บัญชีธนาคารปลายทาง</label>
                      {payeeBankAccount && (
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          ✓ ดึงจากประวัติผู้รับเงิน
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      list="dl-bank-accounts"
                      value={payeeBankAccount}
                      onChange={(e) => setPayeeBankAccount(e.target.value)}
                      placeholder="เช่น BBL 123-4-567890 (สาขาบุรีรัมย์)"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005aa9] font-mono text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <SearchableCombobox
                      label="โครงการก่อสร้าง (Project) *"
                      required
                      value={project}
                      onChange={(val) => setProject(val)}
                      options={mergedProjects}
                      datalistId="dl-projects"
                      placeholder="พิมพ์ค้นหาหรือเลือกโครงการ"
                      allowCustom={true}
                      accentColor="blue"
                    />
                  </div>

                  <div>
                    <SearchableCombobox
                      label="วิธีการชำระเงิน"
                      value={paymentMethod}
                      onChange={(val) => setPaymentMethod(val)}
                      options={[
                        { value: 'โอน', label: 'โอนเงินเข้าบัญชี (Transfer)' },
                        { value: 'เงินสด', label: 'เงินสด (Cash)' },
                        { value: 'เช็ค', label: 'เช็คธนาคาร (Cheque)' },
                        { value: 'บริษัท', label: 'บัญชีบริษัท (Company Account)' },
                        { value: 'อื่นๆ', label: 'อื่นๆ' }
                      ]}
                      placeholder="เลือกวิธีการชำระเงิน"
                      allowCustom={true}
                      accentColor="blue"
                    />
                  </div>

                  <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <SearchableCombobox
                        label="ประเภทรายจ่าย (Expense Type)"
                        value={expenseType}
                        onChange={(val) => setExpenseType(val)}
                        options={mergedExpenses}
                        datalistId="dl-expense-types"
                        placeholder="เลือกหรือพิมพ์หมวดค่าใช้จ่าย"
                        allowCustom={true}
                        accentColor="blue"
                      />
                    </div>

                    <div>
                      <SearchableCombobox
                        label="ประเภทงาน (BOQ Category)"
                        value={boqType}
                        onChange={(val) => setBoqType(val)}
                        options={mergedBoqs}
                        datalistId="dl-boq-types"
                        placeholder="เลือกประเภทงานตาม BOQ"
                        allowCustom={true}
                        accentColor="blue"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. OFFICIAL LINE ITEMS TABLE (ตารางรายการค่าใช้จ่ายเหมือนเอกสารจริง) */}
              <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
                
                {/* Table Top Action Bar */}
                <div className="bg-slate-100 px-3 py-2 border-b border-slate-300 flex items-center justify-between flex-wrap gap-2">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <span>ตารางรายการขอเบิกจ่าย (Disbursement Line Items)</span>
                    <span className="text-[10px] text-slate-500 font-normal">({items.length} รายการ)</span>
                  </div>

                  {/* Accounting Quick Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={applyVat7}
                      className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded text-[10px] font-bold cursor-pointer flex items-center gap-1"
                      title="เพิ่มแถวภาษีมูลค่าเพิ่ม VAT 7%"
                    >
                      <Percent className="w-3 h-3 text-blue-600" />
                      + VAT 7%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTaxDeduction(0.01)}
                      className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold cursor-pointer"
                      title="หักภาษี ณ ที่จ่าย 1%"
                    >
                      - หัก 1%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTaxDeduction(0.03)}
                      className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold cursor-pointer"
                      title="หักภาษี ณ ที่จ่าย 3%"
                    >
                      - หัก 3%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyRetentionDeduction(0.05)}
                      className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded text-[10px] font-bold cursor-pointer"
                      title="หักเงินประกันผลงาน 5%"
                    >
                      - ค้ำประกัน 5%
                    </button>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-2.5 py-0.5 bg-[#005aa9] hover:bg-[#004887] text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                      + เพิ่มแถว
                    </button>
                  </div>
                </div>

                {/* The Formal Accounting Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-300 text-[11px] font-bold text-slate-700">
                        <th className="py-2 px-2 text-center w-12 border-r border-slate-200">ลำดับ</th>
                        <th className="py-2 px-3 border-r border-slate-200">รายการและรายละเอียดค่าใช้จ่าย</th>
                        <th className="py-2 px-2 text-right w-24 border-r border-slate-200">จำนวน</th>
                        <th className="py-2 px-2 text-right w-28 border-r border-slate-200">ราคา/หน่วย</th>
                        <th className="py-2 px-3 text-right w-36 border-r border-slate-200">จำนวนเงิน (บาท)</th>
                        <th className="py-2 px-1 text-center w-10">ลบ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {items.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-1.5 px-2 text-center font-mono text-slate-500 font-bold border-r border-slate-200 text-xs">
                            {index + 1}
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-200">
                            <input
                              type="text"
                              required
                              list="dl-item-descriptions"
                              placeholder="รายละเอียด เช่น ค่าเหล็กเส้นกลม RB9"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-transparent hover:border-slate-300 focus:border-[#005aa9] rounded focus:ring-1 focus:ring-[#005aa9] text-xs text-slate-900"
                            />
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-200">
                            <input
                              type="number"
                              step="any"
                              placeholder="1"
                              value={item.quantity || ''}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-transparent hover:border-slate-300 focus:border-[#005aa9] rounded font-mono text-right text-xs text-slate-800"
                            />
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-200">
                            <input
                              type="number"
                              step="any"
                              placeholder="0.00"
                              value={item.unitPrice || ''}
                              onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-transparent hover:border-slate-300 focus:border-[#005aa9] rounded font-mono text-right text-xs text-slate-800"
                            />
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-200">
                            <input
                              type="number"
                              step="any"
                              required
                              placeholder="0.00"
                              value={item.amount || ''}
                              onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                              className={`w-full px-2 py-1 border rounded font-mono text-right font-bold text-xs ${
                                item.amount < 0 
                                  ? 'bg-red-50 border-red-200 text-red-700' 
                                  : 'bg-white border-transparent hover:border-slate-300 focus:border-[#005aa9] text-slate-900'
                              }`}
                            />
                          </td>
                          <td className="py-1.5 px-1 text-center">
                            {items.length > 1 ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="p-1 text-slate-300 hover:text-red-600 rounded transition-colors cursor-pointer"
                                title="ลบแถวรายการ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-slate-200">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      {/* Thai Baht text & Grand Total Summary */}
                      <tr className="bg-slate-100/90 border-t-2 border-slate-300">
                        <td colSpan={3} className="py-2.5 px-4 border-r border-slate-200">
                          <div className="text-[11px] text-slate-700">
                            <span className="font-bold text-slate-900">จำนวนเงินตัวอักษร:</span>{' '}
                            <span className="font-semibold text-blue-900 underline decoration-slate-400">({thaiText})</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800 border-r border-slate-200 text-xs">
                          รวมเป็นเงินสุทธิ
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-900 text-base border-r border-slate-200 underline decoration-double">
                          {calculatedTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-1"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

              </div>

              {/* 4. ATTACHMENT & SUPPORTING DOCUMENTS ANNEX */}
              <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#005aa9]" />
                    <span>เอกสารหลักฐานแนบท้าย (Supporting Invoices, Receipts & Quotes)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">รองรับการลากวางไฟล์, คลิกอัปโหลด หรือกด Ctrl+V วางภาพได้ทันที</span>
                </div>
                <div className="p-3">
                  <FileUploadZone
                    attachments={attachments}
                    onChange={(newAtts) => setAttachments(newAtts)}
                    docNo={dbmNo || refDocNo || 'DBM'}
                    projectName={project}
                  />
                </div>
              </div>

              {/* 5. REMARKS / หมายเหตุเพิ่มเติม */}
              <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/60">
                <label className="font-bold text-slate-700 block mb-1 text-[11px]">หมายเหตุเพิ่มเติม / ข้อความชี้แจง</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="ระบุข้อความเพิ่มเติมหรือบันทึกชี้แจง เช่น ส่งมอบงานงวดที่ 2 แล้ว, แนบใบส่งของจากร้านค้าเรียบร้อย"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-[#005aa9] text-xs"
                />
              </div>

              {/* 6. OFFICIAL 4-POSITION SIGNATURES BLOCK (บล็อกลงนามมาตรฐาน 4 ฝ่าย เหมือนเอกสารจริง) */}
              <div className="border-2 border-slate-700 rounded-lg bg-white relative">
                <div className="bg-slate-800 text-white px-3 py-1 text-center font-bold text-xs tracking-wider rounded-t-[6px]">
                  ผู้มีอำนาจลงนามรับรองและอนุมัติ (OFFICIAL SIGNATURES & APPROVALS)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 text-center">
                  
                  {/* Slot 1: ผู้ขอเบิก (Requester) */}
                  <div className="p-3 flex flex-col justify-between space-y-2 bg-blue-50/20">
                    <div className="font-bold text-slate-800 text-[11px]">1. ผู้ขอเบิก (Requester)</div>
                    
                    <div className="min-h-[70px] flex flex-col items-center justify-center border-b border-dashed border-slate-300 pb-2">
                      {requesterSignature ? (
                        <div className="space-y-1">
                          <img 
                            src={requesterSignature} 
                            alt="Requester Signature" 
                            className="h-12 max-w-[130px] object-contain mx-auto bg-white rounded border border-slate-200 p-0.5" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignModal(true)}
                            className="text-[10px] text-[#005aa9] hover:underline block font-semibold cursor-pointer"
                          >
                            ✍️ เปลี่ยน/เซ็นสดใหม่
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowSignModal(true)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#005aa9] border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>✍️ เซ็นชื่อสดที่นี่</span>
                        </button>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-700 space-y-1 text-center w-full">
                      <div className="text-[10px] text-slate-500 font-medium">ชื่อผู้ขอเบิก:</div>
                      <div className="w-full">
                        <SearchableCombobox
                          value={recordedBy}
                          onChange={(val) => setRecordedBy(val)}
                          options={mergedStaff}
                          datalistId="dl-requesters"
                          placeholder="ชื่อผู้ขอเบิก"
                          allowCustom={true}
                          accentColor="blue"
                          inputClassName="text-center font-bold text-slate-900 text-xs py-1"
                        />
                      </div>
                      <div className="text-[10px] text-slate-500">วันที่: {entryDate || '...../...../..........'}</div>
                    </div>
                  </div>

                  {/* Slot 2: ผู้ตรวจสอบ (Reviewer) */}
                  <div className="p-3 flex flex-col justify-between space-y-2 bg-slate-50/50">
                    <div className="font-bold text-slate-700 text-[11px]">2. ผู้ตรวจสอบ (Reviewer)</div>
                    
                    <div className="min-h-[70px] flex flex-col items-center justify-center border-b border-dashed border-slate-300 pb-2 text-slate-400">
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold border border-slate-200">
                        รอการตรวจสอบหลังส่ง
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div>(....................................................)</div>
                      <div className="text-[10px] text-slate-400">ผู้ตรวจสอบ / วิศวกรโครงการ</div>
                    </div>
                  </div>

                  {/* Slot 3: ผู้อนุมัติ (Approver) */}
                  <div className="p-3 flex flex-col justify-between space-y-2 bg-slate-50/50">
                    <div className="font-bold text-slate-700 text-[11px]">3. ผู้อนุมัติ (Approver)</div>
                    
                    <div className="min-h-[70px] flex flex-col items-center justify-center border-b border-dashed border-slate-300 pb-2 text-slate-400">
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold border border-slate-200">
                        รอพิจารณาอนุมัติ
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div>(....................................................)</div>
                      <div className="text-[10px] text-slate-400">กรรมการผู้จัดการ / ฝ่ายบริหาร</div>
                    </div>
                  </div>

                  {/* Slot 4: ผู้จ่ายเงิน / การเงิน (Finance Officer) */}
                  <div className="p-3 flex flex-col justify-between space-y-2 bg-slate-50/50">
                    <div className="font-bold text-slate-700 text-[11px]">4. ผู้สั่งจ่าย (Finance PV)</div>
                    
                    <div className="min-h-[70px] flex flex-col items-center justify-center border-b border-dashed border-slate-300 pb-2 text-slate-400">
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold border border-slate-200">
                        รอดำเนินการสั่งจ่าย PV
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div>(....................................................)</div>
                      <div className="text-[10px] text-slate-400">เจ้าหน้าที่การเงินและบัญชี</div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="shrink-0 px-6 py-3.5 bg-slate-800 border-t border-slate-700 flex items-center justify-between flex-wrap gap-3 text-white">
            <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>เมื่อกดบันทึก เอกสารจะอยู่ในสถานะ <strong>"รอตรวจสอบ"</strong> และมีผลส่งต่อในระบบทันที</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 font-bold cursor-pointer transition-colors text-xs"
              >
                ปิดหน้าต่าง
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#009540] hover:bg-[#007e36] text-white font-bold shadow-md shadow-emerald-900/30 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.01] text-xs"
              >
                <Send className="w-4 h-4" />
                <span>{editingDisbursement ? 'บันทึกการแก้ไขเอกสาร' : 'บันทึกและส่งขออนุมัติเอกสาร (Submit)'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Signature Action Modal on Save & Submit */}
      <SignatureActionModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        onConfirm={handleConfirmSignatureAndSubmit}
        title="ลงนามสดผู้ขอเบิกเงิน (Requester Live Signature)"
        subtitle="ลงนามสดด้วยตนเองเพื่อยืนยันรายการขอตั้งเบิกและส่งต่อผู้มีอำนาจตรวจสอบ"
        signerName={recordedBy}
        signerRole="ผู้ขอเบิก (Requester)"
        docNo={dbmNo || 'DBM'}
        docTitle={`${expenseType || 'รายการขอเบิก'} - โครงการ ${project}`}
        amount={calculatedTotal}
        actionType="save"
        confirmButtonText="ยืนยันลายมือชื่อสดและบันทึกขอเบิก"
        initialSignature={requesterSignature}
      />
    </div>
  );
}
