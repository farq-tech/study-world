import { z } from 'zod';

export const createHomeworkSchema = z.object({
  studentId: z.string().uuid(),
  subjectId: z.string().uuid(),
  lessonId: z.string().uuid().optional(),
  title: z.string().min(1, 'عنوان الواجب مطلوب'),
  description: z.string().optional(),
  dueDate: z.string().transform((d) => new Date(d)),
});

export const updateHomeworkSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().transform((d) => new Date(d)).optional(),
  status: z.enum(['PENDING', 'SUBMITTED', 'GRADED']).optional(),
  grade: z.number().min(0).max(100).optional(),
  feedback: z.string().optional(),
});

export const submitHomeworkSchema = z.object({
  attachmentUrl: z.string().optional(),
});

export type CreateHomeworkInput = z.infer<typeof createHomeworkSchema>;
export type UpdateHomeworkInput = z.infer<typeof updateHomeworkSchema>;
