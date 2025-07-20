import React from 'react';
import { API_URL } from '../config';

const ProductCard = ({ product, onSelect, onBuy, onAddToCart, onDelete, currentUser }) => (
    <div className="product-card" onClick={() => onSelect(product)}>
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
                {product.description.length > 100
                    ? `${product.description.substring(0, 100)}...`
                    : product.description}
            </p>
            <p className="product-card-price">
                KES {product.price.toLocaleString()}
            </p>
        </div>
    </div>
);

export default ProductCard;
