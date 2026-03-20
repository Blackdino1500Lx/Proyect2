import { toast } from '../utils/helpers.js'
import { supabase } from '../config/supabase.js'

async function fetchTerritories() {
  const { data } = await supabase.from('territories').select('*').order('number')
  return data || []
}
async function fetchSchedule(weekStart) {
  const { data } = await supabase.from('field_schedule')
    .select('*, territories(id,number,name,total_points,last_point)')
    .eq('week_start', weekStart).order('day_date')
  return data || []
}
async function fetchZoom(weekStart) {
  const { data } = await supabase.from('zoom_schedule').select('*').eq('week_start', weekStart)
  return data || []
}
async function fetchUsers() {
  const { data } = await supabase.from('users').select('id,name,gender,baptized').order('name')
  return (data || []).filter(u => u.baptized)
}

function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

function getWeekDays(weekStart) {
  const days = [
    { name:'Lunes',     zoom:true,  defaultTime:'15:00' },
    { name:'Martes',    zoom:false },
    { name:'Miercoles', zoom:false },
    { name:'Jueves',    zoom:false },
    { name:'Viernes',   zoom:true,  defaultTime:'18:00' },
    { name:'Sabado',    zoom:false },
    { name:'Domingo',   zoom:false },
  ]
  return days.map((d, i) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    return { ...d, date: date.toISOString().split('T')[0] }
  })
}

