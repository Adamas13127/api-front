import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ProductsPage from './pages/ProductsPage';

const App: React.FC = () => {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Chargement...</div>;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/" className="app-brand">
              Shop Admin
            </Link>
            <nav className="nav-links">
              <Link to="/" className="nav-link">
                Produits
              </Link>
              {user && (
                <Link to="/profile" className="nav-link">
                  Profil
                </Link>
              )}
            </nav>
          </div>
          <div className="header-right">
            {user ? (
              <>
                <div className="user-summary">
                  <span className="user-email">{user.email}</span>
                  <span
                    className={`role-badge ${
                      user.role === 'admin' ? 'role-badge--admin' : ''
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <button className="btn btn-secondary" onClick={logout}>
                  Se déconnecter
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route
              path="/login"
              element={user ? <Navigate to="/" /> : <LoginPage />}
            />
            <Route
              path="/profile"
              element={user ? <ProfilePage /> : <Navigate to="/login" />}
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;
