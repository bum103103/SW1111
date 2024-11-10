// src/components/AccessHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccessHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/auth/all-users`);
      const data = await response.json();
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.username?.toLowerCase().includes(searchLower) ||
      item.nickname?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen w-full md:w-1/2 mx-auto bg-white flex flex-col">
      <div className="px-4 py-6 border-b flex items-center relative">
        <button
          onClick={() => navigate(-1)}  // 이전 페이지로 이동
          className="absolute left-4 md:left-4"
        >
          <ChevronLeft className="h-6 w-6 text-gray-500" />
        </button>
        <h1 className="text-2xl font-semibold text-center flex-1">출입 기록</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="사용자 이름 또는 닉네임으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent flex-1 outline-none text-sm"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-gray-500">로딩 중...</div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item, index) => (
                <div key={item.id || index} className="bg-white rounded-lg border p-4 space-y-2">
                  <div className="font-medium">{item.username}</div>
                  <div className="text-sm text-gray-500">닉네임: {item.nickname}</div>
                  <div className="text-xs text-gray-400">가입일: {new Date(item.created_at).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">
                {searchTerm ? '검색 결과가 없습니다.' : '기록이 없습니다.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessHistoryPage;
