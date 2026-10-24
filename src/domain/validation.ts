import { z } from 'zod';
import type { MeasureKind, Profile } from './types';

// Input rules for onboarding and profile edits. Messages are written for people,
// not developers, and say how to fix the problem.

const currentYear = new Date().getFullYear();

export const aboutSchema = z.object({
  name: z.string().trim().min(2, 'Add your full name.').max(60, 'Keep your name under 60 characters.'),
  birthYear: z
    .string()
    .regex(/^\d{4}$/, 'Enter your birth year as four digits, for example 1995.')
    .refine((y) => Number(y) >= currentYear - 100, 'Check your birth year.')
    .refine((y) => currentYear - Number(y) >= 18, 'Protyn is for adults 18 and over for now. We’re sorry we can’t make a plan for you yet.'),
  heightCm: z.coerce.number({ message: 'Enter your height in centimetres.' }).min(120, 'Enter your height in centimetres, between 120 and 220.').max(220, 'Enter your height in centimetres, between 120 and 220.'),
  weightKg: z.coerce.number({ message: 'Enter your weight in kilograms.' }).min(30, 'Enter your weight in kilograms, between 30 and 250.').max(250, 'Enter your weight in kilograms, between 30 and 250.'),
  waistIn: z.union([z.literal(''), z.coerce.number().min(16, 'Waist should be between 16 and 80 inches, or leave it empty.').max(80, 'Waist should be between 16 and 80 inches, or leave it empty.')]),
});

export type StepKey = 'about' | 'goal' | 'activity' | 'food' | 'workouts' | 'habits' | 'health' | 'preview';

export function stepError(step: StepKey, p: Profile): string | null {
  switch (step) {
    case 'about': {
      const r = aboutSchema.safeParse({ ...p, waistIn: p.waistIn.trim() });
      return r.success ? null : r.error.issues[0].message;
    }
    case 'goal':
      return p.goal ? null : 'Pick the goal that matters most right now. You can change it later.';
    case 'activity':
      if (!p.activity || !p.experience) return 'Choose your activity level and your experience.';
      return null;
    case 'food':
      if (!p.diet) return 'Choose what you eat.';
      if (!p.state) return 'Choose the state whose food you cook at home.';
      if (!p.allergiesConfirmed && !p.allergies.length) return 'Tell us about allergies. Choose “No allergies” if none apply. We never guess.';
      return null;
    case 'workouts':
      if (!p.place) return 'Choose where you’ll work out.';
      if (p.workoutDays.length < 2 || p.workoutDays.length > 4) return 'Choose two to four workout days.';
      return null;
    default:
      return null;
  }
}

const RANGES: Record<MeasureKind, [number, number, string]> = {
  weight: [30, 250, 'kg'],
  waist: [16, 80, 'in'],
  hips: [20, 80, 'in'],
  chest: [20, 80, 'in'],
  arm: [6, 28, 'in'],
};

export const MEASURE_LABEL: Record<MeasureKind, string> = { weight: 'Weight', waist: 'Waist', hips: 'Hips', chest: 'Chest', arm: 'Upper arm' };
export const measureUnit = (k: MeasureKind) => RANGES[k][2];

export function measurementError(kind: MeasureKind, raw: string): string | null {
  const v = Number(raw.replace(',', '.'));
  const [lo, hi, unit] = RANGES[kind];
  if (!raw.trim() || !Number.isFinite(v)) return `Enter a number in ${unit}.`;
  if (v < lo || v > hi) return `${MEASURE_LABEL[kind]} should be between ${lo} and ${hi} ${unit}.`;
  return null;
}

/** Splits a comma-separated list of foods to avoid into clean entries. */
export const parseAvoid = (raw: string) =>
  raw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);

export const noteSchema = z.string().max(500, 'Notes can be up to 500 characters.');
