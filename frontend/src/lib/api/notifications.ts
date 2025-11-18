import { apiRequest } from '@/lib/api-client';

export interface NotificationActor {
  id: string;
  displayName: string | null;
  email: string;
}

export interface NotificationPost {
  id: string;
  text: string;
}

export interface Notification {
  id: string;
  type: 'follow' | 'new_post';
  read: boolean;
  createdAt: string;
  actor: NotificationActor;
  post: NotificationPost | null;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface UnreadCountResponse {
  count: number;
}

export async function fetchNotifications(token: string): Promise<Notification[]> {
  const response = await apiRequest<NotificationsResponse>('/api/notifications', {
    method: 'GET',
    token,
  });
  return response.notifications;
}

export async function markNotificationAsRead(notificationId: string, token: string): Promise<void> {
  await apiRequest(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    token,
  });
}

export async function markAllNotificationsAsRead(token: string): Promise<void> {
  await apiRequest('/api/notifications/read-all', {
    method: 'PATCH',
    token,
  });
}

export async function getUnreadNotificationsCount(token: string): Promise<number> {
  const response = await apiRequest<UnreadCountResponse>('/api/notifications/unread-count', {
    method: 'GET',
    token,
  });
  return response.count;
}