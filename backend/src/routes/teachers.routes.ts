import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { isActive: true },
      include: { subjects: { include: { subject: true } } },
      orderBy: { nameAr: 'asc' },
    });
    res.json({ success: true, data: teachers });
  } catch (error) { next(error); }
});

router.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.params.id as string },
      include: { subjects: { include: { subject: true } }, schedules: { include: { subject: true } } },
    });
    res.json({ success: true, data: teacher });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, requireRole('ADMIN', 'PARENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subjectIds, ...teacherData } = req.body;
    const teacher = await prisma.teacher.create({
      data: {
        ...teacherData,
        ...(subjectIds ? {
          subjects: {
            create: subjectIds.map((subjectId: string) => ({ subjectId })),
          },
        } : {}),
      },
      include: { subjects: { include: { subject: true } } },
    });
    res.status(201).json({ success: true, data: teacher });
  } catch (error) { next(error); }
});

router.put('/:id', requireAuth, requireRole('ADMIN', 'PARENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teacher = await prisma.teacher.update({ where: { id: req.params.id as string }, data: req.body });
    res.json({ success: true, data: teacher });
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.teacher.update({ where: { id: req.params.id as string }, data: { isActive: false } });
    res.json({ success: true, message: 'تم حذف المعلم' });
  } catch (error) { next(error); }
});

export default router;
