// src/components/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// 토글 스위치 컴포넌트
const ToggleSwitch = ({ isOn, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            type="button"
            className={`w-12 h-6 rounded-full relative focus:outline-none transition-colors duration-300
        ${isOn ? 'bg-teal-400' : 'bg-gray-200'}`}
        >
            <div
                className={`
          absolute w-4 h-4 bg-white rounded-full top-1
          transition-transform duration-300 ease-in-out
          ${isOn ? 'left-7' : 'left-1'}
        `}
            />
        </button>
    );
};

const SettingsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        if (location.state?.nickname) {
            setUserInfo({
                nickname: location.state.nickname,
                username: location.state.username,
                userId: location.state.userId
            });
        } else {
            // 사용자 정보가 없으면 메인 페이지로 리다이렉트
            navigate('/', { replace: true });
        }
    }, [location.state, navigate]);

    // 각 토글의 상태 관리
    const [multiDeviceLogin, setMultiDeviceLogin] = useState(true);
    const [safeNumber, setSafeNumber] = useState(true);
    const [autoSaveNumber, setAutoSaveNumber] = useState(false);
    const [shareOrderCount, setShareOrderCount] = useState(true);
    const [deliveryAlarm, setDeliveryAlarm] = useState(true);
    const [reviewAlarm, setReviewAlarm] = useState(true);
    const [reviewReplyAlarm, setReviewReplyAlarm] = useState(true);
    const [eventAlarm, setEventAlarm] = useState(false);
    const [hapticFeedback, setHapticFeedback] = useState(true);

    return (
        <div className="w-full max-w-md mx-auto h-screen bg-gray-50 flex flex-col overflow-y-auto">
            {/* 헤더 */}
            <div className="bg-white p-4 flex items-center sticky top-0 z-10">
                <ArrowLeft
                    className="w-6 h-6 cursor-pointer"
                    onClick={() => navigate(-1)}
                />
                <h1 className="text-lg font-medium ml-4">환경설정</h1>
            </div>

            {/* 로그인 섹션 */}
            <div className="mt-4">
                <div className="px-4 py-2 text-sm text-gray-500">로그인</div>
                <div className="bg-white">
                    <div className="px-4 py-4 flex justify-between items-center">
                        <div>
                            <div className="font-medium">여러 기기 로그인</div>
                            <div className="text-sm text-gray-500 mt-1">
                                최대 5개의 휴대폰에 동시 로그인 할 수 있어요
                            </div>
                        </div>
                        <ToggleSwitch
                            isOn={multiDeviceLogin}
                            onToggle={() => setMultiDeviceLogin(prev => !prev)}
                        />
                    </div>
                </div>
            </div>

            {/* 1회용 비밀번호 섹션 */}
            <div className="mt-4">
                <div className="px-4 py-2 text-sm text-gray-500">1회용 비밀번호</div>
                <div className="bg-white">
                    <div
                        className="px-4 py-4 flex justify-between items-center cursor-pointer relative"
                        onClick={() => {
                            navigate('/doorsettings', {
                                state: {
                                    userId: userInfo?.userId,
                                    username: userInfo?.username,
                                    nickname: userInfo?.nickname
                                }
                            });
                        }}
                    >
                        <div>
                            <div className="font-medium">공유 도어락 1회용 비밀번호</div>
                            <div className="text-sm text-gray-500 mt-1">
                                고객님의 소중한 비밀번호를 지켜드려요
                            </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                        {/* 강조 효과 - 하나만 표시 */}
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-300 rounded-full animate-ping opacity-50" />
                    </div>
                </div>
            </div>

            {/* 주문 섹션 */}
            <div className="mt-4">
                <div className="px-4 py-2 text-sm text-gray-500">주문</div>
                <div className="bg-white">
                    <div className="px-4 py-4 border-b flex justify-between items-center">
                        <div>
                            <div className="font-medium">안심번호/안심콜 항상 사용</div>
                            <div className="text-sm text-gray-500 mt-1">
                                라이더님이나 가게에 내 전화번호가 보이지 않아요
                            </div>
                        </div>
                        <ToggleSwitch
                            isOn={safeNumber}
                            onToggle={() => setSafeNumber(prev => !prev)}
                        />
                    </div>
                    <div className="px-4 py-4 border-b flex justify-between items-center">
                        <div>
                            <div className="font-medium">가게번호 자동 저장</div>
                            <div className="text-sm text-gray-500 mt-1">
                                전화 주문 시 연락처에 가게번호를 저장해요
                            </div>
                        </div>
                        <ToggleSwitch
                            isOn={autoSaveNumber}
                            onToggle={() => setAutoSaveNumber(prev => !prev)}
                        />
                    </div>
                    <div className="px-4 py-4 flex justify-between items-center">
                        <div>
                            <div className="font-medium">가게 주문 횟수 제공</div>
                            <div className="text-sm text-gray-500 mt-1">
                                최근 6개월 주문 횟수를 가게에서 볼 수 있어요
                            </div>
                        </div>
                        <ToggleSwitch
                            isOn={shareOrderCount}
                            onToggle={() => setShareOrderCount(prev => !prev)}
                        />
                    </div>
                </div>
            </div>

            {/* 서비스 알림 섹션 */}
            <div className="mt-4">
                <div className="px-4 py-2 text-sm text-gray-500">서비스 알림</div>
                <div className="bg-white">
                    <div className="px-4 py-4 border-b flex justify-between items-center">
                        <div>
                            <div className="font-medium">배달현황 알림</div>
                            <div className="text-sm text-gray-500 mt-1">
                                배달 상태를 실시간으로 알려드려요
                            </div>
                        </div>
                        <ToggleSwitch
                            isOn={deliveryAlarm}
                            onToggle={() => setDeliveryAlarm(prev => !prev)}
                        />
                    </div>
                    <div className="px-4 py-4 border-b flex justify-between items-center">
                        <div>
                            <div className="font-medium">리뷰 작성 알림</div>
                            <div className="text-sm text-gray-500 mt-1">
                                주문에 대한 리뷰 작성 알림을 보내드려요(오전 8:00~오후 10:00)
                            </div>
                        </div>
                        <ToggleSwitch
                            isOn={reviewAlarm}
                            onToggle={() => setReviewAlarm(prev => !prev)}
                        />
                    </div>
                    <div className="px-4 py-4 flex justify-between items-center">
                        <div>
                            <div className="font-medium">리뷰 답글 알림</div>
                            <div className="text-sm text-gray-500 mt-1">
                                리뷰에 답글이 달리면 알려드려요(오전 8:00~오후 10:00)
                            </div>
                        </div>
                        <ToggleSwitch
                            isOn={reviewReplyAlarm}
                            onToggle={() => setReviewReplyAlarm(prev => !prev)}
                        />
                    </div>
                </div>
            </div>

            {/* 혜택 알림 섹션 */}
            <div className="mt-4">
                <div className="px-4 py-2 text-sm text-gray-500">혜택 알림</div>
                <div className="bg-white">
                    <div className="px-4 py-4 border-b flex justify-between items-center">
                        <div>
                            <div className="font-medium">이벤트 혜택 알림</div>
                            <div className="text-sm text-gray-500 mt-1">
                                광고성 정보 수신 동의에 의한 쿠폰 등 혜택 알림
                            </div>
                        </div>
                        <ToggleSwitch
                            isOn={eventAlarm}
                            onToggle={() => setEventAlarm(prev => !prev)}
                        />
                    </div>
                    <div
                        className="px-4 py-4 flex justify-between items-center cursor-pointer"
                        onClick={() => { }}
                    >
                        <div>
                            <div className="font-medium">찜한 브랜드 혜택 알림</div>
                            <div className="text-sm text-gray-500 mt-1">
                                광고성 정보 수신 동의에 의한 찜한 브랜드의 혜택 알림
                            </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* 기능 설정 섹션 */}
            <div className="mt-4">
                <div className="px-4 py-2 text-sm text-gray-500">기능 설정</div>
                <div className="bg-white">
                    <div className="px-4 py-4 flex justify-between items-center">
                        <div>
                            <div className="font-medium">햅틱 진동 사용</div>
                            <div className="text-sm text-gray-500 mt-1">
                                동작의 결과를 강조할 때 진동을 사용해요
                            </div>
                        </div>
                        <ToggleSwitch
                            isOn={hapticFeedback}
                            onToggle={() => setHapticFeedback(prev => !prev)}
                        />
                    </div>
                </div>
            </div>

            {/* 서비스 동의 섹션 */}
            <div className="mt-4 mb-4">
                <div className="px-4 py-2 text-sm text-gray-500">서비스 동의</div>
                <div className="bg-white">
                    <div
                        className="px-4 py-4 flex justify-between items-center cursor-pointer"
                        onClick={() => { }}
                    >
                        <div>
                            <div className="font-medium">개인정보 활용 및 마케팅 정보 수신</div>
                            <div className="text-sm text-gray-500 mt-1">
                                마케팅 및 프로모션 활동에 개인정보 활용 동의
                            </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                    </div>
                </div>
            </div>

            <div
                className="px-4 py-4 flex justify-between items-center cursor-pointer bg-white"
                onClick={() => { }}
            >
                <div className="font-medium">오픈소스 라이선스 확인하기</div>
                <ChevronRight className="w-6 h-6 text-gray-400" />
            </div>
        </div>
    );
};

export default SettingsPage;