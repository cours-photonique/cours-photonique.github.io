/* ======================= Utilitaires ======================= */
const $ = id => document.getElementById(id);
const PI = Math.PI;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function tok(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function fr(v, d) {
  if (!isFinite(v)) return '—';
  if (d === undefined) { const a = Math.abs(v); d = a === 0 ? 0 : a >= 100 ? 1 : a >= 10 ? 2 : a >= 1 ? 3 : 4; }
  return v.toFixed(d).replace('.', ',').replace('-', '−');
}
/* Texte SVG avec indices / exposants : "n_{sub}", "x^2" */
function sv(s) {
  s = String(s); let out = '', i = 0;
  while (i < s.length) {
    const c = s[i];
    if ((c === '_' || c === '^') && i + 1 < s.length) {
      let t;
      if (s[i + 1] === '{') { const j = s.indexOf('}', i + 2); t = s.slice(i + 2, j); i = j + 1; }
      else { t = s[i + 1]; i += 2; }
      const dy = c === '_' ? 4 : -6;
      out += `<tspan dy="${dy}" font-size="78%">${esc(t)}</tspan><tspan dy="${-dy}">​</tspan>`;
    } else { out += esc(c); i++; }
  }
  return out;
}
const T = (x, y, s, cls = 't', anchor = 'start', extra = '') => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}" ${extra}>${sv(s)}</text>`;
const A = (x1, y1, x2, y2, cls = 's-ink', mk = 'ah', w = 1.5, extra = '') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" stroke-width="${w}" marker-end="url(#${mk})" ${extra}/>`;
const A2 = (x1, y1, x2, y2, cls = 's-ink', mk = 'ah', w = 1.2) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" stroke-width="${w}" marker-end="url(#${mk})" marker-start="url(#${mk})"/>`;
const L = (x1, y1, x2, y2, cls = 's-ink', w = 1, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" stroke-width="${w}" ${extra}/>`;
const R = (x, y, w, h, cls, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls}" ${extra}/>`;
const dot = (x, y, cls = 's-mut', lab, lx, ly, anchor = 'end') =>
  `<circle cx="${x}" cy="${y}" r="5" class="${cls}" stroke-width="1.3"/><circle cx="${x}" cy="${y}" r="1.7" class="${cls.replace('s-', 'f-')}"/>` + (lab ? T(lx, ly, lab, 't s m b', anchor) : '');
/* Repère : r = axe vers la droite, u = vers le haut, out = sortant (⊙), ob = oblique (vers l'observateur) */
function triad(x, y, o) {
  const Lg = 30; let s = '<g>';
  if (o.r) s += A(x, y, x + Lg, y, 's-mut', 'ahm', 1.3) + T(x + Lg + 5, y + 4, o.r, 't s m b');
  if (o.u) s += A(x, y, x, y - Lg, 's-mut', 'ahm', 1.3) + T(x, y - Lg - 6, o.u, 't s m b', 'middle');
  if (o.d) s += A(x, y, x, y + Lg, 's-mut', 'ahm', 1.3) + T(x + 6, y + Lg + 2, o.d, 't s m b');
  if (o.ob) s += A(x, y, x - 18, y + 12, 's-mut', 'ahm', 1.3) + T(x - 22, y + 24, o.ob, 't s m b', 'middle');
  if (o.out) s += `<circle cx="${x}" cy="${y}" r="5" class="s-mut" stroke-width="1.3"/><circle cx="${x}" cy="${y}" r="1.6" class="f-mut"/>` + T(x - 9, y + 15, o.out, 't s m b', 'end');
  else s += `<circle cx="${x}" cy="${y}" r="1.8" class="f-mut"/>`;
  return s + '</g>';
}
const svgWrap = (w, h, inner, label = '') => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label)}">${inner}</svg>`;

/* ======================= Tracé de courbes (SVG) ======================= */
let CLIP = 0;
function niceStep(range, n) { const raw = range / n; const p = Math.pow(10, Math.floor(Math.log10(raw))); const f = raw / p; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p; }
function mkTicks(a, b, n = 5, step) { const s = step || niceStep(b - a, n); const out = []; for (let t = Math.ceil(a / s - 1e-9) * s; t <= b + 1e-9 * Math.abs(s) + 1e-12; t += s) out.push(+t.toFixed(10)); return { list: out, step: s }; }
function tickFmt(t, step) { let d = 0; while (d < 6 && Math.abs(step * Math.pow(10, d) - Math.round(step * Math.pow(10, d))) > 1e-6) d++; return t.toFixed(d).replace('.', ',').replace('-', '−'); }
function plot(o) {
  const m = Object.assign({ l: 54, r: 16, t: 12, b: 40 }, o.m || {});
  const W = o.w, H = o.h, pw = W - m.l - m.r, ph = H - m.t - m.b;
  const [x0, x1] = o.xr, [y0, y1] = o.yr;
  const X = x => m.l + (x - x0) / (x1 - x0) * pw, Y = y => m.t + ph - (y - y0) / (y1 - y0) * ph;
  const id = 'cp' + (++CLIP); const lim = (y1 - y0) * 3;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(o.aria || 'graphique')}"><defs><clipPath id="${id}"><rect x="${m.l}" y="${m.t}" width="${pw}" height="${ph}"/></clipPath></defs>`;
  s += `<rect x="${m.l}" y="${m.t}" width="${pw}" height="${ph}" class="f-paper"/>`;
  (o.bands || []).forEach(b => {
    const a = Math.max(x0, b.x0), c = Math.min(x1, b.x1);
    if (c > a) { s += `<rect x="${X(a)}" y="${m.t}" width="${X(c) - X(a)}" height="${ph}" class="${b.cls}"/>`; if (b.lab && X(c) - X(a) > 30) s += T((X(a) + X(c)) / 2, m.t + 14, b.lab, 't s m', 'middle'); }
  });
  (o.rects || []).forEach(b => {
    const xa = X(Math.max(x0, b.x0)), xb = X(Math.min(x1, b.x1)), ya = Y(Math.min(y1, b.y1)), yb = Y(Math.max(y0, b.y0));
    if (xb > xa && yb > ya) s += `<rect x="${xa}" y="${ya}" width="${xb - xa}" height="${yb - ya}" class="${b.cls}"/>`;
  });
  const xt = o.xticks || mkTicks(x0, x1, o.nx || 6, o.xstep), yt = o.yticks || mkTicks(y0, y1, o.ny || 5, o.ystep);
  if (o.minor) {
    for (let t = Math.ceil(x0 / (xt.step / 5)) * xt.step / 5; t <= x1; t += xt.step / 5) s += `<line x1="${X(t)}" x2="${X(t)}" y1="${m.t}" y2="${m.t + ph}" class="grid" opacity=".55"/>`;
    for (let t = Math.ceil(y0 / (yt.step / 5)) * yt.step / 5; t <= y1; t += yt.step / 5) s += `<line x1="${m.l}" x2="${m.l + pw}" y1="${Y(t)}" y2="${Y(t)}" class="grid" opacity=".55"/>`;
  }
  xt.list.forEach(t => { s += `<line x1="${X(t)}" x2="${X(t)}" y1="${m.t}" y2="${m.t + ph}" class="grid"/>`; if (!o.noxl) s += T(X(t), m.t + ph + 15, (o.xfmt || tickFmt)(t, xt.step), 't s m', 'middle'); });
  yt.list.forEach(t => { s += `<line x1="${m.l}" x2="${m.l + pw}" y1="${Y(t)}" y2="${Y(t)}" class="grid"/>`; s += T(m.l - 6, Y(t) + 4, (o.yfmt || tickFmt)(t, yt.step), 't s m', 'end'); });
  s += `<rect x="${m.l}" y="${m.t}" width="${pw}" height="${ph}" class="axis" fill="none"/>`;
  if (o.xl) s += T(m.l + pw / 2, H - 7, o.xl, 't s', 'middle');
  if (o.yl) s += `<text transform="translate(13 ${m.t + ph / 2}) rotate(-90)" class="t s" text-anchor="middle">${sv(o.yl)}</text>`;
  s += `<g clip-path="url(#${id})">`;
  (o.fills || []).forEach(f => { s += `<polygon points="${f.pts.map(([x, y]) => `${X(x).toFixed(2)},${Y(Math.max(y0 - lim, Math.min(y1 + lim, y))).toFixed(2)}`).join(' ')}" class="${f.cls}" ${f.op ? `opacity="${f.op}"` : ''}/>`; });
  (o.vlines || []).forEach(v => { s += L(X(v.x), m.t, X(v.x), m.t + ph, v.cls || 's-mut', v.w || 1, v.dash ? `stroke-dasharray="${v.dash}"` : ''); });
  (o.hlines || []).forEach(h => { s += L(m.l, Y(h.y), m.l + pw, Y(h.y), h.cls || 's-mut', h.w || 1, h.dash ? `stroke-dasharray="${h.dash}"` : ''); });
  (o.series || []).forEach(se => {
    let segs = [], cur = [];
    se.pts.forEach(([x, y]) => {
      if (!isFinite(y) || !isFinite(x)) { if (cur.length) segs.push(cur); cur = []; return; }
      const yy = Math.max(y0 - lim, Math.min(y1 + lim, y));
      cur.push(`${X(x).toFixed(2)},${Y(yy).toFixed(2)}`);
    });
    if (cur.length) segs.push(cur);
    segs.forEach(sg => { s += `<polyline points="${sg.join(' ')}" fill="none" class="${se.cls || 'c0'}" stroke-width="${se.w || 2}" ${se.dash ? `stroke-dasharray="${se.dash}"` : ''} ${se.op ? `opacity="${se.op}"` : ''} stroke-linejoin="round"/>`; });
  });
  (o.dots || []).forEach(d => { if (isFinite(d.x) && isFinite(d.y)) s += `<circle cx="${X(d.x)}" cy="${Y(d.y)}" r="${d.r || 4.5}" class="${d.cls || 'fc0'}" stroke="var(--paper)" stroke-width="1.5"/>`; });
  s += '</g>';
  (o.hlines || []).forEach(h => { if (h.lab && h.y >= y0 && h.y <= y1) s += T(h.lx !== undefined ? X(h.lx) : m.l + pw - 4, Y(h.y) - 4, h.lab, h.lcls || 't s m', h.anchor || 'end'); });
  (o.vlines || []).forEach(v => { if (v.lab && v.x >= x0 && v.x <= x1) s += T(X(v.x) + (v.ldx || 4), m.t + (v.ly || 26), v.lab, v.lcls || 't s m', v.anchor || 'start'); });
  (o.texts || []).forEach(t => { if (t.x >= x0 && t.x <= x1 && t.y >= y0 && t.y <= y1) s += T(X(t.x) + (t.dx || 0), Y(t.y) + (t.dy || 0), t.t, t.cls || 't s', t.anchor || 'start', t.style ? `style="${t.style}"` : ''); });
  (o.dims || []).forEach(d => { const ya = Y(d.y), xa = X(d.x0), xb = X(d.x1); s += A2(xa, ya, xb, ya, d.cls || 's-ink', d.mk || 'ah', 1.1) + T((xa + xb) / 2, ya - 5, d.lab, d.lcls || 't s', 'middle'); });
  s += '</svg>';
  return s;
}
function combine(w, h, parts, label = '') {
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label)}">` +
    parts.map(p => p.svg.replace('<svg ', `<svg x="${p.x}" y="${p.y}" `)).join('') + (parts.extra || '') + '</svg>';
}
const linspace = (a, b, n) => Array.from({ length: n }, (_, i) => a + (b - a) * i / (n - 1));
const plotW = el => Math.max(300, Math.floor((el.clientWidth || 600)));

/* ======================= Cartes de champ (canvas) ======================= */
function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function drawMap(cv, o) {
  // o : {xr, yr, wCss, hCss, grid(nx, ny, xs, ys) -> Float32Array, mode:'signed'|'int', overlay(ctx, X, Y), xl, yl}
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = o.wCss, H = o.hCss;
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const m = Object.assign({ l: 42, r: 10, t: 10, b: 32 }, o.m || {});
  const pw = W - m.l - m.r, ph = H - m.t - m.b;
  const [x0, x1] = o.xr, [y0, y1] = o.yr;
  const X = x => m.l + (x - x0) / (x1 - x0) * pw, Y = y => m.t + ph - (y - y0) / (y1 - y0) * ph;
  ctx.fillStyle = tok('--paper'); ctx.fillRect(0, 0, W, H);
  const nx = Math.max(2, Math.round(pw)), ny = Math.max(2, Math.round(ph));
  const xs = linspace(x0, x1, nx), ys = linspace(y1, y0, ny);
  const g = o.grid(nx, ny, xs, ys);
  const off = document.createElement('canvas'); off.width = nx; off.height = ny;
  const octx = off.getContext('2d'); const img = octx.createImageData(nx, ny);
  const P = hex2rgb(tok('--paper')), Pos = hex2rgb(tok('--pos')), Neg = hex2rgb(tok('--neg')), F = hex2rgb(tok('--field'));
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const v = g[j * nx + i]; let c;
    if (o.mode === 'int') { const t = Math.min(1, Math.max(0, v)); c = [P[0] + (F[0] - P[0]) * t, P[1] + (F[1] - P[1]) * t, P[2] + (F[2] - P[2]) * t]; }
    else { const t = Math.min(1, Math.abs(v)); const C = v >= 0 ? Pos : Neg; c = [P[0] + (C[0] - P[0]) * t, P[1] + (C[1] - P[1]) * t, P[2] + (C[2] - P[2]) * t]; }
    const k = 4 * (j * nx + i); img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.drawImage(off, m.l, m.t, pw, ph);
  ctx.save(); ctx.beginPath(); ctx.rect(m.l, m.t, pw, ph); ctx.clip();
  if (o.overlay) o.overlay(ctx, X, Y);
  ctx.restore();
  // axes
  const ink = tok('--ink'), mut = tok('--muted');
  ctx.strokeStyle = mut; ctx.lineWidth = 1; ctx.strokeRect(m.l + .5, m.t + .5, pw - 1, ph - 1);
  ctx.fillStyle = mut; ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace';
  const xt = mkTicks(x0, x1, Math.max(3, Math.floor(pw / 70))), yt = mkTicks(y0, y1, Math.max(3, Math.floor(ph / 45)));
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  xt.list.forEach(t => { const x = X(t); ctx.beginPath(); ctx.moveTo(x, m.t + ph); ctx.lineTo(x, m.t + ph + 4); ctx.stroke(); ctx.fillText(tickFmt(t, xt.step), x, m.t + ph + 6); });
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  yt.list.forEach(t => { const y = Y(t); ctx.beginPath(); ctx.moveTo(m.l - 4, y); ctx.lineTo(m.l, y); ctx.stroke(); ctx.fillText(tickFmt(t, yt.step), m.l - 6, y); });
  ctx.fillStyle = ink; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
  if (o.xl) ctx.fillText(o.xl, m.l + pw, H - 3);
  if (o.yl) { ctx.save(); ctx.translate(11, m.t); ctx.rotate(-PI / 2); ctx.textAlign = 'right'; ctx.fillText(o.yl, 0, 0); ctx.restore(); }
  // petit repère dans le coin
  if (o.frame) {
    const fx = m.l + 12, fy = m.t + ph - 12, Lg = 22;
    ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
    const arr = (x1_, y1_, x2_, y2_) => { ctx.beginPath(); ctx.moveTo(x1_, y1_); ctx.lineTo(x2_, y2_); ctx.stroke(); const a = Math.atan2(y2_ - y1_, x2_ - x1_); ctx.beginPath(); ctx.moveTo(x2_, y2_); ctx.lineTo(x2_ - 6 * Math.cos(a - .4), y2_ - 6 * Math.sin(a - .4)); ctx.lineTo(x2_ - 6 * Math.cos(a + .4), y2_ - 6 * Math.sin(a + .4)); ctx.fill(); };
    arr(fx, fy, fx + Lg, fy); arr(fx, fy, fx, fy - Lg);
    ctx.font = '600 11px "IBM Plex Mono", monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(o.frame[0], fx + Lg + 3, fy); ctx.textAlign = 'center'; ctx.fillText(o.frame[1], fx, fy - Lg - 7);
  }
}

/* ======================= Construction des labos ======================= */
function buildLab(hostId, cfg) {
  const host = $(hostId);
  if (cfg.intro) host.insertAdjacentHTML('beforeend', `<p class="lab-intro">${cfg.intro}</p>`);
  let presetsEl = null;
  if (cfg.presets) {
    presetsEl = document.createElement('div'); presetsEl.className = 'presets';
    presetsEl.innerHTML = '<span>Préréglages :</span>' + cfg.presets.map((p, i) => `<button type="button" class="pre" data-i="${i}" aria-pressed="${i === 0 ? 'true' : 'false'}">${p.name}</button>`).join('');
    host.appendChild(presetsEl);
  }
  const wrap = document.createElement('div'); wrap.className = 'ctrls';
  cfg.ctrls.forEach(d => {
    const c = document.createElement('div'); c.className = 'ctl';
    if (d.type === 'select') {
      c.innerHTML = `<label for="${d.id}"><span>${d.label}</span></label><select id="${d.id}">${d.opts.map(o => `<option value="${o[0]}"${o[0] === d.val ? ' selected' : ''}>${o[1]}</option>`).join('')}</select>`;
    } else {
      c.innerHTML = `<label for="${d.id}"><span>${d.label}</span><span>${d.unit || ''}</span></label><div class="row"><input type="range" id="${d.id}-r" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.val}" aria-label="${d.aria || d.id}"><input type="number" id="${d.id}" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.val}"></div>`;
    }
    wrap.appendChild(c);
  });
  host.appendChild(wrap);
  const out = document.createElement('div'); out.style.display = 'grid'; out.style.gap = '14px'; out.innerHTML = cfg.out; host.appendChild(out);
  const api = {
    get(id) { const d = cfg.ctrls.find(c => c.id === id); const el = $(id); return d.type === 'select' ? el.value : parseFloat(el.value); },
    set(id, v) { const d = cfg.ctrls.find(c => c.id === id); const el = $(id); el.value = v; if (d.type !== 'select') $(id + '-r').value = v; }
  };
  let raf = 0;
  const fire = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => cfg.render(api)); };
  const unpress = () => { if (presetsEl) presetsEl.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false')); };
  cfg.ctrls.forEach(d => {
    if (d.type === 'select') { $(d.id).addEventListener('change', () => { unpress(); fire(); }); return; }
    const r = $(d.id + '-r'), n = $(d.id);
    r.addEventListener('input', () => { n.value = r.value; unpress(); fire(); });
    n.addEventListener('input', () => { const v = parseFloat(n.value); if (isFinite(v)) { r.value = v; unpress(); fire(); } });
  });
  if (presetsEl) presetsEl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const p = cfg.presets[+b.dataset.i];
    Object.entries(p.v).forEach(([k, v]) => api.set(k, v));
    presetsEl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    fire();
  });
  if (cfg.presets) Object.entries(cfg.presets[0].v).forEach(([k, v]) => api.set(k, v));
  RENDERERS.push(() => cfg.render(api));
  cfg.render(api);
  return api;
}
const RENDERERS = [];
const ro = (k, v, cls = '') => `<div class="ro ${cls}"><div class="k">${k}</div><div class="v">${v}</div></div>`;
const MODECLS = ['c0', 'c1', 'c2', 'c3', 'c4'];
const MODEFC = ['fc0', 'fc1', 'fc2', 'fc3', 'fc4'];
const MODEVAR = ['--field', '--m1', '--m2', '--m3', '--m4'];

