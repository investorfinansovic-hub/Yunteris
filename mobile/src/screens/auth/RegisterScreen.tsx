import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../navigation/AuthStack';
import type { Role } from '../../types';
import { colors } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('CLIENT');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await register(phone.trim(), password, name.trim(), role);
    } catch (e: any) {
      Alert.alert('Не удалось зарегистрироваться', e?.response?.data?.message ?? 'Попробуйте снова');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация</Text>

      <View style={styles.roleSwitch}>
        <TouchableOpacity
          style={[styles.roleButton, role === 'CLIENT' && styles.roleButtonActive]}
          onPress={() => setRole('CLIENT')}
        >
          <Text style={[styles.roleButtonText, role === 'CLIENT' && styles.roleButtonTextActive]}>
            Я заказчик
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === 'CLEANER' && styles.roleButtonActive]}
          onPress={() => setRole('CLEANER')}
        >
          <Text style={[styles.roleButtonText, role === 'CLEANER' && styles.roleButtonTextActive]}>
            Я исполнитель
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput style={styles.input} placeholder="Имя" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Телефон"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль (минимум 6 символов)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Создаём…' : 'Зарегистрироваться'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Уже есть аккаунт? Войти</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '800', color: colors.primary, textAlign: 'center', marginBottom: 24 },
  roleSwitch: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#fff', borderRadius: 12, padding: 4 },
  roleButton: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  roleButtonActive: { backgroundColor: colors.primary },
  roleButtonText: { color: colors.primary, fontWeight: '600' },
  roleButtonTextActive: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: { backgroundColor: colors.accent, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: colors.primary, textAlign: 'center', marginTop: 16 },
});
