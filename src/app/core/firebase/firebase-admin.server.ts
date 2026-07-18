import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Exported (not just used internally) so any server-only entry point that
// needs the Admin SDK - the app itself, or standalone scripts like
// scripts/seed.ts - shares this one safe, idempotent initializer instead of
// each hand-rolling its own initializeApp() call.
export function getAdminApp(): App {
  if (getApps().length) return getApps()[0]!;

  return initializeApp({
    credential: cert({
      projectId: process.env['FIREBASE_PROJECT_ID'],
      clientEmail: process.env['FIREBASE_CLIENT_EMAIL'],
      privateKey: process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = getAuth(getAdminApp());
export const adminDb = getFirestore(getAdminApp());
