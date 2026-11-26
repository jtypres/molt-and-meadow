import {
  SPECIES, BY_ID, PLOTS, SETS, DECOR, RARITY, TIMING, SPEED, PET_NAMES, TIERS, PREY, FOODS, COLONY_CAP,
} from './data.js?v=202611252038';

const KEY = 'molt-meadow-v1';
export const MAX_LEVEL = 10;
const HOUR = 3.6e6;

// Game seconds -> real milliseconds.
export const dur = (sec) => (sec * 1000) / SPEED;
// Real milliseconds -> game hours.
const gameHours = (ms) => (ms / HOUR) * SPEED;

export let S = null;

// ---------- Creature helpers ----------

export function stageFor(sp, molts) {
  if (!sp.molts) return sp.stages.length - 1;
  let st = 0;
  sp.stageMolts.forEach((m, i) => { if (molts >= m) st = i; });
  return st;
}

export const maxMolts = (sp) => (sp.molts ? sp.stageMolts[sp.stageMolts.length - 1] : 0);

export function sizeOf(c) {
  const sp = BY_ID[c.speciesId];
  if (!sp.molts) return sp.size;
  return sp.size * (0.12 + 0.88 * Math.pow(c.molts / maxMolts(sp), 0.9));
}

export function needTier(c) {
  const sp = BY_ID[c.speciesId];
  if (!sp.molts) return sp.adultTier;
  const last = sp.stages.length - 1;
  if (c.stage === 0) return 0;
  if (c.stage === last) return sp.adultTier;
  return Math.min(1, sp.adultTier);
}

// The biggest prey size this creature can handle (matches PREY sizes 1-4).
export function idealPrey(c) {
  const s = sizeOf(c);
  if (s < 1.5) return 1;
  if (s < 3.5) return 2;
  if (s < 8) return 3;
  return 4;
}

function addLog(c, now, text) {
  c.log.unshift({ t: now, text });
  if (c.log.length > 30) c.log.length = 30;
}

function newCreature(id, speciesId, morph, now, name) {
  const sp = BY_ID[speciesId];
  const [lo, hi] = sp.humidity;
  const c = {
    id, speciesId, morph: morph || null,
    name: name || PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)],
    molts: 0, stage: 0,
    humidity: Math.round((lo + hi) / 2), humT: now,
    fullness: 70, fullT: now,
    feeds: 0, phase: 'normal', phaseEnds: 0,
    decor: [],
  };
  c.stage = stageFor(sp, 0);
  return upgradeCreature(c, now, true);
}

// Fills in fields added in the Keeper Update, for new pets and for pets from older saves.
function upgradeCreature(c, now, isNew = false) {
  const sp = BY_ID[c.speciesId];
  if (c.molts === undefined) {
    c.molts = sp.molts ? sp.stageMolts[Math.min(c.stage, sp.stageMolts.length - 1)] : 0;
  }
  c.stage = stageFor(sp, c.molts);
  if (c.tier === undefined) c.tier = needTier(c);
  if (c.water === undefined) { c.water = 100; c.waterT = now; }
  if (c.clean === undefined) { c.clean = 100; c.cleanT = now; }
  if (c.leftover === undefined) c.leftover = null;
  if (c.exuvia === undefined) c.exuvia = null;
  if (!c.album) c.album = [];
  if (c.sex === undefined) c.sex = sp.sexByMolt ? (Math.random() < 0.5 ? 'female' : 'male') : null;
  if (c.sexKnown === undefined) c.sexKnown = false;
  if (c.web === undefined) c.web = 0;
  if (c.burrow === undefined) c.burrow = 0;
  if (sp.colony && c.colony === undefined) { c.colony = 6; c.colonyProg = 0; }
  if (!c.log) {
    c.log = [];
    addLog(c, now, isNew ? `${c.name} moved into a ${TIERS[c.tier].name.toLowerCase()}.` : 'Care log started.');
  }
  return c;
}

// ---------- Save data ----------

