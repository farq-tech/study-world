import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.string().optional().transform((v) => parseInt(v || '1', 10)),
  limit: z.string().optional().transform((v) => parseInt(v || '20', 10)),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('معرف غير صالح'),
});

export const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
