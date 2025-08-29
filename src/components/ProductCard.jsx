import React from 'react';
import { API_URL } from '../config';
import './ProductCard.css';

const ProductCard = ({
  product,
  onSelect,
  onBuy,
  onAddToCart,
  onDelete,
  onEdit,
  currentUser,
  isMobile,
  jumiaStyle = true,
  reviews: productReviews = [],
}) => {
  const averageRating = productReviews.length > 0
    ? productReviews.reduce((acc, review) => acc + review.rating, 0) / productReviews.length
    : 0;

  return (
    <div className="product-card" onClick={() => onSelect(product)}>
      <div className="product-card-image-container">
        <img
          className="product-card-image"
          src={`${API_URL}/api/uploads/${product.image_path}`}
          alt={product.name}
        />
      </div>

      <div className="product-card-details">
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-price">KES {product.price.toLocaleString()}</p>
        <p className="product-card-description">
          {product.description.substring(0, 50)}...
        </p>
      </div>

      {currentUser && (currentUser.is_admin || product.user_id === currentUser.id) && (
        <div className="product-card-admin-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
          >
            ✏️
          </button>
          <button
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
