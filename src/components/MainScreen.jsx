import React from 'react';
import { Key, Users, Bell, Settings, ChevronRight } from 'lucide-react';

const MainScreen = () => {
  const menuList = [
    {
      type: '1회용 비밀번호 발급하기',
      description: '배달기사, 방문자를 위한 비밀번호 발급',
      icon: <Key className="h-6 w-6 text-blue-500" />,
      path: '/issue'
    },
    {
      type: '1회용 비밀번호 발급받기',
      description: '등록된 사용자를 위한 비밀번호 수령',
      icon: <Users className="h-6 w-6 text-green-500" />,
      path: '/receive'
    },
    {
      type: '긴급출동 관리',
      description: '119, 112 긴급출동 시 마스터키 발급',
      icon: <Bell className="h-6 w-6 text-red-500" />,
      path: '/emergency'
    },
    {
      type: '출입 기록',
      description: '도어락 사용 이력 조회',
      icon: <Settings className="h-6 w-6 text-gray-500" />,
      path: '/history'
    }
  ];

  const handleItemClick = (path) => {
    window.location.href = path;
  };

  return (
    <div className="h-screen w-1/2 mx-auto bg-white flex flex-col">
      <div className="px-4 py-3 border-b">
        <h1 className="text-xl font-semibold text-center">메인화면</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <div className="divide-y">
          {menuList.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleItemClick(item.path)}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-50 rounded-xl">
                  {item.icon}
                </div>
                <div>
                  <div className="text-lg font-medium">{item.type}</div>
                  <div className="text-gray-500 text-sm">
                    {item.description}
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainScreen;