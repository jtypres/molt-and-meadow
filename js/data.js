// Add ?fast to the URL to run every timer 60x faster while testing.
export const SPEED = new URLSearchParams(location.search).has('fast') ? 60 : 1;

// All durations are in game seconds; rates are per game hour.
export const TIMING = {
  freeJarSec: 6 * 3600,
  offlineCapSec: 12 * 3600,
  humDecayPerHour: 4,
  hungerPerHour: 3,
  waterPerHour: 2.8,
  dirtPerHour: 0.7,
  feedsToMolt: 3,
  premoltSec: 2 * 3600,
  moltingSec: 30 * 60,
  postmoltSec: 3600,
  leftoverWarnSec: 6 * 3600,
  colonyGrowSec: 8 * 3600,
  morphChance: 0.2,
  pityAfter: 7,
  jarCost: 40,
  jarCap: 5,
  visitorBonus: 0.03,
  happyBonus: 0.10,
  okayBonus: 0.04,
};

export const SETS = {
  desert: { id: 'desert', name: 'Desert & Scrub', short: 'Desert', tint: '#e3c58e' },
  meadow: { id: 'meadow', name: 'Wildflower Meadow', short: 'Meadow', tint: '#a9d48c' },
  litter: { id: 'litter', name: 'Leaf Litter & Logs', short: 'Leaf Litter', tint: '#c9a97a' },
  night: { id: 'night', name: 'Night Forest', short: 'Night Forest', tint: '#a99bd6' },
};

export const RARITY = {
  common: { label: 'Common', color: '#a9b2c4', text: '#4f5866', weight: 55, silk: 6 },
  uncommon: { label: 'Uncommon', color: '#6fd08c', text: '#24753e', weight: 27, silk: 12 },
  rare: { label: 'Rare', color: '#5aa9ff', text: '#1f5fbf', weight: 12, silk: 30 },
  epic: { label: 'Epic', color: '#c18cff', text: '#6d3fb8', weight: 5, silk: 70 },
  legendary: { label: 'Legendary', color: '#ffc861', text: '#8a5d00', weight: 1, silk: 120 },
};

export const DECOR = {
  deep: { name: 'Deep substrate', cost: 40, desc: 'Room to dig and burrow' },
  hide: { name: 'Cork bark hide', cost: 60, desc: 'A dark place to retreat to' },
  water: { name: 'Water dish', cost: 30, desc: 'Fresh water, and a little more humidity' },
  branch: { name: 'Climbing twig', cost: 50, desc: 'Height for climbing and anchoring webs' },
  plants: { name: 'Live plants', cost: 80, desc: 'Cover to explore, and a little more humidity' },
};

// Enclosure sizes, smallest first.
export const TIERS = [
  { id: 'cup', name: 'Deli cup', cost: 0 },
  { id: 'small', name: 'Small enclosure', cost: 60 },
  { id: 'medium', name: 'Medium enclosure', cost: 160 },
  { id: 'large', name: 'Large enclosure', cost: 400 },
];
export const COLONY_CAP = [10, 25, 60, 150];

// Live prey, smallest first. `size` is compared with what a predator can handle.
export const PREY = [
  { id: 'flies', name: 'Fruit flies', size: 1, cost: 2 },
  { id: 'pinheads', name: 'Pinhead crickets', size: 2, cost: 3 },
  { id: 'crickets', name: 'Crickets', size: 3, cost: 5 },
  { id: 'dubia', name: 'Dubia roaches', size: 4, cost: 8 },
];

export const FOODS = {
  greens: 'some fresh leaves',
  veg: 'veggies and leaf litter',
  fruit: 'a cup of beetle jelly',
};

const SPIDER = ['Spiderling', 'Juvenile', 'Adult'];

// stageMolts: the molt count where each stage begins; the last one is the final molt.
export const SPECIES = [
  // ---------- Desert & Scrub ----------
  {
    id: 'pinacate', set: 'desert', rarity: 'common', art: 'pinacate', group: 'beetle',
    name: 'Pinacate beetle', short: 'pinacate beetle', sci: 'Eleodes obscura',
    keep: true, molts: false, stages: ['Adult'], humidity: [25, 45], likes: ['deep', 'hide'], diet: 'veg',
    adultTier: 2, size: 3, sizeLabel: 'long', burrower: true,
    fact: 'When threatened it does a headstand, pointing its rear end up, and can release a bad-smelling spray.',
    tip: 'Tip: darkling beetles like it dry, with something to dig into and hide under.',
  },
  {
    id: 'painted-grasshopper', set: 'desert', rarity: 'common', art: 'grasshopper', group: 'grasshopper',
    name: 'Painted grasshopper', short: 'painted grasshopper', sci: 'Dactylotum bicolor',
    keep: true, molts: true, stages: ['Nymph', 'Late nymph', 'Adult'], stageMolts: [0, 2, 5],
    humidity: [30, 50], likes: ['branch', 'plants'], diet: 'greens',
    adultTier: 2, size: 4, sizeLabel: 'long',
    fact: 'Its bold colors are thought to warn birds that it tastes bad. Nymphs molt five times before they are adults.',
    tip: 'Tip: grasshoppers like to climb and bask, so give it twigs and plants.',
  },
  {
    id: 'hairy-scorpion', set: 'desert', rarity: 'uncommon', art: 'scorpion', group: 'scorpion',
    name: 'Desert hairy scorpion', short: 'hairy scorpion', sci: 'Hadrurus arizonensis',
    keep: true, molts: true, stages: ['Scorpling', 'Juvenile', 'Adult'], stageMolts: [0, 2, 6],
    humidity: [20, 40], likes: ['deep', 'hide'], diet: 'prey',
    adultTier: 3, size: 14, sizeLabel: 'long', burrower: true,
    fact: 'The largest scorpion in North America, reaching about 14 cm (5.5 in) long. Like all scorpions, it glows under UV light.',
    tip: 'Tip: desert scorpions need it dry, and they love to burrow.',
  },
  {
    id: 'red-knee', set: 'desert', rarity: 'uncommon', art: 'redKnee', group: 'tarantula',
    name: 'Mexican red-knee tarantula', short: 'red-knee', sci: 'Brachypelma hamorii',
    keep: true, molts: true, stages: SPIDER, stageMolts: [0, 3, 8],
    humidity: [55, 70], likes: ['deep', 'hide', 'water'], diet: 'prey',
    adultTier: 3, size: 14, sizeLabel: 'leg span', burrower: true, webber: 0.3, sexByMolt: 4,
    female: 'Female red-knees can live 25 years or more.',
    male: 'Male red-knees mature faster and usually live well under 10 years.',
    fact: 'Flicks itchy hairs off its abdomen when it feels threatened.',
    tip: 'Tip: red-knees often fast before a molt. Keep the water dish fresh.',
  },
  {
    id: 'gbb', set: 'desert', rarity: 'rare', art: 'gbb', group: 'tarantula',
    name: 'Greenbottle blue tarantula', short: 'greenbottle blue', sci: 'Chromatopelma cyaneopubescens',
    keep: true, molts: true, stages: SPIDER, stageMolts: [0, 3, 8],
    humidity: [50, 65], likes: ['branch', 'plants', 'water'], diet: 'prey',
    adultTier: 3, size: 13, sizeLabel: 'leg span', webber: 1, sexByMolt: 4,
    female: 'Female greenbottle blues can live 12 years or more.',
    male: 'Male greenbottle blues usually live just a few years.',
    fact: 'A heavy webber that can fill its whole enclosure with silk. Spiderlings are orange and striped, and turn blue as they grow.',
    tip: 'Tip: greenbottle blues like it on the dry side, with lots of clutter to web between.',
  },
  {
    id: 'bdfb', set: 'desert', rarity: 'epic', art: 'bdfb', group: 'beetle',
    name: 'Blue death-feigning beetle', short: 'death-feigning beetle', sci: 'Asbolus verrucosus',
    keep: true, molts: false, stages: ['Adult'], humidity: [20, 40], likes: ['deep', 'hide'], diet: 'veg',
    adultTier: 2, size: 2.5, sizeLabel: 'long', burrower: true,
    fact: 'Plays dead when touched. Its waxy coat looks powder blue when dry and darkens in damp air.',
    tip: 'Tip: keep it bone dry. If its coat turns dark, it is too damp.',
  },

  // ---------- Wildflower Meadow ----------
  {
    id: 'honey-bee', set: 'meadow', rarity: 'common', art: 'bee',
    name: 'Western honey bee', short: 'honey bee', sci: 'Apis mellifera', keep: false, stages: ['Adult'],
    fact: 'Workers carry pollen home in baskets on their back legs.',
    morphs: [{ id: 'drone', name: 'Drone', note: 'Males have huge eyes that meet at the top of the head.' }],
  },
  {
    id: 'ladybird', set: 'meadow', rarity: 'common', art: 'ladybird',
    name: 'Seven-spot ladybird', short: 'ladybird', sci: 'Coccinella septempunctata', keep: false, stages: ['Adult'],
    fact: 'Ladybirds and their larvae eat aphids, thousands of them in a lifetime.',
  },
  {
    id: 'garden-spider', set: 'meadow', rarity: 'uncommon', art: 'argiope', group: 'spider',
    name: 'Yellow garden spider', short: 'garden spider', sci: 'Argiope aurantia',
    keep: true, molts: true, stages: SPIDER, stageMolts: [0, 3, 6],
    humidity: [50, 70], likes: ['branch', 'plants'], diet: 'prey',
    adultTier: 2, size: 6, sizeLabel: 'leg span', webber: 0.8,
    fact: 'Weaves a thick zigzag of silk, called a stabilimentum, into the middle of its web.',
    tip: 'Tip: orb weavers need height to hang a web.',
  },
  {
    id: 'monarch', set: 'meadow', rarity: 'uncommon', art: 'monarch',
    name: 'Monarch butterfly', short: 'monarch', sci: 'Danaus plexippus', keep: false, stages: ['Adult'],
    fact: 'Eastern monarchs migrate thousands of kilometers to spend the winter in Mexico.',
    morphs: [{ id: 'male', name: 'Male', note: 'Males have thinner veins and a black scent spot on each hindwing.' }],
  },
  {
    id: 'crab-spider', set: 'meadow', rarity: 'rare', art: 'crab', group: 'spider',
    name: 'Goldenrod crab spider', short: 'crab spider', sci: 'Misumena vatia',
    keep: true, molts: true, stages: SPIDER, stageMolts: [0, 3, 6],
    humidity: [50, 70], likes: ['plants', 'branch'], diet: 'prey',
    adultTier: 1, size: 2.5, sizeLabel: 'leg span',
    fact: 'Waits on flowers to ambush pollinators, and can shift between white and yellow over several days.',
    tip: 'Tip: give it flowers and leaves to perch on.',
    morphs: [{ id: 'yellow', name: 'Yellow', note: 'Turned yellow to match goldenrod flowers.' }],
  },
  {
    id: 'peacock-spider', set: 'meadow', rarity: 'legendary', art: 'peacock', group: 'jumper',
    name: 'Peacock spider', short: 'peacock spider', sci: 'Maratus volans',
    keep: true, molts: true, stages: SPIDER, stageMolts: [0, 3, 6],
    humidity: [50, 70], likes: ['plants', 'branch'], diet: 'prey',
    adultTier: 1, size: 1, sizeLabel: 'leg span',
    fact: 'Only about 5 mm long. Males raise a colorful flap and wave their legs to dance for females.',
    tip: 'Tip: tiny jumpers love plants to explore and hunt on.',
    morphs: [{ id: 'female', name: 'Female', note: 'Females are mottled brown, without the colorful flap.' }],
  },

  // ---------- Leaf Litter & Logs ----------
  {
    id: 'pill-bug', set: 'litter', rarity: 'common', art: 'pillbug', group: 'isopod',
    name: 'Common pill bug', short: 'pill bug', sci: 'Armadillidium vulgare',
    keep: true, colony: true, molts: false, stages: ['Colony'], humidity: [60, 85], likes: ['deep', 'hide', 'plants'], diet: 'veg',
    adultTier: 1, size: 1.5, sizeLabel: 'long', trade: 15,
    fact: 'Rolls into a tight ball when disturbed. Isopods are crustaceans, more closely related to shrimp than to insects.',
    tip: 'Tip: isopods need it damp, with leaf litter and bark to hide under.',
  },
  {
    id: 'millipede', set: 'litter', rarity: 'common', art: 'millipede', group: 'millipede',
    name: 'American giant millipede', short: 'giant millipede', sci: 'Narceus americanus',
    keep: true, molts: false, stages: ['Adult'], humidity: [65, 85], likes: ['deep', 'hide'], diet: 'veg',
    adultTier: 2, size: 10, sizeLabel: 'long', burrower: true,
    fact: 'Despite the name, it has far fewer than a thousand legs. It curls into a spiral to protect its soft underside.',
    tip: 'Tip: millipedes love deep, damp substrate and rotting wood.',
  },
  {
    id: 'dairy-cow', set: 'litter', rarity: 'uncommon', art: 'dairycow', group: 'isopod',
    name: 'Dairy cow isopod', short: 'dairy cow isopod', sci: 'Porcellio laevis "Dairy Cow"',
    keep: true, colony: true, molts: false, stages: ['Colony'], humidity: [55, 80], likes: ['deep', 'hide'], diet: 'veg',
    adultTier: 1, size: 2, sizeLabel: 'long', trade: 25,
    fact: 'A fast-growing color form with black-and-white patches, like a tiny cow.',
    tip: 'Tip: give them bark to hide under and keep one side of the tank damp.',
  },
  {
    id: 'harvestman', set: 'litter', rarity: 'uncommon', art: 'harvestman',
    name: 'Eastern harvestman', short: 'harvestman', sci: 'Leiobunum vittatum', keep: false, stages: ['Adult'],
    fact: 'Often called a daddy longlegs. It has one round body and no silk or venom, so it isn\'t a spider.',
  },
  {
    id: 'rainbow-stag', set: 'litter', rarity: 'rare', art: 'stag', group: 'beetle',
    name: 'Rainbow stag beetle', short: 'rainbow stag', sci: 'Phalacrognathus muelleri',
    keep: true, molts: false, stages: ['Adult'], humidity: [60, 80], likes: ['deep', 'hide', 'branch'], diet: 'fruit',
    adultTier: 2, size: 6, sizeLabel: 'long',
    fact: 'One of the shiniest beetles on Earth. Its larvae spend a year or more eating rotting wood before they become adults.',
    tip: 'Tip: stag beetles like a damp log to climb on and a cup of beetle jelly.',
    morphs: [
      { id: 'gold', name: 'Gold', note: 'Some rainbow stags shine gold instead of green.' },
      { id: 'blue', name: 'Blue', note: 'A rare blue form, prized by keepers.' },
    ],
  },
  {
    id: 'rubber-ducky', set: 'litter', rarity: 'legendary', art: 'ducky', group: 'isopod',
    name: 'Rubber ducky isopod', short: 'rubber ducky isopod', sci: 'Cubaris sp. "Rubber Ducky"',
    keep: true, colony: true, molts: false, stages: ['Colony'], humidity: [70, 90], likes: ['deep', 'hide', 'plants'], diet: 'veg',
    adultTier: 1, size: 1.2, sizeLabel: 'long', trade: 60,
    fact: 'Found in caves in Thailand. Its pale head looks like a little duck, and colonies grow slowly.',
    tip: 'Tip: rubber duckies need high humidity and lots of moss.',
  },

  // ---------- Night Forest ----------
  {
    id: 'woodlouse-spider', set: 'night', rarity: 'common', art: 'woodlouse', group: 'spider',
    name: 'Woodlouse spider', short: 'woodlouse spider', sci: 'Dysdera crocata',
    keep: true, molts: true, stages: SPIDER, stageMolts: [0, 3, 6],
    humidity: [55, 75], likes: ['hide', 'deep'], diet: 'prey',
    adultTier: 1, size: 3, sizeLabel: 'leg span', burrower: true,
    fact: 'Uses huge fangs to pierce the armor of woodlice, its favorite food. It hides in a silk retreat by day.',
    tip: 'Tip: woodlouse spiders like a damp hide to tuck into during the day.',
  },
  {
    id: 'earwig', set: 'night', rarity: 'common', art: 'earwig',
    name: 'Common earwig', short: 'earwig', sci: 'Forficula auricularia', keep: false, stages: ['Adult'],
    fact: 'Mother earwigs guard their eggs and clean them until they hatch. The pincers are for defense, not ears.',
  },
  {
    id: 'bold-jumper', set: 'night', rarity: 'uncommon', art: 'bold', group: 'jumper',
    name: 'Bold jumping spider', short: 'bold jumper', sci: 'Phidippus audax',
    keep: true, molts: true, stages: SPIDER, stageMolts: [0, 3, 7],
    humidity: [45, 65], likes: ['branch', 'plants'], diet: 'prey',
    adultTier: 1, size: 3, sizeLabel: 'leg span',
    fact: 'Jumping spiders have some of the best eyesight of any invertebrate, and they turn to watch you.',
    tip: 'Tip: jumpers like to climb, and they build their silk hammock near the top.',
  },
  {
    id: 'rosy-maple', set: 'night', rarity: 'uncommon', art: 'rosy',
    name: 'Rosy maple moth', short: 'rosy maple moth', sci: 'Dryocampa rubicunda', keep: false, stages: ['Adult'],
    fact: 'Adults have no working mouthparts and don\'t eat. They live for about a week.',
  },
  {
    id: 'regal-jumper', set: 'night', rarity: 'rare', art: 'regal', group: 'jumper',
    name: 'Regal jumping spider', short: 'regal jumper', sci: 'Phidippus regius',
    keep: true, molts: true, stages: SPIDER, stageMolts: [0, 3, 7],
    humidity: [45, 65], likes: ['branch', 'plants'], diet: 'prey',
    adultTier: 1, size: 4, sizeLabel: 'leg span',
    fact: 'The largest jumping spider in North America, with shiny green fangs.',
    tip: 'Tip: regals are curious, and they love a tall enclosure to explore.',
    morphs: [
      { id: 'orange', name: 'Orange female', note: 'Females are often bright orange with white spots.' },
      { id: 'grey', name: 'Grey female', note: 'Some females are grey instead of orange.' },
    ],
  },
  {
    id: 'hercules', set: 'night', rarity: 'epic', art: 'hercules', group: 'beetle',
    name: 'Eastern Hercules beetle', short: 'Hercules beetle', sci: 'Dynastes tityus',
    keep: true, molts: false, stages: ['Adult'], humidity: [55, 75], likes: ['deep', 'branch'], diet: 'fruit',
    adultTier: 3, size: 6, sizeLabel: 'long', burrower: true,
    fact: 'Males use their horns to wrestle. Like the death-feigning beetle, its olive wing cases darken in damp air.',
    tip: 'Tip: give it deep, damp substrate and something sturdy to climb.',
  },
];

