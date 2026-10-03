import { Transaction, ProjectStats, AccountBalance, MonthlyFinancialSummary } from '../types';

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function isInitialBalanceTransaction(tx: Transaction): boolean {
  const desc = (tx.description || '').toLowerCase();
  const cat = (tx.category || '').toLowerCase();
  return cat.includes('ยอดตั้งต้น') || desc.includes('ยอดตั้งต้น');
}

export function isTransferTransaction(tx: Transaction): boolean {
  const desc = (tx.description || '').toLowerCase();
  const cat = (tx.category || '').toLowerCase();
  const text = `${desc} ${cat}`;
  return (
    cat.includes('โอนระหว่างบัญชี') ||
    cat.includes('โอนเงินระหว่างบัญชี') ||
    desc.includes('โอนระหว่างบัญชี') ||
    desc.includes('โอนเงินระหว่างบัญชี') ||
    desc.includes('โอนมาจาก') ||
    desc.includes('โอนไป') ||
    desc.includes('รับจาก ktb') ||
    desc.includes('รับจาก bbl')
  );
}

export function isLoanOrFinancingTransaction(tx: Transaction): boolean {
  const desc = (tx.description || '').toLowerCase();
  const cat = (tx.category || '').toLowerCase();
  const text = `${desc} ${cat}`;
  return (
    cat.includes('เงินยืม') ||
    cat.includes('กู้ยืม') ||
    cat.includes('คืนเงินยืม') ||
    desc.includes('เงินยืม') ||
    desc.includes('กู้ยืม') ||
    desc.includes('คืนเงินยืม') ||
    desc.includes('ยืมเงิน') ||
    desc.includes('เงินทดรอง') ||
    cat.includes('กองทุน') ||
    desc.includes('ซื้อ/ขายกองทุน')
  );
}

export function categorizeTransaction(tx: Transaction): string {
  const desc = (tx.description || '').toLowerCase();
  const cat = (tx.category || '').toLowerCase();
  const fullText = `${desc} ${cat}`;

  if (fullText.includes('ยอดตั้งต้น')) return 'ยอดตั้งต้น';
  if (fullText.includes('โอนเงินระหว่างบัญชี') || fullText.includes('โอนระหว่างบัญชี') || fullText.includes('โอนมาจาก') || fullText.includes('รับจาก')) return 'โอนเงินระหว่างบัญชี';
  if (fullText.includes('กองทุน')) return 'ซื้อ/ขายกองทุน';
  if (fullText.includes('เงินยืม') || fullText.includes('กู้ยืม') || fullText.includes('คืนเงินยืม')) return 'เงินกู้ยืมและเงินหมุนเวียน';
  if (fullText.includes('เงินเดือน') || fullText.includes('สำรองเงินเดือน')) return 'เงินเดือนและค่าตอบแทน';
  if (fullText.includes('ภงด') || fullText.includes('ภ.ง.ด') || fullText.includes('ภพ.30') || fullText.includes('ภ.พ.30') || fullText.includes('สรรพากร') || fullText.includes('ภาษี')) return 'ภาษีและสรรพากร';
  if (fullText.includes('ประกันสังคม') || fullText.includes('กยศ')) return 'ประกันสังคมและกยศ.';
  if (fullText.includes('น้ำมัน') || fullText.includes('fleet card') || fullText.includes('ดีเซล') || fullText.includes('ไฮดรอลิค') || fullText.includes('หล่อลื่น')) return 'ค่าน้ำมันและเชื้อเพลิง';
  if (fullText.includes('ไฟฟ้า') || fullText.includes('น้ำประปา') || fullText.includes('โทรศัพท์') || fullText.includes('3bb') || fullText.includes('อินเทอร์เน็ต') || fullText.includes('เน็ทเวอร์ค')) return 'ค่าสาธารณูปโภคและสื่อสาร';
  if (fullText.includes('ค่าผลงาน') || fullText.includes('รับเหมา') || fullText.includes('ผู้รับเหมา') || fullText.includes('ตอกเสาเข็ม') || fullText.includes('แบริเออร์') || fullText.includes('กำแพงกันดิน') || fullText.includes('mse wall') || fullText.includes('box culvert') || fullText.includes('สะพาน') || fullText.includes('pavement') || fullText.includes('เทถนน') || fullText.includes('ขุดดิน') || fullText.includes('บดอัดดิน')) return 'ค่าจ้างผู้รับเหมา/ผลงานก่อสร้าง';
  if (fullText.includes('วัสดุก่อสร้าง') || fullText.includes('คอนกรีต') || fullText.includes('เหล็ก') || fullText.includes('ท่อ') || fullText.includes('บ่อพัก') || fullText.includes('box beam') || fullText.includes('หินคลุก') || fullText.includes('ทราย') || fullText.includes('ยาง') || fullText.includes('asphalt') || fullText.includes('ปูนผง') || fullText.includes('ไวร์เมช')) return 'ค่าวัสดุก่อสร้างและโครงสร้าง';
  if (fullText.includes('อะไหล่') || fullText.includes('ซ่อม') || fullText.includes('อู่ซ่อม') || fullText.includes('ยางรถ') || fullText.includes('บำรุงรักษา')) return 'ค่าอะไหล่และซ่อมบำรุงเครื่องจักร';
  if (fullText.includes('ธรรมเนียม') || fullText.includes('com.l/g') || fullText.includes('com lg') || fullText.includes('aval') || fullText.includes('เช็ค') || fullText.includes('ค้ำประกัน') || fullText.includes('ดอกเบี้ย od') || fullText.includes('ดอกเบี้ย')) return 'ค่าธรรมเนียมธนาคารและดอกเบี้ย';
  if (fullText.includes('เงินประกันผลงาน') || fullText.includes('คืนเงินประกัน')) return 'คืนเงินประกันผลงาน (Retention)';
  if (fullText.includes('รับชำระ') || fullText.includes('รับค่า') || fullText.includes('รับเงิน') || fullText.includes('ตั๋ว p/n') || fullText.includes('ค่างวด')) return 'รายรับค่างวดงาน/บริการ';
  return tx.category || 'ค่าใช้จ่ายทั่วไป';
}

