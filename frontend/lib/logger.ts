import pino, { type DestinationStream, type LoggerOptions } from 'pino';

const allowedLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'];
export const loggerOptions: LoggerOptions = {
  level: allowedLevels.includes(process.env.LOG_LEVEL ?? '') ? process.env.LOG_LEVEL : 'info',
  base: { service: 'disputeguard', environment: process.env.NODE_ENV ?? 'development' },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'password', 'passwordHash', 'token', 'accessToken', 'refreshToken',
      '*.password', '*.passwordHash', '*.token', '*.accessToken', '*.refreshToken',
      'req.headers.authorization', 'req.headers.cookie',
      'headers.authorization', 'headers.cookie', 'headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },
};

// Plain JSON to stdout; no pretty-print transport in the server process.
export function createLogger(destination?: DestinationStream) {
  return destination ? pino(loggerOptions, destination) : pino(loggerOptions);
}
export const logger = createLogger();
