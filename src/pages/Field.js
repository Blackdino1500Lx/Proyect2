import { toast } from '../utils/helpers.js'
import { supabase, DEMO_MODE } from '../config/supabase.js'

// ── Fetch ─────────────────────────────────────────────────────
async function fetchTerritories() {
  const { data } = await supabase.from('territories').select('*').order('number')
  return data || []
}

async function fetchSchedule(weekStart) {
  const { data } = await supabase.from('field_schedule')
    .select('*, territories(id,number,name)')
    .eq('week_start', weekStart)
    .order('day_date')
  return data || []
}

async function fetchUsers() {
  const { data } = await supabase.from('users').select('id,name,gender,baptized').order('name')
  return (data || []).filter(u => u.baptized)
}

function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 2 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

function getWeekDays(weekStart) {
  const days = ['Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
  return days.map((name, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return { name, date: d.toISOString().split('T')[0] }
  })
}

// ── Render ────────────────────────────────────────────────────
export async function renderField(container, currentUser) {
  const isAdmin = currentUser?.role === 'admin'
  container.innerHTML = `<div class="page active" id="page-field">
    <div class="section-hd"><h2 class="section-title">Predicación</h2></div>
    <div class="empty"><span class="spin" style="width:24px;height:24px;border-top-color:var(--sky);border-color:var(--border2)"></span></div>
  </div>`

  const today = new Date().toISOString().split('T')[0]
  const weekStart = getWeekStart(today)
  const [territories, schedule, users] = await Promise.all([
    fetchTerritories(), fetchSchedule(weekStart), fetchUsers()
  ])

  container.innerHTML = buildHTML(isAdmin, territories, schedule, users, weekStart)
  attachEvents(container, isAdmin, territories, schedule, users, weekStart, currentUser)
}

function buildHTML(isAdmin, territories, schedule, users, weekStart) {
  const days = getWeekDays(weekStart)
  const weekEnd = days[days.length - 1].date
  const statusColor = { available: '#2e9e6b', 'in-progress': '#c07820', completed: '#4a90d9' }
  const statusLabel = { available: 'Disponible', 'in-progress': 'En progreso', completed: 'Completado' }

  const territoryCards = territories.map(t => {
    const pct = t.total_points > 0 ? Math.round((t.last_point / t.total_points) * 100) : 0
    const color = statusColor[t.status] || '#2e9e6b'
    return `<div class="card" style="padding:.9rem;cursor:pointer" data-ter-id="${t.id}" id="ter-${t.id}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem">
        <div>
          <div style="font-size:.7rem;font-weight:700;color:var(--text3)">${t.number}.</div>
          <div style="font-weight:700;font-size:.9rem;color:var(--text)">${t.name}</div>
        </div>
        <span style="font-size:.68rem;font-weight:700;padding:.2rem .5rem;border-radius:20px;background:${color}18;color:${color}">${statusLabel[t.status]}</span>
      </div>
      <div style="background:var(--border);border-radius:4px;height:6px;margin-bottom:.35rem;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:4px;transition:width .3s"></div>
      </div>
      <div style="font-size:.72rem;color:var(--text2)">
        ${t.last_point > 0
          ? `Del punto 1 al ${t.last_point} de ${t.total_points} (${pct}%)`
          : `Pendiente · ${t.total_points} puntos`}
        ${t.last_worked ? `<span style="color:var(--text3)"> · Último: ${new Date(t.last_worked+'T00:00:00').toLocaleDateString('es',{day:'numeric',month:'short'})}</span>` : ''}
      </div>
    </div>`
  }).join('')

  const brotherOpts = '<option value="">— Seleccionar —</option>' +
    users.map(u => `<option value="${u.name}">${u.name}</option>`).join('')
  const terOpts = '<option value="">— Seleccionar —</option>' +
    territories.map(t => `<option value="${t.id}">${t.number}. ${t.name}</option>`).join('')

  const scheduleHTML = days.map(day => {
    const entry = schedule.find(s => s.day_date === day.date)
    return `<div class="card" style="padding:.85rem;margin-bottom:.6rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
        <div>
          <div style="font-weight:700;font-size:.9rem;color:var(--text)">${day.name}</div>
          <div style="font-size:.72rem;color:var(--text3)">${new Date(day.date+'T00:00:00').toLocaleDateString('es',{day:'numeric',month:'long'})}</div>
        </div>
        ${entry ? `<span class="badge b-green" style="font-size:.68rem">Programado</span>` : `<span class="badge b-gray" style="font-size:.68rem">Sin programar</span>`}
      </div>
      ${entry ? `
        <div style="font-size:.82rem;color:var(--text2);display:flex;flex-direction:column;gap:.2rem">
          <div>👤 <strong>${entry.captain}</strong></div>
          <div>📍 Salida: ${entry.exit_point}</div>
          <div>🗺️ Territorio: ${entry.territories ? entry.territories.number + '. ' + entry.territories.name : '—'}</div>
          ${entry.notes ? `<div style="font-size:.76rem;color:var(--text3)">${entry.notes}</div>` : ''}
        </div>
        ${isAdmin && entry.territories ? `
        <div style="margin-top:.7rem;padding-top:.6rem;border-top:1px solid var(--border)">
          <div style="font-size:.72rem;font-weight:700;color:var(--text2);margin-bottom:.4rem">REGISTRAR AVANCE</div>
          <div style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:flex-end">
            <div class="fg" style="flex:1;min-width:80px;margin:0">
              <label style="font-size:.7rem">Del punto</label>
              <input type="number" class="prog-from" data-sched="${entry.id}" data-ter="${entry.territory_id}" min="1" value="${entry.territories ? entry.territories.last_point || '' : ''}" style="width:100%;padding:.3rem .5rem;font-size:.82rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans)"/>
            </div>
            <div class="fg" style="flex:1;min-width:80px;margin:0">
              <label style="font-size:.7rem">Al punto</label>
              <input type="number" class="prog-to" data-sched="${entry.id}" data-ter="${entry.territory_id}" data-total="${entry.territories.total_points}" min="1" max="${entry.territories.total_points}" style="width:100%;padding:.3rem .5rem;font-size:.82rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans)"/>
            </div>
            <button class="btn-action btn-save-progress" data-sched="${entry.id}" data-ter="${entry.territory_id}" data-date="${day.date}" data-total="${entry.territories.total_points}" style="padding:.4rem .9rem;font-size:.78rem;white-space:nowrap">
              Guardar
            </button>
          </div>
        </div>` : ''}
      ` : isAdmin ? `
        <div style="margin-top:.4rem">
          <div style="font-size:.72rem;font-weight:700;color:var(--text2);margin-bottom:.4rem">PROGRAMAR DÍA</div>
          <div style="display:flex;flex-direction:column;gap:.4rem">
            <select class="day-captain" data-date="${day.date}" style="padding:.35rem .5rem;font-size:.78rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans)">${brotherOpts}</select>
            <input type="text" class="day-exit" data-date="${day.date}" placeholder="Punto de salida (ej: Pulpería)..." style="padding:.35rem .5rem;font-size:.78rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans)"/>
            <select class="day-ter" data-date="${day.date}" style="padding:.35rem .5rem;font-size:.78rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans)">${terOpts}</select>
            <input type="text" class="day-notes" data-date="${day.date}" placeholder="Notas opcionales..." style="padding:.35rem .5rem;font-size:.78rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans)"/>
            <button class="btn-action btn-save-day" data-date="${day.date}" data-week="${weekStart}" style="font-size:.78rem;padding:.42rem .9rem">Guardar</button>
          </div>
        </div>` : '<div style="font-size:.78rem;color:var(--text3);font-style:italic">Sin actividad programada</div>'}
    </div>`
  }).join('')

  return `<div class="page active" id="page-field">
    <div class="section-hd">
      <h2 class="section-title">Predicación</h2>
    </div>

    <!-- Tabs -->
    <div class="meet-type-tabs" style="margin-bottom:1rem">
      <button class="mtt active" id="ftab-week">📅 Esta semana</button>
      <button class="mtt" id="ftab-territories">🗺️ Territorios</button>
    </div>

    <!-- Tab: Semana -->
    <div id="field-week">
      <div style="font-size:.75rem;color:var(--text2);margin-bottom:.85rem;font-weight:600">
        Semana del ${new Date(weekStart+'T00:00:00').toLocaleDateString('es',{day:'numeric',month:'long'})}
        al ${new Date(weekEnd+'T00:00:00').toLocaleDateString('es',{day:'numeric',month:'long'})}
      </div>
      ${scheduleHTML}
    </div>

    <!-- Tab: Territorios -->
    <div id="field-territories" style="display:none">
      <div style="display:flex;gap:.5rem;margin-bottom:.85rem;flex-wrap:wrap">
        <button class="btn-sm ${!window.__terFilter||window.__terFilter==='all'?'active':''}" data-ter-filter="all">Todos</button>
        <button class="btn-sm ${window.__terFilter==='available'?'active':''}" data-ter-filter="available">Disponibles</button>
        <button class="btn-sm ${window.__terFilter==='in-progress'?'active':''}" data-ter-filter="in-progress">En progreso</button>
        <button class="btn-sm ${window.__terFilter==='completed'?'active':''}" data-ter-filter="completed">Completados</button>
      </div>
      <div id="ter-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.7rem">
        ${territoryCards}
      </div>
    </div>

    <!-- Modal de territorio -->
    <div id="ter-modal" style="display:none;position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.5);padding:1rem;overflow-y:auto">
      <div id="ter-modal-content" style="background:var(--white);border-radius:var(--r);max-width:480px;margin:2rem auto;padding:1.4rem"></div>
    </div>
  </div>`
}

// ── Events ────────────────────────────────────────────────────
function attachEvents(container, isAdmin, territories, schedule, users, weekStart, currentUser) {

  // Tabs
  container.querySelector('#ftab-week')?.addEventListener('click', () => {
    container.querySelector('#field-week').style.display = 'block'
    container.querySelector('#field-territories').style.display = 'none'
    container.querySelector('#ftab-week').classList.add('active')
    container.querySelector('#ftab-territories').classList.remove('active')
  })
  container.querySelector('#ftab-territories')?.addEventListener('click', () => {
    container.querySelector('#field-week').style.display = 'none'
    container.querySelector('#field-territories').style.display = 'block'
    container.querySelector('#ftab-week').classList.remove('active')
    container.querySelector('#ftab-territories').classList.add('active')
  })

  // Filtros de territorio
  container.querySelectorAll('[data-ter-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.terFilter
      window.__terFilter = f
      container.querySelectorAll('[data-ter-filter]').forEach(b => b.classList.toggle('active', b.dataset.terFilter === f))
      container.querySelectorAll('[data-ter-id]').forEach(card => {
        const ter = territories.find(t => t.id === card.dataset.terId)
        card.style.display = (f === 'all' || ter?.status === f) ? 'block' : 'none'
      })
    })
  })

  // Abrir modal de territorio
  container.querySelectorAll('[data-ter-id]').forEach(card => {
    card.addEventListener('click', () => {
      const ter = territories.find(t => t.id === card.dataset.terId)
      if (!ter) return
      showTerModal(container, ter, isAdmin, currentUser, territories, schedule, users, weekStart)
    })
  })

  if (!isAdmin) return

  // Guardar día
  container.querySelectorAll('.btn-save-day').forEach(btn => {
    btn.addEventListener('click', async () => {
      const date    = btn.dataset.date
      const week    = btn.dataset.week
      const captain = container.querySelector(`.day-captain[data-date="${date}"]`)?.value
      const exit    = container.querySelector(`.day-exit[data-date="${date}"]`)?.value?.trim()
      const terId   = container.querySelector(`.day-ter[data-date="${date}"]`)?.value
      const notes   = container.querySelector(`.day-notes[data-date="${date}"]`)?.value?.trim()

      if (!captain || !exit) { toast('Error', 'Selecciona encargado y punto de salida', true); return }

      btn.textContent = 'Guardando...'
      btn.disabled = true

      const { error } = await supabase.from('field_schedule').insert({
        week_start: week, day_date: date, captain, exit_point: exit,
        territory_id: terId || null, notes: notes || null
      })

      if (error) { toast('Error', error.message, true) }
      else {
        toast('Guardado', `${date} programado`)
        await renderField(container, currentUser)
      }
      btn.textContent = 'Guardar'
      btn.disabled = false
    })
  })

  // Registrar avance
  container.querySelectorAll('.btn-save-progress').forEach(btn => {
    btn.addEventListener('click', async () => {
      const terId   = btn.dataset.ter
      const date    = btn.dataset.date
      const schedId = btn.dataset.sched
      const total   = parseInt(btn.dataset.total)
      const fromVal = container.querySelector(`.prog-from[data-sched="${schedId}"]`)?.value
      const toVal   = container.querySelector(`.prog-to[data-sched="${schedId}"]`)?.value

      if (!fromVal || !toVal) { toast('Error', 'Ingresa los puntos de avance', true); return }

      const from = parseInt(fromVal)
      const to   = parseInt(toVal)
      if (to < from) { toast('Error', 'El punto final debe ser mayor al inicial', true); return }

      btn.textContent = '...'
      btn.disabled = true

      // Guardar progreso
      await supabase.from('territory_progress').insert({
        territory_id: terId, schedule_id: schedId,
        from_point: from, to_point: to, worked_date: date
      })

      // Actualizar territorio
      const newStatus = to >= total ? 'completed' : 'in-progress'
      await supabase.from('territories').update({
        last_point: to, status: newStatus, last_worked: date
      }).eq('id', terId)

      toast('Avance guardado', `Del punto ${from} al ${to}${to >= total ? ' — ¡Territorio completado!' : ''}`)
      await renderField(container, currentUser)
    })
  })
}

function showTerModal(container, ter, isAdmin, currentUser, territories, schedule, users, weekStart) {
  const modal = container.querySelector('#ter-modal')
  const content = container.querySelector('#ter-modal-content')
  const pct = ter.total_points > 0 ? Math.round((ter.last_point / ter.total_points) * 100) : 0
  const statusColor = { available: '#2e9e6b', 'in-progress': '#c07820', completed: '#4a90d9' }
  const statusLabel = { available: 'Disponible', 'in-progress': 'En progreso', completed: 'Completado' }
  const color = statusColor[ter.status]

  content.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem">
      <div>
        <div style="font-size:.72rem;color:var(--text3);font-weight:700">TERRITORIO ${ter.number}</div>
        <h3 style="font-size:1.1rem;color:var(--text);margin:0">${ter.name}</h3>
      </div>
      <button id="close-ter-modal" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:var(--text3)">✕</button>
    </div>

    <div style="background:var(--border);border-radius:6px;height:10px;margin-bottom:.5rem;overflow:hidden">
      <div style="height:100%;width:${pct}%;background:${color};border-radius:6px"></div>
    </div>
    <div style="font-size:.82rem;color:var(--text2);margin-bottom:1rem">
      <strong style="color:${color}">${pct}% completado</strong> ·
      ${ter.last_point > 0 ? `Del punto 1 al ${ter.last_point}` : 'Sin iniciar'} de ${ter.total_points} puntos
    </div>

    <div style="display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap">
      <span style="font-size:.72rem;font-weight:700;padding:.25rem .6rem;border-radius:20px;background:${color}18;color:${color}">${statusLabel[ter.status]}</span>
      ${ter.last_worked ? `<span style="font-size:.72rem;color:var(--text3)">Último trabajo: ${new Date(ter.last_worked+'T00:00:00').toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long'})}</span>` : ''}
    </div>

    ${ter.notes ? `<div style="font-size:.82rem;color:var(--text2);margin-bottom:1rem;padding:.65rem;background:var(--off);border-radius:var(--r2)">${ter.notes}</div>` : ''}

    <div style="font-size:.72rem;color:var(--text2);margin-bottom:.5rem;font-weight:700">PENDIENTE</div>
    <div style="font-size:.88rem;color:var(--text);margin-bottom:1rem;padding:.65rem;background:var(--sky-bg);border-radius:var(--r2);border:1px solid var(--border2)">
      ${ter.last_point < ter.total_points
        ? `Del punto ${ter.last_point + 1} al ${ter.total_points}`
        : '✅ Territorio completado'}
    </div>

    ${isAdmin ? `
    <div style="padding-top:.75rem;border-top:1px solid var(--border)">
      ${ter.status === 'completed' ? `
      <button id="btn-reset-ter" style="width:100%;padding:.5rem;background:var(--rose-bg);color:var(--rose);border:1.5px solid var(--rose);border-radius:var(--r2);cursor:pointer;font-family:var(--sans);font-weight:700;font-size:.82rem">
        🔄 Resetear territorio
      </button>` : ''}
    </div>` : ''}
  `

  modal.style.display = 'block'

  content.querySelector('#close-ter-modal')?.addEventListener('click', () => {
    modal.style.display = 'none'
  })
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none'
  })

  content.querySelector('#btn-reset-ter')?.addEventListener('click', async () => {
    if (!confirm('¿Resetear este territorio? Volverá a estar disponible desde el punto 0.')) return
    await supabase.from('territories').update({
      last_point: 0, status: 'available', last_worked: null
    }).eq('id', ter.id)
    modal.style.display = 'none'
    toast('Reseteado', ter.name)
    await renderField(container, currentUser)
  })
}
