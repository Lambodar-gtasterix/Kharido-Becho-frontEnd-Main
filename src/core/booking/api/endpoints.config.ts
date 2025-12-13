import { EntityType } from '../types/entity.types';

export interface EndpointConfig {
  createBooking: string;
  getBuyerBookings: (buyerId: number) => string;
  getBookingById: (bookingId: number) => string;
  getEntityBookings: (entityId: number) => string;
  getSellerBookings?: (sellerId: number) => string;
  getPendingBookings: string;
  sendMessage: (bookingId: number) => string;
  updateStatus: (bookingId: number) => string;
  acceptBooking: (bookingId: number) => string;
  rejectBooking: (bookingId: number) => string;
  approveBooking: (bookingId: number) => string;
}

const ENDPOINT_CONFIGS: Record<EntityType, EndpointConfig> = {
  // ========================================
  // MOBILE BOOKING BLOCK
  // ========================================
  mobile: {
    createBooking: '/api/v1/mobile/requests/create',
    getBuyerBookings: (buyerId) => `/api/v1/mobile/requests/buyer/${buyerId}`,
    getBookingById: (bookingId) => `/api/v1/mobile/requests/${bookingId}`,
    getEntityBookings: (mobileId) => `/api/v1/mobile/requests/${mobileId}`,
    getPendingBookings: '/api/v1/mobile/requests/pending',
    sendMessage: (bookingId) => `/api/v1/mobile/requests/${bookingId}/message`,
    updateStatus: (bookingId) => `/api/v1/mobile/requests/${bookingId}/status`,
    acceptBooking: (bookingId) => `/api/v1/mobile/requests/${bookingId}/accept`,
    rejectBooking: (bookingId) => `/api/v1/mobile/requests/${bookingId}/reject`,
    approveBooking: (bookingId) => `/api/v1/mobile/requests/${bookingId}/complete`,
  },

  // ========================================
  // CAR BOOKING BLOCK
  // ========================================
  car: {
    createBooking: '/api/carBookings/createBooking',
    getBuyerBookings: (buyerId) => `/api/carBookings/buyer/${buyerId}`,
    getBookingById: (bookingId) => `/api/carBookings/${bookingId}`,
    getEntityBookings: (carId) => `/api/carBookings/car/${carId}`,
    getSellerBookings: (sellerId) => `/api/carBookings/seller/${sellerId}`,
    getPendingBookings: '/api/carBookings/pending',
    sendMessage: (bookingId) => `/api/carBookings/${bookingId}/message`,
    updateStatus: (bookingId) => `/api/carBookings/${bookingId}/status`,
    acceptBooking: (bookingId) => `/api/carBookings/${bookingId}/accept`,
    rejectBooking: (bookingId) => `/api/carBookings/${bookingId}/reject`,
    approveBooking: (bookingId) => `/api/carBookings/${bookingId}/complete`,
  },

  // ========================================
  // LAPTOP BOOKING BLOCK
  // ========================================
  laptop: {
    createBooking: '/api/laptopBookings/create',
    getBuyerBookings: (buyerId) => `/api/laptopBookings/buyer/${buyerId}`,
    getBookingById: (bookingId) => `/api/laptopBookings/${bookingId}`,
    getEntityBookings: (laptopId) => `/api/laptopBookings/${laptopId}`,
    getSellerBookings: (sellerId) => `/api/laptopBookings/seller/${sellerId}`,
    getPendingBookings: '/api/laptopBookings/pending',
    sendMessage: (bookingId) => `/api/laptopBookings/${bookingId}/message`,
    updateStatus: (bookingId) => `/api/laptopBookings/${bookingId}/status`,
    acceptBooking: (bookingId) => `/api/laptopBookings/${bookingId}/accept`,
    rejectBooking: (bookingId) => `/api/laptopBookings/${bookingId}/reject`,
    approveBooking: (bookingId) => `/api/laptopBookings/${bookingId}/complete`,
  },

  // Future: Add bike endpoints here
};

export function getEndpointConfig(entityType: EntityType): EndpointConfig {
  return ENDPOINT_CONFIGS[entityType];
}
