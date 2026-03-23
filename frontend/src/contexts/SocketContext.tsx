'use client';

import { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore, useChatStore, useNotificationsStore } from '@/store';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (receiverId: string, encryptedMessage: string, mediaUrl?: string) => void;
  sendTyping: (receiverId: string, isTyping: boolean) => void;
  markAsRead: (senderId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, isAuthenticated } = useAuthStore();
  const { addMessage, addOnlineUser, removeOnlineUser, activeConversation } = useChatStore();
  const { addNotification } = useNotificationsStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      // Message events
      newSocket.on('message:receive', (message) => {
        addMessage(message);
        if (message.sender_id !== activeConversation) {
          toast.success(`New message from ${message.sender?.username || 'User'}`);
        }
      });

      newSocket.on('message:sent', (message) => {
        addMessage(message);
      });

      newSocket.on('message:error', (error) => {
        toast.error(error.error);
      });

      newSocket.on('message:read', ({ by }) => {
        // Update message read status
      });

      // Typing events
      newSocket.on('typing:start', ({ userId }) => {
        // Show typing indicator
      });

      newSocket.on('typing:stop', ({ userId }) => {
        // Hide typing indicator
      });

      // Online status events
      newSocket.on('user:online', ({ userId }) => {
        addOnlineUser(userId);
      });

      newSocket.on('user:offline', ({ userId }) => {
        removeOnlineUser(userId);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  const sendMessage = (receiverId: string, encryptedMessage: string, mediaUrl?: string) => {
    if (socket && isConnected) {
      socket.emit('message:send', {
        receiverId,
        encryptedMessage,
        mediaUrl,
        messageType: mediaUrl ? (mediaUrl.includes('video') ? 'video' : 'image') : 'text',
      });
    }
  };

  const sendTyping = (receiverId: string, isTyping: boolean) => {
    if (socket && isConnected) {
      socket.emit(isTyping ? 'typing:start' : 'typing:stop', { receiverId });
    }
  };

  const markAsRead = (senderId: string) => {
    if (socket && isConnected) {
      socket.emit('message:read', { senderId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        sendMessage,
        sendTyping,
        markAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
