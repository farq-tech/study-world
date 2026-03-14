'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Quiz, QuizQuestion } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, Trophy } from 'lucide-react';

export default function QuizPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get(`/quizzes/${params.id}`);
        setQuiz(res.data.data);
        if (res.data.data.timeLimit) {
          setTimeLeft(res.data.data.timeLimit * 60);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetch();
  }, [params.id]);

  // Timer
  useEffect(() => {
    if (!started || !quiz?.timeLimit || result) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, quiz?.timeLimit, result]);

  const handleAnswer = (questionId: string, answer: number | string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!quiz || submitting) return;
    setSubmitting(true);
    try {
      const answersArr = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
      const res = await api.post(`/quizzes/${quiz.id}/attempt`, {
        studentId: user?.studentId,
        answers: answersArr,
        timeTaken: quiz.timeLimit ? (quiz.timeLimit * 60 - timeLeft) : undefined,
      });
      setResult(res.data.data);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />;
  if (!quiz) return <p className="text-center text-gray-500">الاختبار غير موجود</p>;

  const questions = quiz.questions || [];
  const formatTimeLeft = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Results screen
  if (result) {
    const isPerfect = result.score === 100;
    const isGood = result.score >= 70;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className={cn('text-center', isPerfect ? 'bg-gradient-to-b from-yellow-50 to-white' : isGood ? 'bg-gradient-to-b from-green-50 to-white' : 'bg-gradient-to-b from-blue-50 to-white')}>
          <CardContent className="p-8">
            <div className="text-6xl mb-4">{isPerfect ? '🏆' : isGood ? '⭐' : '💪'}</div>
            <h2 className="text-2xl font-bold mb-2">
              {isPerfect ? 'ممتاز! درجة كاملة!' : isGood ? 'أحسنت! عمل جيد!' : 'حاول مرة أخرى!'}
            </h2>

            <div className="inline-flex items-center gap-2 bg-white rounded-2xl px-6 py-4 shadow-sm mt-4">
              <span className="text-4xl font-bold text-blue-600">{Math.round(result.score)}%</span>
              <span className="text-gray-500">({result.totalCorrect}/{result.totalQuestions})</span>
            </div>

            {result.pointsEarned > 0 && (
              <p className="mt-3 text-green-600 font-medium">+{result.pointsEarned} نقطة! ✨</p>
            )}
          </CardContent>
        </Card>

        {/* Feedback per question */}
        <Card>
          <CardHeader><CardTitle>مراجعة الإجابات</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {result.feedback?.map((fb: any, i: number) => {
              const q = questions.find((q: QuizQuestion) => q.id === fb.questionId);
              return (
                <div key={fb.questionId} className={cn('p-3 rounded-xl', fb.correct ? 'bg-green-50' : 'bg-red-50')}>
                  <div className="flex items-start gap-2">
                    {fb.correct ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
                    <div>
                      <p className="font-medium">{q?.text}</p>
                      {!fb.correct && q?.options && (
                        <p className="text-sm text-green-700 mt-1">الإجابة الصحيحة: {q.options[fb.correctAnswer as number]}</p>
                      )}
                      {fb.explanation && <p className="text-sm text-gray-500 mt-1">{fb.explanation}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => router.push('/student/quizzes')} variant="outline" className="flex-1">العودة للاختبارات</Button>
          <Button onClick={() => router.push('/student/dashboard')} className="flex-1">الرئيسية</Button>
        </div>
      </div>
    );
  }

  // Pre-start screen
  if (!started) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardContent className="p-8">
            <span className="text-5xl mb-4 block">{quiz.subject?.icon || '📋'}</span>
            <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
            <p className="text-gray-500 mb-4">{quiz.subject?.nameAr}</p>

            <div className="flex justify-center gap-4 text-sm text-gray-600 mb-6">
              <span>📝 {questions.length} أسئلة</span>
              {quiz.timeLimit && <span>⏱️ {quiz.timeLimit} دقيقة</span>}
            </div>

            <Button size="xl" variant="fun" onClick={() => setStarted(true)} className="w-full text-xl">
              ابدأ الاختبار 🚀
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz in progress
  const question = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <Progress value={progress} className="flex-1 h-3" />
        <Badge variant="outline">{currentQ + 1}/{questions.length}</Badge>
        {quiz.timeLimit && (
          <Badge variant={timeLeft < 60 ? 'destructive' : 'outline'} className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {formatTimeLeft()}
          </Badge>
        )}
      </div>

      {/* Question */}
      <Card>
        <CardContent className="p-6">
          <p className="text-xl font-bold mb-6 text-center leading-relaxed">{question.text}</p>

          {question.type === 'mcq' || question.type === 'true_false' ? (
            <div className="space-y-3">
              {question.options?.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(question.id, i)}
                  className={cn(
                    'w-full p-4 rounded-xl text-right text-lg font-medium border-2 transition-all',
                    answers[question.id] === i
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  )}
                >
                  <span className="ml-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold">
                    {String.fromCharCode(1571 + i)}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              className="w-full p-4 rounded-xl border-2 border-gray-200 text-lg text-center focus:border-blue-500 focus:outline-none"
              placeholder="اكتب إجابتك هنا..."
              value={(answers[question.id] as string) || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
          disabled={currentQ === 0}
          className="flex-1"
        >
          <ChevronRight className="h-5 w-5 ml-1" /> السابق
        </Button>

        {currentQ < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentQ((prev) => prev + 1)}
            className="flex-1"
          >
            التالي <ChevronLeft className="h-5 w-5 mr-1" />
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? '...' : 'إنهاء الاختبار ✅'}
          </Button>
        )}
      </div>
    </div>
  );
}
