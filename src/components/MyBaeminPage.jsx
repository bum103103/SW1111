// src/components/MyBaeminPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Settings, MessageCircle, MapPin, ChevronRight, ShoppingBag, Home, Heart, Menu, Smile, User } from 'lucide-react';

const MyBaeminPage = () => {
    const [showTutorial] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // location.state에서 사용자 정보 가져오기
        if (location.state?.nickname) {
            setUserInfo({
                nickname: location.state.nickname,
                username: location.state.username,
                userId: location.state.userId
            });
        }
    }, [location.state]);

    // 권한 체크 및 리다이렉트
    useEffect(() => {
        if (!location.state) {
            console.log('No user info provided, redirecting to selection page');
            navigate('/', { replace: true });
        }
    }, [navigate, location.state]);

    // 사용자 정보가 없는 경우 로딩 표시
    if (!userInfo) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <div className="text-xl">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto h-screen bg-gray-50 flex flex-col">
            {/* 헤더 */}
            <div className="bg-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">마이배민</h1>
                <div className="flex items-center gap-4">
                    <Bell className="w-6 h-6" />
                    <div
                        className="relative cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate('/settings', {
                                state: {
                                    userId: userInfo.userId,
                                    username: userInfo.username,
                                    nickname: userInfo.nickname
                                }
                            });
                        }}
                    >
                        <Settings className="w-6 h-6" />
                        {showTutorial && (
                            <>
                                <div className="absolute -top-3 -right-3 w-12 h-12 bg-yellow-300 rounded-full animate-ping opacity-30" />
                                <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-300 rounded-full animate-ping opacity-40" />
                                <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-300 rounded-full animate-ping opacity-50" />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 프로필 섹션 - 사용자 정보 표시 */}
            <div className="bg-white px-4 py-6 flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold">{userInfo.nickname}</h2>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex gap-4 mt-2">
                        <button className="flex items-center gap-1 text-gray-600">
                            <MessageCircle className="w-4 h-4" />
                            <span>리뷰관리</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>주소관리</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 배민클럽 섹션 */}
            <div className="bg-white mt-2 p-4">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <span className="bg-cyan-100 text-cyan-500 px-2 py-0.5 rounded-sm text-sm">배민클럽★</span>
                        <span className="ml-2">배달팁 혜택</span>
                    </div>
                    <span className="text-gray-400">알아보기 &gt;</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center text-cyan-500">
                    지금 가입하고 배달팁 무료 혜택 받아요
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                        <span className="text-gray-600">혜택 모아보기</span>
                        <p className="text-sm text-gray-400">등급별 혜택까지 한눈에</p>
                    </div>
                    <div className="text-center">
                        <span className="text-gray-600">배민포인트 모으기</span>
                        <p className="text-sm text-gray-400">미션 완료하면 최대 17만원</p>
                    </div>
                </div>
            </div>

            {/* 포인트/쿠폰/선물 섹션 */}
            <div className="bg-white mt-2 p-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                    <span className="inline-block bg-purple-100 p-2 rounded-lg mb-2">
                        <span className="text-lg font-bold">0</span>장
                    </span>
                    <p className="text-sm text-gray-600">쿠폰함</p>
                </div>
                <div className="text-center">
                    <span className="inline-block bg-yellow-100 p-2 rounded-lg mb-2">
                        <span className="text-lg font-bold">0</span>원
                    </span>
                    <p className="text-sm text-gray-600">포인트</p>
                </div>
                <div className="text-center">
                    <span className="inline-block bg-red-100 p-2 rounded-lg mb-2">
                        <span className="text-lg font-bold">0</span>원
                    </span>
                    <p className="text-sm text-gray-600">받은 선물</p>
                </div>
            </div>

            {/* BHC 광고 배너 */}
            <div className="bg-white mt-2 p-4">
                <div className="bg-orange-500 rounded-xl p-4 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-lg font-bold mb-1">올해는 뿌링클 10주년</div>
                        <div className="text-sm">오천만 사랑에 보답하는</div>
                        <div className="text-xl font-bold mt-1">BHC 역전공 버스</div>
                    </div>
                    <button className="mt-2 bg-black bg-opacity-20 px-3 py-1 rounded-full text-sm">
                        매장 알아보기 &gt;
                    </button>
                    <div className="absolute right-0 bottom-0 w-24 h-24 bg-opacity-10 bg-white rounded-full transform translate-x-8 translate-y-8" />
                </div>
            </div>

            {/* 하단 네비게이션 */}
            <div className="mt-auto bg-white border-t">
                <div className="grid grid-cols-5 py-2">
                    <button className="flex flex-col items-center gap-1">
                        <Home className="w-6 h-6 text-gray-500" />
                        <span className="text-xs text-gray-500">홈</span>
                    </button>
                    <button className="flex flex-col items-center gap-1">
                        <div className="relative">
                            <ShoppingBag className="w-6 h-6 text-gray-500" />
                        </div>
                        <span className="text-xs text-gray-500">장보기·선물</span>
                    </button>
                    <button className="flex flex-col items-center gap-1">
                        <Heart className="w-6 h-6 text-gray-500" />
                        <span className="text-xs text-gray-500">찜</span>
                    </button>
                    <button className="flex flex-col items-center gap-1">
                        <Menu className="w-6 h-6 text-gray-500" />
                        <span className="text-xs text-gray-500">주문내역</span>
                    </button>
                    <button className="flex flex-col items-center gap-1">
                        <Smile className="w-6 h-6 text-teal-400" />
                        <span className="text-xs text-teal-400">마이배민</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyBaeminPage;