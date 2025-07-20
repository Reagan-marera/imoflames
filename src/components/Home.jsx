import React, { useState } from 'react';
import ProductList from './ProductList';
import SearchBar from './SearchBar';

import ProductCarousel from './ProductCarousel';

const Home = () => {
  const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Books',
    'Sports & Outdoors',
    'Toys & Games',
  ];

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Unlimited products, discounts, and more.</h1>
          <p className="hero-subtitle">Shop anywhere. Cancel anytime.</p>
          <button className="btn btn-primary">Shop Now</button>
        </div>
      </section>

      <div className="search-bar-container">
        <SearchBar />
      </div>

      <div className="product-carousels">
        {categories.map(category => (
          <ProductCarousel key={category} category={category} />
        ))}
      </div>
    </div>
  );
};

export default Home;
