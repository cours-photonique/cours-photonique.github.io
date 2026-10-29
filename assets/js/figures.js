/* ======================= Figures statiques (schémas) ======================= */
function markers() {
  const mk = (id, v) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0,0.5 L10,5 L0,9.5 z" style="fill:var(${v})"/></marker>`;
  const s = `<svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden"><defs>${mk('ah', '--ink')}${mk('ahm', '--muted')}${mk('ahf', '--field')}${mk('aha', '--amber-line')}${mk('ahw', '--warn')}${mk('ahr', '--m1')}</defs></svg>`;
  document.body.insertAdjacentHTML('afterbegin', s);
}

function figCurl() {
  let s = '';
  const panel = (cx, title, vlab, flab, dir, vcls, vmk, fcls, fmk) => {
    let p = T(cx, 24, title, 't b', 'middle');
    p += A(cx, 200, cx, 52, vcls, vmk, 2.4) + T(cx + 10, 62, vlab, 't b ' + (vcls === 's-acc' ? 'acc' : ''));
    p += `<path d="M ${cx + 64} 130 A 64 20 0 0 0 ${cx - 64} 130" class="s-mut" stroke-width="1.3" stroke-dasharray="4 4"/>`;
    const front = dir > 0 ? `M ${cx - 64} 130 A 64 20 0 0 0 ${cx + 64} 130` : `M ${cx + 64} 130 A 64 20 0 0 1 ${cx - 64} 130`;
    p += `<path d="${front}" class="${fcls}" stroke-width="2.4" marker-end="url(#${fmk})"/>`;
    p += T(cx + 72, 150, flab, 't b f');
    if (dir < 0) p += T(cx + 72, 166, '(sens opposé)', 't s f');
    return p;
  };
  s += panel(160, 'Ampère–Maxwell : ∇×H = ∂D/∂t', '∂D/∂t', 'H circule', 1, 's-acc', 'aha', 's-f', 'ahf');
  s += panel(470, 'Faraday : ∇×E = −μ_0 ∂H/∂t', '∂H/∂t', 'E circule', -1, 's-acc', 'aha', 's-f', 'ahf');
  s += L(315, 40, 315, 210, 's-rule', 1);
  s += triad(36, 210, { r: 'x', u: 'z', out: 'y' });
  return svgWrap(630, 230, s, 'Rotationnel : champs qui circulent autour d’une variation');
}

function figInv() {
  // projection oblique : z vers la droite, x vers le haut, y vers l'observateur (bas-gauche)
  const a = -0.5, b = 0.3;
  const P = (cx, cy, X, Y) => [cx + a * X, cy + b * X + Y];
  const sec = (cx, cy) => {
    const g = `<g transform="matrix(${a},${b},0,1,${cx},${cy})">` +
      `<rect x="-70" y="-50" width="140" height="100" class="f-sub" vector-effect="non-scaling-stroke"/>` +
      `<rect x="-70" y="-50" width="140" height="100" fill="none" class="s-mut" stroke-width="1" vector-effect="non-scaling-stroke"/>` +
      `<rect x="-20" y="-14" width="40" height="22" class="f-core" stroke-width="1" vector-effect="non-scaling-stroke"/>` +
      `<ellipse cx="0" cy="-3" rx="34" ry="22" class="s-f" stroke-width="1.4" opacity=".55" vector-effect="non-scaling-stroke"/>` +
      `<ellipse cx="0" cy="-3" rx="20" ry="13" class="s-f" stroke-width="1.6" opacity=".8" vector-effect="non-scaling-stroke"/>` +
      `<ellipse cx="0" cy="-3" rx="8" ry="5" class="f-f" opacity=".9"/></g>`;
    return g;
  };
  const c1 = [190, 125], c2 = [500, 125];
  let s = '';
  // arêtes du bloc
  [[-70, -50], [70, -50], [70, 50], [-70, 50]].forEach(([X, Y]) => {
    const p1 = P(c1[0], c1[1], X, Y), p2 = P(c2[0], c2[1], X, Y);
    s += L(p1[0], p1[1], p2[0], p2[1], 's-mut', 1, 'stroke-dasharray="3 4"');
  });
  s += sec(c2[0], c2[1]) + sec(c1[0], c1[1]);
  // onde le long de z
  let d = ''; for (let i = 0; i <= 120; i++) { const t = i / 120; const x = c1[0] + 40 + t * (c2[0] - c1[0] - 80); const y = c1[1] - 3 + 14 * Math.sin(t * 6 * PI); d += (i ? ' L ' : 'M ') + x.toFixed(1) + ' ' + y.toFixed(1); }
  s += `<path d="${d}" class="s-f" stroke-width="1.6"/>`;
  s += T((c1[0] + c2[0]) / 2, c1[1] + 34, 'e^{−jβz}', 't f b', 'middle');
  s += T(c1[0], 222, 'z = z_1', 't', 'middle') + T(c2[0], 222, 'z = z_2', 't', 'middle');
  s += T(c1[0], 36, 'E(x,y)', 't f', 'middle');
  s += T(c2[0], 36, 'E(x,y) · e^{−jβ(z₂−z₁)}', 't f', 'middle');
  s += A(c1[0] + 40, 246, c2[0] - 40, 246, 's-mut', 'ahm', 1.2) + T((c1[0] + c2[0]) / 2, 240, 'même profil, déphasage β(z_2 − z_1)', 't s m', 'middle');
  s += triad(52, 200, { r: 'z', u: 'x', ob: 'y' });
  return svgWrap(660, 258, s, 'Guide invariant selon z');
}

function figSlab() {
  let s = '';
  s += R(120, 22, 400, 78, 'f-sup') + R(120, 100, 400, 50, 'f-core', 'stroke-width="1"') + R(120, 150, 400, 80, 'f-sub');
  s += L(120, 100, 520, 100, 's-mut', 1) + L(120, 150, 520, 150, 's-mut', 1);
  s += T(136, 64, 'superstrat', 't m') + T(136, 130, 'cœur', 't b') + T(136, 196, 'substrat', 't m');
  s += T(500, 64, 'n_{sup}', 't b', 'end') + T(500, 130, 'n_c', 't b', 'end') + T(500, 196, 'n_{sub}', 't b', 'end');
  s += A2(104, 100, 104, 150, 's-ink', 'ah', 1.2) + T(96, 130, 'd', 't b', 'end');
  // axe x
  s += A(66, 236, 66, 26, 's-mut', 'ahm', 1.2) + T(66, 18, 'x', 't s m b', 'middle');
  s += L(60, 125, 72, 125, 's-mut') + T(56, 129, '0', 't s m', 'end');
  s += L(60, 100, 72, 100, 's-mut') + T(56, 104, 'd/2', 't s m', 'end');
  s += L(60, 150, 72, 150, 's-mut') + T(56, 154, '−d/2', 't s m', 'end');
  // propagation
  let d = ''; for (let i = 0; i <= 60; i++) { const t = i / 60; const x = 270 + t * 120; const y = 125 + 9 * Math.sin(t * 4 * PI); d += (i ? ' L ' : 'M ') + x.toFixed(1) + ' ' + y.toFixed(1); }
  s += `<path d="${d}" class="s-f" stroke-width="1.6"/>` + A(392, 125, 420, 125, 's-f', 'ahf', 1.8) + T(426, 129, 'z', 't f b');
  s += T(530, 40, '∂n/∂y = ∂n/∂z = 0', 't s m', 'end');
  s += T(530, 246, 'couches infinies selon y', 't s m', 'end');
  s += triad(560, 214, { r: 'z', u: 'x', out: 'y' });
  return svgWrap(610, 252, s, 'Guide plan');
}

function figTETM() {
  const panel = (ox, te) => {
    let p = R(ox + 20, 40, 240, 50, 'f-sup') + R(ox + 20, 90, 240, 46, 'f-core', 'stroke-width="1"') + R(ox + 20, 136, 240, 50, 'f-sub');
    p += T(ox + 140, 26, te ? 'TE : E_y, H_x, H_z' : 'TM : H_y, E_x, E_z', 't b', 'middle');
    const cx = ox + 120, cy = 113;
    if (te) {
      p += `<circle cx="${cx}" cy="${cy}" r="9" class="s-f" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="3" class="f-f"/>` + T(cx - 14, cy - 12, 'E_y', 't f b', 'end');
      p += A(cx + 40, cy + 18, cx + 40, cy - 22, 's-warn', 'ahr', 2) + T(cx + 46, cy - 18, 'H_x', 't b', 'start', 'style="fill:var(--m1)"');
      p += A(cx + 40, cy + 18, cx + 92, cy + 18, 's-warn', 'ahr', 2) + T(cx + 96, cy + 22, 'H_z', 't b', 'start', 'style="fill:var(--m1)"');
    } else {
      p += `<circle cx="${cx}" cy="${cy}" r="9" stroke="var(--m1)" fill="none" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="3" style="fill:var(--m1)"/>` + T(cx - 14, cy - 12, 'H_y', 't b', 'end', 'style="fill:var(--m1)"');
      p += A(cx + 40, cy + 18, cx + 40, cy - 22, 's-f', 'ahf', 2) + T(cx + 46, cy - 18, 'E_x', 't f b');
      p += A(cx + 40, cy + 18, cx + 92, cy + 18, 's-f', 'ahf', 2) + T(cx + 96, cy + 22, 'E_z', 't f b');
    }
    p += triad(ox + 34, 222, { r: 'z', u: 'x', out: 'y' });
    return p;
  };
  return svgWrap(620, 250, panel(0, true) + L(310, 30, 310, 230, 's-rule') + panel(320, false), 'Composantes TE et TM');
}

function figInterf() {
  let s = R(20, 20, 340, 100, 'f-sup') + R(20, 120, 340, 70, 'f-core', 'stroke-width="1"');
  s += L(20, 120, 360, 120, 's-ink', 1.5) + T(352, 114, 'x = d/2', 't s', 'end');
  s += T(32, 44, 'n_{sup}', 't b') + T(32, 176, 'n_c', 't b');
  s += A(150, 120, 150, 50, 's-ink', 'ah', 1.6) + T(158, 58, 'x (normale)', 't s b');
  s += A(150, 120, 236, 120, 's-ink', 'ah', 1.6) + T(240, 136, 'z (tangent)', 't s b');
  s += `<circle cx="150" cy="120" r="6" class="s-ink" stroke-width="1.4"/><circle cx="150" cy="120" r="2" class="f-ink"/>` + T(140, 140, 'y (tangent)', 't s b', 'end');
  s += T(190, 166, 'continues : E_y, E_z, H_y, H_z', 't s m', 'middle');
  return svgWrap(380, 200, s, 'Interface et composantes tangentielles');
}

