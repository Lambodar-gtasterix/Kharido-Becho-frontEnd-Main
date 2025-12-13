import { useState, useEffect, useCallback } from 'react';
import { Booking } from '../types/booking.types';
import { EntityType } from '../types/entity.types';
import { createBookingApi } from '../api/createBookingApi';

export interface UseSellerBookingsOptions {
  entityType: EntityType;
  sellerId: number;
  enabled?: boolean;
}

export interface UseSellerBookingsReturn<TEntity = any> {
  bookings: Booking<TEntity>[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSellerBookings<TEntity = any>(
  options: UseSellerBookingsOptions
): UseSellerBookingsReturn<TEntity> {
  const { entityType, sellerId, enabled = true } = options;
  const [bookings, setBookings] = useState<Booking<TEntity>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = createBookingApi<TEntity>(entityType);

  const loadBookings = useCallback(async () => {
    if (!enabled || !sellerId || !api.getSellerBookings) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.getSellerBookings(sellerId);
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
      console.error(`[useSellerBookings:${entityType}]`, err);
    } finally {
      setLoading(false);
    }
  }, [entityType, sellerId, enabled]);

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
