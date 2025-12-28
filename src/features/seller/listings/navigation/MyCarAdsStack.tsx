// src/navigation/stacks/MyCarAdsStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyCarAdsListScreen from '@features/seller/listings/screens/car/MyCarAdsListScreen';
import CarDetailsScreen from '@features/seller/listings/screens/car/ProductDetailsScreen';
import UpdateCarScreen from '@features/seller/listings/screens/car/UpdateCarScreen';

export type MyCarAdsStackParamList = {
  MyCarAdsList: undefined;
  ProductDetails: { carId: number };
  UpdateCar: { carId: number };
};

const Stack = createNativeStackNavigator<MyCarAdsStackParamList>();

export default function MyCarAdsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MyCarAdsList"
        component={MyCarAdsListScreen}
      />
      <Stack.Screen
        name="ProductDetails"
        component={CarDetailsScreen}
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
        name="UpdateCar"
        component={UpdateCarScreen}
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
