// src/navigation/stacks/MyLaptopAdsStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyLaptopAdsListScreen from '@features/seller/listings/screens/laptop/MyLaptopAdsListScreen';
import LaptopDetailsScreen from '@features/seller/listings/screens/laptop/LaptopDetailsScreen';
import UpdateLaptopScreen from '@features/seller/listings/screens/laptop/UpdateLaptopScreen';
import SellerAdRequestsScreen from '@features/seller/chat/screens/SellerAdRequestsScreen';
import SellerChatThreadScreen from '@features/seller/chat/screens/SellerChatThreadScreen';

export type MyLaptopAdsStackParamList = {
  MyLaptopAdsList: undefined;
  LaptopDetails: { laptopId: number };
  UpdateLaptop: { laptopId: number };
  SellerAdRequests: { laptopId: number; laptopTitle?: string; entityType?: string };
  SellerChatThread: { requestId: number; buyerId: number; laptopId?: number; laptopTitle?: string; entityType?: string };
};

const Stack = createNativeStackNavigator<MyLaptopAdsStackParamList>();

export default function MyLaptopAdsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MyLaptopAdsList"
        component={MyLaptopAdsListScreen}
      />
      <Stack.Screen
        name="LaptopDetails"
        component={LaptopDetailsScreen}
        listeners={({ navigation }) => ({
          focus: () => {
            // Hide bottom tab bar on details screen
            let parent = navigation.getParent();
            while (parent) {
              if (parent.getState()?.type === 'tab') {
                parent.setOptions({
                  tabBarStyle: { display: 'none' },
                });
                break;
              }
              parent = parent.getParent();
            }
          },
        })}
      />
      <Stack.Screen
        name="UpdateLaptop"
        component={UpdateLaptopScreen}
        options={{
          presentation: 'card',
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            let parent = navigation.getParent();
            while (parent) {
              if (parent.getState()?.type === 'tab') {
                parent.setOptions({
                  tabBarStyle: { display: 'none' },
                });
                break;
              }
              parent = parent.getParent();
            }
          },
          blur: () => {
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
          },
        })}
      />
      <Stack.Screen
        name="SellerAdRequests"
        component={SellerAdRequestsScreen}
      />
      <Stack.Screen
        name="SellerChatThread"
        component={SellerChatThreadScreen}
        listeners={({ navigation }) => ({
          focus: () => {
            let parent = navigation.getParent();
            while (parent) {
              if (parent.getState()?.type === 'tab') {
                parent.setOptions({
                  tabBarStyle: { display: 'none' },
                });
                break;
              }
              parent = parent.getParent();
            }
          },
          blur: () => {
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
          },
        })}
      />
    </Stack.Navigator>
  );
}
