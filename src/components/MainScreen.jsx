import React from 'react';
import { Key, Users, Bell, Settings, History, ChevronRight } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const MainScreen = () => {
  const { notifications, unreadCount } = useNotifications();
  
  // 읽지 않은 비밀번호 발급 알림 수 계산
  const unreadPasswordCount = notifications.filter(
    n => n.type === 'password_issued' && !n.read_at
  ).length;

  const menuList = [
    {
      type: '1회용 비밀번호 발급하기',
      description: '배달기사, 방문자를 위한 비밀번호 발급',
      icon: <Key className="h-6 w-6 text-blue-500" />,
      path: '/issue',
      enabled: true
    },
    {
      type: '1회용 비밀번호 발급받기',
      description: '등록된 사용자를 위한 비밀번호 수령',
      icon: (
        <div className="relative">
          <Users className="h-6 w-6 text-green-500" />
          {unreadPasswordCount > 0 && (
            <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
              {unreadPasswordCount}
            </span>
          )}
        </div>
      ),
      path: '/receive',
      enabled: true
    },
    {
      type: '비밀번호 관리',
      description: '발급한 비밀번호 조회 및 관리',
      icon: <Key className="h-6 w-6 text-orange-500" />,
      path: '/password-management',
      enabled: true
    },
    {
      type: '발급 기록',
      description: '비밀번호 발급 내역 조회',
      icon: <History className="h-6 w-6 text-purple-500" />,
      path: '/issue-history',
      enabled: true
    },
    {
      type: '출입 기록',
      description: '도어락 사용 이력 조회',
      icon: <Settings className="h-6 w-6 text-gray-500" />,
      path: '/access-history',
      enabled: true
    }
  ];

  const handleItemClick = (path, enabled) => {
    if (!enabled) return;
    window.location.href = path;
  };

  return (
    <div className="min-h-screen w-full md:w-1/2 mx-auto bg-white flex flex-col">
      <div className="px-4 py-6 border-b flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-center flex-1">메인화면</h1>
        <button 
          onClick={() => window.location.href = '/notifications'}
          className="relative p-2"
        >
          <Bell className="h-6 w-6 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <div className="divide-y">
          {menuList.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 ${
                item.enabled ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => handleItemClick(item.path, item.enabled)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  {item.icon}
                </div>
                <div>
                  <div className="text-base font-medium">{item.type}</div>
                  <div className="text-gray-500 text-sm">
                    {item.description}
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainScreen;