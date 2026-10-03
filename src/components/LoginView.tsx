import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, Lock, User, KeyRound, 
  ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff,
  UserCheck, Briefcase, ChevronRight, Sparkles
} from 'lucide-react';
import { BTCLogo } from './BTCLogo';
import { AppUser } from '../types';
import { getStoredUsers, authenticateUser } from '../services/userService';

interface LoginViewProps {
  onLoginSuccess: (user: AppUser) => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const users = getStoredUsers().filter(u => u.isActive);
  const [activeTab, setActiveTab] = useState<'quick' | 'form'>('quick');

  // Quick Select State
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(() => users[0] || null);
  const [pin, setPin] = useState('');
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedUser) {
      setErrorMessage('กรุณาเลือกผู้ใช้งาน');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = authenticateUser(selectedUser.username, pin || undefined);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.message || 'รหัสผ่านหรือ PIN ไม่ถูกต้อง');
      }
    }, 250);
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('กรุณาระบุชื่อผู้ใช้งาน (Username)');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = authenticateUser(username.trim(), password.trim() || undefined);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    }, 250);
  };

  const handleQuickPinDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4 && selectedUser) {
        // Auto submit if 4 digits
        setIsLoading(true);
        setTimeout(() => {
          const res = authenticateUser(selectedUser.username, nextPin);
          setIsLoading(false);
          if (res.success && res.user) {
            onLoginSuccess(res.user);
          } else {
            setErrorMessage(res.message || 'รหัส PIN ไม่ถูกต้อง (รหัสเริ่มต้น: 1234)');
          }
        }, 200);
      }
    }
  };

  const getRoleBadge = (role: AppUser['role']) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            Admin (สิทธิ์สูงสุด)
          </span>
        );
      case 'manager':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Manager (ผู้จัดการ)
          </span>
        );
      case 'user':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            User (พนักงาน)
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-[#00386b] flex flex-col items-center justify-center p-4 sm:p-6 text-slate-800">
      
      {/* Container Box */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left / Top Side: Corporate Identity Banner */}
        <div className="md:w-5/12 bg-gradient-to-br from-slate-900 via-[#004887] to-[#005aa9] p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Decorative Circles */}
          <div className="absolute -top-16 -left-16 w-52 h-52 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Header */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15">
              <BTCLogo size="md" showText={false} />
              <div>
                <span className="text-xs font-black tracking-wider uppercase text-white block">
                  BTC ENTERPRISE ERP
                </span>
                <span className="text-[10px] text-blue-200 block">
                  ระบบบริหารงานก่อสร้าง & บัญชี
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
                เข้าสู่ระบบแยกผู้ใช้งาน
              </h1>
              <p className="text-xs text-blue-100/90 leading-relaxed">
                บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด
              </p>
            </div>
          </div>

          {/* Middle: Feature Highlights */}
          <div className="relative z-10 my-6 space-y-2.5 text-xs text-blue-100">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-md bg-white/10 text-emerald-300 shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-white block">Role & Permission 3 ระดับ</span>
                <span className="text-[11px] text-blue-200">Admin, Manager, User กำหนดสิทธิ์แยกชัดเจน</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-md bg-white/10 text-amber-300 shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-white block">ความปลอดภัยของข้อมูลการเงิน</span>
                <span className="text-[11px] text-blue-200">ซ่อนยอดเงินในบัญชีและรายงาน P&L สำหรับพนักงานทั่วไป</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-md bg-white/10 text-blue-300 shrink-0 mt-0.5">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-white block">ลงนามเอกสาร DBM อัตโนมัติ</span>
                <span className="text-[11px] text-blue-200">เชื่อมโยงชื่อผู้ขอเบิกและสิทธิ์ตรวจสอบตามตัวตนจริง</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer info */}
          <div className="relative z-10 pt-4 border-t border-white/15 text-[11px] text-blue-200/80 flex items-center justify-between">
            <span>เวอร์ชัน 2.8 • ปี 2569</span>
            <span className="font-mono text-[10px]">Buriram Thongchai</span>
          </div>
        </div>

        {/* Right Side: Login Form & User Selector */}
        <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between bg-white">
          
          <div>
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('quick');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'quick'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#005aa9]" />
                <span>เลือกโปรไฟล์ด่วน (Staff Select)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('form');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-[#005aa9]" />
                <span>Username & Password</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* TAB 1: QUICK PROFILE SELECT */}
            {activeTab === 'quick' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    เลือกพนักงานผู้เข้าใช้งาน:
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
                    {users.map(u => {
                      const isSelected = selectedUser?.id === u.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(u);
                            setErrorMessage(null);
                            setPin('');
                          }}
                          className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-blue-50/80 border-[#005aa9] ring-2 ring-[#005aa9]/20 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-[#005aa9] text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {u.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {u.name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                              <span>{u.department}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-[#005aa9] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected User Details & PIN Entry */}
                {selectedUser && (
                  <form onSubmit={handleQuickLogin} className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {selectedUser.name} ({selectedUser.username})
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {selectedUser.roleTitle} • {selectedUser.department}
                        </div>
                      </div>
                      {getRoleBadge(selectedUser.role)}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700">
                        ป้อนรหัส PIN เข้าใช้งาน (เริ่มต้น: 1234):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="password"
                          maxLength={6}
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          placeholder="•••• (1234)"
                          className="flex-1 px-3 py-2 text-center text-base tracking-widest font-mono font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005aa9]"
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-5 py-2 bg-[#005aa9] hover:bg-[#004887] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-900/20 transition-all shrink-0"
                        >
                          {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Numeric PIN Quick Pad for touch / mouse */}
                    <div className="grid grid-cols-5 gap-1 pt-1">
                      {['1', '2', '3', '4', 'C'].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            if (val === 'C') {
                              setPin('');
                            } else {
                              handleQuickPinDigit(val);
                            }
                          }}
                          className={`py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                            val === 'C'
                              ? 'bg-slate-100 text-rose-700 border-slate-300 hover:bg-rose-50'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: USERNAME & PASSWORD FORM */}
            {activeTab === 'form' && (
              <form onSubmit={handleFormLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อผู้ใช้งาน (Username):
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="เช่น admin, paweena, theeraphong, arnon"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005aa9]"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รหัสผ่าน หรือ PIN (เริ่มต้น: 1234):
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="ป้อนรหัสผ่าน หรือ PIN 1234"
                      className="w-full pl-9 pr-10 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005aa9]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#005aa9] hover:bg-[#004887] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-900/20 transition-all"
                  >
                    {isLoading ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบ (Sign In)'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Quick Demo Credentials Footer */}
          <div className="mt-6 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>บัญชีทดสอบระบบตาม Role (รหัสเริ่มต้น: 1234):</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('form');
                  setUsername('admin');
                  setPassword('1234');
                  setErrorMessage(null);
                }}
                className="p-1.5 rounded-lg border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-900 text-left cursor-pointer transition-colors"
              >
                <div className="font-bold">👑 Admin</div>
                <div className="truncate text-slate-600">user: admin</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('form');
                  setUsername('kamolthip');
                  setPassword('1234');
                  setErrorMessage(null);
                }}
                className="p-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 text-left cursor-pointer transition-colors"
              >
                <div className="font-bold">💼 Manager</div>
                <div className="truncate text-slate-600">user: kamolthip</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('form');
                  setUsername('arnon');
                  setPassword('1234');
                  setErrorMessage(null);
                }}
                className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 text-left cursor-pointer transition-colors"
              >
                <div className="font-bold">👷 User (Staff)</div>
                <div className="truncate text-slate-600">user: arnon</div>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
