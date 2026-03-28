// Orders.jsx - Complete with order tracking, status updates, and role-based views
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShoppingBag, FaClock, FaTruck, FaBoxOpen, FaCheckCircle, 
  FaTimesCircle, FaEye, FaArrowLeft, FaMapMarkerAlt, FaPhone,
  FaEdit, FaTrash, FaHistory, FaUser, FaStore
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
  const [viewMode, setViewMode] = useState('customer'); // 'customer', 'seller', 'admin'
  const [currentUser, setCurrentUser] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  const fetchCurrentUser = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        // Set view mode based on user role
        if (user.is_admin) {
          setViewMode('admin');
        } else if (user.can_upload) {
          setViewMode('seller');
        } else {
          setViewMode('customer');
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchOrders = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      
      let url = `${API_URL}/api/orders`;
      if (viewMode === 'admin') {
        url = `${API_URL}/api/admin/orders`;
      } else if (viewMode === 'seller') {
        url = `${API_URL}/api/seller/orders`;
      }
      
      const res = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showToast('Session expired. Please login again.', 'error');
        navigate('/login');
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to load orders', 'error');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to load orders. Please check your connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!updatingOrder || !newStatus) return;

    try {
      const res = await fetch(`${API_URL}/api/orders/${updatingOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote
        })
      });

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
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

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
      case 'pending': return <FaClock style={{ color: '#ffc107' }} />;
      case 'processing': return <FaTruck style={{ color: '#17a2b8' }} />;
      case 'shipped': return <FaBoxOpen style={{ color: '#007bff' }} />;
      case 'delivered': return <FaCheckCircle style={{ color: '#28a745' }} />;
      case 'cancelled': return <FaTimesCircle style={{ color: '#dc3545' }} />;
      default: return <FaShoppingBag />;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'shipped': return '#007bff';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
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
      // Check if seller owns any product in this order
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
      case 'seller': return 'Orders for My Products';
      default: return 'My Orders';
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}>⏳</div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundElements}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.floatingElement,
              left: `${Math.random() * 100}%`,
              animation: `float${(i % 5) + 1} ${15 + Math.random() * 20}s infinite linear`
            }}
          >
            {['📦', '🚚', '📝', '💰', '✨', '🎁'][i % 6]}
          </div>
        ))}
      </div>

      <div style={styles.content}>
        <div style={styles.headerBar}>
          <button onClick={() => navigate('/shop')} style={styles.backButton}>
            <FaArrowLeft /> Continue Shopping
          </button>
          <div style={styles.viewSelector}>
            {currentUser?.is_admin && (
              <button 
                onClick={() => { setViewMode('admin'); fetchOrders(); }} 
                style={{ ...styles.viewButton, ...(viewMode === 'admin' ? styles.activeView : {}) }}
              >
                <FaStore /> All Orders
              </button>
            )}
            {currentUser?.can_upload && (
              <button 
                onClick={() => { setViewMode('seller'); fetchOrders(); }} 
                style={{ ...styles.viewButton, ...(viewMode === 'seller' ? styles.activeView : {}) }}
              >
                <FaUser /> My Sales
              </button>
            )}
            <button 
              onClick={() => { setViewMode('customer'); fetchOrders(); }} 
              style={{ ...styles.viewButton, ...(viewMode === 'customer' ? styles.activeView : {}) }}
            >
              <FaShoppingBag /> My Orders
            </button>
          </div>
        </div>

        <div style={styles.ordersCard}>
          <div style={styles.header}>
            <FaShoppingBag style={styles.headerIcon} />
            <h1 style={styles.title}>{getViewTitle()}</h1>
            <p style={styles.subtitle}>Track and manage your orders</p>
          </div>

          {orders.length === 0 ? (
            <div style={styles.emptyOrders}>
              <div style={styles.emptyIcon}>🛒</div>
              <h3>No orders yet</h3>
              <p>You haven't placed any orders. Start shopping now!</p>
              <Link to="/shop" style={styles.shopButton}>Start Shopping</Link>
            </div>
          ) : (
            <div style={styles.ordersList}>
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  style={styles.orderCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                >
                  <div style={styles.orderHeader}>
                    <div>
                      <span style={styles.orderId}>Order #{order.id}</span>
                      <span style={styles.orderDate}>
                        {new Date(order.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ ...styles.statusBadge, background: getStatusColor(order.status) + '20', color: getStatusColor(order.status) }}>
                      {getStatusIcon(order.status)}
                      <span>{order.status?.toUpperCase() || 'PENDING'}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={styles.orderItemsContainer}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={styles.orderItem}>
                        <img 
                          src={item.product?.image_path ? `${API_URL}/uploads/${item.product.image_path.replace(/^\/+/, '')}` : '/placeholder-image.jpg'}
                          alt={item.product?.name || 'Product'}
                          style={styles.orderImage}
                          onError={(e) => e.target.src = '/placeholder-image.jpg'}
                        />
                        <div style={styles.orderItemDetails}>
                          <h4 style={styles.orderProductName}>{item.product?.name || `Product #${item.product_id}`}</h4>
                          <p style={styles.orderMeta}>Quantity: {item.quantity}</p>
                          <p style={styles.orderPrice}>KES {item.price?.toLocaleString()}</p>
                          <p style={styles.orderSubtotal}>Subtotal: KES {(item.price * item.quantity)?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div style={styles.orderTotalSection}>
                    <strong>Total Amount:</strong>
                    <strong style={styles.orderTotalAmount}>
                      KES {order.total_amount?.toLocaleString() || calculateTotalFromItems(order.items).toLocaleString()}
                    </strong>
                  </div>

                  {/* Delivery Info */}
                  <div style={styles.deliveryInfo}>
                    <div><FaMapMarkerAlt /> {order.location}</div>
                    <div><FaPhone /> {order.phone_number}</div>
                    {order.delivery_notes && <div>📝 {order.delivery_notes}</div>}
                    {order.user && viewMode !== 'customer' && (
                      <div><FaUser /> Customer: {order.user.username} ({order.email})</div>
                    )}
                  </div>

                  {/* Order Tracking Timeline */}
                  <div style={styles.trackingTimeline}>
                    {getStatusSteps(order.status).map((step, index) => (
                      <div key={index} style={styles.timelineStep}>
                        <div style={{ ...styles.timelineDot, ...(step.completed ? styles.timelineDotCompleted : {}) }}>
                          {step.completed ? '✓' : step.icon}
                        </div>
                        {index < 3 && <div style={{ ...styles.timelineLine, ...(step.completed ? styles.timelineLineCompleted : {}) }} />}
                        <div style={styles.timelineLabel}>
                          <span style={{ ...styles.timelineName, ...(step.active ? styles.timelineNameActive : {}) }}>
                            {step.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div style={styles.actionButtons}>
                    <button onClick={() => setSelectedOrder(order)} style={styles.viewDetailsBtn}>
                      <FaEye /> View Details
                    </button>
                    {canUpdateStatus(order) && (
                      <button 
                        onClick={() => {
                          setUpdatingOrder(order);
                          setNewStatus(order.status);
                          setShowStatusModal(true);
                        }} 
                        style={styles.updateStatusBtn}
                      >
                        <FaEdit /> Update Status
                      </button>
                    )}
                    {canDeleteOrder(order) && (
                      <button onClick={() => deleteOrder(order.id)} style={styles.deleteOrderBtn}>
                        <FaTrash /> Delete
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
              style={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h2>Order #{selectedOrder.id}</h2>
                <button onClick={() => setSelectedOrder(null)} style={styles.closeBtn}>✕</button>
              </div>
              
              <div style={styles.modalBody}>
                <div style={styles.detailRow}>
                  <strong>Status:</strong>
                  <span style={{ color: getStatusColor(selectedOrder.status) }}>
                    {selectedOrder.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <strong>Date:</strong>
                  <span>{new Date(selectedOrder.timestamp).toLocaleString()}</span>
                </div>
                
                <h3 style={styles.modalSubtitle}>Items</h3>
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} style={styles.modalItem}>
                    <img 
                      src={item.product?.image_path ? `${API_URL}/uploads/${item.product.image_path.replace(/^\/+/, '')}` : '/placeholder-image.jpg'}
                      alt={item.product?.name}
                      style={styles.modalItemImage}
                    />
                    <div style={styles.modalItemDetails}>
                      <p><strong>{item.product?.name || `Product #${item.product_id}`}</strong></p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: KES {item.price?.toLocaleString()}</p>
                      <p>Subtotal: KES {(item.price * item.quantity)?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                
                <div style={styles.modalTotal}>
                  <strong>Total Amount:</strong>
                  <strong style={styles.modalTotalAmount}>
                    KES {selectedOrder.total_amount?.toLocaleString() || 
                      (selectedOrder.items && calculateTotalFromItems(selectedOrder.items).toLocaleString())}
                  </strong>
                </div>
                
                <h3 style={styles.modalSubtitle}>Delivery Information</h3>
                <div style={styles.detailRow}>
                  <strong>Location:</strong>
                  <span>{selectedOrder.location}</span>
                </div>
                <div style={styles.detailRow}>
                  <strong>Phone:</strong>
                  <span>{selectedOrder.phone_number}</span>
                </div>
                <div style={styles.detailRow}>
                  <strong>Email:</strong>
                  <span>{selectedOrder.email}</span>
                </div>
                {selectedOrder.delivery_notes && (
                  <div style={styles.detailRow}>
                    <strong>Delivery Notes:</strong>
                    <span>{selectedOrder.delivery_notes}</span>
                  </div>
                )}
                
                {/* Status History */}
                {selectedOrder.history && selectedOrder.history.length > 0 && (
                  <>
                    <h3 style={styles.modalSubtitle}>Status History</h3>
                    <div style={styles.historyList}>
                      {selectedOrder.history.map((history, idx) => (
                        <div key={idx} style={styles.historyItem}>
                          <div style={styles.historyHeader}>
                            <span style={{ color: getStatusColor(history.status) }}>
                              {history.status.toUpperCase()}
                            </span>
                            <span style={styles.historyDate}>
                              {new Date(history.created_at).toLocaleString()}
                            </span>
                          </div>
                          {history.note && <p style={styles.historyNote}>{history.note}</p>}
                          {history.created_by && <small>By: {history.created_by}</small>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
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
              style={styles.modalContentSmall}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h2>Update Order #{updatingOrder.id}</h2>
                <button onClick={() => setShowStatusModal(false)} style={styles.closeBtn}>✕</button>
              </div>
              
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label>Status</label>
                  <select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)}
                    style={styles.select}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label>Note (optional)</label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add a note for the customer..."
                    rows="3"
                    style={styles.textarea}
                  />
                </div>
                
                <div style={styles.modalButtons}>
                  <button onClick={() => setShowStatusModal(false)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button onClick={updateOrderStatus} style={styles.confirmBtn}>
                    Update Status
                  </button>
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
  // Keep all existing styles from your current Orders.jsx
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
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
  content: {
    position: 'relative',
    zIndex: 1,
    padding: '80px 20px 40px',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'red',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  viewSelector: {
    display: 'flex',
    gap: '10px'
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'purple',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  activeView: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  ordersCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  headerIcon: {
    fontSize: '48px',
    color: '#667eea',
    marginBottom: '10px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666'
  },
  emptyOrders: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  emptyIcon: {
    fontSize: '80px',
    marginBottom: '20px',
    opacity: 0.5
  },
  shopButton: {
    display: 'inline-block',
    padding: '12px 30px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '25px',
    marginTop: '20px'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  orderCard: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    transition: 'all 0.2s ease'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: '16px',
    marginRight: '15px'
  },
  orderDate: {
    fontSize: '12px',
    color: '#999'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  orderItemsContainer: {
    marginBottom: '15px'
  },
  orderItem: {
    display: 'flex',
    gap: '15px',
    padding: '10px 0',
    borderBottom: '1px solid #e0e0e0'
  },
  orderImage: {
    width: '70px',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  orderItemDetails: {
    flex: 1
  },
  orderProductName: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  orderMeta: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '3px'
  },
  orderPrice: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#667eea'
  },
  orderSubtotal: {
    fontSize: '12px',
    color: '#999',
    marginTop: '3px'
  },
  orderTotalSection: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '10px 0',
    marginTop: '10px',
    borderTop: '1px solid #e0e0e0'
  },
  orderTotalAmount: {
    color: '#667eea',
    fontSize: '18px'
  },
  deliveryInfo: {
    background: '#fff',
    padding: '10px',
    borderRadius: '8px',
    marginTop: '10px',
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  trackingTimeline: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '20px 0',
    position: 'relative',
    padding: '0 10px'
  },
  timelineStep: {
    flex: 1,
    textAlign: 'center',
    position: 'relative'
  },
  timelineDot: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 8px',
    position: 'relative',
    zIndex: 2,
    fontSize: '14px'
  },
  timelineDotCompleted: {
    background: '#28a745',
    color: 'white'
  },
  timelineLine: {
    position: 'absolute',
    top: '15px',
    left: '50%',
    width: '100%',
    height: '2px',
    background: '#e0e0e0',
    zIndex: 1
  },
  timelineLineCompleted: {
    background: '#28a745'
  },
  timelineLabel: {
    fontSize: '10px',
    color: '#666'
  },
  timelineName: {
    fontSize: '10px',
    fontWeight: '500'
  },
  timelineNameActive: {
    color: '#667eea',
    fontWeight: 'bold'
  },
 actionButtons: {
  display: 'flex',
  gap: '8px',
  marginTop: '15px',
  flexWrap: 'wrap' // ✅ allows wrapping on small screens
},

viewDetailsBtn: {
  flex: '1 1 120px', // ✅ flexible width
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px',
  background: 'white',
  border: '1px solid #667eea',
  borderRadius: '8px',
  cursor: 'pointer',
  color: '#667eea',
  fontSize: '13px',
  fontWeight: '500',
  transition: 'all 0.2s ease'
},

updateStatusBtn: {
  flex: '1 1 120px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px',
  background: '#17a2b8',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  color: 'white',
  fontSize: '13px',
  fontWeight: '500'
},

deleteOrderBtn: {
  flex: '1 1 120px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '10px',
  background: '#dc3545',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  color: 'white',
  fontSize: '13px',
  fontWeight: '500',
  position: 'relative'


  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  modalContent: {
    background: 'white',
    borderRadius: '20px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '85vh',
    overflow: 'auto'
  },
  modalContentSmall: {
    background: 'white',
    borderRadius: '20px',
    maxWidth: '500px',
    width: '100%'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999'
  },
  modalBody: {
    padding: '20px'
  },
  modalSubtitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '15px',
    marginBottom: '10px',
    color: '#333'
  },
  modalItem: {
    display: 'flex',
    gap: '15px',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  modalItemImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  modalItemDetails: {
    flex: 1
  },
  modalTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '2px solid #e0e0e0',
    fontSize: '18px'
  },
  modalTotalAmount: {
    color: '#667eea',
    fontSize: '20px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  historyList: {
    marginTop: '10px',
    maxHeight: '200px',
    overflowY: 'auto'
  },
  historyItem: {
    padding: '10px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '8px'
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px'
  },
  historyDate: {
    fontSize: '11px',
    color: '#999'
  },
  historyNote: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  cancelBtn: {
    flex: 1,
    padding: '10px',
    background: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  confirmBtn: {
    flex: 1,
    padding: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: 'white'
  },
  loadingSpinner: {
    fontSize: '40px',
    animation: 'spin 1s linear infinite'
  }
};

export default Orders;