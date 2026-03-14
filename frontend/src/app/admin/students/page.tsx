'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Search, Eye, Star, Flame } from 'lucide-react';
import Link from 'next/link';

interface Student {
  id: string;
  userId: string;
  gradeLevel: string;
  className: string;
  points: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  user?: { nameAr: string; avatarUrl?: string };
}

function getLevelColor(level: number): 'default' | 'secondary' | 'warning' | 'purple' | 'destructive' {
  if (level >= 10) return 'purple';
  if (level >= 7) return 'secondary';
  if (level >= 4) return 'warning';
  return 'default';
}

function getPointsBadgeVariant(points: number): 'default' | 'secondary' | 'warning' | 'purple' {
  if (points >= 1000) return 'purple';
  if (points >= 500) return 'secondary';
  if (points >= 100) return 'warning';
  return 'default';
}

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 7 }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 bg-gray-200 rounded-lg animate-pulse" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/students');
        setStudents(response.data.data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    if (!searchQuery.trim()) return true;
    const name = student.user?.nameAr || '';
    return name.includes(searchQuery.trim());
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-2xl">
          <Users className="h-7 w-7 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ادارة الطلاب</h1>
          <p className="text-sm text-gray-500">
            عرض وادارة جميع الطلاب المسجلين في المنصة
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">اجمالي الطلاب</p>
              <p className="text-xl font-bold text-gray-800">
                {loading ? '...' : students.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">متوسط النقاط</p>
              <p className="text-xl font-bold text-gray-800">
                {loading
                  ? '...'
                  : students.length > 0
                    ? Math.round(students.reduce((sum, s) => sum + s.points, 0) / students.length)
                    : 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">اعلى سلسلة</p>
              <p className="text-xl font-bold text-gray-800">
                {loading
                  ? '...'
                  : students.length > 0
                    ? Math.max(...students.map((s) => s.longestStreak))
                    : 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              قائمة الطلاب
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ابحث باسم الطالب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 h-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>المرحلة الدراسية</TableHead>
                <TableHead>الفصل</TableHead>
                <TableHead>النقاط</TableHead>
                <TableHead>المستوى</TableHead>
                <TableHead>السلسلة</TableHead>
                <TableHead>الاجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Users className="h-10 w-10" />
                      <p className="text-lg font-medium">
                        {searchQuery ? 'لا توجد نتائج مطابقة' : 'لا يوجد طلاب بعد'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-blue-50/50">
                    <TableCell className="font-medium text-gray-800">
                      <div className="flex items-center gap-3">
                        {student.user?.avatarUrl ? (
                          <img
                            src={student.user.avatarUrl}
                            alt={student.user?.nameAr || ''}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">
                              {(student.user?.nameAr || '?')[0]}
                            </span>
                          </div>
                        )}
                        {student.user?.nameAr || 'غير معروف'}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{student.gradeLevel}</TableCell>
                    <TableCell className="text-gray-600">{student.className}</TableCell>
                    <TableCell>
                      <Badge variant={getPointsBadgeVariant(student.points)}>
                        <Star className="h-3 w-3 ml-1" />
                        {student.points}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getLevelColor(student.level)}>
                        المستوى {student.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span>{student.currentStreak} يوم</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/students/${student.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          عرض
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Results Count */}
          {!loading && filteredStudents.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              عرض {filteredStudents.length} من {students.length} طالب
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
