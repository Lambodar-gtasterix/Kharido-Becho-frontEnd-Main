import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyMobilesAdsListScreen from '@features/seller/listings/screens/mobile/MyMobilesAdsListScreen';
import ProductDetailsScreen from '@features/seller/listings/screens/mobile/ProductDetailsScreen';
import UpdateMobileScreen from '@features/seller/listings/screens/mobile/UpdateMobileScreen';
import SellerAdRequestsScreen from '@features/seller/chat/screens/SellerAdRequestsScreen';
import SellerChatThreadScreen from '@features/seller/chat/screens/SellerChatThreadScreen';

export type MyMobileAdsStackParamList = {
  MyMobilesAdsList: undefined;
  ProductDetails: { mobileId: number };
  UpdateMobile: { mobileId: number };
  SellerAdRequests: { mobileId: number; mobileTitle?: string };
  SellerChatThread: { requestId: number; buyerId: number; mobileId?: number; mobileTitle?: string };
};

const Stack = createNativeStackNavigator<MyMobileAdsStackParamList>();

export default function MyMobileAdsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MyMobilesAdsList"
        component={MyMobilesAdsListScreen}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
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
        name="UpdateMobile"
        component={UpdateMobileScreen}
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
