'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDashboardPath } from '@/lib/auth';

export default function HomePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user) {
      router.push(getDashboardPath(user.role));
    } else {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-pulse">
        <h1 className="text-4xl font-bold text-gradient mb-4">عالم الدراسة</h1>
        <p className="text-gray-500">جارِ التحميل...</p>
      </div>
    </div>
  );
}
