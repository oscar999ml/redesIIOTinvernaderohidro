// src/utils/logger.js
import { createLogger, format, transports } from 'winston';
import { env } from '../config/env.js';

const { combine, timestamp, colorize, printf } = format;

const logFormat = printf(({ level, message, timestamp }) =>
  `${timestamp} [${level}] ${message}`
);

export const logger = createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp({ format: 'HH:mm:ss' }), colorize(), logFormat),
  transports: [new transports.Console()],
});
