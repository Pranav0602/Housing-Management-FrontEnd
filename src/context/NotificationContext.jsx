import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stompClient, setStompClient] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/ws`);
      const client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = () => {
        console.log('Connected to WebSocket');

        // Subscribe to private notifications
        client.subscribe(`/user/${user.id}/queue/notifications`, (message) => {
          const notification = JSON.parse(message.body);
          handleNewNotification(notification);
        });

        // Subscribe to society notifications
        if (user.societyId) {
          client.subscribe(`/topic/society/${user.societyId}`, (message) => {
            const notification = JSON.parse(message.body);
            handleNewNotification(notification);
          });

          // Subscribe to role-specific notifications
          if (user.role === 'ADMIN') {
            client.subscribe(`/topic/admin/${user.societyId}`, (message) => {
              const notification = JSON.parse(message.body);
              handleNewNotification(notification);
            });
          } else if (user.role === 'RESIDENT') {
            client.subscribe(`/topic/resident/${user.societyId}`, (message) => {
              const notification = JSON.parse(message.body);
              handleNewNotification(notification);
            });
          } else if (user.role === 'GUARD') {
            client.subscribe(`/topic/guard/${user.societyId}`, (message) => {
              const notification = JSON.parse(message.body);
              handleNewNotification(notification);
            });
          }
        }

        // Subscribe to global notifications
        client.subscribe('/topic/global', (message) => {
          const notification = JSON.parse(message.body);
          handleNewNotification(notification);
        });
      };

      client.onStompError = (frame) => {
        console.error('STOMP error', frame);
      };

      client.activate();
      setStompClient(client);

      return () => {
        if (client) {
          client.deactivate();
        }
      };
    }
  }, [isAuthenticated, user]);

  const handleNewNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
    
    // Show toast notification
    toast.info(notification.message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) => {
        if (notification.id === id && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
          return { ...notification, read: true };
        }
        return notification;
      })
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const sendNotification = (notification) => {
    if (stompClient && stompClient.connected) {
      const destination = `/app/${notification.type.toLowerCase()}-notification`;
      stompClient.publish({
        destination,
        body: JSON.stringify(notification),
      });
      return true;
    }
    return false;
  };

  const value = {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    clearNotifications,
    sendNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;