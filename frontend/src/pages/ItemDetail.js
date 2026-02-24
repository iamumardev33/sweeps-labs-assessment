import React from 'react';
import { useParams } from 'react-router-dom';
import { useItemDetail } from '../hooks/useItemDetail';

function ItemDetail() {
  const { id } = useParams();
  const { item, loading, error } = useItemDetail(id);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{color: 'red'}}>Error: {error}</p>;
  if (!item) return null;

  return (
    <div style={{padding: 16}}>
      <h2>{item.name}</h2>
      <p><strong>Category:</strong> {item.category}</p>
      <p><strong>Price:</strong> ${item.price}</p>
    </div>
  );
}

export default ItemDetail;