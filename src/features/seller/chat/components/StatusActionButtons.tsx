// src/features/seller/chat/components/StatusActionButtons.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BookingStatus } from '@core/booking/types/booking.types';
import { EntityType } from '@core/booking/types/entity.types';
import { createBookingApi } from '@core/booking/api';

interface StatusActionButtonsProps {
  requestId: number;
  currentStatus: BookingStatus;
  entityType: EntityType;
  onStatusUpdated: () => void;
}

const StatusActionButtons: React.FC<StatusActionButtonsProps> = ({
  requestId,
  currentStatus,
  entityType,
  onStatusUpdated,
}) => {
  const [loading, setLoading] = useState(false);

  // Create API instance based on entity type
  const api = createBookingApi(entityType);

  const handleAccept = async () => {
    Alert.alert(
      'Accept Request?',
      'Are you sure you want to accept this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              setLoading(true);
              await api.acceptBooking(requestId);
              Alert.alert('Success', 'Request accepted successfully');
              onStatusUpdated();
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to accept request');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    Alert.alert(
      'Reject Request?',
      'Are you sure you want to reject this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.rejectBooking(requestId);
              Alert.alert('Success', 'Request rejected successfully');
              onStatusUpdated();
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to reject request');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCompleteDeal = async () => {
    const entityName = entityType === 'mobile' ? 'mobile' :
                       entityType === 'laptop' ? 'laptop' :
                       entityType === 'car' ? 'car' : 'item';

    Alert.alert(
      'Complete Deal?',
      `This will mark the ${entityName} as SOLD and reject all other pending requests. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete Deal',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('[STATUS_BUTTONS] Completing deal for request:', requestId);
              await api.approveBooking(requestId);
              console.log('[STATUS_BUTTONS] Deal completed successfully');
              Alert.alert(
                'Deal Completed!',
                `The ${entityName} has been marked as SOLD. All other pending requests have been rejected.`,
                [
                  {
                    text: 'OK',
                    onPress: () => onStatusUpdated()
                  }
                ]
              );
            } catch (error: any) {
              console.error('[STATUS_BUTTONS] Error completing deal:', error);
              Alert.alert('Error', error?.message || 'Failed to complete deal');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0F5E87" />
        <Text style={styles.loadingText}>Updating...</Text>
      </View>
    );
  }

  // PENDING status - Show Accept and Reject DISABLED (for mobile/laptop)
  if (currentStatus === 'PENDING' && entityType !== 'car') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton, styles.disabledButton]}
          disabled={true}
          activeOpacity={0.8}
        >
          <Icon name="check-circle" size={18} color="#FFFFFF" />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton, styles.disabledButton]}
          disabled={true}
          activeOpacity={0.8}
        >
          <Icon name="close-circle" size={18} color="#94A3B8" />
          <Text style={[styles.rejectButtonText, { color: '#94A3B8' }]}>Reject</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // IN_NEGOTIATION, ACCEPTED, or CONFIRMED status - Show Accept (Complete Deal) and Reject
  if (currentStatus === 'IN_NEGOTIATION' || currentStatus === 'ACCEPTED' || currentStatus === 'CONFIRMED') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, styles.completeButton]}
          onPress={handleCompleteDeal}
          activeOpacity={0.8}
        >
          <Icon name="check-all" size={18} color="#FFFFFF" />
          <Text style={styles.completeButtonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={handleReject}
          activeOpacity={0.8}
        >
          <Icon name="close-circle" size={18} color="#EF4444" />
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // PENDING for car - no buttons (auto-accept happens on first message)
  // COMPLETED, REJECTED, or SOLD - no buttons
  return null;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#0F5E87',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rejectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  completeButton: {
    backgroundColor: '#6B7280',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default StatusActionButtons;
