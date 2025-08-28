import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config.js';
import { showToast } from './utils.js';

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
        showToast("Contact form submitted successfully", "success");
        navigate('/');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || "Failed to submit contact form", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred while submitting the form", "error");
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <h1 className="auth-title">Contact Us</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="name"
              value={productInfo.name}
              onChange={handleProductInfoChange}
            />
          </div>

         

          <div className="form-group">
            <input
              type="text"
              placeholder="Your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <textarea
              placeholder="Your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ContactUsForm;
