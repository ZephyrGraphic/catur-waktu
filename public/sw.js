const CACHE_NAME = "catur-waktu-cache-v1"
const ASSETS = ["/", "/manifest.webmanifest", "/icons/icon-192.jpg", "/icons/icon-512.jpg"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k)))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req)
        .then((resp) => {
          const copy = resp.clone()
          caches
            .open(CACHE_NAME)
            .then((c) => c.put(req, copy))
            .catch(() => {})
          return resp
        })
        .catch(() => cached)
      return cached || fetched
    }),
  )
})

// Allow pages to request notifications from SW
self.addEventListener("message", (event) => {
  const data = event.data || {}
  if (data.type === "SHOW_DEADLINE_NOTIFICATION") {
    const { title, body } = data.payload || {}
    if (self.registration && self.registration.showNotification) {
      self.registration.showNotification(title || "Pengingat Tugas", {
        body: body || "",
        icon: "/icons/icon-192.jpg",
        badge: "/icons/icon-192.jpg",
        vibrate: [100, 50, 100],
        tag: "catur-waktu-deadline",
        requireInteraction: true,
      })
    }
  }
})
