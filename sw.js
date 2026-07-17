const CACHE = 'pizarra-v12'

// Archivos propios del app — se precargan al instalar
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.js',
  '/src/pages/Auth.js',
  '/src/pages/Shell.js',
  '/src/pages/Dashboard.js',
  '/src/pages/Meetings.js',
  '/src/pages/Weekend.js',
  '/src/pages/Field.js',
  '/src/utils/styles.js',
  '/src/utils/helpers.js',
  '/src/utils/router.js',
  '/src/config/supabase.js',
  '/src/config/demoData.js',
  '/src/services/auth.js',
  '/src/services/db.js',
  '/src/services/biometric.js',
  '/src/services/notifications.js',
]

// URLs externas que SÍ queremos cachear para uso offline
const CACHEABLE_EXTERNAL = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com/leaflet',
  'esm.sh/@supabase',
]

// URLs externas que NUNCA se cachean (datos en tiempo real)
const NEVER_CACHE = [
  'supabase.co',
  'netlify/functions',
  'tile.openstreetmap',
  'placehold.co',
]

function isNeverCache(url) { return NEVER_CACHE.some(s => url.includes(s)) }
function isCacheableExternal(url) { return CACHEABLE_EXTERNAL.some(s => url.includes(s)) }

// ── Install: precargar archivos propios ───────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

// ── Activate: limpiar cachés viejos ───────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// ── Fetch ─────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  const url = e.request.url

  // Solo interceptar GET
  if (e.request.method !== 'GET') return

  // APIs de datos en tiempo real → pasar directo, sin SW
  if (isNeverCache(url)) return

  // Recursos externos cacheables (fuentes, leaflet, supabase-js)
  if (isCacheableExternal(url)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone()
            caches.open(CACHE).then(c => c.put(e.request, clone))
          }
          return res
        }).catch(() => new Response('', { status: 503, statusText: 'Offline' }))
      })
    )
    return
  }

  // Archivos propios del dominio → Cache-first
  if (url.startsWith(self.location.origin)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone()
            caches.open(CACHE).then(c => c.put(e.request, clone))
          }
          return res
        }).catch(() => {
          if (e.request.destination === 'document') return caches.match('/index.html')
          return new Response('', { status: 503, statusText: 'Offline' })
        })
      })
    )
    return
  }

  // Cualquier otra URL externa no listada → dejar pasar sin interceptar
})

// ── Push Notifications ────────────────────────────────────────
self.addEventListener('push', e => {
  if (!e.data) return

  let payload
  try { payload = e.data.json() }
  catch { payload = { title: 'Pizarra Digital', body: e.data.text() } }

  const title   = payload.title || 'Pizarra Digital'
  const options = {
    body:               payload.body    || 'Tienes una nueva asignación',
    icon:               payload.icon    || '/icons/icon-192.png',
    badge:              payload.badge   || '/icons/icon-72.png',
    tag:                payload.tag     || 'asignacion',
    data:               payload.data    || {},
    vibrate:            [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: 'confirm', title: '✅ Confirmar' },
      { action: 'dismiss', title: 'Ver después'  }
    ],
  }

  e.waitUntil(self.registration.showNotification(title, options))
})

// ── Notification Click ────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close()

  const action    = e.action
  const data      = e.notification.data || {}
  const weekId    = data.weekId    || ''
  const assignKey = data.assignKey || ''
  const userId    = data.userId    || ''

  if (action === 'confirm') {
    e.waitUntil(
      fetch('/.netlify/functions/confirm-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekId, assignKey, userId })
      })
      .then(() => focusOrOpenApp())
      .catch(() => focusOrOpenApp())
    )
  } else {
    e.waitUntil(focusOrOpenApp())
  }
})

function focusOrOpenApp() {
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(clients => {
      const existing = clients.find(c => c.url.includes(self.location.origin))
      if (existing) return existing.focus()
      return self.clients.openWindow('/#meetings')
    })
}

// ── Push Subscription Change (renovar suscripción automático) ─
self.addEventListener('pushsubscriptionchange', e => {
  e.waitUntil(
    self.registration.pushManager.subscribe(e.oldSubscription.options)
      .then(sub => fetch('/.netlify/functions/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ renewedSubscription: sub.toJSON() })
      }))
  )
})