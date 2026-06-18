import { prisma } from '../config/prisma.js';
import { levelInfo, badges, eventHours } from '../utils/gamification.js';

const PERIOD_DAYS = { week: 7, month: 30 };

export async function leaderboard(period = 'all') {
  // только подтверждённые посещения дают очки/часы
  const where = { status: 'ACTIVE', attended: true, user: { role: 'STUDENT' } };
  if (PERIOD_DAYS[period]) {
    where.createdAt = { gte: new Date(Date.now() - PERIOD_DAYS[period] * 86_400_000) };
  }

  const regs = await prisma.registration.findMany({
    where,
    include: {
      event: { select: { points: true, startsAt: true, endsAt: true } },
      user: { select: { id: true, fullName: true } },
    },
  });

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: { id: true, fullName: true },
  });

  const map = new Map();
  for (const student of students) {
    map.set(student.id, { userId: student.id, fullName: student.fullName, points: 0, hours: 0, eventsCount: 0 });
  }
  for (const reg of regs) {
    const row = map.get(reg.userId);
    if (!row) continue;
    row.points += reg.event.points || 0;
    row.hours += eventHours(reg.event);
    row.eventsCount += 1;
  }

  const items = [...map.values()]
    .map((r) => ({ ...r, hours: Math.round(r.hours) }))
    .sort((a, b) => b.points - a.points || b.hours - a.hours || a.fullName.localeCompare(b.fullName));

  items.forEach((row, i) => {
    row.rank = i + 1;
  });
  return items;
}


export async function userStats(user) {
  const regs = await prisma.registration.findMany({
    where: { userId: user.id, status: 'ACTIVE', attended: true },
    include: { event: { select: { points: true, startsAt: true, endsAt: true } } },
  });

  let points = 0;
  let hours = 0;
  for (const r of regs) {
    points += r.event.points || 0;
    hours += eventHours(r.event);
  }
  hours = Math.round(hours);
  const eventsCount = regs.length;

  let rank = null;
  if (user.role === 'STUDENT') {
    const board = await leaderboard('all');
    rank = board.find((b) => b.userId === user.id)?.rank ?? null;
  }

  return {
    points,
    hours,
    eventsCount,
    rank,
    ...levelInfo(points),
    badges: badges(points),
    memberSince: user.createdAt,
  };
}


export async function recentActivity(userId, limit = 5) {
  // «дневник» — только подтверждённые (за них начислены очки)
  const regs = await prisma.registration.findMany({
    where: { userId, status: 'ACTIVE', attended: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { event: { select: { id: true, title: true, points: true, startsAt: true } } },
  });
  return regs.map((r) => ({
    id: r.id,
    eventId: r.event.id,
    title: r.event.title,
    points: r.event.points,
    date: r.event.startsAt,
  }));
}
