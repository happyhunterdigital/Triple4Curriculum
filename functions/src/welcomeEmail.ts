/**
 * Welcome emails on registration.
 *
 * Fires when a learner profile (students/{uid}) or a teacher application
 * (teacher_applications/{uid}) is created by the onboarding flow, and sends a
 * branded welcome email via Resend from noreply@triple4c.com.
 *
 * The same triggers also email a registration summary to the admin inbox
 * (ADMIN_ALERT_EMAIL, default admissions@triple4c.com) so staff know a learner
 * or teacher has signed up without watching the dashboard.
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

/** Inbox that receives a heads-up whenever somebody registers. Overridable via functions/.env. */
const DEFAULT_ADMIN_ALERT_EMAIL = 'admissions@triple4c.com';

const COMMON_FOOTER = `
  <p style="margin-top:24px">Warm regards,<br/>The Triple 4C teaching team</p>
  <p style="font-size:12px;color:#6b7280;margin-top:24px">Triple 4 Curriculum · 82 High Road, Tottenham, London N15 6JU ·
  <a href="https://triple4c.com">triple4c.com</a> · +27 63-199-7147</p>`;

function learnerEmail(name: string): string {
  return `
    <div style="font-family:Arial,sans-serif;color:#1a1c1e;line-height:1.6">
      <p>Hi ${name},</p>
      <p>Welcome to <strong>Triple 4 Curriculum</strong> — your place is registered. Here is
      what happens next:</p>
      <ol>
        <li><strong>Verify your email</strong> using the message we sent from Firebase (check spam if you do not see it).</li>
        <li><strong>Sign in</strong> any time at <a href="https://triple4c.com/login">triple4c.com/login</a> with your email and password (or Google).</li>
        <li><strong>Open your dashboard</strong> to see the timetable, announcements and recordings. Live classes begin Monday 11 January 2027.</li>
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

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function submittedAt(value: unknown): string {
  const maybe = value as { toDate?: () => Date } | undefined;
  if (typeof maybe?.toDate === 'function') return maybe.toDate().toISOString();
  return value ? String(value) : new Date().toISOString();
}

/** Registration summary sent to the admin inbox (no unmasked ID or bank data). */
function adminAlertHtml(kind: 'learner' | 'teacher', uid: string, data: Record<string, unknown>): string {
  const personal = asRecord(data.personal);
  const academic = asRecord(data.academic);
  const payment = asRecord(data.payment);
  const qualifications = asRecord(data.qualifications);
  const professional = asRecord(data.professional);

  const rows: Array<[string, string]> = [
    ['Name', String(data.name || '—')],
    ['Email', String(data.email || '—')],
    ['Phone', String(data.phone || data.phoneNumber || '—')],
    ['Role', kind === 'learner' ? 'Learner' : 'Teacher (application)'],
    ['Phase / department', String(data.department || data.departmentId || qualifications.teachingPhase || '—')],
    ['Registered at', submittedAt(data.submittedAt ?? data.createdAt)],
    ['UID', uid],
  ];

  if (kind === 'learner') {
    const guardian = asRecord(personal.guardian);
    rows.push(
      ['Date of birth', String(personal.dob || '—')],
      ['Minor', personal.isMinor ? 'Yes' : 'No'],
      ['Guardian', guardian.name ? `${String(guardian.name)} (${String(guardian.contact || 'no contact')})` : '—'],
      ['Previous school / last grade', `${String(academic.previousSchool || '—')} / ${String(academic.lastGrade || '—')}`],
      ['Payment method', String(payment.method || '—')],
      ['Payment status', String(payment.status || '—')],
    );
  } else {
    rows.push(
      ['Highest degree', String(qualifications.highestDegree || '—')],
      ['Degree field', String(qualifications.degreeField || '—')],
      ['Teaching certificate', String(qualifications.teachingCertificate || '—')],
      ['Years experience', String(professional.yearsExperience || '—')],
      ['Verification status', String(data.verificationStatus || data.status || 'pending')],
    );
  }

  const body = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;white-space:nowrap">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 0;font-weight:600">${escapeHtml(value)}</td></tr>`,
    )
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;color:#1a1c1e;line-height:1.6">
      <p>A new <strong>${kind}</strong> registration was submitted on triple4c.com.</p>
      <table style="border-collapse:collapse;font-size:14px">${body}</table>
      <p style="margin-top:20px">
        <a href="https://triple4c.com/dashboard" style="display:inline-block;background:#4c1d95;color:#ffffff;padding:10px 20px;border-radius:999px;text-decoration:none;font-weight:bold">Open the admin dashboard</a>
      </p>
      <p style="font-size:12px;color:#6b7280;margin-top:20px">Sent automatically by Triple 4C on registration.
      Set ADMIN_ALERT_EMAIL in functions/.env to route these alerts elsewhere.</p>
    </div>`;
}

async function sendAdminAlert(
  uid: string,
  kind: 'learner' | 'teacher',
  data: Record<string, unknown>,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env[RESEND_SECRET] || '';
  if (!apiKey) return { sent: false, reason: 'resend-not-configured' };

  const to = (process.env.ADMIN_ALERT_EMAIL || DEFAULT_ADMIN_ALERT_EMAIL).trim();
  if (!to) return { sent: false, reason: 'no-admin-email' };

  const name = String(data.name || 'New registration');
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Triple 4C <noreply@triple4c.com>',
        to: [to],
        reply_to: data.email ? String(data.email) : undefined,
        subject: `New ${kind} registration: ${name}`,
        html: adminAlertHtml(kind, uid, data),
      }),
    });
    if (!res.ok) {
      logger.warn('sendAdminAlert: Resend rejected', { uid, kind, status: res.status });
      return { sent: false, reason: `resend-${res.status}` };
    }
  } catch (e) {
    logger.error('sendAdminAlert: request failed', { uid, kind, error: String(e) });
    return { sent: false, reason: 'resend-error' };
  }

  await getFirestore().collection('audit_logs').add({
    userId: 'system',
    action: 'ADMIN_REGISTRATION_ALERT_SENT',
    resource: `${kind === 'learner' ? 'students' : 'teacher_applications'}/${uid}`,
    details: `${kind} registration alert sent to ${to}.`,
    status: 'SUCCESS',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    createdAt: FieldValue.serverTimestamp(),
  });
  return { sent: true };
}

async function sendWelcome(uid: string, kind: 'learner' | 'teacher'): Promise<{ sent: boolean; reason?: string }> {
  const db = getFirestore();
  const collection = kind === 'learner' ? 'students' : 'teacher_applications';
  const profile = await db.doc(`${collection}/${uid}`).get();
  if (!profile.exists) return { sent: false, reason: 'profile-not-found' };
  const data = profile.data() || {};
  const email = String(data.email || '');
  const name = String(data.name || 'there');

  // Notify the admin inbox first: the registration itself always matters,
  // even if the learner-facing welcome email cannot be delivered.
  try {
    const alert = await sendAdminAlert(uid, kind, data);
    logger.info('admin registration alert', { uid, kind, ...alert });
  } catch (e) {
    logger.error('sendAdminAlert: unexpected failure', { uid, kind, error: String(e) });
  }

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
