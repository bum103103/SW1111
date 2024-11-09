// services/notificationService.js
export const getNotifications = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/passwords/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  };
  
  export const markAsRead = async (notificationId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/passwords/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  };
  
  export const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/passwords/notifications/read-all', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  };