import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MyMobileAdsStackParamList } from '../../navigation/MyMobileAdsStack';
import { deleteMobile, getAllMobiles } from '@features/seller/sell/api/MobilesApi';

import MobileCard from '../../../sell/components/mobile/MobileCard';
import MobileCardMenu from '../../../sell/components/mobile/MobileCardMenu';
import MyAdsListLayout from '../common/MyAdsListLayout';
import { useMyAdsStatusFilter } from '../../hooks/useMyAdsStatusFilter';
import { formatINR } from '@shared/utils';
import { DEFAULT_LISTING_LOCATION, BOTTOM_SHEET_MENU_HEIGHT, getStatusLabel } from '@shared/constants/listing';
import { MobileListing } from '@shared/types/listing';

type NavigationProp = NativeStackNavigationProp<MyMobileAdsStackParamList>;

const MyMobilesAdsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [mobiles, setMobiles] = useState<MobileListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMobile, setSelectedMobile] = useState<MobileListing | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { selectedTab, setSelectedTab, filtered } = useMyAdsStatusFilter({
    items: mobiles,
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
      const res = await getAllMobiles({
        page: reset ? 0 : page,
        size: 20,
        sort: 'createdAt,DESC',
      });
      setHasMore(res?.last === false);
      setPage((prev) => (reset ? 1 : prev + 1));
      setMobiles((prev) => (reset ? res.content : [...prev, ...res.content]));
    } catch (e) {
      console.warn('getAllMobiles error:', e);
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

  const openMenuFor = useCallback((mobile: MobileListing) => {
    setSelectedMobile(mobile);
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setSelectedMobile(null);
  }, []);

  const handleEdit = useCallback(() => {
    if (!selectedMobile) return;
    (navigation as any).navigate('UpdateMobile', { mobileId: selectedMobile.mobileId });
    closeMenu();
  }, [selectedMobile, navigation, closeMenu]);

  const handleDelete = useCallback(() => {
    if (!selectedMobile || deleting) return;

    Alert.alert(
      'Delete mobile',
      'Are you sure you want to delete this mobile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteMobile(selectedMobile.mobileId);
              await fetchData(true);
              Alert.alert('Deleted', 'Mobile soft-deleted');
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
  }, [selectedMobile, deleting, closeMenu]);

  const handleChatPress = useCallback((mobile: MobileListing) => {
    // Navigate directly to request list screen
    // The SellerAdRequestsScreen will handle loading and empty state
    (navigation as any).navigate('SellerAdRequests', {
      mobileId: mobile.mobileId,
      mobileTitle: mobile.title || 'Mobile',
    });
  }, [navigation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (deleting) {
        setDeleting(false);
      }
    };
  }, [deleting]);

  const renderAdCard = useCallback(({ item }: { item: MobileListing }) => {
    const primaryImage = item.images?.[0]
      ? { uri: item.images[0].imageUrl }
      : require('@assets/icons/mobile.png');

    const titleText = item.title || 'Untitled Mobile';
    const subtitleText = [item.brand, item.yearOfPurchase?.toString()].filter(Boolean).join(' | ');

    return (
      <MobileCard
        image={primaryImage}
        priceText={formatINR(item.price)}
        title={titleText}
        subtitle={subtitleText}
        location={DEFAULT_LISTING_LOCATION}
        badgeText={getStatusLabel(item.status)}
        onPress={() => navigation.navigate('ProductDetails', { mobileId: item.mobileId })}
        onMenuPress={() => openMenuFor(item)}
        onChatPress={() => handleChatPress(item)}
        showChatButton={true}
      />
    );
  }, [navigation, openMenuFor, handleChatPress]);

  const listFooter =
    hasMore && loading ? <ActivityIndicator style={{ paddingVertical: 16 }} /> : null;

  return (
    <MyAdsListLayout
      title="My Mobile Ads"
      tabLabelSuffix="Mobiles"
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      data={filtered}
      loading={loading}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={renderAdCard}
      keyExtractor={(item) => String(item.mobileId)}
      emptyMessage="No mobiles found."
      onBack={() => navigation.goBack()}
      menuVisible={menuOpen}
      onCloseMenu={closeMenu}
      bottomSheetHeight={BOTTOM_SHEET_MENU_HEIGHT}
      menuContent={
        <MobileCardMenu
          title={selectedMobile?.title}
          statusLabel={selectedMobile?.status}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deleting}
          disabled={deleting}
        />
      }
      isInitialLoading={loading && mobiles.length === 0}
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

export default MyMobilesAdsListScreen;
