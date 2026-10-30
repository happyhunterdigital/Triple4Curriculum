/**
 * Registers triple4c.com as a sending domain on Resend (if missing) and prints
 * the DNS records Resend requires for verification. Uses RESEND_API_KEY.
 */
const key = process.env.RESEND_API_KEY || '';
const domain = process.env.RESEND_DOMAIN || 'triple4c.com';
const region = process.env.RESEND_REGION || 'eu-west-1';

if (!key) {
  console.log('RESEND_API_KEY not provided');
  process.exit(1);
}

const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

const listRes = await fetch('https://api.resend.com/domains', { headers });
const list = await listRes.json();
const existing = (list.data || []).find((d) => d.name === domain);

if (existing) {
  console.log(`DOMAIN ${domain} already registered (id=${existing.id}, status=${existing.status})`);
} else {
  const createRes = await fetch('https://api.resend.com/domains', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: domain, region }),
  });
  const created = await createRes.json();
  console.log(`CREATE: HTTP ${createRes.status} ${JSON.stringify(created).slice(0, 500)}`);
}

const finalRes = await fetch('https://api.resend.com/domains', { headers });
const finalList = await finalRes.json();
const target = (finalList.data || []).find((d) => d.name === domain);
if (!target) {
  console.log('DOMAIN: not found after create');
  process.exit(1);
}

const detailRes = await fetch(`https://api.resend.com/domains/${target.id}`, { headers });
const detail = await detailRes.json();
console.log(`DOMAIN ${target.name}: status=${detail.status}`);
for (const rec of detail.records || []) {
  console.log(`DNS ${rec.type} ${rec.name} ${rec.priority || ''} -> ${String(rec.value).slice(0, 160)}`);
}
