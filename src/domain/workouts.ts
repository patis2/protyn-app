import { EXERCISES, SESSIONS } from '../content/library';
import { dayIndex, keyOf } from './dates';
import { isGentle } from './safety';
import type { CheckIn, Exercise, Profile, SessionLog, SessionTemplate } from './types';

export type Mode = 'home' | 'gym';

export function workoutMode(p: Profile, chosen: Mode): Mode {
  if (p.place === 'gym') return 'gym';
  if (p.place === 'both') return chosen;
  return 'home';
}

export function variantName(ex: Exercise, mode: Mode, p: Profile): string {
  if (mode === 'gym') return ex.gym;
  return p.equipment.includes('dumbbells') ? ex.dumbbell : ex.home;
}

/** Which session (if any) falls on a date, rotating A, B, C through the chosen days. */
export function sessionForDate(p: Profile, date: Date): SessionTemplate | null {
  const days = [...p.workoutDays].sort((a, b) => a - b);
  const pos = days.indexOf(dayIndex(date));
  if (pos < 0) return null;
  return SESSIONS[(['A', 'B', 'C'] as const)[pos % 3]];
}

export type Progression = 'easier' | 'standard' | 'harder';

/** Feedback shapes the next session: one "too hard" eases off, two "too easy" in a row adds a challenge. */
export function progression(logs: SessionLog[], todayCheckIn?: CheckIn): Progression {
  const recent = [...logs].sort((a, b) => a.date.localeCompare(b.date)).slice(-2);
  const last = recent[recent.length - 1];
  if (todayCheckIn?.diff === 'hard' || todayCheckIn?.energy === 'low') return 'easier';
  if (last?.feel === 'hard' || last?.painReported) return 'easier';
  if (recent.length === 2 && recent.every((l) => l.feel === 'easy')) return 'harder';
  return 'standard';
}

export type PlannedMove = { ex: Exercise; name: string; easier: boolean; sets: number };

export type SessionPlan = {
  template: SessionTemplate;
  moves: PlannedMove[];
  sets: number;
  progression: Progression;
  minutes: string;
};

export function buildSession(
  p: Profile,
  template: SessionTemplate,
  mode: Mode,
  logs: SessionLog[],
  checkIn?: CheckIn,
  forceEasier = false,
): SessionPlan {
  const gentle = isGentle(p);
  const prog = forceEasier ? 'easier' : progression(logs, checkIn);
  const count = p.minutes === '10' ? 3 : p.minutes === '30' ? 5 : 4;
  let ids = template.exercises.slice(0, count);
  if (p.goal === 'endurance') ids = [...ids.slice(0, Math.max(count - 1, 2)), 'march'];
  const sets = gentle || p.minutes === '10' || (p.experience === 'beginner' && prog === 'easier') ? 2 : 3;
  const moves = ids.map((id) => {
    const ex = EXERCISES[id];
    const easier = prog === 'easier' || (p.health.includes('injury') && ex.jointLoad) || p.health.includes('pregnant');
    return { ex, name: easier ? ex.easier : variantName(ex, mode, p), easier, sets };
  });
  return { template, moves, sets, progression: prog, minutes: p.minutes };
}

export const sessionOn = (logs: SessionLog[], date: Date) => logs.find((l) => l.date === keyOf(date));
