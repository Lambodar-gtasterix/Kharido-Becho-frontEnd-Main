import { useState, useEffect } from 'react';
import { mobileMetaApi } from '../api/mobileMetaApi';

export const useModelAutocomplete = (brand: string, query: string, shouldFetch: boolean) => {
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brand) {
      setModels([]);
      return;
    }

    if (!shouldFetch && !query) {
      setModels([]);
      return;
    }

    const timer = setTimeout(async () => {
      const upperBrand = brand.toUpperCase();
      const upperQuery = query.toUpperCase();
      setLoading(true);
      setError(null);
      try {
        const data = await mobileMetaApi.getModels(upperBrand, upperQuery);
        setModels(data);
      } catch (err) {
        setError('Failed to load models');
        setModels([]);
      } finally {
        setLoading(false);
      }
    }, query ? 300 : 0);

    return () => clearTimeout(timer);
  }, [brand, query, shouldFetch]);

  return { models, loading, error };
};
