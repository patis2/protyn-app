// Core types shared by screens, rules and storage.

export type DateKey = string; // YYYY-MM-DD in the user's local time

export type Slot = 'b' | 'l' | 's' | 'd';
export const SLOTS: Slot[] = ['b', 'l', 's', 'd'];
export const SLOT_LABEL: Record<Slot, string> = { b: 'Breakfast', l: 'Lunch', s: 'Snack', d: 'Dinner' };

export type Diet = 'veg' | 'egg' | 'nonveg' | 'jain' | 'vegan';
export type Cuisine = 'N' | 'S' | 'E' | 'W' | 'C' | 'NE';
export type StateCode =
  | 'AN' | 'AP' | 'AR' | 'AS' | 'BR' | 'CH' | 'CG' | 'DN' | 'DL' | 'GA' | 'GJ' | 'HR'
  | 'HP' | 'JK' | 'JH' | 'KA' | 'KL' | 'LA' | 'LD' | 'MP' | 'MH' | 'MN' | 'ML' | 'MZ'
  | 'NL' | 'OD' | 'PY' | 'PB' | 'RJ' | 'SK' | 'TN' | 'TG' | 'TR' | 'UP' | 'UK' | 'WB';
export type DishDiet = 'veg' | 'egg' | 'nonveg';
export type Allergen = 'dairy' | 'gluten' | 'peanut' | 'treenut' | 'soy' | 'egg' | 'sesame' | 'fish' | 'shellfish';
export type GoalId = 'fitness' | 'strength' | 'endurance' | 'lose' | 'gain' | 'maintain';
export type Activity = 'low' | 'light' | 'active';
export type Experience = 'beginner' | 'some' | 'regular';
export type Place = 'home' | 'gym' | 'both';
export type Equipment = 'dumbbells' | 'mat' | 'band' | 'chair';
export type HealthFlag = 'pregnant' | 'condition' | 'injury' | 'ed' | 'meds';
export type SleepBand = 'under6' | '6to7' | '7to8' | 'over8';
export type WaterBand = 'low' | 'mid' | 'high';
export type Staple = 'paneer' | 'tofu' | 'soya' | 'sprouts' | 'curd' | 'eggs' | 'chicken' | 'fish' | 'mutton';
export type MeasureKind = 'weight' | 'waist' | 'hips' | 'chest' | 'arm';

export type IngredientGroup = 'P' | 'D' | 'C' | 'V' | 'X' | 'E' | 'M';

export type Ingredient = { name: string; group: IngredientGroup; qty?: string };

export type Dish = {
  id: string;
  slot: Slot;
  name: string;
  /** 'veg' dishes contain no egg; 'egg' dishes contain egg; 'nonveg' dishes contain meat, chicken or fish. */
  diet: DishDiet;
  /** True when the dish has no root vegetables, onion or garlic. */
  jain: boolean;
  /** States where this is everyday home food, or 'all' for dishes cooked across India. */
  states: StateCode[] | 'all';
  /** Regions derived from `states`, used when a state's own dishes run short. */
  cuisines: Cuisine[];
  /** Estimated protein in grams for the stated portion. Pending dietitian review. */
  protein: number;
  portion: string;
  allergens: Allergen[];
  /** Staples this dish depends on, used to respect food availability. */
  staples: Staple[];
  ingredients: Ingredient[];
  steps: string[];
  substitution?: string;
};

export type QuickFood = {
  id: string;
  name: string;
  unit: string;
  protein: number;
  diet: DishDiet;
  allergens: Allergen[];
};

export type Exercise = {
  id: string;
  /** Names for each setting. */
  home: string;
  dumbbell: string;
  gym: string;
  easier: string;
  harder: string;
  reps: string;
  cue: string;
  steps: string[];
  /** Exercises that load a sore joint are swapped for their easier option when injury is flagged. */
  jointLoad: boolean;
};

export type SessionTemplate = { id: 'A' | 'B' | 'C'; name: string; focus: string; exercises: string[] };

export type HabitDef = {
  id: string;
  name: string;
  kind: 'build' | 'reduce';
  type: 'bool' | 'count';
  goal?: number;
  unit?: string;
};

export type Profile = {
  name: string;
  birthYear: string;
  heightCm: string;
  weightKg: string;
  /** Waist in inches. */
  waistIn: string;
  goal: GoalId | '';
  why: string;
  activity: Activity | '';
  experience: Experience | '';
  minutes: '10' | '20' | '30';
  workoutDays: number[]; // 0 = Monday
  diet: Diet | '';
  state: StateCode | '';
  /** Region of `state`, kept for older saved profiles that only chose a region. */
  cuisine: Cuisine | '';
  allergies: Allergen[];
  allergiesConfirmed: boolean;
  otherAllergy: string;
  avoidFoods: string[];
  unavailable: Staple[];
  place: Place | '';
  equipment: Equipment[];
  sleep: SleepBand | '';
  water: WaterBand | '';
  habits: string[];
  health: HealthFlag[];
  healthNote: string;
  startedAt: DateKey;
};

export type Feel = 'easy' | 'right' | 'hard';
export type Level = 'low' | 'ok' | 'good';

export type CheckIn = { energy?: Level; mood?: Level; diff?: Feel };

export type SessionLog = {
  date: DateKey;
  sessionId: SessionTemplate['id'];
  feel: Feel;
  easier: string[];
  setsDone: number;
  painReported: boolean;
};

export type Measurement = { date: DateKey; kind: MeasureKind; value: number };

export type ExtraFood = { id: string; name: string; unit: string; protein: number };

export type Reminders = { workout: boolean; meals: boolean; habits: boolean; summary: boolean; time: string };

export type Consents = { plan: true; health: boolean; analytics: boolean; reminders: boolean };

export type Logs = {
  eaten: Record<DateKey, Partial<Record<Slot, boolean>>>;
  extras: Record<DateKey, ExtraFood[]>;
  swaps: Record<string, string>; // `${date}|${slot}` -> dish id
  habits: Record<DateKey, Record<string, number | boolean>>;
  checkins: Record<DateKey, CheckIn>;
  sessions: SessionLog[];
  notes: Record<DateKey, string>;
  measurements: Measurement[];
  shopTicks: Record<DateKey, Record<string, boolean>>; // keyed by week start
  saved: string[]; // favourite dish ids
};

export type Settings = {
  reminders: Reminders;
  consents: Consents;
  showMeasurements: boolean;
  tracked: MeasureKind[];
  moveMode: 'home' | 'gym';
  /** True once body measurements are stored in inches. */
  inches: boolean;
  /** Rewards the person has already been shown, so new ones can be celebrated once. */
  seenRewards: string[];
};

export type AppMode = 'none' | 'demo' | 'local' | 'cloud';

export type AppState = {
  version: 1;
  mode: AppMode;
  adult: boolean;
  consentAt: string | null;
  onboarded: boolean;
  profile: Profile;
  logs: Logs;
  settings: Settings;
};
