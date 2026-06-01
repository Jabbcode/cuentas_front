import * as Sentry from '@sentry/react';

export function initSentry(): void {
  if (!import.meta.env.PROD || !import.meta.env.VITE_SENTRY_DSN) return;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN as string,
    environment: 'production',
    tracesSampleRate: 0.1,
  });
}
