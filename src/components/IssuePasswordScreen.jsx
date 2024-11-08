import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const IssuePasswordScreen = () => {
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/passwords/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: '일회용 비밀번호가 발급되었습니다.',
          password: data.password
        });
      } else {
        setResult({
          success: false,
          message: data.message || '비밀번호 발급에 실패했습니다.'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: '서버 오류가 발생했습니다.'
      });
    } finally {
      setIsLoading(false);
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
        <h1 className="text-xl font-semibold text-center flex-1">일회용 비밀번호 발급</h1>
      </div>
      
      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사용자 닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="닉네임을 입력하세요"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? '발급 중...' : '비밀번호 발급하기'}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <p className="font-medium">{result.message}</p>
            {result.success && result.password && (
              <p className="mt-2 text-2xl font-bold text-center">{result.password}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuePasswordScreen;