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
