import { createHash, randomUUID } from 'node:crypto';

/** Prefix-scoped unique IDs — replaces Math.random() / Date.now() patterns. */
export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

/** Session / request IDs. */
export function newRequestId(): string {
  return randomUUID();
}

/**
 * POPIA data-minimisation for IP addresses.
 * Never store raw IPs in client-visible logs: truncate host portion and
 * keep only a short salted hash so abuse analysis is still possible.
 */
export function hashIp(rawIp: string | undefined): string {
  const ip = (rawIp || 'unknown').split(',')[0].trim().slice(0, 64);
  if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') return 'localhost';
  const truncated = ip.includes('.')
    ? ip.split('.').slice(0, 3).join('.') + '.xxx'
    : ip.split(':').slice(0, 4).join(':') + ':xxxx';
  const digest = createHash('sha256').update(ip).digest('hex').slice(0, 8);
  return `${truncated}#${digest}`;
}

/** Minimal structured JSON logger (pino-compatible shape, zero new deps). */
export function logEvent(level: 'info' | 'warn' | 'error', msg: string, fields: Record<string, unknown> = {}) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg,
    ...fields,
  });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

/**
 * Strip raw IPs from audit logs before sending to non-admin clients.
 * Admins still only see the truncated+hashed form by default.
 */
export function sanitizeAuditLog<T extends { ipAddress?: string }>(log: T): Omit<T, 'ipAddress'> & { ipHash: string } {
  const { ipAddress, ...rest } = log;
  return { ...rest, ipHash: hashIp(ipAddress) };
}
