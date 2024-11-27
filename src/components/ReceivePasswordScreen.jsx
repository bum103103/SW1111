import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';

const ReceivePasswordScreen = () => {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nfcStatus, setNfcStatus] = useState('');

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

  const writeToNFC = async (password) => {
    if (!('NDEFReader' in window)) {
      alert('이 브라우저는 NFC를 지원하지 않습니다.');
      return;
    }

    try {
      setNfcStatus('NFC 태그를 기기에 가까이 대주세요.');
      const ndef = new NDEFReader();
      await ndef.write({
        records: [{ recordType: "text", data: password }]
      });
      setNfcStatus(`NFC 태그에 비밀번호가 성공적으로 기록되었습니다.`);

      // 3초 후 상태 메시지 제거
      setTimeout(() => {
        setNfcStatus('');
      }, 3000);

    } catch (error) {
      console.error('NFC 쓰기 오류:', error);
      setNfcStatus('NFC 쓰기에 실패했습니다.');
      
      // 3초 후 에러 메시지 제거
      setTimeout(() => {
        setNfcStatus('');
      }, 3000);
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
        {nfcStatus && (
          <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
            {nfcStatus}
          </div>
        )}
        
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
                <div className="flex space-x-2">
                  <button
                    onClick={() => writeToNFC(item.password)}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    NFC에 저장하기
                  </button>
                </div>
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