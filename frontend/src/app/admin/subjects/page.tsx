'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, Pencil, Trash2, Calculator } from 'lucide-react';

interface Subject {
  id: string;
  nameAr: string;
  nameEn?: string;
  slug: string;
  icon?: string;
  color?: string;
  isMathFocus: boolean;
  sortOrder: number;
}

interface SubjectFormData {
  nameAr: string;
  nameEn: string;
  slug: string;
  icon: string;
  color: string;
  isMathFocus: boolean;
  sortOrder: number;
}

const emptyForm: SubjectFormData = {
  nameAr: '',
  nameEn: '',
  slug: '',
  icon: '',
  color: '#3b82f6',
  isMathFocus: false,
  sortOrder: 0,
};

function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 bg-gray-200 rounded-2xl" />
          <div className="h-5 w-24 bg-gray-200 rounded-lg" />
          <div className="h-4 w-20 bg-gray-200 rounded-lg" />
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<SubjectFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/subjects');
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const openCreateDialog = () => {
    setEditingSubject(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      nameAr: subject.nameAr,
      nameEn: subject.nameEn || '',
      slug: subject.slug,
      icon: subject.icon || '',
      color: subject.color || '#3b82f6',
      isMathFocus: subject.isMathFocus,
      sortOrder: subject.sortOrder,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (subject: Subject) => {
    setDeletingSubject(subject);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim() || !formData.slug.trim()) return;

    try {
      setSaving(true);
      const payload = {
        nameAr: formData.nameAr.trim(),
        nameEn: formData.nameEn.trim() || undefined,
        slug: formData.slug.trim(),
        icon: formData.icon.trim() || undefined,
        color: formData.color.trim() || undefined,
        isMathFocus: formData.isMathFocus,
        sortOrder: formData.sortOrder,
      };

      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, payload);
      } else {
        await api.post('/subjects', payload);
      }

      setDialogOpen(false);
      setEditingSubject(null);
      setFormData(emptyForm);
      await fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSubject) return;

    try {
      setDeleting(true);
      await api.delete(`/subjects/${deletingSubject.id}`);
      setDeleteDialogOpen(false);
      setDeletingSubject(null);
      await fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleFieldChange = (field: keyof SubjectFormData, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]/g, '');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <BookOpen className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ادارة المواد الدراسية</h1>
            <p className="text-sm text-gray-500">
              اضافة وتعديل وحذف المواد الدراسية في المنصة
            </p>
          </div>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-5 w-5" />
          اضافة مادة
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">اجمالي المواد</p>
              <p className="text-xl font-bold text-gray-800">
                {loading ? '...' : subjects.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <Calculator className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">مواد رياضيات</p>
              <p className="text-xl font-bold text-gray-800">
                {loading ? '...' : subjects.filter((s) => s.isMathFocus).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">مواد عامة</p>
              <p className="text-xl font-bold text-gray-800">
                {loading ? '...' : subjects.filter((s) => !s.isMathFocus).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <BookOpen className="h-12 w-12" />
              <p className="text-lg font-medium">لا توجد مواد دراسية بعد</p>
              <p className="text-sm">اضغط على &quot;اضافة مادة&quot; لانشاء مادة جديدة</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subjects
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((subject) => (
              <Card
                key={subject.id}
                className="group hover:shadow-md transition-all overflow-hidden"
              >
                {/* Color bar at top */}
                <div
                  className="h-2 w-full"
                  style={{ backgroundColor: subject.color || '#3b82f6' }}
                />
                <CardContent className="p-5">
                  <div className="flex flex-col items-center text-center gap-3">
                    {/* Subject Icon */}
                    <div
                      className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl"
                      style={{
                        backgroundColor: `${subject.color || '#3b82f6'}20`,
                      }}
                    >
                      {subject.icon || '📚'}
                    </div>

                    {/* Subject Name (Arabic) */}
                    <h3 className="text-lg font-bold text-gray-800">{subject.nameAr}</h3>

                    {/* Subject Name (English) */}
                    {subject.nameEn && (
                      <p className="text-sm text-gray-500 -mt-2">{subject.nameEn}</p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {subject.isMathFocus && (
                        <Badge variant="secondary" className="gap-1">
                          <Calculator className="h-3 w-3" />
                          رياضيات
                        </Badge>
                      )}
                      <Badge variant="outline">
                        الترتيب: {subject.sortOrder}
                      </Badge>
                    </div>

                    {/* Color Preview */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div
                        className="h-4 w-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: subject.color || '#3b82f6' }}
                      />
                      <span dir="ltr">{subject.color || '#3b82f6'}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(subject)}
                        className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                        تعديل
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(subject)}
                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? 'تعديل المادة الدراسية' : 'اضافة مادة دراسية جديدة'}
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
                onChange={(e) => {
                  handleFieldChange('nameAr', e.target.value);
                  if (!editingSubject) {
                    handleFieldChange('slug', generateSlug(e.target.value));
                  }
                }}
                placeholder="مثال: الرياضيات"
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
                onChange={(e) => {
                  handleFieldChange('nameEn', e.target.value);
                  if (!editingSubject && !formData.nameAr) {
                    handleFieldChange('slug', generateSlug(e.target.value));
                  }
                }}
                placeholder="مثال: Mathematics"
                dir="ltr"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                المعرف (Slug) <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => handleFieldChange('slug', e.target.value)}
                placeholder="مثال: math"
                dir="ltr"
                required
              />
              <p className="text-xs text-gray-400">يستخدم في الروابط، يتم توليده تلقائيا</p>
            </div>

            {/* Icon & Color Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Icon */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  الايقونة (ايموجي)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    value={formData.icon}
                    onChange={(e) => handleFieldChange('icon', e.target.value)}
                    placeholder="📐"
                    className="text-center text-xl"
                  />
                  {formData.icon && (
                    <span className="text-2xl">{formData.icon}</span>
                  )}
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  اللون
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    value={formData.color}
                    onChange={(e) => handleFieldChange('color', e.target.value)}
                    placeholder="#3b82f6"
                    dir="ltr"
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleFieldChange('color', e.target.value)}
                    className="h-12 w-12 rounded-xl border-2 border-gray-200 cursor-pointer p-1"
                  />
                </div>
              </div>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                ترتيب العرض
              </label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => handleFieldChange('sortOrder', parseInt(e.target.value) || 0)}
                placeholder="0"
                min={0}
              />
              <p className="text-xs text-gray-400">كلما كان الرقم اصغر ظهرت المادة اولا</p>
            </div>

            {/* Math Focus Checkbox */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="isMathFocus"
                checked={formData.isMathFocus}
                onChange={(e) => handleFieldChange('isMathFocus', e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="isMathFocus" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                <Calculator className="h-4 w-4 text-green-600" />
                مادة رياضيات (تركيز رياضي)
              </label>
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
              <Button type="submit" disabled={saving || !formData.nameAr.trim() || !formData.slug.trim()}>
                {saving ? 'جارِ الحفظ...' : editingSubject ? 'حفظ التعديلات' : 'اضافة المادة'}
              </Button>
            </DialogFooter>
          </form>
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
              هل انت متاكد من حذف المادة الدراسية{' '}
              <span className="font-bold text-gray-900">&quot;{deletingSubject?.nameAr}&quot;</span>؟
            </p>
            <p className="text-sm text-red-500 mt-2">
              هذا الاجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات المرتبطة بهذه المادة.
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
