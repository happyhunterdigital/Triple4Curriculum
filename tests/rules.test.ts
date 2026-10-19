import { describe, expect, it } from 'vitest';

// Emulator-style unit tests for claims/rules-adjacent pure logic.
// These mirror the Firestore rules helpers (isAdmin/isStaff, actionUrl and
// file validation) without needing a live emulator.

// ── Pure helpers (duplicated from rules intent for client/test parity) ──
type Role = 'student' | 'lecturer' | 'admin';

function isAdmin(role: unknown): boolean {
  return role === 'admin';
}

function isStaff(role: unknown): boolean {
  return role === 'lecturer' || role === 'admin';
}

function isValidActionUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  // Rules allow only app-relative action URLs (no open redirects).
  return /^\/[a-z0-9\-/_?=&]*$/i.test(url);
}

const ALLOWED_EXT = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
const MAX_KB = 10 * 1024;

function isValidFile(name: unknown, sizeKb: unknown): boolean {
  if (typeof name !== 'string' || typeof sizeKb !== 'number') return false;
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXT.includes(ext)) return false;
  if (sizeKb <= 0 || sizeKb > MAX_KB) return false;
  return true;
}

describe('claims logic', () => {
  it('isAdmin only true for admin', () => {
    expect(isAdmin('admin')).toBe(true);
    expect(isAdmin('lecturer')).toBe(false);
    expect(isAdmin('student')).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });

  it('isStaff true for lecturer + admin', () => {
    expect(isStaff('lecturer')).toBe(true);
    expect(isStaff('admin')).toBe(true);
    expect(isStaff('student')).toBe(false);
  });

  it('students cannot grade (role gate)', () => {
    const canGrade = (r: Role) => isStaff(r);
    expect(canGrade('student')).toBe(false);
    expect(canGrade('lecturer')).toBe(true);
    expect(canGrade('admin')).toBe(true);
  });
});

describe('actionUrl validation', () => {
  it('accepts app-relative urls', () => {
    expect(isValidActionUrl('/assignments')).toBe(true);
    expect(isValidActionUrl('/lectures')).toBe(true);
  });

  it('rejects absolute/external urls (open-redirect guard)', () => {
    expect(isValidActionUrl('https://evil.com')).toBe(false);
    expect(isValidActionUrl('javascript:alert(1)')).toBe(false);
    expect(isValidActionUrl('//evil.com')).toBe(false);
    expect(isValidActionUrl('')).toBe(false);
  });
});

describe('submission file validation', () => {
  it('accepts allowed types within size', () => {
    expect(isValidFile('essay.pdf', 1500)).toBe(true);
    expect(isValidFile('photo.JPG', 500)).toBe(true);
  });

  it('rejects executables / oversize / bad input', () => {
    expect(isValidFile('run.exe', 100)).toBe(false);
    expect(isValidFile('big.pdf', MAX_KB + 1)).toBe(false);
    expect(isValidFile('', 100)).toBe(false);
    expect(isValidFile('a.pdf', -1)).toBe(false);
  });
});
