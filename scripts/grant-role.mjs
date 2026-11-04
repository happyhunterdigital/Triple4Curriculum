/**
 * Grant or revoke a staff role for an existing account.
 *
 * Mirrors scripts/set-claims.mjs for a single user: writes users/{uid}.role and
 * sets the same value as a custom claim, which is what firestore.rules and the
 * app read (claims are authoritative; the profile doc is display-only).
 *
 * Usage:
 *   ROLE=teacher EMAIL=teacher@example.com node scripts/grant-role.mjs
 *   ROLE=learner EMAIL=someone@example.com node scripts/grant-role.mjs   # revoke staff
 *   DRY_RUN=1 ROLE=teacher EMAIL=... node scripts/grant-role.mjs
 *
 * Auth: GOOGLE_APPLICATION_CREDENTIALS (CI service account) or ADC.
 */
import admin from 'firebase-admin';

const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (svcJson) {
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(svcJson)) });
} else {
  admin.initializeApp();
}

const auth = admin.auth();
const db = admin.firestore();

const email = (process.env.EMAIL || '').trim();
const role = (process.env.ROLE || '').trim();
const dryRun = process.env.DRY_RUN === '1';

if (!email) throw new Error('Set EMAIL=<address>');
if (!['learner', 'teacher', 'admin'].includes(role)) {
  throw new Error(`ROLE must be learner|teacher|admin (got "${role}")`);
}

const user = await auth.getUserByEmail(email);
console.log(`${email} → ${user.uid}`);
console.log(`before: claims=${JSON.stringify(user.customClaims || {})}`);

if (dryRun) {
  console.log(`[dry] would set role=${role}`);
  process.exit(0);
}

// Claim shape matches what firestore.rules checks: role == 'teacher' | 'admin'.
// Learners keep an explicit 'learner' claim so rules can tell provisioned
// learners from unprovisioned accounts.
await auth.setCustomUserClaims(user.uid, { role });
await db.collection('users').doc(user.uid).set(
  { role, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
  { merge: true },
);

console.log(`after: role=${role} (users/${user.uid} updated)`);
console.log('The user must sign out and back in (or wait for the token refresh) for the claim to apply.');
process.exit(0);
