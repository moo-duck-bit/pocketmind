if ('serviceWorker' in navigator) {
  navigator.serviceWorker
      .register("/firebase-messaging-sw.js").then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
          console.error('Service Worker registration failed:', error);
      });
}

self.addEventListener("install", function (e) {
  console.log("fcm sw install..");
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  console.log("fcm sw activate..");
});

self.addEventListener("push", function (e) {
  if (!e.data.json()) return;

  const resultData = e.data.json().notification;
  const notificationTitle = resultData.title;
  const notificationOptions = {
    body: resultData.body,
    icon: resultData.image,
    tag: resultData.tag,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


self.addEventListener("notificationclick", function (event) {
  console.log("notification click");
  const url = "/";
  event.notification.close();
  event.waitUntil(clients.openWindow(url));
});
