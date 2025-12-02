import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin1@test.com');
  const [password, setPassword] = useState('Admin!123');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      nav('/products');
    } catch (err: any) {
      console.log('LOGIN ERROR ===>', err.response?.data || err.message || err);
      setError('Impossible de te connecter. Vérifie les identifiants.');
    }
  };

  return (
    <section className="page page-centered">
      <div className="card card-compact">
        <h1 className="page-title">Connexion</h1>
        <p className="text-muted" style={{ marginTop: 8, marginBottom: 24 }}>
          Accède au dashboard avec ton compte existant.
        </p>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@test.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="login-password">
              Mot de passe
            </label>
            <input
              id="login-password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="error-box">{error}</div>}
          <button className="btn btn-primary" type="submit">
            Se connecter
          </button>
        </form>
      </div>
    </section>
  );
};

export default LoginPage;
