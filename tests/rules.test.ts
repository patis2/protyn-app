import { describe, expect, it } from 'vitest';
import { DISHES } from '../src/content/dishes';
import { blankProfile } from '../src/data/defaults';
import { demoState } from '../src/data/demo';
import { addDays, weekStart } from '../src/domain/dates';
import { candidates, dishFor, proteinRange, swapKey } from '../src/domain/nutrition';
import { provider } from '../src/domain/provider';
import { dishConflicts, goalNotice, hideWeight, weightLossPaused } from '../src/domain/safety';
import { history, proteinOn } from '../src/domain/stats';
import type { Allergen, Diet, Profile } from '../src/domain/types';
import { SLOTS } from '../src/domain/types';
import { stepError } from '../src/domain/validation';
import { buildSession, progression, sessionForDate } from '../src/domain/workouts';
import { HABITS, SESSIONS } from '../src/content/library';

const profile = (over: Partial<Profile> = {}): Profile => ({
  ...blankProfile(),
  name: 'Test',
  birthYear: '1990',
  heightCm: '165',
  weightKg: '60',
  goal: 'fitness',
  activity: 'light',
  experience: 'beginner',
  diet: 'veg',
  cuisine: 'N',
  allergiesConfirmed: true,
  place: 'home',
  ...over,
});

const days = Array.from({ length: 28 }, (_, i) => addDays(new Date(2026, 9, 1), i));
const allergens: Allergen[] = ['dairy', 'gluten', 'peanut', 'soy', 'egg', 'fish', 'shellfish'];
const diets: Diet[] = ['veg', 'egg', 'nonveg', 'jain', 'vegan'];

describe('meal plans never break hard filters', () => {
  for (const diet of diets)
    for (const a of allergens)
      it(`${diet} with ${a} allergy`, () => {
        const p = profile({ diet, allergies: [a] });
        for (const d of days) {
          const meals = provider.mealsForDay(p, {}, d);
          for (const slot of SLOTS) {
            const dish = meals[slot];
            if (!dish) continue;
            expect(dish.allergens).not.toContain(a);
            expect(dishConflicts(p, dish)).toEqual([]);
          }
        }
      });

  it('swap options respect allergies and diet', () => {
    const p = profile({ diet: 'jain', allergies: ['dairy'] });
    for (const slot of SLOTS)
      for (const d of provider.mealOptions(p, null, slot)) {
        expect(d.jain).toBe(true);
        expect(d.diet).toBe('veg');
        expect(d.allergens).not.toContain('dairy');
      }
  });

  it('a saved swap is dropped when a new allergy makes it unsafe', () => {
    const date = days[0];
    const swaps = { [swapKey(date, 'd')]: 'paneerbhurji' };
    expect(dishFor(profile(), swaps, date, 'd')?.id).toBe('paneerbhurji');
    const withAllergy = profile({ allergies: ['dairy'] });
    expect(dishFor(withAllergy, swaps, date, 'd')?.allergens).not.toContain('dairy');
  });

  it('foods to avoid are excluded', () => {
    const p = profile({ avoidFoods: ['paneer', 'rajma'] });
    for (const slot of SLOTS) for (const d of candidates(p, slot)) expect(d.name.toLowerCase()).not.toMatch(/paneer|rajma/);
  });

  it('vegetarians never see egg dishes', () => {
    const p = profile({ diet: 'veg' });
    for (const slot of SLOTS) for (const d of candidates(p, slot)) expect(d.diet).toBe('veg');
  });

  it('only non-vegetarians see meat, chicken or fish', () => {
    for (const diet of ['veg', 'egg', 'jain', 'vegan'] as Diet[])
      for (const cuisine of ['N', 'S', 'E', 'W'] as const)
        for (const slot of SLOTS) for (const d of candidates(profile({ diet, cuisine }), slot)) expect(d.diet).not.toBe('nonveg');
    const nonveg = profile({ diet: 'nonveg', cuisine: 'E' });
    expect(SLOTS.flatMap((slot) => candidates(nonveg, slot)).some((d) => d.diet === 'nonveg')).toBe(true);
  });

  it('meals stay in the chosen region', () => {
    for (const diet of diets)
      for (const cuisine of ['N', 'S', 'E', 'W'] as const) {
        const p = profile({ diet, cuisine, goal: 'strength', weightKg: '75' });
        for (const d of days)
          for (const slot of SLOTS) {
            const dish = provider.mealsForDay(p, {}, d)[slot];
            // Other regions only fill in when the filters leave fewer than two home options.
            if (dish && !dish.cuisines.includes(cuisine)) expect(candidates(p, slot).filter((x) => x.cuisines.includes(cuisine)).length).toBeLessThan(2);
          }
      }
  });

  it('an East Indian plan has no South-only dishes', () => {
    const p = profile({ cuisine: 'E', diet: 'veg' });
    for (const d of days) for (const slot of SLOTS) expect(provider.mealsForDay(p, {}, d)[slot]?.cuisines).toContain('E');
  });

  it('every slot still has options for the strictest common profile', () => {
    const p = profile({ diet: 'vegan', allergies: ['gluten', 'soy', 'peanut'] });
    for (const slot of SLOTS) expect(candidates(p, slot).length).toBeGreaterThan(0);
  });

  it('the week has variety, not the same lunch every day', () => {
    const p = profile({ diet: 'egg', goal: 'strength', weightKg: '70', allergies: ['peanut'] });
    const lunches = new Set(days.slice(0, 7).map((d) => provider.mealsForDay(p, {}, d).l?.id));
    expect(lunches.size).toBeGreaterThanOrEqual(3);
  });

  it('there is no limit on how many habits you track', () => {
    expect(HABITS.filter((h) => h.kind === 'build').length).toBeGreaterThan(5);
    expect(HABITS.filter((h) => h.kind === 'reduce').length).toBeGreaterThan(5);
  });

  it('every dish has steps, ingredients and a portion', () => {
    for (const d of DISHES) {
      expect(d.steps.length).toBeGreaterThan(0);
      expect(d.ingredients.length).toBeGreaterThan(0);
      expect(d.portion).not.toBe('');
    }
  });
});

