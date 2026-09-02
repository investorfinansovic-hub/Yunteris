import React, { useEffect, useState } from 'react';
import { fetchMyOrders } from '../api/orders';
import type { Order } from '../types';
import OrderCard from '../components/OrderCard';

export default function ClientOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <h2>Мои заявки</h2>
      {loading && <p className="muted">Загрузка…</p>}
      {!loading && orders.length === 0 && <p className="muted">Заявок пока нет — оставьте первую на главной странице.</p>}
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} to={`/account/orders/${order.id}`} />
      ))}
    </div>
  );
}
