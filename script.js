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
    <button class="card reveal" data-id="${n.id}" style="--d:${Math.min(i, 6) * 0.05}s" type="button">
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
