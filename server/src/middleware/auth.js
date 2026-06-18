import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiResponse.js';

// Проверка JWT + что пользователь всё ещё существует и не заблокирован.
// Кладёт актуальные { id, role } из БД в req.user.
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new ApiError(401, 'UNAUTHORIZED', 'Требуется авторизация'));

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Недействительный токен'));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true, isBlocked: true },
    });
    // пользователь удалён или БД пересеяна (старый токен) → не 500, а понятная 401
    if (!user) {
      return next(new ApiError(401, 'UNAUTHORIZED', 'Сессия недействительна, войдите заново'));
    }
    if (user.isBlocked) {
      return next(new ApiError(403, 'USER_BLOCKED', 'Пользователь заблокирован'));
    }
    req.user = { id: user.id, role: user.role };
    next();
  } catch (e) {
    next(e); // настоящая ошибка БД — пусть уйдёт в errorHandler, не маскируем
  }
}

// Проверка роли. Применять после requireAuth.
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'FORBIDDEN', 'Недостаточно прав'));
    }
    next();
  };