function figChannels() {
  const lab = (ox, t) => T(ox + 80, 186, t, 't s', 'middle');
  let s = '';
  // ruban
  s += R(10, 100, 140, 70, 'f-sub') + R(55, 72, 50, 28, 'f-core', 'stroke-width="1"') + lab(0, 'ruban (strip)');
  // arête
  s += R(170, 100, 140, 70, 'f-sub') + R(170, 90, 140, 10, 'f-core', 'stroke-width="1"') + R(215, 66, 50, 24, 'f-core', 'stroke-width="1"') + L(216, 90, 264, 90, 'f-core', 1, 'style="stroke:var(--core)"') + lab(160, 'arête (rib)');
  // enterré
  s += R(330, 50, 140, 120, 'f-sub') + R(375, 92, 50, 26, 'f-core', 'stroke-width="1"') + lab(320, 'enterré (buried)');
  // diffusé
  s += R(490, 80, 140, 90, 'f-sub') + `<path d="M 528 80 A 32 22 0 0 0 592 80 Z" class="f-core" stroke-width="1"/>` + `<path d="M 516 80 A 44 32 0 0 0 604 80" fill="none" class="s-f" stroke-width="1" stroke-dasharray="3 3" opacity=".7"/>` + lab(480, 'diffusé (Ti:LiNbO₃)');
  s += T(16, 30, 'air', 't s m');
  s += triad(28, 150, { r: 'x', u: 'y', out: 'z' }).replace(/class="s-mut"/g, 'class="s-ink"').replace(/f-mut/g, 'f-ink').replace(/t s m b/g, 't s b');
  return svgWrap(640, 196, s, 'Types de guides canaux');
}

function figFrames() {
  let s = '';
  s += T(150, 22, 'Guide plan', 't b', 'middle');
  s += R(30, 40, 240, 46, 'f-sup') + R(30, 86, 240, 40, 'f-core', 'stroke-width="1"') + R(30, 126, 240, 46, 'f-sub');
  s += `<circle cx="150" cy="106" r="9" class="s-f" stroke-width="2"/><circle cx="150" cy="106" r="3" class="f-f"/>` + T(166, 110, 'E_y (TE)', 't f b');
  s += triad(48, 214, { r: 'z', u: 'x', out: 'y' });
  s += L(310, 20, 310, 236, 's-rule');
  s += T(470, 22, 'Guide canal (section)', 't b', 'middle');
  s += R(350, 120, 240, 60, 'f-sub') + R(440, 80, 60, 40, 'f-core', 'stroke-width="1"');
  s += A(446, 100, 494, 100, 's-f', 'ahf', 2.2) + T(504, 70, 'E_x : quasi-TE', 't f b');
  s += A(410, 120, 410, 82, 's-warn', 'ahr', 2.2) + T(404, 140, 'E_y : quasi-TM', 't b', 'end', 'style="fill:var(--m1)"');
  s += triad(368, 214, { r: 'x', u: 'y', out: 'z' });
  return svgWrap(620, 250, s, 'Repères du guide plan et du guide canal');
}

function figEIM() {
  let s = '';
  // rib
  s += R(20, 150, 210, 60, 'f-sub') + R(20, 130, 210, 20, 'f-core', 'stroke-width="1"') + R(100, 100, 50, 30, 'f-core', 'stroke-width="1"') + L(101, 130, 149, 130, 's-rule', 1, 'style="stroke:var(--core)"');
  s += L(100, 64, 100, 214, 's-mut', 1, 'stroke-dasharray="3 3"') + L(150, 64, 150, 214, 's-mut', 1, 'stroke-dasharray="3 3"');
  s += T(58, 78, 'II', 't b m', 'middle') + T(125, 78, 'I', 't b m', 'middle') + T(192, 78, 'II', 't b m', 'middle');
  s += A2(100, 92, 150, 92, 's-ink', 'ah', 1) + T(125, 88, 'W', 't s b', 'middle');
  s += A2(40, 130, 40, 150, 's-ink', 'ah', 1) + T(46, 145, 'd_1', 't s');
  s += A2(160, 100, 160, 150, 's-ink', 'ah', 1) + T(166, 128, 'd_2', 't s');
  s += T(30, 50, 'n_{sup}', 't s m') + T(30, 196, 'n_{sub}', 't s m');
  s += triad(250, 50, { r: 'x', u: 'y', out: 'z' });
  // étape 1
  s += A(235, 160, 268, 160, 's-acc', 'aha', 2) + T(251, 150, '①', 't b acc', 'middle');
  const stack = (x, hc, lab, sub) => R(x, 96, 46, 54 - hc, 'f-sup', 'stroke="var(--rule)"') + R(x, 150 - hc, 46, hc, 'f-core', 'stroke-width="1"') + R(x, 150, 46, 40, 'f-sub') + T(x + 23, 208, lab, 't s b', 'middle') + T(x + 23, 224, sub, 't s m', 'middle');
  s += stack(285, 50, 'I', '→ n_{slab,I}') + stack(355, 20, 'II', '→ n_{slab,II}');
  s += A(282, 190, 282, 104, 's-mut', 'ahm', 1) + T(278, 110, 'y', 't s m', 'end');
  // étape 2
  s += A(414, 160, 448, 160, 's-acc', 'aha', 2) + T(431, 150, '②', 't b acc', 'middle');
  s += R(458, 120, 64, 70, 'f-sub', 'stroke="var(--rule)"') + R(522, 120, 46, 70, 'f-core', 'stroke-width="1"') + R(568, 120, 64, 70, 'f-sub', 'stroke="var(--rule)"');
  s += T(490, 158, 'n_{slab,II}', 't s', 'middle') + T(545, 158, 'I', 't s b', 'middle') + T(600, 158, 'n_{slab,II}', 't s', 'middle');
  s += A2(522, 108, 568, 108, 's-ink', 'ah', 1) + T(545, 102, 'W', 't s b', 'middle');
  s += A(462, 206, 500, 206, 's-mut', 'ahm', 1) + T(504, 210, 'x', 't s m');
  s += T(545, 214, '→ n_{eff}', 't b f', 'middle');
  return svgWrap(650, 236, s, 'Méthode de l’indice effectif');
}

function figTD1() {
  let s = '';
  s += R(40, 150, 520, 60, 'f-sub') + R(40, 100, 520, 50, 'f-core', 'stroke-width="1"') + R(275, 60, 50, 40, 'f-core', 'stroke-width="1"') + L(276, 100, 324, 100, 's-rule', 1, 'style="stroke:var(--core)"');
  s += L(275, 30, 275, 214, 's-mut', 1, 'stroke-dasharray="3 3"') + L(325, 30, 325, 214, 's-mut', 1, 'stroke-dasharray="3 3"');
  s += T(160, 26, 'A', 't b m', 'middle') + T(300, 26, 'B', 't b m', 'middle') + T(440, 26, 'A', 't b m', 'middle');
  s += T(60, 60, 'n = 1', 't s') + T(60, 130, 'n = 2,234', 't s') + T(60, 190, 'n = 2,214', 't s');
  s += A2(200, 100, 200, 150, 's-ink', 'ah', 1) + T(206, 130, '1 µm', 't s');
  s += A2(345, 60, 345, 150, 's-ink', 'ah', 1) + T(351, 110, '1,8 µm', 't s');
  s += A2(275, 46, 325, 46, 's-ink', 'ah', 1) + T(300, 42, '1 µm', 't s', 'middle');
  s += T(556, 60, 'λ = 0,8 µm', 't s m', 'end');
  s += triad(590, 200, { r: 'x', u: 'y', out: 'z' });
  return svgWrap(640, 230, s, 'Géométrie du guide en arête (exercice 1)');
}
function figTD2() {
  let s = '';
  s += R(40, 70, 520, 140, 'f-sub') + R(250, 70, 100, 75, 'f-core', 'stroke-width="1"');
  s += L(40, 70, 560, 70, 's-ink', 1.2);
  s += L(250, 30, 250, 214, 's-mut', 1, 'stroke-dasharray="3 3"') + L(350, 30, 350, 214, 's-mut', 1, 'stroke-dasharray="3 3"');
  s += T(145, 26, 'A', 't b m', 'middle') + T(300, 26, 'B', 't b m', 'middle') + T(455, 26, 'A', 't b m', 'middle');
  s += T(60, 56, 'n = 1 (air)', 't s') + T(300, 112, 'n_g = 2,2', 't s b', 'middle') + T(60, 160, 'n_{sub} = 2,12', 't s');
  s += A2(370, 70, 370, 145, 's-ink', 'ah', 1) + T(376, 112, '1,5λ', 't s');
  s += A2(250, 160, 350, 160, 's-ink', 'ah', 1) + T(300, 176, '2λ', 't s', 'middle');
  s += T(556, 160, 'n_{slab,A} = n_{sub}', 't s m', 'end');
  s += triad(590, 200, { r: 'x', u: 'y', out: 'z' });
  return svgWrap(640, 230, s, 'Géométrie du guide multimode (exercice 2)');
}

