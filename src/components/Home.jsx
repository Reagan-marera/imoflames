import React, { useState } from 'react';
import ProductCarousel from './ProductCarousel';
import SearchBar from './SearchBar';

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = [
    'All',
    'Phones',
    'TVs',
    'Laptops',
    'Heaters',
    'Gaming Consoles',
    'Accessories',
  ];

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Your One-Stop Shop for Electronics</h1>
          <p className="hero-subtitle">Find the best deals on the latest gadgets</p>
        </div>
      </section>

      <div className="search-and-filter-container">
        <SearchBar />
        <div className="filter-container">
          <label htmlFor="category-select">Filter by Category:</label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="product-carousels">
        {selectedCategory === 'All'
          ? categories
              .filter((c) => c !== 'All')
              .map((category) => (
                <ProductCarousel key={category} category={category} />
              ))
          : <ProductCarousel category={selectedCategory} />}
      </div>
    </div>
  );
};

export default Home;
