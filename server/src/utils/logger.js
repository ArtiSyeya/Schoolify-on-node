import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, '../../logs');

fs.mkdirSync(LOG_DIR, { recursive: true });

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

function appendLine(file, line) {
  fs.appendFile(path.join(LOG_DIR, file), line + '\n', () => {});
}

function log(level, message, meta) {
  if (LEVELS[level] > currentLevel) return;

  const entry = {
    time: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta } : {}),
  };

  const printer = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  printer(`[${entry.time}] ${level.toUpperCase()}: ${message}`);
  appendLine('app.log', JSON.stringify(entry));
  if (level === 'error') appendLine('error.log', JSON.stringify(entry));
}

export const logger = {
  error: (message, meta) => log('error', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  info: (message, meta) => log('info', message, meta),
  debug: (message, meta) => log('debug', message, meta),
};
