import {
  S, pollenPerSec, multiplier, careBonus, upgradeCost, nextJarIn, MAX_LEVEL,
  mood, humidityNow, growthInfo, getCreature, backupDue,
} from './state.js';
import { SPECIES, BY_ID, PLOTS, SETS, DECOR, RARITY, TIMING } from './data.js';
import { creatureSVG, sceneSVG, plotSVG, jarSVG, ICON } from './art.js';
import { esc, fmt, fmtRate, fmtDur } from './util.js';

const pct = (x) => `${Math.round(x * 100)}%`;
const morphOf = (sp, id) => (sp.morphs || []).find((m) => m.id === id);
export const artCtx = (c, now) => ({ morph: c.morph, stage: c.stage, damp: humidityNow(c, now) > 50 });

// ---------- Chrome ----------

export function topbar(now) {
  return `<div class="brand">Molt &amp; Meadow</div>
  <div class="stats">
    <span class="stat" title="Pollen">${ICON.pollen}<b data-live="pollen">${fmt(S.pollen)}</b><small data-live="rate">+${fmtRate(pollenPerSec(now))}/s</small></span>
    <span class="stat" title="Silk">${ICON.silk}<b data-live="silk">${fmt(S.silk)}</b></span>
  </div>`;
}

export function tabs(route) {
  const jars = S.jars.desert + S.jars.meadow;
  const items = [
    ['meadow', 'Meadow', ICON.meadow, ''],
    ['finds', 'Finds', ICON.jar, jars ? `<span class="dot">${jars}</span>` : ''],
    ['shelf', 'Shelf', ICON.shelf, ''],
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
    : '<p class="muted">Bees, ladybirds and butterflies from Meadow jars get released here. Each one boosts pollen by 3%.</p>'}</section>`;
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
  return `<section class="head"><h1>Finds</h1><p>Open a jar to see what you caught. Keepers go to your shelf, and pollinators are released into the meadow.</p></section>
  <div class="seg" role="tablist" aria-label="Jar type">${Object.values(SETS).map((s) => `<button role="tab" aria-selected="${s.id === set}" data-action="find-set" data-id="${s.id}">${s.name}<span class="count">${S.jars[s.id]}</span></button>`).join('')}</div>
  <section class="jar-panel ${set}">
    <div class="jar-wrap" id="jar">${jarSVG(set)}</div>
    <p class="jar-count">${n ? `${n} ${n === 1 ? 'jar' : 'jars'} to open` : 'No jars right now'}</p>
    <button class="btn gold big" data-action="open-jar" data-id="${set}"${n ? '' : ' aria-disabled="true"'}>Open jar</button>
    <p class="jar-note">${found} of ${pool.length} ${SETS[set].short} species found · free jar in <span data-until="${S.freeJarAt}">${fmtDur(S.freeJarAt - now)}</span></p>
    <div class="odds">${rarities.map((r) => `<div><i style="background:${RARITY[r].color}"></i><span>${RARITY[r].label}</span><b>${Math.max(1, Math.round((RARITY[r].weight / total) * 100))}%</b></div>`).join('')}</div>
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
  else tag = `<span class="tag">Duplicate · +${r.silk} silk</span>`;
  let dest;
  if (r.released) dest = `Released into the meadow, where it boosts pollen by ${Math.round(TIMING.visitorBonus * 100)}%.`;
  else if (r.creature) dest = `Added to your shelf as ${esc(r.creature.name)}.`;
  else dest = 'You already keep one like this, so you let it go and kept the silk.';
  const more = S.jars[r.set] > 0;
  return `<div class="reveal">
    <div class="badges"><span class="rarity" style="background:${rar.color}">${rar.label}</span>${tag}</div>
    <div class="reveal-art ${sp.set}">${creatureSVG(sp, { morph, stage: r.creature ? r.creature.stage : undefined })}</div>
    <h2 id="modal-title">${sp.name}</h2>
    <p class="sci">${sp.sci}</p>
    ${m ? `<p class="morph"><b>${m.name}:</b> ${m.note}</p>` : ''}
    <p>${sp.fact}</p>
    <p class="dest">${dest}</p>
    <div class="row">
      ${r.creature ? `<button class="btn secondary" data-route="creature:${r.creature.id}">Visit ${esc(r.creature.name)}</button>` : ''}
      ${more ? `<button class="btn gold" data-action="open-jar" data-id="${r.set}">Open another</button>` : '<button class="btn" data-action="close-modal">Done</button>'}
    </div>
  </div>`;
}

