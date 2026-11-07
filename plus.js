/* Плавность: лёгкий параллакс главного экрана. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 6. кольцо-курсор и параллакс ---------- */
  var hero = $('.hero'), pt = false;
  if (hero && !reduce) window.addEventListener('scroll', function () {
    if (pt) return; pt = true;
    requestAnimationFrame(function () { hero.style.setProperty('--sy', Math.min(window.scrollY, 900)); pt = false; });
  }, { passive: true });
})();
