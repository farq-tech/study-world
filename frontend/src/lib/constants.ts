export const APP_NAME = 'عالم الدراسة';
export const APP_NAME_EN = 'Study World';

export const DAYS_AR: Record<string, string> = {
  SUNDAY: 'الأحد',
  MONDAY: 'الاثنين',
  TUESDAY: 'الثلاثاء',
  WEDNESDAY: 'الأربعاء',
  THURSDAY: 'الخميس',
  FRIDAY: 'الجمعة',
  SATURDAY: 'السبت',
};

export const SCHOOL_DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];

export const SUBJECT_COLORS: Record<string, string> = {
  math: '#3b82f6',
  arabic: '#22c55e',
  science: '#8b5cf6',
  islamic: '#14b8a6',
  quran: '#059669',
  english: '#f97316',
  'life-skills': '#eab308',
  pe: '#ef4444',
  art: '#ec4899',
};

export const HOMEWORK_STATUS_AR: Record<string, string> = {
  PENDING: 'معلّق',
  SUBMITTED: 'مُسلّم',
  GRADED: 'مُقيّم',
};

export const HOMEWORK_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  GRADED: 'bg-green-100 text-green-700',
};

export const QUIZ_TYPE_AR: Record<string, string> = {
  DAILY: 'يومي',
  WEEKLY: 'أسبوعي',
  MATH_FOCUS: 'تركيز رياضيات',
  CHAPTER: 'فصلي',
};

export const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
  HOMEWORK: '📝',
  QUIZ: '📋',
  BADGE: '🏅',
  REMINDER: '⏰',
  GRADE: '📊',
  SYSTEM: '📢',
};

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000];

export const STUDENT_NAV = [
  { href: '/student/dashboard', label: 'الرئيسية', icon: 'Home' },
  { href: '/student/schedule', label: 'الجدول', icon: 'Calendar' },
  { href: '/student/homework', label: 'الواجبات', icon: 'BookOpen' },
  { href: '/student/quizzes', label: 'الاختبارات', icon: 'ClipboardList' },
  { href: '/student/grades', label: 'درجاتي', icon: 'BarChart3' },
  { href: '/student/ai-tutor', label: 'المعلم الذكي', icon: 'Bot' },
  { href: '/student/math-zone', label: 'منطقة الرياضيات', icon: 'Calculator' },
  { href: '/student/badges', label: 'أوسمتي', icon: 'Trophy' },
  { href: '/student/profile', label: 'ملفي', icon: 'User' },
];

export const ADMIN_NAV = [
  { href: '/admin/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
  { href: '/admin/students', label: 'الطلاب', icon: 'Users' },
  { href: '/admin/subjects', label: 'المواد', icon: 'BookOpen' },
  { href: '/admin/teachers', label: 'المعلمين', icon: 'GraduationCap' },
  { href: '/admin/schedules', label: 'الجداول', icon: 'CalendarDays' },
  { href: '/admin/homework', label: 'الواجبات', icon: 'ClipboardList' },
  { href: '/admin/quizzes', label: 'الاختبارات', icon: 'FileQuestion' },
  { href: '/admin/grades', label: 'الدرجات', icon: 'BarChart3' },
  { href: '/admin/holidays', label: 'الإجازات', icon: 'CalendarOff' },
  { href: '/admin/reports', label: 'التقارير', icon: 'FileBarChart' },
];
