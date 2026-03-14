import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import * as studentService from '../services/student.service';

const router = Router();

// Get all students (admin/parent)
router.get('/', requireAuth, requireRole('ADMIN', 'PARENT'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const students = await studentService.getAllStudents();
    res.json({ success: true, data: students });
  } catch (error) { next(error); }
});

// Get student dashboard data
router.get('/:id/dashboard', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await studentService.getDashboardData(req.params.id as string);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

// Get student by ID
router.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await studentService.getStudentById(req.params.id as string);
    if (!student) {
      res.status(404).json({ success: false, error: 'الطالب غير موجود' });
      return;
    }
    res.json({ success: true, data: student });
  } catch (error) { next(error); }
});

// Add points to student
router.post('/:id/points', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { points } = req.body;
    const student = await studentService.addPoints(req.params.id as string, points);
    res.json({ success: true, data: student });
  } catch (error) { next(error); }
});

// Get students by parent
router.get('/parent/:parentId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const students = await studentService.getStudentsByParent(req.params.parentId as string);
    res.json({ success: true, data: students });
  } catch (error) { next(error); }
});

export default router;
