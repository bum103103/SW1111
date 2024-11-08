import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import axios from 'axios';

const ReceivePasswordScreen = () => {
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState(null);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    checkPassword();
  }, []);

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

      if (response.ok) {
        setPassword(data.password);
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

  const testPassword = async (testType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/passwords/test', {
        password: password,
        testType: testType // 'SUCCESS' 또는 'FAILED'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setTestResult({
        success: testType === 'SUCCESS',
        message: testType === 'SUCCESS' ? '도어락 열림 성공!' : '도어락 열림 실패'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: '오류가 발생했습니다.'
      });
    }
  };

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
      
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {loading ? (
          <div className="text-center text-gray-500">로딩 중...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="text-center">
            <div className="text-gray-600 mb-4">현재 발급된 비밀번호:</div>
            <div className="text-4xl font-bold text-blue-600 mb-8">{password}</div>
            
            <div className="space-y-4">
              <button
                onClick={() => testPassword('SUCCESS')}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                성공 테스트
              </button>
              
              <button
                onClick={() => testPassword('FAILED')}
                className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                실패 테스트
              </button>
            </div>

            {testResult && (
              <div className={`mt-4 p-3 rounded-lg ${
                testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {testResult.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceivePasswordScreen;