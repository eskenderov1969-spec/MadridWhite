/* Тактическая доска: схема, перетаскивание игроков, замена из списка состава, стрелки, сохранение и PNG. */
(function () {
  'use strict';
  var D = window.SITE, PR = window.PROFILES || {};
  var box = document.getElementById('board'); if (!box) return;
  var T = function (x) { return window.tr ? window.tr(x) : x; };
  var VW = 210, VH = 136;
  /* координаты в единицах поля (210 × 136), атака слева направо; роль: G вратарь, D защита, M полузащита, F нападение */
  var FORM = {
    '433':  { l: '4-3-3',   p: [[16,68,'G'],[48,22,'D'],[48,50,'D'],[48,86,'D'],[48,114,'D'],[86,36,'M'],[86,68,'M'],[86,100,'M'],[132,24,'F'],[140,68,'F'],[132,112,'F']] },
    '442':  { l: '4-4-2',   p: [[16,68,'G'],[48,22,'D'],[48,50,'D'],[48,86,'D'],[48,114,'D'],[88,24,'M'],[88,52,'M'],[88,84,'M'],[88,112,'M'],[132,50,'F'],[132,86,'F']] },
    '352':  { l: '3-5-2',   p: [[16,68,'G'],[46,34,'D'],[46,68,'D'],[46,102,'D'],[80,16,'M'],[88,42,'M'],[90,68,'M'],[88,94,'M'],[80,120,'M'],[134,50,'F'],[134,86,'F']] },
    '4231': { l: '4-2-3-1', p: [[16,68,'G'],[48,22,'D'],[48,50,'D'],[48,86,'D'],[48,114,'D'],[78,50,'M'],[78,86,'M'],[108,24,'M'],[112,68,'M'],[108,112,'M'],[142,68,'F']] }
  };
  var POSK = { G: 'GK', D: 'DF', M: 'MF', F: 'FW' };
  var POSN = { GK: 'Вратари', DF: 'Защитники', MF: 'Полузащитники', FW: 'Нападающие' };
  var st = { f: '433', slots: [], arrows: [], draw: false, sel: -1 };

  function num(p) { var pr = PR[p.id]; return pr && pr.num != null ? pr.num : p.id; }
  function byId(id) { return D.players.filter(function (p) { return p.id === id; })[0]; }
  function autofill() {
    var used = {}, slots = FORM[st.f].p;
    st.slots = slots.map(function (s) {
      var pos = POSK[s[2]], pool = D.players.filter(function (p) { return p.pos === pos && !used[p.id]; }).sort(function (a, b) { return (b.apps || 0) - (a.apps || 0); });
      var p = pool[0]; if (p) used[p.id] = 1;
      return { x: s[0], y: s[1], pid: p ? p.id : null };
    });
    st.sel = -1;
  }
  function save() { try { localStorage.setItem('rm-board', JSON.stringify({ f: st.f, s: st.slots, a: st.arrows })); } catch (e) {} }
  function load() {
    try {
      var o = JSON.parse(localStorage.getItem('rm-board') || 'null');
      if (o && FORM[o.f] && o.s && o.s.length === 11) { st.f = o.f; st.slots = o.s; st.arrows = o.a || []; return true; }
    } catch (e) {}
    return false;
  }

  /* ---------- разметка ---------- */
  box.innerHTML =
    '<div class="bd-head"><h3>Тактическая доска</h3><p class="muted small">Выберите схему и перетаскивайте игроков. Нажмите на игрока на поле, затем на имя в списке — и он займёт это место. Включите «Стрелки», чтобы рисовать на поле.</p></div>' +
    '<div class="bd-bar">' +
      '<label class="bd-sel"><span>Схема</span><select id="bdForm" class="select">' + Object.keys(FORM).map(function (k) { return '<option value="' + k + '">' + FORM[k].l + '</option>'; }).join('') + '</select></label>' +
      '<button type="button" class="chip" data-act="fill">Подставить состав</button>' +
      '<button type="button" class="chip" data-act="draw" aria-pressed="false">Стрелки</button>' +
      '<button type="button" class="chip" data-act="undo">Отменить стрелку</button>' +
      '<button type="button" class="chip" data-act="clear">Очистить стрелки</button>' +
      '<button type="button" class="chip bd-png" data-act="png">Скачать картинку</button>' +
    '</div>' +
    '<div class="bd-main"><div class="bd-pitch" id="bdPitch">' +
      '<svg class="bd-lines" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="none" aria-hidden="true"><rect width="210" height="136" class="bd-grass"/>' +
        '<g class="bd-ln"><rect x="8" y="8" width="194" height="120"/><line x1="105" y1="8" x2="105" y2="128"/><circle cx="105" cy="68" r="14"/><rect x="8" y="38" width="26" height="60"/><rect x="176" y="38" width="26" height="60"/><rect x="8" y="54" width="9" height="28"/><rect x="193" y="54" width="9" height="28"/></g></svg>' +
      '<svg class="bd-arrows" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="bdHead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#f0dc8e"/></marker></defs><g id="bdArrows"></g></svg>' +
      '<div class="bd-tokens" id="bdTokens"></div></div>' +
    '<aside class="bd-list" id="bdList" aria-label="Состав"></aside></div>' +
    '<p class="muted small">Состав на доске подставляется автоматически из списка игроков и не является прогнозом. Расстановка и стрелки сохраняются в этом браузере.</p>';

  var pitch = document.getElementById('bdPitch'), tokens = document.getElementById('bdTokens'), arrowsG = document.getElementById('bdArrows'), list = document.getElementById('bdList'), sel = document.getElementById('bdForm');

  function render() {
    sel.value = st.f;
    tokens.innerHTML = st.slots.map(function (s, i) {
      var p = s.pid != null ? byId(s.pid) : null;
      return '<button type="button" class="tk' + (i === st.sel ? ' sel' : '') + (FORM[st.f].p[i][2] === 'G' ? ' gk' : '') + '" data-i="' + i + '" style="left:' + (s.x / VW * 100).toFixed(2) + '%;top:' + (s.y / VH * 100).toFixed(2) + '%">' +
        '<b>' + (p ? num(p) : '?') + '</b><span>' + (p ? p.name : '—') + '</span></button>';
    }).join('');
    var placed = {}; st.slots.forEach(function (s) { if (s.pid != null) placed[s.pid] = 1; });
    list.innerHTML = ['GK', 'DF', 'MF', 'FW'].map(function (pos) {
      return '<h4>' + POSN[pos] + '</h4><div class="bd-grp">' + D.players.filter(function (p) { return p.pos === pos; }).map(function (p) {
        return '<button type="button" class="bd-pl' + (placed[p.id] ? ' on' : '') + '" data-p="' + p.id + '"><i>' + num(p) + '</i>' + p.name + '</button>';
      }).join('') + '</div>';
    }).join('');
    drawArrows();
  }
  function drawArrows() {
    arrowsG.innerHTML = st.arrows.map(function (a) { return '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + a[2] + '" y2="' + a[3] + '" marker-end="url(#bdHead)"/>'; }).join('');
  }
  function toUnits(e) { var r = pitch.getBoundingClientRect(); return [Math.max(2, Math.min(VW - 2, (e.clientX - r.left) / r.width * VW)), Math.max(2, Math.min(VH - 2, (e.clientY - r.top) / r.height * VH))]; }

  /* ---------- перетаскивание игроков ---------- */
  var drag = null;
  tokens.addEventListener('pointerdown', function (e) {
    var t = e.target.closest('.tk'); if (!t || st.draw) return;
    drag = { el: t, i: +t.dataset.i, x0: e.clientX, y0: e.clientY, moved: false }; t.setPointerCapture(e.pointerId); t.classList.add('drag');
  });
  tokens.addEventListener('pointermove', function (e) {
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 5) return;
    drag.moved = true; var u = toUnits(e), s = st.slots[drag.i]; s.x = u[0]; s.y = u[1];
    drag.el.style.left = (u[0] / VW * 100) + '%'; drag.el.style.top = (u[1] / VH * 100) + '%';
  });
  function endDrag() {
    if (!drag) return; drag.el.classList.remove('drag');
    if (drag.moved) { save(); } else { st.sel = st.sel === drag.i ? -1 : drag.i; render(); }
    drag = null;
  }
  tokens.addEventListener('pointerup', endDrag); tokens.addEventListener('pointercancel', endDrag);

  /* ---------- замена игрока из списка ---------- */
  list.addEventListener('click', function (e) {
    var b = e.target.closest('.bd-pl'); if (!b) return;
    if (st.sel < 0) { var free = st.slots.findIndex(function (s) { return s.pid == null; }); st.sel = free >= 0 ? free : st.sel; }
    if (st.sel < 0) return;
    var pid = +b.dataset.p, from = st.slots.findIndex(function (s) { return s.pid === pid; }), cur = st.slots[st.sel].pid;
    if (from >= 0 && from !== st.sel) st.slots[from].pid = cur;   // игрок уже на поле — меняем местами
    st.slots[st.sel].pid = pid; save(); render();
  });

  /* ---------- стрелки ---------- */
  var cur = null;
  pitch.addEventListener('pointerdown', function (e) {
    if (!st.draw) return; e.preventDefault();
    var u = toUnits(e); cur = [u[0], u[1], u[0], u[1]]; st.arrows.push(cur); pitch.setPointerCapture(e.pointerId); drawArrows();
  });
  pitch.addEventListener('pointermove', function (e) { if (!cur) return; var u = toUnits(e); cur[2] = u[0]; cur[3] = u[1]; drawArrows(); });
  function endArrow() {
    if (!cur) return;
    if (Math.hypot(cur[2] - cur[0], cur[3] - cur[1]) < 4) st.arrows.pop(); else cur.forEach(function (v, i) { cur[i] = +v.toFixed(1); });
    cur = null; save(); drawArrows();
  }
  pitch.addEventListener('pointerup', endArrow); pitch.addEventListener('pointercancel', endArrow);

  /* ---------- кнопки ---------- */
  box.querySelector('.bd-bar').addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return; var a = b.dataset.act;
    if (a === 'fill') { autofill(); save(); render(); }
    else if (a === 'draw') { st.draw = !st.draw; b.setAttribute('aria-pressed', String(st.draw)); b.classList.toggle('active', st.draw); pitch.classList.toggle('drawing', st.draw); }
    else if (a === 'undo') { st.arrows.pop(); save(); drawArrows(); }
    else if (a === 'clear') { st.arrows = []; save(); drawArrows(); }
    else if (a === 'png') png();
  });
  sel.addEventListener('change', function () { st.f = sel.value; autofill(); save(); render(); });

  /* ---------- картинка PNG ---------- */
  function png() {
    var k = 6, W = VW * k, H = VH * k + 70, c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d');
    var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#14502f'); g.addColorStop(1, '#0d3a22'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (var i = 0; i < 8; i++) { x.fillStyle = i % 2 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,0)'; x.fillRect(i * W / 8, 0, W / 8, VH * k); }
    x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 2.4;
    var R = function (a, b, w, h) { x.strokeRect(a * k, b * k, w * k, h * k); };
    R(8, 8, 194, 120); R(8, 38, 26, 60); R(176, 38, 26, 60); R(8, 54, 9, 28); R(193, 54, 9, 28);
    x.beginPath(); x.moveTo(105 * k, 8 * k); x.lineTo(105 * k, 128 * k); x.stroke(); x.beginPath(); x.arc(105 * k, 68 * k, 14 * k, 0, 6.283); x.stroke();
    x.strokeStyle = '#f0dc8e'; x.fillStyle = '#f0dc8e'; x.lineWidth = 4; x.lineCap = 'round';
    st.arrows.forEach(function (a) {
      var x1 = a[0] * k, y1 = a[1] * k, x2 = a[2] * k, y2 = a[3] * k, ang = Math.atan2(y2 - y1, x2 - x1);
      x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2 - Math.cos(ang) * 12, y2 - Math.sin(ang) * 12); x.stroke();
      x.beginPath(); x.moveTo(x2, y2); x.lineTo(x2 - 18 * Math.cos(ang - .45), y2 - 18 * Math.sin(ang - .45)); x.lineTo(x2 - 18 * Math.cos(ang + .45), y2 - 18 * Math.sin(ang + .45)); x.closePath(); x.fill();
    });
    st.slots.forEach(function (s, i) {
      var p = s.pid != null ? byId(s.pid) : null, gk = FORM[st.f].p[i][2] === 'G', cx = s.x * k, cy = s.y * k;
      x.beginPath(); x.arc(cx, cy, 20, 0, 6.283); x.fillStyle = gk ? '#1b3a8a' : '#f4f1e6'; x.fill(); x.lineWidth = 3; x.strokeStyle = '#d4af37'; x.stroke();
      x.fillStyle = gk ? '#fff' : '#0b1f4b'; x.font = 'bold 20px Segoe UI, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(p ? String(num(p)) : '?', cx, cy + 1);
      x.fillStyle = '#fff'; x.font = '600 15px Segoe UI, Arial, sans-serif'; x.fillText(p ? T(p.name) : '—', cx, cy + 36);
    });
    x.fillStyle = '#f0dc8e'; x.font = '700 24px Segoe UI, Arial, sans-serif'; x.textAlign = 'left'; x.fillText('Real Madrid · ' + FORM[st.f].l, 24, VH * k + 36);
    x.fillStyle = 'rgba(255,255,255,.7)'; x.font = '15px Segoe UI, Arial, sans-serif'; x.textAlign = 'right'; x.fillText(T('Тактическая доска'), W - 24, VH * k + 36);
    c.toBlob(function (blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'real-madrid-tactics.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); });
  }

  if (!load()) autofill();
  render();
})();
