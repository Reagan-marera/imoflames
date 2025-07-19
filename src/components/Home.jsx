import React, { useState } from 'react';
import ProductList from './ProductList';
import SearchBar from './SearchBar';

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = ['Electronics']; 

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <SearchBar />
      </div>

      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2>Filter by Category</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => setSelectedCategory('')} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '5px', background: '#2c3e50', color: '#fff' }}>
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '5px', background: '#2c3e50', color: '#fff' }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <h1 style={{
        textAlign: 'center',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '2rem',
        textTransform: 'uppercase',
        letterSpacing: '2px',
      }}>
        Featured Products
      </h1>

      <ProductList selectedCategory={selectedCategory} />
    </div>
  );
};

export default Home;
