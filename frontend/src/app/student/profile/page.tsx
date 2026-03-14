'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Student, StudentBadge } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Star, Flame, Trophy, BookOpen, Award, TrendingUp } from 'lucide-react';
import { LEVEL_THRESHOLDS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const { user } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [badges, setBadges] = useState<StudentBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!user?.studentId) return;
      try {
        const [sRes, bRes] = await Promise.all([
          api.get(`/students/${user.studentId}`),
          api.get(`/badges/student/${user.studentId}`),
        ]);
        setStudent(sRes.data.data);
        setBadges(bRes.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetch();
  }, [user]);

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>;
  if (!student) return <div className="text-center py-12 text-gray-400">لم يتم العثور على بيانات الطالب</div>;

  const currentThreshold = LEVEL_THRESHOLDS[student.level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[student.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const levelProgress = ((student.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="h-7 w-7 text-blue-500" />
        <h1 className="text-2xl font-bold">ملفي الشخصي</h1>
      </div>

      {/* Hero Card */}
      <Card className="bg-gradient-to-l from-blue-500 to-purple-600 text-white border-0 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : '👦'}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user?.nameAr}</h2>
              <p className="text-white/80">{student.gradeLevel} — {student.className}</p>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-300" /><span className="font-bold">{student.points}</span><span className="text-white/70 text-sm">نقطة</span></div>
                <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-yellow-300" /><span className="font-bold">المستوى {student.level}</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{student.points}</p>
            <p className="text-xs text-gray-500">إجمالي النقاط</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{student.currentStreak}</p>
            <p className="text-xs text-gray-500">سلسلة الأيام</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{student.longestStreak}</p>
            <p className="text-xs text-gray-500">أطول سلسلة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-6 w-6 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{badges.length}</p>
            <p className="text-xs text-gray-500">أوسمة مكتسبة</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader><CardTitle>تقدم المستوى</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold">المستوى {student.level}</span>
            <span className="text-sm text-gray-500">{student.points} / {nextThreshold} نقطة</span>
          </div>
          <Progress value={Math.min(levelProgress, 100)} className="h-4" />
          <p className="text-xs text-gray-400 mt-2">
            تحتاج {nextThreshold - student.points} نقطة للمستوى التالي
          </p>
        </CardContent>
      </Card>

      {/* Badges */}
      {badges.length > 0 && (
        <Card>
          <CardHeader><CardTitle>الأوسمة المكتسبة ✨</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map(eb => (
                <div key={eb.id} className="text-center p-4 rounded-2xl bg-gradient-to-b from-yellow-50 to-white border border-yellow-100">
                  <span className="text-4xl block mb-2">{eb.badge.icon}</span>
                  <p className="font-bold text-sm">{eb.badge.nameAr}</p>
                  <p className="text-xs text-gray-500 mt-1">{eb.badge.descriptionAr}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(eb.earnedAt)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-gray-400">
            آخر نشاط: {student.lastActivityAt ? formatDate(student.lastActivityAt) : 'لم يتم التسجيل بعد'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
