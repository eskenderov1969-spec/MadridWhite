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
let histFilter = 'all', histEra = null;
const ERAS = [
  { a: 1902, b: 1955, t: 'Основание и становление' },
  { a: 1956, b: 1999, t: 'Первые Кубки чемпионов' },
  { a: 2000, b: 2019, t: 'La Décima и «три подряд»' },
  { a: 2020, b: 2099, t: 'Сегодня' }
];
const TL_IC = {
  club: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18h16M5 18l-1-9 5 4 3-7 3 7 5-4-1 9"/></svg>',
  europe: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5c0 3 1.2 4.6 3.7 5M16 6h3.5c0 3-1.2 4.6-3.7 5M12 13v4M8.5 20h7M10 17h4"/></svg>'
};
function renderTimeline() {
  const era = histEra == null ? null : ERAS[histEra];
  const list = D.timeline.filter(t => (histFilter === 'all' || t.type === histFilter) && (!era || (t.year >= era.a && t.year <= era.b)));
  $('#timeline').innerHTML = list.map((t, i) => `
    <li class="reveal tl-${t.type}" data-year="${t.year}" style="--d:${Math.min(i, 5) * 0.06}s">
      <time>${t.year}</time>
      <div><span class="tl-badge tl-b-${t.type}">${TL_IC[t.type] || ''}${t.type === 'europe' ? 'Европа' : 'Клуб'}</span><h3>${t.title}</h3><p>${t.text}</p></div>
    </li>`).join('');
  observeReveal($('#timeline'));
  window.dispatchEvent(new Event('timelinerender'));
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
      const st = pr.stats || {};
      const photo = (window.PHOTOS || []).find(f => f.split('.')[0] === pr.slug);
      const art = photo
        ? `<img class="f-photo" src="assets/players/${photo}" alt="${p.name}" loading="lazy" onerror="if(!this.dataset.f){this.dataset.f=1;this.src='${photo}'}else{this.remove()}">`
        : `<svg class="f-sil" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="40" r="22"/><path d="M14 120c0-30 20-46 46-46s46 16 46 46z"/></svg>`;
      return `
      <button class="card player fifa reveal pb-${p.pos}${photo ? ' has-photo' : ''}" data-id="${p.id}" style="--d:${Math.min(i, 6) * 0.05}s" type="button">
        <span class="fav-btn${FAV.has(p.id) ? ' on' : ''}" data-fav="${p.id}" role="button" tabindex="0" aria-label="В избранное" title="В избранное">★</span>
        <div class="f-left"><b class="f-num">${num !== '' ? num : initials(p.name)}</b><span class="f-pos">${p.pos}</span></div>
        <div class="f-art"><span class="ghost-num" aria-hidden="true">${num !== '' ? num : ''}</span>${art}</div>
        <h3>${p.name}</h3>
        <div class="meta">${p.nat} · ${p.years === 'с 2026' ? 'Новичок 2026' : 'В клубе ' + p.years}</div>
        <div class="f-stats">
          <span><b>${fmtN(p.apps)}</b>матчей</span><span><b>${fmtN(p.goals)}</b>голов</span>
          <span><b>${st.assists != null ? st.assists : '—'}</b>передач</span><span><b>${st.minutes != null ? st.minutes : '—'}</b>минут</span>
        </div>
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

  const CUP_SVG = '<svg viewBox="0 0 64 64"><path class="c-h" d="M18 12H8c0 10 4 16 12 18M46 12h10c0 10-4 16-12 18"/><path class="c-b" d="M18 6h28v16a14 14 0 0 1-28 0z"/><path class="c-s" d="M29 36h6v10h-6z"/><path class="c-b" d="M21 58v-6a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v6z"/><path class="c-sh" d="M24 10v12a8 8 0 0 0 3 6"/></svg>';
  function renderTrophies() {
    const list = D.trophies.filter(t => group === 'Все' || t.group === group);
    const max = Math.max(...D.trophies.map(t => t.count));
    $('#trophyGrid').innerHTML = list.map((t, i) => `
      <div class="trophy reveal${t.count >= 15 ? ' main' : ''}" style="--d:${Math.min(i, 6) * 0.06}s">
        <span class="tr-cup" aria-hidden="true">${CUP_SVG}</span>
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
    // фото ищем и в assets/players/, и рядом с index.html (если файлы загружены в корень)
    const cand = pr.slug ? [`assets/players/${pr.slug}.jpg`, `${pr.slug}.jpg`] : []; let ck = 0;
    img.onerror = () => { if (++ck < cand.length) img.src = cand[ck]; else box.classList.add('no-photo'); };
    img.onload = () => box.classList.remove('no-photo');
    img.alt = p.name;
    img.src = cand[0] || '';

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
// Матч-центр (календарь с обратным отсчётом, результаты, таблица Ла Лиги, страница матча) .
// Данные — в data.js: upcoming, results, league, matchInfo.
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
  const TEAM_COL = { 'Валенсия': ['#ffffff', '#e8741e'], 'АЕК Афины': ['#f7d117', '#111111'], 'Расинг Сантандер': ['#0b7a3b', '#ffffff'], 'Барселона': ['#a50044', '#ffffff', '#004d98'],
    'РБ Лейпциг': ['#dd0741', '#ffffff'], 'Севилья': ['#ffffff', '#d4001f'], 'Рома': ['#8e1f2f', '#f0bc42'], 'Вильярреал': ['#f7e11b', '#005187'], 'Атлетико': ['#cb3524', '#ffffff', '#272e61'],
    'Эльче': ['#ffffff', '#0a7a3a'], 'Райо Вальекано': ['#ffffff', '#d4001f'], 'Интер': ['#0e1e5b', '#ffffff', '#111111'], 'Бетис': ['#0bb363', '#ffffff'], 'Малага': ['#2f8fd8', '#ffffff'],
    'Реал Сосьедад': ['#0067b1', '#ffffff'], 'Эспаньол': ['#1d5bbf', '#ffffff'], 'Сельта': ['#8ac3ee', '#0b3a66'], 'ПСВ': ['#e2001a', '#ffffff'], 'Арсенал': ['#ef0107', '#ffffff'],
    'ЛАСК': ['#161616', '#ffffff'], 'Шахтёр Донецк': ['#f47920', '#111111'], 'Атлетик Бильбао': ['#e5231b', '#ffffff'], 'Депортиво': ['#1d4fa8', '#ffffff'], 'Алавес': ['#0f4fa8', '#ffffff'],
    'Хетафе': ['#005999', '#ffffff'], 'Осасуна': ['#d91a21', '#0b1f4b'], 'Леванте': ['#b4122d', '#0b3a8a'] };
  // «герб» соперника: круг с буквами в цветах клуба (чужие эмблемы не используются)
  function teamBadge(name, cls) {
    const c = TEAM_COL[name];
    const st = c ? `--c1:${c[0]};--c2:${c[1]};--c3:${c[2] || 'transparent'}` : '';
    return `<span class="${cls || 'tb-s'} tb" style="${st}" aria-hidden="true">${initials(name)}</span>`;
  }
  const num = s => s.split(':').map(Number);
  const outcome = s => { const [a, b] = num(s); return a > b ? 'win' : a < b ? 'loss' : 'draw'; };
  const OUT = { win: ['В', 'Победа'], draw: ['Н', 'Ничья'], loss: ['П', 'Поражение'] };

  // ---------- Ближайший матч и отсчёт ----------
  const endOf = m => (m.kickoff ? Date.parse(m.kickoff) + 2 * 3600e3 : Date.parse(m.date + 'T23:59:59'));
  const nextMatch = () => D.upcoming.find(m => endOf(m) > Date.now());

  function teamsHTML(m) {
    const real = `<div class="nm-team"><span class="nm-crest">${crest()}</span><strong>Реал Мадрид</strong></div>`;
    const opp = `<div class="nm-team">${teamBadge(m.opp, 'nm-badge')}<strong>${m.opp}</strong></div>`;
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
      ${(() => { const L = [...D.results].sort((a, b) => b.date.localeCompare(a.date))[0]; if (!L || !m.kickoff) return '';
        const t0 = Date.parse(L.date + 'T20:00:00Z'), t1 = Date.parse(m.kickoff), p = Math.max(0, Math.min(1, (Date.now() - t0) / (t1 - t0)));
        return `<div class="nm-prog" title="Сколько времени прошло между прошлым и следующим матчем"><span>${fmtDay.format(day(L.date))} ${fmtMon.format(day(L.date)).replace('.', '')} · <span>${L.opp}</span> ${L.score}</span><i><u style="--p:${(p * 100).toFixed(1)}%"></u></i><span>${fmtDay.format(day(m.date))} ${fmtMon.format(day(m.date)).replace('.', '')} · <span>${m.opp}</span></span></div>`; })()}
      <div class="nm-form"><small>Форма · пять последних матчей</small>${formHTML(5)}</div>
      <div class="nm-actions">
        ${compact ? '<a class="btn btn-gold" href="#matches">Матч-центр <span aria-hidden="true">→</span></a>' : ''}
        ${m.kickoff ? '<button class="btn btn-outline" type="button" data-ics="next">＋ В календарь</button>' : ''}
      </div>`;
  }

  function cdHTML(parts) {
    return parts.map(([v, l]) => `<div><b>${String(v).padStart(2, '0')}</b><span>${l}</span></div>`).join('');
  }
  function setCd(el, parts) {
    const cells = el.querySelectorAll(':scope > div > b');
    if (cells.length !== parts.length) { el.innerHTML = cdHTML(parts); return; }
    parts.forEach(([v], i) => {
      const t = String(v).padStart(2, '0'), b = cells[i];
      if (b.textContent !== t) { b.textContent = t; b.classList.remove('flip'); void b.offsetWidth; b.classList.add('flip'); }
    });
    parts.forEach(([, l], i) => { const sp = cells[i].nextElementSibling; if (sp && sp.textContent !== l) sp.textContent = l; });
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
        el.classList.toggle('urgent', s < 86400);
        setCd(el, [[Math.floor(s / 86400), 'дней'], [Math.floor(s % 86400 / 3600), 'часов'], [Math.floor(s % 3600 / 60), 'минут'], [s % 60, 'секунд']]);
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
        ${teamBadge(m.opp, 'tb-s tb-end')}
        <span class="mr-venue">${m.venue}</span>
        <span class="mr-time">${m.kickoff ? fmtTime.format(new Date(m.kickoff)) : 'время уточняется'}</span>
      </div>`).join('')}</div>
      <p class="muted small">Список неполный: матчи Лиги чемпионов и ближайшие игры Ла Лиги. Время начала — по вашему часовому поясу; даты Ла Лиги могут сдвинуться.</p>`
      : '<p class="muted empty">Ближайших матчей в списке нет.</p>');
  }

  // ---------- Результаты ----------
  let resFilter = 'all', resVenue = 'all';
  function renderRes() {
    const R = D.results;
    const w = R.filter(r => outcome(r.score) === 'win').length;
    const dr = R.filter(r => outcome(r.score) === 'draw').length;
    const l = R.filter(r => outcome(r.score) === 'loss').length;
    const gf = R.reduce((a, r) => a + num(r.score)[0], 0), ga = R.reduce((a, r) => a + num(r.score)[1], 0);
    const comps = ['all', ...new Set(R.map(r => r.comp))];
    const list = R.filter(r => (resFilter === 'all' || r.comp === resFilter) && (resVenue === 'all' || r.venue === resVenue));
    $('#mcRes').innerHTML = `
      <div class="facts">
        <div class="fact"><b>${R.length}</b><span>матчей</span></div>
        <div class="fact"><b>${w} · ${dr} · ${l}</b><span>победы · ничьи · поражения</span></div>
        <div class="fact"><b>${gf} : ${ga}</b><span>разница мячей ${gf - ga > 0 ? '+' : ''}${gf - ga}</span></div>
      </div>
      <div class="chips mc-filter" role="group" aria-label="Турнир">${comps.map(c =>
        `<button class="chip${c === resFilter ? ' active' : ''}" data-c="${c}" type="button">${c === 'all' ? 'Все турниры' : c}</button>`).join('')}
        <span class="chip-sep" aria-hidden="true"></span>${[['all', 'Все матчи'], ['дома', 'Дома'], ['в гостях', 'В гостях']].map(([v, t]) =>
        `<button class="chip${v === resVenue ? ' active' : ''}" data-v="${v}" type="button">${t}</button>`).join('')}</div>
      <div class="mrows">${list.length ? list.map((r, i) => {
        const o = outcome(r.score), [a, b] = num(r.score), home = r.venue === 'дома';
        const me = `<span class="rs-team me"><span class="nm-crest tb-crest">${crest()}</span><b>Реал Мадрид</b></span>`;
        const op = `<span class="rs-team">${teamBadge(r.opp)}<b>${r.opp}</b></span>`;
        return `
        <a class="mrow res ${o}" href="#match/${r.date}" style="--i:${Math.min(i, 12)}">
          ${dateBlock(r.date)}
          <div class="mr-main"><span class="mr-comp">${r.comp} · ${r.venue}</span>
            <div class="rs-line">${home ? me : op}<span class="rs-score"><i>${home ? a : b}</i><em>:</em><i>${home ? b : a}</i></span>${home ? op : me}</div></div>
          <span class="res-badge ${o}" title="${OUT[o][1]}">${OUT[o][0]}</span>
          <span class="mr-go" aria-hidden="true">›</span>
        </a>`; }).join('') : '<p class="muted empty">По выбранным фильтрам матчей нет.</p>'}</div>
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
    const maxPts = Math.max(1, ...base.map(t => t.pts));
    const prevTop = new Map($$('#mcTable .lg-table tbody tr').map(tr => [tr.dataset.t, tr.getBoundingClientRect().top]));
    const th = (k, label, title) => `<th class="sortable${tblKey === k ? ' on' : ''}" data-sort="${k}" title="${title}">${label}</th>`;
    $('#mcTable').innerHTML = `
      <p class="muted small">Ла Лига 2026/27, ${D.league.asOf}. Нажмите на заголовок столбца, чтобы отсортировать.</p>
      <div class="table-wrap lg-wrap">
        <table class="table lg-table">
          <thead><tr><th>#</th><th>Команда</th><th title="Матчи">И</th>${th('w', 'В', 'Победы')}<th title="Ничьи">Н</th><th title="Поражения">П</th>${th('gf', 'Мячи', 'Забито — пропущено')}${th('gd', '±', 'Разница мячей')}${th('pts', 'О', 'Очки')}</tr></thead>
          <tbody>${rows.map(t => { const i = pos.get(t.team); return `
            <tr class="${zone(i)}${t.me ? ' me' : ''}" data-t="${t.team}"><td>${i + 1}</td><td><span class="lg-team">${t.me ? `<span class="tb-s tb-crest">${crest()}</span>` : teamBadge(t.team)}${t.team}</span></td><td>${t.p}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td>
            <td>${t.gf}–${t.ga}</td><td>${gdOf(t) > 0 ? '+' : ''}${gdOf(t)}</td><td class="lg-pts"><i style="--w:${(t.pts / maxPts * 100).toFixed(1)}%"></i><b>${t.pts}</b></td></tr>`; }).join('')}</tbody>
        </table>
      </div>
      <div class="lg-legend"><span><i class="z-cl"></i>Лига чемпионов</span><span><i class="z-el"></i>Лига Европы</span><span><i class="z-conf"></i>Лига конференций</span><span><i class="z-rel"></i>Зона вылета</span></div>
      <p class="muted small">${D.league.note}</p>`;
    // плавная перестановка строк при сортировке
    if (prevTop.size && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      $$('#mcTable .lg-table tbody tr').forEach(tr => {
        const y0 = prevTop.get(tr.dataset.t); if (y0 == null) return;
        const dy = y0 - tr.getBoundingClientRect().top; if (!dy) return;
        tr.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.22,.8,.3,1)' });
      });
    }
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
    const oppSide = `<div class="mp-team">${teamBadge(r.opp, 'nm-badge')}<strong>${r.opp}</strong></div>`;
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
    if (b.dataset.v) resVenue = b.dataset.v; else resFilter = b.dataset.c;
    renderRes();
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
  }
  document.addEventListener('pagechange', e => onPage(e.detail));

  // Старт
  renderNext(); renderCal(); renderRes(); renderTable(); renderHome(); titleTick();
  if (location.hash.startsWith('#match/')) renderMatch();
})();

;
/* ======== extras.js ======== */
// Поиск по сайту (Ctrl+K или «/»): разделы, игроки, матчи, новости.
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
    var items = [[D.players.length, 'Игроков в составе'], [D.results.length, 'Матчей сезона в базе'], [D.news.length, 'Новостей'], [D.trophies.reduce(function (n, t) { return n + t.count; }, 0), 'Трофеев в базе'], [3, 'Языка интерфейса'], [3, 'Темы оформления']];
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

;
/* ======== squad-polish ======== */
(function () {
  var D = window.SITE, PR = window.PROFILES || {};
  var grid = document.getElementById('players-grid'); if (!grid) return;
  var $ = function (q, r) { return (r || document).querySelector(q); };
  // свет под курсором на карточках
  if (matchMedia('(hover:hover)').matches) grid.addEventListener('pointermove', function (e) {
    var c = e.target.closest('.player'); if (!c) return; var r = c.getBoundingClientRect();
    c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  });
  // переключатель «Карточки / Таблица»
  var tb = $('#squad .toolbar');
  var mode = 'cards'; try { mode = localStorage.getItem('rm-squad-mode') || 'cards'; } catch (e) {}
  var sw = document.createElement('div'); sw.className = 'seg'; sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Вид списка');
  sw.innerHTML = '<button type="button" data-m="cards">Сетка карточек</button><button type="button" data-m="table">Таблица игроков</button>';
  tb.appendChild(sw);
  var wrap = document.createElement('div'); wrap.id = 'playersTable'; wrap.className = 'table-wrap ptable-wrap'; wrap.hidden = true;
  grid.parentNode.insertBefore(wrap, grid.nextSibling);
  var COLS = [
    ['num', '№', function (p) { return (PR[p.id] || {}).num; }],
    ['name', 'Игрок', function (p) { return p.name; }],
    ['pos', 'Поз.', function (p) { return p.pos; }],
    ['nat', 'Страна', function (p) { return p.nat; }],
    ['apps', 'Матчи', function (p) { return p.apps; }],
    ['min', 'Мин.', function (p) { return (PR[p.id] || {}).stats && PR[p.id].stats.minutes; }],
    ['goals', 'Голы', function (p) { return p.goals; }],
    ['ast', 'Пер.', function (p) { return (PR[p.id] || {}).stats && PR[p.id].stats.assists; }],
    ['yc', 'ЖК', function (p) { return (PR[p.id] || {}).stats && PR[p.id].stats.yellow; }],
    ['rc', 'КК', function (p) { return (PR[p.id] || {}).stats && PR[p.id].stats.red; }]
  ];
  var sortKey = null, dir = -1, building = false;
  function order() { return Array.prototype.map.call(grid.querySelectorAll('.player'), function (c) { return +c.dataset.id; }); }
  function build() {
    var ids = order(), rows = ids.map(function (id) { return D.players.find(function (p) { return p.id === id; }); }).filter(Boolean);
    if (sortKey) { var col = COLS.filter(function (c) { return c[0] === sortKey; })[0];
      rows = rows.slice().sort(function (a, b) { var x = col[2](a), y = col[2](b); if (x == null && y == null) return 0; if (x == null) return 1; if (y == null) return -1;
        return (typeof x === 'string' ? x.localeCompare(y, 'ru') : x - y) * dir; }); }
    var mx = {}; COLS.forEach(function (c) { if (['apps', 'min', 'goals', 'ast'].indexOf(c[0]) > -1) mx[c[0]] = Math.max.apply(null, [1].concat(D.players.map(function (p) { var v = c[2](p); return v == null ? 0 : v; }))); });
    building = true;
    wrap.innerHTML = '<table class="ptable"><thead><tr>' + COLS.map(function (c) {
      return '<th data-k="' + c[0] + '"' + (sortKey === c[0] ? ' class="s' + (dir > 0 ? 'a' : 'd') + '"' : '') + ' tabindex="0">' + c[1] + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (p, i) { return '<tr data-id="' + p.id + '" tabindex="0" style="--i:' + Math.min(i, 14) + '">' + COLS.map(function (c) {
        var v = c[2](p), t = v == null ? '—' : v;
        if (mx[c[0]]) return '<td class="num"><span class="tb-b" style="--w:' + ((v || 0) / mx[c[0]] * 100) + '%"></span><b>' + t + '</b></td>';
        if (c[0] === 'pos') return '<td><span class="pos-pill pos-' + p.pos + '">' + p.pos + '</span></td>';
        if (c[0] === 'name') return '<td class="nm-c">' + t + '</td>';
        return '<td>' + t + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
    setTimeout(function () { building = false; }, 0);
  }
  function apply() {
    sw.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b.dataset.m === mode); });
    grid.hidden = mode === 'table'; wrap.hidden = mode !== 'table';
    if (mode === 'table') build();
  }
  sw.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; mode = b.dataset.m; try { localStorage.setItem('rm-squad-mode', mode); } catch (x) {} apply(); });
  new MutationObserver(function () { if (mode === 'table' && !building) build(); }).observe(grid, { childList: true });
  wrap.addEventListener('click', function (e) {
    var th = e.target.closest('th');
    if (th) { var k = th.dataset.k; if (sortKey === k) dir = -dir; else { sortKey = k; dir = (k === 'name' || k === 'nat' || k === 'pos') ? 1 : -1; } build(); return; }
    var tr = e.target.closest('tr[data-id]'); if (!tr) return;
    var card = grid.querySelector('.player[data-id="' + tr.dataset.id + '"]'); if (card) card.click();
  });
  wrap.addEventListener('keydown', function (e) { if (e.key !== 'Enter') return; var t = e.target; if (t.matches('th,tr')) t.click(); });
  apply();
})();

