// OrderForm.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaTruck, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { API_URL } from '../config';
import { showToast } from './utils';

const OrderForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, quantity, price, total } = location.state || {};
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    phone_number: '',
    email: '',
    location: '',
    delivery_notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) {
    navigate('/shop');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phone_number || !formData.email || !formData.location) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity,
          phone_number: formData.phone_number,
          email: formData.email,
          location: formData.location,
          delivery_notes: formData.delivery_notes,
          total_amount: total
        })
      });
      
      if (res.ok) {
        showToast('Order placed successfully!', 'success');
        navigate('/orders');
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to place order', 'error');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      showToast('Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundElements}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.floatingElement,
              left: `${Math.random() * 100}%`,
              animation: `float${(i % 5) + 1} ${15 + Math.random() * 20}s infinite linear`
            }}
          >
            {['📦', '🚚', '📝', '💰', '✨'][i % 5]}
          </div>
        ))}
      </div>

      <div style={styles.content}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <FaArrowLeft /> Back
        </button>

        <div style={styles.card}>
          <h1 style={styles.title}>Complete Your Order</h1>
          
          <div style={styles.orderSummary}>
            <h3>Order Summary</h3>
            <div style={styles.productInfo}>
              <img src={`${API_URL}/uploads/${product.image_path}`} alt={product.name} style={styles.productImage} />
              <div>
                <p style={styles.productName}>{product.name}</p>
                <p>Quantity: {quantity}</p>
                <p>Price: KES {price?.toLocaleString()}</p>
              </div>
            </div>
            <div style={styles.totalRow}>
              <strong>Total:</strong>
              <strong style={styles.totalAmount}>KES {total?.toLocaleString()}</strong>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone_number"
                placeholder="e.g., 0712345678"
                value={formData.phone_number}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Email *</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Delivery Location *</label>
              <input
                type="text"
                name="location"
                placeholder="City, Area, Street"
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
                placeholder="Special instructions for delivery..."
                value={formData.delivery_notes}
                onChange={handleChange}
                rows="3"
                style={styles.textarea}
              />
            </div>

            <div style={styles.infoBox}>
              <div><FaTruck /> Free delivery on orders over KES 5,000</div>
              <div><FaShieldAlt /> Secure payment upon delivery</div>
              <div><FaCheckCircle /> Cash on delivery available</div>
            </div>

            <button type="submit" disabled={isSubmitting} style={styles.submitButton}>
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
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
    fontSize: '30px',
    opacity: 0.1,
    pointerEvents: 'none'
  },
  content: {
    position: 'relative',
    zIndex: 1,
    padding: '80px 20px 40px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'violet',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center'
  },
  orderSummary: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '20px'
  },
  productInfo: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px'
  },
  productImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '10px',
    borderTop: '1px solid #e0e0e0'
  },
  totalAmount: {
    color: '#667eea',
    fontSize: '18px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  input: {
    padding: '10px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  textarea: {
    padding: '10px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  infoBox: {
    background: '#f8f9fa',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  submitButton: {
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '10px'
  }
};

export default OrderForm;