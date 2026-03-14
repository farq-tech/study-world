'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Student, Subject, Teacher, Schedule } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CalendarDays, Plus, Trash2, Clock } from 'lucide-react';
import { DAYS_AR, SCHOOL_DAYS } from '@/lib/constants';

const PERIODS = [1, 2, 3, 4, 5, 6, 7];
const emptyForm = { studentId: '', subjectId: '', teacherId: '', dayOfWeek: 'SUNDAY', periodNumber: '1', startTime: '07:00', endTime: '07:45', room: '' };

export default function SchedulesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchBase = async () => {
    try {
      const [stRes, suRes, tRes] = await Promise.all([
        api.get('/students'),
        api.get('/subjects'),
        api.get('/teachers'),
      ]);
      setStudents(stRes.data.data);
      setSubjects(suRes.data.data);
      setTeachers(tRes.data.data);
      if (stRes.data.data.length > 0) {
        setSelectedStudent(stRes.data.data[0].id);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchSchedule = async (studentId: string) => {
    if (!studentId) return;
    try {
      const res = await api.get(`/schedules/student/${studentId}`);
      setSchedules(res.data.data);
    } catch (err) { console.error(err); setSchedules([]); }
  };

  useEffect(() => { fetchBase(); }, []);
  useEffect(() => { if (selectedStudent) fetchSchedule(selectedStudent); }, [selectedStudent]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.post('/schedules', {
        studentId: form.studentId || selectedStudent,
        subjectId: form.subjectId,
        teacherId: form.teacherId || undefined,
        dayOfWeek: form.dayOfWeek,
        periodNumber: parseInt(form.periodNumber),
        startTime: form.startTime,
        endTime: form.endTime,
        room: form.room || undefined,
      });
      setCreateOpen(false);
      setForm(emptyForm);
      fetchSchedule(selectedStudent);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await api.delete(`/schedules/${id}`); setDeleteDialog(null); fetchSchedule(selectedStudent); }
    catch (err) { console.error(err); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>;

  const getScheduleForDay = (day: string) => schedules.filter(s => s.dayOfWeek === day).sort((a, b) => a.periodNumber - b.periodNumber);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-7 w-7 text-indigo-500" />
          <h1 className="text-2xl font-bold">إدارة الجداول</h1>
        </div>
        <Button onClick={() => { setForm({ ...emptyForm, studentId: selectedStudent }); setCreateOpen(true); }}>
          <Plus className="h-4 w-4 ml-2" />إضافة حصة
        </Button>
      </div>

      {/* Student selector */}
      <div>
        <label className="text-sm font-bold block mb-2">اختر الطالب</label>
        <select className="border rounded-xl p-2.5 text-sm min-w-[250px]" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
          {students.map(s => <option key={s.id} value={s.id}>{s.user?.nameAr} — {s.className}</option>)}
        </select>
      </div>

      {/* Timetable grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {SCHOOL_DAYS.map(day => (
          <Card key={day}>
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-sm">{DAYS_AR[day]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {getScheduleForDay(day).length === 0 ? (
                <p className="text-center text-gray-300 text-xs py-4">لا توجد حصص</p>
              ) : getScheduleForDay(day).map(s => (
                <div key={s.id} className="p-2 rounded-xl border text-xs space-y-1 group relative" style={{ borderRightColor: s.subject?.color || '#ccc', borderRightWidth: '3px' }}>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">الحصة {s.periodNumber}</Badge>
                    <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 text-red-400" onClick={() => setDeleteDialog(s.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-bold">{s.subject?.icon} {s.subject?.nameAr}</p>
                  {s.teacher && <p className="text-gray-400">{s.teacher.nameAr}</p>}
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span dir="ltr">{s.startTime} - {s.endTime}</span>
                  </div>
                  {s.room && <p className="text-gray-400">القاعة: {s.room}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>إضافة حصة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-bold block mb-1">المادة *</label>
              <select className="w-full border rounded-xl p-2.5 text-sm" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}>
                <option value="">اختر المادة</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.nameAr}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">المعلم</label>
              <select className="w-full border rounded-xl p-2.5 text-sm" value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}>
                <option value="">اختر المعلم (اختياري)</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.nameAr}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold block mb-1">اليوم *</label>
                <select className="w-full border rounded-xl p-2.5 text-sm" value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}>
                  {SCHOOL_DAYS.map(d => <option key={d} value={d}>{DAYS_AR[d]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">رقم الحصة *</label>
                <select className="w-full border rounded-xl p-2.5 text-sm" value={form.periodNumber} onChange={e => setForm({ ...form, periodNumber: e.target.value })}>
                  {PERIODS.map(p => <option key={p} value={p}>الحصة {p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-bold block mb-1">وقت البداية</label><Input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} dir="ltr" /></div>
              <div><label className="text-sm font-bold block mb-1">وقت النهاية</label><Input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} dir="ltr" /></div>
            </div>
            <div><label className="text-sm font-bold block mb-1">القاعة</label><Input value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>إلغاء</Button>
            <Button onClick={handleCreate} disabled={!form.subjectId || saving}>{saving ? 'جارٍ الحفظ...' : 'إضافة'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-red-600">تأكيد الحذف</DialogTitle></DialogHeader>
          <p className="text-gray-600 py-4">هل أنت متأكد من حذف هذه الحصة من الجدول؟</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={() => deleteDialog && handleDelete(deleteDialog)}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
