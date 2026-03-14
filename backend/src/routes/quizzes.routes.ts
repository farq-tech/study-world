import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createQuizSchema, submitQuizSchema } from '../validators/quiz.validator';
import * as quizService from '../services/quiz.service';
import { updateStreak } from '../services/student.service';
import { checkAndAwardBadges } from '../services/badge.service';
import { detectWeaknesses } from '../services/weakness.service';
import { QuizQuestion } from '../types';

const router = Router();

router.get('/subject/:subjectId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quizzes = await quizService.getQuizzesBySubject(req.params.subjectId as string);
    res.json({ success: true, data: quizzes });
  } catch (error) { next(error); }
});

router.get('/available/:studentId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quizzes = await quizService.getAvailableQuizzes(req.params.studentId as string);
    res.json({ success: true, data: quizzes });
  } catch (error) { next(error); }
});

router.get('/history/:studentId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await quizService.getStudentQuizHistory(req.params.studentId as string);
    res.json({ success: true, data: history });
  } catch (error) { next(error); }
});

router.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quiz = await quizService.getQuizById(req.params.id as string);
    if (!quiz) {
      res.status(404).json({ success: false, error: 'الاختبار غير موجود' });
      return;
    }
    res.json({ success: true, data: quiz });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, requireRole('ADMIN', 'PARENT'), validate(createQuizSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quiz = await quizService.createQuiz(req.body);
    res.status(201).json({ success: true, data: quiz });
  } catch (error) { next(error); }
});

router.post('/:id/attempt', requireAuth, validate(submitQuizSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await quizService.submitQuizAttempt(
      req.params.id as string,
      req.body.studentId || req.user!.userId,
      req.body.answers,
      req.body.timeTaken
    );

    // Update streak and check badges
    const studentId = req.body.studentId || req.user!.userId;
    await updateStreak(studentId);
    await checkAndAwardBadges(studentId);

    // Detect weaknesses from quiz results
    const quiz = await quizService.getQuizById(req.params.id as string);
    if (quiz) {
      await detectWeaknesses(
        studentId,
        quiz.subjectId,
        quiz.questions as unknown as QuizQuestion[],
        req.body.answers
      );
    }

    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/attempt/:attemptId/results', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await quizService.getQuizResults(req.params.attemptId as string);
    res.json({ success: true, data: results });
  } catch (error) { next(error); }
});

export default router;
