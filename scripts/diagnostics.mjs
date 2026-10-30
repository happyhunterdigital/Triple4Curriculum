/**
 * Read-only diagnostics: Secret Manager secret names, Resend domain status,
 * Cloud Scheduler jobs and recent syncMeetRecordings logs.
 *
 * Never prints secret values.
 */
import { GoogleAuth } from 'google-auth-library';

const project = process.env.GCP_PROJECT || 'triple4curriculum';
const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
const client = await auth.getClient();

const secretsRes = await client.request({
  url: `https://secretmanager.googleapis.com/v1/projects/${project}/secrets?pageSize=100`,
});
const secretNames = (secretsRes.data.secrets || []).map((s) => String(s.name).split('/').pop());
console.log('SECRETS: ' + secretNames.join(', '));

async function secretValue(name) {
  const res = await client.request({
    url: `https://secretmanager.googleapis.com/v1/projects/${project}/secrets/${name}/versions/latest:access`,
  });
  return Buffer.from(String(res.data.payload?.data || ''), 'base64').toString('utf8');
}

if (secretNames.includes('RESEND_API_KEY')) {
  try {
    const key = await secretValue('RESEND_API_KEY');
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${key}` },
    });
    const body = await res.text();
    console.log(`RESEND: HTTP ${res.status} ${body.slice(0, 900)}`);
  } catch (e) {
    console.log(`RESEND: ERROR ${String(e).slice(0, 300)}`);
  }
} else {
  console.log('RESEND: secret missing');
}

try {
  const jobs = await client.request({
    url: `https://cloudscheduler.googleapis.com/v1/projects/${project}/locations/-/jobs`,
  });
  for (const job of jobs.data.jobs || []) {
    const name = String(job.name).split('/').pop();
    console.log(
      `JOB ${name}: schedule="${job.schedule}" tz="${job.timeZone}" state=${job.state} lastAttempt=${job.lastAttemptTime || 'never'} status=${JSON.stringify(job.status || {}).slice(0, 200)}`,
    );
  }
  if (!(jobs.data.jobs || []).length) console.log('JOBS: none found');
} catch (e) {
  console.log(`JOBS: ERROR ${String(e).slice(0, 300)}`);
}

try {
  const since = new Date(Date.now() - 72 * 3600 * 1000).toISOString();
  const res = await client.request({
    url: 'https://logging.googleapis.com/v2/entries:list',
    method: 'POST',
    data: {
      resourceNames: [`projects/${project}`],
      filter:
        `timestamp >= "${since}" AND ` +
        `(resource.labels.function_name="syncMeetRecordings" OR resource.labels.service_name="syncmeetrecordings" OR resource.labels.function_name="sendAttendanceThanks" OR resource.labels.service_name="sendattendancethanks")`,
      orderBy: 'timestamp desc',
      pageSize: 40,
    },
  });
  const entries = res.data.entries || [];
  console.log(`LOGS: ${entries.length} entries in the last 72h`);
  for (const entry of entries.slice(0, 20)) {
    const text = entry.textPayload || JSON.stringify(entry.jsonPayload || {});
    console.log(`LOG ${entry.timestamp} ${entry.severity || ''} ${String(text).slice(0, 400)}`);
  }
} catch (e) {
  console.log(`LOGS: ERROR ${String(e).slice(0, 300)}`);
}
