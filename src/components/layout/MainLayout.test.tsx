import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './MainLayout';

const { mockUseAuth } = vi.hoisted(() => ({ mockUseAuth: vi.fn() }));

vi.mock('../../context/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('./Sidebar', () => ({
  Sidebar: () => <div>sidebar</div>,
}));

vi.mock('./NotificationBell', () => ({
  NotificationBell: () => <div>bell</div>,
}));

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<div>contenido protegido</div>} />
        </Route>
        <Route path="/login" element={<div>página de login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('MainLayout', () => {
  it('mientras carga la sesión muestra el spinner', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
    renderLayout();

    expect(screen.queryByText('contenido protegido')).not.toBeInTheDocument();
    expect(screen.queryByText('página de login')).not.toBeInTheDocument();
  });

  it('sin sesión redirige a /login', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    renderLayout();

    expect(screen.getByText('página de login')).toBeInTheDocument();
  });

  it('con sesión renderiza el sidebar y el contenido de la ruta hija', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    renderLayout();

    expect(screen.getByText('sidebar')).toBeInTheDocument();
    expect(screen.getByText('contenido protegido')).toBeInTheDocument();
  });
});
