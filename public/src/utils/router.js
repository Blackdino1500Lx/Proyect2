export function go(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('.nt, .bn').forEach(t => t.classList.toggle('active', t.dataset.page === name))
  document.getElementById('page-' + name)?.classList.add('active')
}