import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiResponse.js';

export async function listMy(userId) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function markRead(userId, id) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new ApiError(404, 'NOT_FOUND', 'Уведомление не найдено');
  if (notification.userId !== userId) {
    throw new ApiError(403, 'FORBIDDEN', 'Это не ваше уведомление');
  }
  if (notification.isRead) return notification;
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}