function fresh(now) {
  const plots = {};
  PLOTS.forEach((p, i) => {
    plots[p.id] = { state: i === 0 ? 'restored' : 'overgrown', level: i === 0 ? 1 : 0, jarProg: 0, endsAt: 0 };
  });
  const pumpkin = newCreature(1, 'red-knee', null, now, 'Pumpkin');
  pumpkin.molts = 3;
  pumpkin.stage = stageFor(BY_ID['red-knee'], 3);
  pumpkin.tier = needTier(pumpkin);
  pumpkin.decor = ['water'];
  pumpkin.humidity = 62;
  pumpkin.log = [];
  addLog(pumpkin, now, 'Pumpkin arrived as a juvenile.');
  return {
    v: 2, lastSeen: now,
    pollen: 20, silk: 0,
    jars: { desert: 1, meadow: 1, litter: 0, night: 0 },
    pity: {},
    freeJarAt: now + dur(TIMING.freeJarSec),
    plots,
    creatures: [pumpkin], nextId: 2,
    journal: { 'red-knee': { count: 1, morphs: [] } },
    visitors: {},
    seenIntro: false,
    seenUpdate: 2,
    firstPlayed: now,
    lastBackup: 0,
    backupSnooze: 0,
    hideInstallTip: false,
  };
}

function migrate(data, now) {
  if (!data.firstPlayed) data.firstPlayed = now;
  if (data.lastBackup === undefined) data.lastBackup = 0;
  if (data.backupSnooze === undefined) data.backupSnooze = 0;
  if (data.hideInstallTip === undefined) data.hideInstallTip = false;
  if (!data.pity) data.pity = {};
  for (const set of Object.keys(SETS)) if (data.jars[set] === undefined) data.jars[set] = data.v < 2 ? 1 : 0;
  for (const p of PLOTS) if (!data.plots[p.id]) data.plots[p.id] = { state: 'overgrown', level: 0, jarProg: 0, endsAt: 0 };
  if (data.seenUpdate === undefined) data.seenUpdate = data.v < 2 ? 1 : 2;
  data.creatures.forEach((c) => upgradeCreature(c, now));
  data.v = 2;
  return data;
}

function isValidSave(data) {
  return !!data && (data.v === 1 || data.v === 2) && data.plots && Array.isArray(data.creatures) && data.journal && data.jars;
}

export function load(now) {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (isValidSave(data)) { S = migrate(data, now); return false; }
    }
  } catch (e) { /* storage blocked or corrupt: start fresh */ }
  S = fresh(now);
  return true;
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
}

export function resetGame(now) {
  S = fresh(now);
  save();
}

// ---------- Backup and restore ----------

const BACKUP_EVERY_MS = 7 * 24 * 3600 * 1000;

const toB64 = (str) => {
  let bin = '';
  new TextEncoder().encode(str).forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
};
const fromB64 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));

export function exportSave(now) {
  return JSON.stringify({ app: 'molt-and-meadow', version: 1, exportedAt: new Date(now).toISOString(), save: S });
}

export function exportCode(now) {
  return `MM1.${toB64(exportSave(now))}`;
}

export function markBackedUp(now) {
  S.lastBackup = now;
  S.backupSnooze = 0;
  save();
}

// Accepts either a backup file's text or a save code. Throws if it isn't a valid save.
export function importSave(text, now) {
  let t = String(text).trim();
  if (t.startsWith('MM1.')) t = fromB64(t.slice(4).replace(/\s+/g, ''));
  const obj = JSON.parse(t);
  const data = obj && obj.app === 'molt-and-meadow' ? obj.save : null;
  if (!isValidSave(data)) throw new Error('Not a Molt & Meadow save');
  migrate(data, now);
  data.lastSeen = now;
  data.seenIntro = true;
  data.lastBackup = now;
  S = data;
  save();
}

export function backupDue(now) {
  const progress = Object.keys(S.journal).length >= 2;
  const since = now - (S.lastBackup || S.firstPlayed);
  return progress && since > BACKUP_EVERY_MS && now > (S.backupSnooze || 0);
}

export function snoozeBackup(now) {
  S.backupSnooze = now + 3 * 24 * 3600 * 1000;
  save();
}

// ---------- Economy ----------

