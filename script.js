// Переключение разделов по хэшу в адресе (#news, #club, ...)
const views = document.querySelectorAll('.view');
const links = document.querySelectorAll('.nav a');

function showPage() {
  const id = location.hash.slice(1) || 'news';
  const target = document.getElementById(id) ? id : 'news';

  views.forEach(v => v.classList.toggle('active', v.id === target));
  links.forEach(a => a.classList.toggle('active', a.dataset.page === target));
}

window.addEventListener('hashchange', showPage);
showPage();