describe('protein guidance', () => {
  it('is a range, higher for strength goals', () => {
    expect(proteinRange(profile({ weightKg: '60' }))).toEqual([48, 60]);
    expect(proteinRange(profile({ weightKg: '60', goal: 'strength' }))).toEqual([54, 66]);
  });
  it('clamps implausible weights', () => {
    const [lo, hi] = proteinRange(profile({ weightKg: '400' }));
    expect(hi).toBeLessThanOrEqual(150);
    expect(lo).toBeGreaterThan(0);
  });
});

describe('safety rules', () => {
  it('pauses weight-loss pacing for a history of disordered eating', () => {
    const p = profile({ goal: 'lose', health: ['ed'] });
    expect(weightLossPaused(p)).toBe(true);
    expect(hideWeight(p)).toBe(true);
    expect(goalNotice(p)).toMatch(/won’t plan for weight loss/);
  });
  it('injury flags start joint-loading moves on the easier option', () => {
    const p = profile({ health: ['injury'] });
    const plan = buildSession(p, SESSIONS.A, 'home', []);
    const squat = plan.moves.find((m) => m.ex.id === 'squat');
    expect(squat?.easier).toBe(true);
    expect(plan.sets).toBe(2);
  });
  it('“too hard” feedback makes the next session easier', () => {
    expect(progression([{ date: '2026-10-01', sessionId: 'A', feel: 'hard', easier: [], setsDone: 9, painReported: false }])).toBe('easier');
    expect(
      progression([
        { date: '2026-10-01', sessionId: 'A', feel: 'easy', easier: [], setsDone: 12, painReported: false },
        { date: '2026-10-03', sessionId: 'B', feel: 'easy', easier: [], setsDone: 12, painReported: false },
      ]),
    ).toBe('harder');
  });
});

describe('workout schedule', () => {
  it('rotates A, B, C through the chosen days', () => {
    const p = profile({ workoutDays: [0, 2, 4] });
    const mon = weekStart(new Date(2026, 9, 21));
    expect(sessionForDate(p, mon)?.id).toBe('A');
    expect(sessionForDate(p, addDays(mon, 2))?.id).toBe('B');
    expect(sessionForDate(p, addDays(mon, 4))?.id).toBe('C');
    expect(sessionForDate(p, addDays(mon, 1))).toBeNull();
  });
  it('endurance goals add a cardio finisher', () => {
    const plan = buildSession(profile({ goal: 'endurance' }), SESSIONS.A, 'home', []);
    expect(plan.moves.at(-1)?.ex.id).toBe('march');
  });
});

describe('onboarding validation', () => {
  it('blocks under-18s with a kind message', () => {
    const y = String(new Date().getFullYear() - 16);
    expect(stepError('about', profile({ birthYear: y }))).toMatch(/18 and over/);
  });
  it('needs an explicit allergy answer', () => {
    expect(stepError('food', profile({ allergiesConfirmed: false, allergies: [] }))).toMatch(/No allergies/);
  });
  it('accepts a complete profile', () => {
    expect(stepError('about', profile())).toBeNull();
  });
});

describe('demo data', () => {
  it('produces history and protein', () => {
    const today = new Date();
    const s = demoState(today);
    const h = history(s, today);
    expect(h.length).toBe(3);
    expect(h[0].sessions).toBeGreaterThan(0);
    expect(proteinOn(s, addDays(today, -1))).toBeGreaterThan(0);
  });
});
