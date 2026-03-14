import { prisma } from '../lib/prisma';

export async function getAllBadges() {
  return prisma.badge.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function getStudentBadges(studentId: string) {
  return prisma.studentBadge.findMany({
    where: { studentId },
    include: { badge: true },
    orderBy: { earnedAt: 'desc' },
  });
}

export async function awardBadge(studentId: string, badgeId: string) {
  const existing = await prisma.studentBadge.findUnique({
    where: { studentId_badgeId: { studentId, badgeId } },
  });

  if (existing) return null; // Already earned

  const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
  if (!badge) return null;

  const awarded = await prisma.studentBadge.create({
    data: { studentId, badgeId },
    include: { badge: true },
  });

  // Award badge points
  if (badge.pointsValue > 0) {
    await prisma.student.update({
      where: { id: studentId },
      data: { points: { increment: badge.pointsValue } },
    });
  }

  // Create notification
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (student) {
    await prisma.notification.create({
      data: {
        userId: student.userId,
        title: 'وسام جديد! 🏅',
        message: `تهانينا! حصلت على وسام "${badge.nameAr}"`,
        type: 'BADGE',
        data: { badgeId: badge.id, badgeName: badge.nameAr, badgeIcon: badge.icon },
      },
    });
  }

  return awarded;
}

export async function checkAndAwardBadges(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      studentBadges: true,
      quizAttempts: true,
      homeworks: true,
    },
  });

  if (!student) return [];

  const badges = await prisma.badge.findMany();
  const earnedBadgeIds = new Set(student.studentBadges.map((sb) => sb.badgeId));
  const awarded: string[] = [];

  for (const badge of badges) {
    if (earnedBadgeIds.has(badge.id)) continue;

    const req = badge.requirement as any;
    if (!req) continue;

    let shouldAward = false;

    switch (req.type) {
      case 'streak':
        shouldAward = student.currentStreak >= (req.count || 0);
        break;
      case 'quiz_count':
        shouldAward = student.quizAttempts.length >= (req.count || 0);
        break;
      case 'quiz_perfect':
        shouldAward = student.quizAttempts.some((a) => a.score === 100);
        break;
      case 'homework_count':
        shouldAward = student.homeworks.filter((h) => h.status !== 'PENDING').length >= (req.count || 0);
        break;
      case 'points':
        shouldAward = student.points >= (req.count || 0);
        break;
    }

    if (shouldAward) {
      await awardBadge(studentId, badge.id);
      awarded.push(badge.id);
    }
  }

  return awarded;
}
