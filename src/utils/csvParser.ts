import { Transaction, Disbursement } from '../types';

const THAI_MONTH_MAP: Record<string, number> = {
  'ม.ค.': 1, 'มกราคม': 1, 'jan': 1,
  'ก.พ.': 2, 'กุมภาพันธ์': 2, 'feb': 2,
  'มี.ค.': 3, 'มีนาคม': 3, 'mar': 3,
  'เม.ย.': 4, 'เมษายน': 4, 'apr': 4,
  'พ.ค.': 5, 'พฤษภาคม': 5, 'may': 5,
  'มิ.ย.': 6, 'มิถุนายน': 6, 'jun': 6,
  'ก.ค.': 7, 'กรกฎาคม': 7, 'jul': 7,
  'ส.ค.': 8, 'สิงหาคม': 8, 'aug': 8,
  'ก.ย.': 9, 'กันยายน': 9, 'sep': 9,
  'ต.ค.': 10, 'ตุลาคม': 10, 'oct': 10,
  'พ.ย.': 11, 'พฤศจิกายน': 11, 'nov': 11,
  'ธ.ค.': 12, 'ธันวาคม': 12, 'dec': 12
};

export function parseThaiDate(rawDate: string): { displayDate: string; isoDate: string } {
  if (!rawDate) return { displayDate: '', isoDate: '2026-01-01' };
  
  const clean = rawDate.trim();

  // 1. Check if rawDate is an Excel serial number (e.g. 45672)
  if (/^\d{5}$/.test(clean)) {
    const serial = parseInt(clean, 10);
    const date = new Date((serial - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      const day = date.getUTCDate();
      const month = date.getUTCMonth() + 1;
      const yearCE = date.getUTCFullYear();
      const yearBE = yearCE + 543;
      const dStr = day.toString().padStart(2, '0');
      const mStr = month.toString().padStart(2, '0');
      return {
        displayDate: `${day}/${month}/${yearBE}`,
        isoDate: `${yearCE}-${mStr}-${dStr}`
      };
    }
  }

  let day = 1;
  let month = 1;
  let yearBE = 2568;

  // 2. Check for ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(clean)) {
    const parts = clean.split('-');
    const parsedYear = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) || 1;
    day = parseInt(parts[2], 10) || 1;
    if (parsedYear > 2400) {
      yearBE = parsedYear;
    } else {
      yearBE = parsedYear + 543;
    }
  } 
  // 3. Check for Thai month format like "15 ม.ค. 68" or "15 มกราคม 2568"
  else if (/[ก-๙a-zA-Z]/.test(clean)) {
    const tokens = clean.split(/\s+/);
    if (tokens.length >= 3) {
      day = parseInt(tokens[0], 10) || 1;
      const monthToken = tokens[1].toLowerCase();
      month = THAI_MONTH_MAP[monthToken] || 1;
      let yr = parseInt(tokens[2], 10) || 2568;
      if (yr < 100) yr += 2500;
      yearBE = yr;
    }
  }
  // 4. Check for slash or dash: DD/MM/YYYY or DD-MM-YYYY
  else if (clean.includes('/') || clean.includes('-')) {
    const sep = clean.includes('/') ? '/' : '-';
    const parts = clean.split(sep);
    if (parts.length === 3) {
      day = parseInt(parts[0], 10) || 1;
      month = parseInt(parts[1], 10) || 1;
      let yr = parseInt(parts[2], 10) || 2568;
      if (yr < 100) yr += 2500;
      yearBE = yr;
    } else if (parts.length === 2) {
      day = parseInt(parts[0], 10) || 1;
      const mStr = parts[1];
      if (mStr.length >= 5) {
        month = parseInt(mStr.substring(0, mStr.length - 4), 10) || 1;
        yearBE = parseInt(mStr.substring(mStr.length - 4), 10) || 2569;
      }
    }
  }

  // Convert BE to CE
  let yearCE = yearBE > 2400 ? yearBE - 543 : yearBE;
  if (yearCE < 2000) yearCE = 2025; // fallback

  const dStr = Math.min(Math.max(day, 1), 31).toString().padStart(2, '0');
  const mStr = Math.min(Math.max(month, 1), 12).toString().padStart(2, '0');
  const isoDate = `${yearCE}-${mStr}-${dStr}`;
  const displayDate = `${parseInt(dStr, 10)}/${parseInt(mStr, 10)}/${yearBE}`;

  return { displayDate, isoDate };
}

