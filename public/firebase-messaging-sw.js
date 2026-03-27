/* eslint-disable no-undef */

importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCzDfE70DkdhRSkwZEXa8kWUjr0tTvYfyM",
  authDomain: "nutrivision-7be6f.firebaseapp.com",
  projectId: "nutrivision-7be6f",
  messagingSenderId: "397403275003",
  appId: "1:397403275003:web:e5a266fd0dafe84d9d3a5e",
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