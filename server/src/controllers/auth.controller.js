import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { ok, ApiError } from '../utils/apiResponse.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function issueToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function publicUser(user) {
  return { id: user.id, fullName: user.fullName, email: user.email, role: user.role };
}

export async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body || {};
    if (!fullName || !email || !password) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Имя, email и пароль обязательны');
    }
    if (!EMAIL_RE.test(email)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Некорректный email');
    }
    if (String(password).length < 6) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Пароль должен быть не короче 6 символов');
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new ApiError(409, 'EMAIL_TAKEN', 'Email уже зарегистрирован');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash, role: 'STUDENT' },
    });

    ok(res, { token: issueToken(user), user: publicUser(user) }, 201);
  } catch (e) {
    next(e);
  }
}

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
    ok(res, { token: issueToken(user), user: publicUser(user) });
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
