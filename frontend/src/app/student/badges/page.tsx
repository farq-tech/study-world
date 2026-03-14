'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Badge as BadgeType, StudentBadge } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate } from '@/lib/utils';
import { Trophy, Lock } from 'lucide-react';

export default function BadgesPage() {
  const { user } = useAuth();
  const [allBadges, setAllBadges] = useState<BadgeType[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<StudentBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const [allRes, earnedRes] = await Promise.all([
          api.get('/badges'),
          api.get(`/badges/student/${user?.studentId}`),
        ]);
        setAllBadges(allRes.data.data);
        setEarnedBadges(earnedRes.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    if (user?.studentId) fetch();
  }, [user]);

  if (loading) return <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>;

  const earnedIds = new Set(earnedBadges.map((eb) => eb.badge.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-7 w-7 text-yellow-500" />
        <h1 className="text-2xl font-bold">أوسمتي</h1>
        <Badge variant="secondary">{earnedBadges.length}/{allBadges.length}</Badge>
      </div>

      {/* Earned badges */}
      <Card>
        <CardHeader><CardTitle>الأوسمة المكتسبة ✨</CardTitle></CardHeader>
        <CardContent>
          {earnedBadges.length === 0 ? (
            <p className="text-gray-400 text-center py-6">لم تحصل على أوسمة بعد. استمر في التعلم! 💪</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {earnedBadges.map((eb) => (
                <div key={eb.id} className="text-center p-4 rounded-2xl bg-gradient-to-b from-yellow-50 to-white border border-yellow-100 animate-celebration">
                  <span className="text-5xl block mb-2">{eb.badge.icon}</span>
                  <p className="font-bold text-sm">{eb.badge.nameAr}</p>
                  <p className="text-xs text-gray-500 mt-1">{eb.badge.descriptionAr}</p>
                  <Badge variant="secondary" className="mt-2 text-xs">+{eb.badge.pointsValue} نقطة</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Locked badges */}
      <Card>
        <CardHeader><CardTitle>أوسمة قادمة 🔒</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allBadges.filter((b) => !earnedIds.has(b.id)).map((badge) => (
              <div key={badge.id} className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100 opacity-60">
                <div className="relative">
                  <span className="text-5xl block mb-2 grayscale">{badge.icon}</span>
                  <Lock className="h-5 w-5 text-gray-400 absolute top-0 left-0" />
                </div>
                <p className="font-bold text-sm text-gray-500">{badge.nameAr}</p>
                <p className="text-xs text-gray-400 mt-1">{badge.descriptionAr}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
