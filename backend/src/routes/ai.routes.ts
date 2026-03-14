import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimit';
import * as aiService from '../services/ai.service';

const router = Router();

router.post('/explain-homework', requireAuth, aiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, subjectName, description } = req.body;
    const explanation = await aiService.explainHomework(title, subjectName, description);
    res.json({ success: true, data: { explanation } });
  } catch (error) { next(error); }
});

router.post('/lesson-summary', requireAuth, aiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lessonTitle, subjectName, content } = req.body;
    const summary = await aiService.generateLessonSummary(lessonTitle, subjectName, content);
    res.json({ success: true, data: { summary } });
  } catch (error) { next(error); }
});

router.post('/tutoring-help', requireAuth, aiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, subject, context } = req.body;
    const response = await aiService.provideTutoringHelp(question, subject, context);
    res.json({ success: true, data: { response } });
  } catch (error) { next(error); }
});

router.post('/generate-quiz', requireAuth, aiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subjectName, topic, count, difficulty } = req.body;
    const questions = await aiService.generateQuizQuestions(subjectName, topic, count, difficulty);
    res.json({ success: true, data: { questions } });
  } catch (error) { next(error); }
});

router.post('/generate-drill', requireAuth, aiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topic, count } = req.body;
    const drill = await aiService.generateMathDrill(topic, count);
    res.json({ success: true, data: { drill } });
  } catch (error) { next(error); }
});

router.post('/chat', requireAuth, aiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, subject, context } = req.body;
    const response = await aiService.provideTutoringHelp(message, subject || 'عام', context);
    res.json({ success: true, data: { response } });
  } catch (error) { next(error); }
});

export default router;
