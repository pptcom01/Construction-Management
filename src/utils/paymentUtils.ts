import { Disbursement } from '../types';

/**
 * Generate Next Payment Voucher (PV) Number based on existing records
 * Format: PV-YYMM-XXX (e.g. PV-6801-001 for 2568 Jan)
 */
export function generatePVNumber(disbursements: Disbursement[], dateStr?: string): string {
  let thaiYear = 68;
  let monthStr = '01';

  if (dateStr) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const yr = parseInt(parts[2], 10);
      thaiYear = yr > 2500 ? yr % 100 : (yr + 543) % 100;
      monthStr = parts[1].padStart(2, '0');
    }
  } else {
    const today = new Date();
    thaiYear = (today.getFullYear() + 543) % 100;
    monthStr = (today.getMonth() + 1).toString().padStart(2, '0');
  }

  const prefix = `PV-${thaiYear}${monthStr}-`;
  
  // Find highest existing sequence for this prefix
  let maxSeq = 0;
  disbursements.forEach(d => {
    if (d.pvNo && d.pvNo.startsWith(prefix)) {
      const numPart = parseInt(d.pvNo.substring(prefix.length), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  });

  const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
  return `${prefix}${nextSeq}`;
}

/**
 * Generate a secure verification Certificate ID for Digital Signature Trail
 */
export function generateAuditCertificateId(dbmNo: string): string {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const year = new Date().getFullYear() + 543;
  const cleanDbm = dbmNo.replace(/[^A-Z0-9]/gi, '');
  return `CERT-BTC-${year}-${cleanDbm}-${rand}`;
}

/**
 * Generate a simulated cryptographic fingerprint (SHA-256 style) for the audit trail
 */
export function generateAuditFingerprint(dbm: Disbursement): string {
  const raw = `${dbm.dbmNo}|${dbm.totalAmount}|${dbm.payeeName}|${dbm.entryDate}|${dbm.paymentDate}|${dbm.financeRecordedBy || ''}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const salt = '9f8c2b7e1a3d4f5';
  return `${hex}${salt.substring(0, 16 - hex.length)}`.toUpperCase();
}
