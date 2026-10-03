import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'btc_supabase_custom_credentials';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  source: 'custom' | 'env' | 'none';
}

export function getActiveSupabaseConfig(): SupabaseConfig {
  // 1. Check custom saved credentials in user settings
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey && typeof parsed.url === 'string' && parsed.url.startsWith('http')) {
        return {
          url: parsed.url.trim(),
          anonKey: parsed.anonKey.trim(),
          source: 'custom'
        };
      }
    }
  } catch (e) {
    console.error('Failed to read custom supabase credentials', e);
  }

  // 2. Check environment variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

  if (envUrl && envKey && envUrl.startsWith('http')) {
    return {
      url: envUrl,
      anonKey: envKey,
      source: 'env'
    };
  }

  return {
    url: '',
    anonKey: '',
    source: 'none'
  };
}

let clientInstance: SupabaseClient | null = null;
let currentConfig = getActiveSupabaseConfig();

export function getIsSupabaseConfigured(): boolean {
  const cfg = getActiveSupabaseConfig();
  return Boolean(
    cfg.url &&
    cfg.anonKey &&
    cfg.url.startsWith('http')
  );
}

export let isSupabaseConfigured = getIsSupabaseConfigured();

export function getSupabase(): SupabaseClient | null {
  const cfg = getActiveSupabaseConfig();
  if (!cfg.url || !cfg.anonKey || !cfg.url.startsWith('http')) {
    return null;
  }

  // Check if credentials changed
  if (!clientInstance || currentConfig.url !== cfg.url || currentConfig.anonKey !== cfg.anonKey) {
    currentConfig = cfg;
    isSupabaseConfigured = getIsSupabaseConfigured();
    clientInstance = createClient(cfg.url, cfg.anonKey, {
      auth: {
        persistSession: false
      }
    });
  }

  return clientInstance;
}

export function saveCustomSupabaseConfig(url: string, anonKey: string): boolean {
  try {
    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();
    if (!cleanUrl || !cleanKey) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      url: cleanUrl,
      anonKey: cleanKey,
      updatedAt: new Date().toISOString()
    }));

    currentConfig = getActiveSupabaseConfig();
    isSupabaseConfigured = true;
    clientInstance = createClient(cleanUrl, cleanKey, {
      auth: {
        persistSession: false
      }
    });
    return true;
  } catch (e) {
    console.error('Failed to save supabase config', e);
    return false;
  }
}

export function clearCustomSupabaseConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    currentConfig = getActiveSupabaseConfig();
    isSupabaseConfigured = getIsSupabaseConfigured();
    clientInstance = null;
  } catch (e) {
    console.error('Failed to clear supabase config', e);
  }
}

export const supabase = getSupabase();

