import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { appPromise } from '../server.ts';

describe('grading + scoped reads (audit 1.2 / 1.3)', () => {
  it('students cannot grade (lecturer/admin only)', async () => {
    const app = await appPromise;
    const subs = await request(app)
      .get('/api/v1/submissions')
      .set('x-dev-user-id', 'lec_01');
    expect(subs.status).toBe(200);
    const target = subs.body[0];
    expect(target).toBeDefined();

    const forbidden = await request(app)
      .post(`/api/v1/submissions/${target.id}/grade`)
      .set('x-dev-user-id', 'stu_01')
      .send({ grade: 100, feedback: 'hacked' });
    expect(forbidden.status).toBe(403);
  });

  it('lecturer can grade with validated body; bad grade rejected', async () => {
    const app = await appPromise;
    const subs = await request(app)
      .get('/api/v1/submissions')
      .set('x-dev-user-id', 'lec_01');
    const target = subs.body[0];

    const bad = await request(app)
      .post(`/api/v1/submissions/${target.id}/grade`)
      .set('x-dev-user-id', 'lec_01')
      .send({ grade: 'A+', feedback: 'x'.repeat(5) });
    expect(bad.status).toBe(400);

    const good = await request(app)
      .post(`/api/v1/submissions/${target.id}/grade`)
      .set('x-dev-user-id', 'lec_01')
      .send({ grade: 82, feedback: 'Solid work', graderName: 'Dr. Test' });
    expect(good.status).toBe(200);
    expect(good.body.submission.grade).toBe(82);
  });

  it('student learner-progress is scoped to self', async () => {
    const app = await appPromise;
    const res = await request(app)
      .get('/api/v1/learner-progress')
      .set('x-dev-user-id', 'stu_01');
    expect(res.status).toBe(200);
    for (const r of res.body) {
      expect(r.studentId).toBe('stu_01');
    }
  });
});
