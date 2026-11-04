/**
 * Retitle timetable slots in bulk.
 *
 * Exists because the original set-meet-slot defaults wrote placeholder slots
 * with courseCode "LIVE" and title "T4C Live Classroom", which read like a live
 * status on the learner timetable.
 *
 * Usage:
 *   MATCH_CODE=LIVE NEW_CODE=T4C NEW_TITLE="T4C Classroom" node scripts/retitle-slot.mjs
 *   DRY_RUN=1 MATCH_CODE=LIVE node scripts/retitle-slot.mjs
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

const db = admin.firestore();

const matchCode = (process.env.MATCH_CODE || '').trim().toUpperCase();
const newCode = (process.env.NEW_CODE || '').trim().toUpperCase();
const newTitle = (process.env.NEW_TITLE || '').trim();
const dryRun = process.env.DRY_RUN === '1';

if (!matchCode) throw new Error('Set MATCH_CODE=<existing course code>');
if (!newCode && !newTitle) throw new Error('Set NEW_CODE and/or NEW_TITLE');

const snap = await db.collection('timetable').get();
const matches = snap.docs.filter(
  (d) => String(d.data().courseCode || '').toUpperCase() === matchCode,
);

if (matches.length === 0) {
  const codes = [...new Set(snap.docs.map((d) => d.data().courseCode).filter(Boolean))];
  console.log(`No slots with courseCode "${matchCode}". Existing codes: ${codes.join(', ')}`);
  process.exit(0);
}

for (const doc of matches) {
  const data = doc.data();
  const patch = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
  if (newCode) patch.courseCode = newCode;
  if (newTitle) patch.courseTitle = newTitle;

  console.log(
    `${dryRun ? '[dry] ' : ''}${doc.id}: ${data.dayOfWeek} ${data.startTime}-${data.endTime} ` +
      `"${data.courseCode}" / "${data.courseTitle}" -> "${patch.courseCode || data.courseCode}" / "${patch.courseTitle || data.courseTitle}"`,
  );

  if (!dryRun) await doc.ref.update(patch);
}

console.log(dryRun ? `${matches.length} slot(s) would be updated.` : `Updated ${matches.length} slot(s).`);
process.exit(0);