function figExc() {
  let s = '';
  // fibre
  s += R(20, 92, 120, 36, 'f-sub', 'stroke="var(--rule)"') + R(20, 106, 120, 8, 'f-core', 'stroke-width=".8"') + T(80, 86, 'fibre / source', 't s m', 'middle');
  // faisceau
  s += `<path d="M 140 106 Q 200 96 258 84 L 258 136 Q 200 124 140 114 Z" class="f-f" opacity=".14"/>`;
  // profil d'excitation
  let d = ''; for (let i = 0; i <= 60; i++) { const y = 70 + i * (80 / 60); const v = Math.exp(-Math.pow((y - 110) / 18, 2)); d += (i ? ' L ' : 'M ') + (238 - 30 * v).toFixed(1) + ' ' + y.toFixed(1); }
  s += `<path d="${d}" class="s-acc" stroke-width="2"/>` + T(200, 64, 'ψ_{exc}', 't b acc', 'middle');
  // guide
  s += R(260, 40, 340, 60, 'f-sup') + R(260, 100, 340, 22, 'f-core', 'stroke-width="1"') + R(260, 122, 340, 70, 'f-sub');
  s += L(260, 30, 260, 200, 's-ink', 2) + T(262, 214, 'z = z_0', 't s', 'middle');
  // mode guidé
  d = ''; for (let i = 0; i <= 80; i++) { const y = 60 + i * (110 / 80); const u = y - 111; const v = Math.abs(u) < 11 ? Math.cos(u / 11 * 0.95) : Math.cos(0.95) * Math.exp(-(Math.abs(u) - 11) / (u > 0 ? 14 : 6)); d += (i ? ' L ' : 'M ') + (430 + 36 * v).toFixed(1) + ' ' + y.toFixed(1); }
  s += L(430, 56, 430, 172, 's-mut', 1, 'stroke-dasharray="2 3"') + `<path d="${d}" class="s-f" stroke-width="2"/>` + T(474, 108, 'C_m φ_m', 't f b');
  s += A(300, 111, 410, 111, 's-f', 'ahf', 1.6);
  // rayonnés
  s += A(268, 118, 360, 186, 's-warn', 'ahr', 1.3, 'stroke-dasharray="4 3"') + A(268, 104, 350, 46, 's-warn', 'ahr', 1.3, 'stroke-dasharray="4 3"');
  s += T(366, 186, 'modes rayonnés', 't s', 'start', 'style="fill:var(--m1)"');
  s += T(590, 56, 'n_{sup}', 't s m', 'end') + T(590, 116, 'n_c', 't s', 'end') + T(590, 182, 'n_{sub}', 't s m', 'end');
  s += triad(40, 196, { r: 'z', u: 'x', out: 'y' });
  return svgWrap(620, 222, s, 'Excitation d’un guide par un champ extérieur');
}

function figCoupler() {
  let s = '';
  const g1 = 'M 20 64 L 110 64 C 140 64 140 102 170 102 L 290 102 C 320 102 320 64 350 64 L 410 64';
  const g2 = 'M 20 176 L 110 176 C 140 176 140 138 170 138 L 290 138 C 320 138 320 176 350 176 L 410 176';
  s += `<path d="${g1}" class="s-ink" stroke-width="9" opacity=".18"/><path d="${g2}" class="s-ink" stroke-width="9" opacity=".18"/>`;
  s += `<path d="${g1}" class="s-f" stroke-width="2.4"/><path d="M 170 138 L 290 138 C 320 138 320 176 350 176 L 410 176" class="s-f" stroke-width="2.4" stroke-dasharray="1 0"/>`;
  s += `<path d="M 20 176 L 110 176 C 140 176 140 138 170 138" class="s-mut" stroke-width="1.4"/>`;
  s += A(26, 50, 70, 50, 's-f', 'ahf', 1.6) + T(30, 42, 'P_0', 't f b');
  s += T(414, 60, 'P_1', 't b') + T(414, 180, 'P_2', 't b');
  s += A2(230, 108, 230, 132, 's-ink', 'ah', 1) + T(236, 124, 'g', 't s b');
  s += A2(170, 156, 290, 156, 's-ink', 'ah', 1) + T(230, 170, 'longueur d’interaction L', 't s', 'middle');
  s += triad(40, 220, { r: 'z', u: 'x' });
  s += L(450, 20, 450, 230, 's-rule');
  // section
  s += R(470, 60, 200, 150, 'f-sub') + R(510, 136, 40, 26, 'f-core', 'stroke-width="1"') + R(590, 136, 40, 26, 'f-core', 'stroke-width="1"');
  const bell = (c, sgn) => { let d = ''; for (let i = 0; i <= 100; i++) { const x = 470 + i * 2; const u = x - c; const v = Math.abs(u) < 20 ? Math.cos(u / 20 * 1.1) : Math.cos(1.1) * Math.exp(-(Math.abs(u) - 20) / 18); d += (i ? ' L ' : 'M ') + x + ' ' + (126 - 58 * v).toFixed(1); } return d; };
  s += R(550, 70, 40, 56, 'band-amb');
  s += `<path d="${bell(530)}" class="s-f" stroke-width="2"/><path d="${bell(610)}" stroke="var(--m1)" fill="none" stroke-width="2"/>`;
  s += T(570, 222, 'recouvrement évanescent', 't s m', 'middle');
  s += triad(486, 196, { r: 'x', u: 'y', out: 'z' });
  return svgWrap(690, 240, s, 'Coupleur directionnel');
}

function figDiff() {
  let s = '';
  s += R(30, 60, 260, 130, 'f-sub') + R(30, 52, 92, 8, 'f-ink', 'opacity=".7"') + R(198, 52, 92, 8, 'f-ink', 'opacity=".7"');
  [[70, 52, .25], [56, 40, .45], [42, 28, .7], [28, 16, .95]].forEach(([rx, ry, op]) => { s += `<path d="M ${160 - rx} 60 A ${rx} ${ry} 0 0 0 ${160 + rx} 60 Z" class="f-core" stroke-width=".8" opacity="${op}"/>`; });
  s += A2(122, 38, 198, 38, 's-ink', 'ah', 1) + T(160, 32, 'W', 't s b', 'middle') + T(36, 46, 'masque', 't s m');
  s += T(160, 206, 'profil diffusé (gradué)', 't s m', 'middle');
  s += T(325, 128, '≈', 't b', 'middle', 'font-size="22"');
  s += R(360, 60, 260, 130, 'f-sub') + R(445, 60, 90, 70, 'f-core', 'stroke-width="1"') + L(350, 60, 630, 60, 's-ink', 1.2);
  s += T(490, 100, 'n + Δn', 't s b', 'middle') + T(372, 170, 'n = 2,14', 't s') + T(372, 50, 'air (n = 1)', 't s m');
  s += A2(445, 40, 535, 40, 's-ink', 'ah', 1) + T(490, 34, 'W + (Dt)^{1/2}', 't s', 'middle');
  s += A2(548, 60, 548, 130, 's-ink', 'ah', 1) + T(554, 100, '2(Dt)^{1/2}', 't s');
  s += T(490, 206, 'modèle à saut d’indice', 't s m', 'middle');
  s += triad(600, 176, { r: 'x', u: 'y', out: 'z' });
  return svgWrap(650, 216, s, 'Guide diffusé Ti:LiNbO3 et son modèle');
}

function figMZI() {
  let s = '';
  s += `<path d="M 20 125 L 80 125 C 110 125 110 70 150 66 C 200 40 330 40 380 66 C 410 70 420 112 440 112 L 500 112 C 530 112 540 70 570 70 L 650 70" class="s-f" stroke-width="2.4"/>`;
  s += `<path d="M 80 125 C 110 125 110 180 150 180 L 380 180 C 410 180 420 128 440 128 L 500 128 C 530 128 540 180 570 180 L 650 180" class="s-f" stroke-width="2.4"/>`;
  s += R(170, 18, 180, 12, 'f-mut', 'opacity=".55"') + R(170, 78, 180, 12, 'f-mut', 'opacity=".55"');
  s += T(160, 28, 'V', 't b', 'end') + T(358, 88, 'masse', 't s m');
  s += A2(186, 30, 186, 46, 's-ink', 'ah', 1) + T(192, 42, 'e', 't s b');
  s += A2(170, 10, 350, 10, 's-mut', 'ahm', 1) + T(358, 22, 'L_{elec} = 15 mm', 't s m');
  s += T(260, 60, 'L + ΔL', 't s f', 'middle') + T(260, 198, 'L', 't s f', 'middle');
  s += A2(440, 150, 500, 150, 's-ink', 'ah', 1) + T(470, 166, 'L_c/2', 't s', 'middle');
  s += T(24, 116, 'P_0', 't b') + T(654, 64, 'P_1', 't b') + T(654, 186, 'P_2', 't b');
  s += T(46, 152, 'jonction Y', 't s m', 'middle') + T(470, 100, 'coupleur 3 dB', 't s m', 'middle');
  s += triad(36, 214, { r: 'z', u: 'x' });
  return svgWrap(690, 232, s, 'Interféromètre de Mach-Zehnder et modulateur');
}

