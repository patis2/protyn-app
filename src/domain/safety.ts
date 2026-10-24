import { allergyConflicts, avoidConflicts, dietOK } from './nutrition';
import type { Dish, Profile } from './types';

// Safety rules that run on every plan, whatever produced it. Thresholds and
// wording must be confirmed with a registered dietitian and a certified
// trainer before launch; nothing here is clinically validated.

export const WELLNESS_NOTE = 'General wellness guidance, not medical advice.';

export const STOP_NOTE =
  'Stop if you feel chest pain, dizziness, breathlessness that doesn’t settle, or sharp joint pain. If it doesn’t settle, seek medical advice.';

export const PROFESSIONAL_NOTE =
  'If you are pregnant, have a medical condition, a history of disordered eating, or other complex needs, please talk to a doctor or registered dietitian before changing how you eat or exercise.';

export const ALLERGEN_NOTE =
  'We filter dishes by their main ingredients. Packaged foods, spice mixes and hing can contain hidden allergens such as wheat, so always check labels.';

export const MEAT_NOTE =
  'Cook chicken, meat and fish until there is no pink inside and the juices run clear. If you are pregnant, ask your doctor which fish are right for you.';

/** Health answers switch on gentler defaults. They never block anyone from using the app. */
export const isGentle = (p: Profile) => p.health.length > 0;

/** Weight stays hidden for people who told us about a history of disordered eating. */
export const hideWeight = (p: Profile) => p.health.includes('ed');

/** Weight-loss pacing is not offered when it could be unsafe; the plan behaves like "maintain". */
export const weightLossPaused = (p: Profile) => p.goal === 'lose' && (p.health.includes('ed') || p.health.includes('pregnant'));

export function goalNotice(p: Profile): string | null {
  if (weightLossPaused(p))
    return 'Because of your health answers, we won’t plan for weight loss. Your plan focuses on steady meals, strength and energy. A doctor or registered dietitian can help you set a safe goal.';
  if (p.health.includes('pregnant'))
    return 'During and after pregnancy, check with your doctor before starting a new exercise plan.';
  if (p.health.includes('condition') || p.health.includes('meds'))
    return 'With a medical condition or medicines that affect appetite or weight, please check this plan with your doctor.';
  if (p.health.includes('injury')) return 'Moves that load your joints start with the easier option. Stop anything that causes sharp pain.';
  return null;
}

export type Conflict = { dishId: string; reason: string };

export function dishConflicts(p: Profile, dish: Dish): Conflict[] {
  const out: Conflict[] = [];
  if (!dietOK(p.diet, dish)) out.push({ dishId: dish.id, reason: `not ${p.diet || 'veg'}` });
  for (const a of allergyConflicts(p.allergies, dish)) out.push({ dishId: dish.id, reason: `contains ${a}` });
  for (const a of avoidConflicts(p.avoidFoods, dish)) out.push({ dishId: dish.id, reason: `contains ${a}` });
  return out;
}

/** Final check before anything is shown. A conflicting dish is removed, never shown with a warning. */
export function filterSafe<T extends Dish | null>(p: Profile, dishes: T[]): T[] {
  return dishes.map((d) => (d && dishConflicts(p, d).length ? (null as T) : d));
}
