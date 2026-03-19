import { login, register } from '../services/auth.js'
import { toast } from '../utils/helpers.js'

export function renderAuth() {
  document.getElementById('auth-screen').innerHTML = `
    <div class="auth-wrap">
      <div class="auth-hero">
        <div class="auth-dove">🕊️</div>
        <h1>Kharis</h1>
        <div class="cong-name">Congregación Vista Grande</div>
      </div>
      <div class="auth-card">
        <div class="tab-row">
          <button class="tab-btn active" id="tab-login">Iniciar sesión</button>
          <button class="tab-btn" id="tab-reg">Registrarse</button>
        </div>
        <div id="form-login">
          <div class="fg"><label>Correo</label><input type="email" id="l-email" placeholder="tu@correo.com"/></div>
          <div class="fg"><label>Contraseña</label><input type="password" id="l-pass" placeholder="••••••••"/></div>
          <button class="btn-sky" id="btn-login">Iniciar sesión</button>
          <div class="auth-err" id="login-err"></div>
          <p class="auth-hint">Demo · admin@cong.com / admin123 &nbsp;|&nbsp; usuario@cong.com / user123</p>
        </div>
        <div id="form-reg" style="display:none">
          <div class="g2">
            <div class="fg"><label>Nombre completo</label><input type="text" id="r-name" placeholder="Pedro González"/></div>
            <div class="fg"><label>Correo</label><input type="email" id="r-email" placeholder="tu@correo.com"/></div>
          </div>
          <div class="fg"><label>Contraseña</label><input type="password" id="r-pass" placeholder="Mínimo 6 caracteres"/></div>
          <button class="btn-sky" id="btn-reg">Crear cuenta</button>
          <div class="auth-err" id="reg-err"></div>
        </div>
      </div>
    </div>`

  // Tab switching
  document.getElementById('tab-login').addEventListener('click', () => switchTab('login'))
  document.getElementById('tab-reg').addEventListener('click',   () => switchTab('register'))

  // Login
  document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('l-email').value.trim().toLowerCase()
    const pass  = document.getElementById('l-pass').value
    const btn   = document.getElementById('btn-login')
    const err   = document.getElementById('login-err')
    err.style.display = 'none'
    btn.innerHTML = '<span class="spin"></span>'
    btn.disabled  = true
    try {
      const userData = await login(email, pass)
      window.__onLogin(userData)
    } catch(e) {
      err.textContent = e.message
      err.style.display = 'block'
    }
    btn.textContent = 'Iniciar sesión'
    btn.disabled    = false
  })

  // Register
  document.getElementById('btn-reg').addEventListener('click', async () => {
    const name  = document.getElementById('r-name').value.trim()
    const email = document.getElementById('r-email').value.trim().toLowerCase()
    const pass  = document.getElementById('r-pass').value
    const btn   = document.getElementById('btn-reg')
    const err   = document.getElementById('reg-err')
    err.style.display = 'none'
    if (!name || !email || !pass) {
      err.textContent = 'Completa todos los campos'
      err.style.display = 'block'
      return
    }
    btn.innerHTML = '<span class="spin"></span>'
    btn.disabled  = true
    try {
      await register(name, email, pass)
      toast('¡Cuenta creada!', 'Ahora puedes iniciar sesión')
      switchTab('login')
    } catch(e) {
      err.textContent = e.message
      err.style.display = 'block'
    }
    btn.textContent = 'Crear cuenta'
    btn.disabled    = false
  })
}

function switchTab(tab) {
  document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none'
  document.getElementById('form-reg').style.display   = tab === 'register' ? 'block' : 'none'
  document.getElementById('tab-login').classList.toggle('active', tab === 'login')
  document.getElementById('tab-reg').classList.toggle('active',   tab === 'register')
}
