import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ClientOrdersPage from './pages/ClientOrdersPage';
import ClientOrderDetailPage from './pages/ClientOrderDetailPage';
import CleanerLandingPage from './pages/CleanerLandingPage';
import CleanerDashboardPage from './pages/CleanerDashboardPage';
import CleanerOrderDetailPage from './pages/CleanerOrderDetailPage';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute role="CLIENT">
              <ClientOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/orders/:orderId"
          element={
            <ProtectedRoute role="CLIENT">
              <ClientOrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/cleaner" element={<CleanerLandingPage />} />
        <Route
          path="/cleaner/dashboard"
          element={
            <ProtectedRoute role="CLEANER">
              <CleanerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cleaner/orders/:orderId"
          element={
            <ProtectedRoute role="CLEANER">
              <CleanerOrderDetailPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <footer className="footer">ЧистоМаркет · Пермь</footer>
    </>
  );
}
