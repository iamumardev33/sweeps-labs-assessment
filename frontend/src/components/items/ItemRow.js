import React from 'react';
import { Link } from 'react-router-dom';

export const ItemRow = ({ item, style }) => {
  if (!item) return null;
  return (
    <div style={{ ...style, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
      <Link to={'/items/' + item.id} style={{ textDecoration: 'none', color: '#007bff' }}>
        {item.name} <span style={{ color: '#888', marginLeft: 8 }}>${item.price.toFixed(2)}</span>
      </Link>
    </div>
  );
};
