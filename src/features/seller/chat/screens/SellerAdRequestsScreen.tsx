// src/features/seller/chat/screens/SellerAdRequestsScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEntityBookings } from '@core/booking/hooks';
import { MobileEntity } from '@core/booking/types/entity.types';
import BuyerRequestCard from '../components/BuyerRequestCard';

interface RouteParams {
  mobileId?: number;
  laptopId?: number;
  mobileTitle?: string;
  laptopTitle?: string;
  entityType?: 'mobile' | 'laptop' | 'car';
}

const SellerAdRequestsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mobileId, laptopId, mobileTitle, laptopTitle, entityType = 'mobile' } = route.params as RouteParams;

  const [refreshing, setRefreshing] = useState(false);

  const entityId = mobileId || laptopId || 0;
  const entityTitle = mobileTitle || laptopTitle || `${entityType} #${entityId}`;

  // Use generic booking hook
  const { bookings: requests, loading, error, refresh } = useEntityBookings<MobileEntity>({
    entityType,
    entityId,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleRequestPress = (request: any) => {
    navigation.navigate('SellerChatThread' as never, {
      requestId: request.bookingId || request.requestId,
      buyerId: request.buyerId,
      buyerName: request.buyerName,
      mobileId: mobileId,
      laptopId: laptopId,
      mobileTitle: mobileTitle,
      laptopTitle: laptopTitle,
      entityType,
    } as never);
  };

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#002F34" />
      </TouchableOpacity>

      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>{entityTitle}</Text>
        <Text style={styles.headerSubtitle}>
          {requests.length} {requests.length === 1 ? 'Request' : 'Requests'}
        </Text>
      </View>

      <TouchableOpacity style={styles.headerIconButton}>
        <Icon name="dots-vertical" size={24} color="#002F34" />
      </TouchableOpacity>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="account-multiple-outline" size={64} color="#CBD5E1" />
      </View>
      <Text style={styles.emptyTitle}>No requests yet</Text>
      <Text style={styles.emptySubtitle}>
        When buyers send you chat requests for this {entityType},{'\n'}
        they'll appear here
      </Text>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.errorIconContainer}>
        <Icon name="alert-circle-outline" size={64} color="#EF4444" />
      </View>
      <Text style={styles.emptyTitle}>Something went wrong</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refresh}>
        <Icon name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F5E87" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}

      {error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={requests}
          renderItem={({ item }) => (
            <BuyerRequestCard request={item} onPress={() => handleRequestPress(item)} />
          )}
          keyExtractor={(item) => (item.bookingId || item.requestId).toString()}
          contentContainerStyle={requests.length === 0 ? styles.emptyList : styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0F5E87']}
              tintColor="#0F5E87"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#002F34',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  headerIconButton: {
    padding: 4,
    marginLeft: 12,
  },
  listContent: {
    backgroundColor: '#FFFFFF',
  },
  emptyList: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#002F34',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SellerAdRequestsScreen;
