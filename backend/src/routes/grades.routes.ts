import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import * as gradeService from '../services/grade.service';

const router = Router();

router.get('/student/:studentId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const grades = await gradeService.getGradesByStudent(
      req.params.studentId as string,
      req.query.subjectId as string
    );
    res.json({ success: true, data: grades });
  } catch (error) { next(error); }
});

router.get('/student/:studentId/overview', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const overview = await gradeService.getGradeOverview(req.params.studentId as string);
    res.json({ success: true, data: overview });
  } catch (error) { next(error); }
});

router.get('/student/:studentId/history/:subjectId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await gradeService.getGradeHistory(req.params.studentId as string, req.params.subjectId as string);
    res.json({ success: true, data: history });
  } catch (error) { next(error); }
});

router.get('/all', requireAuth, requireRole('ADMIN', 'PARENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const grades = await gradeService.getAllGrades({
      studentId: req.query.studentId as string,
      subjectId: req.query.subjectId as string,
    });
    res.json({ success: true, data: grades });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, requireRole('ADMIN', 'PARENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const grade = await gradeService.addGrade(req.body);
    res.status(201).json({ success: true, data: grade });
  } catch (error) { next(error); }
});

export default router;
