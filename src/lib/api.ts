import {
  User, Department, Course, Lecture, TimetableSlot,
  Assignment, AssignmentSubmission, AttendanceRecord,
  Badge, AuditLog, PushNotification, ChatMessage, SystemAnnouncement,
  LearnerCourseProgress, TeacherSummary
} from '../types';
import { auth as fbAuth } from './firebase';

const API_BASE = '/api/v1';

function getDevHeaders(): Record<string, string> {
  // Dev fallback so the demo API works without Firebase configured.
  // Production uses Firebase ID tokens (Authorization: Bearer ...).
  try {
    const uid = localStorage.getItem('444_current_user_id');
    const role = localStorage.getItem('444_current_user_role');
    const headers: Record<string, string> = {};
    if (uid) headers['x-dev-user-id'] = uid;
    if (role) headers['x-dev-role'] = role;
    return headers;
  } catch {
    return {};
  }
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    let idToken = '';
    try {
      idToken = (await fbAuth.currentUser?.getIdToken()) || '';
    } catch {
      idToken = '';
    }
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        ...getDevHeaders(),
        ...options?.headers,
      },
      ...options,
    });
    if (res.status === 401) {
      throw new Error('Session expired or missing. Please sign in again.');
    }
    if (res.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errorData.message || errorData.error || `Request failed (${res.status}). Please retry.`);
    }
    return await res.json();
  } catch (error) {
    // Keep console diagnostics for devs, but callers must surface user-facing states.
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (email: string, role?: string) =>
    fetchApi<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role })
    }),

  register: (payload: { name: string; email: string; role: string; departmentId: string; agreePrivacy: boolean; agreeConduct?: boolean }) =>
    fetchApi<{ message: string; user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getPrivacy: () => fetchApi<{ title: string; summary: string; contact: string }>('/privacy'),
  exportMyData: (userId: string) =>
    fetchApi<unknown>(`/auth/export-my-data?userId=${encodeURIComponent(userId)}`),

  // Departments
  getDepartments: () => fetchApi<Department[]>('/departments'),
  createDepartment: (dept: Partial<Department>) =>
    fetchApi<Department>('/departments', {
      method: 'POST',
      body: JSON.stringify(dept)
    }),

  // Courses & Lectures
  getCourses: () => fetchApi<Course[]>('/courses'),
  getLectures: (courseId?: string) => fetchApi<Lecture[]>(courseId ? `/lectures?courseId=${courseId}` : '/lectures'),
  createLecture: (lecture: Partial<Lecture>) =>
    fetchApi<Lecture>('/lectures', {
      method: 'POST',
      body: JSON.stringify(lecture)
    }),
  completeLecture: (lectureId: string, studentId: string, quizPassed: boolean) =>
    fetchApi<{ success: boolean; student: User; message: string }>(`/lectures/${lectureId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ studentId, quizPassed })
    }),

  // Timetable
  getTimetable: () => fetchApi<TimetableSlot[]>('/timetable'),
  createTimetableSlot: (slot: Partial<TimetableSlot>) =>
    fetchApi<TimetableSlot>('/timetable', {
      method: 'POST',
      body: JSON.stringify(slot)
    }),

  // Assignments & SpeedGrader
  getAssignments: () => fetchApi<Assignment[]>('/assignments'),
  getSubmissions: (assignmentId?: string) =>
    fetchApi<AssignmentSubmission[]>(assignmentId ? `/submissions?assignmentId=${assignmentId}` : '/submissions'),
  submitAssignment: (assignmentId: string, payload: { studentId: string; fileName: string; contentNotes: string }) =>
    fetchApi<{ message: string; submission: AssignmentSubmission }>(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  gradeSubmission: (submissionId: string, payload: { grade: number; feedback: string; rubricScores: Record<string, number>; graderName: string }) =>
    fetchApi<{ message: string; submission: AssignmentSubmission }>(`/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Attendance
  getAttendance: () => fetchApi<AttendanceRecord[]>('/attendance'),
  checkInAttendance: (studentId: string, courseId: string, method?: string) =>
    fetchApi<{ message: string; record: AttendanceRecord }>('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ studentId, courseId, method })
    }),

  // Audit Logs (admin only)
  getAuditLogs: (params?: { role?: string; action?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.role) query.set('role', params.role);
    if (params?.action) query.set('action', params.action);
    if (params?.search) query.set('search', params.search);
    return fetchApi<AuditLog[]>(`/audit-logs?${query.toString()}`);
  },

  // Reports
  getReportsSummary: () => fetchApi<unknown>('/reports/summary'),

  // Notifications & Announcements
  getNotifications: () => fetchApi<PushNotification[]>('/notifications'),
  markNotificationRead: (id: string) => fetchApi<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' }),
  sendPushNotification: (payload: Partial<PushNotification>) =>
    fetchApi<PushNotification>('/notifications', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getAnnouncements: () => fetchApi<SystemAnnouncement[]>('/announcements'),
  createAnnouncement: (payload: Partial<SystemAnnouncement>) =>
    fetchApi<SystemAnnouncement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Messages
  getMessages: () => fetchApi<ChatMessage[]>('/messages'),
  sendMessage: (payload: Partial<ChatMessage>) =>
    fetchApi<ChatMessage>('/messages', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Users & Badges
  getUsers: () => fetchApi<User[]>('/users'),
  createUser: (payload: Partial<User> & { agreePrivacy?: boolean }) =>
    fetchApi<{ message: string; user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }).then(res => res.user),
  getBadges: () => fetchApi<Badge[]>('/badges'),

  // AI Quiz Generator
  generateAiQuiz: (topic: string, difficulty?: string) =>
    fetchApi<{ question: string; options: string[]; correctIndex: number; explanation: string; xpReward: number }>('/ai/generate-quiz', {
      method: 'POST',
      body: JSON.stringify({ topic, difficulty })
    }),

  // Teachers & Learner Progress
  getTeachers: () => fetchApi<(TeacherSummary & { coursesList: Course[] })[]>('/teachers'),
  getLearnerProgress: (params?: { teacherId?: string; courseId?: string; performanceBand?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.teacherId) query.set('teacherId', params.teacherId);
    if (params?.courseId) query.set('courseId', params.courseId);
    if (params?.performanceBand) query.set('performanceBand', params.performanceBand);
    if (params?.search) query.set('search', params.search);
    return fetchApi<LearnerCourseProgress[]>(`/learner-progress?${query.toString()}`);
  },
  getLearnerProgressDetail: (id: string) => fetchApi<LearnerCourseProgress>(`/learner-progress/${id}`),
  updateLearnerNotes: (id: string, notes: string, teacherName?: string) =>
    fetchApi<{ success: boolean; record: LearnerCourseProgress }>(`/learner-progress/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ notes, teacherName })
    }),
  nudgeLearner: (id: string, payload: { message: string; priority?: string; type?: 'warning' | 'praise' | 'info'; teacherName?: string }) =>
    fetchApi<{ success: boolean; message: string }>(`/learner-progress/${id}/nudge`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  broadcastNudge: (payload: { courseId?: string; targetBand?: string; message: string; teacherName?: string }) =>
    fetchApi<{ success: boolean; dispatchedCount: number; message: string }>('/learner-progress/broadcast-nudge', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
