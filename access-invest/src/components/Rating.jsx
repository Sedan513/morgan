import React from 'react';
import './Rating.css';

const Rating = ({ value }) => {
  const getRatingText = (rating) => {
    switch (rating) {
      case 1:
        return 'Very Negative';
      case 2:
        return 'Negative';
      case 3:
        return 'Neutral';
      case 4:
        return 'Positive';
      case 5:
        return 'Very Positive';
      default:
        return 'Unknown';
    }
  };

  const getColor = (rating) => {
    switch (rating) {
      case 1:
        return '#8B0000'; // Dark red
      case 2:
        return '#FF0000'; // Regular red
      case 3:
        return '#FFD700'; // Yellow
      case 4:
        return '#008000'; // Regular green
      case 5:
        return '#90EE90'; // Light green
      default:
        return '#cccccc'; // Default gray
    }
  };

  return (
    <div className="rating-container">
      <span 
        className="rating-text"
        style={{
          color: getColor(value),
          fontWeight: 'bold'
        }}
      >
        {getRatingText(value)}
      </span>
    </div>
  );
};

export default Rating; 