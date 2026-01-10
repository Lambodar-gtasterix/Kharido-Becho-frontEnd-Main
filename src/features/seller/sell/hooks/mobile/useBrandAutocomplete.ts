import { useState, useCallback } from 'react';
import { getBrands, MobileBrand } from '../../api/MobilesApi';

export const useBrandAutocomplete = () => {
  const [brands, setBrands] = useState<MobileBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchBrands = useCallback(async () => {
    // Don't fetch again if already fetched
    if (hasFetched) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getBrands();
      setBrands(data || []);
      setHasFetched(true);
    } catch (err) {
      setError('Failed to load brands');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, [hasFetched]);

  return { brands, loading, error, fetchBrands };
};
