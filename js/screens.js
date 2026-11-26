import {
  S, pollenPerSec, multiplier, careBonus, upgradeCost, nextJarIn, MAX_LEVEL,
  mood, humidityNow, growthInfo, getCreature, backupDue, sizeOf, needTier, idealPrey, maxMolts,
  leftoverIsProblem,
} from './state.js?v=202611252038';
import { SPECIES, BY_ID, PLOTS, SETS, DECOR, RARITY, TIMING, TIERS, PREY, FOODS, COLONY_CAP } from './data.js?v=202611252038';
import { creatureSVG, sceneSVG, plotSVG, jarSVG, ICON } from './art.js?v=202611252038';
import { esc, fmt, fmtRate, fmtDur } from './util.js?v=202611252038';

const pct = (x) => `${Math.round(x * 100)}%`;
const morphOf = (sp, id) => (sp.morphs || []).find((m) => m.id === id);
export const artCtx = (c, now) => {
  const sp = BY_ID[c.speciesId];
  return { morph: c.morph, stage: c.stage, damp: humidityNow(c, now) > sp.humidity[1], premolt: c.phase === 'premolt' };
};

function ago(now, t) {
  const m = Math.floor((now - t) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function sizeText(c) {
  const sp = BY_ID[c.speciesId];
  if (sp.colony) return `${c.colony} in the colony`;
  return `${sizeOf(c).toFixed(1)} cm ${sp.sizeLabel}`;
}

function sexText(c) {
  if (!c.sexKnown || !c.sex) return '';
  return c.sex === 'female' ? ' · Female' : ' · Male';
}

// ---------- Chrome ----------

export function topbar(now) {
  return `<div class="brand">Molt &amp; Meadow</div>
  <div class="stats">
    <span class="stat" title="Pollen">${ICON.pollen}<b data-live="pollen">${fmt(S.pollen)}</b><small data-live="rate">+${fmtRate(pollenPerSec(now))}/s</small></span>
    <span class="stat" title="Silk">${ICON.silk}<b data-live="silk">${fmt(S.silk)}</b></span>
  </div>`;
}

export function tabs(route, now) {
  const jars = Object.values(S.jars).reduce((a, n) => a + n, 0);
  const needs = S.creatures.filter((c) => mood(c, now).level !== 'happy').length;
  const items = [
    ['meadow', 'Meadow', ICON.meadow, ''],
    ['finds', 'Finds', ICON.jar, jars ? `<span class="dot">${jars}</span>` : ''],
    ['shelf', 'Shelf', ICON.shelf, needs ? `<span class="dot warn">${needs}</span>` : ''],
    ['journal', 'Journal', ICON.journal, ''],
  ];
  const active = route.startsWith('creature') ? 'shelf' : route;
  return items.map(([id, label, ic, badge]) => `<button class="tab" data-route="${id}"${active === id ? ' aria-current="page"' : ''}>${ic}${label}${badge}</button>`).join('');
}

// ---------- Meadow ----------

function banners(now, ui) {
  let html = '';
  if (ui.showInstallTip && !S.hideInstallTip) {
    html += `<section class="banner"><p><b>Keep your save safe:</b> add Molt &amp; Meadow to your Home Screen and play from there. In Safari, tap Share, then Add to Home Screen.</p>
      <div class="row"><button class="btn small secondary" data-action="hide-install-tip">Got it</button></div></section>`;
  }
  if (backupDue(now)) {
    html += `<section class="banner"><p><b>Time for a backup.</b> It's been a while, so save a copy of your meadow in case your phone clears it.</p>
      <div class="row"><button class="btn small secondary" data-action="snooze-backup">Later</button><button class="btn small" data-action="backup">Back up now</button></div></section>`;
  }
  return html;
}

export function meadowScreen(now, ui) {
  const visitors = Object.entries(S.visitors).filter(([, n]) => n > 0);
  return `${banners(now, ui)}<section class="head"><h1>The Meadow</h1><p>Restore plots to bring wild bugs back. They earn pollen, even while you're away.</p></section>
  <div class="bonus-row"><span>Pollen boost</span><b>+${pct(multiplier(now) - 1)}</b><small>from happy pets and meadow visitors</small></div>
  <div class="plots">${PLOTS.map((p) => plotCard(p, S.plots[p.id], now)).join('')}</div>
  <section class="card"><h2>Visiting now</h2>${visitors.length
    ? `<div class="visitors">${visitors.map(([id, n]) => `<div class="visitor">${creatureSVG(BY_ID[id])}<span>${esc(BY_ID[id].short)}</span><b>×${n}</b></div>`).join('')}</div>`
    : '<p class="muted">Bees, butterflies, moths and other wild visitors from your jars get released here. Each one boosts pollen by 3%.</p>'}</section>`;
}

function plotCard(p, st, now) {
  let body;
  if (st.state === 'restored') {
    const cost = upgradeCost(p, st);
    const jarMs = p.jar ? nextJarIn(p, st) : 0;
    body = `<h3>${p.name}</h3><p class="meta">Level ${st.level} · ${fmtRate(p.rate * st.level)} pollen/s</p>`
      + (p.jar ? `<p class="meta small">Next ${SETS[p.jar].short} jar in <span data-until="${now + jarMs}">${fmtDur(jarMs)}</span></p>` : '')
      + (st.level < MAX_LEVEL
        ? `<button class="btn small" data-action="upgrade" data-id="${p.id}" data-cost="${cost}">Upgrade · ${fmt(cost)}</button>`
        : '<p class="meta small">Max level</p>');
  } else if (st.state === 'restoring') {
    body = `<h3>${p.name}</h3><p class="meta">Restoring… <span data-until="${st.endsAt}">${fmtDur(st.endsAt - now)}</span> left</p>`;
  } else {
    body = `<h3>Overgrown plot</h3><p class="meta">Becomes a ${p.name.toLowerCase()} · +${p.rate} pollen/s${p.jar ? ` · finds ${SETS[p.jar].short} jars` : ''}</p>`
      + `<button class="btn small" data-action="restore" data-id="${p.id}" data-cost="${p.clear}">Restore · ${fmt(p.clear)}</button>`;
  }
  return `<article class="plot ${st.state}"><div class="plot-art">${plotSVG(p, st)}</div><div class="plot-body">${body}</div></article>`;
}

// ---------- Finds ----------

export function findsScreen(now, ui) {
  const set = ui.findSet;
  const n = S.jars[set];
  const pool = SPECIES.filter((s) => s.set === set);
  const found = pool.filter((s) => S.journal[s.id]?.count).length;
  const rarities = [...new Set(pool.map((s) => s.rarity))];
  const total = rarities.reduce((a, r) => a + RARITY[r].weight, 0);
  const source = PLOTS.filter((p) => p.jar === set).map((p) => p.name.toLowerCase());
  return `<section class="head"><h1>Finds</h1><p>Open a jar to see what you caught. Keepers go to your shelf, and wild visitors are released into the meadow.</p></section>
  <div class="seg" role="tablist" aria-label="Jar type">${Object.values(SETS).map((s) => `<button role="tab" aria-selected="${s.id === set}" data-action="find-set" data-id="${s.id}">${s.name}<span class="count">${S.jars[s.id]}</span></button>`).join('')}</div>
  <section class="jar-panel ${set}">
    <div class="jar-wrap" id="jar">${jarSVG(set)}</div>
    <p class="jar-count">${n ? `${n} ${n === 1 ? 'jar' : 'jars'} to open` : 'No jars right now'}</p>
    <button class="btn gold big" data-action="open-jar" data-id="${set}"${n ? '' : ' aria-disabled="true"'}>Open jar</button>
    <p class="jar-note">${found} of ${pool.length} species found · ${SETS[set].short} jars come from the ${source.join(' and ')} · free jar in <span data-until="${S.freeJarAt}">${fmtDur(S.freeJarAt - now)}</span></p>
    <div class="odds">${rarities.map((r) => `<div><i style="background:${RARITY[r].color}"></i><span>${RARITY[r].label}</span><b>${Math.max(1, Math.round((RARITY[r].weight / total) * 100))}%</b></div>`).join('')}</div>
    <p class="jar-note small">Seven jars in a row without a rare guarantees one.</p>
  </section>
  <section class="card trade"><div><h2>Silk trade</h2><p class="muted">Duplicates turn into silk. Trade ${TIMING.jarCost} silk for a ${SETS[set].short} jar.</p></div><button class="btn secondary" data-action="buy-jar" data-id="${set}" data-silk="${TIMING.jarCost}">Trade · ${TIMING.jarCost} silk</button></section>`;
}

export function revealModal(r) {
  const { sp, morph } = r;
  const rar = RARITY[sp.rarity];
  const m = morphOf(sp, morph);
  let tag;
  if (r.isNewSpecies) tag = '<span class="tag new">New species!</span>';
  else if (r.isNewMorph) tag = '<span class="tag new">New variant!</span>';
  else if (r.joined) tag = '<span class="tag new">+3 to your colony</span>';
  else tag = `<span class="tag">Duplicate · +${r.silk} silk</span>`;
  let dest;
  if (r.released) dest = `Released into the meadow, where it boosts pollen by ${Math.round(TIMING.visitorBonus * 100)}%.`;
  else if (r.creature) dest = sp.colony ? `A starter colony of ${r.creature.colony} moved onto your shelf as ${esc(r.creature.name)}'s colony.` : `Added to your shelf as ${esc(r.creature.name)}.`;
  else if (r.joined) dest = `They joined ${esc(r.joined.name)}'s colony, which now has ${r.joined.colony}.`;
  else dest = 'You already keep one like this, so you let it go and kept the silk.';
  const more = S.jars[r.set] > 0;
  const target = r.creature || r.joined;
  return `<div class="reveal">
    <div class="badges"><span class="rarity" style="background:${rar.color}">${rar.label}</span>${tag}</div>
    <div class="reveal-art ${sp.set}">${creatureSVG(sp, { morph, stage: r.creature ? r.creature.stage : undefined })}</div>
    <h2 id="modal-title">${sp.name}</h2>
    <p class="sci">${sp.sci}</p>
    ${m ? `<p class="morph"><b>${m.name}:</b> ${m.note}</p>` : ''}
    <p>${sp.fact}</p>
    <p class="dest">${dest}</p>
    <div class="row">
      ${target ? `<button class="btn secondary" data-route="creature:${target.id}">Visit ${esc(target.name)}</button>` : ''}
      ${more ? `<button class="btn gold" data-action="open-jar" data-id="${r.set}">Open another</button>` : '<button class="btn" data-action="close-modal">Done</button>'}
    </div>
  </div>`;
}

// ---------- Shelf ----------

function moodChip(level) {
  const label = { happy: 'Happy', okay: 'Okay', unhappy: 'Unhappy' }[level];
  return `<span class="chip ${level}">${label}</span>`;
}

function phaseChip(c) {
  if (c.phase === 'premolt') return '<span class="chip amber">Pre-molt</span>';
  if (c.phase === 'molting') return '<span class="chip amber">Molting!</span>';
  if (c.phase === 'postmolt') return '<span class="chip amber">Fresh molt</span>';
  return '';
}

export function shelfScreen(now) {
  const cards = S.creatures.map((c) => {
    const sp = BY_ID[c.speciesId];
    const m = mood(c, now);
    const variant = morphOf(sp, c.morph);
    const chips = [moodChip(m.level), phaseChip(c)];
    if (c.exuvia && c.phase !== 'molting') chips.push('<span class="chip like">Molt to collect</span>');
    m.issues.forEach((i) => chips.push(`<span class="chip warn">${i}</span>`));
    return `<button class="pet" data-route="creature:${c.id}">
      <div class="pet-art ${sp.set}">${creatureSVG(sp, artCtx(c, now), { label: `${c.name} the ${sp.short}` })}</div>
      <div class="pet-body"><h3>${esc(c.name)}</h3><p class="meta">${sp.name}${variant ? ` · ${variant.name}` : ''} · ${sp.colony ? sizeText(c) : sp.stages[c.stage]}</p><div class="chips">${chips.join('')}</div></div>
    </button>`;
  }).join('');
  return `<section class="head"><h1>Your shelf</h1><p>Each happy pet boosts pollen by 10%. Mist, feed, clean, and give them the setup they like.</p></section>
  <div class="bonus-row"><span>Care boost</span><b>+${pct(careBonus(now))}</b><small>${S.creatures.length} ${S.creatures.length === 1 ? 'pet' : 'pets'}</small></div>
  <div class="pets">${cards}</div>`;
}

function meter(label, value, p, color, range) {
  const band = range ? `<i class="band" style="left:${range[0]}%;width:${range[1] - range[0]}%"></i>` : '';
  return `<div class="meter"><div class="meter-top"><span>${label}</span><span class="muted">${value}</span></div>
    <div class="track"><i class="fill" style="width:${Math.max(0, Math.min(100, p))}%;background:${color}"></i>${band}</div></div>`;
}

const BEHAVIOR = {
  tarantula: ['Sitting very still with its legs tucked in.', 'Slowly exploring the edge of the enclosure.', 'Laying down a fresh mat of silk.', 'Resting with its front legs raised a little.'],
  spider: ['Waiting quietly for something to pass by.', 'Adding a few new threads of silk.', 'Tucked into a corner, watching.'],
  jumper: ['Turned around to watch you.', 'Hopping between the twigs.', 'Tucked into its silk hammock near the top.', 'Cleaning its big front eyes with its palps.'],
  scorpion: ['Waiting at the mouth of its burrow.', 'Pushing sand around with its claws.', 'Holding very still with its tail curled.'],
  beetle: ['Digging slowly through the substrate.', 'Wandering over to the food dish.', 'Half buried, resting.'],
  grasshopper: ['Basking on the twig.', 'Nibbling the edge of a leaf.', 'Cleaning its antennae.'],
  isopod: ['Munching on leaf litter.', 'Huddled together under the bark.', 'Exploring the damp corner.'],
  millipede: ['Curled up in a spiral.', 'Gliding over the bark on all those legs.', 'Burrowed under the leaves.'],
};

function behaviorLine(c, sp, now) {
  if (c.phase === 'premolt') return 'Hiding more than usual and refusing food. Its abdomen looks dark and tight.';
  if (c.phase === 'molting') return 'Lying on its back, slowly pulling free of its old skin. This is normal!';
  if (c.phase === 'postmolt') return 'Stretching out its new legs while the skin hardens.';
  const extra = [];
  if (c.burrow > 0.4) extra.push('Sitting at the entrance of its burrow.');
  if (c.decor.includes('hide')) extra.push('Resting in the cork bark hide.');
  if (sp.webber && c.web > 0.5) extra.push('Walking across the silk it has spun.');
  const list = [...(BEHAVIOR[sp.group] || BEHAVIOR.beetle), ...extra];
  return list[(Math.floor(now / (20 * 60000)) + c.id) % list.length];
}

function growthChart(c) {
  const sp = BY_ID[c.speciesId];
  const max = maxMolts(sp);
  const pts = [];
  for (let m = 0; m <= c.molts; m++) pts.push(sp.size * (0.12 + 0.88 * Math.pow(m / max, 0.9)));
  const W = 300; const H = 90;
  const x = (m) => 20 + (m / max) * (W - 40);
  const y = (s) => H - 14 - (s / sp.size) * (H - 28);
  const line = pts.map((s, m) => `${x(m).toFixed(1)},${y(s).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Growth chart: ${pts.map((s) => s.toFixed(1)).join(', ')} cm after each molt">
    <line x1="20" y1="${H - 14}" x2="${W - 20}" y2="${H - 14}" stroke="#d5e6c6" stroke-width="2"/>
    <line x1="20" y1="${y(sp.size)}" x2="${W - 20}" y2="${y(sp.size)}" stroke="#d5e6c6" stroke-width="1.5" stroke-dasharray="4 4"/>
    <text x="${W - 20}" y="${y(sp.size) - 4}" text-anchor="end" font-size="10" font-weight="700" fill="#4c6150">adult ${sp.size} cm</text>
    ${pts.length > 1 ? `<polyline points="${line}" fill="none" stroke="#2f6b3a" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>` : ''}
    ${pts.map((s, m) => `<circle cx="${x(m).toFixed(1)}" cy="${y(s).toFixed(1)}" r="4" fill="#f4b81c" stroke="#2f6b3a" stroke-width="1.5"/>`).join('')}
    <text x="20" y="${H - 2}" font-size="10" font-weight="700" fill="#4c6150">molt 0</text>
    <text x="${W - 20}" y="${H - 2}" text-anchor="end" font-size="10" font-weight="700" fill="#4c6150">molt ${max}</text>
  </svg>`;
}

export function creatureScreen(id, now, ui) {
  const c = getCreature(id);
  if (!c) return shelfScreen(now);
  const sp = BY_ID[c.speciesId];
  const m = mood(c, now);
  const [lo, hi] = sp.humidity;
  const g = growthInfo(c);
  const variant = morphOf(sp, c.morph);
  const liked = sp.likes.filter((k) => c.decor.includes(k)).length;
  const msg = ui.msg[c.id] || sp.tip;
  const ctx = artCtx(c, now);
  const env = {
    web: c.web, burrow: c.burrow, colony: sp.colony ? c.colony : 0, molting: c.phase === 'molting',
    leftoverSize: c.leftover ? (PREY.find((p) => p.id === c.leftover.prey)?.size || 3) : 0,
    dirty: m.cl < 30, dryDish: c.decor.includes('water') && m.w <= 0,
  };
  const need = needTier(c);
  const next = TIERS[c.tier + 1];

  const alerts = [];
  if (c.leftover) alerts.push(`<button class="btn alert" data-action="remove-leftover" data-id="${c.id}">Remove leftover prey${leftoverIsProblem(c, now) ? ' (now!)' : ''}</button>`);
  if (c.exuvia && c.phase !== 'molting') alerts.push(`<button class="btn gold" data-action="collect-molt" data-id="${c.id}">Collect the shed skin</button>`);
  if (c.tier < need && next) alerts.push(`<button class="btn alert" data-action="rehouse" data-id="${c.id}" data-cost="${next.cost}">Too cramped: move to a ${next.name.toLowerCase()} · ${next.cost}</button>`);
  if (sp.colony && c.colony >= 12) alerts.push(`<button class="btn secondary" data-action="share-colony" data-id="${c.id}">Share 5 with other keepers · +${sp.trade} silk</button>`);

  const decor = Object.entries(DECOR).map(([k, d]) => {
    const owned = c.decor.includes(k);
    const likes = sp.likes.includes(k);
    return `<li><div><b>${d.name}</b>${likes ? ' <span class="chip like">Liked</span>' : ''}<p class="muted small">${d.desc}</p></div>${owned
      ? `<span class="owned">${ICON.check}Added<button class="link small" data-action="remove-decor" data-id="${c.id}" data-key="${k}" aria-label="Remove ${d.name.toLowerCase()}">Remove</button></span>`
      : `<button class="btn small secondary" data-action="decor" data-id="${c.id}" data-key="${k}" data-cost="${d.cost}">Add · ${d.cost}</button>`}</li>`;
  }).join('');

  const feedBtn = sp.diet === 'prey'
    ? `<button class="btn" data-action="feed-menu" data-id="${c.id}">${ICON.bug}Feed</button>`
    : `<button class="btn" data-action="feed" data-id="${c.id}">${ICON.leaf}Feed</button>`;

  let album = '';
  if (sp.molts) {
    const items = c.album.slice().reverse().map((e) => `<li><span class="molt-badge">${e.molt}</span><span><b>Molt ${e.molt}</b> · ${e.size.toFixed(1)} cm</span><span class="muted small">${ago(now, e.t)}</span></li>`).join('');
    const canExamine = sp.sexByMolt && !c.sexKnown && c.album.length;
    album = `<section class="card"><h2>Molt album</h2>
      ${c.molts ? growthChart(c) : ''}
      ${items ? `<ul class="album">${items}</ul>` : `<p class="muted">Every time ${esc(c.name)} molts, collect the shed skin here.</p>`}
      ${canExamine ? `<button class="btn secondary" data-action="examine" data-id="${c.id}">Examine a molt to tell male from female</button>` : ''}
      ${sp.sexByMolt && c.sexKnown ? `<p class="muted small">${c.sex === 'female' ? sp.female : sp.male}</p>` : ''}
    </section>`;
  }

  const log = c.log.slice(0, 8).map((e) => `<li><span class="muted small">${ago(now, e.t)}</span><span>${esc(e.text)}</span></li>`).join('');

  return `<div class="back-row">
      <button class="icon-btn" data-route="shelf" aria-label="Back to shelf">${ICON.back}</button>
      <div class="title"><h1>${esc(c.name)}</h1><p class="meta">${sp.name}${variant ? ` · ${variant.name}` : ''}${sp.colony ? '' : ` · ${sp.stages[c.stage]}`}${sexText(c)}</p></div>
      <button class="icon-btn" data-action="rename" data-id="${c.id}" aria-label="Rename ${esc(c.name)}">${ICON.pencil}</button>
    </div>
    <div class="scene ${sp.set}">${sceneSVG(c, sp, ctx, `${c.name}'s enclosure`, env)}${moodChip(m.level)}<span class="scene-size">${sizeText(c)} · ${TIERS[c.tier].name}</span>
      ${c.exuvia && c.phase !== 'molting' ? `<div class="exuvia" aria-hidden="true">${creatureSVG(sp, { stage: c.stage })}</div>` : ''}</div>
    <p class="behavior">${esc(behaviorLine(c, sp, now))}</p>
    ${alerts.length ? `<div class="alerts">${alerts.join('')}</div>` : ''}
    <section class="card meters">
      ${meter('Humidity', `${Math.round(m.h)}% · likes ${lo}–${hi}%`, m.h, '#7cc4d8', [lo, hi])}
      ${meter('Fullness', `${Math.round(m.f)}%`, m.f, '#9fcf7a')}
      ${c.decor.includes('water') ? meter('Water dish', m.w > 0 ? `${Math.round(m.w)}%` : 'Empty', m.w, '#5aa9d6') : ''}
      ${meter('Cleanliness', `${Math.round(m.cl)}%`, m.cl, '#c9a97a')}
      ${meter('Comfort', `${pct(m.cf)} · ${liked} of ${sp.likes.length} liked items`, m.cf * 100, '#f4b81c')}
    </section>
    <div class="growth">${ICON.leaf}<span>${g.text}${g.until ? ` <b data-until="${g.until}">${fmtDur(g.until - now)}</b>` : ''}</span></div>
    <div class="msg" role="status">${esc(msg)}</div>
    <div class="actions">
      ${feedBtn}
      <button class="btn" data-action="mist" data-id="${c.id}">${ICON.drop}Mist</button>
      ${c.decor.includes('water') ? `<button class="btn secondary" data-action="refill" data-id="${c.id}">${ICON.drop}Refill water</button>` : ''}
      <button class="btn secondary" data-action="clean" data-id="${c.id}">${ICON.leaf}Spot clean</button>
    </div>
    <section class="card"><h2>Enclosure</h2>
      <p class="muted">${TIERS[c.tier].name}. ${c.tier < need ? `${esc(c.name)} has outgrown it.` : 'Plenty of room for now.'}</p>
      ${next ? `<button class="btn small secondary" data-action="rehouse" data-id="${c.id}" data-cost="${next.cost}">Move to a ${next.name.toLowerCase()} · ${next.cost}</button>` : ''}
      <p class="muted">A ${sp.short} likes: ${sp.likes.map((k) => DECOR[k].name.toLowerCase()).join(', ')}.</p>
      <ul class="decor">${decor}</ul></section>
    ${album}
    <section class="card"><h2>Care log</h2><ul class="log">${log}</ul></section>
    <section class="card"><h2>About</h2><p class="sci">${sp.sci}</p><p>${sp.fact}</p></section>`;
}

export function preyModal(c) {
  const sp = BY_ID[c.speciesId];
  const ideal = idealPrey(c);
  const opts = PREY.map((p) => {
    let hint;
    if (p.size > ideal) hint = '<span class="chip warn">Too big</span>';
    else if (p.size === ideal) hint = '<span class="chip happy">Good size</span>';
    else if (p.size === ideal - 1) hint = '<span class="chip okay">A bit small</span>';
    else hint = '<span class="chip">Just a snack</span>';
    return `<button class="prey" data-action="feed" data-id="${c.id}" data-prey="${p.id}" data-cost="${p.cost}"><b>${p.name}</b>${hint}<span class="muted small">${p.cost} pollen</span></button>`;
  }).join('');
  return `<div class="reveal">
    <h2 id="modal-title">Feed ${esc(c.name)}</h2>
    <p class="muted">At ${sizeOf(c).toFixed(1)} cm, ${esc(c.name)} can handle prey up to about its own body size. Anything bigger can stress or even hurt it.</p>
    <div class="prey-list">${opts}</div>
    <div class="row"><button class="btn secondary" data-action="close-modal">Cancel</button></div>
  </div>`;
}

export function renameModal(c) {
  return `<form class="rename" data-form="rename" data-id="${c.id}">
    <h2 id="modal-title">Rename ${esc(c.name)}</h2>
    <label for="pet-name">New name</label>
    <input id="pet-name" name="name" maxlength="20" value="${esc(c.name)}" autocomplete="off" required>
    <div class="row"><button type="button" class="btn secondary" data-action="close-modal">Cancel</button><button type="submit" class="btn">Save</button></div>
  </form>`;
}

// ---------- Journal ----------

export function journalScreen(now, ui) {
  const set = ui.journalSet;
  const found = SPECIES.filter((s) => S.journal[s.id]?.count).length;
  const morphTotal = SPECIES.reduce((a, s) => a + (s.morphs?.length || 0), 0);
  const morphFound = SPECIES.reduce((a, s) => a + (S.journal[s.id]?.morphs.length || 0), 0);
  const molts = S.creatures.reduce((a, c) => a + (c.album?.length || 0), 0);
  const cards = SPECIES.filter((s) => s.set === set).map((s) => {
    const e = S.journal[s.id];
    const rar = RARITY[s.rarity];
    if (e?.count) {
      return `<button class="jcard" data-action="species" data-id="${s.id}"><div class="jart ${s.set}">${creatureSVG(s)}</div><b>${s.name}</b><small style="color:${rar.text}">${rar.label}</small></button>`;
    }
    return `<div class="jcard unknown"><div class="jart">${creatureSVG(s, {}, { label: 'Unknown species' })}</div><b>???</b><small style="color:${rar.text}">${rar.label}</small></div>`;
  }).join('');
  return `<section class="head"><h1>Field Journal</h1><p>${found} of ${SPECIES.length} species · ${morphFound} of ${morphTotal} variants · ${molts} ${molts === 1 ? 'molt' : 'molts'} collected</p></section>
  <div class="progress"><i style="width:${(found / SPECIES.length) * 100}%"></i></div>
  <div class="seg" role="tablist" aria-label="Set">${Object.values(SETS).map((s) => {
    const pool = SPECIES.filter((x) => x.set === s.id);
    const f = pool.filter((x) => S.journal[x.id]?.count).length;
    return `<button role="tab" aria-selected="${s.id === set}" data-action="journal-set" data-id="${s.id}">${s.name}<span class="count">${f}/${pool.length}</span></button>`;
  }).join('')}</div>
  <div class="jgrid">${cards}</div>
  <section class="card"><h2>Your save</h2><p class="muted">${lastBackupText(now)}</p><button class="btn" data-action="backup">Backup &amp; restore</button></section>
  <p class="footer-note">Every creature here is a real species, drawn from photos and field guides.<br><button class="link" data-action="reset">Start over</button></p>`;
}

function lastBackupText(now) {
  if (!S.lastBackup) return 'Not backed up yet.';
  const days = Math.floor((now - S.lastBackup) / 86400000);
  if (days === 0) return 'Last backup: today.';
  return `Last backup: ${days} ${days === 1 ? 'day' : 'days'} ago.`;
}

export function speciesModal(id) {
  const sp = BY_ID[id];
  const e = S.journal[id];
  const rar = RARITY[sp.rarity];
  const variants = (sp.morphs || []).map((m) => `<li>${e.morphs.includes(m.id) ? ICON.check : '<span class="q">?</span>'}<span><b>${m.name}</b>${e.morphs.includes(m.id) ? ` · ${m.note}` : ' · not found yet'}</span></li>`).join('');
  let role = 'Wild visitor: released into the meadow.';
  if (sp.colony) role = 'Keeper: lives on your shelf as a growing colony.';
  else if (sp.keep) role = 'Keeper: lives on your shelf.';
  return `<div class="reveal">
    <div class="badges"><span class="rarity" style="background:${rar.color}">${rar.label}</span><span class="tag">Found ${e.count}×</span></div>
    <div class="reveal-art ${sp.set}">${creatureSVG(sp)}</div>
    <h2 id="modal-title">${sp.name}</h2>
    <p class="sci">${sp.sci}</p>
    <p>${sp.fact}</p>
    <p class="dest">${role}</p>
    ${variants ? `<h3>Variants</h3><ul class="variants">${variants}</ul>` : ''}
    <div class="row"><button class="btn" data-action="close-modal">Close</button></div>
  </div>`;
}

export function resetModal() {
  return `<div class="reveal">
    <h2 id="modal-title">Start over?</h2>
    <p>This erases your meadow, pets and journal on this device. It can't be undone.</p>
    <div class="row"><button class="btn secondary" data-action="close-modal">Keep playing</button><button class="btn danger" data-action="confirm-reset">Erase and restart</button></div>
  </div>`;
}

export function introModal() {
  return `<div class="reveal">
    <div class="reveal-art desert">${creatureSVG(BY_ID['red-knee'], { stage: 1 })}</div>
    <h2 id="modal-title">Welcome to Molt &amp; Meadow</h2>
    <p>Meet Pumpkin, your first tarantula. Here's how it works:</p>
    <ul class="howto">
      <li><b>Meadow:</b> restore plots so wild bugs return and earn pollen, even while you're away.</li>
      <li><b>Finds:</b> open jars to discover real species.</li>
      <li><b>Shelf:</b> mist, feed, clean and set up enclosures. Pets grow by molting, and happy pets boost pollen.</li>
      <li><b>Journal:</b> collect all ${SPECIES.length} species and their variants.</li>
    </ul>
    <div class="row"><button class="btn" data-action="close-modal">Let's go</button></div>
  </div>`;
}

export function whatsNewModal() {
  return `<div class="reveal">
    <div class="reveal-art night">${creatureSVG(BY_ID['regal-jumper'])}</div>
    <h2 id="modal-title">The Keeper Update</h2>
    <p>Your pets need a little more care now, just like real ones:</p>
    <ul class="howto">
      <li><b>Pick the prey:</b> choose fruit flies, crickets or roaches, and match the size to your pet.</li>
      <li><b>Daily chores:</b> refill water dishes, spot clean, and take out uneaten prey.</li>
      <li><b>Molting:</b> watch for pre-molt signs, leave pets alone while they're on their back, then collect the shed skin for your Molt Album. Tarantula molts can even tell you if it's male or female.</li>
      <li><b>Growing up:</b> pets grow with every molt and need bigger enclosures as they do.</li>
      <li><b>12 new species:</b> Leaf Litter and Night Forest jars, including isopod colonies that grow on their own.</li>
    </ul>
    <p class="dest">You got a free Leaf Litter jar and a free Night Forest jar to start.</p>
    <div class="row"><button class="btn" data-action="close-modal">Let's see</button></div>
  </div>`;
}

export function welcomeBackModal(ev) {
  const lines = [`<li>${ICON.pollen}<span><b>+${fmt(ev.pollen)}</b> pollen</span></li>`];
  if (ev.jars) lines.push(`<li>${ICON.jar}<span><b>${ev.jars}</b> new ${ev.jars === 1 ? 'jar' : 'jars'} to open</span></li>`);
  ev.restored.forEach((p) => lines.push(`<li>${ICON.meadow}<span>${p.name} finished restoring</span></li>`));
  ev.molted.forEach((c) => lines.push(`<li>${ICON.leaf}<span>${esc(c.name)} molted! Collect the shed skin.</span></li>`));
  ev.grew.forEach((c) => lines.push(`<li>${ICON.shelf}<span>${esc(c.name)}'s colony grew to ${c.colony}</span></li>`));
  return `<div class="reveal">
    <h2 id="modal-title">While you were away</h2>
    <p class="muted">${fmtDur(ev.seconds * 1000)} passed in the meadow.</p>
    <ul class="summary">${lines.join('')}</ul>
    <div class="row"><button class="btn" data-action="close-modal">Collect</button></div>
  </div>`;
}

export function backupModal(now, ui) {
  let keep;
  if (ui.persisted === true) keep = 'Your browser has agreed to keep this save, but a backup still protects you if you clear your data or change phones.';
  else keep = 'Your browser could clear this save if your phone runs low on space or you clear browsing data, so keep a backup.';
  return `<div class="reveal backup">
    <h2 id="modal-title">Backup &amp; restore</h2>
    <p class="muted">${lastBackupText(now)} ${keep}</p>
    ${ui.standalone ? '' : '<p class="tip"><b>Tip:</b> add this game to your Home Screen and play from there. On iPhone, Safari can delete saves for websites you haven\'t opened in about a week, but not for Home Screen apps.</p>'}
    <h3>Back up</h3>
    <p>Save a backup file to your phone, or copy a save code and text or email it to yourself.</p>
    <div class="row"><button class="btn" data-action="backup-file">Save backup file</button><button class="btn secondary" data-action="backup-copy">Copy save code</button></div>
    <h3>Restore</h3>
    <p>Restoring replaces the game on this device with the backup.</p>
    <label for="restore-code">Paste a save code</label>
    <textarea id="restore-code" rows="3" spellcheck="false" autocomplete="off" placeholder="MM1.…"></textarea>
    <div class="row">
      <label class="btn secondary file-btn">Choose backup file<input type="file" accept=".json,application/json" class="sr-only" data-restore-file></label>
      <button class="btn" data-action="restore-code">Restore code</button>
    </div>
    <div class="row"><button class="btn secondary" data-action="close-modal">Close</button></div>
  </div>`;
}
