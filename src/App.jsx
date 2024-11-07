import React from 'react';
import MainScreen from './components/MainScreen';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';

const App = () => {
  // URL 경로를 가져옵니다
  const path = window.location.pathname;

  // 현재 경로에 따라 적절한 컴포넌트를 렌더링합니다
  const renderContent = () => {
    switch (path) {
      case '/main':
        return <MainScreen />;
      case '/signup':
        return <SignupScreen />;
      case '/':
        return <LoginScreen />;
      default:
        return <LoginScreen />;
    }
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default App;