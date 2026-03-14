import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import * as scheduleService from '../services/schedule.service';

const router = Router();

router.get('/student/:studentId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schedule = await scheduleService.getScheduleByStudent(req.params.studentId as string, req.query.day as any);
    res.json({ success: true, data: schedule });
  } catch (error) { next(error); }
});

router.get('/student/:studentId/today', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const classes = await scheduleService.getTodayClasses(req.params.studentId as string);
    res.json({ success: true, data: classes });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, requireRole('ADMIN', 'PARENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await scheduleService.createScheduleEntry(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error) { next(error); }
});

router.put('/:id', requireAuth, requireRole('ADMIN', 'PARENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await scheduleService.updateScheduleEntry(req.params.id as string, req.body);
    res.json({ success: true, data: entry });
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, requireRole('ADMIN', 'PARENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await scheduleService.deleteScheduleEntry(req.params.id as string);
    res.json({ success: true, message: 'تم حذف الحصة' });
  } catch (error) { next(error); }
});

export default router;
