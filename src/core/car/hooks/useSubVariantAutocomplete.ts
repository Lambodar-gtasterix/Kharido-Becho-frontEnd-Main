import { useState, useEffect } from 'react';
import { carMetaApi } from '../api/carMetaApi';

export const useSubVariantAutocomplete = (
  brand: string,
  variant: string,
  query: string,
  shouldFetch: boolean
) => {
  const [subVariants, setSubVariants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brand || !variant || !shouldFetch) {
      setSubVariants([]);
      return;
    }

    const fetchSubVariants = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await carMetaApi.getSubVariants(brand, variant);
        if (query && query.length > 0) {
          const upperQuery = query.toUpperCase();
          setSubVariants(data.filter(sv => sv.toUpperCase().includes(upperQuery)));
        } else {
          setSubVariants(data);
        }
      } catch (err) {
        setError('Failed to load sub-variants');
        setSubVariants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubVariants();
  }, [brand, variant, query, shouldFetch]);

  return { subVariants, loading, error };
};
