import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MyCarAdsStackParamList } from '../../navigation/MyCarAdsStack';
import { deleteCar, getAllCars } from '@features/seller/sell/api/CarsApi';

import CarCard from '../../../sell/components/car/CarCard';
import CarCardMenu from '../../../sell/components/car/CarCardMenu';
import MyAdsListLayout from '../common/MyAdsListLayout';
import { useMyAdsStatusFilter } from '../../hooks/useMyAdsStatusFilter';
import { formatINR } from '@shared/utils';
import { DEFAULT_LISTING_LOCATION, BOTTOM_SHEET_MENU_HEIGHT, getStatusLabel } from '@shared/constants/listing';
import { CarListing } from '@shared/types/listing';

type NavigationProp = NativeStackNavigationProp<MyCarAdsStackParamList>;

const MyCarAdsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarListing | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { selectedTab, setSelectedTab, filtered } = useMyAdsStatusFilter({
    items: cars,
    getStatus: (item) => item.status,
  });

  const fetchData = async (reset = false) => {
    if (loading && !reset) return;
    try {
      if (reset) {
        setPage(0);
        setHasMore(true);
      }
      setLoading(true);
      const res = await getAllCars({
        page: reset ? 0 : page,
        size: 20,
        sort: 'createdAt,DESC',
      });
      setHasMore(res?.last === false);
      setPage((prev) => (reset ? 1 : prev + 1));
      setCars((prev) => (reset ? res.content : [...prev, ...res.content]));
    } catch (e) {
      console.warn('getAllCars error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Show bottom tab bar when this screen is focused
      let parent = navigation.getParent();
      while (parent) {
        if (parent.getState()?.type === 'tab') {
          parent.setOptions({
            tabBarStyle: undefined,
          });
          break;
        }
        parent = parent.getParent();
      }

      fetchData(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(true);
    setRefreshing(false);
  };

  const openMenuFor = useCallback((car: CarListing) => {
    setSelectedCar(car);
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setSelectedCar(null);
  }, []);

  const handleEdit = useCallback(() => {
    if (!selectedCar) return;
    navigation.navigate('UpdateCar', { carId: selectedCar.carId });
    closeMenu();
  }, [selectedCar, navigation, closeMenu]);

  const handleDelete = useCallback(() => {
    if (!selectedCar || deleting) return;

    Alert.alert(
      'Delete car',
      'Are you sure you want to delete this car?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteCar(selectedCar.carId);
              await fetchData(true);
              Alert.alert('Deleted', 'Car soft-deleted');
            } catch (e: any) {
              Alert.alert('Failed', e?.response?.data?.message ?? 'Please try again');
            } finally {
              setDeleting(false);
              closeMenu();
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [selectedCar, deleting, closeMenu]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (deleting) {
        setDeleting(false);
      }
    };
  }, [deleting]);

  const renderAdCard = useCallback(({ item }: { item: CarListing }) => {
    const primaryImage = item.images?.[0]
      ? { uri: item.images[0] }
      : require('@assets/icons/mobile.png');

    const titleText = item.title || 'Untitled Car';
    const subtitleText = [item.brand, item.model].filter(Boolean).join(' | ');

    return (
      <CarCard
        image={primaryImage}
        priceText={formatINR(item.price)}
        title={titleText}
        subtitle={subtitleText}
        location={DEFAULT_LISTING_LOCATION}
        badgeText={getStatusLabel(item.status)}
        onPress={() => navigation.navigate('ProductDetails', { carId: item.carId })}
        onMenuPress={() => openMenuFor(item)}
      />
    );
  }, [navigation, openMenuFor]);

  const listFooter =
    hasMore && loading ? <ActivityIndicator style={{ paddingVertical: 16 }} /> : null;

  return (
    <MyAdsListLayout
      title="My Car Ads"
      tabLabelSuffix="Cars"
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      data={filtered}
      loading={loading}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={renderAdCard}
      keyExtractor={(item) => String(item.carId)}
      emptyMessage="No cars found."
      onBack={() => navigation.goBack()}
      menuVisible={menuOpen}
      onCloseMenu={closeMenu}
      bottomSheetHeight={BOTTOM_SHEET_MENU_HEIGHT}
      menuContent={
        <CarCardMenu
          title={selectedCar?.title}
          statusLabel={selectedCar?.status}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deleting}
          disabled={deleting}
        />
      }
      isInitialLoading={loading && cars.length === 0}
      listProps={{
        onEndReachedThreshold: 0.3,
        onEndReached: () => {
          if (hasMore && !loading) {
            fetchData(false);
          }
        },
        ListFooterComponent: listFooter,
      }}
    />
  );
};

export default MyCarAdsListScreen;
