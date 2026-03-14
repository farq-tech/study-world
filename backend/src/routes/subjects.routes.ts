import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: subjects });
  } catch (error) { next(error); }
});

router.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: req.params.id as string },
      include: { teachers: { include: { teacher: true } } },
    });
    res.json({ success: true, data: subject });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, requireRole('ADMIN', 'PARENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subject = await prisma.subject.create({ data: req.body });
    res.status(201).json({ success: true, data: subject });
  } catch (error) { next(error); }
});

router.put('/:id', requireAuth, requireRole('ADMIN', 'PARENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subject = await prisma.subject.update({ where: { id: req.params.id as string }, data: req.body });
    res.json({ success: true, data: subject });
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.subject.update({ where: { id: req.params.id as string }, data: { isActive: false } });
    res.json({ success: true, message: 'تم حذف المادة' });
  } catch (error) { next(error); }
});

export default router;
