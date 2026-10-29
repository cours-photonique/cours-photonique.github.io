/* Solveurs numériques de la page. Fonctions pures, réutilisables (aussi sous Node via module.exports). */

/* ===== Guide plan 3 couches, abaque b-V, EIM, coupleur, recouvrement ===== */
const PH = (() => {
  const PI = Math.PI;
  function bisect(f, a, b, tol = 1e-13, it = 200) {
    let fa = f(a), fb = f(b);
    if (!isFinite(fa) || !isFinite(fb) || fa * fb > 0) return NaN;
    for (let i = 0; i < it; i++) {
      const m = 0.5 * (a + b), fm = f(m);
      if (fa * fm <= 0) { b = m; fb = fm; } else { a = m; fa = fm; }
      if (b - a < tol) break;
    }
    return 0.5 * (a + b);
  }
  /* Fonction de dispersion du guide plan :
     F(neff) = k d sqrt(nc²-neff²) - atan(r_sub·sqrt((neff²-nsub²)/(nc²-neff²))) - atan(r_sup·sqrt(...)) ;
     r = 1 en TE, r = nc²/ni² en TM. Les modes vérifient F = mπ. F est décroissante. */
  function slabF(neff, p) {
    const { lam, d, nc, nsub, nsup, pol } = p;
    const k = 2 * PI / lam;
    const kc = Math.sqrt(Math.max(nc * nc - neff * neff, 0));
    const asub = Math.sqrt(Math.max(neff * neff - nsub * nsub, 0));
    const asup = Math.sqrt(Math.max(neff * neff - nsup * nsup, 0));
    const rs = pol === 'TM' ? (nc * nc) / (nsub * nsub) : 1;
    const ru = pol === 'TM' ? (nc * nc) / (nsup * nsup) : 1;
    return k * d * kc - Math.atan(rs * asub / kc) - Math.atan(ru * asup / kc);
  }
  function slabModes(p) {
    const { nc, nsub, nsup } = p;
    const lo = Math.max(nsub, nsup), hi = nc;
    if (!(hi > lo)) return [];
    const eps = 1e-12 * (hi - lo) + 1e-14;
    const Flo = slabF(lo + eps, p);
    const modes = [];
    for (let m = 0; m < 200; m++) {
      if (Flo - m * PI <= 0) break;
      const n = bisect(x => slabF(x, p) - m * PI, lo + eps, hi - eps);
      if (isNaN(n)) break;
      modes.push(mkMode(n, m, p));
    }
    return modes;
  }
  function mkMode(neff, m, p) {
    const { lam, d, nc, nsub, nsup, pol } = p;
    const k = 2 * PI / lam;
    const kc = k * Math.sqrt(nc * nc - neff * neff);
    const asub = k * Math.sqrt(neff * neff - nsub * nsub);
    const asup = k * Math.sqrt(neff * neff - nsup * nsup);
    const ru = pol === 'TM' ? (nc * nc) / (nsup * nsup) : 1;
    // k_c d/2 + ψ = atan(ru α_sup / k_c) + pπ  (p = 0)
    const psi = Math.atan(ru * asup / kc) - kc * d / 2;
    const f = x => {
      if (x >= d / 2) return Math.cos(kc * d / 2 + psi) * Math.exp(-asup * (x - d / 2));
      if (x <= -d / 2) return Math.cos(kc * d / 2 - psi) * Math.exp(asub * (x + d / 2));
      return Math.cos(kc * x + psi);
    };
    // normalisation : max |f| = 1 ; Γ par intégration numérique
    const xmin = -d / 2 - 12 / asub, xmax = d / 2 + 12 / asup;
    const N = 4000; let tot = 0, core = 0, mx = 0;
    const dx = (xmax - xmin) / N;
    for (let i = 0; i <= N; i++) {
      const x = xmin + i * dx, v = f(x), w = (i === 0 || i === N) ? 0.5 : 1;
      tot += w * v * v * dx; if (Math.abs(x) <= d / 2) core += w * v * v * dx;
      mx = Math.max(mx, Math.abs(v));
    }
    const V = k * d * Math.sqrt(nc * nc - nsub * nsub);
    const b = (neff * neff - nsub * nsub) / (nc * nc - nsub * nsub);
    return { m, neff, beta: k * neff, kc, asub, asup, psi, f: x => f(x) / mx, gamma: core / tot,
      deff: d + 1 / asub + 1 / asup, V, b, pol };
  }
  /* Épaisseur de coupure du mode m (TE ou TM), λ et d dans la même unité */
  function dCut(m, lam, nc, nsub, nsup, pol = 'TE') {
    const r = pol === 'TM' ? (nc * nc) / (nsup * nsup) : 1;
    return lam / (2 * PI * Math.sqrt(nc * nc - nsub * nsub)) *
      (m * PI + Math.atan(r * Math.sqrt((nsub * nsub - nsup * nsup) / (nc * nc - nsub * nsub))));
  }
  function lamCut(m, d, nc, nsub, nsup, pol = 'TE') {
    const r = pol === 'TM' ? (nc * nc) / (nsup * nsup) : 1;
    return 2 * PI * d * Math.sqrt(nc * nc - nsub * nsub) /
      (m * PI + Math.atan(r * Math.sqrt((nsub * nsub - nsup * nsup) / (nc * nc - nsub * nsub))));
  }
  /* Relation normalisée (TE) : V√(1-b) - atan√(b/(1-b)) - atan√((a+b)/(1-b)) = pπ */
  function bOfV(V, a, p) {
    const g = b => V * Math.sqrt(1 - b) - Math.atan(Math.sqrt(b / (1 - b))) - Math.atan(Math.sqrt((a + b) / (1 - b))) - p * PI;
    if (g(1e-12) <= 0) return NaN; // sous la coupure
    return bisect(g, 1e-12, 1 - 1e-12);
  }
  function Vcut(a, p) { return p * PI + Math.atan(Math.sqrt(a)); }
  /* Méthode de l'indice effectif (rib/strip/enterré) :
     région I (|x|<W/2) : sup / cœur hI / sub ; région II : sup / cœur hII / sub (hII = 0 → n_slabII = n_sub)
     polV : polarisation du problème vertical, polH : du problème latéral. */
  function eim(q) {
    const { lam, nsup, nc, nsub, hI, hII, W, polV, polH } = q;
    const vI = slabModes({ lam, d: hI, nc, nsub, nsup, pol: polV });
    const vII = hII > 0 ? slabModes({ lam, d: hII, nc, nsub, nsup, pol: polV }) : [];
    const out = [];
    vI.forEach((mv, p) => {
      const nI = mv.neff;
      // même ordre vertical p dans la région II ; s'il y est coupé, la gaine latérale vaut n_sub
      const nIIuse = vII[p] ? vII[p].neff : nsub;
      if (nI <= nIIuse) return;
      const lat = slabModes({ lam, d: W, nc: nI, nsub: nIIuse, nsup: nIIuse, pol: polH });
      lat.forEach((ml, qq) => out.push({ p, q: qq, nslabI: nI, nslabII: nIIuse, neff: ml.neff, vert: mv, lat: ml,
        Vlat: (2 * PI / lam) * W * Math.sqrt(nI * nI - nIIuse * nIIuse), blat: ml.b }));
    });
    out.sort((A, B) => B.neff - A.neff);
    return { vI, vII, modes: out };
  }
  /* Coupleur directionnel 1D symétrique (TE) : gaine n_cl / cœur d / gap g / cœur d / gaine n_cl.
     Supermodes pair (cosh dans le gap) et impair (sinh). */
  function coupler(q) {
    const { lam, d, g, nc, ncl } = q;
    const k = 2 * PI / lam;
    const G = (n, odd, m) => {
      const kc = k * Math.sqrt(nc * nc - n * n), al = k * Math.sqrt(n * n - ncl * ncl);
      const th = odd ? 1 / Math.tanh(al * g / 2) : Math.tanh(al * g / 2);
      return kc * d - Math.atan(al * th / kc) - Math.atan(al / kc) - m * PI;
    };
    const lo = ncl + 1e-12, hi = nc - 1e-12;
    const solve = (odd, m) => {
      // balayage pour trouver un changement de signe
      const N = 2000; let prev = G(lo, odd, m), xprev = lo;
      for (let i = 1; i <= N; i++) {
        const x = lo + (hi - lo) * i / N, v = G(x, odd, m);
        if (isFinite(prev) && isFinite(v) && prev * v <= 0) return bisect(t => G(t, odd, m), xprev, x);
        prev = v; xprev = x;
      }
      return NaN;
    };
    const ne = solve(false, 0), no = solve(true, 0);
    const prof = (n, odd) => {
      if (isNaN(n)) return null;
      const kc = k * Math.sqrt(nc * nc - n * n), al = k * Math.sqrt(n * n - ncl * ncl);
      const gp = odd ? Math.sinh(al * g / 2) : Math.cosh(al * g / 2);
      const dgp = odd ? al * Math.cosh(al * g / 2) : al * Math.sinh(al * g / 2);
      // cœur : A cos(kc u) + B sin(kc u), u = |x| - g/2 ; continuité valeur/dérivée en u = 0
      const A = gp, B = dgp / kc;
      const edge = A * Math.cos(kc * d) + B * Math.sin(kc * d);
      const fpos = x => {
        if (x < g / 2) return odd ? Math.sinh(al * x) : Math.cosh(al * x);
        const u = x - g / 2;
        if (u <= d) return A * Math.cos(kc * u) + B * Math.sin(kc * u);
        return edge * Math.exp(-al * (u - d));
      };
      const f = x => x >= 0 ? fpos(x) : (odd ? -fpos(-x) : fpos(-x));
      // normalisation ∫f² = 1
      const L = g / 2 + d + 10 / al; const N = 3000; let s = 0;
      for (let i = 0; i <= N; i++) { const x = -L + 2 * L * i / N; const v = f(x); s += v * v * (2 * L / N); }
      const c = 1 / Math.sqrt(s);
      return { f: x => c * f(x), L };
    };
    const Lc = (!isNaN(ne) && !isNaN(no)) ? lam / (2 * (ne - no)) : NaN;
    return { ne, no, Lc, fe: prof(ne, false), fo: prof(no, true) };
  }
  /* Intégrale de recouvrement 1D : η = |∫ψφ*|² / (∫|ψ|² ∫|φ|²) */
  function overlap(f, g, x0, x1, N = 4000) {
    let a = 0, b = 0, c = 0; const dx = (x1 - x0) / N;
    for (let i = 0; i <= N; i++) { const x = x0 + i * dx, u = f(x), v = g(x); a += u * v; b += u * u; c += v * v; }
    return (a * a) / (b * c);
  }
  return { slabF, slabModes, mkMode, dCut, lamCut, bOfV, Vcut, eim, coupler, overlap, bisect };
})();
if (typeof module !== 'undefined') module.exports = PH;

