// src/components/IssueHistoryScreen.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search } from 'lucide-react';

const IssueHistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/passwords/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setHistory(data.history);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => 
    item.issuer_nickname?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.target_nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="p-4">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="발급자 또는 대상자 검색..."
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
            {filteredHistory.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{item.password}</div>
                    <div className="text-sm text-gray-500">
                      발급자: {item.issuer_nickname} → 대상: {item.target_nickname}
                    </div>
                  </div>
                  <div className={`text-sm ${item.used ? 'text-red-500' : 'text-green-500'}`}>
                    {item.used ? '사용됨' : '미사용'}
                  </div>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>발급: {new Date(item.issued_at).toLocaleString()}</div>
                  <div>만료: {new Date(item.expires_at).toLocaleString()}</div>
                  {item.used && (
                    <div>사용: {new Date(item.used_at).toLocaleString()}</div>
                  )}
                </div>
              </div>
            ))}
            {filteredHistory.length === 0 && (
              <div className="text-center text-gray-500">기록이 없습니다.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueHistoryScreen;