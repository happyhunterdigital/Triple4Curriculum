/**
 * Removes QA test accounts created during end-to-end checks: any Auth user
 * whose email ends with @triple4c-test.example, plus their Firestore docs
 * (users, students, teacher_applications, payments) and registration uploads.
 *
 * Run via the "Cleanup QA accounts" workflow (uses the CI service account).
 */
import admin from 'firebase-admin';

const project = process.env.GCP_PROJECT || 'triple4curriculum';
const DOMAIN = '@triple4c-test.example';

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    projectId: project,
    storageBucket: `${project}.firebasestorage.app`,
  });
} else {
  admin.initializeApp({ projectId: project });
}

const auth = admin.auth();
const db = admin.firestore();
const bucket = admin.storage().bucket();

let matched = 0;
let pageToken;
do {
  const page = await auth.listUsers(1000, pageToken);
  pageToken = page.pageToken;
  for (const user of page.users) {
    if (!user.email || !user.email.endsWith(DOMAIN)) continue;
    matched++;
    const uid = user.uid;
    console.log(`- cleanup ${user.email}`);

    for (const coll of ['users', 'students', 'teacher_applications']) {
      await db.doc(`${coll}/${uid}`).delete().catch(() => {});
    }
    const pays = await db.collection('payments').where('uid', '==', uid).get().catch(() => null);
    for (const doc of pays?.docs ?? []) await doc.ref.delete().catch(() => {});

    const [files] = await bucket.getFiles({ prefix: `registrations/${uid}/` }).catch(() => [[]]);
    for (const f of files || []) await f.delete().catch(() => {});

    await auth.deleteUser(uid).catch((e) => console.error(`  auth delete failed: ${e.message}`));
  }
} while (pageToken);

console.log(`Done. removed=${matched}`);
