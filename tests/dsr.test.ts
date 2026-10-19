import { describe, it, expect } from "vitest";
import {
  ageFromDob,
  isMinor,
  isUnder13,
  requiresGuardianConsent,
  requiresVerifiableGuardianConsent,
  validateGuardian,
  withGuardianPayload,
} from "../src/lib/guardian";
import {
  SAMS_ATTENDANCE_HEADERS,
  SAMS_RESULTS_HEADERS,
  attendanceCode,
  buildSamsAttendanceCSV,
  buildSamsResultsCSV,
  levelCode,
  validateAttendanceRow,
  validateResultRow,
} from "../src/lib/sams";
import type { AssignmentSubmission, AttendanceRecord } from "../src/types";

const NOW = new Date("2026-10-15T00:00:00Z");

function attendance(over: Partial<AttendanceRecord> = {}): AttendanceRecord {
  return {
    id: "att1",
    date: "2026-09-01",
    courseId: "csc441",
    courseCode: "CSC-441",
    courseTitle: "Distributed Consensus",
    studentId: "learner1",
    studentName: "Lerato Dlamini",
    status: "Present",
    method: "Self Check-in",
    ...over,
  };
}

function submission(over: Partial<AssignmentSubmission> = {}): AssignmentSubmission {
  return {
    id: "sub1",
    assignmentId: "a1",
    assignmentTitle: "Raft Leader Election Lab",
    courseCode: "CSC-441",
    studentId: "learner1",
    studentName: "Lerato Dlamini",
    studentEmail: "lerato@example.com",
    submittedAt: "2026-09-10",
    fileName: "lab.pdf",
    fileSizeKb: 1500,
    contentNotes: "notes",
    status: "graded",
    grade: 85,
    maxGrade: 100,
    gradedBy: "Dr. Vance",
    gradedAt: "2026-09-12",
    ...over,
  };
}

describe("guardian helpers (Children's Act / COPPA)", () => {
  it("computes age and minority correctly", () => {
    expect(ageFromDob("2010-01-01", NOW)).toBe(16);
    expect(isMinor("2010-01-01", NOW)).toBe(true);
    expect(isMinor("2000-01-01", NOW)).toBe(false);
    expect(ageFromDob("not-a-date", NOW)).toBeNull();
  });

  it("flags under-13 for verifiable (COPPA) consent", () => {
    expect(isUnder13("2018-01-01", NOW)).toBe(true); // 8
    expect(isUnder13("2010-01-01", NOW)).toBe(false); // 16
    expect(requiresVerifiableGuardianConsent("2018-01-01", NOW)).toBe(true);
    expect(requiresVerifiableGuardianConsent("2010-01-01", NOW)).toBe(false);
    expect(requiresGuardianConsent("2010-01-01", NOW)).toBe(true); // under-18 still needs guardian
  });

  it("validates guardian fields for minors only", () => {
    expect(validateGuardian("2000-01-01", {})).toEqual({});
    const errs = validateGuardian("2010-01-01", { guardianName: "", guardianContact: "" });
    expect(errs.guardianName).toBeTruthy();
    expect(errs.guardianContact).toBeTruthy();
  });

  it("attaches guardian payload for minors, null for adults", () => {
    const minor = withGuardianPayload({ a: 1 }, "2010-01-01", {
      guardianName: "N Dlamini",
      guardianContact: "+27",
      guardianConsentGiven: true,
    });
    expect(minor.isMinor).toBe(true);
    expect(minor.guardian?.consentGiven).toBe(true);
    const adult = withGuardianPayload({ a: 1 }, "2000-01-01", {});
    expect(adult.isMinor).toBe(false);
    expect(adult.guardian).toBeNull();
  });
});

describe("SA-SAMS CSV builders", () => {
  it("exposes fixed SA-SAMS headers", () => {
    expect(SAMS_ATTENDANCE_HEADERS).toContain("LearnerID");
    expect(SAMS_ATTENDANCE_HEADERS).toContain("AttendanceCode");
    expect(SAMS_RESULTS_HEADERS).toContain("SubjectCode");
    expect(SAMS_RESULTS_HEADERS).toContain("LevelCode");
  });

  it("maps attendance status codes and level codes", () => {
    expect(attendanceCode("Present")).toBe("P");
    expect(attendanceCode("Late")).toBe("L");
    expect(attendanceCode("Absent")).toBe("A");
    expect(levelCode(85)).toBe("7");
    expect(levelCode(45)).toBe("3");
    expect(levelCode(10)).toBe("1");
  });

  it("builds attendance CSV with split names", () => {
    const csv = buildSamsAttendanceCSV([attendance(), attendance({ id: "att2", status: "Absent" })]);
    const lines = csv.trim().split("\n");
    expect(lines[0]).toBe(SAMS_ATTENDANCE_HEADERS.join(","));
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain("learner1");
    expect(lines[1]).toContain(",P,");
    expect(lines[2]).toContain(",A,");
  });

  it("rejects invalid attendance rows", () => {
    expect(validateAttendanceRow({ learnerId: "", date: "bad", status: "Maybe" }).length).toBeGreaterThan(0);
    expect(() => buildSamsAttendanceCSV([attendance({ studentId: "", date: "bad" })])).toThrow();
  });

  it("builds results CSV with percentage + level", () => {
    const csv = buildSamsResultsCSV([submission()]);
    const lines = csv.trim().split("\n");
    expect(lines[0]).toBe(SAMS_RESULTS_HEADERS.join(","));
    expect(lines[1]).toContain("CSC-441");
    expect(lines[1]).toContain("85");
    expect(lines[1]).toContain(",7,"); // 85% -> level 7
  });

  it("rejects out-of-range marks and ungraded rows", () => {
    expect(validateResultRow({
      learnerId: "l1", subjectCode: "CSC-441", task: "T", mark: 120, maxMark: 100,
    }).length).toBeGreaterThan(0);
    expect(() => buildSamsResultsCSV([submission({ grade: 120 })])).toThrow();
    expect(() => buildSamsResultsCSV([submission({ grade: undefined, status: "submitted" })])).toThrow();
  });

  it("escapes CSV commas/quotes in names", () => {
    const csv = buildSamsResultsCSV([submission({ studentName: 'O"Neil, Jr Test' })]);
    expect(csv).toContain('"');
  });
});