export function plotRate(p, st) { return st.state === 'restored' ? p.rate * st.level : 0; }
export function baseRate() { return PLOTS.reduce((a, p) => a + plotRate(p, S.plots[p.id]), 0); }
export function visitorBonus() { return Object.values(S.visitors).reduce((a, n) => a + n, 0) * TIMING.visitorBonus; }
export function careBonus(now) {
  return S.creatures.reduce((a, c) => {
    const m = mood(c, now);
    return a + (m.level === 'happy' ? TIMING.happyBonus : m.level === 'okay' ? TIMING.okayBonus : 0);
  }, 0);
}
export function multiplier(now) { return 1 + careBonus(now) + visitorBonus(); }
// Pollen per real second.
export function pollenPerSec(now) { return baseRate() * multiplier(now) * SPEED; }

export function upgradeCost(p, st) { return Math.round(Math.max(20, p.clear) * Math.pow(1.6, st.level)); }
export function jarInterval(p, st) { return p.jarEverySec / (1 + 0.15 * (st.level - 1)); }
export function nextJarIn(p, st) { return Math.max(0, ((jarInterval(p, st) - st.jarProg) * 1000) / SPEED); }

// Moves the world forward to `now`. Used every second and when the game reopens.
export function advance(now) {
  const ev = { pollen: 0, jars: 0, restored: [], molted: [], grew: [], seconds: 0 };
  const realSec = Math.min(Math.max(0, (now - S.lastSeen) / 1000), TIMING.offlineCapSec);
  const gameSec = realSec * SPEED;
  ev.seconds = realSec;
  const mult = multiplier(now);

  let gain = baseRate() * mult * gameSec;
  for (const p of PLOTS) {
    const st = S.plots[p.id];
    if (st.state === 'restoring' && now >= st.endsAt) {
      st.state = 'restored';
      st.level = 1;
      st.jarProg = 0;
      const since = Math.min(realSec, Math.max(0, (now - st.endsAt) / 1000)) * SPEED;
      gain += p.rate * mult * since;
      ev.restored.push(p);
    }
  }
  S.pollen += gain;
  ev.pollen = gain;

  for (const p of PLOTS) {
    const st = S.plots[p.id];
    if (st.state !== 'restored' || !p.jar) continue;
    st.jarProg += gameSec;
    const iv = jarInterval(p, st);
    while (st.jarProg >= iv) {
      st.jarProg -= iv;
      if (S.jars[p.jar] < TIMING.jarCap) { S.jars[p.jar]++; ev.jars++; }
    }
  }

  let free = 0;
  const sets = Object.keys(SETS);
  while (now >= S.freeJarAt && free < 2) {
    const set = sets[Math.floor(Math.random() * sets.length)];
    if (S.jars[set] < TIMING.jarCap) { S.jars[set]++; ev.jars++; }
    S.freeJarAt += dur(TIMING.freeJarSec);
    free++;
  }
  if (now >= S.freeJarAt) S.freeJarAt = now + dur(TIMING.freeJarSec);

  for (const c of S.creatures) {
    if (stepPhase(c, now)) ev.molted.push(c);
    if (stepLife(c, now, gameSec)) ev.grew.push(c);
  }

  S.lastSeen = now;
  return ev;
}

function stepPhase(c, now) {
  const sp = BY_ID[c.speciesId];
  let molted = false;
  if (c.phase === 'premolt' && now >= c.phaseEnds) {
    c.phase = 'molting';
    c.phaseEnds += dur(TIMING.moltingSec);
    addLog(c, c.phaseEnds - dur(TIMING.moltingSec), `${c.name} flipped onto its back to molt.`);
  }
  if (c.phase === 'molting' && now >= c.phaseEnds) {
    const before = sizeOf(c);
    c.molts++;
    c.stage = stageFor(sp, c.molts);
    const after = sizeOf(c);
    c.exuvia = { molt: c.molts, size: after, t: c.phaseEnds };
    addLog(c, c.phaseEnds, `Molt ${c.molts}: grew from ${before.toFixed(1)} to ${after.toFixed(1)} cm.`);
    if (c.leftover) addLog(c, c.phaseEnds, `A leftover ${preyName(c.leftover.prey)} bothered ${c.name} during the molt.`);
    c.phase = 'postmolt';
    c.phaseEnds += dur(TIMING.postmoltSec);
    molted = true;
  }
  if (c.phase === 'postmolt' && now >= c.phaseEnds) {
    c.phase = 'normal';
    c.phaseEnds = 0;
  }
  return molted;
}

