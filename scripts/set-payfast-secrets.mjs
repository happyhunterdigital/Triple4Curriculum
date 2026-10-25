/**
 * Creates/updates PayFast secrets in Secret Manager and grants the Cloud
 * Functions runtime service account access. Run via the "Set PayFast secrets"
 * workflow; values come from GitHub repository secrets and are never logged.
 */
import { GoogleAuth } from 'google-auth-library';

const project = process.env.GCP_PROJECT || 'triple4curriculum';
const runtimeSa = `${project}@appspot.gserviceaccount.com`;

const secrets = {
  PAYFAST_MERCHANT_ID: process.env.PAYFAST_MERCHANT_ID ?? '',
  PAYFAST_MERCHANT_KEY: process.env.PAYFAST_MERCHANT_KEY ?? '',
  // Secret Manager rejects empty payloads. "none" means "no PayFast passphrase"
  // (the functions treat "none" as an empty passphrase when signing).
  PAYFAST_PASSPHRASE: process.env.PAYFAST_PASSPHRASE || 'none',
};

const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
const client = await auth.getClient();
const creds = await auth.getCredentials();
const base = `https://secretmanager.googleapis.com/v1/projects/${project}`;

async function ensureSecret(name) {
  try {
    await client.request({
      url: `${base}/secrets?secretId=${encodeURIComponent(name)}`,
      method: 'POST',
      data: { replication: { automatic: {} } },
    });
    console.log(`created secret ${name}`);
  } catch (e) {
    if (e?.response?.status === 409) {
      console.log(`secret ${name} already exists`);
      return;
    }
    throw e;
  }
}

async function addVersion(name, value) {
  const res = await client.request({
    url: `${base}/secrets/${name}:addVersion`,
    method: 'POST',
    data: { payload: { data: Buffer.from(value, 'utf8').toString('base64') } },
  });
  console.log(`added version for ${name} (${value.length} chars)`);
  return res.data;
}

async function grantAccess(name) {
  const url = `${base}/secrets/${name}`;
  const policyRes = await client.request({ url: `${url}:getIamPolicy`, method: 'POST', data: {} });
  const policy = policyRes.data || {};
  const bindings = Array.isArray(policy.bindings) ? policy.bindings : [];
  const members = [`serviceAccount:${runtimeSa}`];
  if (creds.client_email) members.push(`serviceAccount:${creds.client_email}`);

  const binding = bindings.find((b) => b.role === 'roles/secretmanager.secretAccessor');
  if (binding) {
    binding.members = Array.from(new Set([...(binding.members || []), ...members]));
  } else {
    bindings.push({ role: 'roles/secretmanager.secretAccessor', members });
  }

  await client.request({
    url: `${url}:setIamPolicy`,
    method: 'POST',
    data: { policy: { ...policy, bindings } },
  });
  console.log(`granted secretAccessor on ${name}`);
}

let failures = 0;
for (const [name, value] of Object.entries(secrets)) {
  try {
    await ensureSecret(name);
    await addVersion(name, value);
    try {
      await grantAccess(name);
    } catch (e) {
      console.warn(`warning: could not set IAM on ${name} (${e?.message || e})`);
    }
  } catch (e) {
    failures += 1;
    console.error(`FAILED ${name}: ${e?.message || e}`);
    if (e?.response?.data) console.error(JSON.stringify(e.response.data).slice(0, 500));
  }
}

if (failures) {
  console.error(`${failures} secret(s) failed. The CI service account needs Secret Manager Admin.`);
  process.exit(1);
}
console.log('PayFast secrets are ready.');
