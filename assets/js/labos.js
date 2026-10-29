/* ======================= Labo 1 : solveur du guide plan ======================= */
function lab1() {
  buildLab('lab1-body', {
    intro: 'Réglez le guide : le solveur résout la relation de dispersion (TE ou TM) par dichotomie et trace tous les modes guidés. Le second graphe montre la résolution graphique : chaque intersection de F(n<sub>eff</sub>) avec une droite mπ est un mode.',
    presets: [
      { name: 'Exemple du cours (3 modes)', v: { l1lam: 1, l1d: 4, l1nc: 1.55, l1ns: 1.5, l1nu: 1, l1pol: 'TE' } },
      { name: 'Exercice 1 · région B', v: { l1lam: 0.8, l1d: 1.8, l1nc: 2.234, l1ns: 2.214, l1nu: 1, l1pol: 'TE' } },
      { name: 'LiNbO₃ vertical (TM)', v: { l1lam: 1.55, l1d: 4.49, l1nc: 2.145, l1ns: 2.14, l1nu: 1, l1pol: 'TM' } },
      { name: 'Si 220 nm sur silice', v: { l1lam: 1.55, l1d: 0.22, l1nc: 3.476, l1ns: 1.444, l1nu: 1, l1pol: 'TE' } }
    ],
    ctrls: [
      { id: 'l1lam', label: 'λ', unit: 'µm', min: 0.4, max: 2, step: 0.005, val: 1 },
      { id: 'l1d', label: 'd (épaisseur du cœur)', unit: 'µm', min: 0.05, max: 10, step: 0.005, val: 4 },
      { id: 'l1nc', label: 'n<sub>c</sub> (cœur)', min: 1, max: 3.6, step: 0.001, val: 1.55 },
      { id: 'l1ns', label: 'n<sub>sub</sub> (substrat)', min: 1, max: 3.6, step: 0.001, val: 1.5 },
      { id: 'l1nu', label: 'n<sub>sup</sub> (superstrat)', min: 1, max: 3.6, step: 0.001, val: 1 },
      { id: 'l1pol', label: 'Polarisation', type: 'select', val: 'TE', opts: [['TE', 'TE — champ tracé Ey'], ['TM', 'TM — champ tracé Hy']] }
    ],
    out: `<div class="readout" id="l1-ro"></div>
      <div class="plots"><div class="plot"><div class="pt">Profil d'indice n(x) et profils des modes</div><div id="l1-prof"></div></div>
      <div class="plot"><div class="pt">Résolution graphique : F(n<sub>eff</sub>) = mπ</div><div id="l1-graph"></div></div></div>
      <div class="tbl" id="l1-tbl"></div><p class="note" id="l1-note"></p>`,
    render(api) {
      const p = { lam: api.get('l1lam'), d: api.get('l1d'), nc: api.get('l1nc'), nsub: api.get('l1ns'), nsup: api.get('l1nu'), pol: api.get('l1pol') };
      const nhi = Math.max(p.nsub, p.nsup), nlo = Math.min(p.nsub, p.nsup);
      if (!(p.nc > nhi) || !(p.lam > 0) || !(p.d > 0)) {
        $('l1-ro').innerHTML = ro('Paramètres', 'il faut n<sub>c</sub> &gt; n<sub>sub</sub> et n<sub>sup</sub>', 'bad');
        ['l1-prof', 'l1-graph', 'l1-tbl'].forEach(i => $(i).innerHTML = ''); $('l1-note').textContent = ''; return;
      }
      const ms = PH.slabModes(p), N = ms.length, k = 2 * PI / p.lam;
      const V = k * p.d * Math.sqrt(p.nc ** 2 - nhi ** 2), a = (nhi ** 2 - nlo ** 2) / (p.nc ** 2 - nhi ** 2);
      const dNext = PH.dCut(N, p.lam, p.nc, nhi, nlo, p.pol);
      const lc0 = PH.lamCut(0, p.d, p.nc, nhi, nlo, p.pol);
      $('l1-ro').innerHTML = ro('V (fréquence normalisée)', fr(V)) + ro('a (asymétrie)', fr(a)) +
        ro('Modes guidés', N, N === 1 ? 'good' : N === 0 ? 'bad' : '') +
        ro(`d<sub>c,${N}</sub> : apparition du mode ${N}`, fr(dNext) + ' µm') +
        ro('λ<sub>c,0</sub> : coupure du fondamental', a < 1e-12 ? '∞ (symétrique)' : fr(lc0) + ' µm');
      // profils
      const el = $('l1-prof'), W = plotW(el);
      if (!N) { el.innerHTML = '<p class="note" style="padding:20px">Aucun mode guidé : le guide est sous la coupure du fondamental.</p>'; }
      else {
        const m0 = ms[0];
        const Ls = Math.max(Math.min(4 / m0.asub, 5 * p.d + 3 * p.lam), 0.6 * p.d), Lu = Math.max(Math.min(4 / m0.asup, 5 * p.d + 3 * p.lam), 0.6 * p.d);
        const xr = [-p.d / 2 - Ls, p.d / 2 + Lu], dn = p.nc - nhi;
        const show = ms.slice(0, 6);
        const top = plot({ w: W, h: 100, xr, yr: [nhi - 0.35 * dn, p.nc + 0.15 * dn], m: { l: 58, r: 12, t: 8, b: 14 }, noxl: true, ny: 2, yl: 'n',
          bands: [{ x0: -1e9, x1: -p.d / 2, cls: 'band-sub' }, { x0: -p.d / 2, x1: p.d / 2, cls: 'band-core' }, { x0: p.d / 2, x1: 1e9, cls: 'band-sup' }],
          series: [{ pts: [[xr[0], p.nsub], [-p.d / 2, p.nsub], [-p.d / 2, p.nc], [p.d / 2, p.nc], [p.d / 2, p.nsup], [xr[1], p.nsup]], cls: 'cI', w: 1.8 }],
          hlines: show.map((m, i) => ({ y: m.neff, cls: MODECLS[i % 5], dash: '5 3' })) });
        const bot = plot({ w: W, h: 230, xr, yr: [-1.15, 1.15], m: { l: 58, r: 12, t: 4, b: 40 }, xl: 'x (µm) — normale aux couches', yl: p.pol === 'TE' ? 'E_y (normalisé)' : 'H_y (normalisé)', ny: 4,
          bands: [{ x0: -1e9, x1: -p.d / 2, cls: 'band-sub', lab: 'substrat' }, { x0: -p.d / 2, x1: p.d / 2, cls: 'band-core', lab: 'cœur' }, { x0: p.d / 2, x1: 1e9, cls: 'band-sup', lab: 'superstrat' }],
          series: show.map((m, i) => ({ pts: linspace(xr[0], xr[1], 500).map(x => [x, m.f(x)]), cls: MODECLS[i % 5], w: 2 })),
          hlines: [{ y: 0, cls: 's-mut' }] });
        el.innerHTML = combine(W, 330, [{ x: 0, y: 0, svg: top }, { x: 0, y: 100, svg: bot }], 'Profils des modes') +
          `<div class="legend">${show.map((m, i) => `<span><i style="background:var(${MODEVAR[i % 5]})"></i>m = ${i}</span>`).join('')}${N > 6 ? '<span>(6 premiers modes tracés)</span>' : ''}</div>`;
      }
      // résolution graphique
      const g = $('l1-graph'), Wg = plotW(g);
      const ns = linspace(nhi + 1e-9, p.nc - 1e-9, 300), Fs = ns.map(n => PH.slabF(n, p));
      const Fmax = Math.max(PI, Fs[0]);
      g.innerHTML = plot({ w: Wg, h: 330, xr: [nhi, p.nc], yr: [-PI - 0.4, Fmax + 0.6], m: { l: 58, r: 14, t: 12, b: 40 }, xl: 'n_{eff}', yl: 'F(n_{eff}) (rad)', nx: 4,
        series: [{ pts: ns.map((n, i) => [n, Fs[i]]), cls: 'cI', w: 2.2 }],
        hlines: Array.from({ length: Math.min(N + 1, 30) }, (_, m) => ({ y: m * PI, cls: 's-acc', dash: '4 3', lab: m === 0 ? '0' : m + 'π', lcls: 't s acc', anchor: 'end' })),
        dots: ms.slice(0, 30).map((m, i) => ({ x: m.neff, y: i * PI, cls: MODEFC[i % 5] })),
        vlines: [{ x: nhi, cls: 's-mut' }] });
      // tableau
      $('l1-tbl').innerHTML = N ? `<table><thead><tr><th>m</th><th class="num">n<sub>eff</sub></th><th class="num">b</th><th class="num">Γ</th><th class="num">d<sub>eff</sub> (µm)</th><th class="num">1/α<sub>sub</sub> (µm)</th><th class="num">1/α<sub>sup</sub> (µm)</th></tr></thead><tbody>` +
        ms.map(m => `<tr><td>${m.m}</td><td class="num">${fr(m.neff, 5)}</td><td class="num">${fr((m.neff ** 2 - nhi ** 2) / (p.nc ** 2 - nhi ** 2), 3)}</td><td class="num">${fr(m.gamma, 3)}</td><td class="num">${fr(m.deff, 3)}</td><td class="num">${fr(1 / m.asub, 3)}</td><td class="num">${fr(1 / m.asup, 3)}</td></tr>`).join('') + '</tbody></table>' : '';
      $('l1-note').textContent = `Γ est calculé sur |ψ|². ${p.pol === 'TM' ? 'En TM le champ tracé est Hy : sa dérivée est discontinue aux interfaces (facteur 1/n²).' : 'En TE, Ey et sa dérivée sont continus aux interfaces.'}`;
    }
  });
}

