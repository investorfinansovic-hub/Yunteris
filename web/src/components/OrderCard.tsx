import React from 'react';
import { Link } from 'react-router-dom';
import type { Order } from '../types';
import { ORDER_STATUS_LABELS } from '../types';

function formatScheduled(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('ru-RU')} в ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function OrderCard({ order, to }: { order: Order; to: string }) {
  return (
    <Link to={to} className="order-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <strong>{order.service.name}</strong>
        <span className="status-pill">{ORDER_STATUS_LABELS[order.status]}</span>
      </div>
      <div className="muted stack">
        <span>
          {order.district} · {order.address}
        </span>
        <span>{formatScheduled(order.scheduledAt)}</span>
      </div>
      <div style={{ fontWeight: 800, marginTop: 8 }}>{order.price} ₽</div>
    </Link>
  );
}
