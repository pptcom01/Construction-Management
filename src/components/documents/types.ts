import { numberToThaiBaht } from '../../utils/thaiBahtText';

export interface CompanyInfo {
  name: string;
  nameEn?: string;
  address: string;
  taxId: string;
  phone: string;
  email?: string;
  logoText?: string;
  logo?: string;
}

export const DEFAULT_SAMPLE_COMPANY: CompanyInfo = {
  name: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
  nameEn: 'BURIRAM THONGCHAI CONSTRUCTION CO., LTD.',
  address: '31/2 ถนนอินจันทร์ณรงค์ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000',
  taxId: '0315559001144',
  phone: '044-611134',
  email: 'brtc2024@gmail.com',
  logoText: 'BTC',
  logo: 'https://img2.pic.in.th/pic/Screenshot-2025-03-03-132721e6cc77cbcea28f01.png'
};

export const GROUP_COMPANIES_INFO: Record<string, CompanyInfo> = {
  'BTC': {
    name: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
    nameEn: 'BURIRAM THONGCHAI CONSTRUCTION CO., LTD.',
    address: '31/2 ถนนอินจันทร์ณรงค์ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000',
    taxId: '0315559001144',
    phone: '044-611134',
    email: 'brtc2024@gmail.com',
    logoText: 'BTC',
    logo: 'https://img2.pic.in.th/pic/Screenshot-2025-03-03-132721e6cc77cbcea28f01.png'
  },
  'BTCP': {
    name: 'บริษัท บุรีรัมย์ธงชัย แพลนท์ จำกัด',
    nameEn: 'BURIRAM THONGCHAI PLANT CO., LTD.',
    address: '31/2 ถนนอินจันทร์ณรงค์ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000',
    taxId: '0315559000451',
    phone: '044-611134',
    email: 'plant@buriramthongchai.co.th',
    logoText: 'BTCP',
    logo: 'https://img2.pic.in.th/pic/Screenshot-2025-03-03-132721e6cc77cbcea28f01.png'
  },
  'TBTC': {
    name: 'บริษัท ธงชัยบุรีรัมย์ก่อสร้าง จำกัด',
    nameEn: 'THONGCHAI BURIRAM CONSTRUCTION CO., LTD.',
    address: '31/2 ถนนอินจันทร์ณรงค์ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000',
    taxId: '0315562000889',
    phone: '044-611134',
    email: 'tbtc@buriramthongchai.co.th',
    logoText: 'TBTC',
    logo: 'https://img2.pic.in.th/pic/Screenshot-2025-03-03-132721e6cc77cbcea28f01.png'
  },
  'BTC-PC': {
    name: 'กิจการร่วมค้า บีทีซี-พีซี',
    nameEn: 'BTC-PC JOINT VENTURE',
    address: '31/2 ถนนอินจันทร์ณรงค์ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000',
    taxId: '0993000456123',
    phone: '044-611134',
    email: 'jv-btpc@buriramthongchai.co.th',
    logoText: 'BTC-PC',
    logo: 'https://img2.pic.in.th/pic/Screenshot-2025-03-03-132721e6cc77cbcea28f01.png'
  }
};

export function thaiBahtText(val: number | string | null | undefined): string {
  return numberToThaiBaht(val);
}

export function fmtNum(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '0.00';
  return val.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
