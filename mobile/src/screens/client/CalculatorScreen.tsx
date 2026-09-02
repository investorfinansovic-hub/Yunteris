import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchServices } from '../../api/services';
import { createOrder, payOrder } from '../../api/orders';
import type { Service } from '../../types';
import type { ClientHomeStackParamList } from '../../navigation/ClientHomeStack';
import { colors } from '../../theme';

type Props = NativeStackScreenProps<ClientHomeStackParamList, 'Calculator'>;

const DISTRICTS = ['Ленинский', 'Дзержинский', 'Индустриальный', 'Кировский', 'Мотовилихинский', 'Орджоникидзевский', 'Свердловский'];

export default function CalculatorScreen({ navigation }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [address, setAddress] = useState('');
  const [scheduledAt, setScheduledAt] = useState(''); // "YYYY-MM-DD HH:MM"
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServices()
      .then((data) => {
        setServices(data);
        if (data.length > 0) setSelectedServiceId(data[0].id);
      })
      .catch(() => Alert.alert('Ошибка', 'Не удалось загрузить каталог услуг. Проверьте, что backend запущен.'))
      .finally(() => setLoading(false));
  }, []);

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const optionsTotal = (selectedService?.options ?? [])
    .filter((o) => selectedOptionIds.includes(o.id))
    .reduce((sum, o) => sum + o.price, 0);
  const total = (selectedService?.basePrice ?? 0) + optionsTotal;

  function toggleOption(optionId: string) {
    setSelectedOptionIds((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]));
  }

  async function handleSubmit() {
    if (!selectedServiceId) return;
    if (!address.trim()) {
      Alert.alert('Укажите адрес');
      return;
    }
    const isoDate = new Date(scheduledAt.replace(' ', 'T'));
    if (Number.isNaN(isoDate.getTime())) {
      Alert.alert('Укажите дату и время', 'Формат: ГГГГ-ММ-ДД ЧЧ:ММ');
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        serviceId: selectedServiceId,
        optionIds: selectedOptionIds,
        address: address.trim(),
        district,
        scheduledAt: isoDate.toISOString(),
      });
      // MVP: payment is simulated immediately after order creation — a real
      // integration would open a ЮKassa checkout here and wait for its webhook.
      await payOrder(order.id);
      Alert.alert('Заказ создан', 'Ищем подходящего исполнителя рядом с вами.');
      navigation.navigate('OrderDetail', { orderId: order.id });
    } catch (e: any) {
      Alert.alert('Не удалось оформить заказ', e?.response?.data?.message ?? 'Попробуйте снова');
    } finally {
      setSubmitting(false);
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
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Рассчитать стоимость</Text>

      <Text style={styles.label}>Вид уборки</Text>
      {services.map((service) => (
        <TouchableOpacity
          key={service.id}
          style={[styles.serviceRow, selectedServiceId === service.id && styles.serviceRowActive]}
          onPress={() => setSelectedServiceId(service.id)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.serviceName}>{service.name}</Text>
            {!!service.description && <Text style={styles.serviceDesc}>{service.description}</Text>}
          </View>
          <Text style={styles.servicePrice}>от {service.basePrice} ₽</Text>
        </TouchableOpacity>
      ))}

      {!!selectedService?.options?.length && (
        <>
          <Text style={styles.label}>Дополнительно</Text>
          {selectedService.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionRow}
              onPress={() => toggleOption(option.id)}
            >
              <Text style={styles.optionCheckbox}>{selectedOptionIds.includes(option.id) ? '☑' : '☐'}</Text>
              <Text style={styles.optionName}>{option.name}</Text>
              <Text style={styles.optionPrice}>+{option.price} ₽</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <Text style={styles.label}>Район</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
        {DISTRICTS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.chip, district === d && styles.chipActive]}
            onPress={() => setDistrict(d)}
          >
            <Text style={[styles.chipText, district === d && styles.chipTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Адрес</Text>
      <TextInput style={styles.input} placeholder="Улица, дом, квартира" value={address} onChangeText={setAddress} />

      <Text style={styles.label}>Дата и время</Text>
      <TextInput
        style={styles.input}
        placeholder="ГГГГ-ММ-ДД ЧЧ:ММ, например 2026-09-05 12:00"
        value={scheduledAt}
        onChangeText={setScheduledAt}
      />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Итого</Text>
        <Text style={styles.totalValue}>{total} ₽</Text>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.submitButtonText}>{submitting ? 'Оформляем…' : 'Оплатить и заказать'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '800', color: colors.primary, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 8,
  },
  serviceRowActive: { borderColor: colors.accent, borderWidth: 2 },
  serviceName: { fontWeight: '700', color: colors.primary },
  serviceDesc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  servicePrice: { fontWeight: '700', color: colors.primary },
  optionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 6 },
  optionCheckbox: { fontSize: 18, marginRight: 10, color: colors.accent },
  optionName: { flex: 1, color: colors.primary },
  optionPrice: { color: colors.textMuted },
  chip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.primary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, backgroundColor: '#fff' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 },
  totalLabel: { fontSize: 16, color: colors.textMuted },
  totalValue: { fontSize: 24, fontWeight: '800', color: colors.primary },
  submitButton: { backgroundColor: colors.accent, borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 40 },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
