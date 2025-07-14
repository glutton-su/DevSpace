import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Star, Heart, Users, MessageCircle, GitFork } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Mock notifications data
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'like',
        title: 'Sarah Chen liked your snippet',
        message: 'React Custom Hook for API Calls',
        time: '2 minutes ago',
        isRead: false,
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
        link: '/snippet/1'
      },
      {
        id: 2,
        type: 'follow',
        title: 'Alex Rodriguez started following you',
        message: '',
        time: '1 hour ago',
        isRead: false,
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
        link: '/profile/alex_rodriguez'
      },
      {
        id: 3,
        type: 'fork',
        title: 'Mike Johnson forked your snippet',
        message: 'Python Data Validation Decorator',
        time: '3 hours ago',
        isRead: true,
        avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
        link: '/snippet/2'
      },
      {
        id: 4,
        type: 'comment',
        title: 'Emma Wilson commented on your snippet',
        message: 'Great implementation! Could you explain the error handling part?',
        time: '5 hours ago',
        isRead: true,
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
        link: '/snippet/1'
      },
      {
        id: 5,
        type: 'collaboration',
        title: 'David Kim invited you to collaborate',
        message: 'React Component Library project',
        time: '1 day ago',
        isRead: true,
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
        link: '/collaborate/1'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-400" />;
      case 'follow':
        return <Users className="h-4 w-4 text-blue-400" />;
      case 'fork':
        return <GitFork className="h-4 w-4 text-green-400" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-purple-400" />;
      case 'collaboration':
        return <Star className="h-4 w-4 text-yellow-400" />;
      default:
        return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 glass-effect rounded-lg shadow-xl py-2 z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y divide-dark-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-dark-800 transition-colors ${
                  !notification.isRead ? 'bg-dark-800/50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <img
                    src={notification.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          to={notification.link}
                          onClick={() => {
                            markAsRead(notification.id);
                            onClose();
                          }}
                          className="block hover:text-primary-400 transition-colors"
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {getNotificationIcon(notification.type)}
                            <p className={`text-sm ${
                              !notification.isRead ? 'text-white font-medium' : 'text-dark-200'
                            }`}>
                              {notification.title}
                            </p>
                          </div>
                          {notification.message && (
                            <p className="text-xs text-dark-400 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          <p className="text-xs text-dark-500 mt-1">
                            {notification.time}
                          </p>
                        </Link>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-dark-400 hover:text-primary-400 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={() => clearNotification(notification.id)}
                          className="p-1 text-dark-400 hover:text-red-400 transition-colors"
                          title="Remove notification"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <Bell className="h-12 w-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">No notifications yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-dark-700 px-4 py-3">
          <Link
            to="/notifications"
            onClick={onClose}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;