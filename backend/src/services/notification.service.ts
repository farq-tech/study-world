import { prisma } from '../lib/prisma';
import { NotificationType } from '@prisma/client';

export async function getNotifications(userId: string, unreadOnly: boolean = false) {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
  scheduledFor?: Date;
}) {
  return prisma.notification.create({ data: data as any });
}

export async function markAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