// Slow changes: webbing, burrows and colony growth. Returns true if a colony grew.
function stepLife(c, now, gameSec) {
  const sp = BY_ID[c.speciesId];
  if (sp.webber && c.phase !== 'molting') c.web = Math.min(1, c.web + (sp.webber * gameSec) / (3 * 86400));
  if (sp.burrower && c.decor.includes('deep')) c.burrow = Math.min(1, c.burrow + gameSec / (2 * 86400));
  if (sp.colony) {
    const cap = COLONY_CAP[c.tier];
    if (c.colony < cap && mood(c, now).level !== 'unhappy') {
      c.colonyProg += gameSec;
      let grew = false;
      while (c.colonyProg >= TIMING.colonyGrowSec && c.colony < cap) {
        c.colonyProg -= TIMING.colonyGrowSec;
        c.colony++;
        grew = true;
      }
      if (grew) addLog(c, now, `The colony grew to ${c.colony}.`);
      return grew;
    }
  }
  return false;
}

// ---------- Meadow actions ----------

export function restorePlot(id, now) {
  const p = PLOTS.find((x) => x.id === id);
  const st = S.plots[id];
  if (!p || st.state !== 'overgrown') return { ok: false };
  if (S.pollen < p.clear) return { ok: false, need: p.clear - S.pollen };
  S.pollen -= p.clear;
  if (p.restoreSec <= 0) { st.state = 'restored'; st.level = 1; }
  else { st.state = 'restoring'; st.endsAt = now + dur(p.restoreSec); }
  return { ok: true };
}

export function upgradePlot(id) {
  const p = PLOTS.find((x) => x.id === id);
  const st = S.plots[id];
  if (!p || st.state !== 'restored' || st.level >= MAX_LEVEL) return { ok: false };
  const cost = upgradeCost(p, st);
  if (S.pollen < cost) return { ok: false, need: cost - S.pollen };
  S.pollen -= cost;
  st.level++;
  return { ok: true };
}

// ---------- Jars ----------

const TOP = ['rare', 'epic', 'legendary'];

function rollRarity(rarities) {
  const total = rarities.reduce((a, r) => a + RARITY[r].weight, 0);
  let x = Math.random() * total;
  for (const r of rarities) {
    x -= RARITY[r].weight;
    if (x < 0) return r;
  }
  return rarities[rarities.length - 1];
}

export function openJar(set, now) {
  if (!S.jars[set]) return null;
  S.jars[set]--;
  const pool = SPECIES.filter((s) => s.set === set);
  const rarities = [...new Set(pool.map((s) => s.rarity))];
  let rarity = rollRarity(rarities);
  // A dry streak guarantees something rare or better.
  const pity = S.pity[set] || 0;
  if (!TOP.includes(rarity) && pity >= TIMING.pityAfter - 1) rarity = rollRarity(rarities.filter((r) => TOP.includes(r)));
  S.pity[set] = TOP.includes(rarity) ? 0 : pity + 1;

  const options = pool.filter((s) => s.rarity === rarity);
  const sp = options[Math.floor(Math.random() * options.length)];
  let morph = null;
  if (sp.morphs && sp.morphs.length && Math.random() < TIMING.morphChance) {
    morph = sp.morphs[Math.floor(Math.random() * sp.morphs.length)].id;
  }

  const entry = S.journal[sp.id] || (S.journal[sp.id] = { count: 0, morphs: [] });
  const isNewSpecies = entry.count === 0;
  const isNewMorph = !!morph && !entry.morphs.includes(morph);
  entry.count++;
  if (isNewMorph) entry.morphs.push(morph);

  let silk = 0;
  let creature = null;
  let released = false;
  let joined = null;
  if (sp.keep) {
    const colony = sp.colony && S.creatures.find((c) => c.speciesId === sp.id && c.morph === morph);
    if (isNewSpecies || isNewMorph) {
      creature = newCreature(S.nextId++, sp.id, morph, now);
      S.creatures.push(creature);
    } else if (colony) {
      colony.colony += 3;
      joined = colony;
      addLog(colony, now, `Three more ${sp.short}s joined the colony.`);
    } else {
      silk = RARITY[sp.rarity].silk;
    }
  } else {
    released = true;
    S.visitors[sp.id] = (S.visitors[sp.id] || 0) + 1;
    if (!isNewSpecies && !isNewMorph) silk = RARITY[sp.rarity].silk;
  }
  S.silk += silk;
  return { sp, morph, isNewSpecies, isNewMorph, silk, creature, released, joined, set };
}

