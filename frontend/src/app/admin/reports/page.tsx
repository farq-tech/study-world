'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, Legend } from 'recharts';
import { FileBarChart, Users, BookOpen, TrendingUp, TrendingDown, Award } from 'lucide-react';

const COLORS = ['#3b82f6', '#22c55e', '#8b5cf6', '#f97316', '#14b8a6', '#ef4444', '#eab308', '#ec4899', '#6366f1'];

export default function ReportsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [gradesDist, setGradesDist] = useState<any[]>([]);
  const [hwCompletion, setHwCompletion] = useState<any>(null);
  const [quizPerf, setQuizPerf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const [oRes, gRes, hRes, qRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/grades/distribution'),
          api.get('/analytics/homework/completion'),
          api.get('/analytics/quiz/performance'),
        ]);
        setOverview(oRes.data.data);
        setGradesDist(gRes.data.data || []);
        setHwCompletion(hRes.data.data);
        setQuizPerf(qRes.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetch();
  }, []);

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  );

  const hwData = hwCompletion ? [
    { name: 'مُقيّم', value: hwCompletion.graded, color: '#22c55e' },
    { name: 'مُسلّم', value: hwCompletion.submitted, color: '#3b82f6' },
    { name: 'معلّق', value: hwCompletion.pending, color: '#eab308' },
  ] : [];

  const radarData = gradesDist.map((g: any) => ({
    subject: g.subject?.nameAr || g.subjectName || 'مادة',
    average: g.average || 0,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileBarChart className="h-7 w-7 text-indigo-500" />
        <h1 className="text-2xl font-bold">التقارير والإحصائيات</h1>
      </div>

      {/* Overview stats */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{overview.totalStudents}</p>
            <p className="text-xs text-gray-500">طلاب</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <BookOpen className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{overview.totalSubjects}</p>
            <p className="text-xs text-gray-500">مواد</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{overview.averageGrade?.toFixed(1) || 0}%</p>
            <p className="text-xs text-gray-500">متوسط الدرجات</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Award className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{overview.totalBadgesEarned}</p>
            <p className="text-xs text-gray-500">أوسمة مكتسبة</p>
          </CardContent></Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution Bar Chart */}
        <Card>
          <CardHeader><CardTitle>توزيع الدرجات حسب المادة</CardTitle></CardHeader>
          <CardContent>
            {gradesDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gradesDist.map((g: any, i: number) => ({ name: g.subject?.nameAr || g.subjectName || '', average: g.average || 0, fill: COLORS[i % COLORS.length] }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'المتوسط']} />
                  <Bar dataKey="average" radius={[8, 8, 0, 0]}>
                    {gradesDist.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-400 py-12">لا توجد بيانات</p>}
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card>
          <CardHeader><CardTitle>مخطط أداء المواد</CardTitle></CardHeader>
          <CardContent>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" fontSize={11} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
                  <Radar name="المتوسط" dataKey="average" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-400 py-12">لا توجد بيانات</p>}
          </CardContent>
        </Card>

        {/* Homework Completion Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              إتمام الواجبات
              {hwCompletion && <Badge variant="secondary">{hwCompletion.completionRate?.toFixed(0) || 0}% إتمام</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hwData.length > 0 && hwData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={hwData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {hwData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-400 py-12">لا توجد واجبات</p>}
          </CardContent>
        </Card>

        {/* Quiz Performance */}
        <Card>
          <CardHeader><CardTitle>أداء الاختبارات</CardTitle></CardHeader>
          <CardContent>
            {quizPerf ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-2xl">
                    <p className="text-2xl font-bold text-blue-600">{quizPerf.totalAttempts || 0}</p>
                    <p className="text-xs text-gray-500">إجمالي المحاولات</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-2xl">
                    <p className="text-2xl font-bold text-green-600">{quizPerf.averageScore?.toFixed(1) || 0}%</p>
                    <p className="text-xs text-gray-500">متوسط الدرجات</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-2xl">
                    <p className="text-2xl font-bold text-purple-600">{quizPerf.highestScore?.toFixed(1) || 0}%</p>
                    <p className="text-xs text-gray-500">أعلى درجة</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-2xl">
                    <p className="text-2xl font-bold text-yellow-600">{quizPerf.totalQuizzes || 0}</p>
                    <p className="text-xs text-gray-500">عدد الاختبارات</p>
                  </div>
                </div>
              </div>
            ) : <p className="text-center text-gray-400 py-12">لا توجد بيانات</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
