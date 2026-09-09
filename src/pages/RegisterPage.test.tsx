import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';
import { useRegisterPage } from '../features/auth/register/hooks/useRegisterPage';

vi.mock('../features/auth/register/hooks/useRegisterPage');
const mockedUseRegisterPage = vi.mocked(useRegisterPage);

function baseReturn(overrides: Partial<ReturnType<typeof useRegisterPage>> = {}) {
  return {
    name: '',
    email: '',
    password: '',
    error: '',
    loading: false,
    isAuthLoading: false,
    isAuthenticated: false,
    setName: vi.fn(),
    setEmail: vi.fn(),
    setPassword: vi.fn(),
    handleSubmit: vi.fn(),
    ...overrides,
  };
}

describe('RegisterPage', () => {
  it('isAuthLoading=true no muestra el formulario', () => {
    mockedUseRegisterPage.mockReturnValue(baseReturn({ isAuthLoading: true }));

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: 'Crear cuenta' })).not.toBeInTheDocument();
  });

  it('isAuthenticated=true no muestra el formulario (redirige)', () => {
    mockedUseRegisterPage.mockReturnValue(baseReturn({ isAuthenticated: true }));

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: 'Crear cuenta' })).not.toBeInTheDocument();
  });

  it('estado normal: renderiza el RegisterForm con los valores del hook', () => {
    mockedUseRegisterPage.mockReturnValue(baseReturn({ name: 'Juan' }));

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Nombre')).toHaveValue('Juan');
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument();
  });
});
