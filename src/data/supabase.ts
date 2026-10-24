import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { AppState } from '../domain/types';
import { withDefaults } from './defaults';
import { cloudSnapshot } from './storage';

// Optional cloud account. It turns on only when EXPO_PUBLIC_SUPABASE_URL and
// EXPO_PUBLIC_SUPABASE_ANON_KEY are set (see .env.example). Sign-in uses a
// one-time code sent by email; phone OTP needs an SMS provider with DLT
// registration in India and can be switched on in Supabase later.
// Row-level security in supabase/schema.sql makes sure each person can only
// read and write their own row.

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const cloudEnabled = !!(url && anonKey);

// Sign-in tokens go to the keychain or keystore on phones. Large values are
// split because secure storage limits each item to about 2 KB.
const secureStorage = {
  async getItem(key: string) {
    const count = await SecureStore.getItemAsync(`${key}_n`);
    if (!count) return null;
    const parts = await Promise.all(Array.from({ length: Number(count) }, (_, i) => SecureStore.getItemAsync(`${key}_${i}`)));
    return parts.join('');
  },
  async setItem(key: string, value: string) {
    const chunks = value.match(/.{1,1800}/gs) ?? [''];
    await Promise.all(chunks.map((c, i) => SecureStore.setItemAsync(`${key}_${i}`, c)));
    await SecureStore.setItemAsync(`${key}_n`, String(chunks.length));
  },
  async removeItem(key: string) {
    const count = Number((await SecureStore.getItemAsync(`${key}_n`)) ?? 0);
    await Promise.all(Array.from({ length: count }, (_, i) => SecureStore.deleteItemAsync(`${key}_${i}`)));
    await SecureStore.deleteItemAsync(`${key}_n`);
  },
};

const safeKey = (k: string) => k.replace(/[^A-Za-z0-9._-]/g, '_');

let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient | null {
  if (!cloudEnabled) return null;
  if (!client) {
    const native = Platform.OS === 'ios' || Platform.OS === 'android';
    client = createClient(url!, anonKey!, {
      auth: {
        storage: native
          ? { getItem: (k) => secureStorage.getItem(safeKey(k)), setItem: (k, v) => secureStorage.setItem(safeKey(k), v), removeItem: (k) => secureStorage.removeItem(safeKey(k)) }
          : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

export async function sendCode(email: string) {
  const sb = supabase();
  if (!sb) throw new Error('Cloud accounts are not set up yet.');
  const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) throw new Error(error.message);
}

export async function verifyCode(email: string, token: string) {
  const sb = supabase();
  if (!sb) throw new Error('Cloud accounts are not set up yet.');
  const { error } = await sb.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw new Error('That code didn’t work. Check it, or ask for a new one.');
}

export async function pullState(): Promise<AppState | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await sb.from('app_state').select('data').eq('user_id', auth.user.id).maybeSingle();
  if (error) throw new Error('We couldn’t load your account data. Check your connection and try again.');
  return data?.data ? withDefaults(data.data as AppState) : null;
}

export async function pushState(state: AppState) {
  const sb = supabase();
  if (!sb) return;
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return;
  await sb.from('app_state').upsert({ user_id: auth.user.id, data: cloudSnapshot(state), updated_at: new Date().toISOString() });
}

/** Deletes the account's server data (the row cascades when the auth user is removed by the delete function). */
export async function deleteCloudData() {
  const sb = supabase();
  if (!sb) return;
  const { data: auth } = await sb.auth.getUser();
  if (auth.user) {
    await sb.from('app_state').delete().eq('user_id', auth.user.id);
    await sb.functions.invoke('delete-account').catch(() => undefined);
  }
  await sb.auth.signOut();
}

export async function signOut() {
  await supabase()?.auth.signOut();
}
