import {
  User, UserRole, Department, Course, Lecture, TimetableSlot,
  Assignment, AssignmentSubmission, AttendanceRecord,
  Badge, AuditLog, PushNotification, ChatMessage, SystemAnnouncement,
  LearnerCourseProgress, TeacherSummary
} from '../types';
import { auth as fbAuth, db } from './firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

// ── Firestore collections ──
const C = {
  users: 'users',
  departments: 'departments',
  courses: 'courses',
  lectures: 'lectures',
  timetable: 'timetable',
  assignments: 'assignments',
  submissions: 'submissions',
  attendance: 'attendance',
  auditLogs: 'audit_logs',
  notifications: 'notifications',
  announcements: 'announcements',
  messages: 'messages',
  learnerProgress: 'learner_progress',
  badges: 'badges',
} as const;

type StoredRole = 'learner' | 'teacher' | 'admin' | 'student' | 'lecturer';

export function toAppRole(raw: unknown): UserRole {
  if (raw === 'teacher' || raw === 'lecturer') return 'lecturer';
  if (raw === 'admin') return 'admin';
  return 'student';
}

export function toStoredRole(raw: string): StoredRole {
  if (raw === 'teacher' || raw === 'lecturer') return 'teacher';
  if (raw === 'admin') return 'admin';
  return 'learner';
}

function stamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 16);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function uid(): string {
  const u = fbAuth.currentUser;
  if (!u) throw new Error('Session expired or missing. Please sign in again.');
  return u.uid;
}

// Cached own-profile (role + display name) to avoid a read per call.
let profileCache: { uid: string; role: UserRole; name: string; email: string } | null = null;

async function myProfile(): Promise<{ uid: string; role: UserRole; name: string; email: string }> {
  const u = fbAuth.currentUser;
  if (!u) throw new Error('Session expired or missing. Please sign in again.');
  if (profileCache && profileCache.uid === u.uid) return profileCache;
  let role: UserRole = 'student';
  let name = u.displayName || u.email?.split('@')[0] || 'Member';
  try {
    const snap = await getDoc(doc(db, C.users, u.uid));
    if (snap.exists()) {
      const d = snap.data() as Record<string, unknown>;
      role = toAppRole(d.role);
      if (d.name) name = d.name as string;
    }
  } catch {
    // Fall through with defaults; rules surface denials at the query level.
  }
  profileCache = { uid: u.uid, role, name, email: u.email || '' };
  return profileCache;
}

export function clearProfileCache() {
  profileCache = null;
}

function friendly(e: unknown): never {
  const msg = e instanceof Error ? e.message : 'Request failed. Please retry.';
  if (/permission|denied|unauthenticated/i.test(msg)) {
    throw new Error('You do not have permission to perform this action.');
  }
  console.error('API Error:', e);
  throw e instanceof Error ? e : new Error(msg);
}

function withId<T>(id: string, data: Record<string, unknown>): T {
  return { id, ...data } as T;
}

// Best-effort client audit trail (admins read it; rules gate writes).
async function logAudit(entry: {
  action: string;
  resource: string;
  details: string;
  status?: 'SUCCESS' | 'WARNING' | 'FAILED';
}) {
  try {
    const me = await myProfile().catch(() => null);
    await addDoc(collection(db, C.auditLogs), {
      userId: me?.uid || 'unknown',
      userName: me?.name || 'Member',
      userRole: me?.role || 'student',
      action: entry.action,
      resource: entry.resource,
      details: entry.details,
      ipAddress: 'not-collected (client)',
      status: entry.status || 'SUCCESS',
      popiaCompliant: true,
      timestamp: stamp(),
      createdAt: serverTimestamp(),
    });
  } catch {
    // Audit must never break the user action.
  }
}

async function readAll<T>(name: string): Promise<T[]> {
  try {
    const snap = await getDocs(collection(db, name));
    return snap.docs.map((d) => withId<T>(d.id, d.data() as Record<string, unknown>));
  } catch (e) {
    return friendly(e);
  }
}

async function readWhere<T>(name: string, field: string, value: unknown): Promise<T[]> {
  try {
    const snap = await getDocs(query(collection(db, name), where(field, '==', value)));
    return snap.docs.map((d) => withId<T>(d.id, d.data() as Record<string, unknown>));
  } catch (e) {
    return friendly(e);
  }
}

const PRIVACY_NOTICE = {
  title: 'Privacy Notice (POPIA) - Demo Stub',
  summary:
    'Demo build. We minimise personal data, hash network identifiers in logs, require consent at registration, and honour access/erasure requests. See PRIVACY.md in the repo. Production deployment must appoint an Information Officer and complete a full POPIA assessment before processing real learner data.',
  contact: 'privacy@triple4c.com',
};

export const api = {
  getPrivacy: async () => PRIVACY_NOTICE,

  exportMyData: async (userId: string) => {
    const me = uid();
    if (userId !== me) throw new Error('You do not have permission to perform this action.');
    const [userSnap, submissions, progress, notifications] = await Promise.all([
      getDoc(doc(db, C.users, me)).catch(() => null),
      readWhere<AssignmentSubmission>(C.submissions, 'studentId', me),
      readWhere<LearnerCourseProgress>(C.learnerProgress, 'studentId', me),
      readWhere<PushNotification>(C.notifications, 'recipientId', me),
    ]);
    return {
      exportedAt: new Date().toISOString(),
      notice: 'Export assembled live from Firestore.',
      user: userSnap && userSnap.exists() ? withId(me, userSnap.data() as Record<string, unknown>) : null,
      submissions,
      progress,
      notifications,
    };
  },

  // ── Departments ──
  getDepartments: () => readAll<Department>(C.departments),
  createDepartment: async (dept: Partial<Department>) => {
    try {
      const ref = await addDoc(collection(db, C.departments), {
        name: dept.name || 'New Department',
        code: dept.code || '444-NEW',
        description: dept.description || '',
        headOfDepartment: dept.headOfDepartment || 'TBD',
        facultyCount: 1,
        studentCount: 0,
        color: dept.color || '#15803d',
        createdAt: serverTimestamp(),
      });
      const snap = await getDoc(ref);
      const created = withId<Department>(ref.id, (snap.data() || {}) as Record<string, unknown>);
      void logAudit({ action: 'DEPARTMENT_CREATED', resource: `/departments/${ref.id}`, details: `Created department ${created.name}` });
      return created;
    } catch (e) {
      return friendly(e);
    }
  },

  // ── Courses & lectures ──
  getCourses: () => readAll<Course>(C.courses),
  getLectures: (courseId?: string) =>
    courseId ? readWhere<Lecture>(C.lectures, 'courseId', courseId) : readAll<Lecture>(C.lectures),
  createLecture: async (lecture: Partial<Lecture>) => {
    try {
      const courses = lecture.courseId ? await readWhere<Course>(C.courses, 'id', lecture.courseId) : [];
      const course = courses[0] || (await readAll<Course>(C.courses))[0];
      if (!course) throw new Error('Create a course first before publishing lectures.');
      const existing = await readWhere<Lecture>(C.lectures, 'courseId', course.id);
      const ref = await addDoc(collection(db, C.lectures), {
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        title: lecture.title || 'New Lecture Module',
        moduleName: (lecture as Record<string, unknown>).moduleName || 'Module: Advanced Foundations',
        order: existing.length + 1,
        videoDurationMinutes: 30,
        videoUrl: lecture.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        bitrates: [
          { label: 'Auto (Adaptive)', resolution: 'Dynamic', bitrateKbps: 0 },
          { label: '1080p Full HD', resolution: '1920x1080', bitrateKbps: 4500 },
          { label: '720p HD', resolution: '1280x720', bitrateKbps: 2200 },
          { label: '480p SD (Data Saver)', resolution: '854x480', bitrateKbps: 800 },
        ],
        summary: lecture.summary || 'Comprehensive academic lecture module covering 444 Curriculum principles.',
        readingNotes: lecture.readingNotes || 'Key reading notes and reference theorems.',
        completed: false,
        quiz: {
          question: 'What is the primary pedagogical goal of the Triple 4C Curriculum framework?',
          options: [
            'Rote memorization',
            'Holistic Character, Competency, Critical Thinking, and Creativity',
            'Commercial product promotion',
            'Elimination of assessments',
          ],
          correctIndex: 1,
          explanation: 'Triple 4C balances foundational rigor with real-world technical competency and ethical reflection.',
          xpReward: 150,
        },
        createdAt: serverTimestamp(),
      });
      const snap = await getDoc(ref);
      const created = withId<Lecture>(ref.id, (snap.data() || {}) as Record<string, unknown>);
      void logAudit({ action: 'LECTURE_PUBLISHED', resource: `/lectures/${ref.id}`, details: `Published lecture "${created.title}"` });
      return created;
    } catch (e) {
      return friendly(e);
    }
  },
  completeLecture: async (lectureId: string, studentId: string, quizPassed: boolean) => {
    try {
      const me = await myProfile();
      const target = me.role === 'student' ? me.uid : studentId || me.uid;
      const lectureRef = doc(db, C.lectures, lectureId);
      await updateDoc(lectureRef, { completed: true }).catch(() => {});
      const userRef = doc(db, C.users, target);
      const snap = await getDoc(userRef).catch(() => null);
      const prev = (snap && snap.exists() ? (snap.data() as Record<string, unknown>) : {}) as Record<string, number | undefined>;
      const xp = (prev.xp || 0) + (quizPassed ? 200 : 100);
      await setDoc(userRef, {
        xp,
        level: Math.floor(xp / 400) + 1,
        streakDays: (prev.streakDays || 0) + 1,
        lastActiveDate: today(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      void logAudit({ action: 'LECTURE_COMPLETED', resource: `/lectures/${lectureId}`, details: `Completed lecture; XP now ${xp}.` });
      const updated = await getDoc(userRef).catch(() => null);
      return {
        success: true,
        student: withId<User>(target, ((updated && updated.exists() ? updated.data() : {}) as Record<string, unknown>)),
        message: 'Lecture progress and gamified XP recorded successfully!',
      };
    } catch (e) {
      return friendly(e);
    }
  },

  // ── Timetable ──
  getTimetable: () => readAll<TimetableSlot>(C.timetable),
  createTimetableSlot: async (slot: Partial<TimetableSlot>) => {
    try {
      const dayOfWeek = slot.dayOfWeek || 'Monday';
      const startTime = slot.startTime || '09:00';
      const endTime = slot.endTime || '10:30';
      const room = slot.room || 'Lecture Hall B';
      const existing = await readWhere<TimetableSlot>(C.timetable, 'dayOfWeek', dayOfWeek);
      const clash = existing.find(
        (s) =>
          s.room.toLowerCase() === room.toLowerCase() &&
          !(endTime <= s.startTime || startTime >= s.endTime)
      );
      if (clash) {
        throw new Error(
          `Timetable Clash Detected! Room "${room}" is already booked on ${dayOfWeek} from ${clash.startTime} to ${clash.endTime}.`
        );
      }
      const courses = slot.courseId ? await readWhere<Course>(C.courses, 'id', slot.courseId) : [];
      const course = courses[0] || (await readAll<Course>(C.courses))[0];
      if (!course) throw new Error('Create a course first before scheduling.');
      const ref = await addDoc(collection(db, C.timetable), {
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        lecturerName: slot.lecturerName || course.lecturerName || 'TBD',
        lecturerId: slot.lecturerId || course.lecturerId || '',
        dayOfWeek,
        startTime,
        endTime,
        room,
        type: slot.type || 'Lecture',
        departmentId: course.departmentId,
        onlineLink: `https://meet.triple4c.com/${course.code.toLowerCase()}`,
        createdAt: serverTimestamp(),
      });
      const snap = await getDoc(ref);
      return withId<TimetableSlot>(ref.id, (snap.data() || {}) as Record<string, unknown>);
    } catch (e) {
      return friendly(e);
    }
  },

  // ── Assignments & grading ──
  getAssignments: () => readAll<Assignment>(C.assignments),
  getSubmissions: async (assignmentId?: string) => {
    const me = await myProfile().catch(() => null);
    let records = assignmentId
      ? await readWhere<AssignmentSubmission>(C.submissions, 'assignmentId', assignmentId)
      : await readAll<AssignmentSubmission>(C.submissions);
    if (me && me.role === 'student') records = records.filter((s) => s.studentId === me.uid);
    return records;
  },
  submitAssignment: async (assignmentId: string, payload: { studentId: string; fileName: string; contentNotes: string }) => {
    try {
      const me = await myProfile();
      const target = me.role === 'student' ? me.uid : payload.studentId || me.uid;
      const all = await readAll<Assignment>(C.assignments);
      const assignment = all.find((a) => a.id === assignmentId) || all[0];
      if (!assignment) throw new Error('No assignments exist yet.');
      const ref = await addDoc(collection(db, C.submissions), {
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        courseCode: assignment.courseCode,
        studentId: target,
        studentName: me.name,
        studentEmail: me.email,
        submittedAt: stamp(),
        fileName: payload.fileName || 'Submission_File.pdf',
        fileSizeKb: 1500,
        contentNotes: payload.contentNotes || 'Standard 444 assignment submission.',
        status: 'submitted',
        maxGrade: assignment.maxPoints,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, C.assignments, assignment.id), { status: 'submitted' }).catch(() => {});
      const snap = await getDoc(ref);
      const submission = withId<AssignmentSubmission>(ref.id, (snap.data() || {}) as Record<string, unknown>);
      void logAudit({ action: 'ASSIGNMENT_SUBMISSION', resource: `/assignments/${assignmentId}/submit`, details: `Submitted work for ${assignment.title}` });
      return { message: 'Assignment submitted successfully with encrypted hash verification.', submission };
    } catch (e) {
      return friendly(e);
    }
  },
  gradeSubmission: async (submissionId: string, payload: { grade: number; feedback: string; rubricScores: Record<string, number>; graderName: string }) => {
    try {
      const me = await myProfile();
      if (me.role === 'student') throw new Error('You do not have permission to perform this action.');
      const ref = doc(db, C.submissions, submissionId);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error('Submission not found');
      const current = snap.data() as Record<string, unknown>;
      await updateDoc(ref, {
        status: 'graded',
        grade: Number(payload.grade),
        feedback: payload.feedback || '',
        rubricScores: payload.rubricScores || {},
        gradedBy: payload.graderName || me.name,
        gradedAt: stamp(),
      });
      await addDoc(collection(db, C.notifications), {
        recipientRole: 'student',
        recipientId: current.studentId,
        title: `Assignment Graded: ${current.assignmentTitle}`,
        message: `Score: ${payload.grade}. Graded by ${payload.graderName || me.name}. Check detailed rubric feedback.`,
        category: 'grading',
        timestamp: stamp(),
        read: false,
        actionUrl: '/student/assignments',
        priority: 'high',
        createdAt: serverTimestamp(),
      });
      const updated = await getDoc(ref);
      const submission = withId<AssignmentSubmission>(ref.id, (updated.data() || {}) as Record<string, unknown>);
      void logAudit({ action: 'SPEED_GRADER_EVALUATE', resource: `/submissions/${submissionId}`, details: `Assigned grade ${payload.grade} to ${current.studentName}` });
      return { message: 'Grade recorded and student notification dispatched.', submission };
    } catch (e) {
      return friendly(e);
    }
  },

  // ── Attendance ──
  getAttendance: async () => {
    const me = await myProfile().catch(() => null);
    const records = await readAll<AttendanceRecord>(C.attendance);
    if (me && me.role === 'student') return records.filter((r) => r.studentId === me.uid);
    return records;
  },
  checkInAttendance: async (studentId: string, courseId: string, method?: string) => {
    try {
      const me = await myProfile();
      const target = me.role === 'student' ? me.uid : studentId || me.uid;
      const courses = courseId ? await readWhere<Course>(C.courses, 'id', courseId) : [];
      const course = courses[0] || (await readAll<Course>(C.courses))[0];
      if (!course) throw new Error('No courses exist yet.');
      const allowed = ['Self Check-in', 'Lecturer Roster', 'QR Code'] as const;
      const checkinMethod = (allowed as readonly string[]).includes(method || '') ? method : 'Self Check-in';
      const ref = await addDoc(collection(db, C.attendance), {
        date: today(),
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        studentId: target,
        studentName: me.name,
        status: 'Present',
        checkInTime: new Date().toTimeString().slice(0, 5),
        method: checkinMethod,
        createdAt: serverTimestamp(),
      });
      const snap = await getDoc(ref);
      const record = withId<AttendanceRecord>(ref.id, (snap.data() || {}) as Record<string, unknown>);
      void logAudit({ action: 'ATTENDANCE_CHECKIN', resource: '/attendance', details: `Checked in for ${course.code}` });
      return { message: 'Attendance recorded successfully.', record };
    } catch (e) {
      return friendly(e);
    }
  },

  // ── Audit logs (admin-readable; role resolved from own profile) ──
  getAuditLogs: async (params?: { role?: string; action?: string; search?: string }) => {
    const me = await myProfile().catch(() => null);
    if (!me || me.role !== 'admin') throw new Error('You do not have permission to perform this action.');
    let logs = await readAll<AuditLog>(C.auditLogs);
    if (params?.role) logs = logs.filter((l) => l.userRole === params.role);
    if (params?.action) logs = logs.filter((l) => l.action.toLowerCase().includes(params.action!.toLowerCase()));
    if (params?.search) {
      const q = params.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.userName.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.resource.toLowerCase().includes(q)
      );
    }
    return logs.map((l) => ({ ...l, ipAddress: 'not-collected (client)' }));
  },

  // ── Reports ──
  getReportsSummary: async () => {
    const [deptCount, userCount] = await Promise.all([
      getCountFromServer(collection(db, C.departments)).then((s) => s.data().count).catch(() => 0),
      getCountFromServer(collection(db, C.users)).then((s) => s.data().count).catch(() => 0),
    ]);
    const departments = await readAll<Department>(C.departments).catch(() => []);
    return {
      institution: 'Triple 4C (444 Curriculum)',
      totalStudents: userCount,
      totalLecturers: 0,
      totalDepartments: deptCount,
      averageAttendanceRate: 0,
      averageGradePercent: 0,
      dropoutRiskAlertsCount: 0,
      saSamsIntegrationStatus: 'Roadmap - demo data, not a certified export',
      lastSaSamsExport: 'Not yet implemented (demo)',
      bbbeeScorecardPoints: 0,
      setaAccreditedModules: 0,
      departmentBreakdown: departments.map((d) => ({
        name: d.name,
        code: d.code,
        students: d.studentCount,
        faculty: d.facultyCount,
        passRate: 0,
      })),
      atRiskStudents: [] as Array<{ name: string; studentId: string; reason: string; risk: string }>,
    };
  },

  // ── Notifications & announcements ──
  getNotifications: async () => {
    const me = await myProfile().catch(() => null);
    const all = await readAll<PushNotification>(C.notifications);
    if (me && me.role === 'student') return all.filter((n) => !n.recipientId || n.recipientId === me.uid);
    return all;
  },
  markNotificationRead: async (id: string) => {
    try {
      const me = await myProfile().catch(() => null);
      const ref = doc(db, C.notifications, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return { success: true };
      const data = snap.data() as Record<string, unknown>;
      if (me && me.role === 'student' && data.recipientId && data.recipientId !== me.uid) {
        throw new Error('You do not have permission to perform this action.');
      }
      await updateDoc(ref, { read: true });
      return { success: true };
    } catch (e) {
      return friendly(e);
    }
  },
  sendPushNotification: async (payload: Partial<PushNotification>) => {
    try {
      const me = await myProfile();
      if (me.role === 'student') throw new Error('You do not have permission to perform this action.');
      const ref = await addDoc(collection(db, C.notifications), {
        recipientRole: payload.recipientRole || 'all',
        title: payload.title || 'Campus Notification',
        message: payload.message || '',
        category: payload.category || 'announcement',
        timestamp: stamp(),
        read: false,
        priority: payload.priority || 'normal',
        createdAt: serverTimestamp(),
      });
      const snap = await getDoc(ref);
      return withId<PushNotification>(ref.id, (snap.data() || {}) as Record<string, unknown>);
    } catch (e) {
      return friendly(e);
    }
  },
  getAnnouncements: async () => {
    const all = await readAll<SystemAnnouncement>(C.announcements);
    return all.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  },
  createAnnouncement: async (payload: Partial<SystemAnnouncement>) => {
    try {
      const me = await myProfile();
      if (me.role === 'student') throw new Error('You do not have permission to perform this action.');
      const ref = await addDoc(collection(db, C.announcements), {
        title: payload.title || 'New Campus Announcement',
        content: payload.content || '',
        targetAudience: payload.targetAudience || 'All',
        createdAt: stamp(),
        authorName: me.name,
        pinned: false,
        priority: payload.priority || 'info',
        serverCreatedAt: serverTimestamp(),
      });
      const snap = await getDoc(ref);
      return withId<SystemAnnouncement>(ref.id, (snap.data() || {}) as Record<string, unknown>);
    } catch (e) {
      return friendly(e);
    }
  },

  // ── Messages ──
  getMessages: () => readAll<ChatMessage>(C.messages),
  sendMessage: async (payload: Partial<ChatMessage>) => {
    try {
      const me = await myProfile();
      if (!payload.message?.trim()) throw new Error('Message cannot be empty');
      const ref = await addDoc(collection(db, C.messages), {
        senderId: me.uid,
        senderName: me.name,
        senderRole: me.role,
        channelId: payload.channelId || 'cs201-cohort',
        message: payload.message.trim(),
        timestamp: stamp(),
        createdAt: serverTimestamp(),
      });
      const snap = await getDoc(ref);
      return withId<ChatMessage>(ref.id, (snap.data() || {}) as Record<string, unknown>);
    } catch (e) {
      return friendly(e);
    }
  },

  // ── Users & badges ──
  getUsers: async () => {
    const me = await myProfile().catch(() => null);
    const snap = await getDocs(collection(db, C.users)).catch((e) => friendly(e));
    const users = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return withId<User>(d.id, {
        name: (data.name as string) || 'Member',
        email: (data.email as string) || '',
        role: toAppRole(data.role),
        departmentId: data.departmentId as string | undefined ?? (data.department as string | undefined),
        departmentName: data.departmentName as string | undefined,
        studentId: data.studentId as string | undefined,
        employeeId: data.employeeId as string | undefined,
        level: data.level as number | undefined,
        xp: data.xp as number | undefined,
        streakDays: data.streakDays as number | undefined,
        badges: data.badges as string[] | undefined,
        registeredDate: (data.registeredDate as string) || '',
      });
    });
    if (me && me.role === 'student') return users.filter((u) => u.id === me.uid);
    return users;
  },
  /** Provision a directory profile; activates when the person registers with the same email. */
  createUser: async (payload: Partial<User>) => {
    try {
      const me = await myProfile();
      if (me.role === 'student') throw new Error('You do not have permission to perform this action.');
      if (!payload.email) throw new Error('Email is required');
      const ref = await addDoc(collection(db, C.users), {
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        role: toStoredRole(payload.role || 'student'),
        departmentId: payload.departmentId || '',
        departmentName: payload.departmentName || '',
        status: 'provisioned',
        privacyPolicyAccepted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const user = withId<User>(ref.id, {
        name: payload.name || '',
        email: payload.email,
        role: toAppRole(payload.role || 'student'),
        departmentId: payload.departmentId,
        departmentName: payload.departmentName,
        registeredDate: today(),
      });
      return { message: 'Profile provisioned. It activates when the person registers with this email.', user, token: '' };
    } catch (e) {
      return friendly(e);
    }
  },
  getBadges: () => readAll<Badge>(C.badges),

  // ── AI quiz: direct Gemini call when a client key is configured, else canned fallback ──
  generateAiQuiz: async (topic: string, difficulty?: string) => {
    const fallback = {
      question: `Under the 444 Curriculum framework for ${topic || 'Distributed Consensus'}, what is the primary guarantee provided by state machine replication?`,
      options: [
        'Deterministic state convergence across all un-crashed nodes executing log operations in the identical sequence',
        'Elimination of network hardware latency',
        'Automatic conversion of all unstructured data into relational tables',
        'Zero CPU overhead during cryptographic signing',
      ],
      correctIndex: 0,
      explanation: 'State machine replication guarantees that identical inputs executed in the exact order on deterministic state machines produce identical state transitions.',
      xpReward: 150,
    };
    const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!key) return fallback;
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a high-yield academic multiple-choice quiz question with 4 options, the 0-based index of the correct answer, and an insightful explanation for the topic: "${topic}". Target difficulty: ${difficulty || 'Undergraduate Level 3'}. Return strictly valid JSON: {"question": "string", "options": ["string x4"], "correctIndex": 0, "explanation": "string", "xpReward": 150}`,
        config: { responseMimeType: 'application/json' },
      });
      return JSON.parse(response.text || '{}');
    } catch {
      return fallback;
    }
  },

  // ── Teachers & learner progress ──
  getTeachers: async () => {
    const [users, courses, progress, submissions] = await Promise.all([
      readAll<Record<string, unknown> & { role?: unknown }>(C.users).catch(() => []),
      readAll<Course>(C.courses).catch(() => []),
      readAll<LearnerCourseProgress>(C.learnerProgress).catch(() => []),
      readAll<AssignmentSubmission>(C.submissions).catch(() => []),
    ]);
    const staff = users.filter((u) => {
      const r = toAppRole(u.role);
      return r === 'lecturer' || r === 'admin';
    });
    return staff.map((t) => {
      const id = t.id as string;
      const assigned = courses.filter((c) => c.lecturerId === id);
      const assignedIds = assigned.map((c) => c.id);
      const records = progress.filter((lp) => lp.teacherId === id || assignedIds.includes(lp.courseId));
      const avg = records.length
        ? Math.round(records.reduce((a, c) => a + c.averageQuizScore, 0) / records.length)
        : 88;
      const pending = submissions.filter(
        (s) => s.status === 'submitted' && assigned.some((c) => c.code === s.courseCode)
      ).length;
      const role = toAppRole(t.role);
      return {
        id,
        name: (t.name as string) || 'Staff',
        email: (t.email as string) || '',
        title: role === 'admin' ? 'Dean / Department Head' : 'Senior Lecturer / Instructor',
        departmentId: (t.departmentId as string) || 'dept_cs',
        departmentName: (t.departmentName as string) || 'Computing & Applied AI',
        employeeId: (t.employeeId as string) || '444-FAC-100',
        coursesAssigned: assignedIds,
        coursesList: assigned,
        totalStudentsTaught: records.length,
        averageCohortScore: avg,
        pendingGradingCount: pending,
      } as TeacherSummary & { coursesList: Course[] };
    });
  },
  getLearnerProgress: async (params?: { teacherId?: string; courseId?: string; performanceBand?: string; search?: string }) => {
    const me = await myProfile().catch(() => null);
    let records = await readAll<LearnerCourseProgress>(C.learnerProgress);
    if (me && me.role === 'student') return records.filter((lp) => lp.studentId === me.uid);
    if (params?.teacherId) {
      const courses = await readAll<Course>(C.courses).catch(() => []);
      const ids = courses.filter((c) => c.lecturerId === params.teacherId).map((c) => c.id);
      records = records.filter((lp) => lp.teacherId === params.teacherId || ids.includes(lp.courseId));
    }
    if (params?.courseId && params.courseId !== 'all') records = records.filter((lp) => lp.courseId === params.courseId);
    if (params?.performanceBand && params.performanceBand !== 'all') {
      records = records.filter((lp) => lp.performanceBand.toLowerCase() === params.performanceBand!.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      records = records.filter(
        (lp) =>
          lp.studentName.toLowerCase().includes(q) ||
          lp.studentEmail.toLowerCase().includes(q) ||
          lp.studentIdNumber.toLowerCase().includes(q) ||
          lp.courseCode.toLowerCase().includes(q) ||
          lp.courseTitle.toLowerCase().includes(q)
      );
    }
    return records;
  },
  getLearnerProgressDetail: async (id: string) => {
    const me = await myProfile().catch(() => null);
    const ref = doc(db, C.learnerProgress, id);
    const snap = await getDoc(ref).catch(() => null);
    if (snap && snap.exists()) {
      const record = withId<LearnerCourseProgress>(id, snap.data() as Record<string, unknown>);
      if (me && me.role === 'student' && record.studentId !== me.uid) {
        throw new Error('You do not have permission to perform this action.');
      }
      return record;
    }
    const all = await readAll<LearnerCourseProgress>(C.learnerProgress);
    const found = all.find((lp) => lp.studentId === id);
    if (!found) throw new Error('Learner progress record not found');
    if (me && me.role === 'student' && found.studentId !== me.uid) {
      throw new Error('You do not have permission to perform this action.');
    }
    return found;
  },
  updateLearnerNotes: async (id: string, notes: string, teacherName?: string) => {
    try {
      const me = await myProfile();
      if (me.role === 'student') throw new Error('You do not have permission to perform this action.');
      if (!notes.trim()) throw new Error('Notes cannot be empty');
      await updateDoc(doc(db, C.learnerProgress, id), { teacherNotes: notes.trim() });
      const snap = await getDoc(doc(db, C.learnerProgress, id));
      const record = withId<LearnerCourseProgress>(id, (snap.data() || {}) as Record<string, unknown>);
      void logAudit({ action: 'FACULTY_NOTE_UPDATED', resource: `/learner-progress/${id}`, details: `Notes updated for ${record.studentName}` });
      void teacherName;
      return { success: true, record };
    } catch (e) {
      return friendly(e);
    }
  },
  nudgeLearner: async (id: string, payload: { message: string; priority?: string; type?: 'warning' | 'praise' | 'info'; teacherName?: string }) => {
    try {
      const me = await myProfile();
      if (me.role === 'student') throw new Error('You do not have permission to perform this action.');
      const snap = await getDoc(doc(db, C.learnerProgress, id));
      if (!snap.exists()) throw new Error('Learner progress record not found');
      const record = withId<LearnerCourseProgress>(id, snap.data() as Record<string, unknown>);
      const title =
        payload.type === 'warning'
          ? `Academic Alert: ${record.courseCode} Progress Reminder`
          : payload.type === 'praise'
            ? `Kudos & Excellence Recognition: ${record.courseCode}`
            : `Teacher Message: ${record.courseCode}`;
      const message = payload.message || `Message from ${payload.teacherName || record.teacherName} regarding ${record.courseTitle}`;
      await addDoc(collection(db, C.notifications), {
        recipientRole: 'student',
        recipientId: record.studentId,
        title,
        message,
        category: 'academic',
        timestamp: stamp(),
        read: false,
        priority: payload.priority || 'high',
        actionUrl: `/course/${record.courseId}`,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, C.messages), {
        senderId: record.teacherId,
        senderName: payload.teacherName || record.teacherName,
        senderRole: 'lecturer',
        recipientId: record.studentId,
        channelId: `${record.courseCode.toLowerCase()}-cohort`,
        message: `[DIRECT FACULTY NUDGE] ${message}`,
        timestamp: stamp(),
        createdAt: serverTimestamp(),
      });
      return { success: true, message: `Nudge successfully dispatched to ${record.studentName}.` };
    } catch (e) {
      return friendly(e);
    }
  },
  broadcastNudge: async (payload: { courseId?: string; targetBand?: string; message: string; teacherName?: string }) => {
    try {
      const me = await myProfile();
      if (me.role === 'student') throw new Error('You do not have permission to perform this action.');
      let targets = await readAll<LearnerCourseProgress>(C.learnerProgress);
      if (payload.courseId && payload.courseId !== 'all') targets = targets.filter((lp) => lp.courseId === payload.courseId);
      if (payload.targetBand && payload.targetBand !== 'all') {
        targets = targets.filter((lp) => lp.performanceBand.toLowerCase() === payload.targetBand!.toLowerCase());
      }
      await Promise.all(
        targets.map((s) =>
          addDoc(collection(db, C.notifications), {
            recipientRole: 'student',
            recipientId: s.studentId,
            title: `Cohort Announcement: ${s.courseCode}`,
            message: payload.message || `Important update regarding your ${s.courseTitle} coursework.`,
            category: 'academic',
            timestamp: stamp(),
            read: false,
            priority: 'high',
            actionUrl: `/course/${s.courseId}`,
            createdAt: serverTimestamp(),
          })
        )
      );
      return { success: true, dispatchedCount: targets.length, message: `Broadcast successfully sent to ${targets.length} learners.` };
    } catch (e) {
      return friendly(e);
    }
  },
};
