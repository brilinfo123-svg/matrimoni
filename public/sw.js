
const CACHE_NAME = "matrimonial-pwa-v1";
const OFFLINE_URL = "/offline.html";

// Install the service worker and cache the offline fallback.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );
});

// Clean up only older caches belonging to this PWA.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (name) =>
                name.startsWith("matrimonial-pwa-") &&
                name !== CACHE_NAME
            )
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Serve navigations from the network, falling back offline if needed.
// Cache only safe, versioned Next.js static assets and icons.
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Never intercept cross-origin requests or API requests.
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Navigation: network first, then offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedPage = await caches.match(OFFLINE_URL);

        return (
          cachedPage ||
          new Response("You are offline. Please reconnect to continue.", {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
            },
          })
        );
      })
    );

    return;
  }

  // Cache-first for versioned Next.js assets and public icons.
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/");

  if (!isStaticAsset) {
    return;
  }

  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      const response = await fetch(request);

      if (response.ok && response.type === "basic") {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }

      return response;
    })
  );
});

// Handle incoming push notifications.
self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let data = {};

  try {
    data = event.data.json();
  } catch {
    data = {
      title: "New Message",
      body: event.data.text(),
    };
  }

  const senderName = data.senderName || "Someone";

  const title =
    data.title || `${senderName} sent you a message`;

  const options = {
    body: data.body || "You have a new message.",
    icon: data.icon || "/icons/icon-192.png",
    badge: data.badge || "/icons/icon-192.png",
    tag:
      data.tag ||
      `matrimonial-message-${Date.now()}`,
    renotify: true,
    requireInteraction: false,

    data: {
      url: data.url || "/messages",
      conversationId: data.conversationId || null,
      senderId: data.senderId || null,
      senderName,
    },

    actions: [
      {
        action: "open",
        title: "Open Message",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Open the relevant page when a notification is clicked.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const targetUrl = new URL(
    notificationData.url || "/messages",
    self.location.origin
  );

  // Only allow navigation to this website.
  if (targetUrl.origin !== self.location.origin) {
    return;
  }

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(async (clientList) => {
        for (const client of clientList) {
          if ("focus" in client && "navigate" in client) {
            await client.navigate(targetUrl.href);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl.href);
        }
      })
  );
});
