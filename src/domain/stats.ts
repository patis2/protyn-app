import { HABIT_BY_ID } from '../content/library';
import { addDays, daysBetween, keyOf, parseKey, weekDays, weekStart } from './dates';
import { dishFor, proteinRange } from './nutrition';
import type { AppState, HabitDef, Level } from './types';
import { SLOTS } from './types';
import { sessionForDate, sessionOn } from './workouts';

export const myHabits = (s: AppState): HabitDef[] => s.profile.habits.map((id) => HABIT_BY_ID[id]).filter(Boolean);

export function habitDone(s: AppState, date: Date, h: HabitDef): boolean {
  const v = s.logs.habits[keyOf(date)]?.[h.id];
  return h.type === 'count' ? Number(v || 0) >= (h.goal ?? 1) : !!v;
}

export function proteinOn(s: AppState, date: Date): number {
  const k = keyOf(date);
  const eaten = s.logs.eaten[k] ?? {};
  let g = 0;
  for (const slot of SLOTS) if (eaten[slot]) g += dishFor(s.profile, s.logs.swaps, date, slot)?.protein ?? 0;
  for (const x of s.logs.extras[k] ?? []) g += x.protein;
  return g;
}

export const plannedProtein = (s: AppState, date: Date) =>
  SLOTS.reduce((a, slot) => a + (dishFor(s.profile, s.logs.swaps, date, slot)?.protein ?? 0), 0);

export type WeekStats = {
  label: string;
  start: Date;
  sessions: number;
  planned: number;
  proteinDays: number;
  days: number;
  habitPct: number;
  energy: number | null; // 1 low … 3 good
};

const LEVEL: Record<Level, number> = { low: 1, ok: 2, good: 3 };

/** Stats for one week, counting only days up to `until`. */
export function weekStats(s: AppState, start: Date, until: Date): WeekStats {
  const [lo] = proteinRange(s.profile);
  let sessions = 0, planned = 0, proteinDays = 0, days = 0, hd = 0, ht = 0;
  const energy: number[] = [];
  const habits = myHabits(s);
  const began = s.profile.startedAt ? parseKey(s.profile.startedAt) : start;
  for (const d of weekDays(start)) {
    if (daysBetween(d, until) < 0) break;
    if (daysBetween(began, d) < 0) continue; // days before the user started don't count against them
    days++;
    if (sessionForDate(s.profile, d)) planned++;
    if (sessionOn(s.logs.sessions, d)) sessions++;
    if (proteinOn(s, d) >= lo) proteinDays++;
    for (const h of habits) {
      ht++;
      if (habitDone(s, d, h)) hd++;
    }
    const c = s.logs.checkins[keyOf(d)];
    if (c?.energy) energy.push(LEVEL[c.energy]);
  }
  return {
    label: '',
    start,
    sessions,
    planned,
    proteinDays,
    days,
    habitPct: ht ? Math.round((hd / ht) * 100) : 0,
    energy: energy.length ? energy.reduce((a, b) => a + b, 0) / energy.length : null,
  };
}

/** Week number since the user started, starting at 1. */
export function weekNumber(s: AppState, today: Date): number {
  const started = s.profile.startedAt ? weekStart(parseKey(s.profile.startedAt)) : weekStart(today);
  return Math.max(1, Math.floor(daysBetween(started, weekStart(today)) / 7) + 1);
}

/** Up to `count` recent weeks, oldest first, never before the user started. */
export function history(s: AppState, today: Date, count = 6): WeekStats[] {
  const n = Math.min(count, weekNumber(s, today));
  const thisWeek = weekStart(today);
  const out: WeekStats[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const start = addDays(thisWeek, -7 * i);
    const end = i === 0 ? today : addDays(start, 6);
    const w = weekStats(s, start, end);
    w.label = `W${weekNumber(s, today) - i}`;
    out.push(w);
  }
  return out;
}

export function weekMessage(w: WeekStats): string {
  if (w.planned > 0 && w.sessions === 0)
    return 'No sessions yet this week, and that’s fine. One 20-minute session still moves you forward.';
  if (w.sessions >= Math.min(2, w.planned) && w.proteinDays >= Math.ceil(w.days / 2))
    return 'A steady week. Your plan will add a little challenge where it felt easy.';
  return 'You’re building the habit. Keep it simple: one session and one protein win at a time.';
}
