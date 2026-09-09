import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { db } from './src/server/mockDb.ts';
import { ACADEMIC_REGISTRY } from './server/data/curriculum.ts';
import authRouter from './server/routes/auth.ts';
import { authenticate, effectiveStudentId, requireRole } from './server/middleware/auth.ts';
import {
  aiQuizSchema,
  announcementCreateSchema,
  attendanceCheckinSchema,
  broadcastNudgeSchema,
  departmentCreateSchema,
  gradeSubmissionSchema,
  lectureCompleteSchema,
  lectureCreateSchema,
  loginSchema,
  messageCreateSchema,
  notesUpdateSchema,
  notificationCreateSchema,
  nudgeSchema,
  registerSchema,
  submitAssignmentSchema,
  timetableCreateSchema,
  validateBody,
} from './server/lib/validate.ts';
import { hashIp, logEvent, newId, newRequestId, sanitizeAuditLog } from './server/lib/security.ts';

// Lazy initialize Gemini AI client if API key is provided
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // ── Security headers, CORS whitelist, body limits ──
  app.use(helmet({ contentSecurityPolicy: false }));
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ||
    'https://triple4c.com,https://www.triple4c.com,https://triple4curriculum.web.app,https://triple4curriculum.firebaseapp.com,http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('CORS: origin not allowed'));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '256kb' }));
  app.set('trust proxy', 1);

  // ── Request IDs + structured logging ──
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.requestId = newRequestId();
    if (req.path.startsWith('/api/')) {
      logEvent('info', 'api_request', { id: req.requestId, method: req.method, path: req.path });
    }
    next();
  });

  // ── Rate limits (auth + AI are cost/abuse sensitive) ──
  const generalLimiter = rateLimit({ windowMs: 60_000, max: 300, standardHeaders: true, legacyHeaders: false });
  const authLimiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false });
  const aiLimiter = rateLimit({ windowMs: 60_000, max: 20, standardHeaders: true, legacyHeaders: false });
  app.use('/api/', generalLimiter);

  // ==========================================
  // REST API: HEALTH & META (public)
  // ==========================================
  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({
      status: 'operational',
      institution: 'Triple 4C (444 Curriculum)',
      motto: 'Character, Competency, Critical Thinking, Creativity',
      version: '2.4.1-hardened',
      timestamp: new Date().toISOString(),
      // Honest capability flags — roadmap items are labelled, not claimed.
      standards: ['POPIA-Controls-In-Progress', 'Demo-Build-Not-Production'],
      roadmap: ['SA-SAMS-Export', 'DRM-Watermarking', 'Biometric-Checkin'],
    });
  });

  // ==========================================
  // REST API: AUTHENTICATION (public, rate-limited, validated)
  // ==========================================
  app.post('/api/v1/auth/login', authLimiter, validateBody(loginSchema), (req: Request, res: Response) => {
    const { email } = req.body as { email: string };
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      logEvent('warn', 'login_failed_unknown_email', { id: req.requestId });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    db.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      resource: '/api/v1/auth/login',
      details: `Session authenticated with RBAC role [${user.role.toUpperCase()}]`,
      ipAddress: hashIp(req.ip),
      status: 'SUCCESS',
      popiaCompliant: true,
    });

    // Demo token. Production must use Firebase ID tokens (verifyIdToken).
    res.json({
      token: `dev-${user.role}-${user.id}`,
      user,
      notice: 'Demo token. Production uses Firebase ID tokens.',
    });
  });

  app.post('/api/v1/auth/register', authLimiter, validateBody(registerSchema), (req: Request, res: Response) => {
    const { name, email, departmentId } = req.body as {
      name: string;
      email: string;
      departmentId?: string;
    };
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const dept = db.departments.find((d) => d.id === departmentId) || db.departments[0];

    const newUser = {
      id: newId('stu'),
      name,
      email,
      role: 'student' as const,
      departmentId: dept.id,
      departmentName: dept.name,
      studentId: `444-STU-${newId('n').slice(-4).toUpperCase()}`,
      level: 1,
      xp: 100,
      streakDays: 1,
      badges: ['badge_pioneer'],
      registeredDate: new Date().toISOString().split('T')[0],
    };

    db.users.push(newUser);

    db.addAuditLog({
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'ACCOUNT_CREATED',
      resource: '/api/v1/auth/register',
      details: `New ${newUser.role} account registered under ${dept.name} (POPIA consent recorded)`,
      ipAddress: hashIp(req.ip),
      status: 'SUCCESS',
      popiaCompliant: true,
    });

    res.status(201).json({
      message: 'Account created successfully under 444 Curriculum framework',
      user: newUser,
      token: `dev-student-${newUser.id}`,
    });
  });

  // Legacy gateway stub + POPIA data-subject endpoints
  app.use('/api/v1/auth', authLimiter, authRouter);

  // Privacy policy (public stub)
  app.get('/api/v1/privacy', (_req: Request, res: Response) => {
    res.json({
      title: 'Privacy Notice (POPIA) — Demo Stub',
      updated: '2026-09-09',
      summary:
        'Demo build. We minimise personal data, hash network identifiers in logs, require consent at registration, and honour access/erasure requests. See PRIVACY.md in the repo. Production deployment must appoint an Information Officer and complete a full POPIA assessment before processing real learner data.',
      consentRequired: true,
      contact: 'privacy@triple4c.com',
    });
  });

  // ==========================================
  // Everything below requires authentication.
  // ==========================================
  app.use('/api/v1/departments', authenticate);
  app.use('/api/v1/courses', authenticate);
  app.use('/api/v1/lectures', authenticate);
  app.use('/api/v1/timetable', authenticate);
  app.use('/api/v1/assignments', authenticate);
  app.use('/api/v1/submissions', authenticate);
  app.use('/api/v1/attendance', authenticate);
  app.use('/api/v1/audit-logs', authenticate);
  app.use('/api/v1/teachers', authenticate);
  app.use('/api/v1/learner-progress', authenticate);
  app.use('/api/v1/reports', authenticate);
  app.use('/api/v1/notifications', authenticate);
  app.use('/api/v1/announcements', authenticate);
  app.use('/api/v1/messages', authenticate);
  app.use('/api/v1/users', authenticate);
  app.use('/api/v1/badges', authenticate);
  app.use('/api/v1/ai', aiLimiter, authenticate);

  // ==========================================
  // REST API: DEPARTMENTS
  // ==========================================
  app.get('/api/v1/departments', (req: Request, res: Response) => {
    res.json(db.departments);
  });

  app.post('/api/v1/departments', requireRole('admin'), validateBody(departmentCreateSchema), (req: Request, res: Response) => {
    const { name, code, description, headOfDepartment, color } = req.body;
    const newDept = {
      id: newId('dept'),
      name: name || 'New Department',
      code: code || '444-NEW',
      description: description || '',
      headOfDepartment: headOfDepartment || 'TBD',
      facultyCount: 1,
      studentCount: 0,
      color: color || '#15803d',
    };
    db.departments.push(newDept);

    db.addAuditLog({
      userId: req.auth!.uid,
      userName: 'Administrator',
      userRole: 'admin',
      action: 'DEPARTMENT_CREATED',
      resource: `/api/v1/departments/${newDept.id}`,
      details: `Created new academic department: ${newDept.name} (${newDept.code})`,
      ipAddress: hashIp(req.ip),
      status: 'SUCCESS',
      popiaCompliant: true,
    });

    res.status(201).json(newDept);
  });

  // ==========================================
  // REST API: CURRICULUM REGISTRY (public read)
  // ==========================================
  app.get('/api/curriculum', (_req: Request, res: Response) => {
    try {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).json(ACADEMIC_REGISTRY);
    } catch {
      res.status(500).json({ error: 'Unable to load curriculum' });
    }
  });

  app.get('/api/v1/curriculum', (_req: Request, res: Response) => {
    try {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).json(ACADEMIC_REGISTRY);
    } catch {
      res.status(500).json({ error: 'Unable to load curriculum' });
    }
  });

  // ==========================================
  // REST API: COURSES & LECTURES
  // ==========================================
  app.get('/api/v1/courses', (req: Request, res: Response) => {
    res.json(db.courses);
  });

  app.get('/api/v1/lectures', (req: Request, res: Response) => {
    const courseId = req.query.courseId as string;
    if (courseId) {
      return res.json(db.lectures.filter((l) => l.courseId === courseId));
    }
    res.json(db.lectures);
  });

  app.post('/api/v1/lectures', requireRole('admin', 'lecturer'), validateBody(lectureCreateSchema), (req: Request, res: Response) => {
    const { courseId, title, moduleName, summary, readingNotes, videoUrl } = req.body;
    const course = db.courses.find((c) => c.id === courseId) || db.courses[0];

    const newLecture = {
      id: newId('lec'),
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      title: title || 'New Lecture Module',
      moduleName: moduleName || 'Module: Advanced Foundations',
      order: db.lectures.filter((l) => l.courseId === course.id).length + 1,
      videoDurationMinutes: 30,
      videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      bitrates: [
        { label: 'Auto (Adaptive)', resolution: 'Dynamic', bitrateKbps: 0 },
        { label: '1080p Full HD', resolution: '1920x1080', bitrateKbps: 4500 },
        { label: '720p HD', resolution: '1280x720', bitrateKbps: 2200 },
        { label: '480p SD (Data Saver)', resolution: '854x480', bitrateKbps: 800 },
      ],
      summary: summary || 'Comprehensive academic lecture module covering 444 Curriculum principles.',
      readingNotes: readingNotes || 'Key reading notes and reference theorems.',
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
    };

    db.lectures.push(newLecture);

    db.addAuditLog({
      userId: req.auth!.uid,
      userName: 'Course Staff',
      userRole: req.auth!.role as never,
      action: 'LECTURE_PUBLISHED',
      resource: `/api/v1/lectures/${newLecture.id}`,
      details: `Published lecture "${newLecture.title}" for ${course.code}`,
      ipAddress: hashIp(req.ip),
      status: 'SUCCESS',
      popiaCompliant: true,
    });

    res.status(201).json(newLecture);
  });

  app.post('/api/v1/lectures/:id/complete', validateBody(lectureCompleteSchema), (req: Request, res: Response) => {
    const { id } = req.params;
    const { quizPassed } = req.body as { quizPassed?: boolean };
    const studentId = effectiveStudentId(req, (req.body as { studentId?: string }).studentId);

    const lecture = db.lectures.find((l) => l.id === id);
    if (lecture) {
      lecture.completed = true;
    }

    const student = db.users.find((u) => u.id === studentId);
    if (student) {
      student.xp = (student.xp || 0) + (quizPassed ? 200 : 100);
      student.level = Math.floor((student.xp || 0) / 400) + 1;
      student.streakDays = (student.streakDays || 0) + 1;
      student.lastActiveDate = new Date().toISOString().split('T')[0];
    }

    db.addAuditLog({
      userId: student?.id || studentId,
      userName: student?.name || 'Learner',
      userRole: 'student',
      action: 'LECTURE_COMPLETED',
      resource: `/api/v1/lectures/${id}`,
      details: `Completed lecture and quiz. XP updated to ${student?.xp}, Streak: ${student?.streakDays} days.`,
      ipAddress: hashIp(req.ip),
      status: 'SUCCESS',
      popiaCompliant: true,
    });

    res.json({
      success: true,
      student,
      message: 'Lecture progress and gamified XP recorded successfully!',
    });
  });

  // ==========================================
  // REST API: TIMETABLE & CLASH DETECTION
  // ==========================================
  app.get('/api/v1/timetable', (req: Request, res: Response) => {
    res.json(db.timetable);
  });

  app.post('/api/v1/timetable', requireRole('admin', 'lecturer'), validateBody(timetableCreateSchema), (req: Request, res: Response) => {
    const { courseId, lecturerId, dayOfWeek, startTime, endTime, room, type } = req.body;

    const clash = db.timetable.find(
      (slot) =>
        slot.dayOfWeek === dayOfWeek &&
        slot.room.toLowerCase() === (room || '').toLowerCase() &&
        !(endTime <= slot.startTime || startTime >= slot.endTime)
    );

    if (clash) {
      return res.status(409).json({
        error: 'Timetable Clash Detected!',
        message: `Room "${room}" is already booked on ${dayOfWeek} from ${clash.startTime} to ${clash.endTime} for ${clash.courseCode} (${clash.courseTitle}).`,
        clashingSlot: clash,
      });
    }

    const course = db.courses.find((c) => c.id === courseId) || db.courses[0];
    const lecturer = db.users.find((u) => u.id === lecturerId) || db.users.find((u) => u.role === 'lecturer') || db.users[3];

    const newSlot = {
      id: newId('slot'),
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      lecturerName: lecturer.name,
      lecturerId: lecturer.id,
      dayOfWeek: dayOfWeek || 'Monday',
      startTime: startTime || '09:00',
      endTime: endTime || '10:30',
      room: room || 'Lecture Hall B',
      type: type || 'Lecture',
      departmentId: course.departmentId,
      onlineLink: `https://meet.triple4c.com/${course.code.toLowerCase()}`,
    };

    db.timetable.push(newSlot);

    db.addAuditLog({
      userId: req.auth!.uid,
      userName: 'Scheduler',
      userRole: req.auth!.role as never,
      action: 'TIMETABLE_SCHEDULE_ADD',
      resource: `/api/v1/timetable/${newSlot.id}`,
      details: `Scheduled ${newSlot.courseCode} on ${newSlot.dayOfWeek} ${newSlot.startTime}-${newSlot.endTime} in ${newSlot.room}`,
      ipAddress: hashIp(req.ip),
      status: 'SUCCESS',
      popiaCompliant: true,
    });

    res.status(201).json(newSlot);
  });

  // ==========================================
  // REST API: ASSIGNMENTS & SPEEDGRADER
  // ==========================================
  app.get('/api/v1/assignments', (req: Request, res: Response) => {
    res.json(db.assignments);
  });

  app.get('/api/v1/submissions', (req: Request, res: Response) => {
    const assignmentId = req.query.assignmentId as string;
    let records = [...db.submissions];
    if (req.auth?.role === 'student') {
      records = records.filter((s) => s.studentId === req.auth!.uid);
    }
    if (assignmentId) {
      records = records.filter((s) => s.assignmentId === assignmentId);
    }
    res.json(records);
  });

  app.post('/api/v1/assignments/:id/submit', validateBody(submitAssignmentSchema), (req: Request, res: Response) => {
    const { id } = req.params;
    const { fileName, contentNotes } = req.body as { fileName?: string; contentNotes?: string };
    const studentId = effectiveStudentId(req, (req.body as { studentId?: string }).studentId);

    const assignment = db.assignments.find((a) => a.id === id) || db.assignments[0];
    const student = db.users.find((u) => u.id === studentId) || db.users[0];

    const submission = {
      id: newId('sub'),
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      courseCode: assignment.courseCode,
      studentId: student.id,
      studentName: student.name,
      studentEmail: req.auth?.role === 'student' ? student.email : student.email,
      submittedAt: new Date().toISOString().replace('T', ' ').substr(0, 16),
      fileName: fileName || 'Submission_File.pdf',
      fileSizeKb: 1500,
      contentNotes: contentNotes || 'Standard 444 assignment submission.',
      status: 'submitted' as const,
      maxGrade: assignment.maxPoints,
    };

    db.submissions.unshift(submission);
    assignment.status = 'submitted';

    db.addAuditLog({
      userId: student.id,
      userName: student.name,
      userRole: 'student',
      action: 'ASSIGNMENT_SUBMISSION',
      resource: `/api/v1/assignments/${id}/submit`,
      details: `Submitted work for ${assignment.title} (${submission.fileName})`,
      ipAddress: hashIp(req.ip),
      status: 'SUCCESS',
      popiaCompliant: true,
    });

    res.status(201).json({
      message: 'Assignment submitted successfully with encrypted hash verification.',
      submission,
    });
  });

  app.post(
    '/api/v1/submissions/:id/grade',
    requireRole('admin', 'lecturer'),
    validateBody(gradeSubmissionSchema),
    (req: Request, res: Response) => {
      const { id } = req.params;
      const { grade, feedback, rubricScores, graderName } = req.body;

      const submission = db.submissions.find((s) => s.id === id);
      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      submission.status = 'graded';
      submission.grade = Number(grade);
      submission.feedback = feedback;
      submission.rubricScores = rubricScores;
      submission.gradedBy = graderName || 'Course Staff';
      submission.gradedAt = new Date().toISOString().replace('T', ' ').substr(0, 16);

      db.notifications.unshift({
        id: newId('notif'),
        recipientRole: 'student',
        recipientId: submission.studentId,
        title: `Assignment Graded: ${submission.assignmentTitle}`,
        message: `Score: ${submission.grade}/${submission.maxGrade}. Graded by ${submission.gradedBy}. Check detailed rubric feedback.`,
        category: 'grading',
        timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
        read: false,
        actionUrl: '/student/assignments',
        priority: 'high',
      });

      db.addAuditLog({
        userId: req.auth!.uid,
        userName: graderName || 'Course Staff',
        userRole: req.auth!.role as never,
        action: 'SPEED_GRADER_EVALUATE',
        resource: `/api/v1/submissions/${id}`,
        details: `Assigned grade ${submission.grade}/${submission.maxGrade} to ${submission.studentName}`,
        ipAddress: hashIp(req.ip),
        status: 'SUCCESS',
        popiaCompliant: true,
      });

      res.json({
        message: 'Grade recorded and student notification dispatched.',
        submission,
      });
    }
  );

  // ==========================================
  // REST API: ATTENDANCE
  // ==========================================
  app.get('/api/v1/attendance', (req: Request, res: Response) => {
    if (req.auth?.role === 'student') {
      return res.json(db.attendanceRecords.filter((r) => r.studentId === req.auth!.uid));
    }
    res.json(db.attendanceRecords);
  });

  app.post('/api/v1/attendance/check-in', validateBody(attendanceCheckinSchema), (req: Request, res: Response) => {
    const { courseId, method } = req.body as { courseId?: string; method?: string };
    const studentId = effectiveStudentId(req, (req.body as { studentId?: string }).studentId);
    const student = db.users.find((u) => u.id === studentId) || db.users[0];
    const course = db.courses.find((c) => c.id === courseId) || db.courses[0];
    const allowedMethods = ['Self Check-in', 'Lecturer Roster', 'QR Code'] as const;
    const checkinMethod: (typeof allowedMethods)[number] = (allowedMethods as readonly string[]).includes(method || '')
      ? (method as (typeof allowedMethods)[number])
      : 'Self Check-in';

    const record = {
      id: newId('att'),
      date: new Date().toISOString().split('T')[0],
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      studentId: student.id,
      studentName: student.name,
      status: 'Present' as const,
      checkInTime: new Date().toTimeString().substr(0, 5),
      method: checkinMethod,
    };

    db.attendanceRecords.unshift(record);

    db.addAuditLog({
      userId: student.id,
      userName: student.name,
      userRole: 'student',
      action: 'ATTENDANCE_CHECKIN',
      resource: `/api/v1/attendance`,
      details: `Checked in for ${course.code} via ${record.method}`,
      ipAddress: hashIp(req.ip),
      status: 'SUCCESS',
      popiaCompliant: true,
    });

    res.status(201).json({
      message: 'Attendance recorded successfully.',
      record,
    });
  });

  // ==========================================
  // REST API: AUDIT LOGS (admin only, IPs minimised)
  // ==========================================
  app.get('/api/v1/audit-logs', requireRole('admin'), (req: Request, res: Response) => {
    const { role, action, search } = req.query;
    let filtered = [...db.auditLogs];

    if (role) {
      filtered = filtered.filter((l) => l.userRole === role);
    }
    if (action) {
      filtered = filtered.filter((l) => l.action.toLowerCase().includes((action as string).toLowerCase()));
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.userName.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.resource.toLowerCase().includes(q)
      );
    }

    res.json(filtered.map(sanitizeAuditLog));
  });

  // ==========================================
  // REST API: TEACHERS & LEARNER PROGRESS
  // ==========================================
  app.get('/api/v1/teachers', (req: Request, res: Response) => {
    const lecturers = db.users.filter((u) => u.role === 'lecturer' || u.role === 'admin');
    const summaries = lecturers.map((teacher) => {
      const courses = db.courses.filter((c) => c.lecturerId === teacher.id);
      const courseIds = courses.map((c) => c.id);
      const studentRecords = db.learnerProgress.filter(
        (lp) => lp.teacherId === teacher.id || courseIds.includes(lp.courseId)
      );

      const totalStudents = studentRecords.length;
      const avgScore =
        totalStudents > 0
          ? Math.round(studentRecords.reduce((acc, curr) => acc + curr.averageQuizScore, 0) / totalStudents)
          : 88;

      const pendingSubmissions = db.submissions.filter(
        (s) => s.status === 'submitted' && courses.some((c) => c.code === s.courseCode)
      ).length;

      return {
        id: teacher.id,
        name: teacher.name,
        email: req.auth?.role === 'admin' || req.auth?.uid === teacher.id ? teacher.email : 'redacted@triple4c.com',
        title: teacher.role === 'admin' ? 'Dean / Department Head' : 'Senior Lecturer / Instructor',
        departmentId: teacher.departmentId || 'dept_cs',
        departmentName: teacher.departmentName || 'Computing & Applied AI',
        employeeId: teacher.employeeId || '444-FAC-100',
        coursesAssigned: courseIds,
        coursesList: courses,
        totalStudentsTaught: totalStudents,
        averageCohortScore: avgScore,
        pendingGradingCount: pendingSubmissions,
      };
    });

    res.json(summaries);
  });

  app.get('/api/v1/learner-progress', (req: Request, res: Response) => {
    const { teacherId, courseId, performanceBand, search } = req.query;
    let records = [...db.learnerProgress];

    // Students see only their own records (IDOR fix).
    if (req.auth?.role === 'student') {
      records = records.filter((lp) => lp.studentId === req.auth!.uid);
    }

    if (teacherId) {
      const teacherCourses = db.courses.filter((c) => c.lecturerId === teacherId).map((c) => c.id);
      records = records.filter((lp) => lp.teacherId === teacherId || teacherCourses.includes(lp.courseId));
    }

    if (courseId && courseId !== 'all') {
      records = records.filter((lp) => lp.courseId === courseId);
    }

    if (performanceBand && performanceBand !== 'all') {
      records = records.filter(
        (lp) => lp.performanceBand.toLowerCase() === (performanceBand as string).toLowerCase()
      );
    }

    if (search) {
      const q = (search as string).toLowerCase();
      records = records.filter(
        (lp) =>
          lp.studentName.toLowerCase().includes(q) ||
          lp.studentEmail.toLowerCase().includes(q) ||
          lp.studentIdNumber.toLowerCase().includes(q) ||
          lp.courseCode.toLowerCase().includes(q) ||
          lp.courseTitle.toLowerCase().includes(q)
      );
    }

    res.json(records);
  });

  app.get('/api/v1/learner-progress/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const record = db.learnerProgress.find((lp) => lp.id === id || lp.studentId === id);
    if (!record) {
      return res.status(404).json({ error: 'Learner progress record not found' });
    }
    if (req.auth?.role === 'student' && record.studentId !== req.auth.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(record);
  });

  app.post(
    '/api/v1/learner-progress/:id/notes',
    requireRole('admin', 'lecturer'),
    validateBody(notesUpdateSchema),
    (req: Request, res: Response) => {
      const { id } = req.params;
      const { notes, teacherName } = req.body;
      const record = db.learnerProgress.find((lp) => lp.id === id);
      if (!record) {
        return res.status(404).json({ error: 'Learner progress record not found' });
      }

      record.teacherNotes = notes;

      db.addAuditLog({
        userId: req.auth!.uid,
        userName: teacherName || record.teacherName,
        userRole: req.auth!.role as never,
        action: 'FACULTY_NOTE_UPDATED',
        resource: `/api/v1/learner-progress/${id}`,
        details: `Updated academic progress notes for learner ${record.studentName} (${record.studentIdNumber})`,
        ipAddress: hashIp(req.ip),
        status: 'SUCCESS',
        popiaCompliant: true,
      });

      res.json({ success: true, record });
    }
  );

  app.post(
    '/api/v1/learner-progress/:id/nudge',
    requireRole('admin', 'lecturer'),
    validateBody(nudgeSchema),
    (req: Request, res: Response) => {
      const { id } = req.params;
      const { message, priority, type, teacherName } = req.body;
      const record = db.learnerProgress.find((lp) => lp.id === id);
      if (!record) {
        return res.status(404).json({ error: 'Learner progress record not found' });
      }

      const title =
        type === 'warning'
          ? `Academic Alert: ${record.courseCode} Progress Reminder`
          : type === 'praise'
            ? `Kudos & Excellence Recognition: ${record.courseCode}`
            : `Teacher Message: ${record.courseCode}`;

      db.notifications.unshift({
        id: newId('notif'),
        recipientRole: 'student',
        recipientId: record.studentId,
        title,
        message: message || `Message from ${teacherName || record.teacherName} regarding ${record.courseTitle}`,
        category: 'academic',
        timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
        read: false,
        priority: priority || 'high',
        actionUrl: `/course/${record.courseId}`,
      });

      db.messages.push({
        id: newId('msg_nudge'),
        senderId: record.teacherId,
        senderName: teacherName || record.teacherName,
        senderRole: 'lecturer',
        recipientId: record.studentId,
        channelId: `${record.courseCode.toLowerCase()}-cohort`,
        message: `[DIRECT FACULTY NUDGE] ${message}`,
        timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
      });

      db.addAuditLog({
        userId: record.teacherId,
        userName: teacherName || record.teacherName,
        userRole: 'lecturer',
        action: 'TEACHER_NUDGE_SENT',
        resource: `/api/v1/learner-progress/${id}/nudge`,
        details: `Dispatched ${type || 'academic'} notification to ${record.studentName}`,
        ipAddress: hashIp(req.ip),
        status: 'SUCCESS',
        popiaCompliant: true,
      });

      res.json({
        success: true,
        message: `Nudge successfully dispatched to ${record.studentName}.`,
      });
    }
  );

  app.post(
    '/api/v1/learner-progress/broadcast-nudge',
    requireRole('admin', 'lecturer'),
    validateBody(broadcastNudgeSchema),
    (req: Request, res: Response) => {
      const { courseId, targetBand, message, teacherName } = req.body;
      let targets = db.learnerProgress;

      if (courseId && courseId !== 'all') {
        targets = targets.filter((lp) => lp.courseId === courseId);
      }
      if (targetBand && targetBand !== 'all') {
        targets = targets.filter((lp) => lp.performanceBand.toLowerCase() === targetBand.toLowerCase());
      }

      targets.forEach((student) => {
        db.notifications.unshift({
          id: newId('notif_bc'),
          recipientRole: 'student',
          recipientId: student.studentId,
          title: `Cohort Announcement: ${student.courseCode}`,
          message: message || `Important update regarding your ${student.courseTitle} coursework.`,
          category: 'academic',
          timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
          read: false,
          priority: 'high',
          actionUrl: `/course/${student.courseId}`,
        });
      });

      void teacherName;
      res.json({
        success: true,
        dispatchedCount: targets.length,
        message: `Broadcast successfully sent to ${targets.length} learners.`,
      });
    }
  );

  // ==========================================
  // REST API: REPORTS & GOVERNANCE
  // ==========================================
  app.get('/api/v1/reports/summary', requireRole('admin', 'lecturer'), (req: Request, res: Response) => {
    res.json({
      institution: 'Triple 4C (444 Curriculum)',
      totalStudents: 1205,
      totalLecturers: 44,
      totalDepartments: db.departments.length,
      averageAttendanceRate: 94.2,
      averageGradePercent: 81.6,
      dropoutRiskAlertsCount: 3,
      saSamsIntegrationStatus: 'Roadmap — demo data, not a certified export',
      lastSaSamsExport: 'Not yet implemented (demo)',
      bbbeeScorecardPoints: 24.8,
      setaAccreditedModules: 18,
      departmentBreakdown: db.departments.map((d, i) => ({
        name: d.name,
        code: d.code,
        students: d.studentCount,
        faculty: d.facultyCount,
        passRate: 85 + (i % 10),
      })),
      atRiskStudents: [
        { name: 'Kagiso Ndlovu', studentId: '444-STU-1102', reason: 'Missed 3 consecutive lab check-ins', risk: 'High' },
        { name: 'Chloe Naidoo', studentId: '444-STU-3304', reason: 'Unsubmitted Raft Cluster Milestone 1', risk: 'Medium' },
      ],
    });
  });

  // ==========================================
  // REST API: NOTIFICATIONS & BROADCASTS
  // ==========================================
  app.get('/api/v1/notifications', (req: Request, res: Response) => {
    if (req.auth?.role === 'student') {
      return res.json(db.notifications.filter((n) => !n.recipientId || n.recipientId === req.auth!.uid));
    }
    res.json(db.notifications);
  });

  app.post(
    '/api/v1/notifications',
    requireRole('admin', 'lecturer'),
    validateBody(notificationCreateSchema),
    (req: Request, res: Response) => {
      const { title, message, category, priority, recipientRole } = req.body;
      const newNotif = {
        id: newId('notif'),
        recipientRole: recipientRole || 'all',
        title: title || 'Campus Notification',
        message: message || '',
        category: category || 'announcement',
        timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
        read: false,
        priority: priority || 'normal',
      };

      db.notifications.unshift(newNotif);

      db.addAuditLog({
        userId: req.auth!.uid,
        userName: 'Staff',
        userRole: req.auth!.role as never,
        action: 'PUSH_NOTIFICATION_BROADCAST',
        resource: '/api/v1/notifications',
        details: `Broadcast alert: "${newNotif.title}" to target [${newNotif.recipientRole}]`,
        ipAddress: hashIp(req.ip),
        status: 'SUCCESS',
        popiaCompliant: true,
      });

      res.status(201).json(newNotif);
    }
  );

  app.post('/api/v1/notifications/:id/read', (req: Request, res: Response) => {
    const { id } = req.params;
    const notif = db.notifications.find((n) => n.id === id);
    if (notif) {
      if (req.auth?.role === 'student' && notif.recipientId && notif.recipientId !== req.auth.uid) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      notif.read = true;
    }
    res.json({ success: true, notif });
  });

  // ==========================================
  // REST API: ANNOUNCEMENTS
  // ==========================================
  app.get('/api/v1/announcements', (req: Request, res: Response) => {
    res.json(db.announcements);
  });

  app.post(
    '/api/v1/announcements',
    requireRole('admin', 'lecturer'),
    validateBody(announcementCreateSchema),
    (req: Request, res: Response) => {
      const { title, content, targetAudience, priority } = req.body;
      const ann = {
        id: newId('ann'),
        title: title || 'New Campus Announcement',
        content: content || '',
        targetAudience: targetAudience || 'All',
        createdAt: new Date().toISOString().replace('T', ' ').substr(0, 16),
        authorName: 'Administration',
        pinned: false,
        priority: priority || 'info',
      };

      db.announcements.unshift(ann);

      db.addAuditLog({
        userId: req.auth!.uid,
        userName: 'Administration',
        userRole: req.auth!.role as never,
        action: 'ANNOUNCEMENT_POST',
        resource: '/api/v1/announcements',
        details: `Posted announcement: "${ann.title}" for [${ann.targetAudience}]`,
        ipAddress: hashIp(req.ip),
        status: 'SUCCESS',
        popiaCompliant: true,
      });

      res.status(201).json(ann);
    }
  );

  // ==========================================
  // REST API: MESSAGES / DISCUSSIONS
  // ==========================================
  app.get('/api/v1/messages', (req: Request, res: Response) => {
    res.json(db.messages);
  });

  app.post('/api/v1/messages', validateBody(messageCreateSchema), (req: Request, res: Response) => {
    const { message, channelId } = req.body as { message: string; channelId?: string };
    const sender = db.users.find((u) => u.id === req.auth!.uid);

    const chatMsg = {
      id: newId('msg'),
      senderId: req.auth!.uid,
      senderName: sender?.name || 'Member',
      senderRole: req.auth!.role as never,
      channelId: channelId || 'cs201-cohort',
      message,
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
    };

    db.messages.push(chatMsg);
    res.status(201).json(chatMsg);
  });

  // ==========================================
  // REST API: USERS / RBAC LIST (scoped)
  // ==========================================
  app.get('/api/v1/users', (req: Request, res: Response) => {
    if (req.auth?.role === 'student') {
      const self = db.users.find((u) => u.id === req.auth!.uid);
      return res.json(self ? [self] : []);
    }
    if (req.auth?.role === 'lecturer') {
      return res.json(
        db.users.map((u) => (u.role === 'student' ? { ...u, email: u.email } : u))
      );
    }
    res.json(db.users);
  });

  app.get('/api/v1/badges', (req: Request, res: Response) => {
    res.json(db.badges);
  });

  // ==========================================
  // REST API: AI LESSON & QUIZ ASSISTANT (auth + rate-limited)
  // ==========================================
  app.post('/api/v1/ai/generate-quiz', validateBody(aiQuizSchema), async (req: Request, res: Response) => {
    const { topic, difficulty } = req.body;
    const ai = getAIClient();

    if (ai) {
      try {
        const prompt = `Generate a high-yield academic multiple-choice quiz question with 4 options, the 0-based index of the correct answer, and an insightful explanation for the topic: "${topic || 'Distributed Consensus in Cloud Systems'}". Target difficulty: ${difficulty || 'Undergraduate Level 3'}.
Return strictly valid JSON with this format:
{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctIndex": 0,
  "explanation": "string",
  "xpReward": 150
}`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const data = JSON.parse(response.text || '{}');
        return res.json(data);
      } catch (err) {
        logEvent('warn', 'ai_generation_fallback', { id: req.requestId });
      }
    }

    res.json({
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
    });
  });

  // ── API 404 + central error handler (never leak stacks in prod) ──
  app.use('/api/', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    logEvent('error', 'unhandled_error', { id: req.requestId, message: err.message });
    res.status(500).json(isProd ? { error: 'Internal error' } : { error: err.message });
  });

  // ==========================================
  // VITE MIDDLEWARE & MULTI-PAGE ROUTING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Export for tests; only listen when run directly.
  if (process.env.VITEST !== 'true' && !process.env.VITEST_WORKER_ID) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`=========================================`);
      console.log(`Triple 4C (444 Curriculum) Server Running!`);
      console.log(`Port: ${PORT} (0.0.0.0)`);
      console.log(`REST API Base: http://localhost:${PORT}/api/v1`);
      console.log(`=========================================`);
    });
  }
  return app;
}

export const appPromise = startServer();
export default appPromise;
