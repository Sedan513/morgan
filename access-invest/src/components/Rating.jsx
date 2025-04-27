import React from 'react';
import './Rating.css';

const Rating = ({ value }) => {
  const getRatingText = (rating) => {
    switch (rating) {
      case 1:
        return 'Very Bad';
      case 2:
        return 'Bad';
      case 3:
        return 'Neutral';
      case 4:
        return 'Good';
      case 5:
        return 'Very Good';
      default:
        return 'Unknown';
    }
  };

  const getColor = (rating) => {
    switch (rating) {
      case 1:
        return '#ff0000'; // Dark red
      case 2:
        return '#ff6666'; // Light red
      case 3:
        return '#ffb366'; // Light orange
      case 4:
        return '#66ff66'; // Light green
      case 5:
        return '#00cc00'; // Dark green
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