'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { GradeOverview, Grade } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getScoreColor, getScoreBgColor, formatDate } from '@/lib/utils';
import { BarChart3, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export default function GradesPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<GradeOverview | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const [overviewRes, gradesRes] = await Promise.all([
          api.get(`/grades/student/${user?.studentId}/overview`),
          api.get(`/grades/student/${user?.studentId}`),
        ]);
        setOverview(overviewRes.data.data);
        setGrades(gradesRes.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    if (user?.studentId) fetch();
  }, [user]);

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>;
  if (!overview) return null;

  const chartData = overview.subjectAverages.map((sa) => ({
    name: sa.subject.nameAr,
    average: sa.average,
    icon: sa.subject.icon,
    fill: sa.subject.color || '#3b82f6',
  }));

  const radarData = overview.subjectAverages.map((sa) => ({
    subject: sa.subject.nameAr,
    score: sa.average,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-7 w-7 text-blue-500" />
        <h1 className="text-2xl font-bold">درجاتي</h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-l from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-blue-100">المعدل العام</p>
            <p className="text-4xl font-bold">{overview.overallAverage}%</p>
          </CardContent>
        </Card>

        {overview.strongest && (
          <Card className="bg-green-50 border-green-100">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <p className="text-sm text-gray-500">أقوى مادة</p>
              <p className="font-bold text-green-700">{overview.strongest.subject.nameAr}</p>
              <p className="text-lg font-bold text-green-600">{overview.strongest.average}%</p>
            </CardContent>
          </Card>
        )}

        {overview.weakest && (
          <Card className="bg-orange-50 border-orange-100">
            <CardContent className="p-6 text-center">
              <TrendingDown className="h-6 w-6 text-orange-500 mx-auto mb-1" />
              <p className="text-sm text-gray-500">تحتاج تحسين</p>
              <p className="font-bold text-orange-700">{overview.weakest.subject.nameAr}</p>
              <p className="text-lg font-bold text-orange-600">{overview.weakest.average}%</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>متوسط الدرجات حسب المادة</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [`${value}%`, 'المتوسط']} />
                <Bar dataKey="average" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>نقاط القوة والضعف</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subject breakdown */}
      <Card>
        <CardHeader><CardTitle>تفاصيل الدرجات</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overview.subjectAverages.map((sa) => (
              <div key={sa.subject.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <span className="text-2xl">{sa.subject.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{sa.subject.nameAr}</span>
                    <span className={`font-bold ${getScoreColor(sa.average)}`}>{sa.average}%</span>
                  </div>
                  <Progress
                    value={sa.average}
                    className="h-2"
                    indicatorClassName={sa.average >= 70 ? 'bg-green-500' : sa.average >= 50 ? 'bg-yellow-500' : 'bg-red-500'}
                  />
                </div>
                <Badge variant="outline" className="text-xs">{sa.gradeCount} درجات</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent grades list */}
      <Card>
        <CardHeader><CardTitle>آخر الدرجات</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {grades.slice(0, 10).map((g) => (
              <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                <span className="text-lg">{g.subject?.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{g.title}</p>
                  <p className="text-xs text-gray-500">{g.subject?.nameAr} • {formatDate(g.gradedAt)}</p>
                </div>
                <Badge className={getScoreBgColor(g.score / g.maxScore * 100)}>
                  {g.score}/{g.maxScore}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
