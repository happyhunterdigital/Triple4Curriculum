/**
 * Seed Firestore catalog collections for Triple4Curriculum.
 * User-linked collections (submissions, attendance, learner_progress,
 * notifications, messages, audit_logs) populate through real app use and
 * are intentionally NOT seeded.
 *
 * Usage:
 *   FIREBASE_SERVICE_ACCOUNT_JSON='...' bun run seed
 *   # or GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json bun run seed
 */
import admin from 'firebase-admin';

const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (svcJson) {
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(svcJson)) });
} else {
  admin.initializeApp();
}

const db = admin.firestore();

const DEPARTMENTS = [
  { id: 'dept_cs', name: 'Department of Computing & Applied AI', code: '444-CS', description: 'Systems, distributed computing and applied artificial intelligence.', headOfDepartment: 'Dr. Arthur Vance', facultyCount: 12, studentCount: 0, color: '#15803d' },
  { id: 'dept_eng', name: 'Department of Systems Engineering & Robotics', code: '444-ENG', description: 'Robotics, control systems and engineering design.', headOfDepartment: 'Prof. N. Dlamini', facultyCount: 9, studentCount: 0, color: '#1d4ed8' },
  { id: 'dept_biz', name: 'Department of Digital Business & FinTech', code: '444-BIZ', description: 'Digital business models, payments and data ethics.', headOfDepartment: 'Dr. L. Petersen', facultyCount: 8, studentCount: 0, color: '#b45309' },
];

const COURSES = [
  { id: 'csc441', code: 'CSC-441', title: 'Distributed Consensus & Cloud Systems', departmentId: 'dept_cs', lecturerId: '', lecturerName: 'Dr. Arthur Vance', credits: 30, description: 'Raft, state machine replication and quorum protocols.', semester: 'Semester 2', modulesCount: 6, totalHours: 120 },
  { id: 'ai442', code: 'AI-442', title: 'POPIA & AI Ethics Frameworks', departmentId: 'dept_cs', lecturerId: '', lecturerName: 'Dr. Arthur Vance', credits: 24, description: 'Lawful telemetry, consent and ethical auditing under POPIA.', semester: 'Semester 2', modulesCount: 5, totalHours: 96 },
  { id: 'biz441', code: 'BIZ-441', title: 'FinTech Systems & Data Ethics', departmentId: 'dept_biz', lecturerId: '', lecturerName: 'Dr. L. Petersen', credits: 24, description: 'Payments rails, PayFast/Stripe integration and POPIA governance.', semester: 'Semester 2', modulesCount: 5, totalHours: 96 },
];

const LECTURES = [
  {
    courseId: 'csc441', courseCode: 'CSC-441', courseTitle: 'Distributed Consensus & Cloud Systems',
    title: 'Lecture 1: State Machine Replication', moduleName: 'Module 1: Replication Foundations', order: 1,
    videoDurationMinutes: 32, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    summary: 'Deterministic replicas, identical inputs, identical state transitions.',
    readingNotes: 'Raft paper sections 1-4; state machine safety invariant.',
    completed: false,
    quiz: { question: 'What guarantee does state machine replication provide?', options: ['Identical state transitions on deterministic replicas', 'Zero network latency', 'Free storage', 'No code required'], correctIndex: 0, explanation: 'Identical inputs in identical order on deterministic machines converge.', xpReward: 150 },
  },
  {
    courseId: 'ai442', courseCode: 'AI-442', courseTitle: 'POPIA & AI Ethics Frameworks',
    title: 'Lecture 1: Dignity, Consent & Fairness', moduleName: 'Module 1: Ethical AI Frameworks', order: 1,
    videoDurationMinutes: 28, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    summary: 'The 8 conditions for lawful processing under POPIA.',
    readingNotes: 'POPIA Act 4 of 2013, conditions 1-4; consent records.',
    completed: false,
    quiz: { question: 'Which condition requires a lawful basis before collecting personal information?', options: ['Processing limitation', 'Unlimited collection', 'Sale to advertisers', 'No conditions apply'], correctIndex: 0, explanation: 'Processing limitation demands lawfulness and minimality.', xpReward: 150 },
  },
];

