export class WebSocketService {
    constructor() {
      this.ws = null;
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
    }
  
    connect() {
      const token = localStorage.getItem('token');
      if (!token) return;
  
      this.ws = new WebSocket(`ws://localhost:3000?token=${token}`);
  
      this.ws.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        this.handleNotification(notification);
      };
  
      this.ws.onclose = () => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
          }, 3000);
        }
      };
    }
  
    handleNotification(notification) {
      // 브라우저 알림 표시
      pushNotificationService.show(notification);
  
      // 이벤트 발생
      const event = new CustomEvent('newNotification', { detail: notification });
      window.dispatchEvent(event);
    }
  
    disconnect() {
      if (this.ws) {
        this.ws.close();
      }
    }
  }
  
  export const wsService = new WebSocketService();