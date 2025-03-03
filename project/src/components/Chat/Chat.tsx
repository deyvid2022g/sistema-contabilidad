import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat, ChatMessage } from '../../context/ChatContext';
import { Send, X } from 'lucide-react';

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { sendMessage, markAllAsRead, messages } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [receiver, setReceiver] = useState<{ id: string; role: string } | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      setReceiver({ id: '2', role: 'accountant' });
    } else if (user?.role === 'accountant') {
      setReceiver({ id: '1', role: 'admin' });
    }

    // Mark received messages as read
    if (isOpen && user) {
      markAllAsRead();
    }
  }, [user, isOpen]); // Removed markAllAsRead from dependencies as it's stable

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !receiver) return;

    sendMessage(newMessage.trim(), receiver.id);
    setNewMessage('');
  };

  if (!isOpen) return null;

  // Filter messages for the current conversation
  const conversationMessages = messages.filter(
    msg => (
      (msg.senderId === user?.id && msg.receiverId === receiver?.id) ||
      (msg.senderId === receiver?.id && msg.receiverId === user?.id)
    )
  );

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">
          Chat con {receiver?.role === 'admin' ? 'Administrador' : 'Contador'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {conversationMessages.map((message: ChatMessage) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${message.senderId === user?.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900'
                }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;