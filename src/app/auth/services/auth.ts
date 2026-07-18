import {
  afterNextRender,
  computed,
  DestroyRef,
  inject,
  PLATFORM_ID,
  Service,
  signal,
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { getClientAuth } from '../../core/firebase/firebase-client';
import { SESSION_USER, type SessionUser } from '../../core/models/session-user.model';
import { GoogleAuthProvider, signInWithPopup /* ...existing imports... */ } from 'firebase/auth';

@Service()
export class Auth {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  // The single source of truth for "who is signed in", injected as a signal
  // token so its origin (server-verified vs client-tracked) is an
  // implementation detail every consumer is shielded from.
  private readonly sessionUser = inject(SESSION_USER);
  readonly user = computed(() => this.sessionUser());
  readonly isSignedIn = computed(() => this.sessionUser() !== null);

  readonly isPending = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    // afterNextRender + isPlatformBrowser: the double guard is deliberate.
    // isPlatformBrowser alone would still let this code register during a
    // server *evaluation* pass in some testing setups; afterNextRender
    // guarantees it only ever runs post-hydration in an actual browser,
    // which is the hydration risk this whole service exists to avoid -
    // Firebase Auth's SDK reads IndexedDB, a browser-only API that must
    // never execute during server rendering.
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => this.trackClientAuthState());
    }
  }

  private trackClientAuthState() {
    const unsubscribe = onAuthStateChanged(getClientAuth(), (firebaseUser) => {
      // This reconciles the transferred server state with Firebase's own
      // client-side persistence. They should already agree (the session
      // cookie is set immediately after this same SDK signs the user in),
      // so in practice this rarely changes what's on screen - it's a
      // safety net for cases like the cookie expiring mid-session.

      if (!firebaseUser) {
        this.sessionUser.set(null);
        return;
      }

      this.sessionUser.update((prev) => ({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: prev?.name ?? '',
      }));
    });
    this.destroyRef.onDestroy(unsubscribe);
  }

  async signIn(email: string, password: string): Promise<boolean> {
    this.isPending.set(true);
    this.error.set(null);

    try {
      const credential = await signInWithEmailAndPassword(getClientAuth(), email, password);
      const idToken = await credential.user.getIdToken();

      console.log({ credential, idToken });

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!response.ok) throw new Error('session-exchange-failed');

      const { name } = await response.json();
      this.sessionUser.set({ uid: credential.user.uid, email: credential.user.email, name });

      return true;
    } catch {
      this.error.set('Invalid email or password.');
      return false;
    } finally {
      this.isPending.set(false);
    }
  }

  async signInWithGoogle(): Promise<boolean> {
    this.isPending.set(true);
    this.error.set(null);

    try {
      const credential = await signInWithPopup(getClientAuth(), new GoogleAuthProvider());
      const idToken = await credential.user.getIdToken();
      console.log({ credential });

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!response.ok) throw new Error('session-exchange-failed');

      // const { name } = await response.json();
      this.sessionUser.set({
        uid: credential.user.uid,
        email: credential.user.email,
        name: credential.user.displayName ?? '',
      });
      return true;
    } catch {
      this.error.set('Google sign-in failed.');
      return false;
    } finally {
      this.isPending.set(false);
    }
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(getClientAuth());
    await fetch('/api/auth/session', { method: 'DELETE' });
    this.sessionUser.set(null);
  }
}
