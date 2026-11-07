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
    var va = AXES.map(function (x) { return per90(pa, x[1]); }), vb = AXES.map(function (x) { return per90(pb, x[1]); });
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
      tblMode = m; wrap.hidden = m === 'chart'; chart.hidden = m !== 'chart';
      $$('button', sw).forEach(function (b) { var on = b.dataset.m === m; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
      if (m === 'chart') { chart.classList.remove('on'); requestAnimationFrame(function () { requestAnimationFrame(function () { chart.classList.add('on'); }); }); }
    }
    sw.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) apply(b.dataset.m); });
    apply(tblMode);
  }
  var pane = document.getElementById('mcTable');
  if (pane) { new MutationObserver(function () { if ($('.lg-wrap', pane) && !$('.vz-switch', pane)) decorateTable(); }).observe(pane, { childList: true }); decorateTable(); }

  /* ---------- 5. шкала голов на странице матча ---------- */
  function minute(s) { var m = /^(\d+)(?:\+(\d+))?/.exec(s || ''); return m ? +m[1] + (m[2] ? +m[2] * 0.6 : 0) : null; }
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

  watchCompare();
})();
