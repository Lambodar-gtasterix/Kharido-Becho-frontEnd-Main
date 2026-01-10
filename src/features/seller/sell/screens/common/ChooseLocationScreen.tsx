import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { colors, radii, shadows, spacing } from '@theme/tokens';
import { INDIAN_STATES } from '@shared/constants/indianStates';

// Generic route params for all entity types
type ChooseLocationRouteParams = {
  returnScreen: string;
  carId?: number;
  bikeId?: number;
  mobileId?: number;
  laptopId?: number;
  images?: string[];
};

type ChooseLocationRouteProp = RouteProp<{ ChooseLocationScreen: ChooseLocationRouteParams }, 'ChooseLocationScreen'>;

const ChooseLocationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ChooseLocationRouteProp>();
  const { carId, bikeId, mobileId, laptopId, images } = route.params;

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStates, setFilteredStates] = useState(INDIAN_STATES);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredStates(INDIAN_STATES);
    } else {
      const filtered = INDIAN_STATES.filter((state) =>
        state.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredStates(filtered);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsDetectingLocation(true);

    // TODO: Implement actual location detection
    // For now, simulate location detection
    setTimeout(() => {
      setDetectedLocation('Hinjewadi, Pune, Maharashtra');
      setIsDetectingLocation(false);
    }, 2000);

    // Real implementation would be:
    // 1. Check location permission
    // 2. Request permission if not granted
    // 3. Get current coordinates
    // 4. Reverse geocode to get address
    // 5. Update location state
  };

  const handleStatePress = (state: string) => {
    // For demo: only Maharashtra opens city screen
    if (state === 'Maharashtra') {
      navigation.navigate('ChooseCityScreen', {
        stateName: state,
        carId,
        bikeId,
        mobileId,
        laptopId,
        images,
      } as any);
    } else {
      console.log('Selected state:', state);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Location</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search city or state"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Current Location Detection */}
        <TouchableOpacity
          style={styles.currentLocationCard}
          onPress={handleUseCurrentLocation}
          activeOpacity={0.7}
          disabled={isDetectingLocation}
        >
          <View style={styles.currentLocationIconContainer}>
            {isDetectingLocation ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icon name="crosshairs-gps" size={24} color={colors.primary} />
            )}
          </View>
          <View style={styles.currentLocationTextContainer}>
            {isDetectingLocation ? (
              <>
                <Text style={styles.currentLocationTitle}>Detecting location...</Text>
                <Text style={styles.currentLocationSubtitle}>Please wait</Text>
              </>
            ) : detectedLocation ? (
              <>
                <Text style={styles.currentLocationTitle}>Current location</Text>
                <Text style={styles.currentLocationSubtitle}>{detectedLocation}</Text>
              </>
            ) : (
              <>
                <Text style={styles.currentLocationTitle}>Use current location</Text>
                <Text style={styles.currentLocationSubtitle}>Auto-detect your location</Text>
              </>
            )}
          </View>
          {!isDetectingLocation && (
            <Icon name="chevron-right" size={24} color={colors.textMuted} />
          )}
        </TouchableOpacity>

        {/* States Section */}
        <View style={styles.statesHeader}>
          <Text style={styles.statesHeaderText}>Choose State</Text>
        </View>

        {/* States List */}
        <FlatList
          data={filteredStates}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.statesList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.stateItem}
              onPress={() => handleStatePress(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.stateText}>{item}</Text>
              <Icon name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.stateDivider} />}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    position: 'absolute',
    left: spacing.lg,
    padding: spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  currentLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.soft,
  },
currentLocationIconContainer: {
  width: 48,
  height: 48,
  borderRadius: 24,
  // backgroundColor: colors.primaryLight || `${colors.primary}15`,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: spacing.md,
},

  currentLocationTextContainer: {
    flex: 1,
  },
  currentLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  currentLocationSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statesHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  statesHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statesList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  stateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  stateText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  stateDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md,
  },
});

export default ChooseLocationScreen;
