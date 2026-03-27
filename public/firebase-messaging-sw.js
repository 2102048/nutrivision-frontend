/* eslint-disable no-undef */

importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

// ✅ Prevent duplicate notifications
let lastNotification = null;

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message:", payload);

  const title = payload.notification?.title;
  const body = payload.notification?.body;

  const currentNotification = `${title}-${body}`;

  // ❌ Skip duplicate
  if (lastNotification === currentNotification) return;

  lastNotification = currentNotification;

  self.registration.showNotification(title, {
    body: body,
    icon: "/logo192.png",
  });
});