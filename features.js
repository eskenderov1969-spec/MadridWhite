// Состав, зал трофеев и викторина. Использует D, $, $$, observeReveal из script.js
(function () {
  const POS = { GK: 'Вратарь', DF: 'Защитник', MF: 'Полузащитник', FW: 'Нападающий' };
  const POS_CHIPS = { all: 'Все', GK: 'Вратари', DF: 'Защитники', MF: 'Полузащитники', FW: 'Нападающие' };
  const initials = name => name.split(' ').map(w => w[0]).slice(0, 2).join('');
  const ratio = p => (p.apps ? p.goals / p.apps : 0);
  const fmtN = v => (Number.isInteger(v) ? v : v.toFixed(2));
  const dbl = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  function countUp(el, to, dur = 1200) {
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

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
    list = [...list].sort((a, b) => (s === 'name' ? a.name.localeCompare(b.name, 'ru') : b[s] - a[s]));

    grid.innerHTML = list.map((p, i) => `
      <button class="card player reveal" data-id="${p.id}" style="--d:${Math.min(i, 6) * 0.05}s" type="button">
        <div class="avatar">${initials(p.name)}</div>
        <h3>${p.name}</h3>
        <div class="meta">${POS[p.pos]} · ${p.nat}</div>
        <div class="mini"><span><b>${p.apps}</b> матчей</span><span><b>${p.goals}</b> голов</span></div>
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
    $('#pmStats').innerHTML = statBox(p.apps, 'матчей') + statBox(p.goals, 'голов') + statBox(ratio(p).toFixed(2), 'голов за матч');
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
    const rows = [['Матчей', a.apps, b.apps], ['Голов', a.goals, b.goals], ['Голов за матч', ratio(a), ratio(b)]];

    $('#cmpOut').innerHTML =
      `<div class="cmp-head"><span>${a.name}</span><span>${b.name}</span></div>` +
      rows.map(([label, x, y]) => {
        const m = Math.max(x, y) || 1;
        return `
          <div class="cmp-row">
            <div class="cmp-label">${label}</div>
            <div class="cmp-bars">
              <div class="cmp-side left${x > y ? ' win' : ''}">
                <span class="cmp-track"><i style="--w:${(x / m) * 100}%"></i></span><b>${fmtN(x)}</b>
              </div>
              <div class="cmp-side right${y > x ? ' win' : ''}">
                <b>${fmtN(y)}</b><span class="cmp-track"><i style="--w:${(y / m) * 100}%"></i></span>
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

  // ================= ВИКТОРИНА =================
  const quizEl = $('#quiz');
  const BEST_KEY = 'rm-quiz-best';
  const getBest = () => { try { return +localStorage.getItem(BEST_KEY) || 0; } catch (e) { return 0; } };
  const setBest = v => { try { localStorage.setItem(BEST_KEY, String(v)); } catch (e) {} };
  const shuffle = arr => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const TOTAL = Math.min(10, D.quiz.length);
  let qs = [];
  let qi = 0;
  let score = 0;
  let streak = 0;
  let locked = false;

  function updateBest() {
    const b = getBest();
    $('#bestTag').textContent = b ? `рекорд: ${b} из ${TOTAL}` : 'рекорда пока нет';
  }

  function quizIntro() {
    updateBest();
    quizEl.innerHTML = `
      <div class="q-intro">
        <h3>Проверьте, насколько хорошо вы знаете клуб</h3>
        <p class="muted">${TOTAL} вопросов с вариантами ответов. Подсказка: можно отвечать клавишами 1–4.</p>
        <button class="btn btn-gold" id="quizStart" type="button">Начать</button>
      </div>`;
    $('#quizStart').addEventListener('click', quizStart);
  }

  function quizStart() {
    qs = shuffle(D.quiz).slice(0, TOTAL).map(q => ({
      text: q.q,
      explain: q.explain,
      opts: shuffle(q.options.map((t, i) => ({ t, ok: i === q.answer }))),
    }));
    qi = 0; score = 0; streak = 0;
    renderQuestion();
  }

  function renderQuestion() {
    const q = qs[qi];
    locked = false;
    quizEl.innerHTML = `
      <div class="q-top"><span>Вопрос ${qi + 1} из ${qs.length}</span><span>Счёт: ${score}${streak > 1 ? ` · серия ${streak}` : ''}</span></div>
      <div class="q-bar"><i style="width:${(qi / qs.length) * 100}%"></i></div>
      <h3 class="q-text">${q.text}</h3>
      <div class="q-opts">
        ${q.opts.map((o, i) => `<button class="q-opt" data-i="${i}" type="button"><kbd>${i + 1}</kbd><span>${o.t}</span></button>`).join('')}
      </div>
      <div class="q-feedback" id="qFeedback" hidden></div>
      <div class="q-actions"><button class="btn btn-gold" id="qNext" type="button" hidden>${qi === qs.length - 1 ? 'Результат' : 'Дальше'}</button></div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const bar = $('.q-bar i', quizEl);
      if (bar) bar.style.width = `${((qi + 1) / qs.length) * 100}%`;
    }));
    $('#qNext').addEventListener('click', nextQuestion);
  }

  function answer(i) {
    if (locked) return;
    locked = true;
    const q = qs[qi];
    const ok = q.opts[i].ok;
    if (ok) { score++; streak++; } else { streak = 0; }

    $$('.q-opt', quizEl).forEach((btn, idx) => {
      btn.disabled = true;
      if (q.opts[idx].ok) btn.classList.add('ok');
      else if (idx === i) btn.classList.add('bad');
    });
    const fb = $('#qFeedback');
    fb.hidden = false;
    fb.innerHTML = `<strong>${ok ? 'Верно!' : 'Не совсем.'}</strong> ${q.explain}`;
    $('#qNext').hidden = false;
    $('#qNext').focus({ preventScroll: true });
  }

  function nextQuestion() {
    qi++;
    if (qi >= qs.length) return renderResult();
    renderQuestion();
  }

  function renderResult() {
    const best = getBest();
    const isRecord = score > best;
    if (isRecord) setBest(score);
    updateBest();
    const pct = Math.round((score / qs.length) * 100);
    const rank = score === qs.length ? 'Легенда клуба' : score >= 8 ? 'Знаток' : score >= 5 ? 'Болельщик' : 'Новичок';
    quizEl.innerHTML = `
      <div class="q-result">
        <div class="ring" style="--p:${pct}"><span>${score}/${qs.length}</span></div>
        <h3>${rank}</h3>
        <p class="muted">${isRecord ? 'Новый личный рекорд!' : `Ваш рекорд: ${Math.max(best, score)} из ${qs.length}`}</p>
        <button class="btn btn-gold" id="quizAgain" type="button">Сыграть ещё раз</button>
      </div>`;
    $('#quizAgain').addEventListener('click', quizStart);
  }

  quizEl.addEventListener('click', e => {
    const b = e.target.closest('.q-opt');
    if (b) answer(+b.dataset.i);
  });
  document.addEventListener('keydown', e => {
    if (current !== 'trophies' || locked || !qs.length || qi >= qs.length) return;
    if (!$('.q-opt', quizEl)) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
    const n = +e.key;
    if (n >= 1 && n <= 4 && qs[qi].opts[n - 1]) answer(n - 1);
  });

  // ================= Страницы =================
  function onPage(page) {
    if (page === 'squad') renderCompare();
    if (page === 'trophies') renderTrophies();
  }
  document.addEventListener('pagechange', e => onPage(e.detail));

  // Старт
  renderPlayers();
  renderCompare();
  renderTrophies();
  quizIntro();
  observeReveal($('.view.active'));
})();
