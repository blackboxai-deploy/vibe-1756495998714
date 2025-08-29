'use client';

import { useState, useEffect, useCallback } from 'react';
import { Notification, NotificationType } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  getNotificationsByType: (type: NotificationType) => Notification[];
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { notifications, addNotification: addAppNotification, markNotificationAsRead } = useApp();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter notifications for current user
  const userNotifications = notifications.filter(
    notification => notification.userId === user?.email || notification.userId === user?.id
  );

  const unreadCount = userNotifications.filter(notification => !notification.read).length;

  const markAsRead = useCallback((notificationId: string) => {
    try {
      markNotificationAsRead(notificationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, [markNotificationAsRead]);

  const markAllAsRead = useCallback(() => {
    try {
      userNotifications
        .filter(notification => !notification.read)
        .forEach(notification => markNotificationAsRead(notification.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  }, [userNotifications, markNotificationAsRead]);

  const deleteNotification = useCallback((notificationId: string) => {
    try {
      // In a real app, this would call an API to delete the notification
      // For now, we'll just mark it as read since we don't have a delete action in context
      markNotificationAsRead(notificationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  }, [markNotificationAsRead]);

  const clearAll = useCallback(() => {
    try {
      userNotifications.forEach(notification => markNotificationAsRead(notification.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear all notifications');
    }
  }, [userNotifications, markNotificationAsRead]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      addAppNotification(notification);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add notification');
    }
  }, [addAppNotification]);

  const getNotificationsByType = useCallback((type: NotificationType): Notification[] => {
    return userNotifications.filter(notification => notification.type === type);
  }, [userNotifications]);

  const refreshNotifications = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call to refresh notifications
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would fetch fresh notifications from the server
      // For now, we'll just clear any errors
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshNotifications]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [error]);

  return {
    notifications: userNotifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
    getNotificationsByType,
    refreshNotifications,
  };
}

// Hook for real-time notification updates
export function useRealtimeNotifications() {
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Simulate real-time notifications
    const interval = setInterval(() => {
      // Randomly generate notifications for demo purposes
      if (Math.random() > 0.95) { // 5% chance every interval
        const notificationTypes: NotificationType[] = [
          NotificationType.PACKAGE_UPDATE,
          NotificationType.DELIVERY_ASSIGNED,
          NotificationType.PAYMENT_PROCESSED,
          NotificationType.DELIVERY_COMPLETED,
          NotificationType.SYSTEM_ALERT,
          NotificationType.PROMOTION
        ];

        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        
        const messages = {
          [NotificationType.PACKAGE_UPDATE]: 'Your package status has been updated',
          [NotificationType.DELIVERY_ASSIGNED]: 'A new delivery has been assigned to you',
          [NotificationType.PAYMENT_PROCESSED]: 'Payment has been processed successfully',
          [NotificationType.DELIVERY_COMPLETED]: 'Delivery has been completed',
          [NotificationType.SYSTEM_ALERT]: 'System maintenance scheduled',
          [NotificationType.PROMOTION]: 'Special offer available for you!'
        };

        addNotification({
          userId: user.email,
          type: randomType,
          title: 'New Update',
          message: messages[randomType],
          read: false
        });
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [user, addNotification]);
}

// Hook for notification permissions and browser notifications
export function useNotificationPermissions() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [isSupported]);

  const showBrowserNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted' && isSupported) {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  }, [permission, isSupported]);

  return {
    permission,
    isSupported,
    requestPermission,
    showBrowserNotification
  };
}