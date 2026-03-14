'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { STUDENT_NAV, ADMIN_NAV } from '@/lib/constants';
import {
  Home, Calendar, BookOpen, ClipboardList, BarChart3, Bot, Calculator,
  Trophy, LayoutDashboard, Users, GraduationCap, CalendarDays, FileQuestion,
  CalendarOff, FileBarChart, X, LogOut, User,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  Home, Calendar, BookOpen, ClipboardList, BarChart3, Bot, Calculator,
  Trophy, LayoutDashboard, Users, GraduationCap, CalendarDays, FileQuestion,
  CalendarOff, FileBarChart, User,
};

interface MobileNavProps {
  role: 'STUDENT' | 'PARENT' | 'ADMIN';
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function MobileNav({ role, isOpen, onClose, onLogout }: MobileNavProps) {
  const pathname = usePathname();
  const navItems = role === 'STUDENT' ? STUDENT_NAV : ADMIN_NAV;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-72 bg-white shadow-xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gradient">عالم الدراسة</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] || Home;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <button
            onClick={() => { onLogout(); onClose(); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );
}
