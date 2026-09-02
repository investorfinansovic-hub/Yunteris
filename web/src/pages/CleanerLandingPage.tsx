import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchSubscriptionPlans } from '../api/subscriptions';
import type { SubscriptionPlan } from '../types';

type AuthMode = 'login' | 'register';

export default function CleanerLandingPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [authMode, setAuthMode] = useState<AuthMode>('register');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubscriptionPlans().then(setPlans);
  }, []);

  useEffect(() => {
    if (user?.role === 'CLEANER') navigate('/cleaner/dashboard');
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (authMode === 'register') {
        await register(phone.trim(), password, name.trim(), 'CLEANER');
      } else {
        await login(phone.trim(), password);
      }
      navigate('/cleaner/dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Не удалось войти. Проверьте данные.');
    } finally {
      setSubmitting(false);
    }
  }

  const plan = plans[0];

  return (
    <div className="container">
      <section className="hero">
        <div className="eyebrow">Для клининговых бригад и частных клинеров</div>
        <h1>
          Заявки на уборку <span className="highlight">каждый день.</span>
        </h1>
        <p className="muted" style={{ maxWidth: 560 }}>
          Подключитесь по абонентской плате — и получайте заявки клиентов из своего района напрямую в личный
          кабинет. Никаких комиссий с заказа, только фиксированная подписка.
        </p>
      </section>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Как это работает</h3>
          <ol className="muted" style={{ paddingLeft: 18, lineHeight: 1.8 }}>
            <li>Регистрируетесь и оформляете подписку.</li>
            <li>Указываете районы, где готовы работать.</li>
            <li>Видите новые заявки клиентов в реальном времени и принимаете подходящие.</li>
            <li>Договариваетесь с клиентом и получаете оплату напрямую — платформа не берёт комиссию с заказа.</li>
          </ol>
          {plan && (
            <div style={{ marginTop: 20 }}>
              <span className="label" style={{ margin: 0 }}>Тариф</span>
              <div className="price-total">
                {plan.price} ₽<span className="muted" style={{ fontSize: 16, fontWeight: 400 }}> / {plan.periodDays} дней</span>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="tabs">
            <button type="button" className={`tab-button ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>
              Подключиться
            </button>
            <button type="button" className={`tab-button ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>
              Уже подключён
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {authMode === 'register' && (
              <input className="input" style={{ marginBottom: 10 }} placeholder="Имя или название бригады" value={name} onChange={(e) => setName(e.target.value)} required />
            )}
            <input className="input" style={{ marginBottom: 10 }} placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <input
              className="input"
              style={{ marginBottom: 10 }}
              placeholder="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <div className="form-error">{error}</div>}
            <button className="btn btn-accent" style={{ width: '100%', marginTop: 10 }} disabled={submitting}>
              {submitting ? 'Отправляем…' : authMode === 'register' ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
