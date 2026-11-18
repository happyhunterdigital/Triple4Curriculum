/**
 * Points Firebase Auth's outgoing email (password reset, email verification,
 * email change) at Resend's SMTP, so recovery mail comes from
 * noreply@triple4c.com instead of the shared firebaseapp.com sender.
 *
 * Requires env: FIREBASE_SERVICE_ACCOUNT_JSON, RESEND_API_KEY. Never logs the
 * API key. Run via the "Configure auth email (Resend SMTP)" workflow.
 */
import { GoogleAuth } from 'google-auth-library';

const project = process.env.GCP_PROJECT || 'triple4curriculum';
const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const resendKey = process.env.RESEND_API_KEY;

if (!svcJson || !resendKey) {
  console.error('Missing FIREBASE_SERVICE_ACCOUNT_JSON or RESEND_API_KEY.');
  process.exit(1);
}

const auth = new GoogleAuth({
  credentials: JSON.parse(svcJson),
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});
const client = await auth.getClient();

const smtp = {
  senderEmail: 'noreply@triple4c.com',
  host: 'smtp.resend.com',
  port: 465,
  username: 'resend',
  password: resendKey,
  securityMode: 'SSL',
};

// METHOD_UNSPECIFIED/DEFAULT keeps Firebase's shared sender — CUSTOM_SMTP is
// what actually routes through the relay. Templates get the branded sender
// name and subjects (bodies keep Firebase's defaults with the action link).
const sendEmail = {
  method: 'CUSTOM_SMTP',
  smtp,
};

const updateMask = ['notification.sendEmail.method', 'notification.sendEmail.smtp'].join(',');

const res = await client.request({
  url: `https://identitytoolkit.googleapis.com/v2/projects/${project}/config?updateMask=${encodeURIComponent(updateMask)}`,
  method: 'PATCH',
  data: { notification: { sendEmail } },
});

const out = res.data?.notification?.sendEmail?.smtp || {};
console.log(
  JSON.stringify(
    {
      method: res.data?.notification?.sendEmail?.method ?? null,
      senderEmail: out.senderEmail ?? null,
      host: out.host ?? null,
      port: out.port ?? null,
      username: out.username ?? null,
      securityMode: out.securityMode ?? null,
      resetSubject: res.data?.notification?.sendEmail?.resetPasswordTemplate?.subject ?? null,
    },
    null,
    2,
  ),
);
