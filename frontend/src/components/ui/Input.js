import React from 'react';

export const Input = ({ value, onChange, placeholder, style, ...props }) => {
  return (
    <input 
      type="text" 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
      style={{ 
        padding: '8px', 
        width: '300px', 
        borderRadius: '4px', 
        border: '1px solid #ccc',
        ...style 
      }}
      {...props}
    />
  );
};
