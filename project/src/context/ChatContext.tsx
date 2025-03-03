import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface ChatContextType {
  messages: ChatMessage[];
  unreadCount: number;
  sendMessage: (content: string, receiverId: string) => void;
  markAsRead: (messageId: string) => void;
  markAllAsRead: () => void;
  getConversationWithUser: (userId: string) => ChatMessage[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load messages from localStorage on mount
  useEffect(() => {
    if (user) {
      const storedMessages = localStorage.getItem('chat_messages');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    }
  }, [user]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Calculate unread messages for current user
  const unreadCount = user 
    ? messages.filter(m => m.receiverId === user.id && !m.read).length 
    : 0;

  // Send a new message
  const sendMessage = (content: string, receiverId: string) => {
    if (!user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };

    setMessages(prev => [...prev, newMessage]);

    // Create a notification for the receiver
    addNotification({
      title: 'Nuevo mensaje',
      message: `${user.name}: ${content.substring(0, 30)}${content.length > 30 ? '...' : ''}`,
      type: 'info',
      link: '/chat'
    });
  };

  // Mark a message as read
  const markAsRead = (messageId: string) => {
    setMessages(prev =>
      prev.map(message =>
        message.id === messageId
          ? { ...message, read: true }
          : message
      )
    );
  };

  // Mark all messages as read
  const markAllAsRead = () => {
    if (!user) return;
    
    setMessages(prev =>
      prev.map(message =>
        message.receiverId === user.id
          ? { ...message, read: true }
          : message
      )
    );
  };

  // Get conversation with specific user
  const getConversationWithUser = (userId: string) => {
    if (!user) return [];
    
    return messages.filter(
      message => 
        (message.senderId === user.id && message.receiverId === userId) ||
        (message.senderId === userId && message.receiverId === user.id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        unreadCount,
        sendMessage,
        markAsRead,
        markAllAsRead,
        getConversationWithUser
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};