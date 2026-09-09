import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const { mockUseAuth } = vi.hoisted(() => ({ mockUseAuth: vi.fn() }));

vi.mock('../../context/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('./NotificationBell', () => ({
  NotificationBell: () => <div>bell</div>,
}));

describe('Sidebar', () => {
  it('muestra el nombre y email del usuario', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', name: 'Jane Doe', email: 'jane@test.com' },
      logout: vi.fn(),
    });
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@test.com')).toBeInTheDocument();
  });

  it('muestra los links de navegación principales', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', name: 'Jane', email: 'j@test.com' },
      logout: vi.fn(),
    });
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /Dashboard/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Transacciones/i })).toHaveAttribute(
      'href',
      '/transactions'
    );
  });

  it('click en "Cerrar sesión" llama logout', async () => {
    const logout = vi.fn();
    mockUseAuth.mockReturnValue({ user: { id: 'u1', name: 'Jane', email: 'j@test.com' }, logout });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    await user.click(screen.getByText('Cerrar sesión'));

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('click en un link de navegación llama onClose (cierre en mobile)', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', name: 'Jane', email: 'j@test.com' },
      logout: vi.fn(),
    });
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Sidebar onClose={onClose} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('link', { name: /Cuentas/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
