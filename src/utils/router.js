export function go(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('.nt').forEach(t => t.classList.remove('active'))
  document.getElementById('page-' + name)?.classList.add('active')
  document.querySelector(`[data-page="${name}"]`)?.classList.add('active')
}
