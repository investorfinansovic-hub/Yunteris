import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { fetchOrder, disputeOrder, submitReview } from '../../api/orders';
import type { Order } from '../../types';
import { ORDER_STATUS_LABELS } from '../../types';
import { colors } from '../../theme';

type ParamList = { OrderDetail: { orderId: string } };

export default function OrderDetailScreen({ route }: { route: RouteProp<ParamList, 'OrderDetail'> }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSent, setReviewSent] = useState(false);

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

  async function handleDispute() {
    try {
      const updated = await disputeOrder(orderId);
      setOrder(updated);
      Alert.alert('Спор открыт', 'Мы свяжемся с вами для разбора ситуации.');
    } catch (e: any) {
      Alert.alert('Не удалось открыть спор', e?.response?.data?.message ?? '');
    }
  }

  async function handleReview() {
    try {
      await submitReview(orderId, rating, comment.trim() || undefined);
      setReviewSent(true);
      Alert.alert('Спасибо!', 'Ваш отзыв сохранён.');
    } catch (e: any) {
      Alert.alert('Не удалось отправить отзыв', e?.response?.data?.message ?? '');
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

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{ORDER_STATUS_LABELS[order.status]}</Text>
      <Text style={styles.serviceName}>{order.service.name}</Text>
      <Text style={styles.meta}>{order.district} · {order.address}</Text>
      <Text style={styles.meta}>
        {scheduled.toLocaleDateString('ru-RU')} в {scheduled.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
      </Text>
      <Text style={styles.price}>{order.price} ₽</Text>

      {order.cleaner && (
        <View style={styles.cleanerBox}>
          <Text style={styles.cleanerLabel}>Исполнитель</Text>
          <Text style={styles.cleanerName}>{order.cleaner.name}</Text>
        </View>
      )}

      {order.status === 'SEARCHING' && (
        <Text style={styles.hint}>Подбираем проверенного исполнителя рядом с вами — обычно это занимает до 2 часов.</Text>
      )}

      {order.status === 'COMPLETED' && !reviewSent && (
        <View style={styles.reviewBox}>
          <Text style={styles.reviewTitle}>Как вам уборка?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setRating(n)}>
                <Text style={[styles.star, n <= rating && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.input} placeholder="Комментарий (необязательно)" value={comment} onChangeText={setComment} />
          <TouchableOpacity style={styles.primaryButton} onPress={handleReview}>
            <Text style={styles.primaryButtonText}>Оставить отзыв</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleDispute}>
            <Text style={styles.secondaryButtonText}>Не понравилось — открыть спор</Text>
          </TouchableOpacity>
        </View>
      )}

      {order.status === 'DISPUTED' && (
        <Text style={styles.hint}>Спор открыт. По гарантии сервиса мы переделаем уборку или вернём деньги — с вами свяжется поддержка.</Text>
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
  cleanerBox: { marginTop: 20, backgroundColor: '#fff', borderRadius: 12, padding: 14 },
  cleanerLabel: { fontSize: 12, color: colors.textMuted, textTransform: 'uppercase' },
  cleanerName: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 4 },
  hint: { marginTop: 20, color: colors.textMuted, lineHeight: 20 },
  reviewBox: { marginTop: 24, backgroundColor: '#fff', borderRadius: 14, padding: 16 },
  reviewTitle: { fontWeight: '700', color: colors.primary, marginBottom: 10 },
  starsRow: { flexDirection: 'row', marginBottom: 12 },
  star: { fontSize: 28, color: colors.border, marginRight: 6 },
  starActive: { color: colors.accent },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 12 },
  primaryButton: { backgroundColor: colors.accent, borderRadius: 12, padding: 14, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { padding: 12, alignItems: 'center', marginTop: 6 },
  secondaryButtonText: { color: colors.danger, fontWeight: '600' },
});
