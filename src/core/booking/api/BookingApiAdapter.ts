import { Booking, CreateBookingRequest, SendMessageRequest } from '../types/booking.types';
import { EntityType } from '../types/entity.types';

export interface BookingApiAdapter<TEntity = any> {
  entityType: EntityType;

  createBooking(request: CreateBookingRequest): Promise<Booking<TEntity>>;
  getBuyerBookings(buyerId: number): Promise<Booking<TEntity>[]>;
  getBookingById(bookingId: number, contextId: number): Promise<Booking<TEntity>>;
  getEntityBookings(entityId: number): Promise<Booking<TEntity>[]>;
  getSellerBookings?(sellerId: number): Promise<Booking<TEntity>[]>;
  getPendingBookings(sellerId?: number): Promise<Booking<TEntity>[]>;
  sendMessage(request: SendMessageRequest): Promise<Booking<TEntity>>;
  updateStatus(bookingId: number, status: string): Promise<Booking<TEntity>>;
  acceptBooking(bookingId: number): Promise<Booking<TEntity>>;
  rejectBooking(bookingId: number): Promise<Booking<TEntity>>;
  approveBooking(bookingId: number): Promise<Booking<TEntity>>;
}
