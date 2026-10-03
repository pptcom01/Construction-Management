import React from 'react';
import { 
  X, User, ShieldCheck, Check, Building2, 
  Mail, Briefcase, UserCheck, LogOut, KeyRound, Shield
} from 'lucide-react';
import { AppUser, UserRole } from '../types';
import { useActiveUser } from '../services/userService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AppUser | null;
  userRole?: UserRole;
  onLogout?: () => void;
  onRoleChange?: (role: any) => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  userRole,
  onLogout
}: UserProfileModalProps) {
  const { activeUserName } = useActiveUser();

  if (!isOpen) return null;

  const displayName = currentUser?.name || activeUserName;
  const displayRole = currentUser?.role || (userRole === 'admin' ? 'admin' : userRole === 'manager' || userRole === 'executive' ? 'manager' : 'user');
  const department = currentUser?.department || 'บจก. บุรีรัมย์ธงชัยก่อสร้าง';
  const roleTitle = currentUser?.roleTitle || (displayRole === 'admin' ? 'ผู้ดูแลระบบสูงสุด (System Admin)' : displayRole === 'manager' ? 'ผู้จัดการ / หัวหน้าฝ่าย' : 'เจ้าหน้าที่ปฏิบัติงาน');
  const username = currentUser?.username || '-';
  const email = currentUser?.email || '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#005aa9] to-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                โปรไฟล์ผู้ใช้งาน (User Profile)
              </h3>
              <p className="text-[11px] text-blue-100">
                ข้อมูลบัญชีและสิทธิ์การเข้าใช้งานระบบ BTC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          
          {/* User Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
            <div className={`w-14 h-14 rounded-2xl font-bold flex items-center justify-center text-lg text-white shadow-xs shrink-0 ${
              displayRole === 'admin'
                ? 'bg-purple-700'
                : displayRole === 'manager'
                  ? 'bg-[#005aa9]'
                  : 'bg-emerald-600'
            }`}>
              {displayName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  displayRole === 'admin' 
                    ? 'bg-purple-100 text-purple-900 border border-purple-300' 
                    : displayRole === 'manager'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  <Shield className="w-3 h-3" />
                  {displayRole}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                  <Check className="w-2.5 h-2.5" /> ใช้งานอยู่
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 truncate mt-1">
                {displayName}
              </h4>
              <p className="text-xs text-slate-500 truncate">
                {roleTitle}
              </p>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>ชื่อผู้ใช้ (Username):</span>
              </span>
              <span className="font-bold font-mono text-slate-800">
                {username}
              </span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>ฝ่ายงาน (Department):</span>
              </span>
              <span className="font-semibold text-slate-800">
                {department}
              </span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>อีเมล (Email):</span>
              </span>
              <span className="font-medium text-slate-600 truncate max-w-[200px]">
                {email}
              </span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>ระดับสิทธิ์ (Role):</span>
              </span>
              <span className="font-bold text-slate-900">
                {displayRole === 'admin' 
                  ? '👑 Admin (ผู้ดูแลระบบสูงสุด)' 
                  : displayRole === 'manager' 
                    ? '💼 Manager (ผู้จัดการ/อนุมัติ)' 
                    : '👤 User (เจ้าหน้าที่ทั่วไป)'}
              </span>
            </div>
          </div>

          {/* Allowed tabs hint */}
          {currentUser?.allowedTabs && currentUser.allowedTabs.length > 0 && (
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs">
              <span className="text-[11px] font-bold text-blue-900 block mb-1">
                สิทธิ์การเข้าถึงเมนูระบบ ({currentUser.allowedTabs.length} เมนู):
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {currentUser.allowedTabs.slice(0, 8).map(tab => (
                  <span key={tab} className="px-1.5 py-0.5 rounded bg-white text-slate-700 text-[10px] font-medium border border-blue-200">
                    {tab}
                  </span>
                ))}
                {currentUser.allowedTabs.length > 8 && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                    +{currentUser.allowedTabs.length - 8} เมนู
                  </span>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer with Logout & Close */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
          {onLogout ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ (Sign Out)</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
