import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { View, StyleSheet, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import SellerHomeScreen from '../home/screens/SellerHomeScreen';
import SellEntryStack from '../sell/navigation/SellEntryStack';
import MyAdsEntryStack from '../listings/navigation/MyAdsEntryStack';
import ProfileScreen from '../../shared/profile/screens/ProfileScreen';
import SellerChatListScreen from '../chat/screens/SellerChatListScreen';
import SellerEntityRequestsScreen from '../chat/screens/SellerEntityRequestsScreen';
import SellerChatThreadScreen from '../chat/screens/SellerChatThreadScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ChatStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SellerChats" component={SellerChatListScreen} />
    <Stack.Screen name="SellerEntityRequests" component={SellerEntityRequestsScreen} />
    <Stack.Screen name="SellerChatThread" component={SellerChatThreadScreen} />
  </Stack.Navigator>
);

// Same color palette as Buyer tab
const TAB_THEME = {
  activeTint: '#0F5E87',
  inactiveTint: '#9CA3AF',
  background: '#FFFFFF',
  border: '#E5E7EB',

  // SELL button
  sellOuterBg: '#FFFFFF',
  sellMainBg: '#0F5E87',
  sellInnerBg: '#FFFFFF',
};

const tabBarBaseStyle = {
  backgroundColor: TAB_THEME.background,
  borderTopWidth: 1,
  borderTopColor: TAB_THEME.border,
  height: 60,
  paddingBottom: 8,
  paddingTop: 8,
};

const SellerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TAB_THEME.activeTint,
        tabBarInactiveTintColor: TAB_THEME.inactiveTint,
        tabBarStyle: tabBarBaseStyle,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="SellerHome"
        component={SellerHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'SellerChats';
          const hideTabBar = routeName === 'SellerEntityRequests' || routeName === 'SellerChatThread';

          return {
            tabBarLabel: 'Chats',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
                size={size}
                color={color}
              />
            ),
            tabBarStyle: hideTabBar ? { display: 'none' } : tabBarBaseStyle,
          };
        }}
      />

      <Tab.Screen
        name="SellEntry"
        component={SellEntryStack}
        options={{
          tabBarLabel: 'Sell',
          tabBarIcon: () => (
            <View style={styles.sellButtonWrapper}>
              <View style={styles.sellButton}>
                <View style={styles.sellButtonInner}>
                  <Ionicons name="add" size={28} color={TAB_THEME.activeTint} />
                </View>
              </View>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="MyAdsEntry"
        component={MyAdsEntryStack}
        options={{
          tabBarLabel: 'My Ads',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'list' : 'list-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  sellButtonWrapper: {
    width: 60,
    height: 60,
    marginTop: -40,
    borderRadius: 30,
    backgroundColor: TAB_THEME.sellOuterBg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: TAB_THEME.activeTint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sellButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: TAB_THEME.sellMainBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  sellButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: TAB_THEME.sellInnerBg,
  },
});

export default SellerTabNavigator;
