import React from 'react';
import MainScreen from './components/MainScreen';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import IssuePasswordScreen from './components/IssuePasswordScreen';
import ReceivePasswordScreen from './components/ReceivePasswordScreen';
import IssueHistoryScreen from './components/IssueHistoryScreen';
import AccessHistoryScreen from './components/AccessHistoryScreen';
import PasswordManagementScreen from './components/PasswordManagementScreen';
import NotificationsPage from './pages/NotificationsPage';
import { NotificationProvider } from './contexts/NotificationContext';

const App = () => {
  const path = window.location.pathname;

  // NotificationProvider로 감싸는 컴포넌트들은 로그인 후에만 보이는 화면들입니다
  const shouldWrapWithNotificationProvider = () => {
    const protectedRoutes = ['/main', '/issue', '/receive', '/issue-history', 
      '/access-history', '/password-management', '/notifications'];
    return protectedRoutes.includes(path);
  };

  const renderContent = () => {
    switch (path) {
      case '/main':
        return <MainScreen />;
      case '/signup':
        return <SignupScreen />;
      case '/issue':
        return <IssuePasswordScreen />;
      case '/receive':
        return <ReceivePasswordScreen />;
      case '/issue-history':
        return <IssueHistoryScreen />;
      case '/access-history':
        return <AccessHistoryScreen />;
      case '/password-management':
        return <PasswordManagementScreen/>;
      case '/notifications':
        return <NotificationsPage />;
      case '/':
        return <LoginScreen />;
      default:
        return <LoginScreen />;
    }
  };

  return (
    <div>
      {shouldWrapWithNotificationProvider() ? (
        <NotificationProvider>
          {renderContent()}
        </NotificationProvider>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default App;