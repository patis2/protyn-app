import { addDays, daysBetween, parseKey } from './dates';
import { habitDone, history, myHabits, weekNumber } from './stats';
import type { AppState } from './types';

// Milestone rewards. Each one celebrates effort the person put in. None of
// them mention weight, body measurements or health answers, so a shared card
// never reveals health data.

export type Reward = {
  id: string;
  title: string;
  /** One line for the card, written to be shared. */
  line: string;
  /** The big figure on the badge, e.g. "10". */
  figure: string;
  icon: 'dumbbell' | 'plate' | 'habits' | 'trophy';
  earned: boolean;
  /** How close the person is, from 0 to 1, for rewards not yet earned. */
  progress: number;
  hint: string;
};

type Def = Omit<Reward, 'earned' | 'progress'> & { goal: number; count: (s: AppState, today: Date) => number };

const sessions = (s: AppState) => s.logs.sessions.length;

function habitsKept(s: AppState, today: Date): number {
  const habits = myHabits(s);
  let n = 0;
  for (const k of Object.keys(s.logs.habits)) {
    const d = parseKey(k);
    if (daysBetween(d, today) < 0) continue;
    for (const h of habits) if (habitDone(s, d, h)) n++;
  }
  return n;
}

const bestProteinWeek = (s: AppState, today: Date) => Math.max(0, ...history(s, today, 52).map((w) => w.proteinDays));

function checkIns(s: AppState, today: Date): number {
  return Object.keys(s.logs.checkins).filter((k) => daysBetween(parseKey(k), addDays(today, 1)) > 0).length;
}

const DEFS: Def[] = [
  { id: 'first-session', title: 'First workout', line: 'finished their first Protyn workout', figure: '1', icon: 'dumbbell', goal: 1, count: sessions, hint: 'Finish one workout.' },
  { id: 'sessions-5', title: '5 workouts', line: 'has finished 5 workouts', figure: '5', icon: 'dumbbell', goal: 5, count: sessions, hint: 'Finish 5 workouts.' },
  { id: 'sessions-10', title: '10 workouts', line: 'has finished 10 workouts', figure: '10', icon: 'dumbbell', goal: 10, count: sessions, hint: 'Finish 10 workouts.' },
  { id: 'sessions-25', title: '25 workouts', line: 'has finished 25 workouts', figure: '25', icon: 'dumbbell', goal: 25, count: sessions, hint: 'Finish 25 workouts.' },
  { id: 'sessions-50', title: '50 workouts', line: 'has finished 50 workouts', figure: '50', icon: 'trophy', goal: 50, count: sessions, hint: 'Finish 50 workouts.' },
  { id: 'protein-week', title: 'Protein week', line: 'ate well for protein on 5 days in one week', figure: '5', icon: 'plate', goal: 5, count: bestProteinWeek, hint: 'Reach your protein range on 5 days in one week.' },
  { id: 'habits-50', title: '50 habits kept', line: 'has kept 50 healthy habits', figure: '50', icon: 'habits', goal: 50, count: habitsKept, hint: 'Tick off 50 habits.' },
  { id: 'habits-150', title: '150 habits kept', line: 'has kept 150 healthy habits', figure: '150', icon: 'habits', goal: 150, count: habitsKept, hint: 'Tick off 150 habits.' },
  { id: 'checkins-14', title: '14 check-ins', line: 'checked in with Protyn on 14 days', figure: '14', icon: 'trophy', goal: 14, count: checkIns, hint: 'Do the daily check-in on 14 days.' },
  { id: 'weeks-4', title: 'One month strong', line: 'has stuck with Protyn for 4 weeks', figure: '4', icon: 'trophy', goal: 4, count: (s, t) => (sessions(s) > 0 ? weekNumber(s, t) : 0), hint: 'Keep going for 4 weeks with at least one workout.' },
];

export function rewards(s: AppState, today: Date): Reward[] {
  return DEFS.map(({ goal, count, ...r }) => {
    const n = count(s, today);
    return { ...r, earned: n >= goal, progress: Math.min(1, n / goal) };
  });
}

export const rewardById = (s: AppState, today: Date, id: string) => rewards(s, today).find((r) => r.id === id) ?? null;

/** Earned rewards the person hasn't been shown yet. */
export const newRewards = (s: AppState, today: Date) => rewards(s, today).filter((r) => r.earned && !s.settings.seenRewards.includes(r.id));

export const SHARE_URL = 'https://protyn.netlify.app';

export function shareText(name: string, r: Reward): string {
  const who = name.trim() || 'I';
  return `${who} ${who === 'I' ? r.line.replace(/their/g, 'my').replace(/^has /, 'have ') : r.line} on Protyn. Plan it. Plate it. Pump it. ${SHARE_URL}`;
}