// ---------- Shelf ----------

function moodChip(level) {
  const label = { happy: 'Happy', okay: 'Okay', unhappy: 'Unhappy' }[level];
  return `<span class="chip ${level}">${label}</span>`;
}

export function shelfScreen(now) {
  const cards = S.creatures.map((c) => {
    const sp = BY_ID[c.speciesId];
    const m = mood(c, now);
    const variant = morphOf(sp, c.morph);
    const chips = [moodChip(m.level)];
    if (c.phase === 'premolt') chips.push('<span class="chip amber">Pre-molt</span>');
    if (c.phase === 'postmolt') chips.push('<span class="chip amber">Fresh molt</span>');
    m.issues.forEach((i) => chips.push(`<span class="chip warn">${i}</span>`));
    return `<button class="pet" data-route="creature:${c.id}">
      <div class="pet-art ${sp.set}">${creatureSVG(sp, artCtx(c, now), { label: `${c.name} the ${sp.short}` })}</div>
      <div class="pet-body"><h3>${esc(c.name)}</h3><p class="meta">${sp.name}${variant ? ` · ${variant.name}` : ''} · ${sp.stages[c.stage]}</p><div class="chips">${chips.join('')}</div></div>
    </button>`;
  }).join('');
  return `<section class="head"><h1>Your shelf</h1><p>Each happy pet boosts pollen by 10%. Keep humidity in range, feed them, and give them the setup they like.</p></section>
  <div class="bonus-row"><span>Care boost</span><b>+${pct(careBonus(now))}</b><small>${S.creatures.length} ${S.creatures.length === 1 ? 'pet' : 'pets'}</small></div>
  <div class="pets">${cards}</div>`;
}

function meter(label, value, p, color, range) {
  const band = range ? `<i class="band" style="left:${range[0]}%;width:${range[1] - range[0]}%"></i>` : '';
  return `<div class="meter"><div class="meter-top"><span>${label}</span><span class="muted">${value}</span></div>
    <div class="track"><i class="fill" style="width:${Math.max(0, Math.min(100, p))}%;background:${color}"></i>${band}</div></div>`;
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
  const decor = Object.entries(DECOR).map(([k, d]) => {
    const owned = c.decor.includes(k);
    const likes = sp.likes.includes(k);
    return `<li><div><b>${d.name}</b>${likes ? ' <span class="chip like">Liked</span>' : ''}<p class="muted small">${d.desc}</p></div>${owned
      ? `<span class="owned">${ICON.check}Added<button class="link small" data-action="remove-decor" data-id="${c.id}" data-key="${k}" aria-label="Remove ${d.name.toLowerCase()}">Remove</button></span>`
      : `<button class="btn small secondary" data-action="decor" data-id="${c.id}" data-key="${k}" data-cost="${d.cost}">Add · ${d.cost}</button>`}</li>`;
  }).join('');
  return `<div class="back-row">
      <button class="icon-btn" data-route="shelf" aria-label="Back to shelf">${ICON.back}</button>
      <div class="title"><h1>${esc(c.name)}</h1><p class="meta">${sp.name}${variant ? ` · ${variant.name}` : ''} · ${sp.stages[c.stage]}</p></div>
      <button class="icon-btn" data-action="rename" data-id="${c.id}" aria-label="Rename ${esc(c.name)}">${ICON.pencil}</button>
    </div>
    <div class="scene ${sp.set}">${sceneSVG(c, sp, artCtx(c, now), `${c.name}'s enclosure`)}${moodChip(m.level)}</div>
    <section class="card meters">
      ${meter('Humidity', `${Math.round(m.h)}% · likes ${lo}–${hi}%`, m.h, '#7cc4d8', [lo, hi])}
      ${meter('Fullness', `${Math.round(m.f)}%`, m.f, '#9fcf7a')}
      ${meter('Comfort', `${pct(m.cf)} · ${liked} of ${sp.likes.length} liked items`, m.cf * 100, '#f4b81c')}
    </section>
    <div class="growth">${ICON.leaf}<span>${g.text}${g.until ? ` <b data-until="${g.until}">${fmtDur(g.until - now)}</b>` : ''}</span></div>
    <div class="msg" role="status">${esc(msg)}</div>
    <div class="actions">
      <button class="btn" data-action="feed" data-id="${c.id}">${ICON.bug}Feed</button>
      <button class="btn" data-action="mist" data-id="${c.id}">${ICON.drop}Mist</button>
    </div>
    <section class="card"><h2>Enclosure setup</h2><p class="muted">A ${sp.short} likes: ${sp.likes.map((k) => DECOR[k].name.toLowerCase()).join(', ')}.</p><ul class="decor">${decor}</ul></section>
    <section class="card"><h2>About</h2><p class="sci">${sp.sci}</p><p>${sp.fact}</p></section>`;
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
  const cards = SPECIES.filter((s) => s.set === set).map((s) => {
    const e = S.journal[s.id];
    const rar = RARITY[s.rarity];
    if (e?.count) {
      return `<button class="jcard" data-action="species" data-id="${s.id}"><div class="jart ${s.set}">${creatureSVG(s)}</div><b>${s.name}</b><small style="color:${rar.text}">${rar.label}</small></button>`;
    }
    return `<div class="jcard unknown"><div class="jart">${creatureSVG(s, {}, { label: 'Unknown species' })}</div><b>???</b><small style="color:${rar.text}">${rar.label}</small></div>`;
  }).join('');
  return `<section class="head"><h1>Field Journal</h1><p>${found} of ${SPECIES.length} species found · ${morphFound} of ${morphTotal} variants</p></section>
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

export function speciesModal(id) {
  const sp = BY_ID[id];
  const e = S.journal[id];
  const rar = RARITY[sp.rarity];
  const variants = (sp.morphs || []).map((m) => `<li>${e.morphs.includes(m.id) ? ICON.check : '<span class="q">?</span>'}<span><b>${m.name}</b>${e.morphs.includes(m.id) ? ` · ${m.note}` : ' · not found yet'}</span></li>`).join('');
  return `<div class="reveal">
    <div class="badges"><span class="rarity" style="background:${rar.color}">${rar.label}</span><span class="tag">Found ${e.count}×</span></div>
    <div class="reveal-art ${sp.set}">${creatureSVG(sp)}</div>
    <h2 id="modal-title">${sp.name}</h2>
    <p class="sci">${sp.sci}</p>
    <p>${sp.fact}</p>
    <p class="dest">${sp.keep ? 'Keeper: lives on your shelf.' : 'Pollinator: released into the meadow.'}</p>
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
      <li><b>Shelf:</b> mist, feed and set up enclosures. Happy pets boost pollen.</li>
      <li><b>Journal:</b> collect all 12 species and their variants.</li>
    </ul>
    <div class="row"><button class="btn" data-action="close-modal">Let's go</button></div>
  </div>`;
}

export function welcomeBackModal(ev) {
  const lines = [`<li>${ICON.pollen}<span><b>+${fmt(ev.pollen)}</b> pollen</span></li>`];
  if (ev.jars) lines.push(`<li>${ICON.jar}<span><b>${ev.jars}</b> new ${ev.jars === 1 ? 'jar' : 'jars'} to open</span></li>`);
  ev.restored.forEach((p) => lines.push(`<li>${ICON.meadow}<span>${p.name} finished restoring</span></li>`));
  ev.molted.forEach((c) => lines.push(`<li>${ICON.leaf}<span>${esc(c.name)} molted!</span></li>`));
  return `<div class="reveal">
    <h2 id="modal-title">While you were away</h2>
    <p class="muted">${fmtDur(ev.seconds * 1000)} passed in the meadow.</p>
    <ul class="summary">${lines.join('')}</ul>
    <div class="row"><button class="btn" data-action="close-modal">Collect</button></div>
  </div>`;
}
