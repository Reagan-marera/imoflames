// Orders.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaShoppingBag, FaEye, FaTruck, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import { API_URL } from '../config';
import { showToast } from './utils';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, processing, shipped, delivered, cancelled
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      showToast('Failed to load orders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return <FaClock style={{ color: '#ffc107' }} />;
      case 'processing': return <FaTruck style={{ color: '#17a2b8' }} />;
      case 'shipped': return <FaTruck style={{ color: '#007bff' }} />;
      case 'delivered': return <FaCheck style={{ color: '#28a745' }} />;
      case 'cancelled': return <FaTimes style={{ color: '#dc3545' }} />;
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

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status?.toLowerCase() === filter;
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
              animation: `float${(i % 5) + 1} ${15 + Math.random() * 20}s infinite linear`
            }}
          >
            {['📦', '🚚', '📝', '💰', '✨', '🎁'][i % 6]}
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
            <FaShoppingBag style={styles.orderIcon} />
          </div>
          <h1 style={styles.title}>My Orders</h1>
          <p style={styles.subtitle}>Track and manage your orders</p>
        </div>

        <div style={styles.filterBar}>
          <div style={styles.filterButtons}>
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  ...styles.filterButton,
                  ...(filter === status ? styles.filterActive : {})
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}>⏳</div>
            <p>Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={styles.emptyContainer}>
            <FaShoppingBag style={styles.emptyIcon} />
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet</p>
            <Link to="/shop" style={styles.shopButton}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                style={styles.orderCard}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                <div style={styles.orderHeader}>
                  <div style={styles.orderInfo}>
                    <span style={styles.orderId}>Order #{order.id}</span>
                    <span style={styles.orderDate}>
                      {new Date(order.created_at || order.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={styles.orderStatus} style={{ background: getStatusColor(order.status) + '20', color: getStatusColor(order.status) }}>
                    {getStatusIcon(order.status)}
                    <span>{order.status?.toUpperCase() || 'PENDING'}</span>
                  </div>
                </div>

                <div style={styles.orderProducts}>
                  {order.items && order.items.map(item => (
                    <div key={item.id} style={styles.productItem}>
                      <img
                        src={`${API_URL}/api/uploads/${item.product?.image_path || item.image_path}`}
                        alt={item.product?.name || item.name}
                        style={styles.productImage}
                        onError={(e) => e.target.src = '/placeholder-image.jpg'}
                      />
                      <div style={styles.productDetails}>
                        <h4 style={styles.productName}>{item.product?.name || item.name}</h4>
                        <p style={styles.productQuantity}>Quantity: {item.quantity}</p>
                        <p style={styles.productPrice}>KES {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.orderFooter}>
                  <div style={styles.orderTotal}>
                    <span>Total Amount:</span>
                    <strong>KES {order.total_amount?.toLocaleString() || 0}</strong>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    style={styles.viewButton}
                  >
                    <FaEye /> View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

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
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h2>Order Details #{selectedOrder.id}</h2>
                <button onClick={() => setSelectedOrder(null)} style={styles.closeButton}>✕</button>
              </div>
              
              <div style={styles.modalBody}>
                <div style={styles.detailRow}>
                  <strong>Order Date:</strong>
                  <span>{new Date(selectedOrder.created_at || selectedOrder.timestamp).toLocaleString()}</span>
                </div>
                <div style={styles.detailRow}>
                  <strong>Status:</strong>
                  <span style={{ color: getStatusColor(selectedOrder.status) }}>
                    {selectedOrder.status?.toUpperCase()}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <strong>Payment Method:</strong>
                  <span>{selectedOrder.payment_method || 'Not specified'}</span>
                </div>
                <div style={styles.detailRow}>
                  <strong>Shipping Address:</strong>
                  <span>{selectedOrder.shipping_address || selectedOrder.location}</span>
                </div>
                <div style={styles.detailRow}>
                  <strong>Phone Number:</strong>
                  <span>{selectedOrder.phone_number}</span>
                </div>
                <div style={styles.detailRow}>
                  <strong>Email:</strong>
                  <span>{selectedOrder.email}</span>
                </div>
                
                <h3 style={styles.modalSubtitle}>Items</h3>
                {selectedOrder.items && selectedOrder.items.map(item => (
                  <div key={item.id} style={styles.modalProductItem}>
                    <img
                      src={`${API_URL}/api/uploads/${item.product?.image_path || item.image_path}`}
                      alt={item.product?.name || item.name}
                      style={styles.modalProductImage}
                    />
                    <div>
                      <p><strong>{item.product?.name || item.name}</strong></p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: KES {item.price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                
                <div style={styles.modalTotal}>
                  <strong>Total Amount:</strong>
                  <strong style={styles.totalAmount}>KES {selectedOrder.total_amount?.toLocaleString() || 0}</strong>
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '80px 20px 40px',
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
    maxWidth: '900px',
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
  orderIcon: {
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
    marginBottom: '30px',
    overflowX: 'auto'
  },
  filterButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
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
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  orderCard: {
    background: '#f9f9f9',
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
  orderInfo: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#333'
  },
  orderDate: {
    fontSize: '12px',
    color: '#999'
  },
  orderStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  orderProducts: {
    marginBottom: '15px'
  },
  productItem: {
    display: 'flex',
    gap: '15px',
    padding: '10px 0',
    borderBottom: '1px solid #e0e0e0'
  },
  productImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  productDetails: {
    flex: 1
  },
  productName: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '5px',
    color: '#333'
  },
  productQuantity: {
    fontSize: '12px',
    color: '#666'
  },
  productPrice: {
    fontSize: '14px',
    color: '#667eea',
    fontWeight: 'bold'
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #e0e0e0'
  },
  orderTotal: {
    fontSize: '14px'
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s ease'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px'
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
  shopButton: {
    display: 'inline-block',
    padding: '12px 30px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '25px',
    marginTop: '20px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    background: 'white',
    borderRadius: '20px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999'
  },
  modalBody: {
    padding: '20px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  modalSubtitle: {
    marginTop: '20px',
    marginBottom: '15px',
    fontSize: '18px',
    color: '#333'
  },
  modalProductItem: {
    display: 'flex',
    gap: '15px',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  modalProductImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  modalTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '2px solid #e0e0e0',
    fontSize: '18px'
  },
  totalAmount: {
    color: '#667eea',
    fontSize: '20px'
  }
};

export default Orders;