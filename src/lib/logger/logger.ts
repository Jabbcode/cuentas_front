import * as Sentry from '@sentry/react';
import type { LogCategory } from './types';

type LogData = Record<string, unknown>;

function breadcrumb(
  level: Sentry.SeverityLevel,
  category: LogCategory,
  message: string,
  data?: LogData
): void {
  Sentry.addBreadcrumb({
    level,
    category,
    message,
    data,
    timestamp: Date.now() / 1000,
  });
}

export const logger = {
  info: (category: LogCategory, message: string, data?: LogData): void =>
    breadcrumb('info', category, message, data),

  warn: (category: LogCategory, message: string, data?: LogData): void =>
    breadcrumb('warning', category, message, data),

  error: (category: LogCategory, message: string, err?: unknown, data?: LogData): void => {
    breadcrumb('error', category, message, data);
    if (err) Sentry.captureException(err, { extra: { message, ...data } });
  },
};
