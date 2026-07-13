// Service Worker for HomeTutorX Web Push Notifications

self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const payload = event.data.json();
      const title = payload.title || 'HomeTutorX Notification';
      
      const options = {
        body: payload.body || '',
        icon: payload.icon || '/favicon.svg',
        badge: payload.badge || '/favicon.svg',
        data: payload.data || {},
        vibrate: [100, 50, 100],
        actions: [
          { action: 'open', title: 'Open App' }
        ]
      };

      event.waitUntil(
        self.registration.showNotification(title, options)
      );
    } catch (err) {
      console.error('[Service Worker] Error displaying push notification:', err);
      
      // Fallback display if not valid JSON
      event.waitUntil(
        self.registration.showNotification('HomeTutorX Alert', {
          body: event.data.text(),
          icon: '/favicon.svg',
          badge: '/favicon.svg'
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // URL to navigate to (dashboard URL sent in the notification data)
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Focus the browser window if already open
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
