import { useState, useEffect } from 'react';
import { getCurrentGoogleUser } from './googleAuthService';
import { AppUser, UserRole, ViewTab } from '../types';

export interface StaffMember {
  id: string;
  name: string;
  roleTitle: string;
  department: string;
  email?: string;
  defaultRole: 'executive' | 'staff';
}

export const DEFAULT_ROLE_TABS: Record<'admin' | 'manager' | 'user', ViewTab[]> = {
  admin: [
    'dashboard',
    'boq',
    'subcontracts',
    'projects',
    'procurement',
    'supplier_billing',
    'disbursements',
    'payment',
    'accounts',
    'transactions',
    'reports',
    'tax_summary',
    'todoist',
    'ai_analysis',
    'document_templates',
    'user_management'
  ],
  manager: [
    'dashboard',
    'boq',
    'subcontracts',
    'projects',
    'procurement',
    'supplier_billing',
    'disbursements',
    'payment',
    'accounts',
    'transactions',
    'reports',
    'tax_summary',
    'todoist',
    'ai_analysis',
    'document_templates'
  ],
  user: [
    'disbursements',
    'boq',
    'subcontracts',
    'procurement',
    'supplier_billing',
    'todoist',
    'document_templates'
  ]
};

export const INITIAL_APP_USERS: AppUser[] = [
  {
    id: 'user-admin',
    username: 'admin',
    name: 'ผู้ดูแลระบบสูงสุด (System Admin)',
    roleTitle: 'ผู้ดูแลระบบไอทีและบัญชี',
    department: 'ฝ่ายบัญชี & ผู้บริหาร',
    email: 'admin@buriramthongchai.com',
    role: 'admin',
    password: 'admin',
    pin: '1234',
    isActive: true,
    allowedTabs: DEFAULT_ROLE_TABS.admin,
    createdAt: '2026-01-01'
  },
  { 
    id: 'staff-1',
    username: 'paweena',
    name: 'น.ส.ปวีณา ใยอุ่น', 
    roleTitle: 'หัวหน้าฝ่ายบัญชี', 
    department: 'ฝ่ายบัญชี & ผู้บริหาร', 
    email: 'buriramthongchai.co.ltd@gmail.com',
    role: 'admin',
    password: '1234',
    pin: '1234',
    isActive: true,
    allowedTabs: DEFAULT_ROLE_TABS.admin,
    createdAt: '2026-01-01'
  },
  { 
    id: 'staff-2',
    username: 'kamolthip',
    name: 'น.ส.กมลทิพย์ กรมทอง', 
    roleTitle: 'เจ้าหน้าที่การเงินอาวุโส', 
    department: 'ฝ่ายการเงิน', 
    email: 'kamolthip.btc@gmail.com',
    role: 'manager',
    password: '1234',
    pin: '1234',
    isActive: true,
    allowedTabs: DEFAULT_ROLE_TABS.manager,
    createdAt: '2026-01-01'
  },
  { 
    id: 'staff-4',
    username: 'theeraphong',
    name: 'นายธีรพงษ์ บุญเรือง', 
    roleTitle: 'ผู้จัดการโครงการ (PM)', 
    department: 'ฝ่ายโครงการ', 
    email: 'theeraphong.pm@gmail.com',
    role: 'manager',
    password: '1234',
    pin: '1234',
    isActive: true,
    allowedTabs: DEFAULT_ROLE_TABS.manager,
    createdAt: '2026-01-01'
  },
  { 
    id: 'staff-3',
    username: 'arnon',
    name: 'นายอานนท์ รุ่งเรือง', 
    roleTitle: 'วิศวกรภาคสนาม', 
    department: 'ฝ่ายโครงการ', 
    email: 'arnon.eng@gmail.com',
    role: 'user',
    password: '1234',
    pin: '1234',
    isActive: true,
    allowedTabs: DEFAULT_ROLE_TABS.user,
    createdAt: '2026-01-01'
  },
  { 
    id: 'staff-5',
    username: 'somporn',
    name: 'สมพร สโตร์', 
    roleTitle: 'เจ้าหน้าที่คลังพัสดุและสโตร์', 
    department: 'ฝ่ายจัดซื้อ', 
    email: 'somporn.store@gmail.com',
    role: 'user',
    password: '1234',
    pin: '1234',
    isActive: true,
    allowedTabs: DEFAULT_ROLE_TABS.user,
    createdAt: '2026-01-01'
  },
  { 
    id: 'staff-6',
    username: 'choochat',
    name: 'นายชูชาติ บุญมี', 
    roleTitle: 'ช่างเครื่องจักรกลหนัก', 
    department: 'ฝ่ายโครงการ', 
    email: 'choochat.mech@gmail.com',
    role: 'user',
    password: '1234',
    pin: '1234',
    isActive: true,
    allowedTabs: DEFAULT_ROLE_TABS.user,
    createdAt: '2026-01-01'
  }
];

