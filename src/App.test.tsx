import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('./features/auth/api', () => ({
  authApi: {
    getMe: vi.fn().mockRejectedValue(new Error('no session')),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('./lib/sentry', () => ({
  setSentryUser: vi.fn(),
  clearSentryUser: vi.fn(),
}));

import App from './App';

describe('App', () => {
  it('monta sin crashear y muestra la ruta de login por defecto', async () => {
    window.history.pushState({}, '', '/login');
    render(<App />);

    expect(await screen.findByText('MisCuentas')).toBeInTheDocument();
    expect(screen.getByText('Inicia sesión para gestionar tus finanzas')).toBeInTheDocument();
  });
});
