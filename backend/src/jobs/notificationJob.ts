import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

export async function runNotificationJob() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][tomorrow.getDay()];

  // 1. Class reminders for tomorrow
  const tomorrowClasses = await prisma.schedule.findMany({
    where: {
      dayOfWeek: tomorrowDay as any,
      isActive: true,
    },
    include: {
      student: true,
      subject: true,
    },
  });

  for (const schedule of tomorrowClasses) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: schedule.student.userId,
        type: 'REMINDER',
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        data: { path: ['scheduleId'], equals: schedule.id },
      },
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId: schedule.student.userId,
          title: `تذكير: ${schedule.subject.nameAr} غداً`,
          message: `لديك حصة ${schedule.subject.nameAr} غداً الساعة ${schedule.startTime}`,
          type: 'REMINDER',
          data: { scheduleId: schedule.id },
        },
      });
    }
  }

  // 2. Homework due reminders
  const dueSoon = await prisma.homework.findMany({
    where: {
      status: 'PENDING',
      dueDate: {
        gte: new Date(),
        lte: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    },
    include: {
      student: true,
      subject: true,
    },
  });

  for (const homework of dueSoon) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: homework.student.userId,
        type: 'HOMEWORK',
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        data: { path: ['homeworkId'], equals: homework.id },
      },
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId: homework.student.userId,
          title: `تذكير: واجب ${homework.subject.nameAr}`,
          message: `لديك واجب "${homework.title}" يجب تسليمه قريباً`,
          type: 'HOMEWORK',
          data: { homeworkId: homework.id },
        },
      });
    }
  }

  // 3. Holiday reminders
  const upcomingHoliday = await prisma.holiday.findFirst({
    where: {
      isActive: true,
      startDate: {
        gte: new Date(),
        lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    },
  });

  if (upcomingHoliday) {
    const students = await prisma.student.findMany();
    for (const student of students) {
      await prisma.notification.create({
        data: {
          userId: student.userId,
          title: `🎉 إجازة غداً: ${upcomingHoliday.nameAr}`,
          message: `غداً إجازة بمناسبة ${upcomingHoliday.nameAr}. استمتع بوقتك!`,
          type: 'SYSTEM',
        },
      });
    }
  }

  logger.info(`Created reminders: ${tomorrowClasses.length} classes, ${dueSoon.length} homework`);
}
