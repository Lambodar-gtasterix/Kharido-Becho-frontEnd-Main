import { useState, useEffect } from 'react';
import { carMetaApi } from '../api/carMetaApi';

export const useBrandAutocomplete = (query: string, shouldFetch: boolean) => {
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldFetch) {
      setBrands([]);
      return;
    }

    const fetchBrands = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await carMetaApi.getBrands();
        if (query && query.length > 0) {
          const upperQuery = query.toUpperCase();
          setBrands(data.filter(b => b.toUpperCase().includes(upperQuery)));
        } else {
          setBrands(data);
        }
      } catch (err) {
        setError('Failed to load brands');
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [query, shouldFetch]);

  return { brands, loading, error };
};
