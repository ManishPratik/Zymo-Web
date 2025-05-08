import React from 'react';

const LoadingSpinner = ({ size = "40px" }) => {
  return (
    <div 
      className="animate-spin"
      style={{
        width: size,
        height: size,
        border: '3px solid rgba(250, 255, 164, 0.1)',
        borderTop: '3px solid #faffa4',
        borderRadius: '50%',
        margin: '20px auto'
      }}
    />
  );
};

export default LoadingSpinner;