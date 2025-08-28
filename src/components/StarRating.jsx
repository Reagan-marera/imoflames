import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating, onRatingChange, size = 24 }) => {
  const [hover, setHover] = useState(null);
  const isInteractive = onRatingChange !== undefined;

  // This component will no longer display half-stars for simplicity in the interactive mode.
  // It will round the displayed rating to the nearest whole number for display-only purposes.
  const displayRating = Math.round(rating);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {[...Array(5)].map((_, i) => {
        const ratingValue = i + 1;
        return (
          <label key={i}>
            {isInteractive && (
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                onClick={() => onRatingChange(ratingValue)}
                style={{ display: 'none' }}
              />
            )}
            <FaStar
              color={ratingValue <= (hover || (isInteractive ? rating : displayRating)) ? '#00aaff' : '#e4e5e9'}
              size={size}
              onMouseEnter={() => isInteractive && setHover(ratingValue)}
              onMouseLeave={() => isInteractive && setHover(null)}
              style={{
                cursor: isInteractive ? 'pointer' : 'default',
                transition: 'color 200ms'
              }}
            />
          </label>
        );
      })}
    </div>
  );
};

export default StarRating;
