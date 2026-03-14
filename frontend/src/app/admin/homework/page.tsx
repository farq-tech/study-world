'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList, Plus, Pencil, Trash2, Check, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { HOMEWORK_STATUS_AR, HOMEWORK_STATUS_COLORS } from '@/lib/constants';

interface Homework {
  id: string;
  studentId: string;
  subjectId: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED';
  submittedAt?: string;
  grade?: number;
  feedback?: string;
  subject: { nameAr: string; icon?: string; color?: string };
  student?: { user?: { nameAr: string } };
}

interface Student {
  id: string;
  user?: { nameAr: string };
}

interface Subject {
  id: string;
  nameAr: string;
  icon?: string;
  color?: string;
}

interface HomeworkFormData {
  studentId: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string;
}

interface GradeFormData {
  grade: number | '';
  feedback: string;
}

const emptyHomeworkForm: HomeworkFormData = {
  studentId: '',
  subjectId: '',
  title: '',
  description: '',
  dueDate: '',
};

const emptyGradeForm: GradeFormData = {
  grade: '',
  feedback: '',
};

type StatusFilter = 'ALL' | 'PENDING' | 'SUBMITTED' | 'GRADED';

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'الكل' },
  { key: 'PENDING', label: 'معلّق' },
  { key: 'SUBMITTED', label: 'مُسلّم' },
  { key: 'GRADED', label: 'مُقيّم' },
];

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

export default function AdminHomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  // Create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<HomeworkFormData>(emptyHomeworkForm);
  const [saving, setSaving] = useState(false);

  // Grade dialog
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [gradingHomework, setGradingHomework] = useState<Homework | null>(null);
  const [gradeFormData, setGradeFormData] = useState<GradeFormData>(emptyGradeForm);
  const [grading, setGrading] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingHomework, setDeletingHomework] = useState<Homework | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHomework = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/homework/all');
      setHomework(response.data.data || []);
    } catch (error) {
      console.error('Error fetching homework:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentsAndSubjects = useCallback(async () => {
    try {
      const [studentsRes, subjectsRes] = await Promise.all([
        api.get('/students'),
        api.get('/subjects'),
      ]);
      setStudents(studentsRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching students/subjects:', error);
    }
  }, []);

  useEffect(() => {
    fetchHomework();
    fetchStudentsAndSubjects();
  }, [fetchHomework, fetchStudentsAndSubjects]);

  // Filtered homework
  const filteredHomework = homework.filter((hw) => {
    const matchesStatus = statusFilter === 'ALL' || hw.status === statusFilter;
    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim();
    const studentName = hw.student?.user?.nameAr || '';
    const subjectName = hw.subject?.nameAr || '';
    return (
      hw.title.includes(query) ||
      studentName.includes(query) ||
      subjectName.includes(query)
    );
  });

  // Stats
  const pendingCount = homework.filter((hw) => hw.status === 'PENDING').length;
  const submittedCount = homework.filter((hw) => hw.status === 'SUBMITTED').length;
  const gradedCount = homework.filter((hw) => hw.status === 'GRADED').length;

  // --- Create handlers ---
  const openCreateDialog = () => {
    setFormData(emptyHomeworkForm);
    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.subjectId || !formData.title.trim() || !formData.dueDate) return;

    try {
      setSaving(true);
      await api.post('/homework', {
        studentId: formData.studentId,
        subjectId: formData.subjectId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        dueDate: formData.dueDate,
      });
      setCreateDialogOpen(false);
      setFormData(emptyHomeworkForm);
      await fetchHomework();
    } catch (error) {
      console.error('Error creating homework:', error);
    } finally {
      setSaving(false);
    }
  };

  // --- Grade handlers ---
  const openGradeDialog = (hw: Homework) => {
    setGradingHomework(hw);
    setGradeFormData({
      grade: hw.grade ?? '',
      feedback: hw.feedback || '',
    });
    setGradeDialogOpen(true);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingHomework || gradeFormData.grade === '') return;

    try {
      setGrading(true);
      await api.put(`/homework/${gradingHomework.id}`, {
        grade: Number(gradeFormData.grade),
        feedback: gradeFormData.feedback.trim() || undefined,
        status: 'GRADED',
      });
      setGradeDialogOpen(false);
      setGradingHomework(null);
      setGradeFormData(emptyGradeForm);
      await fetchHomework();
    } catch (error) {
      console.error('Error grading homework:', error);
    } finally {
      setGrading(false);
    }
  };

  // --- Delete handlers ---
  const openDeleteDialog = (hw: Homework) => {
    setDeletingHomework(hw);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingHomework) return;

    try {
      setDeleting(true);
      await api.delete(`/homework/${deletingHomework.id}`);
      setDeleteDialogOpen(false);
      setDeletingHomework(null);
      await fetchHomework();
    } catch (error) {
      console.error('Error deleting homework:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-2xl">
            <ClipboardList className="h-7 w-7 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ادارة الواجبات</h1>
            <p className="text-sm text-gray-500">
              اضافة ومتابعة وتقييم الواجبات المدرسية
            </p>
          </div>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-5 w-5" />
          اضافة واجب
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <ClipboardList className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">اجمالي الواجبات</p>
              <p className="text-xl font-bold text-gray-800">
                {loading ? '...' : homework.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <ClipboardList className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">معلّق</p>
              <p className="text-xl font-bold text-gray-800">
                {loading ? '...' : pendingCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">مُسلّم</p>
              <p className="text-xl font-bold text-gray-800">
                {loading ? '...' : submittedCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">مُقيّم</p>
              <p className="text-xl font-bold text-gray-800">
                {loading ? '...' : gradedCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Homework Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-purple-500" />
                قائمة الواجبات
              </CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث بالعنوان أو اسم الطالب أو المادة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 h-10"
                />
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_TABS.map((tab) => (
                <Button
                  key={tab.key}
                  variant={statusFilter === tab.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(tab.key)}
                  className="gap-1"
                >
                  {tab.label}
                  {tab.key !== 'ALL' && (
                    <span className="text-xs opacity-70">
                      ({tab.key === 'PENDING' ? pendingCount : tab.key === 'SUBMITTED' ? submittedCount : gradedCount})
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العنوان</TableHead>
                <TableHead>الطالب</TableHead>
                <TableHead>المادة</TableHead>
                <TableHead>تاريخ التسليم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الدرجة</TableHead>
                <TableHead>الاجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredHomework.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <ClipboardList className="h-10 w-10" />
                      <p className="text-lg font-medium">
                        {searchQuery || statusFilter !== 'ALL'
                          ? 'لا توجد نتائج مطابقة'
                          : 'لا توجد واجبات بعد'}
                      </p>
                      {!searchQuery && statusFilter === 'ALL' && (
                        <p className="text-sm">
                          اضغط على &quot;اضافة واجب&quot; لانشاء واجب جديد
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredHomework.map((hw) => (
                  <TableRow key={hw.id} className="hover:bg-purple-50/50">
                    <TableCell className="font-medium text-gray-800">
                      {hw.title}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {hw.student?.user?.nameAr || 'غير معروف'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {hw.subject?.icon && (
                          <span className="text-lg">{hw.subject.icon}</span>
                        )}
                        <span className="text-gray-600">{hw.subject?.nameAr || 'غير معروف'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(hw.dueDate)}
                    </TableCell>
                    <TableCell>
                      <Badge className={HOMEWORK_STATUS_COLORS[hw.status] || ''}>
                        {HOMEWORK_STATUS_AR[hw.status] || hw.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {hw.grade !== undefined && hw.grade !== null ? (
                        <span className="font-bold">{hw.grade}%</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openGradeDialog(hw)}
                          className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="تقييم"
                        >
                          <Pencil className="h-4 w-4" />
                          تقييم
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(hw)}
                          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Results Count */}
          {!loading && filteredHomework.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              عرض {filteredHomework.length} من {homework.length} واجب
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Homework Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>اضافة واجب جديد</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {/* Student Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                الطالب <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData((prev) => ({ ...prev, studentId: e.target.value }))}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">اختر الطالب...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.user?.nameAr || 'غير معروف'}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                المادة الدراسية <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData((prev) => ({ ...prev, subjectId: e.target.value }))}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">اختر المادة...</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.icon ? `${subject.icon} ` : ''}{subject.nameAr}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                عنوان الواجب <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="مثال: حل تمارين الوحدة الثالثة"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                الوصف
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="وصف تفصيلي للواجب (اختياري)..."
                rows={3}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                تاريخ التسليم <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={saving}
              >
                الغاء
              </Button>
              <Button
                type="submit"
                disabled={saving || !formData.studentId || !formData.subjectId || !formData.title.trim() || !formData.dueDate}
              >
                {saving ? 'جارِ الحفظ...' : 'اضافة الواجب'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grade Homework Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تقييم الواجب</DialogTitle>
          </DialogHeader>
          {gradingHomework && (
            <form onSubmit={handleGradeSubmit} className="space-y-4">
              {/* Homework Info */}
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <p className="text-sm font-medium text-gray-800">{gradingHomework.title}</p>
                <p className="text-xs text-gray-500">
                  الطالب: {gradingHomework.student?.user?.nameAr || 'غير معروف'}
                </p>
                <p className="text-xs text-gray-500">
                  المادة: {gradingHomework.subject?.nameAr || 'غير معروف'}
                </p>
                <p className="text-xs text-gray-500">
                  تاريخ التسليم: {formatDate(gradingHomework.dueDate)}
                </p>
              </div>

              {/* Grade */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  الدرجة (من 100) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={gradeFormData.grade}
                  onChange={(e) =>
                    setGradeFormData((prev) => ({
                      ...prev,
                      grade: e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                  placeholder="مثال: 85"
                  required
                />
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  ملاحظات
                </label>
                <textarea
                  value={gradeFormData.feedback}
                  onChange={(e) =>
                    setGradeFormData((prev) => ({ ...prev, feedback: e.target.value }))
                  }
                  placeholder="ملاحظات للطالب (اختياري)..."
                  rows={3}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGradeDialogOpen(false)}
                  disabled={grading}
                >
                  الغاء
                </Button>
                <Button
                  type="submit"
                  disabled={grading || gradeFormData.grade === ''}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  {grading ? 'جارِ الحفظ...' : 'حفظ التقييم'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">تاكيد الحذف</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              هل انت متاكد من حذف الواجب{' '}
              <span className="font-bold text-gray-900">&quot;{deletingHomework?.title}&quot;</span>؟
            </p>
            <p className="text-sm text-red-500 mt-2">
              هذا الاجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات المرتبطة بهذا الواجب.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              الغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'جارِ الحذف...' : 'تاكيد الحذف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
