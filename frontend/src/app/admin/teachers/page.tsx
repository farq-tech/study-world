'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GraduationCap, Plus, Pencil, Trash2, Phone, Mail, BookOpen, Search } from 'lucide-react';

interface Subject {
  id: string;
  nameAr: string;
  nameEn?: string;
  color?: string;
}

interface Teacher {
  id: string;
  nameAr: string;
  nameEn?: string;
  phone?: string;
  email?: string;
  note?: string;
  subjects?: { subject: Subject }[];
}

interface TeacherFormData {
  nameAr: string;
  nameEn: string;
  phone: string;
  email: string;
  note: string;
}

const emptyForm: TeacherFormData = {
  nameAr: '',
  nameEn: '',
  phone: '',
  email: '',
  note: '',
};

const SUBJECT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
];

function getSubjectColor(subject: Subject, index: number): string {
  return subject.color || SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 bg-gray-200 rounded-lg animate-pulse" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Teacher form dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<TeacherFormData>(emptyForm);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Subject assignment dialog
  const [subjectsDialogOpen, setSubjectsDialogOpen] = useState(false);
  const [assigningTeacher, setAssigningTeacher] = useState<Teacher | null>(null);
  const [assignedSubjectIds, setAssignedSubjectIds] = useState<string[]>([]);
  const [savingSubjects, setSavingSubjects] = useState(false);

  const fetchTeachers = useCallback(async () => {
    try {
      const response = await api.get('/teachers');
      setTeachers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchTeachers(), fetchSubjects()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchTeachers, fetchSubjects]);

  // --- Teacher Form ---

  const openCreateDialog = () => {
    setEditingTeacher(null);
    setFormData(emptyForm);
    setSelectedSubjectIds([]);
    setDialogOpen(true);
  };

  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      nameAr: teacher.nameAr,
      nameEn: teacher.nameEn || '',
      phone: teacher.phone || '',
      email: teacher.email || '',
      note: teacher.note || '',
    });
    setSelectedSubjectIds(
      teacher.subjects?.map((ts) => ts.subject.id) || []
    );
    setDialogOpen(true);
  };

  const handleFieldChange = (field: keyof TeacherFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSubjectSelection = (subjectId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim()) return;

    try {
      setSaving(true);
      const payload = {
        nameAr: formData.nameAr.trim(),
        nameEn: formData.nameEn.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        note: formData.note.trim() || undefined,
      };

      let teacherId: string;

      if (editingTeacher) {
        await api.put(`/teachers/${editingTeacher.id}`, payload);
        teacherId = editingTeacher.id;

        // Sync subjects: remove old ones, add new ones
        const currentSubjectIds = editingTeacher.subjects?.map((ts) => ts.subject.id) || [];
        const toRemove = currentSubjectIds.filter((id) => !selectedSubjectIds.includes(id));
        const toAdd = selectedSubjectIds.filter((id) => !currentSubjectIds.includes(id));

        await Promise.all([
          ...toRemove.map((subjectId) =>
            api.delete(`/teachers/${teacherId}/subjects/${subjectId}`)
          ),
          ...toAdd.map((subjectId) =>
            api.post(`/teachers/${teacherId}/subjects`, { subjectId })
          ),
        ]);
      } else {
        const response = await api.post('/teachers', payload);
        teacherId = response.data.data?.id || response.data.id;

        // Assign selected subjects to new teacher
        if (selectedSubjectIds.length > 0 && teacherId) {
          await Promise.all(
            selectedSubjectIds.map((subjectId) =>
              api.post(`/teachers/${teacherId}/subjects`, { subjectId })
            )
          );
        }
      }

      setDialogOpen(false);
      setEditingTeacher(null);
      setFormData(emptyForm);
      setSelectedSubjectIds([]);
      await fetchTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
    } finally {
      setSaving(false);
    }
  };

  // --- Delete ---

  const openDeleteDialog = (teacher: Teacher) => {
    setDeletingTeacher(teacher);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingTeacher) return;

    try {
      setDeleting(true);
      await api.delete(`/teachers/${deletingTeacher.id}`);
      setDeleteDialogOpen(false);
      setDeletingTeacher(null);
      await fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
    } finally {
      setDeleting(false);
    }
  };

  // --- Subject Assignment Dialog ---

  const openSubjectsDialog = (teacher: Teacher) => {
    setAssigningTeacher(teacher);
    setAssignedSubjectIds(teacher.subjects?.map((ts) => ts.subject.id) || []);
    setSubjectsDialogOpen(true);
  };

  const toggleAssignedSubject = (subjectId: string) => {
    setAssignedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSaveSubjects = async () => {
    if (!assigningTeacher) return;

    try {
      setSavingSubjects(true);
      const currentSubjectIds = assigningTeacher.subjects?.map((ts) => ts.subject.id) || [];
      const toRemove = currentSubjectIds.filter((id) => !assignedSubjectIds.includes(id));
      const toAdd = assignedSubjectIds.filter((id) => !currentSubjectIds.includes(id));

      await Promise.all([
        ...toRemove.map((subjectId) =>
          api.delete(`/teachers/${assigningTeacher.id}/subjects/${subjectId}`)
        ),
        ...toAdd.map((subjectId) =>
          api.post(`/teachers/${assigningTeacher.id}/subjects`, { subjectId })
        ),
      ]);

      setSubjectsDialogOpen(false);
      setAssigningTeacher(null);
      setAssignedSubjectIds([]);
      await fetchTeachers();
    } catch (error) {
      console.error('Error saving subject assignments:', error);
    } finally {
      setSavingSubjects(false);
    }
  };

  // --- Filtering ---

  const filteredTeachers = teachers.filter((teacher) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    return (
      teacher.nameAr.includes(query) ||
      (teacher.nameEn?.toLowerCase().includes(query)) ||
      (teacher.phone?.includes(query)) ||
      (teacher.email?.toLowerCase().includes(query))
    );
  });

  const teachersWithSubjects = teachers.filter(
    (t) => t.subjects && t.subjects.length > 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 rounded-2xl">
            <GraduationCap className="h-7 w-7 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ادارة المعلمين</h1>
            <p className="text-sm text-gray-500">
              اضافة وتعديل وحذف المعلمين واسناد المواد الدراسية لهم
            </p>
          </div>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-5 w-5" />
          اضافة معلم
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">اجمالي المعلمين</p>
              <p className="text-xl font-bold text-gray-800">
                {loading ? '...' : teachers.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">معلمون لديهم مواد</p>
              <p className="text-xl font-bold text-gray-800">
                {loading ? '...' : teachersWithSubjects}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <GraduationCap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">بدون مواد</p>
              <p className="text-xl font-bold text-gray-800">
                {loading ? '...' : teachers.length - teachersWithSubjects}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-emerald-500" />
              قائمة المعلمين
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ابحث بالاسم، الهاتف، او البريد..."
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
                <TableHead>الهاتف</TableHead>
                <TableHead>البريد الالكتروني</TableHead>
                <TableHead>المواد الدراسية</TableHead>
                <TableHead>الاجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <GraduationCap className="h-10 w-10" />
                      <p className="text-lg font-medium">
                        {searchQuery ? 'لا توجد نتائج مطابقة' : 'لا يوجد معلمون بعد'}
                      </p>
                      {!searchQuery && (
                        <p className="text-sm">
                          اضغط على &quot;اضافة معلم&quot; لاضافة معلم جديد
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id} className="hover:bg-emerald-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-emerald-600">
                            {teacher.nameAr[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{teacher.nameAr}</p>
                          {teacher.nameEn && (
                            <p className="text-xs text-gray-400" dir="ltr">
                              {teacher.nameEn}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {teacher.phone ? (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          <span dir="ltr">{teacher.phone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {teacher.email ? (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          <span dir="ltr" className="text-sm">{teacher.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {teacher.subjects && teacher.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {teacher.subjects.map((ts, idx) => (
                            <Badge
                              key={ts.subject.id}
                              className="text-white text-[11px] px-2 py-0.5"
                              style={{
                                backgroundColor: getSubjectColor(ts.subject, idx),
                                borderColor: getSubjectColor(ts.subject, idx),
                              }}
                            >
                              {ts.subject.nameAr}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">لا توجد مواد</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openSubjectsDialog(teacher)}
                          className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="اسناد المواد"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(teacher)}
                          className="gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          title="تعديل"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(teacher)}
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
          {!loading && filteredTeachers.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              عرض {filteredTeachers.length} من {teachers.length} معلم
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Teacher Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTeacher ? 'تعديل بيانات المعلم' : 'اضافة معلم جديد'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Arabic Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                الاسم بالعربية <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.nameAr}
                onChange={(e) => handleFieldChange('nameAr', e.target.value)}
                placeholder="مثال: احمد محمد"
                required
              />
            </div>

            {/* English Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                الاسم بالانجليزية
              </label>
              <Input
                value={formData.nameEn}
                onChange={(e) => handleFieldChange('nameEn', e.target.value)}
                placeholder="Example: Ahmed Mohammed"
                dir="ltr"
              />
            </div>

            {/* Phone & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  رقم الهاتف
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                    className="pr-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  البريد الالكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="email@example.com"
                    type="email"
                    dir="ltr"
                    className="pr-10"
                  />
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                ملاحظات
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => handleFieldChange('note', e.target.value)}
                placeholder="اضف ملاحظات حول المعلم (اختياري)"
                className="flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Subject Assignment */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                المواد الدراسية
              </label>
              {subjects.length === 0 ? (
                <p className="text-sm text-gray-400 p-3 bg-gray-50 rounded-xl">
                  لا توجد مواد دراسية متاحة
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl max-h-48 overflow-y-auto">
                  {subjects.map((subject, idx) => {
                    const isSelected = selectedSubjectIds.includes(subject.id);
                    const color = getSubjectColor(subject, idx);
                    return (
                      <label
                        key={subject.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-white shadow-sm border border-gray-200'
                            : 'hover:bg-white/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSubjectSelection(subject.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm text-gray-700 truncate">
                          {subject.nameAr}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                الغاء
              </Button>
              <Button type="submit" disabled={saving || !formData.nameAr.trim()}>
                {saving
                  ? 'جارِ الحفظ...'
                  : editingTeacher
                    ? 'حفظ التعديلات'
                    : 'اضافة المعلم'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Subject Assignment Dialog (standalone) */}
      <Dialog open={subjectsDialogOpen} onOpenChange={setSubjectsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              اسناد المواد - {assigningTeacher?.nameAr}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              اختر المواد الدراسية التي يدرسها هذا المعلم
            </p>
            {subjects.length === 0 ? (
              <p className="text-sm text-gray-400 p-4 bg-gray-50 rounded-xl text-center">
                لا توجد مواد دراسية متاحة
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto p-1">
                {subjects.map((subject, idx) => {
                  const isAssigned = assignedSubjectIds.includes(subject.id);
                  const color = getSubjectColor(subject, idx);
                  return (
                    <label
                      key={subject.id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        isAssigned
                          ? 'bg-emerald-50 border border-emerald-200 shadow-sm'
                          : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        onChange={() => toggleAssignedSubject(subject.id)}
                        className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div
                        className="h-4 w-4 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          {subject.nameAr}
                        </p>
                        {subject.nameEn && (
                          <p className="text-xs text-gray-400" dir="ltr">
                            {subject.nameEn}
                          </p>
                        )}
                      </div>
                      {isAssigned && (
                        <Badge variant="secondary" className="text-[10px]">
                          مسند
                        </Badge>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSubjectsDialogOpen(false)}
              disabled={savingSubjects}
            >
              الغاء
            </Button>
            <Button
              type="button"
              onClick={handleSaveSubjects}
              disabled={savingSubjects}
            >
              {savingSubjects ? 'جارِ الحفظ...' : 'حفظ التعديلات'}
            </Button>
          </DialogFooter>
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
              هل انت متاكد من حذف المعلم{' '}
              <span className="font-bold text-gray-900">
                &quot;{deletingTeacher?.nameAr}&quot;
              </span>
              ؟
            </p>
            <p className="text-sm text-red-500 mt-2">
              هذا الاجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات المرتبطة بهذا المعلم.
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
