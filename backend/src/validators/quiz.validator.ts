import { z } from 'zod';

export const createQuizSchema = z.object({
  subjectId: z.string().uuid(),
  title: z.string().min(1, 'عنوان الاختبار مطلوب'),
  description: z.string().optional(),
  type: z.enum(['DAILY', 'WEEKLY', 'MATH_FOCUS', 'CHAPTER']).default('DAILY'),
  questions: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      type: z.enum(['mcq', 'true_false', 'short_answer']),
      options: z.array(z.string()).optional(),
      correctAnswer: z.union([z.number(), z.string()]),
      explanation: z.string().optional(),
      topic: z.string().optional(),
    })
  ),
  totalMarks: z.number().int().positive(),
  timeLimit: z.number().int().positive().optional(),
  weekNumber: z.number().int().optional(),
});

export const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.union([z.number(), z.string()]),
    })
  ),
  timeTaken: z.number().int().optional(),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
