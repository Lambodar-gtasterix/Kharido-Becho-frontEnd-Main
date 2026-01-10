import { useState, useEffect } from 'react';
import { locationApi } from '../api/locationApi';

export const useStates = () => {
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStates = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await locationApi.getStates();
        setStates(data);
      } catch (err) {
        setError('Failed to load states');
        setStates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  return { states, loading, error };
};

export const useCities = (state: string, enabled: boolean = true) => {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state || !enabled) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await locationApi.getCities(state);
        setCities(data);
      } catch (err) {
        setError('Failed to load cities');
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [state, enabled]);

  return { cities, loading, error };
};

export const useLocalities = (state: string, city: string, enabled: boolean = true) => {
  const [localities, setLocalities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state || !city || !enabled) {
      setLocalities([]);
      return;
    }

    const fetchLocalities = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await locationApi.getLocalities(state, city);
        setLocalities(data);
      } catch (err) {
        setError('Failed to load localities');
        setLocalities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocalities();
  }, [state, city, enabled]);

  return { localities, loading, error };
};