/* ======================= Labo 2 : fenêtre monomode ======================= */
function lab2() {
  buildLab('lab2-body', {
    intro: 'Le labo cherche, sur les quatre combinaisons extrêmes des indices, la plus grande épaisseur de coupure du fondamental à λ<sub>2</sub> et la plus petite épaisseur de coupure du mode 1 à λ<sub>1</sub>. La zone verte est la fenêtre monomode ; la bande ambrée montre l’épaisseur nominale conseillée avec sa tolérance d’homogénéité.',
    presets: [
      { name: 'SiON sur silice', v: { l2a: 1.5, l2b: 1.6, l2nc: 1.48, l2dnc: 0.002, l2ns: 1.444, l2dns: 0.001, l2nu: 1, l2h: 5, l2pol: 'TE' } },
      { name: 'Modulateur Ti:LiNbO₃ (TM)', v: { l2a: 1.5, l2b: 1.6, l2nc: 2.145, l2dnc: 0, l2ns: 2.14, l2dns: 0, l2nu: 1, l2h: 0, l2pol: 'TM' } },
      { name: 'Contraste trop faible', v: { l2a: 1.5, l2b: 1.6, l2nc: 1.452, l2dnc: 0.004, l2ns: 1.444, l2dns: 0.002, l2nu: 1, l2h: 5, l2pol: 'TE' } }
    ],
    ctrls: [
      { id: 'l2a', label: 'λ<sub>1</sub>', unit: 'µm', min: 0.4, max: 2, step: 0.005, val: 1.5 },
      { id: 'l2b', label: 'λ<sub>2</sub>', unit: 'µm', min: 0.4, max: 2.2, step: 0.005, val: 1.6 },
      { id: 'l2nc', label: 'n<sub>c</sub>', min: 1, max: 3.6, step: 0.001, val: 1.48 },
      { id: 'l2dnc', label: 'Δn<sub>c</sub>', min: 0, max: 0.02, step: 0.0005, val: 0.002 },
      { id: 'l2ns', label: 'n<sub>sub</sub>', min: 1, max: 3.6, step: 0.001, val: 1.444 },
      { id: 'l2dns', label: 'Δn<sub>sub</sub>', min: 0, max: 0.02, step: 0.0005, val: 0.001 },
      { id: 'l2nu', label: 'n<sub>sup</sub>', min: 1, max: 3.6, step: 0.001, val: 1 },
      { id: 'l2h', label: 'Homogénéité d’épaisseur', unit: '± %', min: 0, max: 15, step: 0.5, val: 5 },
      { id: 'l2pol', label: 'Polarisation', type: 'select', val: 'TE', opts: [['TE', 'TE'], ['TM', 'TM']] }
    ],
    out: `<div class="readout" id="l2-ro"></div><div class="plot"><div class="pt">Épaisseurs de coupure en fonction de λ</div><div id="l2-plot"></div>
      <div class="legend"><span><i style="background:var(--field)"></i>d<sub>c,0</sub> nominal</span><span><i style="background:var(--field);opacity:.5"></i>d<sub>c,0</sub> pire cas (tirets)</span><span><i style="background:var(--m1)"></i>d<sub>c,1</sub> nominal</span><span><i style="background:var(--m1);opacity:.5"></i>d<sub>c,1</sub> pire cas (tirets)</span></div></div>`,
    render(api) {
      const l1 = api.get('l2a'), l2 = api.get('l2b'), nc = api.get('l2nc'), dnc = api.get('l2dnc'), ns = api.get('l2ns'), dns = api.get('l2dns'), nu = api.get('l2nu'), h = api.get('l2h') / 100, pol = api.get('l2pol');
      const roEl = $('l2-ro'), pl = $('l2-plot');
      if (!(l2 > l1) || !(nc > ns) || !(ns >= nu)) { roEl.innerHTML = ro('Paramètres', !(l2 > l1) ? 'il faut λ₂ > λ₁' : !(ns >= nu) ? 'convention n_sub ≥ n_sup' : 'il faut n_c > n_sub', 'bad'); pl.innerHTML = ''; return; }
      const tech = nc - dnc > ns + dns;
      const C = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      const dc = (m, lam, a, b) => PH.dCut(m, lam, nc + a * dnc, ns + b * dns, nu, pol);
      const dc0max = lam => Math.max(...C.map(([a, b]) => dc(0, lam, a, b)));
      const dc1min = lam => Math.min(...C.map(([a, b]) => dc(1, lam, a, b)));
      if (!tech) { roEl.innerHTML = ro('Contrainte technologique', 'n<sub>c</sub> − Δn<sub>c</sub> ≤ n<sub>sub</sub> + Δn<sub>sub</sub> : le guide peut ne pas guider', 'bad'); pl.innerHTML = ''; return; }
      const dmin = dc0max(l2), dmax = dc1min(l1), ratio = dmax / dmin, need = (1 + h) / (1 - h);
      const lo = dmin / (1 - h), hi = dmax / (1 + h), ok = lo <= hi, d0 = (lo + hi) / 2;
      roEl.innerHTML = ro('d<sub>c,0</sub><sup>max</sup>(λ<sub>2</sub>)', fr(dmin) + ' µm') + ro('d<sub>c,1</sub><sup>min</sup>(λ<sub>1</sub>)', fr(dmax) + ' µm') +
        ro('Rapport d<sub>max</sub>/d<sub>min</sub>', fr(ratio, 3) + ` (≥ ${fr(need, 3)} requis)`, ratio >= need ? 'good' : 'bad') +
        ro('Épaisseur nominale conseillée', ok ? `${fr(d0)} µm` : 'impossible', ok ? 'good' : 'bad') +
        ro('Plage nominale admissible', ok ? `${fr(lo)} – ${fr(hi)} µm` : '—');
      const W = plotW(pl), dl = l2 - l1, xr = [Math.max(0.2, l1 - 0.4 * dl), l2 + 0.4 * dl], ls = linspace(xr[0], xr[1], 120);
      const nom0 = ls.map(l => [l, PH.dCut(0, l, nc, ns, nu, pol)]), nom1 = ls.map(l => [l, PH.dCut(1, l, nc, ns, nu, pol)]);
      const w0 = ls.map(l => [l, dc0max(l)]), w1 = ls.map(l => [l, dc1min(l)]);
      const ymax = Math.max(...nom1.map(p => p[1])) * 1.08;
      const rects = [];
      if (dmax > dmin) rects.push({ x0: l1, x1: l2, y0: dmin, y1: dmax, cls: 'band-win' });
      if (ok) rects.push({ x0: l1, x1: l2, y0: d0 * (1 - h), y1: d0 * (1 + h), cls: 'band-amb' });
      pl.innerHTML = plot({ w: W, h: 320, xr, yr: [0, ymax], m: { l: 54, r: 14, t: 12, b: 40 }, xl: 'λ (µm)', yl: 'épaisseur d (µm)',
        rects, series: [{ pts: nom0, cls: 'c0', w: 2 }, { pts: w0, cls: 'c0', w: 1.6, dash: '5 4' }, { pts: nom1, cls: 'c1', w: 2 }, { pts: w1, cls: 'c1', w: 1.6, dash: '5 4' }],
        vlines: [{ x: l1, cls: 's-mut', dash: '3 3', lab: 'λ₁', ly: 16 }, { x: l2, cls: 's-mut', dash: '3 3', lab: 'λ₂', ly: 16 }],
        hlines: [{ y: dmin, cls: 'cA', dash: '2 3', lab: `d_{min} = ${fr(dmin)}`, lx: xr[0] + 0.01 * dl, anchor: 'start', lcls: 't s acc' }, { y: dmax, cls: 'cA', dash: '2 3', lab: `d_{max} = ${fr(dmax)}`, lx: xr[0] + 0.01 * dl, anchor: 'start', lcls: 't s acc' }] });
    }
  });
}

