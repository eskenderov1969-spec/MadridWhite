// Поиск по сайту (Ctrl+K или «/»): разделы, игроки, матчи, новости, трансферы.
(function () {
  const dlg = $('#palette'), input = $('#palInput'), list = $('#palList');
  if (!dlg || typeof dlg.showModal !== 'function') { const b = $('#searchBtn'); if (b) b.hidden = true; return; }
  const POS = { GK: 'вратарь', DF: 'защитник', MF: 'полузащитник', FW: 'нападающий' };
  const dFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
  const day = s => new Date(s + 'T12:00:00');

  // Что умеем искать. go() — куда перейти.
  const fillAndGo = (hash, sel, value) => () => {
    location.hash = hash;
    setTimeout(() => { const el = $(sel); if (el) { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); } }, 60);
  };
  function buildIndex() {
    const idx = [];
    $$('#mainNav a').forEach(a => idx.push({ g: 'Разделы', t: a.textContent.trim(), s: 'Перейти в раздел', hay: a.textContent, go: () => { location.hash = a.getAttribute('href'); } }));
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
      items = INDEX.map(i => { const h = (i.t + ' ' + i.hay).toLowerCase().replace(/ё/g, 'е'); const ok = words.every(w => h.includes(w));
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
