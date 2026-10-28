/**
 * Triple4Curriculum Phase 1 backend trust layer.
 * All privileged writes (XP, grades, roles, secrets) happen here — never in the client.
 */
import { createHash } from "node:crypto";
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
export * from "./attendanceThanks";

// ── Payment webhooks (signature-verified, PayFast-validated, idempotent) ───

/** Monthly ZAR tuition per phase, matching the published pricing table. */
const PAYFAST_MONTHLY_ZAR: Record<string, number> = {
  Foundation: 1500,
  Intermediate: 2500,
  Senior: 3500,
  FET: 4500,
};
const PAYFAST_ANNUAL_MONTHS = 12;

/**
 * PayFast signature: sort fields, URL-encode values (%20 -> +), join with &,
 * then append "&passphrase=<encoded>" when a passphrase is configured.
 */
function payfastSignature(fields: Record<string, string>, passphrase: string): string {
  const pairs = Object.keys(fields)
    .filter((key) => key !== "signature" && fields[key] !== undefined && fields[key] !== null && fields[key] !== "")
    .sort()
    .map((key) => `${key}=${encodeURIComponent(fields[key]).replace(/%20/g, "+")}`)
    .join("&");
  const withPassphrase = passphrase
    ? `${pairs}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : pairs;
  return createHash("md5").update(withPassphrase).digest("hex");
}

const CheckoutSchema = z.object({
  plan: z.enum(["monthly", "annual"]).default("monthly"),
  phase: z.string().max(40).optional(),
});

/**
 * Creates a pending payment + returns the PayFast process URL and signed fields.
 * The client POSTs those fields (full-page redirect), so card details never
 * touch T4C / Firebase. Amount is computed server-side from the phase.
 */
export const createPayfastCheckout = onCall(
  { secrets: ["PAYFAST_MERCHANT_ID", "PAYFAST_MERCHANT_KEY", "PAYFAST_PASSPHRASE"] },
  async (request) => {
    const uid = requireAuthUid(request);
    const parsed = CheckoutSchema.safeParse(request.data ?? {});
    if (!parsed.success) throw new HttpsError("invalid-argument", "Invalid checkout request.");
    const { plan } = parsed.data;

    const userSnap = await db.doc(`users/${uid}`).get();
    const user = (userSnap.data() ?? {}) as Record<string, unknown>;
    const phase = parsed.data.phase || String(user.departmentId ?? user.department ?? "");
    const monthly = PAYFAST_MONTHLY_ZAR[phase];
    if (!monthly) {
      throw new HttpsError(
        "failed-precondition",
        "Select a phase (Foundation, Intermediate, Senior or FET) before paying.",
      );
    }

    const merchantId = process.env.PAYFAST_MERCHANT_ID ?? "";
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY ?? "";
    // Secret Manager cannot store an empty value; "none" = no passphrase.
    const passphrase = process.env.PAYFAST_PASSPHRASE === "none" ? "" : (process.env.PAYFAST_PASSPHRASE ?? "");
    if (!merchantId || !merchantKey) {
      throw new HttpsError("failed-precondition", "PayFast is not configured yet.");
    }

    const amount = (plan === "annual" ? monthly * PAYFAST_ANNUAL_MONTHS : monthly).toFixed(2);
    const base = (process.env.APP_BASE_URL || "https://triple4c.com").replace(/\/$/, "");
    const sandbox = (process.env.PAYFAST_SANDBOX ?? "").toLowerCase() === "true";
    const project = process.env.GCLOUD_PROJECT || "triple4curriculum";

    const token = (request.auth?.token ?? {}) as Record<string, unknown>;
    const email = String(user.email ?? token.email ?? "");
    const fullName = String(user.name ?? token.name ?? "Triple 4C Parent").trim();
    const [firstName, ...rest] = fullName.split(/\s+/);
    const mPaymentId = `t4c_${uid.slice(0, 8)}_${Date.now()}`;

    const fields: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${base}/dashboard?payment=success`,
      cancel_url: `${base}/onboarding?payment=cancelled`,
      notify_url: `https://us-central1-${project}.cloudfunctions.net/payfastWebhook`,
      name_first: firstName || "Triple 4C",
      name_last: rest.join(" ") || "Parent",
      email_address: email,
      m_payment_id: mPaymentId,
      amount,
      item_name: `Triple 4C ${phase} tuition (${plan})`.slice(0, 100),
      email_confirmation: "1",
      confirmation_address: email,
    };
    const signature = payfastSignature(fields, passphrase);

    await db.doc(`payments/${mPaymentId}`).set({
      provider: "payfast",
      uid,
      phase,
      plan,
      amount: Number(amount),
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      url: sandbox
        ? "https://sandbox.payfast.co.za/eng/process"
        : "https://www.payfast.co.za/eng/process",
      fields: { ...fields, signature },
      sandbox,
      mPaymentId,
    };
  },
);

export const payfastWebhook = onRequest(
  { secrets: ["PAYFAST_MERCHANT_ID", "PAYFAST_MERCHANT_KEY", "PAYFAST_PASSPHRASE"] },
  async (req, res): Promise<void> => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    const body = (req.body ?? {}) as Record<string, string>;
    const passphrase = process.env.PAYFAST_PASSPHRASE === "none" ? "" : (process.env.PAYFAST_PASSPHRASE ?? "");
    const { signature, ...params } = body;

    // 1. Signature: recompute over sorted fields (+ passphrase).
    const expected = payfastSignature(params, passphrase);
    if (!signature || String(signature).toLowerCase() !== expected) {
      console.warn("payfast webhook: bad signature", body.m_payment_id);
      res.status(400).send("Bad signature");
      return;
    }

    const paymentId = String(body.m_payment_id ?? "");
    const paymentRef = paymentId ? db.doc(`payments/${paymentId}`) : null;
    const paymentSnap = paymentRef ? await paymentRef.get() : null;
    const payment = (paymentSnap?.data() ?? null) as
      | { uid?: string; amount?: number; plan?: string; phase?: string }
      | null;

    // 2. Amount must match the pending payment we created (prevents tampering).
    const gross = Number(body.amount_gross ?? body.amount ?? 0);
    if (payment && Number.isFinite(gross) && Math.abs(Number(payment.amount ?? 0) - gross) > 0.01) {
      console.warn("payfast webhook: amount mismatch", { paymentId, expected: payment.amount, gross });
      res.status(400).send("Amount mismatch");
      return;
    }

    // 3. Server-to-server validation with PayFast (the authoritative check).
    const sandbox = (process.env.PAYFAST_SANDBOX ?? "").toLowerCase() === "true";
    const validateUrl = sandbox
      ? "https://sandbox.payfast.co.za/eng/query/validate"
      : "https://www.payfast.co.za/eng/query/validate";
    try {
      const validation = await fetch(validateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(body).toString(),
      });
      const verdict = (await validation.text()).trim().toUpperCase();
      if (verdict !== "VALID") {
        console.warn("payfast webhook: validation failed", { paymentId, verdict });
        res.status(400).send("Invalid");
        return;
      }
    } catch (e) {
      console.error("payfast webhook: validation request failed", e);
      res.status(500).send("Validation unavailable");
      return;
    }

    const status = String(body.payment_status ?? "UNKNOWN").toUpperCase();
    const record = {
      provider: "payfast",
      eventType: status,
      pfPaymentId: String(body.pf_payment_id ?? ""),
      amountGross: gross,
      payload: body,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (paymentRef) {
      await paymentRef.set({ ...record, status }, { merge: true });
    } else {
      // Unknown reference: keep an audit record but do not grant access.
      await db.collection("payments").add({ ...record, status, unlinked: true });
    }

    // 4. On success, unlock the learner's payment status (idempotent).
    if (status === "COMPLETE" && payment?.uid) {
      await db.doc(`students/${payment.uid}`).set(
        {
          payment: {
            status: "paid",
            provider: "payfast",
            plan: payment.plan ?? "monthly",
            phase: payment.phase ?? "",
            lastPaymentId: paymentId,
            paidAt: stamp(),
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      await db.collection("audit_logs").add({
        userId: payment.uid,
        action: "PAYFAST_PAYMENT_COMPLETE",
        resource: `/payments/${paymentId}`,
        details: `${payment.phase ?? ""} ${payment.plan ?? ""} tuition paid: R${gross.toFixed(2)}.`,
        status: "SUCCESS",
        timestamp: stamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.status(200).send("OK");
  },
);
