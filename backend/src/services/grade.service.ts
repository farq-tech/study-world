import { prisma } from '../lib/prisma';

export async function getGradesByStudent(studentId: string, subjectId?: string) {
  return prisma.grade.findMany({
    where: {
      studentId,
      ...(subjectId ? { subjectId } : {}),
    },
    include: { subject: true },
    orderBy: { gradedAt: 'desc' },
  });
}

export async function addGrade(data: {
  studentId: string;
  subjectId: string;
  title: string;
  category: string;
  score: number;
  maxScore?: number;
  weight?: number;
  notes?: string;
}) {
  return prisma.grade.create({
    data: {
      ...data,
      maxScore: data.maxScore || 100,
      weight: data.weight || 1,
    },
    include: { subject: true },
  });
}

export async function getGradeOverview(studentId: string) {
  const grades = await prisma.grade.findMany({
    where: { studentId },
    include: { subject: true },
  });

  // Group by subject
  const subjectMap = new Map<string, { subject: any; scores: number[]; weights: number[] }>();

  for (const grade of grades) {
    const key = grade.subjectId;
    if (!subjectMap.has(key)) {
      subjectMap.set(key, { subject: grade.subject, scores: [], weights: [] });
    }
    const entry = subjectMap.get(key)!;
    entry.scores.push((grade.score / grade.maxScore) * 100);
    entry.weights.push(grade.weight);
  }

  const subjectAverages = Array.from(subjectMap.entries()).map(([_, data]) => {
    const totalWeight = data.weights.reduce((a, b) => a + b, 0);
    const weightedSum = data.scores.reduce((sum, score, i) => sum + score * data.weights[i], 0);
    const average = totalWeight > 0 ? weightedSum / totalWeight : 0;

    return {
      subject: data.subject,
      average: Math.round(average * 10) / 10,
      gradeCount: data.scores.length,
    };
  });

  const overallAverage = subjectAverages.length > 0
    ? Math.round(
        (subjectAverages.reduce((sum, s) => sum + s.average, 0) / subjectAverages.length) * 10
      ) / 10
    : 0;

  const strongest = subjectAverages.length > 0
    ? subjectAverages.reduce((a, b) => (a.average > b.average ? a : b))
    : null;

  const weakest = subjectAverages.length > 0
    ? subjectAverages.reduce((a, b) => (a.average < b.average ? a : b))
    : null;

  return {
    overallAverage,
    subjectAverages,
    strongest,
    weakest,
    totalGrades: grades.length,
  };
}

export async function getGradeHistory(studentId: string, subjectId: string) {
  return prisma.grade.findMany({
    where: { studentId, subjectId },
    orderBy: { gradedAt: 'asc' },
  });
}

export async function getAllGrades(filters?: { studentId?: string; subjectId?: string }) {
  return prisma.grade.findMany({
    where: {
      ...(filters?.studentId ? { studentId: filters.studentId } : {}),
      ...(filters?.subjectId ? { subjectId: filters.subjectId } : {}),
    },
    include: {
      subject: true,
      student: { include: { user: { select: { nameAr: true } } } },
    },
    orderBy: { gradedAt: 'desc' },
  });
}
