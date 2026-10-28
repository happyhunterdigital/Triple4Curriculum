/**
 * Attendance thank-you notes.
 *
 * The platform records attendance when a learner joins a live class from the
 * timetable/Classroom page. Every day at 18:00 (Africa/Johannesburg) this job
 * groups that day's "Present" records per learner, sends one thank-you email
 * via Resend (when RESEND_API_KEY is configured) and writes an in-app
 * notification. Attendance documents are marked with `thanksSentAt` so no
 * learner is thanked twice for the same session.
 *
 * Note: this uses the platform's join attendance, not Google Meet's participant
 * API (Meet only exposes participant data for meetings created by the API app).
 */
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/logger';

const RESEND_SECRET = 'RESEND_API_KEY';
const REGION = 'europe-west1';

function saudiDate(date = new Date()): string {
  // en-CA renders YYYY-MM-DD; Johannesburg matches the school's local day.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(date);
}

function stamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 16);
}

interface SessionGroup {
  name: string;
  courses: string[];
  attendanceIds: string[];
}

interface ThanksSummary {
  date: string;
  students: number;
  emailsSent: number;
  notifications: number;
  skippedNoEmail: number;
  emailConfigured: boolean;
  dryRun: boolean;
}

async function sendThanks(date: string, dryRun: boolean): Promise<ThanksSummary> {
  const db = getFirestore();
  const snap = await db.collection('attendance').where('date', '==', date).get();

  const groups = new Map<string, SessionGroup>();
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.thanksSentAt) continue;
    if (String(data.status || '').toLowerCase() !== 'present') continue;

    const uid = String(data.studentId || '');
    if (!uid) continue;

    const group = groups.get(uid) || {
      name: String(data.studentName || 'Learner'),
      courses: [],
      attendanceIds: [],
    };
    const course = String(data.courseCode || data.courseTitle || 'your live class');
    if (!group.courses.includes(course)) group.courses.push(course);
    group.attendanceIds.push(doc.id);
    groups.set(uid, group);
  }

  const apiKey = process.env[RESEND_SECRET] || '';
  const summary: ThanksSummary = {
    date,
    students: groups.size,
    emailsSent: 0,
    notifications: 0,
    skippedNoEmail: 0,
    emailConfigured: Boolean(apiKey),
    dryRun,
  };

  if (groups.size === 0) return summary;
  if (!apiKey) {
    logger.warn('sendAttendanceThanks: RESEND_API_KEY missing — nothing marked, will retry when configured');
    return summary;
  }

  for (const [uid, group] of groups) {
    let email = '';
    let name = group.name;
    for (const collection of ['students', 'users', 'teachers']) {
      const profile = await db.doc(`${collection}/${uid}`).get();
      if (!profile.exists) continue;
      const data = profile.data() || {};
      if (data.email) {
        email = String(data.email);
        name = String(data.name || name);
        break;
      }
    }

    if (!email) {
      summary.skippedNoEmail += 1;
      continue;
    }

    const coursesText = group.courses.join(', ');
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Triple 4C <noreply@triple4c.com>',
          to: [email],
          subject: 'Thank you for attending today',
          html: `
            <div style="font-family:Arial,sans-serif;color:#1a1c1e;line-height:1.6">
              <p>Hi ${name},</p>
              <p>Thank you for attending <strong>${coursesText}</strong> today. Your presence and participation
              are what make a 16-learner class work.</p>
              <p>Keep the momentum going: your notes and recordings are in the T4C Classroom, and tomorrow's
              timetable is already on your dashboard.</p>
              <p style="margin-top:24px">Warm regards,<br/>The Triple 4C teaching team</p>
              <p style="font-size:12px;color:#6b7280;margin-top:24px">Triple 4 Curriculum · 178 Daisy Street, Sandton ·
              <a href="https://triple4c.com">triple4c.com</a></p>
            </div>`,
        }),
      });
      if (res.ok) summary.emailsSent += 1;
      else logger.warn('sendAttendanceThanks: Resend rejected email', { uid, status: res.status });
    } catch (e) {
      logger.error('sendAttendanceThanks: email failed', { uid, error: String(e) });
    }

    if (!dryRun) {
      await db.collection('notifications').add({
        recipientRole: 'student',
        recipientId: uid,
        title: 'Thank you for attending',
        message: `Thanks for joining ${coursesText} today. Keep it up!`,
        category: 'academic',
        timestamp: stamp(),
        read: false,
        actionUrl: '/attendance',
        createdAt: FieldValue.serverTimestamp(),
      });
      summary.notifications += 1;

      const batch = db.batch();
      for (const id of group.attendanceIds) {
        batch.update(db.doc(`attendance/${id}`), { thanksSentAt: FieldValue.serverTimestamp() });
      }
      await batch.commit();
    }
  }

  await db.collection('audit_logs').add({
    userId: 'system',
    action: 'ATTENDANCE_THANKS_SENT',
    resource: '/attendance',
    details: `${summary.students} learner(s), ${summary.emailsSent} email(s), ${summary.notifications} notification(s) for ${date}.`,
    status: 'SUCCESS',
    timestamp: stamp(),
    createdAt: FieldValue.serverTimestamp(),
  });

  return summary;
}

/** Daily at 18:00 South African time. */
export const sendAttendanceThanks = onSchedule(
  {
    schedule: '0 18 * * *',
    timeZone: 'Africa/Johannesburg',
    region: REGION,
    secrets: [RESEND_SECRET],
  },
  async () => {
    const date = saudiDate();
    const summary = await sendThanks(date, false);
    logger.info('sendAttendanceThanks complete', summary);
  },
);

/** Staff trigger for testing or a manual re-run (optional date YYYY-MM-DD). */
export const sendAttendanceThanksNow = onCall(
  { region: REGION, secrets: [RESEND_SECRET] },
  async (request) => {
    const token = (request.auth?.token ?? {}) as Record<string, unknown>;
    const role = String(token.role ?? '');
    if (!request.auth || (role !== 'admin' && role !== 'teacher' && role !== 'lecturer' && token.admin !== true)) {
      throw new HttpsError('permission-denied', 'Staff only.');
    }
    const payload = (request.data ?? {}) as { date?: string; dryRun?: boolean };
    const date = /^\d{4}-\d{2}-\d{2}$/.test(payload.date || '') ? String(payload.date) : saudiDate();
    return sendThanks(date, Boolean(payload.dryRun));
  },
);
