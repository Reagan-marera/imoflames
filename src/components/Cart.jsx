import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaArrowLeft, FaCreditCard } from 'react-icons/fa';
import { API_URL } from '../config';
import { showToast } from './utils';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setCartItems(Array.isArray(data) ? data : []);
      } else if (res.status === 401) {
        showToast('Please login to view your cart', 'error');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      showToast('Failed to load cart', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    setUpdatingItemId(itemId);

    try {
      const res = await fetch(`${API_URL}/api/cart/update/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (res.ok) {
        setCartItems(items =>
          items.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to update quantity', 'error');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showToast('Failed to update quantity', 'error');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (itemId, productName) => {
    if (!window.confirm(`Remove ${productName} from cart?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setCartItems(items => items.filter(item => item.id !== itemId));
        showToast(`${productName} removed from cart`, 'success');
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to remove item', 'error');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      showToast('Failed to remove item', 'error');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 5000 ? 0 : 150;
    return subtotal + shipping;
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    const checkoutItems = cartItems.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.product?.price,
      product_id: item.product_id
    }));

    navigate('/checkout', {
      state: {
        items: checkoutItems,
        total: calculateSubtotal()
      }
    });
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}>⏳</div>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 5000 ? 0 : 150;
  const total = calculateTotal();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <FaArrowLeft /> Back
        </button>
        <div style={styles.headerTitle}>
          <FaShoppingCart style={styles.cartIcon} />
          <h1 style={styles.title}>Your Cart</h1>
          <p style={styles.itemCount}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div style={styles.content}>
        {cartItems.length === 0 ? (
          <div style={styles.emptyCart}>
            <div style={styles.emptyIcon}>🛒</div>
            <p>Your cart is empty</p>
            <Link to="/shop" style={styles.shopButton}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div style={styles.cartItemsContainer}>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  style={styles.cartItem}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div style={styles.productImageContainer}>
                    <img
                      src={item.product?.image_path
                        ? `${API_URL}/uploads/${item.product.image_path.replace(/^\/+/, '')}`
                        : '/placeholder-image.jpg'}
                      alt={item.product?.name || 'Product'}
                      style={styles.productImage}
                      onError={(e) => e.target.src = '/placeholder-image.jpg'}
                    />
                  </div>

                  <div style={styles.productDetails}>
                    <div style={styles.productInfo}>
                      <Link to={`/product/${item.product_id}`} style={styles.productName}>
                        {item.product?.name || 'Product'}
                      </Link>
                      <p style={styles.productCategory}>{item.product?.category || 'Uncategorized'}</p>
                      <p style={styles.productPrice}>
                        KES {item.product?.price?.toLocaleString() || 0}
                      </p>
                    </div>

                    <div style={styles.itemActions}>
                      <div style={styles.quantityControls}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity, -1)}
                          disabled={updatingItemId === item.id || item.quantity <= 1}
                          style={styles.quantityButton}
                        >
                          <FaMinus size={10} />
                        </button>
                        <span style={styles.quantityValue}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity, 1)}
                          disabled={updatingItemId === item.id}
                          style={styles.quantityButton}
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>

                      <div style={styles.mobileRemoveContainer}>
                        <button
                          onClick={() => removeItem(item.id, item.product?.name)}
                          style={styles.removeButton}
                        >
                          <FaTrash size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={styles.orderSummary}>
              <h3 style={styles.summaryTitle}>Order Summary</h3>

              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>KES {subtotal.toLocaleString()}</span>
              </div>

              <div style={styles.summaryRow}>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `KES ${shipping.toLocaleString()}`}</span>
              </div>

              {subtotal > 0 && subtotal < 5000 && (
                <div style={styles.shippingNote}>
                  Add KES {(5000 - subtotal).toLocaleString()} for free shipping
                </div>
              )}

              <div style={styles.divider}></div>

              <div style={styles.totalRow}>
                <strong>Total</strong>
                <strong style={styles.totalAmount}>KES {total.toLocaleString()}</strong>
              </div>

              <button onClick={handleCheckout} style={styles.checkoutButton}>
                <FaCreditCard size={12} /> Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: '20px',
  },
  header: {
    marginBottom: '20px',
    position: 'relative',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: '20px',
    top: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    color: '#000000',
  },
  headerTitle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cartIcon: {
    fontSize: '32px',
    color: '#000000',
    marginBottom: '8px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#000000',
    margin: '0 0 4px',
  },
  itemCount: {
    fontSize: '12px',
    color: '#666666',
    margin: '0',
  },
  content: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  cartItemsContainer: {
    marginBottom: '20px',
  },
  cartItem: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    background: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #eaeaea',
    marginBottom: '12px',
  },
  productImageContainer: {
    width: '100%',
    height: '200px',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#f5f5f5',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    width: 'auto',
    height: 'auto',
  },
  productDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  productInfo: {
    marginBottom: '8px',
  },
  productName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#000000',
    textDecoration: 'none',
    marginBottom: '4px',
    display: 'block',
  },
  productCategory: {
    fontSize: '12px',
    color: '#999',
    marginBottom: '4px',
  },
  productPrice: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#000000',
    marginBottom: '0',
  },
  itemActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  quantityButton: {
    width: '28px',
    height: '28px',
    background: '#2e3491',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    minWidth: '32px',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: '500',
  },
  mobileRemoveContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: '#ff0303',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
  },
  orderSummary: {
    background: '#ffffff',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid #eaeaea',
  },
  summaryTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#000000',
    marginBottom: '12px',
    textAlign: 'center',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '12px',
    color: '#666',
  },
  shippingNote: {
    fontSize: '10px',
    color: '#28a745',
    margin: '10px 0',
    padding: '6px',
    background: '#e8f5e9',
    borderRadius: '4px',
    textAlign: 'center',
  },
  divider: {
    height: '1px',
    background: '#e0e0e0',
    margin: '10px 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '16px',
    fontSize: '14px',
  },
  totalAmount: {
    fontSize: '16px',
    color: '#000000',
  },
  checkoutButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    background: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  emptyCart: {
    textAlign: 'center',
    padding: '40px 20px',
    background: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #eaeaea',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
    opacity: 0.5,
  },
  shopButton: {
    display: 'inline-block',
    padding: '8px 20px',
    background: '#000000',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '25px',
    marginTop: '12px',
    fontSize: '13px',
    fontWeight: '500',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '10px',
  },
  loadingSpinner: {
    fontSize: '30px',
    animation: 'spin 1s linear infinite',
  },
};

// Add keyframes and responsive styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @media (min-width: 768px) {
    .content {
      display: flex;
      gap: 30px !important;
    }

    .cartItemsContainer {
      flex: 1;
    }

    .orderSummary {
      width: 300px;
    }

    .cartItem {
      flex-direction: row !important;
      gap: 16px;
      padding: 16px;
    }

    .productImageContainer {
      width: 100px !important;
      height: 100px !important;
      margin-bottom: 0 !important;
    }

    .productDetails {
      flex: 1;
      display: flex;
      flexDirection: column;
      justifyContent: space-between;
    }

    .itemActions {
      flex-direction: row !important;
      justify-content: space-between;
      align-items: center;
    }

    .mobileRemoveContainer {
      display: none;
    }

    .removeButton {
      margin-left: 10px;
      padding: 6px;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Cart;