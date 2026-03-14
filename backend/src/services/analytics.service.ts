import { prisma } from '../lib/prisma';

export async function getOverallStats() {
  const [studentCount, subjectCount, homeworkCount, quizCount] = await Promise.all([
    prisma.student.count(),
    prisma.subject.count({ where: { isActive: true } }),
    prisma.homework.count(),
    prisma.quiz.count({ where: { isActive: true } }),
  ]);

  return { studentCount, subjectCount, homeworkCount, quizCount };
}

export async function getGradeDistribution() {
  const grades = await prisma.grade.findMany({
    include: { subject: true },
  });

  const distribution = new Map<string, { subject: string; scores: number[] }>();

  for (const grade of grades) {
    const key = grade.subjectId;
    if (!distribution.has(key)) {
      distribution.set(key, { subject: grade.subject.nameAr, scores: [] });
    }
    distribution.get(key)!.scores.push((grade.score / grade.maxScore) * 100);
  }

  return Array.from(distribution.values()).map((d) => ({
    subject: d.subject,
    average: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
    count: d.scores.length,
  }));
}

export async function getHomeworkCompletionRate() {
  const total = await prisma.homework.count();
  const completed = await prisma.homework.count({
    where: { status: { in: ['SUBMITTED', 'GRADED'] } },
  });

  return {
    total,
    completed,
    rate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export async function getQuizPerformance() {
  const attempts = await prisma.quizAttempt.findMany({
    include: { quiz: { include: { subject: true } } },
  });

  const subjectPerformance = new Map<string, { subject: string; scores: number[] }>();

  for (const attempt of attempts) {
    const key = attempt.quiz.subjectId;
    if (!subjectPerformance.has(key)) {
      subjectPerformance.set(key, { subject: attempt.quiz.subject.nameAr, scores: [] });
    }
    subjectPerformance.get(key)!.scores.push(attempt.score);
  }

  return Array.from(subjectPerformance.values()).map((p) => ({
    subject: p.subject,
    averageScore: Math.round(p.scores.reduce((a, b) => a + b, 0) / p.scores.length),
    attemptCount: p.scores.length,
  }));
}

export async function getStudentPerformanceSummary(studentId: string) {
  const [grades, quizAttempts, homeworks, weaknesses] = await Promise.all([
    prisma.grade.findMany({
      where: { studentId },
      include: { subject: true },
      orderBy: { gradedAt: 'desc' },
    }),
    prisma.quizAttempt.findMany({
      where: { studentId },
      include: { quiz: { include: { subject: true } } },
      orderBy: { completedAt: 'desc' },
    }),
    prisma.homework.findMany({
      where: { studentId },
      include: { subject: true },
    }),
    prisma.weaknessArea.findMany({
      where: { studentId, isResolved: false },
      include: { subject: true },
    }),
  ]);

  return { grades, quizAttempts, homeworks, weaknesses };
}
