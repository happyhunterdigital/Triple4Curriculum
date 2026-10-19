/**
 * Set Firebase Auth custom claims from Firestore users/{uid}.role docs.
 * Required once after Phase 0 rules go claims-only — without it, existing
 * users have no `role` claim and isStaff()/isAdmin() deny them.
 *
 * Usage:
 *   FIREBASE_SERVICE_ACCOUNT_JSON='{...}' node scripts/set-claims.mjs           # everyone
 *   FIREBASE_SERVICE_ACCOUNT_JSON='{...}' node scripts/set-claims.mjs uid1 uid2 # specific uids
 *   DRY_RUN=1 FIREBASE_SERVICE_ACCOUNT_JSON='{...}' node scripts/set-claims.mjs # preview only
 *
 * Stored role (learner/teacher/admin) -> claim { role: 'teacher'|'admin' }.
 * 'learner' claims are set too (role: 'learner') so rules can distinguish
 * signed-in-but-unprovisioned users from provisioned learners.
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
const dryRun = process.env.DRY_RUN === '1';
const only = process.argv.slice(2);

function claimForRole(stored) {
  if (stored === 'teacher' || stored === 'lecturer') return { role: 'teacher' };
  if (stored === 'admin') return { role: 'admin', admin: true };
  if (stored === 'learner' || stored === 'student') return { role: 'learner' };
  return null; // unknown role -> leave claims untouched
}

let setCount = 0;
let skipped = 0;
let failed = 0;

const snap = await db.collection('users').get();
console.log(`Found ${snap.size} users/${only.length ? ` (filtered to ${only.join(', ')})` : ''}`);

for (const doc of snap.docs) {
  const uid = doc.id;
  if (only.length && !only.includes(uid)) continue;
  const stored = doc.data().role;
  const claim = claimForRole(stored);
  if (!claim) {
    console.log(`- ${uid}: unknown role "${stored}" — SKIPPED`);
    skipped++;
    continue;
  }
  if (dryRun) {
    console.log(`- [dry-run] ${uid}: would set ${JSON.stringify(claim)}`);
    setCount++;
    continue;
  }
  try {
    const user = await auth.getUser(uid);
    const current = user.customClaims?.role;
    if (current === claim.role && (claim.admin === undefined || user.customClaims.admin === true)) {
      console.log(`- ${uid}: already ${claim.role} — unchanged`);
      skipped++;
      continue;
    }
    await auth.setCustomUserClaims(uid, { ...(user.customClaims || {}), ...claim });
    console.log(`- ${uid}: set ${JSON.stringify(claim)}`);
    setCount++;
  } catch (e) {
    console.error(`- ${uid}: FAILED — ${e.message}`);
    failed++;
  }
}

console.log(`\nDone. set=${setCount} skipped=${skipped} failed=${failed}${dryRun ? ' (dry run)' : ''}`);
console.log('Users must sign out/in (or wait for token refresh ~1h) to pick up new claims.');
process.exit(failed > 0 ? 1 : 0);
