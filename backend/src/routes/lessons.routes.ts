import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/subject/:subjectId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { subjectId: req.params.subjectId as string, isActive: true },
      include: { subject: true },
      orderBy: { lessonOrder: 'asc' },
    });
    res.json({ success: true, data: lessons });
  } catch (error) { next(error); }
});

router.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id as string },
      include: { subject: true },
    });
    res.json({ success: true, data: lesson });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, requireRole('ADMIN', 'PARENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lesson = await prisma.lesson.create({
      data: req.body,
      include: { subject: true },
    });
    res.status(201).json({ success: true, data: lesson });
  } catch (error) { next(error); }
});

router.put('/:id', requireAuth, requireRole('ADMIN', 'PARENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lesson = await prisma.lesson.update({
      where: { id: req.params.id as string },
      data: req.body,
      include: { subject: true },
    });
    res.json({ success: true, data: lesson });
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.lesson.update({ where: { id: req.params.id as string }, data: { isActive: false } });
    res.json({ success: true, message: 'تم حذف الدرس' });
  } catch (error) { next(error); }
});

export default router;
