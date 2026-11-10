/* Вся логика сайта одним файлом: разделы, состав и лаборатория, матч-центр, поиск, настройки вида, графики, эффекты, тактическая доска. */

/* ======== script.js ======== */
// Логика сайта. Данные — в data.js
const D = window.SITE;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---------- Тема ----------
const root = document.documentElement;
try {
  const saved = localStorage.getItem('rm-theme');
  if (saved) root.dataset.theme = saved;
} catch (e) {}
// переключение темы, плотности и шрифта — в view.js

// ---------- Появление при прокрутке ----------
const io = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 })
  : null;

function observeReveal(scope = document) {
  $$('.reveal:not(.in)', scope).forEach(el => (io ? io.observe(el) : el.classList.add('in')));
}

// ---------- Переключение разделов ----------
const views = $$('.view');
const links = $$('.nav a');
let current = null;

let flushNav = null;   // завершает незаконченный переход, если пользователь кликает быстро
function showPage() {
  const raw = location.hash.slice(1);
  const id = raw.split('/')[0];   // «match/2026-10-25» → раздел match
  const target = document.getElementById(id) && document.getElementById(id).classList.contains('view') ? id : 'news';
  if (target === current && target !== 'match') return;
  if (flushNav) flushNav();
  const prev = current;
  current = target;

  const swap = () => {
    views.forEach(v => { v.classList.remove('leaving'); v.classList.toggle('active', v.id === target); });
    const pg = target === 'match' ? 'matches' : target;
    links.forEach(a => a.classList.toggle('active', a.dataset.page === pg));
    $$('.tabbar a').forEach(a => a.classList.toggle('active', a.dataset.page === pg));
    window.scrollTo({ top: 0, behavior: 'instant' });

    const view = document.getElementById(target);
    $$('.reveal', view).forEach((el, i) => el.style.setProperty('--d', `${Math.min(i, 6) * 0.06}s`));
    observeReveal(view);

    if (target === 'news') runCounters();
    if (target === 'history') renderTimeline();
    if (target === 'data-lab') renderChart(activeChart);
    document.dispatchEvent(new CustomEvent('pagechange', { detail: target }));
  };

  // плавный переход: текущий раздел мягко гаснет, новый появляется (работает во всех браузерах)
  const prevEl = prev && prev !== target ? document.getElementById(prev) : null;
  if (!prevEl || matchMedia('(prefers-reduced-motion: reduce)').matches) { swap(); return; }
  prevEl.classList.add('leaving');
  let done = false;
  const finish = () => { if (done) return; done = true; flushNav = null; clearTimeout(timer); swap(); };
  const timer = setTimeout(finish, 200);
  flushNav = finish;
}
window.addEventListener('hashchange', showPage);
// браузер после загрузки сам прокручивает к якорю #раздел — возвращаем начало страницы
window.addEventListener('load', () => { if (!history.state && location.hash) window.scrollTo({ top: 0, behavior: 'instant' }); });

// ---------- Счётчики ----------
const statsEl = $('#stats');
statsEl.innerHTML = D.stats.map(s => `
  <div class="stat"><b data-to="${s.value}">0</b><span>${s.label}</span></div>
`).join('');
$('#statsNote').textContent = D.statsNote;

// Сводная карточка в первом экране (данные из D.now)
(function () {
  const pick = k => D.now.find(n => n.k.toLowerCase().startsWith(k)) || {};
  const rows = [
    ['♛', 'Главный тренер', pick('главный').v],
    ['★', 'Капитан и вице-капитан', `${(pick('капитан').v || '')} · ${(pick('вице').v || '')}`],
    ['◎', pick('ла лига').k, pick('ла лига').v],
    ['❖', pick('победы').k, pick('победы').v],
  ];
  $('#heroCard').innerHTML = `
    <span class="hc-tag">Сводка 2026/27</span>
    <div class="hc-head"><img class="hc-logo" src="${window.CREST}" alt="" onerror="this.outerHTML='<span class=&quot;hc-crest&quot;>RM</span>'"><div><strong>Los Blancos · Белые</strong><small>Мадрид, Испания</small></div></div>
    ${rows.map(r => `<div class="hc-row"><span class="hc-ico">${r[0]}</span><div><small>${r[1]}</small><b>${r[2] || '—'}</b></div></div>`).join('')}
    <div class="hc-motto"><small>Девиз клуба</small><b>¡Hala Madrid!</b></div>`;
})();

function runCounters() {
  $$('.stat b', statsEl).forEach(el => {
    const to = +el.dataset.to;
    const t0 = performance.now();
    const dur = 1400;
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}

// ---------- Новости ----------
const fmt = new Intl.DateTimeFormat((window.LOCALE || 'ru-RU'), { day: 'numeric', month: 'long', year: 'numeric' });
const chipsEl = $('#chips');
const searchEl = $('#search');
let cat = 'Все';

chipsEl.innerHTML = D.categories.map((c, i) =>
  `<button class="chip${i === 0 ? ' active' : ''}" data-c="${c}" type="button">${c}</button>`).join('');

chipsEl.addEventListener('click', e => {
  const b = e.target.closest('.chip');
  if (!b) return;
  cat = b.dataset.c;
  $$('.chip', chipsEl).forEach(x => x.classList.toggle('active', x === b));
  renderNews();
});
searchEl.addEventListener('input', renderNews);

const COVER = {
  'Матчи': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><circle cx="32" cy="32" r="26"/><path d="M32 20l11 8-4 13H25l-4-13z" fill="currentColor"/><path d="M32 20V6M43 28l14-5M39 41l8 12M25 41l-8 12M21 28L7 23"/></svg>',
  'Трансферы': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h44M40 10l12 12-12 12M56 42H12M24 30L12 42l12 12"/></svg>'
};
function coverIcon(cat) {
  if (COVER[cat]) return COVER[cat];
  return window.CREST ? `<img src="${window.CREST}" alt="">` : '';
}

function renderNews() {
  const q = searchEl.value.trim().toLowerCase();
  const list = D.news.filter(n =>
    (cat === 'Все' || n.cat === cat) &&
    (!q || hay(n.title + ' ' + n.text).toLowerCase().includes(q)));

  $('#news-grid').innerHTML = list.map((n, i) => `
    <button class="card reveal${i === 0 && cat === 'Все' && !q ? ' featured' : ''}" data-id="${n.id}" style="--d:${Math.min(i, 6) * 0.05}s" type="button">
      <div class="card-img" data-cat="${n.cat}"><span class="ci-icon" aria-hidden="true">${coverIcon(n.cat)}</span><span class="tag">${n.cat}</span></div>
      <div class="card-body">
        <time datetime="${n.date}">${fmt.format(new Date(n.date))}</time>
        <h3>${n.title}</h3>
        <p>${n.text}</p>
      </div>
    </button>`).join('');
  $('#news-empty').hidden = list.length > 0;
  observeReveal($('#news-grid'));
}

// Окно новости
const modal = $('#modal');
$('#news-grid').addEventListener('click', e => {
  const card = e.target.closest('.card');
  if (!card) return;
  const n = D.news.find(x => x.id === +card.dataset.id);
  $('#modalDate').textContent = fmt.format(new Date(n.date));
  $('#modalDate').dateTime = n.date;
  $('#modalCat').textContent = n.cat;
  $('#modalTitle').textContent = n.title;
  $('#modalBody').textContent = n.body;
  modal.showModal();
});
$('#modalClose').addEventListener('click', () => modal.close());
modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });

// ---------- Легенды и FAQ ----------
$('#legends').innerHTML = D.legends.map((l, i) => {
  const initials = tr(l.name).split(' ').map(w => w[0]).slice(0, 2).join('');
  return `
    <article class="card legend reveal" style="--d:${i * 0.06}s">
      <div class="avatar">${initials}</div>
      <h3>${l.name}</h3>
      <div class="meta">${l.role} · ${l.years}</div>
      <p>${l.text}</p>
    </article>`;
}).join('');

$('#faq').innerHTML = D.faq.map(f => `
  <details><summary>${f.q}</summary><p>${f.a}</p></details>`).join('');

// ---------- История ----------
let histFilter = 'all';
function renderTimeline() {
  const list = D.timeline.filter(t => histFilter === 'all' || t.type === histFilter);
  $('#timeline').innerHTML = list.map((t, i) => `
    <li class="reveal" style="--d:${Math.min(i, 5) * 0.06}s">
      <time>${t.year}</time>
      <div><h3>${t.title}</h3><p>${t.text}</p></div>
    </li>`).join('');
  observeReveal($('#timeline'));
}
$('#histChips').addEventListener('click', e => {
  const b = e.target.closest('.chip');
  if (!b) return;
  histFilter = b.dataset.f;
  $$('.chip', $('#histChips')).forEach(x => x.classList.toggle('active', x === b));
  renderTimeline();
});

// ---------- Лаборатория данных: графики ----------
let activeChart = 'decades';
const area = $('#chartArea');
const note = $('#chartNote');

function decadesData() {
  const map = {};
  D.finals.forEach(f => {
    const d = Math.floor(f.year / 10) * 10;
    map[d] = (map[d] || 0) + 1;
  });
  return Object.keys(map).map(k => ({ label: `${k}-е`, value: map[k] }));
}

