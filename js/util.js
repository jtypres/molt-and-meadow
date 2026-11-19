export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function fmt(n) {
  n = Math.floor(n);
  if (n < 1000) return String(n);
  for (const [u, v] of [['B', 1e9], ['M', 1e6], ['K', 1e3]]) {
    if (n >= v) {
      const x = n / v;
      return (x >= 100 ? String(Math.floor(x)) : x.toFixed(1).replace(/\.0$/, '')) + u;
    }
  }
  return String(n);
}

export function fmtRate(r) {
  return r < 10 ? r.toFixed(1).replace(/\.0$/, '') : fmt(r);
}

export function fmtDur(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
}
