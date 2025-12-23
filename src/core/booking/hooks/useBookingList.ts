import { useState, useEffect, useCallback } from 'react';
import { Booking } from '../types/booking.types';
import { EntityType } from '../types/entity.types';
import { createBookingApi } from '../api/createBookingApi';

export interface UseBookingListOptions {
  entityType: EntityType;
  buyerId: number;
  enabled?: boolean;
}

export interface UseBookingListReturn<TEntity = any> {
  bookings: Booking<TEntity>[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBookingList<TEntity = any>(
  options: UseBookingListOptions
): UseBookingListReturn<TEntity> {
  const { entityType, buyerId, enabled = true } = options;
  const [bookings, setBookings] = useState<Booking<TEntity>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = createBookingApi<TEntity>(entityType);

  const loadBookings = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.getBuyerBookings(buyerId);
      // Sort by createdAt descending (newest first)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order
      });
      setBookings(sortedData);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
      console.error(`[useBookingList:${entityType}]`, err);
    } finally {
      setLoading(false);
    }
  }, [entityType, buyerId, enabled]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return {
    bookings,
    loading,
    error,
    refresh: loadBookings,
  };
}
