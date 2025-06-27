
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useSocket = (options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!options.autoConnect) return;

    const token = localStorage.getItem('accessToken');
    if (!token || !user) return;

    // Mock socket connection for demo
    const mockSocket = {
      connected: true,
      on: (event, callback) => {
        // Simulate some events for demo
        if (event === 'connect') {
          setTimeout(() => callback(), 100);
        }
      },
      emit: (event, data) => {
        console.log('Socket emit:', event, data);
      },
      disconnect: () => {
        setIsConnected(false);
      }
    };

    socketRef.current = mockSocket;
    setIsConnected(true);

    // Simulate connect event
    mockSocket.on('connect', () => {
      setIsConnected(true);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [options.autoConnect, user]);

  const joinProject = (projectId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-project', { projectId });
    }
  };

  const leaveProject = (projectId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-project', { projectId });
    }
  };

  const sendCodeChange = (data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('code-change', data);
    }
  };

  const sendCursorChange = (data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('cursor-change', data);
    }
  };

  return {
    isConnected,
    joinProject,
    leaveProject,
    sendCodeChange,
    sendCursorChange,
  };
};
