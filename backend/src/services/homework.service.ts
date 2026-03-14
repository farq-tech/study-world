import { prisma } from '../lib/prisma';
import { HomeworkStatus } from '@prisma/client';

export async function getHomeworkByStudent(studentId: string, status?: HomeworkStatus) {
  return prisma.homework.findMany({
    where: {
      studentId,
      ...(status ? { status } : {}),
    },
    include: { subject: true, lesson: true },
    orderBy: { dueDate: 'asc' },
  });
}

export async function getHomeworkById(id: string) {
  return prisma.homework.findUnique({
    where: { id },
    include: { subject: true, lesson: true, student: { include: { user: true } } },
  });
}

export async function createHomework(data: {
  studentId: string;
  subjectId: string;
  lessonId?: string;
  title: string;
  description?: string;
  dueDate: Date;
}) {
  return prisma.homework.create({
    data,
    include: { subject: true },
  });
}

export async function updateHomework(id: string, data: Partial<{
  title: string;
  description: string;
  dueDate: Date;
  status: HomeworkStatus;
  grade: number;
  feedback: string;
  aiExplanation: string;
  aiGuidedSolution: string;
}>) {
  return prisma.homework.update({
    where: { id },
    data,
    include: { subject: true },
  });
}

export async function submitHomework(id: string, attachmentUrl?: string) {
  return prisma.homework.update({
    where: { id },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
      ...(attachmentUrl ? { attachmentUrl } : {}),
    },
  });
}

export async function gradeHomework(id: string, grade: number, feedback?: string) {
  return prisma.homework.update({
    where: { id },
    data: {
      status: 'GRADED',
      grade,
      feedback,
    },
  });
}

export async function getAllHomework(filters?: { subjectId?: string; status?: HomeworkStatus }) {
  return prisma.homework.findMany({
    where: {
      ...(filters?.subjectId ? { subjectId: filters.subjectId } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
    },
    include: {
      subject: true,
      student: { include: { user: { select: { nameAr: true } } } },
    },
    orderBy: { dueDate: 'asc' },
  });
}
