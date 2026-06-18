import app from './src/app.js';
import { env } from './src/config/env.js';
import { logger } from './src/utils/logger.js';

app.listen(env.port, () => {
  logger.info(`API запущен: http://localhost:${env.port}/api/v1`);
});
