import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useItemDetail = (id) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItemDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/items/${id}`);
        if (!res.ok) {
          throw new Error('Item not found');
        }
        const data = await res.json();
        setItem(data);
      } catch (err) {
        setError(err.message);
        navigate('/'); // Redirect to home if fetch fails (imitating previous logic)
      } finally {
        setLoading(false);
      }
    };

    if (id) {
       fetchItemDetail();
    }
  }, [id, navigate]);

  return { item, loading, error };
};
