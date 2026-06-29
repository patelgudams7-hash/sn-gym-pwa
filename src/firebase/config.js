// ─── Firebase Configuration ───────────────────────────────────────────────────
// Go to: https://console.firebase.google.com → Your project → Project Settings → SDK config

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCKF6lqxredffW2qPOFWhlSyVtSU5zMpBw",
  authDomain: "sn-gym-c719e.firebaseapp.com",
  projectId: "sn-gym-c719e",
  storageBucket: "sn-gym-c719e.firebasestorage.app",
  messagingSenderId: "973651961090",
  appId: "1:973651961090:web:e68fa5d36ccd0a2996ce1b"
};

const app = initializeApp(firebaseConfig);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ─── Firestore ────────────────────────────────────────────────────────────────
export const db = getFirestore(app);

// ─── Storage (profile photos, future use) ────────────────────────────────────
export const storage = getStorage(app);

export default app;
