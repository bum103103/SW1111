import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ArrowRight, Clock, Building, Phone, Smartphone, Bluetooth } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const DeliveryMap = ({ step, driverName }) => {
    const positions = {
        1: { x: 100, y: 100 },
        2: { x: 250, y: 100 },
        3: { x: 250, y: 220 },
        4: { x: 270, y: 220 },
        5: { x: 270, y: 205 }
    };

    const currentPos = positions[step] || positions[1];

    return (
        <svg viewBox="0 0 400 400" className="w-full h-full">
            <rect width="400" height="400" fill="#f0f0f0" />

            <path d="M50 100 H350" stroke="#d4d4d4" strokeWidth="30" />
            <path d="M100 50 V350" stroke="#d4d4d4" strokeWidth="30" />
            <path d="M250 200 V350" stroke="#d4d4d4" strokeWidth="30" />
            <path d="M250 200 H350" stroke="#d4d4d4" strokeWidth="30" />

            <path d="M50 100 H350" stroke="#a3a3a3" strokeWidth="2" fill="none" />
            <path d="M100 50 V350" stroke="#a3a3a3" strokeWidth="2" fill="none" />
            <path d="M250 200 V350" stroke="#a3a3a3" strokeWidth="2" fill="none" />
            <path d="M250 200 H350" stroke="#a3a3a3" strokeWidth="2" fill="none" />

            <rect x="120" y="120" width="40" height="40" fill="#e5e5e5" stroke="#a3a3a3" />
            <rect x="120" y="220" width="40" height="40" fill="#e5e5e5" stroke="#a3a3a3" />
            <rect x="270" y="120" width="40" height="40" fill="#e5e5e5" stroke="#a3a3a3" />
            <rect x="270" y="220" width="40" height="40" fill="#e5e5e5" stroke="#a3a3a3" />

            <path d="M270 220 l15 -30 a15 15 0 0 0 -30 0 z" fill="#ef4444" />
            <circle cx="270" cy="205" r="5" fill="white" />

            <path
                d="M100 100 H250 V220"
                stroke="#4ade80"
                strokeWidth="3"
                strokeDasharray="5,5"
                fill="none"
            />

            <text x="150" y="90" fontSize="12" fill="#666">1.2km</text>

            <g transform={`translate(${currentPos.x}, ${currentPos.y})`} className="transition-transform duration-1000">
                <circle r="20" fill="#4ade80" opacity="0.3" className="animate-ping" />
                <circle r="15" fill="#4ade80" />
                <circle r="5" fill="white" />
                <text
                    y="-20"
                    textAnchor="middle"
                    fill="#4ade80"
                    className="text-sm font-medium"
                    style={{ textShadow: '0px 0px 3px white' }}
                >
                    {driverName}
                </text>
            </g>
        </svg>
    );
};

const DeliveryFlow = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId, nickname } = location.state || { userId: null, nickname: '배달원' };
    const [step, setStep] = useState(1);
    const [isDoorLockExpanded, setIsDoorLockExpanded] = useState(false);
    const [swipeProgress, setSwipeProgress] = useState(0);
    const [doorLockPassword, setDoorLockPassword] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCallConfirm, setShowCallConfirm] = useState(false);
    const touchStartX = useRef(null);
    const swipingRef = useRef(false);

    const [isNFCEnabled, setIsNFCEnabled] = useState(
        JSON.parse(localStorage.getItem('isNFCEnabled') ?? 'true')
    );
    const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(
        JSON.parse(localStorage.getItem('isBluetoothEnabled') ?? 'true')
    );

    useEffect(() => {
        const handleStorageChange = () => {
            setIsNFCEnabled(JSON.parse(localStorage.getItem('isNFCEnabled') ?? 'true'));
            setIsBluetoothEnabled(JSON.parse(localStorage.getItem('isBluetoothEnabled') ?? 'true'));
        };

        window.addEventListener('storage', handleStorageChange);
        handleStorageChange();

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        const fetchDoorLockPassword = async () => {
            try {
                setLoading(true);
                console.log('비밀번호 요청 시작, userId:', userId);

                const response = await fetch(`/api/passwords/check/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('서버에서 받은 데이터:', data);

                if (data.passwords && data.passwords.length > 0) {
                    setDoorLockPassword(data.passwords[0].password);
                } else {
                    console.log('사용 가능한 비밀번호가 없습니다.');
                    setDoorLockPassword('비밀번호 없음');
                }
            } catch (error) {
                console.error('비밀번호 가져오기 실패:', error);
                setDoorLockPassword('비밀번호 조회 실패');
            } finally {
                setLoading(false);
            }
        };

        if (step === 3 && userId) {
            fetchDoorLockPassword();
        }
    }, [step, userId]);

    const handleTouchStart = (e) => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        touchStartX.current = clientX;
        swipingRef.current = true;
    };

    const handleTouchMove = (e) => {
        if (!swipingRef.current || touchStartX.current === null) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const deltaX = clientX - touchStartX.current;

        if (deltaX > 0) {
            const progress = Math.min(100, (deltaX / 150) * 100);
            setSwipeProgress(progress);
        }
    };

    const handleTouchEnd = () => {
        if (swipeProgress >= 40) {
            setStep(step + 1);
        }
        setSwipeProgress(0);
        touchStartX.current = null;
        swipingRef.current = false;
    };

    return (
        <div className="h-screen w-full md:w-1/2 mx-auto relative bg-white">
            <div className="h-full w-full absolute top-0 left-0 z-0">
                <DeliveryMap step={step} driverName={nickname} />
            </div>

            <div className="relative h-full z-10">
                <div
                    className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate('/')}
                >
                    <span className="text-sm">× 거절</span>
                </div>

                {step === 1 && (
                    <div className="absolute bottom-32 left-4 right-4 bg-white rounded-xl p-4 shadow-lg">
                        <div className="text-lg font-medium">엔터앤스프레드롤 롯데백화점...</div>
                        <div className="text-sm text-gray-500">≈ 1.8km</div>
                        <div className="mt-2">
                            <div className="text-lg font-bold">예상 3,100원</div>
                            <div className="text-sm text-gray-500">예상 누적 수입 3,100원</div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-20">
                        <div className="p-4">
                            <div className="mb-4">
                                <div className="text-purple-600 font-bold">0E4HR0</div>
                                <div className="mt-1">홍삼도시락 (150g) x 1개</div>
                                <div className="text-right mt-2 font-bold">14,400원</div>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center" onClick={() => setIsDoorLockExpanded(!isDoorLockExpanded)}>
                                    <div className="flex items-center gap-2">
                                        <Building className="h-5 w-5 text-teal-400" />
                                        <span className="font-medium">공동현관 출입</span>
                                    </div>
                                    <div className="relative cursor-pointer">
                                        <span className="text-teal-400">{isDoorLockExpanded ? '접기' : '펼치기'}</span>
                                        {!isDoorLockExpanded && (
                                            <>
                                                <div className="absolute -top-3 -right-3 w-12 h-12 bg-yellow-300 rounded-full animate-ping opacity-30" />
                                                <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-300 rounded-full animate-ping opacity-40" />
                                                <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-300 rounded-full animate-ping opacity-50" />
                                            </>
                                        )}
                                    </div>
                                </div>

                                {isDoorLockExpanded && (
                                    <div className="mt-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className={`rounded-xl p-4 text-center flex flex-col items-center transition-all duration-300 ${isNFCEnabled ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                <Smartphone className="h-6 w-6 mb-2" />
                                                <div className="font-medium">NFC</div>
                                                <div className="text-xs">
                                                    {isNFCEnabled ? '켜짐' : '꺼짐'}
                                                </div>
                                            </div>

                                            <div className={`rounded-xl p-4 text-center flex flex-col items-center transition-all duration-300 ${isBluetoothEnabled ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                <Bluetooth className="h-6 w-6 mb-2" />
                                                <div className="font-medium">블루투스</div>
                                                <div className="text-xs">
                                                    {isBluetoothEnabled ? '켜짐' : '꺼짐'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="text-center">
                                                <div className="text-sm text-gray-500">도어락 코드</div>
                                                <div className="text-2xl font-bold font-mono mt-1">
                                                    {loading ? '로딩중...' : doorLockPassword}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-teal-400" />
                                                <span className="text-sm text-gray-600">남은 시간</span>
                                            </div>
                                            <span className="text-sm font-medium">2일 23시간 52분</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div
                                className="mt-4 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer"
                                onClick={() => setShowCallConfirm(true)}
                            >
                                <Phone className="h-5 w-5 text-gray-600" />
                                <span className="text-gray-600">파트너 지원센터와 전화</span>
                            </div>
                        </div>

                        <div className="px-4 pb-4">
                            <button
                                className="w-full bg-green-500 text-white h-16 rounded-lg font-medium hover:bg-green-600 transition-colors"
                                onClick={() => setStep(4)}
                            >
                                픽업 완료
                            </button>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div
                        className="absolute bottom-0 left-0 right-0 z-20 cursor-pointer"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleTouchStart}
                        onMouseMove={handleTouchMove}
                        onMouseUp={handleTouchEnd}
                        onMouseLeave={handleTouchEnd}
                    >
                        <div className="relative h-16 bg-purple-900 overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-purple-700 flex items-center justify-center transition-all duration-300 ease-out"
                                style={{
                                    width: `${Math.max(43, Math.min(100, swipeProgress + 43))}%`
                                }}
                            >
                                <span className="text-white whitespace-nowrap">밀어서 배달 수락</span>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="absolute bottom-0 left-0 right-0 z-20">
                        <button
                            className="w-full bg-green-500 text-white h-16 font-medium hover:bg-green-600 transition-colors"
                            onClick={() => setStep(3)}
                        >
                            매장 도착
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div
                        className="absolute bottom-0 left-0 right-0 z-20 cursor-pointer"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleTouchStart}
                        onMouseMove={handleTouchMove}
                        onMouseUp={handleTouchEnd}
                        onMouseLeave={handleTouchEnd}
                    >
                        <div className="relative h-16 bg-green-600 overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-green-500 flex items-center justify-center transition-all duration-300 ease-out"
                                style={{
                                    width: `${Math.max(43, Math.min(100, swipeProgress + 43))}%`
                                }}
                            >
                                <span className="text-white whitespace-nowrap">밀어서 배달 완료</span>
                            </div>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-20">
                        <div className="p-4 text-center">
                            <div className="font-medium mb-4">배달 완료</div>
                            <button
                                className="w-full bg-green-500 text-white h-16 rounded-lg font-medium hover:bg-green-600 transition-colors"
                                onClick={() => setStep(1)}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                )}

                {showCallConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
                            <h3 className="text-lg font-medium mb-4">전화 연결</h3>
                            <p className="text-gray-600 mb-6">파트너 지원센터로 연결하시겠습니까?</p>
                            <div className="flex justify-end gap-4">
                                <button
                                    className="px-4 py-2 text-gray-500"
                                    onClick={() => setShowCallConfirm(false)}
                                >
                                    취소
                                </button>
                                <a
                                    href="tel:01071552479"
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg"
                                    onClick={() => setShowCallConfirm(false)}
                                >
                                    연결
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryFlow;