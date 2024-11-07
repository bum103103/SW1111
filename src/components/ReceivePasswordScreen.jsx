import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';

const ReceivePasswordScreen = () => {
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPassword = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/';
          return;
        }

        const response = await fetch('http://localhost:5000/api/passwords/check', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('Response data:', data); // 응답 데이터 확인

        if (response.ok) {
          setPassword(data.password);
        } else {
          setError(data.message || '발급된 비밀번호가 없습니다.');
        }
      } catch (error) {
        console.error('Error checking password:', error); // 에러 로깅
        setError('서버 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    checkPassword();
  }, []);

  return (
    <div className="h-screen w-1/2 mx-auto bg-white flex flex-col">
      <div className="px-4 py-3 border-b flex items-center">
        <button
          onClick={() => window.location.href = '/main'}
          className="absolute left-1/4 ml-4"
        >
          <ChevronLeft className="h-6 w-6 text-gray-500" />
        </button>
        <h1 className="text-xl font-semibold text-center flex-1">비밀번호 확인</h1>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6">
        {loading ? (
          <div className="text-center text-gray-500">로딩 중...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="text-center">
            <div className="text-gray-600 mb-4">현재 발급된 비밀번호:</div>
            <div className="text-4xl font-bold text-blue-600">{password}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceivePasswordScreen;