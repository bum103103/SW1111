import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SelectUserPage from './components/SelectUserPage';
import MyBaeminPage from './components/MyBaeminPage';
import DeliveryFlow from './components/DeliveryFlow';
import SettingsPage from './components/SettingsPage';
import { NotificationProvider } from './contexts/NotificationContext';

const App = () => {
    return (
        <Router>
            <NotificationProvider>
                <div className="w-full">
                    <Routes>
                        {/* 초기 선택 화면 */}
                        <Route path="/" element={<SelectUserPage />} />
                        
                        {/* 배달원 화면 */}
                        <Route path="/delivery-flow" element={<DeliveryFlow />} />
                        
                        {/* 배민 화면 */}
                        <Route path="/baemin" element={<MyBaeminPage />} />
                        
                        {/* 설정 페이지 */}
                        <Route path="/settings" element={<SettingsPage />} />
                        
                        {/* 도어락 설정 화면 (배민 화면의 설정 아이콘 클릭 시) */}
                        <Route path="/B/1" element={<DeliveryFlow />} />
                    </Routes>
                </div>
            </NotificationProvider>
        </Router>
    );
};

export default App;