/* ======================= Labo 3 : abaque b-V ======================= */
const BVCACHE = {};
function bvFamilies(Vmax) {
  if (BVCACHE[Vmax]) return BVCACHE[Vmax];
  const out = [];
  [0, 1, 10, Infinity].forEach(a => [0, 1, 2, 3, 4].forEach(p => {
    const vc = PH.Vcut(a, p); if (vc >= Vmax) return;
    const pts = linspace(vc + 1e-6, Vmax, 140).map(V => [V, PH.bOfV(V, a, p)]);
    out.push({ a, p, pts: [[vc, 0], ...pts] });
  }));
  return (BVCACHE[Vmax] = out);
}
function lab3() {
  buildLab('lab3-body', {
    intro: 'Abaques b-V recalculés : en gris, les courbes b(V) pour a = 0, 1, 10 et ∞ (de gauche à droite dans chaque famille p). En couleur, la courbe de votre guide ; le trait vertical marque son V et les points donnent b pour chaque mode.',
    presets: [
      { name: 'Exercice 1 · région A', v: { l3lam: 0.8, l3d: 1, l3ng: 2.234, l3ns: 2.214, l3nu: 1, l3z: 'full' } },
      { name: 'Exercice 1 · région B', v: { l3lam: 0.8, l3d: 1.8, l3ng: 2.234, l3ns: 2.214, l3nu: 1, l3z: 'full' } },
      { name: 'Exercice 1 · latéral (a = 0)', v: { l3lam: 0.8, l3d: 1, l3ng: 2.2273, l3ns: 2.2195, l3nu: 2.2195, l3z: 'zoom' } },
      { name: 'Exercice 2 · vertical', v: { l3lam: 1, l3d: 1.5, l3ng: 2.2, l3ns: 2.12, l3nu: 1, l3z: 'full' } },
      { name: 'Exercice 2 · latéral p = 0', v: { l3lam: 1, l3d: 2, l3ng: 2.1836, l3ns: 2.12, l3nu: 2.12, l3z: 'full' } }
    ],
    ctrls: [
      { id: 'l3lam', label: 'λ', unit: 'µm', min: 0.4, max: 2, step: 0.005, val: 0.8 },
      { id: 'l3d', label: 'd', unit: 'µm', min: 0.05, max: 10, step: 0.005, val: 1 },
      { id: 'l3ng', label: 'n<sub>g</sub> (cœur)', min: 1, max: 3.6, step: 0.0001, val: 2.234 },
      { id: 'l3ns', label: 'n<sub>sub</sub>', min: 1, max: 3.6, step: 0.0001, val: 2.214 },
      { id: 'l3nu', label: 'n<sub>sup</sub>', min: 1, max: 3.6, step: 0.0001, val: 1 },
      { id: 'l3z', label: 'Échelle', type: 'select', val: 'full', opts: [['full', 'V de 0 à 16 (abaque gauche)'], ['zoom', 'V de 0 à 5 (abaque droit)']] }
    ],
    out: `<div class="readout" id="l3-ro"></div><div class="plot"><div class="pt">b en fonction de V — relation normalisée TE</div><div id="l3-plot"></div></div><div class="tbl" id="l3-tbl"></div>`,
    render(api) {
      let lam = api.get('l3lam'), d = api.get('l3d'), ng = api.get('l3ng'), ns = api.get('l3ns'), nu = api.get('l3nu'), z = api.get('l3z');
      let note = '';
      if (nu > ns) { [ns, nu] = [nu, ns]; note = ' (n_sub et n_sup échangés)'; }
      if (!(ng > ns)) { $('l3-ro').innerHTML = ro('Paramètres', 'il faut n<sub>g</sub> &gt; n<sub>sub</sub>', 'bad'); $('l3-plot').innerHTML = ''; $('l3-tbl').innerHTML = ''; return; }
      const V = 2 * PI / lam * d * Math.sqrt(ng * ng - ns * ns), a = (ns * ns - nu * nu) / (ng * ng - ns * ns);
      const Vmax = z === 'zoom' ? 5 : Math.max(16, Math.ceil(V * 1.1));
      const fam = bvFamilies(Vmax);
      const pmax = []; for (let p = 0; p < 40 && PH.Vcut(a, p) < Vmax; p++) pmax.push(p);
      const mine = pmax.map(p => ({ pts: linspace(PH.Vcut(a, p) + 1e-6, Vmax, 200).map(v => [v, PH.bOfV(v, a, p)]), cls: MODECLS[p % 5], w: 2.6 }));
      const res = []; for (let p = 0; p < 60; p++) { const b = PH.bOfV(V, a, p); if (isNaN(b)) break; res.push({ p, b, n: Math.sqrt(ns * ns + b * (ng * ng - ns * ns)) }); }
      $('l3-ro').innerHTML = ro('V', fr(V)) + ro('a' + note, isFinite(a) ? fr(a) : '∞') + ro('Modes guidés', res.length, res.length === 1 ? 'good' : res.length ? '' : 'bad') +
        (res[0] ? ro('b (p = 0)', fr(res[0].b, 3)) + ro('n<sub>eff</sub> (p = 0)', fr(res[0].n, 4)) : '');
      const el = $('l3-plot'), W = plotW(el);
      const labs = [0, 1, 2].filter(p => p * PI + 0.4 < Vmax).map(p => ({ x: p * PI + (z === 'zoom' ? 0.15 : 0.5), y: 0.96, t: `p = ${p}`, cls: 't s b' }));
      el.innerHTML = plot({ w: W, h: 360, xr: [0, Vmax], yr: [0, 1], m: { l: 46, r: 14, t: 12, b: 40 }, xl: 'V', yl: 'b', minor: true, xstep: z === 'zoom' ? 1 : 2, ystep: 0.1,
        series: fam.filter(f => f.p <= 2).map(f => ({ pts: f.pts, cls: 'cM', w: 1, op: 0.75 })).concat(mine),
        vlines: [{ x: V, cls: 'cA', w: 2, lab: `V = ${fr(V, 2)}`, lcls: 't s acc', ly: 40 }],
        dots: res.map(r => ({ x: V, y: r.b, cls: MODEFC[r.p % 5], r: 5 })), texts: labs });
      $('l3-tbl').innerHTML = res.length ? `<table><thead><tr><th>p</th><th class="num">V<sub>c,p</sub></th><th class="num">b</th><th class="num">n<sub>eff</sub></th></tr></thead><tbody>` +
        res.map(r => `<tr><td>${r.p}</td><td class="num">${fr(PH.Vcut(a, r.p), 3)}</td><td class="num">${fr(r.b, 4)}</td><td class="num">${fr(r.n, 5)}</td></tr>`).join('') + '</tbody></table>' : '<p class="note" style="padding:10px">V est sous la coupure du mode fondamental : aucun mode guidé.</p>';
    }
  });
}

