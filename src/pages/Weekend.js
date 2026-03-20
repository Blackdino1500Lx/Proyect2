import { toast } from '../utils/helpers.js'
import { DEMO_MODE, supabase } from '../config/supabase.js'

// ── Fetch meetings ────────────────────────────────────────────
async function fetchWeekends() {
  if (DEMO_MODE) return []
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('weekend_meetings')
    .select('*')
    .gte('meeting_date', today)
    .order('meeting_date', { ascending: true })
  if (error) { console.error(error); return [] }
  return data || []
}

async function fetchUsers() {
  if (DEMO_MODE) return []
  const { data } = await supabase.from('users').select('id,name,gender,baptized,school').order('name')
  return data || []
}

// ── Netlify proxy para La Atalaya ─────────────────────────────
async function extractWatchtowerPDF(base64PDF) {
  const res = await fetch('/.netlify/functions/extract-watchtower', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pdfBase64: base64PDF })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Error ${res.status}` }))
    throw new Error(err.error || `Error del servidor: ${res.status}`)
  }
  return await res.json()
}

// ── Select helpers ────────────────────────────────────────────
function makeUserSelect(id, value, users, filter, style='') {
  const list = filter === 'baptized_brother' ? users.filter(u => u.baptized && u.gender !== 'sister')
             : filter === 'school_brother'   ? users.filter(u => u.school && u.gender !== 'sister')
             : users
  const opts = '<option value="">— Seleccionar —</option>' +
    list.map(u => `<option value="${u.name}"${value===u.name?' selected':''}>${u.name}</option>`).join('')
  return `<select id="${id}" style="width:100%;padding:.45rem .6rem;border:1.5px solid var(--border);border-radius:var(--r2);font-family:var(--sans);font-size:.88rem;background:var(--white);color:var(--text);${style}">${opts}</select>`
}

// ── Render ────────────────────────────────────────────────────
export async function renderWeekend(container, currentUser) {
  const isAdmin = currentUser?.role === 'admin'
  container.innerHTML = `<div class="page active" id="page-weekend">
    <div class="section-hd"><h2 class="section-title">Reunión de Fin de Semana</h2></div>
    <div class="empty"><span class="spin" style="width:24px;height:24px;border-top-color:var(--sky);border-color:var(--border2)"></span></div>
  </div>`

  const [meetings, users] = await Promise.all([fetchWeekends(), fetchUsers()])
  container.innerHTML = buildHTML(isAdmin, meetings, users)
  attachEvents(container, isAdmin, meetings, users, currentUser)
}

function buildHTML(isAdmin, meetings, users) {
  return `<div class="page active" id="page-weekend">
    <div class="section-hd">
      <h2 class="section-title">Reunión de Fin de Semana</h2>
      ${meetings.length > 0 ? `<span class="badge b-green">&#10003; ${meetings.length} programadas</span>` : ''}
    </div>

    ${isAdmin ? buildAdminForm(users) : ''}

    <div id="weekend-list">
      ${meetings.length > 0
        ? meetings.map(m => buildMeetingCard(m, isAdmin, users)).join('')
        : `<div class="empty"><span class="emic">&#9749;</span><p>${isAdmin ? 'No hay reuniones programadas' : 'No hay reuniones de fin de semana programadas'}</p></div>`}
    </div>
  </div>`
}

function buildAdminForm(users) {
  return `<div class="card" style="border-color:var(--border2);margin-bottom:1.2rem">
    <div class="card-hd">
      <span class="card-title">+ Nueva Reunion de Fin de Semana</span>
      <button class="btn-sm" id="btn-toggle-wk-form">Añadir</button>
    </div>
    <div id="wk-form" style="display:none;margin-top:1rem">

      <!-- Fecha y cánticos -->
      <div class="g2" style="margin-bottom:.75rem">
        <div class="fg"><label>Fecha</label><input type="date" id="wk-date"/></div>
        <div class="fg"><label>Cantico apertura</label><input type="text" id="wk-open-song" placeholder="Ej: 32"/></div>
        <div class="fg"><label>Cantico intermedio</label><input type="text" id="wk-mid-song" placeholder="Ej: 128"/></div>
        <div class="fg"><label>Cantico Atalaya</label><input type="text" id="wk-wt-song" placeholder="Ej: 58"/></div>
        <div class="fg"><label>Cantico cierre</label><input type="text" id="wk-close-song" placeholder="Ej: 14"/></div>
      </div>

      <!-- Presidente y oraciones -->
      <div style="background:var(--sky-bg);border-radius:var(--r2);padding:.75rem;margin-bottom:.75rem;border:1px solid var(--border2)">
        <div style="font-size:.72rem;font-weight:700;color:var(--text2);margin-bottom:.6rem;text-transform:uppercase">Roles</div>
        <div class="g2">
          <div class="fg"><label>Presidente</label>${makeUserSelect('wk-presidente','',users,'baptized_brother')}</div>
          <div class="fg"><label>Oracion apertura</label>${makeUserSelect('wk-oracion-ap','',users,'baptized_brother')}</div>
          <div class="fg"><label>Oracion cierre</label>${makeUserSelect('wk-oracion-cl','',users,'baptized_brother')}</div>
        </div>
      </div>

      <!-- Discurso público -->
      <div style="background:#fff8f0;border-radius:var(--r2);padding:.75rem;margin-bottom:.75rem;border:1px solid #f5d5a0">
        <div style="font-size:.72rem;font-weight:700;color:#c07820;margin-bottom:.6rem;text-transform:uppercase">Discurso Publico</div>
        <div class="g2">
          <div class="fg"><label>Tema del discurso</label><input type="text" id="wk-talk-theme" placeholder="Titulo del discurso..."/></div>
          <div class="fg"><label>Discursante</label><input type="text" id="wk-talk-speaker" placeholder="Nombre y congregacion..."/></div>
        </div>
      </div>

      <!-- Estudio La Atalaya -->
      <div style="background:#f0f8ff;border-radius:var(--r2);padding:.75rem;margin-bottom:.75rem;border:1px solid var(--border2)">
        <div style="font-size:.72rem;font-weight:700;color:#4a90d9;margin-bottom:.6rem;text-transform:uppercase">Estudio de La Atalaya</div>
        <div class="g2" style="margin-bottom:.6rem">
          <div class="fg"><label>Conductor</label>${makeUserSelect('wk-study-conductor','',users,'baptized_brother')}</div>
          <div class="fg"><label>Lector</label>${makeUserSelect('wk-study-reader','',users,'school_brother')}</div>
        </div>
        <div class="fg" style="margin-bottom:.6rem">
          <label>Tema del estudio</label>
          <div style="display:flex;gap:.5rem;align-items:flex-end">
            <input type="text" id="wk-study-theme" placeholder="Extraer del PDF o escribir manualmente..." style="flex:1"/>
            <label for="wt-pdf-input" class="btn-sm" style="cursor:pointer;white-space:nowrap;padding:.4rem .7rem">📄 Subir PDF</label>
          </div>
          <input type="file" id="wt-pdf-input" accept=".pdf" style="display:none"/>
        </div>
        <div id="wt-pdf-progress" style="display:none">
          <div style="display:flex;align-items:center;gap:.6rem;padding:.6rem;background:var(--sky-bg);border-radius:var(--r2)">
            <span class="spin" style="border-top-color:var(--sky);border-color:rgba(74,144,217,.25)"></span>
            <span style="font-size:.78rem;color:var(--sky3)">Extrayendo tema de La Atalaya...</span>
          </div>
        </div>
      </div>

      <button class="btn-action" id="btn-save-weekend" style="width:100%">Guardar reunion</button>
    </div>
  </div>`
}

function buildMeetingCard(m, isAdmin, users) {
  const d = new Date(m.meeting_date + 'T00:00:00')
  const dateStr = d.toLocaleDateString('es', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  const row = (icon, label, value) => value ? `
    <div style="display:flex;align-items:flex-start;gap:.5rem;padding:.35rem 0;border-bottom:1px solid rgba(0,0,0,.04)">
      <span style="font-size:.85rem;flex-shrink:0">${icon}</span>
      <div>
        <div style="font-size:.7rem;color:var(--text3);font-weight:700;text-transform:uppercase">${label}</div>
        <div style="font-size:.85rem;color:var(--text);font-weight:600">${value}</div>
      </div>
    </div>` : ''

  return `<div class="meet-accordion" id="wm-${m.id}">
    <div class="meet-accordion-hd" data-wm="${m.id}">
      <div class="meet-date">
        <div class="meet-day">${d.getDate()}</div>
        <div class="meet-mon">${d.toLocaleDateString('es',{month:'short'}).toUpperCase()}</div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:.92rem;color:var(--text)">Reunion de Fin de Semana</div>
        <div style="font-size:.78rem;color:var(--text2)">${dateStr}</div>
        ${m.talk_theme ? `<div style="font-size:.72rem;color:var(--text3);margin-top:.1rem">${m.talk_theme}</div>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:.35rem;flex-shrink:0">
        ${isAdmin ? `<button class="btn-sm danger" data-del-wm="${m.id}" style="font-size:.68rem;padding:.22rem .5rem">X</button>` : ''}
        <span class="meet-chevron">v</span>
      </div>
    </div>
    <div class="meet-accordion-body">
      <div style="padding-top:.8rem">

        <!-- Roles -->
        <div style="background:var(--sky-bg);border-radius:var(--r2);padding:.6rem .85rem;margin-bottom:.75rem;border:1px solid var(--border2)">
          ${row('🎙️','Presidente', m.presidente)}
          ${row('🙏','Oracion apertura', m.oracion_apertura)}
          <div style="font-size:.7rem;color:var(--text3);padding:.25rem 0">Cantico ${m.opening_song || '—'}</div>
        </div>

        <!-- Discurso -->
        <div style="background:#fff8f0;border-radius:var(--r2);padding:.6rem .85rem;margin-bottom:.75rem;border:1px solid #f5d5a0">
          <div style="font-size:.68rem;font-weight:700;color:#c07820;text-transform:uppercase;margin-bottom:.4rem">Discurso Publico</div>
          ${row('📢','Tema', m.talk_theme)}
          ${row('👤','Discursante', m.talk_speaker)}
        </div>

        <div style="font-size:.7rem;color:var(--text3);padding:.2rem .85rem">Cantico ${m.mid_song || '—'}</div>

        <!-- Atalaya -->
        <div style="background:#f0f8ff;border-radius:var(--r2);padding:.6rem .85rem;margin-top:.4rem;border:1px solid var(--border2)">
          <div style="font-size:.68rem;font-weight:700;color:#4a90d9;text-transform:uppercase;margin-bottom:.4rem">Estudio de La Atalaya</div>
          ${row('📖','Tema', m.study_theme)}
          ${row('🎤','Conductor', m.study_conductor)}
          ${row('📚','Lector', m.study_reader)}
          <div style="font-size:.7rem;color:var(--text3);padding:.25rem 0">Cantico ${m.watchtower_song || '—'}</div>
        </div>

        <!-- Cierre -->
        <div style="background:var(--sky-bg);border-radius:var(--r2);padding:.6rem .85rem;margin-top:.75rem;border:1px solid var(--border2)">
          ${row('🙏','Oracion cierre', m.oracion_cierre)}
          <div style="font-size:.7rem;color:var(--text3);padding:.25rem 0">Cantico ${m.closing_song || '—'} · Palabras de conclusion</div>
        </div>

      </div>
    </div>
  </div>`
}

