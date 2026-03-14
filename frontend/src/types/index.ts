export interface User {
  id: string;
  username: string;
  nameAr: string;
  nameEn?: string;
  email?: string;
  role: 'STUDENT' | 'PARENT' | 'ADMIN';
  avatarUrl?: string;
  studentId?: string | null;
  student?: Student | null;
}

export interface Student {
  id: string;
  userId: string;
  gradeLevel: string;
  className: string;
  points: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt?: string;
  user?: { nameAr: string; avatarUrl?: string };
  recentBadges?: Badge[];
}

export interface Subject {
  id: string;
  nameAr: string;
  nameEn?: string;
  slug: string;
  icon?: string;
  color?: string;
  isMathFocus: boolean;
  sortOrder: number;
}

export interface Teacher {
  id: string;
  nameAr: string;
  nameEn?: string;
  phone?: string;
  email?: string;
  note?: string;
  subjects?: { subject: Subject }[];
}

export interface Schedule {
  id: string;
  studentId: string;
  subjectId: string;
  teacherId?: string;
  dayOfWeek: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  room?: string;
  subject: Subject;
  teacher?: Teacher;
}

export interface Lesson {
  id: string;
  subjectId: string;
  title: string;
  content?: string;
  keyPoints?: string;
  importantTerms?: string;
  aiSummary?: string;
  warmupQuestions?: any;
  chapter?: number;
  lessonOrder: number;
  audioUrl?: string;
  subject: Subject;
}

export interface Homework {
  id: string;
  studentId: string;
  subjectId: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED';
  submittedAt?: string;
  grade?: number;
  feedback?: string;
  aiExplanation?: string;
  aiGuidedSolution?: string;
  subject: Subject;
  lesson?: Lesson;
}

export interface Quiz {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  type: 'DAILY' | 'WEEKLY' | 'MATH_FOCUS' | 'CHAPTER';
  questions: QuizQuestion[];
  totalMarks: number;
  timeLimit?: number;
  subject: Subject;
  attempted?: boolean;
  bestScore?: number | null;
  attemptCount?: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'mcq' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: number | string;
  explanation?: string;
  topic?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: any;
  score: number;
  totalCorrect: number;
  totalQuestions: number;
  timeTaken?: number;
  feedback?: any;
  completedAt: string;
  quiz?: Quiz;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  title: string;
  category: string;
  score: number;
  maxScore: number;
  weight: number;
  notes?: string;
  gradedAt: string;
  subject: Subject;
}

export interface GradeOverview {
  overallAverage: number;
  subjectAverages: { subject: Subject; average: number; gradeCount: number }[];
  strongest: { subject: Subject; average: number } | null;
  weakest: { subject: Subject; average: number } | null;
  totalGrades: number;
}

export interface Badge {
  id: string;
  code: string;
  nameAr: string;
  descriptionAr?: string;
  icon: string;
  category: string;
  pointsValue: number;
  earnedAt?: string;
}

export interface StudentBadge {
  id: string;
  badge: Badge;
  earnedAt: string;
}

export interface Holiday {
  id: string;
  nameAr: string;
  nameEn?: string;
  startDate: string;
  endDate: string;
  holidayType: 'NATIONAL' | 'SCHOOL_BREAK' | 'CUSTOM';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface WeaknessArea {
  id: string;
  studentId: string;
  subjectId: string;
  topic: string;
  description?: string;
  severity: number;
  drillCount: number;
  lastScore?: number;
  isResolved: boolean;
  subject: Subject;
}

export interface DashboardData {
  student: Student;
  todayClasses: Schedule[];
  pendingHomework: Homework[];
  recentGrades: Grade[];
  recentBadges: Badge[];
  unreadNotifications: number;
  weaknesses: WeaknessArea[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
