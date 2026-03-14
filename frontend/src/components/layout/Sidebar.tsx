'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { STUDENT_NAV, ADMIN_NAV } from '@/lib/constants';
import {
  Home, Calendar, BookOpen, ClipboardList, BarChart3, Bot, Calculator,
  Trophy, LayoutDashboard, Users, GraduationCap, CalendarDays, FileQuestion,
  CalendarOff, FileBarChart, LogOut, User,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  Home, Calendar, BookOpen, ClipboardList, BarChart3, Bot, Calculator,
  Trophy, LayoutDashboard, Users, GraduationCap, CalendarDays, FileQuestion,
  CalendarOff, FileBarChart, User,
};

interface SidebarProps {
  role: 'STUDENT' | 'PARENT' | 'ADMIN';
  onLogout: () => void;
}

export default function Sidebar({ role, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === 'STUDENT' ? STUDENT_NAV : ADMIN_NAV;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-l border-gray-100 shadow-sm h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link href={role === 'STUDENT' ? '/student/dashboard' : '/admin/dashboard'}>
          <h1 className="text-2xl font-bold text-gradient">عالم الدراسة</h1>
          <p className="text-xs text-gray-400 mt-1">Study World</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || Home;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
