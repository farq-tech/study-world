'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, Star, Flame, Trophy, BookOpen, BarChart3, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Student, DashboardData, GradeOverview } from '@/types';
import { formatTime, getLevelName, getScoreBgColor } from '@/lib/utils';

export default function AdminStudentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [gradeOverview, setGradeOverview] = useState<GradeOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [studentRes, dashboardRes, gradesRes] = await Promise.all([
          api.get(`/students/${id}`),
          api.get(`/students/${id}/dashboard`),
          api.get(`/grades/student/${id}/overview`),
        ]);

        setStudent(studentRes.data.data);
        setDashboard(dashboardRes.data.data);
        setGradeOverview(gradesRes.data.data);
      } catch (err) {
        console.error('Failed to fetch student data:', err);
        setError('فشل في تحميل بيانات الطالب');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-32 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link href="/admin/students">
          <Button variant="ghost" className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة للطلاب
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 text-lg">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student || !dashboard) return null;

  const { todayClasses, pendingHomework, recentBadges, weaknesses } = dashboard;
  const nextLevelPoints = (student.level || 1) * 100;
  const progressToNext = Math.min(((student.points % 100) / 100) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/students">
        <Button variant="ghost" className="gap-2 text-gray-600 hover:text-gray-900">
          <ArrowRight className="h-4 w-4" />
          العودة لقائمة الطلاب
        </Button>
      </Link>

      {/* Student Info Hero Card */}
      <Card className="bg-gradient-to-l from-blue-500 to-purple-600 text-white border-0 overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl flex-shrink-0">
              {student.user?.avatarUrl ? (
                <span>{student.user.avatarUrl}</span>
              ) : (
                <User className="h-10 w-10 text-white/80" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold mb-1 truncate">
                {student.user?.nameAr || 'طالب'}
              </h1>
              <div className="flex flex-wrap gap-3 text-blue-100 text-sm">
                <span>الصف: {student.className}</span>
                <span>المرحلة: {student.gradeLevel}</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <Star className="h-5 w-5 text-yellow-300 mx-auto mb-1" />
              <p className="text-2xl font-bold">{student.points || 0}</p>
              <p className="text-xs text-blue-100">النقاط</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <Trophy className="h-5 w-5 text-amber-300 mx-auto mb-1" />
              <p className="text-2xl font-bold">{student.level || 1}</p>
              <p className="text-xs text-blue-100">{getLevelName(student.level || 1)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <Flame className="h-5 w-5 text-orange-300 mx-auto mb-1" />
              <p className="text-2xl font-bold">{student.currentStreak || 0}</p>
              <p className="text-xs text-blue-100">يوم متتالي</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <Flame className="h-5 w-5 text-red-300 mx-auto mb-1" />
              <p className="text-2xl font-bold">{student.longestStreak || 0}</p>
              <p className="text-xs text-blue-100">اطول سلسلة</p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-blue-100 mb-1">
              <span>التقدم للمستوى التالي</span>
              <span>{student.points % 100} / 100 نقطة</span>
            </div>
            <Progress value={progressToNext} className="h-2 bg-white/20" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Classes Count */}
        <Card className="card-hover bg-blue-50 border-blue-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">حصص اليوم</p>
                <p className="text-2xl font-bold text-blue-800">{todayClasses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Homework */}
        <Card className="card-hover bg-green-50 border-green-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600">واجبات معلقة</p>
                <p className="text-2xl font-bold text-green-800">{pendingHomework.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Average */}
        <Card className="card-hover bg-purple-50 border-purple-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600">المعدل العام</p>
                <p className="text-2xl font-bold text-purple-800">
                  {gradeOverview ? `${Math.round(gradeOverview.overallAverage)}%` : '--'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              حصص اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayClasses.length === 0 ? (
              <p className="text-gray-400 text-center py-6">لا توجد حصص اليوم</p>
            ) : (
              <div className="space-y-3">
                {todayClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
                  >
                    <div
                      className="w-2 h-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cls.subject.color || '#3b82f6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cls.subject.icon}</span>
                        <span className="font-medium">{cls.subject.nameAr}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {cls.teacher?.nameAr && `${cls.teacher.nameAr} - `}
                        {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                        {cls.room && ` - قاعة ${cls.room}`}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      الحصة {cls.periodNumber}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grade Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              نظرة عامة على الدرجات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!gradeOverview || gradeOverview.subjectAverages.length === 0 ? (
              <p className="text-gray-400 text-center py-6">لا توجد درجات بعد</p>
            ) : (
              <div className="space-y-4">
                {/* Strongest & Weakest */}
                <div className="grid grid-cols-2 gap-3">
                  {gradeOverview.strongest && (
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-green-600 mb-1">الأقوى</p>
                      <p className="font-bold text-green-800 text-sm">
                        {gradeOverview.strongest.subject.icon} {gradeOverview.strongest.subject.nameAr}
                      </p>
                      <p className="text-lg font-bold text-green-700">
                        {Math.round(gradeOverview.strongest.average)}%
                      </p>
                    </div>
                  )}
                  {gradeOverview.weakest && (
                    <div className="bg-red-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-red-600 mb-1">الأضعف</p>
                      <p className="font-bold text-red-800 text-sm">
                        {gradeOverview.weakest.subject.icon} {gradeOverview.weakest.subject.nameAr}
                      </p>
                      <p className="text-lg font-bold text-red-700">
                        {Math.round(gradeOverview.weakest.average)}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Subject Averages */}
                <div className="space-y-3">
                  {gradeOverview.subjectAverages.map((sa) => (
                    <div key={sa.subject.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{sa.subject.icon}</span>
                          <span className="font-medium">{sa.subject.nameAr}</span>
                          <span className="text-xs text-gray-400">({sa.gradeCount} درجة)</span>
                        </div>
                        <Badge className={getScoreBgColor(sa.average)}>
                          {Math.round(sa.average)}%
                        </Badge>
                      </div>
                      <Progress
                        value={sa.average}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>

                <div className="text-center text-xs text-gray-400 pt-2 border-t">
                  اجمالي الدرجات المسجلة: {gradeOverview.totalGrades}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weaknesses Alert */}
      {weaknesses.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              نقاط الضعف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {weaknesses.map((w) => (
                <div key={w.id} className="bg-white p-4 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{w.subject.icon}</span>
                    <span className="font-medium text-sm">{w.topic}</span>
                  </div>
                  {w.description && (
                    <p className="text-xs text-gray-500 mb-2">{w.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">الشدة: {w.severity}/10</span>
                    <span className="text-gray-400">التمارين: {w.drillCount}</span>
                    {w.lastScore !== undefined && w.lastScore !== null && (
                      <Badge className={getScoreBgColor(w.lastScore)} variant="outline">
                        {w.lastScore}%
                      </Badge>
                    )}
                  </div>
                  <Progress value={w.severity * 10} className="h-1.5 mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Badges */}
      {recentBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              آخر الأوسمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recentBadges.map((badge) => (
                <div key={badge.id} className="flex-shrink-0 text-center min-w-[80px]">
                  <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-2">
                    <span className="text-3xl">{badge.icon}</span>
                  </div>
                  <p className="text-xs font-medium">{badge.nameAr}</p>
                  {badge.descriptionAr && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{badge.descriptionAr}</p>
                  )}
                  {badge.earnedAt && (
                    <p className="text-[10px] text-gray-300 mt-0.5">{formatDate(badge.earnedAt)}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-500">اجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href={`/admin/grades/add?studentId=${id}`}>
              <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                <BarChart3 className="h-4 w-4" />
                اضافة درجة
              </Button>
            </Link>
            <Link href={`/admin/homework/assign?studentId=${id}`}>
              <Button className="gap-2 bg-green-600 hover:bg-green-700">
                <BookOpen className="h-4 w-4" />
                تعيين واجب
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Last Activity */}
      {student.lastActivityAt && (
        <p className="text-xs text-gray-400 text-center">
          آخر نشاط: {formatDate(student.lastActivityAt)}
        </p>
      )}
    </div>
  );
}
