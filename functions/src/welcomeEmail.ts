/**
 * Welcome emails on registration.
 *
 * Fires when a learner profile (students/{uid}) or a teacher application
 * (teacher_applications/{uid}) is created by the onboarding flow, and sends a
 * branded welcome email via Resend from noreply@triple4c.com.
 *
 * Email delivery is best-effort: if RESEND_API_KEY is missing or the sending
 * domain is not yet verified, the failure is logged and the learner keeps their
 * account (Firebase Auth's own verification email, sent client-side, is the
 * guaranteed transactional mail). Staff can re-send with sendWelcomeEmailNow.
 */
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/logger';

const RESEND_SECRET = 'RESEND_API_KEY';
const REGION = 'europe-west1';

const COMMON_FOOTER = `
  <p style="margin-top:24px">Warm regards,<br/>The Triple 4C teaching team</p>
  <p style="font-size:12px;color:#6b7280;margin-top:24px">Triple 4 Curriculum · 178 Daisy Street, Sandton ·
  <a href="https://triple4c.com">triple4c.com</a> · +27 689-758-960</p>`;

function learnerEmail(name: string): string {
  return `
    <div style="font-family:Arial,sans-serif;color:#1a1c1e;line-height:1.6">
      <p>Hi ${name},</p>
      <p>Welcome to <strong>Triple 4 Curriculum</strong> — your place is registered. Here is
      what happens next:</p>
      <ol>
        <li><strong>Verify your email</strong> using the message we sent from Firebase (check spam if you do not see it).</li>
        <li><strong>Sign in</strong> any time at <a href="https://triple4c.com/login">triple4c.com/login</a> with your email and password (or Google).</li>
        <li><strong>Open your dashboard</strong> to see the timetable, announcements and recordings. Live classes begin 13 January 2027.</li>
      </ol>
      <p>Every lesson is live, led by a certified teacher, and capped at 16 learners —
      and every lesson is recorded, so nothing is ever missed.</p>
      <p><a href="https://triple4c.com/dashboard?utm_source=email&amp;utm_medium=welcome&amp;utm_campaign=registration"
        style="display:inline-block;background:#14532d;color:#ffffff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold">Go to my dashboard</a></p>
      ${COMMON_FOOTER}
    </div>`;
}

function teacherEmail(name: string): string {
  return `
    <div style="font-family:Arial,sans-serif;color:#1a1c1e;line-height:1.6">
      <p>Hi ${name},</p>
      <p>Thank you for applying to teach with <strong>Triple 4 Curriculum</strong>.</p>
      <p>Your application is with our verification team. They review qualifications,
      documents and references within one to two school days, and will contact you
      about next steps.</p>
      <p>While you wait, you can explore the school model:
      <a href="https://triple4c.com/how-it-works?utm_source=email&amp;utm_medium=welcome&amp;utm_campaign=registration">how the 4-4-4 works</a>.</p>
      ${COMMON_FOOTER}
    </div>`;
}

async function sendWelcome(uid: string, kind: 'learner' | 'teacher'): Promise<{ sent: boolean; reason?: string }> {
  const db = getFirestore();
  const collection = kind === 'learner' ? 'students' : 'teacher_applications';
  const profile = await db.doc(`${collection}/${uid}`).get();
  if (!profile.exists) return { sent: false, reason: 'profile-not-found' };
  const data = profile.data() || {};
  const email = String(data.email || '');
  const name = String(data.name || 'there');
  if (!email) return { sent: false, reason: 'no-email' };

  const apiKey = process.env[RESEND_SECRET] || '';
  if (!apiKey) return { sent: false, reason: 'resend-not-configured' };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Triple 4C <noreply@triple4c.com>',
        to: [email],
        subject:
          kind === 'learner'
            ? 'Welcome to Triple 4 Curriculum — what happens next'
            : 'We received your Triple 4C teaching application',
        html: kind === 'learner' ? learnerEmail(name) : teacherEmail(name),
      }),
    });
    if (!res.ok) {
      logger.warn('sendWelcome: Resend rejected', { uid, kind, status: res.status });
      return { sent: false, reason: `resend-${res.status}` };
    }
  } catch (e) {
    logger.error('sendWelcome: request failed', { uid, kind, error: String(e) });
    return { sent: false, reason: 'resend-error' };
  }

  await db.collection('audit_logs').add({
    userId: 'system',
    action: 'WELCOME_EMAIL_SENT',
    resource: `${collection}/${uid}`,
    details: `${kind} welcome email sent to ${email}.`,
    status: 'SUCCESS',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    createdAt: FieldValue.serverTimestamp(),
  });
  return { sent: true };
}

const WELCOME_OPTIONS = { region: REGION, secrets: [RESEND_SECRET] };

/** Learner profile created by onboarding → welcome email. */
export const onLearnerWelcome = onDocumentCreated(
  { document: 'students/{uid}', ...WELCOME_OPTIONS },
  async (event) => {
    const uid = event.params.uid as string;
    const result = await sendWelcome(uid, 'learner');
    logger.info('learner welcome', { uid, ...result });
  },
);

/** Teacher application created by onboarding → application-received email. */
export const onTeacherWelcome = onDocumentCreated(
  { document: 'teacher_applications/{uid}', ...WELCOME_OPTIONS },
  async (event) => {
    const uid = event.params.uid as string;
    const result = await sendWelcome(uid, 'teacher');
    logger.info('teacher welcome', { uid, ...result });
  },
);

/** Staff re-send (optional kind override) for testing or when Resend was down. */
export const sendWelcomeEmailNow = onCall({ region: REGION, secrets: [RESEND_SECRET] }, async (request) => {
  const token = (request.auth?.token ?? {}) as Record<string, unknown>;
  const role = String(token.role ?? '');
  if (!request.auth || (role !== 'admin' && role !== 'teacher' && role !== 'lecturer' && token.admin !== true)) {
    throw new HttpsError('permission-denied', 'Staff only.');
  }
  const payload = (request.data ?? {}) as { uid?: string; kind?: 'learner' | 'teacher' };
  if (!payload.uid) throw new HttpsError('invalid-argument', 'uid is required.');
  return sendWelcome(String(payload.uid), payload.kind === 'teacher' ? 'teacher' : 'learner');
});
