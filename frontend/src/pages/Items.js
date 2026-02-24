import React, { useEffect, useState } from 'react';
import { useItems } from '../hooks/useItems';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';

function Items() {
  const { items, fetchItems, loading, error } = useItems();
  const [query, setQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const LIMIT = 50;

  useEffect(() => {
    const controller = new AbortController();

    fetchItems({ limit: LIMIT, offset, q: query }, controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchItems, offset, query]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setOffset(0); // Reset to page 0 on search
  };

  const Row = ({ index, style }) => {
    const item = items[index];
    if (!item) return null;
    return (
      <div style={{ ...style, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
        <Link to={'/items/' + item.id} style={{ textDecoration: 'none', color: '#007bff' }}>
          {item.name} <span style={{ color: '#888', marginLeft: 8 }}>${item.price.toFixed(2)}</span>
        </Link>
      </div>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Items</h2>
      
      <div style={{ marginBottom: 16 }}>
        <input 
          type="text" 
          value={query} 
          onChange={handleSearch} 
          placeholder="Search items..." 
          style={{ padding: '8px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <button 
          onClick={() => setOffset(Math.max(0, offset - LIMIT))} 
          disabled={offset === 0}
          style={{ padding: '8px 16px', marginRight: '8px', cursor: offset === 0 ? 'not-allowed' : 'pointer' }}
        >
          Previous
        </button>
        <span style={{ margin: '0 16px' }}>Page {Math.floor(offset / LIMIT) + 1}</span>
        <button 
          onClick={() => setOffset(offset + LIMIT)}
          disabled={items.length < LIMIT}
          style={{ padding: '8px 16px', cursor: items.length < LIMIT ? 'not-allowed' : 'pointer'}}
        >
          Next
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {loading && offset === 0 ? (
        <p>Loading items...</p>
      ) : (
        <List
          height={600}
          itemCount={items.length}
          itemSize={45}
          width="100%"
        >
          {Row}
        </List>
      )}
    </div>
  );
}

export default Items;