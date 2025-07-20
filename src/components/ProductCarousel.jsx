import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import ProductCard from './ProductCard';
import { showToast } from './utils';

const ProductCarousel = ({ category }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products?category=${category}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch products for category: ${category}`);
        }
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        showToast(`Failed to load products for ${category}`, "error");
      }
    };

    fetchProducts();
  }, [category]);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="product-carousel">
      <h2 className="carousel-title">{category}</h2>
      <div className="carousel-track">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;
