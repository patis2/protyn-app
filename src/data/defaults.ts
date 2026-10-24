import { keyOf } from '../domain/dates';
import type { AppState, Profile } from '../domain/types';

export const blankProfile = (): Profile => ({
  name: '',
  birthYear: '',
  heightCm: '',
  weightKg: '',
  waistIn: '',
  goal: '',
  why: '',
  activity: '',
  experience: '',
  minutes: '20',
  workoutDays: [1, 3, 5],
  diet: '',
  state: '',
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
    inches: true,
    seenRewards: [],
  },
});

/** Fills in anything missing from older saved data, so new fields never crash the app. */
export function withDefaults(raw: Partial<AppState>): AppState {
  const b = blankState();
  const s = migrateToInches(raw);
  return {
    ...b,
    ...s,
    version: 1,
    profile: { ...b.profile, ...(s.profile ?? {}) },
    logs: { ...b.logs, ...(s.logs ?? {}) },
    settings: {
      ...b.settings,
      ...(s.settings ?? {}),
      inches: true,
      reminders: { ...b.settings.reminders, ...(s.settings?.reminders ?? {}) },
      consents: { ...b.settings.consents, ...(s.settings?.consents ?? {}), plan: true },
    },
  };
}

const CM_PER_INCH = 2.54;

/** Body measurements used to be saved in centimetres. Convert them once to inches. */
function migrateToInches(raw: Partial<AppState>): Partial<AppState> {
  if (raw.settings?.inches) return raw;
  const toIn = (cm: number) => Math.round((cm / CM_PER_INCH) * 10) / 10;
  const oldProfile = (raw.profile ?? {}) as Partial<AppState['profile']> & { waistCm?: string };
  const { waistCm, ...profile } = oldProfile;
  const cm = Number(waistCm);
  return {
    ...raw,
    profile: { ...profile, waistIn: profile.waistIn || (waistCm && Number.isFinite(cm) ? String(toIn(cm)) : '') } as AppState['profile'],
    logs: raw.logs
      ? { ...raw.logs, measurements: (raw.logs.measurements ?? []).map((m) => (m.kind === 'weight' ? m : { ...m, value: toIn(m.value) })) }
      : raw.logs,
  };
}
