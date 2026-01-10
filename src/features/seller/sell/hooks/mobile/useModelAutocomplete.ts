import { useState, useCallback, useEffect } from 'react';
import { getModels, MobileModel } from '../../api/MobilesApi';

export const useModelAutocomplete = (brandId: number | null) => {
  const [models, setModels] = useState<MobileModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedBrandId, setFetchedBrandId] = useState<number | null>(null);

  // Clear models when brand changes
  useEffect(() => {
    if (brandId !== fetchedBrandId) {
      setModels([]);
      setFetchedBrandId(null);
    }
  }, [brandId, fetchedBrandId]);

  const fetchModels = useCallback(async () => {
    if (!brandId) {
      setModels([]);
      return;
    }

    // Don't fetch again if already fetched for this brand
    if (fetchedBrandId === brandId) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getModels(brandId);
      setModels(data);
      setFetchedBrandId(brandId);
    } catch (err) {
      setError('Failed to load models');
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [brandId, fetchedBrandId]);

  return { models, loading, error, fetchModels };
};
