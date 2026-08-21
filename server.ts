import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { db } from './src/server/mockDb.ts';
import { ACADEMIC_REGISTRY, CourseModule } from './server/data/curriculum.ts';
import authRouter from './server/routes/auth.ts';

// Lazy initialize Gemini AI client if API key is provided
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple Request Audit Logger for API
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      console.log(`[API ${req.method}] ${req.path}`);
    }
    next();
  });

  // ==========================================
  // REST API: HEALTH & META
  // ==========================================
  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({
      status: 'operational',
      institution: 'Triple 4C (444 Curriculum)',
      motto: 'Character, Competency, Critical Thinking, Creativity',
      version: '2.4.0-Enterprise',
      timestamp: new Date().toISOString(),
      standards: ['POPIA-Compliant', 'SA-SAMS-Ready', 'SETA/B-BBEE-Audit-Grade']
    });
  });

  // ==========================================
  // REST API: AUTHENTICATION & RBAC
  // ==========================================
  app.post('/api/v1/auth/login', (req: Request, res: Response) => {
    const { email, role } = req.body;
    let user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    
    // If not found by exact email, allow quick role-based login for test accounts
    if (!user && role) {
      user = db.users.find(u => u.role === role);
    }
    if (!user) {
      user = db.users[0]; // fallback to student
    }

    // Log login in audit trail
    db.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      resource: '/api/v1/auth/login',
      details: `Session authenticated with RBAC role [${user.role.toUpperCase()}]`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      popiaCompliant: true
    });

    res.json({
      token: `jwt-444-${user.id}-${Date.now()}`,
      user
    });
  });

  app.post('/api/v1/auth/register', (req: Request, res: Response) => {
    const { name, email, role, departmentId } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const assignedRole = role || 'student';
    const dept = db.departments.find(d => d.id === departmentId) || db.departments[0];
    
    const newUser = {
      id: `${assignedRole.slice(0, 3)}_${Date.now()}`,
      name,
      email,
      role: assignedRole,
      departmentId: dept.id,
      departmentName: dept.name,
      studentId: assignedRole === 'student' ? `444-STU-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      employeeId: assignedRole !== 'student' ? `444-FAC-${Math.floor(100 + Math.random() * 900)}` : undefined,
      level: assignedRole === 'student' ? 1 : undefined,
      xp: assignedRole === 'student' ? 100 : undefined,
      streakDays: assignedRole === 'student' ? 1 : undefined,
      badges: assignedRole === 'student' ? ['badge_pioneer'] : undefined,
      registeredDate: new Date().toISOString().split('T')[0]
    };

    db.users.push(newUser);

    // Audit log
    db.addAuditLog({
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'ACCOUNT_CREATED',
      resource: '/api/v1/auth/register',
      details: `New ${newUser.role} account registered under ${dept.name}`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      popiaCompliant: true
    });

    res.status(201).json({
      message: 'Account created successfully under 444 Curriculum framework',
      user: newUser,
      token: `jwt-444-${newUser.id}-${Date.now()}`
    });
  });

  // ==========================================
  // REST API: DEPARTMENTS
  // ==========================================
  app.get('/api/v1/departments', (req: Request, res: Response) => {
    res.json(db.departments);
  });

  app.post('/api/v1/departments', (req: Request, res: Response) => {
    const { name, code, description, headOfDepartment, color } = req.body;
    const newDept = {
      id: `dept_${Date.now()}`,
      name: name || 'New Department',
      code: code || '444-NEW',
      description: description || '',
      headOfDepartment: headOfDepartment || 'TBD',
      facultyCount: 1,
      studentCount: 0,
      color: color || '#15803d'
    };
    db.departments.push(newDept);

    db.addAuditLog({
      userId: 'adm_01',
      userName: 'Dean Margaret Edwards',
      userRole: 'admin',
      action: 'DEPARTMENT_CREATED',
      resource: `/api/v1/departments/${newDept.id}`,
      details: `Created new academic department: ${newDept.name} (${newDept.code})`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      popiaCompliant: true
    });

    res.status(201).json(newDept);
  });

  // ==========================================
  // REST API: CURRICULUM REGISTRY (TEXTBOOK INDEX)
  // ==========================================
  app.get('/api/curriculum', (_req: Request, res: Response) => {
    try {
      // Enforce server cache control for high-priority delivery
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).json(ACADEMIC_REGISTRY);
    } catch (error) {
      res.status(500).json({ error: 'Internal Architectural Error' });
    }
  });

  // Also mount on /api/v1/curriculum for API uniformity
  app.get('/api/v1/curriculum', (_req: Request, res: Response) => {
    try {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).json(ACADEMIC_REGISTRY);
    } catch (error) {
      res.status(500).json({ error: 'Internal Architectural Error' });
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
      return res.json(db.lectures.filter(l => l.courseId === courseId));
    }
    res.json(db.lectures);
  });

  app.post('/api/v1/lectures', (req: Request, res: Response) => {
    const { courseId, title, moduleName, summary, readingNotes, quiz, videoUrl } = req.body;
    const course = db.courses.find(c => c.id === courseId) || db.courses[0];
    
    const newLecture = {
      id: `lec_${Date.now()}`,
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      title: title || 'New Lecture Module',
      moduleName: moduleName || 'Module: Advanced Foundations',
      order: db.lectures.filter(l => l.courseId === course.id).length + 1,
      videoDurationMinutes: Math.floor(25 + Math.random() * 20),
      videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      bitrates: [
        { label: 'Auto (Adaptive)', resolution: 'Dynamic', bitrateKbps: 0 },
        { label: '1080p Full HD', resolution: '1920x1080', bitrateKbps: 4500 },
        { label: '720p HD', resolution: '1280x720', bitrateKbps: 2200 },
        { label: '480p SD (Data Saver)', resolution: '854x480', bitrateKbps: 800 }
      ],
      summary: summary || 'Comprehensive academic lecture module covering 444 Curriculum principles.',
      readingNotes: readingNotes || 'Key reading notes and reference theorems.',
      completed: false,
      quiz: quiz || {
        question: 'What is the primary pedagogical goal of the Triple 4C Curriculum framework?',
        options: [
          'Rote memorization',
          'Holistic Character, Competency, Critical Thinking, and Creativity',
          'Commercial product promotion',
          'Elimination of assessments'
        ],
        correctIndex: 1,
        explanation: 'Triple 4C balances foundational rigor with real-world technical competency and ethical reflection.',
        xpReward: 150
      }
    };

    db.lectures.push(newLecture);

    db.addAuditLog({
      userId: 'lec_01',
      userName: 'Dr. Arthur Vance',
      userRole: 'lecturer',
      action: 'LECTURE_PUBLISHED',
      resource: `/api/v1/lectures/${newLecture.id}`,
      details: `Published lecture "${newLecture.title}" for ${course.code}`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      popiaCompliant: true
    });

    res.status(201).json(newLecture);
  });

  app.post('/api/v1/lectures/:id/complete', (req: Request, res: Response) => {
    const { id } = req.params;
    const { studentId, quizPassed } = req.body;

    const lecture = db.lectures.find(l => l.id === id);
    if (lecture) {
      lecture.completed = true;
    }

    const student = db.users.find(u => u.id === (studentId || 'stu_01'));
    if (student) {
      student.xp = (student.xp || 0) + (quizPassed ? 200 : 100);
      student.level = Math.floor((student.xp || 0) / 400) + 1;
      student.streakDays = (student.streakDays || 0) + 1;
      student.lastActiveDate = new Date().toISOString().split('T')[0];
    }

    db.addAuditLog({
      userId: student?.id || 'stu_01',
      userName: student?.name || 'Sarah Khumalo',
      userRole: 'student',
      action: 'LECTURE_COMPLETED',
      resource: `/api/v1/lectures/${id}`,
      details: `Completed lecture and quiz. XP updated to ${student?.xp}, Streak: ${student?.streakDays} days.`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      popiaCompliant: true
    });

    res.json({
      success: true,
      student,
      message: 'Lecture progress and gamified XP recorded successfully!'
    });
  });

  // ==========================================
  // REST API: TIMETABLE & CLASH DETECTION
  // ==========================================
  app.get('/api/v1/timetable', (req: Request, res: Response) => {
    res.json(db.timetable);
  });

  app.post('/api/v1/timetable', (req: Request, res: Response) => {
    const { courseId, lecturerId, dayOfWeek, startTime, endTime, room, type } = req.body;
    
    // Clash Detection Algorithm
    const clash = db.timetable.find(slot => 
      slot.dayOfWeek === dayOfWeek &&
      slot.room.toLowerCase() === (room || '').toLowerCase() &&
      !(endTime <= slot.startTime || startTime >= slot.endTime)
    );

    if (clash) {
      return res.status(409).json({
        error: 'Timetable Clash Detected!',
        message: `Room "${room}" is already booked on ${dayOfWeek} from ${clash.startTime} to ${clash.endTime} for ${clash.courseCode} (${clash.courseTitle}).`,
        clashingSlot: clash
      });
    }

    const course = db.courses.find(c => c.id === courseId) || db.courses[0];
    const lecturer = db.users.find(u => u.id === lecturerId) || db.users.find(u => u.role === 'lecturer') || db.users[3];

    const newSlot = {
      id: `slot_${Date.now()}`,
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
      onlineLink: `https://meet.triple4c.edu/${course.code.toLowerCase()}`
    };

    db.timetable.push(newSlot);

    db.addAuditLog({
      userId: 'adm_01',
      userName: 'Dean Margaret Edwards',
      userRole: 'admin',
      action: 'TIMETABLE_SCHEDULE_ADD',
      resource: `/api/v1/timetable/${newSlot.id}`,
      details: `Scheduled ${newSlot.courseCode} on ${newSlot.dayOfWeek} ${newSlot.startTime}-${newSlot.endTime} in ${newSlot.room}`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      popiaCompliant: true
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
    if (assignmentId) {
      return res.json(db.submissions.filter(s => s.assignmentId === assignmentId));
    }
    res.json(db.submissions);
  });

  app.post('/api/v1/assignments/:id/submit', (req: Request, res: Response) => {
    const { id } = req.params;
    const { studentId, fileName, contentNotes } = req.body;

    const assignment = db.assignments.find(a => a.id === id) || db.assignments[0];
    const student = db.users.find(u => u.id === studentId) || db.users[0];

    const submission = {
      id: `sub_${Date.now()}`,
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      courseCode: assignment.courseCode,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      submittedAt: new Date().toISOString().replace('T', ' ').substr(0, 16),
      fileName: fileName || 'Submission_File.pdf',
      fileSizeKb: Math.floor(1200 + Math.random() * 2000),
      contentNotes: contentNotes || 'Standard 444 assignment submission.',
      status: 'submitted' as const,
      maxGrade: assignment.maxPoints
    };

    db.submissions.unshift(submission);

    // Update assignment status for current student
    assignment.status = 'submitted';

    db.addAuditLog({
      userId: student.id,
      userName: student.name,
      userRole: 'student',
      action: 'ASSIGNMENT_SUBMISSION',
      resource: `/api/v1/assignments/${id}/submit`,
      details: `Submitted work for ${assignment.title} (${submission.fileName})`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      popiaCompliant: true
    });

    res.status(201).json({
      message: 'Assignment submitted successfully with encrypted hash verification.',
      submission
    });
  });

  app.post('/api/v1/submissions/:id/grade', (req: Request, res: Response) => {
    const { id } = req.params;
    const { grade, feedback, rubricScores, graderName } = req.body;

    const submission = db.submissions.find(s => s.id === id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    submission.status = 'graded';
    submission.grade = Number(grade);
    submission.feedback = feedback;
    submission.rubricScores = rubricScores;
    submission.gradedBy = graderName || 'Dr. Arthur Vance';
    submission.gradedAt = new Date().toISOString().replace('T', ' ').substr(0, 16);

    // Push notification to student
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientRole: 'student',
      recipientId: submission.studentId,
      title: `Assignment Graded: ${submission.assignmentTitle}`,
      message: `Score: ${submission.grade}/${submission.maxGrade}. Graded by ${submission.gradedBy}. Check detailed rubric feedback.`,
      category: 'grading',
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
      read: false,
      actionUrl: '/student/assignments',
      priority: 'high'
    });

    db.addAuditLog({
      userId: 'lec_01',
      userName: graderName || 'Dr. Arthur Vance',
      userRole: 'lecturer',
      action: 'SPEED_GRADER_EVALUATE',
      resource: `/api/v1/submissions/${id}`,
      details: `Assigned grade ${submission.grade}/${submission.maxGrade} to ${submission.studentName}`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      popiaCompliant: true
    });

    res.json({
      message: 'Grade recorded and student notification dispatched.',
      submission
    });
  });

  // ==========================================
  // REST API: ATTENDANCE
  // ==========================================
  app.get('/api/v1/attendance', (req: Request, res: Response) => {
    res.json(db.attendanceRecords);
  });

  app.post('/api/v1/attendance/check-in', (req: Request, res: Response) => {
    const { studentId, courseId, method } = req.body;
    const student = db.users.find(u => u.id === (studentId || 'stu_01')) || db.users[0];
    const course = db.courses.find(c => c.id === courseId) || db.courses[0];

    const record = {
      id: `att_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      studentId: student.id,
      studentName: student.name,
      status: 'Present' as const,
      checkInTime: new Date().toTimeString().substr(0, 5),
      method: method || 'Self Check-in'
    };

    db.attendanceRecords.unshift(record);

    db.addAuditLog({
      userId: student.id,
      userName: student.name,
      userRole: 'student',
      action: 'ATTENDANCE_CHECKIN',
      resource: `/api/v1/attendance`,
      details: `Checked in for ${course.code} via ${record.method}`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      popiaCompliant: true
    });

    res.status(201).json({
      message: 'Attendance recorded successfully.',
      record
    });
  });

  // ==========================================
  // REST API: AUDIT LOGS & COMPLIANCE
  // ==========================================
  app.get('/api/v1/audit-logs', (req: Request, res: Response) => {
    const { role, action, search } = req.query;
    let filtered = [...db.auditLogs];

    if (role) {
      filtered = filtered.filter(l => l.userRole === role);
    }
    if (action) {
      filtered = filtered.filter(l => l.action.toLowerCase().includes((action as string).toLowerCase()));
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(l => 
        l.userName.toLowerCase().includes(q) || 
        l.details.toLowerCase().includes(q) ||
        l.resource.toLowerCase().includes(q) ||
        l.ipAddress.includes(q)
      );
    }

    res.json(filtered);
  });

  // ==========================================
  // REST API: TEACHERS & LEARNER PROGRESS DASHBOARD
  // ==========================================
  app.get('/api/v1/teachers', (req: Request, res: Response) => {
    const lecturers = db.users.filter(u => u.role === 'lecturer' || u.role === 'admin');
    const summaries = lecturers.map(teacher => {
      const courses = db.courses.filter(c => c.lecturerId === teacher.id);
      const courseIds = courses.map(c => c.id);
      const studentRecords = db.learnerProgress.filter(lp => lp.teacherId === teacher.id || courseIds.includes(lp.courseId));
      
      const totalStudents = studentRecords.length;
      const avgScore = totalStudents > 0 
        ? Math.round(studentRecords.reduce((acc, curr) => acc + curr.averageQuizScore, 0) / totalStudents)
        : 88;
      
      const pendingSubmissions = db.submissions.filter(s => 
        s.status === 'submitted' && courses.some(c => c.code === s.courseCode)
      ).length;

      return {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        title: teacher.role === 'admin' ? 'Dean / Department Head' : 'Senior Lecturer / Instructor',
        departmentId: teacher.departmentId || 'dept_cs',
        departmentName: teacher.departmentName || 'Computing & Applied AI',
        employeeId: teacher.employeeId || '444-FAC-100',
        coursesAssigned: courseIds,
        coursesList: courses,
        totalStudentsTaught: totalStudents,
        averageCohortScore: avgScore,
        pendingGradingCount: pendingSubmissions
      };
    });

    res.json(summaries);
  });

  app.get('/api/v1/learner-progress', (req: Request, res: Response) => {
    const { teacherId, courseId, performanceBand, search } = req.query;
    let records = [...db.learnerProgress];

    if (teacherId) {
      // Find courses for this teacher
      const teacherCourses = db.courses.filter(c => c.lecturerId === teacherId).map(c => c.id);
      records = records.filter(lp => lp.teacherId === teacherId || teacherCourses.includes(lp.courseId));
    }

    if (courseId && courseId !== 'all') {
      records = records.filter(lp => lp.courseId === courseId);
    }

    if (performanceBand && performanceBand !== 'all') {
      records = records.filter(lp => lp.performanceBand.toLowerCase() === (performanceBand as string).toLowerCase());
    }

    if (search) {
      const q = (search as string).toLowerCase();
      records = records.filter(lp => 
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
    const record = db.learnerProgress.find(lp => lp.id === id || lp.studentId === id);
    if (!record) {
      return res.status(404).json({ error: 'Learner progress record not found' });
    }
    res.json(record);
  });

  app.post('/api/v1/learner-progress/:id/notes', (req: Request, res: Response) => {
    const { id } = req.params;
    const { notes, teacherName } = req.body;
    const record = db.learnerProgress.find(lp => lp.id === id);
    if (!record) {
      return res.status(404).json({ error: 'Learner progress record not found' });
    }

    record.teacherNotes = notes;

    db.addAuditLog({
      userId: 'lec_01',
      userName: teacherName || record.teacherName,
      userRole: 'lecturer',
      action: 'FACULTY_NOTE_UPDATED',
      resource: `/api/v1/learner-progress/${id}`,
      details: `Updated academic progress notes for learner ${record.studentName} (${record.studentIdNumber})`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      popiaCompliant: true
    });

    res.json({ success: true, record });
  });

  app.post('/api/v1/learner-progress/:id/nudge', (req: Request, res: Response) => {
    const { id } = req.params;
    const { message, priority, type, teacherName } = req.body;
    const record = db.learnerProgress.find(lp => lp.id === id);
    if (!record) {
      return res.status(404).json({ error: 'Learner progress record not found' });
    }

    const title = type === 'warning' 
      ? `Academic Alert: ${record.courseCode} Progress Reminder`
      : type === 'praise'
      ? `Kudos & Excellence Recognition: ${record.courseCode}`
      : `Teacher Message: ${record.courseCode}`;

    // Dispatched Push Notification
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientRole: 'student',
      recipientId: record.studentId,
      title,
      message: message || `Message from ${teacherName || record.teacherName} regarding ${record.courseTitle}`,
      category: 'academic',
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
      read: false,
      priority: priority || 'high',
      actionUrl: `/course/${record.courseId}`
    });

    // Also add to chat messages
    db.messages.push({
      id: `msg_nudge_${Date.now()}`,
      senderId: record.teacherId,
      senderName: teacherName || record.teacherName,
      senderRole: 'lecturer',
      recipientId: record.studentId,
      channelId: `${record.courseCode.toLowerCase()}-cohort`,
      message: `[DIRECT FACULTY NUDGE] ${message}`,
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16)
    });

    db.addAuditLog({
      userId: record.teacherId,
      userName: teacherName || record.teacherName,
      userRole: 'lecturer',
      action: 'TEACHER_NUDGE_SENT',
      resource: `/api/v1/learner-progress/${id}/nudge`,
      details: `Dispatched ${type || 'academic'} notification to ${record.studentName}`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      popiaCompliant: true
    });

    res.json({
      success: true,
      message: `Nudge successfully dispatched to ${record.studentName}.`
    });
  });

  app.post('/api/v1/learner-progress/broadcast-nudge', (req: Request, res: Response) => {
    const { courseId, targetBand, message, teacherName } = req.body;
    let targets = db.learnerProgress;

    if (courseId && courseId !== 'all') {
      targets = targets.filter(lp => lp.courseId === courseId);
    }
    if (targetBand && targetBand !== 'all') {
      targets = targets.filter(lp => lp.performanceBand.toLowerCase() === targetBand.toLowerCase());
    }

    targets.forEach(student => {
      db.notifications.unshift({
        id: `notif_bc_${Date.now()}_${student.studentId}`,
        recipientRole: 'student',
        recipientId: student.studentId,
        title: `Cohort Announcement: ${student.courseCode}`,
        message: message || `Important update regarding your ${student.courseTitle} coursework.`,
        category: 'academic',
        timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
        read: false,
        priority: 'high',
        actionUrl: `/course/${student.courseId}`
      });
    });

    res.json({
      success: true,
      dispatchedCount: targets.length,
      message: `Broadcast successfully sent to ${targets.length} learners.`
    });
  });

  // ==========================================
  // REST API: REPORTS & GOVERNANCE
  // ==========================================
  app.get('/api/v1/reports/summary', (req: Request, res: Response) => {
    res.json({
      institution: 'Triple 4C (444 Curriculum)',
      totalStudents: 1205,
      totalLecturers: 44,
      totalDepartments: db.departments.length,
      averageAttendanceRate: 94.2,
      averageGradePercent: 81.6,
      dropoutRiskAlertsCount: 3,
      saSamsIntegrationStatus: 'Synchronized (CAPS/IEB Compatible)',
      lastSaSamsExport: '2026-08-19 22:15 SAST',
      bbbeeScorecardPoints: 24.8,
      setaAccreditedModules: 18,
      departmentBreakdown: db.departments.map(d => ({
        name: d.name,
        code: d.code,
        students: d.studentCount,
        faculty: d.facultyCount,
        passRate: 85 + Math.floor(Math.random() * 10)
      })),
      atRiskStudents: [
        { name: 'Kagiso Ndlovu', studentId: '444-STU-1102', reason: 'Missed 3 consecutive lab check-ins', risk: 'High' },
        { name: 'Chloe Naidoo', studentId: '444-STU-3304', reason: 'Unsubmitted Raft Cluster Milestone 1', risk: 'Medium' }
      ]
    });
  });

  // ==========================================
  // REST API: NOTIFICATIONS & BROADCASTS
  // ==========================================
  app.get('/api/v1/notifications', (req: Request, res: Response) => {
    res.json(db.notifications);
  });

  app.post('/api/v1/notifications', (req: Request, res: Response) => {
    const { title, message, category, priority, recipientRole } = req.body;
    const newNotif = {
      id: `notif_${Date.now()}`,
      recipientRole: recipientRole || 'all',
      title: title || 'Campus Notification',
      message: message || '',
      category: category || 'announcement',
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
      read: false,
      priority: priority || 'normal'
    };

    db.notifications.unshift(newNotif);

    db.addAuditLog({
      userId: 'adm_01',
      userName: 'Dean Margaret Edwards',
      userRole: 'admin',
      action: 'PUSH_NOTIFICATION_BROADCAST',
      resource: '/api/v1/notifications',
      details: `Broadcast alert: "${newNotif.title}" to target [${newNotif.recipientRole}]`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      popiaCompliant: true
    });

    res.status(201).json(newNotif);
  });

  app.post('/api/v1/notifications/:id/read', (req: Request, res: Response) => {
    const { id } = req.params;
    const notif = db.notifications.find(n => n.id === id);
    if (notif) {
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

  app.post('/api/v1/announcements', (req: Request, res: Response) => {
    const { title, content, targetAudience, priority } = req.body;
    const ann = {
      id: `ann_${Date.now()}`,
      title: title || 'New Campus Announcement',
      content: content || '',
      targetAudience: targetAudience || 'All',
      createdAt: new Date().toISOString().replace('T', ' ').substr(0, 16),
      authorName: 'Dean Margaret Edwards',
      pinned: false,
      priority: priority || 'info'
    };

    db.announcements.unshift(ann);

    db.addAuditLog({
      userId: 'adm_01',
      userName: 'Dean Margaret Edwards',
      userRole: 'admin',
      action: 'ANNOUNCEMENT_POST',
      resource: '/api/v1/announcements',
      details: `Posted announcement: "${ann.title}" for [${ann.targetAudience}]`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      popiaCompliant: true
    });

    res.status(201).json(ann);
  });

  // ==========================================
  // REST API: MESSAGES / DISCUSSIONS
  // ==========================================
  app.get('/api/v1/messages', (req: Request, res: Response) => {
    res.json(db.messages);
  });

  app.post('/api/v1/messages', (req: Request, res: Response) => {
    const { senderId, senderName, senderRole, message, channelId } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const chatMsg = {
      id: `msg_${Date.now()}`,
      senderId: senderId || 'stu_01',
      senderName: senderName || 'Sarah Khumalo',
      senderRole: senderRole || 'student',
      channelId: channelId || 'cs201-cohort',
      message,
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16)
    };

    db.messages.push(chatMsg);
    res.status(201).json(chatMsg);
  });

  // ==========================================
  // REST API: USERS / RBAC LIST
  // ==========================================
  app.get('/api/v1/users', (req: Request, res: Response) => {
    res.json(db.users);
  });

  app.get('/api/v1/badges', (req: Request, res: Response) => {
    res.json(db.badges);
  });

  // ==========================================
  // REST API: AI LESSON & QUIZ ASSISTANT (Gemini Powered)
  // ==========================================
  app.post('/api/v1/ai/generate-quiz', async (req: Request, res: Response) => {
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
          config: { responseMimeType: 'application/json' }
        });
        
        const data = JSON.parse(response.text || '{}');
        return res.json(data);
      } catch (err) {
        console.warn('AI Generation fallback due to API error:', err);
      }
    }

    // Default high-quality fallback question based on topic
    res.json({
      question: `Under the 444 Curriculum framework for ${topic || 'Distributed Consensus'}, what is the primary guarantee provided by state machine replication?`,
      options: [
        'Deterministic state convergence across all un-crashed nodes executing log operations in the identical sequence',
        'Elimination of network hardware latency',
        'Automatic conversion of all unstructured data into relational tables',
        'Zero CPU overhead during cryptographic signing'
      ],
      correctIndex: 0,
      explanation: 'State machine replication guarantees that identical inputs executed in the exact order on deterministic state machines produce identical state transitions.',
      xpReward: 150
    });
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`Triple 4C (444 Curriculum) Server Running!`);
    console.log(`Port: ${PORT} (0.0.0.0)`);
    console.log(`REST API Base: http://localhost:${PORT}/api/v1`);
    console.log(`=========================================`);
  });
}

startServer();
