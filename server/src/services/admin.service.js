import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiResponse.js';

const ASSIGNABLE_ROLES = ['STUDENT', 'ORGANIZER', 'ADMIN'];
const USER_FIELDS = { id: true, fullName: true, email: true, role: true, isBlocked: true };

export async function listUsers({ role, search } = {}) {
  const where = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [{ fullName: { contains: search } }, { email: { contains: search } }];
  }
  return prisma.user.findMany({ where, orderBy: { id: 'asc' }, select: USER_FIELDS });
}

export async function updateRole(actorId, userId, role) {
  if (!ASSIGNABLE_ROLES.includes(role)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Недопустимая роль');
  }
  if (actorId === userId) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Нельзя менять собственную роль');
  }
  await ensureExists(userId);
  return prisma.user.update({ where: { id: userId }, data: { role }, select: { id: true, role: true } });
}

export async function setBlocked(actorId, userId, isBlocked) {
  if (typeof isBlocked !== 'boolean') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Поле isBlocked должно быть boolean');
  }
  if (actorId === userId) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Нельзя заблокировать самого себя');
  }
  await ensureExists(userId);
  return prisma.user.update({
    where: { id: userId },
    data: { isBlocked },
    select: { id: true, isBlocked: true },
  });
}

async function ensureExists(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'Пользователь не найден');
}
