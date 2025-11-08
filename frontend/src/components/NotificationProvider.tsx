import React, { createContext, useContext, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast based on type
    switch (notification.type) {
      case 'success':
        toast.success(notification.message);
        break;
      case 'error':
        toast.error(notification.message);
        break;
      case 'warning':
        toast(notification.message, { icon: '⚠️' });
        break;
      default:
        toast(notification.message);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Simulate real-time notifications (in a real app, this would come from WebSocket or polling)
  useEffect(() => {
    const interval = setInterval(() => {
      // This is just for demo - in real app, notifications would come from backend
      const randomEvents = [
        { type: 'info' as const, title: 'Match Update', message: 'Court 1 match is about to start' },
        { type: 'warning' as const, title: 'Schedule Change', message: 'Court 2 match delayed by 15 minutes' },
        { type: 'success' as const, title: 'Match Complete', message: 'Player A defeated Player B 21-19' },
      ];

      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        addNotification(randomEvent);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, clearAll }}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-glass)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(20px)',
          },
        }}
      />
    </NotificationContext.Provider>
  );
};
