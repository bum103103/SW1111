// src/components/PasswordManagementScreen.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, X } from 'lucide-react';

const PasswordManagementScreen = () => {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/passwords/issued-by-me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPasswords(data.passwords);
    } catch (error) {
      console.error('Error fetching passwords:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpire = async (passwordId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/passwords/expire/${passwordId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // 목록 새로고침
        fetchPasswords();
      }
    } catch (error) {
      console.error('Error expiring password:', error);
    }
  };

  const filteredPasswords = passwords.filter(item => 
    item.target_nickname.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-semibold text-center flex-1">발급한 비밀번호 관리</h1>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="대상자 검색..."
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
            {filteredPasswords.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{item.password}</div>
                    <div className="text-sm text-gray-500">
                      대상: {item.target_nickname}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-sm ${item.used ? 'text-red-500' : item.expires_at < new Date().toISOString() ? 'text-orange-500' : 'text-green-500'}`}>
                      {item.used ? '사용됨' : item.expires_at < new Date().toISOString() ? '만료됨' : '활성'}
                    </div>
                    {!item.used && item.expires_at > new Date().toISOString() && (
                      <button
                        onClick={() => handleExpire(item.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="h-5 w-5 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>발급: {new Date(item.created_at).toLocaleString()}</div>
                  <div>만료: {new Date(item.expires_at).toLocaleString()}</div>
                  {item.used && (
                    <div>사용: {new Date(item.used_at).toLocaleString()}</div>
                  )}
                </div>
              </div>
            ))}
            {filteredPasswords.length === 0 && (
              <div className="text-center text-gray-500">발급한 비밀번호가 없습니다.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordManagementScreen;