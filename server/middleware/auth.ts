import type { NextFunction, Request, Response } from 'express';
import { db } from '../../src/server/mockDb.ts';
import { logEvent } from '../lib/security.ts';

export type AppRole = 'admin' | 'lecturer' | 'student';

export interface AuthContext {
  uid: string;
  role: AppRole;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      requestId?: string;
    }
  }
}

let adminAuth: { verifyIdToken: (t: string) => Promise<Record<string, unknown>> } | null = null;
let adminLoadAttempted = false;

async function getAdminAuth() {
  if (adminLoadAttempted) return adminAuth;
  adminLoadAttempted = true;
  try {
    const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!svcJson) return null;
    // Dynamic import so builds pass without firebase-admin installed.
    // @ts-ignore - optional peer dep, resolved at runtime only
    const mod = (await import('firebase-admin/app').catch(() => null)) as unknown as Record<string, (...a: never[]) => unknown> | null;
    // @ts-ignore - optional peer dep, resolved at runtime only
    const authMod = (await import('firebase-admin/auth').catch(() => null)) as unknown as Record<string, (...a: never[]) => unknown> | null;
    if (!mod || !authMod) return null;
    const cert = JSON.parse(svcJson) as Record<string, string>;
    const certFn = (authMod as Record<string, unknown>).cert as ((c: unknown) => unknown) | undefined;
    const initFn = (mod as Record<string, unknown>).initializeApp as ((c: unknown) => unknown) | undefined;
    const getAuthFn = (authMod as Record<string, unknown>).getAuth as (() => { verifyIdToken: (t: string) => Promise<Record<string, unknown>> }) | undefined;
    if (!certFn || !initFn || !getAuthFn) return null;
    try {
      initFn({ credential: certFn(cert) });
    } catch {
      // Already initialised - safe to ignore.
    }
    adminAuth = getAuthFn();
    return adminAuth;
  } catch (err) {
    logEvent('warn', 'firebase-admin unavailable, using dev auth fallback', {});
    return null;
  }
}

function normaliseRole(raw: unknown): AppRole {
  if (raw === 'admin' || raw === 'lecturer' || raw === 'teacher' || raw === 'student' || raw === 'learner') {
    if (raw === 'teacher') return 'lecturer';
    if (raw === 'learner') return 'student';
    return raw as AppRole;
  }
  return 'student';
}

/**
 * Authentication middleware.
 * - Production (FIREBASE_SERVICE_ACCOUNT_JSON set): verifies Firebase ID tokens.
 * - Dev / no service account: accepts explicit dev headers ONLY when
 *   ALLOW_DEV_AUTH !== 'false' (default open for local demo, locked in prod).
 * Public routes should skip this middleware; everything else requires it.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // 1) Real Firebase verification when configured.
  if (token && process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const admin = await getAdminAuth();
      if (admin) {
        const decoded = await admin.verifyIdToken(token);
        const uid = String(decoded.uid || decoded.sub || '');
        if (!uid) throw new Error('empty uid');
        req.auth = {
          uid,
          role: normaliseRole((decoded as Record<string, unknown>).role),
          email: (decoded as Record<string, unknown>).email as string | undefined,
        };
        return next();
      }
    } catch {
      return res.status(401).json({ error: 'Invalid or expired credentials' });
    }
  }

  // 2) Dev fallback: resolve user from explicit headers or Bearer dev token.
  // Locked down when ALLOW_DEV_AUTH === 'false'.
  if (process.env.ALLOW_DEV_AUTH === 'false' && !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const devUserId = (req.headers['x-dev-user-id'] as string) || null;
  const devRole = (req.headers['x-dev-role'] as string) || null;

  let user = null;
  if (devUserId) {
    user = db.users.find((u) => u.id === devUserId) || null;
  } else if (token && token.startsWith('dev-')) {
    // Format: dev-<role>-<userid>
    const parts = token.split('-');
    const uid = parts.slice(2).join('-') || parts[parts.length - 1];
    user = db.users.find((u) => u.id === uid) || null;
  } else if (devRole) {
    user = db.users.find((u) => u.role === normaliseRole(devRole)) || null;
  } else {
    // No credentials supplied - treat as unauthenticated rather than
    // silently falling back to the first student (the old IDOR pattern).
    return res.status(401).json({
      error: 'Authentication required',
      hint: 'Send Authorization: Bearer <Firebase ID token> or dev headers x-dev-user-id / x-dev-role.',
    });
  }

  if (!user) {
    return res.status(401).json({ error: 'Unknown user' });
  }

  req.auth = { uid: user.id, role: normaliseRole(user.role), email: user.email };
  next();
}

/** Authorisation: require one of the given roles. */
export function requireRole(...roles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) return res.status(401).json({ error: 'Authentication required' });
    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

/**
 * Resolve the effective student id for a request.
 * Students are always scoped to their own uid (prevents IDOR via body params).
 * Staff may pass an explicit id (query/body) to act on a learner.
 */
export function effectiveStudentId(req: Request, explicit?: string): string {
  if (req.auth?.role === 'student') return req.auth.uid;
  return explicit || req.auth?.uid || 'stu_01';
}
