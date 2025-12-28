// src/navigation/stacks/MyBikeAdsStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyBikeAdsListScreen from '@features/seller/listings/screens/bike/MyBikeAdsListScreen';
import ProductDetailsScreen from '@features/seller/listings/screens/bike/ProductDetailsScreen';
import UpdateBikeScreen from '@features/seller/listings/screens/bike/UpdateBikeScreen';

export type MyBikeAdsStackParamList = {
  MyBikeAdsList: undefined;
  ProductDetails: { bikeId: number };
  UpdateBike: { bikeId: number };
};

const Stack = createNativeStackNavigator<MyBikeAdsStackParamList>();

export default function MyBikeAdsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MyBikeAdsList"
        component={MyBikeAdsListScreen}
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
        name="UpdateBike"
        component={UpdateBikeScreen}
        options={{
          presentation: 'card',
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            // Go up to the tab navigator (3 levels up)
            const tabNavigator = navigation.getParent()?.getParent()?.getParent();
            if (tabNavigator) {
              tabNavigator.setOptions({
                tabBarStyle: { display: 'none' },
              });
            }
          },
          blur: () => {
            const tabNavigator = navigation.getParent()?.getParent()?.getParent();
            if (tabNavigator) {
              tabNavigator.setOptions({
                tabBarStyle: undefined,
              });
            }
          },
        })}
      />
    </Stack.Navigator>
  );
}
