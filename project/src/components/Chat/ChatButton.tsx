import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

interface ChatButtonProps {
  onClick: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
  const { unreadCount } = useChat();
  const { user } = useAuth();
  
  // Only show chat button for admin and accountant roles
  if (user?.role !== 'admin' && user?.role !== 'accountant') {
    return null;
  }

  return (
    <button 
      className="p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 relative mr-2"
      onClick={onClick}
      aria-label="Chat"
    >
      <MessageSquare size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatButton;