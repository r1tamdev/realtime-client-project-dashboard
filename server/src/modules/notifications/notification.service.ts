import prisma from '../../config/db';
import { AppError } from '../../utils/appError';

export async function createNotification(userId: string, taskId: string, message: string) {
  return prisma.notification.create({
    data: { userId, taskId, message },
  });
}

export async function getNotificationsForUser(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });

  if (!notification) {
    throw new AppError(404, 'Notification not found');
  }

  if (notification.userId !== userId) {
    throw new AppError(403, 'This notification does not belong to you');
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}