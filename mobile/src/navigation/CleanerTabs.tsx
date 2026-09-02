import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import CleanerFeedStack from './CleanerFeedStack';
import CleanerOrdersStack from './CleanerOrdersStack';
import CleanerProfileScreen from '../screens/cleaner/CleanerProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{symbol}</Text>;
}

export default function CleanerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary }}>
      <Tab.Screen
        name="Feed"
        component={CleanerFeedStack}
        options={{ title: 'Лента', tabBarIcon: ({ focused }) => <TabIcon symbol="📥" focused={focused} /> }}
      />
      <Tab.Screen
        name="MyOrders"
        component={CleanerOrdersStack}
        options={{ title: 'Мои заказы', tabBarIcon: ({ focused }) => <TabIcon symbol="🧹" focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={CleanerProfileScreen}
        options={{ title: 'Профиль', tabBarIcon: ({ focused }) => <TabIcon symbol="👤" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}
