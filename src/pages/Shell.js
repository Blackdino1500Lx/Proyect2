import { logout } from '../services/auth.js'
import { go } from '../utils/router.js'

export function renderShell(userData) {
  const isAdmin = userData.role === 'admin'

  const navItems = [
    { page: 'dash',      icon: '🏠', label: 'Inicio' },
    { page: 'meetings',  icon: '📅', label: 'Reuniones' },
    { page: 'programs',  icon: '🗂️', label: 'Programas' },
    { page: 'map',       icon: '🗺️', label: 'Predicación' },
  ]

  document.getElementById('app').innerHTML = `
    <div id="install-bar">
      <span>📲</span>
      <p><strong>Instala la app</strong> para acceso rápido sin conexión</p>
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
          <span>${userData.name?.split(' ')[0] || userData.email}</span>
        </div>
        ${isAdmin ? `<button class="btn-admin-gear" id="btn-goto-admin" title="Administración">⚙️</button>` : ''}
        <button class="btn-out" id="btn-logout">Salir</button>
      </div>
    </header>

    <nav id="top-nav">
      ${navItems.map((n, i) => `
        <button class="nt ${i === 0 ? 'active' : ''}" data-page="${n.page}">
          <span class="ic">${n.icon}</span>${n.label}
        </button>`).join('')}
    </nav>

    <main id="main-content">
      <!-- páginas aquí -->
    </main>

    <nav id="bottom-nav">
      ${navItems.map((n, i) => `
        <button class="bn ${i === 0 ? 'active' : ''}" data-page="${n.page}">
          <span class="bn-icon">${n.icon}</span>
          <span class="bn-label">${n.label}</span>
        </button>`).join('')}
    </nav>`

  document.querySelectorAll('.nt, .bn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page
      document.querySelectorAll('.nt').forEach(b => b.classList.toggle('active', b.dataset.page === page))
      document.querySelectorAll('.bn').forEach(b => b.classList.toggle('active', b.dataset.page === page))
      go(page)
      window.__loadPage(page)
    })
  })

  document.getElementById('btn-logout').addEventListener('click', async () => {
    await logout()
    window.__showAuth()
  })

  document.getElementById('btn-close-install')?.addEventListener('click', () => {
    document.getElementById('install-bar').classList.remove('show')
  })

  document.getElementById('btn-goto-admin')?.addEventListener('click', () => {
    go('admin')
    window.__loadPage('admin')
  })
}