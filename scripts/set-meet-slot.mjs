/**
 * Create or update a timetable slot with a real Google Meet link.
 *
 * The app has no in-app editor for `onlineLink` yet, so this script writes the
 * slot through the Firestore REST API using the CI service account.
 *
 * If a slot already exists for the same day + start time, only its onlineLink
 * (and room label) are updated; otherwise a new "T4C Live Classroom" slot is
 * created.
 *
 * Env: MEET_URL, DAY, START, END, COURSE_CODE, TITLE, GCP_PROJECT
 */
import { GoogleAuth } from 'google-auth-library';

const project = process.env.GCP_PROJECT || 'triple4curriculum';
const meetUrl = (process.env.MEET_URL || '').trim();
const day = (process.env.DAY || 'Monday').trim();
const start = (process.env.START || '12:00').trim();
const end = (process.env.END || '13:00').trim();
const courseCode = (process.env.COURSE_CODE || 'LIVE').trim();
const title = (process.env.TITLE || 'T4C Live Classroom').trim();

if (!meetUrl.startsWith('https://meet.google.com/')) {
  throw new Error(`MEET_URL must be a https://meet.google.com/... link (got "${meetUrl}")`);
}
if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
  throw new Error('START and END must be HH:MM');
}

const auth = new GoogleAuth({
  scopes: [
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/datastore',
  ],
});
const client = await auth.getClient();
const base = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/timetable`;

const list = await client.request({ url: `${base}?pageSize=300` });
const docs = list.data.documents || [];
const existing = docs.find(
  (d) =>
    d.fields?.dayOfWeek?.stringValue === day &&
    d.fields?.startTime?.stringValue === start,
);

function slotSummary(fields) {
  return {
    day: fields?.dayOfWeek?.stringValue,
    start: fields?.startTime?.stringValue,
    end: fields?.endTime?.stringValue,
    code: fields?.courseCode?.stringValue,
    title: fields?.courseTitle?.stringValue,
    link: fields?.onlineLink?.stringValue,
  };
}

if (existing) {
  const id = existing.name.split('/').pop();
  const res = await client.request({
    url: `${base}/${id}?updateMask.fieldPaths=onlineLink&updateMask.fieldPaths=room`,
    method: 'PATCH',
    data: {
      fields: {
        onlineLink: { stringValue: meetUrl },
        room: { stringValue: 'Google Meet' },
      },
    },
  });
  console.log(`updated existing slot ${id}`);
  console.log(JSON.stringify(slotSummary(res.data.fields), null, 2));
} else {
  const data = {
    fields: {
      courseId: { stringValue: '' },
      courseCode: { stringValue: courseCode },
      courseTitle: { stringValue: title },
      lecturerName: { stringValue: 'T4C Teacher' },
      lecturerId: { stringValue: '' },
      dayOfWeek: { stringValue: day },
      startTime: { stringValue: start },
      endTime: { stringValue: end },
      room: { stringValue: 'Google Meet' },
      type: { stringValue: 'Lecture' },
      departmentId: { stringValue: '' },
      onlineLink: { stringValue: meetUrl },
      createdAt: { timestampValue: new Date().toISOString() },
    },
  };
  const res = await client.request({ url: base, method: 'POST', data });
  console.log(`created slot ${res.data.name.split('/').pop()}`);
  console.log(JSON.stringify(slotSummary(res.data.fields), null, 2));
}

console.log(`\nMeet link is now on the ${day} ${start} slot and will show on /timetable and /classroom.`);
