
import { create } from 'zustand';

// Notification and NotificationState interfaces removed for JavaScript compatibility.

export const useNotificationStore = create((set, get) => ({
  notifications: [
    {
      id: '1',
      title: 'Welcome to DevSpace!',
      message: 'Start by creating your first project',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2', 
      title: 'New Feature Available',
      message: 'Check out the new collaboration tools',
      type: 'success',
      read: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3',
      title: 'System Maintenance',
      message: 'Scheduled maintenance tonight at 2 AM',
      type: 'warning',
      read: false,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
  
  addNotification: (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications]
    }));
  },
  
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    }));
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(notif => notif.id !== id)
    }));
  },
  
  getUnreadCount: () => {
    return get().notifications.filter(notif => !notif.read).length;
  },
}));
