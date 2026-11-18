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

const res = await client.request({
  url: `https://identitytoolkit.googleapis.com/v2/projects/${project}/config?updateMask=smtp`,
  method: 'PATCH',
  data: { smtp },
});

const out = res.data?.smtp || {};
console.log(
  JSON.stringify(
    {
      senderEmail: out.senderEmail ?? null,
      host: out.host ?? null,
      port: out.port ?? null,
      username: out.username ?? null,
      securityMode: out.securityMode ?? null,
      passwordSet: out.password === '********',
    },
    null,
    2,
  ),
);
