const CACHE = 'pizarra-v2'
const STATIC = ['/', '/index.html', '/manifest.json']

// ── Install ───────────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
  )
})

// ── Activate ──────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// ── Fetch ─────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  if (
    e.request.url.includes('supabase') ||
    e.request.url.includes('googleapis') ||
    e.request.url.includes('tile') ||
    e.request.url.includes('netlify/functions')
  ) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
    return
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200) return res
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
        return res
      })
    })
  )
})

// ── Push Notifications ────────────────────────────────────────
self.addEventListener('push', e => {
  if (!e.data) return

  let payload
  try { payload = e.data.json() }
  catch { payload = { title: 'Pizarra Digital', body: e.data.text() } }

  const title   = payload.title || 'Pizarra Digital'
  const options = {
    body:    payload.body    || 'Tienes una nueva asignación',
    icon:    payload.icon    || '/icons/icon-192.png',
    badge:   payload.badge   || '/icons/icon-72.png',
    tag:     payload.tag     || 'asignacion',
    data:    payload.data    || {},
    vibrate: [200, 100, 200],
    actions: [
      { action: 'confirm', title: '✅ Confirmar', icon: '/icons/icon-72.png' },
      { action: 'dismiss', title: '❌ Cerrar' }
    ],
    requireInteraction: true   // la notif se queda hasta que el usuario actúe
  }

  e.waitUntil(self.registration.showNotification(title, options))
})

// ── Notification Click ────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close()

  const action     = e.action
  const data       = e.notification.data || {}
  const weekId     = data.weekId     || ''
  const assignKey  = data.assignKey  || ''
  const userId     = data.userId     || ''

  if (action === 'confirm') {
    // Confirma la asignación via Netlify Function
    e.waitUntil(
      fetch('/.netlify/functions/confirm-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekId, assignKey, userId })
      }).then(() => {
        // Abre la app en la sección de reuniones
        return self.clients.matchAll({ type: 'window', includeUncontrolled: true })
          .then(clients => {
            const appClient = clients.find(c => c.url.includes(self.location.origin))
            if (appClient) return appClient.focus()
            return self.clients.openWindow('/#meetings')
          })
      }).catch(console.error)
    )
  } else {
    // Abre la app (clic general o dismiss visual)
    e.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clients => {
          const appClient = clients.find(c => c.url.includes(self.location.origin))
          if (appClient) return appClient.focus()
          return self.clients.openWindow('/#meetings')
        })
    )
  }
})

// ── Push Subscription Change ──────────────────────────────────
self.addEventListener('pushsubscriptionchange', e => {
  e.waitUntil(
    self.registration.pushManager.subscribe(e.oldSubscription.options)
      .then(sub => {
        return fetch('/.netlify/functions/save-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub.toJSON() })
        })
      })
  )
})