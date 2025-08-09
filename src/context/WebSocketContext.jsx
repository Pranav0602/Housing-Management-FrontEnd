import '../utils/sockjs-polyfill'; // Import the polyfill first
import { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { currentUser, isAuthenticated } = useAuth();

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (isAuthenticated() && currentUser) {
      connectWebSocket();
    }

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [currentUser]);

  // Connect to WebSocket
  const connectWebSocket = () => {
    const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/ws`); // Use environment variable or fallback to localhost
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
      setConnected(true);
      console.log('Connected to WebSocket');

      // Subscribe to user-specific notifications
      if (currentUser) {
        // Subscribe to user-specific channel
        client.subscribe(`/user/${currentUser.id}/notifications`, (message) => {
          const notification = JSON.parse(message.body);
          handleNotification(notification);
        });

        // Subscribe to role-specific channels
        if (currentUser.role === 'ADMIN') {
          client.subscribe('/topic/admin/notifications', (message) => {
            const notification = JSON.parse(message.body);
            handleNotification(notification);
          });
          
          // Subscribe to flat allocation requests
          client.subscribe('/topic/admin/' + currentUser.societyId, (message) => {
            const notification = JSON.parse(message.body);
            if (notification.type === 'NEW_ALLOCATION_REQUEST') {
              toast.info(notification.message);
              handleNotification(notification);
            }
          });
        }

        if (currentUser.role === 'RESIDENT') {
          client.subscribe(`/topic/society/${currentUser.societyId}/notifications`, (message) => {
            const notification = JSON.parse(message.body);
            handleNotification(notification);
          });
          
          // Subscribe to visitor approval requests
          client.subscribe(`/user/${currentUser.id}/visitor-requests`, (message) => {
            const visitor = JSON.parse(message.body);
            toast.info(`Visitor ${visitor.name} is waiting for your approval`);
            handleNotification({
              type: 'VISITOR_REQUEST',
              message: `Visitor ${visitor.name} is waiting for your approval`,
              data: visitor
            });
          });
        }

        if (currentUser.role === 'GUARD') {
          client.subscribe(`/topic/society/${currentUser.societyId}/guard-notifications`, (message) => {
            const notification = JSON.parse(message.body);
            handleNotification(notification);
          });
          
          // Subscribe to visitor approval responses
          client.subscribe(`/topic/visitor-responses`, (message) => {
            const response = JSON.parse(message.body);
            const status = response.approved ? 'approved' : 'rejected';
            toast.info(`Visitor request ${status} by ${response.approvedByName}`);
            handleNotification({
              type: 'VISITOR_RESPONSE',
              message: `Visitor request ${status} by ${response.approvedByName}`,
              data: response
            });
          });
        }
      }
    };

    client.onDisconnect = () => {
      setConnected(false);
      console.log('Disconnected from WebSocket');
    };

    client.onStompError = (frame) => {
      console.error('STOMP error', frame);
    };

    client.activate();
    setStompClient(client);
  };

  // Handle incoming notifications
  const handleNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    
    // Show toast notification
    if (notification.type === 'NOTICE') {
      toast.info(notification.message);
    } else if (notification.type === 'COMPLAINT_UPDATE') {
      toast.info(notification.message);
    } else if (notification.type === 'MAINTENANCE_BILL') {
      toast.info(notification.message);
    }
  };

  // Send message to WebSocket
  const sendMessage = (destination, message) => {
    if (stompClient && connected) {
      stompClient.publish({
        destination,
        body: JSON.stringify(message)
      });
    } else {
      console.error('WebSocket not connected');
    }
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Context value
  const value = {
    connected,
    notifications,
    sendMessage,
    clearNotifications
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;