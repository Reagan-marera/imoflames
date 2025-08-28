import React from 'react';
import ProductList from './ProductList';
import SearchBar from './SearchBar';

const Home = () => {
  return (
    <div className="container">
      <div className="search-bar-container" style={{ marginBottom: '2rem' }}>
      </div>
      <ProductList />
    </div>
  );
};

export default Home;
