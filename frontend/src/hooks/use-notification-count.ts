import { useState, useEffect } from 'react';
import { getUnreadNotificationsCount } from '@/lib/api/notifications';

export function useNotificationCount(token: string | null) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCount = async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const count = await getUnreadNotificationsCount(token);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();

    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchCount, 30000);

    return () => clearInterval(interval);
  }, [token]);

  // Refresh count when returning to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && token) {
        fetchCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [token]);

  return {
    unreadCount,
    loading,
    refreshCount: fetchCount,
    setUnreadCount // Allow manual updates
  };
}