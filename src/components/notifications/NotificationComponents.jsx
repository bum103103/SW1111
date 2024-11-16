// components/notifications/NotificationIcon.jsx
import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export const NotificationIcon = () => {
  const { unreadCount } = useNotifications();

  return (
    <div className="relative">
      <Bell className="h-6 w-6 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </div>
  );
};

// components/notifications/NotificationList.jsx
export const NotificationList = () => {
  const { notifications, markAllAsRead } = useNotifications();

  return (
    <div className="bg-white rounded-lg shadow-lg border">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold">알림</h3>
        <button
          onClick={markAllAsRead}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          모두 읽음
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.map(notification => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
};

// components/notifications/NotificationItem.jsx
export const NotificationItem = ({ notification }) => {
  const { markAsRead } = useNotifications();
  
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div
      className={`p-4 border-b hover:bg-gray-50 ${
        !notification.read_at ? 'bg-blue-50' : ''
      }`}
      onClick={() => markAsRead(notification.id)}
    >
      <div className="font-medium">{notification.title}</div>
      <div className="text-sm text-gray-600">{notification.message}</div>
      <div className="text-xs text-gray-400 mt-1">
        {formatDate(notification.created_at)}
      </div>
    </div>
  );
};