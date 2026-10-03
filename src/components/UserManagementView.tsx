import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, Shield, ShieldCheck, UserCheck, 
  Search, Filter, Edit3, Trash2, Power, CheckCircle2, 
  X, AlertCircle, Key, Lock, Check, Layers, HardHat,
  FolderKanban, ShoppingBag, ReceiptText, CreditCard,
  WalletCards, LayoutDashboard, BarChart3, Sparkles,
  FileCheck2, CheckSquare, FileText, RefreshCw, Eye
} from 'lucide-react';
import { AppUser, UserRole, ViewTab } from '../types';
import { 
  getStoredUsers, 
  saveStoredUsers, 
  DEFAULT_ROLE_TABS,
  INITIAL_APP_USERS 
} from '../services/userService';

interface UserManagementViewProps {
  currentUser: AppUser | null;
  onUserListChange?: () => void;
}

const DEPARTMENTS_LIST = [
  'ฝ่ายบัญชี & ผู้บริหาร',
  'ฝ่ายการเงิน',
  'ฝ่ายโครงการ',
  'ฝ่ายจัดซื้อ',
  'ฝ่ายเครื่องจักร',
  'ทั่วไป / ธุรการ'
];

interface TabInfo {
  id: ViewTab;
  name: string;
  department: string;
}

const ALL_SYSTEM_TABS: TabInfo[] = [
  // ฝ่ายโครงการ
  { id: 'boq', name: 'BOQ โครงการ 3 ชั้น', department: 'ฝ่ายโครงการ' },
  { id: 'subcontracts', name: 'บริหารผู้รับเหมาช่วง', department: 'ฝ่ายโครงการ' },
  { id: 'projects', name: 'ต้นทุน & กำไรโครงการ', department: 'ฝ่ายโครงการ' },

  // ฝ่ายจัดซื้อ
  { id: 'procurement', name: 'ตรวจรับพัสดุ & ตัดหักช่าง', department: 'ฝ่ายจัดซื้อ' },
  { id: 'supplier_billing', name: 'รับวางบิลร้านค้า (3-Way Match)', department: 'ฝ่ายจัดซื้อ' },

  // ฝ่ายการเงิน
  { id: 'disbursements', name: 'ใบขอตั้งเบิกค่าใช้จ่าย (DBM)', department: 'ฝ่ายการเงิน' },
  { id: 'payment', name: 'บันทึกจ่ายเงิน & ใบสำคัญจ่าย (PV)', department: 'ฝ่ายการเงิน' },
  { id: 'accounts', name: 'บัญชีธนาคาร & เงินยืม', department: 'ฝ่ายการเงิน' },

  // ฝ่ายบัญชี & ผู้บริหาร
  { id: 'dashboard', name: 'แดชบอร์ดภาพรวมผู้บริหาร', department: 'ฝ่ายบัญชี & ผู้บริหาร' },
  { id: 'reports', name: 'รายงานการเงิน & งบกำไรขาดทุน P&L', department: 'ฝ่ายบัญชี & ผู้บริหาร' },
  { id: 'ai_analysis', name: 'AI วิเคราะห์งบการเงิน', department: 'ฝ่ายบัญชี & ผู้บริหาร' },
  { id: 'transactions', name: 'สมุดรายรับ-รายจ่าย (GL)', department: 'ฝ่ายบัญชี & ผู้บริหาร' },
  { id: 'tax_summary', name: 'สรุปภาษี & ประกันสังคม', department: 'ฝ่ายบัญชี & ผู้บริหาร' },
  { id: 'todoist', name: 'กำหนดจ่าย & ภาระผูกพัน', department: 'ฝ่ายบัญชี & ผู้บริหาร' },
  { id: 'document_templates', name: 'แบบฟอร์มเอกสารมาตรฐาน', department: 'ฝ่ายบัญชี & ผู้บริหาร' },
  { id: 'user_management', name: 'จัดการผู้ใช้งาน & กำหนดสิทธิ์', department: 'ฝ่ายบัญชี & ผู้บริหาร' },
];

