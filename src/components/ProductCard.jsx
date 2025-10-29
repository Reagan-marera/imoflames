import React from 'react';
import './ProductCard.css';
import { API_URL } from '../config';

const ProductCard = ({
  product,
  onSelect,
  onDelete,
  onEdit,
  currentUser,
}) => {
  return (
    <div
      className="product-card"
      onClick={() => onSelect(product)}
    >
      <div className="product-image-container">
        <img
          src={`${API_URL}/api/uploads/${product.image_path}`}
          alt={product.name}
          className="product-image"
        />
      </div>

      <div className="product-details">
        <h3 className="product-name">
          {product.name}
        </h3>
        <p className="product-price">
          KES {product.price.toLocaleString()}
        </p>
        <p className="product-description">
          {product.description.substring(0, 50)}...
        </p>
      </div>

      {currentUser && (currentUser.is_admin || product.user_id === currentUser.id) && (
        <div className="admin-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
          >
            ✏️
          </button>
          <button
            className="delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product.id);
            }}
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
