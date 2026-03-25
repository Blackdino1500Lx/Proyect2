const CACHE = 'pizarra-v3'

// Archivos del app shell que se precargan al instalar
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
]

// URLs que NUNCA se cachean (siempre van a la red)
function isNetworkOnly(url) {
  return url.includes('supabase')          ||
         url.includes('googleapis')        ||
         url.includes('tile.openstreetmap') ||
         url.includes('netlify/functions')  ||
         url.includes('unpkg.com')
}

// ── Install: precargar app shell ──────────────────────────────
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

// ── Fetch: Cache-first para app shell, network-first para datos ─
self.addEventListener('fetch', e => {
  const url = e.request.url

  // Peticiones de datos/API: intentar red, caer en caché si falla
  if (isNetworkOnly(url)) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    )
    return
  }

  // Solo cachear GET
  if (e.request.method !== 'GET') return

  // App shell: Cache-first (offline funciona inmediatamente)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached

      // No está en caché → traer de red y guardar
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
        return res
      }).catch(() => {
        // Sin red y sin caché → página offline de fallback
        if (e.request.destination === 'document') {
          return caches.match('/index.html')
        }
      })
    })
  )
})