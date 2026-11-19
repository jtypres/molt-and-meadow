import {
  S, load, save, resetGame, advance, pollenPerSec, restorePlot, upgradePlot,
  openJar, buyJar, getCreature, feed, mist, buyDecor,
  exportSave, exportCode, importSave, markBackedUp, snoozeBackup,
} from './state.js?v=202611191045';
import { BY_ID, SPEED } from './data.js?v=202611191045';
import * as UI from './screens.js?v=202611191045';
import { fmt, fmtRate, fmtDur } from './util.js?v=202611191045';

const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const touch = window.matchMedia('(pointer: coarse)').matches;
const ui = {
  route: 'meadow', findSet: 'desert', journalSet: 'desert', msg: {}, modal: false, busy: false,
  standalone, showInstallTip: touch && !standalone, persisted: null,
};
const $ = (sel) => document.querySelector(sel);

// ---------- Rendering ----------

function render() {
  const now = Date.now();
  $('#topbar').innerHTML = UI.topbar(now);
  $('#tabs').innerHTML = UI.tabs(ui.route);
  let html;
  if (ui.route === 'finds') html = UI.findsScreen(now, ui);
  else if (ui.route === 'shelf') html = UI.shelfScreen(now);
  else if (ui.route === 'journal') html = UI.journalScreen(now, ui);
  else if (ui.route.startsWith('creature:')) html = UI.creatureScreen(Number(ui.route.split(':')[1]), now, ui);
  else html = UI.meadowScreen(now, ui);
  $('#screen').innerHTML = html;
  live(now);
}

// Cheap per-second updates that don't rebuild the page.
function live(now) {
  const set = (k, v) => { const el = document.querySelector(`[data-live="${k}"]`); if (el) el.textContent = v; };
  set('pollen', fmt(S.pollen));
  set('rate', `+${fmtRate(pollenPerSec(now))}/s`);
  set('silk', fmt(S.silk));
  document.querySelectorAll('[data-until]').forEach((el) => { el.textContent = fmtDur(Number(el.dataset.until) - now); });
  document.querySelectorAll('[data-cost]').forEach((el) => {
    const cant = S.pollen < Number(el.dataset.cost);
    el.classList.toggle('cant', cant);
  });
  document.querySelectorAll('[data-silk]').forEach((el) => {
    el.classList.toggle('cant', S.silk < Number(el.dataset.silk));
  });
}

function go(route) {
  ui.route = route;
  closeModal();
  render();
  window.scrollTo(0, 0);
  $('#screen').focus({ preventScroll: true });
}

// ---------- Modals and toasts ----------

let lastFocus = null;
function openModal(html) {
  lastFocus = document.activeElement;
  $('#modal-root').innerHTML = `<div class="backdrop" data-backdrop><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">${html}</div></div>`;
  ui.modal = true;
  const first = $('#modal-root input, #modal-root button');
  if (first) first.focus();
}
function closeModal() {
  if (!ui.modal) return;
  $('#modal-root').innerHTML = '';
  ui.modal = false;
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

function toast(text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  $('#toasts').appendChild(el);
  setTimeout(() => el.classList.add('out'), 2800);
  setTimeout(() => el.remove(), 3300);
}

const needMsg = (n, what = 'pollen') => toast(`You need ${fmt(Math.ceil(n))} more ${what}.`);

// ---------- Backup and restore ----------

function downloadFile(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function backupFile() {
  const now = Date.now();
  const name = `molt-and-meadow-backup-${new Date(now).toISOString().slice(0, 10)}.json`;
  const file = new File([exportSave(now)], name, { type: 'application/json' });
  // On phones the share sheet is the most reliable way to save a file (Files, email, Messages).
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Molt & Meadow backup' });
      markBackedUp(Date.now());
      toast('Backup saved.');
    } catch (e) {
      if (e.name !== 'AbortError') { downloadFile(file); markBackedUp(Date.now()); toast('Backup downloaded.'); }
    }
  } else {
    downloadFile(file);
    markBackedUp(Date.now());
    toast('Backup downloaded.');
  }
  refreshBackupModal();
}

async function backupCopy() {
  const code = exportCode(Date.now());
  try {
    await navigator.clipboard.writeText(code);
    markBackedUp(Date.now());
    toast('Save code copied. Paste it somewhere safe, like a text to yourself.');
    refreshBackupModal();
  } catch (e) {
    // Clipboard blocked: show the code so it can be copied by hand.
    const box = $('#restore-code');
    if (box) { box.value = code; box.focus(); box.select(); }
    markBackedUp(Date.now());
    toast('Copy the selected code and keep it somewhere safe.');
  }
}

function restoreFrom(text) {
  try {
    importSave(text, Date.now());
  } catch (e) {
    toast("That doesn't look like a Molt & Meadow save.");
    return;
  }
  ui.msg = {};
  closeModal();
  go('meadow');
  toast('Your meadow is restored!');
}

function refreshBackupModal() {
  if (ui.modal && $('#modal-root .backup')) {
    $('#modal-root .modal').innerHTML = UI.backupModal(Date.now(), ui);
  }
}

// ---------- Actions ----------

function doOpenJar(set) {
  if (ui.busy) return;
  if (!S.jars[set]) { toast('No jars to open. Restore meadow plots to find more.'); return; }
  ui.busy = true;
  closeModal();
  if (ui.route !== 'finds') { ui.route = 'finds'; ui.findSet = set; render(); }
  const jar = $('#jar');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (jar && !reduce) jar.classList.add('shake');
  setTimeout(() => {
    const r = openJar(set, Date.now());
    save();
    render();
    if (r) openModal(UI.revealModal(r));
    ui.busy = false;
  }, reduce ? 0 : 700);
}

