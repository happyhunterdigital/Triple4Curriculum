/**
 * Provision course enrolments for learners.
 *
 * Enrolments are the authorisation boundary for "my courses" and "my
 * assignments", so nothing shows on a learner dashboard until they exist.
 * Safe to re-run: the document id is deterministic (uid_courseId) and writes
 * are merged, so an existing enrolledAt is preserved.
 *
 * Usage:
 *   STUDENT_EMAIL=learner@example.com node scripts/enroll-student.mjs
 *   STUDENT_EMAIL=learner@example.com COURSE_CODES=AI-442,CSC-441 node scripts/enroll-student.mjs
 *   ALL_LEARNERS=1 node scripts/enroll-student.mjs          # backfill every learner
 *   DRY_RUN=1 STUDENT_EMAIL=... node scripts/enroll-student.mjs
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

const email = (process.env.STUDENT_EMAIL || '').trim();
const allLearners = process.env.ALL_LEARNERS === '1';
const codes = (process.env.COURSE_CODES || '')
  .split(',')
  .map((c) => c.trim().toUpperCase())
  .filter(Boolean);
const status = (process.env.STATUS || 'active').trim();
const dryRun = process.env.DRY_RUN === '1';

if (!email && !allLearners) {
  throw new Error('Set STUDENT_EMAIL=<address> or ALL_LEARNERS=1');
}
if (!['active', 'completed', 'withdrawn'].includes(status)) {
  throw new Error(`STATUS must be active|completed|withdrawn (got "${status}")`);
}

// ── catalogue ──
const courseSnap = await db.collection('courses').get();
const allCourses = courseSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
if (allCourses.length === 0) throw new Error('No courses in the catalogue to enrol into.');

const wanted = codes.length ? allCourses.filter((c) => codes.includes(String(c.code).toUpperCase())) : allCourses;
if (wanted.length === 0) {
  throw new Error(`No course matched ${codes.join(', ')}. Available: ${allCourses.map((c) => c.code).join(', ')}`);
}

// ── who ──
let learners = [];
if (allLearners) {
  const snap = await db.collection('users').where('role', '==', 'learner').get();
  learners = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
  // A learner may have a profile doc but no users/{uid}; fall back to students/.
  if (learners.length === 0) {
    const students = await db.collection('students').get();
    learners = students.docs.map((d) => ({ uid: d.id, ...d.data() }));
  }
} else {
  const user = await auth.getUserByEmail(email);
  const profile = await db.collection('users').doc(user.uid).get();
  learners = [{ uid: user.uid, ...(profile.data() || {}), email: user.email }];
}

console.log(`Courses: ${wanted.map((c) => c.code).join(', ')}`);
console.log(`Learners: ${learners.length}`);

let written = 0;
let skipped = 0;
for (const learner of learners) {
  const uid = learner.uid;
  if (!uid) continue;
  const name = learner.name || learner.studentName || learner.email || '';
  for (const course of wanted) {
    const ref = db.collection('enrollments').doc(`${uid}_${course.id}`);
    const existing = await ref.get();
    const payload = {
      studentId: uid,
      studentName: name,
      studentEmail: learner.email || '',
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      departmentId: course.departmentId || '',
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (!existing.exists) payload.enrolledAt = admin.firestore.FieldValue.serverTimestamp();

    if (dryRun) {
      console.log(`  [dry] ${name} ← ${course.code}`);
      skipped += 1;
      continue;
    }
    await ref.set(payload, { merge: true });
    written += 1;
  }
}

console.log(dryRun ? `Dry run: ${skipped} enrolments would be written.` : `Wrote ${written} enrolment docs.`);
process.exit(0);