;
/* ======== matches-polish ======== */
(function () {
  var $ = function (q, r) { return (r || document).querySelector(q); };
  var tabs = $('#mcTabs'); if (!tabs) return;
  // ползунок под вкладками
  var sl = document.createElement('span'); sl.className = 'tab-slider'; sl.setAttribute('aria-hidden', 'true'); tabs.prepend(sl); tabs.classList.add('slid');
  function place(animate) {
    var a = $('.tab.active', tabs); if (!a || !a.offsetWidth) return;
    if (!animate) sl.style.transition = 'none';
    sl.style.width = a.offsetWidth + 'px'; sl.style.transform = 'translateX(' + a.offsetLeft + 'px)'; sl.style.height = a.offsetHeight + 'px'; sl.style.top = a.offsetTop + 'px';
    if (!animate) { void sl.offsetWidth; sl.style.transition = ''; }
  }
  tabs.addEventListener('click', function () { requestAnimationFrame(function () { place(true); }); });
  if (window.ResizeObserver) new ResizeObserver(function () { place(false); }).observe(tabs);
  window.addEventListener('pagechange', function () { setTimeout(function () { place(false); }, 60); });
  window.addEventListener('resize', function () { place(false); });
  place(false);
  // анимация смены содержимого
  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('.tab'); if (!b) return;
    var ids = { cal: 'mcCal', res: 'mcRes', table: 'mcTable', season: 'mcSeason' }, p = document.getElementById(ids[b.dataset.tab]);
    if (!p) return; p.classList.remove('pane-in'); void p.offsetWidth; p.classList.add('pane-in');
  });
  // свет под курсором на верхней карточке матча
  var nf = document.getElementById('nextFull');
  if (nf && matchMedia('(hover:hover)').matches) nf.addEventListener('pointermove', function (e) {
    var r = nf.getBoundingClientRect(); nf.style.setProperty('--mx', (e.clientX - r.left) + 'px'); nf.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
})();

