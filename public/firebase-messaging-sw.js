// Firebase Cloud Messaging Service Worker
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js")

const firebase = self.firebase // Declare the firebase variable

firebase.initializeApp({
  apiKey: "AIzaSyDfVN8K5xKxKxKxKxKxKxKxKxKxKxKxKx",
  authDomain: "listadecompras-2b500.firebaseapp.com",
  projectId: "listadecompras-2b500",
  storageBucket: "listadecompras-2b500.firebasestorage.app",
  messagingSenderId: "323731372738",
  appId: "1:323731372738:web:20e5b989a7bfb61ccf995b",
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload)

  const notificationTitle = payload.notification.title || "Lista Atualizada"
  const notificationOptions = {
    body: payload.notification.body || "Há novidades na sua lista de compras",
    icon: "/icon-light-32x32.png",
    badge: "/icon-light-32x32.png",
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
