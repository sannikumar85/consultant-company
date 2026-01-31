import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon, 
  XMarkIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  InformationCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';

const NotificationCenter = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async (pageNum = 1, reset = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/notifications?page=${pageNum}&limit=20`);
      
      if (response.data.success) {
        const newNotifications = response.data.notifications;
        
        if (reset || pageNum === 1) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        
        setUnreadCount(response.data.unreadCount);
        setHasMore(response.data.pagination.current < response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true, isSeen: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Mark all as seen (when opening dropdown)
  const markAllAsSeen = async () => {
    try {
      await api.put('/notifications/mark-all-seen');
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isSeen: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as seen:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev =>
        prev.filter(notif => notif._id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Handle different notification types
    switch (notification.type) {
      case 'incoming_call':
      case 'missed_call':
        // Navigate to call page or show call interface
        console.log('Handle call notification:', notification.data);
        break;
      case 'new_message':
      case 'chat_message':
        // Navigate to chat
        console.log('Handle message notification:', notification.data);
        break;
      case 'call_answered':
      case 'call_rejected':
      case 'call_ended':
        // Show call status or navigate to call history
        console.log('Handle call status notification:', notification.data);
        break;
      default:
        console.log('Handle notification:', notification);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'incoming_call':
      case 'missed_call':
      case 'call_answered':
      case 'call_rejected':
      case 'call_ended':
        return <PhoneIcon className="h-5 w-5" />;
      case 'new_message':
      case 'chat_message':
        return <ChatBubbleLeftIcon className="h-5 w-5" />;
      case 'system_notification':
        return <InformationCircleIcon className="h-5 w-5" />;
      default:
        return <InformationCircleIcon className="h-5 w-5" />;
    }
  };

  // Get notification color
  const getNotificationColor = (type) => {
    switch (type) {
      case 'incoming_call':
        return 'text-green-600';
      case 'missed_call':
        return 'text-red-600';
      case 'call_answered':
        return 'text-blue-600';
      case 'call_rejected':
        return 'text-orange-600';
      case 'call_ended':
        return 'text-gray-600';
      case 'new_message':
      case 'chat_message':
        return 'text-purple-600';
      case 'system_notification':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // Format time
  const formatTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMs = now - notificationDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return notificationDate.toLocaleDateString();
  };

  // Load more notifications
  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
      fetchNotifications(page + 1);
    }
  };

  // Handle dropdown toggle
  const handleToggle = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      fetchNotifications(1, true);
      markAllAsSeen();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread count on mount and set up real-time listeners
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      
      // Set up socket listener for real-time notification updates
      if (socket) {
        const handleNewNotification = (data) => {
          console.log('📢 New notification received:', data);
          
          // Only process if this notification is for current user
          const notifRecipient = data.notification?.recipient?._id || data.notification?.recipient;
          if (notifRecipient === user._id || notifRecipient === user.id || data.unreadCount !== undefined) {
            console.log('✅ Notification is for current user');
            
            // Update unread count immediately
            if (data.unreadCount !== undefined) {
              setUnreadCount(data.unreadCount);
              console.log('🔔 Updated unread count:', data.unreadCount);
            }
            
            // Add new notification to the list immediately (no page refresh needed)
            if (data.notification) {
              setNotifications(prev => {
                // Check if notification already exists to prevent duplicates
                const exists = prev.find(n => n._id === data.notification._id);
                if (exists) {
                  console.log('⚠️ Notification already exists, skipping duplicate');
                  return prev;
                }
                console.log('➕ Added notification to list');
                return [data.notification, ...prev];
              });
            }
            
            // Force refresh if no notification object provided
            if (!data.notification && data.unreadCount) {
              fetchNotifications(1, true);
            }
          } else {
            console.log('❌ Notification not for current user');
          }
        };

        socket.on('newNotification', handleNewNotification);
        
        // Cleanup socket listener
        return () => {
          socket.off('newNotification', handleNewNotification);
          clearInterval(interval);
        };
      }
      
      return () => clearInterval(interval);
    }
  }, [user, socket, notifications.length]);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <motion.button
        onClick={handleToggle}
        className="relative p-2 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-2xl hover:bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {unreadCount > 0 ? (
          <BellSolid className="h-6 w-6 text-purple-400" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Notifications
                </h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-purple-400 hover:text-purple-300 flex items-center transition-colors duration-200"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/60 hover:text-white/80 transition-colors duration-200"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                  <p className="text-white/60 mt-2">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <BellIcon className="h-12 w-12 text-white/30 mx-auto mb-2" />
                  <p className="text-white/60">No notifications yet</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors duration-200 ${
                        !notification.isRead ? 'bg-purple-500/10' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-white/70 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-white/50">
                              {formatTime(notification.createdAt)}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification._id);
                              }}
                              className="text-xs text-red-400 hover:text-red-300 transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Load More */}
                  {hasMore && (
                    <div className="p-4 text-center">
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        className="text-sm text-purple-400 hover:text-purple-300 disabled:text-white/30 transition-colors duration-200"
                      >
                        {loading ? 'Loading...' : 'Load more'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
