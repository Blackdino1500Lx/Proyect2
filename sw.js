const CACHE = 'pizarra-v4'

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

function isNeverCache(url) {
  return NEVER_CACHE.some(s => url.includes(s))
}

function isCacheableExternal(url) {
  return CACHEABLE_EXTERNAL.some(s => url.includes(s))
}

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

  // Solo GET
  if (e.request.method !== 'GET') return

  // APIs de datos en tiempo real → pasar directo sin SW
  if (isNeverCache(url)) return

  // Recursos externos cacheables (fuentes, leaflet, supabase-js)
  if (isCacheableExternal(url)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached
        // Primera vez con internet: traer y cachear
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone()
            caches.open(CACHE).then(c => c.put(e.request, clone))
          }
          return res
        }).catch(() => {
          // Sin internet y sin caché: no hay nada que hacer, retornar vacío limpio
          return new Response('', { status: 503, statusText: 'Offline' })
        })
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
          if (e.request.destination === 'document') {
            return caches.match('/index.html')
          }
          return new Response('', { status: 503, statusText: 'Offline' })
        })
      })
    )
    return
  }

  // Cualquier otra URL externa no listada → dejar pasar sin interceptar
})