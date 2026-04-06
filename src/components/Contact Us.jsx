import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config.js';
import { showToast } from './utils.js';
import { FaEnvelope, FaPhone, FaUser, FaStore, FaTag, FaDollarSign, FaBuilding, FaComment } from 'react-icons/fa';

const ContactUsForm = () => {
  const [productInfo, setProductInfo] = useState({
    name: '',
    description: '',
    price: ''
  });
  const [supplierInfo, setSupplierInfo] = useState({
    name: '',
    contact: ''
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleProductInfoChange = (e) => {
    const { name, value } = e.target;
    setProductInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSupplierInfoChange = (e) => {
    const { name, value } = e.target;
    setSupplierInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumber || !email || !message) {
      showToast("Phone number, email, and message are required", "error");
      return;
    }

    setIsSubmitting(true);

    const contactData = {
      product_info: productInfo,
      supplier_info: supplierInfo,
      phone_number: phoneNumber,
      email: email,
      message: message
    };

    try {
      const response = await fetch(`${API_URL}/api/contact-us`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        showToast("Message sent successfully!", "success");
        navigate('/');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || "Failed to send message", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred while sending", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Contact Us</h1>
          <p style={styles.subtitle}>Have questions? We'd love to hear from you</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          

          {/* Contact Information Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Your Information</h3>
            
            <div style={styles.inputGroup}>
              <FaPhone style={styles.inputIcon} />
              <input
                type="tel"
                placeholder="Phone number *"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <FaEnvelope style={styles.inputIcon} />
              <input
                type="email"
                placeholder="Email address *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.textareaGroup}>
              <FaComment style={styles.textareaIcon} />
              <textarea
                placeholder="Your message *"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows="4"
                style={styles.textarea}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{
              ...styles.submitButton,
              ...(isSubmitting ? styles.buttonDisabled : {})
            }}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 16px 40px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  card: {
    maxWidth: '550px',
    width: '100%',
    background: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e0e0e0'
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#000000',
    marginBottom: '6px'
  },
  subtitle: {
    fontSize: '13px',
    color: '#666666'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#000000',
    marginBottom: '4px',
    paddingBottom: '4px',
    borderBottom: '1px solid #e0e0e0'
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '14px',
    color: '#999'
  },
  input: {
    width: '100%',
    padding: '10px 12px 10px 38px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    '&:focus': {
      borderColor: '#000000'
    }
  },
  textareaGroup: {
    position: 'relative',
    display: 'flex'
  },
  textareaIcon: {
    position: 'absolute',
    left: '12px',
    top: '14px',
    fontSize: '14px',
    color: '#999'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px 10px 38px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    '&:focus': {
      borderColor: '#000000'
    }
  },
  submitButton: {
    padding: '12px',
    background: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '8px'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  }
};

// Add focus styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  input:focus, textarea:focus {
    border-color: #000000 !important;
    box-shadow: 0 0 0 2px rgba(0,0,0,0.05) !important;
  }
`;
document.head.appendChild(styleSheet);

export default ContactUsForm;