/**
 * One-off cleanup: deletes secrets from Secret Manager by name. Values are
 * never read or logged — only the secret resource is removed. Intended for
 * removing secrets that no longer belong to the stack (e.g. Stripe keys
 * after the PayFast migration). Run via the "Delete Secret Manager secrets"
 * workflow with a comma-separated SECRET_NAMES input.
 */
import { GoogleAuth } from 'google-auth-library';

const project = process.env.GCP_PROJECT || 'triple4curriculum';
const names = (process.env.SECRET_NAMES || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (names.length === 0) {
  console.error('SECRET_NAMES input is empty — nothing to delete.');
  process.exit(1);
}

const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
const client = await auth.getClient();
const base = `https://secretmanager.googleapis.com/v1/projects/${project}`;

for (const name of names) {
  try {
    await client.request({
      url: `${base}/secrets/${encodeURIComponent(name)}`,
      method: 'DELETE',
    });
    console.log(`deleted secret ${name}`);
  } catch (e) {
    if (e?.response?.status === 404) {
      console.log(`secret ${name} not found — nothing to do`);
      continue;
    }
    console.error(`failed to delete ${name}: ${e?.response?.status || e.message}`);
    process.exitCode = 1;
  }
}
