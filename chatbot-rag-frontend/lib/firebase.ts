import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredConfigKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'appId',
] as const;

function hasRequiredFirebaseConfig() {
  return requiredConfigKeys.every((key) => {
    const value = firebaseConfig[key];
    return typeof value === 'string' && value.trim().length > 0;
  });
}

let warnedMissingConfig = false;

function warnMissingConfigOnce() {
  if (warnedMissingConfig || typeof window === 'undefined') {
    return;
  }

  warnedMissingConfig = true;
  console.warn(
    'Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables in Vercel project settings.'
  );
}

export const isFirebaseConfigured = hasRequiredFirebaseConfig();

let appInstance: ReturnType<typeof initializeApp> | null = null;

function getFirebaseApp() {
  if (!isFirebaseConfigured) {
    warnMissingConfigOnce();
    return null;
  }

  if (!appInstance) {
    appInstance = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }

  return appInstance;
}

export function getFirebaseAuth() {
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  return getAuth(app);
}

export function getFirestoreDb() {
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  return getFirestore(app);
}