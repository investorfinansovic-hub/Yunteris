import { api } from './client';
import type { Order, OrderStatus } from '../types';

export interface CreateOrderPayload {
  serviceId: string;
  optionIds: string[];
  address: string;
  district: string;
  scheduledAt: string;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post<Order>('/orders', payload);
  return data;
}

export async function payOrder(orderId: string): Promise<Order> {
  const { data } = await api.post<Order>(`/orders/${orderId}/pay`);
  return data;
}

export async function fetchMyOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>('/orders/mine');
  return data;
}

export async function fetchOrder(orderId: string): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${orderId}`);
  return data;
}

export async function fetchOrdersFeed(): Promise<Order[]> {
  const { data } = await api.get<Order[]>('/orders/feed');
  return data;
}

export async function acceptOrder(orderId: string): Promise<Order> {
  const { data } = await api.post<Order>(`/orders/${orderId}/accept`);
  return data;
}

export async function updateOrderStatus(
  orderId: string,
  status: Extract<OrderStatus, 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED'>,
): Promise<Order> {
  const { data } = await api.patch<Order>(`/orders/${orderId}/status`, { status });
  return data;
}

export async function disputeOrder(orderId: string): Promise<Order> {
  const { data } = await api.post<Order>(`/orders/${orderId}/dispute`);
  return data;
}

export async function submitReview(orderId: string, rating: number, comment?: string) {
  const { data } = await api.post(`/orders/${orderId}/review`, { rating, comment });
  return data;
}
