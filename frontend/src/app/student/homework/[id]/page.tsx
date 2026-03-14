'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Homework } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, getScoreBgColor } from '@/lib/utils';
import { HOMEWORK_STATUS_AR, HOMEWORK_STATUS_COLORS } from '@/lib/constants';
import { BookOpen, Bot, CheckCircle, Loader2 } from 'lucide-react';

export default function HomeworkDetailPage() {
  const params = useParams();
  const [homework, setHomework] = useState<Homework | null>(null);
  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get(`/homework/${params.id}`);
        setHomework(res.data.data);
        if (res.data.data.aiExplanation) {
          setExplanation(res.data.data.aiExplanation);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetch();
  }, [params.id]);

  const handleExplain = async () => {
    if (!homework) return;
    setExplaining(true);
    try {
      const res = await api.post('/ai/explain-homework', {
        title: homework.title,
        subjectName: homework.subject?.nameAr,
        description: homework.description || homework.title,
      });
      setExplanation(res.data.data.explanation);

      // Save explanation to homework
      await api.put(`/homework/${homework.id}`, { aiExplanation: res.data.data.explanation });
    } catch (err) { console.error(err); }
    finally { setExplaining(false); }
  };

  const handleSubmit = async () => {
    if (!homework) return;
    setSubmitting(true);
    try {
      await api.put(`/homework/${homework.id}/submit`);
      setHomework({ ...homework, status: 'SUBMITTED', submittedAt: new Date().toISOString() });
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />;
  if (!homework) return <p className="text-center text-gray-500">الواجب غير موجود</p>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{homework.subject?.icon || '📚'}</span>
            <div className="flex-1">
              <CardTitle className="text-xl">{homework.title}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{homework.subject?.nameAr}</p>
            </div>
            <Badge className={HOMEWORK_STATUS_COLORS[homework.status]}>
              {HOMEWORK_STATUS_AR[homework.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm text-gray-500 mb-4">
            <span>📅 تاريخ التسليم: {formatDate(homework.dueDate)}</span>
          </div>

          {homework.description && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-bold text-sm mb-2">وصف الواجب:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{homework.description}</p>
            </div>
          )}

          {homework.grade !== null && homework.grade !== undefined && (
            <div className="mt-4 bg-green-50 p-4 rounded-xl">
              <h3 className="font-bold text-sm mb-2">الدرجة:</h3>
              <span className={`text-3xl font-bold ${getScoreBgColor(homework.grade)} px-3 py-1 rounded-xl`}>
                {homework.grade}%
              </span>
              {homework.feedback && <p className="mt-2 text-sm text-gray-600">{homework.feedback}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {homework.status === 'PENDING' && (
          <Button onClick={handleSubmit} disabled={submitting} className="flex-1" variant="secondary" size="lg">
            {submitting ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <CheckCircle className="h-5 w-5 ml-2" />}
            تم التسليم ✅
          </Button>
        )}
        <Button onClick={handleExplain} disabled={explaining} variant="fun" size="lg" className="flex-1">
          {explaining ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <Bot className="h-5 w-5 ml-2" />}
          اشرح لي 🤖
        </Button>
      </div>

      {/* AI Explanation */}
      {explanation && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Bot className="h-5 w-5" />
              شرح المعلم الذكي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-xl whitespace-pre-wrap text-gray-700 leading-relaxed">
              {explanation}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
