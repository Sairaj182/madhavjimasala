const CACHE_NAME = "madhavji-shell-v3";
const APP_SHELL = ["/", "/products"];

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith("madhavji-shell-") && key !== CACHE_NAME).map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // The account and pickup APIs, account pages, and Next.js data requests must pass through.
  const publicPage = request.mode === "navigate" && !url.search && APP_SHELL.includes(url.pathname);
  const staticAsset = url.pathname.startsWith("/_next/static/") || url.pathname === "/manifest.webmanifest";
  if (!publicPage && !staticAsset) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      if (staticAsset) {
        const cached = await cache.match(request);
        if (cached) return cached;
      }
      try {
        const response = await fetch(request);
        if (response.ok && !/\b(private|no-store)\b/i.test(response.headers.get("Cache-Control") || "")) {
          const copy = response.clone();
          event.waitUntil(cache.put(request, copy).catch(() => {}));
        }
        return response;
      } catch (error) {
        const cached = await cache.match(request);
        if (cached) return cached;
        throw error;
      }
    }),
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
