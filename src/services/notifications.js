// src/services/notifications.js
import { supabase } from '../config/supabase.js'

// ── VAPID Public Key (debe coincidir con VAPID_PUBLIC_KEY en Netlify) ──
const VAPID_PUBLIC_KEY = 'BKUVRZRL1ndMPbY4TqRWwNWHJmZ6kJN35XnvS1uHfwKRH2abgm_NulLcmuuyylcmgLHhUh82r1QkhY5QuKg9LiE'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

// ── Suscribir usuario al push (pide permiso si no lo tiene) ───
export async function subscribeToPush(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] No soportado en este navegador')
    return false
  }
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('[Push] Permiso denegado')
      return false
    }
    const reg = await navigator.serviceWorker.ready
    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })
    }
    const subJSON = sub.toJSON()
    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id:    userId,
      endpoint:   subJSON.endpoint,
      p256dh:     subJSON.keys.p256dh,
      auth:       subJSON.keys.auth,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    if (error) { console.error('[Push] Error guardando suscripción:', error); return false }
    console.log('[Push] Suscripción lista')
    return true
  } catch(err) {
    console.error('[Push] Error al suscribir:', err)
    return false
  }
}

// ── Alias usado en Auth.js ─────────────────────────────────────
export async function initPushForUser(userId) {
  if (!userId) return
  try {
    const reg = await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    if (!existing) {
      await subscribeToPush(userId)
    } else {
      // Actualizar endpoint en BD por si cambió
      const subJSON = existing.toJSON()
      await supabase.from('push_subscriptions').upsert({
        user_id:    userId,
        endpoint:   subJSON.endpoint,
        p256dh:     subJSON.keys?.p256dh,
        auth:       subJSON.keys?.auth,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
    }
  } catch(e) {
    console.warn('[Push] initPushForUser error:', e)
  }
}

// ── Verificar si hay suscripción activa ───────────────────────
export async function isPushSubscribed() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    return !!sub
  } catch { return false }
}

// ── Desuscribir usuario ───────────────────────────────────────
export async function unsubscribeFromPush(userId) {
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) await sub.unsubscribe()
    await supabase.from('push_subscriptions').delete().eq('user_id', userId)
    return true
  } catch(err) {
    console.error('[Push] Error desuscribiendo:', err)
    return false
  }
}

// ── Enviar push a lista de userIds (usado en Meetings.js) ─────
export async function sendPushToUsers(userIds, { title, message, weekId }) {
  if (!userIds || userIds.length === 0) return

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .in('user_id', userIds)

  if (error || !subs || subs.length === 0) {
    console.warn('[Push] Sin suscripciones para estos usuarios')
    return
  }

  const subscriptions = subs.map(s => ({
    endpoint: s.endpoint,
    keys: { p256dh: s.p256dh, auth: s.auth }
  }))

  try {
    const res = await fetch('/.netlify/functions/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptions, title, message, weekId })
    })
    const result = await res.json()
    // Limpiar suscripciones expiradas
    if (result.expired && result.expired.length > 0) {
      await supabase.from('push_subscriptions')
        .delete()
        .in('endpoint', result.expired)
    }
    console.log(`[Push] Enviadas: ${result.sent}`)
  } catch(err) {
    console.error('[Push] Error enviando:', err)
  }
}

// ── Escuchar confirmaciones desde el SW ───────────────────────
export function listenForConfirmations(callback) {
  if (!navigator.serviceWorker) return
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data?.type === 'CONFIRM_ASSIGNMENT') {
      callback(e.data.weekId)
    }
  })
}