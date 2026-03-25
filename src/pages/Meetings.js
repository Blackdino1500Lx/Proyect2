import { toast } from '../utils/helpers.js'
import { DEMO_MODE, supabase } from '../config/supabase.js'

const LS_KEY = 'pizarra_meetings_v1'

// ── Usuarios ──────────────────────────────────────────────────
async function fetchUsers() {
  if (DEMO_MODE) return []
  const { data } = await supabase.from('users').select('id,name,gender,baptized,school').order('name')
  return data || []
}

function makeSelect(cls, weekId, dataAttr, dataVal, value, users, filter) {
  const f = filter
  const list = f === 'baptized_brother' ? users.filter(u => u.baptized && u.gender !== 'sister')
             : f === 'school'           ? users.filter(u => u.school)
             : f === 'school_brother'   ? users.filter(u => u.school && u.gender !== 'sister')
             : users
  const opts = '<option value="">— Seleccionar —</option>' +
    list.map(u => `<option value="${u.name}"${value === u.name ? ' selected' : ''}>${u.name}</option>`).join('')
  return `<select class="${cls}" data-week="${weekId}" ${dataAttr}="${dataVal}" style="flex:1;min-width:110px;padding:.28rem .5rem;font-size:.75rem;border:1px solid var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)">${opts}</select>`
}

// ── Persistencia ──────────────────────────────────────────────
async function saveWeeks(weeks) {
  if (DEMO_MODE) { localStorage.setItem(LS_KEY, JSON.stringify(weeks)); return }
  for (let i = 0; i < weeks.length; i++) {
    const w = weeks[i]
    await supabase.from('meeting_weeks').upsert({
      id: w.supabase_id || undefined,
      date_range: w.dateRange, bible_reading: w.bibleReading,
      opening_song: w.openingSong, mid_song: w.midSong, closing_song: w.closingSong,
      sections: w.sections, assignments: w.assignments || {}, roles: w.roles || {},
      sort_order: i,
      updated_at: new Date().toISOString()
    }, { onConflict: 'date_range' })
  }
}

async function fetchWeeks() {
  if (DEMO_MODE) {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
  }
  const { data, error } = await supabase.from('meeting_weeks').select('*').order('sort_order', { ascending: true }).order('date_range', { ascending: true })
  if (error) { console.error(error); return [] }
  return (data || []).map(r => ({
    id: r.date_range.replace(/\s/g, '-').toLowerCase(),
    supabase_id: r.id, dateRange: r.date_range, bibleReading: r.bible_reading,
    openingSong: r.opening_song, midSong: r.mid_song, closingSong: r.closing_song,
    sections: r.sections, assignments: r.assignments || {}, roles: r.roles || {}
  }))
}

async function deleteWeek(week) {
  if (DEMO_MODE) {
    const weeks = await fetchWeeks()
    localStorage.setItem(LS_KEY, JSON.stringify(weeks.filter(w => w.id !== week.id)))
    return
  }
  if (week.supabase_id) await supabase.from('meeting_weeks').delete().eq('id', week.supabase_id)
}

async function saveWeekAssignments(week) {
  if (DEMO_MODE) {
    const weeks = await fetchWeeks()
    const idx = weeks.findIndex(w => w.id === week.id)
    if (idx >= 0) { weeks[idx].assignments = week.assignments; weeks[idx].roles = week.roles }
    localStorage.setItem(LS_KEY, JSON.stringify(weeks))
    return
  }
  await supabase.from('meeting_weeks').update({
    assignments: week.assignments, roles: week.roles, updated_at: new Date().toISOString()
  }).eq('id', week.supabase_id)
}

// ── Netlify proxy ─────────────────────────────────────────────
async function extractPDFWithClaude(base64PDF) {
  const res = await fetch('/.netlify/functions/extract-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pdfBase64: base64PDF })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Error ${res.status}` }))
    throw new Error(err.error || `Error del servidor: ${res.status}`)
  }
  const data = await res.json()
  if (!data?.weeks) throw new Error('Respuesta inesperada del servidor')
  return data
}

// ── Render ────────────────────────────────────────────────────
export async function renderMeetings(container, currentUser) {
  const isAdmin = currentUser?.role === 'admin'
  container.innerHTML = `<div class="page active" id="page-meetings">
    <div class="section-hd"><h2 class="section-title">Reuniones</h2></div>
    <div class="empty"><span class="spin" style="width:24px;height:24px;border-top-color:var(--sky);border-color:var(--border2)"></span></div>
  </div>`
  const [weeks, users] = await Promise.all([fetchWeeks(), fetchUsers()])
  container.innerHTML = buildHTML(isAdmin, weeks, users)
  attachEvents(container, isAdmin, weeks, currentUser, users)
}

function buildHTML(isAdmin, weeks, users) {
  return `<div class="page active" id="page-meetings">
    <div class="section-hd">
      <h2 class="section-title">Reuniones</h2>
      ${weeks.length > 0 ? `<span class="badge b-green">&#10003; ${weeks.length} semanas</span>` : ''}
    </div>
    ${isAdmin ? buildUploadCard(weeks) : ''}
    <div id="weeks-list">
      ${weeks.length > 0
        ? weeks.map((w, i) => buildWeekCard(w, i, isAdmin, users)).join('')
        : `<div class="empty"><span class="emic">&#128197;</span><p>${isAdmin ? 'Sube la guía de actividades para comenzar' : 'No hay reuniones programadas aún'}</p></div>`}
    </div>
  </div>`
}

function buildUploadCard(weeks) {
  return `<div class="card" style="border-color:var(--border2);margin-bottom:1.2rem">
    <div class="card-hd">
      <span class="card-title">Guia de Actividades</span>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        ${weeks.length > 0 ? `<button class="btn-sm danger" id="btn-clear-meetings">Limpiar todo</button>` : ''}
        <label for="pdf-input" class="btn-action" style="cursor:pointer;padding:.5rem 1rem;font-size:.85rem">Subir PDF</label>
      </div>
    </div>
    <p style="font-size:.82rem;color:var(--text2);margin-bottom:.75rem">Sube el PDF de la Guia de Actividades — Claude extraera las semanas automaticamente.</p>
    <input type="file" id="pdf-input" accept=".pdf" style="display:none"/>
    <div id="pdf-progress" style="display:none">
      <div style="display:flex;align-items:center;gap:.75rem;padding:.85rem;background:var(--sky-bg);border-radius:var(--r2);border:1px solid var(--border2)">
        <span class="spin" style="border-top-color:var(--sky);border-color:rgba(74,144,217,.25)"></span>
        <div>
          <div style="font-weight:700;font-size:.88rem;color:var(--sky3)" id="prog-title">Procesando PDF...</div>
          <div style="font-size:.76rem;color:var(--text2)" id="prog-desc">Esto puede tardar 15-20 segundos</div>
        </div>
      </div>
    </div>
  </div>`
}

function getMonthFromRange(dr) {
  dr = dr || ''
  const m = {ENERO:'ENE',FEBRERO:'FEB',MARZO:'MAR',ABRIL:'ABR',MAYO:'MAY',JUNIO:'JUN',JULIO:'JUL',AGOSTO:'AGO',SEPTIEMBRE:'SEP',OCTUBRE:'OCT',NOVIEMBRE:'NOV',DICIEMBRE:'DIC'}
  for (const [f, s] of Object.entries(m)) { if (dr.includes(f)) return s }
  return ''
}

function buildWeekCard(week, index, isAdmin, users) {
  const typeLabels = { talk:'Discurso', reading:'Lectura', demo:'Demostracion', discussion:'Analisis', study:'Estudio' }
  const typeBadges = { talk:'b-amber', reading:'b-sky', demo:'b-green', discussion:'b-gray', study:'b-sky' }
  const secColors  = { 'TESOROS DE LA BIBLIA':'#c07820', 'SEAMOS MEJORES MAESTROS':'#2e9e6b', 'NUESTRA VIDA CRISTIANA':'#4a90d9' }
  const roles = week.roles || {}
  const asgn  = week.assignments || {}

  function fixedField(key, label, icon, filter) {
    const sel = isAdmin
      ? makeSelect('role-input', week.id, 'data-role', key, roles[key] || '', users, filter)
      : roles[key]
        ? `<div style="font-size:.82rem;color:var(--sky3);font-weight:600">&#128100; ${roles[key]}</div>`
        : `<div style="font-size:.78rem;color:var(--text3);font-style:italic">Sin asignar</div>`
    return `<div style="padding:.45rem 0;border-bottom:1px solid var(--border)">
      <div style="font-size:.72rem;font-weight:700;color:var(--text2);margin-bottom:.22rem">${icon} ${label}</div>
      ${sel}
    </div>`
  }

  const sectionsHTML = (week.sections || []).map(function(sec) {
    const color = secColors[sec.name] || '#4a90d9'
    const isMMT = sec.name === 'SEAMOS MEJORES MAESTROS'

    const items = (sec.items || []).map(function(item) {
      const isStudy = item.type === 'study'
      const aKey = 'item_' + item.number
      const hKey = 'help_' + item.number
      const cKey = 'conduct_' + item.number
      const rKey = 'reader_' + item.number

      let assignHTML = ''
      if (isAdmin) {
        if (isStudy) {
          assignHTML = '<div style="display:flex;gap:.35rem;flex-wrap:wrap">' +
            makeSelect('assign-input', week.id, 'data-key', cKey, asgn[cKey] || '', users, 'baptized_brother') +
            makeSelect('assign-input', week.id, 'data-key', rKey, asgn[rKey] || '', users, 'school_brother') +
            '</div>'
        } else if (isMMT) {
          assignHTML = '<div style="display:flex;gap:.35rem;flex-wrap:wrap">' +
            makeSelect('assign-input', week.id, 'data-key', aKey, asgn[aKey] || '', users, 'school') +
            makeSelect('assign-input', week.id, 'data-key', hKey, asgn[hKey] || '', users, 'school') +
            '</div>'
        } else {
          assignHTML = makeSelect('assign-input', week.id, 'data-key', aKey, asgn[aKey] || '', users, 'baptized_brother')
        }
      } else {
        if (isStudy) {
          assignHTML = (asgn[cKey] ? `<div style="font-size:.77rem;color:var(--sky3);font-weight:600">&#127908; ${asgn[cKey]}</div>` : '') +
                       (asgn[rKey] ? `<div style="font-size:.77rem;color:var(--sky3);font-weight:600">&#128214; ${asgn[rKey]}</div>` : '')
        } else if (isMMT) {
          assignHTML = (asgn[aKey] ? `<div style="font-size:.77rem;color:var(--sky3);font-weight:600">&#128100; ${asgn[aKey]}</div>` : '') +
                       (asgn[hKey] ? `<div style="font-size:.77rem;color:var(--sky3);font-weight:600">&#129309; ${asgn[hKey]}</div>` : '')
        } else {
          assignHTML = asgn[aKey] ? `<div style="font-size:.77rem;color:var(--sky3);font-weight:600">&#128100; ${asgn[aKey]}</div>` : ''
        }
      }

      return '<div style="padding:.5rem 0;border-bottom:1px solid rgba(0,0,0,.04)">' +
        '<div style="display:flex;align-items:flex-start;gap:.5rem">' +
        `<div style="width:20px;height:20px;border-radius:50%;background:${color}18;color:${color};display:flex;align-items:center;justify-content:center;font-size:.68rem;font-weight:700;flex-shrink:0;margin-top:.1rem">${item.number}</div>` +
        '<div style="flex:1;min-width:0">' +
        `<div style="font-weight:600;font-size:.84rem;color:var(--text);line-height:1.3">${item.title}</div>` +
        `<div style="display:flex;gap:.3rem;margin:.2rem 0 .3rem;flex-wrap:wrap"><span class="badge ${typeBadges[item.type] || 'b-gray'}" style="font-size:.65rem">${typeLabels[item.type] || item.type}</span><span style="font-size:.7rem;color:var(--text3)">${item.duration} min.</span></div>` +
        assignHTML +
        '</div></div></div>'
    }).join('')

    return `<div style="margin-bottom:.9rem">` +
      `<div style="display:flex;align-items:center;gap:.45rem;margin-bottom:.45rem;padding-bottom:.3rem;border-bottom:2px solid ${color}22">` +
      `<span>${sec.icon}</span>` +
      `<span style="font-size:.68rem;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:.06em">${sec.name}</span>` +
      `</div>${items}</div>`
  }).join('')

  const saveBtn = isAdmin
    ? `<button class="btn-action btn-save-week" data-week-id="${week.id}" style="width:100%;margin-top:.9rem">Guardar asignaciones</button>`
    : ''

  return `<div class="meet-accordion" id="week-${week.id}">
    <div class="meet-accordion-hd" data-week="${week.id}">
      <div class="meet-date">
        <div class="meet-day" style="font-size:.82rem;white-space:nowrap;line-height:1.2">${week.dateRange.split(' ').slice(0,3).join(' ')}</div>
        <div class="meet-mon">${getMonthFromRange(week.dateRange)}</div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:.92rem;color:var(--text)">${week.dateRange}</div>
        <div style="font-size:.76rem;color:var(--text2)">${week.bibleReading || ''}</div>
        <div style="font-size:.7rem;color:var(--text3);margin-top:.1rem">Cancion ${week.openingSong || ''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:.35rem;flex-shrink:0">
        ${isAdmin ? `<button class="btn-sm danger" data-del-week="${week.id}" style="font-size:.68rem;padding:.22rem .5rem">X</button>` : ''}
        <span class="meet-chevron">v</span>
      </div>
    </div>
    <div class="meet-accordion-body">
      <div style="padding-top:.8rem">
        <div style="background:var(--sky-bg);border-radius:var(--r2);padding:.6rem .85rem;margin-bottom:.85rem;border:1px solid var(--border2)">
          ${fixedField('presidente', 'Presidente de la reunion', '&#127908;', 'baptized_brother')}
          ${fixedField('oracion_apertura', 'Oracion de apertura', '&#128591;', 'baptized_brother')}
          <div style="font-size:.7rem;color:var(--text3);padding:.3rem 0 0">Cancion ${week.openingSong || ''} · Palabras de introduccion</div>
        </div>
        ${sectionsHTML}
        <div style="background:var(--sky-bg);border-radius:var(--r2);padding:.6rem .85rem;margin-top:.5rem;border:1px solid var(--border2)">
          <div style="font-size:.7rem;color:var(--text3);padding-bottom:.3rem">Cancion ${week.midSong || ''}</div>
          ${fixedField('oracion_cierre', 'Oracion de cierre', '&#128591;', 'baptized_brother')}
          <div style="font-size:.7rem;color:var(--text3);padding:.3rem 0 0">Cancion ${week.closingSong || ''} · Palabras de conclusion</div>
        </div>
        ${saveBtn}
      </div>
    </div>
  </div>`
}

