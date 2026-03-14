'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { DashboardData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { formatTime, getRelativeDate, getLevelName } from '@/lib/utils';
import { HOMEWORK_STATUS_AR, HOMEWORK_STATUS_COLORS } from '@/lib/constants';
import Link from 'next/link';
import {
  BookOpen, ClipboardList, Calculator, Bot, Trophy, Flame, Star, Clock,
  ChevronLeft, AlertTriangle,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const studentId = user?.studentId;
        if (!studentId) return;
        const res = await api.get(`/students/${studentId}/dashboard`);
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const { student, todayClasses, pendingHomework, recentGrades, recentBadges, unreadNotifications, weaknesses } = data;
  const nextLevelPoints = ((student?.level || 1) * 100);
  const progressToNext = student ? Math.min(((student.points % 100) / 100) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Welcome Card */}
        <Card className="md:col-span-2 bg-gradient-to-l from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  مرحباً {student?.user?.nameAr?.split(' ')[0]}! 👋
                </h2>
                <p className="text-blue-100 text-sm">
                  {todayClasses.length > 0
                    ? `لديك ${todayClasses.length} حصص اليوم`
                    : 'لا توجد حصص اليوم - يوم إجازة! 🎉'}
                </p>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-300" />
                    <span className="font-bold text-lg">{student?.points || 0}</span>
                    <span className="text-blue-100 text-sm">نقطة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-300" />
                    <span className="font-bold text-lg">{student?.currentStreak || 0}</span>
                    <span className="text-blue-100 text-sm">يوم متتالي</span>
                  </div>
                </div>
              </div>
              <div className="text-6xl hidden md:block">
                {student?.user?.avatarUrl || '🧑‍🎓'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level Card */}
        <Card className="card-hover">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-2">🏅</div>
            <p className="text-sm text-gray-500">المستوى</p>
            <p className="text-3xl font-bold text-blue-600">{student?.level || 1}</p>
            <p className="text-sm text-gray-600 mb-2">{getLevelName(student?.level || 1)}</p>
            <Progress value={progressToNext} className="h-2" />
            <p className="text-xs text-gray-400 mt-1">{student?.points || 0} / {nextLevelPoints} نقطة</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/student/homework">
          <Card className="card-hover cursor-pointer bg-green-50 border-green-100">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-700">الواجبات</p>
              {pendingHomework.length > 0 && (
                <Badge className="mt-1 bg-green-200 text-green-800">{pendingHomework.length} معلّق</Badge>
              )}
            </CardContent>
          </Card>
        </Link>
        <Link href="/student/quizzes">
          <Card className="card-hover cursor-pointer bg-purple-50 border-purple-100">
            <CardContent className="p-4 text-center">
              <ClipboardList className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-700">الاختبارات</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/student/math-zone">
          <Card className="card-hover cursor-pointer bg-blue-50 border-blue-100">
            <CardContent className="p-4 text-center">
              <Calculator className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-700">منطقة الرياضيات</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/student/ai-tutor">
          <Card className="card-hover cursor-pointer bg-orange-50 border-orange-100">
            <CardContent className="p-4 text-center">
              <Bot className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-orange-700">المعلم الذكي</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              حصص اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayClasses.length === 0 ? (
              <p className="text-gray-400 text-center py-4">لا توجد حصص اليوم 🎉</p>
            ) : (
              <div className="space-y-3">
                {todayClasses.map((cls, i) => (
                  <div
                    key={cls.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
                  >
                    <div
                      className="w-2 h-10 rounded-full"
                      style={{ backgroundColor: cls.subject.color || '#3b82f6' }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cls.subject.icon}</span>
                        <span className="font-medium">{cls.subject.nameAr}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {cls.teacher?.nameAr} • {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      الحصة {cls.periodNumber}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Homework */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-500" />
                الواجبات المعلقة
              </CardTitle>
              <Link href="/student/homework">
                <Button variant="ghost" size="sm">
                  عرض الكل <ChevronLeft className="h-4 w-4 mr-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingHomework.length === 0 ? (
              <p className="text-gray-400 text-center py-4">لا توجد واجبات معلقة ✅</p>
            ) : (
              <div className="space-y-3">
                {pendingHomework.map((hw) => (
                  <Link key={hw.id} href={`/student/homework/${hw.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors cursor-pointer">
                      <span className="text-2xl">{hw.subject.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{hw.title}</p>
                        <p className="text-xs text-gray-500">{hw.subject.nameAr} • {getRelativeDate(hw.dueDate)}</p>
                      </div>
                      <Badge className={HOMEWORK_STATUS_COLORS[hw.status]}>
                        {HOMEWORK_STATUS_AR[hw.status]}
                      </Badge>
                    </div>
                  </Link>
                ))}
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
              نقاط تحتاج تحسين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {weaknesses.map((w) => (
                <div key={w.id} className="bg-white p-3 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{w.subject.icon}</span>
                    <span className="font-medium text-sm">{w.topic}</span>
                  </div>
                  <p className="text-xs text-gray-500">{w.description}</p>
                  <Link href="/student/math-zone">
                    <Button size="sm" variant="outline" className="mt-2 w-full text-xs">
                      تمرن الآن 💪
                    </Button>
                  </Link>
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                آخر الأوسمة
              </CardTitle>
              <Link href="/student/badges">
                <Button variant="ghost" size="sm">عرض الكل</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recentBadges.map((badge) => (
                <div key={badge.id} className="flex-shrink-0 text-center">
                  <div className="text-4xl mb-1">{badge.icon}</div>
                  <p className="text-xs font-medium">{badge.nameAr}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