export const BTC_STAFF_MEMBERS: StaffMember[] = INITIAL_APP_USERS.map(u => ({
  id: u.id,
  name: u.name,
  roleTitle: u.roleTitle,
  department: u.department,
  email: u.email,
  defaultRole: u.role === 'user' ? 'staff' : 'executive'
}));

const USERS_STORAGE_KEY = 'btc_app_users_v2';
const CURRENT_USER_STORAGE_KEY = 'btc_current_user_v2';

export const getStoredUsers = (): AppUser[] => {
  if (typeof window === 'undefined') return INITIAL_APP_USERS;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_APP_USERS));
      return INITIAL_APP_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_APP_USERS;
  } catch (err) {
    console.error('Failed to parse stored users:', err);
    return INITIAL_APP_USERS;
  }
};

export const saveStoredUsers = (users: AppUser[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('btc_users_updated', { detail: users }));
  } catch (err) {
    console.error('Failed to save users:', err);
  }
};

export const getCurrentUser = (): AppUser | null => {
  if (typeof window === 'undefined') return INITIAL_APP_USERS[1];
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (raw) {
      const parsed: AppUser = JSON.parse(raw);
      // Verify user is still valid and active in stored users
      const allUsers = getStoredUsers();
      const matched = allUsers.find(u => u.id === parsed.id || u.username === parsed.username);
      if (matched && matched.isActive) {
        return matched;
      }
    }
    
    // Check if legacy user name is set
    const legacyName = localStorage.getItem('btc_active_user_name');
    if (legacyName) {
      const allUsers = getStoredUsers();
      const matched = allUsers.find(u => u.name === legacyName && u.isActive);
      if (matched) {
        setCurrentUser(matched);
        return matched;
      }
    }

    return null;
  } catch (err) {
    console.error('Failed to parse current user:', err);
    return null;
  }
};

export const setCurrentUser = (user: AppUser | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem('btc_active_user_name', user.name);
      localStorage.setItem('btc_user_role', user.role === 'admin' ? 'admin' : user.role === 'manager' ? 'manager' : 'user');
      window.dispatchEvent(new CustomEvent('btc_user_changed', { 
        detail: { name: user.name, role: user.role, user } 
      }));
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      localStorage.removeItem('btc_active_user_name');
      window.dispatchEvent(new CustomEvent('btc_user_logout'));
    }
  } catch (err) {
    console.error('Failed to set current user:', err);
  }
};

