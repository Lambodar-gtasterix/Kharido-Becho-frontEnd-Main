import api from '@shared/api/client';
import { BookingApiAdapter } from './BookingApiAdapter';
import { Booking, CreateBookingRequest, SendMessageRequest } from '../types/booking.types';
import { EntityType } from '../types/entity.types';
import { getEndpointConfig } from './endpoints.config';

export function createBookingApi<TEntity = any>(
  entityType: EntityType
): BookingApiAdapter<TEntity> {
  const endpoints = getEndpointConfig(entityType);

  return {
    entityType,

    async createBooking(request: CreateBookingRequest): Promise<Booking<TEntity>> {
      let payload: any = {};

      // ========================================
      // MOBILE BOOKING BLOCK
      // ========================================
      if (entityType === 'mobile') {
        payload = {
          mobileId: request.entityId,
          buyerUserId: request.buyerUserId,
          message: request.message,
        };
      }

      // ========================================
      // CAR BOOKING BLOCK
      // ========================================
      if (entityType === 'car') {
        payload = {
          buyerId: request.buyerUserId,
          carId: request.entityId,
          message: request.message,
        };
      }

      // ========================================
      // LAPTOP BOOKING BLOCK
      // ========================================
      if (entityType === 'laptop') {
        const today = new Date();
        const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        payload = {
          laptopId: request.entityId,
          buyerUserId: request.buyerUserId,
          message: request.message,
          bookingDate: request.bookingDate || defaultDate,
        };
      }

      // Future: Add bike booking payload here

      const response = await api.post<any>(endpoints.createBooking, payload);
      return normalizeBooking(response.data, entityType);
    },

    async getBuyerBookings(buyerId: number): Promise<Booking<TEntity>[]> {
      const response = await api.get<any>(endpoints.getBuyerBookings(buyerId));
      if (!response.data) {
        return [];
      }
      // Car API returns {data: [...], count, message}
      const bookingsData = entityType === 'car' ? response.data.data : response.data;
      if (!bookingsData || !Array.isArray(bookingsData)) {
        return [];
      }
      return bookingsData.map(b => normalizeBooking(b, entityType));
    },

    async getBookingById(bookingId: number, contextId: number): Promise<Booking<TEntity>> {
      // ========================================
      // MOBILE BOOKING BLOCK
      // ========================================
      // For mobile, try fetching from entity bookings first (seller side)
      // then fallback to buyer bookings (buyer side)
      try {
        const entityBookings = await this.getEntityBookings(contextId);
        const booking = entityBookings.find(b => b.bookingId === bookingId || b.requestId === bookingId);
        if (booking) return booking;
      } catch (error) {
        // If entity bookings fail, try buyer bookings
        console.log('[getBookingById] Entity bookings failed, trying buyer bookings');
      }

      // Fallback to buyer bookings
      const buyerBookings = await this.getBuyerBookings(contextId);
      const booking = buyerBookings.find(b => b.bookingId === bookingId || b.requestId === bookingId);
      if (!booking) throw new Error(`Booking ${bookingId} not found`);
      return booking;

      // Future: Add car, bike, laptop getBookingById logic here
    },

    async getEntityBookings(entityId: number): Promise<Booking<TEntity>[]> {
      try {
        const response = await api.get<any>(endpoints.getEntityBookings(entityId));
        const bookingsData = entityType === 'car' ? response.data.data : response.data;
        if (!bookingsData || !Array.isArray(bookingsData)) {
          return [];
        }
        return bookingsData.map(b => normalizeBooking(b, entityType));
      } catch (error: any) {
        // Handle "No requests found" as an empty array instead of an error
        if (error?.response?.status === 400 &&
            error?.response?.data?.message?.toLowerCase().includes('no requests found')) {
          return [];
        }
        // Re-throw other errors
        throw error;
      }
    },

    async getPendingBookings(sellerId?: number): Promise<Booking<TEntity>[]> {
      const response = await api.get<any>(endpoints.getPendingBookings);
      const bookingsData = entityType === 'car' ? response.data.data : response.data;
      if (!bookingsData || !Array.isArray(bookingsData)) {
        return [];
      }
      return bookingsData.map(b => normalizeBooking(b, entityType));
    },

    async sendMessage(request: SendMessageRequest): Promise<Booking<TEntity>> {
      // ========================================
      // LAPTOP BOOKING BLOCK - Uses query params
      // ========================================
      if (entityType === 'laptop') {
        const response = await api.post<any>(
          endpoints.sendMessage(request.bookingId),
          null,
          {
            params: {
              senderUserId: request.senderUserId,
              message: request.message,
            },
          }
        );
        return normalizeBooking(response.data, entityType);
      }

      // ========================================
      // MOBILE/CAR BOOKING BLOCK - Uses FormData
      // ========================================
      const formData = new FormData();
      formData.append('senderUserId', request.senderUserId.toString());
      formData.append('message', request.message);

      const response = await api.post<any>(
        endpoints.sendMessage(request.bookingId),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return normalizeBooking(response.data, entityType);
    },

    async updateStatus(bookingId: number, status: string): Promise<Booking<TEntity>> {
      const response = await api.patch<any>(
        endpoints.updateStatus(bookingId),
        null,
        { params: { status } }
      );
      return normalizeBooking(response.data, entityType);
    },

    async acceptBooking(bookingId: number): Promise<Booking<TEntity>> {
      const response = await api.patch<any>(endpoints.acceptBooking(bookingId));
      return normalizeBooking(response.data, entityType);
    },

    async rejectBooking(bookingId: number): Promise<Booking<TEntity>> {
      const response = await api.patch<any>(endpoints.rejectBooking(bookingId));
      return normalizeBooking(response.data, entityType);
    },

    async approveBooking(bookingId: number): Promise<Booking<TEntity>> {
      const response = await api.post<any>(endpoints.approveBooking(bookingId));
      return normalizeBooking(response.data, entityType);
    },
  };
}

// ========================================
// MOBILE BOOKING BLOCK
// ========================================
function normalizeBooking<TEntity>(data: any, entityType: EntityType): Booking<TEntity> {
  return {
    bookingId: data.bookingId || data.requestId || data.laptopBookingId || data.carBookingId,
    requestId: data.requestId || data.laptopBookingId,
    entityId: data.mobileId || data.carId || data.laptopId, // Future: Add || data.bikeId
    entityType,
    buyerId: data.buyerId || data.buyerUserId,
    sellerId: data.sellerId || data.sellerUserId,
    buyerName: data.buyerName,
    sellerName: data.sellerName,
    status: data.status || data.bookingStatus,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || null,
    conversation: data.conversation || [],
    messageCount: data.messageCount,
    lastMessage: data.lastMessage,
    lastMessageTime: data.lastMessageTime,
    entityData: data.mobile || data.car || data.laptop, // Future: Add || data.bike
  };
}