// src/features/seller/chat/screens/SellerChatCategoriesScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { EntityType } from '@core/booking/types/entity.types';

interface ChatCategory {
  id: EntityType;
  name: string;
  icon: string;
  emoji: string;
  color: string;
  enabled: boolean;
}

const CHAT_CATEGORIES: ChatCategory[] = [
  {
    id: 'mobile',
    name: 'Mobiles',
    icon: 'cellphone',
    emoji: '📱',
    color: '#3B82F6',
    enabled: true,
  },
  {
    id: 'laptop',
    name: 'Laptops',
    icon: 'laptop',
    emoji: '💻',
    color: '#8B5CF6',
    enabled: true,
  },
  {
    id: 'car',
    name: 'Cars',
    icon: 'car',
    emoji: '🚗',
    color: '#EF4444',
    enabled: true,
  },
  {
    id: 'bike',
    name: 'Bikes',
    icon: 'motorbike',
    emoji: '🏍️',
    color: '#F59E0B',
    enabled: true,
  },
];

const SellerChatCategoriesScreen = () => {
  const navigation = useNavigation();

  const handleCategoryPress = (category: ChatCategory) => {
    if (!category.enabled) {
      return;
    }

    (navigation as any).navigate('SellerAllRequests', {
      entityType: category.id,
      entityName: category.name,
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Chats</Text>
      <TouchableOpacity style={styles.searchButton}>
        <Icon name="magnify" size={24} color="#002F34" />
      </TouchableOpacity>
    </View>
  );

  const renderCategoryCard = (category: ChatCategory) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(category)}
      activeOpacity={0.7}
      disabled={!category.enabled}
    >
      <View
        style={[
          styles.categoryIconContainer,
          { backgroundColor: category.enabled ? `${category.color}15` : '#F3F4F6' },
        ]}
      >
        <Text style={styles.categoryEmoji}>{category.emoji}</Text>
      </View>

      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categorySubtitle}>
          {category.enabled ? 'View chats' : 'Coming soon'}
        </Text>
      </View>

      {category.enabled && (
        <Icon name="chevron-right" size={24} color="#9CA3AF" />
      )}

      {!category.enabled && (
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Soon</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}

      <View style={styles.categoriesGrid}>
        {CHAT_CATEGORIES.map(renderCategoryCard)}
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#002F34',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesGrid: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#002F34',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  comingSoonBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
});

export default SellerChatCategoriesScreen;
