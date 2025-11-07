import React, { useState, useEffect } from 'react';
import ProductList from './ProductList';
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
      <ProductList reviews={reviews} setReviews={setReviews} />
    </div>
  );
};

export default Home;