export function parseMoney(val: string | undefined): number {
  if (!val) return 0;
  // remove quotes, spaces, commas
  const cleaned = val.replace(/["'\s,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Universal delimiter detector (supports Tabs from Excel paste, Commas, and Semicolons)
export function detectDelimiter(text: string): string {
  const sample = text.split(/\r?\n/).slice(0, 5).join('\n');
  const tabs = (sample.match(/\t/g) || []).length;
  const commas = (sample.match(/,/g) || []).length;
  const semis = (sample.match(/;/g) || []).length;

  if (tabs > commas && tabs > semis) return '\t';
  if (semis > commas && semis > tabs) return ';';
  return ',';
}

export function parseCSVLine(text: string, delimiter: string = ','): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === delimiter && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

// Multi-encoding file decoder (UTF-8, UTF-8 with BOM, and Windows-874 / CP874 from Thai Excel)
export async function decodeFileContent(
  file: File, 
  preferredEncoding?: string
): Promise<{ text: string; encoding: string }> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // 1. Check for UTF-8 BOM (0xEF, 0xBB, 0xBF)
  if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    const text = new TextDecoder('utf-8').decode(buffer.slice(3));
    return { text, encoding: 'UTF-8 with BOM' };
  }

  // 2. Explicit preferred encoding
  if (preferredEncoding && preferredEncoding !== 'auto') {
    try {
      const decoder = new TextDecoder(preferredEncoding);
      return { text: decoder.decode(buffer), encoding: preferredEncoding };
    } catch {
      // fallback to auto
    }
  }

  // 3. Try strict UTF-8
  try {
    const strictUtf8 = new TextDecoder('utf-8', { fatal: true });
    const text = strictUtf8.decode(buffer);
    return { text, encoding: 'UTF-8' };
  } catch {
    // 4. UTF-8 failed, decode with Windows-874 (Thai Excel ANSI default in Thailand)
    try {
      const thaiDecoder = new TextDecoder('windows-874');
      const text = thaiDecoder.decode(buffer);
      return { text, encoding: 'Windows-874 (Thai Excel ANSI)' };
    } catch {
      const text = new TextDecoder('utf-8').decode(buffer);
      return { text, encoding: 'UTF-8 (fallback)' };
    }
  }
}

export interface UpsertResult<T> {
  added: number;
  updated: number;
  unchanged: number;
  total: number;
  result: T[];
  updatedDocNos: string[];
  addedDocNos: string[];
}

// Check whether CSV content is Ledger (สมุดบัญชี) or Disbursement (ระบบเบิกจ่าย)
export function detectCSVType(csvText: string): 'ledger' | 'disbursement' | 'unknown' {
  let clean = csvText;
  if (clean.charCodeAt(0) === 0xFEFF) clean = clean.slice(1);
  const firstLines = clean.slice(0, 1500).toLowerCase();
  
  // Check for disbursement keywords
  if (
    firstLines.includes('ผู้บันทึก') ||
    firstLines.includes('dbm') ||
    firstLines.includes('วันครบกำหนดจ่าย') ||
    firstLines.includes('ผู้ขอเบิก') ||
    firstLines.includes('ยอดเงินโอน') ||
    firstLines.includes('เลขที่เอกสารอ้างอิง') ||
    firstLines.includes('รูปแบบการจ่าย') ||
    firstLines.includes('ใบขอเบิก')
  ) {
    return 'disbursement';
  }

  // Check for ledger keywords
  if (
    firstLines.includes('สมุด') ||
    firstLines.includes('รายรับ') ||
    firstLines.includes('รายจ่าย') ||
    firstLines.includes('ชื่อบริษัท') ||
    firstLines.includes('เดบิต') ||
    firstLines.includes('เครดิต') ||
    firstLines.includes('คงเหลือ')
  ) {
    return 'ledger';
  }

  return 'ledger'; // fallback default
}

export function parseLedgerCSV(csvText: string): Transaction[] {
  let cleanText = csvText;
  if (cleanText.charCodeAt(0) === 0xFEFF) {
    cleanText = cleanText.slice(1);
  }

  const delimiter = detectDelimiter(cleanText);
  const lines = cleanText.split(/\r?\n/);
  const transactions: Transaction[] = [];

  // Dynamic header mapping to support varied column arrangements
  let colMap = {
    company: 0,
    date: 1,
    docNo: 2,
    description: 3,
    account: 4,
    project: 5,
    category: 6,
    debit: 7,
    credit: 8,
    remarks: 9,
    runningBalance: 10
  };

  let startIndex = 0;

  // Inspect first 3 lines for headers
  for (let h = 0; h < Math.min(3, lines.length); h++) {
    const rawLine = lines[h].trim();
    if (!rawLine) continue;
    const headerCols = parseCSVLine(rawLine, delimiter).map(c => c.toLowerCase().trim());
    
    // Check if this line looks like a header
    const hasDate = headerCols.some(c => c.includes('วัน') || c.includes('date'));
    const hasDebitCredit = headerCols.some(c => c.includes('เดบิต') || c.includes('เครดิต') || c.includes('รายรับ') || c.includes('รายจ่าย') || c.includes('debit') || c.includes('credit'));

    if (hasDate && hasDebitCredit) {
      headerCols.forEach((col, idx) => {
        if (col.includes('บริษัท') || col.includes('company')) colMap.company = idx;
        else if (col.includes('วัน') || col.includes('date')) colMap.date = idx;
        else if (col.includes('เลขที่') || col.includes('เอกสาร') || col.includes('doc')) colMap.docNo = idx;
        else if (col.includes('รายการ') || col.includes('description') || col.includes('รายละเอียด')) colMap.description = idx;
        else if (col.includes('บัญชี') || col.includes('account')) colMap.account = idx;
        else if (col.includes('โครงการ') || col.includes('project')) colMap.project = idx;
        else if (col.includes('หมวดหมู่') || col.includes('category')) colMap.category = idx;
        else if (col.includes('เดบิต') || col.includes('รายรับ') || col.includes('debit') || col.includes('income')) colMap.debit = idx;
        else if (col.includes('เครดิต') || col.includes('รายจ่าย') || col.includes('credit') || col.includes('expense')) colMap.credit = idx;
        else if (col.includes('หมายเหตุ') || col.includes('remark') || col.includes('note')) colMap.remarks = idx;
        else if (col.includes('คงเหลือ') || col.includes('balance')) colMap.runningBalance = idx;
      });
      startIndex = h + 1;
      break;
    }
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('ชื่อบริษัท') || line.startsWith(',,,,,,') || line.toLowerCase().includes('ผู้บันทึก')) continue;

    const cols = parseCSVLine(line, delimiter);
    if (cols.length < 4) continue;

    const company = cols[colMap.company] || 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด';
    const rawDate = cols[colMap.date] || '';
    const { displayDate, isoDate } = parseThaiDate(rawDate);
    const docNo = cols[colMap.docNo] === '-' ? '' : (cols[colMap.docNo] || '');
    const description = cols[colMap.description] || '';
    const account = cols[colMap.account] || '';
    const project = cols[colMap.project] || '(00)บุรีรัมย์';
    const category = cols[colMap.category] || 'ทั่วไป';
    const debit = parseMoney(cols[colMap.debit]); // รายรับ
    const credit = parseMoney(cols[colMap.credit]); // รายจ่าย
    const remarks = cols[colMap.remarks] || '';
    const runningBalance = parseMoney(cols[colMap.runningBalance]);

    if (debit === 0 && credit === 0 && !description) continue;

    transactions.push({
      id: `tx-${i}-${Math.random().toString(36).substring(2, 7)}`,
      company,
      date: displayDate,
      isoDate,
      docNo,
      description,
      account,
      project,
      category,
      debit,
      credit,
      remarks,
      runningBalance,
      status: 'cleared'
    });
  }

  return transactions;
}

