import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CalculatorScreen from '../screens/client/CalculatorScreen';
import OrderDetailScreen from '../screens/client/OrderDetailScreen';
import { colors } from '../theme';

export type ClientHomeStackParamList = {
  Calculator: undefined;
  OrderDetail: { orderId: string };
};

const Stack = createNativeStackNavigator<ClientHomeStackParamList>();

export default function ClientHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
      <Stack.Screen name="Calculator" component={CalculatorScreen} options={{ title: 'Заказать уборку' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Заказ' }} />
    </Stack.Navigator>
  );
}
