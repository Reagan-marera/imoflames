import React from 'react';
import { API_URL } from '../config';
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
    <div
      className="product-card"
      onClick={() => onSelect(product)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: '#161b22',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        border: '1px solid #21262d',
        position: 'relative',
        color: '#e0e0e0'
      }}
    >
      {/* Product Image */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '10px',
          backgroundColor: '#0d1117',
          minHeight: isMobile ? '120px' : '150px',
        }}
      >
        <img
          src={`${API_URL}/api/uploads/${product.image_path}`}
          alt={product.name}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Product Details */}
      <div
        style={{
          padding: isMobile ? '8px' : '12px',
          backgroundColor: '#161b22',
          borderTop: '1px solid #21262d',
        }}
      >
        {/* Product Name */}
        <h3
          style={{
            margin: '0 0 5px 0',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: '500',
            color: '#e0e0e0',
            whiteSpace: 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.name}
        </h3>

        {/* Product Price (Always Visible) */}
        <p
          style={{
            margin: '0 0 5px 0',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: 'bold',
            color: jumiaStyle ? '#00aaff' : '#e0e0e0',
          }}
        >
          KES {product.price.toLocaleString()}
        </p>

        {/* Product Description (Short Snippet) */}
        <p
          style={{
            margin: '0',
            fontSize: isMobile ? '12px' : '14px',
            color: '#8b949e',
            whiteSpace: 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.description.substring(0, 50)}...
        </p>
      </div>

      {/* Admin Actions (Visible on Hover or for Admins) */}
      {currentUser && (currentUser.is_admin || product.user_id === currentUser.id) && (
        <div
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            display: 'flex',
            gap: '5px',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            style={{
              backgroundColor: '#0071eb',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product.id);
            }}
            style={{
              backgroundColor: '#f26522',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              fontSize: '12px',
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
