import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { showToast } from './utils';
import './ProductDetails.css';

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${productId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchCurrentUser = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
        }
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };

    fetchProduct();
    fetchCurrentUser();
  }, [productId, token]);

  const handleAddToCart = async () => {
    if (!token) {
      showToast('You need to login first', 'error');
      navigate('/login');
      return;
    }
    try {
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
      showToast('Network error. Could not add to cart.', 'error');
    }
  };

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  if (!product) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="product-details-page">
      <div className="product-details-container">
        <div className="product-image-section">
          <img src={`${API_URL}/api/uploads/${product.image_path}`} alt={product.name} />
        </div>
        <div className="product-info-section">
          <h1>{product.name}</h1>
          <p className="price">KES {product.price.toLocaleString()}</p>
          <p className="description">{product.description}</p>
          <div className="actions">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
