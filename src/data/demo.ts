import { addDays, dayIndex, keyOf, weekStart } from '../domain/dates';
import type { AppState, Level, SessionLog } from '../domain/types';
import { sessionForDate } from '../domain/workouts';
import { blankState } from './defaults';

// Sample data for demo mode: Priya, 29, Bengaluru, vegetarian, South Indian
// home food, dumbbells at home, three weeks in. Nothing here is a real person.

export function demoState(today = new Date()): AppState {
  const s = blankState();
  const start = addDays(weekStart(today), -14);
  s.mode = 'demo';
  s.adult = true;
  s.consentAt = today.toISOString();
  s.onboarded = true;
  s.profile = {
    ...s.profile,
    name: 'Priya',
    birthYear: String(today.getFullYear() - 29),
    heightCm: '160',
    weightKg: '62',
    waistCm: '78',
    goal: 'strength',
    why: 'Keep up with my nephews and feel strong at work',
    activity: 'light',
    experience: 'beginner',
    minutes: '20',
    workoutDays: [1, 3, 5],
    diet: 'veg',
    cuisine: 'S',
    allergies: [],
    allergiesConfirmed: true,
    place: 'home',
    equipment: ['dumbbells', 'mat'],
    sleep: '6to7',
    water: 'mid',
    habits: ['water', 'sleep', 'walk', 'pbreak', 'screens'],
    startedAt: keyOf(start),
  };
  s.settings.showMeasurements = true;

  // A believable, imperfect three weeks: most things done, some days missed.
  const sessions: SessionLog[] = [];
  for (let d = new Date(start); keyOf(d) < keyOf(today); d = addDays(d, 1)) {
    const k = keyOf(d);
    const i = Math.round((d.getTime() - start.getTime()) / 86400000);
    const off = i % 6 === 4;
    s.logs.eaten[k] = { b: true, l: !off, s: i % 3 !== 0, d: !off };
    s.logs.habits[k] = { water: 4 + (i % 5), sleep: i % 4 !== 1, walk: i % 2 === 0, pbreak: i % 5 !== 2, screens: i % 3 === 0 };
    const energy: Level = off ? 'low' : i % 4 === 0 ? 'good' : 'ok';
    s.logs.checkins[k] = { energy, mood: i % 5 === 1 ? 'ok' : 'good', diff: 'right' };
    const t = sessionForDate(s.profile, d);
    if (t && !(i === 10)) sessions.push({ date: k, sessionId: t.id, feel: i < 7 ? 'right' : i % 2 ? 'easy' : 'right', easier: [], setsDone: 12, painReported: false });
    if (dayIndex(d) === 0) s.logs.measurements.push({ date: k, kind: 'weight', value: 62.6 - i * 0.03 }, { date: k, kind: 'waist', value: 78 - i * 0.05 });
  }
  s.logs.sessions = sessions;
  s.logs.notes[keyOf(addDays(today, -3))] = 'Slept badly, skipped the walk. Office dinner tonight.';
  s.logs.notes[keyOf(addDays(today, -9))] = 'Session B felt good. Goblet squats are getting easier.';
  const tk = keyOf(today);
  s.logs.eaten[tk] = { b: true, l: today.getHours() >= 14 };
  s.logs.habits[tk] = { water: 3, pbreak: true };
  s.logs.measurements = s.logs.measurements.map((m) => ({ ...m, value: Math.round(m.value * 10) / 10 }));
  return s;
}
