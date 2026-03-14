import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import * as notificationService from '../services/notification.service';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const unreadOnly = req.query.unread === 'true';
    const notifications = await notificationService.getNotifications(req.user!.userId, unreadOnly);
    res.json({ success: true, data: notifications });
  } catch (error) { next(error); }
});

router.get('/unread-count', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.userId);
    res.json({ success: true, data: { count } });
  } catch (error) { next(error); }
});

router.put('/:id/read', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAsRead(req.params.id as string);
    res.json({ success: true, message: 'تم القراءة' });
  } catch (error) { next(error); }
});

router.put('/read-all', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAllAsRead(req.user!.userId);
    res.json({ success: true, message: 'تم قراءة الكل' });
  } catch (error) { next(error); }
});

export default router;
