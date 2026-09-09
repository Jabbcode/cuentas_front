import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationBell } from './NotificationBell';
import type { Notification } from '../../types';

const { mockUseNotifications } = vi.hoisted(() => ({ mockUseNotifications: vi.fn() }));

vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: mockUseNotifications,
}));

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'n-1',
    userId: 'u1',
    type: 'debt_due',
    title: 'Deuda por vencer',
    message: 'Tu deuda vence pronto',
    read: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  } as Notification;
}

describe('NotificationBell', () => {
  beforeEach(() => {
    mockUseNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      deleteNotification: vi.fn(),
    });
  });

  it('sin notificaciones no muestra el badge', () => {
    render(<NotificationBell />);
    expect(screen.queryByText('9+')).not.toBeInTheDocument();
  });

  it('con no leídas muestra el badge, capado en "9+"', () => {
    mockUseNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 15,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      deleteNotification: vi.fn(),
    });
    render(<NotificationBell />);

    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('click en la campana abre el panel; sin notificaciones muestra el mensaje vacío', async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByLabelText('Notificaciones'));

    expect(screen.getByText('No tienes notificaciones')).toBeInTheDocument();
  });

  it('con notificaciones las lista y permite marcar como leída / eliminar', async () => {
    const markAsRead = vi.fn();
    const deleteNotification = vi.fn();
    mockUseNotifications.mockReturnValue({
      notifications: [makeNotification()],
      unreadCount: 1,
      markAsRead,
      markAllAsRead: vi.fn(),
      deleteNotification,
    });
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByLabelText('Notificaciones'));
    expect(screen.getByText('Deuda por vencer')).toBeInTheDocument();

    await user.click(screen.getByTitle('Marcar como leída'));
    expect(markAsRead).toHaveBeenCalledWith('n-1');

    await user.click(screen.getByTitle('Eliminar'));
    expect(deleteNotification).toHaveBeenCalledWith('n-1');
  });

  it('click en "Leer todas" llama markAllAsRead', async () => {
    const markAllAsRead = vi.fn();
    mockUseNotifications.mockReturnValue({
      notifications: [makeNotification()],
      unreadCount: 1,
      markAsRead: vi.fn(),
      markAllAsRead,
      deleteNotification: vi.fn(),
    });
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByLabelText('Notificaciones'));
    await user.click(screen.getByText('Leer todas'));

    expect(markAllAsRead).toHaveBeenCalledTimes(1);
  });
});
