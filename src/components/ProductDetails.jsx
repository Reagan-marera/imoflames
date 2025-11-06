import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product } = location.state || {};

  if (!product) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <p>The product you are looking for does not exist or has been moved.</p>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
        &larr; Back to Products
      </button>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <img
            src={`${API_URL}/api/uploads/${product.image_path}`}
            alt={product.name}
            style={{ width: '100%', borderRadius: '8px' }}
          />
        </div>
        <div style={{ flex: 2 }}>
          <h1>{product.name}</h1>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#00aaff' }}>
            KES {product.price.toLocaleString()}
          </p>
          <h3>Description</h3>
          <p>{product.description}</p>
          <h4>Category: {product.category}</h4>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
