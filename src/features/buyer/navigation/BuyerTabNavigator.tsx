// src/features/buyer/home/navigation/BuyerTabNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import BuyerHomeScreen from '../home/screens/BuyerHomeScreen';
import ProfileScreen from '../../shared/profile/screens/ProfileScreen';
import BuyerChatsScreen from '../chat/screens/BuyerChatsScreen';
import BuyerChatListScreen from '../chat/screens/BuyerChatListScreen';
import BuyerChatThreadScreen from '../chat/screens/BuyerChatThreadScreen';
import {
  mobileConfig,
  carConfig,
  laptopConfig,
  bikeConfig,
} from '../browse/config/entityConfigs';
import { createCatalogStack } from '../browse/navigation/createCatalogStack';

// Placeholder screens
const SearchScreen = () => null;
const FavoritesScreen = () => null;

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Create catalog stack navigators for each entity
const MobileStack = createCatalogStack(mobileConfig);
const CarStack = createCatalogStack(carConfig);
const LaptopStack = createCatalogStack(laptopConfig);
const BikeStack = createCatalogStack(bikeConfig);

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BuyerHomeMain" component={BuyerHomeScreen} />
    <Stack.Screen name="MobileStack" component={MobileStack} />
    <Stack.Screen name="CarStack" component={CarStack} />
    <Stack.Screen name="LaptopStack" component={LaptopStack} />
    <Stack.Screen name="BikeStack" component={BikeStack} />
  </Stack.Navigator>
);

const ChatStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BuyerChats" component={BuyerChatsScreen} />
    <Stack.Screen name="BuyerChatList" component={BuyerChatListScreen} />
    <Stack.Screen name="BuyerChatThread" component={BuyerChatThreadScreen} />
  </Stack.Navigator>
);

// 🔥 SAME HEIGHT / WIDTH AS SELLER TAB
const tabBarBaseStyle = {
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#E5E7EB',
  height: Platform.OS === 'ios' ? 88 : 65,
  paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  paddingTop: 8,
};

const BuyerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0F5E87',   // keep buyer colors
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: tabBarBaseStyle,       // 👈 HEIGHT MATCHED
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="BuyerHome"
        component={HomeStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'BuyerHomeMain';

          // Hide tab bar when viewing any entity stack
          const entityStacks = ['MobileStack', 'CarStack', 'LaptopStack', 'BikeStack'];
          const hideTabBar = entityStacks.includes(routeName);

          return {
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={24}
                color={color}
              />
            ),
            tabBarStyle: hideTabBar ? { display: 'none' } : tabBarBaseStyle,
          };
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favorites',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'BuyerChats';

          return {
            tabBarLabel: 'Chats',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
                size={24}
                color={color}
              />
            ),
            tabBarStyle: routeName === 'BuyerChatThread' ? { display: 'none' } : tabBarBaseStyle,
          };
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BuyerTabNavigator;
