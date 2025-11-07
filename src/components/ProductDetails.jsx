import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { showToast } from './utils';
import '../styles/ProductDetails.css';

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product } = location.state || {};
  const [currentUser, setCurrentUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch current user');
        }
        const data = await res.json();
        setCurrentUser(data);
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };
    fetchCurrentUser();
  }, [token]);

  const handleAddToCart = async (product) => {
    try {
      if (!token) {
        showToast('You need to login first', 'error');
        navigate('/login');
        return;
      }
      const res = await fetch(`${API_URL}/api/cart/add/${product.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Successfully added to cart', 'success');
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const error = await res.json();
        showToast(error.message || 'Could not add to cart', 'error');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      showToast('Network error. Could not add to cart.', 'error');
    }
  };

  const handleBuy = async (product) => {
    try {
      if (!token) {
        showToast('You are not logged in', 'error');
        navigate('/login');
        return;
      }
      const phone = prompt('Enter your phone number') || '';
      const email = prompt('Enter your email') || '';
      const location = prompt('Enter your delivery location') || '';
      if (!phone || !email || !location) {
        showToast('Phone, Email, and Location are required', 'error');
        return;
      }
      const res = await fetch(`${API_URL}/api/buy/${product.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phone, email, location }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Order placed successfully', 'success');
      } else {
        showToast(data.message || 'Error placing order', 'error');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      showToast('Failed to place order', 'error');
    }
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Product deleted successfully', 'success');
        navigate('/');
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to delete product', 'error');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast('Network error. Could not delete product.', 'error');
    }
  };

  if (!product) {
    return (
      <div className="product-details-container">
        <h2>Product not found</h2>
        <p>The product you are looking for does not exist or has been moved.</p>
        <button onClick={() => navigate('/')} className="back-button">Go Back</button>
      </div>
    );
  }

  return (
    <div className="product-details-container">
      <button onClick={() => navigate(-1)} className="back-button">
        &larr; Back to Products
      </button>
      <div className="product-details">
        <div className="product-image-container">
          <img
            src={`${API_URL}/api/uploads/${product.image_path}`}
            alt={product.name}
            className="product-image"
          />
        </div>
        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          <p className="product-price">
            KES {product.price.toLocaleString()}
          </p>
          {currentUser && (currentUser.is_admin || product.user_id === currentUser.id) && (
            <div className="admin-actions">
              <button
                onClick={() => navigate(`/product/edit/${product.id}`, { state: { product } })}
                className="edit-button"
              >
                Edit Product
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="delete-button"
              >
                Delete Product
              </button>
            </div>
          )}
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
          <h4 className="product-category">Category: <span>{product.category}</span></h4>
          <div className="user-actions">
            <button
              onClick={() => handleAddToCart(product)}
              className="add-to-cart-button"
            >
              Add to Cart
            </button>
            <button
              onClick={() => handleBuy(product)}
              className="order-now-button"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