export async function renderField(container, currentUser) {
  const isAdmin = currentUser?.role === 'admin'
  container.innerHTML = '<div class="page active" id="page-field"><div class="section-hd"><h2 class="section-title">Predicacion</h2></div><div class="empty"><span class="spin" style="width:24px;height:24px;border-top-color:var(--sky);border-color:var(--border2)"></span></div></div>'

  const today = new Date().toISOString().split('T')[0]
  const weekStart = getWeekStart(today)
  const [territories, schedule, zoom, users] = await Promise.all([
    fetchTerritories(), fetchSchedule(weekStart), fetchZoom(weekStart), fetchUsers()
  ])

  const days = getWeekDays(weekStart)
  const statusColor = { available:'#2e9e6b', 'in-progress':'#c07820', completed:'#4a90d9' }
  const statusLabel = { available:'Disponible', 'in-progress':'En progreso', completed:'Completado' }

  const brotherOpts = '<option value="">Seleccionar...</option>' +
    users.map(u => '<option value="' + u.name + '">' + u.name + '</option>').join('')
  const terOpts = '<option value="">Sin territorio</option>' +
    territories.map(t => '<option value="' + t.id + '">' + t.number + '. ' + t.name + '</option>').join('')

  function dayCard(day) {
    if (day.zoom) {
      const z = zoom.find(x => x.day_date === day.date)
      return '<div class="card" style="padding:.85rem;margin-bottom:.6rem;border-left:3px solid #2d8cff">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">' +
        '<div><div style="font-weight:700;font-size:.9rem;color:var(--text)">' + day.name +
        ' <span style="font-size:.7rem;color:#2d8cff;background:#2d8cff18;padding:.15rem .45rem;border-radius:20px">Zoom</span></div>' +
        '<div style="font-size:.72rem;color:var(--text3)">' + new Date(day.date+'T00:00:00').toLocaleDateString('es',{day:'numeric',month:'long'}) + '</div></div>' +
        (z ? '<span class="badge b-green" style="font-size:.68rem">Programado</span>' : '<span class="badge b-gray" style="font-size:.68rem">Sin programar</span>') +
        '</div>' +
        (z ? (
          '<div style="font-size:.82rem;color:var(--text2);display:flex;flex-direction:column;gap:.2rem">' +
          '<div>Hora: <strong>' + z.time + '</strong></div>' +
          (z.captain ? '<div>Encargado: <strong>' + z.captain + '</strong></div>' : '') +
          (z.notes ? '<div style="font-size:.76rem;color:var(--text3)">' + z.notes + '</div>' : '') +
          '</div>' +
          (z.link ? '<a href="' + z.link + '" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:.5rem;margin-top:.75rem;padding:.65rem 1rem;background:#2d8cff;color:white;border-radius:var(--r2);text-decoration:none;font-weight:700;font-size:.85rem">Unirse a Zoom</a>' : '') +
          (isAdmin ? '<button class="btn-sm danger btn-del-zoom" data-zoom="' + z.id + '" style="margin-top:.5rem;width:100%">Eliminar</button>' : '')
        ) : isAdmin ? (
          '<div style="display:flex;flex-direction:column;gap:.4rem;margin-top:.4rem">' +
          '<div style="display:flex;gap:.4rem">' +
          '<div class="fg" style="flex:1;margin:0"><label style="font-size:.7rem">Hora</label><input type="time" class="zoom-time" data-date="' + day.date + '" value="' + day.defaultTime + '" style="width:100%;padding:.32rem .5rem;font-size:.82rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans)"/></div>' +
          '<div class="fg" style="flex:2;margin:0"><label style="font-size:.7rem">Encargado</label><select class="zoom-captain" data-date="' + day.date + '" style="width:100%;padding:.32rem .5rem;font-size:.78rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans)">' + brotherOpts + '</select></div>' +
          '</div>' +
          '<input type="url" class="zoom-link" data-date="' + day.date + '" placeholder="https://zoom.us/j/..." style="padding:.32rem .5rem;font-size:.78rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans)"/>' +
          '<input type="text" class="zoom-notes" data-date="' + day.date + '" placeholder="Notas..." style="padding:.32rem .5rem;font-size:.78rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans)"/>' +
          '<button class="btn-action btn-save-zoom" data-date="' + day.date + '" data-week="' + weekStart + '" style="font-size:.78rem;padding:.42rem">Guardar</button>' +
          '</div>'
        ) : '<div style="font-size:.78rem;color:var(--text3);font-style:italic">Sin Zoom programado</div>') +
        '</div>'
    }

    const entry = schedule.find(s => s.day_date === day.date)
    return '<div class="card" style="padding:.85rem;margin-bottom:.6rem">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">' +
      '<div><div style="font-weight:700;font-size:.9rem;color:var(--text)">' + day.name + '</div>' +
      '<div style="font-size:.72rem;color:var(--text3)">' + new Date(day.date+'T00:00:00').toLocaleDateString('es',{day:'numeric',month:'long'}) + '</div></div>' +
      (entry ? '<span class="badge b-green" style="font-size:.68rem">Programado</span>' : '<span class="badge b-gray" style="font-size:.68rem">Sin programar</span>') +
      '</div>' +
      (entry ? (
        '<div style="font-size:.82rem;color:var(--text2);display:flex;flex-direction:column;gap:.2rem">' +
        '<div>Encargado: <strong>' + entry.captain + '</strong></div>' +
        '<div>Salida: ' + entry.exit_point + '</div>' +
        '<div>Territorio: ' + (entry.territories ? entry.territories.number + '. ' + entry.territories.name : 'Sin asignar') + '</div>' +
        (entry.notes ? '<div style="font-size:.76rem;color:var(--text3)">' + entry.notes + '</div>' : '') +
        '</div>' +
        (isAdmin && entry.territories ? (
          '<div style="margin-top:.7rem;padding-top:.6rem;border-top:1px solid var(--border)">' +
          '<div style="font-size:.72rem;font-weight:700;color:var(--text2);margin-bottom:.4rem">REGISTRAR AVANCE</div>' +
          '<div style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:flex-end">' +
          '<div class="fg" style="flex:1;min-width:80px;margin:0"><label style="font-size:.7rem">Del punto</label><input type="number" class="prog-from" data-sched="' + entry.id + '" data-ter="' + entry.territory_id + '" min="1" value="' + (entry.territories.last_point || '') + '" style="width:100%;padding:.3rem .5rem;font-size:.82rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans)"/></div>' +
          '<div class="fg" style="flex:1;min-width:80px;margin:0"><label style="font-size:.7rem">Al punto</label><input type="number" class="prog-to" data-sched="' + entry.id + '" data-ter="' + entry.territory_id + '" data-total="' + entry.territories.total_points + '" min="1" max="' + entry.territories.total_points + '" style="width:100%;padding:.3rem .5rem;font-size:.82rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans)"/></div>' +
          '<button class="btn-action btn-save-progress" data-sched="' + entry.id + '" data-ter="' + entry.territory_id + '" data-date="' + day.date + '" data-total="' + entry.territories.total_points + '" style="padding:.4rem .9rem;font-size:.78rem;white-space:nowrap">Guardar</button>' +
          '</div></div>'
        ) : '') +
        (isAdmin ? '<button class="btn-sm danger btn-del-day" data-entry="' + entry.id + '" style="margin-top:.5rem;width:100%">Eliminar dia</button>' : '')
      ) : isAdmin ? (
        '<div style="margin-top:.4rem;display:flex;flex-direction:column;gap:.4rem">' +
        '<select class="day-captain" data-date="' + day.date + '" style="padding:.35rem .5rem;font-size:.78rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans)">' + brotherOpts + '</select>' +
        '<input type="text" class="day-exit" data-date="' + day.date + '" placeholder="Punto de salida..." style="padding:.35rem .5rem;font-size:.78rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans)"/>' +
        '<select class="day-ter" data-date="' + day.date + '" style="padding:.35rem .5rem;font-size:.78rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans)">' + terOpts + '</select>' +
        '<input type="text" class="day-notes" data-date="' + day.date + '" placeholder="Notas opcionales..." style="padding:.35rem .5rem;font-size:.78rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans)"/>' +
        '<button class="btn-action btn-save-day" data-date="' + day.date + '" data-week="' + weekStart + '" style="font-size:.78rem;padding:.42rem">Guardar</button>' +
        '</div>'
      ) : '<div style="font-size:.78rem;color:var(--text3);font-style:italic">Sin actividad programada</div>') +
      '</div>'
  }

  const weekEnd = days[days.length-1].date
  const terGrid = territories.map(function(t) {
    const pct = t.total_points > 0 ? Math.round((t.last_point/t.total_points)*100) : 0
    const color = statusColor[t.status] || '#2e9e6b'
    return '<div class="card" style="padding:.9rem;cursor:pointer" data-ter-id="' + t.id + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem">' +
      '<div><div style="font-size:.7rem;font-weight:700;color:var(--text3)">' + t.number + '.</div>' +
      '<div style="font-weight:700;font-size:.88rem;color:var(--text)">' + t.name + '</div></div>' +
      '<span style="font-size:.65rem;font-weight:700;padding:.18rem .45rem;border-radius:20px;background:' + color + '18;color:' + color + '">' + statusLabel[t.status] + '</span>' +
      '</div>' +
      '<div style="background:var(--border);border-radius:4px;height:6px;margin-bottom:.3rem;overflow:hidden">' +
      '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:4px"></div></div>' +
      '<div style="font-size:.7rem;color:var(--text2)">' +
      (t.last_point > 0 ? 'Punto 1 al ' + t.last_point + ' de ' + t.total_points + ' (' + pct + '%)' : 'Pendiente · ' + t.total_points + ' puntos') +
      '</div></div>'
  }).join('')

  container.innerHTML = '<div class="page active" id="page-field">' +
    '<div class="section-hd"><h2 class="section-title">Predicacion</h2></div>' +
    '<div class="meet-type-tabs" style="margin-bottom:1rem">' +
    '<button class="mtt active" id="ftab-week">Esta semana</button>' +
    '<button class="mtt" id="ftab-territories">Territorios</button>' +
    '</div>' +
    '<div id="field-week">' +
    '<div style="font-size:.75rem;color:var(--text2);margin-bottom:.85rem;font-weight:600">Semana del ' +
    new Date(weekStart+'T00:00:00').toLocaleDateString('es',{day:'numeric',month:'long'}) + ' al ' +
    new Date(weekEnd+'T00:00:00').toLocaleDateString('es',{day:'numeric',month:'long'}) + '</div>' +
    days.map(dayCard).join('') +
    '</div>' +
    '<div id="field-territories" style="display:none">' +
    '<div style="display:flex;gap:.5rem;margin-bottom:.85rem;flex-wrap:wrap">' +
    '<button class="btn-sm active" data-ter-filter="all">Todos</button>' +
    '<button class="btn-sm" data-ter-filter="available">Disponibles</button>' +
    '<button class="btn-sm" data-ter-filter="in-progress">En progreso</button>' +
    '<button class="btn-sm" data-ter-filter="completed">Completados</button>' +
    '</div>' +
    '<div id="ter-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:.7rem">' +
    terGrid + '</div></div>' +
    '<div id="ter-modal" style="display:none;position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.5);padding:1rem;overflow-y:auto">' +
    '<div id="ter-modal-content" style="background:var(--white);border-radius:var(--r);max-width:480px;margin:2rem auto;padding:1.4rem"></div></div>' +
    '</div>'

  attachEvents(container, isAdmin, territories, schedule, zoom, users, weekStart, currentUser)
}

function attachEvents(container, isAdmin, territories, schedule, zoom, users, weekStart, currentUser) {
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

  container.querySelectorAll('[data-ter-filter]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const f = btn.dataset.terFilter
      container.querySelectorAll('[data-ter-filter]').forEach(b => b.classList.toggle('active', b.dataset.terFilter === f))
      container.querySelectorAll('[data-ter-id]').forEach(function(card) {
        const ter = territories.find(t => t.id === card.dataset.terId)
        card.style.display = (f === 'all' || ter?.status === f) ? '' : 'none'
      })
    })
  })

  container.querySelectorAll('[data-ter-id]').forEach(function(card) {
    card.addEventListener('click', function() {
      const ter = territories.find(t => t.id === card.dataset.terId)
      if (ter) showTerModal(container, ter, isAdmin, currentUser)
    })
  })

  if (!isAdmin) return

  // Guardar día campo
  container.querySelectorAll('.btn-save-day').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      const date    = btn.dataset.date
      const week    = btn.dataset.week
      const captain = container.querySelector('.day-captain[data-date="' + date + '"]')?.value
      const exit    = container.querySelector('.day-exit[data-date="' + date + '"]')?.value?.trim()
      const terId   = container.querySelector('.day-ter[data-date="' + date + '"]')?.value
      const notes   = container.querySelector('.day-notes[data-date="' + date + '"]')?.value?.trim()
      if (!captain || !exit) { toast('Error', 'Selecciona encargado y punto de salida', true); return }
      btn.textContent = 'Guardando...'; btn.disabled = true
      const { error } = await supabase.from('field_schedule').insert({
        week_start: week, day_date: date, captain, exit_point: exit,
        territory_id: terId || null, notes: notes || null
      })
      if (error) toast('Error', error.message, true)
      else { toast('Guardado', date); await renderField(container, currentUser) }
      btn.textContent = 'Guardar'; btn.disabled = false
    })
  })

  // Eliminar día campo
  container.querySelectorAll('.btn-del-day').forEach(function(btn) {
    btn.addEventListener('click', async function(e) {
      e.stopPropagation()
      if (!confirm('Eliminar este dia?')) return
      await supabase.from('field_schedule').delete().eq('id', btn.dataset.entry)
      toast('Eliminado', 'Dia eliminado')
      await renderField(container, currentUser)
    })
  })

  // Guardar Zoom
  container.querySelectorAll('.btn-save-zoom').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      const date    = btn.dataset.date
      const week    = btn.dataset.week
      const time    = container.querySelector('.zoom-time[data-date="' + date + '"]')?.value || '15:00'
      const captain = container.querySelector('.zoom-captain[data-date="' + date + '"]')?.value
      const link    = container.querySelector('.zoom-link[data-date="' + date + '"]')?.value?.trim()
      const notes   = container.querySelector('.zoom-notes[data-date="' + date + '"]')?.value?.trim()
      btn.textContent = 'Guardando...'; btn.disabled = true
      const { error } = await supabase.from('zoom_schedule').upsert({
        week_start: week, day_date: date, time,
        captain: captain || null, link: link || null, notes: notes || null
      }, { onConflict: 'week_start,day_date' })
      if (error) toast('Error', error.message, true)
      else { toast('Zoom guardado', date); await renderField(container, currentUser) }
      btn.textContent = 'Guardar'; btn.disabled = false
    })
  })

  // Eliminar Zoom
  container.querySelectorAll('.btn-del-zoom').forEach(function(btn) {
    btn.addEventListener('click', async function(e) {
      e.stopPropagation()
      if (!confirm('Eliminar este Zoom?')) return
      await supabase.from('zoom_schedule').delete().eq('id', btn.dataset.zoom)
      toast('Eliminado', 'Zoom eliminado')
      await renderField(container, currentUser)
    })
  })

  // Registrar avance
  container.querySelectorAll('.btn-save-progress').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      const terId   = btn.dataset.ter
      const date    = btn.dataset.date
      const schedId = btn.dataset.sched
      const total   = parseInt(btn.dataset.total)
      const from    = parseInt(container.querySelector('.prog-from[data-sched="' + schedId + '"]')?.value)
      const to      = parseInt(container.querySelector('.prog-to[data-sched="' + schedId + '"]')?.value)
      if (!from || !to) { toast('Error', 'Ingresa los puntos', true); return }
      if (to < from)    { toast('Error', 'El punto final debe ser mayor', true); return }
      btn.textContent = '...'; btn.disabled = true
      await supabase.from('territory_progress').insert({
        territory_id: terId, schedule_id: schedId, from_point: from, to_point: to, worked_date: date
      })
      const newStatus = to >= total ? 'completed' : 'in-progress'
      await supabase.from('territories').update({ last_point: to, status: newStatus, last_worked: date }).eq('id', terId)
      toast('Avance guardado', 'Del punto ' + from + ' al ' + to + (to >= total ? ' - Completado!' : ''))
      await renderField(container, currentUser)
    })
  })
}