export function buyJar(set) {
  if (S.silk < TIMING.jarCost) return { ok: false, need: TIMING.jarCost - S.silk };
  if (S.jars[set] >= TIMING.jarCap) return { ok: false, full: true };
  S.silk -= TIMING.jarCost;
  S.jars[set]++;
  return { ok: true };
}

// ---------- Creature state ----------

export function getCreature(id) { return S.creatures.find((c) => c.id === id); }

export function waterNow(c, now) {
  if (!c.decor.includes('water')) return 0;
  return Math.max(0, c.water - TIMING.waterPerHour * gameHours(now - c.waterT));
}

export function cleanNow(c, now) {
  return Math.max(0, c.clean - TIMING.dirtPerHour * gameHours(now - c.cleanT));
}

export function ambient(c, now) {
  return 35 + (waterNow(c, now) > 0 ? 15 : 0) + (c.decor.includes('plants') ? 10 : 0);
}

export function humidityNow(c, now) {
  const a = ambient(c, now);
  const step = TIMING.humDecayPerHour * gameHours(now - c.humT);
  const d = c.humidity - a;
  return Math.abs(d) <= step ? a : c.humidity - Math.sign(d) * step;
}

export function fullnessNow(c, now) {
  return Math.max(0, c.fullness - TIMING.hungerPerHour * gameHours(now - c.fullT));
}

export function comfort(c) {
  const likes = BY_ID[c.speciesId].likes;
  if (!likes.length) return 1;
  return likes.filter((k) => c.decor.includes(k)).length / likes.length;
}

export function leftoverIsProblem(c, now) {
  if (!c.leftover) return false;
  return c.phase !== 'normal' || gameHours(now - c.leftover.t) * 3600 > TIMING.leftoverWarnSec;
}

export function mood(c, now) {
  const sp = BY_ID[c.speciesId];
  const [lo, hi] = sp.humidity;
  const h = humidityNow(c, now);
  const f = fullnessNow(c, now);
  const cf = comfort(c);
  const w = waterNow(c, now);
  const cl = cleanNow(c, now);
  const issues = [];
  if (h < lo - 0.5) issues.push('Too dry');
  else if (h > hi + 0.5) issues.push('Too damp');
  if (f < 20 && c.phase === 'normal') issues.push('Hungry');
  if (cf < 0.5) issues.push('Needs setup');
  if (c.decor.includes('water') && w <= 0) issues.push('Dish empty');
  if (leftoverIsProblem(c, now)) issues.push('Leftover prey');
  if (cl < 30) issues.push('Needs cleaning');
  if (c.tier < needTier(c)) issues.push('Too cramped');
  const level = issues.length === 0 ? 'happy' : issues.length === 1 ? 'okay' : 'unhappy';
  return { level, issues, h, f, cf, w, cl };
}

export function growthInfo(c) {
  const sp = BY_ID[c.speciesId];
  if (sp.colony) {
    return { text: `A colony of ${c.colony}. It grows while they're comfortable, with room for ${COLONY_CAP[c.tier]} in this enclosure.` };
  }
  if (!sp.molts) {
    return { text: sp.group === 'beetle' ? `Adult beetles don't molt, so ${c.name} is fully grown.` : `${c.name} is fully grown.` };
  }
  if (c.phase === 'premolt') return { text: 'Pre-molt: refusing food and looking dark. Molting begins in', until: c.phaseEnds };
  if (c.phase === 'molting') return { text: 'Molting now! It\'s on its back, pulling free of its old skin. Leave it alone for', until: c.phaseEnds };
  if (c.phase === 'postmolt') return { text: 'Fresh molt! The new skin is still soft. Safe to feed in', until: c.phaseEnds };
  if (c.stage >= sp.stages.length - 1) return { text: `Fully grown adult after ${c.molts} molts.` };
  const left = TIMING.feedsToMolt - c.feeds;
  return { text: `${left} more good ${left === 1 ? 'meal' : 'meals'} until molt ${c.molts + 1} of ${maxMolts(sp)}.` };
}

