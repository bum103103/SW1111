// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SelectUserPage from './components/SelectUserPage';
import MyBaeminPage from './components/MyBaeminPage';
import DeliveryFlow from './components/DeliveryFlow';
import SettingsPage from './components/SettingsPage';
import DoorSettingsPage from './components/DoorSettingsPage';
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
                    </Routes>
                </div>
            </NotificationProvider>
        </Router>
    );
};

export default App;