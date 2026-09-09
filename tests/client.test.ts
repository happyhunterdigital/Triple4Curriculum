import { describe, it, expect } from 'vitest';
import { toAppRole, toStoredRole } from '../src/lib/api';
import { ACADEMIC_REGISTRY } from '../src/data/curriculum';

describe('role mapping (Firestore <-> app)', () => {
  it('maps stored learner/teacher roles to app roles', () => {
    expect(toAppRole('learner')).toBe('student');
    expect(toAppRole('student')).toBe('student');
    expect(toAppRole('teacher')).toBe('lecturer');
    expect(toAppRole('lecturer')).toBe('lecturer');
    expect(toAppRole('admin')).toBe('admin');
    expect(toAppRole(undefined)).toBe('student');
    expect(toAppRole('superuser')).toBe('student');
  });

  it('maps app roles to stored roles (never admin-escalating)', () => {
    expect(toStoredRole('student')).toBe('learner');
    expect(toStoredRole('learner')).toBe('learner');
    expect(toStoredRole('lecturer')).toBe('teacher');
    expect(toStoredRole('teacher')).toBe('teacher');
    expect(toStoredRole('admin')).toBe('admin');
  });
});

describe('bundled curriculum registry', () => {
  it('every module has id, code and title', () => {
    expect(ACADEMIC_REGISTRY.length).toBeGreaterThan(0);
    for (const m of ACADEMIC_REGISTRY) {
      expect(m.id).toBeTruthy();
      expect(m.code).toBeTruthy();
      expect(m.title).toBeTruthy();
    }
  });
});
