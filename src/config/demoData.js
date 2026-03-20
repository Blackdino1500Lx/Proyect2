export const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const now = new Date()

function wDay(d){ const t=new Date(now); t.setDate(now.getDate()+(d-now.getDay())); return t.toISOString().split('T')[0] }
function nwDay(d){ const t=new Date(now); t.setDate(now.getDate()+(d-now.getDay())+7); return t.toISOString().split('T')[0] }
export function curWeek(){ const j=new Date(now.getFullYear(),0,1); const w=Math.ceil(((now-j)/86400000+j.getDay()+1)/7); return `${now.getFullYear()}-W${String(w).padStart(2,'0')}` }
export function todayStr(){ return now.toISOString().split('T')[0] }
export const NOW = now

// Usuarios demo hardcodeados (solo para modo demo)
export const DEMO_USERS = {
  'admin@cong.com':   { email:'admin@cong.com',  name:'Hermano Administrador', role:'admin', group_id:'g1', password:'admin123' },
  'usuario@cong.com': { email:'usuario@cong.com', name:'Pedro González',        role:'user',  group_id:'g2', password:'user123'  },
}

// Estado inicial del demo (se guarda en localStorage)
export function initDemoState() {
  return {
    groups: [
      { id:'g1', name:'Grupo Norte',  captain:'José Ramírez' },
      { id:'g2', name:'Grupo Sur',    captain:'María López'  },
      { id:'g3', name:'Grupo Centro', captain:'Ana Vargas'   },
    ],
    users: Object.values(DEMO_USERS).map(u => ({
      email: u.email, name: u.name, role: u.role, group_id: u.group_id
    })),
    meetings: [
      { id:'m1', title:'Reunión Entre Semana', date:wDay(2),  time:'19:00', type:'midweek', description:'Tesoros de la Biblia · Seamos mejores maestros · Nuestra vida cristiana', created_at:Date.now() },
      { id:'m2', title:'Reunión Fin de Semana', date:wDay(6), time:'10:00', type:'weekend', description:'Discurso público · Estudio de La Atalaya', created_at:Date.now() },
      { id:'m3', title:'Asamblea de Circuito',  date:nwDay(6),time:'09:00', type:'special', description:'Programa completo de dos días. Traiga almuerzo.', created_at:Date.now() },
    ],
    announcements: [
      { id:'a1', title:'Asamblea de Circuito próxima', body:'Los días 22 y 23 se celebrará la asamblea. Regístrese puntualmente.', priority:'urgent', created_at:Date.now()-86400000 },
      { id:'a2', title:'Limpieza del Salón',           body:'Este sábado a las 8:00 AM se realizará limpieza general.', priority:'normal', created_at:Date.now()-172800000 },
      { id:'a3', title:'Nuevo horario de verano',      body:'Las reuniones entre semana iniciarán a las 7:30 PM.', priority:'info', created_at:Date.now()-259200000 },
    ],
    assignments: [
      { id:'as1', name:'Pedro González', email:'usuario@cong.com', role:'Discurso de 5 minutos', week:curWeek(), created_at:Date.now() },
      { id:'as2', name:'Ana Vargas',     email:'ana@cong.com',     role:'Oración inicial',       week:curWeek(), created_at:Date.now() },
      { id:'as3', name:'Carlos Méndez', email:'carlos@cong.com',  role:'Lector de La Atalaya',  week:curWeek(), created_at:Date.now() },
    ],
    reports: [
      { id:'r1', email:'usuario@cong.com', year:now.getFullYear(), month:now.getMonth(),       hours:12, revisits:8, studies:2, videos:5, notes:'Buen mes', created_at:Date.now() },
      { id:'r2', email:'usuario@cong.com', year:now.getFullYear(), month:Math.max(0,now.getMonth()-1), hours:10, revisits:6, studies:1, videos:3, notes:'', created_at:Date.now()-2592000000 },
    ],
    cleaning: [
      { id:'cl1', who:'Familia González',        date:wDay(6),  notes:'Salón principal y baños', created_at:Date.now() },
      { id:'cl2', who:'Hermano Vega y familia',  date:nwDay(6), notes:'Cocina, jardín y estacionamiento', created_at:Date.now() },
    ],
    workprogram: [
      { id:'wp1', title:'Pintura de la fachada', date:nwDay(6), who:'Grupo Norte', notes:'Se necesitan voluntarios. Llevar ropa de trabajo.', created_at:Date.now() },
    ],
  }
}
