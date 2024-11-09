// services/pushNotificationService.js
export const pushNotificationService = {
    async requestPermission() {
      if (!('Notification' in window)) {
        return;
      }
      
      if (Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }
    },
  
    show(notification) {
      if (Notification.permission !== 'granted') return;
  
      new Notification(notification.title, {
        body: notification.message,
        icon: '/notification-icon.png'
      });
    }
  };