import { toast } from '../utils/helpers.js'

const STORAGE_KEY = 'pizarra_meetings_v1'

function saveMeetings(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
function loadMeetings() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : [] }
  catch { return [] }
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

// ── Render ────────────────────────────────────────────────────
export function renderMeetings(container, currentUser) {
  const isAdmin = currentUser?.role === 'admin'
  const weeks = loadMeetings()
  container.innerHTML = buildHTML(isAdmin, weeks)
  attachEvents(container, isAdmin, weeks, currentUser)
}

function buildHTML(isAdmin, weeks) {
  return `<div class="page active" id="page-meetings">
    <div class="section-hd">
      <h2 class="section-title">Reuniones</h2>
      ${weeks.length > 0 ? `<span class="badge b-green">✓ ${weeks.length} semanas</span>` : ''}
    </div>
    ${isAdmin ? buildUploadCard(weeks) : ''}
    <div id="weeks-list">
      ${weeks.length > 0
        ? weeks.map((w,i) => buildWeekCard(w, i, isAdmin)).join('')
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

function buildWeekCard(week, index, isAdmin) {
  const typeLabels = { talk:'Discurso', reading:'Lectura', demo:'Demostración', discussion:'Análisis', study:'Estudio' }
  const typeBadges = { talk:'b-amber', reading:'b-sky', demo:'b-green', discussion:'b-gray', study:'b-sky' }
  const secColors  = { 'TESOROS DE LA BIBLIA':'#c07820', 'SEAMOS MEJORES MAESTROS':'#2e9e6b', 'NUESTRA VIDA CRISTIANA':'#4a90d9' }

  // Roles fijos del week
  const roles = week.roles || {}

  const fixedField = (key, label, icon='👤') => `
    <div class="as-row" style="padding:.55rem 0;align-items:center;flex-wrap:nowrap">
      <div style="display:flex;align-items:center;gap:.55rem;flex:1;min-width:0">
        <div style="width:22px;height:22px;border-radius:50%;background:var(--sky-bg);display:flex;align-items:center;justify-content:center;font-size:.8rem;flex-shrink:0">${icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:.78rem;font-weight:700;color:var(--text2);margin-bottom:.2rem">${label}</div>
          ${isAdmin
            ? `<input type="text" class="role-input" data-week="${week.id}" data-role="${key}" placeholder="Asignar persona..." value="${roles[key]||''}" style="width:100%;padding:.3rem .55rem;font-size:.78rem;border:1px dashed var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)"/>`
            : roles[key] ? `<div style="font-size:.82rem;color:var(--sky3);font-weight:600">👤 ${roles[key]}</div>`
                         : `<div style="font-size:.78rem;color:var(--text3);font-style:italic">Sin asignar</div>`
          }
        </div>
      </div>
    </div>`

  const sectionsHTML = week.sections.map(sec => {
    const color = secColors[sec.name] || '#4a90d9'
    const items = sec.items.map(item => {
      const isMMTeacher = sec.name === 'SEAMOS MEJORES MAESTROS'
      const isStudy     = item.type === 'study'
      const assignKey   = `item_${item.number}`
      const helpKey     = `help_${item.number}`
      const conductKey  = `conduct_${item.number}`
      const readerKey   = `reader_${item.number}`

      return `<div class="as-row" style="padding:.55rem 0;align-items:flex-start;flex-wrap:nowrap">
        <div style="display:flex;align-items:flex-start;gap:.55rem;flex:1;min-width:0">
          <div style="width:22px;height:22px;border-radius:50%;background:${color}18;color:${color};display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;flex-shrink:0;margin-top:.15rem">${item.number}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:.85rem;color:var(--text);line-height:1.3;margin-bottom:.2rem">${item.title}</div>
            <div style="display:flex;gap:.35rem;margin-bottom:.3rem;flex-wrap:wrap">
              <span class="badge ${typeBadges[item.type]||'b-gray'}" style="font-size:.67rem">${typeLabels[item.type]||item.type}</span>
              <span style="font-size:.72rem;color:var(--text3)">${item.duration} min.</span>
            </div>
            ${isAdmin ? `
              ${isStudy ? `
                <div style="display:flex;gap:.4rem;flex-wrap:wrap">
                  <input type="text" class="assign-input" data-week="${week.id}" data-key="${conductKey}" placeholder="🎤 Conductor..." value="${(week.assignments||{})[conductKey]||''}" style="flex:1;min-width:120px;padding:.3rem .55rem;font-size:.76rem;border:1px dashed var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)"/>
                  <input type="text" class="assign-input" data-week="${week.id}" data-key="${readerKey}" placeholder="📖 Lector..." value="${(week.assignments||{})[readerKey]||''}" style="flex:1;min-width:120px;padding:.3rem .55rem;font-size:.76rem;border:1px dashed var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)"/>
                </div>` : isMMTeacher ? `
                <div style="display:flex;gap:.4rem;flex-wrap:wrap">
                  <input type="text" class="assign-input" data-week="${week.id}" data-key="${assignKey}" placeholder="👤 Principal..." value="${(week.assignments||{})[assignKey]||''}" style="flex:1;min-width:120px;padding:.3rem .55rem;font-size:.76rem;border:1px dashed var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)"/>
                  <input type="text" class="assign-input" data-week="${week.id}" data-key="${helpKey}" placeholder="🤝 Ayudante..." value="${(week.assignments||{})[helpKey]||''}" style="flex:1;min-width:120px;padding:.3rem .55rem;font-size:.76rem;border:1px dashed var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)"/>
                </div>` : `
                <input type="text" class="assign-input" data-week="${week.id}" data-key="${assignKey}" placeholder="👤 Asignar persona..." value="${(week.assignments||{})[assignKey]||''}" style="width:100%;padding:.3rem .55rem;font-size:.76rem;border:1px dashed var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)"/>`
              }` : `
              ${isStudy ? `
                <div style="display:flex;flex-direction:column;gap:.2rem">
                  ${(week.assignments||{})[conductKey] ? `<div style="font-size:.78rem;color:var(--sky3);font-weight:600">🎤 ${week.assignments[conductKey]}</div>` : ''}
                  ${(week.assignments||{})[readerKey]  ? `<div style="font-size:.78rem;color:var(--sky3);font-weight:600">📖 ${week.assignments[readerKey]}</div>` : ''}
                </div>` : isMMTeacher ? `
                <div style="display:flex;flex-direction:column;gap:.2rem">
                  ${(week.assignments||{})[assignKey] ? `<div style="font-size:.78rem;color:var(--sky3);font-weight:600">👤 ${week.assignments[assignKey]}</div>` : ''}
                  ${(week.assignments||{})[helpKey]   ? `<div style="font-size:.78rem;color:var(--sky3);font-weight:600">🤝 ${week.assignments[helpKey]}</div>` : ''}
                </div>` : `
                ${(week.assignments||{})[assignKey] ? `<div style="font-size:.78rem;color:var(--sky3);font-weight:600">👤 ${week.assignments[assignKey]}</div>` : ''}`
              }`}
          </div>
        </div>
      </div>`
    }).join('')

    return `<div style="margin-bottom:1rem">
      <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem;padding-bottom:.35rem;border-bottom:2px solid ${color}22">
        <span>${sec.icon}</span>
        <span style="font-size:.7rem;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:.06em">${sec.name}</span>
      </div>
      ${items}
    </div>`
  }).join('')

  return `
  <div class="meet-accordion" id="week-${week.id}">
    <div class="meet-accordion-hd" data-week="${week.id}">
      <div class="meet-date">
        <div class="meet-day" style="font-size:.85rem;white-space:nowrap;line-height:1.2">${week.dateRange.split(' ').slice(0,3).join(' ')}</div>
        <div class="meet-mon">${getMonthFromRange(week.dateRange)}</div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:.93rem;color:var(--text)">${week.dateRange}</div>
        <div style="font-size:.77rem;color:var(--text2)">${week.bibleReading}</div>
        <div style="font-size:.72rem;color:var(--text3);margin-top:.1rem">🎵 Canción ${week.openingSong}</div>
      </div>
      <div style="display:flex;align-items:center;gap:.4rem;flex-shrink:0">
        ${isAdmin ? `<button class="btn-sm danger" data-del-week="${week.id}" style="font-size:.7rem;padding:.25rem .55rem">✕</button>` : ''}
        <span class="meet-chevron">▼</span>
      </div>
    </div>

    <div class="meet-accordion-body">
      <div style="padding-top:.85rem">

        <!-- Roles fijos superiores -->
        <div style="background:var(--sky-bg);border-radius:var(--r2);padding:.65rem .85rem;margin-bottom:.85rem;border:1px solid var(--border2)">
          ${fixedField('presidente', 'Presidente de la reunión', '🎙️')}
          ${fixedField('oracion_apertura', 'Oración de apertura', '🙏')}
          <div style="font-size:.72rem;color:var(--text3);padding:.3rem 0 0 27px">🎵 Canción ${week.openingSong} · Palabras de introducción</div>
        </div>

        <!-- Secciones con items -->
        ${sectionsHTML}

        <!-- Roles fijos inferiores -->
        <div style="background:var(--sky-bg);border-radius:var(--r2);padding:.65rem .85rem;margin-top:.5rem;border:1px solid var(--border2)">
          <div style="font-size:.72rem;color:var(--text3);padding:.0rem 0 .4rem 27px">🎵 Canción ${week.midSong}</div>
          ${fixedField('oracion_cierre', 'Oración de cierre', '🙏')}
          <div style="font-size:.72rem;color:var(--text3);padding:.3rem 0 0 27px">🎵 Canción ${week.closingSong} · Palabras de conclusión</div>
        </div>

        <!-- Botón guardar -->
        ${isAdmin ? `
        <button class="btn-action" data-save-week="${week.id}" style="width:100%;margin-top:.9rem">
          💾 Guardar asignaciones
        </button>` : ''}

      </div>
    </div>
  </div>`
}

function getMonthFromRange(dateRange) {
  const m = {'ENERO':'ENE','FEBRERO':'FEB','MARZO':'MAR','ABRIL':'ABR','MAYO':'MAY','JUNIO':'JUN','JULIO':'JUL','AGOSTO':'AGO','SEPTIEMBRE':'SEP','OCTUBRE':'OCT','NOVIEMBRE':'NOV','DICIEMBRE':'DIC'}
  for (const [f,s] of Object.entries(m)) { if (dateRange.includes(f)) return s }
  return ''
}

// ── Events ────────────────────────────────────────────────────
function attachEvents(container, isAdmin, weeks, currentUser) {
  // Accordion
  container.querySelectorAll('.meet-accordion-hd').forEach(hd => {
    hd.addEventListener('click', e => {
      if (e.target.closest('[data-del-week]') || e.target.closest('input')) return
      hd.closest('.meet-accordion').classList.toggle('open')
    })
  })

  if (!isAdmin) return

  // PDF upload
  container.querySelector('#pdf-input')?.addEventListener('change', async e => {
    const file = e.target.files?.[0]
    if (!file) return
    await processPDF(file, container, currentUser)
  })

  // Clear all
  container.querySelector('#btn-clear-meetings')?.addEventListener('click', () => {
    if (!confirm('¿Eliminar todas las semanas?')) return
    saveMeetings([])
    toast('Limpiado', 'Semanas eliminadas')
    renderMeetings(container, currentUser)
  })

  // Delete week
  container.querySelectorAll('[data-del-week]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation()
      if (!confirm('¿Eliminar esta semana?')) return
      saveMeetings(loadMeetings().filter(w => w.id !== btn.dataset.delWeek))
      toast('Eliminado', 'Semana eliminada')
      renderMeetings(container, currentUser)
    })
  })

  // Prevent input clicks from toggling accordion
  container.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('click', e => e.stopPropagation())
  })

  // Save button per week
  container.querySelectorAll('[data-save-week]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation()
      const weekId  = btn.dataset.saveWeek
      const current = loadMeetings()
      const week    = current.find(w => w.id === weekId)
      if (!week) return

      // Collect all assign-input values for this week
      const acc = week.accordion || btn.closest('.meet-accordion')
      container.querySelectorAll(`.assign-input[data-week="${weekId}"]`).forEach(inp => {
        if (!week.assignments) week.assignments = {}
        week.assignments[inp.dataset.key] = inp.value.trim()
      })

      // Collect role-input values
      container.querySelectorAll(`.role-input[data-week="${weekId}"]`).forEach(inp => {
        if (!week.roles) week.roles = {}
        week.roles[inp.dataset.role] = inp.value.trim()
      })

      saveMeetings(current)
      toast('¡Guardado!', `Asignaciones de ${week.dateRange} guardadas`)
    })
  })
}

async function processPDF(file, container, currentUser) {
  const prog      = container.querySelector('#pdf-progress')
  const progTitle = container.querySelector('#prog-title')
  const progDesc  = container.querySelector('#prog-desc')

  if (prog) prog.style.display = 'block'
  if (progTitle) progTitle.textContent = 'Leyendo el PDF...'
  if (progDesc)  progDesc.textContent  = 'Convirtiendo archivo...'

  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload  = () => resolve(reader.result.split(',')[1])
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
      reader.readAsDataURL(file)
    })

    if (progTitle) progTitle.textContent = 'Analizando con IA...'
    if (progDesc)  progDesc.textContent  = 'Claude está extrayendo las semanas (15-25 seg.)'

    const result = await extractPDFWithClaude(base64)
    if (!result?.weeks?.length) throw new Error('No se encontraron semanas en el PDF')

    // Preservar asignaciones y roles existentes
    const existing = loadMeetings()
    result.weeks.forEach(nw => {
      const old = existing.find(w => w.dateRange === nw.dateRange)
      if (old) {
        nw.assignments = old.assignments || {}
        nw.roles       = old.roles || {}
      } else {
        nw.assignments = {}
        nw.roles       = {}
      }
    })

    saveMeetings(result.weeks)
    if (prog) prog.style.display = 'none'
    toast('¡Guía cargada!', `${result.weeks.length} semanas extraídas`)
    renderMeetings(container, currentUser)

  } catch (err) {
    if (prog) prog.style.display = 'none'
    toast('Error', err.message || 'No se pudo procesar el PDF', true)
    console.error(err)
  }
}