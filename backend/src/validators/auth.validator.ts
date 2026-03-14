import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  nameAr: z.string().min(2, 'الاسم بالعربي مطلوب'),
  nameEn: z.string().optional(),
  email: z.string().email('بريد إلكتروني غير صالح').optional(),
  role: z.enum(['STUDENT', 'PARENT', 'ADMIN']).default('STUDENT'),
  gradeLevel: z.string().optional(),
  className: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