;
/* ======== stadium ======== */
(function () {
  var sec = document.getElementById('stadium'); if (!sec) return;
  var $ = function (q, r) { return (r || document).querySelector(q); }, $$ = function (q, r) { return Array.prototype.slice.call((r || document).querySelectorAll(q)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 1. счётчики в верхнем блоке
  function count(el) {
    var to = +el.dataset.to; if (reduce) { el.textContent = to; return; }
    var t0 = performance.now(), dur = 1500;
    (function tick(now) { var p = Math.min((now - t0) / dur, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); })(t0);
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); count(e.target); } }); }, { threshold: .4 }) : null;
  $$('.st-kpis [data-to]').forEach(function (el) { if (io) io.observe(el); else el.textContent = el.dataset.to; });

  // 2. параллакс фото
  var hero = $('.st-hero');
  function par() { if (!hero || !sec.classList.contains('active')) return; var r = hero.getBoundingClientRect(); hero.style.setProperty('--py', Math.max(-80, Math.min(80, -r.top * .18)).toFixed(1) + 'px'); }
  if (!reduce) { window.addEventListener('scroll', par, { passive: true }); par(); }

  // 3. схема: крыша / газон / экран
  var svg = $('.st-svg'), ctrl = $('.st-ctrl');
  if (svg && ctrl) {
    var LAB = { roof: ['Крыша: закрыта', 'Крыша: открыта'], pitch: ['Газон: на поле', 'Газон: убран'], screen: ['Экран 360°: подсветить', 'Экран 360°: подсвечен'] };
    var state = { roof: true, pitch: true, screen: false };
    function sync() {
      svg.classList.toggle('roof-open', !state.roof); svg.classList.toggle('pitch-off', !state.pitch); svg.classList.toggle('screen-on', state.screen);
      $$('[data-sw]', ctrl).forEach(function (b) {
        var k = b.dataset.sw, on = state[k]; b.classList.toggle('active', k === 'screen' ? state.screen : on); b.setAttribute('aria-pressed', String(k === 'screen' ? state.screen : on));
        var t = LAB[k][k === 'screen' ? (state.screen ? 1 : 0) : (on ? 0 : 1)]; if (b.textContent !== t) b.textContent = t;
      });
    }
    ctrl.addEventListener('click', function (e) { var b = e.target.closest('[data-sw]'); if (!b) return; state[b.dataset.sw] = !state[b.dataset.sw]; sync(); });
    sync();
  }

  // 4. график вместимости
  var tlHead = $$('.section-head', sec).filter(function (h) { return /Хронология/.test(h.textContent); })[0] || $('.st-tl', sec);
  if (tlHead && !$('#capChart')) {
    var D = [['1947', 75145, 'при открытии'], ['1954', 125000, 'после расширения'], ['сейчас', 80000, 'более 80 000']];
    var mx = 125000, wrap = document.createElement('div');
    wrap.innerHTML = '<div class="section-head"><h2>Вместимость по годам</h2></div><div class="panel cap reveal" id="capChart">' +
      D.map(function (d, i) { return '<div class="cap-row" style="--i:' + i + '"><span class="cap-y">' + d[0] + '</span><span class="cap-track"><i style="--w:' + (d[1] / mx * 100).toFixed(1) + '%"></i></span><b>' + (i === 2 ? '≈ ' : '') + d[1].toLocaleString('ru-RU').replace(/\u00a0/g, ' ') + '</b></div>'; }).join('') +
      '<p class="muted small">Первое значение — вместимость при открытии, второе — после расширения 1954 года (самая большая в истории), третье — приблизительно: источники называют от 78 297 до 85 000 мест. Рекорд посещаемости — 129 690 зрителей, 1956 год.</p></div>';
    var before = tlHead.classList.contains('section-head') ? tlHead : tlHead.previousElementSibling;
    var added = []; while (wrap.firstChild) { added.push(wrap.firstChild); before.parentNode.insertBefore(wrap.firstChild, before); }
    try { observeReveal(sec); } catch (e) { var cp = $('#capChart'); if (cp) cp.classList.add('in'); }
  }

  // 5. хронология: линия рисуется при прокрутке
  var tl = $('.st-tl', sec);
  if (tl) {
    var items = $$('li', tl);
    function line() {
      if (!sec.classList.contains('active')) return;
      var r = tl.getBoundingClientRect(), vh = innerHeight, p = Math.max(0, Math.min(1, (vh * .62 - r.top) / r.height));
      tl.style.setProperty('--prog', reduce ? 1 : p.toFixed(3));
      var edge = r.top + r.height * p;
      items.forEach(function (li) { var b = li.getBoundingClientRect(); li.classList.toggle('lit', reduce || b.top + 30 < vh * .62); });
    }
    window.addEventListener('scroll', line, { passive: true }); window.addEventListener('resize', line); window.addEventListener('pagechange', function () { setTimeout(line, 120); }); line();
  }
})();

;
/* ======== history-polish ======== */
(function () {
  var D = window.SITE, sec = document.getElementById('history'); if (!sec || !D) return;
  var $ = function (q, r) { return (r || document).querySelector(q); }, $$ = function (q, r) { return Array.prototype.slice.call((r || document).querySelectorAll(q)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tlEl = $('#timeline'), chips = $('#histChips');
  var T = D.timeline, Y0 = T[0].year, Y1 = new Date().getFullYear();
  var stat = function (re) { var s = D.stats.filter(function (x) { return re.test(x.label); })[0]; return s ? s.value : null; };
  var cl = stat(/кубков чемпионов/i), ll = stat(/титулов ла лиги/i), founded = stat(/основания/i) || Y0;
  var kp = [[Y1 - founded, 'лет истории'], [T.length, 'событий в хронологии']];
  if (cl != null) kp.push([cl, 'кубков чемпионов']); if (ll != null) kp.push([ll, 'титулов Ла Лиги']);

  // --- панель: счётчики, шкала веков, эпохи
  var box = document.createElement('div'); box.className = 'hx';
  var years = {}; T.forEach(function (t) { (years[t.year] = years[t.year] || []).push(t); });
  var span = Y1 - founded;
  var decades = []; for (var y = Math.ceil(founded / 20) * 20; y <= Y1; y += 20) decades.push(y);
  var pos = function (y) { return ((y - founded) / span * 100).toFixed(2); };
  box.innerHTML =
    '<div class="hx-kpis">' + kp.map(function (k) { return '<div><b data-to="' + k[0] + '">0</b><span>' + k[1] + '</span></div>'; }).join('') + '</div>' +
    '<div class="panel hx-ribbon reveal"><h3>Шкала времени</h3><div class="hx-axis"><i class="hx-fill"></i>' +
      decades.map(function (d) { return '<span class="hx-tick" style="left:' + pos(d) + '%">' + d + '</span>'; }).join('') +
      Object.keys(years).map(function (yr) { var ev = years[yr], eu = ev.some(function (e) { return e.type === 'europe'; }), cb = ev.some(function (e) { return e.type === 'club'; });
        return '<button type="button" class="hx-dot ' + (eu && cb ? 'both' : eu ? 'eu' : 'cl') + '" data-y="' + yr + '" style="left:' + pos(yr) + '%" aria-label="' + yr + '"><em>' + yr + (ev.length > 1 ? ' · ×' + ev.length : '') + '</em></button>'; }).join('') +
    '</div><p class="muted small">Нажмите на точку — список ниже прокрутится к событию. <span class="hx-k"><i class="cl"></i>клуб</span><span class="hx-k"><i class="eu"></i>Европа</span><span class="hx-k"><i class="both"></i>оба</span></p></div>' +
    '<div class="hx-eras" role="group" aria-label="Эпохи">' + [].concat(window.__eras || []).join('') + '</div>';
  var h2 = $('.page-title', sec); h2.parentNode.insertBefore(box, chips);
  try { observeReveal(box); } catch (e) { $$('.reveal', box).forEach(function (x) { x.classList.add('in'); }); }
  // эпохи — карточки-фильтры
  var eraBox = $('.hx-eras', box);
  eraBox.innerHTML = ERAS.map(function (e, i) {
    var ev = T.filter(function (t) { return t.year >= e.a && t.year <= e.b; }); if (!ev.length) return '';
    var ys = ev.map(function (t) { return t.year; }).filter(function (v, k, a) { return a.indexOf(v) === k; });
    return '<button type="button" class="hx-era" data-i="' + i + '"><small>' + e.a + (e.b > 2050 ? ' – ' + Y1 : '–' + e.b) + '</small><strong>' + e.t + '</strong><b data-to="' + ev.length + '">0</b><span>событий</span><em>' + ys.join(' · ') + '</em></button>';
  }).join('');
  function syncEra() {
    $$('.hx-era', box).forEach(function (b) { b.classList.toggle('on', +b.dataset.i === histEra); });
    var era = histEra == null ? null : ERAS[histEra];
    $$('.hx-dot', box).forEach(function (d) { var y = +d.dataset.y; d.classList.toggle('dim', !!era && (y < era.a || y > era.b)); });
  }
  eraBox.addEventListener('click', function (e) {
    var b = e.target.closest('.hx-era'); if (!b) return; var i = +b.dataset.i;
    histEra = histEra === i ? null : i; syncEra(); renderTimeline();
    var f = tlEl.firstElementChild; if (f && histEra != null) f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  });
  box.addEventListener('click', function (e) {
    var d = e.target.closest('.hx-dot'); if (!d) return;
    var yr = d.dataset.y, li = $('li[data-year="' + yr + '"]', tlEl);
    if (!li) { histFilter = 'all'; histEra = null; $$('.chip', chips).forEach(function (c) { c.classList.toggle('active', c.dataset.f === 'all'); }); syncEra(); renderTimeline(); li = $('li[data-year="' + yr + '"]', tlEl); }
    if (!li) return; li.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    li.classList.remove('flash'); void li.offsetWidth; li.classList.add('flash');
  });

  // --- счётчики
  function count(el) { var to = +el.dataset.to; if (reduce) { el.textContent = to; return; } var t0 = performance.now(); (function tick(n) { var p = Math.min((n - t0) / 1400, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); })(t0); }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); count(e.target); } }); }, { threshold: .5 }) : null;
  $$('[data-to]', box).forEach(function (el) { if (io) io.observe(el); else el.textContent = el.dataset.to; });

  // --- живая линия: заполняет шкалу и рисует вертикальную линию
  function line() {
    if (!sec.classList.contains('active')) return;
    var r = tlEl.getBoundingClientRect(), vh = innerHeight, p = Math.max(0, Math.min(1, (vh * .62 - r.top) / r.height));
    tlEl.style.setProperty('--prog', reduce ? 1 : p.toFixed(3));
    var cur = null;
    $$('li', tlEl).forEach(function (li) { var b = li.getBoundingClientRect(), lit = reduce || b.top + 30 < vh * .62; li.classList.toggle('lit', lit); if (lit) cur = +li.dataset.year; });
    var fill = $('.hx-fill', box); if (fill) fill.style.width = (cur == null ? 0 : pos(cur)) + '%';
    $$('.hx-dot', box).forEach(function (d) { d.classList.toggle('passed', cur != null && +d.dataset.y <= cur); });
  }
  window.addEventListener('scroll', line, { passive: true }); window.addEventListener('resize', line);
  window.addEventListener('timelinerender', function () { setTimeout(line, 80); });
  window.addEventListener('pagechange', function () { setTimeout(line, 150); });
  syncEra(); line();
})();

