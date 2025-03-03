import React from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useNotifications, Notification } from '../../context/NotificationContext';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <div className="w-2 h-2 rounded-full bg-green-500"></div>;
    case 'error':
      return <div className="w-2 h-2 rounded-full bg-red-500"></div>;
    case 'warning':
      return <div className="w-2 h-2 rounded-full bg-yellow-500"></div>;
    default:
      return <div className="w-2 h-2 rounded-full bg-blue-500"></div>;
  }
};

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getNotificationTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 relative"
        onClick={toggleDropdown}
        aria-label="Notificaciones"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
              {notifications.length > 0 && (
                <div className="flex space-x-2">
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Check size={14} className="mr-1" />
                    Marcar todo como leído
                  </button>
                </div>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No hay notificaciones
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`px-4 py-3 border-b border-gray-100 ${!notification.read ? 'bg-gray-50' : ''}`}
                  >
                    {notification.link ? (
                      <Link 
                        to={notification.link} 
                        className="block" 
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <NotificationItem notification={notification} />
                      </Link>
                    ) : (
                      <div onClick={() => handleNotificationClick(notification)}>
                        <NotificationItem notification={notification} />
                      </div>
                    )}
                    <div className="mt-1 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notification.id);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mt-0.5">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="ml-2">
        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
        <p className="text-sm text-gray-600">{notification.message}</p>
      </div>
    </div>
  );
};

// Export the getNotificationIcon function to make it accessible
export { getNotificationIcon };

export default NotificationDropdown;