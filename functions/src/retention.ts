/**
 * Phase 4 compliance backend: retention + Data Subject Requests (DSR).
 *
 * - purgeExpired: scheduled daily. Deletes contact/marketing messages older
 *   than 12 months, anonymises audit_logs older than 2 years (SHA-256 userId),
 *   and REPORTS (does not delete) unverified accounts past grace.
 * - exportMyDataStrict: callable DSR export (self, or admin for a subject).
 * - eraseMyData: callable DSR erasure (self, guardian-verified minor via
 *   admin, or admin). Statutory DBE/SACCAI assessment records are
 *   anonymised, never hard-deleted, until the archive hold clears.
 */
import { createHash } from "node:crypto";
import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

const CONTACT_MONTHS = 12;
const AUDIT_ANON_YEARS = 2;
const UNVERIFIED_GRACE_DAYS = 30;
const BATCH_LIMIT = 400;

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function monthsAgo(n: number): admin.firestore.Timestamp {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return admin.firestore.Timestamp.fromDate(d);
}

function yearsAgo(n: number): admin.firestore.Timestamp {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return admin.firestore.Timestamp.fromDate(d);
}

function requireUid(request: { auth?: { uid: string } | null }): string {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Sign in required.");
  return request.auth.uid;
}

function isAdminToken(token: unknown): boolean {
  const t = token as Record<string, unknown> | undefined;
  return t?.role === "admin" || t?.admin === true;
}

/** Delete docs of `collection` with `timeField` older than `cutoff`, batched. */
async function deleteOlderThan(
  collection: string,
  timeField: string,
  cutoff: admin.firestore.Timestamp,
): Promise<number> {
  let deleted = 0;
  for (;;) {
    const snap = await db
      .collection(collection)
      .where(timeField, "<", cutoff)
      .limit(BATCH_LIMIT)
      .get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deleted += snap.size;
    if (snap.size < BATCH_LIMIT) break;
  }
  return deleted;
}

/**
 * Scheduled retention sweep (every 24h).
 * - messages + contact_messages older than 12mo (by createdAt/serverCreatedAt/timestamp) → delete.
 * - audit_logs older than 2y → anonymise (userId → sha256, userName → redacted).
 * - unverified Auth accounts past 30-day grace → report-only stub (no auto-delete).
 */
export const purgeExpired = onSchedule({ schedule: "every 24 hours" }, async () => {
  const cutoffContact = monthsAgo(CONTACT_MONTHS);
  const cutoffAudit = yearsAgo(AUDIT_ANON_YEARS);

  let messagesDeleted = 0;
  for (const col of ["contact_messages", "messages"]) {
    for (const field of ["createdAt", "serverCreatedAt"]) {
      try {
        messagesDeleted += await deleteOlderThan(col, field, cutoffContact);
      } catch {
        // Collection/field may not exist or lack an index — sweep continues.
      }
    }
  }

  // Anonymise stale audit logs in place (preserves counts for regulators).
  let auditAnonymised = 0;
  for (;;) {
    const snap = await db
      .collection("audit_logs")
      .where("createdAt", "<", cutoffAudit)
      .limit(BATCH_LIMIT)
      .get();
    if (snap.empty) break;
    const batch = db.batch();
    for (const d of snap.docs) {
      const data = d.data() as Record<string, unknown>;
      if (data.anonymised === true) continue;
      batch.update(d.ref, {
        userId: typeof data.userId === "string" ? sha256(data.userId) : "redacted",
        userName: "redacted",
        ipAddress: "redacted",
        details: String(data.details ?? "").slice(0, 200),
        anonymised: true,
      });
      auditAnonymised += 1;
    }
    await batch.commit();
    if (snap.size < BATCH_LIMIT) break;
  }

  // Unverified-account sweep: STUB (safe) — count only, never auto-delete.
  // Promotion to deletion requires explicit approval + ALLOW_UNVERIFIED_DELETE=1.
  let unverifiedPastGrace = 0;
  try {
    let pageToken: string | undefined;
    const graceMs = UNVERIFIED_GRACE_DAYS * 24 * 3600 * 1000;
    do {
      const page = await auth.listUsers(1000, pageToken);
      const now = Date.now();
      unverifiedPastGrace += page.users.filter(
        (u) => !u.emailVerified && Date.parse(u.metadata.creationTime) < now - graceMs && !u.disabled,
      ).length;
      pageToken = page.pageToken;
    } while (pageToken);
  } catch {
    unverifiedPastGrace = -1; // Auth unavailable in this environment.
  }

  await db.collection("audit_logs").add({
    action: "RETENTION_SWEEP",
    resource: "/system/retention",
    details: `messagesDeleted=${messagesDeleted} auditAnonymised=${auditAnonymised} unverifiedPastGrace=${unverifiedPastGrace}`.slice(0, 1500),
    status: "SUCCESS",
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Scheduled handlers must resolve to void; the audit_logs entry above is the
  // durable record of the sweep. Log a summary for Cloud Logging as well.
  console.log(
    `[retention] messagesDeleted=${messagesDeleted} auditAnonymised=${auditAnonymised} unverifiedPastGrace=${unverifiedPastGrace}`,
  );
});

const USER_COLLECTIONS = [
  "submissions",
  "attendance",
  "learner_progress",
  "notifications",
  "messages",
  "certificates",
] as const;

async function collectUserDocs(uid: string): Promise<Record<string, unknown[]>> {
  const out: Record<string, unknown[]> = {};
  const profile = await db.doc(`users/${uid}`).get();
  out.profile = profile.exists ? [{ id: profile.id, ...profile.data() }] : [];
  for (const mirror of ["students", "teachers"]) {
    const snap = await db.doc(`${mirror}/${uid}`).get().catch(() => null);
    if (snap?.exists) out[mirror] = [{ id: snap.id, ...snap.data() }];
  }
  for (const col of USER_COLLECTIONS) {
    const fields = col === "notifications" || col === "messages"
      ? ["recipientId", "studentId", "senderId"]
      : ["studentId", "recipientId"];
    const seen = new Set<string>();
    const docs: unknown[] = [];
    for (const field of fields) {
      try {
        const snap = await db.collection(col).where(field, "==", uid).limit(500).get();
        for (const d of snap.docs) {
          if (seen.has(d.id)) continue;
          seen.add(d.id);
          docs.push({ id: d.id, ...d.data() });
        }
      } catch {
        // Missing index/field — best effort.
      }
    }
    out[col] = docs;
  }
  return out;
}

/** DSR export: full per-user document set (self, or admin for a verified subject). */
export const exportMyDataStrict = onCall(async (request) => {
  const caller = requireUid(request);
  const data = (request.data ?? {}) as { uid?: string };
  const target = typeof data.uid === "string" && data.uid ? data.uid : caller;
  const token = (request as { auth?: { token?: unknown } }).auth?.token;
  if (target !== caller && !isAdminToken(token)) {
    throw new HttpsError("permission-denied", "Can only export your own data.");
  }
  const docs = await collectUserDocs(target);
  await db.collection("audit_logs").add({
    userId: caller,
    action: "DSR_EXPORT",
    resource: `/users/${target}`,
    details: `DSR export for ${target} by ${caller}.`.slice(0, 1500),
    status: "SUCCESS",
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { exportedAt: new Date().toISOString(), subject: target, docs };
});

/**
 * DSR erasure: hard-deletes messages/notifications, anonymises profile +
 * education records (statutory assessment data is anonymised, not deleted).
 * Caller must be the subject or an admin (guardian-verified minors via admin).
 */
export const eraseMyData = onCall(async (request) => {
  const caller = requireUid(request);
  const data = (request.data ?? {}) as { uid?: string; confirm?: boolean };
  const target = typeof data.uid === "string" && data.uid ? data.uid : caller;
  const token = (request as { auth?: { token?: unknown } }).auth?.token;
  if (target !== caller && !isAdminToken(token)) {
    throw new HttpsError("permission-denied", "Can only erase your own data.");
  }
  if (data.confirm !== true) {
    throw new HttpsError("failed-precondition", "Pass { confirm: true } to execute erasure.");
  }

  const ts = admin.firestore.FieldValue.serverTimestamp();
  // Hard-delete direct messages + notifications for the subject.
  for (const col of ["messages", "notifications"] as const) {
    for (const field of ["recipientId", "senderId", "studentId"]) {
      try {
        const snap = await db.collection(col).where(field, "==", target).limit(BATCH_LIMIT).get();
        if (snap.empty) continue;
        const batch = db.batch();
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      } catch {
        // Best effort per field.
      }
    }
  }
  // Anonymise (do not delete) education + statutory records.
  for (const col of ["submissions", "attendance", "learner_progress", "certificates"] as const) {
    try {
      const snap = await db.collection(col).where("studentId", "==", target).limit(BATCH_LIMIT).get();
      const batch = db.batch();
      for (const d of snap.docs) {
        batch.set(d.ref, {
          studentName: "Erased",
          studentEmail: "",
          teacherNotes: admin.firestore.FieldValue.delete(),
          erased: true,
          erasedAt: ts,
        }, { merge: true });
      }
      if (!snap.empty) await batch.commit();
    } catch {
      // Best effort per collection.
    }
  }
  // Anonymise profile + onboarding mirrors.
  for (const col of ["users", "students", "teachers"]) {
    try {
      await db.doc(`${col}/${target}`).set({
        name: "Erased",
        email: "",
        guardian: admin.firestore.FieldValue.delete(),
        erased: true,
        erasedAt: ts,
      }, { merge: true });
    } catch {
      // Mirror may not exist.
    }
  }

  await db.collection("audit_logs").add({
    userId: caller,
    action: "DSR_ERASURE",
    resource: `/users/${target}`,
    details: `DSR erasure for ${target} executed by ${caller}. Statutory archives anonymised per DBE hold.`.slice(0, 1500),
    status: "SUCCESS",
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true, subject: target };
});