;
/* ======== trophies-polish ======== */
(function () {
  var D = window.SITE, sec = document.getElementById('trophies'); if (!sec || !D) return;
  var $ = function (q, r) { return (r || document).querySelector(q); }, $$ = function (q, r) { return Array.prototype.slice.call((r || document).querySelectorAll(q)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var plural = function (n, a, b, c) { var m = n % 100, k = n % 10; return m > 10 && m < 20 ? c : k === 1 ? a : k > 1 && k < 5 ? b : c; };

  // --- 1. диаграмма «Испания / Европа / Мир»
  var tb = $('.total-box', sec);
  if (tb) {
    var G = [['Испания', '#d4af37'], ['Европа', '#5b8bf0'], ['Мир', '#c9d6f2']];
    var sums = G.map(function (g) { return D.trophies.filter(function (t) { return t.group === g[0]; }).reduce(function (s, t) { return s + t.count; }, 0); });
    var tot = sums.reduce(function (a, b) { return a + b; }, 0), R = 44, C = 2 * Math.PI * R, off = 0;
    var segs = G.map(function (g, i) { var len = sums[i] / tot * C, el = '<circle class="dn-seg" data-g="' + g[0] + '" cx="60" cy="60" r="' + R + '" stroke="' + g[1] + '" stroke-dasharray="0 ' + C.toFixed(2) + '" data-len="' + len.toFixed(2) + '" data-c="' + C.toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '"/>'; off += len; return el; }).join('');
    var panel = document.createElement('div'); panel.className = 'panel donut reveal';
    panel.innerHTML = '<svg viewBox="0 0 120 120" class="dn-svg" role="img" aria-label="Трофеи по группам"><circle class="dn-bg" cx="60" cy="60" r="' + R + '"/>' + segs + '</svg>' +
      '<div class="dn-mid"><b data-to="' + tot + '">0</b><span>всего трофеев</span></div>' +
      '<div class="dn-leg">' + G.map(function (g, i) { return '<button type="button" class="dn-li" data-g="' + g[0] + '"><i style="background:' + g[1] + '"></i><span>' + g[0] + '</span><b>' + sums[i] + '</b><em>' + Math.round(sums[i] / tot * 100) + '%</em></button>'; }).join('') + '</div>';
    tb.parentNode.insertBefore(panel, tb.nextSibling);
    try { observeReveal(sec); } catch (e) { panel.classList.add('in'); }
    function grow() { $$('.dn-seg', panel).forEach(function (c, i) { setTimeout(function () { c.setAttribute('stroke-dasharray', c.dataset.len + ' ' + c.dataset.c); }, reduce ? 0 : 200 + i * 250); }); var n = $('.dn-mid b', panel); if (reduce) n.textContent = n.dataset.to; else { var t0 = performance.now(); (function tick(x) { var p = Math.min((x - t0) / 1400, 1); n.textContent = Math.round(+n.dataset.to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); })(t0); } }
    var shown = false;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en, ob) { if (en[0].isIntersecting && !shown) { shown = true; grow(); ob.disconnect(); } }, { threshold: .4 }).observe(panel); else grow();
    function pick(g) { var b = $('#trophyChips .chip[data-g="' + g + '"]'); if (b) b.click(); }
    panel.addEventListener('click', function (e) { var b = e.target.closest('[data-g]'); if (!b) return; var cur = $('#trophyChips .chip.active'); pick(cur && cur.dataset.g === b.dataset.g ? 'Все' : b.dataset.g); });
    $('#trophyChips').addEventListener('click', function () { setTimeout(function () { var cur = $('#trophyChips .chip.active'), g = cur ? cur.dataset.g : 'Все';
      $$('[data-g]', panel).forEach(function (el) { el.classList.toggle('on', g === el.dataset.g); el.classList.toggle('off', g !== 'Все' && g !== el.dataset.g); }); }, 0); });
  }

  // --- 2. лента финалов Лиги чемпионов
  var yc = $('#yearChips'), info = $('#yearInfo');
  if (yc && D.finals) {
    var F = D.finals, last = F[F.length - 1].year, html = '', run = [];
    function flush() { if (!run.length) return; var inner = run.join(''); html += run.length >= 3 ? '<span class="fin-run" data-n="' + run.length + '"><span class="fin-rl"><b>' + run.length + '</b> <span>подряд</span></span>' + inner + '</span>' : inner; run = []; }
    F.forEach(function (f, i) {
      var gap = i ? f.year - F[i - 1].year : 1;
      if (gap > 2) { flush(); if (gap >= 5) html += '<span class="fin-gap"><b>' + gap + '</b> <span>' + plural(gap, 'год', 'года', 'лет') + '</span></span>'; }
      run.push('<button type="button" class="chip fin-node' + (f.year === last ? ' active' : '') + '" data-y="' + f.year + '"><svg viewBox="0 0 64 64" aria-hidden="true"><path class="c-b" d="M18 6h28v16a14 14 0 0 1-28 0z"/><path class="c-h" d="M18 12H8c0 10 4 16 12 18M46 12h10c0 10-4 16-12 18"/><path class="c-b" d="M29 36h6v10h-6zM21 58v-6a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v6z"/></svg><b>' + f.year + '</b><small>' + f.score.split(' ')[0] + '</small></button>');
    });
    flush(); yc.innerHTML = html; yc.classList.add('fin-ribbon');
    var act = $('.fin-node.active', yc); if (act && act.scrollIntoView) setTimeout(function () { yc.scrollLeft = yc.scrollWidth; }, 50);
    // дополнение карточки финала: прогресс «n из 15»
    function decorate() {
      if (!info || $('.yi-prog', info)) return; var big = $('.big', info); if (!big) return;
      var y = +big.textContent, n = F.map(function (f) { return f.year; }).indexOf(y) + 1; if (!n) return;
      var d = document.createElement('div'); d.className = 'yi-prog'; d.innerHTML = '<i><u style="--p:' + (n / F.length * 100).toFixed(1) + '%"></u></i><span>' + n + ' из ' + F.length + '</span>';
      info.lastElementChild.appendChild(d);
    }
    new MutationObserver(function () { decorate(); }).observe(info, { childList: true }); decorate();
    yc.addEventListener('click', function (e) { var b = e.target.closest('.fin-node'); if (b && b.scrollIntoView) b.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'center', block: 'nearest' }); });
  }
})();

