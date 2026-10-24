import type { Dish, IngredientGroup, QuickFood } from '../domain/types';

// Starter recipe library. Protein values are estimates for the stated household
// portion and must be reviewed by a registered dietitian before launch.
// To connect a reviewed content source later, replace this module with a loader
// that returns the same Dish shape; the rules and safety checks stay the same.

export const CONTENT_VERSION = 'starter-2026-10 (unreviewed)';

export const GROUP_LABEL: Record<IngredientGroup, string> = {
  P: 'Pulses and dals',
  D: 'Dairy',
  C: 'Grains and flours',
  V: 'Vegetables and fruit',
  X: 'Pantry',
  E: 'Eggs',
};

type Row = Omit<Dish, 'ingredients' | 'staples' | 'substitution'> & {
  ing: [string, IngredientGroup][];
  staples?: Dish['staples'];
  sub?: string;
};

const rows: Row[] = [
  // Breakfast
  { id: 'idli', slot: 'b', name: 'Idli with sambar', diet: 'veg', jain: false, cuisines: ['S'], protein: 11, portion: '3 idli · 1 katori sambar', allergens: [], ing: [['Idli batter', 'P'], ['Toor dal', 'P'], ['Drumstick and mixed veg', 'V']], steps: ['Steam the idlis for 10 to 12 minutes.', 'Cook toor dal with vegetables, tamarind and sambar powder.', 'Serve hot. An extra half katori of sambar adds about 3 g protein.'], sub: 'Short on time? Use ready idli batter. Swap sambar for a katori of curd if you eat dairy.' },
  { id: 'pesarattu', slot: 'b', name: 'Pesarattu with ginger chutney', diet: 'veg', jain: false, cuisines: ['S'], protein: 14, portion: '2 pesarattu · 2 tbsp chutney', allergens: [], ing: [['Whole green moong', 'P'], ['Ginger and green chilli', 'V'], ['Rice (a handful)', 'C']], steps: ['Soak moong overnight and grind with ginger and chilli.', 'Spread thin on a hot tawa with a little oil.', 'Serve with ginger chutney.'], sub: 'No time to soak? Use split moong dal, which soaks in 2 hours.' },
  { id: 'ragidosa', slot: 'b', name: 'Ragi dosa with peanut chutney', diet: 'veg', jain: true, cuisines: ['S'], protein: 9, portion: '2 dosa · 2 tbsp chutney', allergens: ['peanut', 'dairy'], staples: ['curd'], ing: [['Ragi flour', 'C'], ['Curd', 'D'], ['Peanuts', 'X']], steps: ['Mix ragi flour with curd and water into a thin batter.', 'Rest 15 minutes, then pour thin dosas.', 'Grind roasted peanuts with salt and tamarind for chutney.'], sub: 'Use roasted chana dal chutney instead of peanut chutney if you prefer.' },
  { id: 'chilla', slot: 'b', name: 'Moong dal chilla with curd', diet: 'veg', jain: true, cuisines: ['N', 'W'], protein: 16, portion: '2 chilla · 1 katori curd', allergens: ['dairy'], staples: ['curd'], ing: [['Yellow moong dal', 'P'], ['Curd', 'D'], ['Coriander', 'V']], steps: ['Soak moong dal for 2 hours and grind smooth.', 'Season and cook thin chillas on a tawa.', 'Serve with a katori of curd.'], sub: 'Add crumbled paneer inside for about 5 g more protein.' },
  { id: 'poha', slot: 'b', name: 'Poha with peanuts and sprouts', diet: 'veg', jain: false, cuisines: ['W'], protein: 9, portion: '1½ katori', allergens: ['peanut'], staples: ['sprouts'], ing: [['Thick poha', 'C'], ['Moong sprouts', 'P'], ['Peanuts', 'X'], ['Onion', 'V']], steps: ['Rinse poha and drain.', 'Temper mustard seeds, curry leaves, onion and peanuts.', 'Add poha, sprouts, turmeric and lemon.'], sub: 'Use roasted chana instead of peanuts if you like.' },
  { id: 'paratha', slot: 'b', name: 'Paneer paratha with curd', diet: 'veg', jain: true, cuisines: ['N'], protein: 17, portion: '1 paratha · 1 katori curd', allergens: ['dairy', 'gluten'], staples: ['paneer', 'curd'], ing: [['Atta', 'C'], ['Paneer', 'D'], ['Curd', 'D']], steps: ['Mash paneer with spices and coriander.', 'Stuff into atta dough and roll out.', 'Cook on a tawa with a little ghee.'], sub: 'Lighter? Use less ghee and have a bigger katori of curd.' },
  { id: 'besan', slot: 'b', name: 'Besan chilla with mint chutney', diet: 'veg', jain: true, cuisines: ['N', 'W'], protein: 12, portion: '2 chilla', allergens: [], ing: [['Besan', 'P'], ['Tomato and capsicum', 'V'], ['Mint', 'V']], steps: ['Whisk besan with water, salt and ajwain.', 'Add chopped vegetables.', 'Cook thin on a tawa.'], sub: 'Add a katori of curd on the side for about 6 g more protein, if you eat dairy.' },
  { id: 'omelette', slot: 'b', name: 'Masala omelette with toast', diet: 'egg', jain: false, cuisines: ['N', 'S', 'E', 'W'], protein: 16, portion: '2 eggs · 2 slices', allergens: ['egg', 'gluten'], staples: ['eggs'], ing: [['Eggs', 'E'], ['Bread', 'C'], ['Onion and tomato', 'V']], steps: ['Beat eggs with onion, tomato, chilli and salt.', 'Cook on low heat and fold.', 'Serve with toast.'], sub: 'Add a glass of milk for about 7 g more protein.' },
  { id: 'eggbhurji', slot: 'b', name: 'Egg bhurji with 2 roti', diet: 'egg', jain: false, cuisines: ['N', 'W'], protein: 17, portion: '1 katori bhurji · 2 roti', allergens: ['egg', 'gluten'], staples: ['eggs'], ing: [['Eggs', 'E'], ['Atta', 'C'], ['Onion and tomato', 'V']], steps: ['Sauté onion, tomato and spices.', 'Scramble eggs in the masala.', 'Serve with roti.'] },
  { id: 'chiradoi', slot: 'b', name: 'Chira doi with banana', diet: 'veg', jain: true, cuisines: ['E'], protein: 8, portion: '1 katori chira · 1 katori doi', allergens: ['dairy'], staples: ['curd'], ing: [['Chira (flattened rice)', 'C'], ['Doi (curd)', 'D'], ['Banana', 'V']], steps: ['Rinse chira and soften for 2 minutes.', 'Mix with doi and sliced banana.', 'Add a little jaggery if you like.'], sub: 'A spoon of roasted chana adds a little more protein.' },
  { id: 'upma', slot: 'b', name: 'Vegetable upma with milk', diet: 'veg', jain: false, cuisines: ['S'], protein: 11, portion: '1½ katori upma · 1 glass milk', allergens: ['gluten', 'dairy'], ing: [['Rava', 'C'], ['Mixed veg', 'V'], ['Milk', 'D']], steps: ['Roast rava lightly.', 'Temper and cook vegetables, add water and rava.', 'Have with a glass of milk.'] },
  { id: 'thalipeeth', slot: 'b', name: 'Thalipeeth with curd', diet: 'veg', jain: false, cuisines: ['W'], protein: 12, portion: '2 thalipeeth · 1 katori curd', allergens: ['dairy'], staples: ['curd'], ing: [['Bhajani flour', 'C'], ['Onion', 'V'], ['Curd', 'D']], steps: ['Mix bhajani flour with onion and spices.', 'Pat thin on a tawa and cook both sides.', 'Serve with curd.'] },

  // Lunch
  { id: 'sambarrice', slot: 'l', name: 'Sambar rice, beans poriyal and curd', diet: 'veg', jain: false, cuisines: ['S'], protein: 16, portion: '1 katori rice · 1 katori sambar · 1 katori poriyal · 1 katori curd', allergens: ['dairy'], staples: ['curd'], ing: [['Toor dal', 'P'], ['Rice', 'C'], ['Beans', 'V'], ['Curd', 'D']], steps: ['Cook sambar with vegetables.', 'Stir-fry beans with mustard seeds and coconut.', 'Serve with rice and curd.'], sub: 'Curd is the easy protein win on this plate.' },
  { id: 'rajma', slot: 'l', name: 'Rajma chawal with salad', diet: 'veg', jain: false, cuisines: ['N'], protein: 13, portion: '1 katori rajma · 1 katori rice · salad', allergens: [], ing: [['Rajma', 'P'], ['Rice', 'C'], ['Cucumber and onion', 'V']], steps: ['Soak rajma overnight and pressure cook.', 'Simmer in onion-tomato masala.', 'Serve with rice and salad.'], sub: 'Add a katori of curd for about 6 g more protein, if you eat dairy.' },
  { id: 'dalroti', slot: 'l', name: 'Dal, 2 roti, sabzi and curd', diet: 'veg', jain: true, cuisines: ['N', 'W'], protein: 18, portion: '1 katori dal · 2 roti · 1 katori sabzi · 1 katori curd', allergens: ['dairy', 'gluten'], staples: ['curd'], ing: [['Toor or moong dal', 'P'], ['Atta', 'C'], ['Seasonal sabzi (no root veg for Jain)', 'V'], ['Curd', 'D']], steps: ['Cook dal with turmeric and temper.', 'Make rotis.', 'Serve with sabzi and curd.'] },
  { id: 'chole', slot: 'l', name: 'Chole with 2 roti', diet: 'veg', jain: false, cuisines: ['N'], protein: 15, portion: '1 katori chole · 2 roti', allergens: ['gluten'], ing: [['Kabuli chana', 'P'], ['Atta', 'C'], ['Onion and tomato', 'V']], steps: ['Soak chana overnight and pressure cook.', 'Simmer in chole masala.', 'Serve with roti.'] },
  { id: 'rasam', slot: 'l', name: 'Rasam rice with paneer sukka', diet: 'veg', jain: false, cuisines: ['S'], protein: 18, portion: '1 katori rice · 1 katori rasam · ½ katori paneer', allergens: ['dairy'], staples: ['paneer'], ing: [['Toor dal', 'P'], ['Rice', 'C'], ['Paneer', 'D'], ['Tomato', 'V']], steps: ['Make rasam with tomato, tamarind and pepper.', 'Toss paneer cubes with curry leaves and pepper.', 'Serve with rice.'], sub: 'Swap paneer for firm tofu if you avoid dairy.' },
  { id: 'usal', slot: 'l', name: 'Usal with 2 bhakri', diet: 'veg', jain: false, cuisines: ['W'], protein: 15, portion: '1 katori usal · 2 bhakri', allergens: [], staples: ['sprouts'], ing: [['Matki sprouts', 'P'], ['Jowar flour', 'C'], ['Onion and coconut', 'V']], steps: ['Sprout matki over 2 days.', 'Cook with goda masala and coconut.', 'Serve with jowar bhakri.'] },
  { id: 'masoor', slot: 'l', name: 'Masoor dal, rice and shukto', diet: 'veg', jain: false, cuisines: ['E'], protein: 12, portion: '1 katori dal · 1 katori rice · 1 katori shukto', allergens: ['dairy'], ing: [['Masoor dal', 'P'], ['Rice', 'C'], ['Bitter gourd and mixed veg', 'V'], ['Milk', 'D']], steps: ['Cook masoor dal with panch phoron.', 'Make shukto with vegetables and a splash of milk.', 'Serve with rice.'] },
  { id: 'eggcurryrice', slot: 'l', name: 'Dal-bhaat with egg curry', diet: 'egg', jain: false, cuisines: ['E'], protein: 20, portion: '1 katori dal · 1 katori rice · 2 eggs', allergens: ['egg'], staples: ['eggs'], ing: [['Masoor dal', 'P'], ['Rice', 'C'], ['Eggs', 'E']], steps: ['Boil eggs and fry lightly.', 'Simmer in onion-tomato gravy.', 'Serve with dal and rice.'] },
  { id: 'soyapulao', slot: 'l', name: 'Soya chunk pulao with raita', diet: 'veg', jain: false, cuisines: ['N', 'S', 'E', 'W'], protein: 22, portion: '1½ katori pulao · 1 katori raita', allergens: ['soy', 'dairy'], staples: ['soya', 'curd'], ing: [['Soya chunks', 'P'], ['Rice', 'C'], ['Curd', 'D'], ['Peas and carrot', 'V']], steps: ['Soak soya chunks in hot water and squeeze.', 'Cook with rice, whole spices and vegetables.', 'Serve with raita.'], sub: 'Use paneer or boiled chana instead of soya if you prefer.' },
  { id: 'kadhi', slot: 'l', name: 'Kadhi chawal', diet: 'veg', jain: true, cuisines: ['N', 'W'], protein: 11, portion: '1 katori kadhi · 1 katori rice', allergens: ['dairy'], staples: ['curd'], ing: [['Besan', 'P'], ['Curd', 'D'], ['Rice', 'C']], steps: ['Whisk curd and besan.', 'Simmer slowly and temper.', 'Serve with rice.'], sub: 'Add a side of sprouts salad for about 7 g more protein.' },
  { id: 'lobia', slot: 'l', name: 'Lobia curry with jeera rice', diet: 'veg', jain: false, cuisines: ['N', 'W'], protein: 14, portion: '1 katori lobia · 1 katori rice', allergens: [], ing: [['Lobia (black-eyed beans)', 'P'], ['Rice', 'C'], ['Onion and tomato', 'V']], steps: ['Soak lobia for 4 hours and pressure cook.', 'Simmer in onion-tomato masala.', 'Serve with jeera rice.'] },

  // Snacks
  { id: 'sundal', slot: 's', name: 'Chana sundal', diet: 'veg', jain: false, cuisines: ['S'], protein: 8, portion: '1 katori', allergens: [], ing: [['Kala chana', 'P'], ['Coconut', 'V']], steps: ['Boil chana.', 'Temper with mustard seeds, curry leaves and coconut.'] },
  { id: 'roastchana', slot: 's', name: 'Roasted chana', diet: 'veg', jain: true, cuisines: ['N', 'S', 'E', 'W'], protein: 6, portion: '1 handful', allergens: [], ing: [['Roasted chana', 'P']], steps: ['Keep a jar handy. No cooking needed.'] },
  { id: 'chaas', slot: 's', name: 'Buttermilk and peanuts', diet: 'veg', jain: true, cuisines: ['N', 'S', 'E', 'W'], protein: 9, portion: '1 glass · 1 handful', allergens: ['dairy', 'peanut'], staples: ['curd'], ing: [['Curd', 'D'], ['Peanuts', 'X']], steps: ['Whisk curd with water, salt and jeera.', 'Have with roasted peanuts.'] },
  { id: 'sprouts', slot: 's', name: 'Sprouts chaat', diet: 'veg', jain: false, cuisines: ['N', 'W'], protein: 8, portion: '1 katori', allergens: [], staples: ['sprouts'], ing: [['Moong sprouts', 'P'], ['Onion and tomato', 'V']], steps: ['Steam sprouts for 3 minutes.', 'Toss with onion, tomato, lemon and chaat masala.'] },
  { id: 'eggs', slot: 's', name: 'Two boiled eggs', diet: 'egg', jain: false, cuisines: ['N', 'S', 'E', 'W'], protein: 12, portion: '2 eggs', allergens: ['egg'], staples: ['eggs'], ing: [['Eggs', 'E']], steps: ['Boil for 9 minutes, cool and peel.'] },
  { id: 'curdfruit', slot: 's', name: 'Curd with fruit', diet: 'veg', jain: true, cuisines: ['N', 'S', 'E', 'W'], protein: 6, portion: '1 katori', allergens: ['dairy'], staples: ['curd'], ing: [['Curd', 'D'], ['Seasonal fruit', 'V']], steps: ['Top curd with chopped fruit.'] },
  { id: 'jhalmuri', slot: 's', name: 'Jhal muri with chana', diet: 'veg', jain: false, cuisines: ['E'], protein: 6, portion: '1 katori', allergens: ['peanut'], ing: [['Muri (puffed rice)', 'C'], ['Boiled chana', 'P'], ['Peanuts', 'X']], steps: ['Toss muri with chana, onion, mustard oil and spices.'] },
  { id: 'tikka', slot: 's', name: 'Paneer tikka', diet: 'veg', jain: true, cuisines: ['N'], protein: 12, portion: '4 pieces', allergens: ['dairy'], staples: ['paneer', 'curd'], ing: [['Paneer', 'D'], ['Curd', 'D'], ['Capsicum', 'V']], steps: ['Marinate paneer in curd and spices.', 'Grill on a tawa.'] },

  // Dinner
  { id: 'paneerbhurji', slot: 'd', name: 'Paneer bhurji with 2 roti', diet: 'veg', jain: false, cuisines: ['N', 'W'], protein: 22, portion: '1 katori bhurji · 2 roti', allergens: ['dairy', 'gluten'], staples: ['paneer'], ing: [['Paneer', 'D'], ['Atta', 'C'], ['Onion and tomato', 'V']], steps: ['Sauté onion, tomato and spices.', 'Crumble in paneer and cook for 3 minutes.', 'Serve with roti.'], sub: 'Swap paneer for firm tofu if you avoid dairy.' },
  { id: 'adai', slot: 'd', name: 'Adai with avial', diet: 'veg', jain: false, cuisines: ['S'], protein: 16, portion: '2 adai · 1 katori avial', allergens: ['dairy'], staples: ['curd'], ing: [['Mixed dals', 'P'], ['Rice', 'C'], ['Mixed veg', 'V'], ['Curd', 'D']], steps: ['Soak rice and dals for 3 hours, grind coarse.', 'Cook thick adais on a tawa.', 'Serve with avial.'] },
  { id: 'khichdi', slot: 'd', name: 'Moong dal khichdi with curd', diet: 'veg', jain: true, cuisines: ['N', 'S', 'E', 'W'], protein: 15, portion: '1½ katori khichdi · 1 katori curd', allergens: ['dairy'], staples: ['curd'], ing: [['Yellow moong dal', 'P'], ['Rice', 'C'], ['Curd', 'D']], steps: ['Pressure cook rice and dal with turmeric.', 'Temper with ghee and jeera.', 'Serve with curd.'] },
  { id: 'palak', slot: 'd', name: 'Palak paneer with 2 roti', diet: 'veg', jain: true, cuisines: ['N'], protein: 20, portion: '1 katori palak paneer · 2 roti', allergens: ['dairy', 'gluten'], staples: ['paneer'], ing: [['Spinach', 'V'], ['Paneer', 'D'], ['Atta', 'C']], steps: ['Blanch and blend spinach.', 'Simmer with spices and paneer. Leave out onion and garlic for Jain.', 'Serve with roti.'] },
  { id: 'eggcurry', slot: 'd', name: 'Egg curry with 2 roti', diet: 'egg', jain: false, cuisines: ['N', 'E', 'W'], protein: 19, portion: '2 eggs in gravy · 2 roti', allergens: ['egg', 'gluten'], staples: ['eggs'], ing: [['Eggs', 'E'], ['Atta', 'C'], ['Onion and tomato', 'V']], steps: ['Boil eggs.', 'Simmer in onion-tomato gravy.', 'Serve with roti.'] },
  { id: 'soyabhurji', slot: 'd', name: 'Soya bhurji with 2 roti', diet: 'veg', jain: false, cuisines: ['N', 'S', 'E', 'W'], protein: 20, portion: '1 katori bhurji · 2 roti', allergens: ['soy', 'gluten'], staples: ['soya'], ing: [['Soya granules', 'P'], ['Atta', 'C'], ['Onion and capsicum', 'V']], steps: ['Soak soya granules and squeeze.', 'Cook like bhurji with masala.', 'Serve with roti.'] },
  { id: 'tofubhurji', slot: 'd', name: 'Tofu bhurji with 2 jowar roti', diet: 'veg', jain: false, cuisines: ['N', 'S', 'E', 'W'], protein: 19, portion: '1 katori bhurji · 2 jowar roti', allergens: ['soy'], staples: ['tofu'], ing: [['Firm tofu', 'P'], ['Jowar flour', 'C'], ['Onion and tomato', 'V']], steps: ['Crumble tofu.', 'Cook in onion-tomato masala with turmeric.', 'Serve with jowar roti.'] },
  { id: 'dalia', slot: 'd', name: 'Vegetable dalia with dal', diet: 'veg', jain: false, cuisines: ['N', 'W'], protein: 13, portion: '1½ katori dalia · 1 katori dal', allergens: ['gluten'], ing: [['Broken wheat', 'C'], ['Moong dal', 'P'], ['Mixed veg', 'V']], steps: ['Roast dalia.', 'Pressure cook with vegetables.', 'Serve with dal.'] },
  { id: 'mudde', slot: 'd', name: 'Ragi mudde with bassaru', diet: 'veg', jain: false, cuisines: ['S'], protein: 12, portion: '1 mudde · 1 katori bassaru', allergens: [], ing: [['Ragi flour', 'C'], ['Toor dal', 'P'], ['Greens', 'V']], steps: ['Cook ragi flour into a firm ball.', 'Make bassaru from dal and greens.', 'Serve together.'] },
  { id: 'cholar', slot: 'd', name: 'Cholar dal with 2 roti', diet: 'veg', jain: true, cuisines: ['E'], protein: 14, portion: '1 katori dal · 2 roti', allergens: ['gluten'], ing: [['Chana dal', 'P'], ['Atta', 'C'], ['Coconut', 'V']], steps: ['Cook chana dal with coconut and whole spices.', 'Serve with roti.'] },
  { id: 'pithla', slot: 'd', name: 'Pithla bhakri', diet: 'veg', jain: false, cuisines: ['W'], protein: 13, portion: '1 katori pithla · 2 bhakri', allergens: [], ing: [['Besan', 'P'], ['Jowar flour', 'C'], ['Onion', 'V']], steps: ['Cook besan into a thick pithla with garlic and chilli.', 'Serve with bhakri.'] },
];

export const DISHES: Dish[] = rows.map(({ ing, staples, sub, ...rest }) => ({
  ...rest,
  staples: staples ?? [],
  substitution: sub,
  ingredients: ing.map(([name, group]) => ({ name, group })),
}));

export const DISH_BY_ID: Record<string, Dish> = Object.fromEntries(DISHES.map((d) => [d.id, d]));

export const QUICK_FOODS: QuickFood[] = [
  { id: 'dal', name: 'Dal', unit: '1 katori', protein: 7, diet: 'veg', allergens: [] },
  { id: 'curd', name: 'Curd', unit: '1 katori', protein: 6, diet: 'veg', allergens: ['dairy'] },
  { id: 'roti', name: 'Roti', unit: '1 roti', protein: 3, diet: 'veg', allergens: ['gluten'] },
  { id: 'rice', name: 'Rice', unit: '1 katori', protein: 3, diet: 'veg', allergens: [] },
  { id: 'paneer', name: 'Paneer', unit: '½ katori', protein: 9, diet: 'veg', allergens: ['dairy'] },
  { id: 'sprouts', name: 'Sprouts', unit: '1 katori', protein: 7, diet: 'veg', allergens: [] },
  { id: 'milk', name: 'Milk', unit: '1 glass', protein: 7, diet: 'veg', allergens: ['dairy'] },
  { id: 'sambar', name: 'Sambar', unit: '1 katori', protein: 5, diet: 'veg', allergens: [] },
  { id: 'soya', name: 'Soya chunks', unit: '1 katori', protein: 13, diet: 'veg', allergens: ['soy'] },
  { id: 'chana', name: 'Roasted chana', unit: '1 handful', protein: 6, diet: 'veg', allergens: [] },
  { id: 'chaas', name: 'Buttermilk', unit: '1 glass', protein: 3, diet: 'veg', allergens: ['dairy'] },
  { id: 'tofu', name: 'Tofu', unit: '½ katori', protein: 9, diet: 'veg', allergens: ['soy'] },
  { id: 'egg', name: 'Egg', unit: '1 egg', protein: 6, diet: 'egg', allergens: ['egg'] },
];
