import React, { useState } from 'react';
import { User, Lock, UserCircle, ChevronLeft } from 'lucide-react';

const SignupScreen = () => {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = (e) => {
    e.preventDefault();
    // 회원가입 로직 구현
    console.log('Signup attempt:', { username, nickname, password });
  };

  return (
    <div className="h-screen w-1/2 mx-auto bg-white flex flex-col">
      <div className="px-4 py-3 border-b flex items-center">
        <button
          onClick={() => window.location.href = '/'}
          className="absolute left-1/4 ml-4"
        >
          <ChevronLeft className="h-6 w-6 text-gray-500" />
        </button>
        <h1 className="text-xl font-semibold text-center flex-1">회원가입</h1>
      </div>
      
      <div className="flex-1 flex flex-col justify-center px-8">
        <form onSubmit={handleSignup} className="space-y-6">
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
              <UserCircle className="h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
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
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupScreen;