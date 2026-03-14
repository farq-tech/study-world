import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import * as analyticsService from '../services/analytics.service';

const router = Router();

router.get('/overview', requireAuth, requireRole('ADMIN', 'PARENT'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await analyticsService.getOverallStats();
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
});

router.get('/grades/distribution', requireAuth, requireRole('ADMIN', 'PARENT'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const distribution = await analyticsService.getGradeDistribution();
    res.json({ success: true, data: distribution });
  } catch (error) { next(error); }
});

router.get('/homework/completion', requireAuth, requireRole('ADMIN', 'PARENT'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rate = await analyticsService.getHomeworkCompletionRate();
    res.json({ success: true, data: rate });
  } catch (error) { next(error); }
});

router.get('/quiz/performance', requireAuth, requireRole('ADMIN', 'PARENT'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const performance = await analyticsService.getQuizPerformance();
    res.json({ success: true, data: performance });
  } catch (error) { next(error); }
});

router.get('/student/:studentId/summary', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await analyticsService.getStudentPerformanceSummary(req.params.studentId as string);
    res.json({ success: true, data: summary });
  } catch (error) { next(error); }
});

export default router;
