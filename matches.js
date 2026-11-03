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
    items.push(`<span class="tk"><b>Победы в Лиге чемпионов</b><span>3 из 3</span></span>`);
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
          <div><b>${s.w}</b><span>побед</span></div><div><b>${s.l}</b><span>поражения</span></div>
          <div><b>${s.gf}:${s.ga}</b><span>мячи</span></div><div><b>${s.cs}</b><span>«сухих» матчей</span></div>
        </div>
        <a class="btn btn-ghost hw-link" href="#matches">Подробнее в матч-центре →</a>
      </div>
      <div class="panel hw">
        <h3>Бомбардиры Реала в Ла Лиге</h3>
        <div class="hbars">${top.map(p => `
          <div class="hbar"><span>${p.name}</span><span class="track"><i class="fill" style="width:${p.goals / mx * 100}%"></i></span><b>${p.goals}</b></div>`).join('')}</div>
        <p class="muted small">Голы после 10 туров (LaLiga) и мячи матча 1 ноября.</p>
      </div>`;
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
