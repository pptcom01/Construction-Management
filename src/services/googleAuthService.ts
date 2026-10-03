import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance safely (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider with requested OAuth scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.setCustomParameters({
  prompt: 'select_account'
});

// Flag to track ongoing sign-in flow
let isSigningIn = false;

export interface GoogleAuthUser {
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  uid?: string | null;
}

// In-memory access token & user cache (MANDATORY: Not stored in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let cachedUser: GoogleAuthUser | User | null = null;

const authListeners: Array<(user: any, token: string | null) => void> = [];

const notifyListeners = (user: any, token: string | null) => {
  authListeners.forEach(fn => {
    try {
      fn(user, token);
    } catch (e) {
      console.error(e);
    }
  });
};

export const loadGsiScript = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.getElementById('google-gsi-client');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
};

export const signInWithGsi = async (): Promise<{ user: GoogleAuthUser; accessToken: string }> => {
  await loadGsiScript();
  const google = typeof window !== 'undefined' ? (window as any).google : null;
  if (!google?.accounts?.oauth2) {
    throw new Error('ไม่สามารถโหลดระบบ Google Identity Services (GSI) ได้');
  }

  const clientId = localStorage.getItem('btc_google_client_id') || firebaseConfig.oAuthClientId;
  if (!clientId) {
    throw new Error('ไม่พบ Google OAuth Client ID สำหรับยืนยันตัวตน');
  }

  return new Promise((resolve, reject) => {
    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        prompt: 'select_account',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.error('[GSI Auth] Token response error:', tokenResponse);
            const errDetail = tokenResponse.error_description || tokenResponse.error;
            reject(new Error(`การยืนยันตัวตน Google ไม่สำเร็จ (${errDetail})`));
            return;
          }

          const accessToken = tokenResponse.access_token;
          if (!accessToken) {
            reject(new Error('ไม่พบ Access Token จาก Google'));
            return;
          }

          cachedAccessToken = accessToken;

          // Fetch user details from Google userinfo API
          let userObj: GoogleAuthUser = { email: 'ผู้ใช้งาน Google Workspace', displayName: 'Google Account' };
          try {
            const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (userRes.ok) {
              const uData = await userRes.json();
              userObj = {
                email: uData.email,
                displayName: uData.name || uData.email,
                photoURL: uData.picture,
                uid: uData.sub
              };
            }
          } catch (e) {
            console.warn('[Google Auth] Cannot fetch user profile info:', e);
          }

          cachedUser = userObj;
          notifyListeners(userObj, accessToken);
          resolve({ user: userObj, accessToken });
        }
      });

      client.requestAccessToken();
    } catch (err: any) {
      console.error('[GSI Auth] Request error:', err);
      reject(err);
    }
  });
};

export const setManualAccessToken = async (token: string, email?: string): Promise<{ user: GoogleAuthUser; accessToken: string }> => {
  const cleanToken = token.trim();
  if (!cleanToken) {
    throw new Error('โปรดระบุ Access Token');
  }

  cachedAccessToken = cleanToken;
  let userObj: GoogleAuthUser = { email: email || 'ผู้ใช้งาน (Manual Token)', displayName: email || 'Google Account' };

  try {
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${cleanToken}` }
    });
    if (userRes.ok) {
      const uData = await userRes.json();
      userObj = {
        email: uData.email,
        displayName: uData.name || uData.email,
        photoURL: uData.picture,
        uid: uData.sub
      };
    }
  } catch (e) {
    console.warn('[Google Auth] Cannot fetch user profile info for manual token:', e);
  }

  cachedUser = userObj;
  notifyListeners(userObj, cleanToken);
  return { user: userObj, accessToken: cleanToken };
};

export const getCurrentGoogleUser = (): GoogleAuthUser | User | null => {
  return cachedUser || auth.currentUser;
};

export const initAuth = (
  onAuthSuccess?: (user: any, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (onAuthSuccess || onAuthFailure) {
    authListeners.push((u, t) => {
      if (u && t) {
        if (onAuthSuccess) onAuthSuccess(u, t);
      } else {
        if (onAuthFailure) onAuthFailure();
      }
    });
  }

  // If already authenticated in memory
  if (cachedAccessToken && cachedUser) {
    if (onAuthSuccess) onAuthSuccess(cachedUser, cachedAccessToken);
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        cachedUser = user;
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn && !cachedAccessToken) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else if (!cachedAccessToken) {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: any; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    // 1. Try Google Identity Services (GSI) first
    try {
      const gsiResult = await signInWithGsi();
      return gsiResult;
    } catch (gsiErr: any) {
      console.warn('[Google Auth] GSI attempt failed, checking fallback...', gsiErr);

      // 2. Try Firebase Auth popup as fallback
      try {
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          cachedAccessToken = credential.accessToken;
          cachedUser = result.user;
          notifyListeners(result.user, cachedAccessToken);
          return { user: result.user, accessToken: cachedAccessToken };
        }
      } catch (fbErr: any) {
        console.error('[Google Auth] Firebase fallback also failed:', fbErr);
        if (fbErr?.message?.includes('suspended') || fbErr?.message?.includes('permission-denied')) {
          throw new Error('API Key ถูกจำกัดสิทธิ์ใน Firebase Auth โปรดใช้การเข้าสู่ระบบผ่าน Google หรือระบุ Access Token สำหรับเชื่อมต่อ');
        }
      }

      // If GSI had an error, rethrow that error
      throw gsiErr;
    }
  } catch (error: any) {
    console.error('[Google Auth] Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    // Ignore signOut errors
  }
  cachedAccessToken = null;
  cachedUser = null;
  notifyListeners(null, null);
};
