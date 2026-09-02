import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchServices } from '../api/services';
import { createOrder } from '../api/orders';
import type { Service } from '../types';
import { DISTRICTS } from '../types';

type AuthMode = 'login' | 'register';

export default function LandingPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [address, setAddress] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('register');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices().then((data) => {
      setServices(data);
      if (data.length > 0) setSelectedServiceId(data[0].id);
    });
  }, []);

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const optionsTotal = (selectedService?.options ?? [])
    .filter((o) => selectedOptionIds.includes(o.id))
    .reduce((sum, o) => sum + o.price, 0);
  const total = (selectedService?.basePrice ?? 0) + optionsTotal;

  function toggleOption(optionId: string) {
    setSelectedOptionIds((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]));
  }

  function validate(): string | null {
    if (!selectedServiceId) return 'Выберите вид уборки';
    if (!address.trim()) return 'Укажите адрес';
    const date = new Date(scheduledAt);
    if (Number.isNaN(date.getTime())) return 'Укажите дату и время в формате ГГГГ-ММ-ДД ЧЧ:ММ';
    return null;
  }

  async function submitOrder() {
    setSubmitting(true);
    setError(null);
    try {
      const order = await createOrder({
        serviceId: selectedServiceId!,
        optionIds: selectedOptionIds,
        address: address.trim(),
        district,
        scheduledAt: new Date(scheduledAt.replace(' ', 'T')).toISOString(),
      });
      navigate(`/account/orders/${order.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Не удалось отправить заявку. Попробуйте снова.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestClick() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    if (user?.role === 'CLIENT') {
      await submitOrder();
      return;
    }
    if (user?.role === 'CLEANER') {
      setError('Вы вошли как исполнитель. Чтобы оставить заявку клиента, выйдите и войдите как заказчик.');
      return;
    }
    setShowAuth(true);
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (authMode === 'register') {
        await register(phone.trim(), password, name.trim(), 'CLIENT');
      } else {
        await login(phone.trim(), password);
      }
      await submitOrder();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Не удалось войти. Проверьте данные.');
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <section className="hero">
        <div className="eyebrow">Маркетплейс клининга · Пермь</div>
        <h1>
          Идеальная чистота дома. <span className="highlight">Без вас.</span>
        </h1>
        <p className="muted" style={{ maxWidth: 560 }}>
          Оставьте заявку — её сразу увидят проверенные исполнители в вашем районе. Свяжутся с вами напрямую и
          согласуют время.
        </p>
      </section>

      <div className="grid-2">
        <div className="card">
          <span className="label">Вид уборки</span>
          {services.map((service) => (
            <div
              key={service.id}
              className={`service-option ${selectedServiceId === service.id ? 'active' : ''}`}
              onClick={() => setSelectedServiceId(service.id)}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{service.name}</div>
                {service.description && <div className="muted" style={{ fontSize: 13 }}>{service.description}</div>}
              </div>
              <div style={{ fontWeight: 700 }}>от {service.basePrice} ₽</div>
            </div>
          ))}

          {!!selectedService?.options?.length && (
            <>
              <span className="label">Дополнительно</span>
              {selectedService.options.map((option) => (
                <div key={option.id} className="service-option" onClick={() => toggleOption(option.id)}>
                  <div>
                    <span style={{ marginRight: 10 }}>{selectedOptionIds.includes(option.id) ? '☑' : '☐'}</span>
                    {option.name}
                  </div>
                  <div className="muted">+{option.price} ₽</div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="card">
          <span className="label">Район</span>
          <div>
            {DISTRICTS.map((d) => (
              <span key={d} className={`chip ${district === d ? 'active' : ''}`} onClick={() => setDistrict(d)}>
                {d}
              </span>
            ))}
          </div>

          <span className="label">Адрес</span>
          <input className="input" placeholder="Улица, дом, квартира" value={address} onChange={(e) => setAddress(e.target.value)} />

          <span className="label">Дата и время</span>
          <input
            className="input"
            placeholder="2026-09-05 12:00"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 16px' }}>
            <span className="muted">Итого</span>
            <span className="price-total">{total} ₽</span>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleRequestClick} disabled={submitting}>
            {submitting ? 'Отправляем…' : 'Оставить заявку'}
          </button>

          {showAuth && !user && (
            <form onSubmit={handleAuthSubmit} style={{ marginTop: 20 }}>
              <div className="tabs">
                <button type="button" className={`tab-button ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>
                  Новый клиент
                </button>
                <button type="button" className={`tab-button ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>
                  Уже есть аккаунт
                </button>
              </div>

              {authMode === 'register' && (
                <input className="input" style={{ marginBottom: 10 }} placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} required />
              )}
              <input
                className="input"
                style={{ marginBottom: 10 }}
                placeholder="Телефон"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <input
                className="input"
                style={{ marginBottom: 10 }}
                placeholder="Пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button className="btn btn-accent" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Отправляем…' : authMode === 'register' ? 'Зарегистрироваться и отправить' : 'Войти и отправить'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
