import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { showToast } from './utils';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Load cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to load cart");
        const data = await res.json();
        setCartItems(data);
        const total = data.reduce((sum, item) => sum + item.price, 0);
        setTotalPrice(total);

        // Notify navbar or parent component of cart change
        window.dispatchEvent(new Event('cartUpdated'));
      } catch (err) {
        console.error(err);
        showToast("Failed to load cart", "error");
      }
    };
    fetchCart();
  }, [token]);

  const handleRemove = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setCartItems(cartItems.filter(item => item.id !== productId));
        showToast("Removed from cart", "success");

        // Notify cart update
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const error = await res.json();
        showToast(error.message || "Error removing item", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Could not remove.", "error");
    }
  };

  const handleCheckout = async () => {
    const phone = prompt("Enter delivery phone number") || '';
    const email = prompt("Enter delivery email") || '';
    const location = prompt("Enter delivery location") || '';

    if (!phone || !email || !location) {
      showToast("Phone, Email, and Location are required", "error");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone_number: phone, email, location })
      });

      if (res.ok) {
        showToast("Order placed successfully!", "success");
        setCartItems([]);

        // Notify navbar that cart has been cleared
        window.dispatchEvent(new Event('cartUpdated'));

        navigate('/');
      } else {
        const error = await res.json();
        showToast(error.message || "Checkout failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred during checkout", "error");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h2>Your Cart is Empty</h2>
        <Link to="/products">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Shopping Cart ({cartItems.length} items)</h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '800px',
        margin: 'auto'
      }}>
        {cartItems.map(item => (
          <div key={item.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            borderBottom: '1px solid #ccc'
          }}>
            <img
              src={`${API_URL}/api/uploads/${item.image_path}`}
              alt={item.name}
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <div style={{ flex: 1, marginLeft: '1rem' }}>
              <h3>{item.name}</h3>
              <p>KES {item.price.toFixed(2)}</p>
            </div>
            <button
              onClick={() => handleRemove(item.id)}
              style={{
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                cursor: 'pointer',
                borderRadius: '5px'
              }}
            >
              Remove
            </button>
          </div>
        ))}

        <div style={{ marginTop: '2rem', fontWeight: 'bold' }}>
          Total: KES {totalPrice.toFixed(2)}
        </div>

        <button
          onClick={handleCheckout}
          style={{
            background: '#2ecc71',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '5px',
            marginTop: '1rem',
            fontSize: '1.1rem'
          }}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;