import axiosClient from './axiosClient';
import type { Notification } from '../types/notification.types';

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export async function fetchNotifications(): Promise<NotificationsResponse> {
  const response = await axiosClient.get('/notifications');
  return response.data;
}

export async function markNotificationAsRead(id: string): Promise<{ unreadCount: number }> {
  const response = await axiosClient.patch(`/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsAsRead(): Promise<{ unreadCount: number }> {
  const response = await axiosClient.patch('/notifications/read-all');
  return response.data;
}