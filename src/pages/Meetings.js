// ─────────────────────────────────────────────────────────────
// Meetings.js — Página de reuniones
// ─────────────────────────────────────────────────────────────
import { toast } from '../utils/helpers.js'

const STORAGE_KEY = 'pizarra_meetings_v1'

function saveMeetings(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
function loadMeetings() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : [] }
  catch { return [] }
}

// ── Claude API extraction ────────────────────────────────────
async function extractPDFWithClaude(base64PDF) {
  // Llama a la Netlify Function (proxy seguro — la API key vive en el servidor)
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
      ${weeks.length > 0 ? weeks.map((w,i) => buildWeekCard(w, i, isAdmin)).join('') 
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
        <label for="pdf-input" class="btn-action" style="cursor:pointer;padding:.5rem 1rem;font-size:.85rem">
          📋 Subir PDF
        </label>
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
          <div style="font-size:.76rem;color:var(--text2)" id="prog-desc">Esto puede tardar 10-20 segundos</div>
        </div>
      </div>
    </div>
  </div>`
}

function buildWeekCard(week, index, isAdmin) {
  const sectionColors = { 'TESOROS DE LA BIBLIA': '#c07820', 'SEAMOS MEJORES MAESTROS': '#2e9e6b', 'NUESTRA VIDA CRISTIANA': '#4a90d9' }
  const typeLabels = { talk: 'Discurso', reading: 'Lectura', demo: 'Demostración', discussion: 'Análisis', study: 'Estudio' }

  const sectionsHTML = week.sections.map(sec => {
    const color = sectionColors[sec.name] || '#4a90d9'
    return `
    <div style="margin-bottom:1rem">
      <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem;padding-bottom:.4rem;border-bottom:2px solid ${color}22">
        <span style="font-size:1rem">${sec.icon}</span>
        <span style="font-size:.72rem;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:.06em">${sec.name}</span>
      </div>
      ${sec.items.map(item => buildItemRow(item, week.id, isAdmin, typeLabels, color)).join('')}
    </div>`
  }).join('')

  return `
  <div class="meet-accordion" id="week-${week.id}">
    <div class="meet-accordion-hd" data-week="${week.id}">
      <div class="meet-date">
        <div class="meet-day" style="font-size:1rem;white-space:nowrap">${week.dateRange.split(' ')[0]}</div>
        <div class="meet-mon">${getMonthFromRange(week.dateRange)}</div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:.95rem;color:var(--text)">${week.dateRange}</div>
        <div style="font-size:.78rem;color:var(--text2)">${week.bibleReading}</div>
        <div style="font-size:.73rem;color:var(--text3);margin-top:.15rem">🎵 Canción ${week.openingSong}</div>
      </div>
      <div style="display:flex;align-items:center;gap:.5rem;flex-shrink:0">
        ${isAdmin ? `<button class="btn-sm danger" data-del-week="${week.id}" style="font-size:.72rem;padding:.28rem .6rem">✕</button>` : ''}
        <span class="meet-chevron">▼</span>
      </div>
    </div>
    <div class="meet-accordion-body">
      <div style="padding-top:.9rem">
        ${sectionsHTML}
        <div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem;padding-top:.75rem;border-top:1px solid var(--border);font-size:.78rem;color:var(--text3)">
          🎵 Canción ${week.midSong} &nbsp;·&nbsp; 🎵 Canción ${week.closingSong} y oración &nbsp;·&nbsp; Palabras de conclusión
        </div>
      </div>
    </div>
  </div>`
}

function buildItemRow(item, weekId, isAdmin, typeLabels, color) {
  const typeBg = { talk: 'b-amber', reading: 'b-sky', demo: 'b-green', discussion: 'b-gray', study: 'b-sky' }
  return `
  <div class="as-row" style="padding:.6rem 0;flex-wrap:nowrap;align-items:flex-start">
    <div style="display:flex;align-items:flex-start;gap:.6rem;flex:1;min-width:0">
      <div style="width:22px;height:22px;border-radius:50%;background:${color}18;color:${color};display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;flex-shrink:0;margin-top:.1rem">${item.number}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:.85rem;color:var(--text);line-height:1.3">${item.title}</div>
        <div style="display:flex;align-items:center;gap:.4rem;margin-top:.25rem;flex-wrap:wrap">
          <span class="badge ${typeBg[item.type] || 'b-gray'}" style="font-size:.68rem">${typeLabels[item.type] || item.type}</span>
          <span style="font-size:.72rem;color:var(--text3)">${item.duration} min.</span>
        </div>
        ${isAdmin ? `
        <div style="margin-top:.4rem">
          <input type="text"
            class="assign-input"
            data-week="${weekId}"
            data-item="${item.number}"
            placeholder="+ Asignar persona..."
            value="${item.assignedTo || ''}"
            style="width:100%;padding:.32rem .6rem;font-size:.78rem;border:1px dashed var(--border2);border-radius:6px;background:var(--off);color:var(--text);outline:none;font-family:var(--sans)"
          />
        </div>` : item.assignedTo ? `
        <div style="margin-top:.3rem;font-size:.78rem;color:var(--sky3);font-weight:600">👤 ${item.assignedTo}</div>` : ''}
      </div>
    </div>
  </div>`
}

function getMonthFromRange(dateRange) {
  const months = { 'ENERO':'ENE','FEBRERO':'FEB','MARZO':'MAR','ABRIL':'ABR','MAYO':'MAY','JUNIO':'JUN','JULIO':'JUL','AGOSTO':'AGO','SEPTIEMBRE':'SEP','OCTUBRE':'OCT','NOVIEMBRE':'NOV','DICIEMBRE':'DIC' }
  for (const [full, short] of Object.entries(months)) {
    if (dateRange.includes(full)) return short
  }
  return ''
}

// ── Events ────────────────────────────────────────────────────
function attachEvents(container, isAdmin, weeks, currentUser) {
  // Accordion toggle
  container.querySelectorAll('.meet-accordion-hd').forEach(hd => {
    hd.addEventListener('click', e => {
      if (e.target.closest('[data-del-week]')) return
      const acc = hd.closest('.meet-accordion')
      acc.classList.toggle('open')
    })
  })

  if (!isAdmin) return

  // PDF upload
  const pdfInput = container.querySelector('#pdf-input')
  if (pdfInput) {
    pdfInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      await processPDF(file, container, currentUser)
    })
  }

  // Clear all
  container.querySelector('#btn-clear-meetings')?.addEventListener('click', () => {
    if (!confirm('¿Eliminar todas las semanas cargadas?')) return
    saveMeetings([])
    toast('Limpiado', 'Semanas eliminadas')
    renderMeetings(container, currentUser)
  })

  // Delete week
  container.querySelectorAll('[data-del-week]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation()
      const weekId = btn.dataset.delWeek
      const current = loadMeetings()
      saveMeetings(current.filter(w => w.id !== weekId))
      toast('Eliminado', 'Semana eliminada')
      renderMeetings(container, currentUser)
    })
  })

  // Assignment inputs — guardar al perder foco
  container.querySelectorAll('.assign-input').forEach(input => {
    input.addEventListener('blur', () => {
      const weekId  = input.dataset.week
      const itemNum = parseInt(input.dataset.item)
      const value   = input.value.trim()
      const current = loadMeetings()
      const week    = current.find(w => w.id === weekId)
      if (!week) return
      week.sections.forEach(sec => {
        const item = sec.items.find(i => i.number === itemNum)
        if (item) item.assignedTo = value
      })
      saveMeetings(current)
    })
    // Evitar que el click en el input abra/cierre el acordeón
    input.addEventListener('click', e => e.stopPropagation())
  })
}

async function processPDF(file, container, currentUser) {
  const prog      = container.querySelector('#pdf-progress')
  const progTitle = container.querySelector('#prog-title')
  const progDesc  = container.querySelector('#prog-desc')

  if (prog) prog.style.display = 'block'
  if (progTitle) progTitle.textContent = 'Leyendo el PDF...'
  if (progDesc)  progDesc.textContent  = 'Convirtiendo a base64'

  try {
    // Leer PDF como base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload  = () => resolve(reader.result.split(',')[1])
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
      reader.readAsDataURL(file)
    })

    if (progTitle) progTitle.textContent = 'Analizando con IA...'
    if (progDesc)  progDesc.textContent  = 'Claude está extrayendo las semanas (10-20 seg.)'

    const result = await extractPDFWithClaude(base64)

    if (!result?.weeks?.length) throw new Error('No se encontraron semanas en el PDF')

    // Preservar asignaciones existentes si se vuelve a subir
    const existing = loadMeetings()
    result.weeks.forEach(newWeek => {
      const old = existing.find(w => w.dateRange === newWeek.dateRange)
      if (old) {
        // Copiar assignedTo de la versión anterior
        newWeek.sections.forEach((sec, si) => {
          sec.items.forEach((item, ii) => {
            const oldItem = old.sections[si]?.items[ii]
            if (oldItem) item.assignedTo = oldItem.assignedTo || ''
          })
        })
      }
    })

    saveMeetings(result.weeks)
    if (prog) prog.style.display = 'none'
    toast('¡Guía cargada!', `${result.weeks.length} semanas extraídas correctamente`)
    renderMeetings(container, currentUser)

  } catch (err) {
    if (prog) prog.style.display = 'none'
    toast('Error', err.message || 'No se pudo procesar el PDF', true)
    console.error(err)
  }
}