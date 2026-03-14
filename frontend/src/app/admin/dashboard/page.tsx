'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  Users, BookOpen, ClipboardList, GraduationCap, Trophy,
  FileQuestion, TrendingUp, AlertCircle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OverviewData {
  totalStudents: number;
  totalSubjects: number;
  totalTeachers: number;
  totalHomework: number;
  pendingHomework: number;
  totalQuizzes: number;
  totalBadgesEarned: number;
  averageGrade: number;
}

interface GradeDistribution {
  subject: string;
  average: number;
  count: number;
}

interface HomeworkCompletion {
  total: number;
  pending: number;
  submitted: number;
  graded: number;
  completionRate: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#f97316', '#eab308',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

const STAT_CARDS_CONFIG = [
  {
    key: 'totalStudents',
    label: 'اجمالي الطلاب',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-400',
    bgLight: 'bg-blue-50',
  },
  {
    key: 'totalSubjects',
    label: 'المواد الدراسية',
    icon: BookOpen,
    gradient: 'from-purple-500 to-fuchsia-400',
    bgLight: 'bg-purple-50',
  },
  {
    key: 'pendingHomework',
    label: 'واجبات معلقة',
    icon: ClipboardList,
    gradient: 'from-amber-500 to-yellow-400',
    bgLight: 'bg-amber-50',
  },
  {
    key: 'totalQuizzes',
    label: 'اجمالي الاختبارات',
    icon: FileQuestion,
    gradient: 'from-rose-500 to-pink-400',
    bgLight: 'bg-rose-50',
  },
  {
    key: 'averageGrade',
    label: 'متوسط الدرجات',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-green-400',
    bgLight: 'bg-emerald-50',
    suffix: '%',
  },
  {
    key: 'totalBadgesEarned',
    label: 'الاوسمة الممنوحة',
    icon: Trophy,
    gradient: 'from-orange-500 to-amber-400',
    bgLight: 'bg-orange-50',
  },
] as const;

const QUICK_LINKS = [
  { href: '/admin/students', label: 'ادارة الطلاب', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100 border-blue-100' },
  { href: '/admin/homework', label: 'ادارة الواجبات', icon: ClipboardList, color: 'text-green-600', bg: 'bg-green-50 hover:bg-green-100 border-green-100' },
  { href: '/admin/quizzes', label: 'ادارة الاختبارات', icon: FileQuestion, color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100 border-purple-100' },
  { href: '/admin/subjects', label: 'ادارة المواد', icon: BookOpen, color: 'text-cyan-600', bg: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-100' },
  { href: '/admin/teachers', label: 'ادارة المعلمين', icon: GraduationCap, color: 'text-rose-600', bg: 'bg-rose-50 hover:bg-rose-100 border-rose-100' },
  { href: '/admin/grades', label: 'الدرجات والتقارير', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50 hover:bg-amber-100 border-amber-100' },
];

/* ------------------------------------------------------------------ */
/*  Skeleton Loader                                                    */
/* ------------------------------------------------------------------ */

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
      {/* charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
      {/* quick links skeleton */}
      <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom Tooltip                                                     */
/* ------------------------------------------------------------------ */

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm" dir="rtl">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} style={{ color: entry.color }} className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function AdminDashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistribution[]>([]);
  const [homeworkCompletion, setHomeworkCompletion] = useState<HomeworkCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, gradesRes, homeworkRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/grades/distribution'),
          api.get('/analytics/homework/completion'),
        ]);
        setOverview(overviewRes.data.data);
        setGradeDistribution(gradesRes.data.data);
        setHomeworkCompletion(homeworkRes.data.data);
      } catch (err) {
        console.error('Failed to fetch admin dashboard data:', err);
        setError('حدث خطا اثناء تحميل البيانات. يرجى المحاولة مرة اخرى.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  /* Loading state */
  if (loading) return <DashboardSkeleton />;

  /* Error state */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-lg font-semibold text-gray-700 mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          اعادة المحاولة
        </button>
      </div>
    );
  }

  /* Build homework completion bar data */
  const homeworkBarData = homeworkCompletion
    ? [
        { name: 'مكتملة', value: homeworkCompletion.graded, color: '#22c55e' },
        { name: 'مسلّمة', value: homeworkCompletion.submitted, color: '#3b82f6' },
        { name: 'معلقة', value: homeworkCompletion.pending, color: '#f59e0b' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* -------- Page Title -------- */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">لوحة التحكم</h1>
        <p className="text-gray-500 mt-1 text-sm">نظرة عامة على المنصة التعليمية</p>
      </div>

      {/* -------- Stat Cards -------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS_CONFIG.map((card) => {
          const Icon = card.icon;
          const value = overview
            ? (overview as any)[card.key]
            : 0;
          return (
            <Card key={card.key} className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
              {/* Gradient accent bar */}
              <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-l ${card.gradient}`} />
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${card.bgLight}`}>
                  <Icon className={`h-7 w-7 bg-gradient-to-br ${card.gradient} bg-clip-text`} style={{ color: 'inherit' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 mb-0.5">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
                    {'suffix' in card && card.suffix ? <span className="text-base font-medium text-gray-400 mr-1">{card.suffix}</span> : null}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* -------- Charts Row -------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution Bar Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              توزيع الدرجات حسب المادة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gradeDistribution.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <AlertCircle className="h-10 w-10 mb-2" />
                <p className="text-sm">لا توجد بيانات حتى الآن</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={gradeDistribution}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="subject"
                    width={90}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="average"
                    name="المتوسط"
                    radius={[0, 8, 8, 0]}
                    barSize={24}
                  >
                    {gradeDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Homework Completion Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <ClipboardList className="h-5 w-5 text-green-500" />
                حالة الواجبات
              </CardTitle>
              {homeworkCompletion && (
                <Badge variant="secondary" className="text-sm">
                  نسبة الاكتمال: {homeworkCompletion.completionRate}%
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!homeworkCompletion ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <AlertCircle className="h-10 w-10 mb-2" />
                <p className="text-sm">لا توجد بيانات حتى الآن</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Completion progress bar */}
                <div className="relative w-full h-6 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="absolute top-0 right-0 h-full rounded-full bg-gradient-to-l from-green-500 to-emerald-400 transition-all duration-700"
                    style={{ width: `${homeworkCompletion.completionRate}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                    {homeworkCompletion.completionRate}%
                  </span>
                </div>

                {/* Homework status bars */}
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={homeworkBarData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="العدد" radius={[8, 8, 0, 0]} barSize={48}>
                      {homeworkBarData.map((entry, index) => (
                        <Cell key={`hw-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Summary numbers */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-green-50">
                    <p className="text-lg font-bold text-green-600">{homeworkCompletion.graded}</p>
                    <p className="text-xs text-gray-500">مكتملة</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-blue-50">
                    <p className="text-lg font-bold text-blue-600">{homeworkCompletion.submitted}</p>
                    <p className="text-xs text-gray-500">مسلّمة</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-amber-50">
                    <p className="text-lg font-bold text-amber-600">{homeworkCompletion.pending}</p>
                    <p className="text-xs text-gray-500">معلقة</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* -------- Quick Actions -------- */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <GraduationCap className="h-5 w-5 text-indigo-500" />
            اجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all ${link.bg}`}>
                    <Icon className={`h-8 w-8 ${link.color}`} />
                    <span className={`text-sm font-medium ${link.color} text-center`}>{link.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
