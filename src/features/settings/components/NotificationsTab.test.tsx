import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationsTab } from './NotificationsTab';
import { useNotificationPreferences } from '../../../hooks/useNotifications';

vi.mock('../../../hooks/useNotifications');
const mockedUseNotificationPreferences = vi.mocked(useNotificationPreferences);

describe('NotificationsTab', () => {
  it('sin preferences cargadas: muestra el spinner', () => {
    mockedUseNotificationPreferences.mockReturnValue({
      preferences: null,
      update: vi.fn(),
    } as never);

    const { container } = render(<NotificationsTab />);

    expect(container.querySelector('.motion-safe\\:animate-spin')).toBeInTheDocument();
  });

  it('con preferences: renderiza los 3 switches con su estado', () => {
    mockedUseNotificationPreferences.mockReturnValue({
      preferences: { categoryLimit: true, debtDue: false, monthlyEmail: true },
      update: vi.fn(),
    } as never);

    render(<NotificationsTab />);

    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(3);
    expect(screen.getByText('Límite de categoría superado')).toBeInTheDocument();
    expect(screen.getByText('Deudas próximas a vencer')).toBeInTheDocument();
    expect(screen.getByText('Resumen mensual por email')).toBeInTheDocument();
  });

  it('click en un switch llama a update invirtiendo ese valor', async () => {
    const user = userEvent.setup();
    const update = vi.fn();
    mockedUseNotificationPreferences.mockReturnValue({
      preferences: { categoryLimit: true, debtDue: false, monthlyEmail: true },
      update,
    } as never);

    render(<NotificationsTab />);

    // El primer switch corresponde a categoryLimit (mismo orden que NOTIFICATION_ITEMS).
    await user.click(screen.getAllByRole('switch')[0]);

    expect(update).toHaveBeenCalledWith({ categoryLimit: false });
  });
});
