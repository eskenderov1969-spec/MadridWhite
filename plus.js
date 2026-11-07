/* Ещё больше возможностей: баннер «Сегодня матч», вращающиеся факты в герое, подиум бомбардиров,
   салют после побед, подсказка по клавишам (?), быстрые переходы (g + буква), кольцо-курсор, параллакс. */
(function () {
  'use strict';
  var D = window.SITE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var T = function (x) { return window.tr ? window.tr(x) : x; };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var LOC = window.LOCALE || 'ru-RU';
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  /* ---------- 1. баннер «Сегодня матч» ---------- */
  (function () {
    var el = document.getElementById('mdBanner'); if (!el) return;
    var up = D.upcoming.filter(function (u) { return u.kickoff; }).sort(function (a, b) { return a.kickoff.localeCompare(b.kickoff); })[0];
    if (!up) return;
    var k = new Date(up.kickoff), tf = new Intl.DateTimeFormat(LOC, { hour: '2-digit', minute: '2-digit' });
    var teams = up.venue === 'дома' ? 'Реал Мадрид — ' + up.opp : up.opp + ' — Реал Мадрид';
    el.innerHTML = '<span class="md-dot" aria-hidden="true"></span><b class="md-t"></b><span class="md-teams">' + teams + '</span>' +
      '<span class="md-time">' + tf.format(k) + '</span><small>по вашему времени</small><span class="md-cd"></span>';
    var t = $('.md-t', el), cd = $('.md-cd', el);
    function upd() {
      var now = new Date(), same = now.toDateString() === k.toDateString(), diff = k - now;
      if (!same || diff < -3 * 3600e3) { el.hidden = true; return; }
      el.hidden = false;
      if (diff > 0) {
        var s = Math.floor(diff / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
        t.textContent = T('Сегодня матч'); cd.innerHTML = '<small>Начало через</small> <b>' + pad(h) + ':' + pad(m) + ':' + pad(s % 60) + '</b>';
      } else { t.textContent = T('Матч начался'); cd.innerHTML = ''; }
    }
    upd(); setInterval(upd, 1000);
  })();

  /* ---------- 2. факты в главном экране ---------- */
  (function () {
    var el = document.getElementById('heroFacts'); if (!el || !D.now) return;
    var list = D.now.filter(function (x) { return !/Президент|Вице/.test(x.k); }).map(function (x) { return T(x.k) + ': ' + T(x.v); });
    if (!list.length) return;
    var i = 0;
    function show() { el.classList.remove('in'); void el.offsetWidth; el.textContent = list[i % list.length]; el.classList.add('in'); i++; }
    show(); if (!reduce) setInterval(show, 3600);
  })();

  /* ---------- 3. подиум бомбардиров ---------- */
  (function () {
    var box = document.getElementById('podium'); if (!box || !window.RM_TOP) return;
    var top = window.RM_TOP().slice(0, 3); if (top.length < 3) { box.hidden = true; return; }
    var max = top[0].goals || 1, order = [1, 0, 2];
    box.innerHTML = '<h3>Подиум бомбардиров</h3><div class="pd-stage">' + order.map(function (i) {
      var p = top[i];
      return '<div class="pd-col p' + (i + 1) + '"><b class="pd-name">' + p.name + '</b><div class="pd-bar" style="--k:' + Math.max(.42, p.goals / max).toFixed(3) + '"><span class="pd-rank">' + (i + 1) + '</span><strong>' + p.goals + '</strong></div></div>';
    }).join('') + '</div><p class="muted small">Голы после 10 туров (LaLiga) и мячи матча 1 ноября.</p>';
  })();

  /* ---------- 4. салют после победы ---------- */
  function confetti() {
    if (reduce) return;
    var cv = document.createElement('canvas'); cv.className = 'confetti'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
    var ctx = cv.getContext('2d'), W = cv.width = innerWidth, H = cv.height = innerHeight;
    var cols = ['#d4af37', '#f0dc8e', '#ffffff', '#3b63c9', '#8fa8ee'], ps = [];
    for (var i = 0; i < 160; i++) ps.push({ x: W / 2 + (Math.random() - .5) * 200, y: H * .35, vx: (Math.random() - .5) * 15, vy: -Math.random() * 14 - 4, w: Math.random() * 8 + 4, h: Math.random() * 5 + 3, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: cols[i % cols.length] });
    var t0 = performance.now();
    (function f(t) {
      var k = (t - t0) / 3200; ctx.clearRect(0, 0, W, H);
      ps.forEach(function (p) { p.vy += .34; p.vx *= .992; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.globalAlpha = Math.max(0, 1 - k * k); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); });
      if (k < 1) requestAnimationFrame(f); else cv.remove();
    })(t0);
  }
  var mp = document.getElementById('matchPage');
  if (mp) new MutationObserver(function () {
    var acts = $('.mp-actions', mp); if (!acts || $('.fx-btn', acts) || !$('.res-badge.win', mp)) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-outline fx-btn'; b.textContent = '🎉 Салют';
    b.addEventListener('click', confetti); acts.appendChild(b);
    var key = 'fx-' + location.hash, seen = false;
    try { seen = sessionStorage.getItem(key) === '1'; sessionStorage.setItem(key, '1'); } catch (e) {}
    if (!seen) setTimeout(confetti, 500);
  }).observe(mp, { childList: true });

  /* ---------- 5. быстрые переходы и подсказка по клавишам ---------- */
  var GO = [['n', 'news', 'Новости'], ['c', 'club', 'Клуб'], ['s', 'squad', 'Состав'], ['m', 'matches', 'Матчи'], ['t', 'transfers', 'Трансферы'],
            ['d', 'stadium', 'Стадион'], ['h', 'history', 'История'], ['r', 'trophies', 'Трофеи'], ['l', 'data-lab', 'Лаборатория данных'], ['a', 'about', 'О проекте']];
  var help = document.createElement('dialog'); help.className = 'kbd-help'; help.setAttribute('aria-label', 'Горячие клавиши');
  help.innerHTML = '<h3>Горячие клавиши</h3><dl class="files keys"><dt><kbd>Ctrl</kbd> + <kbd>K</kbd></dt><dd>открыть поиск</dd>' +
    '<dt><kbd>?</kbd></dt><dd>показать все сочетания клавиш</dd>' +
    GO.map(function (g) { return '<dt><kbd>g</kbd> <kbd>' + g[0] + '</kbd></dt><dd>' + g[2] + '</dd>'; }).join('') +
    '</dl><button type="button" class="btn btn-outline kh-close">Закрыть</button>';
  document.body.appendChild(help);
  help.addEventListener('click', function (e) { if (e.target === help || e.target.closest('.kh-close')) help.close(); });
  var armed = 0;
  document.addEventListener('keydown', function (e) {
    var el = e.target, typing = el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
    if (typing || e.ctrlKey || e.metaKey || e.altKey || document.querySelector('dialog[open]')) return;
    if (e.key === '?') { e.preventDefault(); if (help.showModal) help.showModal(); return; }
    if (armed && Date.now() - armed < 1400) {
      var g = GO.filter(function (x) { return x[0] === e.key.toLowerCase(); })[0]; armed = 0;
      if (g) { e.preventDefault(); location.hash = '#' + g[1]; } return;
    }
    if (e.key.toLowerCase() === 'g') armed = Date.now();
  });

  /* ---------- 6. кольцо-курсор и параллакс ---------- */
  if (fine && !reduce) {
    var ring = document.createElement('div'), dot = document.createElement('div');
    ring.className = 'cur-ring'; dot.className = 'cur-dot'; ring.setAttribute('aria-hidden', 'true'); dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring); document.body.appendChild(dot);
    var tx = -100, ty = -100, rx = -100, ry = -100, on = false;
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return; tx = e.clientX; ty = e.clientY; dot.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
      if (!on) { on = true; document.documentElement.classList.add('has-cur'); rx = tx; ry = ty; }
      ring.classList.toggle('big', !!(e.target.closest && e.target.closest('a, button, select, input, .card, .rb-card, .tab, .chip, [role="button"]')));
    });
    document.addEventListener('pointerleave', function () { document.documentElement.classList.remove('has-cur'); on = false; });
    (function loop() { rx += (tx - rx) * .18; ry += (ty - ry) * .18; ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)'; requestAnimationFrame(loop); })();
  }
  var hero = $('.hero'), pt = false;
  if (hero && !reduce) window.addEventListener('scroll', function () {
    if (pt) return; pt = true;
    requestAnimationFrame(function () { hero.style.setProperty('--sy', Math.min(window.scrollY, 900)); pt = false; });
  }, { passive: true });
})();
