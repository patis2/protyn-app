import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { AppState } from '../domain/types';
import { withDefaults } from './defaults';

// Where the app keeps its data. Screens never talk to storage directly; they go
// through the store in store.tsx, which uses a DataStore. LocalStore keeps
// everything on the device. On phones, health answers live in the OS keychain
// or keystore (expo-secure-store), apart from the rest of the data.

export interface DataStore {
  load(): Promise<AppState | null>;
  save(state: AppState): Promise<void>;
  clear(): Promise<void>;
}

const KEY = 'protyn:v1:state';
const SENSITIVE_KEY = 'protyn_v1_sensitive';
const secureAvailable = Platform.OS === 'ios' || Platform.OS === 'android';

type Sensitive = Pick<AppState['profile'], 'health' | 'healthNote' | 'otherAllergy'>;

function split(state: AppState): [AppState, Sensitive] {
  const { health, healthNote, otherAllergy } = state.profile;
  const rest = { ...state, profile: { ...state.profile, health: [], healthNote: '', otherAllergy: '' } };
  return [rest, { health, healthNote, otherAllergy }];
}

export class StorageError extends Error {}

export const LocalStore: DataStore = {
  async load() {
    let raw: string | null;
    try {
      raw = await AsyncStorage.getItem(KEY);
    } catch {
      throw new StorageError('We couldn’t read your saved data on this device.');
    }
    if (!raw) return null;
    let parsed: Partial<AppState>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new StorageError('Your saved data looks damaged.');
    }
    if (!parsed || parsed.version !== 1 || typeof parsed.profile !== 'object') throw new StorageError('Your saved data is from an unknown version.');
    const state = withDefaults(parsed);
    if (secureAvailable) {
      try {
        const s = await SecureStore.getItemAsync(SENSITIVE_KEY);
        if (s) Object.assign(state.profile, JSON.parse(s) as Sensitive);
      } catch {
        // Health answers are optional; carry on without them rather than block the app.
      }
    }
    return state;
  },
  async save(state) {
    if (secureAvailable) {
      const [rest, sensitive] = split(state);
      await AsyncStorage.setItem(KEY, JSON.stringify(rest));
      await SecureStore.setItemAsync(SENSITIVE_KEY, JSON.stringify(sensitive));
    } else {
      await AsyncStorage.setItem(KEY, JSON.stringify(state));
    }
  },
  async clear() {
    await AsyncStorage.removeItem(KEY);
    if (secureAvailable) await SecureStore.deleteItemAsync(SENSITIVE_KEY).catch(() => undefined);
  },
};

/** What gets synced to the server: everything except health answers, which stay on the device. */
export const cloudSnapshot = (state: AppState) => split(state)[0];
