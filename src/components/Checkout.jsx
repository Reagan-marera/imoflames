// Checkout.jsx - Fixed navigation issue
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaTruck, FaShieldAlt, FaCheckCircle, 
  FaMoneyBillWave, FaMobile, FaCreditCard, FaSpinner 
} from 'react-icons/fa';
import { API_URL } from '../config';
import { showToast } from './utils';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items = [], total = 0 } = location.state || {};
  const token = localStorage.getItem('token');
  
  const [formData, setFormData] = useState({
    phone_number: '',
    email: '',
    location: '',
    delivery_notes: '',
    payment_method: 'mpesa'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [floatingElements, setFloatingElements] = useState([]);

  useEffect(() => {
    // Check if cart is empty and redirect
    if (!items || items.length === 0) {
      navigate('/cart');
      return;
    }
    
    // Get user email if logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [items, navigate]); // Add dependencies

  // Create floating animation elements
  useEffect(() => {
    const elements = ['📦', '🚚', '💳', '💰', '✨', '🎁'];
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

  // If no items, don't render (will redirect via useEffect)
  if (!items || items.length === 0) {
    return null;
  }

  const subtotal = total;
  const shipping = subtotal > 5000 ? 0 : 150;
  const grandTotal = subtotal + shipping;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMpesaPayment = async () => {
    setPaymentProcessing(true);
    
    try {
      const response = await fetch(`${API_URL}/api/mpesa/stkpush`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          phone_number: formData.phone_number,
          amount: grandTotal,
          order_data: {
            items,
            delivery_details: {
              location: formData.location,
              delivery_notes: formData.delivery_notes,
              email: formData.email
            }
          }
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast('Payment request sent to your phone. Please check your M-Pesa messages.', 'info');
        
        // Poll for payment status
        const checkPaymentStatus = setInterval(async () => {
          const statusRes = await fetch(`${API_URL}/api/mpesa/status/${data.checkout_request_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const statusData = await statusRes.json();
          
          if (statusData.status === 'completed') {
            clearInterval(checkPaymentStatus);
            showToast('Payment successful! Order placed.', 'success');
            navigate('/orders');
          } else if (statusData.status === 'failed') {
            clearInterval(checkPaymentStatus);
            showToast('Payment failed. Please try again.', 'error');
            setPaymentProcessing(false);
          }
        }, 3000);
        
        // Timeout after 2 minutes
        setTimeout(() => {
          clearInterval(checkPaymentStatus);
          if (paymentProcessing) {
            showToast('Payment timeout. Please try again.', 'error');
            setPaymentProcessing(false);
          }
        }, 120000);
      } else {
        showToast(data.message || 'Payment initiation failed', 'error');
        setPaymentProcessing(false);
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      showToast('Failed to initiate payment', 'error');
      setPaymentProcessing(false);
    }
  };

  const handleCashPayment = async () => {
    setPaymentProcessing(true);
    
    try {
      const orderItems = items.map(item => ({
        product_id: item.product?.id || item.id,
        quantity: item.quantity,
        price: item.product?.price || item.price
      }));
      
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          total_amount: grandTotal,
          phone_number: formData.phone_number,
          email: formData.email,
          location: formData.location,
          delivery_notes: formData.delivery_notes,
          payment_method: 'cash'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast('Order placed successfully! You will pay upon delivery.', 'success');
        // Send email notification
        await fetch(`${API_URL}/api/send-order-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: data.order.id, email: formData.email })
        });
        navigate('/orders');
      } else {
        showToast(data.message || 'Failed to place order', 'error');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      showToast('Failed to place order', 'error');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phone_number || !formData.email || !formData.location) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    // Validate Kenyan phone number
    const phoneRegex = /^(07|01)\d{8}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      showToast('Please enter a valid Kenyan phone number (e.g., 0712345678)', 'error');
      return;
    }
    
    if (formData.payment_method === 'mpesa') {
      await handleMpesaPayment();
    } else {
      await handleCashPayment();
    }
  };

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

      <div style={styles.content}>
        <button onClick={() => navigate('/cart')} style={styles.backButton}>
          <FaArrowLeft /> Back to Cart
        </button>

        <div style={styles.checkoutGrid}>
          {/* Order Summary */}
          <div style={styles.orderSummary}>
            <h2 style={styles.summaryTitle}>Order Summary</h2>
            <div style={styles.itemsList}>
              {items.map((item, index) => (
                <div key={index} style={styles.summaryItem}>
                  <img 
                    src={item.product?.image_path ? `${API_URL}/uploads/${item.product.image_path.replace(/^\/+/, '')}` : '/placeholder-image.jpg'}
                    alt={item.product?.name}
                    style={styles.summaryImage}
                  />
                  <div style={styles.summaryDetails}>
                    <p style={styles.summaryName}>{item.product?.name}</p>
                    <p style={styles.summaryMeta}>Qty: {item.quantity}</p>
                  </div>
                  <p style={styles.summaryPrice}>
                    KES {(item.product?.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            
            <div style={styles.totalBreakdown}>
              <div style={styles.breakdownRow}>
                <span>Subtotal</span>
                <span>KES {subtotal.toLocaleString()}</span>
              </div>
              <div style={styles.breakdownRow}>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `KES ${shipping.toLocaleString()}`}</span>
              </div>
              <div style={styles.divider}></div>
              <div style={styles.totalRow}>
                <strong>Total</strong>
                <strong style={styles.totalAmount}>KES {grandTotal.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div style={styles.checkoutForm}>
            <h2 style={styles.formTitle}>Delivery Information</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone_number"
                  placeholder="0712345678"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
                <small>We'll send payment confirmation to this number</small>
              </div>

              <div style={styles.inputGroup}>
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
                <small>Order confirmation will be sent here</small>
              </div>

              <div style={styles.inputGroup}>
                <label>Delivery Location *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="City, Area, Street, Building"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label>Delivery Notes (Optional)</label>
                <textarea
                  name="delivery_notes"
                  placeholder="Landmark, gate code, special instructions..."
                  value={formData.delivery_notes}
                  onChange={handleChange}
                  rows="3"
                  style={styles.textarea}
                />
              </div>

              <div style={styles.paymentMethods}>
                <label style={styles.paymentLabel}>Payment Method</label>
                <div style={styles.paymentOptions}>
                  <label style={styles.paymentOption}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="mpesa"
                      checked={formData.payment_method === 'mpesa'}
                      onChange={handleChange}
                    />
                    <FaMobile /> M-Pesa STK Push
                  </label>
                  <label style={styles.paymentOption}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="cash"
                      checked={formData.payment_method === 'cash'}
                      onChange={handleChange}
                    />
                    <FaMoneyBillWave /> Cash on Delivery
                  </label>
                </div>
              </div>

              <div style={styles.infoBox}>
                <div><FaTruck /> Free delivery on orders over KES 5,000</div>
                <div><FaShieldAlt /> Secure checkout</div>
                <div><FaCheckCircle /> Cash on delivery available</div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || paymentProcessing}
                style={{
                  ...styles.placeOrderBtn,
                  ...((isSubmitting || paymentProcessing) ? styles.buttonDisabled : {})
                }}
              >
                {(isSubmitting || paymentProcessing) ? (
                  <>
                    <FaSpinner style={styles.spinner} /> Processing...
                  </>
                ) : (
                  <>
                    <FaCreditCard /> Place Order
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles remain the same as before...
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
    margin: '0 auto'
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
  checkoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: '30px'
  },
  orderSummary: {
    background: 'white',
    borderRadius: '20px',
    padding: '25px',
    height: 'fit-content',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  summaryTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px'
  },
  itemsList: {
    maxHeight: '400px',
    overflowY: 'auto',
    marginBottom: '20px'
  },
  summaryItem: {
    display: 'flex',
    gap: '15px',
    padding: '12px 0',
    borderBottom: '1px solid #e0e0e0'
  },
  summaryImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  summaryDetails: {
    flex: 1
  },
  summaryName: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '5px'
  },
  summaryMeta: {
    fontSize: '12px',
    color: '#999'
  },
  summaryPrice: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#667eea'
  },
  totalBreakdown: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #e0e0e0'
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '14px',
    color: '#666'
  },
  divider: {
    height: '1px',
    background: '#e0e0e0',
    margin: '12px 0'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '18px'
  },
  totalAmount: {
    color: '#667eea',
    fontSize: '22px'
  },
  checkoutForm: {
    background: 'white',
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    marginTop: '5px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    marginTop: '5px'
  },
  paymentMethods: {
    marginBottom: '20px'
  },
  paymentLabel: {
    display: 'block',
    marginBottom: '10px',
    fontWeight: '500'
  },
  paymentOptions: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  paymentOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '10px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    transition: 'all 0.2s ease'
  },
  infoBox: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  placeOrderBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'transform 0.2s ease'
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  spinner: {
    animation: 'spin 1s linear infinite'
  }
};

export default Checkout;