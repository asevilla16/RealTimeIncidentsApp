import { REQUEST, provideAppInitializer, inject, signal, TransferState } from '@angular/core';
import {
  SESSION_USER,
  SESSION_USER_KEY,
  type SessionUser,
} from '../core/models/session-user.model';
import { adminAuth, adminDb } from '../core/firebase/firebase-admin.server';

function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.split('; ').find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

export function provideServerSessionUser() {
  return [
    // The signal instance itself - same token shape the client provides,
    // so every downstream service/guard/component can inject SESSION_USER
    // without caring which platform it's running on.
    { provide: SESSION_USER, useFactory: () => signal<SessionUser | null>(null) },

    provideAppInitializer(async () => {
      const request = inject(REQUEST); // Web API Request, populated by AngularNodeAppEngine
      const userSignal = inject(SESSION_USER);
      const transferState = inject(TransferState);

      const sessionCookie = parseCookie(request?.headers.get('cookie') ?? null, 'session');
      let user: SessionUser | null = null;

      if (sessionCookie) {
        try {
          // checkRevoked: true respects server-side sign-out-everywhere /
          // disabled-account actions, not just cookie expiry.
          const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
          const profile = await adminDb.collection('profiles').doc(decoded.uid).get();
          const data = profile.data();

          user = { uid: decoded.uid, email: decoded.email ?? null, name: data?.['name'] ?? '' };
        } catch {
          user = null; // expired, tampered, or revoked - render as signed out
        }
      }

      userSignal.set(user);
      // Serialized into the SSR HTML output; the client reads this exact
      // value at bootstrap instead of re-deriving auth state asynchronously -
      // this is what keeps server and client auth state identical through
      // hydration (a named hydration risk - see README).
      transferState.set(SESSION_USER_KEY, user);
    }),
  ];
}
