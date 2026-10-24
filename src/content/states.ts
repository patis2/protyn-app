import type { Cuisine, StateCode } from '../domain/types';

// States and union territories of India, each with the wider food region used
// as a fallback when a state's own dishes can't fill a meal under the user's
// filters. Regions: N north, W west, C central, E east, NE north-east, S south.

export const STATES: { code: StateCode; name: string; region: Cuisine }[] = [
  { code: 'AN', name: 'Andaman and Nicobar Islands', region: 'E' },
  { code: 'AP', name: 'Andhra Pradesh', region: 'S' },
  { code: 'AR', name: 'Arunachal Pradesh', region: 'NE' },
  { code: 'AS', name: 'Assam', region: 'NE' },
  { code: 'BR', name: 'Bihar', region: 'E' },
  { code: 'CH', name: 'Chandigarh', region: 'N' },
  { code: 'CG', name: 'Chhattisgarh', region: 'C' },
  { code: 'DN', name: 'Dadra and Nagar Haveli and Daman and Diu', region: 'W' },
  { code: 'DL', name: 'Delhi', region: 'N' },
  { code: 'GA', name: 'Goa', region: 'W' },
  { code: 'GJ', name: 'Gujarat', region: 'W' },
  { code: 'HR', name: 'Haryana', region: 'N' },
  { code: 'HP', name: 'Himachal Pradesh', region: 'N' },
  { code: 'JK', name: 'Jammu and Kashmir', region: 'N' },
  { code: 'JH', name: 'Jharkhand', region: 'E' },
  { code: 'KA', name: 'Karnataka', region: 'S' },
  { code: 'KL', name: 'Kerala', region: 'S' },
  { code: 'LA', name: 'Ladakh', region: 'N' },
  { code: 'LD', name: 'Lakshadweep', region: 'S' },
  { code: 'MP', name: 'Madhya Pradesh', region: 'C' },
  { code: 'MH', name: 'Maharashtra', region: 'W' },
  { code: 'MN', name: 'Manipur', region: 'NE' },
  { code: 'ML', name: 'Meghalaya', region: 'NE' },
  { code: 'MZ', name: 'Mizoram', region: 'NE' },
  { code: 'NL', name: 'Nagaland', region: 'NE' },
  { code: 'OD', name: 'Odisha', region: 'E' },
  { code: 'PY', name: 'Puducherry', region: 'S' },
  { code: 'PB', name: 'Punjab', region: 'N' },
  { code: 'RJ', name: 'Rajasthan', region: 'W' },
  { code: 'SK', name: 'Sikkim', region: 'NE' },
  { code: 'TN', name: 'Tamil Nadu', region: 'S' },
  { code: 'TG', name: 'Telangana', region: 'S' },
  { code: 'TR', name: 'Tripura', region: 'NE' },
  { code: 'UP', name: 'Uttar Pradesh', region: 'N' },
  { code: 'UK', name: 'Uttarakhand', region: 'N' },
  { code: 'WB', name: 'West Bengal', region: 'E' },
];

export const STATE_BY_CODE = Object.fromEntries(STATES.map((s) => [s.code, s])) as Record<StateCode, (typeof STATES)[number]>;

/** Regions to borrow from, nearest first, when a state's own dishes run short. */
export const REGION_FALLBACK: Record<Cuisine, Cuisine[]> = {
  N: ['N'],
  W: ['W', 'N'],
  C: ['C', 'N', 'W'],
  E: ['E'],
  NE: ['NE', 'E'],
  S: ['S'],
};