const actions = {
  restore(el) {
    const r = restorePlot(el.dataset.id, Date.now());
    if (!r.ok && r.need) return needMsg(r.need);
    save(); render();
  },
  upgrade(el) {
    const r = upgradePlot(el.dataset.id);
    if (!r.ok && r.need) return needMsg(r.need);
    save(); render();
  },
  'find-set'(el) { ui.findSet = el.dataset.id; render(); },
  'journal-set'(el) { ui.journalSet = el.dataset.id; render(); },
  'open-jar'(el) { doOpenJar(el.dataset.id); },
  'buy-jar'(el) {
    const r = buyJar(el.dataset.id);
    if (r.full) return toast('That jar shelf is full. Open some first.');
    if (!r.ok) return needMsg(r.need, 'silk');
    save(); render(); toast('Traded silk for a jar.');
  },
  feed(el) {
    const c = getCreature(Number(el.dataset.id));
    ui.msg[c.id] = feed(c, Date.now());
    save(); render();
  },
  mist(el) {
    const c = getCreature(Number(el.dataset.id));
    ui.msg[c.id] = mist(c, Date.now());
    save(); render();
  },
  decor(el) {
    const c = getCreature(Number(el.dataset.id));
    const r = buyDecor(c, el.dataset.key);
    if (!r.ok && r.need) return needMsg(r.need);
    if (r.ok) ui.msg[c.id] = `${c.name} has a new ${el.dataset.key === 'deep' ? 'layer of deep substrate' : 'addition'} to explore.`;
    save(); render();
  },
  'remove-decor'(el) {
    const c = getCreature(Number(el.dataset.id));
    c.decor = c.decor.filter((k) => k !== el.dataset.key);
    ui.msg[c.id] = `You took it out of ${c.name}'s enclosure.`;
    save(); render();
  },
  rename(el) { openModal(UI.renameModal(getCreature(Number(el.dataset.id)))); },
  species(el) { openModal(UI.speciesModal(el.dataset.id)); },
  reset() { openModal(UI.resetModal()); },
  backup() { openModal(UI.backupModal(Date.now(), ui)); },
  'backup-file'() { backupFile(); },
  'backup-copy'() { backupCopy(); },
  'restore-code'() {
    const text = ($('#restore-code')?.value || '').trim();
    if (!text) { toast('Paste a save code first.'); return; }
    restoreFrom(text);
  },
  'snooze-backup'() { snoozeBackup(Date.now()); render(); },
  'hide-install-tip'() { S.hideInstallTip = true; save(); render(); },
  'confirm-reset'() {
    resetGame(Date.now());
    ui.msg = {};
    S.seenIntro = true;
    save();
    go('meadow');
    openModal(UI.introModal());
  },
  'close-modal'() { closeModal(); },
};

document.addEventListener('click', (e) => {
  const backdrop = e.target.closest('[data-backdrop]');
  if (backdrop && e.target === backdrop) { closeModal(); return; }
  const el = e.target.closest('[data-route], [data-action]');
  if (!el) return;
  if (el.dataset.route) { go(el.dataset.route); return; }
  const fn = actions[el.dataset.action];
  if (fn) fn(el);
});

document.addEventListener('submit', (e) => {
  const form = e.target.closest('[data-form="rename"]');
  if (!form) return;
  e.preventDefault();
  const c = getCreature(Number(form.dataset.id));
  const name = new FormData(form).get('name').toString().trim().slice(0, 20);
  if (c && name) { c.name = name; save(); }
  closeModal();
  render();
});

document.addEventListener('change', (e) => {
  const input = e.target.closest('[data-restore-file]');
  if (!input || !input.files || !input.files[0]) return;
  input.files[0].text().then(restoreFrom, () => toast("Couldn't read that file."));
});

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// Ask the browser not to clear this site's storage when space runs low.
async function protectStorage() {
  try {
    if (!navigator.storage || !navigator.storage.persist) return;
    ui.persisted = (await navigator.storage.persisted()) || (await navigator.storage.persist());
  } catch (e) { /* not supported */ }
}

// ---------- Game loop ----------

let ticks = 0;
function tick() {
  const now = Date.now();
  const ev = advance(now);
  ev.restored.forEach((p) => toast(`${p.name} is restored!`));
  ev.molted.forEach((c) => toast(`${c.name} molted! Now a ${BY_ID[c.speciesId].stages[c.stage].toLowerCase()}.`));
  if (ev.jars) toast(ev.jars === 1 ? 'You found a new jar!' : `You found ${ev.jars} new jars!`);
  const changed = ev.restored.length || ev.molted.length || ev.jars;
  ticks++;
  const refreshPet = ui.route.startsWith('creature:') && ticks % 15 === 0;
  if ((changed || refreshPet) && !ui.modal && !ui.busy) render();
  else live(now);
  if (ticks % 5 === 0) save();
}

function boot() {
  const now = Date.now();
  const isNew = load(now);
  const ev = advance(now);
  save();
  render();
  protectStorage();
  if (isNew || !S.seenIntro) {
    S.seenIntro = true;
    save();
    openModal(UI.introModal());
  } else if (ev.seconds > 60 && ev.pollen >= 1) {
    openModal(UI.welcomeBackModal(ev));
  }
  // Test helper, only in ?fast mode: inspect or edit state from the browser console.
  if (SPEED > 1) window.mm = { get S() { return S; }, render, save };
  setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  window.addEventListener('pagehide', save);
}

boot();
