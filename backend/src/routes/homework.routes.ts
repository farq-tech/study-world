import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createHomeworkSchema } from '../validators/homework.validator';
import * as homeworkService from '../services/homework.service';
import { addPoints, updateStreak } from '../services/student.service';
import { checkAndAwardBadges } from '../services/badge.service';

const router = Router();

router.get('/student/:studentId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const homework = await homeworkService.getHomeworkByStudent(
      req.params.studentId as string,
      req.query.status as any
    );
    res.json({ success: true, data: homework });
  } catch (error) { next(error); }
});

router.get('/all', requireAuth, requireRole('ADMIN', 'PARENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const homework = await homeworkService.getAllHomework({
      subjectId: req.query.subjectId as string,
      status: req.query.status as any,
    });
    res.json({ success: true, data: homework });
  } catch (error) { next(error); }
});

router.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const homework = await homeworkService.getHomeworkById(req.params.id as string);
    if (!homework) {
      res.status(404).json({ success: false, error: 'الواجب غير موجود' });
      return;
    }
    res.json({ success: true, data: homework });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, requireRole('ADMIN', 'PARENT'), validate(createHomeworkSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const homework = await homeworkService.createHomework(req.body);
    res.status(201).json({ success: true, data: homework });
  } catch (error) { next(error); }
});

router.put('/:id', requireAuth, requireRole('ADMIN', 'PARENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const homework = await homeworkService.updateHomework(req.params.id as string, req.body);
    res.json({ success: true, data: homework });
  } catch (error) { next(error); }
});

router.put('/:id/submit', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const homework = await homeworkService.submitHomework(req.params.id as string, req.body.attachmentUrl);

    // Award points for submission
    await addPoints(homework.studentId, 5);
    await updateStreak(homework.studentId);
    await checkAndAwardBadges(homework.studentId);

    res.json({ success: true, data: homework });
  } catch (error) { next(error); }
});

router.put('/:id/grade', requireAuth, requireRole('ADMIN', 'PARENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { grade, feedback } = req.body;
    const homework = await homeworkService.gradeHomework(req.params.id as string, grade, feedback);
    res.json({ success: true, data: homework });
  } catch (error) { next(error); }
});

export default router;
