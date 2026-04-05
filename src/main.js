import { injectStyles }    from './utils/styles.js'
import { initDemo }         from './services/auth.js'
import { renderAuth } from './pages/Auth.js'
import { renderShell }      from './pages/Shell.js'
import { renderDashboard }  from './pages/Dashboard.js'
import { renderMeetings }   from './pages/Meetings.js'
import { renderWeekend }    from './pages/Weekend.js'
import { renderField }      from './pages/Field.js'
import { go }               from './utils/router.js'
import { DEMO_MODE, supabase } from './config/supabase.js'
import { get, getDS, ins, del, upsertReport, getUsers, getGroups, setUserGroup, setUserRole } from './services/db.js'
import { toast, typeLabel, typeBadge, formatDate, formatDateShort } from './utils/helpers.js'
import { MONTHS, curWeek, NOW } from './config/demoData.js'

// ── 1. Inject CSS ──────────────────────────────────────────────
injectStyles()

// ── 2. Init demo data ──────────────────────────────────────────
initDemo()

// ── 3. State ───────────────────────────────────────────────────
let CU = null  // current user
let mapInst = null, mapMarkers = [], allMeetings = [], currentMeetFilter = 'all'

const territories = [
  { id:1, name:'Sector A – Residencial', lat:9.938, lng:-84.089, status:'available',   group:'Grupo Norte',  notes:'Casas unifamiliares' },
  { id:2, name:'Sector B – Comercial',   lat:9.930, lng:-84.079, status:'in-progress', group:'Grupo Sur',    notes:'En trabajo actualmente' },
  { id:3, name:'Sector C – Norte',       lat:9.945, lng:-84.084, status:'completed',   group:'Grupo Norte',  notes:'Completado el mes pasado' },
  { id:4, name:'Sector D – Este',        lat:9.925, lng:-84.073, status:'available',   group:'Grupo Centro', notes:'Urbanización reciente' },
  { id:5, name:'Sector E – Sur',         lat:9.918, lng:-84.090, status:'in-progress', group:'Grupo Sur',    notes:'En progreso' },
  { id:6, name:'Sector F – Centro',      lat:9.933, lng:-84.084, status:'available',   group:'Grupo Centro', notes:'Área densa' },
]

// ── 4. Auth flow ───────────────────────────────────────────────
window.__showAuth = async function() {
  CU = null
  document.getElementById('app').style.display = 'none'
  document.getElementById('auth-screen').style.display = 'flex'
  await renderAuth()
}

window.__onLogin = async function(userData) {
  CU = userData
  document.getElementById('auth-screen').style.display = 'none'
  document.getElementById('app').style.display = 'flex'
  renderShell(userData)
  await loadPage('dash')

}

// ── 5. Page loader ─────────────────────────────────────────────
window.__loadPage = loadPage

async function loadPage(name) {
  const container = document.getElementById('main-content')
  switch(name) {
    case 'dash':     return loadDash(container)
    case 'meetings': return loadMeetingsPage(container)
    case 'programs': return loadProgramsPage(container)
    case 'map':      return loadMapPage(container)
    case 'admin':    return loadAdmin(container)
  }
}

// ── 6. DASHBOARD ───────────────────────────────────────────────
async function loadDash(container) {
  const { renderDashboard } = await import('./pages/Dashboard.js')
  await renderDashboard(container, CU)
}

// ── 7. MEETINGS PAGE (tabs: Entre semana / Fin de semana / Anuncios / Asignaciones) ──
async function loadMeetingsPage(container) {
  const tab = window.__meetingsTab || 'midweek'
  container.innerHTML = `<div class="page active" id="page-meetings">
    <div class="section-hd"><h2 class="section-title">Reuniones</h2></div>
    <div class="meet-type-tabs" style="margin-bottom:1rem">
      <button class="mtt ${tab==='midweek'?'active':''}"   id="mtab-midweek"> Entre Semana</button>
      <button class="mtt ${tab==='weekend'?'active':''}"   id="mtab-weekend"> Fin de Semana</button>
      <button class="mtt ${tab==='ann'?'active':''}"       id="mtab-ann"> Anuncios</button>
      <button class="mtt ${tab==='assign'?'active':''}"    id="mtab-assign"> Asignaciones</button>
    </div>
    <div id="meetings-tab-content"></div>
  </div>`

  const tabContent = document.getElementById('meetings-tab-content')

  async function switchTab(t) {
    window.__meetingsTab = t
    document.querySelectorAll('.mtt').forEach(b => b.classList.remove('active'))
    document.getElementById('mtab-' + t)?.classList.add('active')
    if (t === 'midweek')  await renderMeetings(tabContent, CU)
    if (t === 'weekend')  await renderWeekend(tabContent, CU)
    if (t === 'ann')      await loadAnnouncements(tabContent)
    if (t === 'assign')   await loadAssignments(tabContent)
  }

  document.getElementById('mtab-midweek')?.addEventListener('click', () => switchTab('midweek'))
  document.getElementById('mtab-weekend')?.addEventListener('click', () => switchTab('weekend'))
  document.getElementById('mtab-ann')?.addEventListener('click',     () => switchTab('ann'))
  document.getElementById('mtab-assign')?.addEventListener('click',  () => switchTab('assign'))

  await switchTab(tab)
}

