import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchOrder, submitReview } from '../api/orders';
import type { Order } from '../types';
import { ORDER_STATUS_LABELS } from '../types';

export default function ClientOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSent, setReviewSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) fetchOrder(orderId).then(setOrder);
  }, [orderId]);

  async function handleReview() {
    if (!orderId) return;
    try {
      await submitReview(orderId, rating, comment.trim() || undefined);
      setReviewSent(true);
      setMessage('Спасибо за отзыв!');
    } catch (e: any) {
      setMessage(e?.response?.data?.message ?? 'Не удалось отправить отзыв');
    }
  }

  if (!order) return <div className="container" style={{ paddingTop: 40 }}>Загрузка…</div>;

  const scheduled = new Date(order.scheduledAt);

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

      {order.cleaner && (
        <div className="card" style={{ marginBottom: 20 }}>
          <span className="label" style={{ margin: 0 }}>Исполнитель</span>
          <div style={{ fontWeight: 700 }}>{order.cleaner.name}</div>
          <div className="muted">{order.cleaner.phone}</div>
        </div>
      )}

      {order.status === 'SEARCHING' && (
        <p className="muted">Заявка отправлена подходящим исполнителям в вашем районе — они свяжутся с вами напрямую.</p>
      )}

      {order.status === 'COMPLETED' && !reviewSent && (
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Как вам уборка?</div>
          <div style={{ marginBottom: 12 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                onClick={() => setRating(n)}
                style={{ fontSize: 26, cursor: 'pointer', color: n <= rating ? 'var(--accent)' : 'var(--border)' }}
              >
                ★
              </span>
            ))}
          </div>
          <input className="input" style={{ marginBottom: 12 }} placeholder="Комментарий (необязательно)" value={comment} onChange={(e) => setComment(e.target.value)} />
          <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleReview}>
            Оставить отзыв
          </button>
        </div>
      )}

      {message && <p className="muted" style={{ marginTop: 16 }}>{message}</p>}
    </div>
  );
}
