import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Connected to Real-Time WebSocket Server:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket Server');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Socket Connection Error:', err.message);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = (roomId) => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('join_room', String(roomId));
    }
  };

  const leaveRoom = (roomId) => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('leave_room', String(roomId));
    }
  };

  const sendMessage = (messageData) => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', messageData);
    }
  };

  const sendTyping = (data) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', data);
    }
  };

  const sendStopTyping = (data) => {
    if (socketRef.current) {
      socketRef.current.emit('stop_typing', data);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        joinRoom,
        leaveRoom,
        sendMessage,
        sendTyping,
        sendStopTyping
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
