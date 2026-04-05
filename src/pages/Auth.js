import { login, register } from '../services/auth.js'
import { supabase } from '../config/supabase.js'
import { toast } from '../utils/helpers.js'
import {
  isBiometricSupported,
  hasPasskeyOnDevice,
  registerPasskey,
  authenticateWithPasskey
} from '../services/biometric.js'
import {
  subscribeToPush,
  listenForConfirmations
} from '../services/notifications.js'

let bioAvailable = false

export async function renderAuth() {
  bioAvailable = isBiometricSupported()
  const hasBio = bioAvailable && hasPasskeyOnDevice()

  document.getElementById('auth-screen').innerHTML = `
    <div class="auth-wrap">
      <div class="auth-hero">
        <div class="auth-dove">📋</div>
        <h1>Pizarra Digital</h1>
        <div class="cong-name">Congregación Vista Grande</div>
      </div>
      <div class="auth-card">

        ${hasBio ? `
        <button class="btn-bio" id="btn-biometric">
          <span style="font-size:1.5rem">👆</span>
          <span>Entrar con huella / Face ID</span>
        </button>
        <div class="bio-divider"><span>o usa tu contraseña</span></div>
        ` : ''}

        <div class="tab-row">
          <button class="tab-btn active" id="tab-login">Iniciar sesión</button>
          <button class="tab-btn" id="tab-reg">Registrarse</button>
        </div>

        <div id="form-login">
          <div class="fg"><label>Correo</label><input type="email" id="l-email" placeholder="tu@correo.com" autocomplete="email"/></div>
          <div class="fg"><label>Contraseña</label><input type="password" id="l-pass" placeholder="••••••••" autocomplete="current-password"/></div>
          <button class="btn-sky" id="btn-login">Iniciar sesión</button>
          <div class="auth-err" id="login-err"></div>
        </div>

        <div id="form-reg" style="display:none">
          <div class="g2">
            <div class="fg"><label>Nombre completo</label><input type="text" id="r-name" placeholder="Pedro González" autocomplete="name"/></div>
            <div class="fg"><label>Correo</label><input type="email" id="r-email" placeholder="tu@correo.com" autocomplete="email"/></div>
          </div>
          <div class="fg"><label>Contraseña</label><input type="password" id="r-pass" placeholder="Mínimo 6 caracteres" autocomplete="new-password"/></div>
          <button class="btn-sky" id="btn-reg">Crear cuenta</button>
          <div class="auth-err" id="reg-err"></div>
        </div>

      </div>
      ${hasBio ? `<div style="text-align:center;margin-top:.75rem"><button id="btn-remove-bio" style="background:none;border:none;color:var(--text3);font-size:.75rem;cursor:pointer;font-family:var(--sans)">Quitar acceso biométrico</button></div>` : ''}
    </div>`

  // ── Biométrico ────────────────────────────────────────────
  document.getElementById('btn-biometric')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-biometric')
    btn.disabled = true
    btn.innerHTML = '<span class="spin" style="width:18px;height:18px;border-top-color:white;border-color:rgba(255,255,255,.3)"></span><span>Verificando...</span>'
    try {
      const result = await authenticateWithPasskey()
      if (!result.success) throw new Error(result.error)
      const userId = result.userId || result.user_id
      if (!userId) throw new Error('No se pudo identificar el usuario')
      const { data: profile } = await supabase
        .from('users').select('*, groups(*)').eq('id', userId).single()
      if (!profile) throw new Error('Perfil no encontrado')
      await onLoginSuccess({ ...profile, group: profile.groups })
    } catch(e) {
      toast('Error', e.message, true)
      btn.disabled = false
      btn.innerHTML = '<span style="font-size:1.5rem">👆</span><span>Entrar con huella / Face ID</span>'
    }
  })

  // ── Quitar biometría ──────────────────────────────────────
  document.getElementById('btn-remove-bio')?.addEventListener('click', () => {
    if (!confirm('¿Quitar el acceso biométrico de este dispositivo?')) return
    localStorage.removeItem('pizarra_passkey_id')
    renderAuth()
    toast('Listo', 'Acceso biométrico desactivado')
  })

  // ── Tabs ──────────────────────────────────────────────────
  document.getElementById('tab-login').addEventListener('click', () => switchTab('login'))
  document.getElementById('tab-reg').addEventListener('click',   () => switchTab('register'))

  // ── Login normal ──────────────────────────────────────────
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
      await onLoginSuccess(userData)
      // Ofrecer biometría si está disponible y no está configurada
      if (bioAvailable && !localStorage.getItem('pizarra_passkey_id')) {
        offerBiometricSetup(userData.id, userData.name || userData.email)
      }
    } catch(e) {
      err.textContent = e.message
      err.style.display = 'block'
      btn.textContent = 'Iniciar sesión'
      btn.disabled    = false
    }
  })

  document.getElementById('l-pass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-login').click()
  })

  // ── Registro ──────────────────────────────────────────────
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

// ── Post-login: push + confirmaciones ─────────────────────────
async function onLoginSuccess(userData) {
  // Suscribir a notificaciones push (pide permiso la primera vez)
  try {
    await subscribeToPush(userData.id)
  } catch(e) {
    console.warn('Push no disponible:', e)
  }

  // Escuchar confirmaciones desde el service worker
  // Cuando el usuario toca "✅ Confirmar" en la notificación push
  listenForConfirmations(async (weekId) => {
    toast('✅ Asignacion confirmada', 'Gracias por confirmar tu participacion')
    // Aquí puedes agregar lógica futura: marcar en Supabase, etc.
    // Ejemplo: await supabase.from('assignment_confirmations').upsert(...)
  })

  // Continuar con el flujo normal de la app
  window.__onLogin(userData)
}

function switchTab(tab) {
  document.getElementById('form-login').style.display = tab === 'login'    ? 'block' : 'none'
  document.getElementById('form-reg').style.display   = tab === 'register' ? 'block' : 'none'
  document.getElementById('tab-login').classList.toggle('active', tab === 'login')
  document.getElementById('tab-reg').classList.toggle('active',   tab === 'register')
}

async function offerBiometricSetup(userId, userName) {
  setTimeout(async () => {
    const confirmed = confirm(
      '¿Quieres activar el acceso con huella / Face ID?\n\n' +
      'La próxima vez podrás entrar sin escribir tu contraseña.'
    )
    if (!confirmed) return
    try {
      const result = await registerPasskey(userId, userName)
      if (result.success) {
        localStorage.setItem('pizarra_passkey_user', userId)
        toast('¡Listo!', 'Acceso biométrico activado 👆')
      } else {
        toast('No se pudo activar', result.error || 'Intenta de nuevo', true)
      }
    } catch(e) {
      toast('Error', e.message, true)
    }
  }, 1200)
}