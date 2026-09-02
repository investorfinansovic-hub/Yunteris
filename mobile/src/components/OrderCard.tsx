import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Order } from '../types';
import { ORDER_STATUS_LABELS } from '../types';
import { colors } from '../theme';

export default function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const scheduled = new Date(order.scheduledAt);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.serviceName}>{order.service.name}</Text>
        <Text style={styles.status}>{ORDER_STATUS_LABELS[order.status]}</Text>
      </View>
      <Text style={styles.meta}>{order.district} · {order.address}</Text>
      <Text style={styles.meta}>
        {scheduled.toLocaleDateString('ru-RU')} в {scheduled.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
      </Text>
      <Text style={styles.price}>{order.price} ₽</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  serviceName: { fontSize: 16, fontWeight: '700', color: colors.primary },
  status: { fontSize: 12, fontWeight: '600', color: colors.accent },
  meta: { fontSize: 13, color: colors.textMuted, marginBottom: 2 },
  price: { fontSize: 16, fontWeight: '800', color: colors.primary, marginTop: 6 },
});
