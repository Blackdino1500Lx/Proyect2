import { injectStyles }    from './utils/styles.js'
import { initDemo }         from './services/auth.js'
import { renderAuth }       from './pages/Auth.js'
import { renderShell }      from './pages/Shell.js'
import { renderDashboard }  from './pages/Dashboard.js'
import { go }               from './utils/router.js'
import { DEMO_MODE }        from './config/supabase.js'
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
window.__showAuth = function() {
  CU = null
  document.getElementById('app').style.display = 'none'
  document.getElementById('auth-screen').style.display = 'flex'
  renderAuth()
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
    case 'dash':          return loadDash(container)
    case 'meetings':      return loadMeetings(container)
    case 'announcements': return loadAnnouncements(container)
    case 'assignments':   return loadAssignments(container)
    case 'programs':      return loadPrograms(container)
    case 'cleaning':      return loadCleaning(container)
    case 'workprogram':   return loadWork(container)
    case 'map':           return loadMap(container)
    case 'reports':       return loadReports(container)
    case 'admin':         return loadAdmin(container)
  }
}

// ── 6. DASHBOARD ───────────────────────────────────────────────
async function loadDash(container) {
  const { renderDashboard } = await import('./pages/Dashboard.js')
  await renderDashboard(container, CU)
}

// ── 7. MEETINGS ────────────────────────────────────────────────
async function loadMeetings(container) {
  allMeetings = await get('meetings')
  renderMeetings(container)
}

function renderMeetings(container) {
  const admin = CU?.role === 'admin'
  let list = [...allMeetings].sort((a,b) => a.date.localeCompare(b.date))
  if (currentMeetFilter !== 'all') list = list.filter(m => m.type === currentMeetFilter)

  container.innerHTML = `<div class="page active" id="page-meetings">
    <div class="section-hd"><h2 class="section-title">Reuniones</h2></div>
    <div class="meet-type-tabs">
      <button class="mtt ${currentMeetFilter==='all'?'active':''}"     id="mf-all">Todas</button>
      <button class="mtt ${currentMeetFilter==='midweek'?'active':''}" id="mf-mid">Entre Semana</button>
      <button class="mtt ${currentMeetFilter==='weekend'?'active':''}" id="mf-wk">Fin de Semana</button>
      <button class="mtt ${currentMeetFilter==='special'?'active':''}" id="mf-sp">Especiales</button>
    </div>
    <div id="meet-items">
      ${list.map(m => {
        const d = new Date(m.date + 'T00:00:00')
        return `<div class="card">
          <div class="meeting-item">
            <div class="meet-date"><div class="meet-day">${d.getDate()}</div><div class="meet-mon">${d.toLocaleDateString('es',{month:'short'}).toUpperCase()}</div></div>
            <div class="meet-body" style="flex:1">
              <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
                <h4>${m.title}</h4>
                ${admin ? `<button class="btn-sm danger" data-del-meet="${m.id}">Eliminar</button>` : ''}
              </div>
              <p>${m.time} · ${formatDate(m.date)}</p>
              <p style="margin-top:.3rem;white-space:pre-line;font-size:.81rem;color:var(--text2)">${m.description||''}</p>
              <div class="meet-tags"><span class="badge ${typeBadge(m.type)}">${typeLabel(m.type)}</span></div>
            </div>
          </div>
        </div>`
      }).join('') || '<div class="empty"><span class="emic">📅</span><p>Sin reuniones en esta categoría</p></div>'}
    </div>
  </div>`

  // Filter tabs
  ;[['mf-all','all'],['mf-mid','midweek'],['mf-wk','weekend'],['mf-sp','special']].forEach(([id, type]) => {
    document.getElementById(id)?.addEventListener('click', () => {
      currentMeetFilter = type
      renderMeetings(container)
    })
  })

  // Delete buttons
  container.querySelectorAll('[data-del-meet]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar esta reunión?')) return
      await del('meetings', btn.dataset.delMeet)
      toast('Eliminado', 'Reunión eliminada')
      await loadMeetings(container)
    })
  })
}

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
  const wk = curWeek()
  const all = await get('assignments')
  const week = all.filter(a => a.week === wk)
  const admin = CU?.role === 'admin'
  const myEmail = CU?.email || ''
  const COLORS = ['#4a90d9','#2e9e6b','#c07820','#c0405a','#7a55c8']

  container.innerHTML = `<div class="page active" id="page-assignments">
    <div class="section-hd">
      <h2 class="section-title">Asignaciones</h2>
      <span class="badge b-sky">Semana ${wk}</span>
    </div>
    <div class="card">
      ${week.map((a, i) => {
        const mine = a.email === myEmail
        const ini  = a.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
        const c    = COLORS[i % COLORS.length]
        return `<div class="as-row" style="${mine ? 'background:var(--sky-bg);border-radius:10px;padding:.75rem .6rem;margin:0 -.6rem' : ''}">
          <div class="as-left">
            <div class="avatar" style="background:${c}1a;color:${c};border:2px solid ${c}44">${ini}</div>
            <div>
              <div style="font-weight:700;color:${mine ? 'var(--sky3)' : 'var(--text)'}">${a.name} ${mine ? '<span style="font-size:.71rem;color:var(--sky);font-weight:600">(Tú)</span>' : ''}</div>
              <div style="font-size:.8rem;color:var(--text2)">${a.role}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:.45rem">
            ${mine ? '<span class="badge b-sky">Tu asignación</span>' : ''}
            ${admin ? `<button class="btn-sm danger" data-del-as="${a.id}">✕</button>` : ''}
          </div>
        </div>`
      }).join('') || '<div class="empty"><span class="emic">📋</span><p>Sin asignaciones esta semana</p></div>'}
    </div>
  </div>`

  container.querySelectorAll('[data-del-as]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await del('assignments', btn.dataset.delAs)
      toast('Eliminado', 'Asignación eliminada')
      loadAssignments(container)
    })
  })
}

