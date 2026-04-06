// Orders.jsx - Compact Black & White Theme with Tracking Icons & Animations
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShoppingBag, FaClock, FaTruck, FaBoxOpen, FaCheckCircle, 
  FaTimesCircle, FaEye, FaArrowLeft, FaMapMarkerAlt, FaPhone,
  FaEdit, FaTrash, FaUser, FaStore, FaClipboardList, FaExclamationTriangle
} from 'react-icons/fa';
import { API_URL } from '../config';
import { showToast } from './utils';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [viewMode, setViewMode] = useState('customer');
  const [currentUser, setCurrentUser] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Handle token expiration
  const handleTokenExpired = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowSessionModal(true);
  };

  const redirectToLogin = () => {
    setShowSessionModal(false);
    navigate('/login');
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser, viewMode]);

  const fetchCurrentUser = async () => {
    if (!token) {
      handleTokenExpired();
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        handleTokenExpired();
        return;
      }
      
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        if (user.is_admin) setViewMode('admin');
        else if (user.can_upload) setViewMode('seller');
        else setViewMode('customer');
      } else {
        handleTokenExpired();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      showToast('Network error. Please check your connection.', 'error');
    }
  };

  const fetchOrders = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      let url = `${API_URL}/api/orders`;
      if (viewMode === 'admin') url = `${API_URL}/api/admin/orders`;
      else if (viewMode === 'seller') url = `${API_URL}/api/seller/orders`;
      
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (res.status === 401) {
        handleTokenExpired();
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } else if (res.status === 403) {
        showToast('You don\'t have permission to view these orders', 'error');
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!updatingOrder || !newStatus) return;

    try {
      const res = await fetch(`${API_URL}/api/orders/${updatingOrder.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, note: statusNote })
      });

      if (res.status === 401) {
        handleTokenExpired();
        return;
      }

      if (res.ok) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        setShowStatusModal(false);
        setUpdatingOrder(null);
        setNewStatus('');
        setStatusNote('');
        fetchOrders();
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update order status', 'error');
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order? This cannot be undone.')) return;

    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        handleTokenExpired();
        return;
      }

      if (res.ok) {
        showToast('Order deleted successfully', 'success');
        fetchOrders();
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to delete order', 'error');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      showToast('Failed to delete order', 'error');
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return <FaClock style={{ color: '#fbbf24' }} size={14} />;
      case 'processing': return <FaTruck style={{ color: '#60a5fa' }} size={14} />;
      case 'shipped': return <FaBoxOpen style={{ color: '#3b82f6' }} size={14} />;
      case 'delivered': return <FaCheckCircle style={{ color: '#22c55e' }} size={14} />;
      case 'cancelled': return <FaTimesCircle style={{ color: '#ef4444' }} size={14} />;
      default: return <FaShoppingBag size={14} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#fbbf24';
      case 'processing': return '#60a5fa';
      case 'shipped': return '#3b82f6';
      case 'delivered': return '#22c55e';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusSteps = (currentStatus) => {
    const steps = [
      { name: 'Order Placed', status: 'pending', icon: '📝' },
      { name: 'Processing', status: 'processing', icon: '⚙️' },
      { name: 'Shipped', status: 'shipped', icon: '🚚' },
      { name: 'Delivered', status: 'delivered', icon: '✅' }
    ];
    
    const currentIndex = steps.findIndex(step => step.status === currentStatus?.toLowerCase());
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  const calculateTotalFromItems = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const canUpdateStatus = (order) => {
    if (!currentUser) return false;
    if (currentUser.is_admin) return true;
    if (viewMode === 'seller') {
      return order.items?.some(item => item.product?.user_id === currentUser.id) || false;
    }
    return false;
  };

  const canDeleteOrder = (order) => {
    if (!currentUser) return false;
    return currentUser.is_admin && order.status !== 'delivered';
  };

  const getViewTitle = () => {
    switch(viewMode) {
      case 'admin': return 'All Orders';
      case 'seller': return 'My Sales';
      default: return 'My Orders';
    }
  };

  // Session expired modal
  if (showSessionModal) {
    return (
      <div style={styles.container}>
        <div style={styles.sessionModalOverlay}>
          <div style={styles.sessionModal}>
            <div style={styles.sessionModalIcon}>
              <FaExclamationTriangle size={48} color="#ef4444" />
            </div>
            <h2 style={styles.sessionModalTitle}>Session Expired</h2>
            <p style={styles.sessionModalText}>
              Your session has expired. Please login again to continue.
            </p>
            <button onClick={redirectToLogin} style={styles.sessionModalButton}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}>⏳</div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.headerBar}>
          <button onClick={() => navigate('/shop')} style={styles.backButton}>
            <FaArrowLeft size={12} /> Back
          </button>
          <div style={styles.viewSelector}>
            {currentUser?.is_admin && (
              <button onClick={() => setViewMode('admin')} style={{ ...styles.viewBtn, ...(viewMode === 'admin' ? styles.viewBtnActive : {}) }}>
                <FaStore size={12} /> All
              </button>
            )}
            {currentUser?.can_upload && (
              <button onClick={() => setViewMode('seller')} style={{ ...styles.viewBtn, ...(viewMode === 'seller' ? styles.viewBtnActive : {}) }}>
                <FaUser size={12} /> Sales
              </button>
            )}
            <button onClick={() => setViewMode('customer')} style={{ ...styles.viewBtn, ...(viewMode === 'customer' ? styles.viewBtnActive : {}) }}>
              <FaShoppingBag size={12} /> My Orders
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.header}>
            <FaClipboardList style={styles.headerIcon} />
            <h1 style={styles.title}>{getViewTitle()}</h1>
            <p style={styles.subtitle}>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>

          {orders.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>🛒</div>
              <p>No orders yet</p>
              <Link to="/shop" style={styles.emptyBtn}>Start Shopping</Link>
            </div>
          ) : (
            <div style={styles.ordersList}>
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  style={styles.orderCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -2 }}
                >
                  <div style={styles.orderHeader}>
                    <div>
                      <span style={styles.orderId}>#{order.id}</span>
                      <span style={styles.orderDate}>{new Date(order.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div style={{ ...styles.statusBadge, backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status) }}>
                      {getStatusIcon(order.status)}
                      <span>{order.status?.toUpperCase() || 'PENDING'}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={styles.orderItems}>
                    {(order.items || []).slice(0, 2).map((item, idx) => (
                      <div key={idx} style={styles.orderItem}>
                        <img 
                          src={item.product?.image_path ? `${API_URL}/uploads/${item.product.image_path.replace(/^\/+/, '')}` : '/placeholder-image.jpg'} 
                          alt="" 
                          style={styles.orderImage} 
                        />
                        <div style={styles.orderItemInfo}>
                          <p style={styles.orderItemName}>{item.product?.name || `Product #${item.product_id}`}</p>
                          <p style={styles.orderItemMeta}>{item.quantity} x KES {item.price?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    {(order.items || []).length > 2 && (
                      <p style={styles.moreItems}>+{order.items.length - 2} more items</p>
                    )}
                  </div>

                  {/* Order Total */}
                  <div style={styles.orderTotal}>
                    <strong>Total:</strong>
                    <strong>KES {order.total_amount?.toLocaleString() || calculateTotalFromItems(order.items).toLocaleString()}</strong>
                  </div>

                  {/* Tracking Timeline with Icons & Animations */}
                  <div style={styles.trackingTimeline}>
                    {getStatusSteps(order.status).map((step, index) => (
                      <motion.div 
                        key={index} 
                        style={styles.timelineStep}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <motion.div 
                          style={{ 
                            ...styles.timelineDot, 
                            ...(step.completed ? styles.timelineDotCompleted : {}),
                            ...(step.active ? styles.timelineDotActive : {})
                          }}
                          whileHover={{ scale: 1.1 }}
                        >
                          {step.completed ? '✓' : step.icon}
                        </motion.div>
                        {index < 3 && <div style={{ ...styles.timelineLine, ...(step.completed ? styles.timelineLineCompleted : {}) }} />}
                        <div style={styles.timelineLabel}>
                          <span style={{ ...styles.timelineName, ...(step.active ? styles.timelineNameActive : {}) }}>
                            {step.name}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div style={styles.actionButtons}>
                    <button onClick={() => setSelectedOrder(order)} style={styles.detailsBtn}>
                      <FaEye size={10} /> View
                    </button>
                    {canUpdateStatus(order) && (
                      <button onClick={() => { setUpdatingOrder(order); setNewStatus(order.status); setShowStatusModal(true); }} style={styles.updateBtn}>
                        <FaEdit size={10} /> Status
                      </button>
                    )}
                    {canDeleteOrder(order) && (
                      <button onClick={() => deleteOrder(order.id)} style={styles.deleteBtn}>
                        <FaTrash size={10} /> Delete
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            style={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              style={styles.modal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h2>Order #{selectedOrder.id}</h2>
                <button onClick={() => setSelectedOrder(null)} style={styles.modalClose}>✕</button>
              </div>
              <div style={styles.modalBody}>
                <div style={styles.detailRow}><strong>Status:</strong> <span style={{ color: getStatusColor(selectedOrder.status) }}>{selectedOrder.status?.toUpperCase()}</span></div>
                <div style={styles.detailRow}><strong>Date:</strong> <span>{new Date(selectedOrder.timestamp).toLocaleString()}</span></div>
                <div style={styles.detailRow}><strong>Location:</strong> <span>{selectedOrder.location}</span></div>
                <div style={styles.detailRow}><strong>Phone:</strong> <span>{selectedOrder.phone_number}</span></div>
                <div style={styles.detailRow}><strong>Email:</strong> <span>{selectedOrder.email}</span></div>
                {selectedOrder.delivery_notes && <div style={styles.detailRow}><strong>Notes:</strong> <span>{selectedOrder.delivery_notes}</span></div>}
                
                <h3 style={styles.modalSubtitle}>Items</h3>
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} style={styles.modalItem}>
                    <img src={item.product?.image_path ? `${API_URL}/uploads/${item.product.image_path.replace(/^\/+/, '')}` : '/placeholder-image.jpg'} alt="" style={styles.modalItemImage} />
                    <div>
                      <p><strong>{item.product?.name || `Product #${item.product_id}`}</strong></p>
                      <p>{item.quantity} x KES {item.price?.toLocaleString()} = KES {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                
                <div style={styles.modalTotal}>
                  <strong>Total Amount:</strong>
                  <strong>KES {selectedOrder.total_amount?.toLocaleString() || calculateTotalFromItems(selectedOrder.items).toLocaleString()}</strong>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Update Modal */}
      <AnimatePresence>
        {showStatusModal && updatingOrder && (
          <motion.div
            style={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              style={styles.modalSmall}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h2>Update Order #{updatingOrder.id}</h2>
                <button onClick={() => setShowStatusModal(false)} style={styles.modalClose}>✕</button>
              </div>
              <div style={styles.modalBody}>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={styles.select}>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <textarea placeholder="Add a note (optional)" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} rows="3" style={styles.textarea} />
                <div style={styles.modalButtons}>
                  <button onClick={() => setShowStatusModal(false)} style={styles.cancelBtn}>Cancel</button>
                  <button onClick={updateOrderStatus} style={styles.confirmBtn}>Update</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '60px 16px 40px'
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    color: '#000000'
  },
  viewSelector: {
    display: 'flex',
    gap: '8px'
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    color: '#666'
  },
  viewBtnActive: {
    background: '#000000',
    color: '#ffffff',
    borderColor: '#000000'
  },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e0e0e0'
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  headerIcon: {
    fontSize: '32px',
    color: '#000000',
    marginBottom: '8px'
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#000000',
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '12px',
    color: '#666'
  },
  empty: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
    opacity: 0.5
  },
  emptyBtn: {
    display: 'inline-block',
    padding: '8px 20px',
    background: '#000000',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '25px',
    fontSize: '13px',
    marginTop: '12px'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  orderCard: {
    background: '#fafafa',
    borderRadius: '10px',
    padding: '14px',
    border: '1px solid #eaeaea'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '8px'
  },
  orderId: {
    fontWeight: '600',
    fontSize: '13px',
    color: '#000000',
    marginRight: '10px'
  },
  orderDate: {
    fontSize: '11px',
    color: '#999'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500'
  },
  orderItems: {
    marginBottom: '10px'
  },
  orderItem: {
    display: 'flex',
    gap: '10px',
    padding: '8px 0',
    borderBottom: '1px solid #eaeaea'
  },
  orderImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '6px'
  },
  orderItemInfo: {
    flex: 1
  },
  orderItemName: {
    fontSize: '12px',
    fontWeight: '500',
    marginBottom: '4px',
    color: '#000000'
  },
  orderItemMeta: {
    fontSize: '11px',
    color: '#666'
  },
  moreItems: {
    fontSize: '11px',
    color: '#999',
    textAlign: 'center',
    marginTop: '6px'
  },
  orderTotal: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '8px 0',
    borderTop: '1px solid #eaeaea',
    fontSize: '13px'
  },
  trackingTimeline: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '14px 0',
    position: 'relative',
    padding: '0 8px'
  },
  timelineStep: {
    flex: 1,
    textAlign: 'center',
    position: 'relative'
  },
  timelineDot: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 6px',
    position: 'relative',
    zIndex: 2,
    fontSize: '12px',
    transition: 'all 0.2s ease'
  },
  timelineDotCompleted: {
    background: '#22c55e',
    color: 'white'
  },
  timelineDotActive: {
    background: '#000000',
    color: 'white',
    boxShadow: '0 0 0 3px rgba(0,0,0,0.1)'
  },
  timelineLine: {
    position: 'absolute',
    top: '14px',
    left: '50%',
    width: '100%',
    height: '2px',
    background: '#e0e0e0',
    zIndex: 1
  },
  timelineLineCompleted: {
    background: '#22c55e'
  },
  timelineLabel: {
    fontSize: '9px',
    color: '#666'
  },
  timelineName: {
    fontSize: '9px',
    fontWeight: '500'
  },
  timelineNameActive: {
    color: '#000000',
    fontWeight: '600'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
    flexWrap: 'wrap'
  },
  detailsBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    padding: '6px',
    background: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#000000',
    fontSize: '11px',
    fontWeight: '500'
  },
  updateBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    padding: '6px',
    background: '#000000',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '500'
  },
  deleteBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    padding: '6px',
    background: '#ffffff',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#ef4444',
    fontSize: '11px',
    fontWeight: '500'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px'
  },
  modal: {
    background: '#ffffff',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '85vh',
    overflow: 'auto'
  },
  modalSmall: {
    background: '#ffffff',
    borderRadius: '12px',
    maxWidth: '400px',
    width: '100%'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #eaeaea'
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#999'
  },
  modalBody: {
    padding: '16px'
  },
  modalSubtitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '12px',
    marginBottom: '8px',
    color: '#000000'
  },
  modalItem: {
    display: 'flex',
    gap: '10px',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  modalItemImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '6px'
  },
  modalTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #e0e0e0',
    fontSize: '14px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '12px'
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '12px',
    fontFamily: 'inherit'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'inherit',
    resize: 'vertical',
    marginBottom: '16px'
  },
  modalButtons: {
    display: 'flex',
    gap: '10px'
  },
  cancelBtn: {
    flex: 1,
    padding: '8px',
    background: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  confirmBtn: {
    flex: 1,
    padding: '8px',
    background: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '10px'
  },
  loadingSpinner: {
    fontSize: '30px',
    animation: 'spin 1s linear infinite'
  },
  sessionModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  },
  sessionModal: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  },
  sessionModalIcon: {
    marginBottom: '20px'
  },
  sessionModalTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#000000',
    marginBottom: '12px'
  },
  sessionModalText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px',
    lineHeight: '1.5'
  },
  sessionModalButton: {
    padding: '10px 24px',
    background: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  }
};

// Add keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Orders;