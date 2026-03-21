import { supabase } from '../config/supabase.js'

const RP_NAME = 'Pizarra Digital'
const RP_ID   = window.location.hostname

// ── Helpers ───────────────────────────────────────────────────
function base64url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function fromBase64url(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return Uint8Array.from(atob(str), c => c.charCodeAt(0)).buffer
}

export function isBiometricSupported() {
  return !!(window.PublicKeyCredential && navigator.credentials)
}

// ── Registrar passkey ─────────────────────────────────────────
export async function registerPasskey(userId, userName) {
  const challenge = crypto.getRandomValues(new Uint8Array(32))

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: RP_NAME, id: RP_ID },
      user: {
        id: new TextEncoder().encode(userId),
        name: userName,
        displayName: userName
      },
      pubKeyCredParams: [
        { alg: -7,   type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // solo biometría del dispositivo
        userVerification: 'required',
        residentKey: 'preferred'
      },
      timeout: 60000,
      attestation: 'none'
    }
  })

  if (!credential) throw new Error('No se pudo crear la clave biométrica')

  const credId    = base64url(credential.rawId)
  const publicKey = base64url(credential.response.getPublicKey
    ? credential.response.getPublicKey()
    : credential.response.attestationObject)

  const deviceName = navigator.userAgent.includes('iPhone') ? 'iPhone'
    : navigator.userAgent.includes('Android') ? 'Android'
    : navigator.userAgent.includes('Mac') ? 'Mac'
    : 'Dispositivo'

  const { error } = await supabase.from('passkeys').insert({
    user_id:       userId,
    credential_id: credId,
    public_key:    publicKey,
    counter:       0,
    device_name:   deviceName
  })

  if (error) throw new Error('Error al guardar la clave: ' + error.message)

  // Guardar en localStorage para referencia rápida
  localStorage.setItem('pizarra_passkey_id', credId)
  localStorage.setItem('pizarra_passkey_user', userId)

  return credId
}

// ── Autenticar con passkey ────────────────────────────────────
export async function authenticateWithPasskey() {
  const storedCredId = localStorage.getItem('pizarra_passkey_id')
  const storedUserId = localStorage.getItem('pizarra_passkey_user')

  if (!storedCredId || !storedUserId) {
    throw new Error('No hay clave biométrica registrada en este dispositivo')
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32))

  const allowCredentials = [{
    id:   fromBase64url(storedCredId),
    type: 'public-key',
    transports: ['internal']
  }]

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      rpId: RP_ID,
      allowCredentials,
      userVerification: 'required',
      timeout: 60000
    }
  })

  if (!assertion) throw new Error('Autenticación cancelada')

  // Verificar que la credencial existe en Supabase
  const credId = base64url(assertion.rawId)
  const { data, error } = await supabase
    .from('passkeys')
    .select('user_id, counter')
    .eq('credential_id', credId)
    .single()

  if (error || !data) throw new Error('Clave biométrica no reconocida')

  // Actualizar contador
  await supabase.from('passkeys')
    .update({ counter: (data.counter || 0) + 1 })
    .eq('credential_id', credId)

  return { userId: data.user_id }
}

// ── Verificar si hay passkey en este dispositivo ──────────────
export function hasPasskeyOnDevice() {
  return !!(localStorage.getItem('pizarra_passkey_id') &&
            localStorage.getItem('pizarra_passkey_user'))
}

// ── Eliminar passkey del dispositivo ─────────────────────────
export async function removePasskey() {
  const credId = localStorage.getItem('pizarra_passkey_id')
  if (credId) {
    await supabase.from('passkeys').delete().eq('credential_id', credId)
  }
  localStorage.removeItem('pizarra_passkey_id')
  localStorage.removeItem('pizarra_passkey_user')
}
