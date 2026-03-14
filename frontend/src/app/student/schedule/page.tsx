'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Schedule } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/utils';
import { DAYS_AR, SCHOOL_DAYS } from '@/lib/constants';
import { Calendar, Clock } from 'lucide-react';

export default function SchedulePage() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().getDay();
  const todayKey = SCHOOL_DAYS[today] || SCHOOL_DAYS[0];

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const res = await api.get(`/schedules/student/${user?.studentId}`);
        setSchedule(res.data.data);
      } catch (err) {
        console.error('Failed to fetch schedule:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user?.studentId) fetchSchedule();
  }, [user]);

  const groupedByDay = SCHOOL_DAYS.reduce((acc, day) => {
    acc[day] = schedule.filter((s) => s.dayOfWeek === day).sort((a, b) => a.periodNumber - b.periodNumber);
    return acc;
  }, {} as Record<string, Schedule[]>);

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-7 w-7 text-blue-500" />
        <h1 className="text-2xl font-bold">الجدول الدراسي</h1>
      </div>

      <Tabs defaultValue={todayKey} dir="rtl">
        <TabsList className="w-full flex-wrap">
          {SCHOOL_DAYS.map((day) => (
            <TabsTrigger key={day} value={day} className="flex-1">
              {DAYS_AR[day]}
              {day === todayKey && <span className="mr-1 text-xs">📍</span>}
            </TabsTrigger>
          ))}
        </TabsList>

        {SCHOOL_DAYS.map((day) => (
          <TabsContent key={day} value={day}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{DAYS_AR[day]}</CardTitle>
              </CardHeader>
              <CardContent>
                {groupedByDay[day].length === 0 ? (
                  <p className="text-gray-400 text-center py-8">لا توجد حصص في هذا اليوم</p>
                ) : (
                  <div className="space-y-3">
                    {groupedByDay[day].map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all"
                        style={{ borderRightColor: entry.subject.color || '#3b82f6', borderRightWidth: '4px' }}
                      >
                        <div className="text-center min-w-[60px]">
                          <div className="bg-blue-50 rounded-xl px-3 py-2">
                            <p className="text-xs text-gray-500">الحصة</p>
                            <p className="text-xl font-bold text-blue-600">{entry.periodNumber}</p>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{entry.subject.icon}</span>
                            <span className="font-bold text-lg">{entry.subject.nameAr}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {entry.teacher && <span>👨‍🏫 {entry.teacher.nameAr}</span>}
                            {entry.room && <span>🏫 {entry.room}</span>}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(entry.startTime)}</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            إلى {formatTime(entry.endTime)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
