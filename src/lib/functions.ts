import { getFunctions, httpsCallable } from "firebase/functions";
import app from "./firebase";

const functions = getFunctions(app);

export interface Quiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
}

export interface QuizResponse {
  quiz: Quiz;
  cached?: boolean;
}

function cannedQuiz(topic: string): Quiz {
  return {
    question: `Under the 444 Curriculum framework for ${topic || "Distributed Consensus"}, what is the primary guarantee provided by state machine replication?`,
    options: [
      "Deterministic state convergence across all un-crashed nodes executing log operations in the identical sequence",
      "Elimination of network hardware latency",
      "Automatic conversion of all unstructured data into relational tables",
      "Zero CPU overhead during cryptographic signing",
    ],
    correctIndex: 0,
    explanation:
      "State machine replication guarantees that identical inputs executed in the exact order on deterministic state machines produce identical state transitions.",
    xpReward: 150,
  };
}

async function callFn<T>(name: string, payload: unknown, fallback: T): Promise<T> {
  try {
    const fn = httpsCallable<unknown, T>(functions, name);
    const res = await fn(payload);
    return res.data;
  } catch {
    return fallback;
  }
}

export async function generateQuiz(topic: string, difficulty = "Undergraduate Level 3"): Promise<QuizResponse> {
  const fallback: QuizResponse = { quiz: cannedQuiz(topic), cached: false };
  try {
    const fn = httpsCallable<{ topic: string; difficulty: string }, QuizResponse>(functions, "generateQuiz");
    const res = await fn({ topic, difficulty });
    if (res.data?.quiz?.question) return res.data;
    return fallback;
  } catch {
    return fallback;
  }
}

export interface CompleteLectureResult {
  success: boolean;
  studentId: string;
  xpAwarded: number;
  xp: number;
  level: number;
}

export function completeLecture(
  lectureId: string,
  quizPassed: boolean,
  studentId?: string,
): Promise<CompleteLectureResult> {
  return callFn<CompleteLectureResult>(
    "completeLectureAndAwardXP",
    { lectureId, quizPassed, studentId },
    { success: false, studentId: studentId ?? "", xpAwarded: 0, xp: 0, level: 1 },
  );
}

export interface GradeResult {
  success: boolean;
  submissionId: string;
}

export function gradeSubmission(
  submissionId: string,
  payload: { grade: number; feedback?: string; rubricScores?: Record<string, number>; graderName?: string },
): Promise<GradeResult> {
  return callFn<GradeResult>("gradeSubmission", { submissionId, ...payload }, { success: false, submissionId });
}

export function setRole(uid: string, role: "teacher" | "learner" | "admin"): Promise<{ success: boolean }> {
  return callFn("setCustomRole", { uid, role }, { success: false });
}

export function sendNudge(payload: {
  recipientId: string;
  title: string;
  message: string;
  email?: string;
}): Promise<{ success: boolean; emailSent: boolean }> {
  return callFn("sendEmailNudge", payload, { success: false, emailSent: false });
}

export function createCertificate(payload: {
  courseId: string;
  courseTitle?: string;
  studentId?: string;
}): Promise<{ success: boolean; id: string; storagePath: string }> {
  return callFn("createCertificate", payload, { success: false, id: "", storagePath: "" });
}

export function writeAuditEntry(
  action: string,
  resource: string,
  details: string,
): Promise<{ success: boolean; id: string }> {
  return callFn("writeAudit", { action, resource, details }, { success: false, id: "" });
}

export { functions };
