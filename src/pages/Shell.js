import { logout } from '../services/auth.js'
import { go } from '../utils/router.js'

export function renderShell(userData) {
  const isAdmin = userData.role === 'admin'

  document.getElementById('app').innerHTML = `
    <div id="install-bar">
      <span>📲</span>
      <p><strong>Instala Kharis</strong> en tu dispositivo para acceso sin conexión</p>
      <button id="btn-install">Instalar</button>
      <button id="btn-close-install" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:1.1rem;margin-left:auto">✕</button>
    </div>

    <header>
      <div class="brand">
        <div>
          <div>Pizarra Digital</div>
          <div class="brand-sub">Vista Grande</div>
        </div>
      </div>
      <div class="hdr-right">
        <div class="user-pill">
          <div class="role-pip ${isAdmin ? 'admin' : ''}"></div>
          <span>${userData.name || userData.email}</span>
          ${userData.group ? `<span style="color:var(--text3);font-size:.72rem"> · ${userData.group.name || userData.group}</span>` : ''}
        </div>
        <button class="btn-out" id="btn-logout">Salir</button>
      </div>
    </header>

    <nav>
      <button class="nt active" data-page="dash"         ><span class="ic">🏠</span>Inicio</button>
      <button class="nt"        data-page="meetings"      ><span class="ic">📅</span>Reuniones</button>
      <button class="nt"        data-page="announcements" ><span class="ic">📢</span>Anuncios</button>
      <button class="nt"        data-page="assignments"   ><span class="ic">📋</span>Asignaciones</button>
      <button class="nt"        data-page="programs"      ><span class="ic">🗂️</span>Programas</button>
      <button class="nt"        data-page="map"           ><span class="ic">🗺️</span>Predicación</button>
      <button class="nt"        data-page="reports"       ><span class="ic">📊</span>Informes</button>
      ${isAdmin ? `<button class="nt" data-page="admin"><span class="ic">⚙️</span>Admin</button>` : ''}
    </nav>

    <main id="main-content">
      <!-- Las páginas se inyectan aquí -->
    </main>`

  // Nav click listeners
  document.querySelectorAll('.nt').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page
      go(page)
      window.__loadPage(page)
    })
  })

  // Logout
  document.getElementById('btn-logout').addEventListener('click', async () => {
    await logout()
    window.__showAuth()
  })

  // Install PWA
  document.getElementById('btn-close-install').addEventListener('click', () => {
    document.getElementById('install-bar').classList.remove('show')
  })
}