export function UserManagementView({ currentUser, onUserListChange }: UserManagementViewProps) {
  const [users, setUsers] = useState<AppUser[]>(() => getStoredUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AppUser | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    roleTitle: '',
    department: DEPARTMENTS_LIST[0],
    email: '',
    role: 'user' as 'admin' | 'manager' | 'user',
    pin: '1234',
    password: '',
    isActive: true,
    allowedTabs: DEFAULT_ROLE_TABS.user
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      roleTitle: '',
      department: DEPARTMENTS_LIST[2], // ฝ่ายโครงการ
      email: '',
      role: 'user',
      pin: '1234',
      password: '',
      isActive: true,
      allowedTabs: [...DEFAULT_ROLE_TABS.user]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: AppUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      roleTitle: user.roleTitle,
      department: user.department,
      email: user.email || '',
      role: user.role,
      pin: user.pin || '1234',
      password: user.password || '',
      isActive: user.isActive,
      allowedTabs: user.allowedTabs && user.allowedTabs.length > 0 
        ? [...user.allowedTabs] 
        : [...DEFAULT_ROLE_TABS[user.role]]
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('กรุณาระบุชื่อ-นามสกุล');
      return;
    }
    if (!formData.username.trim()) {
      alert('กรุณาระบุชื่อผู้ใช้งาน (Username)');
      return;
    }

    const usernameLower = formData.username.trim().toLowerCase();
    
    // Check duplicate username
    const duplicate = users.find(u => 
      u.username.toLowerCase() === usernameLower && 
      (!editingUser || u.id !== editingUser.id)
    );
    if (duplicate) {
      alert(`ชื่อผู้ใช้งาน "${formData.username}" มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`);
      return;
    }

    let updatedList: AppUser[];
    if (editingUser) {
      updatedList = users.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name: formData.name.trim(),
            username: usernameLower,
            roleTitle: formData.roleTitle.trim(),
            department: formData.department,
            email: formData.email.trim() || undefined,
            role: formData.role,
            pin: formData.pin.trim() || '1234',
            password: formData.password.trim() || undefined,
            isActive: formData.isActive,
            allowedTabs: formData.allowedTabs
          };
        }
        return u;
      });
      showNotice(`แก้ไขข้อมูลผู้ใช้งาน "${formData.name}" เรียบร้อยแล้ว`);
    } else {
      const newUser: AppUser = {
        id: `user-${Date.now()}`,
        name: formData.name.trim(),
        username: usernameLower,
        roleTitle: formData.roleTitle.trim() || 'พนักงาน',
        department: formData.department,
        email: formData.email.trim() || undefined,
        role: formData.role,
        pin: formData.pin.trim() || '1234',
        password: formData.password.trim() || undefined,
        isActive: formData.isActive,
        allowedTabs: formData.allowedTabs,
        createdAt: new Date().toISOString().split('T')[0]
      };
      updatedList = [newUser, ...users];
      showNotice(`เพิ่มผู้ใช้งานใหม่ "${formData.name}" เรียบร้อยแล้ว`);
    }

    setUsers(updatedList);
    saveStoredUsers(updatedList);
    if (onUserListChange) onUserListChange();
    setIsModalOpen(false);
  };

  const handleToggleActive = (user: AppUser) => {
    if (currentUser && user.id === currentUser.id) {
      alert('ไม่สามารถปิดการใช้งานบัญชีที่คุณกำลังล็อกอินอยู่ในขณะนี้ได้');
      return;
    }

    const nextActive = !user.isActive;
    const updated = users.map(u => u.id === user.id ? { ...u, isActive: nextActive } : u);
    setUsers(updated);
    saveStoredUsers(updated);
    if (onUserListChange) onUserListChange();
    showNotice(nextActive ? `เปิดการใช้งาน "${user.name}" แล้ว` : `ปิดการใช้งาน "${user.name}" ชั่วคราวแล้ว`);
  };

  const handleDeleteUser = (user: AppUser) => {
    if (currentUser && user.id === currentUser.id) {
      alert('ไม่สามารถลบบัญชีที่คุณกำลังใช้งานอยู่ในขณะนี้ได้');
      return;
    }

    // Prevent deleting last admin
    const adminCount = users.filter(u => u.role === 'admin').length;
    if (user.role === 'admin' && adminCount <= 1) {
      alert('ไม่สามารถลบ Admin คนสุดท้ายของระบบได้ ต้องมีผู้ดูแลระบบอย่างน้อย 1 คน');
      return;
    }

    const updated = users.filter(u => u.id !== user.id);
    setUsers(updated);
    saveStoredUsers(updated);
    if (onUserListChange) onUserListChange();
    setDeleteConfirmUser(null);
    showNotice(`ลบผู้ใช้งาน "${user.name}" ออกจากระบบแล้ว`);
  };

  const handleResetToDefaults = () => {
    if (confirm('คุณต้องการรีเซ็ตรายชื่อผู้ใช้งานกลับเป็นค่าเริ่มต้นมาตรฐานของบริษัทหรือไม่? (ข้อมูลที่เพิ่มใหม่จะถูกแทนที่)')) {
      setUsers(INITIAL_APP_USERS);
      saveStoredUsers(INITIAL_APP_USERS);
      if (onUserListChange) onUserListChange();
      showNotice('รีเซ็ตข้อมูลผู้ใช้งานกลับเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
    }
  };

  // Permission selection helpers in Form
  const handleRoleChangeInForm = (newRole: 'admin' | 'manager' | 'user') => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      allowedTabs: [...DEFAULT_ROLE_TABS[newRole]]
    }));
  };

  const toggleTabInForm = (tabId: ViewTab) => {
    setFormData(prev => {
      const exists = prev.allowedTabs.includes(tabId);
      return {
        ...prev,
        allowedTabs: exists 
          ? prev.allowedTabs.filter(t => t !== tabId)
          : [...prev.allowedTabs, tabId]
      };
    });
  };

  const handleSelectAllTabs = () => {
    setFormData(prev => ({
      ...prev,
      allowedTabs: ALL_SYSTEM_TABS.map(t => t.id)
    }));
  };

  const handleResetRoleTabs = () => {
    setFormData(prev => ({
      ...prev,
      allowedTabs: [...DEFAULT_ROLE_TABS[prev.role]]
    }));
  };

  // Metrics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.isActive).length;
    const inactive = total - active;
    const admin = users.filter(u => u.role === 'admin').length;
    const manager = users.filter(u => u.role === 'manager').length;
    const userRoleCount = users.filter(u => u.role === 'user').length;
    return { total, active, inactive, admin, manager, userRoleCount };
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Search
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesUsername = u.username.toLowerCase().includes(q);
        const matchesDept = u.department.toLowerCase().includes(q);
        const matchesRoleTitle = u.roleTitle.toLowerCase().includes(q);
        if (!matchesName && !matchesUsername && !matchesDept && !matchesRoleTitle) {
          return false;
        }
      }

      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'active' && !u.isActive) return false;
      if (statusFilter === 'inactive' && u.isActive) return false;

      return true;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const getRoleBadge = (role: AppUser['role']) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1 shrink-0">
            <Shield className="w-3 h-3 text-purple-700" />
            Admin (สิทธิ์สูงสุด)
          </span>
        );
      case 'manager':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1 shrink-0">
            <ShieldCheck className="w-3 h-3 text-blue-700" />
            Manager (ผู้จัดการ)
          </span>
        );
      case 'user':
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1 shrink-0">
            <UserCheck className="w-3 h-3 text-emerald-700" />
            User (พนักงาน)
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Banner / Heading */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#005aa9] text-white flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              การจัดการผู้ใช้งาน & สิทธิ์การเข้าถึง (User Management & RBAC)
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-500">
            เพิ่ม, แก้ไข, ปิดใช้งานบัญชี และควบคุมสิทธิ์ว่าบทบาท Admin, Manager หรือ User เข้าถึงเมนูใดได้บ้าง
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="รีเซ็ตกลับเป็นรายชื่อเริ่มต้นของบริษัท"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>คืนค่าเริ่มต้น</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#005aa9] hover:bg-[#004887] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-900/20 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ เพิ่มผู้ใช้งานใหม่</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ผู้ใช้ทั้งหมด</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{stats.total}</span>
          <span className="text-[10px] text-slate-400">บัญชีในระบบ</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">ใช้งานอยู่ (Active)</span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">{stats.active}</span>
          <span className="text-[10px] text-emerald-600">พร้อมล็อกอิน</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-2xs bg-rose-50/20">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">ปิดใช้งาน (Inactive)</span>
          <span className="text-xl font-black text-rose-700 mt-1 block">{stats.inactive}</span>
          <span className="text-[10px] text-rose-600">ระงับการเข้าถึง</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-2xs bg-purple-50/20">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">Admin</span>
          <span className="text-xl font-black text-purple-800 mt-1 block">{stats.admin}</span>
          <span className="text-[10px] text-purple-600">สิทธิ์เต็ม 100%</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs bg-blue-50/20">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Manager</span>
          <span className="text-xl font-black text-blue-800 mt-1 block">{stats.manager}</span>
          <span className="text-[10px] text-blue-600">ผู้จัดการ & อนุมัติ</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">User (Staff)</span>
          <span className="text-xl font-black text-slate-800 mt-1 block">{stats.userRoleCount}</span>
          <span className="text-[10px] text-slate-500">พนักงานทั่วไป</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ, username, ตำแหน่ง หรือแผนก..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005aa9] focus:bg-white"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ล้างคำค้น
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">สิทธิ์:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">ทุกระดับสิทธิ์ ({users.length})</option>
              <option value="admin">Admin ({stats.admin})</option>
              <option value="manager">Manager ({stats.manager})</option>
              <option value="user">User ({stats.userRoleCount})</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">สถานะ:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">ทั้งหมด ({users.length})</option>
              <option value="active">ใช้งานอยู่ ({stats.active})</option>
              <option value="inactive">ปิดใช้งาน ({stats.inactive})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4">ผู้ใช้งาน (User Profile)</th>
                <th className="py-3 px-3">ตำแหน่ง & แผนก</th>
                <th className="py-3 px-3">ระดับสิทธิ์ (Role)</th>
                <th className="py-3 px-3 text-center">สิทธิ์เมนูที่เข้าได้</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    ไม่พบผู้ใช้งานที่ตรงตามเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isCurrent = currentUser?.id === user.id;
                  const allowedTabsCount = user.allowedTabs && user.allowedTabs.length > 0 
                    ? user.allowedTabs.length 
                    : (DEFAULT_ROLE_TABS[user.role] || []).length;

                  return (
                    <tr 
                      key={user.id}
                      className={`hover:bg-slate-50/80 transition-colors ${!user.isActive ? 'bg-slate-50/50 opacity-70' : ''}`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                            user.role === 'admin'
                              ? 'bg-purple-700 text-white'
                              : user.role === 'manager'
                                ? 'bg-[#005aa9] text-white'
                                : 'bg-slate-200 text-slate-800'
                          }`}>
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="truncate">{user.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                                  คุณกำลังใช้อยู่
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              @{user.username} {user.email && `• ${user.email}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Position & Department */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{user.roleTitle}</div>
                        <div className="text-[11px] text-slate-500">{user.department}</div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-3">
                        {getRoleBadge(user.role)}
                      </td>

                      {/* Allowed Tabs */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          allowedTabsCount >= 14
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : allowedTabsCount >= 10
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {allowedTabsCount} / {ALL_SYSTEM_TABS.length} เมนู
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(user)}
                          disabled={isCurrent}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            user.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          } ${isCurrent ? 'cursor-not-allowed opacity-80' : ''}`}
                          title={isCurrent ? 'บัญชีปัจจุบัน' : 'คลิกเพื่อเปิด/ปิดการใช้งาน'}
                        >
                          <Power className={`w-3 h-3 ${user.isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                          <span>{user.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#005aa9] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="แก้ไขข้อมูล & สิทธิ์เมนู"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmUser(user)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrent 
                                ? 'text-slate-300 cursor-not-allowed' 
                                : 'text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                            }`}
                            title={isCurrent ? 'ไม่สามารถลบบัญชีตนเองได้' : 'ลบผู้ใช้งาน'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-slate-800 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#005aa9] text-white flex items-center justify-center font-bold">
                  {editingUser ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingUser ? `แก้ไขผู้ใช้งาน: ${editingUser.name}` : 'เพิ่มผู้ใช้งานใหม่ในระบบ (Add New User)'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    กำหนดข้อมูลประจำตัว สิทธิ์บทบาท และเมนูที่อนุญาตให้เข้าถึง
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              
              {/* Row 1: Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่อ-นามสกุล *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="เช่น น.ส.สมศรี มีทรัพย์"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005aa9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่อผู้ใช้งาน (Username สำหรับล็อกอิน) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="เช่น somsee (ตัวพิมพ์เล็ก)"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005aa9] font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Role Title & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ตำแหน่งงาน
                  </label>
                  <input
                    type="text"
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    placeholder="เช่น วิศวกรโครงการ, ช่างคุมงาน"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005aa9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    แผนกที่สังกัด
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005aa9]"
                  >
                    {DEPARTMENTS_LIST.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Email & PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    อีเมล (Email)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="somsee@buriramthongchai.com"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005aa9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    รหัส PIN เข้าใช้งาน (4 หลัก เริ่มต้น: 1234)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    placeholder="1234"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005aa9] font-mono font-bold"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block font-bold text-slate-800 text-xs">
                  ระดับสิทธิ์หลัก (Primary Role):
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleChangeInForm('admin')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      formData.role === 'admin'
                        ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-purple-900 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      เข้าถึงทุกเมนู 100% รวมทั้งจัดการผู้ใช้งาน
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChangeInForm('manager')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      formData.role === 'manager'
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-blue-900 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Manager</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      ดูแดชบอร์ด, อนุมัติเบิกจ่าย, ดูรายงาน P&L
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChangeInForm('user')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      formData.role === 'user'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-emerald-900 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>User (Staff)</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      ทำใบขอเบิก, ตรวจรับพัสดุ (ซ่อนการเงิน)
                    </div>
                  </button>
                </div>
              </div>

              {/* Granular Menu Permissions Matrix */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <label className="block font-bold text-slate-800 text-xs">
                      สิทธิ์การเข้าถึงรายเมนู (Granular Menu Permissions):
                    </label>
                    <span className="text-[10px] text-slate-500">
                      อนุญาตเข้าถึง {formData.allowedTabs.length} จาก {ALL_SYSTEM_TABS.length} เมนู
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleSelectAllTabs}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      เลือกทั้งหมด
                    </button>
                    <button
                      type="button"
                      onClick={handleResetRoleTabs}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer"
                    >
                      คืนค่าตาม Role
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[180px] overflow-y-auto p-1.5 bg-slate-50/50 rounded-lg border border-slate-200">
                  {ALL_SYSTEM_TABS.map(tab => {
                    const isChecked = formData.allowedTabs.includes(tab.id);
                    return (
                      <label
                        key={tab.id}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border cursor-pointer select-none transition-colors ${
                          isChecked
                            ? 'bg-blue-50/80 border-blue-300 text-blue-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTabInForm(tab.id)}
                          className="rounded text-[#005aa9] focus:ring-[#005aa9]"
                        />
                        <span className="truncate text-[11px]">{tab.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800 text-xs">สถานะเปิดใช้งาน (Active)</div>
                  <div className="text-[10px] text-slate-500">
                    หากปิดสวิตช์ ผู้ใช้นี้จะไม่สามารถล็อกอินเข้าสู่ระบบได้
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded text-[#005aa9] focus:ring-[#005aa9] cursor-pointer"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005aa9] hover:bg-[#004887] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-900/20 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingUser ? 'บันทึกการแก้ไข' : 'บันทึกผู้ใช้งานใหม่'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">ยืนยันการลบผู้ใช้งาน</h4>
                <p className="text-xs text-slate-500">การดำเนินการนี้ไม่สามารถเรียกคืนข้อมูลได้</p>
              </div>
            </div>

            <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
              <div>คุณกำลังจะลบผู้ใช้: <strong>{deleteConfirmUser.name}</strong> (@{deleteConfirmUser.username})</div>
              <div className="text-[11px] text-red-600">ตำแหน่ง: {deleteConfirmUser.roleTitle} • แผนก: {deleteConfirmUser.department}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(deleteConfirmUser)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-red-900/20 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ยืนยันการลบ</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
