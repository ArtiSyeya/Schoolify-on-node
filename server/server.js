import app from './src/app.js';
import { env } from './src/config/env.js';

app.listen(env.port, () => {
  console.log(`API запущен: http://localhost:${env.port}/api/v1`);
});
