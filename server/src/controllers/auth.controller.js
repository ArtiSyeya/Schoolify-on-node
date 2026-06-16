import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { ok, ApiError } from '../utils/apiResponse.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Email и пароль обязательны');
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Неверный логин или пароль');
    }
    if (user.isBlocked) {
      throw new ApiError(403, 'USER_BLOCKED', 'Пользователь заблокирован');
    }
    const token = jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    });
    ok(res, {
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (e) {
    next(e);
  }
}

export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, fullName: true, email: true, role: true },
    });
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'Пользователь не найден');
    ok(res, user);
  } catch (e) {
    next(e);
  }
}
