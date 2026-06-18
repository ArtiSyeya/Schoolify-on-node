import { ApiError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export function notFound(req, res) {
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Маршрут не найден' } });
}

// Единый обработчик ошибок — последний middleware в цепочке.
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Ожидаемые (бизнес-)ошибки: отдаём как есть; 5xx среди них всё же логируем.
  if (err instanceof ApiError) {
    if (err.status >= 500) {
      logger.error(`ApiError ${err.code}: ${err.message}`, { url: req.originalUrl });
    }
    return res
      .status(err.status)
      .json({ success: false, error: { code: err.code, message: err.message } });
  }

  // Непредвиденная ошибка: логируем с контекстом запроса и стеком.
  logger.error(`Необработанная ошибка: ${err.message}`, {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id,
    stack: err.stack,
  });

  res
    .status(500)
    .json({ success: false, error: { code: 'SERVER_ERROR', message: 'Внутренняя ошибка сервера' } });
}
