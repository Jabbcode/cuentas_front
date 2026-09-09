import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { useLoginPage } from '../features/auth/login/hooks/useLoginPage';

vi.mock('../features/auth/login/hooks/useLoginPage');
const mockedUseLoginPage = vi.mocked(useLoginPage);

function baseReturn(overrides: Partial<ReturnType<typeof useLoginPage>> = {}) {
  return {
    email: '',
    password: '',
    error: '',
    loading: false,
    isAuthLoading: false,
    isAuthenticated: false,
    setEmail: vi.fn(),
    setPassword: vi.fn(),
    handleSubmit: vi.fn(),
    ...overrides,
  };
}

describe('LoginPage', () => {
  it('isAuthLoading=true muestra el spinner, no el formulario', () => {
    mockedUseLoginPage.mockReturnValue(baseReturn({ isAuthLoading: true }));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: 'Iniciar sesión' })).not.toBeInTheDocument();
  });

  it('isAuthenticated=true redirige (no muestra el formulario de login)', () => {
    mockedUseLoginPage.mockReturnValue(baseReturn({ isAuthenticated: true }));

    render(
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: 'Iniciar sesión' })).not.toBeInTheDocument();
  });

  it('estado normal: renderiza el LoginForm con los valores del hook', () => {
    mockedUseLoginPage.mockReturnValue(baseReturn({ email: 'a@a.com' }));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Email')).toHaveValue('a@a.com');
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });
});
