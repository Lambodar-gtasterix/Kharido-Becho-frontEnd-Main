// src/shared/utils/chatStatus.ts

export type ChatRequestStatus = 'PENDING' | 'IN_NEGOTIATION' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

/**
 * Get status configuration for buyer view
 */
export const getBuyerStatusConfig = (status: string): StatusConfig => {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Pending',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        icon: 'clock-outline'
      };
    case 'IN_NEGOTIATION':
      return {
        label: 'In Negotiation',
        color: '#3B82F6',
        bgColor: '#DBEAFE',
        icon: 'chat-processing'
      };
    case 'CONFIRMED':
      return {
        label: 'In Negotiation',  // Show CONFIRMED as "In Negotiation" for car bookings
        color: '#3B82F6',
        bgColor: '#DBEAFE',
        icon: 'chat-processing'
      };
    case 'ACCEPTED':
      return {
        label: 'Accepted',
        color: '#10B981',
        bgColor: '#D1FAE5',
        icon: 'check-circle'
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        color: '#EF4444',
        bgColor: '#FEE2E2',
        icon: 'close-circle'
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        color: '#6B7280',
        bgColor: '#F3F4F6',
        icon: 'check-all'
      };
    case 'SOLD':
      return {
        label: 'Sold',
        color: '#6B7280',
        bgColor: '#F3F4F6',
        icon: 'check-all'
      };
    default:
      return {
        label: status,
        color: '#6B7280',
        bgColor: '#F3F4F6',
        icon: 'information'
      };
  }
};

/**
 * Get status configuration for seller view
 */
export const getSellerStatusConfig = (status: string): StatusConfig => {
  switch (status) {
    case 'PENDING':
      return {
        label: 'New Request',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        icon: 'clock-outline'
      };
    case 'IN_NEGOTIATION':
      return {
        label: 'In Negotiation',
        color: '#3B82F6',
        bgColor: '#DBEAFE',
        icon: 'chat-processing'
      };
    case 'CONFIRMED':
      return {
        label: 'In Negotiation',  // Show CONFIRMED as "In Negotiation" for car bookings
        color: '#3B82F6',
        bgColor: '#DBEAFE',
        icon: 'chat-processing'
      };
    case 'ACCEPTED':
      return {
        label: 'Accepted',
        color: '#10B981',
        bgColor: '#D1FAE5',
        icon: 'check-circle'
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        color: '#EF4444',
        bgColor: '#FEE2E2',
        icon: 'close-circle'
      };
    case 'COMPLETED':
      return {
        label: 'Deal Completed',
        color: '#6B7280',
        bgColor: '#F3F4F6',
        icon: 'check-all'
      };
    case 'SOLD':
      return {
        label: 'Sold',
        color: '#6B7280',
        bgColor: '#F3F4F6',
        icon: 'check-all'
      };
    default:
      return {
        label: status,
        color: '#6B7280',
        bgColor: '#F3F4F6',
        icon: 'information'
      };
  }
};

/**
 * Check if chat input should be disabled based on status
 */
export const isChatDisabled = (status: string): boolean => {
  return status === 'COMPLETED' || status === 'REJECTED' || status === 'SOLD';
};
