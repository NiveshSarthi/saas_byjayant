import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from './Card';
import Button from './Button';
import { Icons } from './Icons';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/notifications?page=${page}&limit=10`);
      if (page === 1) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.data.notifications]);
      }
      setHasMore(response.data.notifications.length === 10);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'var(--success-primary)';
      case 'warning': return 'var(--warning-primary)';
      case 'error': return 'var(--danger-primary)';
      case 'info':
      default: return 'var(--info-primary)';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ padding: 'var(--space-2xl)' }}>
      <Card style={{ padding: 'var(--space-xl)' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-lg)',
          paddingBottom: 'var(--space-md)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Notifications
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            {notifications.some(n => !n.isRead) && (
              <Button
                onClick={markAllAsRead}
                variant="ghost"
                size="sm"
                style={{ fontSize: '0.75rem' }}
              >
                Mark all read
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              style={{ padding: '0.25rem' }}
            >
              <Icons.X style={{ width: '1rem', height: '1rem' }} />
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{
          maxHeight: '350px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)'
        }}>
          {notifications.length === 0 && !loading && (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-2xl)',
              color: 'var(--text-tertiary)'
            }}>
              <Icons.Bell style={{ width: '2rem', height: '2rem', marginBottom: 'var(--space-md)', opacity: 0.5 }} />
              <div>No notifications yet</div>
            </div>
          )}

          {notifications.map(notification => (
            <div
              key={notification._id}
              onClick={() => !notification.isRead && markAsRead(notification._id)}
              style={{
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: notification.isRead ? 'var(--bg-surface)' : 'var(--bg-accent)',
                border: notification.isRead ? '1px solid var(--border-subtle)' : `2px solid ${getTypeColor(notification.type)}`,
                cursor: notification.actionUrl ? 'pointer' : 'default',
                transition: 'all var(--transition-fast)',
                position: 'relative'
              }}
            >
              {!notification.isRead && (
                <div style={{
                  position: 'absolute',
                  top: 'var(--space-sm)',
                  right: 'var(--space-sm)',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getTypeColor(notification.type)
                }} />
              )}

              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-xs)'
              }}>
                {notification.title}
              </div>

              <div style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.4',
                marginBottom: 'var(--space-sm)'
              }}>
                {notification.message}
              </div>

              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                textAlign: 'right'
              }}>
                {formatTime(notification.createdAt)}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-lg)',
              color: 'var(--text-tertiary)'
            }}>
              Loading...
            </div>
          )}

          {hasMore && !loading && (
            <Button
              onClick={() => setPage(prev => prev + 1)}
              variant="ghost"
              style={{ width: '100%', marginTop: 'var(--space-md)' }}
            >
              Load More
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NotificationPanel;