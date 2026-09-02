import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { fetchOrder, updateOrderStatus } from '../../api/orders';
import type { Order, OrderStatus } from '../../types';
import { ORDER_STATUS_LABELS } from '../../types';
import { colors } from '../../theme';

type ParamList = { CleanerOrderDetail: { orderId: string } };

const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' }>> = {
  ASSIGNED: { label: 'Я выехал', next: 'EN_ROUTE' },
  EN_ROUTE: { label: 'Приступил к уборке', next: 'IN_PROGRESS' },
  IN_PROGRESS: { label: 'Завершить уборку', next: 'COMPLETED' },
};

export default function CleanerOrderDetailScreen({ route }: { route: RouteProp<ParamList, 'CleanerOrderDetail'> }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(() => {
    fetchOrder(orderId)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleAdvance() {
    if (!order) return;
    const action = NEXT_ACTION[order.status];
    if (!action) return;
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(orderId, action.next);
      setOrder(updated);
      if (action.next === 'COMPLETED') {
        Alert.alert('Заказ завершён', 'Оплата будет переведена вам после подтверждения клиента.');
      }
    } catch (e: any) {
      Alert.alert('Не удалось обновить статус', e?.response?.data?.message ?? '');
    } finally {
      setUpdating(false);
    }
  }

  if (loading || !order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const scheduled = new Date(order.scheduledAt);
  const action = NEXT_ACTION[order.status];

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{ORDER_STATUS_LABELS[order.status]}</Text>
      <Text style={styles.serviceName}>{order.service.name}</Text>
      <Text style={styles.meta}>{order.district} · {order.address}</Text>
      <Text style={styles.meta}>
        {scheduled.toLocaleDateString('ru-RU')} в {scheduled.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
      </Text>
      <Text style={styles.price}>{order.price} ₽</Text>

      {order.client && (
        <View style={styles.clientBox}>
          <Text style={styles.clientLabel}>Заказчик</Text>
          <Text style={styles.clientName}>{order.client.name}</Text>
          <Text style={styles.clientPhone}>{order.client.phone}</Text>
        </View>
      )}

      {action && (
        <TouchableOpacity style={styles.actionButton} onPress={handleAdvance} disabled={updating}>
          <Text style={styles.actionButtonText}>{updating ? 'Обновляем…' : action.label}</Text>
        </TouchableOpacity>
      )}

      {order.status === 'COMPLETED' && (
        <Text style={styles.hint}>Заказ завершён. Оплата переведена вам на счёт.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  status: { color: colors.accent, fontWeight: '700', marginBottom: 4 },
  serviceName: { fontSize: 22, fontWeight: '800', color: colors.primary },
  meta: { color: colors.textMuted, marginTop: 4 },
  price: { fontSize: 24, fontWeight: '800', color: colors.primary, marginTop: 12 },
  clientBox: { marginTop: 20, backgroundColor: '#fff', borderRadius: 12, padding: 14 },
  clientLabel: { fontSize: 12, color: colors.textMuted, textTransform: 'uppercase' },
  clientName: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 4 },
  clientPhone: { color: colors.textMuted, marginTop: 2 },
  actionButton: { backgroundColor: colors.accent, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24 },
  actionButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  hint: { marginTop: 20, color: colors.textMuted, lineHeight: 20 },
});
