import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: point this at your deployed backend URL before building for real
// devices — localhost only works in a simulator running on the same machine.
export const API_BASE_URL = 'http://localhost:3000';

export const TOKEN_STORAGE_KEY = 'cleanmarket_token';

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
