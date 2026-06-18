import { prisma } from '../config/prisma.js';
import * as gamification from '../services/gamification.service.js';
import { ok, ApiError } from '../utils/apiResponse.js';

export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'Пользователь не найден');

    const stats = await gamification.userStats(user);
    const recentActivity = await gamification.recentActivity(user.id);

    ok(res, {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      ...stats,
      recentActivity,
    });
  } catch (e) {
    next(e);
  }
}

export async function getPublicProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'Пользователь не найден');

    const stats = await gamification.userStats(user);
    const recentActivity = await gamification.recentActivity(user.id);

    ok(res, {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      ...stats,
      recentActivity,
    });
  } catch (e) {
    next(e);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const data = {};
    if (req.body?.fullName !== undefined) {
      if (!req.body.fullName) throw new ApiError(400, 'VALIDATION_ERROR', 'Имя не может быть пустым');
      data.fullName = String(req.body.fullName);
    }
    if (req.body?.phone !== undefined) {
      data.phone = req.body.phone ? String(req.body.phone) : null;
    }
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, fullName: true, email: true, phone: true, role: true },
    });
    ok(res, user);
  } catch (e) {
    next(e);
  }
}
