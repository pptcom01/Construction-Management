-- ==============================================================================
-- BTC Accounting & Disbursement System - Supabase Production Schema
-- Run this SQL in your Supabase Project's "SQL Editor" tab to create the tables.
-- ==============================================================================

-- 1. Transactions Table (สมุดบัญชีรายรับ-รายจ่าย / สมุดรายวันทั่วไป)
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
  
  -- PV & Reconciliation fields
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

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_tx_iso_date ON transactions (iso_date DESC);
CREATE INDEX IF NOT EXISTS idx_tx_project ON transactions (project);
CREATE INDEX IF NOT EXISTS idx_tx_account ON transactions (account);
CREATE INDEX IF NOT EXISTS idx_tx_company ON transactions (company);

-- 2. Disbursements Table (ระบบใบตั้งเบิกจ่าย & บันทึกการจ่ายเงิน)
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
  
  -- Requester & Attachments
  requester_signature TEXT,
  requester_signed_at TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Review & Approval
  reviewer_name TEXT,
  reviewer_signature TEXT,
  reviewed_at TEXT,
  reviewer_notes TEXT,
  approver_name TEXT,
  approver_signature TEXT,
  approved_at TEXT,
  approver_notes TEXT,
  
  -- Finance & Payment
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

CREATE INDEX IF NOT EXISTS idx_dbm_dbm_no ON disbursements (dbm_no);
CREATE INDEX IF NOT EXISTS idx_dbm_status ON disbursements (status);
CREATE INDEX IF NOT EXISTS idx_dbm_project ON disbursements (project);
CREATE INDEX IF NOT EXISTS idx_dbm_entry_date ON disbursements (entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_dbm_payment_date ON disbursements (payment_date DESC);

-- 3. Todo Tasks Table (งานที่ต้องทำ & รายการแจ้งเตือนภาษี)
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

CREATE INDEX IF NOT EXISTS idx_todo_due_date ON todo_tasks (due_date ASC);
CREATE INDEX IF NOT EXISTS idx_todo_completed ON todo_tasks (completed);

-- Enable RLS and add public access policies for anon key
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;

-- Allow read/write for all authenticated or anon clients with the Anon key
CREATE POLICY IF NOT EXISTS "Allow all for anon on transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for anon on disbursements" ON disbursements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for anon on todo_tasks" ON todo_tasks FOR ALL USING (true) WITH CHECK (true);