/* ======================= Labo 4 : EIM ======================= */
function lab4() {
  let sel = 0;
  const api = buildLab('lab4-body', {
    intro: 'Étape ① : guides plans verticaux dans la région I (sous l’arête, cœur h<sub>I</sub>) et dans la région II (cœur h<sub>II</sub> ; h<sub>II</sub> = 0 signifie qu’il n’y a pas de couche guidante et que le cœur affleure dans le substrat). Étape ② : guide latéral symétrique de largeur W. Cliquez sur un mode pour afficher sa carte ψ ≈ φ(x)χ(y).',
    presets: [
      { name: 'Exercice 1 (arête)', v: { l4lam: 0.8, l4nu: 1, l4nc: 2.234, l4ns: 2.214, l4hI: 1.8, l4hII: 1, l4W: 1, l4pol: 'TE/TE' } },
      { name: 'Exercice 2 (ruban, λ = 1 µm)', v: { l4lam: 1, l4nu: 1, l4nc: 2.2, l4ns: 2.12, l4hI: 1.5, l4hII: 0, l4W: 2, l4pol: 'TE/TE' } },
      { name: 'Modulateur Ti:LiNbO₃ (Q4)', v: { l4lam: 1.55, l4nu: 1, l4nc: 2.145, l4ns: 2.14, l4hI: 4.49, l4hII: 0, l4W: 8.24, l4pol: 'qTM' } }
    ],
    ctrls: [
      { id: 'l4lam', label: 'λ', unit: 'µm', min: 0.4, max: 2, step: 0.005, val: 0.8 },
      { id: 'l4nu', label: 'n<sub>sup</sub>', min: 1, max: 3.6, step: 0.001, val: 1 },
      { id: 'l4nc', label: 'n<sub>c</sub> (cœur)', min: 1, max: 3.6, step: 0.001, val: 2.234 },
      { id: 'l4ns', label: 'n<sub>sub</sub>', min: 1, max: 3.6, step: 0.001, val: 2.214 },
      { id: 'l4hI', label: 'h<sub>I</sub> (cœur sous l’arête)', unit: 'µm', min: 0.05, max: 8, step: 0.005, val: 1.8 },
      { id: 'l4hII', label: 'h<sub>II</sub> (cœur hors arête)', unit: 'µm', min: 0, max: 8, step: 0.005, val: 1 },
      { id: 'l4W', label: 'W (largeur)', unit: 'µm', min: 0.1, max: 15, step: 0.01, val: 1 },
      { id: 'l4pol', label: 'Polarisation', type: 'select', val: 'TE/TE', opts: [['TE/TE', 'Scalaire TE/TE (exercices)'], ['qTE', 'Quasi-TE (TE vert., TM lat.)'], ['qTM', 'Quasi-TM (TM vert., TE lat.)']] }
    ],
    out: `<div class="readout" id="l4-ro"></div><div class="tbl" id="l4-tbl"></div><div class="mode-pick" id="l4-pick"></div>
      <div class="plot"><div class="pt" id="l4-cap">Carte du mode</div><canvas id="l4-map" width="600" height="300"></canvas></div>`,
    render(api) {
      const lam = api.get('l4lam'), nsup = api.get('l4nu'), nc = api.get('l4nc'), nsub = api.get('l4ns'), hI = api.get('l4hI'), hII = api.get('l4hII'), W = api.get('l4W'), pol = api.get('l4pol');
      const polV = pol === 'qTM' ? 'TM' : 'TE', polH = pol === 'qTE' ? 'TM' : 'TE', name = pol === 'qTM' ? 'TM' : 'TE';
      const roEl = $('l4-ro');
      if (!(nc > Math.max(nsub, nsup)) || !(hI > 0) || hII >= hI) {
        roEl.innerHTML = ro('Paramètres', hII >= hI ? 'il faut h<sub>II</sub> &lt; h<sub>I</sub>' : 'il faut n<sub>c</sub> &gt; n<sub>sub</sub>, n<sub>sup</sub>', 'bad');
        $('l4-tbl').innerHTML = ''; $('l4-pick').innerHTML = ''; const c = $('l4-map'); c.getContext('2d').clearRect(0, 0, c.width, c.height); return;
      }
      const r = PH.eim({ lam, nsup, nc, nsub, hI, hII, W, polV, polH });
      roEl.innerHTML = ro('① n<sub>slab,I</sub> (région I)', r.vI.length ? r.vI.map(m => fr(m.neff, 5)).join(' · ') : 'aucun mode', r.vI.length ? '' : 'bad') +
        ro('① n<sub>slab,II</sub> (région II)', hII > 0 ? (r.vII.length ? r.vII.map(m => fr(m.neff, 5)).join(' · ') : 'aucun mode → n<sub>sub</sub>') : `n<sub>sub</sub> = ${fr(nsub, 4)}`) +
        ro('② Modes du guide canal', r.modes.length, r.modes.length === 1 ? 'good' : r.modes.length ? '' : 'bad');
      if (!r.modes.length) { $('l4-tbl').innerHTML = '<p class="note" style="padding:10px">Pas de mode guidé : soit la région I est sous la coupure verticale, soit n<sub>slab,I</sub> ≤ n<sub>slab,II</sub> (pas de confinement latéral).</p>'; $('l4-pick').innerHTML = ''; const c = $('l4-map'); c.getContext('2d').clearRect(0, 0, c.width, c.height); return; }
      if (sel >= r.modes.length) sel = 0;
      $('l4-tbl').innerHTML = `<table><thead><tr><th>Mode</th><th class="num">n<sub>slab,I</sub></th><th class="num">n<sub>slab,II</sub></th><th class="num">V latéral</th><th class="num">b latéral</th><th class="num">n<sub>eff</sub></th></tr></thead><tbody>` +
        r.modes.map(m => `<tr><td>${name}<sub>${m.p}${m.q}</sub></td><td class="num">${fr(m.nslabI, 5)}</td><td class="num">${fr(m.nslabII, 5)}</td><td class="num">${fr(m.Vlat, 3)}</td><td class="num">${fr(m.blat, 3)}</td><td class="num">${fr(m.neff, 5)}</td></tr>`).join('') + '</tbody></table>';
      $('l4-pick').innerHTML = r.modes.map((m, i) => `<button type="button" class="pre" data-i="${i}" aria-pressed="${i === sel}">${name}${m.p}${m.q}</button>`).join('');
      $('l4-pick').onclick = e => { const b = e.target.closest('button'); if (!b) return; sel = +b.dataset.i; RENDER_L4(); };
      const md = r.modes[sel];
      $('l4-cap').textContent = `Carte de ${name}${md.p}${md.q} : ψ(x,y) ≈ φ(x)χ(y), n_eff = ${fr(md.neff, 5)} (rouge +, bleu −)`;
      const cv = $('l4-map');
      eimMap(cv, r, md, { hI, hII, W }, plotW(cv.parentElement) - 12);
    }
  });
  const idx = RENDERERS.length - 1; RENDER_L4 = () => RENDERERS[idx]();
}
let RENDER_L4 = () => {};

/* ======================= Labo 5 : recouvrement ======================= */
function lab5() {
  let sel = 0;
  buildLab('lab5-body', {
    intro: 'Un faisceau gaussien ψ<sub>exc</sub> = exp(−(x − x<sub>0</sub>)²/w<sub>0</sub>²) arrive sur la facette d’un guide plan. Le labo calcule l’intégrale de recouvrement η avec chaque mode guidé. Ce qui n’est couplé dans aucun mode guidé part dans les modes rayonnés.',
    presets: [
      { name: 'Guide bimode centré', v: { l5lam: 1.55, l5d: 4, l5nc: 1.47, l5ns: 1.445, l5nu: 1.445, l5w: 2.5, l5x: 0 } },
      { name: 'Faisceau décentré', v: { l5lam: 1.55, l5d: 4, l5nc: 1.47, l5ns: 1.445, l5nu: 1.445, l5w: 2.5, l5x: 1.5 } },
      { name: 'Guide asymétrique (air)', v: { l5lam: 1.55, l5d: 1.2, l5nc: 1.6, l5ns: 1.444, l5nu: 1, l5w: 1, l5x: 0 } }
    ],
    ctrls: [
      { id: 'l5lam', label: 'λ', unit: 'µm', min: 0.4, max: 2, step: 0.005, val: 1.55 },
      { id: 'l5d', label: 'd', unit: 'µm', min: 0.1, max: 12, step: 0.01, val: 4 },
      { id: 'l5nc', label: 'n<sub>c</sub>', min: 1, max: 3.6, step: 0.0005, val: 1.47 },
      { id: 'l5ns', label: 'n<sub>sub</sub>', min: 1, max: 3.6, step: 0.0005, val: 1.445 },
      { id: 'l5nu', label: 'n<sub>sup</sub>', min: 1, max: 3.6, step: 0.0005, val: 1.445 },
      { id: 'l5w', label: 'w<sub>0</sub> (rayon du faisceau)', unit: 'µm', min: 0.2, max: 15, step: 0.05, val: 2.5 },
      { id: 'l5x', label: 'x<sub>0</sub> (décentrement)', unit: 'µm', min: -8, max: 8, step: 0.05, val: 0 }
    ],
    out: `<div class="readout" id="l5-ro"></div><div class="mode-pick" id="l5-pick"></div>
      <div class="plots"><div class="plot"><div class="pt">Faisceau incident et mode visé</div><div id="l5-prof"></div><div class="legend"><span><i style="background:var(--amber-line)"></i>ψ<sub>exc</sub> (tirets)</span><span><i style="background:var(--field)"></i>φ<sub>m</sub> des modes guidés</span></div></div><div class="plot"><div class="pt">η en fonction de w<sub>0</sub> (x<sub>0</sub> fixé)</div><div id="l5-eta"></div></div></div>`,
    render(api) {
      const p = { lam: api.get('l5lam'), d: api.get('l5d'), nc: api.get('l5nc'), nsub: api.get('l5ns'), nsup: api.get('l5nu'), pol: 'TE' };
      const w = api.get('l5w'), x0 = api.get('l5x');
      if (!(p.nc > Math.max(p.nsub, p.nsup)) || !(w > 0)) { $('l5-ro').innerHTML = ro('Paramètres', 'il faut n<sub>c</sub> &gt; n<sub>sub</sub>, n<sub>sup</sub>', 'bad'); return; }
      const ms = PH.slabModes(p);
      if (!ms.length) { $('l5-ro').innerHTML = ro('Guide', 'aucun mode guidé', 'bad'); $('l5-prof').innerHTML = $('l5-eta').innerHTML = $('l5-pick').innerHTML = ''; return; }
      if (sel >= ms.length) sel = 0;
      const m0 = ms[0];
      const xa = Math.min(-p.d / 2 - 7 / m0.asub, x0 - 4.5 * w), xb = Math.max(p.d / 2 + 7 / m0.asup, x0 + 4.5 * w);
      const gauss = (ww, xx) => x => Math.exp(-((x - xx) ** 2) / (ww * ww));
      const etas = ms.map(m => PH.overlap(gauss(w, x0), m.f, xa, xb, 3000));
      const tot = etas.reduce((s, v) => s + v, 0);
      $('l5-ro').innerHTML = ro(`η vers le mode ${sel}`, fr(100 * etas[sel], 1) + ' %', etas[sel] > 0.8 ? 'good' : '') +
        etas.map((e, i) => i === sel ? '' : ro(`η mode ${i}`, fr(100 * e, 1) + ' %')).join('') +
        ro('Total guidé', fr(100 * tot, 1) + ' %') + ro('Perdu (rayonné)', fr(100 * Math.max(0, 1 - tot), 1) + ' %', 1 - tot > 0.3 ? 'bad' : '');
      $('l5-pick').innerHTML = '<span class="note" style="align-self:center">Mode visé :</span>' + ms.map((m, i) => `<button type="button" class="pre" data-i="${i}" aria-pressed="${i === sel}">m = ${i}</button>`).join('');
      $('l5-pick').onclick = e => { const b = e.target.closest('button'); if (!b) return; sel = +b.dataset.i; RENDERERS[L5IDX](); };
      const el = $('l5-prof'), W = plotW(el);
      const xd = Math.max(p.d / 2 + 3.5 / m0.asub, p.d / 2 + 3.5 / m0.asup, Math.abs(x0) + 2.8 * w, p.d);
      const xs = linspace(-xd, xd, 500);
      el.innerHTML = plot({ w: W, h: 260, xr: [-xd, xd], yr: [-1.15, 1.15], m: { l: 46, r: 12, t: 12, b: 40 }, xl: 'x (µm) — normale aux couches', yl: 'champ (normalisé)', ny: 4,
        bands: [{ x0: -p.d / 2, x1: p.d / 2, cls: 'band-core', lab: 'cœur' }],
        series: ms.map((m, i) => ({ pts: xs.map(x => [x, m.f(x)]), cls: MODECLS[i % 5], w: i === sel ? 2.4 : 1.2, op: i === sel ? 1 : 0.35 })).concat([{ pts: xs.map(x => [x, gauss(w, x0)(x)]), cls: 'cA', w: 2.4, dash: '6 4' }]),
        hlines: [{ y: 0, cls: 's-mut' }] });
      const e2 = $('l5-eta'), W2 = plotW(e2);
      const wmax = Math.max(12, 3 * p.d), ws = Array.from({ length: 70 }, (_, i) => 0.2 * Math.pow(wmax / 0.2, i / 69));
      const tgt = ms[sel];
      const ev = ws.map(ww => [ww, PH.overlap(gauss(ww, x0), tgt.f, Math.min(xa, x0 - 4.5 * ww), Math.max(xb, x0 + 4.5 * ww), 2000)]);
      let best = ev[0]; ev.forEach(v => { if (v[1] > best[1]) best = v; });
      e2.innerHTML = plot({ w: W2, h: 260, xr: [0, wmax], yr: [0, 1.05], m: { l: 46, r: 12, t: 12, b: 40 }, xl: 'w_0 (µm)', yl: 'η', ystep: 0.2,
        series: [{ pts: ev, cls: MODECLS[sel % 5], w: 2.2 }], dots: [{ x: w, y: etas[sel], cls: 'fc0', r: 5 }],
        vlines: [{ x: best[0], cls: 'cA', dash: '4 3', lab: `optimum w₀ ≈ ${fr(best[0], 2)} µm, η = ${fr(100 * best[1], 1)} %`, lcls: 't s acc', ly: 196, anchor: best[0] > wmax * 0.55 ? 'end' : 'start', ldx: best[0] > wmax * 0.55 ? -4 : 4 }] });
    }
  });
  L5IDX = RENDERERS.length - 1;
}
let L5IDX = 0;

