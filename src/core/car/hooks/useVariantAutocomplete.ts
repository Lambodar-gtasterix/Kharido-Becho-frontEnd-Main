import { useState, useEffect } from 'react';
import { carMetaApi } from '../api/carMetaApi';

export const useVariantAutocomplete = (brand: string, query: string, shouldFetch: boolean) => {
  const [variants, setVariants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brand || !shouldFetch) {
      setVariants([]);
      return;
    }

    const fetchVariants = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await carMetaApi.getVariants(brand);
        if (query && query.length > 0) {
          const upperQuery = query.toUpperCase();
          setVariants(data.filter(v => v.toUpperCase().includes(upperQuery)));
        } else {
          setVariants(data);
        }
      } catch (err) {
        setError('Failed to load variants');
        setVariants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [brand, query, shouldFetch]);

  return { variants, loading, error };
};
