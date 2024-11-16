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
      // localStorage에서 token 가져오기
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/'; // 토큰이 없으면 로그인 페이지로 리다이렉트
        return;
      }

      const response = await fetch('/api/passwords/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 토큰을 헤더에 추가
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

  // 로그인 체크
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
    }
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
        <h1 className="text-2xl font-semibold text-center flex-1">일회용 비밀번호 발급</h1>
      </div>
      
      <div className="flex-1 p-4 sm:p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md w-full mx-auto">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              대상자 닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full p-4 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="닉네임을 입력하세요"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 text-base font-medium shadow-sm"
          >
            {isLoading ? '발급 중...' : '비밀번호 발급하기'}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <p className="font-medium text-base">{result.message}</p>
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