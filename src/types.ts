export type UserRole = 'student' | 'lecturer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  departmentId?: string;
  departmentName?: string;
  studentId?: string;
  employeeId?: string;
  level?: number;
  xp?: number;
  streakDays?: number;
  lastActiveDate?: string;
  badges?: string[];
  registeredDate: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headOfDepartment: string;
  facultyCount: number;
  studentCount: number;
  color: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  lecturerId: string;
  lecturerName: string;
  credits: number;
  description: string;
  semester: string;
  thumbnail?: string;
  progressPercent?: number;
  modulesCount: number;
  totalHours: number;
}

export interface Lecture {
  id: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  title: string;
  moduleName: string;
  order: number;
  videoDurationMinutes: number;
  videoUrl?: string;
  bitrates: Array<{ label: string; resolution: string; bitrateKbps: number }>;
  summary: string;
  readingNotes: string;
  completed?: boolean;
  dripReleaseDate?: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    xpReward: number;
  };
}

export interface TimetableSlot {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  lecturerName: string;
  lecturerId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  room: string;
  type: 'Lecture' | 'Lab' | 'Tutorial' | 'Seminar';
  departmentId: string;
  onlineLink?: string;
}

export interface RubricCriterion {
  id: string;
  title: string;
  maxScore: number;
  description: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  departmentId: string;
  lecturerId: string;
  rubric: RubricCriterion[];
  status?: 'pending' | 'submitted' | 'graded';
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  courseCode: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  fileName: string;
  fileSizeKb: number;
  contentNotes: string;
  status: 'submitted' | 'graded';
  grade?: number;
  maxGrade: number;
  feedback?: string;
  rubricScores?: Record<string, number>;
  gradedBy?: string;
  gradedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  status: 'Present' | 'Late' | 'Absent';
  checkInTime?: string;
  method: 'Self Check-in' | 'Lecturer Roster' | 'QR Code';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'streak' | 'academic' | 'engagement' | 'mastery';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  color: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  popiaCompliant: boolean;
}

export interface PushNotification {
  id: string;
  recipientRole?: UserRole | 'all';
  recipientId?: string;
  title: string;
  message: string;
  category: 'academic' | 'urgent' | 'announcement' | 'grading' | 'streak';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId?: string; // or channel
  channelId?: string;
  message: string;
  timestamp: string;
  avatarUrl?: string;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'All' | 'Students' | 'Lecturers' | 'Staff';
  createdAt: string;
  authorName: string;
  pinned: boolean;
  priority: 'info' | 'warning' | 'critical';
}

export interface LearnerModuleProgress {
  moduleId: string;
  moduleName: string;
  lectureTitle: string;
  completed: boolean;
  watchedPercent: number;
  quizScore?: number;
  quizPassed?: boolean;
  completedAt?: string;
  timeSpentMinutes: number;
}

export interface LearnerCourseProgress {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentIdNumber: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  teacherId: string;
  teacherName: string;
  enrolledDate: string;
  overallProgressPercent: number;
  completedLecturesCount: number;
  totalLecturesCount: number;
  averageQuizScore: number;
  quizzesAttemptedCount: number;
  quizzesTotalCount: number;
  assignmentsSubmittedCount: number;
  assignmentsTotalCount: number;
  latestAssignmentGrade?: number;
  attendanceRatePercent: number;
  streakDays: number;
  lastActive: string;
  performanceBand: 'High Distinction' | 'On Track' | 'Needs Attention' | 'At Risk';
  teacherNotes?: string;
  moduleDetails: LearnerModuleProgress[];
  submittedAssignments: Array<{
    assignmentId: string;
    title: string;
    submittedAt: string;
    status: 'submitted' | 'graded' | 'missing';
    grade?: number;
    maxGrade: number;
    feedback?: string;
  }>;
}

export interface TeacherSummary {
  id: string;
  name: string;
  email: string;
  title: string;
  departmentId: string;
  departmentName: string;
  employeeId: string;
  avatarUrl?: string;
  coursesAssigned: string[]; // course ids
  totalStudentsTaught: number;
  averageCohortScore: number;
  pendingGradingCount: number;
}

export interface InstitutionalDocument {
  id: string;
  title: string;
  category: 'Statutory & Compliance' | 'Curriculum & Syllabus' | 'Academic Policies' | 'Student Handbooks' | 'Laboratory & Safety';
  departmentId?: string;
  departmentName: string;
  version: string;
  lastUpdated: string;
  author: string;
  fileSizeKb: number;
  fileFormat: 'PDF' | 'DOCX' | 'XML';
  summary: string;
  dhetAccreditationCode?: string;
  popiaCompliant: boolean;
  content: string;
  tags: string[];
}

export interface SearchResultItem {
  id: string;
  type: 'course' | 'lecture' | 'assignment' | 'document' | 'faculty' | 'action';
  title: string;
  subtitle: string;
  meta?: string;
  route: string;
  badge?: string;
  category: string;
  iconName: string;
  documentId?: string;
}

export interface UserProfileSettings {
  bio: string;
  phone: string;
  learningGoal: string;
  preferredLanguage: string;
  popiaConsentGiven: boolean;
  shareProgressWithAdvisor: boolean;
  receiveEmailSummaries: boolean;
  twoFactorEnabled: boolean;
}

