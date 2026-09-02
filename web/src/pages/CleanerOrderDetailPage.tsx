import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchOrder, updateOrderStatus } from '../api/orders';
import type { Order, OrderStatus } from '../types';
import { ORDER_STATUS_LABELS } from '../types';

const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' }>> = {
  ASSIGNED: { label: 'Я выехал', next: 'EN_ROUTE' },
  EN_ROUTE: { label: 'Приступил к уборке', next: 'IN_PROGRESS' },
  IN_PROGRESS: { label: 'Завершить уборку', next: 'COMPLETED' },
};

export default function CleanerOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (orderId) fetchOrder(orderId).then(setOrder);
  }

  useEffect(load, [orderId]);

  async function handleAdvance() {
    if (!order || !orderId) return;
    const action = NEXT_ACTION[order.status];
    if (!action) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await updateOrderStatus(orderId, action.next);
      setOrder(updated);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Не удалось обновить статус');
    } finally {
      setUpdating(false);
    }
  }

  if (!order) return <div className="container" style={{ paddingTop: 40 }}>Загрузка…</div>;

  const scheduled = new Date(order.scheduledAt);
  const action = NEXT_ACTION[order.status];

  return (
    <div className="container" style={{ maxWidth: 560, paddingTop: 40, paddingBottom: 60 }}>
      <span className="status-pill">{ORDER_STATUS_LABELS[order.status]}</span>
      <h2 style={{ marginBottom: 4 }}>{order.service.name}</h2>
      <p className="muted" style={{ margin: 0 }}>
        {order.district} · {order.address}
      </p>
      <p className="muted" style={{ marginTop: 4 }}>
        {scheduled.toLocaleDateString('ru-RU')} в {scheduled.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
      </p>
      <div className="price-total" style={{ margin: '16px 0' }}>{order.price} ₽</div>

      {order.client && (
        <div className="card" style={{ marginBottom: 20 }}>
          <span className="label" style={{ margin: 0 }}>Заказчик</span>
          <div style={{ fontWeight: 700 }}>{order.client.name}</div>
          <div className="muted">{order.client.phone}</div>
        </div>
      )}

      {error && <div className="form-error">{error}</div>}

      {action && (
        <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleAdvance} disabled={updating}>
          {updating ? 'Обновляем…' : action.label}
        </button>
      )}

      {order.status === 'COMPLETED' && <p className="muted">Заказ завершён.</p>}
    </div>
  );
}