const preyName = (id) => (PREY.find((p) => p.id === id)?.name || 'prey').toLowerCase().replace(/s$/, '');

// ---------- Care actions ----------
// Each returns { msg } or { need } when pollen runs short.

const MOLTING_MSG = (c) => `Leave ${c.name} alone while it molts. Disturbing it now could hurt it.`;

export function feed(c, now, preyId) {
  const sp = BY_ID[c.speciesId];
  if (c.phase === 'molting') return { msg: MOLTING_MSG(c) };
  const prey = preyId ? PREY.find((p) => p.id === preyId) : null;
  if (prey) {
    if (S.pollen < prey.cost) return { need: prey.cost - S.pollen };
    S.pollen -= prey.cost;
  }
  const food = prey ? prey.name.toLowerCase() : FOODS[sp.diet];
  const leave = () => { if (prey) c.leftover = { prey: prey.id, t: now }; };

  if (c.phase === 'premolt') {
    leave();
    addLog(c, now, `Refused ${food} (pre-molt).`);
    return { msg: `${c.name} ignored the ${food}. Fasting before a molt is normal.${prey ? ' Take the prey out, because live prey can hurt a pet while it molts.' : ''}` };
  }
  if (c.phase === 'postmolt') {
    leave();
    return { msg: `${c.name} is still soft from molting and won't eat yet.${prey ? ' Remove the prey so it can\'t bite.' : ''}` };
  }
  const f = fullnessNow(c, now);
  if (f > 75) {
    leave();
    return { msg: `${c.name} isn't hungry yet.${prey ? ` The ${food} are wandering around the enclosure, so remove them.` : ''}` };
  }
  let gain = 100;
  let msg = `${c.name} ate ${food}.`;
  if (prey) {
    const ideal = idealPrey(c);
    if (prey.size > ideal) {
      leave();
      addLog(c, now, `${prey.name} were too big to tackle.`);
      return { msg: `Too big! At ${sizeOf(c).toFixed(1)} cm, ${c.name} can't tackle ${food}. Try something smaller, and take those out.` };
    }
    if (prey.size === ideal - 1) { gain = 60; msg = `${c.name} ate the ${food}. Something a little bigger would fill it up more.`; }
    else if (prey.size < ideal - 1) { gain = 25; msg = `${c.name} snacked on the ${food}, but they're too small to make a real meal.`; }
    else msg = `${c.name} grabbed the ${food} right away. A perfect meal.`;
    c.leftover = null;
  }
  c.fullness = Math.min(100, f + gain);
  c.fullT = now;
  c.clean = Math.max(0, cleanNow(c, now) - 4);
  c.cleanT = now;
  addLog(c, now, `Ate ${food}.`);
  if (sp.molts && c.stage < sp.stages.length - 1 && gain >= 60) {
    c.feeds++;
    if (c.feeds >= TIMING.feedsToMolt) {
      c.feeds = 0;
      c.phase = 'premolt';
      c.phaseEnds = now + dur(TIMING.premoltSec);
      addLog(c, now, 'Stopped eating: pre-molt.');
      msg += ' It\'s looking plump and dark. A molt is coming soon.';
    }
  }
  return { msg };
}

export function mist(c, now) {
  const sp = BY_ID[c.speciesId];
  const [lo, hi] = sp.humidity;
  const h = Math.min(95, humidityNow(c, now) + 15);
  c.humidity = h;
  c.humT = now;
  if (h > hi) return { msg: `That's too damp for a ${sp.short}. Let it dry out for a while.` };
  if (h < lo) return { msg: `Still a little dry. A ${sp.short} likes ${lo}–${hi}%.` };
  return { msg: 'You misted one corner. The humidity is just right.' };
}

