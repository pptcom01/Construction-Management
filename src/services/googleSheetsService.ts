import { getAccessToken } from './googleAuthService';

export interface MasterSheetSchema {
  sheetTitle: string;
  columns: string[]; // Required columns (Headers)
}

// Pre-defined dynamic schemas for Construction Master Data
export const MASTER_SCHEMAS: Record<string, MasterSheetSchema> = {
  Vendors: {
    sheetTitle: 'รายชื่อคู่ค้า_ผู้รับเหมา',
    columns: ['Code', 'Name', 'TaxID', 'BankName', 'BankAccount', 'Category', 'ContactPhone', 'Status', 'UpdatedDate']
  },
  Projects: {
    sheetTitle: 'รายชื่อโครงการ',
    columns: ['Code', 'Name', 'Location', 'Company', 'ContractValue', 'Status', 'StartDate', 'EndDate', 'UpdatedDate']
  },
  ExpenseTypes: {
    sheetTitle: 'หมวดหมู่รายจ่าย_CostCode',
    columns: ['CostCode', 'ExpenseType', 'BOQCategory', 'Department', 'DefaultVatRate', 'DefaultWhtRate', 'UpdatedDate']
  },
  BankAccounts: {
    sheetTitle: 'สมุดบัญชีธนาคาร',
    columns: ['AccountNo', 'BankName', 'AccountName', 'Company', 'Branch', 'Type', 'Status']
  }
};

const STORAGE_SPREADSHEET_ID_KEY = 'btc_google_master_spreadsheet_id';

export function getSavedMasterSpreadsheetId(): string {
  return localStorage.getItem(STORAGE_SPREADSHEET_ID_KEY) || '';
}

export function saveMasterSpreadsheetId(id: string) {
  localStorage.setItem(STORAGE_SPREADSHEET_ID_KEY, id.trim());
}

/**
 * Creates or retrieves the Master Data Spreadsheet with Self-Healing & Dynamic Schema.
 * Automatically checks for missing sheets and missing columns without erasing existing rows.
 */
export async function getOrCreateMasterSpreadsheet(): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('กรุณาเข้าสู่ระบบด้วย Google เพื่อจัดการ Master Data ใน Google Sheets');

  let existingId = getSavedMasterSpreadsheetId();

  if (existingId) {
    // Verify it exists and is accessible
    try {
      const verifyRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${existingId}?fields=spreadsheetId,properties.title,sheets.properties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (verifyRes.ok) {
        const metadata = await verifyRes.json();
        // Self-heal and sync missing sheets and columns
        await autoMigrateSpreadsheetSchemas(existingId, metadata);
        return {
          spreadsheetId: existingId,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${existingId}/edit`
        };
      }
    } catch (e) {
      console.warn('Saved spreadsheet not accessible, provisioning new one...', e);
    }
  }

  // Create new Master Spreadsheet with predefined schemas
  const createPayload = {
    properties: {
      title: 'BTC_Enterprise_Master_Data (ฐานข้อมูลหลักองค์กร)'
    },
    sheets: Object.values(MASTER_SCHEMAS).map(s => ({
      properties: {
        title: s.sheetTitle,
        gridProperties: {
          frozenRowCount: 1
        }
      }
    }))
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(createPayload)
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    console.error('[Google Sheets] Create spreadsheet error:', err);
    throw new Error('ไม่สามารถสร้าง Google Sheets ได้: ' + createRes.statusText);
  }

  const created = await createRes.json();
  const newId = created.spreadsheetId;
  saveMasterSpreadsheetId(newId);

  // Initialize header rows
  for (const schema of Object.values(MASTER_SCHEMAS)) {
    await appendOrSetHeaders(newId, schema.sheetTitle, schema.columns, token);
  }

  return {
    spreadsheetId: newId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${newId}/edit`
  };
}

/**
 * Self-healing / Dynamic Schema Migration:
 * Inspects existing sheets in the spreadsheet:
 * 1. If any required sheet tab is missing -> Creates it
 * 2. If any required column header is missing -> Appends the new column header safely without losing data
 */
export async function autoMigrateSpreadsheetSchemas(spreadsheetId: string, currentMetadata?: any): Promise<{ addedSheets: string[]; addedColumns: string[] }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Token required for schema migration');

  let metadata = currentMetadata;
  if (!metadata) {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to inspect spreadsheet metadata');
    metadata = await res.json();
  }

  const existingSheetTitles: string[] = (metadata.sheets || []).map((s: any) => s.properties.title);
  const addedSheets: string[] = [];
  const addedColumns: string[] = [];

  // 1. Check and add missing sheets
  const missingSchemas = Object.values(MASTER_SCHEMAS).filter(s => !existingSheetTitles.includes(s.sheetTitle));
  if (missingSchemas.length > 0) {
    const batchRequests = missingSchemas.map(s => ({
      addSheet: {
        properties: {
          title: s.sheetTitle,
          gridProperties: { frozenRowCount: 1 }
        }
      }
    }));

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests: batchRequests })
    });

    for (const s of missingSchemas) {
      addedSheets.push(s.sheetTitle);
      await appendOrSetHeaders(spreadsheetId, s.sheetTitle, s.columns, token);
    }
  }

  // 2. Check and add missing columns to existing sheets (Non-destructive Dynamic Column Migration)
  for (const schema of Object.values(MASTER_SCHEMAS)) {
    if (missingSchemas.some(ms => ms.sheetTitle === schema.sheetTitle)) continue;

    // Fetch first row (Headers)
    const headerRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(schema.sheetTitle)}!1:1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (headerRes.ok) {
      const headerData = await headerRes.json();
      const currentHeaders: string[] = (headerData.values && headerData.values[0]) ? headerData.values[0] : [];

      const missingCols = schema.columns.filter(col => !currentHeaders.includes(col));
      if (missingCols.length > 0) {
        // Append missing column headers to the right
        const nextColIndex = currentHeaders.length;
        const newFullHeaders = [...currentHeaders, ...missingCols];

        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(schema.sheetTitle)}!A1:Z1?valueInputOption=RAW`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              range: `${schema.sheetTitle}!A1:Z1`,
              majorDimension: 'ROWS',
              values: [newFullHeaders]
            })
          }
        );
        addedColumns.push(`${schema.sheetTitle} (+${missingCols.join(', ')})`);
      }
    }
  }

  return { addedSheets, addedColumns };
}

async function appendOrSetHeaders(spreadsheetId: string, sheetTitle: string, headers: string[], token: string) {
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!A1:Z1?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: `${sheetTitle}!A1:Z1`,
        majorDimension: 'ROWS',
        values: [headers]
      })
    }
  );
}

/**
 * Reads Master Data dynamically by matching Column Headers (Header-based Mapping).
 * Independent of column ordering!
 */
export async function fetchMasterDataSheet<T = Record<string, any>>(
  spreadsheetId: string,
  sheetTitle: string
): Promise<T[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!A1:ZZ500`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!res.ok) {
    console.error(`[Google Sheets] Failed to fetch sheet ${sheetTitle}:`, res.statusText);
    return [];
  }

  const data = await res.json();
  if (!data.values || data.values.length <= 1) return [];

  const headers: string[] = data.values[0].map((h: any) => String(h).trim());
  const rows = data.values.slice(1);

  return rows.map((row: any[]) => {
    const item: Record<string, any> = {};
    headers.forEach((header, index) => {
      item[header] = row[index] !== undefined ? String(row[index]).trim() : '';
    });
    return item as T;
  });
}

/**
 * Appends a new item into Master Sheet
 */
export async function appendMasterDataItem(
  spreadsheetId: string,
  sheetTitle: string,
  item: Record<string, any>
): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) throw new Error('Token required');

  // 1. Get current headers to align row data correctly
  const headerRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!1:1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!headerRes.ok) return false;
  const headerData = await headerRes.json();
  const headers: string[] = (headerData.values && headerData.values[0]) || [];

  const orderedRow = headers.map(h => item[h] || '');

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!A:A:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [orderedRow]
      })
    }
  );

  return appendRes.ok;
}

/**
 * Seeds initial master data (from current system records) if sheet is empty
 */
export async function seedInitialMasterDataIfEmpty(
  spreadsheetId: string,
  sampleVendors: string[],
  sampleProjects: string[],
  sampleExpenseTypes: string[]
): Promise<void> {
  const token = await getAccessToken();
  if (!token) return;

  // Vendors
  const vendors = await fetchMasterDataSheet(spreadsheetId, MASTER_SCHEMAS.Vendors.sheetTitle);
  if (vendors.length === 0 && sampleVendors.length > 0) {
    const rows = sampleVendors.slice(0, 30).map(v => {
      const parts = v.split(/\s+/);
      const code = parts[0] || 'V-001';
      const name = parts.slice(1).join(' ') || v;
      return [code, name, '', 'กรุงเทพ / กสิกรไทย', '-', 'ผู้รับเหมา/ร้านค้า', '', 'Active', new Date().toISOString().slice(0, 10)];
    });

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(MASTER_SCHEMAS.Vendors.sheetTitle)}!A2:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: rows })
      }
    );
  }

  // Projects
  const projects = await fetchMasterDataSheet(spreadsheetId, MASTER_SCHEMAS.Projects.sheetTitle);
  if (projects.length === 0 && sampleProjects.length > 0) {
    const rows = sampleProjects.map((p, idx) => [
      `PRJ-${String(idx + 1).padStart(3, '0')}`,
      p,
      'ภาคอีสาน',
      'BTC',
      'ตามสัญญา',
      'Active',
      '2025-01-01',
      '2027-12-31',
      new Date().toISOString().slice(0, 10)
    ]);

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(MASTER_SCHEMAS.Projects.sheetTitle)}!A2:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: rows })
      }
    );
  }

  // Expense Types
  const expenseTypes = await fetchMasterDataSheet(spreadsheetId, MASTER_SCHEMAS.ExpenseTypes.sheetTitle);
  if (expenseTypes.length === 0 && sampleExpenseTypes.length > 0) {
    const rows = sampleExpenseTypes.map((e, idx) => [
      `EXP-${String(idx + 1).padStart(3, '0')}`,
      e,
      'งานทั่วไป',
      'จัดซื้อ / โครงการ',
      '7%',
      e.includes('บริการ') || e.includes('เช่า') ? '3%' : '0%',
      new Date().toISOString().slice(0, 10)
    ]);

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(MASTER_SCHEMAS.ExpenseTypes.sheetTitle)}!A2:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: rows })
      }
    );
  }
}
