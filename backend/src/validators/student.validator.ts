import { z } from 'zod';

export const updateStudentSchema = z.object({
  gradeLevel: z.string().optional(),
  className: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const addPointsSchema = z.object({
  points: z.number().int().positive('النقاط يجب أن تكون رقم موجب'),
  reason: z.string().optional(),
});

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type AddPointsInput = z.infer<typeof addPointsSchema>;
