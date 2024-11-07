import React from 'react';
import MainScreen from './components/MainScreen';

const App = () => {
  // URL 경로를 가져옵니다
  const path = window.location.pathname;

  // 현재 경로에 따라 적절한 컴포넌트를 렌더링합니다
  const renderContent = () => {
    switch (path) {
      case '/main':
        return <MainScreen />;
      
      default:
        // 기본 랜딩 페이지 - 빈 화면
        return (
          <div className="w-full h-screen flex items-center justify-center bg-gray-50">
            <button
              onClick={() => window.location.href = '/main'}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              메인화면으로 이동
            </button>
          </div>
        );
    }
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default App;