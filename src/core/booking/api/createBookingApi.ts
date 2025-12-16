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

      // ========================================
      // BIKE BOOKING BLOCK
      // ========================================
      if (entityType === 'bike') {
        payload = {
          bikeId: request.entityId,
          buyerId: request.buyerUserId,
          message: request.message,
        };
      }

      const response = await api.post<any>(endpoints.createBooking, payload);
      return normalizeBooking(response.data, entityType);
    },

    async getBuyerBookings(buyerId: number): Promise<Booking<TEntity>[]> {
      try {
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

    async getBookingById(bookingId: number, contextId: number): Promise<Booking<TEntity>> {
      // ========================================
      // CAR/LAPTOP/BIKE BOOKING BLOCK - Direct API call
      // ========================================
      if (entityType === 'car' || entityType === 'laptop' || entityType === 'bike') {
        const response = await api.get<any>(endpoints.getBookingById(bookingId));
        return normalizeBooking(response.data, entityType);
      }

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

    async getSellerBookings(sellerId: number): Promise<Booking<TEntity>[]> {
      if (!endpoints.getSellerBookings) {
        throw new Error(`getSellerBookings not supported for ${entityType}`);
      }
      try {
        const response = await api.get<any>(endpoints.getSellerBookings(sellerId));
        const bookingsData = response.data;
        if (!bookingsData || !Array.isArray(bookingsData)) {
          return [];
        }
        return bookingsData.map(b => normalizeBooking(b, entityType));
      } catch (error: any) {
        if (error?.response?.status === 400 || error?.response?.status === 404) {
          return [];
        }
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
      // CAR BOOKING BLOCK - Returns partial response (bookingId + conversation only)
      // ========================================
      if (entityType === 'car') {
        const response = await api.post<any>(
          endpoints.sendMessage(request.bookingId),
          {
            userId: request.senderUserId,
            message: request.message,
          },
          {
            params: {
              bookingId: request.bookingId,
            },
          }
        );
        // Return partial booking with just conversation - will be merged in UI
        return normalizeBooking(response.data, entityType);
      }

      // ========================================
      // MOBILE BOOKING BLOCK - Uses FormData
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
  // Extract seller name from nested structure for car/laptop/bike
  let sellerName = data.sellerName;
  if (!sellerName && data.seller?.user) {
    const firstName = data.seller.user.firstName || '';
    const lastName = data.seller.user.lastName || '';
    sellerName = `${firstName} ${lastName}`.trim();
  }

  // Extract buyer name from nested structure for car/laptop/bike
  let buyerName = data.buyerName;
  if (!buyerName && data.buyer?.user) {
    const firstName = data.buyer.user.firstName || '';
    const lastName = data.buyer.user.lastName || '';
    buyerName = `${firstName} ${lastName}`.trim();
  }

  return {
    bookingId: data.bookingId || data.requestId || data.laptopBookingId || data.carBookingId,
    requestId: data.requestId || data.laptopBookingId,
    entityId: data.mobileId || data.carId || data.laptopId || data.bikeId,
    entityType,
    buyerId: data.buyerId || data.buyerUserId,
    sellerId: data.sellerId || data.sellerUserId,
    buyerName,
    sellerName,
    status: data.status || data.bookingStatus,
    createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
    updatedAt: data.updatedAt || null,
    conversation: data.conversation || [],
    messageCount: data.messageCount,
    lastMessage: data.lastMessage,
    lastMessageTime: data.lastMessageTime,
    entityData: data.mobile || data.car || data.laptop || data.bike,
  };
}