export function computeOverallStats(transactions: Transaction[]) {
  let totalIncome = 0;
  let totalExpense = 0;
  let interTransferIn = 0;
  let interTransferOut = 0;
  let initialBalance = 0;
  let totalLoanIn = 0;
  let totalLoanOut = 0;

  transactions.forEach(t => {
    const isInitial = isInitialBalanceTransaction(t);
    const isTransfer = isTransferTransaction(t);
    const isLoan = isLoanOrFinancingTransaction(t);
    
    if (isInitial) {
      initialBalance += t.debit;
    } else if (isTransfer) {
      interTransferIn += t.debit;
      interTransferOut += t.credit;
    } else if (isLoan) {
      totalLoanIn += t.debit;
      totalLoanOut += t.credit;
    } else {
      totalIncome += t.debit;
      totalExpense += t.credit;
    }
  });

  const netOperatingProfit = totalIncome - totalExpense;
  
  return {
    totalIncome,
    totalExpense,
    netOperatingProfit,
    initialBalance,
    interTransferIn,
    interTransferOut,
    totalLoanIn,
    totalLoanOut,
    totalTransactions: transactions.length,
  };
}

export function computeProjectSummaries(transactions: Transaction[]): ProjectStats[] {
  const projectMap = new Map<string, {
    totalIncome: number;
    totalExpense: number;
    categories: Map<string, number>;
    incomeCategories: Map<string, number>;
    txCount: number;
  }>();

  transactions.forEach(t => {
    let pName = (t.project || '(00)บุรีรัมย์').trim();
    if (!pName) pName = '(00)บุรีรัมย์';

    if (!projectMap.has(pName)) {
      projectMap.set(pName, {
        totalIncome: 0,
        totalExpense: 0,
        categories: new Map(),
        incomeCategories: new Map(),
        txCount: 0,
      });
    }

    const current = projectMap.get(pName)!;
    const isInitial = isInitialBalanceTransaction(t);
    const isTransfer = isTransferTransaction(t);
    const isLoan = isLoanOrFinancingTransaction(t);

    // Only genuine construction income and costs are counted in project financial summaries
    if (!isInitial && !isTransfer && !isLoan) {
      current.totalIncome += t.debit;
      current.totalExpense += t.credit;

      const group = categorizeTransaction(t);
      if (t.credit > 0) {
        current.categories.set(group, (current.categories.get(group) || 0) + t.credit);
      }
      if (t.debit > 0) {
        current.incomeCategories.set(group, (current.incomeCategories.get(group) || 0) + t.debit);
      }
    }
    current.txCount += 1;
  });

  const list: ProjectStats[] = [];

  projectMap.forEach((val, pName) => {
    let code = '00';
    let cleanName = pName;
    const match = pName.match(/\((\d+)\)(.*)/);
    if (match) {
      code = match[1];
      cleanName = match[2].trim() || pName;
    }

    const expenseArray = Array.from(val.categories.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: val.totalExpense > 0 ? (amount / val.totalExpense) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);

    const incomeArray = Array.from(val.incomeCategories.entries()).map(([category, amount]) => ({
      category,
      amount,
    })).sort((a, b) => b.amount - a.amount);

    list.push({
      projectName: pName,
      cleanName,
      code,
      totalIncome: val.totalIncome,
      totalExpense: val.totalExpense,
      netMargin: val.totalIncome - val.totalExpense,
      expenseByCategory: expenseArray,
      incomeByCategory: incomeArray,
      transactionCount: val.txCount,
    });
  });

  return list.sort((a, b) => b.totalExpense - a.totalExpense);
}