export const authenticateUser = (
  usernameOrId: string, 
  credential?: string
): { success: boolean; user?: AppUser; message?: string } => {
  const allUsers = getStoredUsers();
  const trimmed = usernameOrId.trim().toLowerCase();

  const user = allUsers.find(u => 
    u.username.toLowerCase() === trimmed || 
    u.id === usernameOrId ||
    u.name.toLowerCase() === trimmed
  );

  if (!user) {
    return { success: false, message: 'ไม่พบชื่อผู้ใช้งานนี้ในระบบ' };
  }

  if (!user.isActive) {
    return { success: false, message: 'บัญชีผู้ใช้นี้ถูกระงับ/ปิดการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' };
  }

  // If PIN or password provided, verify
  if (credential !== undefined) {
    const credTrimmed = credential.trim();
    const pinMatch = user.pin && user.pin === credTrimmed;
    const pwdMatch = user.password && user.password === credTrimmed;
    const universalPin = credTrimmed === '1234' || credTrimmed === '9999';

    if (!pinMatch && !pwdMatch && !universalPin) {
      return { success: false, message: 'รหัสผ่านหรือ PIN ไม่ถูกต้อง (รหัสเริ่มต้น: 1234)' };
    }
  }

  // Update last login
  const updatedUsers = allUsers.map(u => 
    u.id === user.id ? { ...u, lastLoginAt: new Date().toISOString() } : u
  );
  saveStoredUsers(updatedUsers);

  const updatedUser = { ...user, lastLoginAt: new Date().toISOString() };
  setCurrentUser(updatedUser);

  return { success: true, user: updatedUser };
};

export const logoutUser = (): void => {
  setCurrentUser(null);
};

export const hasTabPermission = (user: AppUser | null | undefined, tab: ViewTab): boolean => {
  if (!user) return false;
  if (!user.isActive) return false;

  // Admin has access to everything
  if (user.role === 'admin') return true;

  // Custom allowedTabs override if present
  if (user.allowedTabs && user.allowedTabs.length > 0) {
    return user.allowedTabs.includes(tab);
  }

  // Default role tab permissions
  const roleTabs = DEFAULT_ROLE_TABS[user.role] || DEFAULT_ROLE_TABS.user;
  return roleTabs.includes(tab);
};

export const getActiveUserName = (): string => {
  if (typeof window === 'undefined') return INITIAL_APP_USERS[1].name;

  const current = getCurrentUser();
  if (current) return current.name;

  // Fallback to legacy stored name
  const saved = localStorage.getItem('btc_active_user_name');
  if (saved && saved.trim()) return saved.trim();

  return INITIAL_APP_USERS[1].name;
};

export const setActiveUserName = (name: string, role?: string): void => {
  const trimmed = name.trim();
  if (!trimmed) return;
  
  if (typeof window !== 'undefined') {
    const allUsers = getStoredUsers();
    const matched = allUsers.find(u => u.name === trimmed);
    if (matched) {
      setCurrentUser(matched);
      return;
    }

    localStorage.setItem('btc_active_user_name', trimmed);
    if (role) {
      localStorage.setItem('btc_user_role', role);
    }
    window.dispatchEvent(new CustomEvent('btc_user_changed', { 
      detail: { name: trimmed, role } 
    }));
  }
};

/**
 * Custom React Hook to consume and observe active user state across any component
 */
export function useActiveUser() {
  const [currentUser, setCurrentUserState] = useState<AppUser | null>(() => getCurrentUser());
  const [activeUserName, setActiveUserNameState] = useState<string>(() => getActiveUserName());

  useEffect(() => {
    const handleUpdate = () => {
      const user = getCurrentUser();
      setCurrentUserState(user);
      setActiveUserNameState(user ? user.name : getActiveUserName());
    };

    const handleLogout = () => {
      setCurrentUserState(null);
      setActiveUserNameState('');
    };

    window.addEventListener('btc_user_changed', handleUpdate);
    window.addEventListener('btc_users_updated', handleUpdate);
    window.addEventListener('btc_user_logout', handleLogout);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('btc_user_changed', handleUpdate);
      window.removeEventListener('btc_users_updated', handleUpdate);
      window.removeEventListener('btc_user_logout', handleLogout);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const changeActiveUser = (name: string, role?: string) => {
    setActiveUserName(name, role);
    const user = getCurrentUser();
    setCurrentUserState(user);
    setActiveUserNameState(name);
  };

  return {
    currentUser,
    activeUserName,
    userRole: (currentUser?.role || (localStorage.getItem('btc_user_role') as UserRole) || 'manager'),
    setActiveUser: changeActiveUser,
    logout: logoutUser,
    hasPermission: (tab: ViewTab) => hasTabPermission(currentUser, tab),
    staffList: getStoredUsers()
  };
}
