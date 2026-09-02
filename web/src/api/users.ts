import { api } from './client';
import type { AuthUser, CleanerProfile } from '../types';

export interface MeResponse extends AuthUser {
  cleanerProfile: CleanerProfile | null;
}

export async function fetchMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/users/me');
  return data;
}

export async function updateServiceAreas(serviceAreas: string[]) {
  const { data } = await api.patch('/users/me/service-areas', { serviceAreas });
  return data;
}
