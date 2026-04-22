import pino from 'pino';
import { env, isCI } from '@config/env';

const baseLogger = pino({
  level: env.LOG_LEVEL,
  base: { env: env.TEST_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isCI
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss.l',
            ignore: 'pid,hostname,env',
            singleLine: false,
          },
        },
      }),
});

export type Logger = pino.Logger;

export const logger: Logger = baseLogger;

export const childLogger = (bindings: Record<string, unknown>): Logger =>
  baseLogger.child(bindings);
