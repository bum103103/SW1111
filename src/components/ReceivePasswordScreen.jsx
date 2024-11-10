import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';

const ReceivePasswordScreen = () => {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/passwords/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPasswords(data.passwords || []);
    } catch (error) {
      console.error('Error fetching passwords:', error);
    } finally {
      setLoading(false);
    }
  };

  // NFC 쓰기 기능
  const writeToNFC = async (password) => {
    if (!('NDEFReader' in window)) {
      alert('이 브라우저는 NFC를 지원하지 않습니다.');
      return;
    }

    try {
      const ndef = new NDEFReader();
      await ndef.write(password);
      alert('NFC 태그에 가까이 대주세요.');
      console.log(`NFC에 비밀번호 "${password}" 기록 성공`);
    } catch (error) {
      console.error('NFC 쓰기 오류:', error);
      alert('NFC 쓰기에 실패했습니다.');
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
        <h1 className="text-2xl font-semibold text-center flex-1">발급된 비밀번호</h1>
      </div>

      <div className="flex-1 p-4">
        {loading ? (
          <div className="text-center text-gray-500">로딩 중...</div>
        ) : passwords.length > 0 ? (
          <div className="space-y-4">
            {passwords.map((item, index) => (
              <div key={index} className="bg-white rounded-lg border p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-2xl font-bold">{item.password}</div>
                    <div className="text-sm text-gray-500">
                      발급자: {item.issuer}
                    </div>
                  </div>
                  <div className="text-sm text-green-500">
                    사용 가능
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  발급일시: {new Date(item.created_at).toLocaleString()}
                </div>
                <button
                  onClick={() => writeToNFC(item.password)}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  NFC로 전송하기
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            발급된 비밀번호가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceivePasswordScreen;