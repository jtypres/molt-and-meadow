// Add ?fast to the URL to run every timer 60x faster while testing.
export const SPEED = new URLSearchParams(location.search).has('fast') ? 60 : 1;

// All durations are in game seconds.
export const TIMING = {
  freeJarSec: 4 * 3600,
  offlineCapSec: 12 * 3600,
  humDecayPerHour: 4,
  hungerPerHour: 3,
  feedsToMolt: 3,
  premoltSec: 2 * 3600,
  postmoltSec: 3600,
  morphChance: 0.2,
  jarCost: 30,
  jarCap: 10,
  visitorBonus: 0.03,
  happyBonus: 0.10,
  okayBonus: 0.04,
};

export const SETS = {
  desert: { id: 'desert', name: 'Desert & Scrub', short: 'Desert', tint: '#e3c58e' },
  meadow: { id: 'meadow', name: 'Wildflower Meadow', short: 'Meadow', tint: '#a9d48c' },
};

export const RARITY = {
  common: { label: 'Common', color: '#a9b2c4', text: '#4f5866', weight: 55, silk: 5 },
  uncommon: { label: 'Uncommon', color: '#6fd08c', text: '#24753e', weight: 27, silk: 10 },
  rare: { label: 'Rare', color: '#5aa9ff', text: '#1f5fbf', weight: 12, silk: 25 },
  epic: { label: 'Epic', color: '#c18cff', text: '#6d3fb8', weight: 5, silk: 60 },
  legendary: { label: 'Legendary', color: '#ffc861', text: '#8a5d00', weight: 1, silk: 100 },
};

export const DECOR = {
  deep: { name: 'Deep substrate', cost: 40, desc: 'Room to dig and burrow' },
  hide: { name: 'Cork bark hide', cost: 60, desc: 'A dark place to retreat to' },
  water: { name: 'Water dish', cost: 30, desc: 'Fresh water, and a little more humidity' },
  branch: { name: 'Climbing twig', cost: 50, desc: 'Height for climbing and anchoring webs' },
  plants: { name: 'Live plants', cost: 80, desc: 'Cover to explore, and a little more humidity' },
};

const SPIDER_STAGES = ['Spiderling', 'Juvenile', 'Adult'];

export const SPECIES = [
  // Desert & Scrub
  {
    id: 'pinacate', set: 'desert', rarity: 'common', art: 'pinacate',
    name: 'Pinacate beetle', short: 'pinacate beetle', sci: 'Eleodes obscura',
    keep: true, molts: false, stages: ['Adult'], humidity: [25, 45], likes: ['deep', 'hide'],
    food: 'a slice of carrot',
    fact: 'When threatened it does a headstand, pointing its rear end up, and can release a bad-smelling spray.',
    tip: 'Tip: darkling beetles like it dry, with something to dig into and hide under.',
  },
  {
    id: 'painted-grasshopper', set: 'desert', rarity: 'common', art: 'grasshopper',
    name: 'Painted grasshopper', short: 'painted grasshopper', sci: 'Dactylotum bicolor',
    keep: true, molts: true, stages: ['Nymph', 'Late nymph', 'Adult'], humidity: [30, 50], likes: ['branch', 'plants'],
    food: 'some fresh leaves',
    fact: 'Its bold colors are thought to warn birds that it tastes bad.',
    tip: 'Tip: grasshoppers like to climb and bask, so give it twigs and plants.',
  },
  {
    id: 'hairy-scorpion', set: 'desert', rarity: 'uncommon', art: 'scorpion',
    name: 'Desert hairy scorpion', short: 'hairy scorpion', sci: 'Hadrurus arizonensis',
    keep: true, molts: true, stages: ['Scorpling', 'Juvenile', 'Adult'], humidity: [20, 40], likes: ['deep', 'hide'],
    food: 'a cricket',
    fact: 'The largest scorpion in North America, reaching about 14 cm (5.5 in) long.',
    tip: 'Tip: desert scorpions need it dry, and they love to burrow.',
  },
  {
    id: 'red-knee', set: 'desert', rarity: 'uncommon', art: 'redKnee',
    name: 'Mexican red-knee tarantula', short: 'red-knee', sci: 'Brachypelma hamorii',
    keep: true, molts: true, stages: SPIDER_STAGES, humidity: [55, 70], likes: ['deep', 'hide', 'water'],
    food: 'a cricket',
    fact: 'Flicks itchy hairs off its abdomen when it feels threatened.',
    tip: 'Tip: red-knees often fast before a molt. Keep the water dish fresh.',
  },
  {
    id: 'gbb', set: 'desert', rarity: 'rare', art: 'gbb',
    name: 'Greenbottle blue tarantula', short: 'greenbottle blue', sci: 'Chromatopelma cyaneopubescens',
    keep: true, molts: true, stages: SPIDER_STAGES, humidity: [50, 65], likes: ['branch', 'plants', 'water'],
    food: 'a cricket',
    fact: 'A heavy webber that can fill its whole enclosure with silk. Spiderlings are orange and striped, and turn blue as they grow.',
    tip: 'Tip: greenbottle blues like it on the dry side, with lots of clutter to web between.',
  },
  {
    id: 'bdfb', set: 'desert', rarity: 'epic', art: 'bdfb',
    name: 'Blue death-feigning beetle', short: 'death-feigning beetle', sci: 'Asbolus verrucosus',
    keep: true, molts: false, stages: ['Adult'], humidity: [20, 40], likes: ['deep', 'hide'],
    food: 'some vegetables and a fish flake',
    fact: 'Plays dead when touched. Its waxy coat looks powder blue when dry and darkens in damp air.',
    tip: 'Tip: keep it bone dry. If its coat turns dark, it is too damp.',
  },

  // Wildflower Meadow
  {
    id: 'honey-bee', set: 'meadow', rarity: 'common', art: 'bee',
    name: 'Western honey bee', short: 'honey bee', sci: 'Apis mellifera',
    keep: false, stages: ['Adult'],
    fact: 'Workers carry pollen home in baskets on their back legs.',
    morphs: [{ id: 'drone', name: 'Drone', note: 'Males have huge eyes that meet at the top of the head.' }],
  },
  {
    id: 'ladybird', set: 'meadow', rarity: 'common', art: 'ladybird',
    name: 'Seven-spot ladybird', short: 'ladybird', sci: 'Coccinella septempunctata',
    keep: false, stages: ['Adult'],
    fact: 'Ladybirds and their larvae eat aphids, thousands of them in a lifetime.',
  },
  {
    id: 'garden-spider', set: 'meadow', rarity: 'uncommon', art: 'argiope',
    name: 'Yellow garden spider', short: 'garden spider', sci: 'Argiope aurantia',
    keep: true, molts: true, stages: SPIDER_STAGES, humidity: [50, 70], likes: ['branch', 'plants'],
    food: 'a small fly',
    fact: 'Weaves a thick zigzag of silk, called a stabilimentum, into the middle of its web.',
    tip: 'Tip: orb weavers need height to hang a web.',
  },
  {
    id: 'monarch', set: 'meadow', rarity: 'uncommon', art: 'monarch',
    name: 'Monarch butterfly', short: 'monarch', sci: 'Danaus plexippus',
    keep: false, stages: ['Adult'],
    fact: 'Eastern monarchs migrate thousands of kilometers to spend the winter in Mexico.',
    morphs: [{ id: 'male', name: 'Male', note: 'Males have thinner veins and a black scent spot on each hindwing.' }],
  },
  {
    id: 'crab-spider', set: 'meadow', rarity: 'rare', art: 'crab',
    name: 'Goldenrod crab spider', short: 'crab spider', sci: 'Misumena vatia',
    keep: true, molts: true, stages: SPIDER_STAGES, humidity: [50, 70], likes: ['plants', 'branch'],
    food: 'a small fly',
    fact: 'Waits on flowers to ambush pollinators, and can shift between white and yellow over several days.',
    tip: 'Tip: give it flowers and leaves to perch on.',
    morphs: [{ id: 'yellow', name: 'Yellow', note: 'Turned yellow to match goldenrod flowers.' }],
  },
  {
    id: 'peacock-spider', set: 'meadow', rarity: 'legendary', art: 'peacock',
    name: 'Peacock spider', short: 'peacock spider', sci: 'Maratus volans',
    keep: true, molts: true, stages: SPIDER_STAGES, humidity: [50, 70], likes: ['plants', 'branch'],
    food: 'a fruit fly',
    fact: 'Only about 5 mm long. Males raise a colorful flap and wave their legs to dance for females.',
    tip: 'Tip: tiny jumpers love plants to explore and hunt on.',
    morphs: [{ id: 'female', name: 'Female', note: 'Females are mottled brown, without the colorful flap.' }],
  },
];

export const BY_ID = Object.fromEntries(SPECIES.map((s) => [s.id, s]));

export const PLOTS = [
  { id: 'wildflowers', name: 'Wildflower bed', clear: 0, restoreSec: 0, rate: 1, jar: 'meadow', jarEverySec: 30 * 60 },
  { id: 'sandbank', name: 'Sandy bank', clear: 25, restoreSec: 60, rate: 2, jar: 'desert', jarEverySec: 40 * 60 },
  { id: 'beehotel', name: 'Bee hotel', clear: 200, restoreSec: 5 * 60, rate: 5 },
  { id: 'logpile', name: 'Log pile', clear: 900, restoreSec: 20 * 60, rate: 12, jar: 'meadow', jarEverySec: 60 * 60 },
  { id: 'pond', name: 'Pond', clear: 4000, restoreSec: 60 * 60, rate: 30 },
  { id: 'rockery', name: 'Rock garden', clear: 15000, restoreSec: 3 * 3600, rate: 70, jar: 'desert', jarEverySec: 60 * 60 },
];

export const PET_NAMES = ['Biscuit', 'Clover', 'Pepper', 'Juniper', 'Maple', 'Pebble', 'Sprout', 'Hazel', 'Fig', 'Mochi', 'Nutmeg', 'Willow', 'Bean', 'Toffee', 'Sage', 'Poppy', 'Acorn', 'Dot', 'Marigold', 'Basil'];
