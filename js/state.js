import { SPECIES, BY_ID, PLOTS, DECOR, RARITY, TIMING, SPEED, PET_NAMES } from './data.js';

const KEY = 'molt-meadow-v1';
export const MAX_LEVEL = 10;

// Game seconds -> real milliseconds.
export const dur = (sec) => (sec * 1000) / SPEED;

export let S = null;

function newCreature(id, speciesId, morph, now, name) {
  const sp = BY_ID[speciesId];
  const [lo, hi] = sp.humidity;
  return {
    id, speciesId, morph: morph || null,
    name: name || PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)],
    stage: sp.molts ? 0 : sp.stages.length - 1,
    humidity: Math.round((lo + hi) / 2), humT: now,
    fullness: 70, fullT: now,
    feeds: 0, phase: 'normal', phaseEnds: 0,
    decor: [],
  };
}

function fresh(now) {
  const plots = {};
  PLOTS.forEach((p, i) => {
    plots[p.id] = { state: i === 0 ? 'restored' : 'overgrown', level: i === 0 ? 1 : 0, jarProg: 0, endsAt: 0 };
  });
  const pumpkin = newCreature(1, 'red-knee', null, now, 'Pumpkin');
  pumpkin.stage = 1;
  pumpkin.decor = ['water'];
  pumpkin.humidity = 62;
  return {
    v: 1, lastSeen: now,
    pollen: 20, silk: 0,
    jars: { desert: 1, meadow: 1 },
    freeJarAt: now + dur(TIMING.freeJarSec),
    plots,
    creatures: [pumpkin], nextId: 2,
    journal: { 'red-knee': { count: 1, morphs: [] } },
    visitors: {},
    seenIntro: false,
  };
}

export function load(now) {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.v === 1) { S = data; return false; }
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
  const ev = { pollen: 0, jars: 0, restored: [], molted: [], seconds: 0 };
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
  while (now >= S.freeJarAt && free < 3) {
    const set = Math.random() < 0.5 ? 'desert' : 'meadow';
    if (S.jars[set] < TIMING.jarCap) { S.jars[set]++; ev.jars++; }
    S.freeJarAt += dur(TIMING.freeJarSec);
    free++;
  }
  if (now >= S.freeJarAt) S.freeJarAt = now + dur(TIMING.freeJarSec);

  for (const c of S.creatures) if (stepPhase(c, now)) ev.molted.push(c);

  S.lastSeen = now;
  return ev;
}

