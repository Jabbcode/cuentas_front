import { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '../api/notifications.api';
import type { Notification, NotificationPreferences } from '../types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // silently fail — notifications are non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [load]);

  const markAsRead = useCallback(async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationsApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback(
    async (id: string) => {
      const target = notifications.find((n) => n.id === id);
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.read) setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    reload: load,
  };
}

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi
      .getPreferences()
      .then(setPreferences)
      .finally(() => setLoading(false));
  }, []);

  const update = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    const updated = await notificationsApi.updatePreferences(prefs);
    setPreferences(updated);
    return updated;
  }, []);

  return { preferences, loading, update };
}