export function computeAccountBalances(transactions: Transaction[]): AccountBalance[] {
  const accountMap = new Map<string, {
    company: string;
    totalIn: number;
    totalOut: number;
    latestBal: number;
  }>();

  transactions.forEach(t => {
    const acc = (t.account || 'บัญชีเงินสด/ทั่วไป').trim();
    if (!accountMap.has(acc)) {
      accountMap.set(acc, {
        company: t.company,
        totalIn: 0,
        totalOut: 0,
        latestBal: 0,
      });
    }

    const current = accountMap.get(acc)!;
    current.totalIn += t.debit;
    current.totalOut += t.credit;
    if (t.runningBalance !== undefined && t.runningBalance !== null) {
      current.latestBal = t.runningBalance;
    }
  });

  const list: AccountBalance[] = [];

  accountMap.forEach((val, accName) => {
    let bankCode = 'ธนาคาร';
    let accNum = '';
    let accType = 'ออมทรัพย์';

    if (accName.includes('KTB')) bankCode = 'กรุงไทย (KTB)';
    else if (accName.includes('BBL')) bankCode = 'กรุงเทพ (BBL)';

    if (accName.includes('กองทุน')) accType = 'กองทุนเปิด KTSV';
    else if (accName.includes('กระแส')) accType = 'กระแสรายวัน / OD';

    const numMatch = accName.match(/(\d{3,4}-\d{1,2}-\d{4,6}-\d{1})/);
    if (numMatch) {
      accNum = numMatch[1];
    }

    const calculatedBalance = val.totalIn - val.totalOut;

    list.push({
      accountName: accName,
      bankCode,
      accountNumber: accNum || accName.substring(0, 15),
      company: val.company,
      type: accType,
      totalIncome: val.totalIn,
      totalExpense: val.totalOut,
      calculatedBalance,
      latestBalance: val.latestBal || calculatedBalance,
      isOverdraft: calculatedBalance < 0,
    });
  });

  return list.sort((a, b) => b.totalIncome - a.totalIncome);
}

export function computeMonthlyFinancials(transactions: Transaction[]): MonthlyFinancialSummary[] {
  const monthMap = new Map<string, {
    income: number;
    expense: number;
    transfer: number;
    displayMonth: string;
  }>();

  const thaiMonths = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  transactions.forEach(t => {
    if (!t.isoDate) return;
    const parts = t.isoDate.split('-');
    if (parts.length < 2) return;
    const yearCE = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const yearBE = yearCE + 543;
    const monthKey = `${yearCE}-${parts[1]}`;
    const displayMonth = `${thaiMonths[month]} ${yearBE.toString().slice(-2)}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        income: 0,
        expense: 0,
        transfer: 0,
        displayMonth,
      });
    }

    const m = monthMap.get(monthKey)!;
    const isInitial = isInitialBalanceTransaction(t);
    const isTransfer = isTransferTransaction(t);
    const isLoan = isLoanOrFinancingTransaction(t);

    if (isTransfer) {
      m.transfer += t.debit;
    } else if (!isInitial && !isLoan) {
      m.income += t.debit;
      m.expense += t.credit;
    }
  });

  const sortedKeys = Array.from(monthMap.keys()).sort();
  let cumulative = 0;

  return sortedKeys.map(key => {
    const data = monthMap.get(key)!;
    const net = data.income - data.expense;
    cumulative += net;
    return {
      monthKey: key,
      displayMonth: data.displayMonth,
      income: data.income,
      expense: data.expense,
      netCashFlow: net,
      interTransfer: data.transfer,
      runningBalance: cumulative,
    };
  });
}

export function computeExpenseCategories(transactions: Transaction[]) {
  const catMap = new Map<string, number>();

  transactions.forEach(t => {
    const isTransfer = isTransferTransaction(t);
    const isInitial = isInitialBalanceTransaction(t);
    const isLoan = isLoanOrFinancingTransaction(t);
    if (t.credit > 0 && !isTransfer && !isInitial && !isLoan) {
      const group = categorizeTransaction(t);
      catMap.set(group, (catMap.get(group) || 0) + t.credit);
    }
  });

  const total = Array.from(catMap.values()).reduce((sum, v) => sum + v, 0);

  return Array.from(catMap.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: total > 0 ? (amount / total) * 100 : 0,
  })).sort((a, b) => b.amount - a.amount);
}

export function calculateFinancialSummary(transactions: Transaction[]) {
  const stats = computeOverallStats(transactions);
  const accounts = computeAccountBalances(transactions);
  const finalBalance = accounts.reduce((sum, a) => sum + (a.latestBalance || a.calculatedBalance), 0);

  return {
    ...stats,
    finalBalance,
  };
}

export function exportTransactionsToCSV(transactions: Transaction[], filename: string = 'ledger_export.csv') {
  const headers = ['วันที่', 'เลขที่เอกสาร', 'บริษัท', 'บัญชีธนาคาร', 'รายละเอียดรายการ', 'โครงการ', 'หมวดหมู่', 'รายรับ (Dr.)', 'รายจ่าย (Cr.)', 'คงเหลือ', 'หมายเหตุ'];
  
  const rows = transactions.map(t => [
    `"${t.date || ''}"`,
    `"${(t.docNo || '').replace(/"/g, '""')}"`,
    `"${(t.company || '').replace(/"/g, '""')}"`,
    `"${(t.account || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${(t.project || '').replace(/"/g, '""')}"`,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    t.debit || 0,
    t.credit || 0,
    t.runningBalance !== undefined ? t.runningBalance : '',
    `"${(t.remarks || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parse any date string (ISO 'YYYY-MM-DD', Thai Buddhist era 'D/M/2568' or 'D/M/YYYY', etc.)
 * into a comparable numeric timestamp or sort score.
 */
export function parseDateScore(dateStr?: string, fallbackKey?: string): number {
  if (!dateStr && !fallbackKey) return 0;
  
  if (dateStr) {
    const s = dateStr.trim();
    if (s && s !== '-') {
      // 1. Dash format: "YYYY-MM-DD" or "DD-MM-YYYY"
      if (s.includes('-')) {
        const parts = s.split(/[-T\s]/);
        if (parts.length >= 3) {
          let p0 = parseInt(parts[0], 10);
          let p1 = parseInt(parts[1], 10);
          let p2 = parseInt(parts[2], 10);

          if (!isNaN(p0) && !isNaN(p1) && !isNaN(p2)) {
            let year = p0;
            let month = p1 - 1;
            let day = p2;

            // If format is DD-MM-YYYY
            if (p2 > 1000 || (p0 <= 31 && p2 > 31)) {
              day = p0;
              month = p1 - 1;
              year = p2;
            }

            if (year > 2400) year -= 543;
            else if (year < 100) year += 2000;

            const d = new Date(year, month, day);
            if (!isNaN(d.getTime())) return d.getTime();
          }
        }
      }

      // 2. Slash format: "D/M/YYYY" or "DD/MM/YYYY" or "YYYY/MM/DD"
      if (s.includes('/')) {
        const parts = s.split('/');
        if (parts.length === 3) {
          let p0 = parseInt(parts[0], 10);
          let p1 = parseInt(parts[1], 10);
          let p2 = parseInt(parts[2], 10);

          if (!isNaN(p0) && !isNaN(p1) && !isNaN(p2)) {
            let day = p0;
            let month = p1 - 1;
            let year = p2;

            // If format is YYYY/MM/DD
            if (p0 > 1000 || (p0 > 31 && p2 <= 31)) {
              year = p0;
              month = p1 - 1;
              day = p2;
            }

            if (year > 2400) year -= 543;
            else if (year < 100) year += 2000;

            const d = new Date(year, month, day);
            if (!isNaN(d.getTime())) return d.getTime();
          }
        }
      }

      // 3. Direct Date parse
      const parsed = Date.parse(s);
      if (!isNaN(parsed)) return parsed;
    }
  }

  // 4. Fallback using document sequence number e.g. "DBM25010098" -> 25010098 or "tx-123"
  if (fallbackKey) {
    const num = fallbackKey.replace(/\D/g, '');
    if (num) return parseInt(num, 10);
  }

  return 0;
}

/**
 * Compare two disbursement items from newest to oldest.
 */
export function compareDisbursementsDesc(
  a: { entryDate?: string; paymentDate?: string; dueDate?: string; dbmNo?: string; id?: string },
  b: { entryDate?: string; paymentDate?: string; dueDate?: string; dbmNo?: string; id?: string }
): number {
  const dateA = a.entryDate || a.paymentDate || a.dueDate || '';
  const dateB = b.entryDate || b.paymentDate || b.dueDate || '';
  const scoreA = parseDateScore(dateA, a.dbmNo || a.id);
  const scoreB = parseDateScore(dateB, b.dbmNo || b.id);
  
  if (scoreB !== scoreA) {
    return scoreB - scoreA;
  }
  // Secondary sort by document number descending (e.g. DBM25010098 > DBM25010002)
  return (b.dbmNo || b.id || '').localeCompare(a.dbmNo || a.id || '', undefined, { numeric: true });
}

/**
 * Compare two transactions from newest to oldest.
 */
export function compareTransactionsDesc(
  a: { isoDate?: string; date?: string; docNo?: string; id?: string },
  b: { isoDate?: string; date?: string; docNo?: string; id?: string }
): number {
  const scoreA = parseDateScore(a.isoDate || a.date, a.docNo || a.id);
  const scoreB = parseDateScore(b.isoDate || b.date, b.docNo || b.id);
  
  if (scoreB !== scoreA) {
    return scoreB - scoreA;
  }
  return (b.docNo || b.id || '').localeCompare(a.docNo || a.id || '', undefined, { numeric: true });
}

/**
 * Map a disbursement's expenseType/description to the standardized GL Accounting category.
 * Used for automated sync from Disbursement / Payment Voucher to General Ledger (Transactions).
 */
export function mapDisbursementToAccountingCategory(expenseType: string = '', description: string = ''): string {
  const combined = `${expenseType} ${description}`.toLowerCase();

  if (combined.includes('แรงงาน') || combined.includes('ค่าจ้าง') || combined.includes('เงินเดือน') || combined.includes('ค่าข้าว') || combined.includes('สำรองเงินเดือน') || combined.includes('ค่าอาหาร')) {
    return 'ค่าจ้างแรงงาน';
  }
  if (combined.includes('น้ำมัน') || combined.includes('เชื้อเพลิง') || combined.includes('ดีเซล') || combined.includes('เบนซิน')) {
    return 'ค่าน้ำมันเชื้อเพลิง';
  }
  if (combined.includes('อะไหล่') || combined.includes('ซ่อม') || combined.includes('ยาง') || combined.includes('ยานพาหนะ') || combined.includes('เช่ารถ') || combined.includes('เครื่องจักร') || combined.includes('ค่าเครื่องจักร')) {
    return 'ค่าเครื่องจักรและยานพาหนะ';
  }
  if (combined.includes('ผู้รับเหมา') || combined.includes('ซับคอนแทรค') || combined.includes('งวดงาน') || combined.includes('ค่าผลงาน') || combined.includes('ค่าจ้างเหมา') || combined.includes('r.c.u') || combined.includes('งานทาง')) {
    return 'ค่าจ้างเหมาช่วง (Subcontractor)';
  }
  if (combined.includes('ภาษี') || combined.includes('ภ.ง.ด') || combined.includes('ภงด') || combined.includes('ภ.พ') || combined.includes('ประกันสังคม') || combined.includes('กยศ') || combined.includes('สรรพากร') || combined.includes('ต่อภาษีรถ')) {
    return 'ภาษีและประกันสังคม';
  }
  if (combined.includes('ไฟฟ้า') || combined.includes('ประปา') || combined.includes('โทรศัพท์') || combined.includes('อินเตอร์เน็ต') || combined.includes('สื่อสาร') || combined.includes('3bb') || combined.includes('ais')) {
    return 'สาธารณูปโภคและสื่อสาร';
  }
  if (combined.includes('สำนักงาน') || combined.includes('คอมพิวเตอร์') || combined.includes('ซอฟต์แวร์') || combined.includes('เครื่องเขียน') || combined.includes('บริหาร')) {
    return 'ค่าใช้จ่ายสำนักงานและการบริหาร';
  }
  if (combined.includes('โอนระหว่างบัญชี') || combined.includes('โอนเงินระหว่าง')) {
    return 'โอนระหว่างบัญชี';
  }
  if (combined.includes('วัสดุ') || combined.includes('คอนกรีต') || combined.includes('ปูน') || combined.includes('หิน') || combined.includes('ทราย') || combined.includes('เหล็ก') || combined.includes('ท่อ')) {
    return 'วัสดุและอุปกรณ์ก่อสร้าง';
  }

  return 'ค่าใช้จ่ายก่อสร้างทั่วไป';
}


