const CACHE = 'kharis-v1'
const STATIC = ['/Proyect2/', '/Proyect2/index.html', '/Proyect2/manifest.json']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting()))
})
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()))
})
self.addEventListener('fetch', e => {
  if (e.request.url.includes('supabase') || e.request.url.includes('googleapis') || e.request.url.includes('tile')) {
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