/* ======================= Figures calculées ======================= */
function figModes() {
  const p = { lam: 1, d: 4, nc: 1.55, nsub: 1.5, nsup: 1.0, pol: 'TE' };
  const ms = PH.slabModes(p);
  const xr = [-7, 4.5];
  const ser = ms.map((m, i) => ({ pts: linspace(xr[0], xr[1], 500).map(x => [x, m.f(x)]), cls: MODECLS[i], w: 2.2 }));
  const m0 = ms[0];
  const top = plot({ w: 640, h: 110, xr, yr: [1.47, 1.565], m: { l: 54, r: 16, t: 10, b: 18 }, noxl: true, yl: 'n(x)', ny: 2, ystep: 0.05,
    bands: [{ x0: -10, x1: -2, cls: 'band-sub' }, { x0: -2, x1: 2, cls: 'band-core' }, { x0: 2, x1: 10, cls: 'band-sup' }],
    series: [{ pts: [[xr[0], 1.5], [-2, 1.5], [-2, 1.55], [2, 1.55], [2, 1.0], [xr[1], 1.0]], cls: 'cI', w: 1.8 }],
    hlines: ms.map((m, i) => ({ y: m.neff, cls: MODECLS[i], dash: '5 3' })),
    texts: [{ x: 2.2, y: 1.485, t: 'n_{sup} = 1 ↓', cls: 't s m' }] });
  const bot = plot({ w: 640, h: 250, xr, yr: [-1.15, 1.15], m: { l: 54, r: 16, t: 6, b: 40 }, xl: 'x (µm) — normale aux couches', yl: 'E_y (normalisé)',
    bands: [{ x0: -10, x1: -2, cls: 'band-sub', lab: 'substrat' }, { x0: -2, x1: 2, cls: 'band-core', lab: 'cœur' }, { x0: 2, x1: 10, cls: 'band-sup', lab: 'air' }],
    series: ser, hlines: [{ y: 0, cls: 's-mut' }],
    dims: [{ x0: -2 - 1 / m0.asub, x1: -2, y: -0.3, lab: '1/α_{sub}' }, { x0: 2, x1: 2 + 1 / m0.asup, y: 0.62, lab: '' }],
    texts: [{ x: 2.3, y: 0.58, t: `1/α_{sup} = ${fr(1 / m0.asup, 2)} µm`, cls: 't s' }].concat(ms.map((m, i) => ({ x: -6.8, y: -0.5 - i * 0.2, t: `m = ${i} · n_{eff} = ${fr(m.neff, 4)}`, cls: 't s b', style: `fill:var(${MODEVAR[i % 5]})` }))) });
  $('fig-modes').innerHTML = combine(640, 360, [{ x: 0, y: 0, svg: top }, { x: 0, y: 110, svg: bot }], 'Profils des modes du guide plan');
}
function figDeff() {
  const mk = (d, title) => {
    const p = { lam: 1.55, d, nc: 1.5, nsub: 1.45, nsup: 1.45, pol: 'TE' };
    const m = PH.slabModes(p)[0];
    const xr = [-8, 8];
    const deff = d + 2 / m.asub;
    return plot({ w: 320, h: 230, xr, yr: [-0.05, 1.18], m: { l: 44, r: 10, t: 22, b: 38 }, xl: 'x (µm)', yl: 'E_y', ny: 3,
      bands: [{ x0: -d / 2, x1: d / 2, cls: 'band-core' }],
      rects: [{ x0: -deff / 2, x1: deff / 2, y0: 0, y1: 1, cls: 'band-amb' }],
      series: [{ pts: linspace(xr[0], xr[1], 400).map(x => [x, m.f(x)]), cls: 'c0', w: 2.2 }],
      dims: [{ x0: -deff / 2, x1: deff / 2, y: 1.07, lab: `d_{eff} = ${fr(deff, 2)} µm` }],
      texts: [{ x: -7.6, y: 0.5, t: title, cls: 't s b' }, { x: -7.6, y: 0.38, t: `Γ = ${fr(m.gamma, 2)}`, cls: 't s' }] });
  };
  $('fig-deff').innerHTML = combine(640, 230, [{ x: 0, y: 0, svg: mk(3, 'd = 3 µm') }, { x: 320, y: 0, svg: mk(0.4, 'd = 0,4 µm') }], 'Épaisseur effective');
}
function figBound() {
  const ds = [0.5, 2, 8], nc = 1.5, ncl = 1.45, ox = 40, pw = 220;
  const res = ds.map(d => PH.slabModes({ lam: 1.55, d, nc, nsub: ncl, nsup: ncl, pol: 'TE' })[0]);
  const parts = []; let extra = '';
  res.forEach((m, i) => {
    const d = ds[i], xs = linspace(-7, 7, 500);
    const tailL = linspace(-7, -d / 2, 120).map(x => [x, m.f(x)]), tailR = linspace(d / 2, 7, 120).map(x => [x, m.f(x)]);
    const svg = plot({ w: pw, h: 196, xr: [-7, 7], yr: [-0.05, 1.18], m: { l: 34, r: 8, t: 26, b: 34 }, nx: 3, ny: 2, xl: 'x (µm)',
      bands: [{ x0: -d / 2, x1: d / 2, cls: 'band-core' }],
      fills: [{ pts: tailL.concat([[-d / 2, 0], [-7, 0]]), cls: 'f-m1', op: 0.3 }, { pts: tailR.concat([[7, 0], [d / 2, 0]]), cls: 'f-m1', op: 0.3 }],
      series: [{ pts: xs.map(x => [x, m.f(x)]), cls: 'c0', w: 2.2 }],
      texts: [{ x: -6.7, y: 1.04, t: `Γ = ${fr(m.gamma, 2)}`, cls: 't s b' }] });
    parts.push({ x: ox + i * pw, y: 0, svg });
    extra += T(ox + i * pw + 121, 16, `d = ${fr(d, 1)} µm`, 't b', 'middle');
    // triangle des vecteurs d'onde dans le cœur, angle réel θ
    const th = Math.acos(m.neff / nc), x0 = ox + i * pw + 40, yB = 250, Lv = 168;
    const xe = x0 + Lv * Math.cos(th), ye = yB - Lv * Math.sin(th);
    extra += L(x0, yB, xe, yB, 's-f', 2, 'stroke-dasharray="5 3"') + L(xe, yB, xe, ye, 's-warn', 2) + A(x0, yB, xe, ye, 's-acc', 'aha', 2.2);
    extra += T(x0 + 70, yB - Lv * Math.sin(th) * 70 / (Lv * Math.cos(th)) - 9, 'kn_c', 't s acc b') + T(x0 + 60, yB + 15, 'β', 't s f b') + T(xe + 5, (yB + ye) / 2 + 4, 'k_c', 't s', 'start', 'style="fill:var(--m1)"');
    extra += T(ox + i * pw + 121, 286, `θ = ${fr(th * 180 / PI, 1)}° · β/kn_c = ${fr(m.neff / nc, 3)}`, 't s', 'middle');
  });
  extra += triad(12, 262, { r: 'z', u: 'x' });
  const gauge = plot({ w: 660, h: 84, xr: [1.45, 1.5], yr: [0, 1], m: { l: 34, r: 16, t: 6, b: 34 }, yticks: { list: [], step: 1 }, nx: 5, xl: 'indice effectif n_{eff} du mode fondamental',
    dots: res.map(m => ({ x: m.neff, y: 0.45, cls: 'fc0', r: 5 })),
    texts: res.map((m, i) => ({ x: m.neff, y: 0.72, t: `d = ${fr(ds[i], 1)}`, cls: 't s', anchor: 'middle' })).concat([{ x: 1.4503, y: 0.06, t: 'n_{sub} = n_{sup} = 1,45', cls: 't s m' }, { x: 1.4997, y: 0.06, t: 'n_c = 1,50 : limite d → ∞', cls: 't s m', anchor: 'end' }]) });
  parts.push({ x: ox, y: 300, svg: gauge });
  parts.extra = extra;
  $('fig-bound').innerHTML = combine(ox + 3 * pw + 10, 388, parts, 'Borne haute de l’indice effectif');
}
function fieldAny(neff, p, phi0) {
  const { lam, d, nc, nsub, nsup } = p, k = 2 * PI / lam;
  const q = n => k * Math.sqrt(Math.abs(n * n - neff * neff));
  const ks = q(nsup), kc = q(nc), kb = q(nsub);
  let v, s;
  if (neff > nsup) { v = 1; s = -ks; } else { v = Math.cos(phi0); s = -ks * Math.sin(phi0); }
  const fc = x => v * Math.cos(kc * (x - d / 2)) + s / kc * Math.sin(kc * (x - d / 2));
  const vb = fc(-d / 2), sb = -v * kc * Math.sin(-kc * d) + s * Math.cos(-kc * d);
  return x => x >= d / 2 ? (neff > nsup ? v * Math.exp(-ks * (x - d / 2)) : Math.cos(ks * (x - d / 2) + phi0))
    : x >= -d / 2 ? fc(x) : vb * Math.cos(kb * (x + d / 2)) + sb / kb * Math.sin(kb * (x + d / 2));
}
function figRad() {
  const p = { lam: 1, d: 2, nc: 1.6, nsub: 1.5, nsup: 1.4, pol: 'TE' };
  const g = PH.slabModes(p)[0];
  const rows = [
    { f: g.f, neff: g.neff, t: 'guidé : n_{sub} < n_{eff} < n_c' },
    { f: fieldAny(1.47, p, 0), neff: 1.47, t: 'rayonné substrat : n_{sup} < n_{eff} < n_{sub}' },
    { f: fieldAny(1.36, p, 0.7), neff: 1.36, t: 'rayonné : n_{eff} < n_{sup} ≤ n_{sub}' }
  ];
  const xr = [-6, 6], parts = []; let titles = '';
  rows.forEach((r, i) => {
    const xs = linspace(xr[0], xr[1], 900); let mx = 0; xs.forEach(x => { mx = Math.max(mx, Math.abs(r.f(x))); });
    const hb = i === 2 ? 40 : 28, hh = 112 + hb;
    const left = plot({ w: 250, h: hh, xr, yr: [1.3, 1.65], m: { l: 44, r: 8, t: 6, b: hb }, ny: 3, ystep: 0.1, nx: 3, xl: i === 2 ? 'x (µm)' : '', yl: 'n(x)',
      series: [{ pts: [[xr[0], 1.5], [-1, 1.5], [-1, 1.6], [1, 1.6], [1, 1.4], [xr[1], 1.4]], cls: 'cI', w: 1.8 }],
      hlines: [{ y: r.neff, cls: 's-acc', w: 2, lab: 'n_{eff}', lcls: 't s acc' }] });
    const right = plot({ w: 390, h: hh, xr, yr: [-1.15, 1.15], m: { l: 44, r: 10, t: 6, b: hb }, ny: 2, xl: i === 2 ? 'x (µm)' : '', yl: 'E_y',
      bands: [{ x0: -1, x1: 1, cls: 'band-core' }],
      series: [{ pts: xs.map(x => [x, r.f(x) / mx]), cls: i === 0 ? 'c0' : 'c1', w: 2 }],
      hlines: [{ y: 0, cls: 's-mut' }] });
    const y0 = i * 166;
    parts.push({ x: 0, y: y0 + 22, svg: left }, { x: 250, y: y0 + 22, svg: right });
    titles += T(44, y0 + 16, `${'①②③'[i]} ${r.t}`, 't b');
  });
  parts.extra = titles;
  $('fig-rad').innerHTML = combine(640, 3 * 166 + 12, parts, 'Modes guidés et rayonnés');
}

/* Exercices EIM : profils et cartes de champ */
function eimMap(cv, r, mode, geo, wCss) {
  const { hI, hII, W } = geo;
  const v = mode.vert, l = mode.lat;
  const embedded = !(hII > 0);
  const yc = embedded ? -hI / 2 : hI / 2;
  const ext = Math.min(Math.max(2.6 / v.asub, 0.5 * hI), 1.6 * hI + 0.6), extT = Math.min(Math.max(2.6 / v.asup, 0.3 * hI), 2 * hI + 1);
  const latExt = Math.min(Math.max(2.6 / l.asub, 0.4 * W), 1.3 * W + 1);
  let yr = [yc - hI / 2 - ext, yc + hI / 2 + extT], xr = [-W / 2 - latExt, W / 2 + latExt];
  const pw = wCss - 52, phMax = Math.min(380, 1.15 * pw), phMin = Math.min(170, 0.62 * pw);
  let ph = pw * (yr[1] - yr[0]) / (xr[1] - xr[0]);
  if (ph > phMax) { ph = phMax; const sx = (yr[1] - yr[0]) * pw / ph; const c = 0; xr = [c - sx / 2, c + sx / 2]; }
  if (ph < phMin) { ph = phMin; const sy = (xr[1] - xr[0]) * ph / pw; const c = (yr[0] + yr[1]) / 2; yr = [c - sy / 2, c + sy / 2]; }
  drawMap(cv, {
    xr, yr, wCss, hCss: Math.round(ph + 42), mode: 'signed', xl: 'x (µm)', yl: 'y (µm)', frame: ['x', 'y'],
    grid: (nx, ny, xs, ys) => {
      const fx = xs.map(x => l.f(x)), fy = ys.map(y => v.f(y - yc)); const g = new Float32Array(nx * ny);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) g[j * nx + i] = fx[i] * fy[j];
      return g;
    },
    overlay: (ctx, X, Y) => {
      ctx.strokeStyle = tok('--ink'); ctx.lineWidth = 1.2; ctx.globalAlpha = 0.85;
      ctx.beginPath();
      if (embedded) { ctx.moveTo(X(xr[0]), Y(0)); ctx.lineTo(X(xr[1]), Y(0)); ctx.stroke(); ctx.strokeRect(X(-W / 2), Y(0), X(W / 2) - X(-W / 2), Y(-hI) - Y(0)); }
      else {
        ctx.moveTo(X(xr[0]), Y(hII)); ctx.lineTo(X(-W / 2), Y(hII)); ctx.lineTo(X(-W / 2), Y(hI)); ctx.lineTo(X(W / 2), Y(hI)); ctx.lineTo(X(W / 2), Y(hII)); ctx.lineTo(X(xr[1]), Y(hII)); ctx.stroke();
        ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(xr[0]), Y(0)); ctx.lineTo(X(xr[1]), Y(0)); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.globalAlpha = 1;
    }
  });
}
function renderTD1() {
  const geo = { hI: 1.8, hII: 1.0, W: 1.0 };
  const r = PH.eim({ lam: 0.8, nsup: 1, nc: 2.234, nsub: 2.214, ...geo, polV: 'TE', polH: 'TE' });
  const md = r.modes[0], v = md.vert, l = md.lat;
  const chiEl = $('td1-chi'), phiEl = $('td1-phi');
  const xr1 = [-0.9 - 3.2 / v.asub, 0.9 + 1.2];
  chiEl.innerHTML = plot({ w: plotW(chiEl), h: 220, xr: [xr1[0] + 0.9, xr1[1] + 0.9], yr: [-0.05, 1.12], m: { l: 46, r: 12, t: 12, b: 38 }, xl: 'y (µm) — vertical', yl: 'χ(y)', ny: 3,
    bands: [{ x0: -20, x1: 0, cls: 'band-sub', lab: 'n_{sub}' }, { x0: 0, x1: 1.8, cls: 'band-core', lab: 'n_g' }, { x0: 1.8, x1: 20, cls: 'band-sup', lab: 'air' }],
    series: [{ pts: linspace(xr1[0] + 0.9, xr1[1] + 0.9, 400).map(y => [y, v.f(y - 0.9)]), cls: 'c0', w: 2.2 }] });
  const xr2 = [-0.5 - 3 / l.asub, 0.5 + 3 / l.asub];
  phiEl.innerHTML = plot({ w: plotW(phiEl), h: 220, xr: xr2, yr: [-0.05, 1.12], m: { l: 46, r: 12, t: 12, b: 38 }, xl: 'x (µm) — latéral', yl: 'φ(x)', ny: 3,
    bands: [{ x0: -20, x1: -0.5, cls: 'band-sub', lab: 'A' }, { x0: -0.5, x1: 0.5, cls: 'band-core', lab: 'B' }, { x0: 0.5, x1: 20, cls: 'band-sub', lab: 'A' }],
    series: [{ pts: linspace(xr2[0], xr2[1], 400).map(x => [x, l.f(x)]), cls: 'c0', w: 2.2 }],
    texts: [{ x: xr2[0] + 0.2, y: 0.9, t: `n_{eff} = ${fr(md.neff, 4)}`, cls: 't s b' }] });
  const cv = $('td1-map');
  eimMap(cv, r, md, geo, Math.min(420, plotW(cv.parentElement)));
}
function renderTD2() {
  const geo = { hI: 1.5, hII: 0, W: 2 };
  const r = PH.eim({ lam: 1, nsup: 1, nc: 2.2, nsub: 2.12, ...geo, polV: 'TE', polH: 'TE' });
  const host = $('td2-maps');
  if (!host.childElementCount) {
    host.innerHTML = r.modes.map((m, i) => `<figure><canvas id="td2-c${i}" width="220" height="200"></canvas><div class="mlab">TE<sub>${m.p}${m.q}</sub> <span>n<sub>eff</sub> = ${fr(m.neff, 4)}</span></div></figure>`).join('');
  }
  r.modes.forEach((m, i) => { const cv = $('td2-c' + i); eimMap(cv, r, m, geo, Math.max(150, cv.parentElement.clientWidth || 200)); });
}


/* ======================= Figures des corrections d’exercices ======================= */
/* Lecture d'abaque b-V : courbes + points lus (tirets V → courbe → b) */
function bvRead(o) {
  const ser = [], dots = [], texts = [];
  o.curves.forEach(c => {
    const vc = PH.Vcut(c.a, c.p); if (vc >= o.Vmax) return;
    const pts = [[vc, 0]].concat(linspace(vc + 1e-6, o.Vmax, 180).map(V => [V, PH.bOfV(V, c.a, c.p)]));
    ser.push({ pts, cls: c.cls, w: c.w || 2, dash: c.dash });
    if (c.lab) { const lx = c.lx || o.Vmax * 0.9; texts.push({ x: lx, y: PH.bOfV(lx, c.a, c.p) + (c.ldy || 0.04), t: c.lab, cls: 't s b', anchor: c.anchor || 'end', style: `fill:var(${c.v || '--ink'})` }); }
  });
  (o.pts || []).forEach(q => {
    const b = PH.bOfV(q.V, q.a, q.p);
    ser.push({ pts: [[q.V, 0], [q.V, b], [0, b]], cls: 'cA', w: 1.2, dash: '4 3' });
    dots.push({ x: q.V, y: b, cls: q.fc || 'fc3' });
    texts.push({ x: q.V, y: b, t: q.lab || `b = ${fr(b, 2)}`, dx: q.dx === undefined ? 7 : q.dx, dy: q.dy === undefined ? -8 : q.dy, cls: 't s b', anchor: q.anchor || 'start' });
  });
  return plot({ w: o.w || 640, h: o.h || 300, xr: [0, o.Vmax], yr: [0, 1], xl: 'V', yl: 'b', series: ser, dots, texts: texts.concat(o.texts || []), vlines: o.vlines, ystep: 0.2, xstep: o.xstep, m: { l: 46, r: 14, t: 12, b: 40 }, aria: o.aria || 'Lecture de l’abaque b-V' });
}
/* Échelle d'indices : axe horizontal n, traits verticaux étiquetés */
function ladder(o) {
  const vl = o.items.map(it => ({ x: it.n, cls: it.cls || 's-ink', w: it.w || 2, dash: it.dash, lab: it.lab, ly: it.ly || 20, lcls: it.lcls || 't s b', anchor: it.anchor || 'start', ldx: it.ldx }));
  return plot({ w: o.w || 640, h: o.h || 130, xr: o.xr, yr: [0, 1], yticks: { list: [], step: 1 }, m: { l: 14, r: 14, t: 8, b: 38 }, xl: o.xl || 'indice', bands: o.bands, rects: o.rects, vlines: vl, xstep: o.xstep, texts: o.texts, dots: o.dots, aria: o.aria || 'Échelle des indices' });
}

function figTD1extra() {
  const a = (2.214 ** 2 - 1) / (2.234 ** 2 - 2.214 ** 2);
  $('fig-td1-bv').innerHTML = bvRead({ Vmax: 6, xstep: 1,
    curves: [{ a, p: 0, cls: 'c0', lab: 'a ≈ 44, p = 0', v: '--field', lx: 5.9, ldy: -0.08 }, { a, p: 1, cls: 'c1', dash: '6 4', lab: 'a ≈ 44, p = 1', v: '--m1', lx: 5.9, ldy: 0.05 }, { a: 0, p: 0, cls: 'c2', lab: 'a = 0, p = 0', v: '--m2', lx: 5.9, ldy: 0.04 }],
    pts: [{ V: 2.3425, a, p: 0, lab: 'A : b ≈ 0,27', dx: 8, dy: 16 }, { V: 4.2166, a, p: 0, lab: 'B : b ≈ 0,67', dx: 8, dy: 16 }, { V: 1.4641, a: 0, p: 0, lab: 'latéral : b ≈ 0,32', dx: -8, dy: -8, anchor: 'end' }],
    aria: 'Lectures de l’abaque pour le guide en arête' });
  $('fig-td1-lad').innerHTML = ladder({ xr: [2.213, 2.235], xstep: 0.004,
    items: [{ n: 2.214, lab: 'n_{sub} = 2,214', ly: 22, cls: 's-mut', lcls: 't s m' }, { n: 2.2195, lab: 'n_{slab,A} = 2,2195', ly: 44, anchor: 'end', ldx: -4 }, { n: 2.2216, lab: 'n_{eff} = 2,2216', ly: 66, cls: 's-f', lcls: 't s b f' },
      { n: 2.2273, lab: 'n_{slab,B} = 2,2273', ly: 22 }, { n: 2.234, lab: 'n_g = 2,234', ly: 44, cls: 's-mut', lcls: 't s m', anchor: 'end', ldx: -4 }] });
}

function figTD2extra() {
  const a = (2.12 ** 2 - 1) / (2.2 ** 2 - 2.12 ** 2), V = 2 * PI * 1.5 * Math.sqrt(2.2 ** 2 - 2.12 ** 2);
  const ns = [0, 1].map(p => Math.sqrt(2.12 ** 2 + PH.bOfV(V, a, p) * (2.2 ** 2 - 2.12 ** 2)));
  const VL = ns.map(n => 2 * PI * 2 * Math.sqrt(n * n - 2.12 ** 2));
  const left = bvRead({ w: 320, h: 290, Vmax: 8, xstep: 2,
    curves: [0, 1, 2].map(p => ({ a, p, cls: MODECLS[p], lab: 'p = ' + p, v: MODEVAR[p], lx: 7.9, ldy: 0.04 })),
    pts: [{ V, a, p: 0, lab: 'b_0 ≈ 0,79', dx: -6, dy: -8, anchor: 'end' }, { V, a, p: 1, lab: 'b_1 ≈ 0,21', dx: -6, dy: -8, anchor: 'end' }],
    texts: [{ x: 0.25, y: 0.94, t: 'vertical : a = 10', cls: 't s b' }] });
  const right = bvRead({ w: 320, h: 290, Vmax: 8, xstep: 2,
    curves: [0, 1, 2].map(q => ({ a: 0, p: q, cls: MODECLS[q], lab: 'q = ' + q, v: MODEVAR[q], lx: 7.9, ldy: 0.04 })),
    pts: [{ V: VL[0], a: 0, p: 0, lab: '00', dx: -6, anchor: 'end' }, { V: VL[0], a: 0, p: 1, lab: '01', dx: -6, anchor: 'end' }, { V: VL[0], a: 0, p: 2, lab: '02', dx: -4, dy: -6, anchor: 'end' },
      { V: VL[1], a: 0, p: 0, lab: '10', dx: -6, anchor: 'end' }, { V: VL[1], a: 0, p: 1, lab: '11', dx: 6, dy: -6 }],
    texts: [{ x: 0.25, y: 0.94, t: 'latéral : a = 0', cls: 't s b' }, { x: VL[1], y: 0.03, t: 'V_1', dx: 4, cls: 't s m' }, { x: VL[0], y: 0.03, t: 'V_0', dx: 4, cls: 't s m' }] });
  $('fig-td2-bv').innerHTML = combine(640, 290, [{ x: 0, y: 0, svg: left }, { x: 320, y: 0, svg: right }], 'Lectures de l’abaque pour le guide multimode');
  $('fig-td2-lad').innerHTML = ladder({ xr: [2.11, 2.205], xstep: 0.01, h: 150,
    items: [{ n: 2.12, lab: 'n_{sub}', ly: 22, cls: 's-mut', lcls: 't s m', anchor: 'end', ldx: -4 },
      { n: 2.1209, lab: 'TE_{02}, TE_{11} ≈ 2,121', ly: 44, cls: 'c2', lcls: 't s b' },
      { n: 2.1316, lab: 'TE_{10} 2,132', ly: 66, cls: 'c1', lcls: 't s b' },
      { n: 2.1372, lab: 'n_{slab,1}', ly: 88, cls: 's-mut', dash: '4 3', w: 1.4, lcls: 't s m' },
      { n: 2.1514, lab: 'TE_{01} 2,151', ly: 44, cls: 'c1', lcls: 't s b' },
      { n: 2.1752, lab: 'TE_{00} 2,175', ly: 22, cls: 'c0', lcls: 't s b f' },
      { n: 2.1836, lab: 'n_{slab,0}', ly: 66, cls: 's-mut', dash: '4 3', w: 1.4, lcls: 't s m' },
      { n: 2.2, lab: 'n_g', ly: 22, cls: 's-mut', lcls: 't s m', anchor: 'end', ldx: -4 }] });
}

function figModEIM() {
  let s = '';
  // section
  s += R(10, 40, 200, 30, 'f-sup', 'stroke="var(--rule)"') + R(10, 70, 200, 100, 'f-sub') + R(65, 70, 90, 46, 'f-core', 'stroke-width="1"') + L(10, 70, 210, 70, 's-ink', 1.2);
  s += T(16, 60, 'air', 't s m') + T(16, 160, 'n = 2,14', 't s') + T(110, 128, '2,145', 't s b', 'middle');
  s += A(92, 108, 92, 78, 's-f', 'ahf', 2) + T(98, 92, 'E', 't s b f');
  s += A2(65, 30, 155, 30, 's-ink', 'ah', 1) + T(110, 24, 'W + √(Dt)', 't s', 'middle');
  s += A2(170, 70, 170, 116, 's-ink', 'ah', 1) + T(176, 98, '2√(Dt)', 't s');
  s += triad(30, 212, { r: 'x', u: 'y', out: 'z' });
  s += T(110, 196, 'mode TM : E vertical', 't s m', 'middle');
  // ①
  s += A(216, 100, 252, 100, 's-acc', 'aha', 2) + T(234, 90, '①', 't b acc', 'middle');
  s += R(270, 40, 120, 34, 'f-sup', 'stroke="var(--rule)"') + R(270, 74, 120, 40, 'f-core', 'stroke-width="1"') + R(270, 114, 120, 40, 'f-sub');
  s += T(384, 62, 'n = 1', 't s m', 'end') + T(384, 98, '2,145', 't s b', 'end') + T(384, 140, '2,14', 't s', 'end');
  s += A(300, 108, 300, 80, 's-f', 'ahf', 2) + T(306, 96, 'E', 't s b f');
  s += A2(258, 74, 258, 114, 's-ink', 'ah', 1) + T(264, 168, '↑ épaisseur ← t', 't s m');
  s += T(268, 190, 'asymétrique (a ≈ 167)', 't s b') + T(268, 207, 'fondamental coupé', 't s') + T(268, 222, 'si trop fin ⇒ t compte', 't s');
  s += T(268, 240, 'E ⟂ couches ⇒ traité en TM', 't s acc b');
  // ②
  s += A(404, 100, 440, 100, 's-acc', 'aha', 2) + T(422, 90, '②', 't b acc', 'middle');
  s += R(458, 60, 70, 70, 'f-sub', 'stroke="var(--rule)"') + R(528, 60, 90, 70, 'f-core', 'stroke-width="1"') + R(618, 60, 70, 70, 'f-sub', 'stroke="var(--rule)"');
  s += T(493, 100, '2,14', 't s', 'middle') + T(573, 122, 'n_{slab}', 't s b', 'middle') + T(653, 100, '2,14', 't s', 'middle');
  s += A(573, 106, 573, 74, 's-f', 'ahf', 2) + T(579, 84, 'E', 't s b f');
  s += A2(528, 46, 618, 46, 's-ink', 'ah', 1) + T(573, 40, '← W', 't s m', 'middle');
  s += A(462, 150, 500, 150, 's-mut', 'ahm', 1) + T(504, 154, 'x', 't s m');
  s += T(458, 190, 'symétrique (a = 0)', 't s b') + T(458, 207, 'fondamental jamais coupé', 't s') + T(458, 222, 'W ne règle que le mode 1', 't s');
  s += T(458, 240, 'E ∥ flancs ⇒ traité en TE', 't s acc b');
  return svgWrap(700, 250, s, 'Découpage EIM du guide du modulateur');
}

/* Données du problème du modulateur : une seule source pour toutes ses figures.
   Les valeurs affichées dans le texte de la page en découlent (à recalculer si on change une donnée). */
const MOD = (() => {
  const n = 2.14, dn = 0.005, nc = n + dn, D = 0.6, l1 = 1.50, l2 = 1.60, lam = 1.55;
  const W = 6.0, tolW = 0.2, Le = 15, r33 = 30.8, crit = 8;          // µm, µm, mm, pm/V, critère e^{-crit} sur le champ
  const dmin = PH.dCut(0, l2, nc, n, 1, 'TM'), dmax = PH.dCut(1, l1, nc, n, 1, 'TM');
  const tmin = dmin * dmin / (4 * D), tmax = dmax * dmax / (4 * D), t = tmin + (tmax - tmin) / 4;
  const sq = Math.sqrt(D * t), d = 2 * sq;
  const nslab = (l, pol = 'TM') => PH.slabModes({ lam: l, d, nc, nsub: n, nsup: 1, pol })[0].neff;
  const wc = l => { const s = nslab(l); return l / (2 * Math.sqrt(s * s - n * n)); };
  const Wmax = wc(l1) - sq;
  const ns = nslab(lam), We = W + sq, V = 2 * PI / lam * We * Math.sqrt(ns * ns - n * n);
  const b = PH.bOfV(V, 0, 0), n00 = Math.sqrt(n * n + b * (ns * ns - n * n));
  const al = 2 * PI / lam * Math.sqrt(n00 * n00 - n * n), e = We / 2 + crit / al, g = 2 * e;
  const Vpi = lam * g / (n00 ** 3 * r33 * 1e-6 * Le * 1e3);           // λ et g en µm, r33 en µm/V, L en µm → volts
  return { n, nc, D, l1, l2, lam, W, tolW, Le, r33, crit, dmin, dmax, tmin, tmax, t, sq, d, nslab, wc, Wmax, ns, nsTE: nslab(lam, 'TE'), We, V, b, n00, al, e, g, Vpi };
})();

function figModDc() {
  const M = MOD, lam = linspace(1.48, 1.62, 60);
  const dc = m => lam.map(l => [l, PH.dCut(m, l, M.nc, M.n, 1, 'TM')]);
  return plot({ w: 640, h: 320, xr: [1.48, 1.62], yr: [0, 10], xstep: 0.02, xl: 'λ (µm)', yl: 'épaisseur d = 2(Dt)^{1/2} (µm)', aria: 'Épaisseurs de coupure TM',
    bands: [{ x0: M.l1, x1: M.l2, cls: 'band-amb', lab: `bande ${fr(M.l1, 2)}–${fr(M.l2, 2)} µm` }],
    rects: [{ x0: 1.48, x1: 1.62, y0: M.dmin, y1: M.dmax, cls: 'band-win' }],
    vlines: [{ x: M.l1, cls: 's-mut', dash: '3 3' }, { x: M.l2, cls: 's-mut', dash: '3 3' }],
    series: [{ pts: dc(0), cls: 'c0', w: 2.2 }, { pts: dc(1), cls: 'c1', w: 2.2 }],
    hlines: [{ y: M.d, cls: 's-acc', w: 2, lab: `choix : d = ${fr(M.d, 2)} µm (t = ${fr(M.t, 1)} h)`, lcls: 't s b acc', lx: 1.484, anchor: 'start' }],
    dots: [{ x: M.l2, y: M.dmin, cls: 'fc0' }, { x: M.l1, y: M.dmax, cls: 'fc1' }],
    texts: [{ x: 1.484, y: 1.0, t: 'sous d_{c,0} : aucun mode', cls: 't s', style: 'fill:var(--field)' }, { x: 1.484, y: 9.3, t: 'au-dessus de d_{c,1} : 2 modes', cls: 't s', style: 'fill:var(--m1)' },
      { x: 1.484, y: 6.2, t: 'monomode partout', cls: 't s b', style: 'fill:var(--ok)' },
      { x: M.l2, y: M.dmin, t: `d_{min} = ${fr(M.dmin, 3)}`, dx: -8, dy: 18, anchor: 'end', cls: 't s b', style: 'fill:var(--field)' }, { x: M.l1, y: M.dmax, t: `d_{max} = ${fr(M.dmax, 3)}`, dx: 8, dy: 18, cls: 't s b', style: 'fill:var(--m1)' }] });
}

