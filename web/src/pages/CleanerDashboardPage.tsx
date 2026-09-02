import React, { useEffect, useState } from 'react';
import { fetchMySubscription, subscribe, cancelSubscription } from '../api/subscriptions';
import { fetchOrdersFeed, fetchMyOrders, acceptOrder } from '../api/orders';
import { fetchMe, updateServiceAreas } from '../api/users';
import type { Order, Subscription } from '../types';
import { DISTRICTS } from '../types';
import OrderCard from '../components/OrderCard';

type Tab = 'feed' | 'orders' | 'profile';

export default function CleanerDashboardPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>('feed');

  async function loadSubscription() {
    setLoadingSub(true);
    try {
      const sub = await fetchMySubscription();
      setSubscription(sub);
    } finally {
      setLoadingSub(false);
    }
  }

  useEffect(() => {
    loadSubscription();
  }, []);

  async function handleSubscribe() {
    setSubscribing(true);
    setSubError(null);
    try {
      await subscribe();
      await loadSubscription();
    } catch (e: any) {
      setSubError(e?.response?.data?.message ?? 'Не удалось оформить подписку');
    } finally {
      setSubscribing(false);
    }
  }

  if (loadingSub) return <div className="container" style={{ paddingTop: 40 }}>Загрузка…</div>;

  const isActive = subscription?.status === 'ACTIVE' && new Date(subscription.currentPeriodEnd) > new Date();

  if (!isActive) {
    return (
      <div className="container" style={{ maxWidth: 480, paddingTop: 60 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Нужна подписка</h2>
          <p className="muted">
            {subscription?.status === 'PAST_DUE'
              ? 'Не удалось списать оплату за подписку — обновите способ оплаты и попробуйте снова.'
              : subscription?.status === 'CANCELED'
                ? 'Ваша подписка отменена. Оформите её снова, чтобы видеть заявки.'
                : 'Оформите подписку, чтобы видеть и принимать заявки клиентов в вашем районе.'}
          </p>
          {subscription?.plan && (
            <div className="price-total" style={{ margin: '12px 0' }}>
              {subscription.plan.price} ₽ / {subscription.plan.periodDays} дней
            </div>
          )}
          {subError && <div className="form-error">{subError}</div>}
          <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleSubscribe} disabled={subscribing}>
            {subscribing ? 'Оформляем…' : 'Оформить подписку'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="tabs">
        <button className={`tab-button ${tab === 'feed' ? 'active' : ''}`} onClick={() => setTab('feed')}>
          Лента заявок
        </button>
        <button className={`tab-button ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
          Мои заказы
        </button>
        <button className={`tab-button ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
          Профиль
        </button>
      </div>

      {tab === 'feed' && <FeedTab />}
      {tab === 'orders' && <MyOrdersTab />}
      {tab === 'profile' && <ProfileTab subscription={subscription} onCancelled={loadSubscription} />}
    </div>
  );
}

function FeedTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    return fetchOrdersFeed().then(setOrders);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handleAccept(id: string) {
    setAcceptingId(id);
    setMessage(null);
    try {
      await acceptOrder(id);
      setMessage('Заявка принята — она в разделе «Мои заказы».');
      await load();
    } catch (e: any) {
      setMessage(e?.response?.data?.message ?? 'Не удалось принять заявку — возможно, её уже взяли');
      await load();
    } finally {
      setAcceptingId(null);
    }
  }

  if (loading) return <p className="muted">Загрузка…</p>;

  return (
    <div>
      {message && <p className="muted">{message}</p>}
      {orders.length === 0 && <p className="muted">Пока нет доступных заявок в ваших районах.</p>}
      {orders.map((order) => {
        const scheduled = new Date(order.scheduledAt);
        return (
          <div key={order.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700 }}>{order.service.name}</div>
            <div className="muted">
              {order.district} · {order.address}
            </div>
            <div className="muted">
              {scheduled.toLocaleDateString('ru-RU')} в {scheduled.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="price-total" style={{ margin: '10px 0' }}>{order.price} ₽</div>
            <button className="btn btn-accent" onClick={() => handleAccept(order.id)} disabled={acceptingId === order.id}>
              {acceptingId === order.id ? 'Принимаем…' : 'Принять заявку'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function MyOrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Загрузка…</p>;
  if (orders.length === 0) return <p className="muted">Вы ещё не приняли ни одной заявки.</p>;

  return (
    <div>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} to={`/cleaner/orders/${order.id}`} />
      ))}
    </div>
  );
}

function ProfileTab({ subscription, onCancelled }: { subscription: Subscription | null; onCancelled: () => void }) {
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [ratingAvg, setRatingAvg] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchMe().then((data) => {
      if (data.cleanerProfile) {
        setServiceAreas(data.cleanerProfile.serviceAreas);
        setRatingAvg(data.cleanerProfile.ratingAvg);
        setRatingCount(data.cleanerProfile.ratingCount);
      }
    });
  }, []);

  function toggleDistrict(d: string) {
    setServiceAreas((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateServiceAreas(serviceAreas);
      setMessage('Районы сохранены.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelSubscription();
      onCancelled();
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="card">
      <div style={{ fontWeight: 700, fontSize: 18 }}>★ {ratingAvg.toFixed(1)} <span className="muted" style={{ fontWeight: 400 }}>({ratingCount} отзывов)</span></div>

      <span className="label">Районы обслуживания</span>
      <div>
        {DISTRICTS.map((d) => (
          <span key={d} className={`chip ${serviceAreas.includes(d) ? 'active' : ''}`} onClick={() => toggleDistrict(d)}>
            {d}
          </span>
        ))}
      </div>
      <button className="btn btn-outline" onClick={handleSave} disabled={saving} style={{ marginTop: 10 }}>
        {saving ? 'Сохраняем…' : 'Сохранить районы'}
      </button>

      {message && <p className="muted">{message}</p>}

      {subscription && (
        <>
          <span className="label">Подписка</span>
          <p className="muted">
            Тариф «{subscription.plan.name}», {subscription.plan.price} ₽ / {subscription.plan.periodDays} дней.
            <br />
            Действует до {new Date(subscription.currentPeriodEnd).toLocaleDateString('ru-RU')}.
          </p>
          <button className="btn-danger" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? 'Отменяем…' : 'Отменить подписку'}
          </button>
        </>
      )}
    </div>
  );
}
