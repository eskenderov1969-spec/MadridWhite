/* Языки сайта (русский / English / Español): словари названий и переводов + движок переключения. */

/* ======== lang-names.js ======== */
/* Общие названия для переводов: игроки, клубы, страны, турниры, города.
   Значение — строка (одинаково в английском и испанском) или массив [English, Español]. */
window.I18N_NAMES = {
  names: {
    /* игроки */
    'Килиан Мбаппе': 'Kylian Mbappé', 'Винисиус Жуниор': 'Vinícius Júnior', 'Джуд Беллингем': 'Jude Bellingham',
    'Федерико Вальверде': 'Federico Valverde', 'Арда Гюлер': 'Arda Güler', 'Эдуардо Камавинга': 'Eduardo Camavinga',
    'Орельен Чуамени': 'Aurélien Tchouaméni', 'Тибо Куртуа': 'Thibaut Courtois', 'Андрей Лунин': 'Andriy Lunin',
    'Эдер Милитан': 'Éder Militão', 'Антонио Рюдигер': 'Antonio Rüdiger', 'Дин Хёйсен': 'Dean Huijsen',
    'Рауль Асенсио': 'Raúl Asencio', 'Трент Александер-Арнольд': 'Trent Alexander-Arnold', 'Альваро Каррерас': 'Álvaro Carreras',
    'Ибраима Конате': 'Ibrahima Konaté', 'Марк Куркурелья': 'Marc Cucurella', 'Денцел Дюмфрис': 'Denzel Dumfries', 'Деннис Дюмфрис': 'Denzel Dumfries',
    'Бернарду Силва': 'Bernardo Silva', 'Тьяго Питарч': 'Thiago Pitarch', 'Родриго': 'Rodrygo', 'Брахим Диас': 'Brahim Díaz',
    'Эндрик': 'Endrick', 'Карлос Эспи': 'Carlos Espí', 'Ян Диоманде': 'Yan Diomande', 'Аубакари Койта': 'Aboubakary Koita', 'Ставрос Пилиос': 'Stavros Pilios',
    'Альфредо Ди Стефано': 'Alfredo Di Stéfano', 'Ференц Пушкаш': 'Ferenc Puskás', 'Франсиско Хенто': 'Francisco Gento',
    'Рауль': 'Raúl', 'Икер Касильяс': 'Iker Casillas', 'Криштиану Роналду': 'Cristiano Ronaldo', 'Карим Бензема': 'Karim Benzema',
    'Сантильяна': 'Santillana', 'Рафинья': 'Raphinha', 'Гонсало Гарсия': 'Gonzalo García', 'Сесар Паласиос': 'César Palacios',
    'Фран Гарсия': 'Fran García', 'Мануэль Анхель': 'Manuel Ángel', 'Марио Мартин': 'Mario Martín',
    'Виктор Вальдепеньяс': 'Víctor Valdepeñas', 'Франко Мастантуоно': 'Franco Mastantuono', 'Дани Себальос': 'Dani Ceballos',
    'Давид Алаба': 'David Alaba', 'Дани Карвахаль': 'Dani Carvajal', 'Жозе Моуринью': 'José Mourinho',
    'Флорентино Перес': 'Florentino Pérez', 'Сантьяго Бернабеу': 'Santiago Bernabéu',
    /* клубы и команды */
    'Реал Мадрид': 'Real Madrid', 'Реал': 'Real', 'Барселона': 'Barcelona', 'Атлетико': 'Atlético', 'Бетис': 'Betis',
    'Реал Бетис': 'Real Betis', 'Реал Сосьедад': 'Real Sociedad', 'Севилья': 'Sevilla', 'Атлетик Бильбао': 'Athletic Club',
    'Вильярреал': 'Villarreal', 'Сельта': 'Celta', 'Алавес': 'Alavés', 'Райо Вальекано': 'Rayo Vallecano', 'Хетафе': 'Getafe',
    'Депортиво': 'Deportivo', 'Эспаньол': 'Espanyol', 'Осасуна': 'Osasuna', 'Расинг Сантандер': 'Racing Santander',
    'Эльче': 'Elche', 'Леванте': 'Levante', 'Валенсия': 'Valencia', 'Малага': 'Málaga', 'РБ Лейпциг': 'RB Leipzig',
    'Интер': 'Inter', 'Рома': 'Roma', 'АЕК Афины': ['AEK Athens', 'AEK Atenas'], 'ПСВ': 'PSV', 'Арсенал': 'Arsenal', 'ЛАСК': 'LASK',
    'Шахтёр Донецк': 'Shakhtar Donetsk', 'Челси': 'Chelsea', 'Ливерпуль': 'Liverpool', 'Манчестер Сити': 'Manchester City',
    'Лион': 'Lyon', 'Фулхэм': 'Fulham', 'Фиорентина': 'Fiorentina', 'Удинезе': 'Udinese', 'Реймс': 'Reims',
    'Милан': ['Milan', 'Milán'], 'Айнтрахт Франкфурт': 'Eintracht Frankfurt', 'Партизан': 'Partizan', 'Ювентус': 'Juventus',
    'Байер Леверкузен': 'Bayer Leverkusen', 'Боруссия Дортмунд': 'Borussia Dortmund', 'Бавария': ['Bayern Munich', 'Bayern de Múnich'],
    /* страны и группы */
    'Франция': ['France', 'Francia'], 'Бразилия': ['Brazil', 'Brasil'], 'Англия': ['England', 'Inglaterra'], 'Уругвай': 'Uruguay',
    'Турция': ['Turkey', 'Turquía'], 'Бельгия': ['Belgium', 'Bélgica'], 'Украина': ['Ukraine', 'Ucrania'],
    'Германия': ['Germany', 'Alemania'], 'Испания': ['Spain', 'España'], 'Нидерланды': ['Netherlands', 'Países Bajos'],
    'Португалия': 'Portugal', 'Марокко': ['Morocco', 'Marruecos'], 'Кот-д’Ивуар': ['Côte d’Ivoire', 'Costa de Marfil'],
    'Европа': ['Europe', 'Europa'], 'Мир': ['World', 'Mundo'],
    /* турниры */
    'Ла Лига': 'La Liga', 'Лига чемпионов': ['Champions League', 'Liga de Campeones'], 'Лига Европы': ['Europa League', 'Liga Europa'],
    'Лига конференций': ['Conference League', 'Liga de la Conferencia'], 'Кубок чемпионов': ['European Cup', 'Copa de Europa'],
    'Кубок Испании': 'Copa del Rey', 'Суперкубок Испании': ['Spanish Super Cup', 'Supercopa de España'],
    'Кубок лиги': ['League Cup', 'Copa de la Liga'], 'Кубок Эвы Дуарте': 'Copa Eva Duarte', 'Кубок УЕФА': ['UEFA Cup', 'Copa de la UEFA'],
    'Суперкубок УЕФА': ['UEFA Super Cup', 'Supercopa de Europa'], 'Латинский кубок': ['Latin Cup', 'Copa Latina'],
    'Клубный чемпионат мира': ['Club World Cup', 'Mundial de Clubes'],
    'Межконтинентальный кубок (с 2024)': ['Intercontinental Cup (since 2024)', 'Copa Intercontinental (desde 2024)']
  },
  cities: {
    'Париж': ['Paris', 'París'], 'Мадрид': 'Madrid', 'Брюссель': ['Brussels', 'Bruselas'], 'Штутгарт': 'Stuttgart',
    'Глазго': 'Glasgow', 'Амстердам': ['Amsterdam', 'Ámsterdam'], 'Лиссабон': ['Lisbon', 'Lisboa'], 'Милан': ['Milan', 'Milán'],
    'Кардифф': 'Cardiff', 'Киев': ['Kyiv', 'Kiev'], 'Лондон': ['London', 'Londres']
  }
};

;
/* ======== lang-en.js ======== */
/* English. ui — интерфейс (ключ — русский текст), data — переводы данных из data.js (в том же порядке), rules — шаблоны составных строк. */
window.I18N = window.I18N || {};
window.I18N.en = {
  ui: {
    'Тактическая доска': 'Tactics board',
    'Выберите схему и перетаскивайте игроков. Нажмите на игрока на поле, затем на имя в списке — и он займёт это место. Включите «Стрелки», чтобы рисовать на поле.': 'Pick a formation and drag the players. Click a player on the pitch, then a name in the list, and that player takes the spot. Switch on “Arrows” to draw on the pitch.',
    'Схема': 'Formation',
    'Подставить состав': 'Auto-fill the lineup',
    'Стрелки': 'Arrows',
    'Отменить стрелку': 'Undo arrow',
    'Очистить стрелки': 'Clear arrows',
    'Скачать картинку': 'Download image',
    'Состав на доске подставляется автоматически из списка игроков и не является прогнозом. Расстановка и стрелки сохраняются в этом браузере.': 'The lineup on the board is filled in automatically from the squad list and is not a prediction. The layout and arrows are saved in this browser.',
    'Карусель': 'Carousel',
    'Сетка': 'Grid',
    'Звук и вибрация': 'Sound and vibration',
    'Выкл': 'Off',
    'Вкл': 'On',
    'Сегодня матч': 'Match day',
    'Матч начался': 'The match has started',
    'по вашему времени': 'your time',
    'Начало через': 'Kick-off in',
    'Подиум бомбардиров': 'Scorers’ podium',
    '🎉 Салют': '🎉 Celebrate',
    'Атака и защита': 'Attack and defence',
    'Пропущено за матч (меньше — лучше)': 'Goals conceded per game (lower is better)',
    'Забито за матч': 'Goals scored per game',
    'Много забивают, мало пропускают': 'Score a lot, concede little',
    'Мало забивают, много пропускают': 'Score little, concede a lot',
    'Каждая точка — клуб Ла Лиги: размер зависит от очков, пунктир — средние значения лиги. Подписаны лидеры, «Реал» и клубы с крайними значениями; остальных видно при наведении.': 'Each dot is a La Liga club: its size depends on points, dashed lines are league averages. Leaders, Real and the clubs with extreme values are labelled; hover to see the others.',
    'перейти в раздел (g, затем первая буква)': 'go to a section (g, then a letter)',
    'показать все сочетания клавиш': 'show all keyboard shortcuts',
    'О проекте': 'About the project',
    'Для чего этот сайт': 'What this site is for',
    'Учебный проект: неофициальный фан-сайт футбольного клуба «Реал Мадрид». Сайт работает без сервера и без сборки — достаточно открыть файл index.html в браузере.': 'A student project: an unofficial fan site of Real Madrid football club. It needs no server and no build step — just open index.html in a browser.',
    'Игроков в составе': 'Squad players',
    'Матчей сезона в базе': 'Season matches in the data',
    'Новостей': 'News stories',
    'Языка интерфейса': 'Interface languages',
    'Темы оформления': 'Visual themes',
    'Как это устроено': 'How it works',
    'Данные': 'Data',
    'Клубная информация лежит в файлах data.js и profiles.js.': 'Club information lives in the files data.js and profiles.js.',
    'JavaScript': 'JavaScript',
    'Скрипты собирают страницы, графики, таблицы и календарь.': 'Scripts build the pages, charts, tables and calendar.',
    'CSS': 'CSS',
    'Оформление, анимации и адаптивность под телефон и печать.': 'Styling, animation, and layouts for phones and print.',
    'Переводы': 'Translations',
    'Движок переводов показывает сайт на русском, английском или испанском.': 'A translation engine shows the site in Russian, English or Spanish.',
    'Технологии': 'Technologies',
    'HTML5': 'HTML5',
    'CSS3': 'CSS3',
    'Семантическая разметка: разделы, навигация, подписи для программ чтения с экрана.': 'Semantic markup: sections, navigation, labels for screen readers.',
    'Переменные, сетки, стеклянные панели, анимации, три режима оформления, печатная версия.': 'Variables, grids, glass panels, animation, three visual modes and a print version.',
    'JavaScript без фреймворков': 'JavaScript without frameworks',
    'Переходы между разделами, графики на SVG, поиск, календарь, обратный отсчёт до матча.': 'Section transitions, SVG charts, search, a calendar and a countdown to the next match.',
    'Данные отдельно от кода': 'Data separate from code',
    'Чтобы обновить сайт, достаточно поправить data.js и profiles.js — вёрстку трогать не нужно.': 'To update the site, just edit data.js and profiles.js — no need to touch the layout.',
    'Три языка': 'Three languages',
    'Русский, английский и испанский. Выбор языка запоминается в браузере.': 'Russian, English and Spanish. The chosen language is remembered in the browser.',
    'Удобство': 'Usability',
    'Работа с клавиатуры, видимый фокус, учёт системной настройки «уменьшить анимацию».': 'Keyboard use, a visible focus ring, and respect for the system “reduce motion” setting.',
    'Возможности сайта': 'Site features',
    'Матч-центр: календарь, результаты, таблица Ла Лиги, сезон в цифрах': 'Match centre: calendar, results, La Liga table, season in numbers',
    'Страница каждого матча с авторами голов и шкалой минут': 'A page for every match with goalscorers and a minute timeline',
    'Лаборатория данных: карточки игроков, радар, графики формы': 'Data lab: player cards, radar chart, form charts',
    'Сравнение двух игроков с радарной диаграммой': 'Two-player comparison with a radar chart',
    'Таблица Ла Лиги с переключением на график очков': 'La Liga table that switches to a points chart',
    'Поиск по всему сайту (Ctrl+K)': 'Site-wide search (Ctrl+K)',
    'Избранные игроки и матчи': 'Favourite players and matches',
    'Добавление матча в календарь (файл .ics)': 'Add a match to your calendar (.ics file)',
    'Тёмная, светлая темы и режим «День матча»': 'Dark and light themes and a “Matchday” mode',
    'Печатная версия страниц': 'Print-friendly pages',
    'Файлы проекта': 'Project files',
    'разметка всех разделов': 'markup for all sections',
    'оформление и анимации': 'styling and animation',
    'новости, матчи, таблица, трофеи': 'news, matches, table, trophies',
    'карточки и статистика игроков': 'player cards and statistics',
    'работа разделов': 'section logic',
    'поиск, настройки вида, графики, эффекты': 'search, view settings, charts, effects',
    'переводы интерфейса и данных': 'interface and data translations',
    'вся логика: разделы, поиск, графики, эффекты': 'all the logic: pages, search, charts, effects',
    'герб клуба, встроенный в код': 'club crest embedded in code',
    'Горячие клавиши': 'Keyboard shortcuts',
    'открыть поиск': 'open search',
    'закрыть окно или панель': 'close a window or panel',
    'Источники и ограничения': 'Sources and limitations',
    'Данные собраны вручную из открытых источников (ESPN, LaLiga, Sports Mole, Marca и других).': 'The data was collected by hand from open sources (ESPN, LaLiga, Sports Mole, Marca and others).',
    'Личная статистика игроков обновляется вручную и может отставать от последних матчей.': 'Individual player statistics are updated by hand and may lag behind the latest matches.',
    'Сайт неофициальный и не связан с клубом Real Madrid C.F.': 'The site is unofficial and not affiliated with Real Madrid C.F.',
    'Сезон матч за матчем': 'The season, match by match',
    'Листайте или тяните ленту. Нажмите на карточку, чтобы открыть матч.': 'Scroll or drag the strip. Click a card to open the match.',
    'Матчи сезона': 'Season matches',
    'Игрок и среднее по составу': 'Player vs squad average',
    'Среднее по составу': 'Squad average',
    'График очков': 'Points chart',
    'Профиль на 90 минут': 'Profile per 90 minutes',
    'Для вратарей радар не строится.': 'The radar is not built for goalkeepers.',
    'Радар доступен, если у обоих игроков не меньше 200 минут в Ла Лиге.': 'The radar is available when both players have at least 200 La Liga minutes.',
    'Каждая ось — доля от лучшего значения в составе. Ла Лига 2026/27, после 10 туров; игроки от 200 минут.': 'Each axis is a share of the squad’s best value. La Liga 2026/27, after 10 rounds; players with 200+ minutes.',
    'Справа от очков — сыгранные матчи.': 'Games played are shown to the right of the points.',
    'Ход матча': 'Match timeline',
    'Радар': 'Radar',
    'Форма': 'Form', 
    'Настройки вида': 'View settings', 'Тёмная': 'Dark', 'Светлая': 'Light', 'День матча': 'Match day', 'Карточки': 'Cards', 'Крупно': 'Large', 'Компактно': 'Compact',
    'Размер шрифта': 'Font size', 'Сбросить настройки': 'Reset settings', 'Лента клуба': 'Club ticker', 'Последний матч': 'Last match', 'Следующий матч': 'Next match', 'Лучший бомбардир': 'Top scorer',
    'Real Madrid — неофициальный фан-сайт': 'Real Madrid — unofficial fan site',
    'Неофициальный фан-сайт о футбольном клубе Реал Мадрид: новости, клуб, стадион, история и данные.': 'Unofficial fan site about Real Madrid football club: news, club, stadium, history and data.',
    'Сезон 2026 / 2027': 'Season 2026 / 2027', 'Сезон 2026/2027': 'Season 2026/2027',
    'Новости': 'News', 'Клуб': 'Club', 'Состав': 'Squad', 'Матчи': 'Matches', 'Трансферы': 'Transfers', 'Стадион': 'Stadium',
    'История': 'History', 'Трофеи': 'Trophies', 'Лаборатория данных': 'Data Lab',
    'Открыть меню': 'Open menu', 'Закрыть меню': 'Close menu', 'Real Madrid — на главную': 'Real Madrid — home', 'Основное меню': 'Main menu',
    'Поиск по сайту (Ctrl+K)': 'Site search (Ctrl+K)', 'Переключить тему': 'Toggle theme', 'Тема': 'Theme', 'Язык': 'Language',
    'Hala Madrid · основан в 1902 году': 'Hala Madrid · founded in 1902',
    'Новости, история, стадион и статистика королевского клуба — всё в одном месте. Состав, трофеи и данные сезона 2026/27.': 'News, history, the stadium and statistics of the royal club — all in one place. Squad, trophies and 2026/27 season data.',
    'Состав 26/27': 'Squad 26/27', 'Тур по «Бернабеу»': 'Tour of the Bernabéu', 'Сводка 2026/27': 'Summary 2026/27', 'Сводка сезона': 'Season summary',
    'Белые': 'The Whites', 'Мадрид': 'Madrid', 'Капитан и вице-капитан': 'Captain and vice-captain', 'Девиз клуба': 'Club motto',
    'Главный тренер': 'Head coach', 'Президент': 'President', 'Капитан': 'Captain', 'Вице-капитан': 'Vice-captain',
    'Свежее из клуба': 'Latest from the club', 'О клубе': 'About the club', 'Игроки и статистика': 'Players and statistics',
    'Сезон 2026/27': 'Season 2026/27', 'Лето 2026': 'Summer 2026', 'Мадрид · с 1947 года': 'Madrid · since 1947', 'С 1902 года': 'Since 1902',
    'Зал славы': 'Hall of fame', 'Данные и аналитика': 'Data and analytics',
    'Состав 2026/27': 'Squad 2026/27', 'Матч-центр': 'Match centre', 'Стадион Бернабеу': 'Bernabéu Stadium', 'История клуба': 'Club history',
    'Зал трофеев': 'Trophy room', 'Клуб сегодня': 'The club today', 'Легенды клуба': 'Club legends', 'Вопросы и ответы': 'Questions and answers',
    'Ближайший матч': 'Next match', 'дней': 'days', 'часов': 'hours', 'минут': 'minutes', 'секунд': 'seconds',
    'день до матча': 'day to kick-off', 'дня до матча': 'days to kick-off', 'дней до матча': 'days to kick-off',
    'Форма · пять последних матчей': 'Form · last five matches', '＋ В календарь': '＋ Add to calendar',
    'Матч начался или только что завершился. Обновите страницу позже — календарь переключится на следующую игру.': 'The match has started or just finished. Refresh the page later — the calendar will switch to the next game.',
    'Календарь обновится: ближайших матчей в списке пока нет.': 'The calendar will update: there are no upcoming matches in the list yet.',
    'время начала уточняется': 'kick-off time to be confirmed', 'время уточняется': 'time to be confirmed',
    'Дома, «Сантьяго Бернабеу»': 'Home, Santiago Bernabéu', 'дома, «Сантьяго Бернабеу»': 'home, Santiago Bernabéu', 'Дома': 'At home', 'В гостях': 'Away',
    'дома': 'home', 'в гостях': 'away', 'выиграл': 'won', 'проиграл': 'lost', 'сыграл вничью': 'drew',
    'Сезон 2026/27 в цифрах': 'Season 2026/27 in numbers', 'побед': 'wins', 'победы': 'wins', 'поражения': 'losses', 'мячи': 'goals', '«сухих» матчей': 'clean sheets',
    'Подробнее в матч-центре →': 'More in the match centre →', 'Матч-центр': 'Match centre',
    'Бомбардиры Реала в Ла Лиге': 'Real’s top scorers in La Liga',
    'Голы после 10 туров (LaLiga) и мячи матчей 1 и 7 ноября.': 'Goals after 10 rounds (LaLiga) plus the goals from the matches of 1 and 7 November.',
    'Ничего не найдено.': 'Nothing found.', 'Поиск по новостям…': 'Search news…', 'Поиск по новостям': 'Search news', 'Категории': 'Categories',
    'год основания': 'founded', 'город': 'city', '«белые» — прозвище': '“the whites” — nickname', 'Белый': 'White', 'цвет формы': 'kit colour',
    'Все': 'All', 'Вратари': 'Goalkeepers', 'Защитники': 'Defenders', 'Полузащитники': 'Midfielders', 'Нападающие': 'Forwards', '★ Избранные': '★ Favourites',
    'Вратарь': 'Goalkeeper', 'Защитник': 'Defender', 'Полузащитник': 'Midfielder', 'Нападающий': 'Forward', 'Вингер': 'Winger',
    'вратарь': 'goalkeeper', 'защитник': 'defender', 'полузащитник': 'midfielder', 'нападающий': 'forward',
    'Защита': 'Defence', 'Полузащита': 'Midfield', 'Атака': 'Attack',
    'Поиск игрока или страны…': 'Search player or country…', 'Поиск игрока': 'Search player', 'Сортировка': 'Sort', 'Позиции': 'Positions',
    'По голам': 'By goals', 'По матчам': 'By games', 'По имени': 'By name',
    'Новичок 2026': 'New in 2026', 'воспитанник': 'academy graduate', 'В клубе воспитанник': 'At the club: academy graduate',
    'Голы в Ла Лиге 26/27 относительно лучшего бомбардира': 'La Liga 26/27 goals relative to the top scorer',
    'матчей': 'games', 'голов': 'goals', 'матчей в Ла Лиге 26/27': 'games in La Liga 26/27', 'голов в Ла Лиге 26/27': 'goals in La Liga 26/27', 'голов за матч': 'goals per game',
    'Игроки не найдены.': 'No players found.', 'Пока никого нет: нажмите ★ на карточке игрока.': 'Nobody yet: press ★ on a player card.',
    'В избранное': 'Add to favourites', 'В сравнение (слева)': 'Add to comparison (left)', 'В сравнение (справа)': 'Add to comparison (right)', 'Карточка в лаборатории': 'Card in the Data Lab',
    'Сравнение игроков': 'Player comparison', 'Первый игрок': 'First player', 'Второй игрок': 'Second player',
    'Матчей (Ла Лига 26/27)': 'Games (La Liga 26/27)', 'Голов (Ла Лига 26/27)': 'Goals (La Liga 26/27)', 'Голов за матч': 'Goals per game',
    'Календарь': 'Calendar', 'Результаты': 'Results', 'Таблица Ла Лиги': 'La Liga table', 'Сезон в цифрах': 'Season in numbers',
    'пн': 'Mon', 'вт': 'Tue', 'ср': 'Wed', 'чт': 'Thu', 'пт': 'Fri', 'сб': 'Sat', 'вс': 'Sun',
    'победа': 'win', 'поражение': 'loss', 'ничья': 'draw', 'впереди': 'upcoming', 'Победа': 'Win', 'Победы': 'Wins', 'Ничья': 'Draw', 'Ничьи': 'Draws', 'Поражение': 'Loss', 'Поражения': 'Losses',
    'Ближайшие матчи': 'Upcoming matches', '⬇ Скачать календарь (.ics)': '⬇ Download calendar (.ics)',
    'Предыдущий месяц': 'Previous month', 'Следующий месяц': 'Next month',
    'Список неполный: матчи Лиги чемпионов и ближайшие игры Ла Лиги. Время начала — по вашему часовому поясу; даты Ла Лиги могут сдвинуться.': 'The list is incomplete: Champions League matches and the nearest La Liga games. Kick-off times are in your time zone; La Liga dates may shift.',
    'Ближайших матчей в списке нет.': 'There are no upcoming matches in the list.',
    'победы · ничьи · поражения': 'wins · draws · losses', 'Все турниры': 'All competitions', 'Турнир': 'Competition',
    'Нажмите на матч, чтобы открыть его страницу. Счёт в списке показан по порядку «хозяева — гости».': 'Click a match to open its page. The score in the list is shown in “home — away” order.',
    'Ла Лига 2026/27, на 8 ноября 2026 · после 12-го тура, без матча «Атлетико» — «Барселона». Нажмите на заголовок столбца, чтобы отсортировать.': 'La Liga 2026/27, as of 8 November 2026 · after round 12, without the Atlético — Barcelona match. Click a column header to sort.',
    'Команда': 'Team', 'Мячи': 'Goals', 'И': 'P', 'В': 'W', 'Н': 'D', 'П': 'L', 'Р': 'GD', 'О': 'Pts',
    'Разница мячей по матчам': 'Goal difference by match', 'Разница мячей по матчам сезона': 'Goal difference by match this season',
    'Матчи ': 'Matches', 'Забито — пропущено': 'Scored — conceded', 'Разница мячей': 'Goal difference', 'Очки': 'Points',
    'Лига Европы': 'Europa League', 'Лига конференций': 'Conference League', 'Зона вылета': 'Relegation zone',
    '← Все матчи': '← All matches', 'Сводка': 'Summary', 'Голы': 'Goals', '(пенальти)': '(penalty)', 'пенальти': 'penalty',
    'Авторы голов в этом матче пока не добавлены.': 'The goalscorers for this match have not been added yet.',
    '↗ Поделиться матчем': '↗ Share match', '← Предыдущий': '← Previous', 'Следующий →': 'Next →',
    'Подробного отчёта об этом матче пока нет.': 'There is no detailed report on this match yet.',
    'Матч не найден.': 'Match not found.', 'Вернуться к списку': 'Back to the list',
    'пришли (с возвращением из аренды)': 'arrivals (including returns from loan)', 'ушли': 'departures', 'бесплатных трансферов': 'free transfers',
    'Пришли': 'Arrivals', 'Ушли': 'Departures', 'Фильтр трансферов': 'Transfer filter', '↓ Пришёл': '↓ Arrived', '↑ Ушёл': '↑ Left',
    'Откуда': 'From', 'Куда': 'To', 'Сумма': 'Fee', 'Контракт': 'Contract', 'Контракт у нового клуба': 'Contract at new club',
    'пришёл из': 'arrived from', 'ушёл в': 'left for',
    'Покупка': 'Purchase', 'Свободный агент': 'Free agent', 'Возвращение из аренды': 'Return from loan', 'Продажа': 'Sale', 'Аренда': 'Loan',
    'Бесплатно': 'Free', 'Не раскрыта': 'Undisclosed', 'Новый клуб не назван': 'New club not named',
    'Домашняя арена клуба в Мадриде. Открыта в 1947 году и названа в честь Сантьяго Бернабеу, многолетнего президента клуба. Позже стадион прошёл масштабную реконструкцию.': 'The club’s home ground in Madrid. It opened in 1947 and is named after Santiago Bernabéu, the club’s long-serving president. The stadium later underwent a major reconstruction.',
    'Открытие: 1947 год': 'Opened: 1947', 'Город: Мадрид': 'City: Madrid', 'Домашний клуб: Реал Мадрид': 'Home club: Real Madrid',
    'Вместимость, адрес и схему проезда можно добавить позже.': 'Capacity, address and directions can be added later.',
    'Схема расстановки': 'Formation', 'Схема': 'Formation', 'Футбольное поле с расстановкой': 'Football pitch with the formation',
    'Фильтр истории': 'History filter', 'Группы трофеев': 'Trophy groups', 'Годы побед': 'Winning years',
    'Всего трофеев в списке': 'Total trophies listed', 'Победы в Лиге чемпионов': 'Champions League wins',
    'Победы в финалах Кубка чемпионов': 'European Cup final wins',
    'Возраст': 'Age', 'Гражданство': 'Nationality', 'В клубе': 'At the club', 'Рыночная стоимость': 'Market value', 'Общее': 'General',
    'Предыдущий игрок': 'Previous player', 'Игрок': 'Player', 'Следующий игрок': 'Next player',
    'Клубные графики': 'Club charts', 'Кубки по десятилетиям': 'Cups by decade', 'Рост числа титулов': 'Growth in titles', 'Бомбардиры': 'Top scorers',
    'Нарастающее число титулов в Кубке чемпионов по годам побед.': 'Cumulative number of European Cup titles by year of victory.',
    'Голы за клуб во всех турнирах. Мбаппе — на 25 октября 2026 года; остальные цифры по открытым источникам, уточняйте при необходимости.': 'Goals for the club in all competitions. Mbappé’s figure is as of 25 October 2026; the other numbers come from open sources — please verify if needed.',
    'Сначала новые': 'Newest first', 'Сначала старые': 'Oldest first', 'Год': 'Year', 'Город': 'City', 'Соперник': 'Opponent', 'Счёт': 'Score',
    'Поиск: год, соперник, город…': 'Search: year, opponent, city…', 'Поиск по финалам': 'Search finals',
    'Неофициальный фан-сайт. Не связан с Real Madrid C.F. Названия и символы принадлежат их владельцам.': 'Unofficial fan site. Not affiliated with Real Madrid C.F. Names and symbols belong to their respective owners.',
    'Быстрые ссылки': 'Quick links', 'Наверх': 'Back to top', 'Закрыть': 'Close',
    'Поиск по сайту': 'Site search', 'Игрок, матч, новость, трансфер, раздел…': 'Player, match, news, transfer, section…', 'Поиск': 'Search',
    'выбор': 'select', 'открыть': 'open', 'поиск': 'search',
    'Разделы': 'Sections', 'Перейти в раздел': 'Go to section', 'Игроки': 'Players', 'Таблица': 'Table', 'Легенды': 'Legends',
    'Ничего не найдено. Попробуйте другое слово: фамилию, команду или раздел.': 'Nothing found. Try another word: a surname, a team or a section.',
    'В списке нет матчей с известным временем': 'There are no matches with a known time in the list',
    'Файл календаря скачан — откройте его, чтобы добавить матчи': 'Calendar file downloaded — open it to add the matches',
    'Ссылка на матч скопирована': 'Match link copied', 'Скопируйте адрес из строки браузера': 'Copy the address from the browser bar',
    'мячей за матч': 'goals per game', 'побед дома · в гостях': 'home · away wins',
    'Очки в Ла Лиге по матчам': 'La Liga points by game', 'Очки Реала в Ла Лиге по турам': 'Real’s La Liga points by round', 'Старт': 'Start',
    'По горизонтали — номер матча Реала в Ла Лиге. Победа — 3 очка, ничья — 1.': 'Horizontal axis — Real’s La Liga game number. A win is 3 points, a draw 1.',
    'Мячи в каждом матче': 'Goals in each game', 'забито': 'scored', 'пропущено': 'conceded',
    '7,5 и выше': '7.5 and above', '6,5–7,4': '6.5–7.4', 'ниже 6,5': 'below 6.5',
    'Минуты на поле': 'Minutes played', 'Старты': 'Starts', 'Выходы на замену': 'Substitute appearances', 'Жёлтые карточки': 'Yellow cards',
    'Красные карточки': 'Red cards', 'Рейтинг за матч': 'Match rating', 'Сейвы': 'Saves', 'Отражённые удары': 'Save percentage',
    'Пропущенные голы': 'Goals conceded', 'Сухие матчи': 'Clean sheets', 'Отражённые пенальти': 'Penalties saved', 'Точность передач': 'Pass accuracy',
    'Точность длинных передач': 'Long-pass accuracy', 'Выходы на перехват': 'Sweeper actions', 'Игра на выходах': 'Claims', 'Отборы': 'Tackles',
    'Перехваты': 'Interceptions', 'Выигранные единоборства (земля)': 'Ground duels won', 'Выигранные единоборства (воздух)': 'Aerial duels won',
    'Выносы': 'Clearances', 'Блокированные удары': 'Blocks', 'Длинные передачи': 'Long passes', 'Голевые передачи': 'Assists',
    'Ошибки, ведущие к голу': 'Errors leading to a goal', 'Фолы': 'Fouls', 'Передачи': 'Passes', 'Ключевые передачи': 'Key passes',
    'Точность паса': 'Pass accuracy', 'Прогрессивные передачи': 'Progressive passes', 'Проходы с мячом': 'Progressive carries',
    'Пройденная дистанция': 'Distance covered', ' км': ' km', 'Удары': 'Shots', 'Удары в створ': 'Shots on target',
    'Конверсия ударов': 'Shot conversion', 'Успешные обводки': 'Successful dribbles', 'Касания в штрафной': 'Touches in the box',
    'Реализованные пенальти': 'Penalties scored',
    'Старт ': 'Start', 'Загрузка…': 'Loading…',
    'Поиск 26/27': 'Search 26/27'
  },
  data: {
    asOf: 'data as of 8 November 2026',
    statsNote: '* Data as of 8 November 2026. Real’s last Champions League and La Liga titles came in 2023/24.',
    playersNote: 'Squad as of 8 November 2026. Appearances and goals — La Liga 2026/27 after 10 rounds (official LaLiga statistics); the matches against Racing (1 November), AEK (4 November) and Valencia (7 November) are not yet counted in individual statistics; there is no data for Rodrygo.',
    trophiesNote: 'Data as of 8 November 2026. In 2025/26 the club finished without trophies (for the first time since 2020/21) and has no trophies yet in 2026/27. Sources differ in small details — check against the club’s official website.',
    transfersNote: 'Fees are as reported by the media (Sports Mole, TeamTalk, Marca): the club mostly did not disclose them, and sources differ in the details. Data as of 8 November 2026.',
    leagueAsOf: 'as of 8 November 2026 · after round 12, without the Atlético — Barcelona match',
    leagueNote: 'Barcelona, Atlético, Athletic and Rayo Vallecano have played 11 games, the other clubs 12. The round 12 meeting of Atlético and Barcelona — 8 November, 21:00 Madrid time — is not included. Teams level on points are ordered by goal difference; the league uses a different order (head-to-head).',
    profilesSeason: 'La Liga 2026/27, after 10 rounds (as of 25 October 2026), official LaLiga statistics. Champions League not included.',
    profilesNote: 'Market value — Transfermarkt estimates as reported by the media; for some players the value is from April 2026 (shown in brackets).',
    stats: ['Founded', 'European Cups*', 'La Liga titles*', 'Bernabéu opened'],
    now: [['Head coach', 'José Mourinho'], ['President', 'Florentino Pérez'], ['Captain', 'Federico Valverde'], ['Vice-captain', 'Vinícius Júnior'], ['La Liga: 30 points after 12 games', '2nd place'], ['Champions League wins', '4 of 4']],
    news: [
      ['Valencia 0:3 Real: eighth win in a row',
        'Valverde, Arda Güler and Kylian Mbappé scored at Mestalla; Valencia’s Gayà was sent off in the 79th minute.',
        'Real won 3:0 in Valencia. Valverde opened the scoring with a shot from the edge of the box after Mbappé’s free kick hit the wall and fell to him (sources give different minutes, from the 28th to the 30th). In the 36th minute Arda Güler scored with his first touch from Bellingham’s pull-back. In the 75th Mbappé beat goalkeeper Dimitrievski after a pass from Güler — his seventh match in a row with a goal. In the 79th minute Gayà was sent off for fouling Mbappé, who was clean through. Real have 30 points and are level with Barcelona, who have a game fewer and played Atlético the same evening (that result is not yet on the site). Vinícius missed the game through suspension and can return for the game against Celta on 21 November. Next come the international break, then Celta (21 November, home) and PSV (24 November, home).'],
      ['AEK 2:3 Real: a win in stoppage time',
        'Valverde’s goal in the 90+2nd minute gave Real a fourth win in four league-phase games of the Champions League.',
        'Real came from behind twice in Athens. Koita opened the scoring in the 12th minute and Bellingham equalised in the 32nd (a goal in the 28th minute was ruled out for offside). Pilios put AEK ahead in the 75th minute, Mbappé levelled three minutes later, and in the 90+2nd substitute Valverde scored the winner with a long-range shot. Koita was sent off after the final whistle for dissent. Real have 12 points out of 12 and are second in the overall table behind PSG (goal difference +6 against +15). Vinícius missed the game through suspension. Goal minutes are from ESPN; other sources differ by a minute or two.'],
      ['Racing 0:3 Real: sixth win in a row',
        'Mbappé’s penalty in the 11th minute, Bellingham in the 21st and Diomande in the 36th secured the win in Santander.',
        'Real won 3:0 at El Sardinero, with all the goals coming in the first half: Mbappé converted a penalty (11th minute), then Bellingham (21st) and Diomande (36th) scored. It is the sixth straight win in all competitions. Mbappé took his La Liga tally to 12. Racing had been unbeaten at home before the game, and their last win over Real came in April 2007. Vinícius missed the game through suspension. After the match Mourinho said the team could have won 4:0 or 5:0. Real are third in the table on 27 points; Barcelona have 30. The awarding of the penalty caused debate.'],
      ['Clásico: Barcelona 1:2 Real',
        'Kylian Mbappé scored both goals at Camp Nou, in the 41st and 88th minutes. The second was his 100th for the club.',
        'Mbappé opened the scoring in the 41st minute — his shot deflected off Gerard Martín. Raphinha equalised, and in the 88th minute Mbappé, set up by Camavinga, won the game for Real. Afterwards he called the 100-goal milestone “just a detail” next to the team’s win. After 10 rounds Real are third, three points off the leader.'],
      ['Champions League: Real 4:1 RB Leipzig',
        'Third win in three league-phase games, after Inter (2:1) and Roma (4:3 away).',
        'Real beat Leipzig 4:1 at home. Earlier in the league phase came wins over Inter 2:1 (8 September) and Roma 4:3 away (14 October). Next: AEK (away, 4 November), PSV (24 November, home) and Arsenal (9 December, away).'],
      ['Real 4:1 Sevilla', 'A confident home win in round 9 of La Liga.',
        'Real scored four against Sevilla and conceded one. A week later the team won the Clásico at Camp Nou.'],
      ['Champions League: Roma 3:4 Real', 'A high-scoring away win in the second league-phase game.',
        'Real won 4:3 away at Roma. It was their second win in the 2026/27 Champions League after the 2:1 against Inter.'],
      ['Yan Diomande is a Real Madrid player', 'The club officially announced the signing of the winger from RB Leipzig. The contract runs for seven seasons.',
        'The deal runs until 30 June 2033. The club did not officially disclose the fee; according to Marca it was around €125m plus add-ons of up to €10–15m.'],
      ['First signings: Cucurella, Konaté and Bernardo Silva', 'By the end of June the club had signed defenders Marc Cucurella and Ibrahima Konaté and midfielder Bernardo Silva.',
        'Cucurella joined from Chelsea (six-year contract), Konaté from Liverpool as a free agent (four years) and Bernardo Silva from Manchester City as a free agent (two years).'],
      ['Carvajal, Alaba and Ceballos leave the club', 'Dani Ceballos left by mutual consent on 26 June; the contracts of Carvajal and Alaba expired on 1 July.',
        'Dani Carvajal and David Alaba left the club as free agents.'],
      ['Rüdiger extends his contract', 'Centre-back Antonio Rüdiger signed a new one-year deal, running to 2027.',
        'The extension was completed on 16 June 2026.'],
      ['José Mourinho — new head coach', 'The club announced Mourinho’s appointment on 11 June 2026, the opening day of the World Cup. He started work on 13 July.',
        'Before him, the team had been led since January 2026 by Álvaro Arbeloa, who replaced Xabi Alonso.']
    ],
    legends: [
      'The symbol of the club’s first great era in the European Cup.', 'One of the greatest goalscorers in football history.',
      'The only player with six European Cups.', 'Captain and academy graduate, a club legend.',
      'Long-time captain and a symbol of reliability.', 'The club’s all-time top scorer.'
    ],
    bios: [
      'France forward. In La Liga 2026/27 he has scored 11 goals and provided 2 assists in 10 games. On 25 October 2026 he scored his 100th goal for Real. La Liga’s top scorer in 2025/26 (25 goals).',
      'Club vice-captain. In La Liga 2026/27 he has 1 goal and 3 assists in 8 games. Suspended after a red card: he missed the games against Racing, AEK and Valencia and could return for the game against Celta on 21 November.',
      'England midfielder. La Liga 2026/27: 3 goals and 3 assists in 10 games, 74 ground duels won.',
      'Team captain. In La Liga 2026/27 he has played all 10 games — 801 minutes — and provided 2 assists.',
      'Turkey midfielder. La Liga 2026/27: 2 goals and 2 assists in 10 games.',
      'Provided the assist for Mbappé’s winning goal in the Clásico on 25 October 2026. In La Liga 2026/27 he mostly comes off the bench: 2 starts in 9 games.',
      'France defensive midfielder. In La Liga 2026/27 he has played 6 games — 448 minutes.',
      'Belgium goalkeeper. La Liga 2026/27: 9 games, 29 saves and 2 clean sheets.',
      'The team’s second goalkeeper. He has played one La Liga 2026/27 game — 90 minutes.',
      'Brazil centre-back. In La Liga 2026/27 he has spent just 5 minutes on the pitch, in one game.',
      'Germany centre-back. On 16 June 2026 he extended his contract by a year, to 2027. La Liga 2026/27: 4 games, 1 goal.',
      'Spain centre-back. La Liga 2026/27: 8 games, 44 clearances and a red card.',
      'Academy graduate, centre-back. He has not yet played in La Liga 2026/27; according to Sports Mole he is out for about three months with a stress fracture.',
      'England right-back. La Liga 2026/27: 6 games and 1 assist.',
      'Left-back. La Liga 2026/27: 5 games and 1 goal.',
      'France centre-back. Joined from Liverpool as a free agent on a four-year contract. He has played 9 La Liga 2026/27 games — 810 minutes.',
      'Spain left-back. Joined from Chelsea (reportedly for £52m, according to Sports Mole). He has played 10 La Liga 2026/27 games.',
      'Netherlands right-back. Joined from Inter (reportedly for £17m, according to Sports Mole). He has played 8 La Liga 2026/27 games.',
      'Portugal midfielder. Joined from Manchester City as a free agent on a two-year contract. La Liga 2026/27: 8 games, 383 minutes.',
      'Academy graduate, midfielder. He has not yet played in La Liga 2026/27.',
      'Brazilian winger, at the club since 2019. He does not appear in the official La Liga 2026/27 statistics; in October he was listed among the absent players; according to Sports Mole he has a knee injury and is expected back in early 2027.',
      'Morocco attacking midfielder. La Liga 2026/27: 4 games, 120 minutes.',
      'Brazilian forward. He played on loan at Lyon from 1 January 2026 and returned to Real in the summer. He has played 2 La Liga 2026/27 games.',
      'Forward. Joined from Levante (reportedly for £21m, according to Sports Mole). In La Liga 2026/27 he has scored 2 goals as a substitute: 6 games, just 32 minutes in total.',
      'Winger. Joined from RB Leipzig, contract until 30 June 2033. La Liga 2026/27: 2 goals and 28 successful dribbles in 10 games.'
    ],
    timeline: [
      ['Club founded', 'The club was founded in Madrid under the name “Madrid Football Club”.'],
      ['The “Real” title', 'King Alfonso XIII granted the club the title “Real” — “royal”.'],
      ['Bernabéu takes charge', 'Santiago Bernabéu becomes president and shapes the club for decades.'],
      ['Stadium opens', 'The arena, later named after Santiago Bernabéu, opens.'],
      ['First European Cup', 'Real win the first edition of the tournament — and go on to win five in a row.'],
      ['Sixth trophy', 'Victory over Partizan in the final in Brussels.'],
      ['Seventh Cup', 'A return to the top of Europe after 32 years.'],
      ['La Décima', 'The tenth European Cup — victory over Atlético in Lisbon.'],
      ['Three in a row', 'Wins in 2016, 2017 and 2018 — three finals in a row.'],
      ['Fifteenth title', 'Victory over Borussia at Wembley in London.'],
      ['FIFA Intercontinental Cup', 'On 18 December 2024 the club won the new FIFA Intercontinental Cup.'],
      ['Change of coach', 'In January 2026 Xabi Alonso left the club by mutual consent and Álvaro Arbeloa took charge.'],
      ['Champions League quarter-final', 'In 2025/26 Real beat Manchester City 5:1 on aggregate but lost 4:6 to Bayern in the quarter-final. The season ended without trophies — for the first time since 2020/21.'],
      ['The Mourinho era', 'On 11 June 2026 the club announced the appointment of José Mourinho. He started work on 13 July.'],
      ['Clásico and Mbappé’s 100th goal', 'On 25 October Real won 2:1 at Camp Nou. Mbappé scored both goals — the second was his 100th for the club.'],
      ['A perfect start in the Champions League', 'By 4 November Real had won all four league-phase games: Inter 2:1, Roma 4:3, RB Leipzig 4:1 and AEK 3:2 in Athens.']
    ],
    faq: [
      ['Who coaches Real Madrid now?', 'Since July 2026, José Mourinho. The club announced his appointment on 11 June 2026.'],
      ['How did Real do in 2025/26?', 'The club finished second in La Liga (86 points), behind Barcelona, went out to Bayern in the Champions League quarter-final and finished without trophies.'],
      ['Why is the club called “Los Blancos”?', 'The nickname means “the whites”, after the club’s traditional white kit.'],
      ['What does “Real” in the name mean?', 'It is the Spanish word for “royal”. The title was granted to the club by King Alfonso XIII in 1920.'],
      ['How is Real doing in the 2026/27 Champions League?', 'After four league-phase games Real have 12 points out of 12 and are second (goal difference +6) behind PSG — as of 5 November 2026.'],
      ['Whose stadium is it?', 'The club’s home ground is the Santiago Bernabéu in Madrid, named after the club’s long-serving president.']
    ],
    transfers: [
      'plus add-ons of up to €10–15m (Marca); British outlets — £107–115m', '£51.8–52m according to different sources',
      'release clause, about £21m', 'release clause under his contract', 'free agent', 'free agent',
      'on loan at Lyon from 1 January 2026, returned in the summer', 'about €40m', '€10m and 30% of a future resale',
      '€4m; 50% of a future resale stays with Real', 'according to Sports Mole', 'according to Sports Mole',
      'the deal reportedly includes a buy-back option', 'loan terms not disclosed',
      'left by mutual consent on 26 June; joined Betis on the last day of the window',
      'contract expired on 1 July; joined Udinese in September, according to TeamTalk', 'contract expired on 1 July'
    ],
    matchFacts: {
      '2026-11-07': ['Eighth straight win in all competitions.', 'Mbappé has scored in seven matches in a row.', 'Valencia’s Gayà was sent off in the 79th minute for fouling Mbappé, who was clean through.', 'Sources give different minutes for Valverde’s goal (28–30), so it is shown as approximate.'],
      '2026-11-04': ['Fourth win in four league-phase games: 12 points out of 12.', 'The second comeback of the Champions League season (after Roma).', 'Bellingham’s first goal, in the 28th minute, was ruled out for offside.', 'Koita was sent off after the final whistle. Goal minutes are from ESPN; other sources differ by a minute or two.'],
      '2026-11-01': ['Sixth straight win in all competitions.', 'Mbappé took his La Liga tally to 12.', 'Racing had been unbeaten at home before the match; their last win over Real was in April 2007.', 'Vinícius did not play because of suspension.'],
      '2026-10-25': ['Barcelona’s first La Liga defeat of 2026/27.', 'The second goal was Mbappé’s 100th for Real.']
    }
  },
  rules: {
    place: 'Position $1',
    titleD: '⏱ $1d $2h $3m to kick-off · Real — @4', titleH: '⏱ $1h $2m to kick-off · Real — @3',
    since: 'since $1', clubSince: 'At the club since $1', years: '$1 years', yearsNew: '$1 years at the new club',
    games: '$1 games', pts: '$1 pts', of: '$1 of $2', matchday: 'Matchday $1', phase: 'League phase, match $1',
    nthMatch: 'Match $1: $2 pts', winsOf: 'wins ($1 of $2)', gd: 'goal difference $1', decade: '$1s',
    scoreVs: '@1 $2 @3', teamComma: '@1, $2', teamColon: '@1: $2',
    cupN: 'European Cup #$1', finalLine: 'Final in ~1. Opponent: @2. Score: @3.', aet: '$1 (a.e.t.)', pens: '$1 ($2 on pens)',
    fromNews: 'From the news story “@1” of $2.',
    summary: '@1 in @2: Real @3 against @4 — $5 (Real’s score first).',
    madridTime: '$1 Madrid time', yourTime: '$1 your time', mostExp: 'most expensive signing: @1',
    feeAprEur: '€#1m (Apr 2026)', feeE: '$1€#2m', feeP: '$1£#2m',
    untilDate: 'until $1', untilYear: 'until $1', untilJune: 'until June $1',
    biggest: 'Games in order, all competitions; click a bar to open the match. Biggest win: @1, $2.',
    finalsNote: 'European Cup final wins by decade. Total: $1.',
    formTeam: 'Team form: last $1 games', formRating: 'Form: rating over the last $1 games', avgRating: 'Average rating over the period: $1.',
    noRating: 'There are no player match ratings yet, so team form is shown: $1 points out of $2. To see player form, add form in profiles.js.',
    labSeason: '@1 A dash means no data in open sources (add it in profiles.js).', emptyYear: 'No data — fill in profiles.js'
  }
};

;
/* ======== lang-es.js ======== */
/* Español. ui — интерфейс (ключ — русский текст), data — переводы данных из data.js (в том же порядке), rules — шаблоны составных строк. */
window.I18N = window.I18N || {};
window.I18N.es = {
  ui: {
    'Тактическая доска': 'Pizarra táctica',
    'Выберите схему и перетаскивайте игроков. Нажмите на игрока на поле, затем на имя в списке — и он займёт это место. Включите «Стрелки», чтобы рисовать на поле.': 'Elige un esquema y arrastra a los jugadores. Pulsa un jugador del campo y luego un nombre de la lista para que ocupe ese puesto. Activa «Flechas» para dibujar sobre el campo.',
    'Схема': 'Esquema',
    'Подставить состав': 'Rellenar la alineación',
    'Стрелки': 'Flechas',
    'Отменить стрелку': 'Deshacer flecha',
    'Очистить стрелки': 'Borrar flechas',
    'Скачать картинку': 'Descargar imagen',
    'Состав на доске подставляется автоматически из списка игроков и не является прогнозом. Расстановка и стрелки сохраняются в этом браузере.': 'La alineación de la pizarra se rellena automáticamente con la lista de jugadores y no es una predicción. La disposición y las flechas se guardan en este navegador.',
    'Карусель': 'Carrusel',
    'Сетка': 'Cuadrícula',
    'Звук и вибрация': 'Sonido y vibración',
    'Выкл': 'Desactivado',
    'Вкл': 'Activado',
    'Сегодня матч': 'Día de partido',
    'Матч начался': 'El partido ha comenzado',
    'по вашему времени': 'hora local',
    'Начало через': 'Comienza en',
    'Подиум бомбардиров': 'Podio de goleadores',
    '🎉 Салют': '🎉 Celebrar',
    'Атака и защита': 'Ataque y defensa',
    'Пропущено за матч (меньше — лучше)': 'Goles en contra por partido (menos es mejor)',
    'Забито за матч': 'Goles a favor por partido',
    'Много забивают, мало пропускают': 'Marcan mucho y encajan poco',
    'Мало забивают, много пропускают': 'Marcan poco y encajan mucho',
    'Каждая точка — клуб Ла Лиги: размер зависит от очков, пунктир — средние значения лиги. Подписаны лидеры, «Реал» и клубы с крайними значениями; остальных видно при наведении.': 'Cada punto es un club de La Liga: su tamaño depende de los puntos y las líneas discontinuas son las medias de la liga. Están rotulados los líderes, el Real y los clubes con valores extremos; el resto se ve al pasar el cursor.',
    'перейти в раздел (g, затем первая буква)': 'ir a una sección (g y luego una letra)',
    'показать все сочетания клавиш': 'mostrar todos los atajos de teclado',
    'О проекте': 'Sobre el proyecto',
    'Для чего этот сайт': 'Para qué sirve este sitio',
    'Учебный проект: неофициальный фан-сайт футбольного клуба «Реал Мадрид». Сайт работает без сервера и без сборки — достаточно открыть файл index.html в браузере.': 'Proyecto escolar: un sitio de aficionados no oficial del Real Madrid. No necesita servidor ni compilación: basta con abrir index.html en el navegador.',
    'Игроков в составе': 'Jugadores en la plantilla',
    'Матчей сезона в базе': 'Partidos de la temporada',
    'Новостей': 'Noticias',
    'Языка интерфейса': 'Idiomas de la interfaz',
    'Темы оформления': 'Temas visuales',
    'Как это устроено': 'Cómo funciona',
    'Данные': 'Datos',
    'Клубная информация лежит в файлах data.js и profiles.js.': 'La información del club está en los archivos data.js y profiles.js.',
    'JavaScript': 'JavaScript',
    'Скрипты собирают страницы, графики, таблицы и календарь.': 'Los scripts construyen las páginas, los gráficos, las tablas y el calendario.',
    'CSS': 'CSS',
    'Оформление, анимации и адаптивность под телефон и печать.': 'Estilo, animaciones y adaptación a móvil e impresión.',
    'Переводы': 'Traducciones',
    'Движок переводов показывает сайт на русском, английском или испанском.': 'Un motor de traducción muestra el sitio en ruso, inglés o español.',
    'Технологии': 'Tecnologías',
    'HTML5': 'HTML5',
    'CSS3': 'CSS3',
    'Семантическая разметка: разделы, навигация, подписи для программ чтения с экрана.': 'Marcado semántico: secciones, navegación y etiquetas para lectores de pantalla.',
    'Переменные, сетки, стеклянные панели, анимации, три режима оформления, печатная версия.': 'Variables, cuadrículas, paneles de cristal, animaciones, tres modos visuales y versión para imprimir.',
    'JavaScript без фреймворков': 'JavaScript sin frameworks',
    'Переходы между разделами, графики на SVG, поиск, календарь, обратный отсчёт до матча.': 'Transiciones entre secciones, gráficos SVG, búsqueda, calendario y cuenta atrás hasta el próximo partido.',
    'Данные отдельно от кода': 'Datos separados del código',
    'Чтобы обновить сайт, достаточно поправить data.js и profiles.js — вёрстку трогать не нужно.': 'Para actualizar el sitio basta con editar data.js y profiles.js, sin tocar el diseño.',
    'Три языка': 'Tres idiomas',
    'Русский, английский и испанский. Выбор языка запоминается в браузере.': 'Ruso, inglés y español. El idioma elegido se recuerda en el navegador.',
    'Удобство': 'Comodidad',
    'Работа с клавиатуры, видимый фокус, учёт системной настройки «уменьшить анимацию».': 'Uso con teclado, foco visible y respeto del ajuste del sistema «reducir movimiento».',
    'Возможности сайта': 'Funciones del sitio',
    'Матч-центр: календарь, результаты, таблица Ла Лиги, сезон в цифрах': 'Centro de partidos: calendario, resultados, tabla de La Liga y temporada en cifras',
    'Страница каждого матча с авторами голов и шкалой минут': 'Página de cada partido con goleadores y línea de minutos',
    'Лаборатория данных: карточки игроков, радар, графики формы': 'Laboratorio de datos: fichas de jugadores, radar y gráficos de forma',
    'Сравнение двух игроков с радарной диаграммой': 'Comparación de dos jugadores con gráfico radar',
    'Таблица Ла Лиги с переключением на график очков': 'Tabla de La Liga con cambio a gráfico de puntos',
    'Поиск по всему сайту (Ctrl+K)': 'Búsqueda en todo el sitio (Ctrl+K)',
    'Избранные игроки и матчи': 'Jugadores y partidos favoritos',
    'Добавление матча в календарь (файл .ics)': 'Añadir un partido al calendario (archivo .ics)',
    'Тёмная, светлая темы и режим «День матча»': 'Temas oscuro y claro y modo «Día de partido»',
    'Печатная версия страниц': 'Versión imprimible de las páginas',
    'Файлы проекта': 'Archivos del proyecto',
    'разметка всех разделов': 'marcado de todas las secciones',
    'оформление и анимации': 'estilo y animaciones',
    'новости, матчи, таблица, трофеи': 'noticias, partidos, tabla, trofeos',
    'карточки и статистика игроков': 'fichas y estadísticas de jugadores',
    'работа разделов': 'lógica de las secciones',
    'поиск, настройки вида, графики, эффекты': 'búsqueda, ajustes de vista, gráficos, efectos',
    'переводы интерфейса и данных': 'traducciones de la interfaz y los datos',
    'вся логика: разделы, поиск, графики, эффекты': 'toda la lógica: secciones, búsqueda, gráficos, efectos',
    'герб клуба, встроенный в код': 'escudo del club incrustado en el código',
    'Горячие клавиши': 'Atajos de teclado',
    'открыть поиск': 'abrir la búsqueda',
    'закрыть окно или панель': 'cerrar una ventana o un panel',
    'Источники и ограничения': 'Fuentes y limitaciones',
    'Данные собраны вручную из открытых источников (ESPN, LaLiga, Sports Mole, Marca и других).': 'Los datos se recopilaron a mano de fuentes abiertas (ESPN, LaLiga, Sports Mole, Marca y otras).',
    'Личная статистика игроков обновляется вручную и может отставать от последних матчей.': 'Las estadísticas individuales se actualizan a mano y pueden ir por detrás de los últimos partidos.',
    'Сайт неофициальный и не связан с клубом Real Madrid C.F.': 'El sitio no es oficial y no está vinculado al Real Madrid C.F.',
    'Сезон матч за матчем': 'La temporada, partido a partido',
    'Листайте или тяните ленту. Нажмите на карточку, чтобы открыть матч.': 'Desliza o arrastra la cinta. Pulsa una tarjeta para abrir el partido.',
    'Матчи сезона': 'Partidos de la temporada',
    'Игрок и среднее по составу': 'Jugador y media de la plantilla',
    'Среднее по составу': 'Media de la plantilla',
    'График очков': 'Gráfico de puntos',
    'Профиль на 90 минут': 'Perfil por 90 minutos',
    'Для вратарей радар не строится.': 'El radar no se genera para porteros.',
    'Радар доступен, если у обоих игроков не меньше 200 минут в Ла Лиге.': 'El radar está disponible si ambos jugadores tienen al menos 200 minutos en La Liga.',
    'Каждая ось — доля от лучшего значения в составе. Ла Лига 2026/27, после 10 туров; игроки от 200 минут.': 'Cada eje es la proporción del mejor valor de la plantilla. La Liga 2026/27, tras 10 jornadas; jugadores con más de 200 minutos.',
    'Справа от очков — сыгранные матчи.': 'A la derecha de los puntos figuran los partidos jugados.',
    'Ход матча': 'Desarrollo del partido',
    'Радар': 'Radar',
    'Форма': 'Forma', 
    'Настройки вида': 'Ajustes de vista', 'Тёмная': 'Oscuro', 'Светлая': 'Claro', 'День матча': 'Día de partido', 'Карточки': 'Tarjetas', 'Крупно': 'Grandes', 'Компактно': 'Compactas',
    'Размер шрифта': 'Tamaño de letra', 'Сбросить настройки': 'Restablecer ajustes', 'Лента клуба': 'Cinta del club', 'Последний матч': 'Último partido', 'Следующий матч': 'Próximo partido', 'Лучший бомбардир': 'Máximo goleador',
    'Real Madrid — неофициальный фан-сайт': 'Real Madrid — web no oficial de aficionados',
    'Неофициальный фан-сайт о футбольном клубе Реал Мадрид: новости, клуб, стадион, история и данные.': 'Web no oficial de aficionados del Real Madrid: noticias, club, estadio, historia y datos.',
    'Сезон 2026 / 2027': 'Temporada 2026 / 2027', 'Сезон 2026/2027': 'Temporada 2026/2027',
    'Новости': 'Noticias', 'Клуб': 'Club', 'Состав': 'Plantilla', 'Матчи': 'Partidos', 'Трансферы': 'Fichajes', 'Стадион': 'Estadio',
    'История': 'Historia', 'Трофеи': 'Trofeos', 'Лаборатория данных': 'Laboratorio de datos',
    'Открыть меню': 'Abrir menú', 'Закрыть меню': 'Cerrar menú', 'Real Madrid — на главную': 'Real Madrid — inicio', 'Основное меню': 'Menú principal',
    'Поиск по сайту (Ctrl+K)': 'Buscar en el sitio (Ctrl+K)', 'Переключить тему': 'Cambiar tema', 'Тема': 'Tema', 'Язык': 'Idioma',
    'Hala Madrid · основан в 1902 году': 'Hala Madrid · fundado en 1902',
    'Новости, история, стадион и статистика королевского клуба — всё в одном месте. Состав, трофеи и данные сезона 2026/27.': 'Noticias, historia, estadio y estadísticas del club real: todo en un solo lugar. Plantilla, trofeos y datos de la temporada 2026/27.',
    'Состав 26/27': 'Plantilla 26/27', 'Тур по «Бернабеу»': 'Tour por el Bernabéu', 'Сводка 2026/27': 'Resumen 2026/27', 'Сводка сезона': 'Resumen de la temporada',
    'Белые': 'Los Blancos', 'Мадрид': 'Madrid', 'Капитан и вице-капитан': 'Capitán y vicecapitán', 'Девиз клуба': 'Lema del club',
    'Главный тренер': 'Entrenador', 'Президент': 'Presidente', 'Капитан': 'Capitán', 'Вице-капитан': 'Vicecapitán',
    'Свежее из клуба': 'Lo último del club', 'О клубе': 'Sobre el club', 'Игроки и статистика': 'Jugadores y estadísticas',
    'Сезон 2026/27': 'Temporada 2026/27', 'Лето 2026': 'Verano de 2026', 'Мадрид · с 1947 года': 'Madrid · desde 1947', 'С 1902 года': 'Desde 1902',
    'Зал славы': 'Salón de la fama', 'Данные и аналитика': 'Datos y análisis',
    'Состав 2026/27': 'Plantilla 2026/27', 'Матч-центр': 'Centro de partidos', 'Стадион Бернабеу': 'Estadio Bernabéu', 'История клуба': 'Historia del club',
    'Зал трофеев': 'Sala de trofeos', 'Клуб сегодня': 'El club hoy', 'Легенды клуба': 'Leyendas del club', 'Вопросы и ответы': 'Preguntas y respuestas',
    'Ближайший матч': 'Próximo partido', 'дней': 'días', 'часов': 'horas', 'минут': 'minutos', 'секунд': 'segundos',
    'день до матча': 'día para el partido', 'дня до матча': 'días para el partido', 'дней до матча': 'días para el partido',
    'Форма · пять последних матчей': 'Forma · últimos cinco partidos', '＋ В календарь': '＋ Añadir al calendario',
    'Матч начался или только что завершился. Обновите страницу позже — календарь переключится на следующую игру.': 'El partido ha empezado o acaba de terminar. Actualiza la página más tarde: el calendario pasará al siguiente partido.',
    'Календарь обновится: ближайших матчей в списке пока нет.': 'El calendario se actualizará: aún no hay próximos partidos en la lista.',
    'время начала уточняется': 'hora de inicio por confirmar', 'время уточняется': 'hora por confirmar',
    'Дома, «Сантьяго Бернабеу»': 'En casa, Santiago Bernabéu', 'дома, «Сантьяго Бернабеу»': 'en casa, Santiago Bernabéu', 'Дома': 'En casa', 'В гостях': 'Fuera',
    'дома': 'en casa', 'в гостях': 'fuera', 'выиграл': 'ganó al', 'проиграл': 'perdió ante el', 'сыграл вничью': 'empató con el',
    'Сезон 2026/27 в цифрах': 'Temporada 2026/27 en cifras', 'побед': 'victorias', 'победы': 'victorias', 'поражения': 'derrotas', 'мячи': 'goles', '«сухих» матчей': 'porterías a cero',
    'Подробнее в матч-центре →': 'Más en el centro de partidos →',
    'Бомбардиры Реала в Ла Лиге': 'Goleadores del Real en La Liga',
    'Голы после 10 туров (LaLiga) и мячи матчей 1 и 7 ноября.': 'Goles tras 10 jornadas (LaLiga) más los goles de los partidos del 1 y el 7 de noviembre.',
    'Ничего не найдено.': 'No se ha encontrado nada.', 'Поиск по новостям…': 'Buscar noticias…', 'Поиск по новостям': 'Buscar noticias', 'Категории': 'Categorías',
    'год основания': 'año de fundación', 'город': 'ciudad', '«белые» — прозвище': '«los blancos»: apodo', 'Белый': 'Blanco', 'цвет формы': 'color de la camiseta',
    'Все': 'Todos', 'Вратари': 'Porteros', 'Защитники': 'Defensas', 'Полузащитники': 'Centrocampistas', 'Нападающие': 'Delanteros', '★ Избранные': '★ Favoritos',
    'Вратарь': 'Portero', 'Защитник': 'Defensa', 'Полузащитник': 'Centrocampista', 'Нападающий': 'Delantero', 'Вингер': 'Extremo',
    'вратарь': 'portero', 'защитник': 'defensa', 'полузащитник': 'centrocampista', 'нападающий': 'delantero',
    'Защита': 'Defensa', 'Полузащита': 'Mediocampo', 'Атака': 'Ataque',
    'Поиск игрока или страны…': 'Buscar jugador o país…', 'Поиск игрока': 'Buscar jugador', 'Сортировка': 'Ordenar', 'Позиции': 'Posiciones',
    'По голам': 'Por goles', 'По матчам': 'Por partidos', 'По имени': 'Por nombre',
    'Новичок 2026': 'Fichaje de 2026', 'воспитанник': 'canterano', 'В клубе воспитанник': 'En el club: canterano',
    'Голы в Ла Лиге 26/27 относительно лучшего бомбардира': 'Goles en La Liga 26/27 respecto al máximo goleador',
    'матчей': 'partidos', 'голов': 'goles', 'матчей в Ла Лиге 26/27': 'partidos en La Liga 26/27', 'голов в Ла Лиге 26/27': 'goles en La Liga 26/27', 'голов за матч': 'goles por partido',
    'Игроки не найдены.': 'No se han encontrado jugadores.', 'Пока никого нет: нажмите ★ на карточке игрока.': 'Todavía no hay nadie: pulsa ★ en la ficha de un jugador.',
    'В избранное': 'Añadir a favoritos', 'В сравнение (слева)': 'Al comparador (izquierda)', 'В сравнение (справа)': 'Al comparador (derecha)', 'Карточка в лаборатории': 'Ficha en el laboratorio',
    'Сравнение игроков': 'Comparador de jugadores', 'Первый игрок': 'Primer jugador', 'Второй игрок': 'Segundo jugador',
    'Матчей (Ла Лига 26/27)': 'Partidos (La Liga 26/27)', 'Голов (Ла Лига 26/27)': 'Goles (La Liga 26/27)', 'Голов за матч': 'Goles por partido',
    'Календарь': 'Calendario', 'Результаты': 'Resultados', 'Таблица Ла Лиги': 'Clasificación de La Liga', 'Сезон в цифрах': 'Temporada en cifras',
    'пн': 'lun', 'вт': 'mar', 'ср': 'mié', 'чт': 'jue', 'пт': 'vie', 'сб': 'sáb', 'вс': 'dom',
    'победа': 'victoria', 'поражение': 'derrota', 'ничья': 'empate', 'впереди': 'por jugar', 'Победа': 'Victoria', 'Победы': 'Victorias', 'Ничья': 'Empate', 'Ничьи': 'Empates', 'Поражение': 'Derrota', 'Поражения': 'Derrotas',
    'Ближайшие матчи': 'Próximos partidos', '⬇ Скачать календарь (.ics)': '⬇ Descargar calendario (.ics)',
    'Предыдущий месяц': 'Mes anterior', 'Следующий месяц': 'Mes siguiente',
    'Список неполный: матчи Лиги чемпионов и ближайшие игры Ла Лиги. Время начала — по вашему часовому поясу; даты Ла Лиги могут сдвинуться.': 'La lista está incompleta: partidos de la Liga de Campeones y los próximos de La Liga. Las horas son de tu zona horaria; las fechas de La Liga pueden cambiar.',
    'Ближайших матчей в списке нет.': 'No hay próximos partidos en la lista.',
    'победы · ничьи · поражения': 'victorias · empates · derrotas', 'Все турниры': 'Todas las competiciones', 'Турнир': 'Competición',
    'Нажмите на матч, чтобы открыть его страницу. Счёт в списке показан по порядку «хозяева — гости».': 'Pulsa un partido para abrir su página. El marcador de la lista sigue el orden «local — visitante».',
    'Ла Лига 2026/27, на 8 ноября 2026 · после 12-го тура, без матча «Атлетико» — «Барселона». Нажмите на заголовок столбца, чтобы отсортировать.': 'La Liga 2026/27, a 8 de noviembre de 2026 · tras la jornada 12, sin el partido Atlético — Barcelona. Pulsa el encabezado de una columna para ordenar.',
    'Команда': 'Equipo', 'Мячи': 'Goles', 'И': 'PJ', 'В': 'G', 'Н': 'E', 'П': 'P', 'Р': 'DG', 'О': 'Pts',
    'Разница мячей по матчам': 'Diferencia de goles por partido', 'Разница мячей по матчам сезона': 'Diferencia de goles por partido esta temporada',
    'Забито — пропущено': 'A favor — en contra', 'Разница мячей': 'Diferencia de goles', 'Очки': 'Puntos',
    'Лига Европы': 'Liga Europa', 'Лига конференций': 'Liga de la Conferencia', 'Зона вылета': 'Descenso',
    '← Все матчи': '← Todos los partidos', 'Сводка': 'Resumen', 'Голы': 'Goles', '(пенальти)': '(penalti)', 'пенальти': 'penalti',
    'Авторы голов в этом матче пока не добавлены.': 'Los goleadores de este partido aún no se han añadido.',
    '↗ Поделиться матчем': '↗ Compartir partido', '← Предыдущий': '← Anterior', 'Следующий →': 'Siguiente →',
    'Подробного отчёта об этом матче пока нет.': 'Todavía no hay una crónica detallada de este partido.',
    'Матч не найден.': 'Partido no encontrado.', 'Вернуться к списку': 'Volver a la lista',
    'пришли (с возвращением из аренды)': 'llegadas (incluidos regresos de cesión)', 'ушли': 'salidas', 'бесплатных трансферов': 'traspasos gratuitos',
    'Пришли': 'Llegadas', 'Ушли': 'Salidas', 'Фильтр трансферов': 'Filtro de fichajes', '↓ Пришёл': '↓ Llegó', '↑ Ушёл': '↑ Se fue',
    'Откуда': 'Procedencia', 'Куда': 'Destino', 'Сумма': 'Importe', 'Контракт': 'Contrato', 'Контракт у нового клуба': 'Contrato en el nuevo club',
    'пришёл из': 'llegó de', 'ушёл в': 'se fue a',
    'Покупка': 'Compra', 'Свободный агент': 'Agente libre', 'Возвращение из аренды': 'Regreso de cesión', 'Продажа': 'Venta', 'Аренда': 'Cesión',
    'Бесплатно': 'Gratis', 'Не раскрыта': 'No revelado', 'Новый клуб не назван': 'Nuevo club sin confirmar',
    'Домашняя арена клуба в Мадриде. Открыта в 1947 году и названа в честь Сантьяго Бернабеу, многолетнего президента клуба. Позже стадион прошёл масштабную реконструкцию.': 'El estadio del club en Madrid. Se inauguró en 1947 y lleva el nombre de Santiago Bernabéu, presidente del club durante muchos años. Más tarde el estadio fue objeto de una gran reforma.',
    'Открытие: 1947 год': 'Inauguración: 1947', 'Город: Мадрид': 'Ciudad: Madrid', 'Домашний клуб: Реал Мадрид': 'Club local: Real Madrid',
    'Вместимость, адрес и схему проезда можно добавить позже.': 'La capacidad, la dirección y cómo llegar se pueden añadir más adelante.',
    'Схема расстановки': 'Sistema de juego', 'Схема': 'Sistema', 'Футбольное поле с расстановкой': 'Campo de fútbol con la alineación',
    'Фильтр истории': 'Filtro de historia', 'Группы трофеев': 'Grupos de trofeos', 'Годы побед': 'Años de victoria',
    'Всего трофеев в списке': 'Total de trofeos en la lista', 'Победы в Лиге чемпионов': 'Victorias en la Liga de Campeones',
    'Победы в финалах Кубка чемпионов': 'Victorias en finales de la Copa de Europa',
    'Возраст': 'Edad', 'Гражданство': 'Nacionalidad', 'В клубе': 'En el club', 'Рыночная стоимость': 'Valor de mercado', 'Общее': 'General',
    'Предыдущий игрок': 'Jugador anterior', 'Игрок': 'Jugador', 'Следующий игрок': 'Jugador siguiente',
    'Клубные графики': 'Gráficos del club', 'Кубки по десятилетиям': 'Copas por décadas', 'Рост числа титулов': 'Crecimiento de títulos', 'Бомбардиры': 'Goleadores',
    'Нарастающее число титулов в Кубке чемпионов по годам побед.': 'Número acumulado de títulos de la Copa de Europa por año de victoria.',
    'Голы за клуб во всех турнирах. Мбаппе — на 25 октября 2026 года; остальные цифры по открытым источникам, уточняйте при необходимости.': 'Goles con el club en todas las competiciones. La cifra de Mbappé es del 25 de octubre de 2026; el resto procede de fuentes abiertas: conviene verificarlo.',
    'Сначала новые': 'Más recientes primero', 'Сначала старые': 'Más antiguos primero', 'Год': 'Año', 'Город': 'Ciudad', 'Соперник': 'Rival', 'Счёт': 'Marcador',
    'Поиск: год, соперник, город…': 'Buscar: año, rival, ciudad…', 'Поиск по финалам': 'Buscar finales',
    'Неофициальный фан-сайт. Не связан с Real Madrid C.F. Названия и символы принадлежат их владельцам.': 'Web no oficial de aficionados. Sin relación con el Real Madrid C.F. Los nombres y símbolos pertenecen a sus respectivos propietarios.',
    'Быстрые ссылки': 'Enlaces rápidos', 'Наверх': 'Subir', 'Закрыть': 'Cerrar',
    'Поиск по сайту': 'Buscar en el sitio', 'Игрок, матч, новость, трансфер, раздел…': 'Jugador, partido, noticia, fichaje, sección…', 'Поиск': 'Buscar',
    'выбор': 'elegir', 'открыть': 'abrir', 'поиск': 'buscar',
    'Разделы': 'Secciones', 'Перейти в раздел': 'Ir a la sección', 'Игроки': 'Jugadores', 'Таблица': 'Clasificación', 'Легенды': 'Leyendas',
    'Ничего не найдено. Попробуйте другое слово: фамилию, команду или раздел.': 'No se ha encontrado nada. Prueba con otra palabra: un apellido, un equipo o una sección.',
    'В списке нет матчей с известным временем': 'No hay partidos con hora conocida en la lista',
    'Файл календаря скачан — откройте его, чтобы добавить матчи': 'Calendario descargado: ábrelo para añadir los partidos',
    'Ссылка на матч скопирована': 'Enlace al partido copiado', 'Скопируйте адрес из строки браузера': 'Copia la dirección de la barra del navegador',
    'мячей за матч': 'goles por partido', 'побед дома · в гостях': 'victorias en casa · fuera',
    'Очки в Ла Лиге по матчам': 'Puntos en La Liga por partido', 'Очки Реала в Ла Лиге по турам': 'Puntos del Real en La Liga por jornada', 'Старт': 'Inicio',
    'По горизонтали — номер матча Реала в Ла Лиге. Победа — 3 очка, ничья — 1.': 'Eje horizontal: número de partido del Real en La Liga. Una victoria vale 3 puntos; un empate, 1.',
    'Мячи в каждом матче': 'Goles en cada partido', 'забито': 'marcados', 'пропущено': 'encajados',
    '7,5 и выше': '7,5 o más', '6,5–7,4': '6,5–7,4', 'ниже 6,5': 'menos de 6,5',
    'Минуты на поле': 'Minutos jugados', 'Старты': 'Titularidades', 'Выходы на замену': 'Entradas desde el banquillo', 'Жёлтые карточки': 'Tarjetas amarillas',
    'Красные карточки': 'Tarjetas rojas', 'Рейтинг за матч': 'Nota del partido', 'Сейвы': 'Paradas', 'Отражённые удары': 'Porcentaje de paradas',
    'Пропущенные голы': 'Goles encajados', 'Сухие матчи': 'Porterías a cero', 'Отражённые пенальти': 'Penaltis parados', 'Точность передач': 'Precisión de pase',
    'Точность длинных передач': 'Precisión en pases largos', 'Выходы на перехват': 'Salidas de portería', 'Игра на выходах': 'Balones aéreos atrapados', 'Отборы': 'Entradas',
    'Перехваты': 'Intercepciones', 'Выигранные единоборства (земля)': 'Duelos ganados (suelo)', 'Выигранные единоборства (воздух)': 'Duelos ganados (aéreos)',
    'Выносы': 'Despejes', 'Блокированные удары': 'Disparos bloqueados', 'Длинные передачи': 'Pases largos', 'Голевые передачи': 'Asistencias',
    'Ошибки, ведущие к голу': 'Errores que acaban en gol', 'Фолы': 'Faltas', 'Передачи': 'Pases', 'Ключевые передачи': 'Pases clave',
    'Точность паса': 'Precisión de pase', 'Прогрессивные передачи': 'Pases progresivos', 'Проходы с мячом': 'Conducciones progresivas',
    'Пройденная дистанция': 'Distancia recorrida', ' км': ' km', 'Удары': 'Disparos', 'Удары в створ': 'Disparos a puerta',
    'Конверсия ударов': 'Efectividad de disparo', 'Успешные обводки': 'Regates completados', 'Касания в штрафной': 'Toques en el área',
    'Реализованные пенальти': 'Penaltis marcados'
  },
  data: {
    asOf: 'datos a 8 de noviembre de 2026',
    statsNote: '* Datos a 8 de noviembre de 2026. Los últimos títulos del Real en la Liga de Campeones y en La Liga son de la temporada 2023/24.',
    playersNote: 'Plantilla a 8 de noviembre de 2026. Partidos y goles: La Liga 2026/27 tras 10 jornadas (estadísticas oficiales de LaLiga); los partidos ante el Racing (1 de noviembre), el AEK (4 de noviembre) y el Valencia (7 de noviembre) aún no cuentan en las estadísticas individuales; de Rodrygo no hay datos.',
    trophiesNote: 'Datos a 8 de noviembre de 2026. En 2025/26 el club acabó sin títulos (por primera vez desde 2020/21) y en 2026/27 todavía no tiene ninguno. Las fuentes difieren en detalles menores: conviene contrastar con la web oficial del club.',
    transfersNote: 'Las cantidades son las publicadas por los medios (Sports Mole, TeamTalk, Marca): el club en su mayoría no las reveló y las fuentes difieren en los detalles. Datos a 8 de noviembre de 2026.',
    leagueAsOf: 'a 8 de noviembre de 2026 · tras la jornada 12, sin el partido Atlético — Barcelona',
    leagueNote: 'El Barcelona, el Atlético, el Athletic y el Rayo Vallecano han jugado 11 partidos; el resto, 12. El partido de la jornada 12 entre Atlético y Barcelona (8 de noviembre, 21:00 hora de Madrid) no está incluido. A igualdad de puntos se ordena por diferencia de goles; la liga aplica otro criterio (enfrentamientos directos).',
    profilesSeason: 'La Liga 2026/27, tras 10 jornadas (a 25 de octubre de 2026), estadísticas oficiales de LaLiga. No incluye la Liga de Campeones.',
    profilesNote: 'Valor de mercado: estimaciones de Transfermarkt según los medios; en algunos jugadores el valor es de abril de 2026 (indicado entre paréntesis).',
    stats: ['Año de fundación', 'Copas de Europa*', 'Títulos de La Liga*', 'Inauguración del Bernabéu'],
    now: [['Entrenador', 'José Mourinho'], ['Presidente', 'Florentino Pérez'], ['Capitán', 'Federico Valverde'], ['Vicecapitán', 'Vinícius Júnior'], ['La Liga: 30 puntos tras 12 partidos', '2.º puesto'], ['Victorias en la Liga de Campeones', '4 de 4']],
    news: [
      ['Valencia 0:3 Real: octava victoria seguida',
        'Valverde, Arda Güler y Kylian Mbappé marcaron en Mestalla; Gayà, del Valencia, fue expulsado en el minuto 79.',
        'El Real ganó 3:0 en Valencia. Valverde abrió el marcador con un disparo desde el borde del área después de que la falta lanzada por Mbappé rebotara en la barrera y le cayera a él (las fuentes dan minutos distintos, del 28 al 30). En el minuto 36 Arda Güler marcó de primeras tras un pase de Bellingham. En el 75 Mbappé superó al portero Dimitrievski tras un pase de Güler: su séptimo partido seguido marcando. En el minuto 79 Gayà fue expulsado por una falta sobre Mbappé, que se iba solo. El Real suma 30 puntos y empata con el Barcelona, que tiene un partido menos y jugó esa misma noche contra el Atlético (ese resultado aún no está en el sitio). Vinícius no jugó por sanción y podría volver para el partido ante el Celta el 21 de noviembre. Después llegan el parón por selecciones, el Celta (21 de noviembre, en casa) y el PSV (24 de noviembre, en casa).'],
      ['AEK 2:3 Real: victoria en el tiempo añadido',
        'El gol de Valverde en el minuto 90+2 dio al Real su cuarta victoria en cuatro partidos de la fase de liga de la Liga de Campeones.',
        'El Real remontó dos veces en Atenas. Koita abrió el marcador en el minuto 12 y Bellingham empató en el 32 (un gol en el minuto 28 fue anulado por fuera de juego). Pilios adelantó al AEK en el 75, Mbappé igualó tres minutos después y en el 90+2 Valverde, que había entrado como suplente, marcó el gol de la victoria con un disparo desde lejos. Koita fue expulsado tras el pitido final por protestar al árbitro. El Real suma 12 puntos de 12 y es segundo en la clasificación general, por detrás del PSG (diferencia de goles +6 frente a +15). Vinícius no jugó por sanción. Los minutos de los goles son de ESPN; otras fuentes difieren en uno o dos minutos.'],
      ['Racing 0:3 Real: sexta victoria seguida',
        'El penalti de Mbappé en el minuto 11, Bellingham en el 21 y Diomande en el 36 dieron la victoria en Santander.',
        'El Real ganó 3:0 en El Sardinero con todos los goles en la primera parte: Mbappé transformó un penalti (minuto 11) y después marcaron Bellingham (21) y Diomande (36). Es la sexta victoria seguida en todas las competiciones. Mbappé subió a 12 sus goles en La Liga. El Racing no había perdido en casa antes del partido y su última victoria ante el Real fue en abril de 2007. Vinícius se perdió el encuentro por sanción. Tras el partido, Mourinho dijo que el equipo podría haber ganado 4:0 o 5:0. El Real es tercero con 27 puntos; el Barcelona suma 30. La decisión del penalti generó polémica.'],
      ['Clásico: Barcelona 1:2 Real',
        'Kylian Mbappé marcó los dos goles en el Camp Nou, en los minutos 41 y 88. El segundo fue su gol número 100 con el club.',
        'Mbappé abrió el marcador en el minuto 41: su disparo se desvió en Gerard Martín. Raphinha empató y, en el minuto 88, Mbappé, tras un pase de Camavinga, dio la victoria al Real. Después calificó la cifra de cien goles como «un simple detalle» frente al triunfo del equipo. Tras 10 jornadas, el Real es tercero, a tres puntos del líder.'],
      ['Liga de Campeones: Real 4:1 RB Leipzig',
        'Tercera victoria en tres partidos de la fase de liga, tras el Inter (2:1) y la Roma (4:3 a domicilio).',
        'El Real venció al Leipzig 4:1 en casa. Antes, en la fase de liga, llegaron las victorias ante el Inter por 2:1 (8 de septiembre) y la Roma por 4:3 a domicilio (14 de octubre). Después: AEK (fuera, 4 de noviembre), PSV (24 de noviembre, en casa) y Arsenal (9 de diciembre, fuera).'],
      ['Real 4:1 Sevilla', 'Victoria contundente en casa en la jornada 9 de La Liga.',
        'El Real marcó cuatro goles al Sevilla y encajó uno. Una semana después, el equipo ganó el Clásico en el Camp Nou.'],
      ['Liga de Campeones: Roma 3:4 Real', 'Victoria con muchos goles a domicilio en el segundo partido de la fase de liga.',
        'El Real ganó 4:3 a la Roma como visitante. Fue su segunda victoria en la Liga de Campeones 2026/27, tras el 2:1 al Inter.'],
      ['Yan Diomande ya es jugador del Real Madrid', 'El club anunció oficialmente la llegada del extremo procedente del RB Leipzig. El contrato es por siete temporadas.',
        'El acuerdo es válido hasta el 30 de junio de 2033. El club no reveló oficialmente la cantidad; según Marca, rondó los 125 millones de euros más variables de hasta 10–15 millones.'],
      ['Primeros fichajes: Cucurella, Konaté y Bernardo Silva', 'A finales de junio el club cerró los fichajes de los defensas Marc Cucurella e Ibrahima Konaté y del centrocampista Bernardo Silva.',
        'Cucurella llegó del Chelsea (contrato de seis años), Konaté del Liverpool como agente libre (cuatro años) y Bernardo Silva del Manchester City como agente libre (dos años).'],
      ['Carvajal, Alaba y Ceballos dejan el club', 'Dani Ceballos se marchó de mutuo acuerdo el 26 de junio; los contratos de Carvajal y Alaba terminaron el 1 de julio.',
        'Dani Carvajal y David Alaba abandonaron el club como agentes libres.'],
      ['Rüdiger amplía su contrato', 'El central Antonio Rüdiger firmó un nuevo contrato de un año, hasta 2027.',
        'La ampliación se formalizó el 16 de junio de 2026.'],
      ['José Mourinho, nuevo entrenador', 'El club anunció el nombramiento de Mourinho el 11 de junio de 2026, el día de la inauguración del Mundial. Comenzó a trabajar el 13 de julio.',
        'Antes, desde enero de 2026, el equipo estaba dirigido por Álvaro Arbeloa, que sustituyó a Xabi Alonso.']
    ],
    legends: [
      'El símbolo de la primera gran era del club en la Copa de Europa.', 'Uno de los mayores goleadores de la historia del fútbol.',
      'El único jugador con seis Copas de Europa.', 'Capitán y canterano, una leyenda del club.',
      'Capitán durante muchos años y símbolo de fiabilidad.', 'Máximo goleador de la historia del club.'
    ],
    bios: [
      'Delantero de la selección de Francia. En La Liga 2026/27 ha marcado 11 goles y dado 2 asistencias en 10 partidos. El 25 de octubre de 2026 marcó su gol número 100 con el Real. Máximo goleador de La Liga en 2025/26 (25 goles).',
      'Vicecapitán del club. En La Liga 2026/27 lleva 1 gol y 3 asistencias en 8 partidos. Sancionado tras una tarjeta roja: se perdió los partidos ante el Racing, el AEK y el Valencia y podría volver para el partido ante el Celta el 21 de noviembre.',
      'Centrocampista de la selección de Inglaterra. La Liga 2026/27: 3 goles y 3 asistencias en 10 partidos, 74 duelos ganados en el suelo.',
      'Capitán del equipo. En La Liga 2026/27 ha jugado los 10 partidos (801 minutos) y ha dado 2 asistencias.',
      'Centrocampista de la selección de Turquía. La Liga 2026/27: 2 goles y 2 asistencias en 10 partidos.',
      'Dio la asistencia del gol de la victoria de Mbappé en el Clásico del 25 de octubre de 2026. En La Liga 2026/27 entra sobre todo desde el banquillo: 2 titularidades en 9 partidos.',
      'Pivote de la selección de Francia. En La Liga 2026/27 ha jugado 6 partidos (448 minutos).',
      'Portero de la selección de Bélgica. La Liga 2026/27: 9 partidos, 29 paradas y 2 porterías a cero.',
      'Segundo portero del equipo. En La Liga 2026/27 ha jugado un partido (90 minutos).',
      'Central de la selección de Brasil. En La Liga 2026/27 solo ha jugado 5 minutos en un partido.',
      'Central de la selección de Alemania. El 16 de junio de 2026 amplió su contrato un año, hasta 2027. La Liga 2026/27: 4 partidos, 1 gol.',
      'Central de la selección de España. La Liga 2026/27: 8 partidos, 44 despejes y una tarjeta roja.',
      'Canterano del club, central. Todavía no ha jugado en La Liga 2026/27; según Sports Mole, estará de baja unos tres meses por una fractura por estrés.',
      'Lateral derecho de la selección de Inglaterra. La Liga 2026/27: 6 partidos y 1 asistencia.',
      'Lateral izquierdo. La Liga 2026/27: 5 partidos y 1 gol.',
      'Central de la selección de Francia. Llegó del Liverpool como agente libre con contrato de cuatro años. En La Liga 2026/27 ha jugado 9 partidos (810 minutos).',
      'Lateral izquierdo de la selección de España. Llegó del Chelsea (según Sports Mole, por 52 millones de libras). En La Liga 2026/27 ha jugado 10 partidos.',
      'Lateral derecho de la selección de los Países Bajos. Llegó del Inter (según Sports Mole, por 17 millones de libras). En La Liga 2026/27 ha jugado 8 partidos.',
      'Centrocampista de la selección de Portugal. Llegó del Manchester City como agente libre con contrato de dos años. La Liga 2026/27: 8 partidos, 383 minutos.',
      'Canterano, centrocampista. Todavía no ha jugado en La Liga 2026/27.',
      'Extremo brasileño, en el club desde 2019. No figura en las estadísticas oficiales de La Liga 2026/27; en octubre aparecía entre los jugadores ausentes; según Sports Mole, sufre una lesión de rodilla y se espera su regreso a principios de 2027.',
      'Mediapunta de la selección de Marruecos. La Liga 2026/27: 4 partidos, 120 minutos.',
      'Delantero brasileño. Desde el 1 de enero de 2026 jugó cedido en el Lyon y en verano regresó al Real. En La Liga 2026/27 ha jugado 2 partidos.',
      'Delantero. Llegó del Levante (según Sports Mole, por 21 millones de libras). En La Liga 2026/27 ha marcado 2 goles saliendo desde el banquillo: 6 partidos, solo 32 minutos en total.',
      'Extremo. Llegó del RB Leipzig, con contrato hasta el 30 de junio de 2033. La Liga 2026/27: 2 goles y 28 regates completados en 10 partidos.'
    ],
    timeline: [
      ['Fundación del club', 'El club se fundó en Madrid con el nombre de «Madrid Football Club».'],
      ['El título «Real»', 'El rey Alfonso XIII concedió al club el título «Real», es decir, «regio».'],
      ['Bernabéu al frente del club', 'Santiago Bernabéu se convierte en presidente y marca el rumbo del club durante décadas.'],
      ['Inauguración del estadio', 'Se inaugura el estadio que más tarde llevaría el nombre de Santiago Bernabéu.'],
      ['Primera Copa de Europa', 'El Real gana la primera edición del torneo y suma cinco títulos consecutivos.'],
      ['Sexto título', 'Victoria ante el Partizan en la final de Bruselas.'],
      ['Séptima Copa', 'Regreso a lo más alto de Europa tras 32 años.'],
      ['La Décima', 'La décima Copa de Europa: victoria ante el Atlético en Lisboa.'],
      ['Tres seguidas', 'Victorias en 2016, 2017 y 2018: tres finales consecutivas.'],
      ['Decimoquinto título', 'Victoria ante el Borussia en Wembley, Londres.'],
      ['Copa Intercontinental de la FIFA', 'El 18 de diciembre de 2024 el club ganó la nueva Copa Intercontinental de la FIFA.'],
      ['Cambio de entrenador', 'En enero de 2026 Xabi Alonso dejó el club de mutuo acuerdo y Álvaro Arbeloa tomó el mando del equipo.'],
      ['Cuartos de final de la Liga de Campeones', 'En 2025/26 el Real eliminó al Manchester City (5:1 en el global) pero cayó ante el Bayern (4:6) en cuartos. La temporada terminó sin títulos, por primera vez desde 2020/21.'],
      ['La era Mourinho', 'El 11 de junio de 2026 el club anunció el nombramiento de José Mourinho. Comenzó a trabajar el 13 de julio.'],
      ['Clásico y el gol 100 de Mbappé', 'El 25 de octubre el Real ganó 2:1 en el Camp Nou. Mbappé marcó los dos goles y el segundo fue el número 100 con el club.'],
      ['Un arranque perfecto en la Liga de Campeones', 'A 4 de noviembre el Real había ganado los cuatro partidos de la fase de liga: Inter 2:1, Roma 4:3, RB Leipzig 4:1 y AEK 3:2 en Atenas.']
    ],
    faq: [
      ['¿Quién entrena ahora al Real Madrid?', 'Desde julio de 2026, José Mourinho. El club anunció su nombramiento el 11 de junio de 2026.'],
      ['¿Cómo le fue al Real en 2025/26?', 'El club fue segundo en La Liga (86 puntos), por detrás del Barcelona, cayó ante el Bayern en cuartos de la Liga de Campeones y acabó sin títulos.'],
      ['¿Por qué al club se le llama «Los Blancos»?', 'El apodo significa «los blancos», por el color blanco tradicional de su camiseta.'],
      ['¿Qué significa «Real» en el nombre?', 'Es la palabra española para «regio». El título se lo concedió al club el rey Alfonso XIII en 1920.'],
      ['¿Cómo va el Real en la Liga de Campeones 2026/27?', 'Tras cuatro partidos de la fase de liga, el Real tiene 12 puntos de 12 y es segundo (diferencia de goles +6) por detrás del PSG, a 5 de noviembre de 2026.'],
      ['¿De quién es el estadio?', 'El estadio del club es el Santiago Bernabéu de Madrid, que lleva el nombre de su presidente durante muchos años.']
    ],
    transfers: [
      'más variables de hasta 10–15 millones de euros (Marca); los medios británicos hablan de 107–115 millones de libras', '51,8–52 millones de libras según distintas fuentes',
      'cláusula de rescisión, unos 21 millones de libras', 'cláusula de rescisión de su contrato', 'agente libre', 'agente libre',
      'cedido al Lyon desde el 1 de enero de 2026; regresó en verano', 'unos 40 millones de euros', '10 millones de euros y el 30 % de una futura reventa',
      '4 millones de euros; el 50 % de una futura reventa se queda en el Real', 'según Sports Mole', 'según Sports Mole',
      'según se informó, el acuerdo incluye una opción de recompra', 'condiciones de la cesión no reveladas',
      'se marchó de mutuo acuerdo el 26 de junio; fichó por el Betis el último día del mercado',
      'contrato finalizado el 1 de julio; según TeamTalk, fichó por el Udinese en septiembre', 'contrato finalizado el 1 de julio'
    ],
    matchFacts: {
      '2026-11-07': ['Octava victoria seguida en todas las competiciones.', 'Mbappé ha marcado en siete partidos consecutivos.', 'Gayà (Valencia) fue expulsado en el minuto 79 por una falta sobre Mbappé, que se iba solo.', 'Las fuentes dan minutos distintos para el gol de Valverde (28–30), por eso aparece como aproximado.'],
      '2026-11-04': ['Cuarta victoria en cuatro partidos de la fase de liga: 12 puntos de 12.', 'Segunda remontada de la temporada en la Liga de Campeones (tras la del Roma).', 'El primer gol de Bellingham, en el minuto 28, fue anulado por fuera de juego.', 'Koita fue expulsado tras el pitido final. Los minutos de los goles son de ESPN; otras fuentes difieren en uno o dos minutos.'],
      '2026-11-01': ['Sexta victoria seguida en todas las competiciones.', 'Mbappé subió a 12 sus goles en La Liga.', 'El Racing no había perdido en casa antes del partido; su última victoria ante el Real fue en abril de 2007.', 'Vinícius no jugó por sanción.'],
      '2026-10-25': ['Primera derrota del Barcelona en La Liga 2026/27.', 'El segundo gol fue el número 100 de Mbappé con el Real.']
    }
  },
  rules: {
    place: 'Puesto $1',
    titleD: '⏱ $1 d $2 h $3 min para el partido · Real — @4', titleH: '⏱ $1 h $2 min para el partido · Real — @3',
    since: 'desde $1', clubSince: 'En el club desde $1', years: '$1 años', yearsNew: '$1 años en el nuevo club',
    games: '$1 partidos', pts: '$1 pts', of: '$1 de $2', matchday: 'Jornada $1', phase: 'Fase de liga, partido $1',
    nthMatch: 'Partido $1: $2 pts', winsOf: 'victorias ($1 de $2)', gd: 'diferencia de goles $1', decade: 'años $1',
    scoreVs: '@1 $2 @3', teamComma: '@1, $2', teamColon: '@1: $2',
    cupN: 'Copa de Europa n.º $1', finalLine: 'Final en ~1. Rival: @2. Marcador: @3.', aet: '$1 (prórroga)', pens: '$1 ($2 en los penaltis)',
    fromNews: 'De la noticia «@1» del $2.',
    summary: '@1 en @2: el Real @3 @4 — $5 (primero, el marcador del Real).',
    madridTime: '$1 hora de Madrid', yourTime: '$1 hora local', mostExp: 'fichaje más caro: @1',
    feeAprEur: '#1 M€ (abr. 2026)', feeE: '$1#2 M€', feeP: '$1#2 M£',
    untilDate: 'hasta el $1', untilYear: 'hasta $1', untilJune: 'hasta junio de $1',
    biggest: 'Partidos por orden, todas las competiciones; pulsa una barra para abrir el partido. Mayor victoria: @1, $2.',
    finalsNote: 'Victorias en finales de la Copa de Europa por décadas. Total: $1.',
    formTeam: 'Forma del equipo: últimos $1 partidos', formRating: 'Forma: nota en los últimos $1 partidos', avgRating: 'Nota media del periodo: $1.',
    noRating: 'Todavía no hay notas del jugador por partido, así que se muestra la forma del equipo: $1 puntos de $2. Para ver la forma del jugador, añade form en profiles.js.',
    labSeason: '@1 Un guion significa que no hay datos en fuentes abiertas (añádelos en profiles.js).', emptyYear: 'Sin datos: rellénalo en profiles.js'
  }
};

;
/* ======== i18n.js ======== */
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
