import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Bike } from 'lucide-react';

const SelectUserPage = () => {
    const [targetUsers, setTargetUsers] = useState([]);
    const [issuerUsers, setIssuerUsers] = useState([]);
    const [selectedDelivery, setSelectedDelivery] = useState('');
    const [selectedOwner, setSelectedOwner] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 배달기사와 집주인 매핑 정보를 가져오는 함수
    const fetchUserMapping = async () => {
        try {
            const response = await fetch('/api/auth/users/mapping', {
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch user mapping');
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching user mapping:', error);
            return null;
        }
    };

    // 사용자 목록 가져오기
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const [targetsResponse, issuersResponse] = await Promise.all([
                    fetch('/api/auth/users/targets'),
                    fetch('/api/auth/users/issuers')
                ]);

                const targetsData = await targetsResponse.json();
                const issuersData = await issuersResponse.json();
                
                setTargetUsers(targetsData);
                setIssuerUsers(issuersData);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // 배달기사 선택 시 자동으로 집주인 선택
    const handleDeliverySelect = async (e) => {
        const targetId = e.target.value;
        setSelectedDelivery(targetId);
        
        if (targetId) {
            try {
                const mapping = await fetchUserMapping();
                const issuer = mapping.find(m => m.target_id.toString() === targetId.toString());
                
                if (issuer) {
                    setSelectedOwner(issuer.issuer_id.toString());
                }
            } catch (error) {
                console.error('Error finding matching issuer:', error);
            }
        } else {
            setSelectedOwner('');
        }
    };

    const handleSubmit = (type) => {
        const selectedUser = type === 'delivery' ? selectedDelivery : selectedOwner;
        const userList = type === 'delivery' ? targetUsers : issuerUsers;
        const selectedUserData = userList.find(user => user.id.toString() === selectedUser.toString());

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
                    <label className="block text-gray-700 font-semibold mb-2">
                        배달기사 선택 (임시 비밀번호 발급된 사용자)
                    </label>
                    <select
                        className="w-full p-3 border rounded-lg mb-3"
                        value={selectedDelivery}
                        onChange={handleDeliverySelect}
                    >
                        <option value="">배달기사를 선택하세요</option>
                        {targetUsers.map((user) => (
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
                    <label className="block text-gray-700 font-semibold mb-2">
                        집 주인 선택 (임시 비밀번호 발급한 사용자: 자동선택)
                    </label>
                    <select
                        className="w-full p-3 border rounded-lg mb-3"
                        value={selectedOwner}
                        disabled  // 직접 선택 불가능하게 설정
                    >
                        <option value="">집주인을 선택하세요</option>
                        {issuerUsers.map((user) => (
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