import * as Sentry from '@sentry/react';

export function initSentry(): void {
  if (!import.meta.env.PROD || !import.meta.env.VITE_SENTRY_DSN) return;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN as string,
    tunnel: `${import.meta.env.VITE_API_URL as string}/monitoring/tunnel`,
    environment: 'production',
    tracesSampleRate: 0.1,
  });
}

export function setSentryUser(user: { id: string; email: string; name: string }): void {
  Sentry.setUser({ id: user.id, email: user.email, username: user.name });
}

export function clearSentryUser(): void {
  Sentry.setUser(null);
}
