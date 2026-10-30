// Состав, зал трофеев и карточка игрока в лаборатории. Использует D, $, $$, observeReveal из script.js
(function () {
  const POS = { GK: 'Вратарь', DF: 'Защитник', MF: 'Полузащитник', FW: 'Нападающий' };
  const POS_CHIPS = { all: 'Все', GK: 'Вратари', DF: 'Защитники', MF: 'Полузащитники', FW: 'Нападающие' };
  const initials = name => name.split(' ').map(w => w[0]).slice(0, 2).join('');
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
  const grid = $('#players-grid');
  const search = $('#playerSearch');
  const sortSel = $('#playerSort');

  $('#posChips').innerHTML = Object.keys(POS_CHIPS).map((k, i) =>
    `<button class="chip${i === 0 ? ' active' : ''}" data-p="${k}" type="button">${POS_CHIPS[k]}</button>`).join('');

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
      (pos === 'all' || p.pos === pos) && (!q || `${p.name} ${p.nat}`.toLowerCase().includes(q)));
    const s = sortSel.value;
    list = [...list].sort((a, b) => (s === 'name' ? a.name.localeCompare(b.name, 'ru') : (b[s] ?? -1) - (a[s] ?? -1)));

    grid.innerHTML = list.map((p, i) => `
      <button class="card player reveal" data-id="${p.id}" style="--d:${Math.min(i, 6) * 0.05}s" type="button">
        <div class="avatar">${initials(p.name)}</div>
        <h3>${p.name}</h3>
        <div class="meta">${POS[p.pos]} · ${p.nat}</div>
        ${p.years === 'с 2026' ? '<span class="tag tag-new">новичок 2026</span>' : ''}
        <div class="mini"><span><b>${fmtN(p.apps)}</b> матчей</span><span><b>${fmtN(p.goals)}</b> голов</span></div>
      </button>`).join('');
    $('#players-empty').hidden = list.length > 0;
    observeReveal(grid);
  }

  // Окно игрока
  const pm = $('#playerModal');
  let openedId = null;
  const statBox = (v, l) => `<div class="pm-stat"><b>${v}</b><span>${l}</span></div>`;

  grid.addEventListener('click', e => {
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
  const shortName = s => s.replace(/^РБ\s+/, '').slice(0, 3);

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
    let s = typeof u === 'number' ? n.toFixed(u) : Number.isInteger(n) ? n.toLocaleString('ru-RU') : n.toFixed(1);
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
