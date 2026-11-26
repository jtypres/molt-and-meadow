// All creature art is hand-built SVG following the Molt & Meadow style guide:
// flat fills, round strokes, 3-4 colors per species, eye glints as the only cartoon touch.
import { SETS } from './data.js?v=202611252038';
import { esc } from './util.js?v=202611252038';

const INK = '#2b211c';
const W = '#ffffff';

// Mirrors a left-half drawing across the center line of a 240-wide viewBox.
const mirror = (s) => `${s}<g transform="matrix(-1 0 0 1 240 0)">${s}</g>`;

// ---------- Spiders ----------

function tarantula(p) {
  let half = `<g stroke="${p.leg}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M104 70 L80 44 L66 14"/><path d="M100 80 L66 64 L40 54"/><path d="M100 92 L64 104 L38 120"/><path d="M104 100 L78 132 L66 168"/></g>`;
  const r = p.kneeR || 6;
  if (p.knee) half += `<g fill="${p.knee}"><circle cx="80" cy="44" r="${r}"/><circle cx="66" cy="64" r="${r}"/><circle cx="64" cy="104" r="${r}"/><circle cx="78" cy="132" r="${r}"/></g>`;
  if (p.tip) half += `<g fill="${p.tip}"><circle cx="73" cy="29" r="3.5"/><circle cx="53" cy="59" r="3.5"/><circle cx="51" cy="112" r="3.5"/><circle cx="72" cy="150" r="3.5"/></g>`;
  half += `<path d="M112 64 L106 46" stroke="${p.leg}" stroke-width="6" stroke-linecap="round"/>`;
  // Pre-molt: the abdomen darkens and looks tight and shiny.
  const dark = p.dark ? '<ellipse cx="120" cy="138" rx="28" ry="32" fill="#000" opacity=".4"/><ellipse cx="110" cy="128" rx="6" ry="12" fill="#fff" opacity=".22"/>' : '';
  return mirror(half)
    + `<ellipse cx="120" cy="138" rx="28" ry="32" fill="${p.abdomen}"/>${p.marks || ''}${dark}`
    + `<ellipse cx="120" cy="82" rx="24" ry="22" fill="${p.carapace}"${p.rim ? ` stroke="${p.rim}" stroke-width="4"` : ''}/>`
    + `<circle cx="120" cy="76" r="4.5" fill="#4a3a30"/><circle cx="118" cy="75" r="1.4" fill="${W}"/><circle cx="122" cy="75" r="1.4" fill="${W}"/>`;
}

function redKnee({ premolt }) {
  return tarantula({
    dark: premolt,
    leg: INK, knee: '#e8792b', tip: '#f0c48a', abdomen: INK, carapace: INK, rim: '#d98a3a',
    marks: '<path d="M104 124 L100 118 M114 132 L112 124 M128 128 L130 120 M136 140 L140 134 M112 150 L108 146 M126 154 L128 148" stroke="#b5562a" stroke-width="2" stroke-linecap="round"/>',
  });
}

