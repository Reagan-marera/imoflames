import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config.js';
import { showToast } from './utils.js';

const PaymentForm = () => {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleMpesaSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/mpesa/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, phone })
      });
      const data = await res.json();
      if (data.ResponseCode === "0") {
        showToast("STK Push Sent!", "success");
        navigate('/');
      } else {
        showToast("Payment initiation failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error initiating payment", "error");
    }
  };

  return (
    <form onSubmit={handleMpesaSubmit}>
      <h2>Verify Account with M-Pesa</h2>
      <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      <input type="text" placeholder="Phone (e.g. 254700000000)" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      <button type="submit">Pay via M-Pesa</button>
    </form>
  );
};

export default PaymentForm;