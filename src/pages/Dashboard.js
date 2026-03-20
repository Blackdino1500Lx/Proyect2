import { get, getDS } from '../services/db.js'
import { DEMO_MODE, supabase } from '../config/supabase.js'
import { NOW } from '../config/demoData.js'
import { typeLabel, formatDateShort } from '../utils/helpers.js'

export async function renderDashboard(container, currentUser) {
  container.innerHTML = `<div class="page active" id="page-dash"><p style="color:var(--text3);font-size:.85rem">Cargando...</p></div>`

  const isAdmin = currentUser?.role === 'admin'

  // Cargar datos en paralelo
  const [anns, reports] = await Promise.all([
    get('announcements'), get('reports')
  ])

  const users  = DEMO_MODE ? getDS().users  : (await supabase.from('users').select('*')).data || []
  const groups = DEMO_MODE ? getDS().groups : (await supabase.from('groups').select('*')).data || []

  // Cargar semanas de reunión desde meeting_weeks
  let weeks = []
  let myAssignment = null
  if (!DEMO_MODE) {
    const { data } = await supabase
      .from('meeting_weeks')
      .select('*')
      .order('date_range', { ascending: true })
    weeks = data || []

    // Buscar asignación del usuario en la semana actual
    const thisWeek = new Date()
    const weekNum = Math.ceil(((thisWeek - new Date(thisWeek.getFullYear(),0,1))/86400000 + new Date(thisWeek.getFullYear(),0,1).getDay()+1)/7)
    const curWeekStr = `${thisWeek.getFullYear()}-W${String(weekNum).padStart(2,'0')}`

    // Buscar en assignments de cada semana
    for (const w of weeks) {
      const assignments = w.assignments || {}
      const roles = w.roles || {}
      // Buscar el email del usuario en cualquier campo de asignación
      const allValues = [...Object.values(assignments), ...Object.values(roles)]
      // También buscar por nombre
      const profile = users.find(u => u.email === currentUser.email)
      const name = profile?.name || ''
      if (name && allValues.some(v => v && v.toLowerCase().includes(name.toLowerCase()))) {
        myAssignment = { week: w.date_range, role: 'Participación en la reunión' }
        break
      }
    }
  }

  // Próxima semana
  const today = NOW.toISOString().split('T')[0]
  const upcoming = weeks.length > 0 ? weeks[0] : null
  const yearReps = reports.filter(r => r.year === NOW.getFullYear())

  container.innerHTML = `<div class="page active" id="page-dash">

    <!-- Texto del año -->
    <div style="background:linear-gradient(135deg,var(--sky-bg),var(--white));border:1.5px solid var(--border2);border-left:5px solid var(--sky);border-radius:var(--r);padding:1.1rem 1.4rem;margin-bottom:1.3rem;box-shadow:var(--shadow-sm)">
      <div style="font-size:.68rem;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:.3rem">✦ Texto del año 2026</div>
      <p style="font-family:var(--serif);font-size:1.02rem;color:var(--sky3);font-style:italic;line-height:1.5">«Felices los que reconocen sus necesidades espirituales»</p>
      <div style="font-size:.75rem;color:var(--text3);margin-top:.3rem;font-weight:600">— Mateo 5:3</div>
    </div>

    ${myAssignment ? `
    <div class="notif show">
      <div class="notif-ico">🔔</div>
      <div><h3>${myAssignment.role}</h3><p>Tienes una participación asignada: ${myAssignment.week}</p></div>
    </div>` : ''}

    <div class="section-hd">
      <h2 class="section-title">Panel de inicio</h2>
      <span class="section-sub">${NOW.toLocaleDateString('es',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</span>
    </div>

    ${isAdmin ? `
    <div class="g4" style="margin-bottom:1.3rem">
      <div class="stat"><div class="stat-icon">👥</div><div><div class="stat-val">${users.length}</div><div class="stat-lbl">Publicadores</div></div></div>
      <div class="stat"><div class="stat-icon">👨‍👩‍👧</div><div><div class="stat-val">${groups.length}</div><div class="stat-lbl">Grupos</div></div></div>
      <div class="stat"><div class="stat-icon">📅</div><div><div class="stat-val">${weeks.length}</div><div class="stat-lbl">Semanas cargadas</div></div></div>
      <div class="stat"><div class="stat-icon">📊</div><div><div class="stat-val">${yearReps.length}</div><div class="stat-lbl">Informes este año</div></div></div>
    </div>` : `
    <div class="g2" style="margin-bottom:1.3rem">
      <div class="stat"><div class="stat-icon">📅</div><div><div class="stat-val">${weeks.length}</div><div class="stat-lbl">Semanas disponibles</div></div></div>
      <div class="stat"><div class="stat-icon">📊</div><div><div class="stat-val">${yearReps.length}</div><div class="stat-lbl">Mis informes este año</div></div></div>
    </div>`}

    <div class="g2">
      <div class="card">
        <div class="card-hd"><span class="card-title">Próxima reunión</span><span class="badge b-green">Esta semana</span></div>
        ${upcoming ? `
        <div class="meet-body">
          <h4 style="font-weight:700;margin-bottom:.25rem">${upcoming.date_range}</h4>
          <p style="font-size:.83rem;color:var(--text2)">${upcoming.bible_reading || ''}</p>
          <p style="font-size:.78rem;color:var(--text3);margin-top:.2rem">🎵 Canción ${upcoming.opening_song || ''}</p>
        </div>` : '<div class="empty"><span class="emic">📅</span><p>Sin reuniones cargadas aún</p></div>'}
      </div>
      <div class="card">
        <div class="card-hd"><span class="card-title">Anuncios recientes</span></div>
        ${anns.slice(0,2).map(a => `
          <div class="ann ${a.priority !== 'normal' ? a.priority : ''}">
            <h4>${a.title}</h4>
            <p>${a.body}</p>
            <div class="ann-meta">${formatDateShort(a.created_at)}</div>
          </div>`).join('') || '<div class="empty"><span class="emic">📭</span><p>Sin anuncios</p></div>'}
      </div>
    </div>
  </div>`
}