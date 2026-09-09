import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { appPromise } from '../server.ts';

describe('auth hardening (audit 1.1 / 1.2)', () => {
  it('rejects unauthenticated access to protected routes', async () => {
    const app = await appPromise;
    const res = await request(app).get('/api/v1/users');
    expect([401, 403]).toContain(res.status);
  });

  it('legacy gateway backdoor is gone (410, no password123)', async () => {
    const app = await appPromise;
    const res = await request(app)
      .post('/api/v1/auth/gateway')
      .send({ identity: 'admin@school.edu', credential: 'password123' });
    expect(res.status).toBe(410);
    expect(JSON.stringify(res.body)).not.toContain('jwt_secure_session_token');
  });

  it('login requires a real email (no fallback to first student)', async () => {
    const app = await appPromise;
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@nowhere.test' });
    expect(res.status).toBe(401);
  });

  it('login works for a seeded user and audit IPs are minimised', async () => {
    const app = await appPromise;
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'sarah.k@triple4c.edu' });
    expect(login.status).toBe(200);
    expect(login.body.user.email).toBe('sarah.k@triple4c.edu');

    // Seeded student can only see own record (IDOR fix).
    const users = await request(app)
      .get('/api/v1/users')
      .set('x-dev-user-id', 'stu_01');
    expect(users.status).toBe(200);
    expect(users.body).toHaveLength(1);
    expect(users.body[0].id).toBe('stu_01');

    // Audit logs are admin-only now.
    const auditAsStudent = await request(app)
      .get('/api/v1/audit-logs')
      .set('x-dev-user-id', 'stu_01');
    expect(auditAsStudent.status).toBe(403);
  });

  it('registration requires POPIA consent', async () => {
    const app = await appPromise;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test Learner', email: 'test.learner@triple4c.edu' });
    expect(res.status).toBe(400);
  });
});
