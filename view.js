/* Настройки вида: тема (тёмная / светлая / «День матча»), плотность карточек, размер шрифта.
   Всё хранится в localStorage (rm-theme, rm-skin, rm-density, rm-font). */
(function () {
  'use strict';
  var root = document.documentElement;
  var get = function (k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
  var set = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  var DEF = { skin: 'dark', density: 'large', font: 'm', sfx: 'off' };
  var FONT = { s: 0.92, m: 1, l: 1.12 };

  function apply(kind, v) {
    if (kind === 'skin') {
      root.dataset.theme = v === 'dark' ? 'dark' : 'light';
      if (v === 'matchday') root.dataset.skin = 'matchday'; else delete root.dataset.skin;
      set('rm-theme', root.dataset.theme); set('rm-skin', v);
    } else if (kind === 'density') {
      root.dataset.density = v; set('rm-density', v);
    } else if (kind === 'sfx') {
      root.dataset.sfx = v; set('rm-sfx', v);
    } else if (kind === 'font') {
      root.style.setProperty('--fs', FONT[v] || 1); root.dataset.font = v; set('rm-font', v);
    }
    mark(kind, v);
  }

  /* смена темы: «круговая волна» от нажатой кнопки (View Transitions API) */
  function reveal(from, fn) {
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm) { fn(); return; }
    if (!document.startViewTransition) {
      /* запасной вариант для браузеров без View Transitions: плавное «затемнение» и обратно */
      var veil = document.createElement('div'); veil.className = 'theme-veil'; document.body.appendChild(veil);
      requestAnimationFrame(function () { veil.classList.add('on'); });
      setTimeout(function () { fn(); veil.classList.remove('on'); setTimeout(function () { veil.remove(); }, 520); }, 260);
      return;
    }
    var r = from.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add('theme-vt');
    var t = document.startViewTransition(fn);
    t.ready.then(function () {
      root.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + rad + 'px at ' + x + 'px ' + y + 'px)'] }, { duration: 800, easing: 'cubic-bezier(.22,.8,.24,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(function () {});
    t.finished.then(function () { root.classList.remove('theme-vt'); }, function () { root.classList.remove('theme-vt'); });
  }

  var panel = document.getElementById('viewPanel'), btn = document.getElementById('themeBtn');
  function mark(kind, v) {
    if (!panel) return;
    panel.querySelectorAll('[data-vp="' + kind + '"] button').forEach(function (b) {
      var on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
    });
  }

  /* сохранённые значения (тема из старой версии: rm-theme без rm-skin) */
  var theme = get('rm-theme', ''), skin = get('rm-skin', theme === 'light' ? 'light' : 'dark');
  if (theme === 'dark') skin = 'dark';
  apply('skin', skin);
  apply('density', get('rm-density', DEF.density));
  apply('font', get('rm-font', DEF.font));
  apply('sfx', get('rm-sfx', DEF.sfx));

  if (panel && btn) {
    var close = function () { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', function (e) { e.stopPropagation(); panel.hidden = !panel.hidden; btn.setAttribute('aria-expanded', String(!panel.hidden)); });
    panel.addEventListener('click', function (e) {
      e.stopPropagation();
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-vp-reset')) { apply('skin', DEF.skin); apply('density', DEF.density); apply('font', DEF.font); apply('sfx', DEF.sfx); return; }
      var row = b.closest('[data-vp]');
      if (row && row.dataset.vp === 'skin') reveal(b, function () { apply('skin', b.dataset.v); });
      else if (row) apply(row.dataset.vp, b.dataset.v);
    });
    document.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* подпись для печатной версии */
  var main = document.querySelector('main.content');
  if (main) main.setAttribute('data-print', (window.tr ? tr('Real Madrid — неофициальный фан-сайт') : 'Real Madrid') + ' · ' + (window.SITE && window.SITE.asOf ? (window.tr ? tr(window.SITE.asOf) : window.SITE.asOf) : ''));

  /* плавные переходы между вкладками (View Transitions API) */
})();
