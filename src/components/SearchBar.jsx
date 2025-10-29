import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query.trim().toLowerCase());
    if (minPrice) params.set('min', minPrice);
    if (maxPrice) params.set('max', maxPrice);
    if (onSearch) {
      onSearch(query.trim().toLowerCase());
    }
    navigate(`/products?${params}`);
  };

  return (
    <div
      style={{
        width: '100%',
        padding: isMobile ? '8px 10px' : '12px 20px',
        boxSizing: 'border-box',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '8px' : '12px',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '6px' : '10px',
            width: '100%',
          }}
        >
          <input
            type="text"
            placeholder="Search for products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              padding: isMobile ? '8px 12px' : '12px 16px',
              borderRadius: '6px',
              border: '1px solid #e0e0e0',
              fontSize: isMobile ? '14px' : '16px',
              outline: 'none',
              backgroundColor: '#fff',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            style={{
              padding: isMobile ? '8px 12px' : '12px 16px',
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#1565c0')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#1976d2')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={isMobile ? '18' : '20'}
              height={isMobile ? '18' : '20'}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '6px' : '10px',
            width: '100%',
          }}
        >
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={{
              flex: 1,
              padding: isMobile ? '8px 12px' : '12px 16px',
              borderRadius: '6px',
              border: '1px solid #e0e0e0',
              fontSize: isMobile ? '14px' : '16px',
              outline: 'none',
              backgroundColor: '#fff',
              boxSizing: 'border-box',
            }}
          />
          <span
            style={{
              fontSize: isMobile ? '14px' : '16px',
              color: '#546e7a',
            }}
          >
            -
          </span>
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{
              flex: 1,
              padding: isMobile ? '8px 12px' : '12px 16px',
              borderRadius: '6px',
              border: '1px solid #e0e0e0',
              fontSize: isMobile ? '14px' : '16px',
              outline: 'none',
              backgroundColor: '#fff',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
