import { useState, useCallback } from 'react';

export const useItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async (params = {}, signal) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${process.env.REACT_APP_API_URL}/items`);
      if (params.limit) url.searchParams.append('limit', params.limit);
      if (params.offset) url.searchParams.append('offset', params.offset);
      if (params.q) url.searchParams.append('q', params.q);

      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      setItems(json);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      if (!signal?.aborted) {
         setLoading(false);
      }
    }
  }, []);

  return { items, fetchItems, loading, error };
};