const TIMETABLE = [
  { courseId: 'csc441', courseCode: 'CSC-441', courseTitle: 'Distributed Consensus & Cloud Systems', lecturerName: 'Dr. Arthur Vance', lecturerId: '', dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:30', room: 'Lecture Hall B', type: 'Lecture', departmentId: 'dept_cs', onlineLink: 'https://meet.triple4c.com/csc-441' },
  { courseId: 'ai442', courseCode: 'AI-442', courseTitle: 'POPIA & AI Ethics Frameworks', lecturerName: 'Dr. Arthur Vance', lecturerId: '', dayOfWeek: 'Wednesday', startTime: '11:00', endTime: '12:30', room: 'Seminar Room 2', type: 'Seminar', departmentId: 'dept_cs', onlineLink: 'https://meet.triple4c.com/ai-442' },
];

const ASSIGNMENTS = [
  { courseId: 'csc441', courseCode: 'CSC-441', courseTitle: 'Distributed Consensus & Cloud Systems', title: 'Raft Leader Election Lab', description: 'Implement heartbeat timeouts and term increments; demonstrate a single leader.', dueDate: '2026-10-15', maxPoints: 100, departmentId: 'dept_cs', lecturerId: '', rubric: [{ id: 'r1', title: 'Correctness', maxScore: 60, description: 'Single leader, safety preserved.' }, { id: 'r2', title: 'Write-up', maxScore: 40, description: 'Clear protocol explanation.' }], status: 'pending' },
  { courseId: 'ai442', courseCode: 'AI-442', courseTitle: 'POPIA & AI Ethics Frameworks', title: 'POPIA Impact Assessment', description: 'Assess a telemetry pipeline against the 8 conditions for lawful processing.', dueDate: '2026-10-22', maxPoints: 100, departmentId: 'dept_cs', lecturerId: '', rubric: [{ id: 'r1', title: 'Legal reasoning', maxScore: 60, description: 'Correct application of POPIA conditions.' }, { id: 'r2', title: 'Mitigations', maxScore: 40, description: 'Practical safeguards proposed.' }], status: 'pending' },
];

const BADGES = [
  { name: 'Pioneer', description: 'First lecture completed', icon: 'flag', category: 'engagement', rarity: 'Common', color: '#15803d' },
  { name: 'Quiz Master', description: 'Perfect quiz score', icon: 'award', category: 'academic', rarity: 'Rare', color: '#b45309' },
  { name: 'POPIA Guardian', description: '100% data ethics score', icon: 'shield', category: 'mastery', rarity: 'Epic', color: '#1d4ed8' },
];

const ANNOUNCEMENTS = [
  { title: 'Welcome to Semester 2', content: 'Lectures, assignments and timetables are live. Check your dashboard for this week.', targetAudience: 'All', authorName: 'Administration', pinned: true, priority: 'info' },
];

async function seedCollection(name, docs, customIds) {
  const batch = db.batch();
  const existing = await db.collection(name).limit(1).get();
  if (!existing.empty) {
    console.log(`- ${name}: already has data, skipping`);
    return;
  }
  docs.forEach((d, i) => {
    const ref = customIds && d.id ? db.collection(name).doc(d.id) : db.collection(name).doc();
    const { id: _drop, ...rest } = d;
    batch.set(ref, { ...rest, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  await batch.commit();
  console.log(`- ${name}: seeded ${docs.length}`);
}

await seedCollection('departments', DEPARTMENTS, true);
await seedCollection('courses', COURSES, true);
await seedCollection('lectures', LECTURES, false);
await seedCollection('timetable', TIMETABLE, false);
await seedCollection('assignments', ASSIGNMENTS, false);
await seedCollection('badges', BADGES, false);
await seedCollection('announcements', ANNOUNCEMENTS, false);
console.log('Seed complete.');
process.exit(0);
