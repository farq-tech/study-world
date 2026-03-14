import { prisma } from '../lib/prisma';
import { QuizQuestion } from '../types';

export async function getWeaknessesByStudent(studentId: string) {
  return prisma.weaknessArea.findMany({
    where: { studentId, isResolved: false },
    include: { subject: true },
    orderBy: { severity: 'desc' },
  });
}

export async function detectWeaknesses(
  studentId: string,
  subjectId: string,
  questions: QuizQuestion[],
  answers: { questionId: string; answer: number | string }[]
) {
  // Group wrong answers by topic
  const topicErrors = new Map<string, number>();
  const topicTotal = new Map<string, number>();

  for (const question of questions) {
    const topic = question.topic || 'عام';
    topicTotal.set(topic, (topicTotal.get(topic) || 0) + 1);

    const studentAnswer = answers.find((a) => a.questionId === question.id);
    if (!studentAnswer || String(studentAnswer.answer) !== String(question.correctAnswer)) {
      topicErrors.set(topic, (topicErrors.get(topic) || 0) + 1);
    }
  }

  // Create weakness areas for topics with > 50% errors
  for (const [topic, errors] of topicErrors) {
    const total = topicTotal.get(topic) || 1;
    const errorRate = errors / total;

    if (errorRate >= 0.5) {
      const severity = errorRate >= 0.8 ? 5 : errorRate >= 0.6 ? 3 : 2;

      const existing = await prisma.weaknessArea.findFirst({
        where: { studentId, subjectId, topic, isResolved: false },
      });

      if (existing) {
        await prisma.weaknessArea.update({
          where: { id: existing.id },
          data: { severity: Math.max(existing.severity, severity) },
        });
      } else {
        await prisma.weaknessArea.create({
          data: {
            studentId,
            subjectId,
            topic,
            severity,
            description: `يحتاج تحسين في ${topic}`,
            recommendation: `مراجعة وتمارين إضافية في ${topic}`,
          },
        });
      }
    }
  }
}

export async function updateWeaknessAfterDrill(weaknessId: string, drillScore: number) {
  const weakness = await prisma.weaknessArea.findUnique({ where: { id: weaknessId } });
  if (!weakness) return;

  const update: any = {
    drillCount: { increment: 1 },
    lastScore: drillScore,
  };

  // If score is consistently high, resolve the weakness
  if (drillScore >= 85 && weakness.drillCount >= 2) {
    update.isResolved = true;
    update.resolvedAt = new Date();
    update.severity = 0;
  } else if (drillScore >= 70) {
    update.severity = Math.max(1, weakness.severity - 1);
  }

  return prisma.weaknessArea.update({ where: { id: weaknessId }, data: update });
}
