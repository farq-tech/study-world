'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { WeaknessArea } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Calculator, AlertTriangle, CheckCircle, PlayCircle, Loader2, Trophy, Target } from 'lucide-react';

interface DrillQuestion {
  id: string;
  text: string;
  type: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function MathZonePage() {
  const { user } = useAuth();
  const [weaknesses, setWeaknesses] = useState<WeaknessArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [drillMode, setDrillMode] = useState(false);
  const [drillTopic, setDrillTopic] = useState('');
  const [drillQuestions, setDrillQuestions] = useState<DrillQuestion[]>([]);
  const [currentDrill, setCurrentDrill] = useState(0);
  const [drillAnswers, setDrillAnswers] = useState<Record<string, number>>({});
  const [drillSubmitted, setDrillSubmitted] = useState(false);
  const [generatingDrill, setGeneratingDrill] = useState(false);

  const mathTopics = [
    { name: 'الجمع', icon: '➕', color: 'bg-blue-50 text-blue-700' },
    { name: 'الطرح', icon: '➖', color: 'bg-green-50 text-green-700' },
    { name: 'الضرب', icon: '✖️', color: 'bg-purple-50 text-purple-700' },
    { name: 'القسمة', icon: '➗', color: 'bg-orange-50 text-orange-700' },
    { name: 'الأشكال الهندسية', icon: '🔷', color: 'bg-teal-50 text-teal-700' },
    { name: 'أنماط الأعداد', icon: '🔢', color: 'bg-pink-50 text-pink-700' },
    { name: 'المقارنة', icon: '⚖️', color: 'bg-yellow-50 text-yellow-700' },
    { name: 'مسائل كلامية', icon: '📝', color: 'bg-red-50 text-red-700' },
  ];

  useEffect(() => {
    async function fetch() {
      try {
        if (!user?.studentId) return;
        const res = await api.get(`/analytics/student/${user.studentId}/summary`);
        setWeaknesses(res.data.data.weaknesses || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetch();
  }, [user]);

  const startDrill = async (topic: string) => {
    setGeneratingDrill(true);
    setDrillTopic(topic);
    try {
      const res = await api.post('/ai/generate-drill', { topic, count: 5 });
      setDrillQuestions(res.data.data.drill);
      setDrillMode(true);
      setCurrentDrill(0);
      setDrillAnswers({});
      setDrillSubmitted(false);
    } catch (err) { console.error(err); }
    finally { setGeneratingDrill(false); }
  };

  const submitDrill = () => {
    setDrillSubmitted(true);
  };

  const getDrillScore = () => {
    let correct = 0;
    drillQuestions.forEach((q) => {
      if (drillAnswers[q.id] === q.correctAnswer) correct++;
    });
    return { correct, total: drillQuestions.length, percentage: Math.round((correct / drillQuestions.length) * 100) };
  };

  if (loading) return <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>;

  // Drill results
  if (drillMode && drillSubmitted) {
    const score = getDrillScore();
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className={cn('text-center', score.percentage >= 80 ? 'bg-green-50' : 'bg-blue-50')}>
          <CardContent className="p-8">
            <div className="text-5xl mb-4">{score.percentage >= 80 ? '🏆' : score.percentage >= 60 ? '⭐' : '💪'}</div>
            <h2 className="text-xl font-bold mb-2">نتيجة تمرين {drillTopic}</h2>
            <p className="text-3xl font-bold text-blue-600">{score.correct}/{score.total}</p>
            <p className="text-gray-500">({score.percentage}%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>مراجعة الإجابات</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {drillQuestions.map((q) => {
              const isCorrect = drillAnswers[q.id] === q.correctAnswer;
              return (
                <div key={q.id} className={cn('p-3 rounded-xl', isCorrect ? 'bg-green-50' : 'bg-red-50')}>
                  <div className="flex items-center gap-2">
                    {isCorrect ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-red-500" />}
                    <span className="font-medium">{q.text}</span>
                  </div>
                  {!isCorrect && <p className="text-sm text-green-700 mt-1 mr-7">الإجابة: {q.options[q.correctAnswer]}</p>}
                  {q.explanation && <p className="text-sm text-gray-500 mt-1 mr-7">{q.explanation}</p>}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => startDrill(drillTopic)} className="flex-1">تمرين آخر 🔄</Button>
          <Button onClick={() => setDrillMode(false)} variant="outline" className="flex-1">العودة</Button>
        </div>
      </div>
    );
  }

  // Drill in progress
  if (drillMode && drillQuestions.length > 0) {
    const q = drillQuestions[currentDrill];
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Progress value={((currentDrill + 1) / drillQuestions.length) * 100} className="flex-1 h-3" />
          <Badge>{currentDrill + 1}/{drillQuestions.length}</Badge>
        </div>

        <Card>
          <CardContent className="p-6">
            <p className="text-xl font-bold mb-6 text-center">{q.text}</p>
            <div className="space-y-3">
              {q.options?.map((option, i) => (
                <button
                  key={i}
                  onClick={() => setDrillAnswers((prev) => ({ ...prev, [q.id]: i }))}
                  className={cn(
                    'w-full p-4 rounded-xl text-lg font-medium border-2 transition-all text-right',
                    drillAnswers[q.id] === i ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentDrill((p) => Math.max(0, p - 1))} disabled={currentDrill === 0} className="flex-1">السابق</Button>
          {currentDrill < drillQuestions.length - 1 ? (
            <Button onClick={() => setCurrentDrill((p) => p + 1)} className="flex-1">التالي</Button>
          ) : (
            <Button variant="secondary" onClick={submitDrill} className="flex-1">إنهاء التمرين ✅</Button>
          )}
        </div>
      </div>
    );
  }

  // Main math zone page
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-7 w-7 text-blue-500" />
        <h1 className="text-2xl font-bold">منطقة الرياضيات</h1>
        <Badge variant="purple">🔢 تدريب خاص</Badge>
      </div>

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Target className="h-5 w-5" />
              نقاط تحتاج تمرين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {weaknesses.map((w) => (
                <div key={w.id} className="bg-white p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{w.topic}</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < w.severity ? 'text-orange-400' : 'text-gray-200'}>●</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{w.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{w.drillCount} تمارين مكتملة</span>
                    <Button size="sm" onClick={() => startDrill(w.topic)} disabled={generatingDrill}>
                      {generatingDrill ? <Loader2 className="h-4 w-4 animate-spin" /> : 'تمرن الآن 💪'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Math Topics Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-blue-500" />
            اختر موضوع للتمرين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mathTopics.map((topic) => (
              <button
                key={topic.name}
                onClick={() => startDrill(topic.name)}
                disabled={generatingDrill}
                className={cn(
                  'p-4 rounded-xl text-center transition-all hover:shadow-md active:scale-95',
                  topic.color
                )}
              >
                <span className="text-3xl block mb-2">{topic.icon}</span>
                <span className="font-medium text-sm">{topic.name}</span>
              </button>
            ))}
          </div>
          {generatingDrill && (
            <div className="text-center mt-4 text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              جارِ إنشاء التمارين...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
