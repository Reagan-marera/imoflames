import React, { useState } from 'react';
import ProductList from './ProductList';
import SearchBar from './SearchBar';

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = ['Electronics']; 

  return (
    <div className="home-container">
      <div className="search-bar-container">
        <SearchBar />
      </div>

      <div className="category-filter-container">
        <h2>Filter by Category</h2>
        <div className="category-buttons">
          <button onClick={() => setSelectedCategory('')} className="category-button">
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className="category-button"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <h1 className="featured-products-title">
        Featured Products
      </h1>

      <ProductList selectedCategory={selectedCategory} />
    </div>
  );
};

export default Home;
