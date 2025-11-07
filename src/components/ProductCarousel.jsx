import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import ProductCard from './ProductCard';
import './ProductCarousel.css';
import { showToast } from './utils';
const ProductCarousel = ({ category, reviews = [] }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = category
          ? `${API_URL}/api/products?category=${category}`
          : `${API_URL}/api/products?limit=10`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch products`);
        }
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
        showToast(`Failed to load products for carousel`, 'error');
      }
    };

    fetchProducts();
  }, [category]);

  if (products.length === 0) {
    return <div>Loading carousel...</div>;
  }

  return (
    <div className="product-carousel">
      <h2 className="carousel-title">{category || 'Featured Products'}</h2>
      <div className="carousel-track">
        {products.map(product => {
          const productReviews = reviews.filter(r => r.productId === product.id);
          return <ProductCard key={product.id} product={product} reviews={productReviews} />;
        })}
      </div>
    </div>
  );
};

export default ProductCarousel;
