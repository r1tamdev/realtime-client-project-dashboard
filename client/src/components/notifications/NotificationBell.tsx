import { useEffect, useState } from 'react';
import { fetchNotifications } from '../../api/notifications.api';
import { useSocketEvent } from '../../hooks/useSocketEvent';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications().then((data) => setUnreadCount(data.unreadCount));
  }, []);

  useSocketEvent<{ unreadCount: number }>('notification:count', (data) => {
    setUnreadCount(data.unreadCount);
  });

  return (
    <div className="relative">
      <button onClick={() => setIsOpen((prev) => !prev)} className="relative p-2">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} onReadAll={() => setUnreadCount(0)} />}
    </div>
  );
}