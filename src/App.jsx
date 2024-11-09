import React from 'react';
import MainScreen from './components/MainScreen';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import IssuePasswordScreen from './components/IssuePasswordScreen';
import ReceivePasswordScreen from './components/ReceivePasswordScreen';
import IssueHistoryScreen from './components/IssueHistoryScreen';
import AccessHistoryScreen from './components/AccessHistoryScreen';

const App = () => {
  const path = window.location.pathname;

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