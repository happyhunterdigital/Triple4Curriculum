/**
 * Triple4Curriculum Phase 1 backend trust layer.
 * All privileged writes (XP, grades, roles, secrets) happen here — never in the client.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import * as admin from "firebase-admin";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import { z } from "zod";

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

type Role = "teacher" | "learner" | "admin";

const RoleSchema = z.enum(["teacher", "learner", "admin"]);

function requireAuthUid(request: { auth?: { uid: string } | null }): string {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }
  return request.auth.uid;
}

function tokenRole(request: {
  auth?: { uid: string; token?: Record<string, unknown> } | null;
}): string | undefined {
  const t = request.auth?.token;
  if (!t || typeof t !== "object") return undefined;
  const r = (t as Record<string, unknown>).role;
  return typeof r === "string" ? r : undefined;
}

function requireAdmin(request: {
  auth?: { uid: string; token?: Record<string, unknown> } | null;
}): string {
  const uid = requireAuthUid(request);
  const t = request.auth?.token as Record<string, unknown> | undefined;
  const isAdmin = t?.role === "admin" || t?.admin === true;
  if (!isAdmin) throw new HttpsError("permission-denied", "Admin only.");
  return uid;
}

function requireStaff(request: {
  auth?: { uid: string; token?: Record<string, unknown> } | null;
}): string {
  const uid = requireAuthUid(request);
  const role = tokenRole(request);
  const t = request.auth?.token as Record<string, unknown> | undefined;
  const ok = t?.role === "admin" || t?.admin === true || role === "teacher" || role === "lecturer";
  if (!ok) throw new HttpsError("permission-denied", "Staff only.");
  return uid;
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function yyyymmdd(d = new Date()): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function minuteKey(d = new Date()): string {
  return d.toISOString().slice(0, 16).replace(/[-:T]/g, "");
}

function stamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 16);
}

// ── setCustomRole (admin-only) ──────────────────────────────────────────────

const SetRoleSchema = z.object({
  uid: z.string().min(1).max(128),
  role: RoleSchema,
});

export const setCustomRole = onCall(async (request) => {
  requireAdmin(request);
  const parsed = SetRoleSchema.safeParse(request.data);
  if (!parsed.success) throw new HttpsError("invalid-argument", "uid and role required.");
  const { uid, role } = parsed.data;
  const claimsRole: Role = role;
  await auth.setCustomUserClaims(uid, { role: claimsRole });
  await db.doc(`users/${uid}`).set(
    { role: claimsRole, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true },
  );
  return { success: true, uid, role: claimsRole };
});

// ── generateQuiz (auth, quota 20/day, cache) ────────────────────────────────

const QuizSchema = z.object({
  topic: z.string().min(1).max(200),
  difficulty: z.string().min(1).max(80).optional(),
});

interface Quiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
}

function cannedQuiz(topic: string): Quiz {
  return {
    question: `Under the 444 Curriculum framework for ${topic}, what is the primary guarantee provided by state machine replication?`,
    options: [
      "Deterministic state convergence across all un-crashed nodes executing log operations in the identical sequence",
      "Elimination of network hardware latency",
      "Automatic conversion of all unstructured data into relational tables",
      "Zero CPU overhead during cryptographic signing",
    ],
    correctIndex: 0,
    explanation:
      "State machine replication guarantees identical inputs executed in exact order on deterministic machines produce identical state.",
    xpReward: 150,
  };
}

async function geminiQuiz(topic: string, difficulty: string): Promise<Quiz | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const prompt =
      `Return ONLY valid JSON with keys question, options (4 strings), correctIndex (0-3), ` +
      `explanation, xpReward (number). Topic: ${topic}. Level: ${difficulty}.`;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    const parsed = JSON.parse(text.slice(start, end + 1)) as Partial<Quiz>;
    if (
      typeof parsed.question !== "string" ||
      !Array.isArray(parsed.options) ||
      parsed.options.length !== 4 ||
      typeof parsed.correctIndex !== "number"
    ) {
      return null;
    }
    return {
      question: parsed.question,
      options: parsed.options.map(String),
      correctIndex: Math.min(3, Math.max(0, Math.floor(parsed.correctIndex))),
      explanation: String(parsed.explanation ?? ""),
      xpReward: Number(parsed.xpReward ?? 150),
    };
  } catch {
    return null;
  }
}

export const generateQuiz = onCall(
  { secrets: ["GEMINI_API_KEY"] },
  async (request) => {
    const uid = requireAuthUid(request);
    const parsed = QuizSchema.safeParse(request.data);
    if (!parsed.success) throw new HttpsError("invalid-argument", "topic required.");
    const topic = parsed.data.topic.trim();
    const difficulty = (parsed.data.difficulty ?? "Undergraduate Level 3").trim();

    // Per-uid daily quota: 20.
    const quotaId = `${uid}_${yyyymmdd()}`;
    const quotaRef = db.doc(`quiz_quotas/${quotaId}`);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(quotaRef);
      const count = Number((snap.data()?.count ?? 0) as number);
      if (count >= 20) throw new HttpsError("resource-exhausted", "Daily quiz quota reached (20).");
      tx.set(quotaRef, { uid, count: count + 1, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    });

    // Cache per topic + difficulty.
    const cacheId = sha256(`${topic.toLowerCase()}::${difficulty.toLowerCase()}`).slice(0, 48);
    const cacheRef = db.doc(`quiz_cache/${cacheId}`);
    const cached = await cacheRef.get();
    if (cached.exists) {
      const data = cached.data() as { quiz?: Quiz } | undefined;
      if (data?.quiz?.question) return { quiz: data.quiz, cached: true };
    }

    const quiz = (await geminiQuiz(topic, difficulty)) ?? cannedQuiz(topic);
    await cacheRef.set({
      topic,
      difficulty,
      quiz,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { quiz, cached: false };
  },
);

// ── completeLectureAndAwardXP (auth, server-side XP) ─────────────────────────

const CompleteLectureSchema = z.object({
  lectureId: z.string().min(1).max(128),
  quizPassed: z.boolean().optional(),
  studentId: z.string().min(1).max(128).optional(),
});

export const completeLectureAndAwardXP = onCall(async (request) => {
  const caller = requireAuthUid(request);
  const parsed = CompleteLectureSchema.safeParse(request.data);
  if (!parsed.success) throw new HttpsError("invalid-argument", "lectureId required.");
  const { lectureId, quizPassed } = parsed.data;

  // Learners may only award XP to themselves; staff may pass studentId.
  let target = caller;
  const role = tokenRole(request);
  const isStaffCaller =
    (request.auth?.token as Record<string, unknown> | undefined)?.admin === true ||
    role === "admin" ||
    role === "teacher" ||
    role === "lecturer";
  if (parsed.data.studentId && parsed.data.studentId !== caller) {
    if (!isStaffCaller) throw new HttpsError("permission-denied", "Cannot award XP to others.");
    target = parsed.data.studentId;
  }

  const award = quizPassed ? 200 : 100;
  const result = await db.runTransaction(async (tx) => {
    const userRef = db.doc(`users/${target}`);
    const snap = await tx.get(userRef);
    const prev = (snap.data() ?? {}) as Record<string, unknown>;
    const prevXp = Number(prev.xp ?? 0);
    const xp = prevXp + award;
    const level = Math.floor(xp / 400) + 1;
    tx.set(
      userRef,
      {
        xp,
        level,
        streakDays: Number(prev.streakDays ?? 0) + 1,
        lastActiveDate: new Date().toISOString().slice(0, 10),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    const lectureRef = db.doc(`lectures/${lectureId}`);
    tx.set(lectureRef, { completed: true }, { merge: true });
    return { xp, level };
  });

  await db.collection("audit_logs").add({
    userId: caller,
    action: "LECTURE_COMPLETED",
    resource: `/lectures/${lectureId}`,
    details: `Server-awarded ${award} XP to ${target}.`.slice(0, 1500),
    status: "SUCCESS",
    timestamp: stamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, studentId: target, xpAwarded: award, xp: result.xp, level: result.level };
});

// ── gradeSubmission (staff-only) ─────────────────────────────────────────────

const GradeSchema = z.object({
  submissionId: z.string().min(1).max(128),
  grade: z.number().min(0).max(1000),
  feedback: z.string().max(5000).optional(),
  rubricScores: z.record(z.string(), z.number()).optional(),
  graderName: z.string().max(120).optional(),
});

export const gradeSubmission = onCall(async (request) => {
  const caller = requireAuthUid(request);
  requireStaff(request);
  const parsed = GradeSchema.safeParse(request.data);
  if (!parsed.success) throw new HttpsError("invalid-argument", "submissionId and grade required.");

  const { submissionId, grade, feedback, rubricScores, graderName } = parsed.data;
  const subRef = db.doc(`submissions/${submissionId}`);
  const snap = await subRef.get();
  if (!snap.exists) throw new HttpsError("not-found", "Submission not found.");
  const current = snap.data() as Record<string, unknown>;

  await subRef.update({
    status: "graded",
    grade: Number(grade),
    feedback: feedback ?? "",
    rubricScores: rubricScores ?? {},
    gradedBy: graderName ?? caller,
    gradedAt: stamp(),
  });
  await db.collection("notifications").add({
    recipientRole: "student",
    recipientId: current.studentId,
    title: `Assignment Graded: ${String(current.assignmentTitle ?? "Assignment")}`,
    message: `Score: ${grade}. Graded by ${graderName ?? caller}. Check detailed rubric feedback.`,
    category: "grading",
    timestamp: stamp(),
    read: false,
    actionUrl: "/assignments",
    priority: "high",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true, submissionId };
});

// ── writeAudit (auth, size-checked, 30/min quota) ───────────────────────────

const AuditSchema = z.object({
  action: z.string().min(1).max(120),
  resource: z.string().min(1).max(300),
  details: z.string().min(1).max(1500),
});

export const writeAudit = onCall(async (request) => {
  const uid = requireAuthUid(request);
  const parsed = AuditSchema.safeParse(request.data);
  if (!parsed.success) throw new HttpsError("invalid-argument", "action/resource/details required.");

  const quotaId = `${uid}_${minuteKey()}`;
  const quotaRef = db.doc(`audit_quotas/${quotaId}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(quotaRef);
    const count = Number((snap.data()?.count ?? 0) as number);
    if (count >= 30) throw new HttpsError("resource-exhausted", "Audit rate limit (30/min).");
    tx.set(quotaRef, { uid, count: count + 1 }, { merge: true });
  });

  const ref = await db.collection("audit_logs").add({
    userId: uid,
    userName: String((request.auth?.token as Record<string, unknown> | undefined)?.name ?? uid),
    action: parsed.data.action,
    resource: parsed.data.resource,
    details: parsed.data.details,
    status: "SUCCESS",
    timestamp: stamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true, id: ref.id };
});

// ── sendEmailNudge (staff-only, Resend stub + notification/message writes) ───

const NudgeSchema = z.object({
  recipientId: z.string().min(1).max(128),
  title: z.string().min(1).max(160),
  message: z.string().min(1).max(4000),
  email: z.string().email().optional(),
});

export const sendEmailNudge = onCall(
  { secrets: ["RESEND_API_KEY"] },
  async (request) => {
    const caller = requireAuthUid(request);
    requireStaff(request);
    const parsed = NudgeSchema.safeParse(request.data);
    if (!parsed.success) throw new HttpsError("invalid-argument", "recipientId/title/message required.");
    const { recipientId, title, message, email } = parsed.data;

    // Best-effort email via Resend; stub (log + continue) when unconfigured.
    const apiKey = process.env.RESEND_API_KEY;
    let emailSent = false;
    if (apiKey && email) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Triple4Curriculum <noreply@triple4c.com>",
            to: [email],
            subject: title,
            text: message,
          }),
        });
        emailSent = res.ok;
      } catch {
        emailSent = false;
      }
    }

    const ts = admin.firestore.FieldValue.serverTimestamp();
    await db.collection("notifications").add({
      recipientRole: "student",
      recipientId,
      title,
      message,
      category: "academic",
      timestamp: stamp(),
      read: false,
      priority: "high",
      actionUrl: "/lectures",
      createdAt: ts,
    });
    await db.collection("messages").add({
      senderId: caller,
      channelId: "staff-nudge",
      recipientId,
      message: `[STAFF NUDGE] ${message}`.slice(0, 4000),
      timestamp: stamp(),
      createdAt: ts,
    });
    return { success: true, emailSent };
  },
);

// ── createCertificate (staff or self-completion) ─────────────────────────────

const CertSchema = z.object({
  studentId: z.string().min(1).max(128).optional(),
  courseId: z.string().min(1).max(128),
  courseTitle: z.string().min(1).max(200).optional(),
});

export const createCertificate = onCall(async (request) => {
  const caller = requireAuthUid(request);
  const parsed = CertSchema.safeParse(request.data);
  if (!parsed.success) throw new HttpsError("invalid-argument", "courseId required.");

  const role = tokenRole(request);
  const isStaffCaller =
    (request.auth?.token as Record<string, unknown> | undefined)?.admin === true ||
    role === "admin" ||
    role === "teacher" ||
    role === "lecturer";
  const studentId = parsed.data.studentId ?? caller;
  if (studentId !== caller && !isStaffCaller) {
    throw new HttpsError("permission-denied", "Cannot issue certificates to others.");
  }

  const ref = await db.collection("certificates").add({
    studentId,
    courseId: parsed.data.courseId,
    courseTitle: parsed.data.courseTitle ?? parsed.data.courseId,
    issuedBy: caller,
    storagePath: `certificates/${studentId}/${parsed.data.courseId}.pdf`,
    status: "issued",
    issuedAt: stamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true, id: ref.id, storagePath: `certificates/${studentId}/${parsed.data.courseId}.pdf` };
});

// ── Phase 4: retention + DSR (purgeExpired, exportMyDataStrict, eraseMyData) ──
export * from "./retention";
export * from "./youtubeSync";

// ── Payment webhooks (signature-verification stubs, idempotent writes) ──────

function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    return ba.length === bb.length && timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export const stripeWebhook = onRequest(
  { secrets: ["STRIPE_SECRET", "STRIPE_WEBHOOK_SECRET"] },
  async (req, res): Promise<void> => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = String(req.headers["stripe-signature"] ?? "");
    const raw = (req as { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
    // Verification stub: when a secret is configured, require a parseable
    // t=...,v1=... header and constant-time compare the v1 digest.
    if (secret) {
      const match = signature.match(/v1=([a-f0-9]+)/i);
      const expected = createHmac("sha256", secret).update(raw).digest("hex");
      if (!match || !safeEqualHex(match[1].toLowerCase(), expected)) {
        res.status(400).send("Bad signature");
        return;
      }
    }
    const event = (req.body ?? {}) as { id?: string; type?: string; data?: unknown };
    const id = String(event.id ?? `evt_${sha256(String(raw)).slice(0, 16)}`);
    await db.doc(`payments/${id}`).set(
      {
        provider: "stripe",
        eventType: String(event.type ?? "unknown"),
        payload: event,
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    res.status(200).json({ received: true, id });
  },
);

export const payfastWebhook = onRequest(
  { secrets: ["PAYFAST_MERCHANT_KEY", "PAYFAST_PASSPHRASE"] },
  async (req, res): Promise<void> => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }
    const body = (req.body ?? {}) as Record<string, string>;
    const passphrase = process.env.PAYFAST_PASSPHRASE ?? "";
    // Verification stub: recompute the PayFast MD5 signature over sorted
    // params (+ passphrase) and compare when a passphrase is configured.
    if (passphrase) {
      const { signature, ...rest } = body;
      const pairs = Object.keys(rest)
        .sort()
        .map((k) => `${k}=${encodeURIComponent(String(rest[k])).replace(/%20/g, "+")}`)
        .join("&");
      const expected = createHash("md5").update(`${pairs}&passphrase=${encodeURIComponent(passphrase)}`).digest("hex");
      if (!signature || String(signature).toLowerCase() !== expected) {
        res.status(400).send("Bad signature");
        return;
      }
    }
    const id = String(body.pf_payment_id ?? body.m_payment_id ?? `pf_${Date.now()}`);
    await db.doc(`payments/${id}`).set(
      {
        provider: "payfast",
        eventType: String(body.payment_status ?? "notify"),
        payload: body,
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    res.status(200).send("OK");
  },
);
