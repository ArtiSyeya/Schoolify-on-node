import { logger } from '../utils/logger.js';

// Логирует каждый HTTP-запрос после ответа: метод, путь, статус, время, кто.
export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`;
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ms,
      userId: req.user?.id, // заполнится, если маршрут прошёл requireAuth
    };

    // уровень по статусу: 5xx — ошибка, 4xx — предупреждение, остальное — info
    if (res.statusCode >= 500) logger.error(message, meta);
    else if (res.statusCode >= 400) logger.warn(message, meta);
    else logger.info(message, meta);
  });

  next();
}
