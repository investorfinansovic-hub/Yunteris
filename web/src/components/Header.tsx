import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          ЧистоМаркет
          <div className="brand-sub">Пермь</div>
        </Link>
        <nav className="nav-links">
          {!user && (
            <>
              <Link className="nav-link" to="/cleaner">
                Исполнителям
              </Link>
              <Link className="nav-link" to="/login">
                Войти
              </Link>
            </>
          )}
          {user?.role === 'CLIENT' && (
            <>
              <Link className="nav-link" to="/account">
                Мои заявки
              </Link>
              <button className="btn-danger" onClick={handleLogout}>
                Выйти
              </button>
            </>
          )}
          {user?.role === 'CLEANER' && (
            <>
              <Link className="nav-link" to="/cleaner/dashboard">
                Кабинет исполнителя
              </Link>
              <button className="btn-danger" onClick={handleLogout}>
                Выйти
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
