import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { announcementAPI, notificationAPI } from '../services/api';
import { 
  Bell, 
  X, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  MarkRead
} from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActiveAnnouncements();
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  const fetchActiveAnnouncements = async () => {
    try {
      const response = await announcementAPI.getActiveAnnouncements();
      setAnnouncements(response.announcements || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getUserNotifications({ limit: 10 });
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.unread || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Announcement Banner */}
      {announcements.length > 0 && (
        <div className="space-y-2 mb-4">
          {announcements.slice(0, 2).map((announcement) => (
            <div
              key={announcement.id}
              className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(announcement.priority)}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  {getTypeIcon(announcement.type)}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    📢 {announcement.title}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {formatDate(announcement.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notification Bell */}
      {user && (
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 z-50">
              <div className="p-4 border-b border-gray-200 dark:border-dark-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-primary-600 hover:text-primary-500"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Loading notifications...
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-dark-700">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-700 cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            {notification.type === 'announcement' ? (
                              <Bell className="h-4 w-4 text-blue-500" />
                            ) : (
                              getTypeIcon(notification.type)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {formatDate(notification.created_at)}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="flex-shrink-0 ml-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No notifications yet
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-dark-700">
                  <button className="w-full text-sm text-primary-600 hover:text-primary-500 text-center">
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
