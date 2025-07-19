import React, { useState } from 'react';
import ProductList from './ProductList';
import SearchBar from './SearchBar';

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { name: 'Electronics', icon: '💻' },
    { name: 'Fashion', icon: '👗' },
    { name: 'Home & Garden', icon: '🏡' },
    { name: 'Books', icon: '📚' },
    { name: 'Sports & Outdoors', icon: '⚽' },
    { name: 'Toys & Games', icon: '🎮' },
  ];

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Discover Your Next Favorite Thing</h1>
          <p className="hero-subtitle">Shop our curated collection of high-quality products</p>
          <button className="hero-button">Shop Now</button>
        </div>
      </section>

      <div className="search-bar-container">
        <SearchBar />
      </div>

      <section className="categories-section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-grid">
          {categories.map(category => (
            <div
              key={category.name}
              className="category-card"
              onClick={() => setSelectedCategory(category.name)}
            >
              <span className="category-icon">{category.icon}</span>
              <h3 className="category-name">{category.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <h1 className="featured-products-title">
        Featured Products
      </h1>

      <ProductList selectedCategory={selectedCategory} />
    </div>
  );
};

export default Home;
