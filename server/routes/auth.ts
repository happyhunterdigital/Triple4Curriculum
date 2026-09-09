import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../src/server/mockDb.ts';
import { hashIp, logEvent, newId } from '../lib/security.ts';
import { validateBody } from '../lib/validate.ts';

const authRouter = Router();

const gatewaySchema = z.object({
  identity: z.string().trim().min(3).max(254),
  credential: z.string().min(8).max(256),
});

/**
 * Legacy gateway endpoint - hardcoded credentials REMOVED (audit 1.1).
 * This endpoint now always rejects with 410 Gone and points callers to
 * the Firebase-backed /api/v1/auth/* flow. Kept as a stub so old clients
 * fail loudly instead of silently using a backdoor.
 */
authRouter.post('/gateway', validateBody(gatewaySchema), (_req: Request, res: Response) => {
  logEvent('warn', 'deprecated auth gateway called', {});
  return res.status(410).json({
    error: 'Removed: legacy credential gateway is disabled.',
    hint: 'Use Firebase Authentication (ID token) with /api/v1/auth/login.',
  });
});

/** POPIA data-subject export (Section 14 stub backed by the demo store). */
authRouter.get('/export-my-data', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || '';
  if (!userId) return res.status(400).json({ error: 'userId query param required' });
  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const submissions = db.submissions.filter((s) => s.studentId === userId);
  const progress = db.learnerProgress.filter((lp) => lp.studentId === userId);
  const notifications = db.notifications.filter((n) => n.recipientId === userId);
  return res.json({
    exportedAt: new Date().toISOString(),
    notice: 'Demo export from in-memory store. Wire to Firestore for production.',
    user,
    submissions,
    progress,
    notifications,
  });
});

/** Right-to-erasure stub: soft-delete user + related demo records. */
authRouter.delete('/delete-my-account', (req: Request, res: Response) => {
  const { userId } = req.body ?? {};
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  const [removed] = db.users.splice(idx, 1);
  db.addAuditLog({
    userId,
    userName: removed.name,
    userRole: removed.role,
    action: 'ACCOUNT_DELETED',
    resource: '/api/v1/auth/delete-my-account',
    details: 'Data-subject erasure request honoured (demo store).',
    ipAddress: hashIp(req.ip),
    status: 'SUCCESS',
    popiaCompliant: true,
  } as never);
  return res.json({ success: true, message: 'Account erased from demo store.' });
});

export function issueDemoToken(userId: string): string {
  return `dev-student-${userId}-${newId('sess').slice(-6)}`;
}

export default authRouter;
