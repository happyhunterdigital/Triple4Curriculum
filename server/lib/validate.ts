import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().max(254),
  role: z.enum(['student', 'lecturer', 'admin']).optional(),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(254),
  // Clients may request student/learner self-registration only.
  // Lecturer/admin must be provisioned server-side (custom claims).
  role: z.enum(['student', 'learner']).optional().default('student'),
  departmentId: z.string().max(64).optional(),
  // POPIA consent is mandatory at registration.
  agreePrivacy: z.literal(true, {
    message: 'POPIA privacy consent is required (agreePrivacy: true). See /privacy.',
  }),
  agreeConduct: z.boolean().optional(),
});

export const lectureCreateSchema = z.object({
  courseId: z.string().max(64).optional(),
  title: z.string().trim().min(3).max(200).optional(),
  moduleName: z.string().max(200).optional(),
  summary: z.string().max(5000).optional(),
  readingNotes: z.string().max(10000).optional(),
  videoUrl: z.string().url().max(2048).optional(),
});

export const lectureCompleteSchema = z.object({
  quizPassed: z.boolean().optional().default(false),
});

export const timetableCreateSchema = z.object({
  courseId: z.string().max(64).optional(),
  lecturerId: z.string().max(64).optional(),
  dayOfWeek: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  room: z.string().max(120).optional(),
  type: z.string().max(64).optional(),
});

export const submitAssignmentSchema = z.object({
  fileName: z.string().trim().min(1).max(255).optional(),
  contentNotes: z.string().max(10000).optional(),
});

export const gradeSubmissionSchema = z.object({
  grade: z.number().min(0).max(1000),
  feedback: z.string().max(10000).optional().default(''),
  rubricScores: z.record(z.string(), z.number().min(0).max(100)).optional(),
  graderName: z.string().max(120).optional(),
});

export const notificationCreateSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  message: z.string().trim().min(1).max(2000).optional(),
  category: z.string().max(64).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  recipientRole: z.string().max(32).optional(),
});

export const announcementCreateSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  content: z.string().trim().min(1).max(10000).optional(),
  targetAudience: z.string().max(64).optional(),
  priority: z.string().max(32).optional(),
});

export const messageCreateSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  channelId: z.string().max(120).optional(),
});

export const notesUpdateSchema = z.object({
  notes: z.string().trim().min(1).max(5000),
  teacherName: z.string().max(120).optional(),
});

export const nudgeSchema = z.object({
  message: z.string().trim().min(1).max(2000).optional(),
  priority: z.string().max(32).optional(),
  type: z.enum(['warning', 'praise', 'info']).optional(),
  teacherName: z.string().max(120).optional(),
});

export const broadcastNudgeSchema = z.object({
  courseId: z.string().max(64).optional(),
  targetBand: z.string().max(64).optional(),
  message: z.string().trim().min(1).max(2000).optional(),
  teacherName: z.string().max(120).optional(),
});

export const departmentCreateSchema = z.object({
  name: z.string().trim().min(3).max(200).optional(),
  code: z.string().max(32).optional(),
  description: z.string().max(5000).optional(),
  headOfDepartment: z.string().max(120).optional(),
  color: z.string().max(32).optional(),
});

export const aiQuizSchema = z.object({
  topic: z.string().trim().min(3).max(300).optional(),
  difficulty: z.string().max(64).optional(),
});

export const attendanceCheckinSchema = z.object({
  courseId: z.string().max(64).optional(),
  method: z.string().max(64).optional(),
});

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    req.body = parsed.data;
    next();
  };
}
