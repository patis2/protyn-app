import { CONTENT_VERSION } from '../content/dishes';
import { weekDays } from './dates';
import { dishFor, swapOptions, type DayMeals } from './nutrition';
import { filterSafe } from './safety';
import type { CheckIn, Dish, Profile, SessionLog, Slot } from './types';
import { SLOTS } from './types';
import { buildSession, sessionForDate, type Mode, type SessionPlan } from './workouts';

// Screens ask a RecommendationProvider for plans instead of calling the rules
// directly. Version one uses RulesProvider over the starter library. A reviewed
// content service, or an external recommender, can replace it later by
// implementing the same interface. Whatever the provider returns still passes
// through `withSafety`, so allergy and diet filters can't be skipped.

export interface RecommendationProvider {
  readonly id: string;
  readonly contentVersion: string;
  mealsForDay(p: Profile, swaps: Record<string, string>, date: Date): DayMeals;
  mealOptions(p: Profile, current: Dish | null, slot: Slot): Dish[];
  workoutWeek(p: Profile, weekStart: Date): { date: Date; session: ReturnType<typeof sessionForDate> }[];
  session(p: Profile, date: Date, mode: Mode, logs: SessionLog[], checkIn?: CheckIn, easier?: boolean): SessionPlan | null;
}

export const RulesProvider: RecommendationProvider = {
  id: 'rules-v1',
  contentVersion: CONTENT_VERSION,
  mealsForDay(p, swaps, date) {
    const out = {} as DayMeals;
    for (const slot of SLOTS) out[slot] = dishFor(p, swaps, date, slot);
    return out;
  },
  mealOptions: swapOptions,
  workoutWeek(p, start) {
    return weekDays(start).map((date) => ({ date, session: sessionForDate(p, date) }));
  },
  session(p, date, mode, logs, checkIn, easier) {
    const t = sessionForDate(p, date);
    return t ? buildSession(p, t, mode, logs, checkIn, easier) : null;
  },
};

export function withSafety(inner: RecommendationProvider): RecommendationProvider {
  return {
    ...inner,
    id: `${inner.id}+safety`,
    mealsForDay(p, swaps, date) {
      const meals = inner.mealsForDay(p, swaps, date);
      const safe = filterSafe(p, SLOTS.map((s) => meals[s]));
      const out = {} as DayMeals;
      SLOTS.forEach((s, i) => (out[s] = safe[i]));
      return out;
    },
    mealOptions(p, current, slot) {
      return filterSafe(p, inner.mealOptions(p, current, slot)).filter((d): d is Dish => !!d);
    },
  };
}

export const provider = withSafety(RulesProvider);
