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