;
/* ======== about-polish ======== */
(function () {
  var sec = document.getElementById('about'); if (!sec) return;
  var $ = function (q, r) { return (r || document).querySelector(q); }, $$ = function (q, r) { return Array.prototype.slice.call((r || document).querySelectorAll(q)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var go = function (h) { location.hash = h; };

  // заметка под счётчиками
  var cn = document.getElementById('aboutCounters');
  if (cn && !$('.ab-note', sec)) { var n = document.createElement('p'); n.className = 'muted small ab-note'; n.textContent = 'Цифры считаются из данных сайта прямо в браузере'; cn.parentNode.insertBefore(n, cn.nextSibling); }

  // --- схема «Как это устроено»
  var flow = $('.flow', sec);
  if (flow) {
    var steps = $$('.flow-step', flow), arrows = $$('.flow-arrow', flow);
    var info = [
      ['Все новости, матчи, таблица и трофеи — обычные списки в data.js, карточки игроков — в profiles.js. Меняете цифру — обновляется весь сайт.', ['data.js', 'profiles.js', 'crest.js']],
      ['Скрипт читает данные и строит разделы, графики на SVG, поиск, календарь и анимации. Фреймворков нет.', ['app.js']],
      ['Цветовые переменные, три темы оформления, стеклянные панели, адаптивность и печатная версия.', ['style.css']],
      ['Тексты подменяются на лету: русский, английский или испанский. Выбор запоминается в браузере.', ['lang.js']]
    ];
    var det = document.createElement('div'); det.className = 'flow-detail panel reveal'; det.setAttribute('aria-live', 'polite');
    det.innerHTML = '<p></p><div class="fd-chips"></div>'; flow.parentNode.insertBefore(det, flow.nextSibling);
    var cur = -1, user = false, timer = null;
    function set(i) {
      cur = i;
      steps.forEach(function (st, k) { st.classList.toggle('lit', k === i); st.classList.toggle('done', k < i); st.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      arrows.forEach(function (ar, k) { ar.classList.toggle('lit', k < i); });
      det.querySelector('p').textContent = info[i][0];
      det.querySelector('.fd-chips').innerHTML = info[i][1].map(function (f) { return '<code>' + f + '</code>'; }).join('');
    }
    steps.forEach(function (st, i) { st.tabIndex = 0; st.setAttribute('role', 'button'); st.addEventListener('click', function () { user = true; clearInterval(timer); set(i); }); st.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); st.click(); } }); });
    set(0);
    if (!reduce && 'IntersectionObserver' in window) new IntersectionObserver(function (en) {
      if (en[0].isIntersecting && !user) { clearInterval(timer); timer = setInterval(function () { if (!sec.classList.contains('active')) return; set((cur + 1) % steps.length); }, 2600); } else clearInterval(timer);
    }, { threshold: .5 }).observe(flow);
    try { observeReveal(sec); } catch (e) { det.classList.add('in'); }
  }

  // --- карточки технологий: подсветка за курсором
  $$('.about-cards .panel', sec).forEach(function (p) { p.addEventListener('pointermove', function (e) { var r = p.getBoundingClientRect(); p.style.setProperty('--mx', (e.clientX - r.left) + 'px'); p.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // --- возможности: ссылки на разделы
  var ft = $('.feat-grid', sec);
  if (ft) {
    var T = [['#matches', '⚽'], ['#matches', '⏱'], ['#data-lab', '📊'], ['#squad', '⇄'], ['#matches', '🏆'], ['@search', '🔍'], ['#squad', '★'], ['#matches', '📅'], ['@theme', '◐'], [null, '🖨']];
    $$('li', ft).forEach(function (li, i) {
      var t = T[i]; if (!t) return; var txt = li.textContent;
      li.innerHTML = '<span class="ft-ic" aria-hidden="true">' + t[1] + '</span><span class="ft-tx"></span>' + (t[0] ? '<i class="ft-go" aria-hidden="true">→</i>' : '');
      li.querySelector('.ft-tx').textContent = txt; li.classList.add('ft');
      if (t[0]) { li.tabIndex = 0; li.setAttribute('role', 'link'); li.classList.add('lnk');
        var act = function () { if (t[0] === '@search') document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })); else if (t[0] === '@theme') { var b = document.getElementById('themeBtn'); if (b) { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); b.click(); } } else go(t[0]); };
        li.addEventListener('click', act); li.addEventListener('keydown', function (e) { if (e.key === 'Enter') act(); }); }
    });
  }

  // --- файлы проекта: раскрывающиеся строки
  var fl = $('dl.files:not(.keys)', sec);
  if (fl) {
    var D2 = { 'index.html': 'Разметка всех разделов; сюда подключаются остальные файлы.', 'style.css': 'Цвета, сетки, анимации, светлая тема и печатная версия.', 'data.js': 'Новости, матчи, таблица, трофеи, стадион — цифры правят здесь.', 'profiles.js': 'Позиция, номер, возраст и статистика игроков; список фото.', 'app.js': 'Логика всех разделов: переходы, поиск, графики, календарь.', 'crest.js': 'Герб клуба, закодированный прямо в коде.', 'lang.js': 'Словари английского и испанского и движок перевода.' };
    var ul = document.createElement('ul'); ul.className = 'flist';
    $$('dt', fl).forEach(function (dt) {
      var dd = dt.nextElementSibling, name = dt.textContent, li = document.createElement('li');
      li.innerHTML = '<button type="button" class="fl-row" aria-expanded="false"><code></code><span class="fl-d"></span><i aria-hidden="true">＋</i></button><p class="fl-more"></p>';
      li.querySelector('code').textContent = name; li.querySelector('.fl-d').textContent = dd.textContent; li.querySelector('.fl-more').textContent = D2[name] || '';
      ul.appendChild(li);
    });
    fl.parentNode.replaceChild(ul, fl);
    ul.addEventListener('click', function (e) { var b = e.target.closest('.fl-row'); if (!b) return; var li = b.parentNode, open = !li.classList.contains('open');
      $$('li.open', ul).forEach(function (x) { x.classList.remove('open'); x.querySelector('.fl-row').setAttribute('aria-expanded', 'false'); x.querySelector('i').textContent = '＋'; });
      if (open) { li.classList.add('open'); b.setAttribute('aria-expanded', 'true'); b.querySelector('i').textContent = '−'; } });
  }

  // --- горячие клавиши: подсветка при нажатии, клик по поиску
  var kd = $('dl.keys', sec);
  if (kd) {
    var rows = $$('dt', kd), tip = document.createElement('p'); tip.className = 'muted small hk-tip'; tip.textContent = 'Нажмите клавишу — она подсветится'; kd.parentNode.insertBefore(tip, kd);
    rows.forEach(function (dt, i) { dt.classList.add('hk'); if (i < 2) { dt.tabIndex = 0; dt.setAttribute('role', 'button'); dt.classList.add('btn-k');
      dt.addEventListener('click', function () { document.dispatchEvent(new KeyboardEvent('keydown', { key: i ? '/' : 'k', ctrlKey: !i, bubbles: true })); });
      dt.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.stopPropagation(); dt.click(); } }); } });
    function lit(i) { var d = rows[i]; if (!d) return; d.classList.add('press'); clearTimeout(d._t); d._t = setTimeout(function () { d.classList.remove('press'); }, 450); }
    document.addEventListener('keydown', function (e) { if (!sec.classList.contains('active')) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') lit(0); else if (e.key === '/') lit(1); else if (e.key === 'Escape') lit(2); }, true);
  }
})();

