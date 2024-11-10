import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map();
  }

  initialize(server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws, req) => {
      try {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const token = urlParams.get('token');
        
        if (!token) {
          console.log('No token provided');
          ws.close();
          return;
        }

        // 토큰 검증
        const decoded = jwt.verify(token, 'your-secret-key');
        const userId = decoded.id;

        // 클라이언트 맵에 저장
        this.clients.set(userId, ws);
        console.log(`WebSocket client connected: User ID ${userId}`);

        // 연결 성공 로그만 남기고 메시지는 보내지 않음
        console.log('WebSocket connection established');

        ws.on('close', () => {
          console.log(`WebSocket client disconnected: User ID ${userId}`);
          this.clients.delete(userId);
        });

        ws.on('error', (error) => {
          console.error(`WebSocket error for User ID ${userId}:`, error);
          this.clients.delete(userId);
        });

      } catch (error) {
        console.error('WebSocket connection error:', error);
        ws.close();
      }
    });

    console.log('WebSocket server initialized');
  }

  sendToUser(userId, data) {
    try {
      const ws = this.clients.get(userId);
      if (ws && ws.readyState === ws.OPEN) {
        // notification 객체에 반드시 id 포함
        const notification = {
          ...data,
          id: data.id || undefined  // id가 없으면 undefined
        };
        ws.send(JSON.stringify(notification));
        console.log(`Notification sent to User ID ${userId}:`, notification);
      } else {
        console.log(`User ID ${userId} is not connected or socket is not open`);
      }
    } catch (error) {
      console.error(`Error sending message to User ID ${userId}:`, error);
    }
  }
}

export const wsService = new WebSocketService();