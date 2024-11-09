import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';

const ReceivePasswordScreen = () => {
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPassword = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/';
          return;
        }

        const response = await fetch('/api/passwords/check', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.passwords) {
          setPasswords(data.passwords);
        } else {
          setError(data.message || '발급된 비밀번호가 없습니다.');
        }
      } catch (error) {
        console.error('Error checking password:', error);
        setError('서버 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    checkPassword();
  }, []);

  return (
    <div className="min-h-screen w-full md:w-1/2 mx-auto bg-white flex flex-col">
      <div className="px-4 py-6 border-b flex items-center relative">
        <button
          onClick={() => window.location.href = '/main'}
          className="absolute left-4 md:left-4"
        >
          <ChevronLeft className="h-6 w-6 text-gray-500" />
        </button>
        <h1 className="text-2xl font-semibold text-center flex-1">비밀번호 확인</h1>
      </div>
      
      <div className="flex-1 p-4 sm:p-6 md:p-8">
        {loading ? (
          <div className="text-center text-gray-500 text-base">로딩 중...</div>
        ) : error ? (
          <div className="text-center text-red-600 text-base">{error}</div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4"></h2>
            {passwords.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="text-2xl font-bold text-center text-blue-600 mb-2">
                  {item.password}
                </div>
                <div className="text-sm text-gray-500 text-center">
                  <p>발급자: {item.issuer}</p>
                  <p>발급일시: {new Date(item.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {passwords.length === 0 && (
              <div className="text-center text-gray-500">
                현재 발급된 비밀번호가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceivePasswordScreen;