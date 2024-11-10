import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TestPasswordManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = React.useState(null);

  React.useEffect(() => {
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

  return (
    <div className="w-full max-w-md mx-auto h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white p-4 flex items-center sticky top-0 z-10">
        <ArrowLeft 
          className="w-6 h-6 cursor-pointer" 
          onClick={() => navigate('/doorsettings', {
            state: {
              userId: userInfo?.userId,
              username: userInfo?.username,
              nickname: userInfo?.nickname
            }
          })}
        />
        <h1 className="text-lg font-medium ml-4">비밀번호 관리 테스트</h1>
      </div>

      {/* 본문 컨텐츠 */}
      <div className="mt-4 p-4">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">현재 사용자 정보</h2>
            {userInfo && (
              <div className="mt-2 text-gray-600">
                <p>닉네임: {userInfo.nickname}</p>
                <p>사용자명: {userInfo.username}</p>
                <p>ID: {userInfo.userId}</p>
              </div>
            )}
          </div>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">테스트 기능</h2>
            <div className="space-y-4">
              <button 
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => console.log("테스트 기능 1 클릭")}
              >
                테스트 기능 1
              </button>
              <button 
                className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => console.log("테스트 기능 2 클릭")}
              >
                테스트 기능 2
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPasswordManagementPage;