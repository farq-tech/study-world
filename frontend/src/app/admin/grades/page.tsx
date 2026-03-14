'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Grade, Student, Subject } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Plus, Trash2, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const CATEGORIES = ['اختبار', 'واجب', 'مشاركة', 'مشروع', 'أخرى'];
const emptyForm = { studentId: '', subjectId: '', title: '', category: 'اختبار', score: '', maxScore: '100', weight: '1', notes: '' };

export default function GradesPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [gRes, stRes, suRes] = await Promise.all([
        api.get('/grades/all'),
        api.get('/students'),
        api.get('/subjects'),
      ]);
      setGrades(gRes.data.data);
      setStudents(stRes.data.data);
      setSubjects(suRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.post('/grades', {
        studentId: form.studentId,
        subjectId: form.subjectId,
        title: form.title,
        category: form.category,
        score: parseFloat(form.score),
        maxScore: parseFloat(form.maxScore),
        weight: parseFloat(form.weight),
        notes: form.notes || undefined,
      });
      setCreateOpen(false);
      setForm(emptyForm);
      fetchData();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await api.delete(`/grades/${id}`); setDeleteDialog(null); fetchData(); }
    catch (err) { console.error(err); }
  };

  const getScoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 90) return 'bg-green-100 text-green-700';
    if (pct >= 70) return 'bg-blue-100 text-blue-700';
    if (pct >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const filtered = grades
    .filter(g => filterSubject === 'ALL' || g.subjectId === filterSubject)
    .filter(g => g.title.includes(search) || g.student?.user?.nameAr?.includes(search));

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}</div>;

  const avgScore = grades.length > 0 ? (grades.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / grades.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-green-500" />
          <h1 className="text-2xl font-bold">إدارة الدرجات</h1>
          <Badge variant="secondary">{grades.length} درجة</Badge>
        </div>
        <Button onClick={() => { setForm(emptyForm); setCreateOpen(true); }}>
          <Plus className="h-4 w-4 ml-2" />إضافة درجة
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-blue-600">{grades.length}</p><p className="text-sm text-gray-500">إجمالي الدرجات</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">{avgScore}%</p><p className="text-sm text-gray-500">المتوسط العام</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-purple-600">{new Set(grades.map(g => g.studentId)).size}</p><p className="text-sm text-gray-500">عدد الطلاب</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
        </div>
        <select className="border rounded-xl p-2.5 text-sm min-w-[150px]" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
          <option value="ALL">كل المواد</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.nameAr}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الطالب</TableHead>
                <TableHead>المادة</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>التصنيف</TableHead>
                <TableHead>الدرجة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-gray-400 py-8">لا توجد درجات</TableCell></TableRow>
              ) : filtered.map(g => (
                <TableRow key={g.id}>
                  <TableCell className="font-bold">{g.student?.user?.nameAr || '—'}</TableCell>
                  <TableCell><span className="flex items-center gap-1">{g.subject?.icon} {g.subject?.nameAr}</span></TableCell>
                  <TableCell>{g.title}</TableCell>
                  <TableCell><Badge variant="outline">{g.category}</Badge></TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(g.score, g.maxScore)}`}>
                      {g.score}/{g.maxScore}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{formatDate(g.gradedAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setDeleteDialog(g.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>إضافة درجة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-bold block mb-1">الطالب *</label>
              <select className="w-full border rounded-xl p-2.5 text-sm" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}>
                <option value="">اختر الطالب</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.user?.nameAr}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">المادة *</label>
              <select className="w-full border rounded-xl p-2.5 text-sm" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}>
                <option value="">اختر المادة</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.nameAr}</option>)}
              </select>
            </div>
            <div><label className="text-sm font-bold block mb-1">العنوان *</label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div>
              <label className="text-sm font-bold block mb-1">التصنيف</label>
              <select className="w-full border rounded-xl p-2.5 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-sm font-bold block mb-1">الدرجة *</label><Input type="number" min="0" value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} dir="ltr" /></div>
              <div><label className="text-sm font-bold block mb-1">من</label><Input type="number" min="1" value={form.maxScore} onChange={e => setForm({ ...form, maxScore: e.target.value })} dir="ltr" /></div>
              <div><label className="text-sm font-bold block mb-1">الوزن</label><Input type="number" min="0" step="0.1" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} dir="ltr" /></div>
            </div>
            <div><label className="text-sm font-bold block mb-1">ملاحظات</label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>إلغاء</Button>
            <Button onClick={handleCreate} disabled={!form.studentId || !form.subjectId || !form.title || !form.score || saving}>{saving ? 'جارٍ الحفظ...' : 'إضافة'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-red-600">تأكيد الحذف</DialogTitle></DialogHeader>
          <p className="text-gray-600 py-4">هل أنت متأكد من حذف هذه الدرجة؟</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={() => deleteDialog && handleDelete(deleteDialog)}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
