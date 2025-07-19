import React from 'react';
import { API_URL } from '../config';

const ProductCard = ({ product, onSelect, onBuy, onAddToCart, onDelete, currentUser }) => (
    <div className="card product-card" onClick={() => onSelect(product)}>
        <div className="product-card-image-container">
            <img
                src={`${API_URL}/api/uploads/${product.image_path}`}
                alt={product.name}
                className="product-card-image"
            />
        </div>
        <div className="product-card-content">
            <h3 className="product-card-title">{product.name}</h3>
            <p className="product-card-description">
                {product.description.length > 60
                    ? `${product.description.substring(0, 60)}...`
                    : product.description}
            </p>
            <p className="product-card-price">
                KES {product.price.toLocaleString()}
            </p>
            <div className="product-card-actions">
                <button
                    className="btn btn-primary"
                    onClick={(e) => {
                        e.stopPropagation();
                        onBuy(product);
                    }}
                >
                    Order Now
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                    }}
                >
                    Add to Cart
                </button>
                {currentUser && (currentUser.is_admin || product.user_id === currentUser.id) && (
                    <button
                        className="btn btn-danger"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(product.id);
                        }}
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    </div>
);

export default ProductCard;
