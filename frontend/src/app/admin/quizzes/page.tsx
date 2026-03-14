'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileQuestion, Plus, Trash2, Sparkles, Clock, Hash } from 'lucide-react';
import { QUIZ_TYPE_AR } from '@/lib/constants';

interface Subject {
  id: string;
  nameAr: string;
  icon?: string;
}

interface Quiz {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  type: 'DAILY' | 'WEEKLY' | 'MATH_FOCUS' | 'CHAPTER';
  questions: any[];
  totalMarks: number;
  timeLimit?: number;
  subject: { nameAr: string; icon?: string };
}

interface QuizFormData {
  subjectId: string;
  title: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'MATH_FOCUS' | 'CHAPTER';
  totalMarks: number;
  timeLimit: number;
  questions: string;
}

const emptyForm: QuizFormData = {
  subjectId: '',
  title: '',
  description: '',
  type: 'DAILY',
  totalMarks: 10,
  timeLimit: 15,
  questions: '[]',
};

const QUIZ_TYPE_COLORS: Record<string, string> = {
  DAILY: 'bg-blue-100 text-blue-700',
  WEEKLY: 'bg-purple-100 text-purple-700',
  MATH_FOCUS: 'bg-green-100 text-green-700',
  CHAPTER: 'bg-orange-100 text-orange-700',
};

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

export default function AdminQuizzesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [quizzesBySubject, setQuizzesBySubject] = useState<Record<string, Quiz[]>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState<QuizFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const subjectsRes = await api.get('/subjects');
      const subjectsList: Subject[] = subjectsRes.data.data || [];
      setSubjects(subjectsList);

      const quizzesMap: Record<string, Quiz[]> = {};
      await Promise.all(
        subjectsList.map(async (subject) => {
          try {
            const res = await api.get(`/quizzes/subject/${subject.id}`);
            quizzesMap[subject.id] = res.data.data || [];
          } catch {
            quizzesMap[subject.id] = [];
          }
        })
      );
      setQuizzesBySubject(quizzesMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const allQuizzes = Object.values(quizzesBySubject).flat();

  const openCreateDialog = () => {
    setFormData(emptyForm);
    setAiTopic('');
    setAiCount(5);
    setDialogOpen(true);
  };

  const openDeleteDialog = (quiz: Quiz) => {
    setDeletingQuiz(quiz);
    setDeleteDialogOpen(true);
  };

  const handleFieldChange = (field: keyof QuizFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAiGenerate = async () => {
    if (!formData.subjectId || !aiTopic.trim()) return;

    try {
      setAiGenerating(true);
      const res = await api.post('/ai/generate-quiz', {
        subjectId: formData.subjectId,
        topic: aiTopic.trim(),
        count: aiCount,
      });
      const generatedQuestions = res.data.data || res.data.questions || res.data;
      setFormData((prev) => ({
        ...prev,
        questions: JSON.stringify(
          Array.isArray(generatedQuestions) ? generatedQuestions : [],
          null,
          2
        ),
      }));
    } catch (error) {
      console.error('Error generating quiz questions:', error);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.title.trim()) return;

    let parsedQuestions: any[];
    try {
      parsedQuestions = JSON.parse(formData.questions);
      if (!Array.isArray(parsedQuestions)) {
        console.error('Questions must be an array');
        return;
      }
    } catch {
      console.error('Invalid JSON in questions field');
      return;
    }

    try {
      setSaving(true);
      await api.post('/quizzes', {
        subjectId: formData.subjectId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        totalMarks: formData.totalMarks,
        timeLimit: formData.timeLimit || undefined,
        questions: parsedQuestions,
      });

      setDialogOpen(false);
      setFormData(emptyForm);
      await fetchData();
    } catch (error) {
      console.error('Error creating quiz:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingQuiz) return;

    try {
      setDeleting(true);
      await api.delete(`/quizzes/${deletingQuiz.id}`);
      setDeleteDialogOpen(false);
      setDeletingQuiz(null);
      await fetchData();
    } catch (error) {
      console.error('Error deleting quiz:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getSubjectName = (subjectId: string): string => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.nameAr || 'غير معروف';
  };

  const getSubjectIcon = (subjectId: string): string => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.icon || '📚';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-2xl">
            <FileQuestion className="h-7 w-7 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ادارة الاختبارات</h1>
            <p className="text-sm text-gray-500">
              انشاء وادارة الاختبارات القصيرة لجميع المواد الدراسية
            </p>
          </div>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-5 w-5" />
          اضافة اختبار
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <FileQuestion className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">اجمالي الاختبارات</p>
              <p className="text-xl font-bold text-gray-800">
                {loading ? '...' : allQuizzes.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Hash className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">اختبارات يومية</p>
              <p className="text-xl font-bold text-gray-800">
                {loading ? '...' : allQuizzes.filter((q) => q.type === 'DAILY').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">اختبارات اسبوعية</p>
              <p className="text-xl font-bold text-gray-800">
                {loading ? '...' : allQuizzes.filter((q) => q.type === 'WEEKLY').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <Sparkles className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">اجمالي الاسئلة</p>
              <p className="text-xl font-bold text-gray-800">
                {loading
                  ? '...'
                  : allQuizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quizzes Grouped by Subject */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>عدد الاسئلة</TableHead>
                  <TableHead>الدرجة الكلية</TableHead>
                  <TableHead>المدة</TableHead>
                  <TableHead>الاجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : allQuizzes.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <FileQuestion className="h-12 w-12" />
              <p className="text-lg font-medium">لا توجد اختبارات بعد</p>
              <p className="text-sm">اضغط على &quot;اضافة اختبار&quot; لانشاء اختبار جديد</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        subjects
          .filter((subject) => (quizzesBySubject[subject.id] || []).length > 0)
          .map((subject) => (
            <Card key={subject.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-xl">{subject.icon || '📚'}</span>
                  {subject.nameAr}
                  <Badge variant="secondary" className="mr-2">
                    {(quizzesBySubject[subject.id] || []).length} اختبار
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>عدد الاسئلة</TableHead>
                      <TableHead>الدرجة الكلية</TableHead>
                      <TableHead>المدة (دقيقة)</TableHead>
                      <TableHead>الاجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(quizzesBySubject[subject.id] || []).map((quiz) => (
                      <TableRow key={quiz.id} className="hover:bg-indigo-50/50">
                        <TableCell className="font-medium text-gray-800">
                          {quiz.title}
                        </TableCell>
                        <TableCell className="text-gray-600 max-w-[200px] truncate">
                          {quiz.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={QUIZ_TYPE_COLORS[quiz.type] || 'bg-gray-100 text-gray-700'}
                          >
                            {QUIZ_TYPE_AR[quiz.type] || quiz.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Hash className="h-4 w-4 text-indigo-500" />
                            <span>{quiz.questions?.length || 0} سؤال</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {quiz.totalMarks}
                        </TableCell>
                        <TableCell>
                          {quiz.timeLimit ? (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="h-4 w-4 text-purple-500" />
                              <span>{quiz.timeLimit} د</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(quiz)}
                            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            حذف
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
      )}

      {/* Create Quiz Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>انشاء اختبار جديد</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                المادة الدراسية <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => handleFieldChange('subjectId', e.target.value)}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">اختر المادة...</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.icon || '📚'} {subject.nameAr}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                عنوان الاختبار <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="مثال: اختبار الوحدة الاولى"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">الوصف</label>
              <Input
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="وصف مختصر للاختبار"
              />
            </div>

            {/* Type & Marks & Time Row */}
            <div className="grid grid-cols-3 gap-4">
              {/* Type Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  نوع الاختبار <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    handleFieldChange('type', e.target.value as QuizFormData['type'])
                  }
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(QUIZ_TYPE_AR).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Total Marks */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">الدرجة الكلية</label>
                <Input
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) => handleFieldChange('totalMarks', parseInt(e.target.value) || 0)}
                  min={1}
                />
              </div>

              {/* Time Limit */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">المدة (دقيقة)</label>
                <Input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => handleFieldChange('timeLimit', parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
            </div>

            {/* AI Generate Section */}
            <div className="p-4 bg-gradient-to-l from-purple-50 to-indigo-50 rounded-xl border border-indigo-200 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-indigo-800">
                  توليد الاسئلة بالذكاء الاصطناعي
                </h3>
              </div>
              <p className="text-xs text-indigo-600">
                ادخل الموضوع وعدد الاسئلة المطلوبة وسيقوم الذكاء الاصطناعي بتوليدها تلقائيا
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-indigo-700">الموضوع</label>
                  <Input
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="مثال: جمع وطرح الكسور"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-indigo-700">عدد الاسئلة</label>
                  <Input
                    type="number"
                    value={aiCount}
                    onChange={(e) => setAiCount(parseInt(e.target.value) || 5)}
                    min={1}
                    max={20}
                    className="bg-white"
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={handleAiGenerate}
                disabled={aiGenerating || !formData.subjectId || !aiTopic.trim()}
                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Sparkles className="h-5 w-5" />
                {aiGenerating ? 'جارِ التوليد...' : 'توليد الاسئلة بالذكاء الاصطناعي'}
              </Button>
            </div>

            {/* Questions JSON */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                الاسئلة (JSON)
              </label>
              <textarea
                value={formData.questions}
                onChange={(e) => handleFieldChange('questions', e.target.value)}
                className="w-full min-h-[150px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                dir="ltr"
                placeholder='[{"question": "...", "options": ["أ", "ب", "ج", "د"], "answer": "أ"}]'
              />
              <p className="text-xs text-gray-400">
                ادخل الاسئلة بصيغة JSON او استخدم التوليد بالذكاء الاصطناعي
              </p>
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
              <Button
                type="submit"
                disabled={saving || !formData.subjectId || !formData.title.trim()}
              >
                {saving ? 'جارِ الحفظ...' : 'انشاء الاختبار'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">تاكيد حذف الاختبار</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              هل انت متاكد من حذف الاختبار{' '}
              <span className="font-bold text-gray-900">&quot;{deletingQuiz?.title}&quot;</span>؟
            </p>
            <p className="text-sm text-red-500 mt-2">
              هذا الاجراء لا يمكن التراجع عنه وسيتم حذف جميع بيانات هذا الاختبار نهائيا.
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