/* ======================= Labo 6 : coupleur ======================= */
function lab6() {
  buildLab('lab6-body', {
    intro: 'Deux guides plans identiques (cœur d, indice n<sub>c</sub>) dans une gaine n<sub>cl</sub>, séparés de g. Le solveur calcule exactement les supermodes pair et impair (TE) de la structure à cinq couches, puis la longueur de couplage et l’échange de puissance.',
    presets: [
      { name: 'Silice dopée, g = 1 µm', v: { l6lam: 1.55, l6d: 1, l6nc: 1.5, l6ncl: 1.45, l6g: 1, l6L: 200 } },
      { name: 'Coupleur 3 dB', v: { l6lam: 1.55, l6d: 1, l6nc: 1.5, l6ncl: 1.45, l6g: 1, l6L: 0 } },
      { name: 'Guides écartés (g = 2,5 µm)', v: { l6lam: 1.55, l6d: 1, l6nc: 1.5, l6ncl: 1.45, l6g: 2.5, l6L: 500 } }
    ],
    ctrls: [
      { id: 'l6lam', label: 'λ', unit: 'µm', min: 0.4, max: 2, step: 0.005, val: 1.55 },
      { id: 'l6d', label: 'd (cœur)', unit: 'µm', min: 0.1, max: 5, step: 0.01, val: 1 },
      { id: 'l6nc', label: 'n<sub>c</sub>', min: 1, max: 3.6, step: 0.001, val: 1.5 },
      { id: 'l6ncl', label: 'n<sub>cl</sub> (gaine)', min: 1, max: 3.6, step: 0.001, val: 1.45 },
      { id: 'l6g', label: 'g (écart)', unit: 'µm', min: 0.05, max: 6, step: 0.01, val: 1 },
      { id: 'l6L', label: 'L (longueur du coupleur)', unit: 'µm', min: 0, max: 5000, step: 1, val: 200 }
    ],
    out: `<div class="readout" id="l6-ro"></div>
      <div class="plots"><div class="plot"><div class="pt">Supermodes pair et impair</div><div id="l6-sm"></div><div class="legend"><span><i style="background:var(--field)"></i>pair φ<sub>e</sub></span><span><i style="background:var(--m1)"></i>impair φ<sub>o</sub></span><span><i style="background:var(--amber-line)"></i>(φ<sub>e</sub>+φ<sub>o</sub>)/√2 ≈ guide 1 seul</span></div></div>
      <div class="plot"><div class="pt">Puissance dans chaque guide le long de z</div><div id="l6-p"></div><div class="legend"><span><i style="background:var(--field)"></i>P<sub>1</sub> (guide 1)</span><span><i style="background:var(--m1)"></i>P<sub>2</sub> (guide 2)</span></div></div></div>
      <div class="plot"><div class="pt">Vue de dessus : intensité |ψ(x,z)|² (lumière injectée dans le guide du haut)</div><canvas id="l6-map" width="600" height="220"></canvas></div>`,
    render(api) {
      const lam = api.get('l6lam'), d = api.get('l6d'), nc = api.get('l6nc'), ncl = api.get('l6ncl'), g = api.get('l6g'), Lin = api.get('l6L');
      const roEl = $('l6-ro');
      if (!(nc > ncl) || !(g > 0) || !(d > 0)) { roEl.innerHTML = ro('Paramètres', 'il faut n<sub>c</sub> &gt; n<sub>cl</sub>', 'bad'); return; }
      const c = PH.coupler({ lam, d, g, nc, ncl });
      const k = 2 * PI / lam, Vs = k * d * Math.sqrt(nc * nc - ncl * ncl);
      if (isNaN(c.ne) || isNaN(c.no)) { roEl.innerHTML = ro('Supermodes', 'le supermode impair est coupé : augmentez g ou d', 'bad'); return; }
      const Lc = c.Lc, L = Lin > 0 ? Lin : Lc / 2;
      const P1 = Math.cos(PI * L / (2 * Lc)) ** 2;
      const fmtL = x => x >= 1000 ? fr(x / 1000, 3) + ' mm' : fr(x, 1) + ' µm';
      roEl.innerHTML = ro('n<sub>e</sub> (pair)', fr(c.ne, 5)) + ro('n<sub>o</sub> (impair)', fr(c.no, 5)) + ro('n<sub>e</sub> − n<sub>o</sub>', (c.ne - c.no).toExponential(3).replace('.', ',')) +
        ro('L<sub>c</sub> = λ / 2(n<sub>e</sub> − n<sub>o</sub>)', fmtL(Lc)) + ro(`P<sub>1</sub>/P<sub>0</sub> à L = ${fmtL(L)}`, fr(100 * P1, 1) + ' %') + ro('P<sub>2</sub>/P<sub>0</sub>', fr(100 * (1 - P1), 1) + ' %') +
        ro('Guide seul : V', fr(Vs, 3) + (Vs < PI ? ' · monomode' : ' · multimode'), Vs < PI ? 'good' : 'bad');
      const al = k * Math.sqrt(c.no * c.no - ncl * ncl), X = g / 2 + d + Math.min(3.5 / al, 4 * d + 2);
      const xs = linspace(-X, X, 600);
      const fe = c.fe.f, fo = c.fo.f; let mx = 0; xs.forEach(x => { mx = Math.max(mx, Math.abs(fe(x)), Math.abs(fo(x))); });
      const sm = $('l6-sm'), W = plotW(sm);
      const cores = [{ x0: -g / 2 - d, x1: -g / 2, cls: 'band-core' }, { x0: g / 2, x1: g / 2 + d, cls: 'band-core' }];
      sm.innerHTML = plot({ w: W, h: 250, xr: [-X, X], yr: [-1.15, 1.15], m: { l: 46, r: 12, t: 12, b: 40 }, xl: 'x (µm) — latéral', yl: 'champ (normalisé)', ny: 4, bands: cores,
        series: [{ pts: xs.map(x => [x, fe(x) / mx]), cls: 'c0', w: 2.2 }, { pts: xs.map(x => [x, fo(x) / mx]), cls: 'c1', w: 2.2 }, { pts: xs.map(x => [x, (fe(x) + fo(x)) / Math.SQRT2 / mx]), cls: 'cA', w: 1.8, dash: '6 4' }],
        hlines: [{ y: 0, cls: 's-mut' }] });
      const zmax = Math.max(2.2 * Lc, 1.15 * L), zs = linspace(0, zmax, 400);
      const pp = $('l6-p'), W2 = plotW(pp);
      pp.innerHTML = plot({ w: W2, h: 250, xr: [0, zmax], yr: [0, 1.05], m: { l: 46, r: 12, t: 12, b: 40 }, xl: 'z (µm)', yl: 'P / P_0', ystep: 0.25,
        series: [{ pts: zs.map(z => [z, Math.cos(PI * z / (2 * Lc)) ** 2]), cls: 'c0', w: 2.2 }, { pts: zs.map(z => [z, Math.sin(PI * z / (2 * Lc)) ** 2]), cls: 'c1', w: 2.2 }],
        vlines: [{ x: Lc, cls: 's-mut', dash: '3 3', lab: 'L_c', ly: 16 }, { x: L, cls: 'cA', w: 2, lab: 'L', lcls: 't s acc', ly: 34 }] });
      const cv = $('l6-map'), Wm = plotW(cv.parentElement) - 12;
      const db = PI / Lc;
      drawMap(cv, { xr: [0, zmax], yr: [-X, X], wCss: Wm, hCss: 230, mode: 'int', xl: 'z (µm)', yl: 'x (µm)', frame: ['z', 'x'],
        grid: (nx, ny, zz, xx) => {
          const e = xx.map(x => fe(x)), o = xx.map(x => fo(x)), cz = zz.map(z => Math.cos(db * z));
          const G = new Float32Array(nx * ny); let M = 0;
          for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const v = 0.5 * (e[j] * e[j] + o[j] * o[j] + 2 * e[j] * o[j] * cz[i]); G[j * nx + i] = v; if (v > M) M = v; }
          for (let t = 0; t < G.length; t++) G[t] = Math.pow(G[t] / M, 0.8);
          return G;
        },
        overlay: (ctx, Xf, Yf) => {
          ctx.strokeStyle = tok('--ink'); ctx.globalAlpha = 0.35; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
          [g / 2, g / 2 + d, -g / 2, -g / 2 - d].forEach(x => { ctx.beginPath(); ctx.moveTo(Xf(0), Yf(x)); ctx.lineTo(Xf(zmax), Yf(x)); ctx.stroke(); });
          ctx.setLineDash([]); ctx.globalAlpha = 0.9; ctx.strokeStyle = tok('--amber-line'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(Xf(L), Yf(-X)); ctx.lineTo(Xf(L), Yf(X)); ctx.stroke(); ctx.globalAlpha = 1;
        } });
    }
  });
}

