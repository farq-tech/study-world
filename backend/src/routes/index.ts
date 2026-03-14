import { Router } from 'express';
import authRoutes from './auth.routes';
import studentsRoutes from './students.routes';
import subjectsRoutes from './subjects.routes';
import teachersRoutes from './teachers.routes';
import schedulesRoutes from './schedules.routes';
import lessonsRoutes from './lessons.routes';
import homeworkRoutes from './homework.routes';
import quizzesRoutes from './quizzes.routes';
import gradesRoutes from './grades.routes';
import badgesRoutes from './badges.routes';
import holidaysRoutes from './holidays.routes';
import notificationsRoutes from './notifications.routes';
import aiRoutes from './ai.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentsRoutes);
router.use('/subjects', subjectsRoutes);
router.use('/teachers', teachersRoutes);
router.use('/schedules', schedulesRoutes);
router.use('/lessons', lessonsRoutes);
router.use('/homework', homeworkRoutes);
router.use('/quizzes', quizzesRoutes);
router.use('/grades', gradesRoutes);
router.use('/badges', badgesRoutes);
router.use('/holidays', holidaysRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/ai', aiRoutes);
router.use('/analytics', analyticsRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'عالم الدراسة API يعمل بنجاح ✅' });
});

export default router;
