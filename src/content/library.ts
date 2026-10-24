import type { Exercise, GoalId, HabitDef, HealthFlag, SessionTemplate } from '../domain/types';

// Starter exercise library. Instructions are general guidance and must be
// reviewed by a certified trainer before launch.

export const EXERCISES: Record<string, Exercise> = {
  squat: {
    id: 'squat', home: 'Bodyweight squat', dumbbell: 'Goblet squat', gym: 'Leg press',
    easier: 'Squat to a chair', harder: 'Squat with a 3-second pause', reps: '10–12',
    cue: 'Sit back, chest up, knees track over toes.',
    steps: ['Stand with feet shoulder-width apart.', 'Push your hips back and bend your knees as if sitting on a chair.', 'Go as low as feels comfortable, then stand up through your heels.'],
    jointLoad: true,
  },
  push: {
    id: 'push', home: 'Incline push-up on the kitchen counter', dumbbell: 'Push-up', gym: 'Chest press machine',
    easier: 'Wall push-up', harder: 'Push-up with a pause at the bottom', reps: '8–10',
    cue: 'Body in one line, lower slowly.',
    steps: ['Place hands a little wider than your shoulders.', 'Keep your body straight from head to heels.', 'Lower your chest slowly, then press back up.'],
    jointLoad: false,
  },
  row: {
    id: 'row', home: 'Backpack row (fill it with books)', dumbbell: 'One-arm dumbbell row', gym: 'Seated cable row',
    easier: 'Lighter load, slower', harder: 'Row with a 2-second squeeze', reps: '10 each side',
    cue: 'Pull your elbow to your hip, shoulders down.',
    steps: ['Hinge forward with a flat back, one hand on a chair if needed.', 'Pull the weight towards your hip.', 'Lower it slowly until your arm is straight.'],
    jointLoad: false,
  },
  plank: {
    id: 'plank', home: 'Plank', dumbbell: 'Plank', gym: 'Plank',
    easier: 'Plank on knees', harder: 'Plank with shoulder taps', reps: '20–30 sec',
    cue: 'Squeeze your glutes, breathe steadily.',
    steps: ['Rest on your forearms and toes.', 'Keep a straight line from shoulders to heels.', 'Breathe normally and hold.'],
    jointLoad: false,
  },
  hinge: {
    id: 'hinge', home: 'Hip hinge holding a backpack', dumbbell: 'Dumbbell Romanian deadlift', gym: 'Romanian deadlift',
    easier: 'Hip hinge to a wall', harder: 'Single-leg hinge', reps: '10–12',
    cue: 'Push hips back, flat back, slight knee bend.',
    steps: ['Stand tall holding the weight in front of your thighs.', 'Push your hips back, keeping your back flat.', 'Stop when you feel a stretch, then stand up by squeezing your glutes.'],
    jointLoad: true,
  },
  press: {
    id: 'press', home: 'Wall slides', dumbbell: 'Seated dumbbell shoulder press', gym: 'Shoulder press machine',
    easier: 'One arm at a time', harder: 'Standing press', reps: '10',
    cue: 'Ribs down, press straight up.',
    steps: ['Sit tall with weights at shoulder height.', 'Press straight up without arching your back.', 'Lower slowly back to your shoulders.'],
    jointLoad: false,
  },
  lunge: {
    id: 'lunge', home: 'Reverse lunge', dumbbell: 'Dumbbell reverse lunge', gym: 'Walking lunge',
    easier: 'Split squat holding a chair', harder: 'Lunge with slow lowering', reps: '8 each side',
    cue: 'Step back, front knee over mid-foot.',
    steps: ['Stand tall and step one foot back.', 'Lower until both knees bend comfortably.', 'Push through your front foot to return.'],
    jointLoad: true,
  },
  deadbug: {
    id: 'deadbug', home: 'Dead bug', dumbbell: 'Dead bug', gym: 'Dead bug',
    easier: 'Heel taps', harder: 'Dead bug holding a dumbbell', reps: '8 each side',
    cue: 'Lower back stays pressed into the floor.',
    steps: ['Lie on your back, arms up, knees bent over hips.', 'Slowly lower one arm and the opposite leg.', 'Return and switch sides.'],
    jointLoad: false,
  },
  bridge: {
    id: 'bridge', home: 'Glute bridge', dumbbell: 'Dumbbell glute bridge', gym: 'Hip thrust machine',
    easier: 'Short-range bridge', harder: 'Single-leg bridge', reps: '12',
    cue: 'Drive through heels, pause at the top.',
    steps: ['Lie on your back with knees bent and feet flat.', 'Lift your hips until your body is in a line.', 'Pause, then lower slowly.'],
    jointLoad: false,
  },
  march: {
    id: 'march', home: 'Brisk march or stair intervals', dumbbell: 'Brisk march or stair intervals', gym: 'Cycle or treadmill intervals',
    easier: 'Easy march on the spot', harder: 'Faster intervals with high knees', reps: '30 sec on, 30 sec easy × 4',
    cue: 'You should be able to talk in short sentences.',
    steps: ['Move briskly for 30 seconds.', 'Slow down for 30 seconds.', 'Repeat four times.'],
    jointLoad: true,
  },
};

export const SESSIONS: Record<SessionTemplate['id'], SessionTemplate> = {
  A: { id: 'A', name: 'Session A', focus: 'Legs, push and pull', exercises: ['squat', 'push', 'row', 'plank', 'bridge'] },
  B: { id: 'B', name: 'Session B', focus: 'Hinge, press and core', exercises: ['hinge', 'press', 'lunge', 'deadbug', 'bridge'] },
  C: { id: 'C', name: 'Session C', focus: 'Full body', exercises: ['bridge', 'push', 'row', 'squat', 'plank'] },
};

export const WARM_UP = ['March on the spot, 60 seconds', 'Arm circles, 30 seconds each way', '10 slow bodyweight squats', '10 hip hinges'];
export const COOL_DOWN = ['Hamstring stretch, 30 seconds each side', 'Chest opener in a doorway, 30 seconds', 'Slow breathing, 5 breaths'];
export const REST_SECONDS = 45;

export const HABITS: HabitDef[] = [
  { id: 'water', name: 'Drink water', kind: 'build', type: 'count', goal: 8, unit: 'glasses' },
  { id: 'sleep', name: 'In bed by 11 pm', kind: 'build', type: 'bool' },
  { id: 'walk', name: '10-minute walk after dinner', kind: 'build', type: 'bool' },
  { id: 'pbreak', name: 'Protein at breakfast', kind: 'build', type: 'bool' },
  { id: 'steps', name: '7,000 steps', kind: 'build', type: 'bool' },
  { id: 'sun', name: '10 minutes of morning sun', kind: 'build', type: 'bool' },
  { id: 'screens', name: 'Screens off 30 min before bed', kind: 'reduce', type: 'bool' },
  { id: 'sugary', name: 'No sugary drinks today', kind: 'reduce', type: 'bool' },
  { id: 'fried', name: 'Fried snacks only once today', kind: 'reduce', type: 'bool' },
  { id: 'sitting', name: 'Stood up every hour at work', kind: 'reduce', type: 'bool' },
  { id: 'latedinner', name: 'Dinner before 9 pm', kind: 'reduce', type: 'bool' },
  { id: 'veg', name: 'Vegetables at two meals', kind: 'build', type: 'bool' },
  { id: 'stretch', name: '5 minutes of stretching', kind: 'build', type: 'bool' },
  { id: 'fruit', name: 'One piece of fruit', kind: 'build', type: 'bool' },
  { id: 'breathe', name: '5 slow breaths when stressed', kind: 'build', type: 'bool' },
  { id: 'stairs', name: 'Take the stairs', kind: 'build', type: 'bool' },
  { id: 'sweets', name: 'Sweets only once today', kind: 'reduce', type: 'bool' },
  { id: 'chai', name: 'Two cups of tea or coffee at most', kind: 'reduce', type: 'bool' },
  { id: 'snacking', name: 'No late-night snacking', kind: 'reduce', type: 'bool' },
  { id: 'phone', name: 'No phone during meals', kind: 'reduce', type: 'bool' },
  { id: 'tobacco', name: 'No smoking or tobacco today', kind: 'reduce', type: 'bool' },
];
export const HABIT_BY_ID: Record<string, HabitDef> = Object.fromEntries(HABITS.map((h) => [h.id, h]));

export const GOALS: { id: GoalId; name: string; detail: string }[] = [
  { id: 'fitness', name: 'Improve general fitness', detail: 'Strength, walking and steady meals' },
  { id: 'strength', name: 'Build strength or muscle', detail: 'Progressive strength and more protein' },
  { id: 'endurance', name: 'Increase endurance', detail: 'Strength plus short cardio intervals' },
  { id: 'lose', name: 'Lose some weight, gently', detail: 'Moderate pace only, no crash diets' },
  { id: 'gain', name: 'Gain weight steadily', detail: 'Regular meals, more protein, strength' },
  { id: 'maintain', name: 'Stay where I am, feel fitter', detail: 'Keep weight steady, build habits' },
];

export const HEALTH_FLAGS: [HealthFlag, string][] = [
  ['pregnant', 'Pregnant or recently gave birth'],
  ['condition', 'Diabetes, heart, BP, kidney or thyroid condition'],
  ['injury', 'Joint pain or an injury'],
  ['ed', 'History of disordered eating'],
  ['meds', 'Taking medicine that affects appetite or weight'],
];

export const ALLERGENS: [import('../domain/types').Allergen, string][] = [
  ['dairy', 'Dairy'],
  ['gluten', 'Gluten'],
  ['peanut', 'Peanuts'],
  ['treenut', 'Tree nuts'],
  ['soy', 'Soy'],
  ['egg', 'Egg'],
  ['sesame', 'Sesame'],
  ['fish', 'Fish'],
  ['shellfish', 'Prawns and shellfish'],
];

export const STAPLES: [import('../domain/types').Staple, string][] = [
  ['paneer', 'Paneer'],
  ['tofu', 'Tofu'],
  ['soya', 'Soya chunks'],
  ['sprouts', 'Sprouts'],
  ['curd', 'Curd'],
  ['eggs', 'Eggs'],
  ['chicken', 'Chicken'],
  ['fish', 'Fresh fish'],
  ['mutton', 'Mutton'],
];
export const MEAT_STAPLES: import('../domain/types').Staple[] = ['chicken', 'fish', 'mutton'];

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