// ── 10. PROGRAMS ───────────────────────────────────────────────
function loadPrograms(container) {
  container.innerHTML = `<div class="page active" id="page-programs">
    <div class="section-hd"><h2 class="section-title">Programas</h2></div>
    <div class="g2">
      <div class="card" style="cursor:pointer;border-color:var(--border2)" id="go-cleaning">
        <div style="font-size:2rem;margin-bottom:.5rem">🧹</div>
        <div style="font-family:var(--serif);font-size:1.05rem;color:var(--sky3);font-weight:600;margin-bottom:.25rem">Limpieza</div>
        <p style="font-size:.82rem;color:var(--text2)">Programa de turnos de limpieza del Salón del Reino</p>
      </div>
      <div class="card" style="cursor:pointer;border-color:var(--border2)" id="go-work">
        <div style="font-size:2rem;margin-bottom:.5rem">🔧</div>
        <div style="font-family:var(--serif);font-size:1.05rem;color:var(--sky3);font-weight:600;margin-bottom:.25rem">Programa de trabajo</div>
        <p style="font-size:.82rem;color:var(--text2)">Mantenimiento y trabajos del Salón del Reino</p>
      </div>
    </div>
  </div>`

  document.getElementById('go-cleaning').addEventListener('click', () => { go('cleaning'); loadPage('cleaning') })
  document.getElementById('go-work').addEventListener('click',     () => { go('workprogram'); loadPage('workprogram') })
}

async function loadCleaning(container) {
  const list = await get('cleaning')
  const admin = CU?.role === 'admin'
  container.innerHTML = `<div class="page active" id="page-cleaning">
    <div class="section-hd">
      <div style="display:flex;align-items:center;gap:.7rem">
        <button class="btn-sm" id="back-programs">← Programas</button>
        <h2 class="section-title">🧹 Limpieza</h2>
      </div>
    </div>
    ${list.map(c => {
      const d = new Date(c.date + 'T00:00:00')
      return `<div class="prog-card">
        <div class="prog-icon">🧹</div>
        <div class="prog-body" style="flex:1">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
            <h4>${c.who}</h4>
            ${admin ? `<button class="btn-sm danger" data-del-cl="${c.id}">Eliminar</button>` : ''}
          </div>
          <p>${c.notes || ''}</p>
          <div class="prog-meta">📅 ${formatDate(c.date)}</div>
        </div>
      </div>`
    }).join('') || '<div class="empty"><span class="emic">🧹</span><p>Sin turnos programados</p></div>'}
  </div>`

  document.getElementById('back-programs').addEventListener('click', () => { go('programs'); loadPage('programs') })
  container.querySelectorAll('[data-del-cl]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar?')) return
      await del('cleaning', btn.dataset.delCl)
      toast('Eliminado', 'Turno eliminado')
      loadCleaning(container)
    })
  })
}

