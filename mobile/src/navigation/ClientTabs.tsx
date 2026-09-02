import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import ClientHomeStack from './ClientHomeStack';
import ClientOrdersStack from './ClientOrdersStack';
import ClientProfileScreen from '../screens/client/ClientProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{symbol}</Text>;
}

export default function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
      }}
    >
      <Tab.Screen
        name="Order"
        component={ClientHomeStack}
        options={{ title: 'Заказать', tabBarIcon: ({ focused }) => <TabIcon symbol="🧽" focused={focused} /> }}
      />
      <Tab.Screen
        name="Orders"
        component={ClientOrdersStack}
        options={{ title: 'Мои заказы', tabBarIcon: ({ focused }) => <TabIcon symbol="📋" focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ClientProfileScreen}
        options={{ title: 'Профиль', tabBarIcon: ({ focused }) => <TabIcon symbol="👤" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}
