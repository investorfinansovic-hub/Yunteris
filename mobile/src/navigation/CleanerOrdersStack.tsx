import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyOrdersScreen from '../screens/cleaner/MyOrdersScreen';
import CleanerOrderDetailScreen from '../screens/cleaner/CleanerOrderDetailScreen';
import { colors } from '../theme';

export type CleanerOrdersStackParamList = {
  MyOrdersList: undefined;
  CleanerOrderDetail: { orderId: string };
};

const Stack = createNativeStackNavigator<CleanerOrdersStackParamList>();

export default function CleanerOrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
      <Stack.Screen name="MyOrdersList" component={MyOrdersScreen} options={{ title: 'Мои заказы' }} />
      <Stack.Screen name="CleanerOrderDetail" component={CleanerOrderDetailScreen} options={{ title: 'Заказ' }} />
    </Stack.Navigator>
  );
}
