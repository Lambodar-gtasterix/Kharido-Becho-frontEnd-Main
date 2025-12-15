/**
 * Catalog Detail Screen
 * Reusable detail screen that works with any entity type
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { EntityConfig, BaseEntity } from '../config/entityTypes';
import {
  getEntityById,
  getEntityTitle,
  getEntityPrice,
  getEntityImages,
  getEntityDescription,
} from '../api/catalogApi';
import ChatRequestModal from '../../chat/components/ChatRequestModal';
import { useCreateBooking } from '@core/booking/hooks/useCreateBooking';
import { useBookingList } from '@core/booking/hooks/useBookingList';
import { useAuth } from '@context/AuthContext';

const { width } = Dimensions.get('window');

interface CatalogDetailScreenProps<T extends BaseEntity> {
  config: EntityConfig<T>;
}

type RouteParams = {
  entityId: number;
  entityType: string;
};

export function CatalogDetailScreen<T extends BaseEntity>({
  config,
}: CatalogDetailScreenProps<T>) {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { entityId } = route.params;

  const { userId, buyerId } = useAuth();
  const { createBooking, loading: creatingBooking } = useCreateBooking<T>(
    config.type as any
  );


  const [entity, setEntity] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [chatModalVisible, setChatModalVisible] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const isCreatingRef = useRef(false);

  const loadEntityDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEntityById<T>(config, entityId);
      setEntity(data);
    } catch (err) {
      console.error(`Error loading ${config.displayName} details:`, err);
      setError(`Failed to load ${config.displayName.toLowerCase()} details`);
    } finally {
      setLoading(false);
    }
  }, [config, entityId]);

  useEffect(() => {
    loadEntityDetails();
  }, [loadEntityDetails]);

  const handleScroll = useCallback(
    (event: any) => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffsetX / width);
      setActiveImageIndex(index);
    },
    []
  );

  const handleChatPress = useCallback(() => {
    const bookingUserId = config.type === 'car' || config.type === 'bike' ? buyerId : userId;
    if (!bookingUserId) {
      Alert.alert('Error', 'Please log in to send a message');
      return;
    }
    setChatModalVisible(true);
  }, [userId, buyerId, config.type]);

  const handleMakeOfferPress = useCallback(() => {
    Alert.alert(
      'Make an Offer',
      'This feature will be available soon. You can chat with the seller for now.',
      [{ text: 'OK' }]
    );
  }, []);

  const handleChatSubmit = useCallback(
    async (message: string, bookingDate?: string) => {
      // Prevent double submission
      if (isCreatingRef.current) {
        return;
      }

      // For car and bike bookings, use buyerId; for mobile and laptop, use userId
      const bookingUserId = config.type === 'car' || config.type === 'bike' ? buyerId : userId;

      if (!bookingUserId || !entity) {
        Alert.alert('Error', 'Unable to send message');
        return;
      }

      isCreatingRef.current = true;

      try {
        await createBooking(entityId, bookingUserId, message, bookingDate);

        setChatModalVisible(false);

        Alert.alert(
          'Success',
          'Your request has been sent successfully! You can view it in the Chat tab.',
          [{ text: 'OK' }]
        );
      } catch (error: any) {
        // Handle duplicate request error gracefully
        const isDuplicateError =
          error?.response?.data?.errorMessage?.includes('already sent a request') ||
          error?.response?.data?.errorMessage?.includes('already created a booking') ||
          error?.response?.data?.message?.includes('already sent a request') ||
          error?.response?.data?.message?.includes('already created a booking') ||
          error?.response?.data?.errorCode === 'BIKE_OPERATION_FAILED' ||
          error?.response?.data?.errorCode === 'ERR_BAD_REQUEST';

        if (isDuplicateError) {
          setChatModalVisible(false);
          Alert.alert(
            'Already Requested',
            'You have already sent a request for this item. Please check your Chat tab.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Error', 'Failed to send message. Please try again.');
        }
      } finally {
        isCreatingRef.current = false;
      }
    },
    [userId, buyerId, entity, entityId, createBooking, config.type]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{config.displayName} Details</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={config.color} />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !entity) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{config.displayName} Details</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadEntityDetails}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const images = getEntityImages(entity, config);
  const price = getEntityPrice(entity, config);
  const title = getEntityTitle(entity, config);
  const description = getEntityDescription(entity, config);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{config.displayName} Details</Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Icon name="heart-outline" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        {images.length > 0 ? (
          <View style={styles.carouselContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}>
              {images.map((image, index) => (
                <Image
                  key={image.imageId || index}
                  source={{ uri: image.imageUrl }}
                  style={styles.carouselImage}
                />
              ))}
            </ScrollView>
            {images.length > 1 && (
              <View style={styles.paginationContainer}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === activeImageIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Icon name={config.icon} size={80} color="#CBD5E1" />
          </View>
        )}

        {/* Price Section */}
        <View style={styles.section}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{price.toLocaleString('en-IN')}</Text>
            {entity.negotiable && (
              <View style={styles.negotiableBadge}>
                <Text style={styles.negotiableText}>Negotiable</Text>
              </View>
            )}
          </View>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* Details Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            {config.detailFields.map((field) => {
              const value = (entity as any)[field.key];
              if (!value) return null;

              const displayValue = field.format ? field.format(value) : value;

              return (
                <View key={field.key} style={styles.detailItem}>
                  <Icon
                    name={field.icon || 'information'}
                    size={20}
                    color="#64748B"
                  />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>{field.label}</Text>
                    <Text style={styles.detailValue}>{displayValue}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Description */}
        {description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        )}

        {/* Seller Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seller Information</Text>
          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              <Icon name="account" size={32} color="#64748B" />
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>Seller</Text>
              <Text style={styles.sellerDetails}>
                ID: {entity.sellerId || 'N/A'}
              </Text>
            </View>
            <TouchableOpacity style={styles.contactButton}>
              <Icon name="phone" size={20} color="#0F5E87" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.makeOfferButton}
          onPress={handleMakeOfferPress}>
          <Text style={styles.makeOfferButtonText}>Make Offer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={handleChatPress}
          disabled={creatingBooking}>
          {creatingBooking ? (
            <ActivityIndicator color="#0F5E87" />
          ) : (
            <>
              <Icon name="message-text-outline" size={20} color="#0F5E87" />
              <Text style={styles.chatButtonText}>Chat</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Chat Modal */}
      <ChatRequestModal
        visible={chatModalVisible}
        onClose={() => setChatModalVisible(false)}
        onSend={handleChatSubmit}
        mobileTitle={title}
        entityType={config.type}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
  },
  favoriteButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#0F5E87',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  carouselContainer: {
    position: 'relative',
  },
  carouselImage: {
    width,
    height: 350,
    resizeMode: 'cover',
  },
  placeholderContainer: {
    width,
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F5E87',
  },
  negotiableBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  negotiableText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F7F8F9',
    borderRadius: 12,
    gap: 12,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  sellerDetails: {
    fontSize: 12,
    color: '#64748B',
  },
  contactButton: {
    padding: 8,
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  makeOfferButton: {
    flex: 1,
    backgroundColor: '#0F5E87',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  makeOfferButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#0F5E87',
    paddingVertical: 14,
    borderRadius: 8,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F5E87',
  },
});