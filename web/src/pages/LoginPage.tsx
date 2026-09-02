import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(phone.trim(), password);
      navigate(user.role === 'CLEANER' ? '/cleaner/dashboard' : '/account');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Неверный телефон или пароль');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: 60 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Вход</h2>
        <form onSubmit={handleSubmit}>
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
            {submitting ? 'Входим…' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
