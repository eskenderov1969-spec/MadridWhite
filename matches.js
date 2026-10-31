// Матч-центр (календарь с обратным отсчётом, результаты, таблица Ла Лиги, страница матча) и трансферы.
// Данные — в data.js: upcoming, results, league, matchInfo, transfers.
(function () {
  const POS = { GK: 'Вратарь', DF: 'Защитник', MF: 'Полузащитник', FW: 'Нападающий' };
  const fmtLong = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const fmtDay = new Intl.DateTimeFormat('ru-RU', { day: 'numeric' });
  const fmtMon = new Intl.DateTimeFormat('ru-RU', { month: 'short' });
  const fmtWd = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });
  const fmtTime = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const day = s => new Date(s + 'T12:00:00');
  const crest = () => (window.CREST
    ? `<img src="${window.CREST}" alt="" onerror="this.outerHTML='<b>RM</b>'">` : '<b>RM</b>');
  const initials = n => n.replace(/[^А-Яа-яA-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
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
      ${compact ? '<a class="btn btn-gold nm-btn" href="#matches">Матч-центр <span aria-hidden="true">→</span></a>' : ''}`;
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
    $('#mcCal').innerHTML = list.length ? `<div class="mrows">${list.map((m, i) => `
      <div class="mrow reveal" style="--d:${Math.min(i, 6) * 0.05}s">
        ${dateBlock(m.date)}
        <div class="mr-main"><span class="mr-comp">${m.comp}</span>
          <strong>${m.venue === 'дома' ? 'Реал Мадрид — ' + m.opp : m.opp + ' — Реал Мадрид'}</strong></div>
        <span class="mr-venue">${m.venue}</span>
        <span class="mr-time">${m.kickoff ? fmtTime.format(new Date(m.kickoff)) : 'время уточняется'}</span>
      </div>`).join('')}</div>
      <p class="muted small">Список неполный: известны матчи Лиги чемпионов и ближайший тур Ла Лиги. Время начала — по вашему часовому поясу.</p>`
      : '<p class="muted empty">Ближайших матчей в списке нет.</p>';
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
  function renderTable() {
    const T = D.league.table;
    const zone = i => (i < 4 ? 'z-cl' : i < 6 ? 'z-el' : i >= T.length - 3 ? 'z-rel' : '');
    $('#mcTable').innerHTML = `
      <p class="muted small">Ла Лига 2026/27, ${D.league.asOf}.</p>
      <div class="table-wrap">
        <table class="table lg-table">
          <thead><tr><th>#</th><th>Команда</th><th title="Матчи">И</th><th title="Победы">В</th><th title="Ничьи">Н</th><th title="Поражения">П</th><th title="Забито — пропущено">Мячи</th><th title="Разница">±</th><th title="Очки">О</th></tr></thead>
          <tbody>${T.map((t, i) => `
            <tr class="${zone(i)}${t.me ? ' me' : ''}"><td>${i + 1}</td><td>${t.team}</td><td>${t.p}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td>
            <td>${t.gf}–${t.ga}</td><td>${t.gf - t.ga > 0 ? '+' : ''}${t.gf - t.ga}</td><td><b>${t.pts}</b></td></tr>`).join('')}</tbody>
        </table>
      </div>
      <div class="lg-legend"><span><i class="z-cl"></i>Лига чемпионов</span><span><i class="z-el"></i>Лига Европы</span><span><i class="z-rel"></i>Зона вылета</span></div>
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
      <li class="${g.side}"><span class="g-min">${g.min}</span><span class="g-ball" aria-hidden="true">⚽</span><b>${g.name}</b><small>${g.side === 'real' ? 'Реал Мадрид' : r.opp}</small></li>`).join('');
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

  // ---------- События ----------
  $('#mcTabs').addEventListener('click', e => {
    const b = e.target.closest('.tab'); if (!b) return;
    $$('#mcTabs .tab').forEach(x => x.classList.toggle('active', x === b));
    ['cal', 'res', 'table'].forEach(k => { $('#mc' + k[0].toUpperCase() + k.slice(1)).hidden = k !== b.dataset.tab; });
    observeReveal($('#matches'));
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
  renderNext(); renderCal(); renderRes(); renderTable(); renderTransfers();
  if (location.hash.startsWith('#match/')) renderMatch();
})();
