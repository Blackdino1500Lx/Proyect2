// ─────────────────────────────────────────────────────────────
// biometric.js — WebAuthn / Passkey para login biométrico
// ─────────────────────────────────────────────────────────────
import { supabase } from '../config/supabase.js'

const RP_ID   = window.location.hostname
const RP_NAME = 'Pizarra Digital Vista Grande'

// ── Helpers ───────────────────────────────────────────────────
function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64ToBuffer(base64) {
  const b = base64.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b)
  return Uint8Array.from(bin, c => c.charCodeAt(0)).buffer
}

// ── Verificar soporte ─────────────────────────────────────────
export function isBiometricSupported() {
  return window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
}

export async function isBiometricAvailable() {
  if (!isBiometricSupported()) return false
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch { return false }
}

// ── Verificar si el usuario ya tiene passkey ──────────────────
export async function hasPasskey(userId) {
  const { data } = await supabase.from('passkeys').select('id').eq('user_id', userId).limit(1)
  return data && data.length > 0
}

export function hasPasskeyOnDevice() {
  return !!localStorage.getItem('pizarra_passkey_id')
}

// ── Registrar nueva passkey (después del login normal) ────────
export async function registerPasskey(userId, userName) {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    const userIdBytes = new TextEncoder().encode(userId.replace(/-/g, '').slice(0, 16))

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { id: RP_ID, name: RP_NAME },
        user: { id: userIdBytes, name: userName, displayName: userName },
        pubKeyCredParams: [
          { alg: -7,   type: 'public-key' },
          { alg: -257, type: 'public-key' },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      }
    })

    if (!credential) return { success: false, error: 'No se pudo crear la credencial' }

    const credentialId = bufferToBase64(credential.rawId)

    // getPublicKey() no está disponible en todos los navegadores — usamos attestationObject como fallback
    let publicKey = ''
    try {
      const pk = credential.response.getPublicKey ? credential.response.getPublicKey() : null
      publicKey = pk ? bufferToBase64(pk) : bufferToBase64(credential.response.attestationObject)
    } catch {
      publicKey = bufferToBase64(credential.response.attestationObject)
    }

    const { error } = await supabase.from('passkeys').insert({
      user_id:       userId,
      credential_id: credentialId,
      public_key:    publicKey,
      counter:       0,
      device_name:   getDeviceName(),
    })

    if (error) return { success: false, error: 'Supabase: ' + error.message + ' | code: ' + error.code }

    localStorage.setItem('pizarra_passkey_id', credentialId)
    localStorage.setItem('pizarra_passkey_user', userId)

    return { success: true }

  } catch (err) {
    if (err.name === 'NotAllowedError') return { success: false, error: 'Cancelado por el usuario' }
    return { success: false, error: err.name + ': ' + err.message }
  }
}

// ── Autenticar con passkey existente ──────────────────────────
export async function authenticateWithPasskey() {
  try {
    const challenge    = crypto.getRandomValues(new Uint8Array(32))
    const savedCredId  = localStorage.getItem('pizarra_passkey_id')

    if (!savedCredId) return { success: false, error: 'No hay credencial guardada en este dispositivo' }

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: RP_ID,
        userVerification: 'required',
        timeout: 60000,
        allowCredentials: [{
          id:         base64ToBuffer(savedCredId),
          type:       'public-key',
          transports: ['internal'],
        }]
      }
    })

    if (!assertion) return { success: false, error: 'Autenticación cancelada' }

    const credentialId = bufferToBase64(assertion.rawId)
    const { data, error } = await supabase
      .rpc('get_passkey_user', { cred_id: credentialId })

    if (error || !data) return { success: false, error: 'Dispositivo no reconocido' }

    return { success: true, userId: data.user_id, email: data.email }

  } catch (err) {
    if (err.name === 'NotAllowedError') return { success: false, error: 'Cancelado' }
    return { success: false, error: err.message }
  }
}

// ── Eliminar passkey del dispositivo ─────────────────────────
export async function removePasskey(userId) {
  await supabase.from('passkeys').delete().eq('user_id', userId)
}

function getDeviceName() {
  const ua = navigator.userAgent
  if (/iPhone/.test(ua)) return 'iPhone'
  if (/iPad/.test(ua)) return 'iPad'
  if (/Android/.test(ua)) return 'Android'
  if (/Mac/.test(ua)) return 'Mac'
  if (/Windows/.test(ua)) return 'Windows'
  return 'Dispositivo desconocido'
}