const CACHE_NAME = "madhavji-shell-v2";
const APP_SHELL = ["/", "/products", "/general-store", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/"))),
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "Madhavji Masala", body: "Your order has an update.", url: "/orders" };
  try {
    const parsed = event.data?.json?.();
    if (parsed && typeof parsed === "object") data = { ...data, ...parsed };
  } catch {
    // Keep the generic notification if a provider sends invalid JSON.
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Madhavji Masala", {
      body: data.body || "Your order has an update.",
      icon: "/images/madhavjimasala_logo_tbg.png",
      badge: "/images/madhavjimasala_logo_tbg.png",
      data: { url: data.url || "/orders" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/orders", self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find((client) => "focus" in client && client.url.startsWith(self.location.origin));
      if (existing) {
        void existing.focus();
        if ("navigate" in existing) void existing.navigate(targetUrl);
        return;
      }
      return clients.openWindow(targetUrl);
    }),
  );
});
