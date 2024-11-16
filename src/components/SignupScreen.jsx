import React, { useState } from 'react';
import { User, Lock, UserCircle, ChevronLeft } from 'lucide-react';

const SignupScreen = () => {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, nickname, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다.');
      }

      setSuccess(true);
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen w-full md:w-1/2 mx-auto bg-white flex flex-col">
      <div className="px-4 py-6 border-b flex items-center relative">
        <button
          onClick={() => window.location.href = '/'}
          className="absolute left-4 md:left-4"
        >
          <ChevronLeft className="h-6 w-6 text-gray-500" />
        </button>
        <h1 className="text-2xl font-semibold text-center flex-1">회원가입</h1>
      </div>
      
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-lg text-center text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-600 rounded-lg text-center text-sm">
            회원가입이 완료되었습니다. 잠시 후 로그인 페이지로 이동합니다.
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6 max-w-md w-full mx-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-white shadow-sm">
              <User className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="아이디"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 outline-none text-base w-full"
                required
              />
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg bg-white shadow-sm">
              <UserCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="flex-1 outline-none text-base w-full"
                required
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
                required
                minLength={4}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-base font-medium shadow-sm"
          >
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupScreen;