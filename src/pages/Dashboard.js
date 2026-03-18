import { get, getDS } from '../services/db.js'
import { DEMO_MODE } from '../config/supabase.js'
import { supabase } from '../config/supabase.js'
import { NOW, curWeek } from '../config/demoData.js'
import { typeLabel, formatDateShort } from '../utils/helpers.js'

export async function renderDashboard(container, currentUser) {
  container.innerHTML = `<div class="page active" id="page-dash"><p style="color:var(--text3);font-size:.85rem">Cargando...</p></div>`

  const [meetings, anns, assignments, reports] = await Promise.all([
    get('meetings'), get('announcements'), get('assignments'), get('reports')
  ])
  const users  = DEMO_MODE ? getDS().users  : (await supabase.from('users').select('*')).data || []
  const groups = DEMO_MODE ? getDS().groups : (await supabase.from('groups').select('*')).data || []

  const today   = NOW.toISOString().split('T')[0]
  const upcoming = [...meetings].sort((a,b) => a.date.localeCompare(b.date)).find(m => m.date >= today)
  const d = upcoming ? new Date(upcoming.date + 'T00:00:00') : null

  const mine = assignments.find(a => a.email === currentUser.email && a.week === curWeek())
  const yearReps = reports.filter(r => r.year === NOW.getFullYear())

  container.innerHTML = `<div class="page active" id="page-dash">

    <!-- Texto del año – solo en dashboard -->
    <div style="background:linear-gradient(135deg,var(--sky-bg),var(--white));border:1.5px solid var(--border2);border-left:5px solid var(--sky);border-radius:var(--r);padding:1.1rem 1.4rem;margin-bottom:1.3rem;box-shadow:var(--shadow-sm)">
      <div style="font-size:.68rem;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:.3rem">✦ Texto del año 2026</div>
      <p style="font-family:var(--serif);font-size:1.02rem;color:var(--sky3);font-style:italic;line-height:1.5">«Felices los que reconocen sus necesidades espirituales»</p>
      <div style="font-size:.75rem;color:var(--text3);margin-top:.3rem;font-weight:600">— Mateo 5:3</div>
    </div>

    ${mine ? `
    <div class="notif show">
      <div class="notif-ico">🔔</div>
      <div><h3>Asignación: ${mine.role}</h3><p>Esta semana (${mine.week}) tienes una participación activa</p></div>
    </div>` : ''}

    <div class="section-hd">
      <h2 class="section-title">Panel de inicio</h2>
      <span class="section-sub">${NOW.toLocaleDateString('es',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</span>
    </div>

    <div class="g4" style="margin-bottom:1.3rem">
      <div class="stat"><div class="stat-icon">👥</div><div><div class="stat-val">${users.length}</div><div class="stat-lbl">Publicadores</div></div></div>
      <div class="stat"><div class="stat-icon">👨‍👩‍👧</div><div><div class="stat-val">${groups.length}</div><div class="stat-lbl">Grupos</div></div></div>
      <div class="stat"><div class="stat-icon">📅</div><div><div class="stat-val">${meetings.filter(m=>{const md=new Date(m.date);return md.getFullYear()===NOW.getFullYear()&&md.getMonth()===NOW.getMonth()}).length}</div><div class="stat-lbl">Reuniones este mes</div></div></div>
      <div class="stat"><div class="stat-icon">📊</div><div><div class="stat-val">${yearReps.length}</div><div class="stat-lbl">Informes este año</div></div></div>
    </div>

    <div class="g2">
      <div class="card">
        <div class="card-hd"><span class="card-title">Próxima reunión</span><span class="badge b-green">Esta semana</span></div>
        ${upcoming && d ? `
        <div class="meeting-item">
          <div class="meet-date"><div class="meet-day">${d.getDate()}</div><div class="meet-mon">${d.toLocaleDateString('es',{month:'short'}).toUpperCase()}</div></div>
          <div class="meet-body"><h4>${upcoming.title}</h4><p>${upcoming.time} · ${typeLabel(upcoming.type)}</p></div>
        </div>` : '<div class="empty"><span class="emic">📅</span><p>Sin reuniones próximas</p></div>'}
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
