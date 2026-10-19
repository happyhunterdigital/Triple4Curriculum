/**
 * Phase 4: SA-SAMS CSV builders (uncertified client-side import files).
 * Fixed column headers, row validation, CSV escaping, download helper.
 * Always verify the import in a SA-SAMS test environment before relying on it.
 */
import type { AssignmentSubmission, AttendanceRecord } from "../types";

// ── SA-SAMS column headers ──────────────────────────────────────────────────

export const SAMS_ATTENDANCE_HEADERS = [
  "LearnerID",
  "Surname",
  "FirstName",
  "Grade",
  "Class",
  "Date",
  "AttendanceCode",
  "MinutesLate",
  "Method",
  "CapturedBy",
] as const;

export const SAMS_RESULTS_HEADERS = [
  "LearnerID",
  "Surname",
  "FirstName",
  "Grade",
  "SubjectCode",
  "Subject",
  "AssessmentTask",
  "Term",
  "MarkObtained",
  "MaxMark",
  "Percentage",
  "LevelCode",
  "DateCaptured",
  "Grader",
] as const;

export type SamsAttendanceRow = {
  learnerId: string;
  surname?: string;
  firstName?: string;
  grade?: string;
  className?: string;
  date: string; // YYYY-MM-DD
  status: AttendanceRecord["status"] | string;
  minutesLate?: number;
  method?: string;
  capturedBy?: string;
};

export type SamsResultRow = {
  learnerId: string;
  surname?: string;
  firstName?: string;
  grade?: string;
  subjectCode: string;
  subject?: string;
  task: string;
  term?: string;
  mark: number;
  maxMark: number;
  dateCaptured?: string; // YYYY-MM-DD
  grader?: string;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function splitName(full: string): { surname: string; firstName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { surname: "", firstName: "" };
  if (parts.length === 1) return { surname: parts[0], firstName: "" };
  return { surname: parts[parts.length - 1], firstName: parts.slice(0, -1).join(" ") };
}

export function attendanceCode(status: string): "P" | "L" | "A" {
  const s = status.trim().toLowerCase();
  if (s.startsWith("present")) return "P";
  if (s.startsWith("late")) return "L";
  return "A";
}

export function levelCode(percentage: number): string {
  if (percentage >= 80) return "7";
  if (percentage >= 70) return "6";
  if (percentage >= 60) return "5";
  if (percentage >= 50) return "4";
  if (percentage >= 40) return "3";
  if (percentage >= 30) return "2";
  return "1";
}

/** Validate one attendance row; returns error strings (empty = valid). */
export function validateAttendanceRow(row: SamsAttendanceRow): string[] {
  const errors: string[] = [];
  if (!row.learnerId?.trim()) errors.push("LearnerID is required");
  if (!row.date || !DATE_RE.test(row.date)) errors.push(`Date must be YYYY-MM-DD (got "${row.date}")`);
  if (!["present", "late", "absent"].includes(row.status.trim().toLowerCase())) {
    errors.push(`Status must be Present/Late/Absent (got "${row.status}")`);
  }
  if (row.minutesLate !== undefined && (!Number.isFinite(row.minutesLate) || row.minutesLate < 0)) {
    errors.push("MinutesLate must be a non-negative number");
  }
  return errors;
}

/** Validate one result row; returns error strings (empty = valid). */
export function validateResultRow(row: SamsResultRow): string[] {
  const errors: string[] = [];
  if (!row.learnerId?.trim()) errors.push("LearnerID is required");
  if (!row.subjectCode?.trim()) errors.push("SubjectCode is required");
  if (!row.task?.trim()) errors.push("AssessmentTask is required");
  if (!Number.isFinite(row.mark) || !Number.isFinite(row.maxMark) || row.maxMark <= 0) {
    errors.push("Mark/MaxMark must be numbers with MaxMark > 0");
  } else if (row.mark < 0 || row.mark > row.maxMark) {
    errors.push(`Mark ${row.mark} out of range 0–${row.maxMark}`);
  }
  if (row.dateCaptured && !DATE_RE.test(row.dateCaptured)) {
    errors.push(`DateCaptured must be YYYY-MM-DD (got "${row.dateCaptured}")`);
  }
  return errors;
}

function esc(value: unknown): string {
  const s = String(value ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(headers: readonly string[], rows: string[][]): string {
  return [headers.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n") + "\n";
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Build a SA-SAMS attendance CSV from attendance records. Throws on validation errors. */
export function buildSamsAttendanceCSV(records: AttendanceRecord[]): string {
  const rows: string[][] = [];
  const errors: string[] = [];
  records.forEach((r, i) => {
    const { surname, firstName } = splitName(r.studentName || "");
    const row: SamsAttendanceRow = {
      learnerId: r.studentId,
      surname,
      firstName,
      grade: "",
      className: r.courseCode,
      date: (r.date || "").slice(0, 10),
      status: r.status,
      minutesLate: r.status === "Late" ? 0 : 0,
      method: r.method,
      capturedBy: "",
    };
    const errs = validateAttendanceRow(row);
    if (errs.length) errors.push(`row ${i + 1} (${r.id}): ${errs.join("; ")}`);
    rows.push([
      row.learnerId, surname, firstName, "", r.courseCode, row.date,
      attendanceCode(row.status), String(row.minutesLate ?? 0), r.method || "", "",
    ]);
  });
  if (errors.length) throw new Error(`Invalid attendance rows:\n${errors.join("\n")}`);
  return toCsv(SAMS_ATTENDANCE_HEADERS, rows);
}

/** Build a SA-SAMS results CSV from graded submissions. Throws on validation errors. */
export function buildSamsResultsCSV(
  submissions: AssignmentSubmission[],
  opts?: { term?: string; grade?: string },
): string {
  const rows: string[][] = [];
  const errors: string[] = [];
  submissions.forEach((s, i) => {
    const { surname, firstName } = splitName(s.studentName || "");
    const max = Number(s.maxGrade || 0);
    const mark = Number(s.grade ?? NaN);
    const row: SamsResultRow = {
      learnerId: s.studentId,
      surname,
      firstName,
      grade: opts?.grade ?? "",
      subjectCode: s.courseCode,
      subject: "",
      task: s.assignmentTitle,
      term: opts?.term ?? "",
      mark,
      maxMark: max,
      dateCaptured: (s.gradedAt || s.submittedAt || todayIso()).slice(0, 10),
      grader: s.gradedBy ?? "",
    };
    const errs = validateResultRow(row);
    if (errs.length) errors.push(`row ${i + 1} (${s.id}): ${errs.join("; ")}`);
    const pct = max > 0 && Number.isFinite(mark) ? Math.round((mark / max) * 100) : 0;
    rows.push([
      row.learnerId, surname, firstName, row.grade ?? "", s.courseCode, "",
      s.assignmentTitle, row.term ?? "", String(mark), String(max),
      String(pct), levelCode(pct), row.dateCaptured ?? todayIso(), s.gradedBy ?? "",
    ]);
  });
  if (errors.length) throw new Error(`Invalid result rows:\n${errors.join("\n")}`);
  return toCsv(SAMS_RESULTS_HEADERS, rows);
}

/** Trigger a browser download of CSV text (no-op outside a DOM environment). */
export function downloadCsv(filename: string, csv: string): void {
  if (typeof document === "undefined" || typeof URL === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
