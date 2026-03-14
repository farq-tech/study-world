import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import * as badgeService from '../services/badge.service';

const router = Router();

router.get('/', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const badges = await badgeService.getAllBadges();
    res.json({ success: true, data: badges });
  } catch (error) { next(error); }
});

router.get('/student/:studentId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const badges = await badgeService.getStudentBadges(req.params.studentId as string);
    res.json({ success: true, data: badges });
  } catch (error) { next(error); }
});

export default router;
