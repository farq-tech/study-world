'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (user: string) => {
    setError('');
    setLoading(true);
    try {
      await login(user, 'password123');
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 via-white to-green-100">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 text-6xl animate-float opacity-30">📚</div>
      <div className="absolute bottom-10 left-10 text-6xl animate-float opacity-30" style={{ animationDelay: '1s' }}>🌟</div>
      <div className="absolute top-1/4 left-1/4 text-4xl animate-float opacity-20" style={{ animationDelay: '2s' }}>🔢</div>
      <div className="absolute bottom-1/4 right-1/4 text-4xl animate-float opacity-20" style={{ animationDelay: '0.5s' }}>✏️</div>

      <Card className="w-full max-w-md shadow-2xl border-0 relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <div className="text-6xl mb-2">📖</div>
            <CardTitle className="text-3xl font-bold text-gradient">عالم الدراسة</CardTitle>
            <p className="text-sm text-gray-500 mt-2">مرحباً بك في رحلة التعلم الممتعة!</p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستخدم</label>
              <Input
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
              <Input
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-lg"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full text-lg" disabled={loading}>
              {loading ? 'جارِ الدخول...' : 'تسجيل الدخول 🚀'}
            </Button>
          </form>

          {/* Quick login buttons (demo) */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">دخول سريع (عرض تجريبي)</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => quickLogin('ahmed')} disabled={loading}>
                🧑‍🎓 أحمد
              </Button>
              <Button variant="outline" size="sm" onClick={() => quickLogin('abdulrahman')} disabled={loading}>
                👦 عبدالرحمن
              </Button>
              <Button variant="outline" size="sm" onClick={() => quickLogin('parent')} disabled={loading}>
                👨‍👧 ولي الأمر
              </Button>
              <Button variant="outline" size="sm" onClick={() => quickLogin('admin')} disabled={loading}>
                👨‍💼 المدير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
