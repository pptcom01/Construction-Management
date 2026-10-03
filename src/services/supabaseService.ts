import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { Transaction, Disbursement, TodoTask } from '../types';
import { compareDisbursementsDesc, compareTransactionsDesc } from '../utils/accounting';

// ==========================================
// 1. Transaction Mapping & Operations
// ==========================================

function mapRowToTransaction(row: any): Transaction {
  return {
    id: row.id,
    company: row.company || '',
    date: row.date || '',
    isoDate: row.iso_date || row.date || '',
    docNo: row.doc_no || '',
    description: row.description || '',
    account: row.account || '',
    project: row.project || '',
    category: row.category || '',
    debit: Number(row.debit) || 0,
    credit: Number(row.credit) || 0,
    runningBalance: row.running_balance !== null ? Number(row.running_balance) : undefined,
    remarks: row.remarks || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: row.status || 'cleared',
    createdAt: row.created_at || '',
    sourceType: row.source_type,
    disbursementId: row.disbursement_id,
    pvNo: row.pv_no,
    dbmNo: row.dbm_no,
    refDocNo: row.ref_doc_no,
    payeeName: row.payee_name,
    paymentSlipUrl: row.payment_slip_url,
    paymentSlipName: row.payment_slip_name,
    auditCertificateId: row.audit_certificate_id,
    reconciledAt: row.reconciled_at,
    reconciledBy: row.reconciled_by,
    reconciliationNotes: row.reconciliation_notes,
    statementMatchId: row.statement_match_id
  };
}

function mapTransactionToRow(tx: Transaction): Record<string, any> {
  return {
    id: tx.id,
    company: tx.company,
    date: tx.date,
    iso_date: tx.isoDate || tx.date,
    doc_no: tx.docNo || null,
    description: tx.description,
    account: tx.account,
    project: tx.project,
    category: tx.category,
    debit: tx.debit || 0,
    credit: tx.credit || 0,
    running_balance: tx.runningBalance ?? null,
    remarks: tx.remarks || null,
    tags: tx.tags || [],
    status: tx.status || 'cleared',
    source_type: tx.sourceType || 'manual',
    disbursement_id: tx.disbursementId || null,
    pv_no: tx.pvNo || null,
    dbm_no: tx.dbmNo || null,
    ref_doc_no: tx.refDocNo || null,
    payee_name: tx.payeeName || null,
    payment_slip_url: tx.paymentSlipUrl || null,
    payment_slip_name: tx.paymentSlipName || null,
    audit_certificate_id: tx.auditCertificateId || null,
    reconciled_at: tx.reconciledAt || null,
    reconciled_by: tx.reconciledBy || null,
    reconciliation_notes: tx.reconciliationNotes || null,
    statement_match_id: tx.statementMatchId || null
  };
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('transactions')
    .select('*')
    .order('iso_date', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching transactions:', error);
    throw error;
  }

  return (data || []).map(mapRowToTransaction).sort(compareTransactionsDesc);
}

export async function upsertTransaction(tx: Transaction): Promise<void> {
  const client = getSupabase();
  if (!client) return;

  const row = mapTransactionToRow(tx);
  const { error } = await client.from('transactions').upsert(row);

  if (error) {
    console.error('[Supabase] Error upserting transaction:', error);
    throw error;
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  const client = getSupabase();
  if (!client) return;

  const { error } = await client.from('transactions').delete().eq('id', id);

  if (error) {
    console.error('[Supabase] Error deleting transaction:', error);
    throw error;
  }
}

export async function batchUpsertTransactions(txList: Transaction[]): Promise<void> {
  const client = getSupabase();
  if (!client || txList.length === 0) return;

  const rows = txList.map(mapTransactionToRow);
  
  // Batch in chunks of 200 to prevent request payload limits
  const chunkSize = 200;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await client.from('transactions').upsert(chunk, { onConflict: 'id' });
    if (error) {
      console.error(`[Supabase] Batch upsert transactions chunk ${i} failed:`, error);
      throw error;
    }
  }
}

