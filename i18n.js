/* Языки сайта: русский / English / Español.
   Тексты на сайте остаются русскими в data.js и коде; этот файл переводит готовую страницу на лету:
   — точные строки берутся из словарей lang-en.js / lang-es.js (разделы ui, data, names);
   — составные строки («Дома в турнире…», «2 из 3», суммы) разбираются правилами RULES;
   — даты и месяцы форматирует браузер (window.LOCALE).
   Выбор языка хранится в localStorage; переключатель — кнопка в шапке (#langSw). */
(function () {
  'use strict';
  var KEY = 'rm-lang', L = 'ru';
  try { L = localStorage.getItem(KEY) || 'ru'; } catch (e) {}
  if (L !== 'en' && L !== 'es') L = 'ru';
  window.LANG = L;
  window.LOCALE = { ru: 'ru-RU', en: 'en-GB', es: 'es-ES' }[L];
  document.documentElement.lang = L;

  var CY = /[А-Яа-яЁё]/;
  var packs = window.I18N || {};
  var pack = packs[L];

  /* ---------- переключатель ---------- */
  function initSwitch() {
    var box = document.getElementById('langSw');
    if (!box) return;
    var btn = box.querySelector('.lang-btn'), menu = box.querySelector('.lang-menu');
    btn.textContent = L.toUpperCase();
    function close() { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function (e) { e.stopPropagation(); menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', String(!menu.hidden)); });
    document.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    menu.querySelectorAll('[data-lang]').forEach(function (b) {
      if (b.dataset.lang === L) b.classList.add('on');
      b.addEventListener('click', function () {
        try { localStorage.setItem(KEY, b.dataset.lang); } catch (e) {}
        location.reload();
      });
    });
  }

  if (L === 'ru' || !pack) {
    window.tr = function (s) { return s; };
    window.hay = function (s) { return String(s); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSwitch); else initSwitch();
    return;
  }

  /* ---------- словарь ---------- */
  var M = Object.create(null), CITY = Object.create(null);
  function add(ru, t) { if (ru && t && ru !== t) M[ru] = t; }
  var ix = L === 'en' ? 0 : 1;
  var N = window.I18N_NAMES || {};
  Object.keys(N.names || {}).forEach(function (k) { var v = N.names[k]; add(k, typeof v === 'string' ? v : v[ix]); });
  Object.keys(N.cities || {}).forEach(function (k) { var v = N.cities[k]; CITY[k] = typeof v === 'string' ? v : v[ix]; });
  Object.keys(CITY).forEach(function (k) { if (!(k in M)) M[k] = CITY[k]; });
  Object.keys(pack.ui || {}).forEach(function (k) { add(k, pack.ui[k]); });

  var D = window.SITE || {}, d = pack.data || {};
  function zip(list, tr, fn) { (list || []).forEach(function (it, i) { if (tr && tr[i] != null) fn(it, tr[i]); }); }
  ['asOf', 'statsNote', 'playersNote', 'trophiesNote', 'transfersNote'].forEach(function (k) { add(D[k], d[k]); });
  if (D.league) { add(D.league.asOf, d.leagueAsOf); add(D.league.note, d.leagueNote); }
  add(window.PROFILES_SEASON, d.profilesSeason); add(window.PROFILES_NOTE, d.profilesNote);
  zip(D.stats, d.stats, function (s, t) { add(s.label, t); });
  zip(D.now, d.now, function (s, t) { add(s.k, t[0]); add(s.v, t[1]); });
  zip(D.news, d.news, function (n, t) { add(n.title, t[0]); add(n.text, t[1]); add(n.body, t[2]); });
  zip(D.legends, d.legends, function (n, t) { add(n.text, t); });
  zip(D.players, d.bios, function (p, t) { add(p.bio, t); });
  zip(D.trophies, d.trophies, function (p, t) { add(p.name, t); });
  zip(D.timeline, d.timeline, function (p, t) { add(p.title, t[0]); add(p.text, t[1]); });
  zip(D.faq, d.faq, function (p, t) { add(p.q, t[0]); add(p.a, t[1]); });
  zip(D.transfers, d.transfers, function (p, t) { add(p.feeNote, t); });
  var mi = d.matchFacts || {};
  Object.keys(D.matchInfo || {}).forEach(function (k) { zip(D.matchInfo[k].facts, mi[k], function (f, t) { add(f, t); }); });

  /* ---------- правила для составных строк ---------- */
  var RULES = [
    ['titleD', /^⏱ (\d+) д (\d+) ч (\d+) мин до матча · Реал — (.+)$/],
    ['titleH', /^⏱ (\d+) ч (\d+) мин до матча · Реал — (.+)$/],
    ['place', /^Место (\d+)$/],
    ['since', /^с (\d{4})$/],
    ['clubSince', /^В клубе с (\d{4})$/],
    ['years', /^(\d+) (?:год|года|лет)$/],
    ['yearsNew', /^(\d+) (?:год|года|лет) у нового клуба$/],
    ['games', /^(\d+) (?:матч|матча|матчей)$/],
    ['pts', /^(\d+) очк\.$/],
    ['of', /^(\d+) из (\d+)$/],
    ['matchday', /^(\d+)-й тур$/],
    ['phase', /^Общий этап, матч (\d+)$/],
    ['nthMatch', /^(\d+)-й матч: (\d+) очк\.$/],
    ['winsOf', /^побед \((\d+) из (\d+)\)$/],
    ['gd', /^разница мячей ([+\-]?\d+)$/],
    ['decade', /^(\d{4})-е$/],
    ['scoreVs', /^(.+?) (\d+:\d+) (.+)$/],
    ['teamComma', /^(.+), (\d+:\d+)$/],
    ['teamColon', /^(.+): (\d+:\d+)$/],
    ['cupN', /^Кубок чемпионов №(\d+)$/],
    ['finalLine', /^Финал в городе (.+)\. Соперник — (.+)\. Счёт: (.+)\.$/],
    ['aet', /^(\d+:\d+) \(доп\. время\)$/],
    ['pens', /^(\d+:\d+) \((\d+:\d+) по пен\.\)$/],
    ['fromNews', /^Из новости «(.+)» от (.+?)\.*$/],
    ['summary', /^(Дома|В гостях) в турнире «(.+)» «Реал» (выиграл|проиграл|сыграл вничью) с командой «(.+)» — (\d+:\d+) \(счёт «Реала» — первым\)\.$/],
    ['madridTime', /^(\d+:\d+) по мадридскому времени$/],
    ['yourTime', /^(\d+:\d+) по вашему времени$/],
    ['mostExp', /^самая дорогая покупка: (.+)$/],
    ['feeAprEur', /^([\d,.]+) млн € \(апр\. 2026\)$/],
    ['feeE', /^(≈?)([\d,.]+) млн €$/],
    ['feeP', /^(≈?)([\d,.]+) млн £$/],
    ['biggest', /^Матчи по порядку, все турниры; нажмите на столбик, чтобы открыть матч\. Самая крупная победа: (.+), (\d+:\d+)\.$/],
    ['untilDate', /^до (\d{2}\.\d{2}\.\d{4})$/],
    ['untilYear', /^до (\d{4})$/],
    ['untilJune', /^до июня (\d{4})$/],
    ['finalsNote', /^Победы в финалах Кубка чемпионов по десятилетиям\. Всего: (\d+)\.$/],
    ['formTeam', /^Форма команды: последние (\d+) матчей$/],
    ['formRating', /^Форма: рейтинг за последние (\d+) (?:матч|матча|матчей)$/],
    ['avgRating', /^Средний рейтинг за период: ([\d.,]+)\.$/],
    ['noRating', /^Рейтингов игрока за матч пока нет, поэтому показана форма команды: (\d+) очков из (\d+)\. Чтобы увидеть форму игрока, добавьте form в profiles\.js\.$/],
    ['labSeason', /^(.+?) Прочерк — данных в открытых источниках нет \(добавьте в profiles\.js\)\.$/],
    ['emptyYear', /^Нет данных — заполните в profiles\.js$/]
  ];

  function fill(tpl, m) {
    var bad = false;
    var out = tpl.replace(/([$@~#])(\d)/g, function (_, k, n) {
      var g = m[+n]; if (g == null) return '';
      if (k === '$') return g;
      if (k === '#') return L === 'en' ? g.replace(',', '.') : g;
      if (k === '~') { if (CITY[g]) return CITY[g]; var r0 = tx(g); if (r0 == null) bad = true; return r0; }
      var r = tx(g); if (r == null) { bad = true; return ''; } return r;
    });
    return bad ? null : out;
  }

  function tx(s) {
    var t = String(s).replace(/\s+/g, ' ').trim();
    if (!CY.test(t)) return t;
    if (M[t] != null) return M[t];
    var rl = pack.rules || {};
    for (var i = 0; i < RULES.length; i++) {
      var tpl = rl[RULES[i][0]]; if (!tpl) continue;
      var m = RULES[i][1].exec(t);
      if (m) { var o = fill(tpl, m); if (o != null) return o; }
    }
    var seps = [' · ', ' — ', ' / '];
    for (var j = 0; j < seps.length; j++) {
      if (t.indexOf(seps[j]) > 0) {
        var parts = t.split(seps[j]), res = [], ok = true;
        for (var k = 0; k < parts.length; k++) { var r = tx(parts[k]); if (r == null) { ok = false; break; } res.push(r); }
        if (ok) return res.join(seps[j]);
      }
    }
    var pm = /^(.+) \((.+)\)$/.exec(t);
    if (pm) { var a = tx(pm[1]), b = tx(pm[2]); if (a != null && b != null) return a + ' (' + b + ')'; }
    var cm = /^(.+), (.+)$/.exec(t);
    if (cm) { var c1 = tx(cm[1]), c2 = tx(cm[2]); if (c1 != null && c2 != null) return c1 + ', ' + c2; }
    return null;
  }

  window.tr = function (s) { if (s == null || !CY.test(s)) return s; var r = tx(s); return r == null ? s : r; };
  window.hay = function (s) { s = String(s); return CY.test(s) ? s + ' ' + window.tr(s) : s; };

  /* ---------- обход страницы и наблюдатель ---------- */
  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt', 'content', 'data-eyebrow'];
  function fixText(n) {
    var v = n.nodeValue;
    if (!v || !CY.test(v)) return;
    var r = tx(v);
    if (r == null) return;
    var lead = v.match(/^\s*/)[0], trail = v.match(/\s*$/)[0];
    n.nodeValue = lead + r + trail;
  }
  function fixAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute && el.getAttribute(a);
      if (v && CY.test(v)) { var r = tx(v); if (r != null && r !== v) el.setAttribute(a, r); }
    }
  }
  function walk(root) {
    if (root.nodeType === 3) { fixText(root); return; }
    if (root.nodeType !== 1) return;
    if (/^(SCRIPT|STYLE)$/.test(root.tagName)) return;
    fixAttrs(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null), n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) { if (!/^(SCRIPT|STYLE)$/.test(n.parentNode.tagName)) fixText(n); } else fixAttrs(n);
    }
  }

  document.title = window.tr(document.title);
  walk(document.documentElement);
  new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m.type === 'childList') { for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]); }
      else if (m.type === 'characterData') fixText(m.target);
      else if (m.type === 'attributes') fixAttrs(m.target);
    }
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { initSwitch(); walk(document.documentElement); });
  else initSwitch();
})();