async function loadWork(container) {
  const list = await get('workprogram')
  const admin = CU?.role === 'admin'
  container.innerHTML = `<div class="page active" id="page-workprogram">
    <div class="section-hd">
      <div style="display:flex;align-items:center;gap:.7rem">
        <button class="btn-sm" id="back-programs2">← Programas</button>
        <h2 class="section-title">🔧 Programa de trabajo</h2>
      </div>
    </div>
    ${list.map(w => {
      return `<div class="prog-card">
        <div class="prog-icon">🔧</div>
        <div class="prog-body" style="flex:1">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
            <h4>${w.title}</h4>
            ${admin ? `<button class="btn-sm danger" data-del-wk="${w.id}">Eliminar</button>` : ''}
          </div>
          <p>${w.notes || ''}</p>
          <div class="prog-meta">👷 ${w.who || '—'} &nbsp;·&nbsp; 📅 ${formatDate(w.date)}</div>
        </div>
      </div>`
    }).join('') || '<div class="empty"><span class="emic">🔧</span><p>Sin trabajos programados</p></div>'}
  </div>`

  document.getElementById('back-programs2').addEventListener('click', () => { go('programs'); loadPage('programs') })
  container.querySelectorAll('[data-del-wk]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar?')) return
      await del('workprogram', btn.dataset.delWk)
      toast('Eliminado', 'Trabajo eliminado')
      loadWork(container)
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
  if (isAdmin) return loadAdminReports(container)

  const all  = await get('reports')
  const mine = all.filter(r => r.email === CU?.email && r.year === NOW.getFullYear())

  container.innerHTML = `<div class="page active" id="page-reports">
    <div class="section-hd"><h2 class="section-title">Informes de Predicación</h2></div>
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
  </div>`

  // Pre-fill existing report
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
}

async function loadAdminReports(container) {
  const reports = await get('reports')
  const users   = await getUsers()
  const groups  = await getGroups()
  const year    = NOW.getFullYear()
  const month   = NOW.getMonth()
  const yearReps = reports.filter(r => r.year === year)
  const monthReps = reports.filter(r => r.year === year && r.month === month)

  container.innerHTML = `<div class="page active" id="page-reports">
    <div class="section-hd"><h2 class="section-title">Informes de Predicación</h2></div>
    <div class="card">
      <div class="card-hd">
        <span class="card-title">Informes de la congregación — ${MONTHS[month]} ${year}</span>
      </div>
      <div style="overflow-x:auto">
        <table class="tbl">
          <thead><tr><th>Publicador</th><th>Grupo</th><th>Horas</th><th>Revisitas</th><th>Estudios</th><th>Videos</th><th>Estado</th></tr></thead>
          <tbody>
            ${users.map(u => {
              const rep = monthReps.find(r => r.email === u.email)
              const grp = groups.find(g => g.id === u.group_id)
              return `<tr>
                <td><strong>${u.name || '—'}</strong></td>
                <td>${grp ? `<span class="group-pill">👨‍👩‍👧 ${grp.name}</span>` : '—'}</td>
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
          <div class="stat"><div class="stat-icon">⏱️</div><div><div class="stat-val">${yearReps.reduce((s,r)=>s+(r.hours||0),0)}</div><div class="stat-lbl">Horas totales</div></div></div>
          <div class="stat"><div class="stat-icon">📖</div><div><div class="stat-val">${yearReps.reduce((s,r)=>s+(r.studies||0),0)}</div><div class="stat-lbl">Estudios</div></div></div>
          <div class="stat"><div class="stat-icon">🔄</div><div><div class="stat-val">${yearReps.reduce((s,r)=>s+(r.revisits||0),0)}</div><div class="stat-lbl">Revisitas</div></div></div>
        </div>
      </div>
    </div>
  </div>`
}

// ── 13. ADMIN ──────────────────────────────────────────────────
async function loadAdmin(container) {
  const users  = await getUsers()
  const groups = await getGroups()

  container.innerHTML = `<div class="page active" id="page-admin">
    <div class="section-hd"><h2 class="section-title">Panel de Administración</h2></div>
    <div class="g3" style="margin-bottom:1.3rem">
      <div class="stat"><div class="stat-icon">👥</div><div><div class="stat-val">${users.length}</div><div class="stat-lbl">Usuarios</div></div></div>
      <div class="stat"><div class="stat-icon">🛡️</div><div><div class="stat-val">${users.filter(u=>u.role==='admin').length}</div><div class="stat-lbl">Administradores</div></div></div>
      <div class="stat"><div class="stat-icon">👨‍👩‍👧</div><div><div class="stat-val">${groups.length}</div><div class="stat-lbl">Grupos</div></div></div>
    </div>

    <!-- Grupos -->
    <div class="card">
      <div class="card-hd"><span class="card-title">👨‍👩‍👧 Gestión de Grupos</span></div>
      <div class="g2" style="margin-bottom:.9rem">
        <div class="fg"><label>Nombre</label><input type="text" id="grp-name" placeholder="Ej: Grupo Norte"/></div>
        <div class="fg"><label>Responsable</label><input type="text" id="grp-captain" placeholder="Nombre"/></div>
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

    <!-- Nueva Reunión -->
    <div class="card">
      <div class="card-hd"><span class="card-title">📅 Nueva Reunión</span></div>
      <div class="g2">
        <div class="fg"><label>Título</label><input type="text" id="m-title" placeholder="Ej: Reunión entre semana"/></div>
        <div class="fg"><label>Fecha</label><input type="date" id="m-date"/></div>
        <div class="fg"><label>Hora</label><input type="time" id="m-time" value="19:00"/></div>
        <div class="fg"><label>Tipo</label><select id="m-type"><option value="midweek">Entre semana</option><option value="weekend">Fin de semana</option><option value="special">Especial</option></select></div>
      </div>
      <div class="fg"><label>Programa</label><textarea id="m-desc" placeholder="Temas, discursos..."></textarea></div>
      <button class="btn-action" id="btn-add-meet">Guardar reunión</button>
    </div>

    <!-- Nuevo Anuncio -->
    <div class="card">
      <div class="card-hd"><span class="card-title">📢 Nuevo Anuncio</span></div>
      <div class="g2">
        <div class="fg"><label>Título</label><input type="text" id="an-title" placeholder="Título del anuncio"/></div>
        <div class="fg"><label>Prioridad</label><select id="an-pri"><option value="normal">Normal</option><option value="urgent">Urgente</option><option value="info">Informativo</option></select></div>
      </div>
      <div class="fg"><label>Contenido</label><textarea id="an-body" placeholder="Contenido del anuncio..."></textarea></div>
      <button class="btn-action" id="btn-add-ann">Publicar</button>
    </div>

    <!-- Nueva Asignación -->
    <div class="card">
      <div class="card-hd"><span class="card-title">📋 Nueva Asignación</span></div>
      <div class="g2">
        <div class="fg"><label>Nombre</label><input type="text" id="as-name" placeholder="Nombre completo"/></div>
        <div class="fg"><label>Correo</label><input type="email" id="as-email" placeholder="correo@ejemplo.com"/></div>
        <div class="fg"><label>Tarea</label><input type="text" id="as-role" placeholder="Ej: Discurso, Oración..."/></div>
        <div class="fg"><label>Semana</label><input type="week" id="as-week" value="${curWeek()}"/></div>
      </div>
      <button class="btn-action" id="btn-add-as">Asignar</button>
    </div>

    <!-- Limpieza -->
    <div class="card">
      <div class="card-hd"><span class="card-title">🧹 Publicar Limpieza</span></div>
      <div class="g2">
        <div class="fg"><label>Responsable(s)</label><input type="text" id="cl-who" placeholder="Familia López..."/></div>
        <div class="fg"><label>Fecha</label><input type="date" id="cl-date"/></div>
      </div>
      <div class="fg"><label>Área</label><textarea id="cl-notes" placeholder="Salón, baños..." style="min-height:60px"></textarea></div>
      <button class="btn-action" id="btn-add-cl">Publicar turno</button>
    </div>

    <!-- Trabajo -->
    <div class="card">
      <div class="card-hd"><span class="card-title">🔧 Publicar Trabajo</span></div>
      <div class="g2">
        <div class="fg"><label>Trabajo</label><input type="text" id="wk-title" placeholder="Pintura, cambio de focos..."/></div>
        <div class="fg"><label>Fecha</label><input type="date" id="wk-date"/></div>
        <div class="fg"><label>Responsable(s)</label><input type="text" id="wk-who" placeholder="Grupo Norte..."/></div>
      </div>
      <div class="fg"><label>Detalle</label><textarea id="wk-notes" placeholder="Descripción..." style="min-height:60px"></textarea></div>
      <button class="btn-action" id="btn-add-wk">Publicar</button>
    </div>

    <!-- Usuarios -->
    <div class="card">
      <div class="card-hd"><span class="card-title">👥 Publicadores</span><button class="btn-sm" id="btn-refresh-users">↻ Actualizar</button></div>
      <div style="overflow-x:auto">
        <table class="tbl">
          <thead><tr><th>Nombre</th><th>Correo</th><th>Grupo</th><th>Rol</th><th>Acciones</th></tr></thead>
          <tbody>
            ${users.map(u => {
              const grp = DEMO_MODE ? groups.find(g => g.id === u.group_id) : u.groups
              return `<tr>
                <td><strong>${u.name||'—'}</strong></td>
                <td style="color:var(--text2);font-size:.83rem">${u.email}</td>
                <td>${grp ? `<span class="group-pill">👨‍👩‍👧 ${grp.name||grp}</span>` :
                  `<select class="btn-sm" data-set-grp="${u.email}" style="padding:.28rem .5rem">
                    <option value="">Sin grupo</option>
                    ${groups.map(g => `<option value="${g.id}" ${u.group_id===g.id?'selected':''}>${g.name}</option>`).join('')}
                  </select>`}
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
    if (DEMO_MODE) { getDS().groups.push({ id:'g'+Date.now(), name, captain }); require('./services/db.js').saveDS() }
    toast('Grupo creado', name)
    document.getElementById('grp-name').value = ''
    document.getElementById('grp-captain').value = ''
    loadAdmin(container)
  })

  container.querySelectorAll('[data-del-grp]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar este grupo?')) return
      if (DEMO_MODE) { getDS().groups = getDS().groups.filter(g => g.id !== btn.dataset.delGrp); const { saveDS } = await import('./services/db.js'); saveDS() }
      toast('Eliminado', 'Grupo eliminado'); loadAdmin(container)
    })
  })

  document.getElementById('btn-add-meet').addEventListener('click', async () => {
    const title = document.getElementById('m-title').value.trim()
    const date  = document.getElementById('m-date').value
    const time  = document.getElementById('m-time').value
    const type  = document.getElementById('m-type').value
    const desc  = document.getElementById('m-desc').value.trim()
    if (!title || !date) { toast('Error', 'Completa título y fecha', true); return }
    await ins('meetings', { title, date, time, type, description: desc })
    toast('Reunión guardada', `${title} · ${date}`)
    ;['m-title','m-desc'].forEach(id => document.getElementById(id).value = '')
    loadAdmin(container)
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

  document.getElementById('btn-add-as').addEventListener('click', async () => {
    const name  = document.getElementById('as-name').value.trim()
    const email = document.getElementById('as-email').value.trim().toLowerCase()
    const role  = document.getElementById('as-role').value.trim()
    const week  = document.getElementById('as-week').value
    if (!name || !role || !week) { toast('Error', 'Completa los campos requeridos', true); return }
    await ins('assignments', { name, email, role, week })
    toast('Asignación guardada', `${name} – ${role}`)
    ;['as-name','as-email','as-role'].forEach(id => document.getElementById(id).value = '')
    loadAdmin(container)
  })

  document.getElementById('btn-add-cl').addEventListener('click', async () => {
    const who   = document.getElementById('cl-who').value.trim()
    const date  = document.getElementById('cl-date').value
    const notes = document.getElementById('cl-notes').value.trim()
    if (!who || !date) { toast('Error', 'Completa responsable y fecha', true); return }
    await ins('cleaning', { who, date, notes })
    toast('Turno publicado', who)
    ;['cl-who','cl-notes'].forEach(id => document.getElementById(id).value = '')
    document.getElementById('cl-date').value = ''
    loadAdmin(container)
  })

  document.getElementById('btn-add-wk').addEventListener('click', async () => {
    const title = document.getElementById('wk-title').value.trim()
    const date  = document.getElementById('wk-date').value
    const who   = document.getElementById('wk-who').value.trim()
    const notes = document.getElementById('wk-notes').value.trim()
    if (!title || !date) { toast('Error', 'Completa el trabajo y la fecha', true); return }
    await ins('workprogram', { title, date, who, notes })
    toast('Trabajo publicado', title)
    ;['wk-title','wk-who','wk-notes'].forEach(id => document.getElementById(id).value = '')
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
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/Proyect2/sw.js').catch(() => {})

// ── 15. Start ──────────────────────────────────────────────────
window.__showAuth()