/* ======================= Labo 7 : Mach-Zehnder et modulateur ======================= */
function lab7() {
  buildLab('lab7-body', {
    intro: 'Modèle utilisé dans le problème du modulateur : P<sub>1</sub> = P<sub>0</sub>(1 + sin φ)/2 avec φ = 2πn<sub>00</sub>ΔL/λ + Δφ(V) et Δφ(V) = π n<sub>00</sub>³ r<sub>33</sub> L<sub>elec</sub> V / (λ g). Le champ appliqué est supposé uniforme, E = V/g.',
    presets: [
      { name: 'MZI équilibré', v: { l7lam: 1.55, l7dL: 0, l7V: 0, l7g: 68.4, l7Le: 15, l7n: 2.141, l7r: 30.8 } },
      { name: 'Déséquilibré, ΔL = 20 µm', v: { l7lam: 1.55, l7dL: 20, l7V: 0, l7g: 68.4, l7Le: 15, l7n: 2.141, l7r: 30.8 } },
      { name: 'Modulateur à V_bias', v: { l7lam: 1.55, l7dL: 0, l7V: 11.69, l7g: 68.4, l7Le: 15, l7n: 2.141, l7r: 30.8 } }
    ],
    ctrls: [
      { id: 'l7lam', label: 'λ', unit: 'µm', min: 1.48, max: 1.62, step: 0.0005, val: 1.55 },
      { id: 'l7dL', label: 'ΔL (excès de longueur)', unit: 'µm', min: 0, max: 200, step: 0.1, val: 0 },
      { id: 'l7V', label: 'V appliquée', unit: 'V', min: -40, max: 40, step: 0.01, val: 0 },
      { id: 'l7g', label: 'g (écart entre électrodes)', unit: 'µm', min: 5, max: 200, step: 0.1, val: 68.4 },
      { id: 'l7Le', label: 'L<sub>elec</sub>', unit: 'mm', min: 1, max: 50, step: 0.5, val: 15 },
      { id: 'l7n', label: 'n<sub>00</sub>', min: 2, max: 2.6, step: 0.0001, val: 2.141 },
      { id: 'l7r', label: 'r<sub>33</sub>', unit: 'pm/V', min: 1, max: 40, step: 0.1, val: 30.8 }
    ],
    out: `<div class="readout" id="l7-ro"></div><div class="plots"><div class="plot"><div class="pt">Réponse spectrale à V fixé</div><div id="l7-sp"></div></div><div class="plot"><div class="pt">Réponse en tension à λ fixé</div><div id="l7-v"></div></div></div>
      <div class="legend"><span><i style="background:var(--field)"></i>P<sub>1</sub>/P<sub>0</sub></span><span><i style="background:var(--m1)"></i>P<sub>2</sub>/P<sub>0</sub></span></div>`,
    render(api) {
      const lam = api.get('l7lam'), dL = api.get('l7dL'), V = api.get('l7V'), g = api.get('l7g'), Le = api.get('l7Le') * 1000, n = api.get('l7n'), r = api.get('l7r') * 1e-6;
      const phi = (l, v) => 2 * PI * n * dL / l + PI * n ** 3 * r * Le * v / (l * g);
      const P1 = (l, v) => 0.5 * (1 + Math.sin(phi(l, v)));
      const Vpi = lam * g / (n ** 3 * r * Le);
      const phi0 = 2 * PI * n * dL / lam; let need = (PI / 2 - phi0) % (2 * PI); if (need > PI) need -= 2 * PI; if (need <= -PI) need += 2 * PI;
      const Vb = need / (PI / Vpi);
      const ph = ((phi(lam, V) % (2 * PI)) + 2 * PI) % (2 * PI);
      $('l7-ro').innerHTML = ro('φ (modulo 2π)', fr(ph, 3) + ' rad') + ro('P<sub>1</sub>/P<sub>0</sub>', fr(100 * P1(lam, V), 1) + ' %') + ro('P<sub>2</sub>/P<sub>0</sub>', fr(100 * (1 - P1(lam, V)), 1) + ' %') +
        ro('V<sub>π</sub>', fr(Vpi, 2) + ' V') + ro('V<sub>bias</sub> (P<sub>1</sub> = P<sub>0</sub>)', fr(Vb, 2) + ' V') + ro('Période spectrale', dL > 0 ? fr(lam * lam / (n * dL) * 1000, 2) + ' nm' : '∞ (équilibré)');
      const sp = $('l7-sp'), W = plotW(sp), ls = linspace(1.48, 1.62, 900);
      sp.innerHTML = plot({ w: W, h: 250, xr: [1.48, 1.62], yr: [0, 1.05], m: { l: 46, r: 22, t: 12, b: 40 }, xl: 'λ (µm)', yl: 'P / P_0', ystep: 0.25, nx: 5,
        rects: [{ x0: 1.5, x1: 1.6, y0: 0, y1: 1.05, cls: 'band-amb' }],
        series: [{ pts: ls.map(l => [l, P1(l, V)]), cls: 'c0', w: 2 }, { pts: ls.map(l => [l, 1 - P1(l, V)]), cls: 'c1', w: 2 }],
        vlines: [{ x: lam, cls: 'cA', w: 2, lab: 'λ', lcls: 't s acc', ly: 16 }] });
      const vv = $('l7-v'), W2 = plotW(vv), vm = Math.max(2 * Vpi, Math.abs(V) * 1.1), vs = linspace(-vm, vm, 600);
      vv.innerHTML = plot({ w: W2, h: 250, xr: [-vm, vm], yr: [0, 1.05], m: { l: 46, r: 22, t: 12, b: 40 }, xl: 'V (volts)', yl: 'P / P_0', ystep: 0.25,
        series: [{ pts: vs.map(v => [v, P1(lam, v)]), cls: 'c0', w: 2 }, { pts: vs.map(v => [v, 1 - P1(lam, v)]), cls: 'c1', w: 2 }],
        vlines: [{ x: V, cls: 'cA', w: 2, lab: 'V', lcls: 't s acc', ly: 16 }, { x: Vb, cls: 's-mut', dash: '3 3', lab: 'V_{bias}', ly: 34 }, { x: Vb + Vpi, cls: 's-mut', dash: '3 3', lab: '+V_π', ly: 52 }] });
    }
  });
}

