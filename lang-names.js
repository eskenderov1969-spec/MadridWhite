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
