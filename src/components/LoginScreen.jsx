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

      localStorage.setItem('token', data.token);
      localStorage.setItem('nickname', data.nickname);

      window.location.href = '/main';
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:w-1/2 md:mx-auto">
      <div className="px-4 py-6 border-b">
        <h1 className="text-2xl font-semibold text-center">로그인</h1>
      </div>
      
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-lg text-center text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6 max-w-md w-full mx-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-white shadow-sm">
              <User className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="아이디"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 outline-none text-base w-full"
              />
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-white shadow-sm">
              <Lock className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 outline-none text-base w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-base font-medium shadow-sm"
          >
            로그인
          </button>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => window.location.href = '/signup'}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
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