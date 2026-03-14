import cron from 'node-cron';
import { logger } from '../lib/logger';
import { runNotificationJob } from './notificationJob';
import { runStreakJob } from './streakJob';

export function startScheduler() {
  logger.info('📅 Starting scheduled jobs...');

  // Daily at 6:00 PM Saudi time (UTC+3 = 15:00 UTC) - Reminders
  cron.schedule('0 15 * * *', async () => {
    logger.info('Running notification job...');
    try {
      await runNotificationJob();
      logger.info('Notification job completed');
    } catch (error) {
      logger.error('Notification job failed', { error });
    }
  });

  // Daily at midnight Saudi time (21:00 UTC) - Streak check
  cron.schedule('0 21 * * *', async () => {
    logger.info('Running streak job...');
    try {
      await runStreakJob();
      logger.info('Streak job completed');
    } catch (error) {
      logger.error('Streak job failed', { error });
    }
  });

  logger.info('✅ Scheduled jobs started');
}
