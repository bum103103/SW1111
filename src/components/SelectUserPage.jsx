import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Bike } from 'lucide-react';

const SelectUserPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedDelivery, setSelectedDelivery] = useState('');
    const [selectedOwner, setSelectedOwner] = useState('');
    const [loading, setLoading] = useState(true);  // 로딩 상태 추가
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                console.log('사용자 데이터 요청 시작');
                
                const response = await fetch('http://localhost:8080/api/auth/users', {  // 포트 변경
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('서버에서 받은 데이터:', data);
                setUsers(data);
            } catch (error) {
                console.error('사용자 데이터 가져오기 실패:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchUsers();
    }, []);

    const handleSubmit = (type) => {
        const selectedUser = type === 'delivery' ? selectedDelivery : selectedOwner;
        const selectedUserData = users.find(user => user.id.toString() === selectedUser.toString());

        if (type === 'delivery') {
            navigate('/delivery-flow', {
                state: {
                    userId: selectedUser,
                    username: selectedUserData?.username,
                    nickname: selectedUserData?.nickname
                }
            });
        } else if (type === 'owner') {
            navigate('/baemin', {
                state: {
                    userId: selectedUser,
                    username: selectedUserData?.username,
                    nickname: selectedUserData?.nickname
                }
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">사용자 목록을 불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-center mb-8">사용자 선택</h1>

                {/* 배달기사 선택 섹션 */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">배달기사 선택</label>
                    <select
                        className="w-full p-3 border rounded-lg mb-3"
                        value={selectedDelivery}
                        onChange={(e) => setSelectedDelivery(e.target.value)}
                    >
                        <option value="">배달기사를 선택하세요</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.nickname} ({user.username})
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => handleSubmit('delivery')}
                        className="w-full bg-blue-500 text-white rounded-lg p-3 flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                        disabled={!selectedDelivery}
                    >
                        <Bike className="w-6 h-6" />
                        <span>배달기사로 시작하기</span>
                    </button>
                </div>

                {/* 구분선 */}
                <div className="border-t my-6"></div>

                {/* 집주인 선택 섹션 */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">집주인 선택</label>
                    <select
                        className="w-full p-3 border rounded-lg mb-3"
                        value={selectedOwner}
                        onChange={(e) => setSelectedOwner(e.target.value)}
                    >
                        <option value="">집주인을 선택하세요</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.nickname} ({user.username})
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => handleSubmit('owner')}
                        className="w-full bg-green-500 text-white rounded-lg p-3 flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                        disabled={!selectedOwner}
                    >
                        <Home className="w-6 h-6" />
                        <span>집주인으로 시작하기</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectUserPage;