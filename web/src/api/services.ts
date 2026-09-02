import { api } from './client';
import type { Service } from '../types';

export async function fetchServices(): Promise<Service[]> {
  const { data } = await api.get<Service[]>('/services');
  return data;
}
