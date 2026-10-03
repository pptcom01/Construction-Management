import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Transaction, TodoTask, ViewTab, Disbursement, UserRole } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DisbursementsView } from './components/DisbursementsView';
import { PaymentView } from './components/PaymentView';
import { TransactionsView } from './components/TransactionsView';
import { ProjectsView } from './components/ProjectsView';
import { AccountsView } from './components/AccountsView';
import { TaxSummaryView } from './components/TaxSummaryView';
import { ReportsView } from './components/ReportsView';
import { TodoistView } from './components/TodoistView';
import { NewTransactionModal } from './components/NewTransactionModal';
import { NewDisbursementModal } from './components/NewDisbursementModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { DisbursementDetailModal } from './components/DisbursementDetailModal';
import { ReviewApprovalModal } from './components/ReviewApprovalModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { AIAnalysisView } from './components/AIAnalysisView';
import { CSVImportModal, ImportTarget } from './components/CSVImportModal';
import { SupabaseStatusModal } from './components/SupabaseStatusModal';
import { UserProfileModal } from './components/UserProfileModal';
import { GoogleMasterSyncModal } from './components/GoogleMasterSyncModal';
import { getAccessToken, initAuth } from './services/googleAuthService';
import { cleanupOrphanedDriveAttachments, deleteFileFromDrive } from './services/googleDriveService';
import { SubcontractView } from './components/SubcontractView';
import { BOQManagementView } from './components/BOQManagementView';
import { ProcurementView } from './components/ProcurementView';
import { SupplierBillingView } from './components/SupplierBillingView';
import { DocumentTemplatesView } from './components/DocumentTemplatesView';
import { LoginView } from './components/LoginView';
import { UserManagementView } from './components/UserManagementView';
import { getCurrentUser, logoutUser, hasTabPermission } from './services/userService';
import { AppUser } from './types';
import { 
  Subcontract, 
  SubcontractInspection, 
  SubcontractPaymentClaim, 
  RetentionLedgerRecord, 
  ProjectBOQItem,
  BOQMaterialItem,
  RFQComparisonItem,
  MaterialBackchargeItem,
  SupplierBilling,
  GoodsReceiptItem
} from './types';
import { 
  INITIAL_BOQ_ITEMS, 
  INITIAL_SUBCONTRACTS, 
  INITIAL_INSPECTIONS, 
  INITIAL_PAYMENT_CLAIMS, 
  INITIAL_RETENTION_LEDGER 
} from './data/subcontractData';
import {
  INITIAL_RFQS,
  INITIAL_BACKCHARGES,
  INITIAL_SUPPLIER_BILLINGS,
  INITIAL_GOODS_RECEIPTS
} from './data/procurementData';
import { UpsertResult } from './utils/csvParser';
import { exportTransactionsToCSV, calculateFinancialSummary, compareDisbursementsDesc, compareTransactionsDesc, mapDisbursementToAccountingCategory, formatCurrency } from './utils/accounting';
import { 
  fetchTransactions, 
  upsertTransaction, 
  deleteTransaction, 
  batchUpsertTransactions,
  fetchDisbursements,
  upsertDisbursement,
  deleteDisbursement,
  batchUpsertDisbursements,
  fetchTodoTasks,
  upsertTodoTask,
  deleteTodoTask
} from './services/supabaseService';
import { isSupabaseConfigured, getIsSupabaseConfigured } from './lib/supabase';
import { AlertTriangle, Database, Loader2, Lock, ShieldAlert } from 'lucide-react';
import { DatabaseSuggestionsProvider } from './context/DatabaseSuggestionsContext';

export default function App() {
  // Real data state stored 100% in Supabase - No localStorage, No mock datasets
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [todoTasks, setTodoTasks] = useState<TodoTask[]>([]);

  // Subcontractor & BOQ State
  const [subcontracts, setSubcontracts] = useState<Subcontract[]>(() => {
    try {
      const saved = localStorage.getItem('btc_subcontracts');
      return saved ? JSON.parse(saved) : INITIAL_SUBCONTRACTS;
    } catch {
      return INITIAL_SUBCONTRACTS;
    }
  });

  const [inspections, setInspections] = useState<SubcontractInspection[]>(() => {
    try {
      const saved = localStorage.getItem('btc_inspections');
      return saved ? JSON.parse(saved) : INITIAL_INSPECTIONS;
    } catch {
      return INITIAL_INSPECTIONS;
    }
  });

  const [paymentClaims, setPaymentClaims] = useState<SubcontractPaymentClaim[]>(() => {
    try {
      const saved = localStorage.getItem('btc_payment_claims');
      return saved ? JSON.parse(saved) : INITIAL_PAYMENT_CLAIMS;
    } catch {
      return INITIAL_PAYMENT_CLAIMS;
    }
  });

  const [retentionLedger, setRetentionLedger] = useState<RetentionLedgerRecord[]>(() => {
    try {
      const saved = localStorage.getItem('btc_retention_ledger');
      return saved ? JSON.parse(saved) : INITIAL_RETENTION_LEDGER;
    } catch {
      return INITIAL_RETENTION_LEDGER;
    }
  });

  const [boqItems, setBoqItems] = useState<ProjectBOQItem[]>(() => {
    try {
      const saved = localStorage.getItem('btc_boq_items');
      return saved ? JSON.parse(saved) : INITIAL_BOQ_ITEMS;
    } catch {
      return INITIAL_BOQ_ITEMS;
    }
  });

  // Procurement & Billing State
  const [rfqs, setRfqs] = useState<RFQComparisonItem[]>(() => {
    try {
      const saved = localStorage.getItem('btc_procurement_rfqs');
      return saved ? JSON.parse(saved) : INITIAL_RFQS;
    } catch {
      return INITIAL_RFQS;
    }
  });

  const [backcharges, setBackcharges] = useState<MaterialBackchargeItem[]>(() => {
    try {
      const saved = localStorage.getItem('btc_material_backcharges');
      return saved ? JSON.parse(saved) : INITIAL_BACKCHARGES;
    } catch {
      return INITIAL_BACKCHARGES;
    }
  });

  const [supplierBillings, setSupplierBillings] = useState<SupplierBilling[]>(() => {
    try {
      const saved = localStorage.getItem('btc_supplier_billings');
      return saved ? JSON.parse(saved) : INITIAL_SUPPLIER_BILLINGS;
    } catch {
      return INITIAL_SUPPLIER_BILLINGS;
    }
  });

  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceiptItem[]>(() => {
    try {
      const saved = localStorage.getItem('btc_goods_receipts');
      return saved ? JSON.parse(saved) : INITIAL_GOODS_RECEIPTS;
    } catch {
      return INITIAL_GOODS_RECEIPTS;
    }
  });

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem('btc_subcontracts', JSON.stringify(subcontracts));
  }, [subcontracts]);
  useEffect(() => {
    localStorage.setItem('btc_inspections', JSON.stringify(inspections));
  }, [inspections]);
  useEffect(() => {
    localStorage.setItem('btc_payment_claims', JSON.stringify(paymentClaims));
  }, [paymentClaims]);
  useEffect(() => {
    localStorage.setItem('btc_retention_ledger', JSON.stringify(retentionLedger));
  }, [retentionLedger]);
  useEffect(() => {
    localStorage.setItem('btc_boq_items', JSON.stringify(boqItems));
  }, [boqItems]);
  useEffect(() => {
    localStorage.setItem('btc_procurement_rfqs', JSON.stringify(rfqs));
  }, [rfqs]);
  useEffect(() => {
    localStorage.setItem('btc_material_backcharges', JSON.stringify(backcharges));
  }, [backcharges]);
  useEffect(() => {
    localStorage.setItem('btc_supplier_billings', JSON.stringify(supplierBillings));
  }, [supplierBillings]);
  useEffect(() => {
    localStorage.setItem('btc_goods_receipts', JSON.stringify(goodsReceipts));
  }, [goodsReceipts]);

  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(getIsSupabaseConfigured());
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [dbErrorMessage, setDbErrorMessage] = useState<string | null>(null);

  // Check Google token on mount
  useEffect(() => {
    getAccessToken().then(token => setIsGoogleConnected(Boolean(token)));
  }, []);

  // Navigation and UI state
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [txSearchFilter, setTxSearchFilter] = useState<string>('');
  
  // Modals
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [newTxInitialType, setNewTxInitialType] = useState<'expense' | 'income'>('expense');

  const handleOpenNewTx = (type: 'expense' | 'income' = 'expense') => {
    setEditingTransaction(null);
    setNewTxInitialType(type);
    setIsNewTxModalOpen(true);
  };
  
  // Disbursement Modals
  const [isNewDisbursementModalOpen, setIsNewDisbursementModalOpen] = useState(false);
  const [editingDisbursement, setEditingDisbursement] = useState<Disbursement | null>(null);
  const [selectedDisbursement, setSelectedDisbursement] = useState<Disbursement | null>(null);
  const [isDisbursementDetailOpen, setIsDisbursementDetailOpen] = useState(false);
  const [isRecordTransferModalOpen, setIsRecordTransferModalOpen] = useState(false);
  const [transferDisbursement, setTransferDisbursement] = useState<Disbursement | null>(null);
  const [reviewingDisbursement, setReviewingDisbursement] = useState<Disbursement | null>(null);

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTarget, setImportTarget] = useState<ImportTarget>('auto');

  // Authentication & Role-Based Access Control (RBAC)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentUser());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => Boolean(getCurrentUser()));

  const [userRole, setUserRole] = useState<UserRole>(() => {
    const user = getCurrentUser();
    return user ? user.role : ((localStorage.getItem('btc_user_role') as UserRole) || 'admin');
  });
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    localStorage.setItem('btc_user_role', newRole);
    if (currentUser) {
      const updatedUser: AppUser = {
        ...currentUser,
        role: newRole === 'admin' ? 'admin' : newRole === 'manager' ? 'manager' : 'user'
      };
      setCurrentUser(updatedUser);
    }
    showToast(
      newRole === 'admin' 
        ? '👑 เข้าสู่โหมด Admin: สิทธิ์เต็มรูปแบบ 100%' 
        : newRole === 'manager' || newRole === 'executive'
          ? '💼 เข้าสู่โหมด Manager: สิทธิ์ผู้บริหารและอนุมัติเอกสาร'
          : '🔒 สลับเข้าสู่โหมด User: ซ่อนยอดเงินและบัญชีธนาคารแล้ว'
    );
  };

  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setUserRole(user.role);
    setIsLoggedIn(true);
    showToast(`ยินดีต้อนรับ ${user.name} เข้าสู่ระบบ (${user.role.toUpperCase()})`);
    if (!hasTabPermission(user, currentTab)) {
      setCurrentTab(user.role === 'user' ? 'disbursements' : 'dashboard');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsLoggedIn(false);
    showToast('ออกจากระบบเรียบร้อยแล้ว');
  };

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load real data from Supabase 100%
  const loadAllData = useCallback(async () => {
    const configured = getIsSupabaseConfigured();
    setIsConfigured(configured);
    setIsLoadingData(true);
    setDbErrorMessage(null);
    if (configured) {
      try {
        const [txData, dbmData, taskData] = await Promise.all([
          fetchTransactions(),
          fetchDisbursements(),
          fetchTodoTasks()
        ]);
        setTransactions(txData);
        setDisbursements(dbmData);
        setTodoTasks(taskData);
      } catch (err: any) {
        console.error('Error fetching data from Supabase:', err);
        setDbErrorMessage(err.message || 'ไม่สามารถติดต่อ Supabase ได้');
        showToast('แจ้งเตือน: ' + (err.message || 'ไม่สามารถโหลดข้อมูลจาก Supabase กรุณาตรวจสอบการสร้างตาราง SQL'));
      }
    } else {
      // Supabase is not configured yet - empty state, no mock data
      setTransactions([]);
      setDisbursements([]);
      setTodoTasks([]);
    }
    setIsLoadingData(false);
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Auto-sync all paid disbursements into the General Ledger (GL) automatically.
  // Completely eliminates the need for users to manually click any sync button.
  useEffect(() => {
    setTransactions(prevTransactions => {
      const unlinkedPaid = disbursements.filter(dbm => {
        if (dbm.status !== 'paid') return false;
        const amount = dbm.transferAmount || dbm.totalAmount;
        if (!amount || amount <= 0) return false;
        
        const alreadyInLedger = prevTransactions.some(t => 
          (t.disbursementId && t.disbursementId === dbm.id) ||
          (t.pvNo && dbm.pvNo && t.pvNo === dbm.pvNo) ||
          (t.docNo && (t.docNo === dbm.pvNo || t.docNo === dbm.dbmNo || t.docNo === dbm.refDocNo)) ||
          (t.description && (t.description.includes(dbm.dbmNo) || (dbm.pvNo && t.description.includes(dbm.pvNo))))
        );
        return !alreadyInLedger;
      });

      if (unlinkedPaid.length === 0) return prevTransactions;

      const newTxs: Transaction[] = unlinkedPaid.map(dbm => {
        const pvDocNo = dbm.pvNo || (dbm.dbmNo ? `PV-${dbm.dbmNo.replace(/\D/g, '').slice(-4)}` : 'PV-AUTO');
        return {
          id: `tx_pv_${dbm.id}`,
          company: dbm.company || 'BTC',
          date: dbm.paymentDate || dbm.entryDate || '15/01/2568',
          isoDate: dbm.dueDate && dbm.dueDate !== '-' ? dbm.dueDate : new Date().toISOString().slice(0, 10),
          docNo: pvDocNo,
          description: `[${pvDocNo}] ${dbm.expenseType || 'ค่าใช้จ่ายก่อสร้าง'} - ${dbm.payeeName || 'ผู้รับเงิน'}`,
          category: mapDisbursementToAccountingCategory(dbm.expenseType, dbm.payeeName),
          account: dbm.payerAccount || 'BBL #297-3-033893 (BTC กระแสรายวัน)',
          project: dbm.project || '(00) สำนักงานใหญ่',
          debit: 0,
          credit: dbm.transferAmount || dbm.totalAmount,
          remarks: `ใบสำคัญจ่าย ${pvDocNo} | อ้างอิงขอเบิก ${dbm.dbmNo || '-'} | เช็ค/Ref: ${dbm.chequeNo || '-'} | จ่ายให้: ${dbm.payeeName} ${dbm.documentLink ? `| แนบ: ${dbm.documentLink}` : ''}`,
          status: 'pending', // Pending Bank Statement Reconciliation
          sourceType: 'pv',
          disbursementId: dbm.id,
          pvNo: pvDocNo,
          dbmNo: dbm.dbmNo,
          refDocNo: dbm.refDocNo,
          payeeName: dbm.payeeName,
          paymentSlipUrl: dbm.documentLink,
          auditCertificateId: dbm.auditCertificateId,
          createdAt: new Date().toISOString()
        };
      });

      return [...newTxs, ...prevTransactions].sort(compareTransactionsDesc);
    });
  }, [disbursements]);


  // Compute pending counts
  const pendingTasksCount = useMemo(() => {
    return todoTasks.filter(t => !t.completed).length;
  }, [todoTasks]);

  const pendingDisbursementsCount = useMemo(() => {
    return disbursements.filter(d => d.status === 'pending_review' || d.status === 'pending' || d.status === 'approved').length;
  }, [disbursements]);

  // Compute net balance
  const financialSummary = useMemo(() => {
    return calculateFinancialSummary(transactions);
  }, [transactions]);

  // Extract lists for dropdown selectors
  const projectsList = useMemo(() => {
    const pSet = new Set<string>();
    transactions.forEach(t => { if (t.project) pSet.add(t.project); });
    subcontracts.forEach(s => { if (s.project) pSet.add(s.project); });
    boqItems.forEach(b => { if (b.project) pSet.add(b.project); });
    return Array.from(pSet).sort();
  }, [transactions, subcontracts, boqItems]);

  const accountsList = useMemo(() => {
    const aSet = new Set<string>();
    transactions.forEach(t => { if (t.account) aSet.add(t.account); });
    return Array.from(aSet).sort();
  }, [transactions]);

  const companiesList = useMemo(() => {
    const cSet = new Set<string>();
    transactions.forEach(t => { if (t.company) cSet.add(t.company); });
    return Array.from(cSet);
  }, [transactions]);

  // Disbursement Handlers
  const handleSaveDisbursement = async (data: Omit<Disbursement, 'id'>, existingId?: string) => {
    let targetDbm: Disbursement;
    if (existingId) {
      // Find old disbursement to check for removed attachments (Garbage Collection)
      const oldDbm = disbursements.find(d => d.id === existingId);
      if (oldDbm && oldDbm.attachments && oldDbm.attachments.length > 0) {
        const newAtts = data.attachments || [];
        cleanupOrphanedDriveAttachments(oldDbm.attachments, newAtts).then(cleaned => {
          if (cleaned > 0) console.log(`[Google Drive GC] Cleaned up ${cleaned} orphaned files`);
        }).catch(console.error);
      }

      targetDbm = {
        ...data,
        id: existingId
      };
      setDisbursements(prev => prev.map(item => (item.id === existingId ? targetDbm : item)));
      showToast('แก้ไขใบตั้งเบิกเรียบร้อยแล้ว');
    } else {
      targetDbm = {
        ...data,
        id: `dbm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      };
      setDisbursements(prev => [targetDbm, ...prev].sort(compareDisbursementsDesc));
      showToast('สร้างใบขอตั้งเบิกสำเร็จ และส่งต่อไปยังขั้นตอนตรวจสอบแล้ว');
    }
    setEditingDisbursement(null);

    if (isSupabaseConfigured) {
      try {
        await upsertDisbursement(targetDbm);
      } catch (e: any) {
        console.error('Supabase save disbursement error:', e);
        showToast('บันทึกในแอปสำเร็จ แต่ส่งไปยัง Supabase ล้มเหลว: ' + e.message);
      }
    }
  };

  const handleDeleteDisbursement = async (id: string) => {
    const targetDbm = disbursements.find(d => d.id === id);
    // Cleanup any Drive files attached to this deleted disbursement
    if (targetDbm && targetDbm.attachments && targetDbm.attachments.length > 0) {
      targetDbm.attachments.forEach(att => {
        if (att.driveFileId) {
          deleteFileFromDrive(att.driveFileId).catch(console.error);
        }
      });
    }

    setDisbursements(prev => prev.filter(d => d.id !== id));
    // Synchronously clean up any linked transaction in the General Ledger
    setTransactions(prev => prev.filter(t => t.disbursementId !== id && t.id !== `tx_pv_${id}` && t.id !== `tx_dbm_${id}`));
    showToast('ลบใบตั้งเบิกและรายการที่เชื่อมโยงในสมุดบัญชีเรียบร้อยแล้ว');

    if (isSupabaseConfigured) {
      try {
        await deleteDisbursement(id);
        await deleteTransaction(`tx_pv_${id}`);
      } catch (e: any) {
        console.error('Supabase delete disbursement error:', e);
      }
    }
  };

  const handleTogglePaidDisbursement = async (id: string) => {
    let changedDbm: Disbursement | undefined;
    let isRevertedToPending = false;

    setDisbursements(prev => prev.map(d => {
      if (d.id === id) {
        const nextStatus = (d.status === 'paid' ? 'pending' : 'paid') as Disbursement['status'];
        if (nextStatus === 'pending') {
          isRevertedToPending = true;
        }
        const today = new Date();
        const thaiDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear() + 543}`;
        changedDbm = {
          ...d,
          status: nextStatus,
          paymentDate: nextStatus === 'paid' ? (d.paymentDate || thaiDate) : '',
          transferAmount: nextStatus === 'paid' ? (d.transferAmount || d.totalAmount) : 0,
          isSyncedToLedger: nextStatus === 'paid'
        };
        return changedDbm;
      }
      return d;
    }));

    if (isRevertedToPending) {
      // Revert ledger transaction
      setTransactions(prev => prev.filter(t => t.disbursementId !== id && t.id !== `tx_pv_${id}` && t.id !== `tx_dbm_${id}`));
      showToast('ปรับสถานะเป็นรอดำเนินการ และยกเลิกการลงบัญชีชั่วคราว');
      if (isSupabaseConfigured) {
        if (changedDbm) await upsertDisbursement(changedDbm);
        await deleteTransaction(`tx_pv_${id}`);
      }
    } else if (changedDbm) {
      handleSyncDisbursementsToLedger([changedDbm]);
      if (isSupabaseConfigured) {
        await upsertDisbursement(changedDbm);
      }
    }
  };

  // Handler: Review and Approval Workflow
  const handleApproveDisbursement = async (
    id: string,
    reviewerData: {
      role: 'reviewer' | 'approver';
      name: string;
      signature: string;
      notes: string;
      status: 'approved' | 'rejected' | 'pending';
    }
  ) => {
    let updatedDbm: Disbursement | undefined;

    setDisbursements(prev => prev.map(d => {
      if (d.id === id) {
        if (reviewerData.role === 'reviewer') {
          updatedDbm = {
            ...d,
            reviewerName: reviewerData.name,
            reviewerSignature: reviewerData.signature,
            reviewedAt: new Date().toISOString(),
            reviewerNotes: reviewerData.notes,
            status: reviewerData.status
          };
        } else {
          updatedDbm = {
            ...d,
            approverName: reviewerData.name,
            approverSignature: reviewerData.signature,
            approvedAt: new Date().toISOString(),
            approverNotes: reviewerData.notes,
            status: reviewerData.status
          };
        }
        return updatedDbm;
      }
      return d;
    }));

    showToast(reviewerData.status === 'rejected' ? 'ตีกลับใบตั้งเบิกแล้ว' : 'อนุมัติใบตั้งเบิก และส่งต่อไปยังฝ่ายการเงินเรียบร้อยแล้ว');

    if (isSupabaseConfigured && updatedDbm) {
      try {
        await upsertDisbursement(updatedDbm);
      } catch (e: any) {
        console.error('Supabase approve error:', e);
      }
    }
  };

  // Handler: Save Finance Transfer Details (Workflow 2 / Steps 3-4)
  // Automatically posts the paid disbursement to the General Ledger (Transactions) with status 'pending'
  // for executive bank statement reconciliation, eliminating manual re-entry.
  const handleConfirmPayment = async (
    id: string,
    paymentData: {
      payerAccount: string;
      chequeNo: string;
      paymentDate: string;
      transferAmount: number;
      fee: number;
      paymentMethod?: string;
      documentLink?: string;
      paymentSlipUrl?: string;
      paymentSlipName?: string;
      financeRecordedBy?: string;
      financeSignature?: string;
      pvNo?: string;
      paidAt?: string;
      auditCertificateId?: string;
      status: 'paid' | 'pending';
    }
  ) => {
    let targetDbm: Disbursement | undefined;

    setDisbursements(prev => prev.map(d => {
      if (d.id === id) {
        targetDbm = {
          ...d,
          ...paymentData,
          status: paymentData.status,
          isSyncedToLedger: true
        };
        return targetDbm;
      }
      return d;
    }));

    // Auto-create or update transaction in the ledger
    if (paymentData.status === 'paid') {
      const currentDbm = targetDbm || disbursements.find(d => d.id === id);
      const pvDocNo = paymentData.pvNo || currentDbm?.pvNo || (currentDbm ? `PV-${currentDbm.dbmNo.replace(/\D/g, '').slice(-4)}` : 'PV-AUTO');
      const txId = `tx_pv_${id}`;

      // Map category accurately from expenseType & payee
      const category = mapDisbursementToAccountingCategory(currentDbm?.expenseType, currentDbm?.payeeName);

      const autoTx: Transaction = {
        id: txId,
        company: currentDbm?.company || 'BTC',
        date: paymentData.paymentDate || '15/01/2568',
        isoDate: currentDbm?.dueDate && currentDbm.dueDate !== '-' ? currentDbm.dueDate : new Date().toISOString().slice(0, 10),
        docNo: pvDocNo,
        description: `[${pvDocNo}] ${currentDbm?.expenseType || 'ค่าใช้จ่ายก่อสร้าง'} - ${currentDbm?.payeeName || 'ผู้รับเงิน'}`,
        category: category,
        account: paymentData.payerAccount || currentDbm?.payerAccount || 'BBL #297-3-033893 (BTC กระแสรายวัน)',
        project: currentDbm?.project || 'สำนักงานใหญ่ (00)',
        debit: 0,
        credit: paymentData.transferAmount || currentDbm?.totalAmount || 0,
        remarks: `ใบสำคัญจ่าย ${pvDocNo} | อ้างอิงขอเบิก ${currentDbm?.dbmNo || '-'} | บัญชีผู้รับ: ${currentDbm?.payeeBankAccount || '-'} | จ่ายโดย: ${paymentData.financeRecordedBy || '-'} | เช็ค/Ref: ${paymentData.chequeNo || '-'} | Cert: ${paymentData.auditCertificateId || '-'}`,
        status: 'pending', // Pending Bank Statement Reconciliation
        sourceType: 'pv',
        disbursementId: id,
        pvNo: pvDocNo,
        dbmNo: currentDbm?.dbmNo,
        refDocNo: currentDbm?.refDocNo,
        payeeName: currentDbm?.payeeName,
        paymentSlipUrl: paymentData.paymentSlipUrl,
        paymentSlipName: paymentData.paymentSlipName,
        auditCertificateId: paymentData.auditCertificateId,
        createdAt: new Date().toISOString()
      };

      setTransactions(prev => {
        const existingIdx = prev.findIndex(t => t.id === txId || (t.disbursementId && t.disbursementId === id) || (t.docNo && t.docNo === pvDocNo));
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...autoTx };
          return updated;
        } else {
          return [autoTx, ...prev];
        }
      });

      showToast(`บันทึกจ่ายเงิน ${pvDocNo} สำเร็จ! ระบบส่งต่อเข้าระบบบัญชีอัตโนมัติ (รอกระทบยอดกับ Statement ธนาคาร)`);

      if (isSupabaseConfigured) {
        try {
          if (targetDbm) await upsertDisbursement(targetDbm);
          await upsertTransaction(autoTx);
        } catch (e: any) {
          console.error('Supabase confirm payment error:', e);
        }
      }
    } else {
      showToast(`บันทึกสถานะเรียบร้อยแล้ว`);
      if (isSupabaseConfigured && targetDbm) {
        try {
          await upsertDisbursement(targetDbm);
        } catch (e: any) {
          console.error('Supabase update status error:', e);
        }
      }
    }
  };

  // Handler: Reconcile single transaction with Bank Statement
  const handleReconcileTransaction = async (
    id: string, 
    isReconciled: boolean, 
    auditorName: string = 'ผู้บริหาร / สมุห์บัญชี', 
    notes?: string
  ) => {
    let updatedTx: Transaction | undefined;

    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        updatedTx = {
          ...t,
          status: isReconciled ? 'reconciled' : 'pending',
          reconciledAt: isReconciled ? new Date().toISOString() : undefined,
          reconciledBy: isReconciled ? auditorName : undefined,
          reconciliationNotes: notes !== undefined ? notes : t.reconciliationNotes
        };
        return updatedTx;
      }
      return t;
    }));

    showToast(isReconciled ? 'ยืนยันกระทบยอดตรงกับ Statement ธนาคารแล้ว ✓' : 'ยกเลิกการกระทบยอด (กลับสู่สถานะรอตรวจสอบ)');

    if (isSupabaseConfigured && updatedTx) {
      try {
        await upsertTransaction(updatedTx);
      } catch (e: any) {
        console.error('Supabase reconcile error:', e);
      }
    }
  };

  // Handler: Batch Reconcile transactions
  const handleBatchReconcile = async (ids: string[], auditorName: string = 'ผู้บริหาร / สมุห์บัญชี') => {
    if (ids.length === 0) return;
    const reconciledList: Transaction[] = [];

    setTransactions(prev => prev.map(t => {
      if (ids.includes(t.id)) {
        const updated = {
          ...t,
          status: 'reconciled' as const,
          reconciledAt: new Date().toISOString(),
          reconciledBy: auditorName
        };
        reconciledList.push(updated);
        return updated;
      }
      return t;
    }));

    showToast(`ยืนยันกระทบยอดกับ Statement สำเร็จ ${ids.length} รายการ เรียบร้อยแล้ว ✓`);

    if (isSupabaseConfigured && reconciledList.length > 0) {
      try {
        await batchUpsertTransactions(reconciledList);
      } catch (e: any) {
        console.error('Supabase batch reconcile error:', e);
      }
    }
  };

  const handleSaveTransfer = (
    id: string,
    transferData: {
      payerAccount: string;
      chequeNo: string;
      paymentDate: string;
      transferAmount: number;
      fee: number;
      documentLink: string;
      financeRecordedBy: string;
      status: 'paid' | 'pending';
    }
  ) => {
    handleConfirmPayment(id, transferData);
  };

  // Sync paid disbursements into transaction ledger
  const handleSyncDisbursementsToLedger = (paidList: Disbursement[]) => {
    let syncedCount = 0;
    const newTxs: Transaction[] = [];

    paidList.forEach(dbm => {
      // Check if already in ledger by matching id, pvNo, docNo, or dbmNo in description
      const alreadyInLedger = transactions.some(t => 
        (t.disbursementId && t.disbursementId === dbm.id) ||
        (t.pvNo && dbm.pvNo && t.pvNo === dbm.pvNo) ||
        (t.docNo && (t.docNo === dbm.pvNo || t.docNo === dbm.dbmNo || t.docNo === dbm.refDocNo)) ||
        (t.description && (t.description.includes(dbm.dbmNo) || (dbm.pvNo && t.description.includes(dbm.pvNo))))
      );

      if (!alreadyInLedger && (dbm.transferAmount || dbm.totalAmount) > 0) {
        syncedCount++;
        const pvDocNo = dbm.pvNo || (dbm.dbmNo ? `PV-${dbm.dbmNo.replace(/\D/g, '').slice(-4)}` : 'PV-AUTO');
        newTxs.push({
          id: `tx_pv_${dbm.id}`,
          company: dbm.company || 'BTC',
          date: dbm.paymentDate || dbm.entryDate || '15/01/2568',
          isoDate: dbm.dueDate && dbm.dueDate !== '-' ? dbm.dueDate : new Date().toISOString().slice(0, 10),
          docNo: pvDocNo,
          description: `[${pvDocNo}] ${dbm.expenseType || 'ค่าใช้จ่ายก่อสร้าง'} - ${dbm.payeeName || 'ผู้รับเงิน'}`,
          category: mapDisbursementToAccountingCategory(dbm.expenseType, dbm.payeeName),
          account: dbm.payerAccount || 'BBL #297-3-033893 (BTC กระแสรายวัน)',
          project: dbm.project || '(00) สำนักงานใหญ่',
          debit: 0,
          credit: dbm.transferAmount || dbm.totalAmount,
          remarks: `ใบสำคัญจ่าย ${pvDocNo} | อ้างอิงขอเบิก ${dbm.dbmNo || '-'} | เช็ค/Ref: ${dbm.chequeNo || '-'} | จ่ายให้: ${dbm.payeeName} ${dbm.documentLink ? `| แนบ: ${dbm.documentLink}` : ''}`,
          status: 'pending', // Pending Bank Statement Reconciliation
          sourceType: 'pv',
          disbursementId: dbm.id,
          pvNo: pvDocNo,
          dbmNo: dbm.dbmNo,
          refDocNo: dbm.refDocNo,
          payeeName: dbm.payeeName,
          paymentSlipUrl: dbm.documentLink,
          auditCertificateId: dbm.auditCertificateId,
          createdAt: new Date().toISOString()
        });
      }
    });

    if (syncedCount > 0) {
      setTransactions(prev => [...newTxs, ...prev].sort(compareTransactionsDesc));
      showToast(`เชื่อมโยงใบตั้งเบิก ${syncedCount} รายการ เข้าสู่สมุดบัญชีรายรับ-รายจ่ายเรียบร้อย!`);
    } else {
      showToast('รายการที่เลือกได้รับการเชื่อมโยงลงสมุดบัญชีครบถ้วนแล้ว');
    }
  };

  // Handler: Add or Update Transaction
  const handleSaveTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => {
    let entry: Transaction;
    if (existingId) {
      entry = {
        ...txData,
        id: existingId
      };
      setTransactions(prev => prev.map(item => (item.id === existingId ? entry : item)).sort(compareTransactionsDesc));
      showToast('แก้ไขรายการบัญชีเรียบร้อยแล้ว');
    } else {
      entry = {
        ...txData,
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString()
      };
      setTransactions(prev => [entry, ...prev].sort(compareTransactionsDesc));
      showToast('บันทึกรายการบัญชีใหม่สำเร็จ');
    }
    setEditingTransaction(null);

    if (isSupabaseConfigured) {
      try {
        await upsertTransaction(entry);
      } catch (e: any) {
        console.error('Supabase save transaction error:', e);
        showToast('บันทึกในแอปสำเร็จ แต่ส่งไปยัง Supabase ล้มเหลว: ' + e.message);
      }
    }
  };

  // Handler: Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('ลบรายการบัญชีเรียบร้อยแล้ว');

    if (isSupabaseConfigured) {
      try {
        await deleteTransaction(id);
      } catch (e: any) {
        console.error('Supabase delete transaction error:', e);
      }
    }
  };

  // Handler: Tasks
  const handleToggleTask = async (id: string) => {
    let targetTask: TodoTask | undefined;

    setTodoTasks(prev => prev.map(task => {
      if (task.id === id) {
        const next = !task.completed;
        targetTask = { ...task, completed: next };
        showToast(next ? 'ทำเครื่องหมายว่าเสร็จสิ้นแล้ว' : 'เปลี่ยนสถานะเป็นรอดำเนินการ');
        return targetTask;
      }
      return task;
    }));

    if (isSupabaseConfigured && targetTask) {
      try {
        await upsertTodoTask(targetTask);
      } catch (e: any) {
        console.error('Supabase toggle task error:', e);
      }
    }
  };

  const handleAddTask = async (newTask: Omit<TodoTask, 'id' | 'createdAt'>) => {
    const task: TodoTask = {
      ...newTask,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    setTodoTasks(prev => [task, ...prev]);
    showToast('เพิ่มงาน/กำหนดการใหม่สำเร็จ');

    if (isSupabaseConfigured) {
      try {
        await upsertTodoTask(task);
      } catch (e: any) {
        console.error('Supabase add task error:', e);
      }
    }
  };

  const handleUpdateTask = async (updatedTask: TodoTask) => {
    setTodoTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
    showToast('อัปเดตกำหนดการเรียบร้อยแล้ว');

    if (isSupabaseConfigured) {
      try {
        await upsertTodoTask(updatedTask);
      } catch (e: any) {
        console.error('Supabase update task error:', e);
      }
    }
  };

  const handleRescheduleDisbursement = async (id: string, newDueDate: string, reason?: string, rescheduledBy?: string) => {
    let updatedDbm: Disbursement | undefined;

    setDisbursements(prev => prev.map(d => {
      if (d.id === id) {
        const original = d.originalDueDate || d.dueDate || d.entryDate;
        updatedDbm = {
          ...d,
          originalDueDate: original,
          dueDate: newDueDate,
          rescheduleReason: reason || 'ขอเลื่อนกำหนดจ่าย',
          rescheduledAt: new Date().toISOString(),
          rescheduledBy: rescheduledBy || 'ฝ่ายการเงิน / ผู้บริหาร',
          notes: reason ? `${d.notes || ''} (เลื่อนจ่ายเป็น ${newDueDate}: ${reason})`.trim() : d.notes
        };
        return updatedDbm;
      }
      return d;
    }));
    showToast(`เลื่อนกำหนดจ่ายใบเบิกเป็นวันที่ ${newDueDate} เรียบร้อยแล้ว (บันทึกประวัติการเลื่อน)`);

    if (isSupabaseConfigured && updatedDbm) {
      try {
        await upsertDisbursement(updatedDbm);
      } catch (e: any) {
        console.error('Supabase reschedule error:', e);
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTodoTasks(prev => prev.filter(t => t.id !== id));
    showToast('ลบงานเรียบร้อยแล้ว');

    if (isSupabaseConfigured) {
      try {
        await deleteTodoTask(id);
      } catch (e: any) {
        console.error('Supabase delete task error:', e);
      }
    }
  };

  // Handler: Export CSV
  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions, `BTC_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว');
  };

  // Handler: Import Transactions with Smart Upsert
  const handleImportTransactions = async (
    newTxs: Transaction[], 
    stats: UpsertResult<Transaction>
  ) => {
    const sorted = [...newTxs].sort(compareTransactionsDesc);
    setTransactions(sorted);
    showToast(`นำเข้าสำเร็จ: อัปเดตรายการเดิม ${stats.updated} รายการ, เพิ่มใหม่ ${stats.added} รายการ`);

    if (isSupabaseConfigured) {
      try {
        await batchUpsertTransactions(sorted);
        showToast(`บันทึกข้อมูล ${sorted.length} รายการลง Supabase เรียบร้อยแล้ว ✓`);
      } catch (e: any) {
        console.error('Supabase import transactions error:', e);
        showToast('นำเข้าสำเร็จ แต่บันทึกลง Supabase ไม่สำเร็จ: ' + e.message);
      }
    }
  };

  // Handler: Import Disbursements with Smart Upsert
  const handleImportDisbursements = async (
    newDbms: Disbursement[], 
    stats: UpsertResult<Disbursement>
  ) => {
    const sorted = [...newDbms].sort(compareDisbursementsDesc);
    setDisbursements(sorted);
    showToast(`นำเข้าระบบเบิกจ่ายสำเร็จ: อัปเดตข้อมูลเดิม ${stats.updated} ใบ, เพิ่มใหม่ ${stats.added} ใบ`);

    if (isSupabaseConfigured) {
      try {
        await batchUpsertDisbursements(sorted);
        showToast(`บันทึกใบตั้งเบิก ${sorted.length} รายการลง Supabase เรียบร้อยแล้ว ✓`);
      } catch (e: any) {
        console.error('Supabase import disbursements error:', e);
        showToast('นำเข้าสำเร็จ แต่บันทึกลง Supabase ไม่สำเร็จ: ' + e.message);
      }
    }
  };

  // Subcontract Action Handlers
  const handleAddSubcontract = (contractData: Omit<Subcontract, 'id' | 'totalInspectedQty' | 'totalApprovedAmount' | 'totalPaidAmount' | 'totalRetentionHeld' | 'totalRetentionRefunded'>) => {
    const newContract: Subcontract = {
      ...contractData,
      id: `sub-${Date.now()}`,
      totalInspectedQty: 0,
      totalApprovedAmount: 0,
      totalPaidAmount: 0,
      totalRetentionHeld: 0,
      totalRetentionRefunded: 0
    };
    setSubcontracts(prev => [newContract, ...prev]);

    // Update allocated Qty on BOQ item if attached
    if (newContract.boqItemId) {
      setBoqItems(prev => prev.map(b => {
        if (b.id === newContract.boqItemId) {
          return {
            ...b,
            subcontractAllocatedQty: b.subcontractAllocatedQty + newContract.quantity
          };
        }
        return b;
      }));
    }

    showToast(`✅ บันทึกสัญญาจ้าง ${newContract.contractNo} (${newContract.contractorName}) สำเร็จ`);
  };

  const handleAddInspection = (inspData: Omit<SubcontractInspection, 'id' | 'createdAt' | 'status'>) => {
    const newInsp: SubcontractInspection = {
      ...inspData,
      id: `insp-${Date.now()}`,
      status: 'approved',
      createdAt: new Date().toISOString()
    };
    setInspections(prev => [newInsp, ...prev]);

    // Update subcontract inspected totals
    setSubcontracts(prev => prev.map(s => {
      if (s.id === newInsp.subcontractId) {
        return {
          ...s,
          totalInspectedQty: s.totalInspectedQty + newInsp.inspectedQty,
          totalApprovedAmount: s.totalApprovedAmount + newInsp.approvedAmount
        };
      }
      return s;
    }));

    showToast(`✅ อนุมัติผลการตรวจงานสัญญา ${newInsp.contractNo} ครั้งที่ ${newInsp.inspectionNo} มูลค่า ${formatCurrency(newInsp.approvedAmount)} บาท`);
  };

  const handleAddPaymentClaim = (claimData: Omit<SubcontractPaymentClaim, 'id' | 'createdAt'>) => {
    const newClaim: SubcontractPaymentClaim = {
      ...claimData,
      id: `claim-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setPaymentClaims(prev => [newClaim, ...prev]);

    // Mark inspection as claimed
    setInspections(prev => prev.map(i => {
      if (i.id === newClaim.inspectionId) {
        return { ...i, status: 'claimed' as const, paymentClaimId: newClaim.id };
      }
      return i;
    }));

    // Add record to retention ledger
    if (newClaim.retentionAmount > 0) {
      const newRetRecord: RetentionLedgerRecord = {
        id: `ret-${Date.now()}`,
        subcontractId: newClaim.subcontractId,
        contractNo: newClaim.contractNo,
        project: newClaim.project,
        contractorName: newClaim.contractorName,
        claimId: newClaim.id,
        claimNo: newClaim.claimNo,
        inspectionNo: newClaim.inspectionNo,
        deductedDate: newClaim.claimDate,
        retentionAmount: newClaim.retentionAmount,
        payeeName: newClaim.payeeName,
        payeeBankName: newClaim.payeeBankName,
        payeeBankAccount: newClaim.payeeBankAccount,
        payeeTaxId: newClaim.payeeTaxId,
        status: 'held'
      };
      setRetentionLedger(prev => [newRetRecord, ...prev]);
    }

    // Update subcontract retention held
    setSubcontracts(prev => prev.map(s => {
      if (s.id === newClaim.subcontractId) {
        return {
          ...s,
          totalRetentionHeld: s.totalRetentionHeld + newClaim.retentionAmount
        };
      }
      return s;
    }));

    // Auto-update matched backcharges status to 'deducted'
    if (newClaim.deductionItems && newClaim.deductionItems.length > 0) {
      setBackcharges(prev => prev.map(b => {
        const isMatched = newClaim.deductionItems.some(
          d => d.billOrDocNo === b.expressPoNo || d.description.includes(b.backchargeNo)
        );
        if (isMatched && b.status === 'pending_deduction') {
          return {
            ...b,
            status: 'deducted' as const,
            claimNo: newClaim.claimNo
          };
        }
        return b;
      }));
    }

    showToast(`✅ บันทึกใบเบิกค่าผลงาน ${newClaim.claimNo} สุทธิ ${formatCurrency(newClaim.netPayableAmount)} บาท เรียบร้อย`);
  };

  const handleRefundRetention = (recordId: string, pvNo: string, refundDate: string) => {
    setRetentionLedger(prev => prev.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          status: 'refunded' as const,
          refundDate,
          refundPvNo: pvNo
        };
      }
      return r;
    }));

    showToast(`✅ บันทึกคืนเงินประกันผลงานตามใบสำคัญจ่าย ${pvNo} เรียบร้อย (โอนเข้าบัญชีเดิมที่ถูกล็อก)`);
  };

  const handleSendClaimToDBM = (claim: SubcontractPaymentClaim) => {
    const docNo = `DBM-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
    
    const newDbm: Disbursement = {
      id: `dbm-sub-${Date.now()}`,
      recordedBy: 'วิศวกรผู้ตรวจรับงาน',
      dbmNo: docNo,
      refDocNo: claim.claimNo,
      company: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
      entryDate: claim.claimDate,
      dueDate: claim.claimDate,
      expenseType: 'ค่าจ้างผู้รับเหมาช่วง',
      payeeName: claim.payeeName,
      payeeBankAccount: claim.payeeBankAccount,
      payeeBankName: claim.payeeBankName,
      project: claim.project,
      paymentMethod: 'โอนเงิน',
      remarks: `เบิกค่าผลงานงวดที่ ${claim.inspectionNo} สัญญา ${claim.contractNo} (${claim.contractorName}) - ยอดงานตรวจผ่าน ${formatCurrency(claim.approvedWorkAmount)} บ., หักประกัน ${formatCurrency(claim.retentionAmount)} บ., หักร้านค้า/อื่นๆ ${formatCurrency(claim.materialDeductionsTotal + claim.otherDeductionsTotal)} บ.`,
      items: [
        {
          description: `ค่าจ้างผลงานตรวจรับงวดที่ ${claim.inspectionNo} (สัญญา ${claim.contractNo} - ${claim.contractorName})`,
          amount: claim.approvedWorkAmount,
          withholdingTaxRate: claim.whtRate,
          withholdingTaxAmount: claim.whtAmount,
          vatRate: claim.vatRate,
          vatAmount: claim.vatAmount
        }
      ],
      subTotalAmount: claim.approvedWorkAmount,
      vatTotalAmount: claim.vatAmount,
      taxDeductionTotalAmount: claim.whtAmount,
      retentionTotalAmount: claim.retentionAmount,
      totalAmount: claim.netPayableAmount,
      payerAccount: '',
      chequeNo: '',
      paymentDate: '',
      transferAmount: 0,
      fee: 0,
      status: 'approved',
      reviewerName: 'วิศวกรโครงการ',
      reviewedAt: claim.claimDate,
      approverName: 'ผู้จัดการฝ่ายโครงการ',
      approvedAt: claim.claimDate
    };

    setDisbursements(prev => [newDbm, ...prev]);

    // Update claim with dbmNo
    setPaymentClaims(prev => prev.map(c => {
      if (c.id === claim.id) {
        return { ...c, dbmNo: docNo };
      }
      return c;
    }));

    if (isConfigured) {
      upsertDisbursement(newDbm).catch(err => console.error('Failed to sync to Supabase:', err));
    }

    showToast(`✅ ส่งเรื่องขอเบิกเข้าคิว DBM เลขที่ ${docNo} สำเร็จแล้ว`);
  };

  // BOQ Handlers
  const handleAddBOQItem = (newItemData: Omit<ProjectBOQItem, 'id' | 'subcontractAllocatedQty' | 'completedQty'>) => {
    const newItem: ProjectBOQItem = {
      ...newItemData,
      id: `boq_${Date.now()}`,
      subcontractAllocatedQty: 0,
      completedQty: 0
    };
    setBoqItems(prev => [newItem, ...prev]);
    showToast(`✅ เพิ่มรายการ BOQ ข้อ ${newItem.itemNo} (${newItem.description}) เรียบร้อยแล้ว`);
  };

  const handleDeleteBOQItem = (id: string) => {
    setBoqItems(prev => prev.filter(b => b.id !== id));
    showToast('🗑️ ลบรายการ BOQ เรียบร้อยแล้ว');
  };

  const handleUpdateBOQItem = (id: string, updated: Partial<ProjectBOQItem>) => {
    setBoqItems(prev => prev.map(b => {
      if (b.id === id) {
        const merged = { ...b, ...updated };
        // recalculate amounts if quantities/rates changed
        if (updated.contractQty !== undefined || updated.contractUnitRate !== undefined) {
          merged.contractAmount = (merged.contractQty || 0) * (merged.contractUnitRate || 0);
        }
        if (updated.engineerQty !== undefined || updated.engineerUnitCost !== undefined) {
          merged.engineerAmount = (merged.engineerQty || 0) * (merged.engineerUnitCost || 0);
        }
        return merged;
      }
      return b;
    }));
    showToast('✅ ปรับปรุงข้อมูลรายการ BOQ เรียบร้อยแล้ว');
  };

  const handleAddMaterialToBOQ = (boqId: string, materialData: Omit<BOQMaterialItem, 'id'>) => {
    const newMaterial: BOQMaterialItem = {
      ...materialData,
      id: `mat_${Date.now()}`
    };
    setBoqItems(prev => prev.map(b => {
      if (b.id === boqId) {
        return {
          ...b,
          materials: [...b.materials, newMaterial]
        };
      }
      return b;
    }));
    showToast(`✅ เพิ่มรายการวัสดุ ${materialData.materialName} ลงใน BOM เรียบร้อยแล้ว`);
  };

  const handleDeleteMaterialFromBOQ = (boqId: string, materialId: string) => {
    setBoqItems(prev => prev.map(b => {
      if (b.id === boqId) {
        return {
          ...b,
          materials: b.materials.filter(m => m.id !== materialId)
        };
      }
      return b;
    }));
    showToast('🗑️ ลบรายการวัสดุ BOM เรียบร้อยแล้ว');
  };

  const handleUpdateMaterialWithdrawal = (boqId: string, materialId: string, newWithdrawnQty: number) => {
    setBoqItems(prev => prev.map(b => {
      if (b.id === boqId) {
        return {
          ...b,
          materials: b.materials.map(m => {
            if (m.id === materialId) {
              return { ...m, withdrawnQty: newWithdrawnQty };
            }
            return m;
          })
        };
      }
      return b;
    }));
    showToast('✅ บันทึกปริมาณเบิกใช้วัสดุสำเร็จ');
  };

  // Procurement & Billing Handlers
  const handleAddRFQ = (rfqData: Omit<RFQComparisonItem, 'id' | 'createdAt'>) => {
    const newRFQ: RFQComparisonItem = {
      ...rfqData,
      id: `rfq-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setRfqs(prev => [newRFQ, ...prev]);
    showToast(`✅ สร้างใบเปรียบเทียบราคา ${newRFQ.rfqNo} สำเร็จ`);
  };

  const handleUpdateRFQ = (id: string, updates: Partial<RFQComparisonItem>) => {
    setRfqs(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    showToast('✅ อัปเดตใบเปรียบเทียบราคาเรียบร้อย');
  };

  const handleAddBackcharge = (bcData: Omit<MaterialBackchargeItem, 'id' | 'createdAt'>) => {
    const newBC: MaterialBackchargeItem = {
      ...bcData,
      id: `bc-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setBackcharges(prev => [newBC, ...prev]);
    showToast(`✅ บันทึกรายการหักสัญญาช่าง ${newBC.backchargeNo} (${formatCurrency(newBC.amount)} บ.) สำเร็จ`);
  };

  const handleUpdateBackcharge = (id: string, updates: Partial<MaterialBackchargeItem>) => {
    setBackcharges(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    showToast('✅ ปรับปรุงรายการหักสัญญาสำเร็จ');
  };

  const handleDeleteBackcharge = (id: string) => {
    setBackcharges(prev => prev.filter(b => b.id !== id));
    showToast('🗑️ ลบรายการหักสัญญาช่างเรียบร้อยแล้ว');
  };

  const handleAddBilling = (billData: Omit<SupplierBilling, 'id' | 'createdAt'>) => {
    const newBill: SupplierBilling = {
      ...billData,
      id: `bill-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSupplierBillings(prev => [newBill, ...prev]);

    // Auto update status of matched goods receipt items to 'billed'
    if (newBill.matchedReceiptIds && newBill.matchedReceiptIds.length > 0) {
      setGoodsReceipts(prev => prev.map(gr => {
        if (newBill.matchedReceiptIds?.includes(gr.id)) {
          return {
            ...gr,
            billingStatus: 'billed' as const,
            matchedBillingId: newBill.id,
            matchedBillingNo: newBill.billingNo,
            matchedAt: newBill.receivedDate
          };
        }
        return gr;
      }));
    }

    showToast(`✅ บันทึกรับวางบิล ${newBill.billingNo} (${formatCurrency(newBill.grandTotal)} บ.) เรียบร้อย`);
  };

  const handleUpdateBilling = (id: string, updates: Partial<SupplierBilling>) => {
    setSupplierBillings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    showToast('✅ ปรับปรุงข้อมูล/สถานะใบวางบิลสำเร็จ');
  };

  const handleAddGoodsReceipt = (receiptData: Omit<GoodsReceiptItem, 'id' | 'createdAt'>) => {
    const newGR: GoodsReceiptItem = {
      ...receiptData,
      id: `gr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setGoodsReceipts(prev => [newGR, ...prev]);
    showToast(`✅ บันทึกตรวจรับพัสดุ ${newGR.grNo} (${newGR.materialDescription}) สำเร็จ`);
  };

  // If user is not logged in, show full-screen corporate Login View
  if (!isLoggedIn || !currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <DatabaseSuggestionsProvider
      transactions={transactions}
      disbursements={disbursements}
      subcontracts={subcontracts}
      inspections={inspections}
      paymentClaims={paymentClaims}
      backcharges={backcharges}
      goodsReceipts={goodsReceipts}
      billings={supplierBillings}
      rfqItems={rfqs}
      todoTasks={todoTasks}
    >
      <div className="flex h-screen bg-slate-100/70 text-slate-900 font-['Sarabun',sans-serif] overflow-hidden antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-60 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700/50 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-2 h-2 rounded-full bg-[#009540] animate-ping" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenAI={() => setCurrentTab('ai_analysis')}
        onExportCSV={handleExportCSV}
        onImportCSVClick={() => {
          setImportTarget('auto');
          setIsImportModalOpen(true);
        }}
        onOpenSupabaseSettings={() => setIsSupabaseModalOpen(true)}
        isSupabaseConnected={isConfigured}
        onOpenGoogleMasterSync={() => setIsGoogleModalOpen(true)}
        isGoogleConnected={isGoogleConnected}
        userRole={userRole}
        currentUser={currentUser}
        totalTransactionsCount={transactions.length}
        pendingTasksCount={pendingTasksCount}
        disbursementsCount={disbursements.length}
        pendingDisbursementsCount={pendingDisbursementsCount}
        netBalance={financialSummary.finalBalance}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Header Bar */}
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenAI={() => setCurrentTab('ai_analysis')}
          onExportCSV={handleExportCSV}
          onImportCSVClick={() => setIsImportModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalTransactionsCount={transactions.length}
          isSupabaseConnected={isConfigured}
          onOpenSupabaseStatus={() => setIsSupabaseModalOpen(true)}
          userRole={userRole}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
        />

        {/* Supabase Status / Notice Banner */}
        {!isConfigured ? (
          <div 
            onClick={() => setIsSupabaseModalOpen(true)}
            className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 text-xs text-amber-900 cursor-pointer hover:bg-amber-100/70 transition-colors shrink-0"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>ฐานข้อมูล Supabase (100% Real Database):</strong> ระบบพร้อมทำงาน — คลิกที่นี่เพื่อกรอก <code>Project URL</code> และ <code>Anon Key</code> หรือดูโครงสร้างตาราง
              </span>
            </div>
            <span className="font-semibold text-amber-800 underline shrink-0 hidden sm:inline">
              คลิกตั้งค่าฐานข้อมูล
            </span>
          </div>
        ) : isLoadingData ? (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-1.5 flex items-center gap-2 text-xs text-emerald-800 shrink-0">
            <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
            <span>กำลังโหลดข้อมูลสดจากฐานข้อมูล Supabase...</span>
          </div>
        ) : dbErrorMessage ? (
          <div 
            onClick={() => setIsSupabaseModalOpen(true)}
            className="bg-rose-50 border-b border-rose-200 px-4 py-1.5 flex items-center justify-between gap-2 text-xs text-rose-800 cursor-pointer shrink-0"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>ไม่สามารถโหลดข้อมูลจาก Supabase: {dbErrorMessage} (คลิกเพื่อดูคำสั่ง SQL สำหรับสร้างตาราง)</span>
            </div>
            <span className="underline font-semibold">ดูคำสั่ง SQL</span>
          </div>
        ) : null}

        {/* Main View Area (Maximized screen real estate for content) */}
        <main className="flex-1 w-full px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5">
          {currentUser && !hasTabPermission(currentUser, currentTab) ? (
            <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4 text-rose-500">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">ไม่มีสิทธิ์เข้าถึงเมนูนี้</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                บัญชีของคุณ (<strong>{currentUser.name}</strong> - บทบาท <span className="uppercase font-semibold">{currentUser.role}</span>) ไม่ได้รับอนุญาตให้เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ (Admin) เพื่อขอสิทธิ์การใช้งาน
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentTab(currentUser.role === 'user' ? 'disbursements' : 'dashboard')}
                  className="px-4 py-2 bg-[#005aa9] hover:bg-[#004a8c] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  กลับสู่หน้าหลักที่ได้รับสิทธิ์
                </button>
              </div>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              disbursements={disbursements}
              todoTasks={todoTasks}
              userRole={userRole}
              onNavigateTab={setCurrentTab}
              onFilterProject={(p) => setSelectedProjectFilter(p)}
              onRescheduleDisbursement={handleRescheduleDisbursement}
            />
          )}

          {currentTab === 'disbursements' && (
            <DisbursementsView
              disbursements={disbursements}
              onAddDisbursement={() => {
                setEditingDisbursement(null);
                setIsNewDisbursementModalOpen(true);
              }}
              onEditDisbursement={(d) => {
                setEditingDisbursement(d);
                setIsNewDisbursementModalOpen(true);
              }}
              onDeleteDisbursement={handleDeleteDisbursement}
              onViewDisbursement={(d) => {
                setSelectedDisbursement(d);
                setIsDisbursementDetailOpen(true);
              }}
              onOpenTransferModal={(d) => {
                setTransferDisbursement(d);
                setIsRecordTransferModalOpen(true);
              }}
              onTogglePaid={handleTogglePaidDisbursement}
              onSyncToLedger={handleSyncDisbursementsToLedger}
              onImportCSV={() => {
                setImportTarget('disbursements');
                setIsImportModalOpen(true);
              }}
              onApproveDisbursement={handleApproveDisbursement}
              onRescheduleDisbursement={handleRescheduleDisbursement}
            />
          )}

          {currentTab === 'payment' && (
            <PaymentView
              disbursements={disbursements}
              transactions={transactions}
              onConfirmPayment={handleConfirmPayment}
              onSyncToLedger={handleSyncDisbursementsToLedger}
              accountsList={accountsList}
              onNavigateTab={setCurrentTab}
              onViewTransactionInLedger={(searchDoc) => {
                setTxSearchFilter(searchDoc);
                setCurrentTab('transactions');
              }}
            />
          )}

          {currentTab === 'todoist' && (
            <TodoistView
              tasks={todoTasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              disbursements={disbursements}
              onOpenNewTx={handleOpenNewTx}
              onEditTx={(tx) => {
                setEditingTransaction(tx);
                setIsNewTxModalOpen(true);
              }}
              onDeleteTx={handleDeleteTransaction}
              onExportCSV={handleExportCSV}
              onImportCSV={() => {
                setImportTarget('transactions');
                setIsImportModalOpen(true);
              }}
              onReconcileTx={handleReconcileTransaction}
              onBatchReconcile={handleBatchReconcile}
              onViewPV={(dbm) => {
                setSelectedDisbursement(dbm);
                setIsDisbursementDetailOpen(true);
              }}
              initialProjectFilter={selectedProjectFilter}
              initialSearch={txSearchFilter}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsView
              transactions={transactions}
              selectedProjectName={selectedProjectFilter !== 'all' ? selectedProjectFilter : undefined}
              onSelectProject={(p) => setSelectedProjectFilter(p)}
            />
          )}

          {currentTab === 'boq' && (
            <BOQManagementView
              boqItems={boqItems}
              uniqueProjects={projectsList}
              selectedProjectFilter={selectedProjectFilter}
              onSelectProject={(p) => setSelectedProjectFilter(p)}
              onAddBOQItem={handleAddBOQItem}
              onUpdateBOQItem={handleUpdateBOQItem}
              onDeleteBOQItem={handleDeleteBOQItem}
              onAddMaterialToBOQ={handleAddMaterialToBOQ}
              onDeleteMaterialFromBOQ={handleDeleteMaterialFromBOQ}
              onUpdateMaterialWithdrawal={handleUpdateMaterialWithdrawal}
              onNavigateToSubcontracts={() => setCurrentTab('subcontracts')}
            />
          )}

          {currentTab === 'subcontracts' && (
            <SubcontractView
              subcontracts={subcontracts}
              inspections={inspections}
              paymentClaims={paymentClaims}
              retentionLedger={retentionLedger}
              boqItems={boqItems}
              backcharges={backcharges}
              onAddSubcontract={handleAddSubcontract}
              onAddInspection={handleAddInspection}
              onAddPaymentClaim={handleAddPaymentClaim}
              onRefundRetention={handleRefundRetention}
              onSendClaimToDBM={handleSendClaimToDBM}
              onNavigateToBOQ={() => setCurrentTab('boq')}
              onNavigateToProcurement={() => setCurrentTab('procurement')}
            />
          )}

          {currentTab === 'procurement' && (
            <ProcurementView
              rfqItems={rfqs}
              backcharges={backcharges}
              subcontracts={subcontracts}
              onAddRFQ={handleAddRFQ}
              onUpdateRFQ={handleUpdateRFQ}
              onAddBackcharge={handleAddBackcharge}
              onNavigateToSubcontracts={() => setCurrentTab('subcontracts')}
              onNavigateToBilling={() => setCurrentTab('supplier_billing')}
            />
          )}

          {currentTab === 'supplier_billing' && (
            <SupplierBillingView
              billings={supplierBillings}
              goodsReceipts={goodsReceipts}
              onAddBilling={handleAddBilling}
              onUpdateBilling={handleUpdateBilling}
              onAddGoodsReceipt={handleAddGoodsReceipt}
              onNavigateToProcurement={() => setCurrentTab('procurement')}
            />
          )}

          {currentTab === 'accounts' && (
            <AccountsView
              transactions={transactions}
              userRole={userRole}
            />
          )}

          {currentTab === 'tax_summary' && (
            <TaxSummaryView
              transactions={transactions}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              transactions={transactions}
              onExportCSV={handleExportCSV}
            />
          )}

          {currentTab === 'ai_analysis' && (
            <AIAnalysisView
              transactions={transactions}
              userRole={userRole}
              onNavigateTab={setCurrentTab}
              onFilterProject={(p) => setSelectedProjectFilter(p)}
            />
          )}

          {currentTab === 'document_templates' && (
            <DocumentTemplatesView />
          )}

          {currentTab === 'user_management' && (
            <UserManagementView currentUser={currentUser} />
          )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <NewTransactionModal
        isOpen={isNewTxModalOpen}
        onClose={() => {
          setIsNewTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        initialType={newTxInitialType}
        disbursements={disbursements}
        projectsList={projectsList}
        accountsList={accountsList}
        companiesList={companiesList}
      />

      <NewDisbursementModal
        isOpen={isNewDisbursementModalOpen}
        onClose={() => {
          setIsNewDisbursementModalOpen(false);
          setEditingDisbursement(null);
        }}
        onSave={handleSaveDisbursement}
        editingDisbursement={editingDisbursement}
        projectsList={projectsList}
        companiesList={companiesList}
        accountsList={accountsList}
      />

      <DisbursementDetailModal
        isOpen={isDisbursementDetailOpen}
        onClose={() => {
          setIsDisbursementDetailOpen(false);
          setSelectedDisbursement(null);
        }}
        disbursement={selectedDisbursement}
        onEdit={(d) => {
          setSelectedDisbursement(null);
          setEditingDisbursement(d);
          setIsNewDisbursementModalOpen(true);
        }}
        onOpenTransferModal={(d) => {
          setIsDisbursementDetailOpen(false);
          setTransferDisbursement(d);
          setIsRecordTransferModalOpen(true);
        }}
        onOpenReviewModal={(d) => {
          setIsDisbursementDetailOpen(false);
          setReviewingDisbursement(d);
        }}
      />

      <ReviewApprovalModal
        isOpen={!!reviewingDisbursement}
        disbursement={reviewingDisbursement}
        onClose={() => setReviewingDisbursement(null)}
        onApprove={handleApproveDisbursement}
      />

      <RecordPaymentModal
        isOpen={isRecordTransferModalOpen}
        onClose={() => {
          setIsRecordTransferModalOpen(false);
          setTransferDisbursement(null);
        }}
        disbursement={transferDisbursement}
        disbursements={disbursements}
        onConfirmPayment={handleConfirmPayment}
        accountsList={accountsList}
      />

      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        transactions={transactions}
      />

      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        transactions={transactions}
        disbursements={disbursements}
        onImportTransactions={handleImportTransactions}
        onImportDisbursements={handleImportDisbursements}
        defaultTarget={importTarget}
      />

      <SupabaseStatusModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        txCount={transactions.length}
        dbmCount={disbursements.length}
        taskCount={todoTasks.length}
        onRefreshData={loadAllData}
        isLoading={isLoadingData}
      />

      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        currentUser={currentUser}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <GoogleMasterSyncModal
        isOpen={isGoogleModalOpen}
        onClose={() => {
          setIsGoogleModalOpen(false);
          // Recheck connection state
          getAccessToken().then(token => setIsGoogleConnected(Boolean(token)));
        }}
        sampleVendors={Array.from(new Set(disbursements.map(d => d.payeeName).filter(Boolean)))}
        sampleProjects={projectsList}
        sampleExpenseTypes={Array.from(new Set(transactions.map(t => t.category).filter(Boolean)))}
        onMasterDataLoaded={() => {
          showToast('ซิงค์และอัปเดต Master Data จาก Google Sheets เรียบร้อยแล้ว');
          setIsGoogleConnected(true);
        }}
      />
    </div>
    </DatabaseSuggestionsProvider>
  );
}
