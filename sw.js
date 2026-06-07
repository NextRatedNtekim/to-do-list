// public/sw.js — WithTaskr Service Worker
// Place this file at the ROOT of your public/ folder.
// Vite serves public/ at /, so it becomes accessible at /sw.js automatically.

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

// ─── Push notification received ───────────────────────────────────────────────
self.addEventListener('push', (e) => {
  const data = e.data?.json() ?? {};

  const options = {
    body:    data.body    || 'You have a new notification.',
    icon:    data.icon    || '/icon-192.png',
    badge:   data.badge   || '/badge-72.png',
    tag:     data.tag     || 'withtaskr-default',
    renotify: true,
    data:    { url: data.url || '/' },
    actions: data.actions || [],
    vibrate: [200, 100, 200],
  };

  e.waitUntil(
    self.registration.showNotification(data.title || 'WithTaskr', options)
  );
});

// ─── Notification click handler ───────────────────────────────────────────────
self.addEventListener('notificationclick', (e) => {
  e.notification.close();

  const urlToOpen = e.notification.data?.url || '/';

  // Handle action button clicks
  if (e.action === 'do_now') {
    e.waitUntil(clients.openWindow('/focus'));
    return;
  }
  if (e.action === 'dismiss') {
    return;
  }

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If app is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      // Otherwise open a new window
      return clients.openWindow(urlToOpen);
    })
  );
});

// ─── Background sync (future use) ─────────────────────────────────────────────
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-tasks') {
    // Reserved for offline task sync in a future version
  }
});