function figModWc() {
  const M = MOD, lam = linspace(1.48, 1.62, 45), y0 = 7.6, y1 = 10.6;
  const wc = lam.map(l => [l, M.wc(l)]), w1 = M.wc(M.l1);
  const lo = M.W - M.tolW + M.sq, hi = M.W + M.tolW + M.sq;
  return plot({ w: 640, h: 320, xr: [1.48, 1.62], yr: [y0, y1], xstep: 0.02, xl: 'λ (µm)', yl: 'W_{eff} (µm)', aria: 'Largeur de coupure du second mode latéral',
    fills: [{ pts: wc.concat([[1.62, y1], [1.48, y1]]), cls: 'band-bad' }, { pts: wc.concat([[1.62, y0], [1.48, y0]]), cls: 'band-win' }],
    rects: [{ x0: 1.48, x1: 1.62, y0: lo, y1: hi, cls: 'band-amb' }],
    vlines: [{ x: M.l1, cls: 's-mut', dash: '3 3', lab: 'λ_{min}', ly: 240 }, { x: M.l2, cls: 's-mut', dash: '3 3', lab: 'λ_{max}', ly: 240 }],
    series: [{ pts: wc, cls: 'c1', w: 2.4 }, { pts: [[1.48, M.W + M.sq], [1.62, M.W + M.sq]], cls: 'cA', w: 1.6 }],
    hlines: [{ y: w1, cls: 's-warn', dash: '5 3', lab: `W_{eff,c1}(λ_{min}) = ${fr(w1, 2)} µm`, lcls: 't s b w', lx: 1.618, anchor: 'end' }],
    dots: [{ x: M.l1, y: w1, cls: 'fc1' }],
    texts: [{ x: 1.618, y: 10.3, t: '2 modes latéraux', cls: 't s b', anchor: 'end', style: 'fill:var(--warn)' }, { x: 1.618, y: 7.75, t: 'monomode', cls: 't s b', anchor: 'end', style: 'fill:var(--ok)' },
      { x: 1.484, y: 7.75, t: `W = ${fr(M.W, 1)} ± ${fr(M.tolW, 1)} → W_{eff} = ${fr(lo, 2)} – ${fr(hi, 2)} µm`, cls: 't s b acc' }] });
}
function figModTol() {
  const M = MOD, x0 = M.W - 1.0, x1 = M.W + 0.6, bad = M.W + M.tolW;
  return plot({ w: 640, h: 170, xr: [x0, x1], yr: [0, 1], xstep: 0.1, yticks: { list: [], step: 1 }, m: { l: 14, r: 14, t: 8, b: 38 }, xl: 'largeur dessinée sur le masque W (µm)', aria: 'Tolérance du masque',
    bands: [{ x0: M.Wmax, x1: x1, cls: 'band-bad', lab: 'bimode' }],
    rects: [{ x0: M.W - M.tolW, x1: M.W + M.tolW, y0: 0.55, y1: 0.8, cls: 'band-win' }, { x0: bad - M.tolW, x1: bad + M.tolW, y0: 0.12, y1: 0.37, cls: 'band-amb' }],
    vlines: [{ x: M.Wmax, cls: 's-warn', w: 2, lab: `W_{max} = ${fr(M.Wmax, 2)} (exclu)`, ly: 120, ldx: -6, anchor: 'end', lcls: 't s b w' }],
    series: [{ pts: [[M.W - M.tolW, 0.675], [M.W + M.tolW, 0.675]], cls: 'cI', w: 1.2 }, { pts: [[bad - M.tolW, 0.245], [bad + M.tolW, 0.245]], cls: 'cI', w: 1.2 }],
    dots: [{ x: M.W, y: 0.675, cls: 'fc2' }, { x: bad, y: 0.245, cls: 'fc3' }],
    texts: [{ x: x0 + 0.01, y: 0.64, t: `W = ${fr(M.W, 1)} : de ${fr(M.W - M.tolW, 1)} à ${fr(M.W + M.tolW, 1)} ✓`, cls: 't s b', style: 'fill:var(--ok)' },
      { x: x0 + 0.01, y: 0.21, t: `W = ${fr(bad, 1)} : de ${fr(bad - M.tolW, 1)} à ${fr(bad + M.tolW, 1)} ✗`, cls: 't s b', style: 'fill:var(--warn)' }] });
}

function figModBV() {
  const M = MOD;
  $('fig-mod-bv').innerHTML = bvRead({ Vmax: 5, xstep: 1, h: 290,
    curves: [{ a: 0, p: 0, cls: 'c0', lab: 'a = 0, q = 0', v: '--field', lx: 4.9, ldy: 0.04 }, { a: 0, p: 1, cls: 'c1', lab: 'a = 0, q = 1', v: '--m1', lx: 4.9, ldy: 0.05 }],
    pts: [{ V: M.V, a: 0, p: 0, lab: `V = ${fr(M.V, 2)} → b ≈ ${fr(M.b, 2)}`, dx: -8, dy: -10, anchor: 'end' }],
    vlines: [{ x: PI, cls: 's-warn', dash: '4 3', lab: 'V = π', ly: 230, lcls: 't s b w' }],
    aria: 'Lecture de l’abaque pour n00' });
  $('fig-mod-lad').innerHTML = ladder({ xr: [M.n - 0.0003, M.n + 0.0029], xstep: 0.0005, h: 140,
    bands: [{ x0: M.n, x1: M.ns, cls: 'band-win' }],
    items: [{ n: M.n, lab: `n = ${fr(M.n, 2)}`, ly: 22, cls: 's-mut', lcls: 't s m' }, { n: M.n00, lab: `n_{00} = ${fr(M.n00, 5)}`, ly: 46, cls: 's-f', lcls: 't s b f' },
      { n: M.ns, lab: `n_{slab} = ${fr(M.ns, 5)}`, ly: 70, anchor: 'end', ldx: -4 }, { n: M.nsTE, lab: `abaque TE : ${fr(M.nsTE, 5)} ✗`, ly: 94, cls: 's-warn', dash: '4 3', lcls: 't s b w' }] });
}

function figPhasor() {
  let s = '';
  const ph = 60 * PI / 180, R0 = 120, ox = 70, oy = 70;
  const a2 = [ox + R0, oy], a1 = [ox + R0 * Math.cos(ph), oy + R0 * Math.sin(ph)];
  s += A(ox - 10, oy, 330, oy, 's-mut', 'ahm', 1) + T(334, oy + 4, 'Re', 't s m') + A(ox, oy + 160, ox, oy - 50, 's-mut', 'ahm', 1) + T(ox, oy - 56, 'Im', 't s m', 'middle');
  s += A(ox, oy, a2[0], a2[1], 's-f', 'ahf', 2.2) + T(a2[0] - 4, oy - 8, 'a_2', 't b f', 'end');
  s += A(ox, oy, a1[0], a1[1], 's-f', 'ahf', 2.2) + T(a1[0] - 10, a1[1] + 2, 'a_1', 't b f', 'end');
  s += `<path d="M ${ox + 40} ${oy} A 40 40 0 0 1 ${ox + 40 * Math.cos(ph)} ${oy + 40 * Math.sin(ph)}" class="s-acc" stroke-width="1.5"/>` + T(ox + 48, oy + 30, 'φ', 't b acc');
  s += L(a2[0], a2[1], a1[0] + R0, a1[1], 's-mut', 1, 'stroke-dasharray="3 3"') + L(a1[0], a1[1], a1[0] + R0, a1[1], 's-mut', 1, 'stroke-dasharray="3 3"');
  s += A(ox, oy, a1[0] + R0, a1[1], 'c2', 'ah', 2.4, 'style="stroke:var(--m2)"') + T(a1[0] + R0 + 6, a1[1] + 4, 'a_1 + a_2', 't b', 'start', 'style="fill:var(--m2)"');
  s += T(a1[0] + R0 + 6, a1[1] + 20, '∝ c_e ~ cos(φ/2)', 't s', 'start', 'style="fill:var(--m2)"');
  s += A(a2[0], a2[1], a1[0], a1[1], 'c1', 'ahr', 2.2) + T(a2[0] + 4, oy + 46, 'a_1 − a_2', 't b', 'start', 'style="fill:var(--m1)"') + T(a2[0] + 4, oy + 62, '∝ c_o ~ sin(φ/2)', 't s', 'start', 'style="fill:var(--m1)"');
  s += L(420, 14, 420, 236, 's-rule');
  // cas extrêmes
  const mini = (x, y, lab1, lab2, opp) => {
    let t = A(x, y, x + 70, y, 's-f', 'ahf', 2) + T(x + 74, y + 4, 'a_2', 't s f');
    t += opp ? A(x, y, x - 70, y, 's-f', 'ahf', 2) + T(x - 74, y + 4, 'a_1', 't s f', 'end') : A(x, y + 8, x + 70, y + 8, 's-f', 'ahf', 2) + T(x + 74, y + 16, 'a_1', 't s f');
    return t + T(x, y + 36, lab1, 't s b', 'middle') + T(x, y + 52, lab2, 't s m', 'middle');
  };
  s += T(530, 34, 'φ = 0', 't b', 'middle') + mini(500, 60, 'somme max, différence nulle', '→ supermode pair seul (Q5)', false);
  s += T(530, 150, 'φ = π', 't b', 'middle') + mini(530, 176, 'somme nulle, différence max', '→ supermode impair seul', true);
  return svgWrap(660, 250, s, 'Phaseurs à l’entrée du coupleur');
}
function figMziResp() {
  const xs = linspace(0, 2, 300);
  return plot({ w: 640, h: 260, xr: [0, 2], yr: [0, 1.08], xstep: 0.5, ystep: 0.25, xl: 'φ / π', yl: 'P / P_0', aria: 'Réponse du Mach-Zehnder',
    series: [{ pts: xs.map(x => [x, 0.5 * (1 + Math.sin(PI * x))]), cls: 'c0', w: 2.4 }, { pts: xs.map(x => [x, 0.5 * (1 - Math.sin(PI * x))]), cls: 'c1', w: 2.4, dash: '6 4' }],
    dots: [{ x: 0, y: 0.5, cls: 'fc3', r: 5.5 }, { x: 0.5, y: 1, cls: 'fc0' }, { x: 1.5, y: 1, cls: 'fc1' }],
    texts: [{ x: 0.5, y: 1, t: 'P_1 = P_0', dx: 8, dy: -6, cls: 't s b f' }, { x: 1.5, y: 1, t: 'P_2 = P_0', dx: 8, dy: -6, cls: 't s b', style: 'fill:var(--m1)' },
      { x: 0.8, y: 0.86, t: 'P_1', cls: 't b f' }, { x: 0.8, y: 0.2, t: 'P_2', cls: 't b', style: 'fill:var(--m1)' }] });
}