;
/* ======== lab-polish ======== */
(function () {
  var D = window.SITE, sec = document.getElementById('data-lab'); if (!sec || !D) return;
  var $ = function (q, r) { return (r || document).querySelector(q); }, $$ = function (q, r) { return Array.prototype.slice.call((r || document).querySelectorAll(q)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COL = { GK: '#e6c44f', DF: '#5b8bf0', MF: '#3fb08a', FW: '#e2563f' };
  var pcard = $('.pcard', sec), sel = $('#labPlayer'), name = $('#pcName');

  // --- карточка в стиле FIFA
  if (pcard && sel && name) {
    pcard.classList.add('fifa-card');
    var shine = document.createElement('span'); shine.className = 'fc-shine'; shine.setAttribute('aria-hidden', 'true'); pcard.appendChild(shine);
    var ghost = document.createElement('span'); ghost.className = 'fc-ghost'; ghost.setAttribute('aria-hidden', 'true'); pcard.insertBefore(ghost, pcard.firstChild);
    var upd = function () {
      var p = D.players.find(function (x) { return x.id === +sel.value; }); if (!p) return;
      pcard.style.setProperty('--pc', COL[p.pos] || '#d4af37'); pcard.dataset.pos = p.pos;
      ghost.textContent = $('#pcNum').textContent;
      if (reduce) return; pcard.classList.remove('swap'); void pcard.offsetWidth; pcard.classList.add('swap');
    };
    new MutationObserver(upd).observe(name, { childList: true, characterData: true, subtree: true }); upd();
    if (!reduce) {
      pcard.addEventListener('pointermove', function (e) { var r = pcard.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        pcard.style.setProperty('--rx', ((.5 - y) * 4).toFixed(2) + 'deg'); pcard.style.setProperty('--ry', ((x - .5) * 6).toFixed(2) + 'deg'); pcard.style.setProperty('--sx', (x * 100).toFixed(0) + '%'); });
      pcard.addEventListener('pointerleave', function () { pcard.style.setProperty('--rx', '0deg'); pcard.style.setProperty('--ry', '0deg'); });
    }
  }

  // --- плавный набор чисел в показателях
  function count(el) {
    var t = el.textContent.trim(), m = t.match(/^(\D*?)(-?\d+(?:[.,]\d+)?)(.*)$/); if (!m || reduce) return;
    var dec = (m[2].split(/[.,]/)[1] || '').length, sep = m[2].indexOf(',') > -1 ? ',' : '.', to = parseFloat(m[2].replace(',', '.')), t0 = performance.now();
    (function step(x) { var k = Math.min(1, (x - t0) / 900), v = to * (1 - Math.pow(1 - k, 3)); var s = dec ? v.toFixed(dec).replace('.', sep) : String(Math.round(v)); el.textContent = m[1] + s + m[3]; if (k < 1) requestAnimationFrame(step); else el.textContent = t; })(t0);
  }
  var stats = $('#labStats');
  if (stats) new MutationObserver(function () { if (stats._busy) return; stats._busy = true;
    $$('.stat-tile:not(.empty) b', stats).forEach(function (b, i) { setTimeout(function () { count(b); }, i * 40); });
    setTimeout(function () { stats._busy = false; }, 60); }).observe(stats, { childList: true });

  // --- клубные графики: подсказка и подсветка
  var area = $('#chartArea'); if (!area) return;
  var tip = document.createElement('div'); tip.className = 'ch-tip'; tip.hidden = true; var host = area.parentNode; host.style.position = 'relative'; host.appendChild(tip);
  function show(el, txt, e) { var r = host.getBoundingClientRect(); tip.innerHTML = txt; tip.hidden = false; var x = e.clientX - r.left, y = e.clientY - r.top;
    tip.style.left = Math.min(Math.max(x, 60), r.width - 60) + 'px'; tip.style.top = (y - 14) + 'px'; }
  var plural = function (n, a, b, c) { var m = n % 100, k = n % 10; return m > 10 && m < 20 ? c : k === 1 ? a : k > 1 && k < 5 ? b : c; };
  area.addEventListener('pointermove', function (e) {
    var vb = e.target.closest('.vbar'), hb = e.target.closest('.hbar'), ci = e.target.closest('.line-svg circle');
    $$('.hot', area).forEach(function (x) { x.classList.remove('hot'); });
    if (vb) { var i = $$('.vbar', area).indexOf(vb), lab = $$('.vlabels span', area)[i], n = +$('em', vb).textContent; vb.classList.add('hot'); area.classList.add('dim'); show(vb, '<b></b>: <i>' + n + '</i> <span>' + plural(n, 'победа', 'победы', 'побед') + '</span>', e); $('b', tip).textContent = lab.textContent; }
    else if (hb) { hb.classList.add('hot'); area.classList.add('dim'); var s = $('span', hb).textContent, g = $('b', hb).textContent; show(hb, '<b></b>: <i>' + g + '</i> <span>' + plural(+g, 'гол', 'гола', 'голов') + '</span>', e); $('b', tip).textContent = s; }
    else if (ci) { var t = $('title', ci); ci.classList.add('hot'); area.classList.add('dim'); if (t) var mm = t.textContent.match(/^(\d+): (\d+)$/); if (mm) show(ci, '<b>' + mm[1] + '</b> · <span>титул №</span><i>' + mm[2] + '</i>', e); }
    else { area.classList.remove('dim'); tip.hidden = true; }
  });
  area.addEventListener('pointerleave', function () { area.classList.remove('dim'); tip.hidden = true; $$('.hot', area).forEach(function (x) { x.classList.remove('hot'); }); });
  // числа над столбцами и у бомбардиров набираются
  new MutationObserver(function (ms) { if (area._b) return; area._b = true;
    $$('.vbar em, .hbar b', area).forEach(function (el) { var to = +el.textContent; if (!to || reduce) return; var t0 = performance.now(); (function s(x) { var k = Math.min(1, (x - t0) / 1000); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(s); })(t0); });
    setTimeout(function () { area._b = false; }, 80); }).observe(area, { childList: true });
})();
