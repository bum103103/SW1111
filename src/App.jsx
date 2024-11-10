import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SelectUserPage from './components/SelectUserPage';
import MyBaeminPage from './components/MyBaeminPage';
import DeliveryFlow from './components/DeliveryFlow';
import SettingsPage from './components/SettingsPage';
import DoorSettingsPage from './components/DoorSettingsPage';
import TestPasswordManagementPage from './components/TestPasswordManagementPage';
import AccessHistoryPage from './components/AccessHistoryPage'; // 새로 추가된 페이지 임포트
import { NotificationProvider } from './contexts/NotificationContext';

const App = () => {
    return (
        <Router>
            <NotificationProvider>
                <div className="w-full">
                    <Routes>
                        <Route path="/" element={<SelectUserPage />} />
                        <Route path="/delivery-flow" element={<DeliveryFlow />} />
                        <Route path="/baemin" element={<MyBaeminPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/doorsettings" element={<DoorSettingsPage />} />
                        <Route path="/test-password-management" element={<TestPasswordManagementPage />} />
                        <Route path="/access-history" element={<AccessHistoryPage />} /> {/* AccessHistoryPage 라우트 추가 */}
                    </Routes>
                </div>
            </NotificationProvider>
        </Router>
    );
};

export default App;