function figModDecay() {
  const M = MOD, h = M.We / 2, u = M.V / 2 * Math.sqrt(1 - M.b), al = M.V / 2 * Math.sqrt(M.b) / h, c = M.crit;
  const xm = Math.ceil((M.e + 6) / 5) * 5, xs = linspace(0, xm, 400);
  const f = x => x <= h ? Math.log(Math.cos(u * x / h) / Math.cos(u)) : -al * (x - h);
  return plot({ w: 640, h: 300, xr: [0, xm], yr: [-c - 1.5, 1], xstep: 5, ystep: 2, xl: 'distance à l’axe du guide x (µm)', yl: 'ln(E / E_{bord})', aria: 'Décroissance latérale du champ',
    bands: [{ x0: 0, x1: h, cls: 'band-core' }, { x0: M.e, x1: xm, cls: 'band-amb', lab: 'électrode' }],
    series: [{ pts: xs.map(x => [x, f(x)]), cls: 'c0', w: 2.4 }],
    hlines: [{ y: -c, cls: 's-warn', dash: '5 3', lab: `−${c} : champ divisé par e^{${c}} ≈ ${Math.round(Math.exp(c) / 100) * 100}`.replace(/(\d)(\d{3})$/, '$1 $2'), lcls: 't s b w', lx: 5, anchor: 'start' }],
    vlines: [{ x: M.e, cls: 's-acc', w: 2, lab: `e = ${fr(M.e, 1)} µm`, ly: 40, ldx: -6, anchor: 'end', lcls: 't s b acc' }],
    dims: [{ x0: h, x1: M.e, y: -c * 0.62, lab: `${c}/α = ${fr(c / al, 1)} µm` }],
    dots: [{ x: M.e, y: -c, cls: 'fc1' }],
    texts: [{ x: 0.5, y: 0.45, t: 'cœur', cls: 't s m' }, { x: h + 6, y: -1.7, t: `pente −α = −${fr(al, 3)} µm^{-1}`, cls: 't s f' }] });
}
function figChain() {
  let s = '';
  const bx = [['V', 'tension appliquée'], ['E = V/g', 'champ uniforme'], ['Δn = ½n^3r_{33}E', 'effet Pockels'], ['Δφ = 2πΔnL/λ', 'sur L_{elec}'], ['P_1 = ½P_0(1+sinΔφ)', 'MZI (Q8)']];
  const w = 136, g = 18;
  bx.forEach(([a, b], i) => {
    const x = 6 + i * (w + g);
    s += R(x, 30, w, 46, 'f-paper', 'rx="6" style="stroke:var(--ink)" stroke-width="1.2"') + T(x + w / 2, 58, a, 't s b', 'middle') + T(x + w / 2, 96, b, 't s m', 'middle');
    if (i < bx.length - 1) s += A(x + w + 2, 53, x + w + g - 2, 53, 's-acc', 'aha', 1.8);
  });
  s += T(6, 126, 'Δφ = π quand V = V_π = λg / (n^3 r_{33} L_{elec})', 't s b acc');
  return svgWrap(780, 136, s, 'Chaîne tension → puissance');
}
function figModPV() {
  const Vp = MOD.Vpi, xm = Math.ceil(Vp * 1.75 / 5) * 5, xs = linspace(-4, xm, 400);
  return plot({ w: 640, h: 270, xr: [-4, xm], yr: [0, 1.12], xstep: 10, ystep: 0.25, xl: 'tension V (volts)', yl: 'P / P_0', aria: 'Puissance de sortie en fonction de la tension',
    series: [{ pts: xs.map(V => [V, 0.5 * (1 + Math.sin(PI * V / Vp))]), cls: 'c0', w: 2.4 }, { pts: xs.map(V => [V, 0.5 * (1 - Math.sin(PI * V / Vp))]), cls: 'c1', w: 2, dash: '6 4' }],
    vlines: [{ x: 0, cls: 's-mut', dash: '3 3' }, { x: Vp / 2, cls: 's-acc', w: 1.6, dash: '4 3', lab: `V_{bias} = ${fr(Vp / 2, 1)} V`, ly: 140, ldx: 5, lcls: 't s b acc' }, { x: Vp * 1.5, cls: 's-acc', w: 1.6, dash: '4 3', lab: `V_{bias} + V_π = ${fr(Vp * 1.5, 1)} V`, ly: 140, ldx: -5, anchor: 'end', lcls: 't s b acc' }],
    dims: [{ x0: Vp / 2, x1: Vp * 1.5, y: 1.06, lab: `V_π = ${fr(Vp, 1)} V` }],
    dots: [{ x: 0, y: 0.5, cls: 'fc3' }, { x: Vp / 2, y: 1, cls: 'fc0' }, { x: Vp * 1.5, y: 0, cls: 'fc0' }],
    texts: [{ x: Vp * 0.2, y: 0.9, t: 'P_1', cls: 't b f', anchor: 'middle' }, { x: Vp * 0.2, y: 0.32, t: 'P_2', cls: 't b', anchor: 'middle', style: 'fill:var(--m1)' }] });
}
/* Illustration de l'accueil : les modes TE d'un guide plan, calculés au chargement */
function figHero() {
  const p = { lam: 1, d: 4, nc: 1.55, nsub: 1.5, nsup: 1.0, pol: 'TE' };
  const ms = PH.slabModes(p), xr = [-6.5, 4.5];
  const top = plot({ w: 600, h: 96, xr, yr: [1.47, 1.565], m: { l: 50, r: 14, t: 10, b: 14 }, noxl: true, yl: 'n(x)', ny: 2, ystep: 0.05,
    bands: [{ x0: -10, x1: -2, cls: 'band-sub' }, { x0: -2, x1: 2, cls: 'band-core' }, { x0: 2, x1: 10, cls: 'band-sup' }],
    series: [{ pts: [[xr[0], 1.5], [-2, 1.5], [-2, 1.55], [2, 1.55], [2, 1.0], [xr[1], 1.0]], cls: 'cI', w: 1.8 }],
    hlines: ms.map((m, i) => ({ y: m.neff, cls: MODECLS[i], dash: '5 3' })), aria: 'Profil d’indice du guide' });
  const bot = plot({ w: 600, h: 250, xr, yr: [-1.15, 1.15], m: { l: 50, r: 14, t: 6, b: 38 }, xl: 'x (µm), normale aux couches', yl: 'E_y', ny: 4,
    bands: [{ x0: -10, x1: -2, cls: 'band-sub', lab: 'substrat' }, { x0: -2, x1: 2, cls: 'band-core', lab: 'cœur' }, { x0: 2, x1: 10, cls: 'band-sup', lab: 'air' }],
    series: ms.map((m, i) => ({ pts: linspace(xr[0], xr[1], 400).map(x => [x, m.f(x)]), cls: MODECLS[i], w: 2.4 })),
    hlines: [{ y: 0, cls: 's-mut' }],
    texts: ms.map((m, i) => ({ x: -6.3, y: -0.55 - i * 0.2, t: `m = ${i} · n_{eff} = ${fr(m.neff, 4)}`, cls: 't s b', style: `fill:var(${MODEVAR[i % 5]})` })), aria: 'Profils des trois modes' });
  $('fig-hero').innerHTML = combine(600, 346, [{ x: 0, y: 0, svg: top }, { x: 0, y: 96, svg: bot }], 'Les trois modes TE d’un guide plan');
}

/* ======================= Mise en place des figures ======================= */
/* Chaque page ne contient qu'une partie des figures : on ne dessine que celles
   dont le conteneur existe dans la page. */
const FIGURES = {
  'fig-curl': figCurl, 'fig-inv': figInv, 'fig-slab': figSlab, 'fig-tetm': figTETM, 'fig-interf': figInterf,
  'fig-channels': figChannels, 'fig-frames': figFrames, 'fig-eim': figEIM, 'fig-td1': figTD1, 'fig-td2': figTD2,
  'fig-exc': figExc, 'fig-coupler': figCoupler, 'fig-diff': figDiff, 'fig-mzi': figMZI,
  'fig-mod-eim': figModEIM, 'fig-mod-dc': figModDc, 'fig-mod-wc': figModWc, 'fig-mod-tol': figModTol,
  'fig-phasor': figPhasor, 'fig-mzi-resp': figMziResp, 'fig-mod-decay': figModDecay, 'fig-chain': figChain, 'fig-mod-pv': figModPV
};
/* Figures qui remplissent elles-mêmes leur(s) conteneur(s) */
const FIGURES_DIRECTES = {
  'fig-modes': figModes, 'fig-deff': figDeff, 'fig-rad': figRad, 'fig-bound': figBound,
  'fig-td1-bv': figTD1extra, 'fig-td2-bv': figTD2extra, 'fig-mod-bv': figModBV, 'fig-hero': figHero
};
function initFigures() {
  Object.entries(FIGURES).forEach(([id, f]) => { const el = $(id); if (!el) return; try { el.innerHTML = f(); } catch (e) { console.error(id, e); } });
  Object.entries(FIGURES_DIRECTES).forEach(([id, f]) => { if (!$(id)) return; try { f(); } catch (e) { console.error(id, e); } });
}
