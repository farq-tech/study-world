import { prisma } from '../lib/prisma';
import { QuizType } from '@prisma/client';
import { QuizQuestion } from '../types';
import { addPoints } from './student.service';

export async function getQuizzesBySubject(subjectId: string) {
  return prisma.quiz.findMany({
    where: { subjectId, isActive: true },
    include: { subject: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAvailableQuizzes(studentId: string) {
  const quizzes = await prisma.quiz.findMany({
    where: { isActive: true },
    include: {
      subject: true,
      attempts: {
        where: { studentId },
        select: { id: true, score: true, completedAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return quizzes.map((quiz) => ({
    ...quiz,
    attempted: quiz.attempts.length > 0,
    bestScore: quiz.attempts.length > 0
      ? Math.max(...quiz.attempts.map((a) => a.score))
      : null,
    attemptCount: quiz.attempts.length,
  }));
}

export async function getQuizById(id: string) {
  return prisma.quiz.findUnique({
    where: { id },
    include: { subject: true },
  });
}

export async function createQuiz(data: {
  subjectId: string;
  title: string;
  description?: string;
  type: QuizType;
  questions: QuizQuestion[];
  totalMarks: number;
  timeLimit?: number;
  weekNumber?: number;
}) {
  return prisma.quiz.create({
    data: {
      ...data,
      questions: data.questions as any,
    },
    include: { subject: true },
  });
}

export async function submitQuizAttempt(
  quizId: string,
  studentId: string,
  answers: { questionId: string; answer: number | string }[],
  timeTaken?: number
) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) throw Object.assign(new Error('الاختبار غير موجود'), { statusCode: 404 });

  const questions = quiz.questions as unknown as QuizQuestion[];

  let totalCorrect = 0;
  const feedback: { questionId: string; correct: boolean; correctAnswer: number | string; explanation?: string }[] = [];

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) continue;

    const isCorrect = String(question.correctAnswer) === String(answer.answer);
    if (isCorrect) totalCorrect++;

    feedback.push({
      questionId: answer.questionId,
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    });
  }

  const score = questions.length > 0 ? (totalCorrect / questions.length) * 100 : 0;

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId,
      studentId,
      answers: answers as any,
      score,
      totalCorrect,
      totalQuestions: questions.length,
      timeTaken,
      feedback: feedback as any,
    },
  });

  // Award points based on score
  const pointsEarned = Math.round(score / 10);
  if (pointsEarned > 0) {
    await addPoints(studentId, pointsEarned);
  }

  return {
    attempt,
    score,
    totalCorrect,
    totalQuestions: questions.length,
    feedback,
    pointsEarned,
  };
}

export async function getQuizResults(attemptId: string) {
  return prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: { include: { subject: true } },
      student: { include: { user: { select: { nameAr: true } } } },
    },
  });
}

export async function getStudentQuizHistory(studentId: string) {
  return prisma.quizAttempt.findMany({
    where: { studentId },
    include: {
      quiz: { include: { subject: true } },
    },
    orderBy: { completedAt: 'desc' },
  });
}
