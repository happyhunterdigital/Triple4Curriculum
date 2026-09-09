import { describe, it, expect } from 'vitest';
import { hashIp, newId, sanitizeAuditLog } from '../server/lib/security.ts';

describe('POPIA minimisation helpers', () => {
  it('hashIp never returns a raw host address', () => {
    const out = hashIp('197.89.241.12');
    expect(out).not.toContain('197.89.241.12');
    expect(out).toContain('xxx');
  });

  it('newId uses crypto randomness with prefix', () => {
    const a = newId('sub');
    const b = newId('sub');
    expect(a).not.toBe(b);
    expect(a.startsWith('sub_')).toBe(true);
  });

  it('sanitizeAuditLog strips raw ipAddress', () => {
    const clean = sanitizeAuditLog({
      id: 'x',
      ipAddress: '41.13.72.99',
      details: 'test',
    } as never);
    expect((clean as Record<string, unknown>).ipAddress).toBeUndefined();
    expect((clean as Record<string, unknown>).ipHash).toContain('xxx');
  });
});
