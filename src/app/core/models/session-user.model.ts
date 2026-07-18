import { InjectionToken, makeStateKey, type WritableSignal } from '@angular/core';

export interface SessionUser {
  uid: string;
  email: string | null;
  name: string;
}

// Lives here (not in session-init.server.ts) specifically so the browser
// bundle can import it without transitively pulling in firebase-admin,
// which is Node-only and would break the client build.
export const SESSION_USER_KEY = makeStateKey<SessionUser | null>('SESSION_USER');

// A writable signal, not a plain value: the server resolves it once (in the
// server app initializer) before render, the client seeds it from
// TransferState at bootstrap (before hydration, no flicker), and the
// AuthService keeps it live afterward via Firebase's onAuthStateChanged.
// Everything downstream (guards, layout, components) just reads this signal.
export const SESSION_USER = new InjectionToken<WritableSignal<SessionUser | null>>('SESSION_USER');
