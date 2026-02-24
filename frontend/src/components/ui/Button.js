import React from 'react';

export const Button = ({ onClick, disabled, children, style, ...props }) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      style={{ 
        padding: '8px 16px', 
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
};
