// ============================================================
// Connect8 — Firebase Cloud Messaging Service Worker
// Presne tento názov súboru ("firebase-messaging-sw.js") a presne
// v koreňovom priečinku vyžaduje Firebase - nedá sa premenovať ani
// presunúť inam. Stará sa o zobrazenie upozornenia (napr. na
// prichádzajúci hovor), keď appka nie je práve otvorená na obrazovke.
// ============================================================

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Rovnaký firebaseConfig ako v index.html.
firebase.initializeApp({
  apiKey: "AIzaSyBTLKbFEj9mSd0f9l8VeXnD0Um0WfaAm0A",
  authDomain: "connect-c31fa.firebaseapp.com",
  databaseURL: "https://connect-c31fa-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "connect-c31fa",
  storageBucket: "connect-c31fa.firebasestorage.app",
  messagingSenderId: "22359231041",
  appId: "1:22359231041:web:6e27fab2f76c6f18b714c0"
});

const messaging = firebase.messaging();

// Keď príde push a appka NIE JE otvorená (alebo je na pozadí), toto
// zobrazí systémové upozornenie - presne to, čo má telefón "zobudiť".
messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = data.title || (payload.notification && payload.notification.title) || 'Connect8';
  const body = data.body || (payload.notification && payload.notification.body) || '';
  const options = {
    body,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: data.tag || 'connect8-notification',
    data: data, // napr. { type:'call', callId:'...' } - použije sa nižšie pri kliknutí
    requireInteraction: data.type === 'call' // hovor nezmizne samo, kým naň nezareaguješ
  };
  self.registration.showNotification(title, options);
});

// Klik na upozornenie (napr. "Prijať") - otvorí/zameria appku.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = self.registration.scope + 'index.html' + (data.callId ? ('#call=' + data.callId) : '');

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(targetUrl);
          return;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
