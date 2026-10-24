import type { DateKey } from './types';

const pad = (n: number) => String(n).padStart(2, '0');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const keyOf = (d: Date): DateKey => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function parseKey(k: DateKey): Date {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Monday = 0 … Sunday = 6 */
export const dayIndex = (d: Date) => (d.getDay() + 6) % 7;

export const weekStart = (d: Date) => addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12), -dayIndex(d));

export const weekDays = (start: Date) => Array.from({ length: 7 }, (_, i) => addDays(start, i));

export const fmtDate = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;

/** Whole days between two dates, ignoring the time of day. */
export function daysBetween(a: Date, b: Date): number {
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((ub - ua) / 86400000);
}

/** Stable day number used to rotate the meal plan. */
export const dayNumber = (d: Date) => daysBetween(new Date(2024, 0, 1), d);

export function greeting(d: Date) {
  const h = d.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

/** The first word of a full name, for friendly greetings. */
export const firstName = (full: string) => full.trim().split(/\s+/)[0] ?? '';
