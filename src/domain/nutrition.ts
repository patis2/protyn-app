import { DISHES, DISH_BY_ID } from '../content/dishes';
import { dayNumber, keyOf } from './dates';
import type { Allergen, Diet, Dish, Profile, Slot } from './types';
import { SLOTS } from './types';

// Meal rules. Diet, allergies and foods to avoid are hard filters: a dish that
// breaks one is never offered, not even as a swap. Availability and cuisine
// only change the order.

export function dietOK(diet: Diet | '', dish: Pick<Dish, 'diet' | 'jain' | 'allergens'>): boolean {
  switch (diet || 'veg') {
    case 'jain':
      return dish.diet === 'veg' && dish.jain;
    case 'veg':
      return dish.diet === 'veg';
    case 'vegan':
      return dish.diet === 'veg' && !dish.allergens.includes('dairy');
    case 'egg':
      return dish.diet !== 'nonveg';
    case 'nonveg':
      return true;
  }
  return false;
}

export const allergyConflicts = (allergies: Allergen[], dish: Pick<Dish, 'allergens'>) =>
  dish.allergens.filter((a) => allergies.includes(a));

/** Foods to avoid are matched as words against the dish name and its ingredients. */
export function avoidConflicts(avoid: string[], dish: Dish): string[] {
  const text = [dish.name, ...dish.ingredients.map((i) => i.name)].join(' ').toLowerCase();
  return avoid.map((a) => a.trim().toLowerCase()).filter((a) => a.length > 1 && text.includes(a));
}

export function isAllowed(p: Profile, dish: Dish): boolean {
  return dietOK(p.diet, dish) && allergyConflicts(p.allergies, dish).length === 0 && avoidConflicts(p.avoidFoods, dish).length === 0;
}

const isAvailable = (p: Profile, d: Dish) => !d.staples.some((s) => p.unavailable.includes(s));

/** Dishes from the user's own region, plus pan-Indian dishes that every region cooks. */
export const isHomeRegion = (p: Profile, d: Dish) => d.cuisines.includes(p.cuisine || 'N');

/** Fewer home-region options than this for a slot, and other regions fill in. */
const MIN_HOME = 2;

/**
 * Allowed dishes for a slot, best fit first. Only the user's region is planned
 * unless the hard filters leave fewer than two options, so an East Indian plan
 * doesn't drift into South Indian food. Within that, easy-to-get dishes lead.
 */
export function candidates(p: Profile, slot: Slot): Dish[] {
  const all = DISHES.filter((d) => d.slot === slot && isAllowed(p, d));
  // Easy to get first, then true regional dishes ahead of pan-Indian ones.
  const score = (d: Dish) => (isAvailable(p, d) ? 2 : 0) + (d.cuisines.length < 4 ? 1 : 0);
  const byAvailability = (list: Dish[]) => [...list].sort((a, b) => score(b) - score(a));
  const home = all.filter((d) => isHomeRegion(p, d));
  if (home.length >= MIN_HOME) return byAvailability(home);
  return byAvailability(home).concat(byAvailability(all.filter((d) => !isHomeRegion(p, d))));
}

export function proteinRange(p: Profile): [number, number] {
  const raw = Number(p.weightKg);
  const w = Number.isFinite(raw) && raw > 0 ? Math.min(Math.max(raw, 35), 150) : 60;
  const higher = p.goal === 'strength' || p.goal === 'gain';
  const [lo, hi] = higher ? [0.9, 1.1] : [0.8, 1.0];
  return [Math.round(w * lo), Math.round(w * hi)];
}

export type DayMeals = Record<Slot, Dish | null>;

/** The planned day before swaps: rotate through good matches, then lift protein to the bottom of the range. */
export function basePlan(p: Profile, date: Date): DayMeals {
  const n = dayNumber(date);
  const plan = {} as DayMeals;
  SLOTS.forEach((slot, j) => {
    const c = candidates(p, slot);
    const pool = c.slice(0, Math.min(c.length, 6));
    plan[slot] = pool.length ? pool[(n + j * 2) % pool.length] : null;
  });
  const [lo] = proteinRange(p);
  const sum = () => SLOTS.reduce((a, s) => a + (plan[s]?.protein ?? 0), 0);
  for (let guard = 0; guard < 4 && sum() < lo; guard++) {
    let best: { slot: Slot; dish: Dish; gain: number } | null = null;
    for (const slot of SLOTS) {
      const cur = plan[slot];
      if (!cur) continue;
      // Rotate among the top few upgrades so the same dish doesn't fill every day.
      const ups = candidates(p, slot)
        .filter((d) => d.protein > cur.protein)
        .sort((a, b) => b.protein - a.protein);
      const up = ups[(n + SLOTS.indexOf(slot)) % Math.min(3, ups.length || 1)];
      if (up && (!best || up.protein - cur.protein > best.gain)) best = { slot, dish: up, gain: up.protein - cur.protein };
    }
    if (!best) break;
    plan[best.slot] = best.dish;
  }
  return plan;
}

export const swapKey = (date: Date, slot: Slot) => `${keyOf(date)}|${slot}`;

export function dishFor(p: Profile, swaps: Record<string, string>, date: Date, slot: Slot): Dish | null {
  const swapped = DISH_BY_ID[swaps[swapKey(date, slot)]];
  // A swap is re-checked every time, so changing allergies later can never surface it.
  if (swapped && isAllowed(p, swapped)) return swapped;
  return basePlan(p, date)[slot];
}

export function swapOptions(p: Profile, current: Dish | null, slot: Slot): Dish[] {
  const cu = p.cuisine || 'N';
  return DISHES.filter((d) => d.slot === slot && isAllowed(p, d) && d.id !== current?.id).sort(
    (a, b) => Number(b.cuisines.includes(cu)) - Number(a.cuisines.includes(cu)) || b.protein - a.protein,
  );
}

export function whyThis(p: Profile, dish: Dish): string {
  const [lo] = proteinRange(p);
  const parts = [
    dietLabel(p.diet).toLowerCase(),
    dish.cuisines.includes(p.cuisine || 'N') ? `${cuisineLabel(p.cuisine)} home food` : 'from another region, to give you more choice',
    p.allergies.length ? `free of ${p.allergies.map(allergenLabel).join(', ').toLowerCase()}` : '',
    `${dish.protein} g protein toward your ${lo} g minimum`,
  ].filter(Boolean);
  return parts.join(', ');
}

export const dietLabel = (d: Diet | '') => ({ veg: 'Vegetarian', egg: 'Eggetarian', nonveg: 'Non-vegetarian', jain: 'Jain', vegan: 'Vegan' })[d || 'veg'];
export const cuisineLabel = (c: Profile['cuisine']) => ({ N: 'North Indian', S: 'South Indian', E: 'East Indian', W: 'West Indian' })[c || 'N'];
export const allergenLabel = (a: Allergen) =>
  ({ dairy: 'Dairy', gluten: 'Gluten', peanut: 'Peanuts', treenut: 'Tree nuts', soy: 'Soy', egg: 'Egg', sesame: 'Sesame', fish: 'Fish', shellfish: 'Prawns and shellfish' })[a];

export function proteinTip(p: Profile): string {
  const curd = !p.allergies.includes('dairy') && p.diet !== 'vegan';
  if (p.diet === 'nonveg') return 'A piece of grilled chicken or fish, or two boiled eggs, would close most of it.';
  if (p.diet === 'egg' && !p.allergies.includes('egg')) return 'Two boiled eggs or a katori of dal would close most of it.';
  return curd ? 'A katori of curd or a handful of roasted chana would help.' : 'A handful of roasted chana or a katori of sprouts would help.';
}
