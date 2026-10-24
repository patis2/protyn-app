import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { AppState } from '../domain/types';
import { blankState } from './defaults';
import { demoState } from './demo';
import { LocalStore, StorageError } from './storage';
import { cloudEnabled, deleteCloudData, pullState, pushState } from './supabase';

type Status = 'loading' | 'ready' | 'error';

type Store = {
  status: Status;
  error: string | null;
  state: AppState;
  /** Apply a change. The draft is a copy, so mutate it freely. */
  update: (fn: (draft: AppState) => void) => void;
  startDemo: () => void;
  startLocal: () => void;
  adoptCloud: () => Promise<void>;
  deleteEverything: () => Promise<void>;
  /** Forget this device's copy without touching the account. */
  clearLocal: () => Promise<void>;
  retry: () => void;
  resetDamaged: () => Promise<void>;
};

const Ctx = createContext<Store | null>(null);

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<AppState>(blankState);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(state);
  latest.current = state;

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const saved = await LocalStore.load();
      setState(saved ?? blankState());
      setStatus('ready');
    } catch (e) {
      setError(e instanceof StorageError ? e.message : 'Something went wrong while opening the app.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback((next: AppState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      LocalStore.save(next).catch(() => setError('We couldn’t save your last change on this device.'));
      if (next.mode === 'cloud') pushState(next).catch(() => undefined);
    }, 250);
  }, []);

  const update = useCallback(
    (fn: (d: AppState) => void) => {
      setState((prev) => {
        const draft = clone(prev);
        fn(draft);
        persist(draft);
        return draft;
      });
    },
    [persist],
  );

  const replace = useCallback(
    (next: AppState) => {
      setState(next);
      persist(next);
    },
    [persist],
  );

  const store = useMemo<Store>(
    () => ({
      status,
      error,
      state,
      update,
      startDemo: () => replace(demoState()),
      startLocal: () => {
        const s = blankState();
        s.mode = 'local';
        s.adult = true;
        s.consentAt = new Date().toISOString();
        replace(s);
      },
      adoptCloud: async () => {
        const remote = cloudEnabled ? await pullState() : null;
        const cur = latest.current;
        if (remote) {
          // Health answers never leave the device, so keep the local ones.
          remote.profile.health = cur.profile.health;
          remote.profile.healthNote = cur.profile.healthNote;
          remote.profile.otherAllergy = cur.profile.otherAllergy;
          remote.mode = 'cloud';
          replace(remote);
        } else {
          const s = cur.mode === 'local' ? clone(cur) : blankState();
          s.mode = 'cloud';
          s.adult = true;
          s.consentAt = s.consentAt ?? new Date().toISOString();
          replace(s);
        }
      },
      deleteEverything: async () => {
        if (latest.current.mode === 'cloud') await deleteCloudData();
        await LocalStore.clear();
        setState(blankState());
      },
      clearLocal: async () => {
        await LocalStore.clear();
        setState(blankState());
      },
      retry: load,
      resetDamaged: async () => {
        await LocalStore.clear().catch(() => undefined);
        setState(blankState());
        setStatus('ready');
        setError(null);
      },
    }),
    [status, error, state, update, replace, load],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}

/** The date the app treats as "today". Recomputed on each render so it rolls over at midnight. */
export const useToday = () => new Date();
