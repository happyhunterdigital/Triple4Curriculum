/**
 * Read-only auth diagnostics: prints the Identity Toolkit project config bits
 * that affect account recovery (authorized domains, SMTP sender, template
 * settings) and generates + fetches a password-reset action link for a given
 * QA address so we can see whether the hosted handler works.
 *
 * Usage: AUTH_DIAG_EMAIL=qa-...@triple4c-test.example node scripts/auth-diagnose.mjs
 * Never prints secrets — only the SMTP username and sender address.
 */
import admin from 'firebase-admin';
import { GoogleAuth } from 'google-auth-library';

const project = process.env.GCP_PROJECT || 'triple4curriculum';
const email = process.env.AUTH_DIAG_EMAIL;

const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
admin.initializeApp(
  svcJson
    ? { credential: admin.credential.cert(JSON.parse(svcJson)), projectId: project }
    : { projectId: project },
);

const auth = admin.auth();
const auth2 = new GoogleAuth(
  svcJson
    ? { credentials: JSON.parse(svcJson), scopes: ['https://www.googleapis.com/auth/cloud-platform'] }
    : { scopes: ['https://www.googleapis.com/auth/cloud-platform'] },
);
const client = await auth2.getClient();

const cfgRes = await client.request({
  url: `https://identitytoolkit.googleapis.com/v2/projects/${project}/config`,
});
const cfg = cfgRes.data || {};
const notification = cfg.notification || {};
const resetTpl = notification.resetPassword || notification.passwordResetConfig || notification.sendPasswordReset || {};

console.log(
  JSON.stringify(
    {
      authorizedDomains: cfg.authorizedDomains || null,
      smtp: (() => {
        const s = cfg.notification?.sendEmail?.smtp;
        return s
          ? {
              senderEmail: s.senderEmail,
              host: s.host,
              port: s.port,
              username: s.username,
              securityMode: s.securityMode,
            }
          : null;
      })(),
      passwordResetTemplate: {
        senderEmail: resetTpl.senderEmail || null,
        subject: resetTpl.subject || null,
        hasBody: !!resetTpl.body,
        hasActionCodeLink: !!resetTpl.resetPasswordTemplateBody || !!resetTpl.body,
      },
      defaultLanguage: cfg.defaultLanguage || null,
    },
    null,
    2,
  ),
);

if (email) {
  const link = await auth.generatePasswordResetLink(email);
  console.log('RESET LINK (' + link.length + ' chars): ' + link.replace(/oobCode=[^&]+/, 'oobCode=<redacted>'));
  const res = await fetch(link);
  const body = await res.text();
  console.log('ACTION PAGE: status=' + res.status + ' finalUrl=' + res.url);
  console.log(
    'ACTION PAGE SIGNALS: ' +
      JSON.stringify({
        firebaseHandler: /__\/auth\/action/i.test(res.url) || /resetPassword/i.test(body),
        mentionsInvalid: /invalid|expired/i.test(body),
        snippet: body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 240),
      }),
  );
}
