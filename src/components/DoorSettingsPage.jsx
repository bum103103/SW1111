// src/components/DoorSettingsPage.jsx

import React from 'react';
import { ArrowLeft, Key, Users, History, Settings, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const DoorSettingsPage = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const [userInfo, setUserInfo] = React.useState(null);

 React.useEffect(() => {
   if (location.state?.nickname) {
     setUserInfo({
       nickname: location.state.nickname,
       username: location.state.username,
       userId: location.state.userId
     });
   } else {
     navigate('/', { replace: true });
   }
 }, [location.state, navigate]);

 return (
   <div className="w-full max-w-md mx-auto h-screen bg-gray-50 flex flex-col overflow-y-auto">
     {/* 헤더 */}
     <div className="bg-white p-4 flex items-center sticky top-0 z-10">
       <ArrowLeft 
         className="w-6 h-6 cursor-pointer" 
         onClick={() => navigate(-1)}
       />
       <h1 className="text-lg font-medium ml-4">도어락 관리</h1>
     </div>

     {/* 비밀번호 발급 섹션 */}
     <div className="mt-4">
       <div className="px-4 py-2 text-sm text-gray-500">비밀번호 발급</div>
       <div className="bg-white">
         <div 
           className="px-4 py-4 border-b flex justify-between items-center cursor-pointer"
           onClick={() => navigate('/issue', { 
             state: { 
               userId: userInfo?.userId,
               username: userInfo?.username,
               nickname: userInfo?.nickname
             }
           })}
         >
           <div className="flex items-center gap-4">
             <div className="p-2 bg-gray-50 rounded-lg">
               <Key className="h-5 w-5 text-blue-500" />
             </div>
             <div>
               <div className="font-medium">비밀번호 발급하기</div>
               <div className="text-sm text-gray-500">
                 배달기사, 방문자를 위한 비밀번호 발급
               </div>
             </div>
           </div>
           <ChevronRight className="w-6 h-6 text-gray-400" />
         </div>

         <div 
           className="px-4 py-4 flex justify-between items-center cursor-pointer"
           onClick={() => navigate('/receive', {
             state: {
               userId: userInfo?.userId,
               username: userInfo?.username,
               nickname: userInfo?.nickname
             }
           })}
         >
           <div className="flex items-center gap-4">
             <div className="p-2 bg-gray-50 rounded-lg">
               <Users className="h-5 w-5 text-green-500" />
             </div>
             <div>
               <div className="font-medium">비밀번호 발급받기</div>
               <div className="text-sm text-gray-500">
                 등록된 사용자를 위한 비밀번호 수령
               </div>
             </div>
           </div>
           <ChevronRight className="w-6 h-6 text-gray-400" />
         </div>
       </div>
     </div>

     {/* 비밀번호 관리 섹션 */}
     <div className="mt-4">
       <div className="px-4 py-2 text-sm text-gray-500">비밀번호 관리</div>
       <div className="bg-white">
         <div 
           className="px-4 py-4 flex justify-between items-center cursor-pointer"
           onClick={() => navigate('/test-password-management', {
             state: {
               userId: userInfo?.userId,
               username: userInfo?.username,
               nickname: userInfo?.nickname
             }
           })}
         >
           <div className="flex items-center gap-4">
             <div className="p-2 bg-gray-50 rounded-lg">
               <Key className="h-5 w-5 text-orange-500" />
             </div>
             <div>
               <div className="font-medium">비밀번호 관리</div>
               <div className="text-sm text-gray-500">
                 발급한 비밀번호 조회 및 관리
               </div>
             </div>
           </div>
           <ChevronRight className="w-6 h-6 text-gray-400" />
         </div>
       </div>
     </div>

     {/* 이력 조회 섹션 */}
     <div className="mt-4">
       <div className="px-4 py-2 text-sm text-gray-500">이력 조회</div>
       <div className="bg-white">
         <div 
           className="px-4 py-4 border-b flex justify-between items-center cursor-pointer"
           onClick={() => navigate('/issue-history', {
             state: {
               userId: userInfo?.userId,
               username: userInfo?.username,
               nickname: userInfo?.nickname
             }
           })}
         >
           <div className="flex items-center gap-4">
             <div className="p-2 bg-gray-50 rounded-lg">
               <History className="h-5 w-5 text-purple-500" />
             </div>
             <div>
               <div className="font-medium">발급 기록</div>
               <div className="text-sm text-gray-500">
                 비밀번호 발급 내역 조회
               </div>
             </div>
           </div>
           <ChevronRight className="w-6 h-6 text-gray-400" />
         </div>

         <div 
           className="px-4 py-4 flex justify-between items-center cursor-pointer"
           onClick={() => navigate('/access-history', {
             state: {
               userId: userInfo?.userId,
               username: userInfo?.username,
               nickname: userInfo?.nickname
             }
           })}
         >
           <div className="flex items-center gap-4">
             <div className="p-2 bg-gray-50 rounded-lg">
               <Settings className="h-5 w-5 text-gray-500" />
             </div>
             <div>
               <div className="font-medium">출입 기록</div>
               <div className="text-sm text-gray-500">
                 도어락 사용 이력 조회
               </div>
             </div>
           </div>
           <ChevronRight className="w-6 h-6 text-gray-400" />
         </div>
       </div>
     </div>
   </div>
 );
};

export default DoorSettingsPage;