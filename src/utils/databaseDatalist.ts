/**
 * Database-Driven Autocomplete & Frequency Intelligence Engine
 * 
 * คุณสมบัติหลักตามข้อกำหนด:
 * 1. ดึงข้อความจริงจากประวัติในฐานข้อมูล (Real Database Records)
 * 2. คำนวณความถี่ (Occurrence Frequency) ของทุกข้อความที่มีการคีย์/บันทึกจริง
 * 3. จัดกลุ่มข้อความที่ใกล้เคียงกัน (Canonical Grouping)
 * 4. คัดเลือก "ตัวสะกดที่ถูกใช้บ่อยที่สุด" (Most Frequent Spelling) เป็นตัวแทนของแต่ละกลุ่ม
 * 5. เรียงลำดับตัวเลือกตามความถี่จากมากไปน้อย (Most Frequent on Top)
 * 6. ส่งกลับเพื่อนำไปใช้ใน HTML5 <datalist> และ Combobox ทั่วทั้งระบบ
 * 7. ยิ่งผู้ใช้แก้ไขหรือคีย์ข้อมูลจริง ตัวเลือกจะปรับปรุงความแม่นยำให้ตรงขึ้นโดยอัตโนมัติแบบ Reactive
 */

export interface FrequencyStat {
  /** ตัวสะกดที่เป็นตัวแทนของกลุ่ม (สะกดที่ใช้บ่อยที่สุด) */
  representative: string;
  /** ความถี่รวมของกลุ่มนี้ในฐานข้อมูล */
  totalCount: number;
  /** คีย์มาตรฐานที่ใช้จัดกลุ่ม */
  canonicalKey: string;
  /** รายการตัวสะกดรูปแบบต่างๆ ที่เคยบันทึกไว้ในฐานข้อมูล */
  spellings: Record<string, number>;
}

/**
 * แปลงข้อความเป็น Canonical Key เพื่อจัดกลุ่มคำที่ความหมายเดียวกัน
 * - ตัดช่องว่างหัวท้าย (Trim)
 * - ยุบช่องว่างซ้ำซ้อนให้เหลือ 1 เคาะ
 * - ปรับลดช่องว่างรอบเครื่องหมายวรรคตอนภาษาไทย/สัญลักษณ์ทั่วไป เช่น บจก. / หจก. / ทล. / - / .
 * - ปรับตัวอักษรละตินเป็นพิมพ์เล็ก (Case-insensitive)
 */
export function toCanonicalKey(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    // ยุบช่องว่างต่อเนื่องหลายตัว
    .replace(/\s+/g, ' ')
    // กำจัดช่องว่างที่อยู่ติดกับจุดหรือเครื่องหมายย่อ เช่น "บจก. " -> "บจก." หรือ "หจก. " -> "หจก."
    .replace(/([.])/g, '$1')
    .replace(/\s*([./\-_])\s*/g, '$1')
    .trim();
}

/**
 * คำนวณความถี่และคัดเลือกตัวสะกดที่ใช้บ่อยที่สุดจากชุดข้อมูลจริง
 *
 * @param rawValues อาร์เรย์ของข้อความดิบที่ดึงมาจากฐานข้อมูล
 * @param options การตั้งค่าเพิ่มเติม เช่น ค่าตั้งต้น (seeds), ความยาวขั้นต่ำ (minLength), จำนวนสูงสุด (limit)
 * @returns รายการข้อความตัวแทน เรียงตามความถี่จากมากไปน้อย พร้อมใช้ใน <datalist>
 */
export function buildFrequentSuggestions(
  rawValues: (string | null | undefined)[],
  options: {
    minLength?: number;
    initialSeeds?: string[];
    limit?: number;
  } = {}
): string[] {
  const { minLength = 1, initialSeeds = [], limit = 100 } = options;

  // แผนที่เก็บข้อมูลสถิติตาม canonical key
  const groupMap = new Map<string, {
    canonicalKey: string;
    totalCount: number;
    spellings: Map<string, number>;
  }>();

  // ฟังก์ชันช่วยนับความถี่
  const recordValue = (val: string, weight = 1) => {
    if (!val) return;
    const trimmed = val.trim();
    if (trimmed.length < minLength) return;

    const key = toCanonicalKey(trimmed);
    if (!key) return;

    let group = groupMap.get(key);
    if (!group) {
      group = {
        canonicalKey: key,
        totalCount: 0,
        spellings: new Map<string, number>()
      };
      groupMap.set(key, group);
    }

    group.totalCount += weight;
    const currentSpellingCount = group.spellings.get(trimmed) || 0;
    group.spellings.set(trimmed, currentSpellingCount + weight);
  };

  // 1. นับข้อมูลจริงจากฐานข้อมูล (น้ำหนัก = 1 ต่อแต่ละการบันทึก)
  for (const raw of rawValues) {
    if (raw && typeof raw === 'string') {
      recordValue(raw, 1);
    }
  }

  // 2. เสริม initialSeeds (น้ำหนักน้อยมาก = 0.01 เพื่อไม่ให้แซงข้อมูลที่คีย์จริง)
  for (const seed of initialSeeds) {
    if (seed && typeof seed === 'string') {
      recordValue(seed, 0.01);
    }
  }

  // 3. หา "ตัวสะกดที่ใช้บ่อยที่สุด" ของแต่ละกลุ่ม
  const rankedItems: FrequencyStat[] = [];

  for (const group of groupMap.values()) {
    let topSpelling = '';
    let topCount = -1;
    const spellingsObj: Record<string, number> = {};

    for (const [spelling, count] of group.spellings.entries()) {
      spellingsObj[spelling] = count;
      if (count > topCount) {
        topCount = count;
        topSpelling = spelling;
      } else if (count === topCount) {
        // หากความถี่เท่ากัน เลือกตัวสะกดที่มีความยาวกระชับและไม่เว้นวรรคเกิน
        if (!topSpelling || spelling.replace(/\s+/g, ' ').length <= topSpelling.length) {
          topSpelling = spelling;
        }
      }
    }

    if (topSpelling) {
      rankedItems.push({
        representative: topSpelling,
        totalCount: group.totalCount,
        canonicalKey: group.canonicalKey,
        spellings: spellingsObj
      });
    }
  }

  // 4. เรียงลำดับตามความถี่รวมจากมากไปหาน้อย (Most Frequent First)
  rankedItems.sort((a, b) => {
    if (b.totalCount !== a.totalCount) {
      return b.totalCount - a.totalCount;
    }
    // หากความถี่เท่ากัน เรียงตามตัวอักษรเพื่อความสม่ำเสมอ
    return a.representative.localeCompare(b.representative, 'th');
  });

  // 5. ตัดเอาเฉพาะตัวแทนตามจำนวน limit ที่กำหนด
  return rankedItems.slice(0, limit).map(item => item.representative);
}

/**
 * ตรวจสอบความถูกต้องของเลขที่บัญชีธนาคาร (ไม่เอาค่าว่าง หรือ placeholder เช่น "- เลขที่บัญชี : -")
 */
export function isValidBankAccount(acc?: string | null): boolean {
  if (!acc) return false;
  const clean = acc.trim();
  if (clean === '-' || clean === '--' || clean === 'N/A' || clean === 'ไม่มีระบุ') return false;
  if (clean.includes('เลขที่บัญชี : -') || clean.includes('เลขที่บัญชี : - ')) return false;
  // ต้องมีตัวเลขอย่างน้อย 3 หลักขึ้นไป
  return /\d{3,}/.test(clean);
}

/**
 * ตัดรหัสผู้ขาย/รหัสบัญชีนำหน้า เช่น "101-01-004 บจก.ยูนิตี้" -> "บจก.ยูนิตี้"
 */
export function cleanPayeeName(name?: string | null): string {
  if (!name) return '';
  return name
    .replace(/^(\d{3}-\d{2}-\d{3,4}|\d{3}-\d{3}|\d{3,}-\d{2,}|\d+)\s+/, '')
    .trim();
}

// ฐานข้อมูลเริ่มต้นของบัญชีธนาคารคู่ค้าหลัก (Seed Fallback)
const KNOWN_PAYEE_BANKS: Record<string, string> = {
  'หจก. ปิยะวิลล์คอนสตรัคชั่น': 'ธนาคารกรุงเทพ (BBL) 412-0-98214-5',
  'นายสมศักดิ์ ช่างเหล็ก': 'ธนาคารกสิกรไทย (KBANK) 048-2-84192-1',
  'บจก. พิชชญา เอ็นจิเนียริ่ง': 'ธนาคารกรุงไทย (KTB) 311-6-04981-2',
  'หจก. บุรีรัมย์ศิลาชัย': 'ธนาคารกรุงเทพ 297-4-575777',
  'บจก. สุรินทร์คอนกรีตโปรดักส์': 'ธนาคารไทยพาณิชย์ 603-2-415544',
  'โรงงาน ป.ศิลาชัย คอนกรีต': 'ธนาคารกรุงไทย 308-0-600495',
  'โรงงาน ป.ศิลาชัย คอนกรีต บจก.': 'ธนาคารกรุงไทย 308-0-600495',
  'บจก. ชลประทานซีเมนต์': 'ธนาคารกรุงเทพ 595-4-046669',
  'บจก. สยามซีเมนต์ (ท่าลาน)': 'ธนาคารกรุงเทพ 595-4-046669',
  'ปั๊มน้ำมัน ปตท. ท่องเที่ยวบุรีรัมย์': 'ธนาคารกรุงเทพ 297-4-731818',
  'บจก.ยูนิตี้ ไอที ซิสเต็ม': 'กสิกรไทย เลขที่บัญชี : 031-1-958194 สาขา : บุรีรัมย์',
  'บจก. ยูนิตี้ ไอที ซิสเต็ม': 'กสิกรไทย เลขที่บัญชี : 031-1-958194 สาขา : บุรีรัมย์',
  'บจก.อี-บิซิเนส พลัส': 'กรุงเทพ เลขที่บัญชี : 211-0-50195-0 สาขา : ตลิ่งชัน',
  'บจก. อี-บิซิเนส พลัส': 'กรุงเทพ เลขที่บัญชี : 211-0-50195-0 สาขา : ตลิ่งชัน',
  'หจก.พงศ์ดิลกโยธา': 'ไทยพาณิชย์ เลขที่บัญชี : 561-3-01409-0 สาขา : ยโสธร',
  'หจก. พงศ์ดิลกโยธา': 'ไทยพาณิชย์ เลขที่บัญชี : 561-3-01409-0 สาขา : ยโสธร',
  'บจก.พีดี เอ็นจิเนียริ่ง แอนด์ซัพพลาย 2018': 'กสิกรไทย เลขที่บัญชี : 037-3-11912-1 สาขา : นิคมพัฒนา',
  'บจก. พีดี เอ็นจิเนียริ่ง แอนด์ซัพพลาย 2018': 'กสิกรไทย เลขที่บัญชี : 037-3-11912-1 สาขา : นิคมพัฒนา',
  'หจก.ศรีเสม็ดอะไหล่ยนต์': 'ไทยพาณิชย์ เลขที่บัญชี : 603-2-415544 สาขา : บุรีรัมย์',
  'หจก. ศรีเสม็ดอะไหล่ยนต์': 'ไทยพาณิชย์ เลขที่บัญชี : 603-2-415544 สาขา : บุรีรัมย์',
  'บจก.นิวโคราชยูนิเต็ดคอนกรีตแอนด์วูดดิ้งกรุ๊ป': 'กรุงเทพ เลขที่บัญชี : 595-4-046669 สาขา : เดอะมอลล์ฯ',
  'บจก. นิวโคราชยูนิเต็ดคอนกรีตแอนด์วูดดิ้งกรุ๊ป': 'กรุงเทพ เลขที่บัญชี : 595-4-046669 สาขา : เดอะมอลล์ฯ',
  'หจก.อุบลวิบูลย์': 'กรุงเทพ เลขที่บัญชี : 256-4-408058 สาขา : อุบลราชธานี',
  'หจก. อุบลวิบูลย์': 'กรุงเทพ เลขที่บัญชี : 256-4-408058 สาขา : อุบลราชธานี',
  'น.ส.ยุวดี สุขใจ': 'กรุงเทพ เลขที่บัญชี : 689-0-16565-4 สาขา : เทสโก้ โลตัส สุรินทร์พล่าซ่า',
  'น.ส. ยุวดี สุขใจ': 'กรุงเทพ เลขที่บัญชี : 689-0-16565-4 สาขา : เทสโก้ โลตัส สุรินทร์พล่าซ่า',
  'บจก.บุรีรัมย์ธงชัยก่อสร้าง': 'กรุงเทพ เลขที่บัญชี : 297-4-731818 สาขา : บุรีรัมย์',
  'บจก. บุรีรัมย์ธงชัยก่อสร้าง': 'กรุงเทพ เลขที่บัญชี : 297-4-731818 สาขา : บุรีรัมย์',
  'นายธวัชชัย บุญรอง': 'กรุงเทพ เลขที่บัญชี : 297-4-50777-0 สาขา : บุรีรัมย์',
  'นาย ธวัชชัย บุญรอง': 'กรุงเทพ เลขที่บัญชี : 297-4-50777-0 สาขา : บุรีรัมย์',
  'น.ส.สมพิศ เวสะมูลา': 'กรุงเทพ เลขที่บัญชี : 633-7-024340 สาขา : โลตัสหนองสองห้อง',
  'น.ส. สมพิศ เวสะมูลา': 'กรุงเทพ เลขที่บัญชี : 633-7-024340 สาขา : โลตัสหนองสองห้อง',
  'นางปิ่นฤทัย อาจบัณฑิต': 'กรุงไทย เลขที่บัญชี : 417-0-27516-0 สาขา : บรบือ',
  'นาง ปิ่นฤทัย อาจบัณฑิต': 'กรุงไทย เลขที่บัญชี : 417-0-27516-0 สาขา : บรบือ',
  'บจก.พี โอ ออยล์': 'กรุงเทพ เลขที่บัญชี : 594-0-046229',
  'บจก. พี โอ ออยล์': 'กรุงเทพ เลขที่บัญชี : 594-0-046229',
  'บจก.77 อะไหล่ยนต์': 'กรุงไทย เลขที่บัญชี : 284-0-660091 สาขา : ถนนธานี',
  'บจก. 77 อะไหล่ยนต์': 'กรุงไทย เลขที่บัญชี : 284-0-660091 สาขา : ถนนธานี',
  'บจก.เมโทรแมชีนเนอรี่': 'กรุงเทพ เลขที่บัญชี : 664-3-000588 สาขา : สุรินทร์',
  'บจก. เมโทรแมชีนเนอรี่': 'กรุงเทพ เลขที่บัญชี : 664-3-000588 สาขา : สุรินทร์',
  'นายวีระศักดิ์ ไกรโกศล': 'กรุงเทพ เลขที่บัญชี : 414-4-353127 สาขา : นางรอง',
  'นาย วีระศักดิ์ ไกรโกศล': 'กรุงเทพ เลขที่บัญชี : 414-4-353127 สาขา : นางรอง',
  'นายกิตติ รุ่งอร่ามศิลป์': 'ออมสิน เลขที่บัญชี : 020-0-1134676-2 สาขา : บุรีรัมย์',
  'นายวันชัย แซ่เตีย': 'กรุงไทย เลขที่บัญชี : 315-1-545750 สาขา : ยโสธร',
  'น.ส.ณัฐณิชา นพสุวรรณวงศ์': 'กรุงเทพ เลขที่บัญชี : 297-4-94873-5 สาขา : บุรีรัมย์',
  'บจก.รักษาความปลอดภัย บีอาร์ ซีคิวริตี้ เซอร์วิส': 'ไทยพาณิชย์ เลขที่บัญชี : 417-0-489510 สาขา : บิ๊กซี บุรีรัมย์',
  'น.ส.จุฑารัตน์ ดำรงสกุล': 'กรุงเทพ เลขที่บัญชี : 089-7-165130 สาขา : เดอะเซอร์เคิล ราชพฤกษ์',
  'นายสมหวัง ไทยศรีวงศ์': 'กรุงเทพ เลขที่บัญชี : 414-0-115090 สาขา : นางรอง',
  'สมาคมทางหลวงแห่งประเทศไทย': 'ไทยพาณิชย์ เลขที่บัญชี : 008-2004088 สาขา : ชิดลม',
  'หจก. สุรินทร์การช่างและโยธา': 'ธนาคารไทยพาณิชย์ 603-2-415544',
  'ร้าน ส.สมพรพาณิชย์ บุรีรัมย์': 'ธนาคารกรุงเทพ 297-4-575777',
  'ซีแพค สุรินทร์ (CPAC)': 'ธนาคารไทยพาณิชย์ 603-2-415544',
  'หจก. บุรีรัมย์ท่อระบายน้ำ': 'ธนาคารกรุงเทพ 297-4-575777'
};

/**
 * ค้นหาบัญชีธนาคารที่ใช้บ่อยที่สุดของคู่ค้า/ผู้รับเงินคนนั้นๆ
 * เพื่อช่วยแนะนำหรือ Auto-fill เมื่อเลือกชื่อผู้รับเงิน
 */
export function findMostFrequentBankForPayee(
  payeeName: string,
  disbursements: { payeeName?: string; payeeBankAccount?: string }[],
  subcontracts: { contractorName?: string; defaultBankAccount?: string; defaultBankName?: string }[] = [],
  paymentClaims: { contractorName?: string; payeeName?: string; payeeBankAccount?: string; payeeBankName?: string }[] = []
): string | null {
  if (!payeeName) return null;
  const targetClean = cleanPayeeName(payeeName);
  const targetKey = toCanonicalKey(targetClean);
  if (!targetKey) return null;

  const accounts: string[] = [];

  // Helper เพื่อเช็คว่าชื่อตรงกันหรือไม่ (รองรับ Spaceless Matching ในภาษาไทย)
  const isMatch = (candidateName?: string | null) => {
    if (!candidateName) return false;
    const cleanCand = cleanPayeeName(candidateName);
    const candKey = toCanonicalKey(cleanCand);
    if (!candKey) return false;

    if (candKey === targetKey) return true;

    // เปรียบเทียบแบบตัดช่องว่างและสัญลักษณ์ทั้งหมด (Spaceless Thai Match)
    const strippedTarget = targetKey.replace(/[\s\-_./()]/g, '');
    const strippedCand = candKey.replace(/[\s\-_./()]/g, '');
    if (strippedTarget && strippedCand) {
      if (strippedTarget === strippedCand) return true;
      if (strippedTarget.length >= 4 && strippedCand.length >= 4) {
        if (strippedTarget.includes(strippedCand) || strippedCand.includes(strippedTarget)) {
          return true;
        }
      }
    }

    // ตัดข้อความในวงเล็บ เช่น (ช่าง จัน), (ช่างสมศักดิ์)
    const baseTarget = targetKey.replace(/\([^)]*\)/g, '').trim();
    const baseCand = candKey.replace(/\([^)]*\)/g, '').trim();
    if (baseTarget && baseCand && (baseTarget === baseCand || baseTarget.includes(baseCand) || baseCand.includes(baseTarget))) {
      return true;
    }

    return targetKey.includes(candKey) || candKey.includes(targetKey);
  };

  // 1. ค้นหาจากประวัติการขอตั้งเบิกจริง (Disbursements)
  for (const d of disbursements) {
    if (isMatch(d.payeeName) && isValidBankAccount(d.payeeBankAccount)) {
      accounts.push(d.payeeBankAccount!.trim());
    }
  }

  // 2. ค้นหาจากสัญญาจ้างช่างเหมาจริง (Subcontracts)
  for (const s of subcontracts) {
    if (isMatch(s.contractorName) && isValidBankAccount(s.defaultBankAccount)) {
      const fullBank = s.defaultBankName 
        ? `${s.defaultBankName} ${s.defaultBankAccount!.trim()}`
        : s.defaultBankAccount!.trim();
      accounts.push(fullBank);
    }
  }

  // 3. ค้นหาจากใบเบิกค่างวดช่างเหมา (Payment Claims)
  for (const c of paymentClaims) {
    if ((isMatch(c.payeeName) || isMatch(c.contractorName)) && isValidBankAccount(c.payeeBankAccount)) {
      const fullBank = c.payeeBankName 
        ? `${c.payeeBankName} ${c.payeeBankAccount!.trim()}`
        : c.payeeBankAccount!.trim();
      accounts.push(fullBank);
    }
  }

  // 4. หากมีประวัติในฐานข้อมูล ให้เลือกตัวสะกดบัญชีที่ใช้บ่อยที่สุด
  if (accounts.length > 0) {
    const suggestions = buildFrequentSuggestions(accounts, { minLength: 3, limit: 1 });
    if (suggestions[0]) return suggestions[0];
  }

  // 5. หากยังไม่เคยมีในฐานข้อมูล ให้เช็คกับ Known Payee Banks Seed
  for (const [knownName, knownBank] of Object.entries(KNOWN_PAYEE_BANKS)) {
    if (isMatch(knownName)) {
      return knownBank;
    }
  }

  return null;
}
