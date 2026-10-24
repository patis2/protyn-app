import { keyOf } from '../domain/dates';
import type { AppState, Profile } from '../domain/types';

export const blankProfile = (): Profile => ({
  name: '',
  birthYear: '',
  heightCm: '',
  weightKg: '',
  waistCm: '',
  goal: '',
  why: '',
  activity: '',
  experience: '',
  minutes: '20',
  workoutDays: [1, 3, 5],
  diet: '',
  cuisine: '',
  allergies: [],
  allergiesConfirmed: false,
  otherAllergy: '',
  avoidFoods: [],
  unavailable: [],
  place: '',
  equipment: [],
  sleep: '',
  water: '',
  habits: ['water', 'sleep', 'walk'],
  health: [],
  healthNote: '',
  startedAt: keyOf(new Date()),
});

export const blankState = (): AppState => ({
  version: 1,
  mode: 'none',
  adult: false,
  consentAt: null,
  onboarded: false,
  profile: blankProfile(),
  logs: { eaten: {}, extras: {}, swaps: {}, habits: {}, checkins: {}, sessions: [], notes: {}, measurements: [], shopTicks: {}, saved: [] },
  settings: {
    reminders: { workout: true, meals: false, habits: true, summary: true, time: '07:00' },
    consents: { plan: true, health: true, analytics: false, reminders: true },
    showMeasurements: false,
    tracked: ['weight', 'waist'],
    moveMode: 'home',
  },
});

/** Fills in anything missing from older saved data, so new fields never crash the app. */
export function withDefaults(raw: Partial<AppState>): AppState {
  const b = blankState();
  return {
    ...b,
    ...raw,
    version: 1,
    profile: { ...b.profile, ...(raw.profile ?? {}) },
    logs: { ...b.logs, ...(raw.logs ?? {}) },
    settings: {
      ...b.settings,
      ...(raw.settings ?? {}),
      reminders: { ...b.settings.reminders, ...(raw.settings?.reminders ?? {}) },
      consents: { ...b.settings.consents, ...(raw.settings?.consents ?? {}), plan: true },
    },
  };
}
