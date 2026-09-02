import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { colors } from '../../theme';

const DISTRICTS = ['Ленинский', 'Дзержинский', 'Индустриальный', 'Кировский', 'Мотовилихинский', 'Орджоникидзевский', 'Свердловский'];

interface CleanerProfileResponse {
  cleanerProfile: { verified: boolean; ratingAvg: number; ratingCount: number; serviceAreas: string[] } | null;
}

export default function CleanerProfileScreen() {
  const { user, logout } = useAuth();
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [ratingAvg, setRatingAvg] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      api.get<CleanerProfileResponse>('/users/me').then(({ data }) => {
        if (data.cleanerProfile) {
          setServiceAreas(data.cleanerProfile.serviceAreas);
          setRatingAvg(data.cleanerProfile.ratingAvg);
          setRatingCount(data.cleanerProfile.ratingCount);
        }
      });
    }, []),
  );

  function toggleDistrict(district: string) {
    setServiceAreas((prev) => (prev.includes(district) ? prev.filter((d) => d !== district) : [...prev, district]));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch('/users/me/service-areas', { serviceAreas });
      Alert.alert('Сохранено', 'Районы обслуживания обновлены.');
    } catch {
      Alert.alert('Не удалось сохранить', 'Попробуйте снова');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.role}>Исполнитель · ★ {ratingAvg.toFixed(1)} ({ratingCount})</Text>

      <Text style={styles.label}>Районы обслуживания</Text>
      <View style={styles.chipsWrap}>
        {DISTRICTS.map((d) => (
          <TouchableOpacity key={d} style={[styles.chip, serviceAreas.includes(d) && styles.chipActive]} onPress={() => toggleDistrict(d)}>
            <Text style={[styles.chipText, serviceAreas.includes(d) && styles.chipTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Сохраняем…' : 'Сохранить районы'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Выйти</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  name: { fontSize: 24, fontWeight: '800', color: colors.primary },
  role: { color: colors.textMuted, marginTop: 4, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 10, textTransform: 'uppercase' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.primary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  saveButton: { backgroundColor: colors.accent, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 32 },
  saveButtonText: { color: '#fff', fontWeight: '700' },
  logoutButton: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  logoutText: { color: colors.danger, fontWeight: '700' },
});
