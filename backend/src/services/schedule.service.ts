import { prisma } from '../lib/prisma';
import { DayOfWeek } from '@prisma/client';

export async function getScheduleByStudent(studentId: string, dayOfWeek?: DayOfWeek) {
  return prisma.schedule.findMany({
    where: {
      studentId,
      isActive: true,
      ...(dayOfWeek ? { dayOfWeek } : {}),
    },
    include: {
      subject: true,
      teacher: true,
    },
    orderBy: [{ dayOfWeek: 'asc' }, { periodNumber: 'asc' }],
  });
}

export async function getTodayClasses(studentId: string) {
  const dayNames: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];
  const today = new Date().getDay();
  const todayDay = dayNames[today] || null;

  if (!todayDay) return []; // Friday/Saturday = weekend

  return prisma.schedule.findMany({
    where: { studentId, dayOfWeek: todayDay, isActive: true },
    include: { subject: true, teacher: true },
    orderBy: { periodNumber: 'asc' },
  });
}

export async function createScheduleEntry(data: {
  studentId: string;
  subjectId: string;
  teacherId?: string;
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  startTime: string;
  endTime: string;
  room?: string;
}) {
  return prisma.schedule.create({
    data,
    include: { subject: true, teacher: true },
  });
}

export async function updateScheduleEntry(id: string, data: Partial<{
  subjectId: string;
  teacherId: string;
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  startTime: string;
  endTime: string;
  room: string;
  isActive: boolean;
}>) {
  return prisma.schedule.update({
    where: { id },
    data,
    include: { subject: true, teacher: true },
  });
}

export async function deleteScheduleEntry(id: string) {
  return prisma.schedule.delete({ where: { id } });
}
