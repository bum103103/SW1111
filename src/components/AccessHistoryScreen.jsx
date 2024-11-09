import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search } from 'lucide-react';

const AccessHistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/passwords/access-history?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching access history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const passwordMatch = (item.attempted_password || '').toLowerCase().includes(searchLower);
    
    if (item.type === 'success') {
      const issuerMatch = (item.issuer_nickname || '').toLowerCase().includes(searchLower);
      const userMatch = (item.user_nickname || '').toLowerCase().includes(searchLower);
      return passwordMatch || issuerMatch || userMatch;
    }
    
    return passwordMatch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  return (
    <div className="min-h-screen w-full md:w-1/2 mx-auto bg-white flex flex-col">
      <div className="px-4 py-6 border-b flex items-center relative">
        <button
          onClick={() => window.location.href = '/main'}
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
            placeholder="발급자, 사용자 또는 비밀번호로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent flex-1 outline-none text-sm"
          />
        </div>

        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="all">전체</option>
          <option value="success">성공</option>
          <option value="fail">실패</option>
        </select>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-gray-500">로딩 중...</div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item, index) => (
                <div 
                  key={item.id || index} 
                  className={`bg-white rounded-lg border p-4 space-y-2 ${
                    item.type === 'fail' ? 'border-red-200' : 'border-green-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{item.attempted_password}</div>
                      {item.type === 'success' && (
                        <div className="text-sm text-gray-500">
                          발급자: {item.issuer_nickname} → 사용자: {item.user_nickname}
                        </div>
                      )}
                    </div>
                    <div className={`text-sm ${
                      item.type === 'fail' ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {item.type === 'fail' ? '실패' : '성공'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {item.type === 'success' ? (
                      <>
                        <div>발급: {formatDate(item.created_at)}</div>
                        <div>사용: {formatDate(item.used_at)}</div>
                      </>
                    ) : (
                      <div>시도: {formatDate(item.attempt_time)}</div>
                    )}
                  </div>
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

export default AccessHistoryScreen;