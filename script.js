// ---------- Переключение разделов по хэшу (#news, #club, ...) ----------
const views = document.querySelectorAll('.view');
const links = document.querySelectorAll('.nav a');

function showPage() {
  const id = location.hash.slice(1) || 'news';
  const target = document.getElementById(id) ? id : 'news';

  views.forEach(v => v.classList.toggle('active', v.id === target));
  links.forEach(a => a.classList.toggle('active', a.dataset.page === target));
  window.scrollTo({ top: 0 });
}

window.addEventListener('hashchange', showPage);
showPage();

// ---------- Новости (демо — замените своими) ----------
const news = [
  { date: '2026-10-29', title: 'Заголовок новости №1', text: 'Короткое описание новости. Здесь будет анонс материала.' },
  { date: '2026-10-28', title: 'Заголовок новости №2', text: 'Короткое описание новости. Здесь будет анонс материала.' },
  { date: '2026-10-27', title: 'Заголовок новости №3', text: 'Короткое описание новости. Здесь будет анонс материала.' },
  { date: '2026-10-26', title: 'Заголовок новости №4', text: 'Короткое описание новости. Здесь будет анонс материала.' },
  { date: '2026-10-25', title: 'Заголовок новости №5', text: 'Короткое описание новости. Здесь будет анонс материала.' },
  { date: '2026-10-24', title: 'Заголовок новости №6', text: 'Короткое описание новости. Здесь будет анонс материала.' },
];

const fmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

document.getElementById('news-grid').innerHTML = news.map(n => `
  <article class="card">
    <div class="card-img"></div>
    <div class="card-body">
      <time datetime="${n.date}">${fmt.format(new Date(n.date))}</time>
      <h3>${n.title}</h3>
      <p>${n.text}</p>
    </div>
  </article>
`).join('');

// ---------- Лаборатория данных: демо-график ----------
const demoData = [
  { label: 'A', value: 40 },
  { label: 'B', value: 65 },
  { label: 'C', value: 52 },
  { label: 'D', value: 80 },
  { label: 'E', value: 70 },
];

const max = Math.max(...demoData.map(d => d.value));
const bars = document.getElementById('bars');

bars.innerHTML = demoData.map(d => `
  <div class="bar" title="${d.value}">
    <i style="height:0" data-h="${(d.value / max) * 100}%"></i>
    <span>${d.label}</span>
  </div>
`).join('');

// плавный рост столбиков
requestAnimationFrame(() => {
  bars.querySelectorAll('i').forEach(el => { el.style.height = el.dataset.h; });
});
