import React, { useState } from 'react';
import ProductList from './ProductList';
import SearchBar from './SearchBar';

import ProductCarousel from './ProductCarousel';

const Home = () => {
  const categories = [
    { name: 'Phones', icon: '📱' },
    { name: 'TVs', icon: '📺' },
    { name: 'Laptops', icon: '💻' },
    { name: 'Heaters', icon: '🔥' },
    { name: 'Gaming Consoles', icon: '🎮' },
    { name: 'Accessories', icon: '🎧' },
  ];

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Discover Your Next Favorite Thing</h1>
          <p className="hero-subtitle">Shop our curated collection of high-quality products</p>
          <button className="btn btn-primary">Shop Now</button>
        </div>
      </section>

      <div className="search-bar-container">
        <SearchBar />
      </div>

      <div className="product-carousels">
        {categories.map(category => (
          <ProductCarousel key={category.name} category={category.name} />
        ))}
      </div>
    </div>
  );
};

export default Home;
