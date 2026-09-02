import { api } from './client';
import type { Subscription, SubscriptionPlan } from '../types';

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data } = await api.get<SubscriptionPlan[]>('/subscription-plans');
  return data;
}

export async function fetchMySubscription(): Promise<Subscription | null> {
  const { data } = await api.get<Subscription | null>('/subscriptions/me');
  return data;
}

export async function subscribe(): Promise<Subscription> {
  const { data } = await api.post<Subscription>('/subscriptions/subscribe');
  return data;
}

export async function cancelSubscription(): Promise<Subscription> {
  const { data } = await api.post<Subscription>('/subscriptions/cancel');
  return data;
}
