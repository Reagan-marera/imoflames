import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { showToast } from './utils';
import { useMediaQuery } from 'react-responsive';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

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
      <div className="container text-center mt-5">
        <h2>Your Cart is Empty</h2>
        <Link to="/" className="btn btn-primary mt-3">Browse Products</Link>
      </div>
    );
  }

  const containerStyle = {
    padding: isMobile ? '1rem' : '2rem',
    color: '#e0e0e0',
  };

  const cartContainerStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: '2rem',
  };

  const cartItemsStyle = {
    flex: 2,
  };

  const cartItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#161b22',
    border: '1px solid #21262d',
    borderRadius: '8px',
    marginBottom: '1rem',
    flexDirection: isMobile ? 'column' : 'row',
    textAlign: isMobile ? 'center' : 'left',
  };

  const cartItemImageStyle = {
    width: '100px',
    height: '100px',
    objectFit: 'contain',
  };

  const cartSummaryStyle = {
    flex: 1,
    padding: isMobile ? '1rem' : '1.5rem',
    backgroundColor: '#161b22',
    border: '1px solid #21262d',
    borderRadius: '8px',
    position: isMobile ? 'static' : 'sticky',
    top: '100px',
    height: 'fit-content',
    width: isMobile ? '100%' : 'auto',
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Shopping Cart ({cartItems.length} items)</h2>
      <div style={cartContainerStyle}>
        <div style={cartItemsStyle}>
          {cartItems.map(item => (
            <div key={item.id} style={cartItemStyle}>
              <img
                src={`${API_URL}/api/uploads/${item.image_path}`}
                alt={item.name}
                style={cartItemImageStyle}
              />
              <div style={{ flex: 1 }}>
                <h3>{item.name}</h3>
                <p>KES {item.price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                style={{ backgroundColor: '#d73a49', width: isMobile ? '100%' : 'auto', marginTop: isMobile ? '1rem' : '0' }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div style={cartSummaryStyle}>
          <h3>Cart Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
            <span>Subtotal</span>
            <span>KES {totalPrice.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
            <span>Shipping</span>
            <span>FREE</span>
          </div>
          <hr style={{ border: '1px solid #21262d' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <span>Total</span>
            <span>KES {totalPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;