import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchMyOrders } from '../../api/orders';
import type { Order } from '../../types';
import OrderCard from '../../components/OrderCard';
import type { ClientOrdersStackParamList } from '../../navigation/ClientOrdersStack';
import { colors } from '../../theme';

type Props = NativeStackScreenProps<ClientOrdersStackParamList, 'OrdersList'>;

export default function OrdersHistoryScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchMyOrders()
        .then(setOrders)
        .finally(() => setLoading(false));
    }, []),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Заказов пока нет — оформите первый на вкладке «Заказать».</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
