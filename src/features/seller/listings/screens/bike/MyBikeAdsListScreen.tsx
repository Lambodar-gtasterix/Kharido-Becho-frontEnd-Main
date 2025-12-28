import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MyBikeAdsStackParamList } from '../../navigation/MyBikeAdsStack';
import { deleteBike } from '@features/seller/sell/api/BikesApi';
import { getAllBikes, BikeItem } from '@features/seller/sell/api/BikesApi/getAllBikes';

import BikeCard from '../../../sell/components/bike/BikeCard';
import BikeCardMenu from '../../../sell/components/bike/BikeCardMenu';
import MyAdsListLayout from '../common/MyAdsListLayout';
import { useMyAdsStatusFilter } from '../../hooks/useMyAdsStatusFilter';
import { formatINR } from '@shared/utils';
import { DEFAULT_LISTING_LOCATION, BOTTOM_SHEET_MENU_HEIGHT, getStatusLabel } from '@shared/constants/listing';

type NavigationProp = NativeStackNavigationProp<MyBikeAdsStackParamList>;

const MyBikeAdsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [bikes, setBikes] = useState<BikeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedBike, setSelectedBike] = useState<BikeItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { selectedTab, setSelectedTab, filtered } = useMyAdsStatusFilter({
    items: bikes,
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
      const res = await getAllBikes({
        page: reset ? 0 : page,
        size: 20,
        sort: 'createdAt,DESC',
      });

      // Sort bikes by createdAt to show newest first
      const sortedContent = (res.content || []).sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setHasMore(res?.last === false);
      setPage((prev) => (reset ? 1 : prev + 1));
      setBikes((prev) => (reset ? sortedContent : [...prev, ...sortedContent]));
    } catch (e) {
      console.warn('getAllBikes error:', e);
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

  const openMenuFor = useCallback((bike: BikeItem) => {
    setSelectedBike(bike);
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setSelectedBike(null);
  }, []);

  const handleEdit = useCallback(() => {
    if (!selectedBike) return;
    navigation.navigate('UpdateBike', { bikeId: selectedBike.bike_id });
    closeMenu();
  }, [selectedBike, navigation, closeMenu]);

  const handleDelete = useCallback(() => {
    if (!selectedBike || deleting) return;

    Alert.alert(
      'Delete bike',
      'Are you sure you want to delete this bike?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteBike(selectedBike.bike_id);
              await fetchData(true);
              Alert.alert('Deleted', 'Bike soft-deleted');
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
  }, [selectedBike, deleting, closeMenu]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (deleting) {
        setDeleting(false);
      }
    };
  }, [deleting]);

  const renderAdCard = useCallback(({ item }: { item: BikeItem }) => {
    const primaryImage = item.images?.[0]?.image_link
      ? { uri: item.images[0].image_link }
      : require('@assets/icons/bike.png');

    const titleText = [item.brand, item.model].filter(Boolean).join(' ') || 'Untitled Bike';
    const subtitleText = [item.variant, item.manufactureYear].filter(Boolean).join(' | ');

    return (
      <BikeCard
        image={primaryImage}
        priceText={formatINR(item.prize)}
        title={titleText}
        subtitle={subtitleText}
        location={DEFAULT_LISTING_LOCATION}
        badgeText={getStatusLabel(item.status)}
        onPress={() => {
          navigation.navigate('ProductDetails', { bikeId: item.bike_id });
        }}
        onMenuPress={() => openMenuFor(item)}
      />
    );
  }, [navigation, openMenuFor]);

  const listFooter =
    hasMore && loading ? <ActivityIndicator style={{ paddingVertical: 16 }} /> : null;

  return (
    <MyAdsListLayout
      title="My Bike Ads"
      tabLabelSuffix="Bikes"
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      data={filtered}
      loading={loading}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={renderAdCard}
      keyExtractor={(item) => String(item.bike_id)}
      emptyMessage="No bikes found."
      onBack={() => navigation.goBack()}
      menuVisible={menuOpen}
      onCloseMenu={closeMenu}
      bottomSheetHeight={BOTTOM_SHEET_MENU_HEIGHT}
      menuContent={
        <BikeCardMenu
          title={selectedBike ? [selectedBike.brand, selectedBike.model].filter(Boolean).join(' ') : undefined}
          statusLabel={selectedBike?.status}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deleting}
          disabled={deleting}
        />
      }
      isInitialLoading={loading && bikes.length === 0}
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

export default MyBikeAdsListScreen;
