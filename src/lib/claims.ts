import { getIdTokenResult, type User } from 'firebase/auth';
import type { UserRole } from '../types';

/**
 * Role resolution from Firebase Auth custom claims.
 *
 * Custom claims are the single source of truth for authorisation. Firestore
 * rules already read `request.auth.token.role` / `token.admin`; the client must
 * do the same so the UI can never show privileges the backend will not grant.
 *
 * Claim values written by the `setCustomRole` function:
 *   { role: 'learner' | 'teacher' | 'admin' }
 * `admin: true` is also honoured for backwards compatibility with the
 * bootstrap/migration script.
 */
export function roleFromClaims(claims: Record<string, unknown> | undefined): UserRole {
  if (!claims) return 'student';
  if (claims.admin === true) return 'admin';
  const role = claims.role;
  if (role === 'admin') return 'admin';
  if (role === 'teacher' || role === 'lecturer') return 'lecturer';
  return 'student';
}

/**
 * Read the current user's role from their ID token.
 * Pass `forceRefresh` after a role change so the new claim is picked up
 * without waiting for the token's natural one-hour refresh.
 */
export async function resolveClaimRole(user: User, forceRefresh = false): Promise<UserRole> {
  try {
    const token = await getIdTokenResult(user, forceRefresh);
    return roleFromClaims(token.claims as Record<string, unknown>);
  } catch {
    // Fail closed: an unreadable token must never yield elevated UI.
    return 'student';
  }
}
