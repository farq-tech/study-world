import { prisma } from '../lib/prisma';

export async function getAllStudents() {
  return prisma.student.findMany({
    include: {
      user: { select: { id: true, username: true, nameAr: true, avatarUrl: true, isActive: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getStudentById(studentId: string) {
  return prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { id: true, username: true, nameAr: true, nameEn: true, email: true, avatarUrl: true } },
      studentSubjects: { include: { subject: true } },
      studentBadges: { include: { badge: true }, orderBy: { earnedAt: 'desc' } },
    },
  });
}

export async function getStudentByUserId(userId: string) {
  return prisma.student.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, username: true, nameAr: true, avatarUrl: true } },
    },
  });
}

export async function getDashboardData(studentId: string) {
  const today = new Date();
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const todayDay = dayNames[today.getDay()];

  const [student, todayClasses, pendingHomework, recentGrades, recentBadges, unreadNotifications, weaknesses] =
    await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: { select: { nameAr: true, avatarUrl: true } },
        },
      }),
      prisma.schedule.findMany({
        where: {
          studentId,
          dayOfWeek: todayDay as any,
          isActive: true,
        },
        include: {
          subject: true,
          teacher: true,
        },
        orderBy: { periodNumber: 'asc' },
      }),
      prisma.homework.findMany({
        where: {
          studentId,
          status: 'PENDING',
          dueDate: { gte: today },
        },
        include: { subject: true },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
      prisma.grade.findMany({
        where: { studentId },
        include: { subject: true },
        orderBy: { gradedAt: 'desc' },
        take: 5,
      }),
      prisma.studentBadge.findMany({
        where: { studentId },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
        take: 5,
      }),
      prisma.notification.count({
        where: {
          userId: (await prisma.student.findUnique({ where: { id: studentId } }))?.userId || '',
          isRead: false,
        },
      }),
      prisma.weaknessArea.findMany({
        where: { studentId, isResolved: false },
        include: { subject: true },
        take: 3,
      }),
    ]);

  return {
    student,
    todayClasses,
    pendingHomework,
    recentGrades,
    recentBadges: recentBadges.map((sb) => ({ ...sb.badge, earnedAt: sb.earnedAt })),
    unreadNotifications,
    weaknesses,
  };
}

export async function addPoints(studentId: string, points: number) {
  const student = await prisma.student.update({
    where: { id: studentId },
    data: {
      points: { increment: points },
      lastActivityAt: new Date(),
    },
  });

  // Level up: every 100 points = 1 level
  const newLevel = Math.floor(student.points / 100) + 1;
  if (newLevel > student.level) {
    await prisma.student.update({
      where: { id: studentId },
      data: { level: newLevel },
    });
  }

  return student;
}

export async function updateStreak(studentId: string) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return;

  const now = new Date();
  const lastActivity = student.lastActivityAt;

  if (!lastActivity) {
    await prisma.student.update({
      where: { id: studentId },
      data: { currentStreak: 1, lastActivityAt: now },
    });
    return;
  }

  const diffHours = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

  if (diffHours < 24) return; // Already counted today

  if (diffHours < 48) {
    // Consecutive day
    const newStreak = student.currentStreak + 1;
    await prisma.student.update({
      where: { id: studentId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, student.longestStreak),
        lastActivityAt: now,
      },
    });
  } else {
    // Streak broken
    await prisma.student.update({
      where: { id: studentId },
      data: { currentStreak: 1, lastActivityAt: now },
    });
  }
}

export async function getStudentsByParent(parentId: string) {
  return prisma.student.findMany({
    where: { parentId },
    include: {
      user: { select: { id: true, username: true, nameAr: true, avatarUrl: true } },
    },
  });
}
