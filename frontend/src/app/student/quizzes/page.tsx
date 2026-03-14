'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Quiz } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QUIZ_TYPE_AR } from '@/lib/constants';
import { ClipboardList, Clock, CheckCircle, PlayCircle } from 'lucide-react';

export default function QuizzesPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get(`/quizzes/available/${user?.studentId}`);
        setQuizzes(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    if (user?.studentId) fetch();
  }, [user]);

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>;
  }

  const daily = quizzes.filter((q) => q.type === 'DAILY');
  const weekly = quizzes.filter((q) => q.type === 'WEEKLY');
  const math = quizzes.filter((q) => q.type === 'MATH_FOCUS');

  const QuizCard = ({ quiz }: { quiz: Quiz }) => (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{quiz.subject?.icon || '📋'}</span>
          <div className="flex-1">
            <h3 className="font-bold">{quiz.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{QUIZ_TYPE_AR[quiz.type]}</Badge>
              <span className="text-xs text-gray-500">{quiz.subject?.nameAr}</span>
              <span className="text-xs text-gray-400">• {quiz.questions?.length || 0} أسئلة</span>
              {quiz.timeLimit && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {quiz.timeLimit} دقيقة
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {quiz.attempted ? (
              <>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> مكتمل
                </Badge>
                {quiz.bestScore !== null && (
                  <span className="text-sm font-bold text-green-600">{Math.round(quiz.bestScore!)}%</span>
                )}
              </>
            ) : (
              <Link href={`/student/quizzes/${quiz.id}`}>
                <Button size="sm" variant="fun" className="flex items-center gap-1">
                  <PlayCircle className="h-4 w-4" /> ابدأ
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-7 w-7 text-purple-500" />
        <h1 className="text-2xl font-bold">الاختبارات</h1>
      </div>

      {daily.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3 text-blue-700">📝 اختبارات اليوم</h2>
          <div className="space-y-3">{daily.map((q) => <QuizCard key={q.id} quiz={q} />)}</div>
        </div>
      )}

      {weekly.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3 text-purple-700">📋 الاختبار الأسبوعي</h2>
          <div className="space-y-3">{weekly.map((q) => <QuizCard key={q.id} quiz={q} />)}</div>
        </div>
      )}

      {math.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3 text-orange-700">🔢 تمارين الرياضيات</h2>
          <div className="space-y-3">{math.map((q) => <QuizCard key={q.id} quiz={q} />)}</div>
        </div>
      )}

      {quizzes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-gray-500 text-lg">لا توجد اختبارات متاحة حالياً</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