// Download helper with UTF-8 BOM so Excel opens Thai properly
export function downloadCSVFile(filename: string, content: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getLedgerCSVTemplate(): string {
  return [
    'ชื่อบริษัท,วันที่,เลขที่เอกสาร,รายการ,บัญชี,โครงการ,หมวดหมู่,เดบิต (รายรับ),เครดิต (รายจ่าย),หมายเหตุ,ยอดคงเหลือ',
    'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด,15/01/2568,PV-6801-001,ค่าปูนซีเมนต์ผสมเสร็จ 20 คิว,BBL #297-3-033893 (BTC กระแสรายวัน),(37)โครงการก่อสร้างทางรถไฟ บ้านไผ่ หนองพอก,ค่าวัสดุก่อสร้าง,0,"45,000.00",ชำระตามใบสั่งซื้อ PO-0192,',
    'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด,16/01/2568,RV-6801-001,รับเงินค่างวดงานที่ 3,BBL #297-3-033893 (BTC กระแสรายวัน),(33)ทล.202 อ.สุวรรณภูมิ-ยโสธร,รายรับจากโครงการก่อสร้าง,"500,000.00",0,รับเงินโอนจากกรมทางหลวง,'
  ].join('\r\n');
}

export function getDisbursementCSVTemplate(): string {
  return [
    'ผู้บันทึก ,เลขที่เอกสาร,เลขที่เอกสารอ้างอิง,บริษัท ,วันที่ลงข้อมุล ,วันครบกำหนดจ่าย,ประเภทงาน/รายจ่าย,ชื่อผู้รับเงิน,บัญชีธนาคาร ,โครงการ,รูปแบบการจ่าย,หมายเหตุ,รายการ / Description 1,จำนวนเงิน 1 ,รายการ / Description 2,จำนวนเงิน 2,รายการ / Description 3,จำนวนเงิน 3,รายการ / Description 4,จำนวนเงิน 4,รายการ / Description 5,จำนวนเงิน 5,รายการ / Description 6,จำนวนเงิน 6,รายการ / Description 7,จำนวนเงิน 7,รายการ / Description 8,จำนวนเงิน 8,รายการ / Description 9,จำนวนเงิน 9,รายการ / Description 10,จำนวนเงิน 10,ยอดเงินรวม,เลขที่บัญชี,เลขที่เช็ค,วันที่จ่ายเงิน,ยอดเงินโอน,ค่าธรรเนียม,ลิงก์เอกสารการโอน',
    'น.ส.ปวีณา ใยอุ่น / น.ส.ปวีณา ใยอุ่น / น.ส.อุไร  นิกูลรัมย์ / น.ส.อุไร  นิกูลรัมย์,DBM25010004,HP0005993,BTC,6/1/2568,6/1/2568,จ่ายชำระ หนี้เงินยืม,นายสมศักดิ์ วงศ์ไทย,กรุงไทย เลขที่ 123-4-56789-0,(00)บุรีรัมย์,โอน,ชำระเงินยืมทดรองจ่าย,เคลียร์เงินยืมหน้างาน,"30,800.00",,,,,,,,,,,,,,,,,,,"30,800.00",BBL #297-3-033893,-,6/1/2568,"30,800.00",0,https://drive.google.com',
    'น.ส.ปวีณา ใยอุ่น / น.ส.ปวีณา ใยอุ่น,DBM25010020,-,BTCP,13/1/2568,15/1/2568,ภาษีและค่าธรรมเนียม,กรมสรรพากร,100-01-001 กรมสรรพากร,(00)บุรีรัมย์,โอน,รอตัดจ่ายตามรอบ,จ่ายชำระ ภงด.3 เดือน 12/2567,712.09,ค่าธรรมเนียมธนาคาร,15.00,,,,,,,,,,,,,,,,727.09,,,,,,,'
  ].join('\r\n');
}

// Upsert logic for Transactions (สมุดรายรับ-รายจ่าย)
export function upsertTransactions(
  currentTransactions: Transaction[],
  incomingTransactions: Transaction[]
): UpsertResult<Transaction> {
  const result: Transaction[] = [...currentTransactions];
  let added = 0;
  let updated = 0;
  let unchanged = 0;
  const updatedDocNos: string[] = [];
  const addedDocNos: string[] = [];

  incomingTransactions.forEach((incoming) => {
    // 1. Match by docNo (if available and not generic)
    let matchIndex = -1;
    if (incoming.docNo && incoming.docNo.trim() !== '' && incoming.docNo !== '-') {
      const cleanIncomingDoc = incoming.docNo.trim().toLowerCase();
      matchIndex = result.findIndex(
        (existing) => existing.docNo && existing.docNo.trim().toLowerCase() === cleanIncomingDoc
      );
    }

    // 2. Fallback match by exact date + debit + credit + description
    if (matchIndex === -1) {
      matchIndex = result.findIndex((existing) => {
        const sameDate = existing.date === incoming.date || existing.isoDate === incoming.isoDate;
        const sameDebit = Math.abs((existing.debit || 0) - (incoming.debit || 0)) < 0.01;
        const sameCredit = Math.abs((existing.credit || 0) - (incoming.credit || 0)) < 0.01;
        const sameDesc = existing.description?.trim() === incoming.description?.trim();
        return sameDate && sameDebit && sameCredit && sameDesc;
      });
    }

    if (matchIndex !== -1) {
      // Record already exists -> UPDATE (Preserve existing ID, reconciliation status, and custom tags/links)
      const existing = result[matchIndex];
      const hasChanged =
        existing.date !== incoming.date ||
        existing.debit !== incoming.debit ||
        existing.credit !== incoming.credit ||
        existing.account !== incoming.account ||
        existing.project !== incoming.project ||
        existing.category !== incoming.category ||
        existing.company !== incoming.company ||
        existing.description !== incoming.description ||
        existing.remarks !== incoming.remarks;

      if (hasChanged) {
        updated++;
        if (incoming.docNo) updatedDocNos.push(incoming.docNo);
        result[matchIndex] = {
          ...incoming,
          id: existing.id, // Preserve existing internal ID
          createdAt: existing.createdAt,
          // Preserve any manual reconciliation status or PV links if already verified
          status: existing.status === 'reconciled' ? 'reconciled' : (incoming.status || existing.status),
          reconciledAt: existing.reconciledAt,
          reconciledBy: existing.reconciledBy,
          reconciliationNotes: existing.reconciliationNotes,
          disbursementId: existing.disbursementId || incoming.disbursementId,
          pvNo: existing.pvNo || incoming.pvNo,
          auditCertificateId: existing.auditCertificateId || incoming.auditCertificateId
        };
      } else {
        unchanged++;
      }
    } else {
      // Record is brand new -> INSERT
      added++;
      if (incoming.docNo) addedDocNos.push(incoming.docNo);
      result.push({
        ...incoming,
        id: incoming.id || `tx_imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString()
      });
    }
  });

  return {
    added,
    updated,
    unchanged,
    total: incomingTransactions.length,
    result,
    updatedDocNos,
    addedDocNos
  };
}

// Upsert logic for Disbursements (ระบบเบิกจ่าย & จ่ายเงิน)
export function upsertDisbursements(
  currentDisbursements: Disbursement[],
  incomingDisbursements: Disbursement[]
): UpsertResult<Disbursement> {
  const result: Disbursement[] = [...currentDisbursements];
  let added = 0;
  let updated = 0;
  let unchanged = 0;
  const updatedDocNos: string[] = [];
  const addedDocNos: string[] = [];

  incomingDisbursements.forEach((incoming) => {
    // 1. Match by dbmNo (primary key)
    let matchIndex = -1;
    if (incoming.dbmNo && incoming.dbmNo.trim() !== '' && incoming.dbmNo !== '-') {
      const cleanDbm = incoming.dbmNo.trim().toLowerCase();
      matchIndex = result.findIndex(
        (existing) => existing.dbmNo && existing.dbmNo.trim().toLowerCase() === cleanDbm
      );
    }

    // 2. Fallback match by refDocNo
    if (matchIndex === -1 && incoming.refDocNo && incoming.refDocNo.trim() !== '' && incoming.refDocNo !== '-') {
      const cleanRef = incoming.refDocNo.trim().toLowerCase();
      matchIndex = result.findIndex(
        (existing) => existing.refDocNo && existing.refDocNo.trim().toLowerCase() === cleanRef
      );
    }

    if (matchIndex !== -1) {
      // Existing disbursement found -> UPDATE (Merge latest info, preserve signatures and attachments)
      const existing = result[matchIndex];
      const hasChanged =
        existing.payeeName !== incoming.payeeName ||
        existing.totalAmount !== incoming.totalAmount ||
        existing.status !== incoming.status ||
        existing.paymentDate !== incoming.paymentDate ||
        existing.transferAmount !== incoming.transferAmount ||
        existing.payerAccount !== incoming.payerAccount ||
        existing.chequeNo !== incoming.chequeNo ||
        existing.documentLink !== incoming.documentLink ||
        existing.remarks !== incoming.remarks ||
        existing.recordedBy !== incoming.recordedBy ||
        existing.financeRecordedBy !== incoming.financeRecordedBy;

      if (hasChanged) {
        updated++;
        if (incoming.dbmNo) updatedDocNos.push(incoming.dbmNo);
        result[matchIndex] = {
          ...incoming,
          id: existing.id, // Preserve existing internal ID
          // Preserve digital signatures and verification stamps
          requesterSignature: existing.requesterSignature || incoming.requesterSignature,
          requesterSignedAt: existing.requesterSignedAt || incoming.requesterSignedAt,
          reviewerSignature: existing.reviewerSignature || incoming.reviewerSignature,
          reviewerName: existing.reviewerName || incoming.reviewerName,
          reviewedAt: existing.reviewedAt || incoming.reviewedAt,
          reviewerNotes: existing.reviewerNotes || incoming.reviewerNotes,
          approverSignature: existing.approverSignature || incoming.approverSignature,
          approverName: existing.approverName || incoming.approverName,
          approvedAt: existing.approvedAt || incoming.approvedAt,
          financeSignature: existing.financeSignature || incoming.financeSignature,
          paidAt: existing.paidAt || incoming.paidAt,
          auditCertificateId: existing.auditCertificateId || incoming.auditCertificateId,
          attachments: existing.attachments && existing.attachments.length > 0 ? existing.attachments : incoming.attachments,
          // If already paid in system, keep status paid unless new record is explicitly paid/cancelled
          status: incoming.status === 'paid' ? 'paid' : (existing.status === 'paid' ? 'paid' : incoming.status),
          isSyncedToLedger: existing.isSyncedToLedger || incoming.isSyncedToLedger,
          // Keep/update recordedBy and financeRecordedBy
          recordedBy: incoming.recordedBy || existing.recordedBy,
          financeRecordedBy: incoming.financeRecordedBy !== undefined ? incoming.financeRecordedBy : existing.financeRecordedBy
        };
      } else {
        unchanged++;
      }
    } else {
      // Brand new voucher -> INSERT
      added++;
      if (incoming.dbmNo) addedDocNos.push(incoming.dbmNo);
      result.push({
        ...incoming,
        id: incoming.id || `dbm_imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      });
    }
  });

  return {
    added,
    updated,
    unchanged,
    total: incomingDisbursements.length,
    result,
    updatedDocNos,
    addedDocNos
  };
}

