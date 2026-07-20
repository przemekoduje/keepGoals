import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY;

let appInstance: any = null;
let authInstance: any = null;

if (!isDemoMode) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  appInstance = initializeApp(firebaseConfig);
  authInstance = getAuth(appInstance);
} else {
  console.warn("Uruchomiono w trybie DEMO (brak kluczy Firebase).");
  authInstance = {
    currentUser: null,
  };
}

export const auth = authInstance;

export function setDemoCurrentUser(user: any) {
  if (isDemoMode) {
    auth.currentUser = user;
  }
}

