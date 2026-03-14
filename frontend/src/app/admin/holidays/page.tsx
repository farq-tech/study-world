'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Holiday } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CalendarOff, Plus, Pencil, Trash2, Sun, Palmtree, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const HOLIDAY_TYPES: Record<string, { label: string; color: string; icon: string }> = {
  NATIONAL: { label: 'إجازة وطنية', color: 'bg-green-100 text-green-700', icon: '🇸🇦' },
  SCHOOL_BREAK: { label: 'إجازة مدرسية', color: 'bg-blue-100 text-blue-700', icon: '🏫' },
  CUSTOM: { label: 'إجازة مخصصة', color: 'bg-purple-100 text-purple-700', icon: '📅' },
};

const emptyForm = { nameAr: '', nameEn: '', startDate: '', endDate: '', holidayType: 'NATIONAL' as string, note: '' };

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/holidays');
      setHolidays(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        nameAr: form.nameAr,
        nameEn: form.nameEn || undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        holidayType: form.holidayType,
        note: form.note || undefined,
      };
      if (editingId) {
        await api.put(`/holidays/${editingId}`, payload);
      } else {
        await api.post('/holidays', payload);
      }
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchData();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleEdit = (h: any) => {
    setEditingId(h.id);
    setForm({
      nameAr: h.nameAr,
      nameEn: h.nameEn || '',
      startDate: h.startDate?.split('T')[0] || '',
      endDate: h.endDate?.split('T')[0] || '',
      holidayType: h.holidayType,
      note: h.note || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try { await api.delete(`/holidays/${id}`); setDeleteDialog(null); fetchData(); }
    catch (err) { console.error(err); }
  };

  const getDuration = (start: string, end: string) => {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days === 1 ? 'يوم واحد' : `${days} أيام`;
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>;

  const upcoming = holidays.filter(h => new Date(h.startDate) >= new Date()).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const past = holidays.filter(h => new Date(h.startDate) < new Date()).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarOff className="h-7 w-7 text-orange-500" />
          <h1 className="text-2xl font-bold">إدارة الإجازات</h1>
          <Badge variant="secondary">{holidays.length}</Badge>
        </div>
        <Button onClick={() => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 ml-2" />إضافة إجازة
        </Button>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-green-600">إجازات قادمة 🎉</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map(h => {
                const type = HOLIDAY_TYPES[h.holidayType] || HOLIDAY_TYPES.CUSTOM;
                return (
                  <div key={h.id} className="p-4 rounded-2xl border border-green-100 bg-gradient-to-l from-green-50 to-white group relative">
                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(h)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleteDialog(h.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{type.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-bold">{h.nameAr}</h3>
                        {h.nameEn && <p className="text-xs text-gray-400">{h.nameEn}</p>}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className={type.color}>{type.label}</Badge>
                          <Badge variant="secondary">{getDuration(h.startDate, h.endDate)}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{formatDate(h.startDate)} — {formatDate(h.endDate)}</p>
                        {h.note && <p className="text-xs text-gray-400 mt-1">{h.note}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past */}
      {past.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-gray-400">إجازات سابقة</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {past.map(h => {
                const type = HOLIDAY_TYPES[h.holidayType] || HOLIDAY_TYPES.CUSTOM;
                return (
                  <div key={h.id} className="p-3 rounded-xl border bg-gray-50 opacity-75 group relative">
                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => setDeleteDialog(h.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                    <p className="font-bold text-sm">{type.icon} {h.nameAr}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(h.startDate)} — {formatDate(h.endDate)}</p>
                    <Badge variant="outline" className="text-[10px] mt-1">{type.label}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {holidays.length === 0 && (
        <Card><CardContent className="py-12 text-center text-gray-400">لا توجد إجازات مسجلة</CardContent></Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'تعديل إجازة' : 'إضافة إجازة جديدة'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm font-bold block mb-1">الاسم بالعربية *</label><Input value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} /></div>
            <div><label className="text-sm font-bold block mb-1">الاسم بالإنجليزية</label><Input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} dir="ltr" /></div>
            <div>
              <label className="text-sm font-bold block mb-1">النوع</label>
              <select className="w-full border rounded-xl p-2.5 text-sm" value={form.holidayType} onChange={e => setForm({ ...form, holidayType: e.target.value })}>
                {Object.entries(HOLIDAY_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-bold block mb-1">تاريخ البداية *</label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} dir="ltr" /></div>
              <div><label className="text-sm font-bold block mb-1">تاريخ النهاية *</label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} dir="ltr" /></div>
            </div>
            <div><label className="text-sm font-bold block mb-1">ملاحظة</label><Input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={!form.nameAr || !form.startDate || !form.endDate || saving}>{saving ? 'جارٍ الحفظ...' : 'حفظ'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-red-600">تأكيد الحذف</DialogTitle></DialogHeader>
          <p className="text-gray-600 py-4">هل أنت متأكد من حذف هذه الإجازة؟</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={() => deleteDialog && handleDelete(deleteDialog)}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
