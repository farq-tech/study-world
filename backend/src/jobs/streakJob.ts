import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { checkAndAwardBadges } from '../services/badge.service';

export async function runStreakJob() {
  const students = await prisma.student.findMany();
  const now = new Date();

  let resetCount = 0;

  for (const student of students) {
    if (!student.lastActivityAt) continue;

    const hoursSinceActivity = (now.getTime() - student.lastActivityAt.getTime()) / (1000 * 60 * 60);

    // If no activity in 48 hours, reset streak
    if (hoursSinceActivity >= 48 && student.currentStreak > 0) {
      await prisma.student.update({
        where: { id: student.id },
        data: { currentStreak: 0 },
      });
      resetCount++;

      // Notify about broken streak
      await prisma.notification.create({
        data: {
          userId: student.userId,
          title: 'سلسلة المتابعة انتهت 😔',
          message: 'حاول تسجيل الدخول والدراسة يومياً للحفاظ على سلسلتك!',
          type: 'SYSTEM',
        },
      });
    }

    // Check for streak badges
    await checkAndAwardBadges(student.id);
  }

  logger.info(`Streak job: Reset ${resetCount} streaks out of ${students.length} students`);
}
