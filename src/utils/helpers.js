export function typeLabel(t) {
  return { midweek: 'Entre semana', weekend: 'Fin de semana', special: 'Especial / Asamblea' }[t] || t
}

export function typeBadge(t) {
  return { midweek: 'b-sky', weekend: 'b-green', special: 'b-amber' }[t] || 'b-gray'
}

export function toast(title, msg, isError = false) {
  const el = document.getElementById('toast')
  document.getElementById('t-title').textContent = title
  document.getElementById('t-msg').textContent = msg
  el.style.borderColor = isError ? 'var(--rose)' : 'var(--sky)'
  el.classList.add('show')
  setTimeout(() => el.classList.remove('show'), 3500)
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatDateShort(ts) {
  return new Date(ts).toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })
}