// ── Events ────────────────────────────────────────────────────
function attachEvents(container, isAdmin, meetings, users, currentUser) {
  // Accordion
  container.querySelectorAll('.meet-accordion-hd').forEach(hd => {
    hd.addEventListener('click', e => {
      if (e.target.closest('[data-del-wm]')) return
      hd.closest('.meet-accordion').classList.toggle('open')
    })
  })

  if (!isAdmin) return

  // Toggle form
  container.querySelector('#btn-toggle-wk-form')?.addEventListener('click', () => {
    const form = container.querySelector('#wk-form')
    const btn  = container.querySelector('#btn-toggle-wk-form')
    const open = form.style.display === 'none'
    form.style.display = open ? 'block' : 'none'
    btn.textContent = open ? 'Cerrar' : 'Añadir'
  })

  // PDF de La Atalaya
  container.querySelector('#wt-pdf-input')?.addEventListener('change', async e => {
    const file = e.target.files?.[0]
    if (!file) return
    const prog = container.querySelector('#wt-pdf-progress')
    if (prog) prog.style.display = 'block'
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload  = () => resolve(reader.result.split(',')[1])
        reader.onerror = () => reject(new Error('No se pudo leer'))
        reader.readAsDataURL(file)
      })
      const result = await extractWatchtowerPDF(base64)
      if (result?.theme) {
        container.querySelector('#wk-study-theme').value = result.theme
        toast('Tema extraído', result.theme)
      }
    } catch(err) {
      toast('Error', err.message, true)
    }
    if (prog) prog.style.display = 'none'
  })

  // Guardar reunión
  container.querySelector('#btn-save-weekend')?.addEventListener('click', async () => {
    const date = container.querySelector('#wk-date')?.value
    if (!date) { toast('Error', 'Selecciona la fecha', true); return }

    const meeting = {
      meeting_date:     date,
      opening_song:     container.querySelector('#wk-open-song')?.value || '',
      mid_song:         container.querySelector('#wk-mid-song')?.value || '',
      watchtower_song:  container.querySelector('#wk-wt-song')?.value || '',
      closing_song:     container.querySelector('#wk-close-song')?.value || '',
      presidente:       container.querySelector('#wk-presidente')?.value || '',
      oracion_apertura: container.querySelector('#wk-oracion-ap')?.value || '',
      oracion_cierre:   container.querySelector('#wk-oracion-cl')?.value || '',
      talk_theme:       container.querySelector('#wk-talk-theme')?.value || '',
      talk_speaker:     container.querySelector('#wk-talk-speaker')?.value || '',
      study_theme:      container.querySelector('#wk-study-theme')?.value || '',
      study_conductor:  container.querySelector('#wk-study-conductor')?.value || '',
      study_reader:     container.querySelector('#wk-study-reader')?.value || '',
      updated_at:       new Date().toISOString()
    }

    const btn = container.querySelector('#btn-save-weekend')
    btn.textContent = 'Guardando...'
    btn.disabled = true

    const { error } = await supabase.from('weekend_meetings').upsert(meeting, { onConflict: 'meeting_date' })
    if (error) {
      toast('Error', error.message, true)
    } else {
      toast('Guardado', `Reunion del ${date}`)
      await renderWeekend(container, currentUser)
    }
    btn.textContent = 'Guardar reunion'
    btn.disabled = false
  })

  // Eliminar
  container.querySelectorAll('[data-del-wm]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation()
      if (!confirm('Eliminar esta reunion?')) return
      await supabase.from('weekend_meetings').delete().eq('id', btn.dataset.delWm)
      toast('Eliminado', 'Reunion eliminada')
      await renderWeekend(container, currentUser)
    })
  })
}
