import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

// NOTE: this module touches `window`/IndexedDB as a side effect of
// getAuth()/getFirestore() in some Firebase SDK versions. It must never be
// imported by server-rendered code paths - only from within a browser guard
// (isPlatformBrowser check or afterNextRender). See auth.service.ts.
const firebaseConfig = environment.firebaseConfig;

let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

export function getClientAuth(): Auth {
  if (!cachedAuth) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    cachedAuth = getAuth(app);
  }
  return cachedAuth;
}

export function getClientDb(): Firestore {
  if (!cachedDb) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    cachedDb = getFirestore(app);
  }
  return cachedDb;
}