function showTerModal(container, ter, isAdmin, currentUser) {
  const modal   = container.querySelector('#ter-modal')
  const content = container.querySelector('#ter-modal-content')
  const pct     = ter.total_points > 0 ? Math.round((ter.last_point/ter.total_points)*100) : 0
  const colors  = { available:'#2e9e6b', 'in-progress':'#c07820', completed:'#4a90d9' }
  const labels  = { available:'Disponible', 'in-progress':'En progreso', completed:'Completado' }
  const color   = colors[ter.status]

  content.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem">' +
    '<div><div style="font-size:.72rem;color:var(--text3);font-weight:700">TERRITORIO ' + ter.number + '</div>' +
    '<h3 style="font-size:1.1rem;color:var(--text);margin:0">' + ter.name + '</h3></div>' +
    '<button id="close-ter-modal" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:var(--text3)">X</button>' +
    '</div>' +
    '<div style="background:var(--border);border-radius:6px;height:10px;margin-bottom:.5rem;overflow:hidden">' +
    '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:6px"></div></div>' +
    '<div style="font-size:.82rem;color:var(--text2);margin-bottom:1rem">' +
    '<strong style="color:' + color + '">' + pct + '% completado</strong> · ' +
    (ter.last_point > 0 ? 'Del punto 1 al ' + ter.last_point : 'Sin iniciar') + ' de ' + ter.total_points + ' puntos</div>' +
    '<div style="display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap">' +
    '<span style="font-size:.72rem;font-weight:700;padding:.25rem .6rem;border-radius:20px;background:' + color + '18;color:' + color + '">' + labels[ter.status] + '</span>' +
    (ter.last_worked ? '<span style="font-size:.72rem;color:var(--text3)">Ultimo trabajo: ' + new Date(ter.last_worked+'T00:00:00').toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long'}) + '</span>' : '') +
    '</div>' +
    '<div style="font-size:.72rem;color:var(--text2);margin-bottom:.5rem;font-weight:700">PENDIENTE</div>' +
    '<div style="font-size:.88rem;color:var(--text);margin-bottom:1rem;padding:.65rem;background:var(--sky-bg);border-radius:var(--r2);border:1px solid var(--border2)">' +
    (ter.last_point < ter.total_points ? 'Del punto ' + (ter.last_point+1) + ' al ' + ter.total_points : 'Territorio completado') +
    '</div>' +
    (isAdmin && ter.status === 'completed' ? '<button id="btn-reset-ter" style="width:100%;padding:.5rem;background:var(--rose-bg);color:var(--rose);border:1.5px solid var(--rose);border-radius:var(--r2);cursor:pointer;font-family:var(--sans);font-weight:700;font-size:.82rem">Resetear territorio</button>' : '')

  modal.style.display = 'block'
  content.querySelector('#close-ter-modal')?.addEventListener('click', () => { modal.style.display = 'none' })
  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none' })
  content.querySelector('#btn-reset-ter')?.addEventListener('click', async () => {
    if (!confirm('Resetear este territorio?')) return
    await supabase.from('territories').update({ last_point:0, status:'available', last_worked:null }).eq('id', ter.id)
    modal.style.display = 'none'
    toast('Reseteado', ter.name)
    await renderField(container, currentUser)
  })
}