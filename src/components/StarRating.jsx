import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<FaStar key={i} color="#00aaff" />);
    } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
      stars.push(<FaStarHalfAlt key={i} color="#00aaff" />);
    } else {
      stars.push(<FaRegStar key={i} color="#21262d" />);
    }
  }
  return <div style={{ display: 'flex' }}>{stars}</div>;
};

export default StarRating;
