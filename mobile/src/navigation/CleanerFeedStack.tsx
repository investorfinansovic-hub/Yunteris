import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FeedScreen from '../screens/cleaner/FeedScreen';
import { colors } from '../theme';

export type CleanerFeedStackParamList = {
  Feed: undefined;
};

const Stack = createNativeStackNavigator<CleanerFeedStackParamList>();

export default function CleanerFeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
      <Stack.Screen name="Feed" component={FeedScreen} options={{ title: 'Лента заказов' }} />
    </Stack.Navigator>
  );
}
