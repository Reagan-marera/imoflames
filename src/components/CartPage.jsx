import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { showToast } from './utils';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

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

  return (
    <div className="container cart-page">
      <h2 className="section-title">Shopping Cart ({cartItems.length} items)</h2>
      <div className="cart-container">
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item card">
              <img
                src={`${API_URL}/api/uploads/${item.image_path}`}
                alt={item.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p>KES {item.price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="btn btn-danger"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="cart-summary card">
          <h3>Cart Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>KES {totalPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>FREE</span>
          </div>
          <hr />
          <div className="summary-row total">
            <span>Total</span>
            <span>KES {totalPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="btn btn-primary btn-block mt-3"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;