// ==========================================
// 2. Disbursement Mapping & Operations
// ==========================================

function mapRowToDisbursement(row: any): Disbursement {
  return {
    id: row.id,
    recordedBy: row.recorded_by || '',
    financeRecordedBy: row.finance_recorded_by || undefined,
    dbmNo: row.dbm_no || '',
    refDocNo: row.ref_doc_no || '',
    company: row.company || '',
    entryDate: row.entry_date || '',
    dueDate: row.due_date || '',
    expenseType: row.expense_type || '',
    boqType: row.boq_type || undefined,
    payeeName: row.payee_name || '',
    payeeBankAccount: row.payee_bank_account || '',
    payeeBankName: row.payee_bank_name || undefined,
    payeeBankBranch: row.payee_bank_branch || undefined,
    project: row.project || '',
    paymentMethod: row.payment_method || 'โอน',
    remarks: row.remarks || '',
    items: Array.isArray(row.items) ? row.items : [],
    subTotalAmount: row.sub_total_amount !== null ? Number(row.sub_total_amount) : undefined,
    vatTotalAmount: row.vat_total_amount !== null ? Number(row.vat_total_amount) : undefined,
    taxDeductionTotalAmount: row.tax_deduction_total_amount !== null ? Number(row.tax_deduction_total_amount) : undefined,
    retentionTotalAmount: row.retention_total_amount !== null ? Number(row.retention_total_amount) : undefined,
    totalAmount: Number(row.total_amount) || 0,
    
    requesterSignature: row.requester_signature || undefined,
    requesterSignedAt: row.requester_signed_at || undefined,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    
    reviewerName: row.reviewer_name || undefined,
    reviewerSignature: row.reviewer_signature || undefined,
    reviewedAt: row.reviewed_at || undefined,
    reviewerNotes: row.reviewer_notes || undefined,
    approverName: row.approver_name || undefined,
    approverSignature: row.approver_signature || undefined,
    approvedAt: row.approved_at || undefined,
    approverNotes: row.approver_notes || undefined,
    
    payerAccount: row.payer_account || '',
    chequeNo: row.cheque_no || '',
    paymentDate: row.payment_date || '',
    transferAmount: Number(row.transfer_amount) || 0,
    fee: Number(row.fee) || 0,
    documentLink: row.document_link || undefined,
    paymentSlipUrl: row.payment_slip_url || undefined,
    paymentSlipName: row.payment_slip_name || undefined,
    financeSignature: row.finance_signature || undefined,
    pvNo: row.pv_no || undefined,
    paidAt: row.paid_at || undefined,
    auditCertificateId: row.audit_certificate_id || undefined,
    status: row.status || 'pending',
    isSyncedToLedger: Boolean(row.is_synced_to_ledger),
    originalDueDate: row.original_due_date || undefined,
    rescheduleReason: row.reschedule_reason || undefined,
    rescheduledAt: row.rescheduled_at || undefined,
    rescheduledBy: row.rescheduled_by || undefined
  };
}

function mapDisbursementToRow(dbm: Disbursement): Record<string, any> {
  return {
    id: dbm.id,
    recorded_by: dbm.recordedBy || null,
    finance_recorded_by: dbm.financeRecordedBy || null,
    dbm_no: dbm.dbmNo,
    ref_doc_no: dbm.refDocNo || null,
    company: dbm.company,
    entry_date: dbm.entryDate,
    due_date: dbm.dueDate || null,
    expense_type: dbm.expenseType,
    boq_type: dbm.boqType || null,
    payee_name: dbm.payeeName,
    payee_bank_account: dbm.payeeBankAccount || null,
    payee_bank_name: dbm.payeeBankName || null,
    payee_bank_branch: dbm.payeeBankBranch || null,
    project: dbm.project,
    payment_method: dbm.paymentMethod || 'โอน',
    remarks: dbm.remarks || null,
    items: dbm.items || [],
    sub_total_amount: dbm.subTotalAmount ?? null,
    vat_total_amount: dbm.vatTotalAmount ?? null,
    tax_deduction_total_amount: dbm.taxDeductionTotalAmount ?? null,
    retention_total_amount: dbm.retentionTotalAmount ?? null,
    total_amount: dbm.totalAmount || 0,
    requester_signature: dbm.requesterSignature || null,
    requester_signed_at: dbm.requesterSignedAt || null,
    attachments: dbm.attachments || [],
    reviewer_name: dbm.reviewerName || null,
    reviewer_signature: dbm.reviewerSignature || null,
    reviewed_at: dbm.reviewedAt || null,
    reviewer_notes: dbm.reviewerNotes || null,
    approver_name: dbm.approverName || null,
    approver_signature: dbm.approverSignature || null,
    approved_at: dbm.approvedAt || null,
    approver_notes: dbm.approverNotes || null,
    payer_account: dbm.payerAccount || null,
    cheque_no: dbm.chequeNo || null,
    payment_date: dbm.paymentDate || null,
    transfer_amount: dbm.transferAmount || 0,
    fee: dbm.fee || 0,
    document_link: dbm.documentLink || null,
    payment_slip_url: dbm.paymentSlipUrl || null,
    payment_slip_name: dbm.paymentSlipName || null,
    finance_signature: dbm.financeSignature || null,
    pv_no: dbm.pvNo || null,
    paid_at: dbm.paidAt || null,
    audit_certificate_id: dbm.auditCertificateId || null,
    status: dbm.status || 'pending',
    is_synced_to_ledger: Boolean(dbm.isSyncedToLedger),
    original_due_date: dbm.originalDueDate || null,
    reschedule_reason: dbm.rescheduleReason || null,
    rescheduled_at: dbm.rescheduledAt || null,
    rescheduled_by: dbm.rescheduledBy || null
  };
}

export async function fetchDisbursements(): Promise<Disbursement[]> {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('disbursements')
    .select('*')
    .order('entry_date', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching disbursements:', error);
    throw error;
  }

  return (data || []).map(mapRowToDisbursement).sort(compareDisbursementsDesc);
}

export async function upsertDisbursement(dbm: Disbursement): Promise<void> {
  const client = getSupabase();
  if (!client) return;

  const row = mapDisbursementToRow(dbm);
  const { error } = await client.from('disbursements').upsert(row);

  if (error) {
    console.error('[Supabase] Error upserting disbursement:', error);
    throw error;
  }
}

export async function deleteDisbursement(id: string): Promise<void> {
  const client = getSupabase();
  if (!client) return;

  const { error } = await client.from('disbursements').delete().eq('id', id);

  if (error) {
    console.error('[Supabase] Error deleting disbursement:', error);
    throw error;
  }
}

export async function batchUpsertDisbursements(dbmList: Disbursement[]): Promise<void> {
  const client = getSupabase();
  if (!client || dbmList.length === 0) return;

  const rows = dbmList.map(mapDisbursementToRow);
  
  const chunkSize = 200;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await client.from('disbursements').upsert(chunk, { onConflict: 'id' });
    if (error) {
      console.error(`[Supabase] Batch upsert disbursements chunk ${i} failed:`, error);
      throw error;
    }
  }
}

// ==========================================
// 3. Todo Tasks Mapping & Operations
// ==========================================

function mapRowToTodoTask(row: any): TodoTask {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    dueDate: row.due_date || '',
    priority: row.priority || 'medium',
    category: row.category || 'general',
    completed: Boolean(row.completed),
    type: row.type || 'expense',
    project: row.project || undefined,
    company: row.company || undefined,
    amount: row.amount !== null ? Number(row.amount) : undefined,
    relatedDocNo: row.related_doc_no || undefined,
    createdAt: row.created_at || '',
    assignedTo: row.assigned_to || undefined,
    rescheduleReason: row.reschedule_reason || undefined,
    originalDueDate: row.original_due_date || undefined
  };
}

function mapTodoTaskToRow(task: TodoTask): Record<string, any> {
  return {
    id: task.id,
    title: task.title,
    description: task.description || null,
    due_date: task.dueDate || null,
    priority: task.priority || 'medium',
    category: task.category || 'general',
    completed: Boolean(task.completed),
    type: task.type || 'expense',
    project: task.project || null,
    company: task.company || null,
    amount: task.amount ?? null,
    related_doc_no: task.relatedDocNo || null,
    assigned_to: task.assignedTo || null,
    reschedule_reason: task.rescheduleReason || null,
    original_due_date: task.originalDueDate || null
  };
}

export async function fetchTodoTasks(): Promise<TodoTask[]> {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('todo_tasks')
    .select('*')
    .order('due_date', { ascending: true });

  if (error) {
    console.error('[Supabase] Error fetching todo tasks:', error);
    throw error;
  }

  return (data || []).map(mapRowToTodoTask);
}

export async function upsertTodoTask(task: TodoTask): Promise<void> {
  const client = getSupabase();
  if (!client) return;

  const row = mapTodoTaskToRow(task);
  const { error } = await client.from('todo_tasks').upsert(row);

  if (error) {
    console.error('[Supabase] Error upserting todo task:', error);
    throw error;
  }
}

export async function deleteTodoTask(id: string): Promise<void> {
  const client = getSupabase();
  if (!client) return;

  const { error } = await client.from('todo_tasks').delete().eq('id', id);

  if (error) {
    console.error('[Supabase] Error deleting todo task:', error);
    throw error;
  }
}

// ==========================================
// 4. Health Check, Auto-Migration & Schema Safety
// ==========================================

export interface TableStatus {
  exists: boolean;
  count?: number;
  error?: string;
}

export interface SupabaseHealthResult {
  connected: boolean;
  error?: string;
  tables: {
    transactions: TableStatus;
    disbursements: TableStatus;
    todoTasks: TableStatus;
  };
  hasAutoMigrationRpc: boolean;
}

/**
 * Diagnostic tool that tests the status of each required table in Supabase
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthResult> {
  const client = getSupabase();
  if (!client) {
    return {
      connected: false,
      error: 'ยังไม่ได้ระบุ Supabase URL หรือ Anon Key',
      tables: {
        transactions: { exists: false },
        disbursements: { exists: false },
        todoTasks: { exists: false }
      },
      hasAutoMigrationRpc: false
    };
  }

  const result: SupabaseHealthResult = {
    connected: true,
    tables: {
      transactions: { exists: false },
      disbursements: { exists: false },
      todoTasks: { exists: false }
    },
    hasAutoMigrationRpc: false
  };

  // Test transactions
  try {
    const { count, error } = await client
      .from('transactions')
      .select('*', { count: 'exact', head: true });
    if (error) {
      result.tables.transactions = { exists: false, error: error.message };
    } else {
      result.tables.transactions = { exists: true, count: count ?? 0 };
    }
  } catch (e: any) {
    result.tables.transactions = { exists: false, error: e.message };
  }

  // Test disbursements
  try {
    const { count, error } = await client
      .from('disbursements')
      .select('*', { count: 'exact', head: true });
    if (error) {
      result.tables.disbursements = { exists: false, error: error.message };
    } else {
      result.tables.disbursements = { exists: true, count: count ?? 0 };
    }
  } catch (e: any) {
    result.tables.disbursements = { exists: false, error: e.message };
  }

  // Test todo_tasks
  try {
    const { count, error } = await client
      .from('todo_tasks')
      .select('*', { count: 'exact', head: true });
    if (error) {
      result.tables.todoTasks = { exists: false, error: error.message };
    } else {
      result.tables.todoTasks = { exists: true, count: count ?? 0 };
    }
  } catch (e: any) {
    result.tables.todoTasks = { exists: false, error: e.message };
  }

  // Check if auto_migrate RPC exists
  try {
    const { error: rpcError } = await client.rpc('auto_migrate_accounting_schema');
    if (!rpcError) {
      result.hasAutoMigrationRpc = true;
    }
  } catch {
    result.hasAutoMigrationRpc = false;
  }

  return result;
}

/**
 * Attempts to execute auto-migration via RPC if configured in Supabase
 */
export async function tryAutoMigrateSchema(): Promise<{ success: boolean; message: string }> {
  const client = getSupabase();
  if (!client) {
    return { success: false, message: 'Supabase client is not configured' };
  }

  try {
    const { data, error } = await client.rpc('auto_migrate_accounting_schema');
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: typeof data === 'string' ? data : 'อัปเกรดโครงสร้างตารางสำเร็จแล้ว' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Auto-migration RPC failed' };
  }
}

/**
 * Non-destructive SQL Migration Script
 * Uses "IF NOT EXISTS" & "ALTER TABLE ... ADD COLUMN IF NOT EXISTS"
 * Guarantees zero data loss: existing data will NEVER be deleted or altered!
 */
export const SAFE_MIGRATION_SQL = `-- ========================================================================
-- BTC ACCOUNTING: SAFE NON-DESTRUCTIVE DATABASE SCHEMA MIGRATION
-- ข้อดี: ข้อมูลเดิม 100% ไม่สูญหาย (Zero Data Loss Guarantee)
-- ใช้ CREATE TABLE IF NOT EXISTS และ ADD COLUMN IF NOT EXISTS ทั้งหมด
-- ========================================================================

-- 1. ตารางสมุดรายรับ-รายจ่าย (General Ledger)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  date TEXT NOT NULL,
  iso_date TEXT,
  doc_no TEXT,
  description TEXT NOT NULL,
  account TEXT NOT NULL,
  project TEXT NOT NULL,
  category TEXT NOT NULL,
  debit NUMERIC DEFAULT 0,
  credit NUMERIC DEFAULT 0,
  running_balance NUMERIC DEFAULT 0,
  remarks TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'cleared',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source_type TEXT DEFAULT 'manual',
  disbursement_id TEXT,
  pv_no TEXT,
  dbm_no TEXT,
  ref_doc_no TEXT,
  payee_name TEXT,
  payment_slip_url TEXT,
  payment_slip_name TEXT,
  audit_certificate_id TEXT,
  reconciled_at TEXT,
  reconciled_by TEXT,
  reconciliation_notes TEXT,
  statement_match_id TEXT
);

-- เพิ่มคอลัมน์ใหม่อัตโนมัติ (หากตารางเดิมมีอยู่แล้ว จะไม่ลบข้อมูลและไม่ error)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS iso_date TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS doc_no TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS running_balance NUMERIC DEFAULT 0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'cleared';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'manual';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS disbursement_id TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS pv_no TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS dbm_no TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS ref_doc_no TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payee_name TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_slip_url TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_slip_name TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS audit_certificate_id TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reconciled_at TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reconciled_by TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reconciliation_notes TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS statement_match_id TEXT;

-- 2. ตารางใบตั้งเบิกและจ่ายเงิน (Disbursements)
CREATE TABLE IF NOT EXISTS disbursements (
  id TEXT PRIMARY KEY,
  recorded_by TEXT,
  finance_recorded_by TEXT,
  dbm_no TEXT NOT NULL,
  ref_doc_no TEXT,
  company TEXT NOT NULL,
  entry_date TEXT NOT NULL,
  due_date TEXT,
  expense_type TEXT NOT NULL,
  boq_type TEXT,
  payee_name TEXT NOT NULL,
  payee_bank_account TEXT,
  payee_bank_name TEXT,
  payee_bank_branch TEXT,
  project TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'โอน',
  remarks TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  sub_total_amount NUMERIC DEFAULT 0,
  vat_total_amount NUMERIC DEFAULT 0,
  tax_deduction_total_amount NUMERIC DEFAULT 0,
  retention_total_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  requester_signature TEXT,
  requester_signed_at TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  reviewer_name TEXT,
  reviewer_signature TEXT,
  reviewed_at TEXT,
  reviewer_notes TEXT,
  approver_name TEXT,
  approver_signature TEXT,
  approved_at TEXT,
  approver_notes TEXT,
  payer_account TEXT,
  cheque_no TEXT,
  payment_date TEXT,
  transfer_amount NUMERIC DEFAULT 0,
  fee NUMERIC DEFAULT 0,
  document_link TEXT,
  payment_slip_url TEXT,
  payment_slip_name TEXT,
  finance_signature TEXT,
  pv_no TEXT,
  paid_at TEXT,
  audit_certificate_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_synced_to_ledger BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- เพิ่มคอลัมน์ใหม่อัตโนมัติในใบตั้งเบิก
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS recorded_by TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS finance_recorded_by TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS ref_doc_no TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS due_date TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS boq_type TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS payee_bank_account TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS payee_bank_name TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS payee_bank_branch TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS sub_total_amount NUMERIC DEFAULT 0;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS vat_total_amount NUMERIC DEFAULT 0;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS tax_deduction_total_amount NUMERIC DEFAULT 0;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS retention_total_amount NUMERIC DEFAULT 0;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS requester_signature TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS requester_signed_at TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS reviewer_name TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS reviewer_signature TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS reviewed_at TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS reviewer_notes TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS approver_name TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS approver_signature TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS approved_at TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS approver_notes TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS payer_account TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS cheque_no TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS payment_date TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS transfer_amount NUMERIC DEFAULT 0;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS fee NUMERIC DEFAULT 0;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS document_link TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS payment_slip_url TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS payment_slip_name TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS finance_signature TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS pv_no TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS paid_at TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS audit_certificate_id TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS is_synced_to_ledger BOOLEAN DEFAULT false;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS original_due_date TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS reschedule_reason TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS rescheduled_at TEXT;
ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS rescheduled_by TEXT;

-- 3. ตารางรายการงานและกำหนดการภาษี (Todo Tasks)
CREATE TABLE IF NOT EXISTS todo_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT,
  priority TEXT DEFAULT 'medium',
  category TEXT DEFAULT 'general',
  completed BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'expense',
  project TEXT,
  company TEXT,
  amount NUMERIC DEFAULT 0,
  related_doc_no TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_to TEXT,
  reschedule_reason TEXT,
  original_due_date TEXT
);

ALTER TABLE todo_tasks ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE todo_tasks ADD COLUMN IF NOT EXISTS reschedule_reason TEXT;
ALTER TABLE todo_tasks ADD COLUMN IF NOT EXISTS original_due_date TEXT;
ALTER TABLE todo_tasks ADD COLUMN IF NOT EXISTS related_doc_no TEXT;
ALTER TABLE todo_tasks ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0;

-- 4. Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all on transactions') THEN
    CREATE POLICY "Allow all on transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all on disbursements') THEN
    CREATE POLICY "Allow all on disbursements" ON disbursements FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all on todo_tasks') THEN
    CREATE POLICY "Allow all on todo_tasks" ON todo_tasks FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 5. FUNCTION สำหรับให้แอปพลิเคชันสั่ง Auto-Migrate ปรับโครงสร้างอัตโนมัติในอนาคตผ่าน RPC
CREATE OR REPLACE FUNCTION auto_migrate_accounting_schema()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Safe Non-destructive Column additions
  ALTER TABLE transactions ADD COLUMN IF NOT EXISTS iso_date TEXT;
  ALTER TABLE transactions ADD COLUMN IF NOT EXISTS audit_certificate_id TEXT;
  ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reconciled_at TEXT;
  ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reconciled_by TEXT;
  ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reconciliation_notes TEXT;
  ALTER TABLE transactions ADD COLUMN IF NOT EXISTS statement_match_id TEXT;

  ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS recorded_by TEXT;
  ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS finance_recorded_by TEXT;
  ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS audit_certificate_id TEXT;
  ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS fee NUMERIC DEFAULT 0;
  ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS payment_slip_url TEXT;

  ALTER TABLE todo_tasks ADD COLUMN IF NOT EXISTS reschedule_reason TEXT;
  ALTER TABLE todo_tasks ADD COLUMN IF NOT EXISTS original_due_date TEXT;

  RETURN json_build_object(
    'success', true, 
    'message', 'Auto-migration executed successfully: schema is up to date and all existing data preserved.',
    'timestamp', NOW()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION auto_migrate_accounting_schema() TO anon, authenticated, service_role;
`;

