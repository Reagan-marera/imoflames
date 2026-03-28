// Cart.jsx - Fully Responsive with Mobile Support
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
  const [floatingElements, setFloatingElements] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Create floating animation elements
  useEffect(() => {
    const elements = ['🛍️', '🛒', '📦', '💎', '✨', '🎁'];
    const newFloatingElements = [];
    for (let i = 0; i < 8; i++) {
      newFloatingElements.push({
        id: i,
        icon: elements[Math.floor(Math.random() * elements.length)],
        left: Math.random() * 100,
        animationDuration: 15 + Math.random() * 20,
        animationDelay: Math.random() * 10,
        size: 20 + Math.random() * 30,
        opacity: 0.1 + Math.random() * 0.2
      });
    }
    setFloatingElements(newFloatingElements);
  }, []);

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
        <div style={styles.backgroundElements}>
          {floatingElements.map((element) => (
            <div
              key={element.id}
              style={{
                ...styles.floatingElement,
                left: `${element.left}%`,
                fontSize: `${element.size}px`,
                opacity: element.opacity,
                animation: `float${(element.id % 5) + 1} ${element.animationDuration}s infinite linear`,
                animationDelay: `${element.animationDelay}s`
              }}
            >
              {element.icon}
            </div>
          ))}
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}>⏳</div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 5000 ? 0 : 150;
  const total = calculateTotal();

  return (
    <div style={styles.container}>
      {/* Animated Background Elements */}
      <div style={styles.backgroundElements}>
        {floatingElements.map((element) => (
          <div
            key={element.id}
            style={{
              ...styles.floatingElement,
              left: `${element.left}%`,
              fontSize: `${element.size}px`,
              opacity: element.opacity,
              animation: `float${(element.id % 5) + 1} ${element.animationDuration}s infinite linear`,
              animationDelay: `${element.animationDelay}s`
            }}
          >
            {element.icon}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <button onClick={() => navigate('/shop')} style={styles.backButton}>
          <FaArrowLeft /> Continue Shopping
        </button>

        <div style={styles.cartCard}>
          <div style={styles.header}>
            <FaShoppingCart style={styles.cartIcon} />
            <h1 style={styles.title}>Your Cart</h1>
            <p style={styles.subtitle}>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div style={styles.emptyCart}>
              <div style={styles.emptyIcon}>🛒</div>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <Link to="/shop" style={styles.shopButton}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div style={styles.cartContent}>
              {/* Cart Items */}
              <div style={styles.cartItems}>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    style={styles.cartItem}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    layout
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
                      <Link to={`/product/${item.product_id}`} style={styles.productName}>
                        {item.product?.name || 'Product'}
                      </Link>
                      <p style={styles.productCategory}>{item.product?.category || 'Uncategorized'}</p>
                      <p style={styles.productPrice}>
                        KES {item.product?.price?.toLocaleString() || 0}
                      </p>
                      
                      {/* Mobile: Quantity and Total in row */}
                      <div style={styles.mobileQuantityRow}>
                        <div style={styles.quantityControls}>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity, -1)}
                            disabled={updatingItemId === item.id || item.quantity <= 1}
                            style={styles.quantityBtn}
                          >
                            <FaMinus />
                          </button>
                          <span style={styles.quantityValue}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity, 1)}
                            disabled={updatingItemId === item.id}
                            style={styles.quantityBtn}
                          >
                            <FaPlus />
                          </button>
                        </div>

                        <div style={styles.itemTotal}>
                          <span style={styles.itemTotalLabel}>Total:</span>
                          <span style={styles.itemTotalPrice}>
                            KES {(item.product?.price * item.quantity)?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id, item.product?.name)}
                      style={styles.removeBtn}
                      title="Remove item"
                    >
                      <FaTrash />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
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
                    Add KES {(5000 - subtotal).toLocaleString()} more for free shipping!
                  </div>
                )}
                
                <div style={styles.divider}></div>
                
                <div style={styles.summaryRow}>
                  <strong>Total</strong>
                  <strong style={styles.totalAmount}>KES {total.toLocaleString()}</strong>
                </div>
                
                <button onClick={handleCheckout} style={styles.checkoutButton}>
                  <FaCreditCard /> Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
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
    pointerEvents: 'none',
    userSelect: 'none'
  },
  content: {
    position: 'relative',
    zIndex: 1,
    padding: '80px 20px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
    transition: 'padding 0.3s ease'
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  cartCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    transition: 'padding 0.3s ease'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  cartIcon: {
    fontSize: '48px',
    color: '#667eea',
    marginBottom: '10px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '8px',
    transition: 'font-size 0.3s ease'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666'
  },
  emptyCart: {
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
    marginTop: '20px',
    fontWeight: '500'
  },
  cartContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '30px',
    transition: 'all 0.3s ease'
  },
  cartItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    position: 'relative'
  },
  productImageContainer: {
    width: '100px',
    height: '100px',
    flexShrink: 0,
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5'
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  productDetails: {
    flex: 1,
    minWidth: 0
  },
  productName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    textDecoration: 'none',
    marginBottom: '5px',
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  productCategory: {
    fontSize: '12px',
    color: '#999',
    marginBottom: '5px'
  },
  productPrice: {
    fontSize: '14px',
    color: '#667eea',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  mobileQuantityRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap'
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  quantityBtn: {
    width: '32px',
    height: '32px',
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  quantityValue: {
    minWidth: '40px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '500'
  },
  itemTotal: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  itemTotalLabel: {
    fontSize: '12px',
    color: '#999'
  },
  itemTotalPrice: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333'
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    padding: '8px',
    transition: 'color 0.2s ease',
    flexShrink: 0
  },
  orderSummary: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    height: 'fit-content',
    position: 'sticky',
    top: '100px'
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '14px',
    color: '#666'
  },
  shippingNote: {
    fontSize: '12px',
    color: '#28a745',
    marginTop: '5px',
    marginBottom: '15px',
    padding: '8px',
    background: '#d4edda',
    borderRadius: '6px',
    textAlign: 'center'
  },
  divider: {
    height: '1px',
    background: '#e0e0e0',
    margin: '15px 0'
  },
  totalAmount: {
    fontSize: '20px',
    color: '#667eea'
  },
  checkoutButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '20px',
    transition: 'transform 0.2s ease'
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
    animation: 'spin 1s linear infinite',
    display: 'inline-block'
  },
  // Responsive Styles - Tablet
  '@media (max-width: 768px)': {
    content: {
      padding: '60px 15px 30px'
    },
    cartCard: {
      padding: '20px'
    },
    title: {
      fontSize: '24px'
    },
    cartContent: {
      gridTemplateColumns: '1fr',
      gap: '20px'
    },
    cartItem: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '15px'
    },
    productImageContainer: {
      width: '100%',
      height: '200px'
    },
    productImage: {
      width: '100%',
      height: '100%',
      objectFit: 'contain'
    },
    productDetails: {
      width: '100%'
    },
    productName: {
      fontSize: '18px',
      whiteSpace: 'normal'
    },
    mobileQuantityRow: {
      width: '100%',
      justifyContent: 'space-between',
      marginTop: '10px'
    },
    removeBtn: {
      position: 'absolute',
      top: '15px',
      right: '15px'
    },
    orderSummary: {
      position: 'static',
      marginTop: '20px'
    }
  },
  // Responsive Styles - Mobile
  '@media (max-width: 480px)': {
    content: {
      padding: '50px 10px 20px'
    },
    cartCard: {
      padding: '15px',
      borderRadius: '15px'
    },
    backButton: {
      padding: '8px 16px',
      fontSize: '12px',
      marginBottom: '15px'
    },
    title: {
      fontSize: '20px'
    },
    subtitle: {
      fontSize: '12px'
    },
    cartIcon: {
      fontSize: '36px'
    },
    productImageContainer: {
      height: '160px'
    },
    productName: {
      fontSize: '16px'
    },
    productPrice: {
      fontSize: '16px'
    },
    quantityBtn: {
      width: '28px',
      height: '28px'
    },
    quantityValue: {
      minWidth: '35px',
      fontSize: '13px'
    },
    itemTotalPrice: {
      fontSize: '14px'
    },
    summaryTitle: {
      fontSize: '16px'
    },
    summaryRow: {
      fontSize: '13px'
    },
    totalAmount: {
      fontSize: '18px'
    },
    checkoutButton: {
      fontSize: '14px',
      padding: '10px'
    },
    shippingNote: {
      fontSize: '11px'
    },
    emptyIcon: {
      fontSize: '60px'
    },
    emptyCart: {
      padding: '40px 15px'
    },
    shopButton: {
      padding: '10px 25px',
      fontSize: '14px'
    }
  }
};

export default Cart;