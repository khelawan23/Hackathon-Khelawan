'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthContext } from '@/lib/auth-context';
import { useNotificationCount } from '@/hooks/use-notification-count';
import { Bell, Check, MessageCircle, Heart, UserPlus, Settings, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  fetchNotifications, 
  markAllNotificationsAsRead, 
  markNotificationAsRead,
  type Notification 
} from '@/lib/api/notifications';
import { formatRelativeTime, truncateText } from '@/lib/utils';

export default function NotificationsPage() {
  const { user, token } = useAuthContext();
  const { refreshCount } = useNotificationCount(token);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    if (!token) return;

    try {
      setError(null);
      const data = await fetchNotifications(token);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadNotifications();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const handleMarkAllRead = async () => {
    if (!token || markingAllRead) return;

    try {
      setMarkingAllRead(true);
      await markAllNotificationsAsRead(token);
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      // Refresh header notification count
      refreshCount();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      await markNotificationAsRead(notificationId, token);
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      // Refresh header notification count
      refreshCount();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleRefresh = async () => {
    if (!token || refreshing) return;
    setRefreshing(true);
    await loadNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return UserPlus;
      case 'new_post':
        return MessageCircle;
      default:
        return Bell;
    }
  };

  const formatNotificationText = (notification: Notification) => {
    const actorName = notification.actor.displayName || 'Someone';
    
    switch (notification.type) {
      case 'follow':
        return `${actorName} started following you`;
      case 'new_post':
        const postPreview = notification.post ? 
          truncateText(notification.post.text, 50) : 'something new';
        return `${actorName} posted: "${postPreview}"`;
      default:
        return 'New notification';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center p-8">
            <p className="text-muted-foreground">Please log in to view your notifications.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center p-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Retrying...' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="gradient-card rounded-2xl p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-slate-600 mt-2">Stay up to date with your activity</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleRefresh} 
                  variant="ghost" 
                  size="sm"
                  disabled={loading || refreshing}
                  className="hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-200"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  onClick={handleMarkAllRead} 
                  variant="outline" 
                  size="sm"
                  disabled={markingAllRead || notifications.every(n => n.read)}
                  className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border-green-300"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {markingAllRead ? 'Marking...' : 'Mark all read'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-300"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {loading ? (
              // Loading skeletons
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="gradient-card rounded-xl p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  return (
                    <Card 
                      key={notification.id} 
                      className={`gradient-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                        !notification.read 
                          ? 'ring-2 ring-blue-500/50 bg-gradient-to-r from-blue-50/80 to-purple-50/80' 
                          : ''
                      }`}
                      onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full shadow-lg ${
                            !notification.read 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-blue-500/25' 
                              : 'bg-gradient-to-r from-slate-400 to-slate-500 text-white'
                          }`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-slate-800">
                                {formatNotificationText(notification)}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 bg-slate-100/50 px-2 py-1 rounded-full">
                                  {formatRelativeTime(notification.createdAt)}
                                </span>
                                {!notification.read && (
                                  <div className="h-3 w-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full notification-pulse"></div>
                                )}
                              </div>
                            </div>
                            {notification.type === 'new_post' && notification.post && (
                              <p className="text-sm text-slate-600 bg-slate-50/50 p-3 rounded-lg">
                                "{truncateText(notification.post.text, 80)}"
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              // Empty state
              <Card className="gradient-card rounded-xl shadow-lg">
                <CardContent className="text-center py-16">
                  <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <Bell className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="mb-2 text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    No notifications
                  </CardTitle>
                  <CardDescription className="text-lg text-slate-600">
                    You're all caught up! When you have new activity, it'll appear here.
                  </CardDescription>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}