export const BY_ID = Object.fromEntries(SPECIES.map((s) => [s.id, s]));

export const PLOTS = [
  { id: 'wildflowers', name: 'Wildflower bed', clear: 0, restoreSec: 0, rate: 1, jar: 'meadow', jarEverySec: 2 * 3600 },
  { id: 'sandbank', name: 'Sandy bank', clear: 25, restoreSec: 60, rate: 2, jar: 'desert', jarEverySec: 2.5 * 3600 },
  { id: 'beehotel', name: 'Bee hotel', clear: 200, restoreSec: 5 * 60, rate: 5 },
  { id: 'logpile', name: 'Log pile', clear: 900, restoreSec: 20 * 60, rate: 12, jar: 'litter', jarEverySec: 3 * 3600 },
  { id: 'woodland', name: 'Woodland edge', clear: 2500, restoreSec: 45 * 60, rate: 20, jar: 'night', jarEverySec: 3 * 3600 },
  { id: 'pond', name: 'Pond', clear: 6000, restoreSec: 90 * 60, rate: 35 },
  { id: 'rockery', name: 'Rock garden', clear: 15000, restoreSec: 3 * 3600, rate: 70, jar: 'desert', jarEverySec: 4 * 3600 },
];

export const PET_NAMES = ['Biscuit', 'Clover', 'Pepper', 'Juniper', 'Maple', 'Pebble', 'Sprout', 'Hazel', 'Fig', 'Mochi', 'Nutmeg', 'Willow', 'Bean', 'Toffee', 'Sage', 'Poppy', 'Acorn', 'Dot', 'Marigold', 'Basil'];

export const UPDATE_ID = 2;
