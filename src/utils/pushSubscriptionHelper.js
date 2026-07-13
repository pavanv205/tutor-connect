import api from '../services/api';

// Helper to convert base64 VAPID public key to Uint8Array for PushManager subscription format
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush() {
  // 1. Verify Browser Support for Service Worker and Push Messaging
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[PUSH SERVICE] Web Push messaging is not supported in this browser.');
    return;
  }

  try {
    // 2. Register Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('[PUSH SERVICE] Service Worker registered scope:', registration.scope);

    // 3. Request Notification Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[PUSH SERVICE] Push Notification permission not granted.');
      return;
    }

    // 4. Fetch VAPID Public Key from Backend
    const keyRes = await api.get('/notifications/vapid-public-key');
    if (!keyRes.data || !keyRes.data.publicKey) {
      throw new Error('VAPID public key not returned by push server.');
    }
    const publicVapidKey = keyRes.data.publicKey;

    // 5. Check if subscription already exists
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // 6. Subscribe via PushManager
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
      console.log('[PUSH SERVICE] New push subscription registered with browser Push Service.');
    }

    // 7. Post Subscription details to Backend
    await api.post('/notifications/subscribe', subscription);
    console.log('[PUSH SERVICE] Web Push credentials successfully saved to user database.');
  } catch (err) {
    console.error('[PUSH SERVICE] Failed to subscribe client to Web Push:', err);
  }
}