// ── Events ────────────────────────────────────────────────────
function attachEvents(container, isAdmin, weeks, currentUser, users) {
  container.querySelectorAll('.meet-accordion-hd').forEach(function(hd) {
    hd.addEventListener('click', function(e) {
      if (e.target.closest('[data-del-week]') || e.target.tagName === 'SELECT') return
      hd.closest('.meet-accordion').classList.toggle('open')
    })
  })

  container.querySelectorAll('select').forEach(function(sel) {
    sel.addEventListener('click', function(e) { e.stopPropagation() })
  })

  if (!isAdmin) return

  container.querySelector('#pdf-input') && container.querySelector('#pdf-input').addEventListener('change', async function(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    await processPDF(file, container, currentUser, weeks)
  })

  container.querySelector('#btn-clear-meetings') && container.querySelector('#btn-clear-meetings').addEventListener('click', async function() {
    if (!confirm('Eliminar todas las semanas?')) return
    if (DEMO_MODE) {
      localStorage.removeItem(LS_KEY)
    } else {
      for (const w of weeks) {
        if (w.supabase_id) await supabase.from('meeting_weeks').delete().eq('id', w.supabase_id)
      }
    }
    toast('Limpiado', 'Semanas eliminadas')
    await renderMeetings(container, currentUser)
  })

  container.querySelectorAll('[data-del-week]').forEach(function(btn) {
    btn.addEventListener('click', async function(e) {
      e.stopPropagation()
      if (!confirm('Eliminar esta semana?')) return
      const week = weeks.find(function(w) { return w.id === btn.dataset.delWeek })
      if (week) await deleteWeek(week)
      toast('Eliminado', 'Semana eliminada')
      await renderMeetings(container, currentUser)
    })
  })

  container.querySelectorAll('.btn-save-week').forEach(function(btn) {
    btn.addEventListener('click', async function(e) {
      e.stopPropagation()
      const weekId = btn.dataset.weekId
      const week = weeks.find(function(w) { return w.id === weekId })
      if (!week) return

      week.assignments = {}
      week.roles = {}

      container.querySelectorAll('.assign-input[data-week="' + weekId + '"]').forEach(function(inp) {
        week.assignments[inp.dataset.key] = inp.value
      })
      container.querySelectorAll('.role-input[data-week="' + weekId + '"]').forEach(function(inp) {
        week.roles[inp.dataset.role] = inp.value
      })

      btn.textContent = 'Guardando...'
      btn.disabled = true
      try {
        await saveWeekAssignments(week)
        toast('Guardado!', week.dateRange)
      } catch(err) {
        toast('Error', err.message, true)
      }
      btn.textContent = 'Guardar asignaciones'
      btn.disabled = false
    })
  })
}

async function processPDF(file, container, currentUser, existingWeeks) {
  const prog = container.querySelector('#pdf-progress')
  const pTitle = container.querySelector('#prog-title')
  const pDesc = container.querySelector('#prog-desc')

  if (prog) prog.style.display = 'block'
  if (pTitle) pTitle.textContent = 'Leyendo el PDF...'
  if (pDesc) pDesc.textContent = 'Convirtiendo archivo...'

  try {
    const base64 = await new Promise(function(resolve, reject) {
      const reader = new FileReader()
      reader.onload = function() { resolve(reader.result.split(',')[1]) }
      reader.onerror = function() { reject(new Error('No se pudo leer el archivo')) }
      reader.readAsDataURL(file)
    })

    if (pTitle) pTitle.textContent = 'Analizando con IA...'
    if (pDesc) pDesc.textContent = 'Claude esta extrayendo las semanas (15-25 seg.)'

    const result = await extractPDFWithClaude(base64)
    if (!result || !result.weeks || !result.weeks.length) throw new Error('No se encontraron semanas en el PDF')

    result.weeks.forEach(function(nw) {
      nw.id = nw.dateRange.replace(/\s/g, '-').toLowerCase()
      const old = existingWeeks.find(function(w) { return w.dateRange === nw.dateRange })
      nw.assignments = old && old.assignments ? old.assignments : {}
      nw.roles = old && old.roles ? old.roles : {}
      if (old && old.supabase_id) nw.supabase_id = old.supabase_id
    })

    await saveWeeks(result.weeks)
    if (prog) prog.style.display = 'none'
    toast('Guia cargada!', result.weeks.length + ' semanas guardadas')
    await renderMeetings(container, currentUser)

  } catch(err) {
    if (prog) prog.style.display = 'none'
    toast('Error', err.message || 'No se pudo procesar el PDF', true)
    console.error(err)
  }
}