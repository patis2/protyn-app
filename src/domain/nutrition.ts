import { DISHES, DISH_BY_ID } from '../content/dishes';
import { dayNumber, keyOf } from './dates';
import { REGION_FALLBACK, STATE_BY_CODE } from '../content/states';
import type { Allergen, Cuisine, Diet, Dish, Profile, Slot } from './types';
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

/** The region a profile cooks from: its state's region, or an older saved region choice. */
export const regionOf = (p: Profile): Cuisine => (p.state ? STATE_BY_CODE[p.state].region : p.cuisine || 'N');

/** Home food: dishes cooked in the user's state, plus everyday dishes cooked across India. */
export function isHome(p: Profile, d: Dish): boolean {
  if (d.states === 'all') return true;
  return p.state ? d.states.includes(p.state) : d.cuisines.includes(regionOf(p));
}
const isStateDish = (p: Profile, d: Dish) => d.states !== 'all' && (p.state ? d.states.includes(p.state) : d.cuisines.includes(regionOf(p)));

/** Fewer home options than this for a slot, and the nearest regions fill in. */
const MIN_HOME = 2;

/**
 * Allowed dishes for a slot, best fit first. Plans use the user's own state's
 * food. Only when the hard filters leave fewer than two home options do dishes
 * from the same region join, then neighbouring regions, then the rest.
 * Within each group, easy-to-get dishes and the state's own dishes lead.
 */
export function candidates(p: Profile, slot: Slot): Dish[] {
  const all = DISHES.filter((d) => d.slot === slot && isAllowed(p, d));
  const score = (d: Dish) => (isAvailable(p, d) ? 2 : 0) + (isStateDish(p, d) ? 1 : 0);
  const ranked = (list: Dish[]) => [...list].sort((a, b) => score(b) - score(a));
  const out = ranked(all.filter((d) => isHome(p, d)));
  for (const region of REGION_FALLBACK[regionOf(p)]) {
    if (out.length >= MIN_HOME) return out;
    out.push(...ranked(all.filter((d) => !out.includes(d) && d.cuisines.includes(region))));
  }
  if (out.length >= MIN_HOME) return out;
  return out.concat(ranked(all.filter((d) => !out.includes(d))));
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
  const near = (d: Dish) => (isHome(p, d) ? 2 : d.cuisines.includes(regionOf(p)) ? 1 : 0);
  return DISHES.filter((d) => d.slot === slot && isAllowed(p, d) && d.id !== current?.id).sort((a, b) => near(b) - near(a) || b.protein - a.protein);
}

export function whyThis(p: Profile, dish: Dish): string {
  const [lo] = proteinRange(p);
  const parts = [
    dietLabel(p.diet).toLowerCase(),
    isHome(p, dish)
      ? dish.states === 'all'
        ? 'an everyday dish cooked across India'
        : `${homeLabel(p)} home food`
      : dish.cuisines.includes(regionOf(p))
        ? `from a neighbouring state, because your filters leave few ${homeLabel(p)} options here`
        : 'from another region, because your filters leave few options here',
    p.allergies.length ? `free of ${p.allergies.map(allergenLabel).join(', ').toLowerCase()}` : '',
    `${dish.protein} g protein toward your ${lo} g minimum`,
  ].filter(Boolean);
  return parts.join(', ');
}

export const dietLabel = (d: Diet | '') => ({ veg: 'Vegetarian', egg: 'Eggetarian', nonveg: 'Non-vegetarian', jain: 'Jain', vegan: 'Vegan' })[d || 'veg'];
export const cuisineLabel = (c: Cuisine | '') =>
  ({ N: 'North Indian', S: 'South Indian', E: 'East Indian', W: 'West Indian', C: 'Central Indian', NE: 'North-east Indian' })[c || 'N'];
/** The state's name, or the older region label for profiles saved before states. */
export const homeLabel = (p: Profile) => (p.state ? STATE_BY_CODE[p.state].name : cuisineLabel(p.cuisine));
export const allergenLabel = (a: Allergen) =>
  ({ dairy: 'Dairy', gluten: 'Gluten', peanut: 'Peanuts', treenut: 'Tree nuts', soy: 'Soy', egg: 'Egg', sesame: 'Sesame', fish: 'Fish', shellfish: 'Prawns and shellfish' })[a];

export function proteinTip(p: Profile): string {
  const curd = !p.allergies.includes('dairy') && p.diet !== 'vegan';
  if (p.diet === 'nonveg') return 'A piece of grilled chicken or fish, or two boiled eggs, would close most of it.';
  if (p.diet === 'egg' && !p.allergies.includes('egg')) return 'Two boiled eggs or a katori of dal would close most of it.';
  return curd ? 'A katori of curd or a handful of roasted chana would help.' : 'A handful of roasted chana or a katori of sprouts would help.';
}
