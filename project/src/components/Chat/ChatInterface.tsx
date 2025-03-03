import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Send, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { messages, sendMessage, markAsRead, markAllAsRead, getConversationWithUser } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [receiverId, setReceiverId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Find the appropriate receiver based on current user's role
  useEffect(() => {
    if (user) {
      // If current user is admin, receiver is accountant (id: '2')
      // If current user is accountant, receiver is admin (id: '1')
      setReceiverId(user.role === 'admin' ? '2' : '1');
    }
  }, [user]);

  // Get conversation with the current receiver
  const conversation = receiverId ? getConversationWithUser(receiverId) : [];

  // Mark messages as read when opening chat
  useEffect(() => {
    if (isOpen && user) {
      markAllAsRead();
    }
  }, [isOpen, user, markAllAsRead]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && receiverId) {
      sendMessage(newMessage.trim(), receiverId);
      setNewMessage('');
    }
  };

  // Get receiver name based on role
  const getReceiverName = () => {
    return user?.role === 'admin' ? 'Contador' : 'Administrador';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col z-50 overflow-hidden">
      {/* Chat header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-medium">Chat con {getReceiverName()}</h3>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
        {conversation.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">
            No hay mensajes. ¡Envía el primero!
          </div>
        ) : (
          conversation.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div 
                key={msg.id} 
                className={`mb-3 max-w-[80%] ${isMine ? 'ml-auto' : 'mr-auto'}`}
              >
                <div 
                  className={`p-3 rounded-lg ${isMine ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  {msg.content}
                </div>
                <div 
                  className={`text-xs mt-1 text-gray-500 ${isMine ? 'text-right' : 'text-left'}`}
                >
                  {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true, locale: es })}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-blue-600 text-white px-3 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none disabled:bg-blue-300"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;