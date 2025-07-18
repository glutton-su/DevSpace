import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

export const useWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('authToken');
      
      const newSocket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
        setIsConnected(false);
      });

      newSocket.on('error', (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, user]);

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join-project', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket) {
      socket.emit('leave-project', roomId);
    }
  };

  const sendCodeChange = (data) => {
    if (socket) {
      socket.emit('code-change', data);
    }
  };

  const sendCursorChange = (data) => {
    if (socket) {
      socket.emit('cursor-change', data);
    }
  };

  const startTyping = (projectId) => {
    if (socket) {
      socket.emit('typing-start', { projectId });
    }
  };

  const stopTyping = (projectId) => {
    if (socket) {
      socket.emit('typing-stop', { projectId });
    }
  };

  return {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendCodeChange,
    sendCursorChange,
    startTyping,
    stopTyping
  };
};