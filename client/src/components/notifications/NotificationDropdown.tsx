import { useEffect, useState } from 'react';
import type { Notification } from '../../types/notification.types';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../api/notifications.api';
import { formatRelativeTime } from '../../utils/formatRelativeTime';

interface NotificationDropdownProps {
  onClose: () => void;
  onReadAll: () => void;
}

export default function NotificationDropdown({ onClose, onReadAll }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchNotifications().then((data) => setNotifications(data.notifications));
  }, []);

  async function handleMarkRead(id: string) {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  async function handleMarkAllRead() {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    onReadAll();
  }

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <span className="font-medium text-sm">Notifications</span>
        <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500 p-4">No notifications</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
              className={`px-4 py-3 text-sm border-b cursor-pointer ${n.isRead ? 'bg-white' : 'bg-blue-50'}`}
            >
              <p>{n.message}</p>
              <span className="text-xs text-gray-400">{formatRelativeTime(n.createdAt)}</span>
            </div>
          ))
        )}
      </div>

      <button onClick={onClose} className="w-full text-center text-xs text-gray-500 py-2 border-t">
        Close
      </button>
    </div>
  );
}