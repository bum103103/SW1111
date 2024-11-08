import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }

      // 토큰과 사용자 정보 저장
      localStorage.setItem('token', data.token);
      localStorage.setItem('nickname', data.nickname);

      // 메인 화면으로 이동
      window.location.href = '/main';
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="h-screen w-1/2 mx-auto bg-white flex flex-col">
      <div className="px-4 py-3 border-b">
        <h1 className="text-xl font-semibold text-center">로그인</h1>
      </div>
      
      <div className="flex-1 flex flex-col justify-center px-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <User className="h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="아이디"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 outline-none"
              />
            </div>
            
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <Lock className="h-6 w-6 text-gray-400" />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            로그인
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => window.location.href = '/signup'}
              className="text-blue-500 hover:text-blue-600"
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;