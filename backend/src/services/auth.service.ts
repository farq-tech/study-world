import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

export async function login(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { username: data.username },
    include: {
      student: true,
    },
  });

  if (!user || !user.isActive) {
    throw Object.assign(new Error('اسم المستخدم أو كلمة المرور غير صحيحة'), { statusCode: 401 });
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error('اسم المستخدم أو كلمة المرور غير صحيحة'), { statusCode: 401 });
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = signToken({ userId: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      nameAr: user.nameAr,
      role: user.role,
      avatarUrl: user.avatarUrl,
      studentId: user.student?.id || null,
    },
  };
}

export async function register(data: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { username: data.username },
  });

  if (existing) {
    throw Object.assign(new Error('اسم المستخدم مستخدم بالفعل'), { statusCode: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      passwordHash,
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      email: data.email,
      role: data.role,
      ...(data.role === 'STUDENT'
        ? {
            student: {
              create: {
                gradeLevel: data.gradeLevel || 'الصف الثالث الابتدائي',
                className: data.className || 'الثالث أ',
              },
            },
          }
        : {}),
    },
    include: {
      student: true,
    },
  });

  const token = signToken({ userId: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      nameAr: user.nameAr,
      role: user.role,
      avatarUrl: user.avatarUrl,
      studentId: user.student?.id || null,
    },
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      student: {
        include: {
          studentBadges: {
            include: { badge: true },
            orderBy: { earnedAt: 'desc' },
            take: 5,
          },
        },
      },
    },
  });

  if (!user) {
    throw Object.assign(new Error('المستخدم غير موجود'), { statusCode: 404 });
  }

  return {
    id: user.id,
    username: user.username,
    nameAr: user.nameAr,
    nameEn: user.nameEn,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    studentId: user.student?.id || null,
    student: user.student
      ? {
          id: user.student.id,
          gradeLevel: user.student.gradeLevel,
          className: user.student.className,
          points: user.student.points,
          level: user.student.level,
          currentStreak: user.student.currentStreak,
          longestStreak: user.student.longestStreak,
          recentBadges: user.student.studentBadges.map((sb) => ({
            id: sb.badge.id,
            nameAr: sb.badge.nameAr,
            icon: sb.badge.icon,
            earnedAt: sb.earnedAt,
          })),
        }
      : null,
  };
}
