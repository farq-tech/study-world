'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Homework } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRelativeDate } from '@/lib/utils';
import { HOMEWORK_STATUS_AR, HOMEWORK_STATUS_COLORS } from '@/lib/constants';
import { BookOpen, ChevronLeft } from 'lucide-react';

export default function HomeworkPage() {
  const { user } = useAuth();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHomework() {
      try {
        const res = await api.get(`/homework/student/${user?.studentId}`);
        setHomework(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    if (user?.studentId) fetchHomework();
  }, [user]);

  const pending = homework.filter((h) => h.status === 'PENDING');
  const submitted = homework.filter((h) => h.status === 'SUBMITTED');
  const graded = homework.filter((h) => h.status === 'GRADED');

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>;
  }

  const HomeworkList = ({ items }: { items: Homework[] }) => (
    items.length === 0 ? (
      <p className="text-gray-400 text-center py-8">لا توجد واجبات</p>
    ) : (
      <div className="space-y-3">
        {items.map((hw) => (
          <Link key={hw.id} href={`/student/homework/${hw.id}`}>
            <Card className="card-hover cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{hw.subject?.icon || '📚'}</span>
                  <div className="flex-1">
                    <h3 className="font-bold">{hw.title}</h3>
                    <p className="text-sm text-gray-500">
                      {hw.subject?.nameAr} • {getRelativeDate(hw.dueDate)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={HOMEWORK_STATUS_COLORS[hw.status]}>
                      {HOMEWORK_STATUS_AR[hw.status]}
                    </Badge>
                    {hw.grade !== null && hw.grade !== undefined && (
                      <span className="text-sm font-bold text-green-600">{hw.grade}%</span>
                    )}
                  </div>
                  <ChevronLeft className="h-5 w-5 text-gray-300" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-7 w-7 text-green-500" />
        <h1 className="text-2xl font-bold">الواجبات</h1>
        <Badge>{homework.length}</Badge>
      </div>

      <Tabs defaultValue="pending" dir="rtl">
        <TabsList>
          <TabsTrigger value="pending">معلّق ({pending.length})</TabsTrigger>
          <TabsTrigger value="submitted">مُسلّم ({submitted.length})</TabsTrigger>
          <TabsTrigger value="graded">مُقيّم ({graded.length})</TabsTrigger>
          <TabsTrigger value="all">الكل ({homework.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending"><HomeworkList items={pending} /></TabsContent>
        <TabsContent value="submitted"><HomeworkList items={submitted} /></TabsContent>
        <TabsContent value="graded"><HomeworkList items={graded} /></TabsContent>
        <TabsContent value="all"><HomeworkList items={homework} /></TabsContent>
      </Tabs>
    </div>
  );
}
