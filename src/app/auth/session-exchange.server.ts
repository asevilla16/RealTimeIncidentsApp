import type { Request, Response } from 'express';
import { adminAuth, adminDb } from '../core/firebase/firebase-admin.server';

// const SESSION_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
const SESSION_EXPIRES_IN_MS = 1 * 24 * 60 * 60 * 1000; // 1 day

export async function verifySessionExchange(req: Request, res: Response) {
  const { idToken } = req.body ?? {};

  if (typeof idToken !== 'string') {
    res.status(400).json({ error: 'Missing idToken' });
    return;
  }

  try {
    // Rejects a forged or expired token before a session is ever minted.
    const decoded = await adminAuth.verifyIdToken(idToken);
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    });

    const profileRef = adminDb.collection('profiles').doc(decoded.uid);
    const profile = await profileRef.get();
    let data = profile.data();

    // First sign-in via a provider that never went through scripts/seed.ts
    // (e.g. Google) has no profiles doc yet - backfill it from the ID
    // token's name claim so name isn't lost on the next page load.
    if (!data && typeof decoded['name'] === 'string') {
      data = { name: decoded['name'] };
      await profileRef.set(data, { merge: true });
    }

    res.cookie('session', sessionCookie, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      maxAge: SESSION_EXPIRES_IN_MS,
      path: '/',
    });
    res.json({
      status: 'ok',
      name: data?.['name'] ?? '',
    });
  } catch {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}
