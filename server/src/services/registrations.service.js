import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiResponse.js';

export async function register(userId, eventId) {
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: eventId } });
    if (!event || event.status !== 'PUBLISHED') {
      throw new ApiError(404, 'NOT_FOUND', 'Мероприятие не найдено');
    }

    const existing = await tx.registration.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    if (existing && existing.status === 'ACTIVE') {
      throw new ApiError(409, 'ALREADY_REGISTERED', 'Вы уже зарегистрированы на это мероприятие');
    }

    if (event.capacity > 0) {
      const activeCount = await tx.registration.count({
        where: { eventId, status: 'ACTIVE' },
      });
      if (activeCount >= event.capacity) {
        throw new ApiError(409, 'EVENT_FULL', 'На мероприятии закончились места');
      }
    }

    const registration = existing
      ? await tx.registration.update({
          where: { id: existing.id },
          data: { status: 'ACTIVE' },
        })
      : await tx.registration.create({
          data: { userId, eventId, status: 'ACTIVE' },
        });

    await tx.notification.create({
      data: { userId, eventId, message: `Вы зарегистрированы на «${event.title}»` },
    });

    return registration;
  });
}

export async function cancel(userId, registrationId) {
  const reg = await prisma.registration.findUnique({ where: { id: registrationId } });
  if (!reg) throw new ApiError(404, 'NOT_FOUND', 'Регистрация не найдена');
  if (reg.userId !== userId) throw new ApiError(403, 'FORBIDDEN', 'Это не ваша регистрация');
  if (reg.status === 'CANCELLED') return reg;

  return prisma.registration.update({
    where: { id: registrationId },
    data: { status: 'CANCELLED' },
  });
}


export async function listMy(userId) {
  return prisma.registration.findMany({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    include: {
      event: { select: { id: true, title: true, startsAt: true, location: true } },
    },
  });
}