export function refill(c, now) {
  c.water = 100;
  c.waterT = now;
  return { msg: `Fresh water for ${c.name}.` };
}

export function removeLeftover(c, now) {
  if (c.phase === 'molting') return { msg: `Carefully, with long tongs: you lifted the ${preyName(c.leftover?.prey)} out without touching ${c.name}.`, done: removeOnly(c, now) };
  removeOnly(c, now);
  return { msg: 'You took out the leftover prey with tongs.' };
}
function removeOnly(c, now) {
  c.leftover = null;
  addLog(c, now, 'Removed leftover prey.');
  return true;
}

export function cleanEnclosure(c, now) {
  if (c.phase === 'molting') return { msg: MOLTING_MSG(c) };
  c.clean = 100;
  c.cleanT = now;
  c.leftover = null;
  addLog(c, now, 'Spot-cleaned the enclosure.');
  const sp = BY_ID[c.speciesId];
  return { msg: `All clean. You left ${sp.webber ? 'the webbing' : 'the burrow'} alone, the way ${c.name} likes it.` };
}

export function rehouse(c, now) {
  if (c.phase !== 'normal') return { msg: `Wait until ${c.name} has finished molting and hardened up before moving it.` };
  const next = TIERS[c.tier + 1];
  if (!next) return { msg: `${c.name} already has the biggest enclosure.` };
  if (S.pollen < next.cost) return { need: next.cost - S.pollen };
  S.pollen -= next.cost;
  c.tier++;
  c.web = 0;
  c.burrow = 0;
  addLog(c, now, `Moved into a ${next.name.toLowerCase()}.`);
  return { msg: `${c.name} moved into a ${next.name.toLowerCase()}. It's exploring every corner.` };
}

export function collectExuvia(c, now) {
  if (!c.exuvia || c.phase === 'molting') return { msg: '' };
  c.album.push(c.exuvia);
  c.exuvia = null;
  addLog(c, now, `Collected the shed skin from molt ${c.album[c.album.length - 1].molt}.`);
  return { msg: `You collected ${c.name}'s molt. It's a perfect see-through copy, right down to the fangs and eye covers.` };
}

export function examineExuvia(c, now) {
  const sp = BY_ID[c.speciesId];
  if (!sp.sexByMolt || c.sexKnown) return { msg: '' };
  const best = c.album.reduce((m, e) => Math.max(m, e.molt), 0);
  if (best < sp.sexByMolt) return { msg: `These molts are too small to tell yet. Try again with the skin from molt ${sp.sexByMolt} or later.` };
  c.sexKnown = true;
  addLog(c, now, `Sexed from a molt: ${c.sex}.`);
  const note = c.sex === 'female' ? sp.female : sp.male;
  return { msg: `Inside the shed skin, you ${c.sex === 'female' ? 'found the small flap that only females have' : 'found no female flap'}. ${c.name} is a ${c.sex}! ${note}` };
}

export function shareColony(c, now) {
  const sp = BY_ID[c.speciesId];
  if (!sp.colony || c.colony < 12) return { msg: 'Let the colony grow to at least 12 before sharing.' };
  c.colony -= 5;
  S.silk += sp.trade;
  addLog(c, now, `Shared 5 ${sp.short}s for ${sp.trade} silk.`);
  return { msg: `You shared 5 ${sp.short}s with other keepers and got ${sp.trade} silk.` };
}

export function buyDecor(c, key, now) {
  const d = DECOR[key];
  if (!d || c.decor.includes(key)) return { ok: false };
  if (S.pollen < d.cost) return { ok: false, need: d.cost - S.pollen };
  S.pollen -= d.cost;
  c.decor.push(key);
  if (key === 'water') { c.water = 100; c.waterT = now; }
  addLog(c, now, `Added ${d.name.toLowerCase()}.`);
  return { ok: true };
}

export function removeDecor(c, key, now) {
  c.decor = c.decor.filter((k) => k !== key);
  addLog(c, now, `Removed ${DECOR[key].name.toLowerCase()}.`);
}