// Greenbottle blues change color as they grow: orange striped spiderlings, blue adults.
function gbb({ stage, premolt }) {
  if (stage === 0) {
    return tarantula({
      dark: premolt,
      leg: '#7b86a0', knee: '#5b6680', kneeR: 4.5, abdomen: '#d9822b', carapace: '#8a7a62',
      marks: `<path d="M120 110 V166 M104 124 H136 M102 140 H138 M106 156 H134" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
    });
  }
  return tarantula({
    dark: premolt,
    leg: '#3561c0', knee: '#23408a', kneeR: 4.5, abdomen: '#e8792b', carapace: '#4d8c7f',
    marks: `<path d="M120 112 L120 126 M106 130 L120 138 L134 130 M104 146 L120 154 L136 146 M108 160 L120 166 L132 160" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  });
}

function argiope() {
  const legs = `<g stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M110 70 L82 40 L64 6"/><path d="M108 76 L76 52 L54 28"/><path d="M108 88 L86 98 L72 108"/><path d="M110 96 L80 132 L62 172"/></g>`
    + `<g stroke="#c4532a" stroke-width="5" stroke-linecap="round"><path d="M110 70 L96 55"/><path d="M108 76 L92 64"/><path d="M110 96 L96 113"/></g>`
    + `<path d="M114 64 L110 54" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  const patches = '<g fill="#f2c230"><ellipse cx="104" cy="118" rx="7" ry="10"/><ellipse cx="105" cy="141" rx="6" ry="9"/><ellipse cx="111" cy="158" rx="4" ry="6"/></g>';
  return mirror(legs)
    + `<ellipse cx="120" cy="130" rx="26" ry="34" fill="${INK}"/>`
    + mirror(patches)
    + `<circle cx="120" cy="104" r="3" fill="${W}"/>`
    + '<ellipse cx="120" cy="80" rx="16" ry="16" fill="#e9e6dc"/>'
    + `<circle cx="114" cy="70" r="2.2" fill="${INK}"/><circle cx="126" cy="70" r="2.2" fill="${INK}"/>`;
}

function crab({ morph }) {
  const yellow = morph === 'yellow';
  const body = yellow ? '#f2d44a' : '#f2f0e6';
  const leg = yellow ? '#c9a21e' : '#ada58c';
  const legs = `<g stroke="${leg}" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M108 84 Q80 66 60 38" stroke-width="7"/><path d="M106 92 Q74 86 50 70" stroke-width="7"/><path d="M108 104 L94 116 L90 128" stroke-width="4.5"/><path d="M110 112 L100 128 L98 142" stroke-width="4.5"/></g>`;
  const stripe = '<path d="M98 116 Q93 130 100 146" stroke="#d9534f" stroke-width="4" fill="none" stroke-linecap="round"/>';
  return mirror(legs)
    + `<ellipse cx="120" cy="130" rx="28" ry="26" fill="${body}"/>`
    + mirror(stripe)
    + `<ellipse cx="120" cy="92" rx="16" ry="14" fill="${body}"/>`
    + `<g fill="${INK}"><circle cx="113" cy="82" r="2"/><circle cx="127" cy="82" r="2"/><circle cx="108" cy="86" r="1.8"/><circle cx="132" cy="86" r="1.8"/></g>`;
}

function peacock({ morph }) {
  const female = morph === 'female';
  const legC = female ? '#6b5a48' : '#3a2f28';
  const legs = `<g stroke="${legC}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M108 74 L90 58 L84 44"/><path d="M106 82 L86 76 L74 66"/><path d="M106 96 L80 108 L60 118"/><path d="M108 100 L92 120 L88 136"/></g>`
    + (female ? '' : '<circle cx="60" cy="118" r="4.5" fill="#f2efe8"/>');
  let abdomen;
  if (female) {
    abdomen = '<ellipse cx="120" cy="124" rx="20" ry="22" fill="#8a7560"/><g fill="#6b5a48"><circle cx="112" cy="116" r="3"/><circle cx="128" cy="116" r="3"/><circle cx="114" cy="132" r="2.5"/><circle cx="126" cy="132" r="2.5"/><circle cx="120" cy="140" r="2"/></g>';
  } else {
    abdomen = '<ellipse cx="120" cy="124" rx="20" ry="22" fill="#d9532f"/>'
      + '<path d="M102 114 Q120 104 138 114 L138 121 Q120 111 102 121 Z" fill="#3fb6c8"/>'
      + '<path d="M103 131 Q120 123 137 131 L135 138 Q120 130 105 138 Z" fill="#3fb6c8"/>'
      + '<circle cx="120" cy="125" r="3.5" fill="#f2e3b3"/>'
      + '<ellipse cx="120" cy="124" rx="19" ry="21" fill="none" stroke="#f2e3b3" stroke-width="2"/>';
  }
  return mirror(legs) + abdomen
    + `<ellipse cx="120" cy="80" rx="20" ry="18" fill="${female ? '#6b5a48' : '#2f2620'}"/>`
    + (female ? '' : '<path d="M104 88 H136" stroke="#e9e2cf" stroke-width="2.5" stroke-linecap="round"/>')
    + `<circle cx="111" cy="67" r="6.5" fill="#0b0b0d"/><circle cx="129" cy="67" r="6.5" fill="#0b0b0d"/><circle cx="109" cy="65" r="2" fill="${W}"/><circle cx="127" cy="65" r="2" fill="${W}"/>`;
}

// ---------- Scorpion ----------

function scorpion() {
  const y = '#e2b65a';
  const dark = '#6b4a2a';
  const half = `<g stroke="${y}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M106 74 L84 72 L72 82"/><path d="M106 84 L82 92 L72 106"/><path d="M106 94 L84 108 L78 124"/><path d="M108 104 L90 124 L86 142"/></g>`
    + `<path d="M106 58 L84 44 L74 30" stroke="${y}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<ellipse cx="70" cy="20" rx="9" ry="15" fill="${y}" transform="rotate(-25 70 20)"/>`
    + `<path d="M64 8 L60 1 M72 6 L74 0" stroke="${y}" stroke-width="4" stroke-linecap="round"/>`;
  let segs = '';
  for (let yy = 84; yy <= 124; yy += 8) segs += `<path d="M104 ${yy} Q120 ${yy + 3} 136 ${yy}" stroke="${y}" stroke-width="1.5" fill="none" opacity=".6"/>`;
  return mirror(half)
    + `<path d="M102 50 Q120 44 138 50 L142 74 L98 74 Z" fill="${y}"/>`
    + `<circle cx="116" cy="58" r="2.6" fill="${INK}"/><circle cx="124" cy="58" r="2.6" fill="${INK}"/>`
    + `<ellipse cx="120" cy="104" rx="24" ry="32" fill="${y}"/><ellipse cx="120" cy="104" rx="16" ry="28" fill="${dark}"/>${segs}`
    + `<g fill="${y}"><circle cx="120" cy="140" r="9"/><circle cx="123" cy="156" r="8.5"/><circle cx="130" cy="170" r="8"/><circle cx="142" cy="180" r="7.5"/><circle cx="156" cy="186" r="7"/><ellipse cx="170" cy="184" rx="9" ry="6"/></g>`
    + `<path d="M178 182 Q188 176 184 168" stroke="${dark}" stroke-width="3" fill="none" stroke-linecap="round"/>`
    + '<path d="M112 146 L108 148 M130 160 L128 164 M138 176 L136 181 M150 182 L150 188" stroke="#b08a3a" stroke-width="1.5" stroke-linecap="round"/>';
}

// ---------- Beetles ----------

function darkling(p) {
  const ant = `<path d="M114 44 L106 32 L100 22" stroke="${p.leg}" stroke-width="3" fill="none" stroke-linecap="round"${p.beaded ? ' stroke-dasharray="3 2"' : ''}/>`;
  const legs = `<g stroke="${p.leg}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M106 72 L84 60 L74 44"/><path d="M100 100 L74 104 L60 118"/><path d="M104 122 L84 146 L78 170"/></g>`;
  const ry = p.long ? 50 : 44;
  const cy = p.long ? 132 : 126;
  let s = mirror(legs + ant)
    + `<ellipse cx="120" cy="${cy}" rx="${p.rx}" ry="${ry}" fill="${p.body}"/>`
    + `<ellipse cx="120" cy="72" rx="22" ry="14" fill="${p.body}"/>`
    + `<ellipse cx="120" cy="50" rx="11" ry="9" fill="${p.body}"/>`
    + `<path d="M120 ${cy - ry + 6} V${cy + ry - 4}" stroke="${p.line}" stroke-width="2"/>`;
  if (p.bumps) {
    s += `<g fill="${p.line}">`;
    for (let yy = 96; yy <= 156; yy += 12) for (const dx of [-18, -9, 9, 18]) s += `<circle cx="${120 + dx}" cy="${yy}" r="2.6"/>`;
    s += '</g>';
  }
  if (p.gloss) s += `<ellipse cx="108" cy="${cy - 8}" rx="5" ry="${ry * 0.5}" fill="${W}" opacity=".22"/>`;
  s += '<circle cx="111" cy="47" r="2.2" fill="#111"/><circle cx="129" cy="47" r="2.2" fill="#111"/>';
  return s;
}

const pinacate = () => darkling({ leg: '#2a2826', body: '#1f1d1c', line: '#3a3735', rx: 26, long: true, gloss: true });

// The waxy coat darkens when the enclosure is damp, as it does in real life.
function bdfb({ damp }) {
  return darkling(damp
    ? { leg: '#1d1f22', body: '#34373d', line: '#25282d', rx: 30, bumps: true, beaded: true }
    : { leg: '#4a5560', body: '#a9bfd0', line: '#7f97ab', rx: 30, bumps: true, beaded: true });
}

function ladybird() {
  const half = `<g stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M100 82 L76 70 L66 56"/><path d="M96 104 L68 106 L56 118"/><path d="M100 124 L78 144 L72 160"/><path d="M112 52 L102 38" stroke-width="3"/></g><circle cx="102" cy="38" r="3.5" fill="${INK}"/>`;
  return mirror(half)
    + `<ellipse cx="120" cy="58" rx="16" ry="10" fill="${INK}"/>`
    + '<ellipse cx="110" cy="57" rx="4" ry="3" fill="#f2efe8"/><ellipse cx="130" cy="57" rx="4" ry="3" fill="#f2efe8"/>'
    + `<ellipse cx="120" cy="72" rx="30" ry="12" fill="${INK}"/>`
    + '<ellipse cx="96" cy="71" rx="7" ry="6" fill="#f2efe8"/><ellipse cx="144" cy="71" rx="7" ry="6" fill="#f2efe8"/>'
    + '<ellipse cx="120" cy="120" rx="46" ry="44" fill="#d8352a"/>'
    + `<path d="M120 78 L120 164" stroke="${INK}" stroke-width="2"/>`
    + `<g fill="${INK}"><circle cx="120" cy="84" r="8"/><circle cx="100" cy="100" r="8"/><circle cx="140" cy="100" r="8"/><circle cx="88" cy="126" r="7"/><circle cx="152" cy="126" r="7"/><circle cx="106" cy="146" r="7"/><circle cx="134" cy="146" r="7"/></g>`
    + `<ellipse cx="96" cy="114" rx="5" ry="10" fill="${W}" opacity=".3" transform="rotate(-25 96 114)"/>`;
}

// ---------- Grasshopper ----------

function grasshopper() {
  const red = '#d8352a';
  const yel = '#e8c13a';
  const half = `<path d="M114 34 L102 4" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`
    + `<g stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M110 62 L90 54 L84 42"/><path d="M110 76 L88 82 L80 94"/><path d="M86 150 L92 170"/></g>`
    + `<path d="M112 92 L86 150" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>`
    + `<path d="M110 97 L88 145" stroke="${yel}" stroke-width="5" stroke-dasharray="5 7" stroke-linecap="round"/>`;
  let bands = '';
  [100, 112, 124, 136, 148, 160].forEach((yy, i) => {
    const hw = 14 * Math.sqrt(Math.max(0, 1 - ((yy - 128) / 42) ** 2));
    bands += `<rect x="${(120 - hw).toFixed(1)}" y="${yy - 2.5}" width="${(2 * hw).toFixed(1)}" height="5" fill="${i % 2 ? yel : red}"/>`;
  });
  return mirror(half)
    + `<ellipse cx="120" cy="128" rx="14" ry="42" fill="${INK}"/>${bands}`
    + `<circle cx="120" cy="118" r="2.4" fill="#7fb6e0"/><circle cx="120" cy="142" r="2.4" fill="#7fb6e0"/>`
    + `<rect x="104" y="52" width="32" height="34" rx="10" fill="${INK}"/>`
    + `<path d="M107 60 H133 M107 78 H133" stroke="${yel}" stroke-width="3" stroke-linecap="round"/>`
    + `<circle cx="112" cy="69" r="3" fill="${red}"/><circle cx="128" cy="69" r="3" fill="${red}"/><circle cx="120" cy="69" r="2.6" fill="#7fb6e0"/>`
    + `<ellipse cx="120" cy="40" rx="12" ry="14" fill="${INK}"/>`
    + `<circle cx="111" cy="36" r="4" fill="#5a4636"/><circle cx="129" cy="36" r="4" fill="#5a4636"/><circle cx="110" cy="35" r="1.3" fill="${W}"/><circle cx="128" cy="35" r="1.3" fill="${W}"/>`;
}

// ---------- Pollinators ----------

function bee({ morph }) {
  const drone = morph === 'drone';
  const half = `<g stroke="${INK}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M108 80 L88 72 L80 60"/><path d="M106 94 L84 100 L74 112"/><path d="M108 106 L90 132 L84 152"/><path d="M114 50 L108 38 L98 30" stroke-width="2.5"/></g>`
    + (drone ? '' : '<ellipse cx="88" cy="136" rx="5" ry="8" fill="#f2a541"/>')
    + '<g fill="#e9f3f7" stroke="#a9c3cc" stroke-width="1.5" opacity=".9"><ellipse cx="86" cy="100" rx="40" ry="13" transform="rotate(-28 86 100)"/><ellipse cx="92" cy="118" rx="26" ry="9" transform="rotate(-8 92 118)"/></g>';
  const rx = drone ? 24 : 20;
  const ry = drone ? 30 : 32;
  const eyes = drone
    ? '<ellipse cx="111" cy="57" rx="9" ry="11" fill="#4a3a30"/><ellipse cx="129" cy="57" rx="9" ry="11" fill="#4a3a30"/><circle cx="108" cy="53" r="2" fill="#fff"/><circle cx="126" cy="53" r="2" fill="#fff"/>'
    : '<ellipse cx="109" cy="60" rx="5" ry="8" fill="#4a3a30"/><ellipse cx="131" cy="60" rx="5" ry="8" fill="#4a3a30"/><circle cx="108" cy="57" r="1.6" fill="#fff"/><circle cx="130" cy="57" r="1.6" fill="#fff"/>';
  return mirror(half)
    + `<ellipse cx="120" cy="140" rx="${rx}" ry="${ry}" fill="#e0a23a"/>`
    + `<g fill="#3a2a1d"><rect x="${120 - rx + 2}" y="126" width="${2 * rx - 4}" height="7" rx="3"/><rect x="${120 - rx + 1}" y="141" width="${2 * rx - 2}" height="7" rx="3"/><rect x="${120 - rx + 5}" y="156" width="${2 * rx - 10}" height="7" rx="3"/><ellipse cx="120" cy="${140 + ry - 4}" rx="7" ry="4"/></g>`
    + '<circle cx="120" cy="88" r="18" fill="#8a6136"/><circle cx="120" cy="88" r="16" fill="none" stroke="#b88a55" stroke-width="3" stroke-dasharray="2 3"/>'
    + `<ellipse cx="120" cy="60" rx="14" ry="12" fill="${INK}"/>${eyes}`;
}

function monarch({ morph }) {
  const male = morph === 'male';
  const half = `<path d="M118 96 C96 60 52 38 28 50 C20 70 40 98 116 104 Z" fill="#f08a24" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`
    + `<path d="M118 106 C90 104 48 118 52 150 C66 166 102 152 118 112 Z" fill="#f39a30" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`
    + `<path d="M116 98 L44 56 M116 100 L34 78 M114 102 L64 98 M118 108 L60 146 M118 110 L84 156 M118 109 L104 152" stroke="${INK}" stroke-width="${male ? 2 : 3.2}" fill="none" stroke-linecap="round"/>`
    + (male ? `<circle cx="88" cy="128" r="3.8" fill="${INK}"/>` : '')
    + `<g fill="${W}"><circle cx="31" cy="52" r="1.8"/><circle cx="24" cy="62" r="1.8"/><circle cx="25" cy="74" r="1.8"/><circle cx="54" cy="154" r="1.8"/><circle cx="64" cy="162" r="1.8"/><circle cx="78" cy="162" r="1.8"/></g>`
    + `<path d="M117 72 L106 48" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><circle cx="106" cy="48" r="3" fill="${INK}"/>`;
  return mirror(half)
    + `<ellipse cx="120" cy="108" rx="5" ry="28" fill="${INK}"/><circle cx="120" cy="78" r="6" fill="${INK}"/>`
    + `<circle cx="118" cy="92" r="1.5" fill="${W}"/><circle cx="122" cy="97" r="1.5" fill="${W}"/>`;
}

// ---------- Isopods ----------

// Top-down isopod: segmented oval body, broad head, 14 legs just peeking out.
function isopod(p) {
  const rx = p.rx || 44;
  const legs = `<g stroke="${p.leg}" stroke-width="3" stroke-linecap="round"><path d="M${120 - rx + 0} 70 l-7 2 M${120 - rx - 4} 86 l-7 2 M${120 - rx - 6} 102 l-7 1 M${120 - rx - 6} 118 l-7 1 M${120 - rx - 5} 134 l-7 2 M${120 - rx} 148 l-7 3 M${120 - rx + 6} 160 l-6 4"/></g>`;
  const ant = `<path d="M102 40 Q82 22 70 18" stroke="${p.ant}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  const tail = p.tail ? `<path d="M110 172 L102 192 M130 172 L138 192" stroke="${p.body}" stroke-width="5" stroke-linecap="round"/>` : '';
  let segs = '';
  [64, 80, 96, 112, 128, 144, 158, 168].forEach((y) => {
    const hw = rx * Math.sqrt(Math.max(0, 1 - ((y - 108) / 70) ** 2));
    segs += `M${(120 - hw).toFixed(1)} ${y} Q120 ${y + 8} ${(120 + hw).toFixed(1)} ${y} `;
  });
  return mirror(legs + ant) + tail
    + `<ellipse cx="120" cy="108" rx="${rx}" ry="70" fill="${p.body}"/>`
    + (p.patches || '')
    + `<path d="${segs}" stroke="${p.line}" stroke-width="2.2" fill="none"/>`
    + (p.spots ? `<g fill="${p.spots}"><circle cx="86" cy="88" r="3"/><circle cx="154" cy="88" r="3"/><circle cx="83" cy="104" r="3"/><circle cx="157" cy="104" r="3"/><circle cx="84" cy="120" r="3"/><circle cx="156" cy="120" r="3"/><circle cx="88" cy="136" r="3"/><circle cx="152" cy="136" r="3"/></g>` : '')
    + `<ellipse cx="120" cy="48" rx="32" ry="17" fill="${p.head}"/>${p.headMark || ''}`
    + `<circle cx="98" cy="48" r="3.2" fill="#1d1a17"/><circle cx="142" cy="48" r="3.2" fill="#1d1a17"/><circle cx="97" cy="47" r="1" fill="${W}"/><circle cx="141" cy="47" r="1" fill="${W}"/>`;
}

const pillbug = () => isopod({ body: '#5d5f66', head: '#55575e', line: '#44464c', leg: '#b9b4a6', ant: '#5d5f66', spots: '#8f9198', rx: 42 });
const ducky = () => isopod({ body: '#4b4b52', head: '#efe2b0', line: '#33333a', leg: '#c9c2b0', ant: '#6b6b72', spots: '#9a9aa0', tail: true, headMark: '<ellipse cx="120" cy="38" rx="14" ry="7" fill="#e3c77a"/>' });
const dairycow = () => isopod({
  body: '#efece4', head: '#efece4', line: '#c9c4b8', leg: '#b9b4a6', ant: '#3a3a40', tail: true, rx: 46,
  patches: '<g fill="#2b2b2f"><ellipse cx="100" cy="92" rx="14" ry="10"/><ellipse cx="146" cy="110" rx="12" ry="14"/><ellipse cx="108" cy="140" rx="12" ry="9"/><ellipse cx="136" cy="156" rx="8" ry="6"/></g>',
  headMark: '<ellipse cx="132" cy="46" rx="10" ry="7" fill="#2b2b2f"/>',
});

// ---------- More arachnids ----------

function woodlouse() {
  const legs = `<g stroke="#c4532a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M106 68 L84 46 L74 24"/><path d="M102 76 L74 66 L52 60"/><path d="M102 86 L76 98 L58 112"/><path d="M106 94 L86 126 L78 156"/></g>`;
  return mirror(legs)
    + '<ellipse cx="120" cy="132" rx="20" ry="30" fill="#e7d8b8"/>'
    + '<ellipse cx="111" cy="52" rx="6" ry="13" fill="#8f2f14"/><ellipse cx="129" cy="52" rx="6" ry="13" fill="#8f2f14"/>'
    + '<path d="M109 40 Q114 34 118 40 M131 40 Q126 34 122 40" stroke="#1d1a17" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    + '<ellipse cx="120" cy="78" rx="20" ry="18" fill="#b8441f"/><ellipse cx="113" cy="72" rx="5" ry="8" fill="#fff" opacity=".25"/>'
    + '<g fill="#1d1a17"><circle cx="115" cy="66" r="2"/><circle cx="125" cy="66" r="2"/><circle cx="120" cy="64" r="1.8"/></g>';
}

function jumper(p) {
  const legs = `<g stroke="${p.leg}" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M106 70 L88 56 L82 40" stroke-width="7"/><path d="M104 78 L84 74 L72 64" stroke-width="6"/><path d="M104 88 L82 100 L68 104" stroke-width="6"/><path d="M106 96 L90 118 L86 136" stroke-width="6"/></g>`
    + (p.legBand ? `<g fill="${p.legBand}"><circle cx="88" cy="56" r="3.5"/><circle cx="84" cy="74" r="3"/><circle cx="82" cy="100" r="3"/><circle cx="90" cy="118" r="3"/></g>` : '');
  return mirror(legs)
    + `<ellipse cx="120" cy="126" rx="22" ry="28" fill="${p.abd}"/>${p.marks || ''}`
    + `<ellipse cx="112" cy="48" rx="5" ry="6" fill="${p.fang}"/><ellipse cx="128" cy="48" rx="5" ry="6" fill="${p.fang}"/>`
    + `<rect x="98" y="52" width="44" height="44" rx="16" fill="${p.body}"/>`
    + '<circle cx="110" cy="60" r="7" fill="#0b0b0d"/><circle cx="130" cy="60" r="7" fill="#0b0b0d"/><circle cx="108" cy="58" r="2.2" fill="#fff"/><circle cx="128" cy="58" r="2.2" fill="#fff"/>'
    + '<circle cx="100" cy="66" r="3" fill="#0b0b0d"/><circle cx="140" cy="66" r="3" fill="#0b0b0d"/>';
}

const WHITE = '#f2efe8';
const spotsPattern = (c, big) => `<path d="M114 ${big ? 112 : 114} L126 ${big ? 112 : 114} L120 ${big ? 128 : 126} Z" fill="${c}"/><g fill="${c}"><circle cx="106" cy="132" r="${big ? 4.5 : 3.5}"/><circle cx="134" cy="132" r="${big ? 4.5 : 3.5}"/><circle cx="108" cy="146" r="${big ? 4 : 3}"/><circle cx="132" cy="146" r="${big ? 4 : 3}"/></g><path d="M100 104 Q120 96 140 104" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>`;

const bold = () => jumper({ leg: '#1d1a17', legBand: WHITE, abd: '#1d1a17', body: '#1d1a17', fang: '#2fae8a', marks: spotsPattern(WHITE, false) });

function regal({ morph }) {
  if (morph === 'orange') return jumper({ leg: '#9a4f22', legBand: WHITE, abd: '#e0782a', body: '#c9692a', fang: '#2fae8a', marks: spotsPattern(WHITE, true) });
  if (morph === 'grey') return jumper({ leg: '#5d6068', legBand: WHITE, abd: '#8b8f94', body: '#7d8088', fang: '#2fae8a', marks: spotsPattern(WHITE, true) });
  return jumper({
    leg: '#1d1a17', legBand: WHITE, abd: '#1d1a17', body: '#1d1a17', fang: '#2fae8a',
    marks: spotsPattern(WHITE, true) + `<path d="M100 120 Q96 138 104 152 M140 120 Q144 138 136 152" stroke="${WHITE}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  });
}

function harvestman() {
  const legs = '<g stroke="#5a4632" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M112 98 Q80 20 30 8"/><path d="M110 102 Q50 50 6 70"/><path d="M110 108 Q50 140 8 152"/><path d="M112 112 Q80 190 40 198"/></g>';
  return mirror(legs)
    + '<ellipse cx="120" cy="105" rx="15" ry="12" fill="#a07e58"/><path d="M120 94 V116" stroke="#5a4632" stroke-width="5" stroke-linecap="round"/>'
    + '<circle cx="117" cy="100" r="1.8" fill="#1d1a17"/><circle cx="123" cy="100" r="1.8" fill="#1d1a17"/>';
}

// ---------- More insects and millipedes ----------

function millipede() {
  const pts = [];
  for (let i = 0; i <= 18; i++) {
    const t = i / 18;
    const x = 70 + 100 * t + 34 * Math.sin(t * Math.PI * 2);
    const y = 24 + 150 * t;
    const dx = 100 + 68 * Math.PI * Math.cos(t * Math.PI * 2);
    const dy = 150;
    const len = Math.hypot(dx, dy);
    pts.push({ x, y, nx: -dy / len, ny: dx / len, r: i === 0 ? 9 : i > 15 ? 11 - (i - 15) * 1.5 : 11 });
  }
  let legs = '<g stroke="#d98a5a" stroke-width="2" stroke-linecap="round">';
  pts.slice(1).forEach((p) => {
    legs += `<path d="M${(p.x + p.nx * p.r).toFixed(1)} ${(p.y + p.ny * p.r).toFixed(1)} l${(p.nx * 6).toFixed(1)} ${(p.ny * 6).toFixed(1)} M${(p.x - p.nx * p.r).toFixed(1)} ${(p.y - p.ny * p.r).toFixed(1)} l${(-p.nx * 6).toFixed(1)} ${(-p.ny * 6).toFixed(1)}"/>`;
  });
  legs += '</g>';
  let body = '';
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    body += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r}" fill="${i === 0 ? '#2b1d18' : '#3a2a24'}" stroke="#c0452f" stroke-width="${i === 0 ? 0 : 1.6}"/>`;
  }
  const h = pts[0];
  return legs + body
    + `<path d="M${h.x - 4} ${h.y - 6} l-8 -10 M${h.x + 4} ${h.y - 6} l8 -10" stroke="#2b1d18" stroke-width="2.5" stroke-linecap="round"/>`
    + `<circle cx="${h.x - 3}" cy="${h.y - 2}" r="1.3" fill="#fff"/><circle cx="${h.x + 3}" cy="${h.y - 2}" r="1.3" fill="#fff"/>`;
}

function earwig() {
  const half = '<path d="M114 34 Q100 10 86 4" stroke="#5a2f1c" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-dasharray="4 2"/>'
    + '<g stroke="#d8b48a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M110 62 L94 54 L88 44"/><path d="M108 76 L90 80 L82 90"/><path d="M110 88 L94 100 L90 112"/></g>'
    + '<path d="M114 160 Q98 182 114 196" stroke="#4a2414" stroke-width="5" fill="none" stroke-linecap="round"/>';
  let segs = '';
  for (let y = 104; y <= 154; y += 10) segs += `M106 ${y} H134 `;
  return mirror(half)
    + '<path d="M104 96 H136 L132 160 Q120 166 108 160 Z" fill="#6b3a22"/>'
    + `<path d="${segs}" stroke="#4a2414" stroke-width="1.5"/>`
    + '<rect x="102" y="70" width="36" height="28" rx="8" fill="#b07a4a"/><path d="M120 70 V98" stroke="#7a4f2c" stroke-width="1.5"/>'
    + '<rect x="106" y="52" width="28" height="18" rx="6" fill="#8a5a3a"/>'
    + '<ellipse cx="120" cy="40" rx="11" ry="12" fill="#5a2f1c"/><circle cx="111" cy="38" r="2.4" fill="#1d1a17"/><circle cx="129" cy="38" r="2.4" fill="#1d1a17"/>';
}

function rosy() {
  const half = '<path d="M120 78 C84 18 18 24 12 66 C12 102 72 108 120 96 Z" fill="#f59ac0"/>'
    + '<path d="M114 84 C90 60 54 54 36 72 C60 84 90 90 114 90 Z" fill="#f7d84a"/>'
    + '<path d="M120 96 C84 102 48 132 66 162 C90 168 114 138 120 102 Z" fill="#f7c0d4"/>'
    + '<path d="M114 66 Q96 36 84 30 M104 54 l-8 2 M98 44 l-8 2" stroke="#f7d84a" stroke-width="3" fill="none" stroke-linecap="round"/>';
  return mirror(half) + '<ellipse cx="120" cy="102" rx="15" ry="42" fill="#f7d84a"/><ellipse cx="120" cy="70" rx="12" ry="10" fill="#f2c230"/>';
}

function stag({ morph }) {
  const pal = morph === 'gold' ? ['#d6a52a', '#f2e27a', '#b58418'] : morph === 'blue' ? ['#2f6fd1', '#7fd3e8', '#24509a'] : ['#2fa86a', '#d6c23a', '#1f7a4c'];
  const [main, sheen, dark] = pal;
  const half = `<g stroke="#1d2b25" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M106 72 L80 58 L66 36"/><path d="M102 100 L72 104 L52 122"/><path d="M106 122 L82 150 L74 178"/></g>`
    + `<path d="M112 34 Q86 18 100 2" stroke="${dark}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M98 14 l-6 -2" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>`;
  return mirror(half)
    + `<ellipse cx="120" cy="130" rx="30" ry="44" fill="${main}"/>`
    + `<path d="M120 90 V172" stroke="${dark}" stroke-width="2"/>`
    + `<ellipse cx="102" cy="126" rx="5" ry="30" fill="${sheen}" opacity=".7"/><ellipse cx="138" cy="126" rx="5" ry="30" fill="${sheen}" opacity=".5"/>`
    + `<ellipse cx="120" cy="72" rx="24" ry="16" fill="${main}"/><ellipse cx="112" cy="68" rx="8" ry="4" fill="${sheen}" opacity=".6"/>`
    + `<ellipse cx="120" cy="46" rx="16" ry="11" fill="${dark}"/>`
    + '<circle cx="106" cy="44" r="2.6" fill="#111"/><circle cx="134" cy="44" r="2.6" fill="#111"/>';
}

function hercules({ damp }) {
  const shell = damp ? '#4a3a22' : '#b8a65a';
  const spot = damp ? '#2b2010' : '#1d1a17';
  const half = '<g stroke="#1d1a17" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M104 74 L80 62 L68 44"/><path d="M98 104 L70 110 L54 128"/><path d="M102 128 L80 154 L72 180"/></g>';
  return mirror(half)
    + `<ellipse cx="120" cy="134" rx="34" ry="44" fill="${shell}"/>`
    + `<path d="M120 94 V176" stroke="${spot}" stroke-width="2"/>`
    + `<g fill="${spot}"><circle cx="104" cy="116" r="4"/><circle cx="136" cy="124" r="3.5"/><circle cx="110" cy="146" r="3"/><circle cx="132" cy="154" r="4"/><circle cx="100" cy="134" r="2.5"/><circle cx="142" cy="140" r="2.5"/></g>`
    + `<ellipse cx="120" cy="78" rx="28" ry="20" fill="${shell}"/>`
    + '<path d="M120 70 L120 6" stroke="#1d1a17" stroke-width="11" stroke-linecap="round"/><path d="M120 40 l-10 -4 M120 40 l10 -4" stroke="#1d1a17" stroke-width="4" stroke-linecap="round"/>'
    + '<ellipse cx="120" cy="56" rx="12" ry="8" fill="#1d1a17"/>';
}

const ART = {
  redKnee, gbb, argiope, crab, peacock, scorpion, pinacate, bdfb, ladybird, grasshopper, bee, monarch,
  pillbug, ducky, dairycow, woodlouse, bold, regal, harvestman, millipede, earwig, rosy, stag, hercules,
};

export function creatureArt(sp, ctx = {}) {
  return ART[sp.art]({ morph: ctx.morph || null, stage: ctx.stage ?? sp.stages.length - 1, damp: !!ctx.damp, premolt: !!ctx.premolt });
}

export function creatureSVG(sp, ctx = {}, opts = {}) {
  const label = opts.label ?? sp.name;
  const cls = opts.cls ? ` class="${opts.cls}"` : '';
  return `<svg viewBox="0 0 240 200"${cls} role="img" aria-label="${esc(label)}">${creatureArt(sp, ctx)}</svg>`;
}

// ---------- Enclosure scene ----------

// Small top-down prey for leftovers, sized by prey type.
function preySVG(x, y, size) {
  const k = [0, 0.45, 0.7, 1, 1.25][size] || 1;
  return `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-14 -4 L-22 -10 M-14 4 L-22 10 M-4 -5 L-8 -14 M-4 5 L-8 14 M6 -5 L10 -14 M6 5 L10 14 M14 -2 L26 -12 M14 2 L26 12" stroke="#5a4028" stroke-width="2" stroke-linecap="round"/><ellipse rx="16" ry="6.5" fill="#8a6a3a"/><circle cx="-15" r="4.5" fill="#5a4028"/></g>`;
}

// env: { web, burrow, leftoverSize, colony, molting, dirty, dryDish }
export function sceneSVG(c, sp, ctx, label, env = {}) {
  const desert = sp.set === 'desert';
  const deep = c.decor.includes('deep');
  const top = deep ? 166 : 190;
  const wall = desert ? '#efe2c4' : '#d9ead0';
  const sub = desert ? '#e0c088' : '#8a6a48';
  const sub2 = desert ? '#d0ad72' : '#76583a';
  let s = `<rect width="350" height="250" fill="${wall}"/>`;
  if (c.decor.includes('plants')) {
    s += '<path d="M60 200 Q56 140 30 110 M64 200 Q70 130 96 100 M60 200 Q60 150 62 96" stroke="#4f7f3f" stroke-width="3" fill="none"/>'
      + '<g fill="#6c9b52"><ellipse cx="30" cy="110" rx="14" ry="8" transform="rotate(35 30 110)"/><ellipse cx="96" cy="100" rx="14" ry="8" transform="rotate(-35 96 100)"/><ellipse cx="62" cy="94" rx="8" ry="14"/><ellipse cx="40" cy="140" rx="12" ry="7" transform="rotate(20 40 140)"/><ellipse cx="84" cy="134" rx="12" ry="7" transform="rotate(-25 84 134)"/></g>';
  }
  if (c.decor.includes('branch')) {
    s += `<path d="M150 ${top + 6} Q200 120 300 40" stroke="#8a6a48" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M230 92 L252 70 M270 62 L292 70" stroke="#8a6a48" stroke-width="5" stroke-linecap="round"/>`;
  }
  s += `<path d="M0 ${top} Q90 ${top - 12} 175 ${top - 2} T350 ${top - 4} L350 250 L0 250 Z" fill="${sub}"/>`;
  if (deep) s += `<path d="M0 ${top + 34} Q120 ${top + 26} 220 ${top + 36} T350 ${top + 32} L350 250 L0 250 Z" fill="${sub2}"/>`;
  s += `<g fill="${sub2}"><circle cx="40" cy="${top + 22}" r="2"/><circle cx="150" cy="${top + 40}" r="2"/><circle cx="260" cy="${top + 28}" r="2"/><circle cx="320" cy="${top + 48}" r="2"/></g>`;
  if (c.decor.includes('hide')) {
    s += `<path d="M236 ${top + 10} Q252 ${top - 48} 300 ${top - 42} Q334 ${top - 36} 344 ${top + 10} Z" fill="#9b7652"/><path d="M258 ${top - 22} Q276 ${top - 32} 300 ${top - 28}" stroke="#6e4f33" stroke-width="2" fill="none"/><ellipse cx="292" cy="${top + 6}" rx="22" ry="10" fill="#3b2a1d"/>`;
  }
  if (c.decor.includes('water')) {
    s += `<ellipse cx="64" cy="${top + 28}" rx="34" ry="12" fill="#c9c2b4"/><ellipse cx="64" cy="${top + 26}" rx="26" ry="7.5" fill="${env.dryDish ? '#a8a092' : '#7cc4d8'}"/>`;
  }
  if (env.burrow > 0.25 && deep) {
    const r = 10 + 14 * env.burrow;
    s += `<ellipse cx="196" cy="${top + 14}" rx="${r + 10}" ry="${r * 0.45 + 4}" fill="${sub2}"/><ellipse cx="196" cy="${top + 14}" rx="${r}" ry="${r * 0.4}" fill="#2b1d14"/>`;
  }
  if (env.dirty) {
    s += `<g fill="#5a4636" opacity=".8"><circle cx="120" cy="${top + 30}" r="3"/><circle cx="230" cy="${top + 40}" r="2.5"/><circle cx="170" cy="${top + 50}" r="3.5"/><circle cx="300" cy="${top + 22}" r="2.5"/></g>`;
  }
  if (env.colony) {
    const n = Math.min(10, env.colony);
    const spots = [[60, 0], [150, 12], [250, 4], [110, 30], [200, 36], [30, 40], [290, 34], [170, 54], [80, 58], [320, 56]];
    for (let i = 0; i < n; i++) {
      const [x, dy] = spots[i];
      s += `<svg x="${x - 22}" y="${top - 14 + dy}" width="44" height="37" viewBox="0 0 240 200"><g transform="rotate(${(i * 47) % 360} 120 100)">${creatureArt(sp, ctx)}</g></svg>`;
    }
  } else {
    const flip = env.molting ? ' transform="rotate(180 120 100)"' : '';
    s += `<svg x="80" y="${top - 140}" width="190" height="158" viewBox="0 0 240 200"><g class="critter"><g${flip}>${creatureArt(sp, ctx)}</g></g></svg>`;
  }
  if (env.leftoverSize) s += preySVG(290, top + 16, env.leftoverSize);
  if (env.web > 0.05) {
    const o = (0.15 + env.web * 0.55).toFixed(2);
    s += `<g stroke="#fff" stroke-width="1.4" fill="none" opacity="${o}"><path d="M0 0 L140 ${top - 10} M0 40 L120 ${top - 6} M60 0 L150 ${top - 14} M350 0 L230 ${top - 8} M350 50 L250 ${top - 4}"/><path d="M20 22 Q60 20 70 0 M30 60 Q80 60 100 10 M40 100 Q100 100 128 30 M320 30 Q290 20 290 0 M310 80 Q260 70 250 10"/>${env.web > 0.6 ? `<path d="M0 ${top - 30} Q175 ${top - 60} 350 ${top - 30}" stroke-width="2"/><path d="M0 ${top - 10} Q175 ${top - 34} 350 ${top - 12}"/>` : ''}</g>`;
  }
  s += '<path d="M300 0 L340 0 L200 250 L160 250 Z" fill="#fff" opacity=".07"/>';
  return `<svg viewBox="0 0 350 250" class="scene-svg" role="img" aria-label="${esc(label)}">${s}</svg>`;
}

// ---------- Meadow plots ----------

const flower = (x, y, c, center = '#f4b81c') => `<g transform="translate(${x} ${y})"><circle cy="-5" r="4.5" fill="${c}"/><circle cx="5" r="4.5" fill="${c}"/><circle cy="5" r="4.5" fill="${c}"/><circle cx="-5" r="4.5" fill="${c}"/><circle r="3" fill="${center}"/></g>`;

const PLOT_ART = {
  wildflowers: () => '<path d="M24 92 V66 M48 96 V56 M72 92 V68 M96 94 V58 M120 92 V70 M140 94 V62" stroke="#5f9e4e" stroke-width="2.5" stroke-linecap="round"/>'
    + flower(24, 62, '#f59ac0') + flower(48, 52, '#9b8cf2') + flower(72, 64, '#ffffff') + flower(96, 54, '#f08a24', '#7a3d0c') + flower(120, 66, '#f59ac0') + flower(140, 58, '#9b8cf2'),
  sandbank: () => '<path d="M10 100 Q40 40 90 46 Q140 50 152 100 Z" fill="#e3c58e"/><g fill="#7a5a36"><circle cx="60" cy="70" r="3"/><circle cx="84" cy="62" r="3"/><circle cx="104" cy="76" r="3"/><circle cx="74" cy="84" r="3"/></g><g fill="#b9a98a"><ellipse cx="30" cy="94" rx="10" ry="6"/><ellipse cx="132" cy="92" rx="12" ry="7"/></g>',
  beehotel: () => '<path d="M52 30 L80 12 L108 30 Z" fill="#7a4f2c"/><rect x="56" y="30" width="48" height="52" rx="3" fill="#b07a4a"/><g fill="#3a2a1d"><circle cx="66" cy="40" r="3.2"/><circle cx="76" cy="40" r="3.2"/><circle cx="86" cy="40" r="3.2"/><circle cx="96" cy="40" r="3.2"/><circle cx="66" cy="52" r="3.2"/><circle cx="76" cy="52" r="3.2"/><circle cx="86" cy="52" r="3.2"/><circle cx="96" cy="52" r="3.2"/><circle cx="66" cy="64" r="3.2"/><circle cx="76" cy="64" r="3.2"/><circle cx="86" cy="64" r="3.2"/><circle cx="96" cy="64" r="3.2"/></g><path d="M80 82 V96" stroke="#7a4f2c" stroke-width="5"/>' + flower(30, 80, '#f59ac0') + flower(132, 76, '#ffffff'),
  logpile: () => '<rect x="44" y="70" width="80" height="20" rx="10" fill="#8a5f3c"/><rect x="38" y="50" width="74" height="20" rx="10" fill="#9b6c45"/><rect x="54" y="30" width="62" height="20" rx="10" fill="#8a5f3c"/><g fill="#d9ab78" stroke="#8a5f3c" stroke-width="1.5"><circle cx="44" cy="80" r="10"/><circle cx="38" cy="60" r="10"/><circle cx="54" cy="40" r="10"/></g><g fill="none" stroke="#8a5f3c"><circle cx="44" cy="80" r="4.5"/><circle cx="38" cy="60" r="4.5"/><circle cx="54" cy="40" r="4.5"/></g>',
  woodland: () => '<rect width="160" height="100" fill="#8fbf7a"/><g fill="#6b4a2c"><rect x="28" y="30" width="10" height="64"/><rect x="104" y="20" width="12" height="74"/></g><g fill="#3f7a46"><circle cx="33" cy="26" r="24"/><circle cx="110" cy="18" r="28"/><circle cx="70" cy="30" r="20"/></g><path d="M56 96 Q60 76 70 72 M64 96 Q72 80 84 80 M140 96 Q138 80 128 74" stroke="#2f6b3a" stroke-width="3" fill="none" stroke-linecap="round"/><g fill="#f7f0a0"><circle cx="60" cy="58" r="2.5"/><circle cx="96" cy="66" r="2.5"/><circle cx="136" cy="52" r="2.5"/></g>',
  pond: () => '<ellipse cx="80" cy="60" rx="58" ry="30" fill="#8cc9e0"/><ellipse cx="80" cy="60" rx="48" ry="22" fill="#9fd6ea"/><path d="M64 66 a10 7 0 1 0 10 -5 L66 64 Z" fill="#5f9e4e"/><path d="M128 50 V20 M136 54 V28 M24 52 V30" stroke="#4f7f3f" stroke-width="3" stroke-linecap="round"/>',
  rockery: () => '<g fill="#a9a8a0"><ellipse cx="50" cy="78" rx="30" ry="18"/><ellipse cx="104" cy="80" rx="34" ry="20"/><ellipse cx="78" cy="52" rx="26" ry="18"/></g><g fill="#c4c3bb"><ellipse cx="44" cy="72" rx="12" ry="6"/><ellipse cx="72" cy="46" rx="10" ry="5"/></g><path d="M128 64 L132 50 L136 64 M20 90 L24 78 L28 90" stroke="#5f9e4e" stroke-width="3" fill="none" stroke-linecap="round"/>' + flower(140, 50, '#f2c230', '#b2620f'),
};

export function plotSVG(p, st) {
  let bg = '#a9d48c';
  let art;
  if (st.state === 'overgrown') {
    bg = '#b3ab8a';
    art = '<path d="M10 40 Q30 20 48 44 T86 34 T124 48 T156 36 M8 68 Q30 50 54 72 T100 62 T150 74 M14 92 Q40 76 64 94 T112 86 T152 96" stroke="#6d6347" stroke-width="3" fill="none" stroke-linecap="round"/><g fill="#6d6347"><circle cx="40" cy="36" r="2.5"/><circle cx="96" cy="64" r="2.5"/><circle cx="130" cy="90" r="2.5"/></g>';
  } else if (st.state === 'restoring') {
    bg = '#c9b98f';
    art = '<path d="M30 92 Q56 52 90 58 Q124 62 130 92 Z" fill="#a8946a"/><path d="M128 14 L104 70" stroke="#6b5235" stroke-width="5" stroke-linecap="round"/><path d="M98 66 L112 74 L106 86 L92 78 Z" fill="#9aa3a8"/>';
  } else {
    art = PLOT_ART[p.id]();
  }
  return `<svg viewBox="0 0 160 100" aria-hidden="true"><rect width="160" height="100" fill="${bg}"/>${art}</svg>`;
}

// ---------- Jar ----------

export function jarSVG(set) {
  const tint = SETS[set].tint;
  return `<svg viewBox="0 0 200 240" class="jar-svg" role="img" aria-label="A cloth-covered glass jar with something moving inside">
    <rect x="40" y="56" width="120" height="168" rx="34" fill="#e4eee8" opacity=".9"/>
    <path d="M52 200 Q78 172 100 192 Q122 170 148 198 L148 208 Q100 220 52 208 Z" fill="${tint}"/>
    <path d="M66 190 Q86 150 118 158 Q98 184 66 190 Z" fill="#6c9b52"/>
    <g class="jar-mystery" fill="${INK}" opacity=".5"><ellipse cx="116" cy="136" rx="16" ry="12"/><path d="M104 130 L88 120 M104 138 L86 140 M128 130 L144 120 M128 138 L146 140" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></g>
    <rect x="40" y="56" width="120" height="168" rx="34" fill="none" stroke="#8fa597" stroke-width="4"/>
    <path d="M58 84 Q54 140 62 196" stroke="#fff" stroke-width="7" opacity=".55" fill="none" stroke-linecap="round"/>
    <rect x="52" y="40" width="96" height="22" rx="6" fill="#c9d6cc"/>
    <path d="M34 46 Q100 20 166 46 L158 68 Q100 56 42 68 Z" fill="#d9c29a"/>
    <path d="M42 62 Q100 74 158 62" stroke="#8a5f3c" stroke-width="3" fill="none"/>
    <g fill="#ffc861"><path d="M0 -9 L2.6 -2.6 L9 0 L2.6 2.6 L0 9 L-2.6 2.6 L-9 0 L-2.6 -2.6 Z" transform="translate(24 110)"/><path d="M0 -9 L2.6 -2.6 L9 0 L2.6 2.6 L0 9 L-2.6 2.6 L-9 0 L-2.6 -2.6 Z" transform="translate(178 150) scale(.7)"/></g>
  </svg>`;
}

// ---------- Icons ----------

const icon = (d, extra = '') => `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${extra}>${d}</svg>`;

export const ICON = {
  meadow: icon('<path d="M12 21 V12"/><path d="M12 12 C8 12 6 9 6 6 C9 6 12 8 12 12 Z"/><path d="M12 12 C16 12 18 9 18 6 C15 6 12 8 12 12 Z"/>'),
  jar: icon('<rect x="6" y="7" width="12" height="14" rx="4"/><path d="M7 4 H17 V7 H7 Z"/>'),
  shelf: icon('<path d="M3 11 L12 4 L21 11 V20 H3 Z"/><path d="M9 20 V14 H15 V20"/>'),
  journal: icon('<path d="M5 4 H17 a2 2 0 0 1 2 2 V20 H7 a2 2 0 0 1 -2 -2 Z"/><path d="M5 18 a2 2 0 0 1 2 -2 H19"/>'),
  back: icon('<path d="M15 5 L8 12 L15 19"/>'),
  pencil: icon('<path d="M4 20 L8 19 L19 8 L16 5 L5 16 Z"/>'),
  bug: icon('<path d="M9 7 a3 3 0 0 1 6 0"/><path d="M8 10 H16 V15 a4 4 0 0 1 -8 0 Z"/><path d="M4 12 H8 M16 12 H20 M5 17 H8 M16 17 H19 M10 4 L8 2 M14 4 L16 2"/>'),
  drop: icon('<path d="M12 3 C12 3 5 11 5 15 a7 7 0 0 0 14 0 C19 11 12 3 12 3 Z"/>'),
  leaf: icon('<path d="M5 19 C5 9 11 4 20 4 C20 13 15 19 5 19 Z"/><path d="M5 19 L13 11"/>'),
  check: icon('<path d="M5 12 L10 17 L19 7"/>', ' stroke-width="3"'),
  pollen: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><g fill="#f4b81c"><circle cx="12" cy="6" r="4"/><circle cx="18" cy="12" r="4"/><circle cx="12" cy="18" r="4"/><circle cx="6" cy="12" r="4"/></g><circle cx="12" cy="12" r="3" fill="#b2620f"/></svg>',
  silk: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="#7b4fc4" stroke-width="2" stroke-linecap="round"><path d="M12 3 V21 M3 12 H21 M5.5 5.5 L18.5 18.5 M18.5 5.5 L5.5 18.5"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="8"/></svg>',
};
