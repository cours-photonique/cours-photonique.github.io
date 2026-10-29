/* ======================= Site : sommaire de page, thème, mise en route ======================= */

/* Sommaire « Dans cette page », construit à partir des titres, exercices et labos présents. */
function buildTOC() {
  const list = $('toc-list');
  if (!list) return;
  const items = [];
  document.querySelectorAll('main h2[id], main .lab[id], main .box.td[id]').forEach(el => {
    if (el.tagName === 'H2') {
      const num = el.querySelector('.num');
      const n = num ? num.textContent : '';
      items.push({ id: el.id, n, t: el.textContent.replace(n, '').trim(), cls: el.id === 'testez-vous' ? 'tv' : '' });
    } else if (el.classList.contains('lab')) {
      items.push({ id: el.id, n: 'L' + el.id.slice(3), t: el.querySelector('.lab-name').textContent, cls: 'tl' });
    } else {
      const tg = el.querySelector('.tag').textContent;
      const [head, title] = tg.split('—').map(x => x.trim());
      items.push({ id: el.id, n: head.replace('Exercice', 'Ex.'), t: title || head, cls: 'ex' });
    }
  });
  list.innerHTML = items.map(i => `<li class="${i.cls}"><a href="#${i.id}" data-id="${i.id}"><span class="n">${esc(i.n)}</span><span>${esc(i.t)}</span></a></li>`).join('');
  const mob = $('toc-list-m');
  if (mob) {
    mob.innerHTML = items.map(i => `<li><a href="#${i.id}"><span class="n">${esc(i.n)}</span>${esc(i.t)}</a></li>`).join('');
    mob.addEventListener('click', e => { if (e.target.closest('a')) e.currentTarget.closest('details').open = false; });
  }
  const links = [...list.querySelectorAll('a')];
  const targets = links.map(a => document.getElementById(a.dataset.id));
  let tk = 0;
  const spy = () => {
    tk = 0; let cur = -1;
    targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < 140) cur = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === cur));
  };
  window.addEventListener('scroll', () => { if (!tk) tk = requestAnimationFrame(spy); }, { passive: true });
  spy();
}

/* Bouton de thème : automatique (système) → clair → sombre. Le choix est mémorisé dans ce navigateur. */
function setupTheme() {
  const btn = $('theme-toggle');
  if (!btn) return;
  const order = ['auto', 'light', 'dark'];
  const names = { auto: 'Thème : auto', light: 'Thème : clair', dark: 'Thème : sombre' };
  const current = () => document.documentElement.getAttribute('data-theme') || 'auto';
  const show = () => { const c = current(); btn.querySelector('span').textContent = names[c]; btn.setAttribute('data-mode', c); };
  btn.addEventListener('click', () => {
    const next = order[(order.indexOf(current()) + 1) % order.length];
    if (next === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', next);
    try { if (next === 'auto') localStorage.removeItem('theme'); else localStorage.setItem('theme', next); } catch (e) { }
    show();
  });
  show();
}

/* Lien « dépôt GitHub du site » : déduit de l'adresse quand le site est servi par GitHub Pages
   (pseudo.github.io/depot/ → github.com/pseudo/depot/issues). Ailleurs, le lien reste vers github.com. */
function setupRepoLink() {
  const a = $('lien-issues');
  if (!a) return;
  const host = location.hostname;
  if (!host.endsWith('.github.io')) return;
  const user = host.slice(0, -'.github.io'.length);
  const first = location.pathname.split('/').filter(Boolean)[0];
  const repo = first && !first.endsWith('.html') ? first : host;
  a.href = `https://github.com/${user}/${repo}/issues`;
}

function rerenderAll() { RENDERERS.forEach(f => { try { f(); } catch (e) { console.error(e); } }); }

function init() {
  setupTheme();
  setupRepoLink();
  markers();
  try { initFigures(); } catch (e) { console.error(e); }
  if ($('td1-chi')) { try { renderTD1(); RENDERERS.push(renderTD1); } catch (e) { console.error(e); } }
  if ($('td2-maps')) { try { renderTD2(); RENDERERS.push(renderTD2); } catch (e) { console.error(e); } }
  [lab1, lab2, lab3, lab4, lab5, lab6, lab7].forEach((f, i) => {
    if (!$(`lab${i + 1}-body`)) return;
    try { f(); } catch (e) { console.error(e); }
  });
  buildTOC();
  const main = document.querySelector('main');
  if (main) {
    let lastW = main.clientWidth, rt = 0;
    if ('ResizeObserver' in window) new ResizeObserver(() => {
      const w = main.clientWidth; if (Math.abs(w - lastW) < 4) return; lastW = w;
      clearTimeout(rt); rt = setTimeout(rerenderAll, 160);
    }).observe(main);
  }
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', rerenderAll); } catch (e) { }
  new MutationObserver(rerenderAll).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rerenderAll);
}
init();
