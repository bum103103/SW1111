import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search } from 'lucide-react';

const IssueHistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, [filter]); // filter가 변경될 때마다 데이터를 다시 불러옴

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/passwords/history?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'used':
        return 'text-red-500';
      case 'expired':
        return 'text-orange-500';
      case 'active':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'used':
        return '사용됨';
      case 'expired':
        return '만료됨';
      case 'active':
        return '미사용';
      default:
        return '알 수 없음';
    }
  };

  const filteredHistory = history.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.issuer_nickname?.toLowerCase().includes(searchLower) ||
      item.target_nickname?.toLowerCase().includes(searchLower) ||
      item.password?.includes(searchLower)
    );
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
        <h1 className="text-2xl font-semibold text-center flex-1">발급 기록</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="발급자, 대상자 또는 비밀번호로 검색..."
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
          <option value="active">미사용</option>
          <option value="used">사용됨</option>
          <option value="expired">만료됨</option>
        </select>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-gray-500">로딩 중...</div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item, index) => (
                <div key={item.id || index} className="bg-white rounded-lg border p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{item.password}</div>
                      <div className="text-sm text-gray-500">
                        발급자: {item.issuer_nickname} → 대상: {item.target_nickname}
                      </div>
                    </div>
                    <div className={`text-sm ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>발급: {formatDate(item.created_at)}</div>
                    <div>만료: {formatDate(item.expires_at)}</div>
                    {item.used && (
                      <div>사용: {formatDate(item.used_at)}</div>
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

export default IssueHistoryScreen;