import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrdersHistoryScreen from '../screens/client/OrdersHistoryScreen';
import OrderDetailScreen from '../screens/client/OrderDetailScreen';
import { colors } from '../theme';

export type ClientOrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: { orderId: string };
};

const Stack = createNativeStackNavigator<ClientOrdersStackParamList>();

export default function ClientOrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
      <Stack.Screen name="OrdersList" component={OrdersHistoryScreen} options={{ title: 'Мои заказы' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Заказ' }} />
    </Stack.Navigator>
  );
}
