import { useState, useEffect } from 'react';
import { mobileMetaApi } from '../api/mobileMetaApi';

export const useBrandAutocomplete = (query: string) => {
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.length === 0) {
      setBrands([]);
      return;
    }

    const timer = setTimeout(async () => {
      const upperQuery = query.toUpperCase();
      setLoading(true);
      setError(null);
      try {
        const data = await mobileMetaApi.getBrands(upperQuery);
        setBrands(data);
      } catch (err) {
        setError('Failed to load brands');
        setBrands([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return { brands, loading, error };
};
