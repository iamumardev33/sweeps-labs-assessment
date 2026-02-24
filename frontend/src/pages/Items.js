import React, { useEffect, useState, useMemo } from 'react';
import { useItems } from '../hooks/useItems';
import { useDebounce } from '../hooks/useDebounce';
import { FixedSizeList as List } from 'react-window';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ItemRow } from '../components/items/ItemRow';

function Items() {
  const { items, fetchItems, loading, error } = useItems();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [offset, setOffset] = useState(0);
  const LIMIT = 50;

  useEffect(() => {
    const controller = new AbortController();

    fetchItems({ limit: LIMIT, offset, q: debouncedQuery }, controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchItems, offset, debouncedQuery]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setOffset(0); // Reset to page 0 on search
  };

  // We wrap the Row purely to adapt the signature for react-window
  const RenderRow = ({ index, style }) => (
    <ItemRow item={items[index]} style={style} />
  );

  return (
    <div style={{ padding: 16 }}>
      <h2>Items</h2>
      
      <div style={{ marginBottom: 16 }}>
        <Input 
          value={query} 
          onChange={handleSearch} 
          placeholder="Search items..." 
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Button 
          onClick={() => setOffset(Math.max(0, offset - LIMIT))} 
          disabled={offset === 0}
          style={{ marginRight: '8px' }}
        >
          Previous
        </Button>
        <span style={{ margin: '0 16px' }}>Page {Math.floor(offset / LIMIT) + 1}</span>
        <Button 
          onClick={() => setOffset(offset + LIMIT)}
          disabled={items.length < LIMIT}
        >
          Next
        </Button>
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
          {RenderRow}
        </List>
      )}
    </div>
  );
}

export default Items;