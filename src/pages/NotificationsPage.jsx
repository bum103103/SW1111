import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationItem } from '../components/notifications/NotificationComponents';

const NotificationsPage = () => {
  const { notifications, markAllAsRead } = useNotifications();

  return (
    <div className="min-h-screen w-full md:w-1/2 mx-auto bg-white flex flex-col">
      <div className="px-4 py-6 border-b flex items-center relative">
        <button
          onClick={() => window.location.href = '/main'}
          className="absolute left-4 md:left-4"
        >
          <ChevronLeft className="h-6 w-6 text-gray-500" />
        </button>
        <h1 className="text-2xl font-semibold text-center flex-1">알림</h1>
        <button
          onClick={markAllAsRead}
          className="absolute right-4 text-sm text-blue-600 hover:text-blue-800"
        >
          모두 읽음
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
              />
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              알림이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;