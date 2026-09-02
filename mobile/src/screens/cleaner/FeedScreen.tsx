import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchOrdersFeed, acceptOrder } from '../../api/orders';
import type { Order } from '../../types';
import { colors } from '../../theme';

export default function FeedScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const load = useCallback(() => {
    return fetchOrdersFeed().then(setOrders);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().finally(() => setLoading(false));
    }, [load]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleAccept(orderId: string) {
    setAcceptingId(orderId);
    try {
      await acceptOrder(orderId);
      Alert.alert('Заказ принят', 'Он появится во вкладке «Мои заказы».');
      await load();
    } catch (e: any) {
      Alert.alert('Не удалось принять заказ', e?.response?.data?.message ?? 'Возможно, его уже взял другой исполнитель');
      await load();
    } finally {
      setAcceptingId(null);
    }
  }

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        renderItem={({ item }) => {
          const scheduled = new Date(item.scheduledAt);
          return (
            <View style={styles.card}>
              <Text style={styles.serviceName}>{item.service.name}</Text>
              <Text style={styles.meta}>{item.district} · {item.address}</Text>
              <Text style={styles.meta}>
                {scheduled.toLocaleDateString('ru-RU')} в {scheduled.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.price}>{item.price} ₽</Text>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAccept(item.id)}
                disabled={acceptingId === item.id}
              >
                <Text style={styles.acceptButtonText}>{acceptingId === item.id ? 'Принимаем…' : 'Принять заказ'}</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Пока нет доступных заказов в ваших районах. Проверьте районы обслуживания в профиле.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  serviceName: { fontSize: 16, fontWeight: '700', color: colors.primary },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  price: { fontSize: 18, fontWeight: '800', color: colors.primary, marginTop: 8 },
  acceptButton: { backgroundColor: colors.accent, borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 12 },
  acceptButtonText: { color: '#fff', fontWeight: '700' },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40, lineHeight: 20 },
});
