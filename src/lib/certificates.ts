import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth as fbAuth, db } from './firebase';
import { createCertificate as createCertificateFn } from './functions';

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  courseTitle: string;
  issuedBy?: string;
  storagePath?: string;
  status?: string;
  issuedAt?: string;
}

function currentUid(explicitUid?: string): string {
  if (explicitUid) return explicitUid;
  const u = fbAuth.currentUser;
  if (!u) throw new Error('Session expired or missing. Please sign in again.');
  return u.uid;
}

/** Issue a certificate via the `createCertificate` callable, then return the new record id. */
export async function requestCertificate(
  courseId: string,
  courseTitle?: string,
  studentId?: string,
): Promise<{ success: boolean; id: string; storagePath: string }> {
  return createCertificateFn({ courseId, courseTitle, studentId });
}

/** List certificates for the current (or explicit) student, newest first. */
export async function myCertificates(uid?: string): Promise<Certificate[]> {
  const id = currentUid(uid);
  const snap = await getDocs(query(collection(db, 'certificates'), where('studentId', '==', id)));
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Certificate, 'id'>) }));
  return rows.sort((a, b) => (b.issuedAt || '').localeCompare(a.issuedAt || ''));
}

/** Render a printable certificate page and invoke the browser print dialog (save as PDF). */
export function printCertificate(cert: Certificate, studentName?: string): void {
  const name = studentName || fbAuth.currentUser?.displayName || cert.studentId;
  const win = window.open('', '_blank', 'width=900,height=650');
  if (!win) throw new Error('Popup blocked — allow popups to print your certificate.');
  win.document.write(`<!DOCTYPE html><html><head><title>Certificate — ${escapeHtml(cert.courseTitle)}</title>
<style>
body{font-family:Georgia,serif;background:#f8f6ef;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.card{background:#fff;border:6px double #15803d;padding:48px 56px;max-width:640px;text-align:center}
h1{font-size:28px;margin:0 0 8px}.org{letter-spacing:3px;font-size:12px;color:#666;text-transform:uppercase}
.name{font-size:32px;margin:16px 0 4px}.course{font-size:20px;font-weight:bold}.meta{font-size:12px;color:#555;margin-top:16px}
@media print{body{background:#fff}.card{border-width:4px}}
</style></head><body><div class="card">
<div class="org">Triple 4C Curriculum</div><h1>Certificate of Completion</h1>
<p>This certifies that</p><div class="name">${escapeHtml(name)}</div>
<p>has successfully completed</p><div class="course">${escapeHtml(cert.courseTitle)}</div>
<div class="meta">Issued ${escapeHtml(cert.issuedAt || '')} · Certificate ${escapeHtml(cert.id)} · Verify at triple4c.com/certificates</div>
</div><script>window.onload=function(){window.print()}<\/script></body></html>`);
  win.document.close();
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}
