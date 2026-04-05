// src/services/notifications.js
// Gestiona suscripción a Push Notifications y confirmación de asignaciones

import { supabase } from '../config/supabase.js'

// ── Utilidad: convierte VAPID key base64 a Uint8Array ─────────
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

// ── Registra la suscripción push del usuario en Supabase ──────
export async function subscribePush(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] No soportado en este navegador')
    return false
  }

  try {
    const reg = await navigator.serviceWorker.ready

    // Pide permiso al usuario
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') {
      console.warn('[Push] Permiso denegado')
      return false
    }

    // Obtener la VAPID public key desde Netlify Function
    const keyRes = await fetch('/.netlify/functions/vapid-public-key')
    const { publicKey } = await keyRes.json()

    // Suscribirse al push manager
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    })

    // Guardar suscripción en Supabase
    const subJSON = subscription.toJSON()
    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id:  userId,
      endpoint: subJSON.endpoint,
      p256dh:   subJSON.keys?.p256dh,
      auth:     subJSON.keys?.auth,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

    if (error) {
      console.error('[Push] Error guardando suscripción:', error)
      return false
    }

    console.log('[Push] Suscripción guardada correctamente')
    return true

  } catch(err) {
    console.error('[Push] Error al suscribir:', err)
    return false
  }
}

// ── Verifica y suscribe al hacer login ────────────────────────
export async function initPushForUser(userId) {
  if (!userId) return
  // Solo pregunta si no hay suscripción activa o fue revocada
  const reg = await navigator.serviceWorker.ready.catch(() => null)
  if (!reg) return
  const existing = await reg.pushManager.getSubscription()
  if (!existing) {
    await subscribePush(userId)
  } else {
    // Actualiza la suscripción en BD por si cambió
    const subJSON = existing.toJSON()
    await supabase.from('push_subscriptions').upsert({
      user_id:  userId,
      endpoint: subJSON.endpoint,
      p256dh:   subJSON.keys?.p256dh,
      auth:     subJSON.keys?.auth,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
  }
}

// ── Envía notificación push a un usuario asignado ─────────────
// Llama a Netlify Function que tiene las VAPID privadas
export async function sendAssignmentNotification({ toUserId, toUserName, weekDateRange, role, weekId, assignKey }) {
  try {
    const res = await fetch('/.netlify/functions/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toUserId,
        title: '📋 Nueva asignación',
        body:  `Hola ${toUserName}, tienes una asignación en la semana del ${weekDateRange}: ${role}`,
        data: {
          weekId,
          assignKey,
          userId: toUserId,
          url: '/#meetings'
        }
      })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[Push] Error enviando notificación:', err)
      return false
    }
    return true
  } catch(err) {
    console.error('[Push] Error de red:', err)
    return false
  }
}

// ── Confirma una asignación (llamada desde la app, no del SW) ──
export async function confirmAssignment(weekId, assignKey, userId) {
  try {
    const res = await fetch('/.netlify/functions/confirm-assignment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekId, assignKey, userId })
    })
    return res.ok
  } catch(err) {
    console.error('[Push] Error confirmando asignación:', err)
    return false
  }
}
