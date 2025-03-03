import React, { useState, useEffect } from 'react';
import { Menu, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Link } from 'react-router-dom';
import NotificationDropdown from '../Notifications/NotificationDropdown';
import ChatButton from '../Chat/ChatButton';
import ChatInterface from '../Chat/ChatInterface';

interface HeaderProps {
  setIsMobileOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useChat();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
  };
  
  // Effect to automatically open chat when there are unread messages
  useEffect(() => {
    if (unreadCount > 0) {
      setIsChatOpen(true);
    }
  }, [unreadCount]);

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-10 lg:left-64">
      <div className="flex items-center justify-between h-16 px-4">
        <button
          className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center ml-auto">
          {(user?.role === 'admin' || user?.role === 'accountant') && (
            <>
              <ChatButton onClick={() => setIsChatOpen(true)} />
              <NotificationDropdown />
            </>
          )}

          <div className="relative ml-3">
            <button
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={toggleDropdown}
            >
              <img
                className="h-8 w-8 rounded-full"
                src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                alt="User avatar"
              />
              <span className="ml-2 hidden md:block">{user?.name}</span>
            </button>

            {dropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={16} className="mr-2" />
                    Perfil
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings size={16} className="mr-2" />
                      Configuración
                    </Link>
                  )}
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-2" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Chat Interface */}
      {(user?.role === 'admin' || user?.role === 'accountant') && (
        <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      )}
    </header>
  );
};

export default Header;