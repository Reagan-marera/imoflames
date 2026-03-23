// Notifications.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaShoppingBag, FaCheckCircle, FaTruck, FaCreditCard, FaTimes } from 'react-icons/fa';
import { API_URL } from '../config';
import { showToast } from './utils';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(notifications.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(notifications.filter(notif => notif.id !== id));
        showToast('Notification deleted', 'success');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(notifications.map(notif => ({ ...notif, read: true })));
        showToast('All notifications marked as read', 'success');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'order': return <FaShoppingBag className="notif-icon order" />;
      case 'payment': return <FaCreditCard className="notif-icon payment" />;
      case 'shipping': return <FaTruck className="notif-icon shipping" />;
      case 'success': return <FaCheckCircle className="notif-icon success" />;
      default: return <FaBell className="notif-icon default" />;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  return (
    <div style={styles.container}>
      <div style={styles.backgroundElements}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.floatingElement,
              left: `${Math.random() * 100}%`,
              animation: `float${(i % 5) + 1} ${15 + Math.random() * 20}s infinite linear`,
              animationDelay: `${Math.random() * 10}s`
            }}
          >
            {['🔔', '📦', '💳', '🚚', '✨'][i % 5]}
          </div>
        ))}
      </div>

      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <FaBell style={styles.bellIcon} />
          </div>
          <h1 style={styles.title}>Notifications</h1>
          <p style={styles.subtitle}>Stay updated with your orders and activities</p>
        </div>

        <div style={styles.filterBar}>
          <div style={styles.filterButtons}>
            <button
              onClick={() => setFilter('all')}
              style={{ ...styles.filterButton, ...(filter === 'all' ? styles.filterActive : {}) }}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              style={{ ...styles.filterButton, ...(filter === 'unread' ? styles.filterActive : {}) }}
            >
              Unread ({notifications.filter(n => !n.read).length})
            </button>
            <button
              onClick={() => setFilter('read')}
              style={{ ...styles.filterButton, ...(filter === 'read' ? styles.filterActive : {}) }}
            >
              Read ({notifications.filter(n => n.read).length})
            </button>
          </div>
          {notifications.some(n => !n.read) && (
            <button onClick={markAllAsRead} style={styles.markAllButton}>
              Mark all as read
            </button>
          )}
        </div>

        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}>⏳</div>
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={styles.emptyContainer}>
            <FaBell style={styles.emptyIcon} />
            <h3>No notifications yet</h3>
            <p>When you receive notifications, they'll appear here</p>
          </div>
        ) : (
          <div style={styles.notificationsList}>
            <AnimatePresence>
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  style={{
                    ...styles.notificationItem,
                    ...(!notification.read ? styles.unread : {})
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div style={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div style={styles.notificationContent}>
                    <div style={styles.notificationHeader}>
                      <h4 style={styles.notificationTitle}>{notification.title}</h4>
                      <span style={styles.notificationTime}>
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={styles.notificationMessage}>{notification.message}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    style={styles.deleteButton}
                  >
                    <FaTimes />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '80px 20px 20px',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden'
  },
  floatingElement: {
    position: 'absolute',
    fontSize: '30px',
    opacity: 0.1,
    pointerEvents: 'none'
  },
  card: {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '40px',
    position: 'relative',
    zIndex: 1
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  iconContainer: {
    marginBottom: '15px'
  },
  bellIcon: {
    fontSize: '50px',
    color: '#667eea'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666'
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  filterButtons: {
    display: 'flex',
    gap: '10px'
  },
  filterButton: {
    padding: '8px 16px',
    border: '2px solid #e0e0e0',
    background: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  filterActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderColor: 'transparent'
  },
  markAllButton: {
    padding: '8px 16px',
    background: '#f0f0f0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '40px'
  },
  loadingSpinner: {
    fontSize: '40px',
    animation: 'spin 1s linear infinite',
    display: 'inline-block'
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  emptyIcon: {
    fontSize: '60px',
    color: '#ccc',
    marginBottom: '20px'
  },
  notificationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  notificationItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    padding: '15px',
    background: '#f9f9f9',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative'
  },
  unread: {
    background: '#f0f3ff',
    borderLeft: '4px solid #667eea'
  },
  notificationIcon: {
    flexShrink: 0
  },
  notificationContent: {
    flex: 1
  },
  notificationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px',
    flexWrap: 'wrap',
    gap: '5px'
  },
  notificationTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#333'
  },
  notificationTime: {
    fontSize: '12px',
    color: '#999'
  },
  notificationMessage: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5'
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#ccc',
    cursor: 'pointer',
    padding: '5px',
    transition: 'color 0.2s ease'
  }
};

export default Notifications;