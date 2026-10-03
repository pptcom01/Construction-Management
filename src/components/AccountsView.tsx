import { useMemo, useState } from 'react';
import { Transaction, UserRole } from '../types';
import { formatCurrency, computeAccountBalances, compareTransactionsDesc, parseDateScore } from '../utils/accounting';
import { 
  Landmark, 
  Wallet, 
  ArrowLeftRight, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingDown,
  Layers,
  Lock
} from 'lucide-react';

interface AccountsViewProps {
  transactions: Transaction[];
  userRole?: UserRole;
}

export function AccountsView({ 
  transactions, 
  userRole = 'executive'
}: AccountsViewProps) {
  const isExecutive = userRole === 'admin' || userRole === 'manager' || userRole === 'executive';
  const accountBalances = useMemo(() => computeAccountBalances(transactions), [transactions]);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'loans' | 'transfers' | 'account_tx'>('loans');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Intercompany loan analysis
  const intercompanyLoans = useMemo(() => {
    const loans: {
      date: string;
      docNo: string;
      from: string;
      to: string;
      amount: number;
      type: 'borrow' | 'repay';
      description: string;
      status: string;
      account?: string;
    }[] = [];

    transactions.forEach(t => {
      const desc = t.description.toLowerCase();
      const isBorrow = desc.includes('ให้กู้ยืม') || desc.includes('เงินให้ยืม') || desc.includes('รับเงินยืม') || desc.includes('รับเงินกู้ยืม');
      const isRepay = desc.includes('คืนเงินยืม') || desc.includes('คืนเงินให้กู้ยืม') || desc.includes('รับเงินคืนกู้ยืม');

      if (isBorrow) {
        loans.push({
          date: t.date,
          docNo: t.docNo,
          from: t.credit > 0 ? t.company : 'กิจการร่วมค้า/ธนาคาร',
          to: t.debit > 0 ? t.company : 'บจก.บุรีรัมย์ธงชัยก่อสร้าง',
          amount: Math.max(t.debit, t.credit),
          type: 'borrow',
          description: t.description,
          status: 'เงินยืมหมุนเวียน',
          account: t.account
        });
      } else if (isRepay) {
        loans.push({
          date: t.date,
          docNo: t.docNo,
          from: t.credit > 0 ? t.company : 'บจก.บุรีรัมย์ธงชัยก่อสร้าง',
          to: t.debit > 0 ? t.company : 'กิจการร่วมค้า',
          amount: Math.max(t.debit, t.credit),
          type: 'repay',
          description: t.description,
          status: 'ชำระคืนเงินยืม',
          account: t.account
        });
      }
    });

    return loans.sort((a, b) => {
      const scoreA = parseDateScore(a.date, a.docNo);
      const scoreB = parseDateScore(b.date, b.docNo);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (b.docNo || '').localeCompare(a.docNo || '', undefined, { numeric: true });
    });
  }, [transactions]);

  // Intercompany Net Outstanding
  const loanStats = useMemo(() => {
    let totalBorrowed = 0;
    let totalRepaid = 0;
    intercompanyLoans.forEach(l => {
      if (l.type === 'borrow') totalBorrowed += l.amount;
      if (l.type === 'repay') totalRepaid += l.amount;
    });
    return {
      totalBorrowed,
      totalRepaid,
      outstanding: totalBorrowed - totalRepaid
    };
  }, [intercompanyLoans]);

  // Bank Transfer Movements (sorted from newest to oldest)
  const transfers = useMemo(() => {
    return transactions
      .filter(t => 
        t.category.includes('โอนระหว่างบัญชี') || 
        t.description.includes('โอนระหว่างบัญชี') || 
        t.description.includes('โอนเงินระหว่างบัญชี') ||
        t.description.includes('โอนมาจาก') ||
        t.description.includes('รับจาก KTB') ||
        t.description.includes('รับจาก BBL')
      )
      .sort(compareTransactionsDesc);
  }, [transactions]);

  // Total liquidity and overdraft
  const { totalBalance, totalOverdraft, totalNormalCash, totalTransferAmount } = useMemo(() => {
    let balance = 0;
    let od = 0;
    let normal = 0;
    accountBalances.forEach(a => {
      balance += a.calculatedBalance;
      if (a.calculatedBalance < 0) {
        od += Math.abs(a.calculatedBalance);
      } else {
        normal += a.calculatedBalance;
      }
    });

    const transferVol = transfers.reduce((sum, t) => sum + Math.max(t.debit, t.credit), 0);

    return {
      totalBalance: balance,
      totalOverdraft: od,
      totalNormalCash: normal,
      totalTransferAmount: transferVol
    };
  }, [accountBalances, transfers]);

  // Filtered account transactions (when viewing account details)
  const accountTransactions = useMemo(() => {
    if (selectedAccount === 'all') return transactions.slice().sort(compareTransactionsDesc);
    return transactions
      .filter(t => (t.account || '').includes(selectedAccount) || selectedAccount.includes(t.account || ''))
      .sort(compareTransactionsDesc);
  }, [transactions, selectedAccount]);

  // Filtered dataset according to active tab and search
  const displayedItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (activeTab === 'loans') {
      return intercompanyLoans.filter(l => {
        if (!term) return true;
        return (
          (l.docNo && l.docNo.toLowerCase().includes(term)) ||
          l.description.toLowerCase().includes(term) ||
          l.from.toLowerCase().includes(term) ||
          l.to.toLowerCase().includes(term)
        );
      });
    }

    if (activeTab === 'transfers') {
      return transfers.filter(t => {
        if (!term) return true;
        return (
          (t.docNo && t.docNo.toLowerCase().includes(term)) ||
          t.description.toLowerCase().includes(term) ||
          (t.account && t.account.toLowerCase().includes(term)) ||
          (t.company && t.company.toLowerCase().includes(term))
        );
      });
    }

    // activeTab === 'account_tx'
    return accountTransactions.filter(t => {
      if (!term) return true;
      return (
        (t.docNo && t.docNo.toLowerCase().includes(term)) ||
        t.description.toLowerCase().includes(term) ||
        (t.category && t.category.toLowerCase().includes(term)) ||
        (t.account && t.account.toLowerCase().includes(term))
      );
    });
  }, [activeTab, intercompanyLoans, transfers, accountTransactions, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(displayedItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayedItems.slice(start, start + itemsPerPage);
  }, [displayedItems, currentPage, itemsPerPage]);

  return (
    <div className="space-y-3.5 pb-6">
      {/* 1. Header: Clean, Direct & Professional */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white px-4 py-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-5 h-5 text-[#005aa9]" />
            <span>บัญชีธนาคาร, สภาพคล่อง & เงินกู้ยืมในเครือ</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ภาพรวมกระแสเงินสดทุกธนาคาร, กองทุน KTSV, วงเงินเบิกเกินบัญชี (OD) และการหมุนเวียนเงินยืมระหว่างกิจการ
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setSelectedAccount('all');
              setActiveTab('account_tx');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              selectedAccount === 'all' && activeTab === 'account_tx'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ดูความเคลื่อนไหวทุกบัญชี</span>
          </button>
        </div>
      </div>

      {/* 2 & 2.5 Liquidity & Bank Account Balances (เฉพาะผู้บริหาร) */}
      {isExecutive ? (
        <>
          {/* 2. Liquidity & Financial Health KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Total Cash Liquidity */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold">เงินสด & เงินฝากสุทธิ</span>
                <Wallet className="w-3.5 h-3.5 text-[#009540]" />
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-slate-900">
                {formatCurrency(totalBalance)}
              </div>
              <div className="text-[10px] text-emerald-700 mt-0.5 font-medium flex items-center gap-1">
                <span>สภาพคล่องเงินสดรวม {accountBalances.length} บัญชี</span>
              </div>
            </div>

            {/* Total Inflow */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold">ยอดเงินเข้ารวมทุกบัญชี</span>
                <ArrowDownLeft className="w-3.5 h-3.5 text-[#009540]" />
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-[#009540]">
                {formatCurrency(accountBalances.reduce((sum, a) => sum + a.totalIncome, 0))}
              </div>
              <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">
                เงินเข้าสะสม (Total In)
              </div>
            </div>

            {/* Total Outflow */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold">ยอดเงินออกรวมทุกบัญชี</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-rose-600">
                {formatCurrency(accountBalances.reduce((sum, a) => sum + a.totalExpense, 0))}
              </div>
              <div className="text-[10px] text-rose-700 mt-0.5 font-medium">
                เงินออกสะสม (Total Out)
              </div>
            </div>

            {/* Overdraft (OD) */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold">วงเงิน OD ที่เบิกใช้</span>
                <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-amber-700">
                {totalOverdraft > 0 ? formatCurrency(totalOverdraft) : '0.00'}
              </div>
              <div className="text-[10px] text-amber-800 mt-0.5 font-medium">
                {totalOverdraft > 0 ? 'เบิกเกินบัญชีกระแสรายวัน KTB' : 'ไม่มีภาระ OD คงค้าง'}
              </div>
            </div>
          </div>

          {/* 2.5 Master Account Summary Table (Total In, Total Out, Current Balance) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#005aa9] text-white flex items-center justify-center font-bold">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                    ตารางสรุปยอดเงินเข้า-ออก-คงเหลือ ทุกบัญชีธนาคาร (เฉพาะผู้บริหาร)
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    แสดงยอดเงินเข้ารวม (Total In), ยอดเงินออกรวม (Total Out), และยอดเงินคงเหลือปัจจุบัน (Current Balance)
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
                {accountBalances.length} บัญชี
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">ชื่อบัญชี / ธนาคาร</th>
                    <th className="py-3 px-4">เลขที่บัญชี</th>
                    <th className="py-3 px-4">บริษัทเจ้าของบัญชี</th>
                    <th className="py-3 px-4 text-right text-emerald-800 bg-emerald-50/50">ยอดเงินเข้ารวม (Total In)</th>
                    <th className="py-3 px-4 text-right text-rose-800 bg-rose-50/50">ยอดเงินออกรวม (Total Out)</th>
                    <th className="py-3 px-4 text-right font-black text-slate-900 bg-slate-100/50">ยอดคงเหลือปัจจุบัน (Current Balance)</th>
                    <th className="py-3 px-4 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {accountBalances.map((acc, idx) => {
                    const isOverdraft = acc.calculatedBalance < 0;
                    const isSelected = selectedAccount === acc.accountName;

                    return (
                      <tr 
                        key={idx}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAccount('all');
                          } else {
                            setSelectedAccount(acc.accountName);
                            setActiveTab('account_tx');
                            setCurrentPage(1);
                          }
                        }}
                        className={`hover:bg-blue-50/60 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/80 font-bold' : idx % 2 === 1 ? 'bg-slate-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
                              acc.bankCode.includes('KTB') ? 'bg-[#005aa9]' : 'bg-[#1e3a8a]'
                            }`}>
                              {acc.bankCode.includes('KTB') ? 'KTB' : 'BBL'}
                            </span>
                            <div className="min-w-0">
                              <span className="truncate block" title={acc.accountName}>{acc.accountName}</span>
                              <span className="text-[10px] text-slate-400 font-normal font-sans block">{acc.type}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          {acc.accountNumber || '-'}
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-600 text-[11px] truncate max-w-[180px]">
                          {acc.company}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700 bg-emerald-50/30">
                          {formatCurrency(acc.totalIncome)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-rose-700 bg-rose-50/30">
                          {formatCurrency(acc.totalExpense)}
                        </td>
                        <td className={`py-3 px-4 text-right font-black text-sm bg-slate-100/30 ${
                          isOverdraft ? 'text-amber-700' : 'text-slate-900'
                        }`}>
                          {formatCurrency(acc.calculatedBalance)}
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isOverdraft ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isOverdraft ? 'วงเงิน OD' : 'เงินฝากปกติ'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100/80 font-bold border-t-2 border-slate-300 font-mono">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 font-sans text-slate-900 font-bold text-xs text-right">
                      ยอดรวมทุกบัญชี ({accountBalances.length} บัญชี):
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-800 text-xs font-black">
                      {formatCurrency(accountBalances.reduce((sum, a) => sum + a.totalIncome, 0))}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-800 text-xs font-black">
                      {formatCurrency(accountBalances.reduce((sum, a) => sum + a.totalExpense, 0))}
                    </td>
                    <td className={`py-3 px-4 text-right text-sm font-black ${
                      totalBalance >= 0 ? 'text-slate-900' : 'text-amber-800'
                    }`}>
                      {formatCurrency(totalBalance)}
                    </td>
                    <td className="py-3 px-4 text-center font-sans text-[11px] text-slate-500">
                      สุทธิ
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  ข้อมูลสรุปยอดเงินเข้า-ออก-คงเหลือ ทุกบัญชีธนาคาร
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                  🔒 สงวนสิทธิ์เฉพาะผู้บริหาร (Executive Only)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                ระบบจำกัดการเข้าถึงยอดเงินในบัญชีธนาคาร KTB, BBL และยอดสภาพคล่องสำหรับสิทธิ์ผู้บริหาร (Admin / Manager)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Interactive Bank Account Cards Grid */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
            <span>บัญชีเงินฝากและกองทุน (คลิกการ์ดเพื่อกรองความเคลื่อนไหว)</span>
          </span>
          {selectedAccount !== 'all' && (
            <button
              onClick={() => {
                setSelectedAccount('all');
                setCurrentPage(1);
              }}
              className="text-[11px] font-semibold text-[#005aa9] hover:underline cursor-pointer"
            >
              แสดงทุกบัญชี &times;
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {accountBalances.map((acc, idx) => {
            const isOverdraft = acc.calculatedBalance < 0;
            const isSelected = selectedAccount === acc.accountName;

            return (
              <div 
                key={idx}
                onClick={() => {
                  if (isSelected) {
                    setSelectedAccount('all');
                  } else {
                    setSelectedAccount(acc.accountName);
                    setActiveTab('account_tx');
                    setCurrentPage(1);
                  }
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer shadow-xs relative ${
                  isSelected
                    ? 'bg-blue-50/50 border-[#005aa9] ring-2 ring-[#005aa9]/20'
                    : isOverdraft 
                    ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[11px] text-white shrink-0 shadow-2xs ${
                      acc.bankCode.includes('KTB') ? 'bg-[#005aa9]' : 'bg-[#1e3a8a]'
                    }`}>
                      {acc.bankCode.includes('KTB') ? 'KTB' : 'BBL'}
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase leading-tight">
                        {acc.type}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[190px]" title={acc.accountName}>
                        {acc.accountName}
                      </h4>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    isOverdraft ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isOverdraft ? 'วงเงิน OD' : 'ปกติ'}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-[10px] text-slate-400">ยอดเงินคงเหลือ</span>
                  <div className={`text-base font-bold font-mono tracking-tight ${
                    userRole === 'executive' 
                      ? (isOverdraft ? 'text-amber-700' : 'text-slate-900')
                      : 'text-slate-400'
                  }`}>
                    {userRole === 'executive' ? formatCurrency(acc.calculatedBalance) : '฿ ••••••••'}
                  </div>
                </div>

                {userRole === 'executive' ? (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-100 bg-slate-50/80 px-2 py-1.5 rounded-lg font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">เงินเข้ารวม</span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(acc.totalIncome)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">เงินออกรวม</span>
                      <span className="font-semibold text-rose-600">{formatCurrency(acc.totalExpense)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>ยอดเงินเข้า-ออก (เฉพาะผู้บริหาร)</span>
                    </span>
                  </div>
                )}

                <div className="mt-1.5 text-[10px] text-slate-500 truncate flex items-center justify-between">
                  <span className="truncate">🏢 {acc.company}</span>
                  {isSelected && (
                    <span className="text-[#005aa9] font-bold text-[10px] bg-blue-100 px-1.5 py-0.2 rounded shrink-0">
                      กำลังเลือก
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Unified Movements Ledger Card with Tabs (Clean & Space-Saving) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Top Control Bar: Tabs & Search */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-bold flex-wrap">
            <button
              onClick={() => { setActiveTab('loans'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'loans'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>เงินกู้ยืมในเครือ ({intercompanyLoans.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('transfers'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'transfers'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
              <span>โอนเงินระหว่างบัญชี ({transfers.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('account_tx'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'account_tx'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                ความเคลื่อนไหวบัญชี {selectedAccount !== 'all' ? `(${selectedAccount.split(' ')[0]})` : `(${accountTransactions.length})`}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาเอกสาร, รายละเอียด..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#005aa9] font-medium"
            />
          </div>
        </div>

        {/* Tab 1: Intercompany Loans Table */}
        {activeTab === 'loans' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">วันที่</th>
                  <th className="py-2.5 px-3">เลขที่เอกสาร</th>
                  <th className="py-2.5 px-3">ประเภท</th>
                  <th className="py-2.5 px-3">รายละเอียดเงินยืม / คืนเงิน</th>
                  <th className="py-2.5 px-3 text-right">จำนวนเงิน</th>
                  <th className="py-2.5 px-3 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      ไม่พบรายการเงินกู้ยืมตามเงื่อนไขที่ค้นหา
                    </td>
                  </tr>
                ) : (
                  (paginatedItems as typeof intercompanyLoans).map((loan, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-900">{loan.date}</td>
                      <td className="py-2 px-3 whitespace-nowrap font-mono text-slate-600">{loan.docNo || '-'}</td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          loan.type === 'borrow' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {loan.type === 'borrow' ? '📥 เงินกู้ยืมเข้า' : '📤 คืนเงินกู้ยืม'}
                        </span>
                      </td>
                      <td className="py-2 px-3 max-w-md font-medium text-slate-800">
                        {loan.description}
                      </td>
                      <td className="py-2 px-3 text-right font-bold font-mono text-slate-900 whitespace-nowrap">
                        {formatCurrency(loan.amount)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>{loan.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Inter-Account Transfers Table */}
        {activeTab === 'transfers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">วันที่</th>
                  <th className="py-2.5 px-3">เลขที่เอกสาร</th>
                  <th className="py-2.5 px-3">บัญชีธนาคาร</th>
                  <th className="py-2.5 px-3">รายละเอียดการโอนย้ายเงิน</th>
                  <th className="py-2.5 px-3 text-right">จำนวนเงินโอน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      ไม่พบรายการโอนระหว่างบัญชีตามเงื่อนไขที่ค้นหา
                    </td>
                  </tr>
                ) : (
                  (paginatedItems as typeof transfers).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-900">{tx.date}</td>
                      <td className="py-2 px-3 whitespace-nowrap font-mono text-slate-600">{tx.docNo || '-'}</td>
                      <td className="py-2 px-3 max-w-xs truncate font-medium text-slate-800">{tx.account}</td>
                      <td className="py-2 px-3 max-w-sm text-slate-700">{tx.description}</td>
                      <td className="py-2 px-3 text-right font-bold font-mono text-blue-700 whitespace-nowrap">
                        {formatCurrency(Math.max(tx.debit, tx.credit))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Specific Account Movements / Statements */}
        {activeTab === 'account_tx' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">วันที่</th>
                  <th className="py-2.5 px-3">เลขที่เอกสาร</th>
                  <th className="py-2.5 px-3">หมวดหมู่ / บัญชี</th>
                  <th className="py-2.5 px-3">รายละเอียด</th>
                  <th className="py-2.5 px-3 text-right">เงินเข้า (Dr.)</th>
                  <th className="py-2.5 px-3 text-right">เงินออก (Cr.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      ไม่พบรายการเคลื่อนไหวของบัญชีนี้
                    </td>
                  </tr>
                ) : (
                  (paginatedItems as Transaction[]).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-900">{tx.date}</td>
                      <td className="py-2 px-3 whitespace-nowrap font-mono text-slate-600">{tx.docNo || '-'}</td>
                      <td className="py-2 px-3 max-w-xs">
                        <span className="font-semibold text-slate-800 block truncate">{tx.category}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{tx.account}</span>
                      </td>
                      <td className="py-2 px-3 max-w-sm text-slate-700 truncate">{tx.description}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-600 whitespace-nowrap">
                        {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-rose-600 whitespace-nowrap">
                        {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Pagination & Counts */}
        <div className="p-3 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="text-slate-500">
            แสดง <strong className="text-slate-800">{paginatedItems.length}</strong> จากทั้งหมด <strong className="text-slate-800">{displayedItems.length}</strong> รายการ
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="px-2 font-mono text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

