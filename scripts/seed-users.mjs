/**
 * Create demo Auth users + Firestore profiles + custom claims.
 * Gives the demo site working logins without hand-creating accounts.
 *
 * Demo credentials are PUBLIC by design (documented in README). Rotate by
 * re-running with a different DEMO_PASSWORD, or delete the users in console.
 *
 * Usage (CI seed workflow or local):
 *   FIREBASE_SERVICE_ACCOUNT_JSON='...' DEMO_PASSWORD='...' bun scripts/seed-users.mjs
 */
import admin from 'firebase-admin';

const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (svcJson) {
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(svcJson)) });
} else {
  admin.initializeApp();
}

const password = process.env.DEMO_PASSWORD;
if (!password || password.length < 8) {
  console.error('DEMO_PASSWORD env (min 8 chars) is required. Refusing to create users.');
  process.exit(1);
}

const DEMO_USERS = [
  { email: 'student@triple4c.demo', name: 'Sarah Khumalo (Demo)', role: 'learner', claims: { role: 'learner' } },
  { email: 'lecturer@triple4c.demo', name: 'Dr. Arthur Vance (Demo)', role: 'teacher', claims: { role: 'teacher' } },
  { email: 'admin@triple4c.demo', name: 'Dean Margaret Edwards (Demo)', role: 'admin', claims: { role: 'admin', admin: true } },
];

const db = admin.firestore();

for (const demo of DEMO_USERS) {
  let user;
  try {
    user = await admin.auth().getUserByEmail(demo.email);
    await admin.auth().updateUser(user.uid, { password, displayName: demo.name });
    console.log(`- ${demo.email}: password rotated`);
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      user = await admin.auth().createUser({ email: demo.email, password, displayName: demo.name, emailVerified: true });
      console.log(`- ${demo.email}: created`);
    } else {
      throw e;
    }
  }
  await admin.auth().setCustomUserClaims(user.uid, demo.claims);
  await db.collection('users').doc(user.uid).set({
    uid: user.uid,
    name: demo.name,
    email: demo.email,
    role: demo.role,
    departmentId: 'dept_cs',
    departmentName: 'Department of Computing & Applied AI',
    privacyPolicyAccepted: true,
    codeOfConductAccepted: true,
    demoAccount: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

console.log('Demo users ready (see README for credentials).');
process.exit(0);
