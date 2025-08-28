import React, { useState, useEffect } from 'react';
import ProductList from './ProductList';
import SearchBar from './SearchBar';
import reviewsData from '../data/reviews.json';

const Home = () => {
  const [reviews, setReviews] = useState(() => {
    const savedReviews = localStorage.getItem('reviews');
    return savedReviews ? JSON.parse(savedReviews) : reviewsData;
  });

  useEffect(() => {
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }, [reviews]);

  return (
    <div className="container">
      <div className="search-bar-container" style={{ marginBottom: '2rem' }}>
      </div>
      <ProductList reviews={reviews} setReviews={setReviews} />
    </div>
  );
};

export default Home;
