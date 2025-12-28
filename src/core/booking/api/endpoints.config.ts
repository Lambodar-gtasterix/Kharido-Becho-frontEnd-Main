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
    getSellerBookings: (sellerId) => `/api/v1/mobile/requests/seller/${sellerId}`,
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
    sendMessage: (bookingId) => `/api/carBookings/send`,
    updateStatus: (bookingId) => `/api/carBookings/acceptBooking`, // No direct status update, using accept
    acceptBooking: (bookingId) => `/api/carBookings/acceptBooking`,
    rejectBooking: (bookingId) => `/api/carBookings/rejectBooking`,
    approveBooking: (bookingId) => `/api/carBookings/approveBooking`,
  },

  // ========================================
  // LAPTOP BOOKING BLOCK
  // ========================================
  laptop: {
    createBooking: '/api/laptopBookings/create',
    getBuyerBookings: (buyerId) => `/api/laptopBookings/buyer/${buyerId}`,
    getBookingById: (bookingId) => `/api/laptopBookings/booking/${bookingId}`,
    getEntityBookings: (laptopId) => `/api/laptopBookings/${laptopId}`,
    getSellerBookings: (sellerId) => `/api/laptopBookings/seller/${sellerId}`,
    getPendingBookings: '/api/laptopBookings/pending',
    sendMessage: (bookingId) => `/api/laptopBookings/${bookingId}/message`,
    updateStatus: (bookingId) => `/api/laptopBookings/${bookingId}/status`,
    acceptBooking: (bookingId) => `/api/laptopBookings/${bookingId}/accept`,
    rejectBooking: (bookingId) => `/api/laptopBookings/${bookingId}/reject`,
    approveBooking: (bookingId) => `/api/laptopBookings/${bookingId}/complete`,
  },

  // ========================================
  // BIKE BOOKING BLOCK
  // ========================================
  bike: {
    createBooking: '/bikes/bookings/post',
    getBuyerBookings: (buyerId) => `/bikes/bookings/buyer/${buyerId}`,
    getBookingById: (bookingId) => `/bikes/bookings/${bookingId}`,
    getEntityBookings: (bikeId) => `/bikes/bookings/${bikeId}`,
    getSellerBookings: (sellerId) => `/bikes/bookings/get-seller/${sellerId}`,
    getPendingBookings: '/bikes/bookings/pending',
    sendMessage: (bookingId) => `/bikes/bookings/${bookingId}/message`,
    updateStatus: (bookingId) => `/bikes/bookings/${bookingId}/status`,
    acceptBooking: (bookingId) => `/bikes/bookings/${bookingId}/accept`,
    rejectBooking: (bookingId) => `/bikes/bookings/${bookingId}/reject`,
    approveBooking: (bookingId) => `/bikes/bookings/${bookingId}/complete`,
  },
};

export function getEndpointConfig(entityType: EntityType): EndpointConfig {
  return ENDPOINT_CONFIGS[entityType];
}
