import { WebSocketServer } from 'ws';  // 수정된 부분
import jwt from 'jsonwebtoken';

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> WebSocket 매핑
  }

  initialize(server) {
    this.wss = new WebSocketServer({ server });  // 수정된 부분

    this.wss.on('connection', (ws, req) => {
      try {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const token = urlParams.get('token');
        
        if (!token) {
          ws.close();
          return;
        }

        // 토큰 검증
        const decoded = jwt.verify(token, 'your-secret-key');
        const userId = decoded.id;

        // 클라이언트 맵에 저장
        this.clients.set(userId, ws);

        console.log(`WebSocket client connected: User ID ${userId}`);

        // 연결 종료 시 cleanup
        ws.on('close', () => {
          console.log(`WebSocket client disconnected: User ID ${userId}`);
          this.clients.delete(userId);
        });

        // 에러 처리
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
        ws.send(JSON.stringify(data));
        console.log(`Notification sent to User ID ${userId}:`, data);
      } else {
        console.log(`User ID ${userId} is not connected or socket is not open`);
      }
    } catch (error) {
      console.error(`Error sending message to User ID ${userId}:`, error);
    }
  }

  broadcastMessage(data) {
    this.clients.forEach((ws, userId) => {
      try {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify(data));
          console.log(`Broadcast message sent to User ID ${userId}`);
        }
      } catch (error) {
        console.error(`Error broadcasting to User ID ${userId}:`, error);
      }
    });
  }
}

export const wsService = new WebSocketService();