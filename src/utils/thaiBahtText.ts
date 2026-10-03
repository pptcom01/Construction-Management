/**
 * Converts a number to Thai Baht text representation
 * Example: 1250.50 -> "หนึ่งพันสองร้อยห้าสิบบาทห้าสิบสตางค์"
 */
export function numberToThaiBaht(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return 'ศูนย์บาทถ้วน';
  
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  if (isNaN(num) || num === 0) return 'ศูนย์บาทถ้วน';

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const NUMBERS = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const UNITS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const toThaiInt = (nStr: string): string => {
    let text = '';
    const len = nStr.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(nStr[len - 1 - i], 10);
      const unitIndex = i % 6;

      if (digit === 0) continue;

      let word = NUMBERS[digit];
      const unit = UNITS[unitIndex];

      if (unitIndex === 1 && digit === 1) word = '';
      else if (unitIndex === 1 && digit === 2) word = 'ยี่';
      else if (unitIndex === 0 && digit === 1 && len > 1 && nStr[len - 2] !== '0') word = 'เอ็ด';

      text = word + unit + text;

      if (unitIndex === 0 && i > 0 && i !== len - 1) {
        text = 'ล้าน' + text;
      }
    }
    return text;
  };

  const [bahtStr, satangStr = '00'] = absNum.toFixed(2).split('.');
  const baht = parseInt(bahtStr, 10);
  const satang = parseInt(satangStr.substring(0, 2), 10);

  let result = '';
  if (baht === 0) {
    result = '';
  } else {
    // Break up millions if large
    if (bahtStr.length > 6) {
      const millions = bahtStr.substring(0, bahtStr.length - 6);
      const remain = bahtStr.substring(bahtStr.length - 6);
      result = toThaiInt(millions) + 'ล้าน' + toThaiInt(remain) + 'บาท';
    } else {
      result = toThaiInt(bahtStr) + 'บาท';
    }
  }

  if (satang > 0) {
    if (result === '') result = 'ศูนย์บาท';
    result += toThaiInt(satangStr) + 'สตางค์';
  } else {
    result += 'ถ้วน';
  }

  result = result.replace('หนึ่งสิบ', 'สิบ');
  result = result.replace('สองสิบ', 'ยี่สิบ');

  return (isNegative ? 'ลบ' : '') + result;
}

export interface CompanyHeaderInfo {
  name: string;
  fullName: string;
  address: string;
  taxId: string;
  phone: string;
  email?: string;
  logoUrl?: string;
  logoText: string;
}

export const COMPANY_PROFILES: Record<string, CompanyHeaderInfo> = {
  'BTC': {
    name: 'BTC',
    fullName: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
    address: '31/2 ถนนอินจันทร์ณรงค์ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000',
    taxId: '0315559001144',
    phone: '044-611134',
    email: 'brtc2024@gmail.com',
    logoUrl: 'https://img2.pic.in.th/pic/Screenshot-2025-03-03-132721e6cc77cbcea28f01.png',
    logoText: 'BTC'
  },
  'BTCP': {
    name: 'BTCP',
    fullName: 'บริษัท บุรีรัมย์ธงชัย แพลนท์ จำกัด',
    address: '31/2 ถนนอินจันทร์ณรงค์ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000',
    taxId: '0315559000451',
    phone: '044-611134',
    email: 'plant@buriramthongchai.co.th',
    logoUrl: 'https://img2.pic.in.th/pic/Screenshot-2025-03-03-132721e6cc77cbcea28f01.png',
    logoText: 'BTCP'
  },
  'TBTC': {
    name: 'TBTC',
    fullName: 'บริษัท ธงชัยบุรีรัมย์ก่อสร้าง จำกัด',
    address: '31/2 ถนนอินจันทร์ณรงค์ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000',
    taxId: '0315562000889',
    phone: '044-611134',
    email: 'tbtc@buriramthongchai.co.th',
    logoUrl: 'https://img2.pic.in.th/pic/Screenshot-2025-03-03-132721e6cc77cbcea28f01.png',
    logoText: 'TBTC'
  },
  'BTC-PC': {
    name: 'BTC-PC',
    fullName: 'กิจการร่วมค้า บีทีซี-พีซี (BTC-PC JOINT VENTURE)',
    address: '31/2 ถนนอินจันทร์ณรงค์ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000',
    taxId: '0993000456123',
    phone: '044-611134',
    email: 'jv-btpc@buriramthongchai.co.th',
    logoUrl: 'https://img2.pic.in.th/pic/Screenshot-2025-03-03-132721e6cc77cbcea28f01.png',
    logoText: 'BTC-PC'
  },
  'DEFAULT': {
    name: 'BTC',
    fullName: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
    address: '31/2 ถนนอินจันทร์ณรงค์ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000',
    taxId: '0315559001144',
    phone: '044-611134',
    email: 'brtc2024@gmail.com',
    logoUrl: 'https://img2.pic.in.th/pic/Screenshot-2025-03-03-132721e6cc77cbcea28f01.png',
    logoText: 'BTC'
  }
};

export function getCompanyProfile(companyCode?: string): CompanyHeaderInfo {
  if (!companyCode) return COMPANY_PROFILES['DEFAULT'];
  return COMPANY_PROFILES[companyCode] || {
    name: companyCode,
    fullName: `บริษัท ${companyCode} จำกัด`,
    address: '31/2 ถนนอินจันทร์ณรงค์ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000',
    taxId: '0315559001144',
    phone: '044-611134',
    email: 'brtc2024@gmail.com',
    logoUrl: 'https://img2.pic.in.th/pic/Screenshot-2025-03-03-132721e6cc77cbcea28f01.png',
    logoText: companyCode
  };
}
