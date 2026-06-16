import { prisma } from '../config/prisma.js';

export async function listEvents() {
  const events = await prisma.event.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { startsAt: 'asc' },
    include: { _count: { select: { registrations: true } } },
  });
  return events.map(formatEvent);
}

export async function getEvent(id) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: { select: { id: true, fullName: true } },
      _count: { select: { registrations: true } },
    },
  });
  return event ? formatEvent(event) : null;
}

function formatEvent(e) {
  const registeredCount = e._count?.registrations ?? 0;
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,
    startsAt: e.startsAt,
    capacity: e.capacity,
    status: e.status,
    registeredCount,
    freeSeats: e.capacity ? Math.max(e.capacity - registeredCount, 0) : null,
    organizer: e.organizer,
  };
}
