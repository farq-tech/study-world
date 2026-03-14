import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const holidays = await prisma.holiday.findMany({
      where: { isActive: true },
      orderBy: { startDate: 'asc' },
    });
    res.json({ success: true, data: holidays });
  } catch (error) { next(error); }
});

router.get('/upcoming', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const holidays = await prisma.holiday.findMany({
      where: {
        isActive: true,
        endDate: { gte: new Date() },
      },
      orderBy: { startDate: 'asc' },
      take: 5,
    });
    res.json({ success: true, data: holidays });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, requireRole('ADMIN', 'PARENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const holiday = await prisma.holiday.create({ data: req.body });
    res.status(201).json({ success: true, data: holiday });
  } catch (error) { next(error); }
});

router.put('/:id', requireAuth, requireRole('ADMIN', 'PARENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const holiday = await prisma.holiday.update({ where: { id: req.params.id as string }, data: req.body });
    res.json({ success: true, data: holiday });
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.holiday.update({ where: { id: req.params.id as string }, data: { isActive: false } });
    res.json({ success: true, message: 'تم حذف الإجازة' });
  } catch (error) { next(error); }
});

export default router;
