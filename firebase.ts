
// Fix: Use namespace imports for Firebase modular SDK to resolve "no exported member" errors in some TS environments
import * as firebaseApp from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "project-7549b.firebaseapp.com",
  projectId: "project-7549b",
  storageBucket: "project-7549b.firebasestorage.app",
  messagingSenderId: "518691326642",
  appId: "1:518691326642:web:d8443c28c92f5df03717ab",
  measurementId: "G-6VJKVR01N6"
};

// Access initialization functions from the namespace to bypass resolution issues
const { initializeApp, getApps, getApp } = firebaseApp as any;

// Initialize Firebase App
let app;
try {
  const apps = getApps();
  app = !apps.length ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.error("Firebase App initialization failed:", e);
}

// Initialize Firestore safely
let firestoreInstance: Firestore | null = null;
let firestoreAvailable = false;

if (app) {
  try {
    firestoreInstance = getFirestore(app);
    firestoreAvailable = true;
  } catch (e) {
    console.warn("Firestore service is not available in this environment. Falling back to local data.");
  }
}

export const db = firestoreInstance;
export const isFirestoreAvailable = firestoreAvailable;