// ── 8. PROGRAMS PAGE (Limpieza + Servicio + Mantenimiento) ──────
async function loadProgramsPage(container) {
  const tab = window.__programsTab || 'cleaning'
  container.innerHTML = `<div class="page active" id="page-programs">
    <div class="section-hd"><h2 class="section-title">Programas</h2></div>
    <div class="meet-type-tabs" style="margin-bottom:1rem">
      <button class="mtt ${tab==='cleaning'?'active':''}"  id="ptab-cleaning"> Limpieza</button>
      <button class="mtt ${tab==='service'?'active':''}"   id="ptab-service"> Servicio</button>
      <button class="mtt ${tab==='maint'?'active':''}"     id="ptab-maint"> Mantenimiento</button>
    </div>
    <div id="programs-tab-content"></div>
  </div>`

  const tabContent = document.getElementById('programs-tab-content')

  async function switchTab(t) {
    window.__programsTab = t
    document.querySelectorAll('.mtt').forEach(b => b.classList.remove('active'))
    document.getElementById('ptab-' + t)?.classList.add('active')
    if (t === 'cleaning') await loadCleaning(tabContent)
    if (t === 'service')  await loadService(tabContent)
    if (t === 'maint')    await loadMaint(tabContent)
  }

  document.getElementById('ptab-cleaning')?.addEventListener('click', () => switchTab('cleaning'))
  document.getElementById('ptab-service')?.addEventListener('click',  () => switchTab('service'))
  document.getElementById('ptab-maint')?.addEventListener('click',    () => switchTab('maint'))

  await switchTab(tab)
}

// ── 9. MAP/FIELD PAGE (territorios + informe deshabilitado) ───
async function loadMapPage(container) {
  const tab = window.__mapTab || 'field'
  container.innerHTML = `<div class="page active" id="page-map-page">
    <div class="section-hd"><h2 class="section-title">Predicación</h2></div>
    <div class="meet-type-tabs" style="margin-bottom:1rem">
      <button class="mtt ${tab==='field'?'active':''}"  id="maptab-field">🗺️ Territorios</button>
      <button class="mtt ${tab==='report'?'active':''}" id="maptab-report">📊 Mi Informe</button>
    </div>
    <div id="map-tab-content"></div>
  </div>`

  const tabContent = document.getElementById('map-tab-content')

  async function switchTab(t) {
    window.__mapTab = t
    document.querySelectorAll('.mtt').forEach(b => b.classList.remove('active'))
    document.getElementById('maptab-' + t)?.classList.add('active')
    if (t === 'field') await renderField(tabContent, CU)
    if (t === 'report') tabContent.innerHTML = `
      <div class="card" style="text-align:center;padding:2.5rem 1.5rem">
        <div style="font-size:2.5rem;margin-bottom:1rem">🚧</div>
        <div style="font-weight:700;font-size:1rem;color:var(--text);margin-bottom:.5rem">Función deshabilitada</div>
        <p style="font-size:.85rem;color:var(--text2);margin-bottom:1.2rem">Esta sección está temporalmente fuera de servicio.</p>
        <div style="font-size:.78rem;color:var(--text3)">Para más información contactá al desarrollador.</div>
      </div>`
  }

  document.getElementById('maptab-field')?.addEventListener('click',  () => switchTab('field'))
  document.getElementById('maptab-report')?.addEventListener('click', () => switchTab('report'))

  await switchTab(tab)
}

// ── Helpers para Programas ─────────────────────────────────────
async function loadMeetings(container) { await renderMeetings(container, CU) }
async function loadWeekend(container)  { await renderWeekend(container, CU) }

// ── 8. ANNOUNCEMENTS ───────────────────────────────────────────
async function loadAnnouncements(container) {
  const list = await get('announcements')
  const admin = CU?.role === 'admin'
  container.innerHTML = `<div class="page active" id="page-announcements">
    <div class="section-hd"><h2 class="section-title">Anuncios</h2></div>
    ${list.map(a => `
      <div class="ann ${a.priority !== 'normal' ? a.priority : ''}">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
          <h4>${a.title}</h4>
          ${admin ? `<button class="btn-sm danger" data-del-ann="${a.id}">Eliminar</button>` : ''}
        </div>
        <p>${a.body}</p>
        <div class="ann-meta">${formatDateShort(a.created_at)} <span class="badge ${a.priority==='urgent'?'b-rose':a.priority==='info'?'b-green':'b-sky'}">${a.priority}</span></div>
      </div>`).join('') || '<div class="empty"><span class="emic">📭</span><p>Sin anuncios</p></div>'}
  </div>`

  container.querySelectorAll('[data-del-ann]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar?')) return
      await del('announcements', btn.dataset.delAnn)
      toast('Eliminado', 'Anuncio eliminado')
      loadAnnouncements(container)
    })
  })
}

// ── 9. ASSIGNMENTS ─────────────────────────────────────────────
async function loadAssignments(container) {
  const myName = (CU?.name || '').trim().toLowerCase()
  // Usar el primer nombre para comparar (ej: "Pedro González" → "pedro")
  const myFirst = myName.split(' ')[0]

  // Leer semanas desde meeting_weeks
  let weeks = []
  if (!DEMO_MODE) {
    const { data } = await supabase.from('meeting_weeks').select('*').order('sort_order', { ascending: true })
    weeks = data || []
  }

  // Por cada semana, buscar si YO tengo alguna asignación en:
  //   · Lectura bíblica (tipo 'reading' en TESOROS DE LA BIBLIA)
  //   · Cualquier ítem de SEAMOS MEJORES MAESTROS
  // Si tengo asignación → mostrar la tarjeta de esa semana con mi(s) participación(es)

  const myWeeks = []

  weeks.forEach(w => {
    const asgn     = w.assignments || {}
    const sections = w.sections    || []
    const mine     = []

    sections.forEach(sec => {
      const isMMT     = sec.name === 'SEAMOS MEJORES MAESTROS'
      const isTesoros = sec.name === 'TESOROS DE LA BIBLIA'
      ;(sec.items || []).forEach(item => {
        const isReading = isTesoros && item.type === 'reading'
        if (!isReading && !isMMT) return

        const aKey = 'item_' + item.number
        const hKey = 'help_' + item.number
        const icon = isMMT ? '📚' : '📖'

        // Comprobar si mi nombre está en esta asignación
        if (asgn[aKey] && asgn[aKey].trim().toLowerCase().includes(myFirst)) {
          mine.push({ role: `${icon} ${item.title}`, label: isMMT ? 'Participante' : 'Lectura bíblica' })
        }
        if (asgn[hKey] && asgn[hKey].trim().toLowerCase().includes(myFirst)) {
          mine.push({ role: `${icon} ${item.title}`, label: 'Ayudante' })
        }
      })
    })

    if (mine.length) myWeeks.push({ week: w, mine })
  })

  // ── Render ──
  const blocksHTML = myWeeks.map(({ week: w, mine }) => {
    const rows = mine.map(a => `
      <div style="display:flex;align-items:center;gap:.75rem;padding:.55rem 0;border-bottom:1px solid var(--border)">
        <div style="font-size:1.1rem;flex-shrink:0">${a.role.split(' ')[0]}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:.88rem;color:var(--text)">${a.role.slice(a.role.indexOf(' ')+1)}</div>
          <div style="font-size:.75rem;color:var(--sky3);font-weight:600">${a.label}</div>
        </div>
        <span class="badge b-sky" style="font-size:.68rem">Tu participación</span>
      </div>`).join('')

    return `<div class="card" style="margin-bottom:.9rem;border-left:4px solid var(--sky)">
      <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem">
        <span style="font-size:.8rem;font-weight:700;color:var(--sky3)">📅 ${w.date_range}</span>
      </div>
      ${rows}
    </div>`
  }).join('')

  const emptyHTML = myName
    ? `<div class="empty"><span class="emic">📋</span><p>No tienes asignaciones en las semanas cargadas</p></div>`
    : `<div class="empty"><span class="emic">📋</span><p>No se pudo identificar tu nombre de usuario</p></div>`

  container.innerHTML = `<div class="page active" id="page-assignments">
    <div class="section-hd">
      <h2 class="section-title">Mis asignaciones</h2>
      ${myWeeks.length ? `<span class="badge b-green">&#10003; ${myWeeks.length} semana${myWeeks.length>1?'s':''}</span>` : ''}
    </div>
    ${blocksHTML || emptyHTML}
  </div>`
}

// ── 10. PROGRAMS (subpages sin botón back) ─────────────────────
async function loadCleaning(container) {
  const all   = await get('cleaning')
  const today = NOW.toISOString().split('T')[0]
  const list  = all.filter(c => c.date >= today)
  const admin = CU?.role === 'admin'
  container.innerHTML = `
    ${list.map(c => `<div class="prog-card">
      <div class="prog-icon">🧹</div>
      <div class="prog-body" style="flex:1">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
          <h4>${c.who}</h4>
          ${admin ? `<button class="btn-sm danger" data-del-cl="${c.id}">Eliminar</button>` : ''}
        </div>
        <p>${c.notes || ''}</p>
        <div class="prog-meta">📅 ${formatDate(c.date)}</div>
      </div>
    </div>`).join('') || '<div class="empty"><span class="emic">🧹</span><p>Sin turnos programados</p></div>'}`

  container.querySelectorAll('[data-del-cl]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar?')) return
      await del('cleaning', btn.dataset.delCl)
      toast('Eliminado', 'Turno eliminado')
      loadCleaning(container)
    })
  })
}

async function loadService(container) {
  const all   = await get('workprogram')
  const today = NOW.toISOString().split('T')[0]
  const list  = all.filter(w => w.date >= today && w.title?.includes('Programa de servicio'))
  const admin = CU?.role === 'admin'

  container.innerHTML = list.map(w => {
    let roles = {}
    try { roles = JSON.parse(w.notes || '{}') } catch {}
    const d = new Date(w.date + 'T00:00:00')
    const roleItems = [
      { icon:'🎙️', label:'Sonido',            val: roles.sound },
      { icon:'🎤', label:'Micrófonos',         val: roles.mic },
      { icon:'🚪', label:'Acomodadores',       val: roles.usher },
      { icon:'📹', label:'Zoom / Transmisión', val: roles.zoom },
      { icon:'📖', label:'Indicador plataforma', val: roles.platform },
      { icon:'🔧', label:'Otro',               val: roles.other },
    ].filter(r => r.val)
    return `<div class="prog-card">
      <div class="prog-icon">🎙️</div>
      <div class="prog-body" style="flex:1">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
          <h4>${w.title}</h4>
          ${admin ? `<button class="btn-sm danger" data-del-sv="${w.id}">Eliminar</button>` : ''}
        </div>
        <div class="prog-meta">📅 ${d.toLocaleDateString('es',{weekday:'long',month:'long',day:'numeric'})}</div>
        <div style="margin-top:.5rem;display:flex;flex-direction:column;gap:.2rem">
          ${roleItems.map(r => `<div style="font-size:.81rem;color:var(--text2)"><strong>${r.icon} ${r.label}:</strong> ${r.val}</div>`).join('')}
        </div>
      </div>
    </div>`
  }).join('') || '<div class="empty"><span class="emic">🎙️</span><p>Sin programas de servicio</p></div>'

  container.querySelectorAll('[data-del-sv]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar?')) return
      await del('workprogram', btn.dataset.delSv)
      toast('Eliminado', 'Eliminado')
      loadService(container)
    })
  })
}

async function loadMaint(container) {
  const all   = await get('workprogram')
  const today = NOW.toISOString().split('T')[0]
  const list  = all.filter(w => w.date >= today && !w.title?.includes('Programa de servicio'))
  const admin = CU?.role === 'admin'

  container.innerHTML = list.map(w => {
    const notes = w.notes?.replace('[MANTENIMIENTO] ','') || ''
    const d = new Date(w.date + 'T00:00:00')
    return `<div class="prog-card">
      <div class="prog-icon">🔧</div>
      <div class="prog-body" style="flex:1">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
          <h4>${notes.split('—')[0]?.trim() || 'Mantenimiento'}</h4>
          ${admin ? `<button class="btn-sm danger" data-del-mt="${w.id}">Eliminar</button>` : ''}
        </div>
        <p>${notes.split('—')[1]?.trim() || ''}</p>
        <div class="prog-meta">👷 ${w.who || '—'} · 📅 ${d.toLocaleDateString('es',{weekday:'long',month:'long',day:'numeric'})}</div>
      </div>
    </div>`
  }).join('') || '<div class="empty"><span class="emic">🔧</span><p>Sin trabajos de mantenimiento</p></div>'

  container.querySelectorAll('[data-del-mt]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar?')) return
      await del('workprogram', btn.dataset.delMt)
      toast('Eliminado', 'Eliminado')
      loadMaint(container)
    })
  })
}

// ── 11. MAP ────────────────────────────────────────────────────
function loadMap(container) {
  container.innerHTML = `<div class="page active" id="page-map">
    <div class="section-hd"><h2 class="section-title">🗺️ Programa de Predicación</h2></div>
    <div class="card" style="padding:1rem">
      <div class="map-ctrl">
        <button class="map-btn active" data-filter="all">Todos</button>
        <button class="map-btn" data-filter="available">Disponibles</button>
        <button class="map-btn" data-filter="in-progress">En progreso</button>
        <button class="map-btn" data-filter="completed">Completados</button>
      </div>
      <div id="map"></div>
      <div class="map-leg">
        <div class="leg-item"><div class="leg-dot" style="background:#2e9e6b"></div>Disponible</div>
        <div class="leg-item"><div class="leg-dot" style="background:#c07820"></div>En progreso</div>
        <div class="leg-item"><div class="leg-dot" style="background:#4a90d9"></div>Completado</div>
      </div>
    </div>
  </div>`

  setTimeout(() => {
    if (mapInst) { mapInst.invalidateSize(); return }
    mapInst = L.map('map').setView([9.930, -84.084], 14)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(mapInst)
    const stColors = { available:'#2e9e6b', 'in-progress':'#c07820', completed:'#4a90d9' }
    territories.forEach(t => {
      const icon = L.divIcon({ className:'', iconSize:[26,26], iconAnchor:[13,13],
        html:`<div style="width:26px;height:26px;border-radius:50%;background:${stColors[t.status]};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>`
      })
      const m = L.marker([t.lat, t.lng], { icon }).addTo(mapInst)
        .bindPopup(`<b>${t.name}</b><br>${t.group}<br><em>${t.notes}</em>`)
      mapMarkers.push({ marker: m, t })
    })
  }, 80)

  container.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      const status = btn.dataset.filter
      mapMarkers.forEach(({ marker, t }) => {
        const show = status === 'all' || t.status === status
        show ? (!mapInst.hasLayer(marker) && mapInst.addLayer(marker))
             : (mapInst.hasLayer(marker)  && mapInst.removeLayer(marker))
      })
    })
  })
}

// ── 12. REPORTS ────────────────────────────────────────────────
async function loadReports(container) {
  const isAdmin = CU?.role === 'admin'
  const all  = await get('reports')
  const mine = all.filter(r => r.email === CU?.email && r.year === NOW.getFullYear())

  container.innerHTML = `<div class="page active" id="page-reports">
    <div class="section-hd"><h2 class="section-title">Informes de Predicación</h2></div>

    <!-- Mi informe — visible para TODOS incluyendo admins -->
    <div class="card">
      <div class="card-hd">
        <span class="card-title">Mi informe mensual</span>
        <select id="report-month-sel" class="btn-sm">
          ${MONTHS.map((m,i) => `<option value="${i}" ${i===NOW.getMonth()?'selected':''}>${m} ${NOW.getFullYear()}</option>`).join('')}
        </select>
      </div>
      <div class="g2" style="margin-bottom:.9rem">
        <div class="fg"><label>Horas</label><input type="number" id="rp-hours" min="0" placeholder="0"/></div>
        <div class="fg"><label>Revisitas</label><input type="number" id="rp-rv" min="0" placeholder="0"/></div>
        <div class="fg"><label>Estudios bíblicos</label><input type="number" id="rp-studies" min="0" placeholder="0"/></div>
        <div class="fg"><label>Videos</label><input type="number" id="rp-videos" min="0" placeholder="0"/></div>
      </div>
      <div class="fg"><label>Comentarios</label><textarea id="rp-notes" placeholder="Observaciones..."></textarea></div>
      <button class="btn-action" id="btn-save-report">Guardar informe</button>
    </div>

    <div class="card">
      <div class="card-hd">
        <span class="card-title">Mi historial ${NOW.getFullYear()}</span>
        <div class="year-ring"><div class="num">${mine.length}</div><div class="lbl">informes</div></div>
      </div>
      <div class="month-grid">
        ${MONTHS.map((m, i) => {
          const rep = mine.find(r => r.month === i)
          return `<div class="month-cell ${rep ? 'has-report' : ''}" title="${rep ? `Horas: ${rep.hours}` : 'Sin informe'}">
            <div class="mc-name">${m.slice(0,3)}</div>
            <div class="mc-status">${rep ? '✅' : '○'}</div>
          </div>`
        }).join('')}
      </div>
    </div>

    <!-- Vista congregación — solo admins -->
    ${isAdmin ? `<div id="admin-reports-section"></div>` : ''}
  </div>`

  // Pre-fill form
  const selEl = document.getElementById('report-month-sel')
  const fillForm = () => {
    const selMonth = parseInt(selEl.value)
    const existing = all.find(r => r.email === CU?.email && r.year === NOW.getFullYear() && r.month === selMonth)
    document.getElementById('rp-hours').value   = existing?.hours    || ''
    document.getElementById('rp-rv').value      = existing?.revisits || ''
    document.getElementById('rp-studies').value = existing?.studies  || ''
    document.getElementById('rp-videos').value  = existing?.videos   || ''
    document.getElementById('rp-notes').value   = existing?.notes    || ''
  }
  fillForm()
  selEl.addEventListener('change', fillForm)

  document.getElementById('btn-save-report').addEventListener('click', async () => {
    const month    = parseInt(selEl.value)
    const hours    = parseInt(document.getElementById('rp-hours').value)    || 0
    const revisits = parseInt(document.getElementById('rp-rv').value)       || 0
    const studies  = parseInt(document.getElementById('rp-studies').value)  || 0
    const videos   = parseInt(document.getElementById('rp-videos').value)   || 0
    const notes    = document.getElementById('rp-notes').value.trim()
    const year     = NOW.getFullYear()
    await upsertReport({ email: CU.email, year, month, hours, revisits, studies, videos, notes }, { email: CU.email, year, month })
    toast('Informe guardado', `${MONTHS[month]} ${year} · ${hours} horas`)
    loadReports(container)
  })

  // Cargar vista congregación para admins
  if (isAdmin) {
    const adminSection = document.getElementById('admin-reports-section')
    if (adminSection) await loadAdminReports(adminSection)
  }
}

async function loadAdminReports(container) {
  const reports = await get('reports')
  const users   = await getUsers()
  const groups  = await getGroups()
  const year    = NOW.getFullYear()
  const month   = NOW.getMonth()
  const yearReps = reports.filter(r => r.year === year)
  const monthReps = reports.filter(r => r.year === year && r.month === month)

  container.innerHTML = `
    <div class="card" style="margin-top:.5rem">
      <div class="card-hd">
        <span class="card-title"> Informes de la congregación — ${MONTHS[month]} ${year}</span>
      </div>
      <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Publicador</th><th>Grupo</th><th>Horas</th><th>Revisitas</th><th>Estudios</th><th>Videos</th><th>Estado</th></tr></thead>
          <tbody>
            ${users.map(u => {
              const rep = monthReps.find(r => r.email === u.email)
              const grp = groups.find(g => g.id === u.group_id)
              return `<tr>
                <td><strong>${u.name || '—'}</strong></td>
                <td>${grp ? `<span class="group-pill"> ${grp.name}</span>` : '—'}</td>
                <td>${rep ? rep.hours : '—'}</td>
                <td>${rep ? rep.revisits : '—'}</td>
                <td>${rep ? rep.studies : '—'}</td>
                <td>${rep ? rep.videos : '—'}</td>
                <td>${rep ? '<span class="badge b-green">✓ Enviado</span>' : '<span class="badge b-rose">Pendiente</span>'}</td>
              </tr>`
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-hd"><span class="card-title">Resumen anual ${year}</span></div>
      <div style="display:flex;align-items:center;gap:2rem;flex-wrap:wrap">
        <div class="year-ring"><div class="num">${yearReps.length}</div><div class="lbl">informes</div></div>
        <div class="g3" style="flex:1">
          <div class="stat"><div class="stat-icon">⏱</div><div><div class="stat-val">${yearReps.reduce((s,r)=>s+(r.hours||0),0)}</div><div class="stat-lbl">Horas totales</div></div></div>
          <div class="stat"><div class="stat-icon"></div><div><div class="stat-val">${yearReps.reduce((s,r)=>s+(r.studies||0),0)}</div><div class="stat-lbl">Estudios</div></div></div>
          <div class="stat"><div class="stat-icon"></div><div><div class="stat-val">${yearReps.reduce((s,r)=>s+(r.revisits||0),0)}</div><div class="stat-lbl">Revisitas</div></div></div>
        </div>
      </div>
    </div>`
}

// ── 13. ADMIN ──────────────────────────────────────────────────
async function loadAdmin(container) {
  const users  = await getUsers()
  const groups = await getGroups()

  // Helper para generar selects de usuarios
  const brotherOpts = '<option value="">— Seleccionar —</option>' +
    users.filter(u => u.baptized && u.gender !== 'sister')
         .map(u => `<option value="${u.name}">${u.name}</option>`).join('')
  const allOpts = '<option value="">— Seleccionar —</option>' +
    users.map(u => `<option value="${u.name}">${u.name}</option>`).join('')

  const brotherSel = (id, style='') =>
    `<select id="${id}" style="width:100%;padding:.45rem .6rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans);font-size:.9rem;background:var(--white);color:var(--text);${style}">${brotherOpts}</select>`
  const allSel = (id, style='') =>
    `<select id="${id}" style="width:100%;padding:.45rem .6rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans);font-size:.9rem;background:var(--white);color:var(--text);${style}">${allOpts}</select>`

  container.innerHTML = `<div class="page active" id="page-admin">
    <div class="section-hd"><h2 class="section-title">Panel de Administración</h2></div>
    <div class="g3" style="margin-bottom:1.3rem">
      <div class="stat"><div class="stat-icon"></div><div><div class="stat-val">${users.length}</div><div class="stat-lbl">Usuarios</div></div></div>
      <div class="stat"><div class="stat-icon"></div><div><div class="stat-val">${users.filter(u=>u.role==='admin').length}</div><div class="stat-lbl">Administradores</div></div></div>
      <div class="stat"><div class="stat-icon"></div><div><div class="stat-val">${groups.length}</div><div class="stat-lbl">Grupos</div></div></div>
    </div>

    <!-- Grupos -->
    <div class="card">
      <div class="card-hd"><span class="card-title"> Gestión de Grupos</span></div>
      <div class="g2" style="margin-bottom:.9rem">
        <div class="fg"><label>Nombre del grupo</label><input type="text" id="grp-name" placeholder="Ej: Grupo Norte"/></div>
        <div class="fg"><label>Responsable</label>${brotherSel('grp-captain')}</div>
      </div>
      <button class="btn-action" id="btn-add-group" style="margin-bottom:1rem">Crear grupo</button>
      <div id="groups-list">
        ${groups.map(g => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:.65rem 0;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:.5rem">
            <div><strong>${g.name}</strong><span style="color:var(--text3);font-size:.8rem;margin-left:.5rem">Cap. ${g.captain||'—'}</span></div>
            <div style="display:flex;gap:.4rem">
              <span class="badge b-gray">${users.filter(u=>u.group_id===g.id).length} miembros</span>
              <button class="btn-sm danger" data-del-grp="${g.id}">Eliminar</button>
            </div>
          </div>`).join('') || '<div class="empty"><span class="emic">👨‍👩‍👧</span><p>Sin grupos</p></div>'}
      </div>
    </div>

    <!-- Info reuniones -->
    <div class="card" style="background:var(--sky-bg);border-color:var(--border2)">
      <div style="display:flex;align-items:center;gap:.75rem">
        <span style="font-size:1.5rem">📅</span>
        <div>
          <div style="font-weight:700;color:var(--sky3);font-size:.93rem">Reuniones y Asignaciones</div>
          <div style="font-size:.81rem;color:var(--text2);margin-top:.2rem">Las reuniones se gestionan subiendo la Guía de Actividades en la sección <strong>Reuniones</strong>. Las asignaciones se hacen directamente en cada semana.</div>
        </div>
      </div>
    </div>

    <!-- Nuevo Anuncio -->
    <div class="card">
      <div class="card-hd"><span class="card-title"> Nuevo Anuncio</span></div>
      <div class="g2">
        <div class="fg"><label>Título</label><input type="text" id="an-title" placeholder="Título del anuncio"/></div>
        <div class="fg"><label>Prioridad</label><select id="an-pri"><option value="normal">Normal</option><option value="urgent">Urgente</option><option value="info">Informativo</option></select></div>
      </div>
      <div class="fg"><label>Contenido</label><textarea id="an-body" placeholder="Contenido del anuncio..."></textarea></div>
      <button class="btn-action" id="btn-add-ann">Publicar</button>
    </div>

    <!-- Limpieza -->
    <div class="card">
      <div class="card-hd"><span class="card-title"> Programa de Limpieza</span></div>
      <div class="g2">
        <div class="fg"><label>Grupo</label>
          <select id="cl-group" style="width:100%;padding:.45rem .6rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans);font-size:.9rem;background:var(--white);color:var(--text)">
            <option value="">— Seleccionar grupo —</option>
            ${groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
          </select>
        </div>
        <div class="fg"><label>Encargado</label>${brotherSel('cl-captain')}</div>
        <div class="fg"><label>Fecha</label><input type="date" id="cl-date"/></div>
      </div>
      <div class="fg"><label>Área / Detalle</label><textarea id="cl-notes" placeholder="Salón, baños, jardín..." style="min-height:60px"></textarea></div>
      <button class="btn-action" id="btn-add-cl">Publicar turno</button>
    </div>

    <!-- Programa de Servicio -->
    <div class="card">
      <div class="card-hd"><span class="card-title"> Programa de Servicio</span></div>
      <p style="font-size:.81rem;color:var(--text2);margin-bottom:.9rem">Roles de servicio para la reunión: acomodadores, micrófonos, sonido, etc.</p>
      <div class="g2">
        <div class="fg"><label>Fecha de la reunión</label><input type="date" id="sv-date"/></div>
        <div class="fg"><label>Tipo de reunión</label>
          <select id="sv-type">
            <option value="midweek">Entre semana</option>
            <option value="weekend">Fin de semana</option>
          </select>
        </div>
      </div>
      <div class="g2">
        <div class="fg"><label> Sonido</label>${brotherSel('sv-sound')}</div>
        <div class="fg"><label> Micrófonos</label>${brotherSel('sv-mic')}</div>
        <div class="fg"><label> Acomodador(es)</label>${brotherSel('sv-usher')}</div>
        <div class="fg"><label> Zoom / Transmisión</label>${brotherSel('sv-zoom')}</div>
        <div class="fg"><label> Indicador de plataforma</label>${brotherSel('sv-platform')}</div>
        <div class="fg"><label> Otro rol</label><input type="text" id="sv-other" placeholder="Rol: Nombre..."/></div>
      </div>
      <button class="btn-action" id="btn-add-sv">Publicar programa</button>
    </div>

    <!-- Mantenimiento -->
    <div class="card">
      <div class="card-hd"><span class="card-title">🔧 Mantenimiento del Salón</span></div>
      <div class="g2">
        <div class="fg"><label>Trabajo a realizar</label><input type="text" id="wk-title" placeholder="Pintura, cambio de focos..."/></div>
        <div class="fg"><label>Fecha</label><input type="date" id="wk-date"/></div>
        <div class="fg"><label>Responsable(s)</label>${brotherSel('wk-who')}</div>
      </div>
      <div class="fg"><label>Detalle</label><textarea id="wk-notes" placeholder="Descripción..." style="min-height:60px"></textarea></div>
      <button class="btn-action" id="btn-add-wk">Publicar</button>
    </div>

    <!-- Usuarios -->
    <div class="card">
      <div class="card-hd"><span class="card-title">👥 Publicadores</span><button class="btn-sm" id="btn-refresh-users">↻ Actualizar</button></div>
      <div style="overflow-x:auto">
        <table class="tbl">
          <thead><tr><th>Nombre</th><th>Género</th><th>Bautizado</th><th>Escuela</th><th>Grupo</th><th>Rol</th><th>Acciones</th></tr></thead>
          <tbody>
            ${users.map(u => {
              const grp = DEMO_MODE ? groups.find(g => g.id === u.group_id) : u.groups
              return `<tr>
                <td><strong>${u.name||'—'}</strong><div style="font-size:.72rem;color:var(--text3)">${u.email}</div></td>
                <td>
                  <select class="btn-sm" data-set-gender="${u.id}" style="padding:.25rem .4rem;font-size:.75rem">
                    <option value="brother" ${u.gender!=='sister'?'selected':''}>Hermano</option>
                    <option value="sister"  ${u.gender==='sister'?'selected':''}>Hermana</option>
                  </select>
                </td>
                <td style="text-align:center">
                  <input type="checkbox" data-set-baptized="${u.id}" ${u.baptized?'checked':''} style="width:16px;height:16px;cursor:pointer"/>
                </td>
                <td style="text-align:center">
                  <input type="checkbox" data-set-school="${u.id}" ${u.school?'checked':''} style="width:16px;height:16px;cursor:pointer"/>
                </td>
                <td>
                  <select class="btn-sm" data-set-grp="${u.email}" style="padding:.25rem .4rem;font-size:.75rem">
                    <option value="">Sin grupo</option>
                    ${groups.map(g => `<option value="${g.id}" ${u.group_id===g.id?'selected':''}>${g.name}</option>`).join('')}
                  </select>
                </td>
                <td><span class="badge ${u.role==='admin'?'b-sky':'b-gray'}">${u.role==='admin'?'Admin':'Publicador'}</span></td>
                <td>${u.email !== CU?.email ? `<button class="btn-sm" data-toggle-role="${u.email}" data-cur-role="${u.role}">${u.role==='admin'?'↓ Estándar':'↑ Admin'}</button>` : '—'}</td>
              </tr>`
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`

  // ── Event listeners ──
  document.getElementById('btn-add-group').addEventListener('click', async () => {
    const name    = document.getElementById('grp-name').value.trim()
    const captain = document.getElementById('grp-captain').value.trim()
    if (!name) { toast('Error', 'Ingresa un nombre', true); return }
    if (DEMO_MODE) {
      getDS().groups.push({ id:'g'+Date.now(), name, captain })
      const { saveDS } = await import('./services/db.js'); saveDS()
    } else {
      const { error } = await supabase.from('groups').insert({ name, captain })
      if (error) { toast('Error', error.message, true); return }
    }
    toast('Grupo creado', name)
    document.getElementById('grp-name').value = ''
    document.getElementById('grp-captain').value = ''
    loadAdmin(container)
  })

  container.querySelectorAll('[data-del-grp]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar este grupo?')) return
      if (DEMO_MODE) {
        getDS().groups = getDS().groups.filter(g => g.id !== btn.dataset.delGrp)
        const { saveDS } = await import('./services/db.js'); saveDS()
      } else {
        await supabase.from('groups').delete().eq('id', btn.dataset.delGrp)
      }
      toast('Eliminado', 'Grupo eliminado'); loadAdmin(container)
    })
  })

  document.getElementById('btn-add-ann').addEventListener('click', async () => {
    const title    = document.getElementById('an-title').value.trim()
    const body     = document.getElementById('an-body').value.trim()
    const priority = document.getElementById('an-pri').value
    if (!title || !body) { toast('Error', 'Completa todos los campos', true); return }
    await ins('announcements', { title, body, priority })
    toast('Anuncio publicado', title)
    ;['an-title','an-body'].forEach(id => document.getElementById(id).value = '')
    loadAdmin(container)
  })

  document.getElementById('btn-add-cl').addEventListener('click', async () => {
    const groupId = document.getElementById('cl-group').value
    const captain = document.getElementById('cl-captain').value
    const date    = document.getElementById('cl-date').value
    const notes   = document.getElementById('cl-notes').value.trim()
    if (!captain || !date) { toast('Error', 'Selecciona encargado y fecha', true); return }
    await ins('cleaning', { who: captain, date, notes, group_id: groupId || null })
    toast('Turno publicado', captain)
    document.getElementById('cl-group').value = ''
    document.getElementById('cl-captain').value = ''
    document.getElementById('cl-notes').value = ''
    document.getElementById('cl-date').value = ''
    loadAdmin(container)
  })

  document.getElementById('btn-add-sv').addEventListener('click', async () => {
    const date     = document.getElementById('sv-date').value
    const type     = document.getElementById('sv-type').value
    const sound    = document.getElementById('sv-sound').value.trim()
    const mic      = document.getElementById('sv-mic').value.trim()
    const usher    = document.getElementById('sv-usher').value.trim()
    const zoom     = document.getElementById('sv-zoom').value.trim()
    const platform = document.getElementById('sv-platform').value.trim()
    const other    = document.getElementById('sv-other').value.trim()
    if (!date) { toast('Error', 'Selecciona la fecha', true); return }
    await ins('workprogram', {
      title: `Programa de servicio – ${type === 'midweek' ? 'Entre semana' : 'Fin de semana'}`,
      date, who: sound, notes: JSON.stringify({ sound, mic, usher, zoom, platform, other })
    })
    toast('Programa publicado', `Servicio del ${date}`)
    ;['sv-date','sv-sound','sv-mic','sv-usher','sv-zoom','sv-platform','sv-other'].forEach(id => document.getElementById(id).value = '')
    loadAdmin(container)
  })

  document.getElementById('btn-add-wk').addEventListener('click', async () => {
    const title = document.getElementById('wk-title').value.trim()
    const date  = document.getElementById('wk-date').value
    const who   = document.getElementById('wk-who').value
    const notes = document.getElementById('wk-notes').value.trim()
    if (!title || !date) { toast('Error', 'Completa el trabajo y la fecha', true); return }
    const { error } = await supabase.from('workprogram').insert({
      title: `[MANTENIMIENTO] ${title}`,
      date,
      who: who || null,
      notes: notes || null
    })
    if (error) { toast('Error', error.message, true); return }
    toast('Trabajo publicado', title)
    ;['wk-title','wk-notes'].forEach(id => document.getElementById(id).value = '')
    document.getElementById('wk-who').value = ''
    document.getElementById('wk-date').value = ''
    loadAdmin(container)
  })

  document.getElementById('btn-refresh-users').addEventListener('click', () => loadAdmin(container))

  container.querySelectorAll('[data-set-grp]').forEach(sel => {
    sel.addEventListener('change', async () => {
      await setUserGroup(sel.dataset.setGrp, sel.value)
      toast('Grupo asignado', '')
    })
  })

  container.querySelectorAll('[data-toggle-role]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const newRole = btn.dataset.curRole === 'admin' ? 'user' : 'admin'
      await setUserRole(btn.dataset.toggleRole, newRole)
      toast('Rol actualizado', `→ ${newRole}`)
      loadAdmin(container)
    })
  })

  // Género
  container.querySelectorAll('[data-set-gender]').forEach(sel => {
    sel.addEventListener('change', async () => {
      await supabase.from('users').update({ gender: sel.value }).eq('id', sel.dataset.setGender)
      toast('Actualizado', sel.value === 'sister' ? 'Hermana' : 'Hermano')
    })
  })

  // Bautizado
  container.querySelectorAll('[data-set-baptized]').forEach(chk => {
    chk.addEventListener('change', async () => {
      await supabase.from('users').update({ baptized: chk.checked }).eq('id', chk.dataset.setBaptized)
      toast('Actualizado', chk.checked ? 'Bautizado ✓' : 'No bautizado')
    })
  })

  // Escuela del ministerio
  container.querySelectorAll('[data-set-school]').forEach(chk => {
    chk.addEventListener('change', async () => {
      await supabase.from('users').update({ school: chk.checked }).eq('id', chk.dataset.setSchool)
      toast('Actualizado', chk.checked ? 'En escuela ✓' : 'Sin escuela')
    })
  })
}

// ── 14. PWA ────────────────────────────────────────────────────
let dPr
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); dPr = e
  document.getElementById('install-bar')?.classList.add('show')
})
document.getElementById('btn-install')?.addEventListener('click', async () => {
  if (dPr) { dPr.prompt(); await dPr.userChoice; dPr = null }
  document.getElementById('install-bar')?.classList.remove('show')
})
// Service Worker – soporte offline
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing
      nw?.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[SW] Nueva versión disponible')
        }
      })
    })
  }).catch(err => console.warn('[SW] No se pudo registrar:', err))
}

// Banner de modo offline ────────────────────────────────────────
function showOfflineBanner() {
  if (document.getElementById('offline-bar')) return
  const bar = document.createElement('div')
  bar.id = 'offline-bar'
  bar.innerHTML = `
    <span style="font-size:.95rem">📴</span>
    <span>Modo sin conexión — los datos pueden no estar actualizados</span>
    <button id="btn-close-offline" style="background:none;border:none;color:inherit;font-size:1rem;cursor:pointer;margin-left:auto;opacity:.7">✕</button>`
  // Inyectar keyframe si no existe
  if (!document.getElementById('offline-bar-style')) {
    const s = document.createElement('style')
    s.id = 'offline-bar-style'
    s.textContent = '@keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}'
    document.head.appendChild(s)
  }
  bar.style.cssText = `
    display:flex;align-items:center;gap:.6rem;
    padding:.5rem 1rem;
    background:#1a1a2e;color:#e8eaf6;
    font-family:var(--sans);font-size:.78rem;font-weight:500;
    position:sticky;top:0;z-index:9999;
    animation:slideDown .3s ease;`
  document.body.insertBefore(bar, document.body.firstChild)
  document.getElementById('btn-close-offline')?.addEventListener('click', () => bar.remove())
}

function hideOfflineBanner() {
  document.getElementById('offline-bar')?.remove()
}

window.addEventListener('online',  hideOfflineBanner)
window.addEventListener('offline', showOfflineBanner)
if (!navigator.onLine) showOfflineBanner()

// ── 15. Start ──────────────────────────────────────────────────
window.__showAuth()