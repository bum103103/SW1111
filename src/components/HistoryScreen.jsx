import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';

const HistoryScreen = () => {
  const [logs, setLogs] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/passwords/access-logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Fetched logs:', response.data.logs); // 디버깅용
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return `오늘 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    return `${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-50 text-green-600';
      case 'FAILED':
        return 'bg-red-50 text-red-600';
      case 'ISSUED':
        return 'bg-blue-50 text-blue-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'SUCCESS':
        return '성공';
      case 'FAILED':
        return '실패';
      case 'ISSUED':
        return '발급';
      default:
        return status;
    }
  };

  return (
    <div className="h-screen w-1/2 mx-auto bg-white flex flex-col">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center">
          <button
            onClick={() => window.location.href = '/main'}
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-center flex-1">출입 이력</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            출입 기록이 없습니다.
          </div>
        ) : (
          logs.map((log, index) => (
            <div 
              key={index}
              className="border-b last:border-b-0 p-4 flex justify-between items-center"
            >
              <div>
                <div className="text-lg font-medium">
                  {log.nickname || '사용자'}
                </div>
                <div className="text-gray-500 text-sm">
                  {formatTime(log.access_time)}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(log.status)}`}>
                {getStatusText(log.status)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryScreen;