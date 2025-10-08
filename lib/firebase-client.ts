import type { FirebaseApp } from "firebase/app"
import type { Auth } from "firebase/auth"
import type { Firestore } from "firebase/firestore"

// Firebase konfiguratsiyasi
const firebaseConfig = {
  apiKey: "AIzaSyDO23OTfjzwL7Lrxq6OeruTf8L8rHCWHJQ",
  authDomain: "testlar-ab173.firebaseapp.com",
  projectId: "testlar-ab173",
  storageBucket: "testlar-ab173.firebasestorage.app",
  messagingSenderId: "841828039591",
  appId: "1:841828039591:web:0eb9dba44a86bf30125482",
  measurementId: "G-YV319531GK",
}

let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null

export const initializeFirebaseClient = async () => {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized on the client side")
  }

  if (!app) {
    const { initializeApp, getApps } = await import("firebase/app")
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  }

  if (!authInstance) {
    const { getAuth, setPersistence, browserLocalPersistence } = await import("firebase/auth")
    authInstance = getAuth(app)

    // ✅ Bu joy muhim — foydalanuvchini refreshdan keyin ham eslab qolish uchun
    await setPersistence(authInstance, browserLocalPersistence)
  }

  if (!dbInstance) {
    const { getFirestore } = await import("firebase/firestore")
    dbInstance = getFirestore(app)
  }

  return { app, auth: authInstance, db: dbInstance }
}

export const getFirebaseAuth = async () => {
  const { auth } = await initializeFirebaseClient()
  return auth
}

export const getFirebaseDb = async () => {
  const { db } = await initializeFirebaseClient()
  return db
}