function renderChart(kind) {
  activeChart = kind;
  $$('.tab', $('#chartTabs')).forEach(t => t.classList.toggle('active', t.dataset.chart === kind));

  if (kind === 'decades') {
    const data = decadesData();
    const max = Math.max(...data.map(d => d.value));
    area.innerHTML = `
      <div class="vbars">${data.map((d, i) => `
        <div class="vbar"><em>${d.value}</em><i data-h="${(d.value / max) * 88}%" style="--d:${i * 0.08}s"></i></div>`).join('')}
      </div>
      <div class="vlabels">${data.map(d => `<span>${d.label}</span>`).join('')}</div>`;
    note.textContent = `Победы в финалах Кубка чемпионов по десятилетиям. Всего: ${D.finals.length}.`;
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.vbar i', area).forEach(el => { el.style.height = el.dataset.h; })));
  }

  if (kind === 'scorers') {
    const max = Math.max(...D.scorers.map(s => s.goals));
    area.innerHTML = `<div class="hbars">${D.scorers.map((s, i) => `
      <div class="hbar">
        <span>${s.name}</span>
        <span class="track"><span class="fill" data-w="${(s.goals / max) * 100}%" style="--d:${i * 0.08}s"></span></span>
        <b>${s.goals}</b>
      </div>`).join('')}</div>`;
    note.textContent = 'Голы за клуб во всех турнирах. Мбаппе — на 25 октября 2026 года; остальные цифры по открытым источникам, уточняйте при необходимости.';
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.fill', area).forEach(el => { el.style.width = el.dataset.w; })));
  }

  if (kind === 'line') {
    const W = 640, H = 280, pad = { l: 36, r: 16, t: 16, b: 32 };
    const years = D.finals.map(f => f.year);
    const x0 = 1950, x1 = 2030, total = years.length;
    const X = y => pad.l + ((y - x0) / (x1 - x0)) * (W - pad.l - pad.r);
    const Y = v => H - pad.b - (v / total) * (H - pad.t - pad.b);

    let d = `M ${X(x0)} ${Y(0)}`;
    let count = 0;
    years.forEach(y => { d += ` L ${X(y)} ${Y(count)} L ${X(y)} ${Y(++count)}`; });
    d += ` L ${X(2025)} ${Y(count)}`;
    const areaD = `${d} L ${X(2025)} ${Y(0)} Z`;

    const gridLines = [0, 5, 10, 15].map(v => `
      <line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${Y(v)}" y2="${Y(v)}"/>
      <text x="${pad.l - 8}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join('');
    const xTicks = [1950, 1970, 1990, 2010, 2030].map(y =>
      `<text x="${X(y)}" y="${H - 10}" text-anchor="middle">${y}</text>`).join('');
    const dots = years.map((y, i) => `<circle cx="${X(y)}" cy="${Y(i + 1)}" r="3.5"><title>${y}: ${i + 1}</title></circle>`).join('');

    area.innerHTML = `
      <svg class="line-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Рост числа титулов">
        <defs><linearGradient id="goldFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#d4af37" stop-opacity=".35"/><stop offset="1" stop-color="#d4af37" stop-opacity="0"/>
        </linearGradient></defs>
        ${gridLines}${xTicks}
        <path class="area" d="${areaD}"/>
        <path class="path" pathLength="1" d="${d}"/>
        ${dots}
      </svg>`;
    note.textContent = 'Нарастающее число титулов в Кубке чемпионов по годам побед.';
    const svg = $('.line-svg', area);
    requestAnimationFrame(() => requestAnimationFrame(() => svg.classList.add('go')));
  }
}

$('#chartTabs').addEventListener('click', e => {
  const b = e.target.closest('.tab');
  if (b) renderChart(b.dataset.chart);
});

// ---------- Таблица финалов ----------
let newestFirst = false;
const finalSearch = $('#finalSearch');

function renderFinals() {
  const q = finalSearch.value.trim().toLowerCase();
  let list = D.finals.filter(f =>
    !q || hay(`${f.year} ${f.city} ${f.opponent} ${f.score}`).toLowerCase().includes(q));
  list = [...list].sort((a, b) => newestFirst ? b.year - a.year : a.year - b.year);
  $('#finalsBody').innerHTML = list.length
    ? list.map(f => `<tr><td>${f.year}</td><td>${f.city}</td><td>${f.opponent}</td><td>${f.score}</td></tr>`).join('')
    : `<tr><td colspan="4" class="muted">Ничего не найдено.</td></tr>`;
}
finalSearch.addEventListener('input', renderFinals);
$('#sortBtn').addEventListener('click', e => {
  newestFirst = !newestFirst;
  e.target.textContent = newestFirst ? 'Сначала старые' : 'Сначала новые';
  renderFinals();
});

// ---------- Прогресс прокрутки и кнопка «наверх» ----------
const progress = $('#progress');
const toTop = $('#toTop');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  progress.style.width = max > 0 ? `${(h.scrollTop / max) * 100}%` : '0';
  toTop.classList.toggle('show', h.scrollTop > 400);
  document.querySelector('.header').classList.toggle('stuck', h.scrollTop > 40);
}, { passive: true });
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ---------- Бургер-меню (телефон) ----------
const burger = $('#burger');
const navEl = $('#mainNav');
const scrim = $('#scrim');

function setMenu(open) {
  navEl.classList.toggle('open', open);
  scrim.classList.toggle('show', open);
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  document.body.classList.toggle('menu-open', open);
}
burger.addEventListener('click', () => setMenu(!navEl.classList.contains('open')));
scrim.addEventListener('click', () => setMenu(false));
navEl.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
window.matchMedia('(min-width: 641px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

// ---------- Старт ----------
renderNews();
renderFinals();
showPage();


// ---------- Заголовки: акцент на последнем слове ----------
$$('.page-title, .section-head h2').forEach(h => {
  const words = h.textContent.trim().split(/\s+/);
  const last = words.pop();
  h.innerHTML = (words.length ? words.join(' ') + ' ' : '') + `<span class="acc">${last}</span>`;
});


// ---------- Заставка с гербом (один раз за вкладку) ----------
(function () {
  const sp = $('#splash');
  if (!sp) return;
  let seen = false;
  try { seen = sessionStorage.getItem('splash') === '1'; sessionStorage.setItem('splash', '1'); } catch (e) {}
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) { sp.remove(); return; }
  document.body.classList.add('splash-on');
  setTimeout(() => sp.classList.add('hide'), 2900);
  setTimeout(() => { sp.remove(); document.body.classList.remove('splash-on'); }, 3500);
})();

;
/* ======== features.js ======== */
// Состав, зал трофеев и карточка игрока в лаборатории. Использует D, $, $$, observeReveal из script.js
(function () {
  const POS = { GK: 'Вратарь', DF: 'Защитник', MF: 'Полузащитник', FW: 'Нападающий' };
  const POS_CHIPS = { all: 'Все', GK: 'Вратари', DF: 'Защитники', MF: 'Полузащитники', FW: 'Нападающие' };
  const initials = name => tr(name).split(' ').map(w => w[0]).slice(0, 2).join('');
  // null = нет матчей в Ла Лиге 2026/27
  const ratio = p => (p.apps ? p.goals / p.apps : null);
  const fmtN = v => (v == null ? '—' : Number.isInteger(v) ? v : v.toFixed(2));
  const dbl = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  function countUp(el, to, dur = 1200) {
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  // ================= Подписи с датой и «Клуб сегодня» =================
  $('#newsTag').textContent = D.asOf;
  $('#squadNote').textContent = D.playersNote;
  $('#nowDate').textContent = D.asOf;
  $('#now').innerHTML = D.now.map(n => `<div class="fact"><b>${n.v}</b><span>${n.k}</span></div>`).join('');

  // ================= СОСТАВ =================
  let pos = 'all';
  // Избранные игроки хранятся в браузере (localStorage)
  let FAV = new Set();
  try { FAV = new Set(JSON.parse(localStorage.getItem('rm-fav') || '[]')); } catch (e) {}
  const saveFav = () => { try { localStorage.setItem('rm-fav', JSON.stringify([...FAV])); } catch (e) {} };
  const grid = $('#players-grid');
  const search = $('#playerSearch');
  const sortSel = $('#playerSort');

  $('#posChips').innerHTML = Object.keys(POS_CHIPS).map((k, i) =>
    `<button class="chip${i === 0 ? ' active' : ''}" data-p="${k}" type="button">${POS_CHIPS[k]}</button>`).join('')
    + '<button class="chip chip-fav" data-p="fav" type="button">★ Избранные</button>';

  $('#posChips').addEventListener('click', e => {
    const b = e.target.closest('.chip');
    if (!b) return;
    pos = b.dataset.p;
    $$('.chip', $('#posChips')).forEach(x => x.classList.toggle('active', x === b));
    renderPlayers();
  });
  search.addEventListener('input', renderPlayers);
  sortSel.addEventListener('change', renderPlayers);

  function renderPlayers() {
    const q = search.value.trim().toLowerCase();
    let list = D.players.filter(p =>
      (pos === 'all' || (pos === 'fav' ? FAV.has(p.id) : p.pos === pos)) && (!q || hay(`${p.name} ${p.nat}`).toLowerCase().includes(q)));
    const s = sortSel.value;
    list = [...list].sort((a, b) => (s === 'name' ? a.name.localeCompare(b.name, 'ru') : (b[s] ?? -1) - (a[s] ?? -1)));

    const maxG = Math.max(1, ...D.players.map(x => x.goals || 0));
    grid.innerHTML = list.map((p, i) => {
      const pr = (window.PROFILES || {})[p.id] || {};
      const num = pr.num != null ? pr.num : '';
      const w = p.goals == null ? 0 : Math.round((p.goals / maxG) * 100);
      return `
      <button class="card player reveal" data-id="${p.id}" style="--d:${Math.min(i, 6) * 0.05}s" type="button">
        <span class="ghost-num" aria-hidden="true">${num !== '' ? '#' + num : ''}</span>
        <div class="p-top"><span class="num-badge">${num !== '' ? num : initials(p.name)}</span><span class="pos-pill pos-${p.pos}">${POS[p.pos]}</span><span class="p-nat">${p.nat}</span><span class="fav-btn${FAV.has(p.id) ? ' on' : ''}" data-fav="${p.id}" role="button" tabindex="0" aria-label="В избранное" title="В избранное">★</span></div>
        <h3>${p.name}</h3>
        <div class="meta">${p.years === 'с 2026' ? 'Новичок 2026' : 'В клубе ' + p.years}</div>
        <div class="mini"><span><b>${fmtN(p.apps)}</b> матчей</span><span><b>${fmtN(p.goals)}</b> голов</span></div>
        <div class="p-bar"><i style="width:${w}%"></i></div>
        <small class="p-bar-l">Голы в Ла Лиге 26/27 относительно лучшего бомбардира</small>
      </button>`; }).join('');
    $('#players-empty').textContent = pos === 'fav' ? 'Пока никого нет: нажмите ★ на карточке игрока.' : 'Игроки не найдены.';
    $('#players-empty').hidden = list.length > 0;
    observeReveal(grid);
  }

  // Окно игрока
  const pm = $('#playerModal');
  let openedId = null;
  const statBox = (v, l) => `<div class="pm-stat"><b>${v}</b><span>${l}</span></div>`;

  const toggleFav = el => {
    const id = +el.dataset.fav;
    FAV.has(id) ? FAV.delete(id) : FAV.add(id); saveFav();
    if (pos === 'fav') renderPlayers(); else el.classList.toggle('on', FAV.has(id));
  };
  grid.addEventListener('keydown', e => {
    const el = e.target.closest('.fav-btn');
    if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); toggleFav(el); }
  });
  grid.addEventListener('click', e => {
    const fav = e.target.closest('.fav-btn');
    if (fav) { e.stopPropagation(); toggleFav(fav); return; }
    const c = e.target.closest('.player');
    if (!c) return;
    const p = D.players.find(x => x.id === +c.dataset.id);
    openedId = p.id;
    $('#pmAvatar').textContent = initials(p.name);
    $('#pmName').textContent = p.name;
    $('#pmMeta').textContent = `${POS[p.pos]} · ${p.nat} · ${p.years}`;
    $('#pmStats').innerHTML = statBox(fmtN(p.apps), 'матчей в Ла Лиге 26/27') + statBox(fmtN(p.goals), 'голов в Ла Лиге 26/27') + statBox(fmtN(ratio(p)), 'голов за матч');
    $('#pmBio').textContent = p.bio;
    pm.showModal();
  });
  $('#pmClose').addEventListener('click', () => pm.close());
  pm.addEventListener('click', e => { if (e.target === pm) pm.close(); });

  // Сравнение
  const cmpA = $('#cmpA');
  const cmpB = $('#cmpB');
  const opts = D.players.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  cmpA.innerHTML = opts;
  cmpB.innerHTML = opts;
  cmpA.value = D.players[0].id;
  cmpB.value = D.players[1].id;
  cmpA.addEventListener('change', renderCompare);
  cmpB.addEventListener('change', renderCompare);

  function setCompare(select) {
    select.value = openedId;
    pm.close();
    renderCompare();
    $('#cmpOut').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  $('#pmA').addEventListener('click', () => setCompare(cmpA));
  $('#pmB').addEventListener('click', () => setCompare(cmpB));

  async function renderCompare() {
    const a = D.players.find(p => p.id === +cmpA.value);
    const b = D.players.find(p => p.id === +cmpB.value);
    const rows = [['Матчей (Ла Лига 26/27)', a.apps, b.apps], ['Голов (Ла Лига 26/27)', a.goals, b.goals], ['Голов за матч', ratio(a), ratio(b)]];

    $('#cmpOut').innerHTML =
      `<div class="cmp-head"><span>${a.name}</span><span>${b.name}</span></div>` +
      rows.map(([label, x, y]) => {
        const m = Math.max(x ?? 0, y ?? 0) || 1;
        return `
          <div class="cmp-row">
            <div class="cmp-label">${label}</div>
            <div class="cmp-bars">
              <div class="cmp-side left${x != null && y != null && x > y ? ' win' : ''}">
                <span class="cmp-track"><i style="--w:${((x ?? 0) / m) * 100}%"></i></span><b>${fmtN(x)}</b>
              </div>
              <div class="cmp-side right${x != null && y != null && y > x ? ' win' : ''}">
                <b>${fmtN(y)}</b><span class="cmp-track"><i style="--w:${((y ?? 0) / m) * 100}%"></i></span>
              </div>
            </div>
          </div>`;
      }).join('');
    await dbl();
    $$('#cmpOut i').forEach(i => i.classList.add('on'));
  }

  // ================= ТРОФЕИ =================
  let group = 'Все';
  const GROUPS = ['Все', 'Испания', 'Европа', 'Мир'];
  $('#trophyChips').innerHTML = GROUPS.map((g, i) =>
    `<button class="chip${i === 0 ? ' active' : ''}" data-g="${g}" type="button">${g}</button>`).join('');
  $('#trophyChips').addEventListener('click', e => {
    const b = e.target.closest('.chip');
    if (!b) return;
    group = b.dataset.g;
    $$('.chip', $('#trophyChips')).forEach(x => x.classList.toggle('active', x === b));
    renderTrophies();
  });
  $('#trophyNote').textContent = D.trophiesNote;

  function renderTrophies() {
    const list = D.trophies.filter(t => group === 'Все' || t.group === group);
    const max = Math.max(...D.trophies.map(t => t.count));
    $('#trophyGrid').innerHTML = list.map((t, i) => `
      <div class="trophy reveal" style="--d:${Math.min(i, 6) * 0.06}s">
        <span class="tag">${t.group}</span>
        <b data-to="${t.count}">0</b>
        <h3>${t.name}</h3>
        <i style="--w:${(t.count / max) * 100}%"></i>
      </div>`).join('');
    observeReveal($('#trophyGrid'));
    $$('.trophy b', $('#trophyGrid')).forEach(el => countUp(el, +el.dataset.to));
    countUp($('#trophyTotal'), list.reduce((s, t) => s + t.count, 0));
  }

  // Победы в Лиге чемпионов по годам
  $('#yearChips').innerHTML = D.finals.map((f, i) =>
    `<button class="chip${i === D.finals.length - 1 ? ' active' : ''}" data-y="${f.year}" type="button">${f.year}</button>`).join('');
  function showYear(y) {
    const f = D.finals.find(x => x.year === +y);
    const n = D.finals.indexOf(f) + 1;
    $('#yearInfo').innerHTML = `
      <div class="big">${f.year}</div>
      <div>
        <h3>Кубок чемпионов №${n}</h3>
        <p>Финал в городе ${f.city}. Соперник — ${f.opponent}. Счёт: ${f.score}.</p>
      </div>`;
  }
  $('#yearChips').addEventListener('click', e => {
    const b = e.target.closest('.chip');
    if (!b) return;
    $$('.chip', $('#yearChips')).forEach(x => x.classList.toggle('active', x === b));
    showYear(b.dataset.y);
  });
  showYear(D.finals[D.finals.length - 1].year);

  // ================= ЛАБОРАТОРИЯ ДАННЫХ: КАРТОЧКА ИГРОКА =================
  const PR = window.PROFILES || {};
  const SEASON = window.PROFILES_SEASON || '2026/27';
  const POS_TAB = { GK: 'Вратарь', DF: 'Защита', MF: 'Полузащита', FW: 'Атака' };

  // [ключ, подпись, единица (строка) или число знаков после запятой]
  const STAT_SETS = {
    general: [
      ['apps', 'Матчи'], ['minutes', 'Минуты на поле'], ['starts', 'Старты'], ['subs', 'Выходы на замену'],
      ['yellow', 'Жёлтые карточки'], ['red', 'Красные карточки'], ['rating', 'Рейтинг за матч', 2],
    ],
    GK: [
      ['saves', 'Сейвы'], ['savePct', 'Отражённые удары', '%'], ['conceded', 'Пропущенные голы'], ['cleanSheets', 'Сухие матчи'],
      ['pensSaved', 'Отражённые пенальти'], ['passAcc', 'Точность передач', '%'], ['longPassAcc', 'Точность длинных передач', '%'],
      ['sweeper', 'Выходы на перехват'], ['claims', 'Игра на выходах'],
    ],
    DF: [
      ['tackles', 'Отборы'], ['interceptions', 'Перехваты'], ['duelsGround', 'Выигранные единоборства (земля)'], ['duelsAir', 'Выигранные единоборства (воздух)'],
      ['clearances', 'Выносы'], ['blocks', 'Блокированные удары'], ['passAcc', 'Точность передач', '%'], ['longPasses', 'Длинные передачи'],
      ['goals', 'Голы'], ['assists', 'Голевые передачи'], ['errorsToGoal', 'Ошибки, ведущие к голу'], ['fouls', 'Фолы'],
    ],
    MF: [
      ['passes', 'Передачи'], ['keyPasses', 'Ключевые передачи'], ['passAcc', 'Точность паса', '%'], ['progPasses', 'Прогрессивные передачи'],
      ['progCarries', 'Проходы с мячом'], ['tackles', 'Отборы'], ['interceptions', 'Перехваты'], ['goals', 'Голы'],
      ['assists', 'Голевые передачи'], ['xA', 'xA', 2], ['distance', 'Пройденная дистанция', ' км'],
    ],
    FW: [
      ['goals', 'Голы'], ['xG', 'xG', 2], ['shots', 'Удары'], ['shotsOnTarget', 'Удары в створ'], ['conversion', 'Конверсия ударов', '%'],
      ['assists', 'Голевые передачи'], ['dribbles', 'Успешные обводки'], ['touchesBox', 'Касания в штрафной'], ['penScored', 'Реализованные пенальти'],
    ],
  };

  const plural = (n, a, b, c) => { const m = n % 100, d = n % 10; return m > 10 && m < 20 ? c : d === 1 ? a : d >= 2 && d <= 4 ? b : c; };
  const ageOf = iso => {
    const b = new Date(iso), n = new Date();
    let a = n.getFullYear() - b.getUTCFullYear();
    const m = n.getMonth() - b.getUTCMonth();
    if (m < 0 || (m === 0 && n.getDate() < b.getUTCDate())) a--;
    return a;
  };
  const fmtDate = iso => iso.split('-').reverse().join('.');
  const shortName = s => tr(s).replace(/^(РБ|RB)\s+/, '').slice(0, 3);

  function statVal(p, pr, key) {
    const s = pr.stats || {};
    if (s[key] != null) return s[key];
    if (key === 'apps') return p.apps;
    if (key === 'goals') return p.goals;
    return null;
  }
  function fmtStat(v, u) {
    if (v == null) return '—';
    const n = Number(v);
    let s = typeof u === 'number' ? n.toFixed(u) : Number.isInteger(n) ? n.toLocaleString((window.LOCALE || 'ru-RU')) : n.toFixed(1);
    if (typeof u === 'string') s += u;
    return s;
  }

  let labTab = 'general';
  const labSel = $('#labPlayer');
  const labOrder = [...D.players].sort((a, b) => ((PR[a.id] || {}).num ?? 99) - ((PR[b.id] || {}).num ?? 99));
  labSel.innerHTML = labOrder.map(p => {
    const n = (PR[p.id] || {}).num;
    return `<option value="${p.id}">${n != null ? '№' + n + ' · ' : ''}${p.name}</option>`;
  }).join('');
  labSel.value = D.players[0].id;

  function renderLab() {
    const p = D.players.find(x => x.id === +labSel.value);
    const pr = PR[p.id] || {};

    // Карточка
    const box = $('#pcPhoto');
    const img = $('#pcImg');
    $('#pcPh').textContent = initials(p.name);
    $('#pcNum').textContent = pr.num != null ? pr.num : '';
    box.classList.remove('no-photo');
    img.onerror = () => box.classList.add('no-photo');
    img.onload = () => box.classList.remove('no-photo');
    img.alt = p.name;
    img.src = pr.slug ? `assets/players/${pr.slug}.jpg` : '';

    $('#pcName').textContent = p.name;
    $('#pcPos').textContent = POS[p.pos];
    const age = pr.born ? ageOf(pr.born) : null;
    const facts = [
      ['Возраст', pr.born ? `${age} ${plural(age, 'год', 'года', 'лет')} · ${fmtDate(pr.born)}` : null],
      ['Гражданство', p.nat],
      ['Контракт', pr.contract],
      ['Рыночная стоимость', pr.value],
      ['В клубе', p.years],
    ];
    $('#pcFacts').innerHTML = facts.map(([k, v]) =>
      `<div><dt>${k}</dt><dd${v ? '' : ' class="na" title="Нет данных — заполните в profiles.js"'}>${v || '—'}</dd></div>`).join('');

    // Вкладки и показатели
    $('#labTabs').innerHTML = [['general', 'Общее'], ['pos', POS_TAB[p.pos]]].map(([k, l]) =>
      `<button class="tab${labTab === k ? ' active' : ''}" data-t="${k}" type="button" role="tab">${l}</button>`).join('');
    $('#labSeason').textContent = `${SEASON} Прочерк — данных в открытых источниках нет (добавьте в profiles.js).`;
    const set = labTab === 'general' ? STAT_SETS.general : STAT_SETS[p.pos];
    $('#labStats').innerHTML = set.map(([key, label, u], i) => {
      const v = statVal(p, pr, key);
      return `<div class="stat-tile${v == null ? ' empty' : ''}" style="--d:${i * 0.03}s"><b>${fmtStat(v, u)}</b><span>${label}</span></div>`;
    }).join('');

    renderForm(pr);
  }

  const resOf = score => { const [x, y] = score.split(':').map(Number); return x > y ? 'win' : x === y ? 'draw' : 'loss'; };

  async function renderForm(pr) {
    const area = $('#formArea');
    const f = (pr.form || []).filter(m => m.rating != null);

    if (f.length) {
      // Форма игрока: рейтинг за матч (шкала 5–10)
      const avg = f.reduce((s, m) => s + m.rating, 0) / f.length;
      $('#formTitle').textContent = `Форма: рейтинг за последние ${f.length} ${plural(f.length, 'матч', 'матча', 'матчей')}`;
      area.innerHTML = `
        <div class="fbars">${f.map((m, i) => {
          const h = Math.max(8, Math.min(100, ((m.rating - 5) / 5) * 100));
          const cls = m.rating >= 7.5 ? 'win' : m.rating >= 6.5 ? 'draw' : 'loss';
          return `<div class="fb"><em>${m.rating.toFixed(1)}</em><i class="${cls}" style="--h:${h}%;--d:${i * 0.06}s"></i></div>`;
        }).join('')}</div>
        <div class="flabels">${f.map(m => `<span title="${m.opp || ''}">${shortName(m.opp || '')}</span>`).join('')}</div>
        <div class="form-legend"><span><i class="win"></i>7,5 и выше</span><span><i class="draw"></i>6,5–7,4</span><span><i class="loss"></i>ниже 6,5</span></div>`;
      $('#formNote').textContent = `Средний рейтинг за период: ${avg.toFixed(2)}.`;
    } else {
      // Пока нет рейтингов игрока — показываем форму команды по реальным результатам
      const last = D.results.slice(0, 8).reverse();
      const pts = last.reduce((s, r) => { const k = resOf(r.score); return s + (k === 'win' ? 3 : k === 'draw' ? 1 : 0); }, 0);
      const H = { win: 100, draw: 55, loss: 24 };
      $('#formTitle').textContent = `Форма команды: последние ${last.length} матчей`;
      area.innerHTML = `
        <div class="fbars">${last.map((r, i) => {
          const k = resOf(r.score);
          return `<div class="fb"><em>${r.score}</em><i class="${k}" style="--h:${H[k]}%;--d:${i * 0.06}s"></i></div>`;
        }).join('')}</div>
        <div class="flabels">${last.map(r => `<span title="${r.opp} (${r.comp})">${shortName(r.opp)}</span>`).join('')}</div>
        <div class="form-legend"><span><i class="win"></i>победа</span><span><i class="draw"></i>ничья</span><span><i class="loss"></i>поражение</span></div>`;
      $('#formNote').textContent = `Рейтингов игрока за матч пока нет, поэтому показана форма команды: ${pts} очков из ${last.length * 3}. Чтобы увидеть форму игрока, добавьте form в profiles.js.`;
    }
    await dbl();
    $$('.fb i', area).forEach(i => i.classList.add('on'));
  }

  function labStep(d) {
    const i = labOrder.findIndex(p => p.id === +labSel.value);
    labSel.value = labOrder[(i + d + labOrder.length) % labOrder.length].id;
    renderLab();
  }
  $('#labPrev').addEventListener('click', () => labStep(-1));
  $('#labNext').addEventListener('click', () => labStep(1));
  labSel.addEventListener('change', renderLab);
  $('#labTabs').addEventListener('click', e => {
    const b = e.target.closest('.tab');
    if (!b) return;
    labTab = b.dataset.t;
    renderLab();
  });
  $('#pmLab').addEventListener('click', () => {
    pm.close();
    labSel.value = openedId;
    renderLab();
    location.hash = '#data-lab';
  });

  // ================= Страницы =================
  function onPage(page) {
    if (page === 'squad') renderCompare();
    if (page === 'trophies') renderTrophies();
    if (page === 'data-lab') renderLab();
  }
  document.addEventListener('pagechange', e => onPage(e.detail));

  // Старт
  renderPlayers();
  renderCompare();
  renderTrophies();
  renderLab();
  observeReveal($('.view.active'));
})();

;
/* ======== matches.js ======== */
// Матч-центр (календарь с обратным отсчётом, результаты, таблица Ла Лиги, страница матча) и трансферы.
// Данные — в data.js: upcoming, results, league, matchInfo, transfers.
(function () {
  const POS = { GK: 'Вратарь', DF: 'Защитник', MF: 'Полузащитник', FW: 'Нападающий' };
  const fmtLong = new Intl.DateTimeFormat((window.LOCALE || 'ru-RU'), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtDate = new Intl.DateTimeFormat((window.LOCALE || 'ru-RU'), { day: 'numeric', month: 'long', year: 'numeric' });
  const fmtDay = new Intl.DateTimeFormat((window.LOCALE || 'ru-RU'), { day: 'numeric' });
  const fmtMon = new Intl.DateTimeFormat((window.LOCALE || 'ru-RU'), { month: 'short' });
  const fmtWd = new Intl.DateTimeFormat((window.LOCALE || 'ru-RU'), { weekday: 'short' });
  const fmtTime = new Intl.DateTimeFormat((window.LOCALE || 'ru-RU'), { hour: '2-digit', minute: '2-digit' });
  const day = s => new Date(s + 'T12:00:00');
  const crest = () => (window.CREST
    ? `<img src="${window.CREST}" alt="" onerror="this.outerHTML='<b>RM</b>'">` : '<b>RM</b>');
  const initials = n => tr(n).replace(/[^А-Яа-яA-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const num = s => s.split(':').map(Number);
  const outcome = s => { const [a, b] = num(s); return a > b ? 'win' : a < b ? 'loss' : 'draw'; };
  const OUT = { win: ['В', 'Победа'], draw: ['Н', 'Ничья'], loss: ['П', 'Поражение'] };

  // ---------- Ближайший матч и отсчёт ----------
  const endOf = m => (m.kickoff ? Date.parse(m.kickoff) + 2 * 3600e3 : Date.parse(m.date + 'T23:59:59'));
  const nextMatch = () => D.upcoming.find(m => endOf(m) > Date.now());

  function teamsHTML(m) {
    const real = `<div class="nm-team"><span class="nm-crest">${crest()}</span><strong>Реал Мадрид</strong></div>`;
    const opp = `<div class="nm-team"><span class="nm-badge">${initials(m.opp)}</span><strong>${m.opp}</strong></div>`;
    const home = m.venue === 'дома';
    return (home ? real : opp) + '<span class="nm-vs">VS</span>' + (home ? opp : real);
  }

  function formHTML(n) {
    const last = [...D.results].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n).reverse();
    return `<span class="form-chips">${last.map(r => { const o = outcome(r.score);
      return `<a class="res-badge ${o}" href="#match/${r.date}" title="${r.opp}, ${r.score}">${OUT[o][0]}</a>`; }).join('')}</span>`;
  }

  function nextHTML(m, compact) {
    if (!m) return '<p class="muted">Календарь обновится: ближайших матчей в списке пока нет.</p>';
    const when = m.kickoff
      ? `${fmtTime.format(new Date(m.kickoff))} по вашему времени${m.note ? ' · ' + m.note : ''}`
      : 'время начала уточняется';
    return `
      <div class="nm-top"><span class="tag">Ближайший матч</span><span class="tag">${m.comp}</span></div>
      <div class="nm-teams">${teamsHTML(m)}</div>
      <p class="nm-when"><b>${fmtLong.format(day(m.date))}</b><span>${m.venue === 'дома' ? 'Дома, «Сантьяго Бернабеу»' : 'В гостях'} · ${when}</span></p>
      <div class="cd" data-kick="${m.kickoff || ''}" data-date="${m.date}"></div>
      <div class="nm-form"><small>Форма · пять последних матчей</small>${formHTML(5)}</div>
      <div class="nm-actions">
        ${compact ? '<a class="btn btn-gold" href="#matches">Матч-центр <span aria-hidden="true">→</span></a>' : ''}
        ${m.kickoff ? '<button class="btn btn-outline" type="button" data-ics="next">＋ В календарь</button>' : ''}
      </div>`;
  }

  function cdHTML(parts) {
    return parts.map(([v, l]) => `<div><b>${String(v).padStart(2, '0')}</b><span>${l}</span></div>`).join('');
  }
  function plural(n, a, b, c) {
    const m = n % 100, k = n % 10;
    return m > 10 && m < 20 ? c : k === 1 ? a : k > 1 && k < 5 ? b : c;
  }

  function tick() {
    $$('.cd').forEach(el => {
      const kick = el.dataset.kick ? Date.parse(el.dataset.kick) : null;
      if (kick) {
        const diff = kick - Date.now();
        if (diff <= 0) { el.innerHTML = '<p class="cd-live">Матч начался или только что завершился. Обновите страницу позже — календарь переключится на следующую игру.</p>'; return; }
        const s = Math.floor(diff / 1000);
        el.innerHTML = cdHTML([[Math.floor(s / 86400), 'дней'], [Math.floor(s % 86400 / 3600), 'часов'], [Math.floor(s % 3600 / 60), 'минут'], [s % 60, 'секунд']]);
      } else {
        const d = Math.max(0, Math.ceil((Date.parse(el.dataset.date + 'T00:00:00') - Date.now()) / 86400e3));
        el.innerHTML = `<div class="cd-days"><b>${d}</b><span>${plural(d, 'день', 'дня', 'дней')} до матча</span></div>`;
      }
    });
  }
  setInterval(tick, 1000);

  // ---------- Календарь ----------
  function dateBlock(date) {
    const d = day(date);
    return `<div class="mr-date"><b>${fmtDay.format(d)}</b><span>${fmtMon.format(d).replace('.', '')}</span><small>${fmtWd.format(d)}</small></div>`;
  }
  function renderCal() {
    const list = D.upcoming.filter(m => endOf(m) > Date.now());
    $('#mcCal').innerHTML = monthGridHTML() + `<div class="cal-tools"><h3>Ближайшие матчи</h3><button class="btn btn-outline" type="button" data-ics="all">⬇ Скачать календарь (.ics)</button></div>` + (list.length ? `<div class="mrows">${list.map((m, i) => `
      <div class="mrow reveal" style="--d:${Math.min(i, 6) * 0.05}s">
        ${dateBlock(m.date)}
        <div class="mr-main"><span class="mr-comp">${m.comp}</span>
          <strong>${m.venue === 'дома' ? 'Реал Мадрид — ' + m.opp : m.opp + ' — Реал Мадрид'}</strong></div>
        <span class="mr-venue">${m.venue}</span>
        <span class="mr-time">${m.kickoff ? fmtTime.format(new Date(m.kickoff)) : 'время уточняется'}</span>
      </div>`).join('')}</div>
      <p class="muted small">Список неполный: матчи Лиги чемпионов и ближайшие игры Ла Лиги. Время начала — по вашему часовому поясу; даты Ла Лиги могут сдвинуться.</p>`
      : '<p class="muted empty">Ближайших матчей в списке нет.</p>');
  }

  // ---------- Результаты ----------
  let resFilter = 'all';
  function renderRes() {
    const R = D.results;
    const w = R.filter(r => outcome(r.score) === 'win').length;
    const dr = R.filter(r => outcome(r.score) === 'draw').length;
    const l = R.filter(r => outcome(r.score) === 'loss').length;
    const gf = R.reduce((a, r) => a + num(r.score)[0], 0), ga = R.reduce((a, r) => a + num(r.score)[1], 0);
    const comps = ['all', ...new Set(R.map(r => r.comp))];
    const list = R.filter(r => resFilter === 'all' || r.comp === resFilter);
    $('#mcRes').innerHTML = `
      <div class="facts">
        <div class="fact"><b>${R.length}</b><span>матчей</span></div>
        <div class="fact"><b>${w} · ${dr} · ${l}</b><span>победы · ничьи · поражения</span></div>
        <div class="fact"><b>${gf} : ${ga}</b><span>разница мячей ${gf - ga > 0 ? '+' : ''}${gf - ga}</span></div>
      </div>
      <div class="chips mc-filter" role="group" aria-label="Турнир">${comps.map(c =>
        `<button class="chip${c === resFilter ? ' active' : ''}" data-c="${c}" type="button">${c === 'all' ? 'Все турниры' : c}</button>`).join('')}</div>
      <div class="mrows">${list.map(r => {
        const o = outcome(r.score), [a, b] = num(r.score), home = r.venue === 'дома';
        return `
        <a class="mrow res" href="#match/${r.date}">
          ${dateBlock(r.date)}
          <div class="mr-main"><span class="mr-comp">${r.comp} · ${r.venue}</span>
            <strong>${home ? 'Реал Мадрид' : r.opp} <i>${home ? a : b}:${home ? b : a}</i> ${home ? r.opp : 'Реал Мадрид'}</strong></div>
          <span class="res-badge ${o}" title="${OUT[o][1]}">${OUT[o][0]}</span>
          <span class="mr-go" aria-hidden="true">›</span>
        </a>`; }).join('')}</div>
      <p class="muted small">Нажмите на матч, чтобы открыть его страницу. Счёт в списке показан по порядку «хозяева — гости».</p>`;
  }

  // ---------- Таблица ----------
  let tblKey = 'pts';
  const gdOf = t => t.gf - t.ga;
  function renderTable() {
    const base = [...D.league.table].sort((x, y) => y.pts - x.pts || gdOf(y) - gdOf(x) || y.gf - x.gf);
    const pos = new Map(base.map((t, i) => [t.team, i]));
    const keyFn = { pts: t => t.pts, gd: gdOf, gf: t => t.gf, w: t => t.w };
    const rows = tblKey === 'pts' ? base : [...base].sort((x, y) => keyFn[tblKey](y) - keyFn[tblKey](x) || y.pts - x.pts);
    const zone = i => (i < 4 ? 'z-cl' : i === 4 ? 'z-el' : i === 5 ? 'z-conf' : i >= base.length - 3 ? 'z-rel' : '');
    const th = (k, label, title) => `<th class="sortable${tblKey === k ? ' on' : ''}" data-sort="${k}" title="${title}">${label}</th>`;
    $('#mcTable').innerHTML = `
      <p class="muted small">Ла Лига 2026/27, ${D.league.asOf}. Нажмите на заголовок столбца, чтобы отсортировать.</p>
      <div class="table-wrap lg-wrap">
        <table class="table lg-table">
          <thead><tr><th>#</th><th>Команда</th><th title="Матчи">И</th>${th('w', 'В', 'Победы')}<th title="Ничьи">Н</th><th title="Поражения">П</th>${th('gf', 'Мячи', 'Забито — пропущено')}${th('gd', '±', 'Разница мячей')}${th('pts', 'О', 'Очки')}</tr></thead>
          <tbody>${rows.map(t => { const i = pos.get(t.team); return `
            <tr class="${zone(i)}${t.me ? ' me' : ''}"><td>${i + 1}</td><td>${t.team}</td><td>${t.p}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td>
            <td>${t.gf}–${t.ga}</td><td>${gdOf(t) > 0 ? '+' : ''}${gdOf(t)}</td><td><b>${t.pts}</b></td></tr>`; }).join('')}</tbody>
        </table>
      </div>
      <div class="lg-legend"><span><i class="z-cl"></i>Лига чемпионов</span><span><i class="z-el"></i>Лига Европы</span><span><i class="z-conf"></i>Лига конференций</span><span><i class="z-rel"></i>Зона вылета</span></div>
      <p class="muted small">${D.league.note}</p>`;
  }

  // ---------- Страница матча ----------
  function roundLabel(r) {
    const same = [...D.results].filter(x => x.comp === r.comp).sort((a, b) => a.date.localeCompare(b.date));
    const n = same.findIndex(x => x.date === r.date) + 1;
    return r.comp === 'Ла Лига' ? `${n}-й тур` : `Общий этап, матч ${n}`;
  }
  function renderMatch() {
    const date = location.hash.split('/')[1];
    const asc = [...D.results].sort((a, b) => a.date.localeCompare(b.date));
    const i = asc.findIndex(r => r.date === date);
    const box = $('#matchPage');
    if (i < 0) { box.innerHTML = '<p class="muted empty">Матч не найден. <a href="#matches">Вернуться к списку</a></p>'; return; }
    const r = asc[i], o = outcome(r.score), [a, b] = num(r.score), home = r.venue === 'дома';
    const info = (D.matchInfo || {})[r.date] || {};
    const news = info.newsId ? D.news.find(n => n.id === info.newsId) : null;
    const realSide = `<div class="mp-team"><span class="nm-crest">${crest()}</span><strong>Реал Мадрид</strong></div>`;
    const oppSide = `<div class="mp-team"><span class="nm-badge">${initials(r.opp)}</span><strong>${r.opp}</strong></div>`;
    const sc = home ? `${a}<i>:</i>${b}` : `${b}<i>:</i>${a}`;
    const scorers = (info.scorers || []).map(g => `
      <li class="${g.side}"><span class="g-min">${g.min}</span><span class="g-ball" aria-hidden="true">⚽</span><b>${g.name}${g.note ? ` <em>(${g.note})</em>` : ''}</b><small>${g.side === 'real' ? 'Реал Мадрид' : r.opp}</small></li>`).join('');
    const prev = asc[i - 1], next = asc[i + 1];
    const navLink = (m, dir) => m ? `<a class="mp-nav ${dir}" href="#match/${m.date}"><small>${dir === 'prev' ? '← Предыдущий' : 'Следующий →'}</small><b>${m.opp}</b><span>${m.score}</span></a>` : '<span></span>';
    box.innerHTML = `
      <div class="panel mp-head">
        <div class="mp-meta"><span class="tag">${r.comp}</span><span class="tag">${roundLabel(r)}</span><span class="res-badge ${o}">${OUT[o][1]}</span></div>
        <div class="mp-score">${home ? realSide : oppSide}<div class="mp-sc">${sc}</div>${home ? oppSide : realSide}</div>
        <p class="mp-date">${fmtDate.format(day(r.date))} · ${home ? 'дома, «Сантьяго Бернабеу»' : 'в гостях'}</p>
      </div>
      <div class="two-col mp-body">
        <div class="panel">
          <h3>Голы</h3>
          ${scorers ? `<ul class="goals">${scorers}</ul>` : '<p class="muted">Авторы голов в этом матче пока не добавлены.</p>'}
          ${(info.facts || []).length ? `<ul class="list mp-facts">${info.facts.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}
        </div>
        <div class="panel">
          <h3>Сводка</h3>
          ${news ? `<p>${news.body}</p><p class="muted small">Из новости «${news.title}» от ${fmtDate.format(day(news.date))}.</p>`
            : `<p>${home ? 'Дома' : 'В гостях'} в турнире «${r.comp}» «Реал» ${o === 'win' ? 'выиграл' : o === 'loss' ? 'проиграл' : 'сыграл вничью'} с командой «${r.opp}» — ${r.score} (счёт «Реала» — первым).</p><p class="muted small">Подробного отчёта об этом матче пока нет.</p>`}
        </div>
      </div>
      <div class="mp-actions"><button class="btn btn-outline" type="button" data-share="${r.date}">↗ Поделиться матчем</button></div>
      <div class="mp-navs">${navLink(prev, 'prev')}${navLink(next, 'next')}</div>`;
    window.scrollTo({ top: 0 });
  }

  // ---------- Трансферы ----------
  let trFilter = 'all';
  function renderTransfers() {
    const T = D.transfers;
    const ins = T.filter(t => t.dir === 'in'), outs = T.filter(t => t.dir === 'out');
    $('#transfersNote').textContent = D.transfersNote;
    $('#trSummary').innerHTML = `
      <div class="fact"><b>${ins.length}</b><span>пришли (с возвращением из аренды)</span></div>
      <div class="fact"><b>${outs.length}</b><span>ушли</span></div>
      <div class="fact"><b>${T.filter(t => t.fee === 'Бесплатно').length}</b><span>бесплатных трансферов</span></div>
      <div class="fact"><b>${ins[0].name}</b><span>самая дорогая покупка: ${ins[0].fee}</span></div>`;
    const chips = [['all', 'Все'], ['in', 'Пришли'], ['out', 'Ушли']];
    $('#trChips').innerHTML = chips.map(([k, n]) => `<button class="chip${k === trFilter ? ' active' : ''}" data-k="${k}" type="button">${n}</button>`).join('');
    const list = T.filter(t => trFilter === 'all' || t.dir === trFilter);
    $('#trGrid').innerHTML = list.map((t, i) => `
      <article class="card tr-card reveal" style="--d:${Math.min(i, 6) * 0.05}s">
        <div class="tr-top"><span class="tr-dir ${t.dir}">${t.dir === 'in' ? '↓ Пришёл' : '↑ Ушёл'}</span><span class="tr-kind">${t.kind}</span></div>
        <h3>${t.name}</h3>
        <span class="pos-pill pos-${t.pos}">${POS[t.pos]}</span>
        <div class="tr-row"><small>${t.dir === 'in' ? 'Откуда' : 'Куда'}</small><b>${t.club}</b></div>
        <div class="tr-row"><small>Сумма</small><b class="tr-fee">${t.fee}</b></div>
        ${t.contract ? `<div class="tr-row"><small>${t.dir === 'in' ? 'Контракт' : 'Контракт у нового клуба'}</small><b>${t.contract.replace(' у нового клуба', '')}</b></div>` : ''}
        ${t.feeNote ? `<p class="tr-note">${t.feeNote}</p>` : ''}
      </article>`).join('');
    observeReveal($('#trGrid'));
  }


  // ---------- Календарь-сетка ----------
  const MONTHS = [[2026, 7], [2027, 0]]; // август 2026 — январь 2027
  let calY = null, calM = null;
  const pad = n => String(n).padStart(2, '0');
  const ymd = (y, mo, d) => `${y}-${pad(mo + 1)}-${pad(d)}`;
  function monthGridHTML() {
    if (calY === null) { const nm = nextMatch(); const d = day(nm ? nm.date : D.results[0].date); calY = d.getFullYear(); calM = d.getMonth(); }
    const first = new Date(calY, calM, 1), lead = (first.getDay() + 6) % 7, dim = new Date(calY, calM + 1, 0).getDate();
    const byDate = {};
    D.results.forEach(r => { byDate[r.date] = { kind: 'res', ...r }; });
    D.upcoming.forEach(u => { byDate[u.date] = { kind: 'up', ...u }; });
    const t = new Date(); const today = ymd(t.getFullYear(), t.getMonth(), t.getDate());
    const idx = (calY - 2026) * 12 + calM - 7, last = 5; // 0..5
    let cells = '';
    for (let i = 0; i < lead; i++) cells += '<span class="cd-empty"></span>';
    for (let d = 1; d <= dim; d++) {
      const key = ymd(calY, calM, d), mt = byDate[key], cls = ['cal-day', key === today ? 'today' : ''];
      if (!mt) { cells += `<span class="${cls.join(' ')}"><b>${d}</b></span>`; continue; }
      if (mt.kind === 'res') {
        const o = outcome(mt.score);
        cells += `<a class="${cls.join(' ')} has ${o}" href="#match/${key}" title="${mt.opp}, ${mt.score}"><b>${d}</b><i>${initials(mt.opp)}</i><em>${mt.score}</em></a>`;
      } else {
        cells += `<span class="${cls.join(' ')} has up" title="${mt.opp} · ${mt.comp}"><b>${d}</b><i>${initials(mt.opp)}</i><em>${mt.kickoff ? fmtTime.format(new Date(mt.kickoff)) : '—'}</em></span>`;
      }
    }
    const title = new Intl.DateTimeFormat((window.LOCALE || 'ru-RU'), { month: 'long', year: 'numeric' }).format(first);
    return `<div class="panel month">
      <div class="month-head"><button class="btn-small" type="button" data-cal="-1" ${idx <= 0 ? 'disabled' : ''} aria-label="Предыдущий месяц">←</button>
        <h3>${title}</h3>
        <button class="btn-small" type="button" data-cal="1" ${idx >= last ? 'disabled' : ''} aria-label="Следующий месяц">→</button></div>
      <div class="month-grid"><span class="wd">пн</span><span class="wd">вт</span><span class="wd">ср</span><span class="wd">чт</span><span class="wd">пт</span><span class="wd">сб</span><span class="wd">вс</span>${cells}</div>
      <div class="lg-legend"><span><i class="z-cl"></i>победа</span><span><i class="z-rel"></i>поражение</span><span><i class="z-conf"></i>ничья</span><span><i class="z-el"></i>впереди</span></div>
    </div>`;
  }

  // ---------- Сезон в цифрах ----------
  function seasonStats() {
    const R = D.results;
    const wins = R.filter(r => outcome(r.score) === 'win'), losses = R.filter(r => outcome(r.score) === 'loss');
    const gf = R.reduce((a, r) => a + num(r.score)[0], 0), ga = R.reduce((a, r) => a + num(r.score)[1], 0);
    const big = [...R].sort((x, y) => (num(y.score)[0] - num(y.score)[1]) - (num(x.score)[0] - num(x.score)[1]))[0];
    const rec = v => { const L = R.filter(r => r.venue === v); const w = L.filter(r => outcome(r.score) === 'win').length; return `${w} из ${L.length}`; };
    return { n: R.length, w: wins.length, l: losses.length, gf, ga, big,
      cs: R.filter(r => num(r.score)[1] === 0).length, avgF: (gf / R.length).toFixed(1).replace('.', ','), avgA: (ga / R.length).toFixed(1).replace('.', ','),
      winPct: Math.round(wins.length / R.length * 100), home: rec('дома'), away: rec('в гостях') };
  }
  function pointsChart() {
    const L = D.results.filter(r => r.comp === 'Ла Лига').sort((a, b) => a.date.localeCompare(b.date));
    let p = 0; const pts = [0, ...L.map(r => (p += outcome(r.score) === 'win' ? 3 : outcome(r.score) === 'draw' ? 1 : 0))];
    const W = 640, H = 260, px = 36, py = 24, max = Math.ceil(Math.max(...pts, 3) / 3) * 3;
    const X = i => px + i * (W - 2 * px) / (pts.length - 1), Y = v => H - py - v * (H - 2 * py) / max;
    const path = pts.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
    const grid = []; for (let v = 0; v <= max; v += max > 18 ? 6 : 3) grid.push(`<line class="grid" x1="${px}" x2="${W - px}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${px - 8}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`);
    return `<svg class="line-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Очки Реала в Ла Лиге по турам">
      <defs><linearGradient id="ptsFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4af37" stop-opacity=".35"/><stop offset="1" stop-color="#d4af37" stop-opacity="0"/></linearGradient></defs>
      ${grid.join('')}
      <path class="area" d="${path} L${X(pts.length - 1)},${Y(0)} L${X(0)},${Y(0)} Z" fill="url(#ptsFade)"/>
      <path class="path" pathLength="1" d="${path}"/>
      ${pts.map((v, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="4"><title>${i ? i + '-й матч: ' + v + ' очк.' : 'Старт'}</title></circle>`).join('')}
      ${pts.map((v, i) => `<text x="${X(i).toFixed(1)}" y="${H - 6}" text-anchor="middle">${i || ''}</text>`).join('')}</svg>`;
  }
  function goalsBars() {
    const R = [...D.results].sort((a, b) => a.date.localeCompare(b.date)), mx = Math.max(4, ...R.flatMap(r => num(r.score)));
    return `<div class="gm-bars">${R.map(r => { const [a, b] = num(r.score); return `
      <a class="gm" href="#match/${r.date}" title="${r.opp}: ${r.score}">
        <div class="gm-pair"><i class="f" style="height:${a / mx * 100}%"><u>${a}</u></i><i class="a" style="height:${b / mx * 100}%"><u>${b}</u></i></div>
        <span>${initials(r.opp)}</span></a>`; }).join('')}</div>
      <div class="form-legend"><span><i class="win"></i>забито</span><span><i class="loss"></i>пропущено</span></div>`;
  }
  function renderSeason() {
    const s = seasonStats();
    $('#mcSeason').innerHTML = `
      <div class="facts">
        <div class="fact"><b>${s.winPct}%</b><span>побед (${s.w} из ${s.n})</span></div>
        <div class="fact"><b>${s.avgF} : ${s.avgA}</b><span>мячей за матч</span></div>
        <div class="fact"><b>${s.cs}</b><span>«сухих» матчей</span></div>
        <div class="fact"><b>${s.home} · ${s.away}</b><span>побед дома · в гостях</span></div>
      </div>
      <div class="two-col season-grid">
        <div class="panel"><h3>Очки в Ла Лиге по матчам</h3>${pointsChart()}<p class="muted small">По горизонтали — номер матча Реала в Ла Лиге. Победа — 3 очка, ничья — 1.</p></div>
        <div class="panel"><h3>Мячи в каждом матче</h3>${goalsBars()}<p class="muted small">Матчи по порядку, все турниры; нажмите на столбик, чтобы открыть матч. Самая крупная победа: ${s.big.opp}, ${s.big.score}.</p></div>
      </div>`;
    setTimeout(() => { const sv = $('#mcSeason .line-svg'); if (sv) sv.classList.add('go'); }, 60);
  }

  // ---------- Блоки на главной ----------
  function topScorers() {
    // голы после 10 туров (data.js) + голы из матчей Ла Лиги после даты среза (matchInfo)
    const add = {};
    D.results.filter(r => r.comp === 'Ла Лига' && r.date > (D.statsThrough || '')).forEach(r => {
      ((D.matchInfo || {})[r.date] || { scorers: [] }).scorers.filter(g => g.side === 'real').forEach(g => { add[g.name] = (add[g.name] || 0) + 1; });
    });
    return D.players.map(p => ({ name: p.name, goals: (p.goals || 0) + (add[p.name] || 0) })).filter(p => p.goals > 0).sort((a, b) => b.goals - a.goals).slice(0, 5);
  }
  function renderTicker() {
    const el = $('#ticker');
    if (!el) return;
    const last = [...D.results].sort((a, b) => b.date.localeCompare(a.date))[0];
    const nx = nextMatch();
    const tbl = [...D.league.table].sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf);
    const me = tbl.findIndex(t => t.me), top = topScorers()[0];
    const fmtShort = new Intl.DateTimeFormat((window.LOCALE || 'ru-RU'), { day: 'numeric', month: 'long' });
    const items = [];
    if (last) { const [a, b] = num(last.score), h = last.venue === 'дома';
      items.push(`<span class="tk"><b>Последний матч</b><span>${h ? 'Реал Мадрид' : last.opp} ${h ? a : b}:${h ? b : a} ${h ? last.opp : 'Реал Мадрид'}</span></span>`); }
    if (nx) items.push(`<span class="tk"><b>Следующий матч</b><span>${nx.venue === 'дома' ? 'Реал Мадрид — ' + nx.opp : nx.opp + ' — Реал Мадрид'}</span><em>${fmtShort.format(day(nx.date))}${nx.kickoff ? ' · ' + fmtTime.format(new Date(nx.kickoff)) : ''}</em></span>`);
    if (me >= 0) items.push(`<span class="tk"><b>Ла Лига</b><span>Место ${me + 1} · ${tbl[me].pts} очк.</span></span>`);
    items.push(`<span class="tk"><b>Форма</b>${formHTML(5)}</span>`);
    if (top) items.push(`<span class="tk"><b>Лучший бомбардир</b><span>${top.name} · ${top.goals}</span></span>`);
    { const cl = (D.now.find(n => n.k.toLowerCase().startsWith('победы')) || {}).v; if (cl) items.push(`<span class="tk"><b>Победы в Лиге чемпионов</b><span>${cl}</span></span>`); }
    const row = items.join('<i class="tk-sep" aria-hidden="true">◆</i>');
    el.innerHTML = `<div class="ticker-track"><div class="tk-set">${row}<i class="tk-sep" aria-hidden="true">◆</i></div><div class="tk-set" aria-hidden="true">${row}<i class="tk-sep" aria-hidden="true">◆</i></div></div>`;
  }
  function renderHome() {
    renderTicker();
    const s = seasonStats(), top = topScorers(), mx = top[0] ? top[0].goals : 1;
    $('#homeWidgets').innerHTML = `
      <div class="panel hw">
        <h3>Сезон 2026/27 в цифрах</h3>
        <div class="hw-tiles">
          <div><b data-to="${s.w}">0</b><span>побед</span></div><div><b data-to="${s.l}">0</b><span>поражения</span></div>
          <div><b>${s.gf}:${s.ga}</b><span>мячи</span></div><div><b data-to="${s.cs}">0</b><span>«сухих» матчей</span></div>
        </div>
        <div class="gd-chart" role="img" aria-label="Разница мячей по матчам сезона">
          <div class="gd-head"><span>Разница мячей по матчам</span><span class="gd-leg"><i class="w"></i>победа <i class="d"></i>ничья <i class="l"></i>поражение</span></div>
          <div class="gd-bars">${[...D.results].reverse().map((r, i) => { const [a, b] = num(r.score), d = a - b, o = outcome(r.score);
            return `<span class="gd ${o[0]}" style="--h:${Math.max(Math.abs(d), .35) * 17}%;--i:${i}" title="${r.opp}, ${r.score}"><em>${r.score}</em></span>`; }).join('')}</div>
        </div>
        <a class="btn btn-ghost hw-link" href="#matches">Подробнее в матч-центре →</a>
      </div>
      <div class="panel hw">
        <h3>Бомбардиры Реала в Ла Лиге</h3>
        <div class="hbars">${top.map(p => `
          <div class="hbar"><span>${p.name}</span><span class="track"><i class="fill" style="--w:${p.goals / mx * 100}%"></i></span><b>${p.goals}</b></div>`).join('')}</div>
        <p class="muted small hw-note">Голы после 10 туров (LaLiga) и мячи матчей 1 и 7 ноября.</p>
      </div>`;
    $$('#homeWidgets .hw-tiles b[data-to]').forEach(b => { const to = +b.dataset.to; b.textContent = '0'; setTimeout(() => { const t0 = performance.now(); (function tick(now) { const p = Math.min((now - t0) / 1100, 1); b.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); })(t0); }, 350); });
  }

  // ---------- Календарь .ics, «поделиться» ----------
  function toast(text) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = text; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600);
  }
  const icsDate = ms => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  function icsFor(list) {
    const ev = list.map(m => { const st = Date.parse(m.kickoff); const title = tr(m.venue === 'дома' ? `Реал Мадрид — ${m.opp}` : `${m.opp} — Реал Мадрид`);
      return ['BEGIN:VEVENT', `UID:rm-${m.date}@fan-site`, `DTSTAMP:${icsDate(Date.now())}`, `DTSTART:${icsDate(st)}`, `DTEND:${icsDate(st + 2 * 3600e3)}`,
        `SUMMARY:${title} (${m.comp})`, 'END:VEVENT'].join('\r\n'); });
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Real Madrid fan site//RU', 'CALSCALE:GREGORIAN', ...ev, 'END:VCALENDAR'].join('\r\n');
  }
  function download(name, text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: name }); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  document.addEventListener('click', e => {
    const ics = e.target.closest('[data-ics]');
    if (ics) {
      const list = ics.dataset.ics === 'next' ? [nextMatch()].filter(m => m && m.kickoff) : D.upcoming.filter(m => m.kickoff && endOf(m) > Date.now());
      if (!list.length) { toast('В списке нет матчей с известным временем'); return; }
      download(ics.dataset.ics === 'next' ? 'real-madrid-match.ics' : 'real-madrid-2026-27.ics', icsFor(list)); toast('Файл календаря скачан — откройте его, чтобы добавить матчи');
    }
    const sh = e.target.closest('[data-share]');
    if (sh) {
      const r = D.results.find(x => x.date === sh.dataset.share), title = tr(`Реал Мадрид — ${r.opp}`) + `, ${r.score}`;
      if (navigator.share) navigator.share({ title, url: location.href }).catch(() => {});
      else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(() => toast('Ссылка на матч скопирована'), () => toast('Скопируйте адрес из строки браузера'));
      else toast('Скопируйте адрес из строки браузера');
    }
    const cal = e.target.closest('[data-cal]');
    if (cal && !cal.disabled) { calM += +cal.dataset.cal; if (calM > 11) { calM = 0; calY++; } if (calM < 0) { calM = 11; calY--; } renderCal(); }
  });

  // ---------- Заголовок вкладки с отсчётом ----------
  function titleTick() {
    const m = nextMatch(), base = tr('Real Madrid — неофициальный фан-сайт');
    if (!m || !m.kickoff) { document.title = base; return; }
    const s = Math.floor((Date.parse(m.kickoff) - Date.now()) / 1000);
    if (s <= 0) { document.title = base; return; }
    const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), mi = Math.floor(s % 3600 / 60);
    document.title = tr(`⏱ ${d ? d + ' д ' : ''}${h} ч ${mi} мин до матча · Реал — ${m.opp}`);
  }
  setInterval(titleTick, 30000);

  // ---------- События ----------
  $('#mcTabs').addEventListener('click', e => {
    const b = e.target.closest('.tab'); if (!b) return;
    $$('#mcTabs .tab').forEach(x => x.classList.toggle('active', x === b));
    const ids = { cal: 'mcCal', res: 'mcRes', table: 'mcTable', season: 'mcSeason' };
    Object.entries(ids).forEach(([k, id]) => { $('#' + id).hidden = k !== b.dataset.tab; });
    if (b.dataset.tab === 'season') renderSeason();
    observeReveal($('#matches'));
  });
  $('#mcTable').addEventListener('click', e => {
    const h = e.target.closest('[data-sort]'); if (!h) return;
    tblKey = h.dataset.sort; renderTable();
  });
  $('#mcRes').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    resFilter = b.dataset.c; renderRes();
  });
  $('#trChips').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    trFilter = b.dataset.k; renderTransfers();
  });

  function renderNext() {
    const m = nextMatch();
    $('#nextHome').innerHTML = nextHTML(m, true);
    $('#nextFull').innerHTML = nextHTML(m, false);
    tick();
  }
  function onPage(p) {
    if (p === 'match') renderMatch();
    if (p === 'matches') { renderNext(); renderCal(); observeReveal($('#matches')); }
    if (p === 'transfers') renderTransfers();
  }
  document.addEventListener('pagechange', e => onPage(e.detail));

  // Старт
  renderNext(); renderCal(); renderRes(); renderTable(); renderTransfers(); renderHome(); titleTick();
  if (location.hash.startsWith('#match/')) renderMatch();
})();

;
/* ======== extras.js ======== */
// Поиск по сайту (Ctrl+K или «/»): разделы, игроки, матчи, новости, трансферы.
(function () {
  const dlg = $('#palette'), input = $('#palInput'), list = $('#palList');
  if (!dlg || typeof dlg.showModal !== 'function') { const b = $('#searchBtn'); if (b) b.hidden = true; return; }
  const POS = { GK: 'вратарь', DF: 'защитник', MF: 'полузащитник', FW: 'нападающий' };
  const dFmt = new Intl.DateTimeFormat((window.LOCALE || 'ru-RU'), { day: 'numeric', month: 'long' });
  const day = s => new Date(s + 'T12:00:00');

  // Что умеем искать. go() — куда перейти.
  const fillAndGo = (hash, sel, value) => () => {
    location.hash = hash;
    setTimeout(() => { const el = $(sel); if (el) { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); } }, 60);
  };
  function buildIndex() {
    const idx = [];
    $$('#mainNav a').forEach(a => idx.push({ g: 'Разделы', t: a.textContent.trim(), s: 'Перейти в раздел', hay: a.textContent, go: () => { location.hash = a.getAttribute('href'); } }));
    idx.push({ g: 'Разделы', t: 'О проекте', s: 'Перейти в раздел', hay: 'о проекте about технологии', go: () => { location.hash = '#about'; } });
    D.players.forEach(p => idx.push({ g: 'Игроки', t: p.name, s: `${POS[p.pos]} · ${p.nat}`, hay: `${p.name} ${p.nat} ${POS[p.pos]}`, go: fillAndGo('#squad', '#playerSearch', p.name) }));
    D.results.forEach(r => idx.push({ g: 'Матчи', t: `${r.venue === 'дома' ? 'Реал' : r.opp} ${r.score} ${r.venue === 'дома' ? r.opp : 'Реал'}`.replace(/(\d+):(\d+)/, (m, a, b) => r.venue === 'дома' ? `${a}:${b}` : `${b}:${a}`),
      s: `${r.comp} · ${dFmt.format(day(r.date))}`, hay: `${r.opp} ${r.comp} ${r.score} матч результат`, go: () => { location.hash = '#match/' + r.date; } }));
    D.upcoming.forEach(u => idx.push({ g: 'Календарь', t: `${u.venue === 'дома' ? 'Реал — ' + u.opp : u.opp + ' — Реал'}`, s: `${u.comp} · ${dFmt.format(day(u.date))}`, hay: `${u.opp} ${u.comp} календарь ближайший матч`, go: () => { location.hash = '#matches'; } }));
    D.league.table.forEach(t => idx.push({ g: 'Таблица', t: t.team, s: `${t.pts} очк. · ${t.p} матчей`, hay: `${t.team} таблица ла лига`, go: () => { location.hash = '#matches'; setTimeout(() => { const b = $('#mcTabs [data-tab=table]'); if (b) b.click(); }, 60); } }));
    D.news.forEach(n => idx.push({ g: 'Новости', t: n.title, s: dFmt.format(day(n.date)), hay: `${n.title} ${n.text}`, go: fillAndGo('#news', '#search', n.title) }));
    (D.transfers || []).forEach(t => idx.push({ g: 'Трансферы', t: t.name, s: `${t.dir === 'in' ? 'пришёл из' : 'ушёл в'} · ${t.club}`, hay: `${t.name} ${t.club} трансфер`, go: () => { location.hash = '#transfers'; } }));
    D.legends.forEach(l => idx.push({ g: 'Легенды', t: l.name, s: `${l.role} · ${l.years}`, hay: `${l.name} ${l.role}`, go: () => { location.hash = '#club'; } }));
    return idx;
  }
  let INDEX = null, items = [], sel = 0;

  function render(q) {
    INDEX = INDEX || buildIndex();
    const qq = q.trim().toLowerCase().replace(/ё/g, 'е');
    if (!qq) items = INDEX.filter(i => i.g === 'Разделы').concat(INDEX.filter(i => i.g === 'Календарь').slice(0, 2));
    else {
      const words = qq.split(/\s+/);
      items = INDEX.map(i => { const h = hay(i.t + ' ' + i.hay).toLowerCase().replace(/ё/g, 'е'); const ok = words.every(w => h.includes(w));
        return ok ? { i, sc: (i.t.toLowerCase().replace(/ё/g, 'е').includes(qq) ? 0 : 1) + (i.g === 'Разделы' ? -1 : 0) } : null; })
        .filter(Boolean).sort((a, b) => a.sc - b.sc).map(x => x.i).slice(0, 14);
    }
    sel = 0;
    if (!items.length) { list.innerHTML = '<li class="pal-empty">Ничего не найдено. Попробуйте другое слово: фамилию, команду или раздел.</li>'; return; }
    let last = '';
    list.innerHTML = items.map((it, n) => {
      const head = it.g !== last ? `<li class="pal-group" role="presentation">${it.g}</li>` : ''; last = it.g;
      return `${head}<li class="pal-item${n === 0 ? ' on' : ''}" role="option" data-n="${n}"><b>${it.t}</b><small>${it.s}</small></li>`;
    }).join('');
  }
  function move(d) {
    if (!items.length) return;
    sel = (sel + d + items.length) % items.length;
    $$('.pal-item', list).forEach(el => el.classList.toggle('on', +el.dataset.n === sel));
    const on = $('.pal-item.on', list); if (on) on.scrollIntoView({ block: 'nearest' });
  }
  function choose(n) { const it = items[n]; if (!it) return; dlg.close(); it.go(); }
  function open() { if (dlg.open) return; INDEX = null; input.value = ''; render(''); dlg.showModal(); input.focus(); }

  $('#searchBtn').addEventListener('click', open);
  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(sel); }
  });
  list.addEventListener('click', e => { const li = e.target.closest('.pal-item'); if (li) choose(+li.dataset.n); });
  list.addEventListener('mousemove', e => { const li = e.target.closest('.pal-item'); if (li && +li.dataset.n !== sel) { sel = +li.dataset.n; $$('.pal-item', list).forEach(el => el.classList.toggle('on', el === li)); } });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  document.addEventListener('keydown', e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ''));
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
    else if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey) { e.preventDefault(); open(); }
  });
})();

/* свет за курсором на карточках */
(function () {
  document.addEventListener('pointermove', function (e) {
    var c = e.target.closest && e.target.closest('.card, .player, .tr-card, .fact, .stat');
    if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
})();

;
/* ======== view.js ======== */
/* Настройки вида: тема (тёмная / светлая / «День матча»), плотность карточек, размер шрифта.
   Всё хранится в localStorage (rm-theme, rm-skin, rm-density, rm-font). */
(function () {
  'use strict';
  var root = document.documentElement;
  var get = function (k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
  var set = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  var DEF = { skin: 'dark', density: 'large', font: 'm', sfx: 'off' };
  var FONT = { s: 0.92, m: 1, l: 1.12 };

  function apply(kind, v) {
    if (kind === 'skin') {
      root.dataset.theme = v === 'dark' ? 'dark' : 'light';
      if (v === 'matchday') root.dataset.skin = 'matchday'; else delete root.dataset.skin;
      set('rm-theme', root.dataset.theme); set('rm-skin', v);
    } else if (kind === 'density') {
      root.dataset.density = v; set('rm-density', v);
    } else if (kind === 'sfx') {
      root.dataset.sfx = v; set('rm-sfx', v);
    } else if (kind === 'font') {
      root.style.setProperty('--fs', FONT[v] || 1); root.dataset.font = v; set('rm-font', v);
    }
    mark(kind, v);
  }

  /* смена темы: «круговая волна» от нажатой кнопки (View Transitions API) */
  function reveal(from, fn) {
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm) { fn(); return; }
    if (!document.startViewTransition) {
      /* запасной вариант для браузеров без View Transitions: плавное «затемнение» и обратно */
      var veil = document.createElement('div'); veil.className = 'theme-veil'; document.body.appendChild(veil);
      requestAnimationFrame(function () { veil.classList.add('on'); });
      setTimeout(function () { fn(); veil.classList.remove('on'); setTimeout(function () { veil.remove(); }, 520); }, 260);
      return;
    }
    var r = from.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add('theme-vt');
    var t = document.startViewTransition(fn);
    t.ready.then(function () {
      root.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + rad + 'px at ' + x + 'px ' + y + 'px)'] }, { duration: 800, easing: 'cubic-bezier(.22,.8,.24,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(function () {});
    t.finished.then(function () { root.classList.remove('theme-vt'); }, function () { root.classList.remove('theme-vt'); });
  }

  var panel = document.getElementById('viewPanel'), btn = document.getElementById('themeBtn');
  function mark(kind, v) {
    if (!panel) return;
    panel.querySelectorAll('[data-vp="' + kind + '"] button').forEach(function (b) {
      var on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
    });
  }

  /* сохранённые значения (тема из старой версии: rm-theme без rm-skin) */
  var theme = get('rm-theme', ''), skin = get('rm-skin', theme === 'light' ? 'light' : 'dark');
  if (theme === 'dark') skin = 'dark';
  apply('skin', skin);
  apply('density', get('rm-density', DEF.density));
  apply('font', get('rm-font', DEF.font));
  apply('sfx', get('rm-sfx', DEF.sfx));

  if (panel && btn) {
    var close = function () { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', function (e) { e.stopPropagation(); panel.hidden = !panel.hidden; btn.setAttribute('aria-expanded', String(!panel.hidden)); });
    panel.addEventListener('click', function (e) {
      e.stopPropagation();
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-vp-reset')) { apply('skin', DEF.skin); apply('density', DEF.density); apply('font', DEF.font); apply('sfx', DEF.sfx); return; }
      var row = b.closest('[data-vp]');
      if (row && row.dataset.vp === 'skin') reveal(b, function () { apply('skin', b.dataset.v); });
      else if (row) apply(row.dataset.vp, b.dataset.v);
    });
    document.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* подпись для печатной версии */
  var main = document.querySelector('main.content');
  if (main) main.setAttribute('data-print', (window.tr ? tr('Real Madrid — неофициальный фан-сайт') : 'Real Madrid') + ' · ' + (window.SITE && window.SITE.asOf ? (window.tr ? tr(window.SITE.asOf) : window.SITE.asOf) : ''));

  /* плавные переходы между вкладками (View Transitions API) */
})();

;
/* ======== viz.js ======== */
/* Визуализации и движение: прогресс чтения, наклон карточек, радар сравнения игроков,
   график очков в таблице Ла Лиги, шкала голов на странице матча. Только данные из data.js / profiles.js. */
(function () {
  'use strict';
  var D = window.SITE, P = window.PROFILES || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- 1. полоса прогресса чтения ---------- */
  var bar = document.createElement('div'); bar.className = 'read-progress'; bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<i></i>'; document.body.appendChild(bar);
  var fill = bar.firstChild, tick = false;
  function prog() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    fill.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')'; tick = false;
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(prog); } }, { passive: true });
  window.addEventListener('pagechange', prog); prog();

  /* ---------- 2. наклон карточек игроков и плавное появление по очереди ---------- */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    var grid = document.getElementById('players-grid');
    if (grid) {
      grid.addEventListener('pointermove', function (e) {
        var c = e.target.closest('.player'); if (!c) return;
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg'); c.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg'); c.classList.add('tilt');
      });
      grid.addEventListener('pointerout', function (e) {
        var c = e.target.closest('.player'); if (!c) return;
        c.style.setProperty('--ry', '0deg'); c.style.setProperty('--rx', '0deg'); c.classList.remove('tilt');
      });
    }
  }
  function stagger(root) {
    $$('.cards, .grid, .hw-tiles, .news-grid', root).forEach(function (box) {
      Array.prototype.forEach.call(box.children, function (el, i) { if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', Math.min(i, 12)); });
    });
  }
  new MutationObserver(function () { stagger(document); }).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
  stagger(document);

  /* ---------- 3. радар сравнения игроков ---------- */
  var AXES = [
    ['Голы', function (s) { return s.goals; }],
    ['Удары', function (s) { return s.shots; }],
    ['Удары в створ', function (s) { return s.shotsOnTarget; }],
    ['Голевые передачи', function (s) { return s.assists; }],
    ['Успешные обводки', function (s) { return s.dribbles; }]
  ];
  function per90(p, f) { var s = p && p.stats; if (!s || !s.minutes || s.minutes < 200) return null; var v = f(s); return v == null ? null : v / s.minutes * 90; }
  function maxes() {
    return AXES.map(function (a) {
      var m = 0; Object.keys(P).forEach(function (k) { var v = per90(P[k], a[1]); if (v != null && v > m) m = v; });
      return m || 1;
    });
  }
  function point(i, n, r, cx, cy) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
  function radarHTML(a, b) {
    var pa = P[a.id], pb = P[b.id];
    var gk = function (p) { return p && p.pos === 'GK'; };
    if (a.pos === 'GK' || b.pos === 'GK') return '<p class="muted small">Для вратарей радар не строится.</p>';
    var va = a._vals || AXES.map(function (x) { return per90(pa, x[1]); }), vb = b._vals || AXES.map(function (x) { return per90(pb, x[1]); });
    if (va.indexOf(null) >= 0 || vb.indexOf(null) >= 0) return '<p class="muted small">Радар доступен, если у обоих игроков не меньше 200 минут в Ла Лиге.</p>';
    var mx = maxes(), n = AXES.length, C = 130, R = 96;
    var grid = [0.25, 0.5, 0.75, 1].map(function (k) {
      return '<polygon class="rd-ring" points="' + AXES.map(function (_, i) { return point(i, n, R * k, C, C).join(','); }).join(' ') + '"/>';
    }).join('');
    var spokes = AXES.map(function (_, i) { var p = point(i, n, R, C, C); return '<line class="rd-spoke" x1="' + C + '" y1="' + C + '" x2="' + p[0] + '" y2="' + p[1] + '"/>'; }).join('');
    var poly = function (vals, cls) {
      var pts = vals.map(function (v, i) { return point(i, n, R * Math.min(1, v / mx[i]), C, C).join(','); }).join(' ');
      return '<polygon class="rd-area ' + cls + '" points="' + pts + '"/>';
    };
    var labels = AXES.map(function (x, i) {
      var p = point(i, n, R + 26, C, C);
      return '<span class="rd-lab" style="left:' + (p[0] / (2 * C) * 100).toFixed(1) + '%;top:' + (p[1] / (2 * C) * 100).toFixed(1) + '%">' + x[0] + '</span>';
    }).join('');
    var f = function (v) { return v.toFixed(2).replace('.', window.LOCALE && /^(ru|es)/.test(window.LOCALE) ? ',' : '.'); };
    var rows = AXES.map(function (x, i) {
      return '<tr><td>' + x[0] + '</td><td>' + f(va[i]) + '</td><td>' + f(vb[i]) + '</td></tr>';
    }).join('');
    return '<div class="radar"><div class="rd-box"><svg viewBox="0 0 ' + 2 * C + ' ' + 2 * C + '" role="img" aria-label="Радар">' + grid + spokes + poly(va, 'a') + poly(vb, 'b') + '</svg>' + labels + '</div>' +
      '<div class="rd-side"><h4>Профиль на 90 минут</h4>' +
      '<div class="rd-key"><span class="a">' + a.name + '</span><span class="b">' + b.name + '</span></div>' +
      '<table class="rd-tbl"><thead><tr><th></th><th>' + a.name + '</th><th>' + b.name + '</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p class="muted small">Каждая ось — доля от лучшего значения в составе. Ла Лига 2026/27, после 10 туров; игроки от 200 минут.</p></div></div>';
  }
  function watchCompare() {
    var out = document.getElementById('cmpOut'); if (!out) return;
    function draw() {
      if (!out.querySelector('.cmp-row') || out.querySelector('.radar') || out.querySelector('.rd-note')) return;
      var a = D.players.find(function (p) { return p.id === +document.getElementById('cmpA').value; });
      var b = D.players.find(function (p) { return p.id === +document.getElementById('cmpB').value; });
      if (!a || !b) return;
      var w = document.createElement('div'); w.className = 'rd-wrap'; w.innerHTML = radarHTML(a, b);
      if (!w.querySelector('.radar')) w.className += ' rd-note';
      out.appendChild(w);
      requestAnimationFrame(function () { requestAnimationFrame(function () { w.classList.add('on'); }); });
    }
    new MutationObserver(draw).observe(out, { childList: true }); draw();
  }

  /* ---------- 4. график очков в таблице Ла Лиги ---------- */
  var tblMode = 'table';
  function pointsChart() {
    var rows = D.league.table.slice().sort(function (x, y) { return y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf; });
    var max = rows[0].pts || 1, n = rows.length;
    var zone = function (i) { return i < 4 ? 'z-cl' : i === 4 ? 'z-el' : i === 5 ? 'z-conf' : i >= n - 3 ? 'z-rel' : ''; };
    return '<div class="pts-chart">' + rows.map(function (t, i) {
      return '<div class="pc-row ' + zone(i) + (t.me ? ' me' : '') + '"><span class="pc-n">' + (i + 1) + '</span><span class="pc-t">' + t.team + '</span>' +
        '<span class="pc-track"><i style="--w:' + (t.pts / max * 100).toFixed(1) + '%;--d:' + i * 35 + 'ms"></i></span><b>' + t.pts + '</b><small>' + t.p + '</small></div>';
    }).join('') + '</div>' +
    '<p class="muted small">Справа от очков — сыгранные матчи.</p>';
  }
  function decorateTable() {
    var pane = document.getElementById('mcTable'); if (!pane) return;
    var wrap = $('.lg-wrap', pane); if (!wrap || $('.vz-switch', pane)) return;
    var sw = document.createElement('div'); sw.className = 'vz-switch'; sw.setAttribute('role', 'group');
    sw.innerHTML = '<button type="button" data-m="table">Таблица</button><button type="button" data-m="chart">График очков</button>';
    pane.insertBefore(sw, wrap);
    var chart = document.createElement('div'); chart.className = 'vz-chart'; chart.hidden = true; chart.innerHTML = pointsChart();
    wrap.parentNode.insertBefore(chart, wrap.nextSibling);
    function apply(m) {
      tblMode = m; wrap.hidden = m !== 'table'; chart.hidden = m !== 'chart';
      $$('button', sw).forEach(function (b) { var on = b.dataset.m === m; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
      if (m === 'chart') { chart.classList.remove('on'); requestAnimationFrame(function () { requestAnimationFrame(function () { chart.classList.add('on'); }); }); }
    }
    sw.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) apply(b.dataset.m); });
    apply(tblMode);
  }
  var pane = document.getElementById('mcTable');
  if (pane) { new MutationObserver(function () { if ($('.lg-wrap', pane) && !$('.vz-switch', pane)) decorateTable(); }).observe(pane, { childList: true }); decorateTable(); }

  /* ---------- 5. шкала голов на странице матча ---------- */
  function minute(s) { var m = /^\D*(\d+)(?:\+(\d+))?/.exec(s || ''); return m ? +m[1] + (m[2] ? +m[2] * 0.6 : 0) : null; }
  function decorateMatch() {
    var box = document.getElementById('matchPage'); if (!box || $('.mt-line', box)) return;
    var head = $('.mp-head', box); if (!head) return;
    var date = location.hash.split('/')[1], info = (D.matchInfo || {})[date];
    if (!info || !info.scorers || !info.scorers.length) return;
    var MAXM = 95, pct = function (m) { return Math.min(100, m / MAXM * 100).toFixed(2); };
    var dots = info.scorers.map(function (g) {
      var m = minute(g.min); if (m == null) return '';
      return '<span class="mt-dot ' + g.side + '" style="left:' + pct(m) + '%" title="' + g.min + ' ' + g.name + '"><em>' + g.min + '</em></span>';
    }).join('');
    var el = document.createElement('div'); el.className = 'panel mt-line';
    el.innerHTML = '<h3>Ход матча</h3><div class="mt-axis"><span class="mt-half" style="left:' + pct(45) + '%"></span>' + dots + '</div>' +
      '<div class="mt-scale"><span>0′</span><span style="left:' + pct(45) + '%">45′</span><span style="left:' + pct(90) + '%">90′</span></div>' +
      '<div class="mt-key"><span class="real">Реал</span><span class="opp">Соперник</span></div>';
    head.parentNode.insertBefore(el, head.nextSibling);
    requestAnimationFrame(function () { el.classList.add('on'); });
  }
  var mp = document.getElementById('matchPage');
  if (mp) new MutationObserver(function () { if (!$('.mt-line', mp)) decorateMatch(); }).observe(mp, { childList: true });

  /* среднее по полевым игрокам состава (от 200 минут) — для сравнения в лаборатории */
  function avgPlayer() {
    var sums = AXES.map(function () { return 0; }), n = 0;
    D.players.forEach(function (p) {
      if (p.pos === 'GK') return;
      var v = AXES.map(function (x) { return per90(P[p.id], x[1]); });
      if (v.indexOf(null) >= 0) return;
      n++; v.forEach(function (x, i) { sums[i] += x; });
    });
    return n ? { id: -1, name: 'Среднее по составу', pos: 'MF', _vals: sums.map(function (x) { return x / n; }) } : null;
  }
  window.VIZ = { radar: radarHTML, avg: avgPlayer };
  watchCompare();
})();

;
/* ======== wow.js ======== */
/* Эффекты «первого впечатления»: частицы на главном экране, наклон сводки, лента сезона,
   счётчики на странице «О проекте», радар игрока в лаборатории, «магнитные» кнопки. */
(function () {
  'use strict';
  var D = window.SITE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var LOC = window.LOCALE || 'ru-RU';

  /* ---------- 1. частицы на главном экране ---------- */
  (function () {
    var cv = document.getElementById('heroFx'); if (!cv || reduce) { if (cv) cv.hidden = true; return; }
    var hero = cv.parentNode, ctx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pts = [], mouse = { x: -999, y: -999 }, visible = true, running = false;
    function size() {
      var r = hero.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = W < 600 ? 22 : 46; pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.8 + .6 });
    }
    function frame() {
      if (!visible || document.hidden) { running = false; return; }
      var light = document.documentElement.dataset.theme === 'light';
      var rgb = light ? '150,112,20' : '240,208,110';
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var f = (1 - d2 / 14000) * .6; p.vx += dx / Math.sqrt(d2 + 1) * f * .05; p.vy += dy / Math.sqrt(d2 + 1) * f * .05; }
        p.vx *= .995; p.vy *= .995; p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;
        ctx.fillStyle = 'rgba(' + rgb + ',.7)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], ex = p.x - q.x, ey = p.y - q.y, dd = ex * ex + ey * ey;
          if (dd < 11000) { ctx.strokeStyle = 'rgba(' + rgb + ',' + (0.22 * (1 - dd / 11000)).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
      }
      requestAnimationFrame(frame);
    }
    function start() { if (!running && visible && !document.hidden) { running = true; requestAnimationFrame(frame); } }
    size(); window.addEventListener('resize', function () { size(); });
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(hero);
    document.addEventListener('visibilitychange', start);
    document.addEventListener('pagechange', function () { setTimeout(function () { size(); start(); }, 60); });
    start();
  })();

  /* ---------- 2. наклон сводки и «магнитные» кнопки ---------- */
  if (!reduce && fine) {
    var card = document.getElementById('heroCard');
    if (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = 'perspective(900px) rotateY(' + (x * 7).toFixed(2) + 'deg) rotateX(' + (-y * 7).toFixed(2) + 'deg)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    }
    document.addEventListener('pointermove', function (e) {
      var b = e.target.closest && e.target.closest('.btn-gold'); if (!b) return;
      var r = b.getBoundingClientRect();
      b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .18).toFixed(1) + 'px)';
    });
    document.addEventListener('pointerout', function (e) { var b = e.target.closest && e.target.closest('.btn-gold'); if (b) b.style.transform = ''; });
  }

  /* ---------- 3. лента сезона ---------- */
  (function () {
    var box = document.getElementById('seasonRibbon'); if (!box) return;
    var fmt = new Intl.DateTimeFormat(LOC, { day: 'numeric', month: 'short' });
    var day = function (s) { return new Date(s + 'T12:00:00'); };
    var out = function (sc) { var m = sc.split(':'); var a = +m[0], b = +m[1]; return a > b ? ['win', 'В'] : a < b ? ['loss', 'П'] : ['draw', 'Н']; };
    var asc = D.results.slice().sort(function (a, b) { return a.date.localeCompare(b.date); });
    var up = D.upcoming.slice().sort(function (a, b) { return a.date.localeCompare(b.date); }).slice(0, 4);
    var wins = 0, pts = 0;
    var done = asc.map(function (r) {
      var o = out(r.score); if (o[0] === 'win') wins++;
      return '<a class="rb-card ' + o[0] + '" href="#match/' + r.date + '"><small>' + r.comp + '</small><b>' + r.score + '</b><span>' + r.opp + '</span><em>' + fmt.format(day(r.date)) + '</em><i class="rb-res">' + o[1] + '</i></a>';
    }).join('');
    var next = up.map(function (u, i) {
      return '<div class="rb-card next' + (i === 0 ? ' first' : '') + '"><small>' + u.comp + '</small><b>' + (u.venue === 'дома' ? 'vs' : '@') + '</b><span>' + u.opp + '</span><em>' + fmt.format(day(u.date)) + '</em></div>';
    }).join('');
    box.innerHTML = '<div class="rb-head"><h3>Сезон матч за матчем</h3><p class="muted small">Листайте или тяните ленту. Нажмите на карточку, чтобы открыть матч.</p></div>' +
      '<div class="rb-track" tabindex="0" role="region" aria-label="Матчи сезона">' + done + '<span class="rb-now" aria-hidden="true"></span>' + next + '</div>';
    var tr = $('.rb-track', box), first = $('.rb-card.first', tr);
    function toNow() { tr.scrollLeft = Math.max(0, (first ? first.offsetLeft : tr.scrollWidth) - tr.clientWidth * .55); }
    toNow(); window.addEventListener('load', toNow); document.addEventListener('pagechange', function () { setTimeout(toNow, 80); });
    /* перетаскивание мышью */
    var down = false, sx = 0, sl = 0, moved = false;
    tr.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = tr.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; tr.classList.add('drag'); } tr.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; tr.classList.remove('drag'); });
    tr.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  })();

  /* ---------- 4. страница «О проекте»: счётчики ---------- */
  (function () {
    var box = document.getElementById('aboutCounters'); if (!box) return;
    var items = [[D.players.length, 'Игроков в составе'], [D.results.length, 'Матчей сезона в базе'], [D.news.length, 'Новостей'], [3, 'Языка интерфейса'], [3, 'Темы оформления']];
    box.innerHTML = items.map(function (it) { return '<div><b data-to="' + it[0] + '">0</b><span>' + it[1] + '</span></div>'; }).join('');
    var ran = false;
    function run() {
      if (ran || !document.getElementById('about').classList.contains('active')) return; ran = true;
      $$('b', box).forEach(function (el) {
        var to = +el.dataset.to, t0 = performance.now();
        if (reduce) { el.textContent = to; return; }
        (function step(t) { var k = Math.min(1, (t - t0) / 1100); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); })(t0);
      });
    }
    document.addEventListener('pagechange', function (e) { if (e.detail === 'about') { ran = false; setTimeout(run, 120); } });
    run();
  })();

  /* ---------- 5. радар игрока в лаборатории ---------- */
  (function () {
    var panel = document.getElementById('labRadar'), sel = document.getElementById('labPlayer'), name = document.getElementById('pcName');
    if (!panel || !sel || !name || !window.VIZ) return;
    function draw() {
      var p = D.players.find(function (x) { return x.id === +sel.value; }), avg = window.VIZ.avg();
      if (!p || !avg) { panel.hidden = true; return; }
      panel.hidden = false;
      panel.innerHTML = '<h3>Игрок и среднее по составу</h3><div class="rd-wrap flat">' + window.VIZ.radar(p, avg) + '</div>';
      requestAnimationFrame(function () { requestAnimationFrame(function () { var w = $('.rd-wrap', panel); if (w) w.classList.add('on'); }); });
    }
    new MutationObserver(draw).observe(name, { childList: true, characterData: true, subtree: true });
    draw();
  })();
})();

;
/* ======== plus.js ======== */
/* Плавность: лёгкий параллакс главного экрана. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 6. кольцо-курсор и параллакс ---------- */
  var hero = $('.hero'), pt = false;
  if (hero && !reduce) window.addEventListener('scroll', function () {
    if (pt) return; pt = true;
    requestAnimationFrame(function () { hero.style.setProperty('--sy', Math.min(window.scrollY, 900)); pt = false; });
  }, { passive: true });
})();

;
/* ======== motion.js ======== */
/* Движение и отклик: появление заголовков по словам, карусель трофеев, звук и вибрация (по желанию). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. заголовки появляются по словам ---------- */
  function splitWords(el) {
    if (el.dataset.words) return; el.dataset.words = '1';
    var i = 0, walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = walker.nextNode())) if (n.nodeValue.trim()) nodes.push(n);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (tok) {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span'); w.className = 'w'; w.style.setProperty('--wi', i++); w.textContent = tok; frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }
  function words() { if (!reduce) $$('.page-title, .section-head h2').forEach(splitWords); }
  /* ждём, пока скрипты соберут заголовки и переводчик закончит работу */
  window.addEventListener('load', function () { setTimeout(words, 120); });

  /* ---------- 2. карусель трофеев ---------- */
  (function () {
    var grid = document.getElementById('trophyGrid'); if (!grid) return;
    var sw = document.createElement('div'); sw.className = 'vz-switch tr-switch'; sw.setAttribute('role', 'group');
    sw.innerHTML = '<button type="button" data-m="car">Карусель</button><button type="button" data-m="grid">Сетка</button>';
    grid.parentNode.insertBefore(sw, grid);
    var nav = document.createElement('div'); nav.className = 'car-nav'; nav.innerHTML = '<button type="button" data-d="-1" aria-label="←">←</button><button type="button" data-d="1" aria-label="→">→</button>';
    grid.parentNode.insertBefore(nav, grid.nextSibling);
    var mode = 'car', raf = 0;
    function layout() {
      raf = 0; if (mode !== 'car') return;
      var r = grid.getBoundingClientRect(), mid = r.left + r.width / 2;
      $$('.trophy', grid).forEach(function (c) {
        var b = c.getBoundingClientRect(), d = (b.left + b.width / 2 - mid) / (r.width / 2); d = Math.max(-1.4, Math.min(1.4, d));
        var a = Math.abs(d);
        c.style.transform = 'perspective(900px) rotateY(' + (-d * 34).toFixed(1) + 'deg) scale(' + (1 - a * .16).toFixed(3) + ') translateZ(' + (-a * 40).toFixed(0) + 'px)';
        c.style.opacity = (1 - Math.min(.65, a * .45)).toFixed(2);
        c.style.zIndex = String(Math.round(10 - a * 5));
      });
    }
    function req() { if (!raf) raf = requestAnimationFrame(layout); }
    function apply(m) {
      mode = m; grid.classList.toggle('carousel', m === 'car'); nav.hidden = m !== 'car';
      $$('button', sw).forEach(function (b) { var on = b.dataset.m === m; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
      if (m === 'car') { grid.scrollLeft = 0; req(); } else { $$('.trophy', grid).forEach(function (c) { c.style.transform = c.style.opacity = c.style.zIndex = ''; }); }
    }
    sw.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) apply(b.dataset.m); });
    nav.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) grid.scrollBy({ left: +b.dataset.d * 260, behavior: 'smooth' }); });
    grid.addEventListener('scroll', req, { passive: true }); window.addEventListener('resize', req);
    grid.tabIndex = 0;
    grid.addEventListener('keydown', function (e) { if (mode !== 'car') return; if (e.key === 'ArrowRight') { e.preventDefault(); grid.scrollBy({ left: 260, behavior: 'smooth' }); } if (e.key === 'ArrowLeft') { e.preventDefault(); grid.scrollBy({ left: -260, behavior: 'smooth' }); } });
    /* перетаскивание мышью */
    var down = false, sx = 0, sl = 0, moved = false;
    grid.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || mode !== 'car') return; down = true; moved = false; sx = e.clientX; sl = grid.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; if (Math.abs(e.clientX - sx) > 4) { moved = true; grid.classList.add('drag'); } grid.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { down = false; grid.classList.remove('drag'); });
    /* фильтр групп перерисовывает карточки — пересчитываем наклон */
    new MutationObserver(function () { grid.scrollLeft = 0; req(); setTimeout(req, 80); }).observe(grid, { childList: true });
    document.addEventListener('pagechange', function (e) { if (e.detail === 'trophies') setTimeout(req, 60); });
    apply('car');
  })();

  /* ---------- 3. звук и вибрация (по желанию, выключено по умолчанию) ---------- */
  (function () {
    var ctx = null, root = document.documentElement;
    var on = function () { return root.dataset.sfx === 'on'; };
    function audio() {
      if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; try { ctx = new AC(); } catch (e) { return null; } }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function blip(f0, f1, dur, vol) {
      var c = audio(); if (!c) return;
      var o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
      o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
    }
    function buzz(ms) { if (navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} }
    document.addEventListener('click', function (e) {
      if (!on()) return;
      var t = e.target.closest && e.target.closest('a, button, .chip, .tab, .card, .rb-card, select, summary');
      if (!t) return;
      blip(880, 620, .06, .05); buzz(8);
    }, true);
    document.addEventListener('pagechange', function () { if (on()) { blip(300, 620, .16, .045); buzz(14); } });
    /* подтверждение при включении */
    new MutationObserver(function () { if (on()) { blip(660, 990, .12, .06); buzz(20); } }).observe(root, { attributes: true, attributeFilter: ['data-sfx'] });
  })();
})();

;
/* ======== board.js ======== */
/* Тактическая доска: схема, перетаскивание игроков, замена из списка состава, стрелки, сохранение и PNG. */
(function () {
  'use strict';
  var D = window.SITE, PR = window.PROFILES || {};
  var box = document.getElementById('board'); if (!box) return;
  var T = function (x) { return window.tr ? window.tr(x) : x; };
  var VW = 210, VH = 136;
  /* координаты в единицах поля (210 × 136), атака слева направо; роль: G вратарь, D защита, M полузащита, F нападение */
  var FORM = {
    '433':  { l: '4-3-3',   p: [[16,68,'G'],[48,22,'D'],[48,50,'D'],[48,86,'D'],[48,114,'D'],[86,36,'M'],[86,68,'M'],[86,100,'M'],[132,24,'F'],[140,68,'F'],[132,112,'F']] },
    '442':  { l: '4-4-2',   p: [[16,68,'G'],[48,22,'D'],[48,50,'D'],[48,86,'D'],[48,114,'D'],[88,24,'M'],[88,52,'M'],[88,84,'M'],[88,112,'M'],[132,50,'F'],[132,86,'F']] },
    '352':  { l: '3-5-2',   p: [[16,68,'G'],[46,34,'D'],[46,68,'D'],[46,102,'D'],[80,16,'M'],[88,42,'M'],[90,68,'M'],[88,94,'M'],[80,120,'M'],[134,50,'F'],[134,86,'F']] },
    '4231': { l: '4-2-3-1', p: [[16,68,'G'],[48,22,'D'],[48,50,'D'],[48,86,'D'],[48,114,'D'],[78,50,'M'],[78,86,'M'],[108,24,'M'],[112,68,'M'],[108,112,'M'],[142,68,'F']] }
  };
  var POSK = { G: 'GK', D: 'DF', M: 'MF', F: 'FW' };
  var POSN = { GK: 'Вратари', DF: 'Защитники', MF: 'Полузащитники', FW: 'Нападающие' };
  var st = { f: '433', slots: [], arrows: [], draw: false, sel: -1 };

  function num(p) { var pr = PR[p.id]; return pr && pr.num != null ? pr.num : p.id; }
  function byId(id) { return D.players.filter(function (p) { return p.id === id; })[0]; }
  function autofill() {
    var used = {}, slots = FORM[st.f].p;
    st.slots = slots.map(function (s) {
      var pos = POSK[s[2]], pool = D.players.filter(function (p) { return p.pos === pos && !used[p.id]; }).sort(function (a, b) { return (b.apps || 0) - (a.apps || 0); });
      var p = pool[0]; if (p) used[p.id] = 1;
      return { x: s[0], y: s[1], pid: p ? p.id : null };
    });
    st.sel = -1;
  }
  function save() { try { localStorage.setItem('rm-board', JSON.stringify({ f: st.f, s: st.slots, a: st.arrows })); } catch (e) {} }
  function load() {
    try {
      var o = JSON.parse(localStorage.getItem('rm-board') || 'null');
      if (o && FORM[o.f] && o.s && o.s.length === 11) { st.f = o.f; st.slots = o.s; st.arrows = o.a || []; return true; }
    } catch (e) {}
    return false;
  }

  /* ---------- разметка ---------- */
  box.innerHTML =
    '<div class="bd-head"><h3>Тактическая доска</h3><p class="muted small">Выберите схему и перетаскивайте игроков. Нажмите на игрока на поле, затем на имя в списке — и он займёт это место. Включите «Стрелки», чтобы рисовать на поле.</p></div>' +
    '<div class="bd-bar">' +
      '<label class="bd-sel"><span>Схема</span><select id="bdForm" class="select">' + Object.keys(FORM).map(function (k) { return '<option value="' + k + '">' + FORM[k].l + '</option>'; }).join('') + '</select></label>' +
      '<button type="button" class="chip" data-act="fill">Подставить состав</button>' +
      '<button type="button" class="chip" data-act="draw" aria-pressed="false">Стрелки</button>' +
      '<button type="button" class="chip" data-act="undo">Отменить стрелку</button>' +
      '<button type="button" class="chip" data-act="clear">Очистить стрелки</button>' +
      '<button type="button" class="chip bd-png" data-act="png">Скачать картинку</button>' +
    '</div>' +
    '<div class="bd-main"><div class="bd-pitch" id="bdPitch">' +
      '<svg class="bd-lines" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="none" aria-hidden="true"><rect width="210" height="136" class="bd-grass"/>' +
        '<g class="bd-ln"><rect x="8" y="8" width="194" height="120"/><line x1="105" y1="8" x2="105" y2="128"/><circle cx="105" cy="68" r="14"/><rect x="8" y="38" width="26" height="60"/><rect x="176" y="38" width="26" height="60"/><rect x="8" y="54" width="9" height="28"/><rect x="193" y="54" width="9" height="28"/></g></svg>' +
      '<svg class="bd-arrows" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="bdHead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#f0dc8e"/></marker></defs><g id="bdArrows"></g></svg>' +
      '<div class="bd-tokens" id="bdTokens"></div></div>' +
    '<aside class="bd-list" id="bdList" aria-label="Состав"></aside></div>' +
    '<p class="muted small">Состав на доске подставляется автоматически из списка игроков и не является прогнозом. Расстановка и стрелки сохраняются в этом браузере.</p>';

  var pitch = document.getElementById('bdPitch'), tokens = document.getElementById('bdTokens'), arrowsG = document.getElementById('bdArrows'), list = document.getElementById('bdList'), sel = document.getElementById('bdForm');

  function render() {
    sel.value = st.f;
    tokens.innerHTML = st.slots.map(function (s, i) {
      var p = s.pid != null ? byId(s.pid) : null;
      return '<button type="button" class="tk' + (i === st.sel ? ' sel' : '') + (FORM[st.f].p[i][2] === 'G' ? ' gk' : '') + '" data-i="' + i + '" style="left:' + (s.x / VW * 100).toFixed(2) + '%;top:' + (s.y / VH * 100).toFixed(2) + '%">' +
        '<b>' + (p ? num(p) : '?') + '</b><span>' + (p ? p.name : '—') + '</span></button>';
    }).join('');
    var placed = {}; st.slots.forEach(function (s) { if (s.pid != null) placed[s.pid] = 1; });
    list.innerHTML = ['GK', 'DF', 'MF', 'FW'].map(function (pos) {
      return '<h4>' + POSN[pos] + '</h4><div class="bd-grp">' + D.players.filter(function (p) { return p.pos === pos; }).map(function (p) {
        return '<button type="button" class="bd-pl' + (placed[p.id] ? ' on' : '') + '" data-p="' + p.id + '"><i>' + num(p) + '</i>' + p.name + '</button>';
      }).join('') + '</div>';
    }).join('');
    drawArrows();
  }
  function drawArrows() {
    arrowsG.innerHTML = st.arrows.map(function (a) { return '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + a[2] + '" y2="' + a[3] + '" marker-end="url(#bdHead)"/>'; }).join('');
  }
  function toUnits(e) { var r = pitch.getBoundingClientRect(); return [Math.max(2, Math.min(VW - 2, (e.clientX - r.left) / r.width * VW)), Math.max(2, Math.min(VH - 2, (e.clientY - r.top) / r.height * VH))]; }

  /* ---------- перетаскивание игроков ---------- */
  var drag = null;
  tokens.addEventListener('pointerdown', function (e) {
    var t = e.target.closest('.tk'); if (!t || st.draw) return;
    drag = { el: t, i: +t.dataset.i, x0: e.clientX, y0: e.clientY, moved: false }; t.setPointerCapture(e.pointerId); t.classList.add('drag');
  });
  tokens.addEventListener('pointermove', function (e) {
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 5) return;
    drag.moved = true; var u = toUnits(e), s = st.slots[drag.i]; s.x = u[0]; s.y = u[1];
    drag.el.style.left = (u[0] / VW * 100) + '%'; drag.el.style.top = (u[1] / VH * 100) + '%';
  });
  function endDrag() {
    if (!drag) return; drag.el.classList.remove('drag');
    if (drag.moved) { save(); } else { st.sel = st.sel === drag.i ? -1 : drag.i; render(); }
    drag = null;
  }
  tokens.addEventListener('pointerup', endDrag); tokens.addEventListener('pointercancel', endDrag);

  /* ---------- замена игрока из списка ---------- */
  list.addEventListener('click', function (e) {
    var b = e.target.closest('.bd-pl'); if (!b) return;
    if (st.sel < 0) { var free = st.slots.findIndex(function (s) { return s.pid == null; }); st.sel = free >= 0 ? free : st.sel; }
    if (st.sel < 0) return;
    var pid = +b.dataset.p, from = st.slots.findIndex(function (s) { return s.pid === pid; }), cur = st.slots[st.sel].pid;
    if (from >= 0 && from !== st.sel) st.slots[from].pid = cur;   // игрок уже на поле — меняем местами
    st.slots[st.sel].pid = pid; save(); render();
  });

  /* ---------- стрелки ---------- */
  var cur = null;
  pitch.addEventListener('pointerdown', function (e) {
    if (!st.draw) return; e.preventDefault();
    var u = toUnits(e); cur = [u[0], u[1], u[0], u[1]]; st.arrows.push(cur); pitch.setPointerCapture(e.pointerId); drawArrows();
  });
  pitch.addEventListener('pointermove', function (e) { if (!cur) return; var u = toUnits(e); cur[2] = u[0]; cur[3] = u[1]; drawArrows(); });
  function endArrow() {
    if (!cur) return;
    if (Math.hypot(cur[2] - cur[0], cur[3] - cur[1]) < 4) st.arrows.pop(); else cur.forEach(function (v, i) { cur[i] = +v.toFixed(1); });
    cur = null; save(); drawArrows();
  }
  pitch.addEventListener('pointerup', endArrow); pitch.addEventListener('pointercancel', endArrow);

  /* ---------- кнопки ---------- */
  box.querySelector('.bd-bar').addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return; var a = b.dataset.act;
    if (a === 'fill') { autofill(); save(); render(); }
    else if (a === 'draw') { st.draw = !st.draw; b.setAttribute('aria-pressed', String(st.draw)); b.classList.toggle('active', st.draw); pitch.classList.toggle('drawing', st.draw); }
    else if (a === 'undo') { st.arrows.pop(); save(); drawArrows(); }
    else if (a === 'clear') { st.arrows = []; save(); drawArrows(); }
    else if (a === 'png') png();
  });
  sel.addEventListener('change', function () { st.f = sel.value; autofill(); save(); render(); });

  /* ---------- картинка PNG ---------- */
  function png() {
    var k = 6, W = VW * k, H = VH * k + 70, c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d');
    var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#14502f'); g.addColorStop(1, '#0d3a22'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (var i = 0; i < 8; i++) { x.fillStyle = i % 2 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,0)'; x.fillRect(i * W / 8, 0, W / 8, VH * k); }
    x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 2.4;
    var R = function (a, b, w, h) { x.strokeRect(a * k, b * k, w * k, h * k); };
    R(8, 8, 194, 120); R(8, 38, 26, 60); R(176, 38, 26, 60); R(8, 54, 9, 28); R(193, 54, 9, 28);
    x.beginPath(); x.moveTo(105 * k, 8 * k); x.lineTo(105 * k, 128 * k); x.stroke(); x.beginPath(); x.arc(105 * k, 68 * k, 14 * k, 0, 6.283); x.stroke();
    x.strokeStyle = '#f0dc8e'; x.fillStyle = '#f0dc8e'; x.lineWidth = 4; x.lineCap = 'round';
    st.arrows.forEach(function (a) {
      var x1 = a[0] * k, y1 = a[1] * k, x2 = a[2] * k, y2 = a[3] * k, ang = Math.atan2(y2 - y1, x2 - x1);
      x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2 - Math.cos(ang) * 12, y2 - Math.sin(ang) * 12); x.stroke();
      x.beginPath(); x.moveTo(x2, y2); x.lineTo(x2 - 18 * Math.cos(ang - .45), y2 - 18 * Math.sin(ang - .45)); x.lineTo(x2 - 18 * Math.cos(ang + .45), y2 - 18 * Math.sin(ang + .45)); x.closePath(); x.fill();
    });
    st.slots.forEach(function (s, i) {
      var p = s.pid != null ? byId(s.pid) : null, gk = FORM[st.f].p[i][2] === 'G', cx = s.x * k, cy = s.y * k;
      x.beginPath(); x.arc(cx, cy, 20, 0, 6.283); x.fillStyle = gk ? '#1b3a8a' : '#f4f1e6'; x.fill(); x.lineWidth = 3; x.strokeStyle = '#d4af37'; x.stroke();
      x.fillStyle = gk ? '#fff' : '#0b1f4b'; x.font = 'bold 20px Segoe UI, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(p ? String(num(p)) : '?', cx, cy + 1);
      x.fillStyle = '#fff'; x.font = '600 15px Segoe UI, Arial, sans-serif'; x.fillText(p ? T(p.name) : '—', cx, cy + 36);
    });
    x.fillStyle = '#f0dc8e'; x.font = '700 24px Segoe UI, Arial, sans-serif'; x.textAlign = 'left'; x.fillText('Real Madrid · ' + FORM[st.f].l, 24, VH * k + 36);
    x.fillStyle = 'rgba(255,255,255,.7)'; x.font = '15px Segoe UI, Arial, sans-serif'; x.textAlign = 'right'; x.fillText(T('Тактическая доска'), W - 24, VH * k + 36);
    c.toBlob(function (blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'real-madrid-tactics.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); });
  }

  if (!load()) autofill();
  render();
})();

;
/* ======== home-polish ======== */
(function () {
  // подсветка карточек новостей под курсором
  var g = document.getElementById('news-grid');
  if (g && matchMedia('(hover:hover)').matches) {
    g.addEventListener('pointermove', function (e) {
      var c = e.target.closest('.card'); if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }
})();

;
/* ======== club-polish ======== */
(function () {
  var D = window.SITE, $ = function (q, r) { return (r || document).querySelector(q); };
  // 1. шкала эпох легенд (по годам из data.js)
  var box = $('#legendEras');
  if (box && D && D.legends) {
    var P = D.legends.map(function (l) { var m = String(l.years).match(/(\d{4})\D+(\d{4})/); return m ? { l: l, a: +m[1], b: +m[2] } : null; }).filter(Boolean);
    var MIN = 1950, MAX = new Date().getFullYear() + 0, span = MAX - MIN;
    var ticks = []; for (var y = MIN; y <= MAX; y += 10) ticks.push(y);
    box.innerHTML = '<h3>Эпохи легенд</h3><div class="era-chart">' +
      '<div class="era-axis">' + ticks.map(function (t) { return '<span style="left:' + ((t - MIN) / span * 100) + '%">' + t + '</span>'; }).join('') + '</div>' +
      P.map(function (p, i) {
        return '<div class="era-row" data-i="' + i + '"><span class="era-name">' + p.l.name + '</span><span class="era-track">' +
          '<i class="era-bar" style="left:' + ((p.a - MIN) / span * 100) + '%;width:' + ((p.b - p.a) / span * 100) + '%;--i:' + i + '"><em>' + p.a + '–' + p.b + '</em></i></span></div>';
      }).join('') + '</div><p class="muted small era-note">Годы выступлений за клуб. Наведите на строку — подсветится карточка легенды.</p>';
    var cards = document.querySelectorAll('#legends .legend');
    box.addEventListener('pointerover', function (e) {
      var r = e.target.closest('.era-row'); cards.forEach(function (c) { c.classList.remove('hl'); });
      if (r && cards[+r.dataset.i]) cards[+r.dataset.i].classList.add('hl');
    });
    box.addEventListener('pointerleave', function () { cards.forEach(function (c) { c.classList.remove('hl'); }); });
  }
  // 2. свет под курсором на карточках клуба
  if (matchMedia('(hover:hover)').matches) {
    document.getElementById('club').addEventListener('pointermove', function (e) {
      var c = e.target.closest('.fact, .legend'); if (!c) return;
      var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }
  // 3. плавное раскрытие вопросов
  var faq = $('#faq');
  if (faq && !matchMedia('(prefers-reduced-motion: reduce)').matches && Element.prototype.animate) {
    faq.addEventListener('click', function (e) {
      var sum = e.target.closest('summary'); if (!sum) return;
      var d = sum.parentElement; e.preventDefault();
      if (d._anim) d._anim.cancel();
      var h0 = d.offsetHeight, opening = !d.open;
      if (opening) d.open = true;
      var h1 = opening ? d.scrollHeight : sum.offsetHeight + 2;
      d.style.overflow = 'hidden';
      d._anim = d.animate({ height: [h0 + 'px', h1 + 'px'] }, { duration: 320, easing: 'cubic-bezier(.22,.8,.3,1)' });
      d._anim.onfinish = d._anim.oncancel = function () { if (!opening) d.open = false; d.style.overflow = ''; d._anim = null; };
    });
  }
})();