function stepPhase(c, now) {
  let molted = false;
  if (c.phase === 'premolt' && now >= c.phaseEnds) {
    const sp = BY_ID[c.speciesId];
    c.stage = Math.min(c.stage + 1, sp.stages.length - 1);
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

export function openJar(set, now) {
  if (!S.jars[set]) return null;
  S.jars[set]--;
  const pool = SPECIES.filter((s) => s.set === set);
  const rarities = [...new Set(pool.map((s) => s.rarity))];
  const total = rarities.reduce((a, r) => a + RARITY[r].weight, 0);
  let x = Math.random() * total;
  let rarity = rarities[rarities.length - 1];
  for (const r of rarities) {
    x -= RARITY[r].weight;
    if (x < 0) { rarity = r; break; }
  }
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
  if (sp.keep) {
    if (isNewSpecies || isNewMorph) {
      creature = newCreature(S.nextId++, sp.id, morph, now);
      S.creatures.push(creature);
    } else {
      silk = RARITY[sp.rarity].silk;
    }
  } else {
    released = true;
    S.visitors[sp.id] = (S.visitors[sp.id] || 0) + 1;
    if (!isNewSpecies && !isNewMorph) silk = RARITY[sp.rarity].silk;
  }
  S.silk += silk;
  return { sp, morph, isNewSpecies, isNewMorph, silk, creature, released, set };
}

export function buyJar(set) {
  if (S.silk < TIMING.jarCost) return { ok: false, need: TIMING.jarCost - S.silk };
  if (S.jars[set] >= TIMING.jarCap) return { ok: false, full: true };
  S.silk -= TIMING.jarCost;
  S.jars[set]++;
  return { ok: true };
}

// ---------- Creature care ----------

export function getCreature(id) { return S.creatures.find((c) => c.id === id); }

export function ambient(c) {
  return 35 + (c.decor.includes('water') ? 15 : 0) + (c.decor.includes('plants') ? 10 : 0);
}

export function humidityNow(c, now) {
  const a = ambient(c);
  const step = (TIMING.humDecayPerHour * (now - c.humT) / 3.6e6) * SPEED;
  const d = c.humidity - a;
  return Math.abs(d) <= step ? a : c.humidity - Math.sign(d) * step;
}

export function fullnessNow(c, now) {
  return Math.max(0, c.fullness - (TIMING.hungerPerHour * (now - c.fullT) / 3.6e6) * SPEED);
}

export function comfort(c) {
  const likes = BY_ID[c.speciesId].likes;
  if (!likes.length) return 1;
  return likes.filter((k) => c.decor.includes(k)).length / likes.length;
}

export function mood(c, now) {
  const sp = BY_ID[c.speciesId];
  const [lo, hi] = sp.humidity;
  const h = humidityNow(c, now);
  const f = fullnessNow(c, now);
  const cf = comfort(c);
  const issues = [];
  if (h < lo - 0.5) issues.push('Too dry');
  else if (h > hi + 0.5) issues.push('Too damp');
  if (f < 20 && c.phase === 'normal') issues.push('Hungry');
  if (cf < 0.5) issues.push('Needs setup');
  const level = issues.length === 0 ? 'happy' : issues.length === 1 ? 'okay' : 'unhappy';
  return { level, issues, h, f, cf };
}

export function growthInfo(c) {
  const sp = BY_ID[c.speciesId];
  if (!sp.molts) return { text: `Adult beetles don't molt, so ${c.name} is fully grown.` };
  if (c.phase === 'premolt') return { text: 'Pre-molt: refusing food. Molting in', until: c.phaseEnds };
  if (c.phase === 'postmolt') return { text: 'Fresh molt! The new exoskeleton is still soft. Safe to feed in', until: c.phaseEnds };
  if (c.stage >= sp.stages.length - 1) return { text: 'Fully grown adult.' };
  const left = TIMING.feedsToMolt - c.feeds;
  return { text: `${left} more ${left === 1 ? 'meal' : 'meals'} until the next molt.` };
}

export function feed(c, now) {
  const sp = BY_ID[c.speciesId];
  if (c.phase === 'premolt') return `${c.name} ignored ${sp.food}. Fasting before a molt is normal, so try again after it molts.`;
  if (c.phase === 'postmolt') return `${c.name} just molted and is still soft. Wait a little before feeding.`;
  if (fullnessNow(c, now) > 75) return `${c.name} isn't hungry yet.`;
  c.fullness = 100;
  c.fullT = now;
  if (sp.molts && c.stage < sp.stages.length - 1) {
    c.feeds++;
    if (c.feeds >= TIMING.feedsToMolt) {
      c.feeds = 0;
      c.phase = 'premolt';
      c.phaseEnds = now + dur(TIMING.premoltSec);
      return `${c.name} ate ${sp.food} and is looking plump. A molt is coming soon.`;
    }
  }
  return `${c.name} ate ${sp.food}.`;
}

export function mist(c, now) {
  const sp = BY_ID[c.speciesId];
  const [lo, hi] = sp.humidity;
  const h = Math.min(95, humidityNow(c, now) + 15);
  c.humidity = h;
  c.humT = now;
  if (h > hi) return `That's too damp for a ${sp.short}. Let it dry out for a while.`;
  if (h < lo) return `Still a little dry. A ${sp.short} likes ${lo}–${hi}%.`;
  return 'You misted one corner. The humidity is just right.';
}

export function buyDecor(c, key) {
  const d = DECOR[key];
  if (!d || c.decor.includes(key)) return { ok: false };
  if (S.pollen < d.cost) return { ok: false, need: d.cost - S.pollen };
  S.pollen -= d.cost;
  c.decor.push(key);
  return { ok: true };
}
