import React, { useState, useEffect } from 'react';
import { ArrowLeft, Key, Settings, ChevronRight, Smartphone, Bluetooth } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const DoorSettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(null);
  // localStorage에서 초기값을 가져오거나, 없으면 true로 설정
  const [isNFCEnabled, setIsNFCEnabled] = useState(
    JSON.parse(localStorage.getItem('isNFCEnabled') ?? 'true')
  );
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(
    JSON.parse(localStorage.getItem('isBluetoothEnabled') ?? 'true')
  );

  useEffect(() => {
    if (location.state?.nickname) {
      setUserInfo({
        nickname: location.state.nickname,
        username: location.state.username,
        userId: location.state.userId
      });
    } else {
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  const handleNFCToggle = () => {
    const newValue = !isNFCEnabled;
    setIsNFCEnabled(newValue);
    localStorage.setItem('isNFCEnabled', JSON.stringify(newValue));
  };

  const handleBluetoothToggle = () => {
    const newValue = !isBluetoothEnabled;
    setIsBluetoothEnabled(newValue);
    localStorage.setItem('isBluetoothEnabled', JSON.stringify(newValue));
  };

  return (
    <div className="w-full max-w-md mx-auto h-screen bg-gray-50 flex flex-col overflow-y-auto">
      {/* 헤더 */}
      <div className="bg-white p-4 flex items-center sticky top-0 z-10">
        <ArrowLeft 
          className="w-6 h-6 cursor-pointer" 
          onClick={() => navigate(-1)}
        />
        <h1 className="text-lg font-medium ml-4">도어락 관리</h1>
      </div>

      {/* 출입 권한 관리 섹션 */}
      <div className="mt-4 px-4 py-4 bg-white rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-medium">출입 권한 관리</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* NFC 버튼 */}
          <div
            className={`rounded-xl p-4 text-center flex flex-col items-center cursor-pointer transition-all duration-300 ${
              isNFCEnabled ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}
            onClick={handleNFCToggle}
          >
            <Smartphone className="h-6 w-6 mb-2" />
            <div className="font-medium">NFC</div>
            <div className="text-xs">
              {isNFCEnabled ? '켜짐' : '꺼짐'}
            </div>
          </div>

          {/* Bluetooth 버튼 */}
          <div
            className={`rounded-xl p-4 text-center flex flex-col items-center cursor-pointer transition-all duration-300 ${
              isBluetoothEnabled ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}
            onClick={handleBluetoothToggle}
          >
            <Bluetooth className="h-6 w-6 mb-2" />
            <div className="font-medium">블루투스</div>
            <div className="text-xs">
              {isBluetoothEnabled ? '켜짐' : '꺼짐'}
            </div>
          </div>
        </div>
      </div>

      {/* 비밀번호 관리 섹션 */}
      <div className="mt-4">
        <div className="px-4 py-2 text-sm text-gray-500">비밀번호 관리</div>
        <div className="bg-white">
          <div 
            className="px-4 py-4 flex justify-between items-center cursor-pointer"
            onClick={() => navigate('/test-password-management', {
              state: {
                userId: userInfo?.userId,
                username: userInfo?.username,
                nickname: userInfo?.nickname
              }
            })}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Key className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="font-medium">비밀번호 관리</div>
                <div className="text-sm text-gray-500">
                  발급한 비밀번호 조회 및 관리
                </div>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* 이력 조회 섹션 */}
      <div className="mt-4">
        <div className="px-4 py-2 text-sm text-gray-500">이력 조회</div>
        <div className="bg-white">
          <div 
            className="px-4 py-4 flex justify-between items-center cursor-pointer"
            onClick={() => navigate('/access-history', {
              state: {
                userId: userInfo?.userId,
                username: userInfo?.username,
                nickname: userInfo?.nickname
              }
            })}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Settings className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <div className="font-medium">출입 기록</div>
                <div className="text-sm text-gray-500">
                  도어락 사용 이력 조회
                </div>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoorSettingsPage;