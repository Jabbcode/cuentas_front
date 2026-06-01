import * as Sentry from '@sentry/react';
import type { LogCategory } from './types';

type LogData = Record<string, unknown>;

export const logger = {
  info: (category: LogCategory, message: string, data?: LogData): void => {
    Sentry.logger.info(message, { category, ...data });
  },

  warn: (category: LogCategory, message: string, data?: LogData): void => {
    Sentry.logger.warn(message, { category, ...data });
  },

  error: (category: LogCategory, message: string, err?: unknown, data?: LogData): void => {
    Sentry.logger.error(message, { category, ...data });
    if (err) Sentry.captureException(err, { extra: { message, category, ...data } });
  },
};
