'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Menu, Star, Flame } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.data.count);
      } catch {}
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuToggle}>
          <Menu className="h-6 w-6" />
        </Button>

        {/* Mobile logo */}
        <div className="md:hidden">
          <h1 className="text-lg font-bold text-gradient">عالم الدراسة</h1>
        </div>

        {/* Student info (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <p className="font-bold text-gray-800">مرحباً، {user?.nameAr?.split(' ')[0]} 👋</p>
            {user?.role === 'STUDENT' && (
              <p className="text-xs text-gray-500">الصف الثالث الابتدائي</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Link href={user?.role === 'STUDENT' ? '/student/dashboard' : '/admin/dashboard'}>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce-slow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </Link>

          {/* User avatar */}
          <div className="flex items-center gap-2 bg-blue-50 rounded-full px-3 py-1.5">
            <span className="text-lg">{user?.avatarUrl || '👤'}</span>
            <span className="text-sm font-medium text-blue-700 hidden sm:inline">
              {user?.nameAr?.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
