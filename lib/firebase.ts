import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore"
import { getMessaging, isSupported } from "firebase/messaging"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDfVN8K5xKxKxKxKxKxKxKxKxKxKxKxKx",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "listadecompras-2b500.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "listadecompras-2b500",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "listadecompras-2b500.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "323731372738",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:323731372738:web:20e5b989a7bfb61ccf995b",
}

// Initialize Firebase (singleton pattern)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)
export const db = getFirestore(app)

// Enable offline persistence
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.")
    } else if (err.code === "unimplemented") {
      console.warn("The current browser does not support offline persistence")
    }
  })
}

// Initialize messaging (only on client side and if supported)
export const getMessagingInstance = async () => {
  if (typeof window !== "undefined" && (await isSupported())) {
    return getMessaging(app)
  }
  return null
}
