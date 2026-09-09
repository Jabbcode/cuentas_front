import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useNotifications, useNotificationPreferences } from './useNotifications';
import type { Notification, NotificationPreferences } from '../types';

vi.mock('../api/notifications.api', () => ({
  notificationsApi: {
    getAll: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    delete: vi.fn(),
    getPreferences: vi.fn(),
    updatePreferences: vi.fn(),
  },
}));

import { notificationsApi } from '../api/notifications.api';

function fakeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'n1',
    read: false,
    title: 'x',
    message: 'y',
    ...overrides,
  } as unknown as Notification;
}

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga notificaciones y unreadCount al montar', async () => {
    vi.mocked(notificationsApi.getAll).mockResolvedValue({
      notifications: [fakeNotification()],
      unreadCount: 1,
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.unreadCount).toBe(1);
  });

  it('si la carga falla, no rompe (falla en silencio) y deja loading=false', async () => {
    vi.mocked(notificationsApi.getAll).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.notifications).toEqual([]);
  });

  it('markAsRead: marca solo esa notificación como leída y decrementa unreadCount', async () => {
    vi.mocked(notificationsApi.getAll).mockResolvedValue({
      notifications: [fakeNotification({ id: 'n1' }), fakeNotification({ id: 'n2' })],
      unreadCount: 2,
    });
    vi.mocked(notificationsApi.markAsRead).mockResolvedValue(undefined as never);
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAsRead('n1');
    });

    expect(result.current.notifications.find((n) => n.id === 'n1')?.read).toBe(true);
    expect(result.current.notifications.find((n) => n.id === 'n2')?.read).toBe(false);
    expect(result.current.unreadCount).toBe(1);
  });

  it('markAllAsRead: marca todas como leídas y unreadCount en 0', async () => {
    vi.mocked(notificationsApi.getAll).mockResolvedValue({
      notifications: [fakeNotification({ id: 'n1' }), fakeNotification({ id: 'n2' })],
      unreadCount: 2,
    });
    vi.mocked(notificationsApi.markAllAsRead).mockResolvedValue(undefined as never);
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(result.current.notifications.every((n) => n.read)).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('deleteNotification: si la eliminada no estaba leída, decrementa unreadCount', async () => {
    vi.mocked(notificationsApi.getAll).mockResolvedValue({
      notifications: [fakeNotification({ id: 'n1', read: false })],
      unreadCount: 1,
    });
    vi.mocked(notificationsApi.delete).mockResolvedValue(undefined as never);
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteNotification('n1');
    });

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.unreadCount).toBe(0);
  });

  it('deleteNotification: si la eliminada ya estaba leída, no toca unreadCount', async () => {
    vi.mocked(notificationsApi.getAll).mockResolvedValue({
      notifications: [fakeNotification({ id: 'n1', read: true })],
      unreadCount: 0,
    });
    vi.mocked(notificationsApi.delete).mockResolvedValue(undefined as never);
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteNotification('n1');
    });

    expect(result.current.unreadCount).toBe(0);
  });
});

describe('useNotificationPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga las preferencias al montar', async () => {
    const prefs = { categoryLimit: true } as unknown as NotificationPreferences;
    vi.mocked(notificationsApi.getPreferences).mockResolvedValue(prefs);

    const { result } = renderHook(() => useNotificationPreferences());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.preferences).toEqual(prefs);
  });

  it('update: actualiza las preferencias y las devuelve', async () => {
    const updated = { categoryLimit: false } as unknown as NotificationPreferences;
    vi.mocked(notificationsApi.getPreferences).mockResolvedValue({} as NotificationPreferences);
    vi.mocked(notificationsApi.updatePreferences).mockResolvedValue(updated);

    const { result } = renderHook(() => useNotificationPreferences());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const returned = await act(async () => result.current.update({ categoryLimit: false }));

    expect(notificationsApi.updatePreferences).toHaveBeenCalledWith({ categoryLimit: false });
    expect(result.current.preferences).toEqual(updated);
    expect(returned).toEqual(updated);
  });
});
