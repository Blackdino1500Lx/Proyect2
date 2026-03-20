import { toast } from '../utils/helpers.js'
import { DEMO_MODE, supabase } from '../config/supabase.js'

const LS_KEY = 'pizarra_meetings_v1'

// ── Cargar usuarios para selects ──────────────────────────────
async function fetchUsers() {
  if (DEMO_MODE) return []
  const { data } = await supabase.from('users').select('id,name,gender,baptized,school').order('name')
  return data || []
}

// Filtros por tipo de parte
function getUserOptions(users, filter) {
  let filtered = users
  if (filter === 'baptized_brother')   filtered = users.filter(u => u.baptized && u.gender !== 'sister')
  if (filter === 'school')             filtered = users.filter(u => u.school)
  if (filter === 'school_brother')     filtered = users.filter(u => u.school && u.gender !== 'sister')
  return `<option value="">— Seleccionar —</option>` +
    filtered.map(u => `<option value="${u.name}">${u.name}</option>`).join('')
}

function userSelect(cls, weekId, key, value, filter, users, placeholder='') {
  const opts = getUserOptions(users, filter)
  return `<select class="${cls}" data-week="${weekId}" data-key="${key}"
    style="flex:1;min-width:110px;padding:.28rem .5rem;font-size:.75rem;border:1px solid var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)">
    ${opts}
  </select>`
}

function roleSelect(cls, weekId, role, value, filter, users) {
  const opts = getUserOptions(users, filter)
  return `<select class="${cls}" data-week="${weekId}" data-role="${role}"
    style="width:100%;padding:.3rem .55rem;font-size:.78rem;border:1px solid var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)">
    ${opts}
  </select>`
}

// ── Persistencia: Supabase o localStorage ─────────────────────
async function saveWeeks(weeks) {
  if (DEMO_MODE) {
    localStorage.setItem(LS_KEY, JSON.stringify(weeks))
    return
  }
  // En Supabase: upsert por date_range
  for (const w of weeks) {
    await supabase.from('meeting_weeks').upsert({
      id:            w.supabase_id || undefined,
      date_range:    w.dateRange,
      bible_reading: w.bibleReading,
      opening_song:  w.openingSong,
      mid_song:      w.midSong,
      closing_song:  w.closingSong,
      sections:      w.sections,
      assignments:   w.assignments || {},
      roles:         w.roles || {},
      updated_at:    new Date().toISOString()
    }, { onConflict: 'date_range' })
  }
}

async function fetchWeeks() {
  if (DEMO_MODE) {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
  }
  const { data, error } = await supabase
    .from('meeting_weeks')
    .select('*')
    .order('date_range', { ascending: true })
  if (error) { console.error(error); return [] }
  // Mapear columnas de Supabase al formato interno
  return (data || []).map(r => ({
    id:           r.date_range.replace(/\s/g, '-').toLowerCase(),
    supabase_id:  r.id,
    dateRange:    r.date_range,
    bibleReading: r.bible_reading,
    openingSong:  r.opening_song,
    midSong:      r.mid_song,
    closingSong:  r.closing_song,
    sections:     r.sections,
    assignments:  r.assignments || {},
    roles:        r.roles || {}
  }))
}

async function deleteWeek(week) {
  if (DEMO_MODE) {
    const weeks = await fetchWeeks()
    localStorage.setItem(LS_KEY, JSON.stringify(weeks.filter(w => w.id !== week.id)))
    return
  }
  if (week.supabase_id) {
    await supabase.from('meeting_weeks').delete().eq('id', week.supabase_id)
  }
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
    assignments: week.assignments,
    roles:       week.roles,
    updated_at:  new Date().toISOString()
  }).eq('id', week.supabase_id)
}

// ── Netlify Function proxy ────────────────────────────────────
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

// ── Render principal ──────────────────────────────────────────
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

function buildHTML(isAdmin, weeks, users=[]) {
  return `<div class="page active" id="page-meetings">
    <div class="section-hd">
      <h2 class="section-title">Reuniones</h2>
      ${weeks.length > 0 ? `<span class="badge b-green">✓ ${weeks.length} semanas</span>` : ''}
    </div>
    ${isAdmin ? buildUploadCard(weeks) : ''}
    <div id="weeks-list">
      ${weeks.length > 0
        ? weeks.map((w,i) => buildWeekCard(w, i, isAdmin, users)).join('')
        : `<div class="empty"><span class="emic">📅</span><p>${isAdmin ? 'Sube la guía de actividades para comenzar' : 'No hay reuniones programadas aún'}</p></div>`}
    </div>
  </div>`
}

function buildUploadCard(weeks) {
  return `
  <div class="card" style="border-color:var(--border2);margin-bottom:1.2rem">
    <div class="card-hd">
      <span class="card-title">📄 Guía de Actividades</span>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        ${weeks.length > 0 ? `<button class="btn-sm danger" id="btn-clear-meetings">Limpiar todo</button>` : ''}
        <label for="pdf-input" class="btn-action" style="cursor:pointer;padding:.5rem 1rem;font-size:.85rem">📋 Subir PDF</label>
      </div>
    </div>
    <p style="font-size:.82rem;color:var(--text2);margin-bottom:.75rem">
      Sube el PDF de la Guía de Actividades — Claude extraerá las semanas automáticamente.
    </p>
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

function buildWeekCard(week, index, isAdmin, users=[]) {
  const typeLabels = { talk:'Discurso', reading:'Lectura', demo:'Demostración', discussion:'Análisis', study:'Estudio' }
  const typeBadges = { talk:'b-amber', reading:'b-sky', demo:'b-green', discussion:'b-gray', study:'b-sky' }
  const secColors  = { 'TESOROS DE LA BIBLIA':'#c07820', 'SEAMOS MEJORES MAESTROS':'#2e9e6b', 'NUESTRA VIDA CRISTIANA':'#4a90d9' }
  const roles = week.roles || {}
  const asgn  = week.assignments || {}

  // Select helper que muestra el valor guardado como selected
  const makeSelect = (cls, weekId, key, value, filter) => {
    const filtered = filter === 'baptized_brother' ? users.filter(u => u.baptized && u.gender !== 'sister')
                   : filter === 'school'           ? users.filter(u => u.school)
                   : filter === 'school_brother'   ? users.filter(u => u.school && u.gender !== 'sister')
                   : users
    const opts = `<option value="">— Seleccionar —</option>` +
      filtered.map(u => `<option value="${u.name}" ${value===u.name?'selected':''}>${u.name}</option>`).join('')
    return `<select class="${cls}" data-week="${weekId}" data-key="${key}"
      style="flex:1;min-width:110px;padding:.28rem .5rem;font-size:.75rem;border:1px solid var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)">
      ${opts}</select>`
  }

  const makeRoleSelect = (cls, weekId, role, value, filter) => {
    const filtered = filter === 'baptized_brother' ? users.filter(u => u.baptized && u.gender !== 'sister')
                   : users
    const opts = `<option value="">— Seleccionar —</option>` +
      filtered.map(u => `<option value="${u.name}" ${value===u.name?'selected':''}>${u.name}</option>`).join('')
    return `<select class="${cls}" data-week="${weekId}" data-role="${role}"
      style="width:100%;padding:.3rem .55rem;font-size:.78rem;border:1px solid var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)">
      ${opts}</select>`
  }

  const fixedField = (key, label, icon, filter) => `
    <div style="padding:.45rem 0;border-bottom:1px solid var(--border)">
      <div style="font-size:.72rem;font-weight:700;color:var(--text2);margin-bottom:.22rem">${icon} ${label}</div>
      ${isAdmin
        ? makeRoleSelect('role-input', week.id, key, roles[key]||'', filter)
        : roles[key]
          ? `<div style="font-size:.82rem;color:var(--sky3);font-weight:600">👤 ${roles[key]}</div>`
          : `<div style="font-size:.78rem;color:var(--text3);font-style:italic">Sin asignar</div>`
      }
    </div>`

  const sectionsHTML = (week.sections || []).map(sec => {
    const color = secColors[sec.name] || '#4a90d9'
    const isMMT = sec.name === 'SEAMOS MEJORES MAESTROS'

    const items = (sec.items || []).map(item => {
      const isStudy   = item.type === 'study'
      const isReading = item.type === 'reading'
      const aKey  = `item_${item.number}`
      const hKey  = `help_${item.number}`
      const cKey  = `conduct_${item.number}`
      const rKey  = `reader_${item.number}`

      // Determinar filtro según el tipo de parte
      const mainFilter = isMMT    ? 'school'
                       : isStudy  ? 'baptized_brother'
                       : isReading? 'school_brother'
                       : 'baptized_brother'
      const helpFilter = 'school'
      const readerFilter = 'school_brother'

      return `<div style="padding:.5rem 0;border-bottom:1px solid rgba(0,0,0,.04)">
        <div style="display:flex;align-items:flex-start;gap:.5rem">
          <div style="width:20px;height:20px;border-radius:50%;background:${color}18;color:${color};display:flex;align-items:center;justify-content:center;font-size:.68rem;font-weight:700;flex-shrink:0;margin-top:.1rem">${item.number}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:.84rem;color:var(--text);line-height:1.3">${item.title}</div>
            <div style="display:flex;gap:.3rem;margin:.2rem 0 .3rem;flex-wrap:wrap">
              <span class="badge ${typeBadges[item.type]||'b-gray'}" style="font-size:.65rem">${typeLabels[item.type]||item.type}</span>
              <span style="font-size:.7rem;color:var(--text3)">${item.duration} min.</span>
            </div>
            ${isAdmin ? `
              ${isStudy ? `
                <div style="display:flex;gap:.35rem;flex-wrap:wrap">
                  ${makeSelect('assign-input', week.id, cKey, asgn[cKey]||'', 'baptized_brother')}
                  ${makeSelect('assign-input', week.id, rKey, asgn[rKey]||'', 'school_brother')}
                </div>` : isMMT ? `
                <div style="display:flex;gap:.35rem;flex-wrap:wrap">
                  ${makeSelect('assign-input', week.id, aKey, asgn[aKey]||'', 'school')}
                  ${makeSelect('assign-input', week.id, hKey, asgn[hKey]||'', 'school')}
                </div>` : `
                ${makeSelect('assign-input', week.id, aKey, asgn[aKey]||'', mainFilter)}`
            }` : `
              ${isStudy ? `<div style="display:flex;flex-direction:column;gap:.15rem">
                  ${asgn[cKey] ? `<div style="font-size:.77rem;color:var(--sky3);font-weight:600">🎤 ${asgn[cKey]}</div>` : ''}
                  ${asgn[rKey] ? `<div style="font-size:.77rem;color:var(--sky3);font-weight:600">📖 ${asgn[rKey]}</div>` : ''}
                </div>` : isMMT ? `<div style="display:flex;flex-direction:column;gap:.15rem">
                  ${asgn[aKey] ? `<div style="font-size:.77rem;color:var(--sky3);font-weight:600">👤 ${asgn[aKey]}</div>` : ''}
                  ${asgn[hKey] ? `<div style="font-size:.77rem;color:var(--sky3);font-weight:600">🤝 ${asgn[hKey]}</div>` : ''}
                </div>` : `
                ${asgn[aKey] ? `<div style="font-size:.77rem;color:var(--sky3);font-weight:600">👤 ${asgn[aKey]}</div>` : ''}`
              }`}
          </div>
        </div>
      </div>`
    }).join('')

    return `<div style="margin-bottom:.9rem">
      <div style="display:flex;align-items:center;gap:.45rem;margin-bottom:.45rem;padding-bottom:.3rem;border-bottom:2px solid ${color}22">
        <span>${sec.icon}</span>
        <span style="font-size:.68rem;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:.06em">${sec.name}</span>
      </div>
      ${items}
    </div>`
  }).join('')

  return `
  <div class="meet-accordion" id="week-${week.id}">
    <div class="meet-accordion-hd" data-week="${week.id}">
      <div class="meet-date">
        <div class="meet-day" style="font-size:.82rem;white-space:nowrap;line-height:1.2">${week.dateRange.split(' ').slice(0,3).join(' ')}</div>
        <div class="meet-mon">${getMonthFromRange(week.dateRange)}</div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:.92rem;color:var(--text)">${week.dateRange}</div>
        <div style="font-size:.76rem;color:var(--text2)">${week.bibleReading||''}</div>
        <div style="font-size:.7rem;color:var(--text3);margin-top:.1rem">🎵 Canción ${week.openingSong||''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:.35rem;flex-shrink:0">
        ${isAdmin ? `<button class="btn-sm danger" data-del-week="${week.id}" style="font-size:.68rem;padding:.22rem .5rem">✕</button>` : ''}
        <span class="meet-chevron">▼</span>
      </div>
    </div>

    <div class="meet-accordion-body">
      <div style="padding-top:.8rem">

        <div style="background:var(--sky-bg);border-radius:var(--r2);padding:.6rem .85rem;margin-bottom:.85rem;border:1px solid var(--border2)">
          ${fixedField('presidente','Presidente de la reunión','🎙️','baptized_brother')}
          ${fixedField('oracion_apertura','Oración de apertura','🙏','baptized_brother')}
          <div style="font-size:.7rem;color:var(--text3);padding:.3rem 0 0">🎵 Canción ${week.openingSong||''} · Palabras de introducción</div>
        </div>

        ${sectionsHTML}

        <div style="background:var(--sky-bg);border-radius:var(--r2);padding:.6rem .85rem;margin-top:.5rem;border:1px solid var(--border2)">
          <div style="font-size:.7rem;color:var(--text3);padding-bottom:.3rem">🎵 Canción ${week.midSong||''}</div>
          ${fixedField('oracion_cierre','Oración de cierre','🙏','baptized_brother')}
          <div style="font-size:.7rem;color:var(--text3);padding:.3rem 0 0">🎵 Canción ${week.closingSong||''} · Palabras de conclusión</div>
        </div>

        ${isAdmin ? `
        <button class="btn-action btn-save-week" data-week-id="${week.id}" style="width:100%;margin-top:.9rem">
          💾 Guardar asignaciones
        </button>` : ''}

      </div>
    </div>
  </div>`
}
  const typeLabels = { talk:'Discurso', reading:'Lectura', demo:'Demostración', discussion:'Análisis', study:'Estudio' }
  const typeBadges = { talk:'b-amber', reading:'b-sky', demo:'b-green', discussion:'b-gray', study:'b-sky' }
  const secColors  = { 'TESOROS DE LA BIBLIA':'#c07820', 'SEAMOS MEJORES MAESTROS':'#2e9e6b', 'NUESTRA VIDA CRISTIANA':'#4a90d9' }
  const roles = week.roles || {}

  const fixedField = (key, label, icon='👤') => `
    <div style="padding:.45rem 0;border-bottom:1px solid var(--border)">
      <div style="font-size:.72rem;font-weight:700;color:var(--text2);margin-bottom:.22rem">${icon} ${label}</div>
      ${isAdmin
        ? `<input type="text" class="role-input" data-week="${week.id}" data-role="${key}"
            placeholder="Asignar persona..."
            value="${roles[key]||''}"
            style="width:100%;padding:.3rem .55rem;font-size:.78rem;border:1px dashed var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)"/>`
        : roles[key]
          ? `<div style="font-size:.82rem;color:var(--sky3);font-weight:600">👤 ${roles[key]}</div>`
          : `<div style="font-size:.78rem;color:var(--text3);font-style:italic">Sin asignar</div>`
      }
    </div>`

  const sectionsHTML = (week.sections || []).map(sec => {
    const color = secColors[sec.name] || '#4a90d9'
    const items = (sec.items || []).map(item => {
      const isMMTeacher = sec.name === 'SEAMOS MEJORES MAESTROS'
      const isStudy     = item.type === 'study'
      const aKey  = `item_${item.number}`
      const hKey  = `help_${item.number}`
      const cKey  = `conduct_${item.number}`
      const rKey  = `reader_${item.number}`
      const asgn  = week.assignments || {}

      return `<div style="padding:.5rem 0;border-bottom:1px solid rgba(0,0,0,.04)">
        <div style="display:flex;align-items:flex-start;gap:.5rem">
          <div style="width:20px;height:20px;border-radius:50%;background:${color}18;color:${color};display:flex;align-items:center;justify-content:center;font-size:.68rem;font-weight:700;flex-shrink:0;margin-top:.1rem">${item.number}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:.84rem;color:var(--text);line-height:1.3">${item.title}</div>
            <div style="display:flex;gap:.3rem;margin:.2rem 0 .3rem;flex-wrap:wrap">
              <span class="badge ${typeBadges[item.type]||'b-gray'}" style="font-size:.65rem">${typeLabels[item.type]||item.type}</span>
              <span style="font-size:.7rem;color:var(--text3)">${item.duration} min.</span>
            </div>
            ${isAdmin ? `
              ${isStudy ? `
                <div style="display:flex;gap:.35rem;flex-wrap:wrap">
                  <input type="text" class="assign-input" data-week="${week.id}" data-key="${cKey}" placeholder="🎤 Conductor..." value="${asgn[cKey]||''}" style="flex:1;min-width:110px;padding:.28rem .5rem;font-size:.75rem;border:1px dashed var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)"/>
                  <input type="text" class="assign-input" data-week="${week.id}" data-key="${rKey}" placeholder="📖 Lector..." value="${asgn[rKey]||''}" style="flex:1;min-width:110px;padding:.28rem .5rem;font-size:.75rem;border:1px dashed var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)"/>
                </div>` : isMMTeacher ? `
                <div style="display:flex;gap:.35rem;flex-wrap:wrap">
                  <input type="text" class="assign-input" data-week="${week.id}" data-key="${aKey}" placeholder="👤 Principal..." value="${asgn[aKey]||''}" style="flex:1;min-width:110px;padding:.28rem .5rem;font-size:.75rem;border:1px dashed var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)"/>
                  <input type="text" class="assign-input" data-week="${week.id}" data-key="${hKey}" placeholder="🤝 Ayudante..." value="${asgn[hKey]||''}" style="flex:1;min-width:110px;padding:.28rem .5rem;font-size:.75rem;border:1px dashed var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)"/>
                </div>` : `
                <input type="text" class="assign-input" data-week="${week.id}" data-key="${aKey}" placeholder="👤 Asignar persona..." value="${asgn[aKey]||''}" style="width:100%;padding:.28rem .5rem;font-size:.75rem;border:1px dashed var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)"/>`
              }` : `
              ${isStudy ? `<div style="display:flex;flex-direction:column;gap:.15rem">
                  ${asgn[cKey] ? `<div style="font-size:.77rem;color:var(--sky3);font-weight:600">🎤 ${asgn[cKey]}</div>` : ''}
                  ${asgn[rKey] ? `<div style="font-size:.77rem;color:var(--sky3);font-weight:600">📖 ${asgn[rKey]}</div>` : ''}
                </div>` : isMMTeacher ? `<div style="display:flex;flex-direction:column;gap:.15rem">
                  ${asgn[aKey] ? `<div style="font-size:.77rem;color:var(--sky3);font-weight:600">👤 ${asgn[aKey]}</div>` : ''}
                  ${asgn[hKey] ? `<div style="font-size:.77rem;color:var(--sky3);font-weight:600">🤝 ${asgn[hKey]}</div>` : ''}
                </div>` : `
                ${asgn[aKey] ? `<div style="font-size:.77rem;color:var(--sky3);font-weight:600">👤 ${asgn[aKey]}</div>` : ''}`
              }`}
          </div>
        </div>
      </div>`
    }).join('')

    return `<div style="margin-bottom:.9rem">
      <div style="display:flex;align-items:center;gap:.45rem;margin-bottom:.45rem;padding-bottom:.3rem;border-bottom:2px solid ${color}22">
        <span>${sec.icon}</span>
        <span style="font-size:.68rem;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:.06em">${sec.name}</span>
      </div>
      ${items}
    </div>`
  }).join('')

  return `
  <div class="meet-accordion" id="week-${week.id}">
    <div class="meet-accordion-hd" data-week="${week.id}">
      <div class="meet-date">
        <div class="meet-day" style="font-size:.82rem;white-space:nowrap;line-height:1.2">${week.dateRange.split(' ').slice(0,3).join(' ')}</div>
        <div class="meet-mon">${getMonthFromRange(week.dateRange)}</div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:.92rem;color:var(--text)">${week.dateRange}</div>
        <div style="font-size:.76rem;color:var(--text2)">${week.bibleReading||''}</div>
        <div style="font-size:.7rem;color:var(--text3);margin-top:.1rem">🎵 Canción ${week.openingSong||''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:.35rem;flex-shrink:0">
        ${isAdmin ? `<button class="btn-sm danger" data-del-week="${week.id}" style="font-size:.68rem;padding:.22rem .5rem">✕</button>` : ''}
        <span class="meet-chevron">▼</span>
      </div>
    </div>

    <div class="meet-accordion-body">
      <div style="padding-top:.8rem">

        <!-- Roles superiores -->
        <div style="background:var(--sky-bg);border-radius:var(--r2);padding:.6rem .85rem;margin-bottom:.85rem;border:1px solid var(--border2)">
          ${fixedField('presidente','Presidente de la reunión','🎙️')}
          ${fixedField('oracion_apertura','Oración de apertura','🙏')}
          <div style="font-size:.7rem;color:var(--text3);padding:.3rem 0 0">🎵 Canción ${week.openingSong||''} · Palabras de introducción</div>
        </div>

        ${sectionsHTML}

        <!-- Roles inferiores -->
        <div style="background:var(--sky-bg);border-radius:var(--r2);padding:.6rem .85rem;margin-top:.5rem;border:1px solid var(--border2)">
          <div style="font-size:.7rem;color:var(--text3);padding-bottom:.3rem">🎵 Canción ${week.midSong||''}</div>
          ${fixedField('oracion_cierre','Oración de cierre','🙏')}
          <div style="font-size:.7rem;color:var(--text3);padding:.3rem 0 0">🎵 Canción ${week.closingSong||''} · Palabras de conclusión</div>
        </div>

        ${isAdmin ? `
        <button class="btn-action btn-save-week" data-week-id="${week.id}" style="width:100%;margin-top:.9rem">
          💾 Guardar asignaciones
        </button>` : ''}

      </div>
    </div>
  </div>`
}

function getMonthFromRange(dr='') {
  const m = {'ENERO':'ENE','FEBRERO':'FEB','MARZO':'MAR','ABRIL':'ABR','MAYO':'MAY','JUNIO':'JUN','JULIO':'JUL','AGOSTO':'AGO','SEPTIEMBRE':'SEP','OCTUBRE':'OCT','NOVIEMBRE':'NOV','DICIEMBRE':'DIC'}
  for (const [f,s] of Object.entries(m)) { if (dr.includes(f)) return s }
  return ''
}

// ── Events ────────────────────────────────────────────────────
function attachEvents(container, isAdmin, weeks, currentUser, users=[]) {
  // Accordion toggle
  container.querySelectorAll('.meet-accordion-hd').forEach(hd => {
    hd.addEventListener('click', e => {
      if (e.target.closest('[data-del-week]') || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
      hd.closest('.meet-accordion').classList.toggle('open')
    })
  })

  // Stop selects from toggling accordion
  container.querySelectorAll('select').forEach(sel => {
    sel.addEventListener('click', e => e.stopPropagation())
  })

  if (!isAdmin) return

  // PDF upload
  container.querySelector('#pdf-input')?.addEventListener('change', async e => {
    const file = e.target.files?.[0]
    if (!file) return
    await processPDF(file, container, currentUser, weeks)
  })

  // Clear all
  container.querySelector('#btn-clear-meetings')?.addEventListener('click', async () => {
    if (!confirm('¿Eliminar todas las semanas?')) return
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

  // Delete week
  container.querySelectorAll('[data-del-week]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation()
      if (!confirm('¿Eliminar esta semana?')) return
      const week = weeks.find(w => w.id === btn.dataset.delWeek)
      if (week) await deleteWeek(week)
      toast('Eliminado', 'Semana eliminada')
      await renderMeetings(container, currentUser)
    })
  })

  // Save assignments per week
  container.querySelectorAll('.btn-save-week').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation()
      const weekId = btn.dataset.weekId
      const week   = weeks.find(w => w.id === weekId)
      if (!week) return

      week.assignments = {}
      week.roles       = {}

      container.querySelectorAll(`.assign-input[data-week="${weekId}"]`).forEach(inp => {
        week.assignments[inp.dataset.key] = inp.value.trim()
      })
      container.querySelectorAll(`.role-input[data-week="${weekId}"]`).forEach(inp => {
        week.roles[inp.dataset.role] = inp.value.trim()
      })

      btn.textContent = '⏳ Guardando...'
      btn.disabled    = true
      try {
        await saveWeekAssignments(week)
        toast('¡Guardado!', `${week.dateRange}`)
      } catch(err) {
        toast('Error', err.message, true)
      }
      btn.textContent = '💾 Guardar asignaciones'
      btn.disabled    = false
    })
  })
}

async function processPDF(file, container, currentUser, existingWeeks) {
  const prog  = container.querySelector('#pdf-progress')
  const pTitle = container.querySelector('#prog-title')
  const pDesc  = container.querySelector('#prog-desc')

  if (prog) prog.style.display = 'block'
  if (pTitle) pTitle.textContent = 'Leyendo el PDF...'
  if (pDesc)  pDesc.textContent  = 'Convirtiendo archivo...'

  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload  = () => resolve(reader.result.split(',')[1])
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
      reader.readAsDataURL(file)
    })

    if (pTitle) pTitle.textContent = 'Analizando con IA...'
    if (pDesc)  pDesc.textContent  = 'Claude está extrayendo las semanas (15-25 seg.)'

    const result = await extractPDFWithClaude(base64)
    if (!result?.weeks?.length) throw new Error('No se encontraron semanas en el PDF')

    // Preservar asignaciones existentes
    result.weeks.forEach(nw => {
      nw.id = nw.dateRange.replace(/\s/g,'-').toLowerCase()
      const old = existingWeeks.find(w => w.dateRange === nw.dateRange)
      nw.assignments = old?.assignments || {}
      nw.roles       = old?.roles || {}
      if (old?.supabase_id) nw.supabase_id = old.supabase_id
    })

    await saveWeeks(result.weeks)
    if (prog) prog.style.display = 'none'
    toast('¡Guía cargada!', `${result.weeks.length} semanas guardadas en la base de datos`)
    await renderMeetings(container, currentUser)

  } catch (err) {
    if (prog) prog.style.display = 'none'
    toast('Error', err.message || 'No se pudo procesar el PDF', true)
    console.error(err)
  }
}