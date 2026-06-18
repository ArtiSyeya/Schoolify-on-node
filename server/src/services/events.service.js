import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiResponse.js';

const EVENT_STATUSES = ['DRAFT', 'PUBLISHED', 'CANCELLED'];
const EVENT_CATEGORIES = ['ECO', 'HELP', 'EDU', 'SPORT'];
const ACTIVE_COUNT = { _count: { select: { registrations: { where: { status: 'ACTIVE' } } } } };


export async function listEvents({ category, search, sort } = {}) {
  const where = { status: 'PUBLISHED' };
  if (category && EVENT_CATEGORIES.includes(category)) where.category = category;
  if (search) {
    where.OR = [{ title: { contains: search } }, { organization: { contains: search } }];
  }
  const orderBy = sort === 'points' ? { points: 'desc' } : { startsAt: 'asc' };

  const events = await prisma.event.findMany({ where, orderBy, include: ACTIVE_COUNT });
  return events.map(formatEvent);
}

export async function getEvent(id) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: { organizer: { select: { id: true, fullName: true } }, ...ACTIVE_COUNT },
  });
  return event ? formatEvent(event) : null;
}

// Кабинет организатора

export async function listMine(actor) {
  const where = actor.role === 'ADMIN' ? {} : { organizerId: actor.id };
  const events = await prisma.event.findMany({
    where,
    orderBy: { startsAt: 'asc' },
    include: ACTIVE_COUNT,
  });
  return events.map(formatEvent);
}

export async function createEvent(organizerId, data) {
  const payload = validatePayload(data, { partial: false });
  const event = await prisma.event.create({
    data: { ...payload, status: payload.status || 'DRAFT', organizerId },
  });
  return formatEvent({ ...event, _count: { registrations: 0 } });
}

export async function updateEvent(actor, id, data) {
  await getOwnedEvent(actor, id);
  const payload = validatePayload(data, { partial: true });
  const event = await prisma.event.update({ where: { id }, data: payload, include: ACTIVE_COUNT });
  return formatEvent(event);
}

export async function deleteEvent(actor, id) {
  await getOwnedEvent(actor, id);
  await prisma.$transaction([
    prisma.registration.deleteMany({ where: { eventId: id } }),
    prisma.notification.deleteMany({ where: { eventId: id } }),
    prisma.event.delete({ where: { id } }),
  ]);
}

export async function getParticipants(actor, id) {
  await getOwnedEvent(actor, id);
  const regs = await prisma.registration.findMany({
    where: { eventId: id, status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, fullName: true, email: true } } },
  });
  return regs.map((r) => ({
    registrationId: r.id,
    user: r.user,
    status: r.status,
    attended: r.attended,
    createdAt: r.createdAt,
  }));
}

// Подтверждение/снятие посещения организатором (своего события) или админом.
// Очки начисляются автоматически — они считаются из attended-регистраций.
export async function setAttendance(actor, eventId, registrationId, attended) {
  await getOwnedEvent(actor, eventId); // 404/403 если не существует или чужое
  const reg = await prisma.registration.findUnique({ where: { id: registrationId } });
  if (!reg || reg.eventId !== eventId) {
    throw new ApiError(404, 'NOT_FOUND', 'Регистрация не найдена');
  }
  if (reg.status !== 'ACTIVE') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Регистрация неактивна');
  }

  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: { attended: Boolean(attended) },
  });

  // при первом подтверждении — уведомить волонтёра о начислении очков
  if (updated.attended && !reg.attended) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { title: true, points: true },
    });
    await prisma.notification.create({
      data: {
        userId: reg.userId,
        eventId,
        message: `Подтверждено участие в «${event.title}» — начислено ${event.points} очков`,
      },
    });
  }

  return updated;
}


async function getOwnedEvent(actor, id) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new ApiError(404, 'NOT_FOUND', 'Мероприятие не найдено');
  if (actor.role !== 'ADMIN' && event.organizerId !== actor.id) {
    throw new ApiError(403, 'FORBIDDEN', 'Это не ваше мероприятие');
  }
  return event;
}

function validatePayload(data, { partial }) {
  const out = {};
  const filled = (v) => v !== undefined && v !== null && v !== '';

  if (!partial || data.title !== undefined) {
    if (!filled(data.title)) throw new ApiError(400, 'VALIDATION_ERROR', 'Название обязательно');
    out.title = String(data.title);
  }
  if (data.description !== undefined) out.description = data.description ? String(data.description) : null;
  if (data.location !== undefined) out.location = data.location ? String(data.location) : null;
  if (data.organization !== undefined) {
    out.organization = data.organization ? String(data.organization) : null;
  }
  if (data.category !== undefined) {
    if (!EVENT_CATEGORIES.includes(data.category)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Недопустимая категория');
    }
    out.category = data.category;
  }
  if (data.points !== undefined) {
    const p = Number(data.points);
    if (!Number.isInteger(p) || p < 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Очки — целое число ≥ 0');
    }
    out.points = p;
  }

  if (!partial || data.startsAt !== undefined) {
    const d = new Date(data.startsAt);
    if (Number.isNaN(d.getTime())) throw new ApiError(400, 'VALIDATION_ERROR', 'Некорректная дата начала');
    out.startsAt = d;
  }
  if (data.endsAt !== undefined) {
    if (data.endsAt) {
      const d = new Date(data.endsAt);
      if (Number.isNaN(d.getTime())) throw new ApiError(400, 'VALIDATION_ERROR', 'Некорректная дата окончания');
      out.endsAt = d;
    } else {
      out.endsAt = null;
    }
  }
  if (!partial || data.capacity !== undefined) {
    const c = Number(data.capacity);
    if (!Number.isInteger(c) || c < 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Лимит мест — целое число ≥ 0');
    }
    out.capacity = c;
  }
  if (data.status !== undefined) {
    if (!EVENT_STATUSES.includes(data.status)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Недопустимый статус');
    }
    out.status = data.status;
  }
  return out;
}

function formatEvent(e) {
  const registeredCount = e._count?.registrations ?? 0;
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,
    organization: e.organization,
    category: e.category,
    points: e.points,
    startsAt: e.startsAt,
    endsAt: e.endsAt,
    capacity: e.capacity,
    status: e.status,
    registeredCount,
    freeSeats: e.capacity ? Math.max(e.capacity - registeredCount, 0) : null,
    organizer: e.organizer,
  };
}
