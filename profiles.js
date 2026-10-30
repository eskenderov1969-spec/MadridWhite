// Карточки игроков для «Лаборатории данных». Ключ — id игрока из data.js.
//
// Источники (все данные на 29 октября 2026 года):
//   stats    — официальная статистика LaLiga, сезон 2026/27, после 10 туров (до матча 1 ноября).
//              Лига чемпионов, Кубок Испании и товарищеские матчи сюда не входят.
//   contract — сроки контрактов по обзору от 9 сентября 2026 года; у Диоманде — по сообщению клуба.
//   value    — рыночная стоимость Transfermarkt по сообщениям СМИ: пять игроков на октябрь 2026,
//              остальные — на апрель 2026 (помечено в значении). Где значения нет, источника не нашлось.
//   born     — дата рождения; num — номер по списку LaLiga (у Родриго — по предварительному списку клуба).
//
// Чего нет в открытых источниках: xG и xA, ключевые передачи, прогрессивные передачи и проходы с мячом,
// пройденная дистанция, касания в штрафной, ошибки, ведущие к голу, рейтинги за матч (только у Александера-Арнольда)
// и форма игроков по матчам. Эти показатели на сайте остаются прочерком — добавьте их сами.
//
// Пояснения к расчётам:
//   • Отборы — успешные; единоборства — выигранные (земля и воздух считаются отдельно).
//   • Точность передач = точные / все передачи; отражённые удары, % = сейвы / (сейвы + пропущенные голы).
//   • Конверсия ударов = голы / удары; «сухие матчи» Куртуа — по результатам матчей, где он был в воротах.
//   • Родриго в официальной статистике LaLiga 2026/27 не значится, поэтому у него прочерки.
//
// Пример добавления формы игрока (рейтинги за матч, от старых к новым; тогда график покажет их):
//   form: [ { date: '2026-10-25', opp: 'Барселона', rating: 9.1 }, { date: '2026-10-21', opp: 'Лейпциг', rating: 7.4 } ]
//
// Ключи stats:
//   Общие:        apps, minutes, starts, subs, yellow, red, rating
//   Вратарь:      saves, savePct, conceded, cleanSheets, pensSaved, passAcc, longPassAcc, sweeper, claims
//   Защитник:     tackles, interceptions, duelsGround, duelsAir, clearances, blocks, passAcc, longPasses,
//                 goals, assists, errorsToGoal, fouls
//   Полузащитник: passes, keyPasses, passAcc, progPasses, progCarries, tackles, interceptions,
//                 goals, assists, xA, distance
//   Нападающий:   goals, xG, shots, shotsOnTarget, conversion, assists, dribbles, touchesBox, penScored
// Фото: положите файл assets/players/<slug>.jpg — он подставится сам.

window.PROFILES_SEASON = 'Ла Лига 2026/27, после 10 туров (на 25 октября 2026), официальная статистика LaLiga. Лига чемпионов не включена.';
window.PROFILES_NOTE = 'Рыночная стоимость — оценки Transfermarkt по сообщениям СМИ; у части игроков значение на апрель 2026 (указано в скобках).';

window.PROFILES = {
  1: {
    num: 10, slug: 'mbappe', born: '1998-12-20',
    contract: 'до 2029', value: '200 млн €',
    stats: { apps: 10, minutes: 894, starts: 10, subs: 0, yellow: 2, red: 0, goals: 11, shots: 41, shotsOnTarget: 29, conversion: 26.8, assists: 2, dribbles: 34, penScored: 2 },
    form: [],
  },
  2: {
    num: 7, slug: 'vinicius', born: '2000-07-12',
    contract: 'до июня 2032', value: '130 млн €',
    stats: { apps: 8, minutes: 585, starts: 7, subs: 1, yellow: 2, red: 1, goals: 1, shots: 18, shotsOnTarget: 7, conversion: 5.6, assists: 3, dribbles: 14, penScored: 0 },
    form: [],
  },
  3: {
    num: 5, slug: 'bellingham', born: '2003-06-29',
    contract: 'до 2029', value: '160 млн €',
    stats: { apps: 10, minutes: 778, starts: 9, subs: 1, yellow: 2, red: 0, passes: 344, passAcc: 81.7, tackles: 13, interceptions: 4, goals: 3, assists: 3 },
    form: [],
  },
  4: {
    num: 8, slug: 'valverde', born: '1998-07-22',
    contract: 'до июня 2029', value: '120 млн € (апр. 2026)',
    stats: { apps: 10, minutes: 801, starts: 10, subs: 0, yellow: 0, red: 0, passes: 466, passAcc: 84.1, tackles: 9, interceptions: 12, goals: 0, assists: 2 },
    form: [],
  },
  5: {
    num: 15, slug: 'guler', born: '2005-02-25',
    contract: 'до 2029', value: '100 млн €',
    stats: { apps: 10, minutes: 593, starts: 8, subs: 2, yellow: 1, red: 0, passes: 330, passAcc: 77, tackles: 7, interceptions: 1, goals: 2, assists: 2 },
    form: [],
  },
  6: {
    num: 6, slug: 'camavinga', born: '2002-11-10',
    contract: 'до 2029', value: '50 млн € (апр. 2026)',
    stats: { apps: 9, minutes: 275, starts: 2, subs: 7, yellow: 2, red: 0, passes: 215, passAcc: 88.4, tackles: 4, interceptions: 4, goals: 0, assists: 1 },
    form: [],
  },
  7: {
    num: 14, slug: 'tchouameni', born: '2000-01-27',
    contract: 'до 2031', value: '75 млн € (апр. 2026)',
    stats: { apps: 6, minutes: 448, starts: 5, subs: 1, yellow: 2, red: 0, passes: 251, passAcc: 89.2, tackles: 6, interceptions: 9, goals: 0, assists: 1 },
    form: [],
  },
  8: {
    num: 1, slug: 'courtois', born: '1992-05-11',
    contract: 'до 2027', value: null,
    stats: { apps: 9, minutes: 810, starts: 9, subs: 0, yellow: 0, red: 0, saves: 29, savePct: 76.3, conceded: 9, cleanSheets: 2, pensSaved: 0, passAcc: 73.6, sweeper: 0, claims: 3 },
    form: [],
  },
  9: {
    num: 13, slug: 'lunin', born: '1999-02-11',
    contract: 'до 2030', value: null,
    stats: { apps: 1, minutes: 90, starts: 1, subs: 0, yellow: 0, red: 0, saves: 5, savePct: 83.3, conceded: 1, cleanSheets: 0, pensSaved: 0, passAcc: 37.5, sweeper: 0, claims: 1 },
    form: [],
  },
  10: {
    num: 3, slug: 'militao', born: '1998-01-18',
    contract: 'до 2028', value: '25 млн € (апр. 2026)',
    stats: { apps: 1, minutes: 5, starts: 0, subs: 1, yellow: 0, red: 0, tackles: 0, interceptions: 1, duelsGround: 0, duelsAir: 0, clearances: 0, blocks: 0, passAcc: 100, longPasses: 0, goals: 0, assists: 0, fouls: 0 },
    form: [],
  },
  11: {
    num: 22, slug: 'rudiger', born: '1993-03-03',
    contract: 'до 2027', value: null,
    stats: { apps: 4, minutes: 306, starts: 3, subs: 1, yellow: 1, red: 0, tackles: 1, interceptions: 0, duelsGround: 4, duelsAir: 5, clearances: 26, blocks: 6, passAcc: 88.6, longPasses: 12, goals: 1, assists: 0, fouls: 2 },
    form: [],
  },
  12: {
    num: 4, slug: 'huijsen', born: '2005-04-14',
    contract: 'до 2030', value: null,
    stats: { apps: 8, minutes: 682, starts: 8, subs: 0, yellow: 2, red: 1, tackles: 5, interceptions: 13, duelsGround: 15, duelsAir: 11, clearances: 44, blocks: 5, passAcc: 90.7, longPasses: 24, goals: 0, assists: 0, fouls: 6 },
    form: [],
  },
  13: {
    num: 2, slug: 'asencio', born: '2003-02-23',
    contract: 'до 2031', value: null,
    stats: { apps: 0, minutes: 0, starts: 0, subs: 0, yellow: 0, red: 0, tackles: 0, interceptions: 0, duelsGround: 0, duelsAir: 0, clearances: 0, blocks: 0, passAcc: null, longPasses: 0, goals: 0, assists: 0, fouls: 0 },
    form: [],
  },
  14: {
    num: 12, slug: 'alexander-arnold', born: '1998-10-07',
    contract: 'до 2031', value: null,
    stats: { apps: 6, minutes: 266, starts: 3, subs: 3, yellow: 0, red: 0, rating: 7.17, tackles: 1, interceptions: 7, duelsGround: 7, duelsAir: 0, clearances: 4, blocks: 0, passAcc: 76.7, longPasses: 20, goals: 0, assists: 1, fouls: 0 },
    form: [],
  },
  15: {
    num: 18, slug: 'carreras', born: '2003-03-23',
    contract: 'до 2031', value: '60 млн € (апр. 2026)',
    stats: { apps: 5, minutes: 246, starts: 4, subs: 1, yellow: 1, red: 0, tackles: 7, interceptions: 1, duelsGround: 14, duelsAir: 1, clearances: 4, blocks: 0, passAcc: 87.4, longPasses: 4, goals: 1, assists: 0, fouls: 1 },
    form: [],
  },
  16: {
    num: 16, slug: 'konate', born: '1999-05-25',
    contract: 'до 2030', value: null,
    stats: { apps: 9, minutes: 810, starts: 9, subs: 0, yellow: 3, red: 0, tackles: 6, interceptions: 4, duelsGround: 17, duelsAir: 13, clearances: 32, blocks: 7, passAcc: 89.7, longPasses: 18, goals: 0, assists: 0, fouls: 11 },
    form: [],
  },
  17: {
    num: 17, slug: 'cucurella', born: '1998-07-22',
    contract: 'до 2032', value: null,
    stats: { apps: 10, minutes: 655, starts: 6, subs: 4, yellow: 1, red: 0, tackles: 13, interceptions: 7, duelsGround: 27, duelsAir: 6, clearances: 17, blocks: 5, passAcc: 85.4, longPasses: 11, goals: 0, assists: 0, fouls: 8 },
    form: [],
  },
  18: {
    num: 24, slug: 'dumfries', born: '1996-04-18',
    contract: 'до июня 2030', value: null,
    stats: { apps: 8, minutes: 447, starts: 5, subs: 3, yellow: 1, red: 0, tackles: 7, interceptions: 3, duelsGround: 13, duelsAir: 4, clearances: 7, blocks: 2, passAcc: 85, longPasses: 3, goals: 0, assists: 0, fouls: 2 },
    form: [],
  },
  19: {
    num: 20, slug: 'bernardo-silva', born: '1994-08-10',
    contract: 'до 2028', value: null,
    stats: { apps: 8, minutes: 383, starts: 4, subs: 4, yellow: 0, red: 0, passes: 284, passAcc: 88.7, tackles: 4, interceptions: 5, goals: 0, assists: 1 },
    form: [],
  },
  20: {
    num: 27, slug: 'pitarch', born: null,
    contract: null, value: null,
    stats: { apps: 0, minutes: 0, starts: 0, subs: 0, yellow: 0, red: 0, passes: 0, passAcc: null, tackles: 0, interceptions: 0, goals: 0, assists: 0 },
    form: [],
  },
  21: {
    num: 11, slug: 'rodrygo', born: '2001-01-09',
    contract: 'до июня 2028', value: '50 млн € (апр. 2026)',
    stats: {  },
    form: [],
  },
  22: {
    num: 21, slug: 'brahim', born: '1999-08-03',
    contract: 'до 2030', value: null,
    stats: { apps: 4, minutes: 120, starts: 1, subs: 3, yellow: 0, red: 0, passes: 58, passAcc: 96.6, tackles: 1, interceptions: 0, goals: 0, assists: 0 },
    form: [],
  },
  23: {
    num: 9, slug: 'endrick', born: '2006-07-21',
    contract: 'до 2030', value: null,
    stats: { apps: 2, minutes: 73, starts: 1, subs: 1, yellow: 0, red: 0, goals: 0, shots: 2, shotsOnTarget: 1, conversion: 0, assists: 0, dribbles: 1, penScored: 0 },
    form: [],
  },
  24: {
    num: 19, slug: 'espi', born: '2005-07-24',
    contract: 'до 2031', value: null,
    stats: { apps: 6, minutes: 32, starts: 0, subs: 6, yellow: 0, red: 0, goals: 2, shots: 4, shotsOnTarget: 3, conversion: 50, assists: 0, dribbles: 2, penScored: 0 },
    form: [],
  },
  25: {
    num: 25, slug: 'diomande', born: '2006-11-14',
    contract: 'до 30.06.2033', value: null,
    stats: { apps: 10, minutes: 545, starts: 5, subs: 5, yellow: 1, red: 0, goals: 2, shots: 9, shotsOnTarget: 3, conversion: 22.2, assists: 2, dribbles: 28, penScored: 0 },
    form: [],
  },
};
