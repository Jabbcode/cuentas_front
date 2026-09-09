import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
}));

import * as Sentry from '@sentry/react';

function Bomb(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza los hijos normalmente si no hay error', () => {
    render(
      <ErrorBoundary>
        <div>todo bien</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('todo bien')).toBeInTheDocument();
  });

  it('un error en un hijo muestra el fallback y reporta a Sentry', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
  });
});
