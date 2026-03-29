'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead, getUserToken } from '@/lib/api';

export interface AppNotification {
  _id: string;
  type: 'order_status' | 'order_placed' | 'promo';
  title: string;
  message: string;
  read: boolean;
  orderId?: string;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const refresh = useCallback(async () => {
    if (!getUserToken()) { setNotifications([]); return; }
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('authchange', handler);
    return () => window.removeEventListener('authchange', handler);
  }, [refresh]);

  // Poll for new notifications every 60 seconds while logged in
  useEffect(() => {
    const interval = setInterval(() => {
      if (getUserToken()) refresh();
    }, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const markRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch { /* noop */ }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* noop */ }
  };

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, loading, markRead, markAllRead, refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
};
