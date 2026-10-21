/**
 * Authorize custom domains for Firebase Auth OAuth redirects.
 *
 * Symptom this fixes:
 *   "The current domain is not authorized for OAuth operations ... Add your
 *   domain to the OAuth redirect domains list in the Firebase console."
 * (auth/unauthorized-domain on signInWithPopup)
 *
 * Uses the Identity Toolkit Admin API (projects.updateConfig) with the
 * FIREBASE_SERVICE_ACCOUNT key — run via the "Authorize Firebase Auth domains"
 * workflow, or locally with GOOGLE_APPLICATION_CREDENTIALS set.
 *
 * Usage:
 *   AUTH_DOMAINS=triple4c.com,www.triple4c.com GCP_PROJECT=triple4curriculum \
 *     node scripts/authorize-domains.mjs
 */
import { GoogleAuth } from 'google-auth-library';

const project = process.env.GCP_PROJECT || 'triple4curriculum';
const wanted = (process.env.AUTH_DOMAINS || 'triple4c.com,www.triple4c.com')
  .split(',')
  .map((d) => d.trim())
  .filter(Boolean);

const auth = new GoogleAuth({
  scopes: [
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/identitytoolkit',
  ],
});
const client = await auth.getClient();
const configUrl = `https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/config`;

const current = await client.request({ url: configUrl });
const existing = (current.data.authorizedDomains || []).map(String);
const missing = wanted.filter((d) => !existing.includes(d));

console.log(`Project: ${project}`);
console.log(`Authorized now: ${existing.join(', ') || '(none)'}`);

if (missing.length === 0) {
  console.log('Nothing to do — all requested domains are already authorized.');
  process.exit(0);
}

const merged = [...existing, ...missing];
console.log(`Adding: ${missing.join(', ')}`);

const res = await client.request({
  url: `${configUrl}?updateMask=authorizedDomains`,
  method: 'PATCH',
  data: { name: `projects/${project}/config`, authorizedDomains: merged },
});

console.log(`Authorized after update: ${(res.data.authorizedDomains || merged).join(', ')}`);
