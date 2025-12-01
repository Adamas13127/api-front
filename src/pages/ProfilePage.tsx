import React from 'react';
import { useAuth } from '../auth/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <section className="page">
      <div className="card">
        <div className="card-header">
          <h1 className="page-title">Mon profil</h1>
          <p className="text-muted">Informations liées à ta session actuelle.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
          <div>
            <span className="label">Email</span>
            <div className="product-name" style={{ fontWeight: 500 }}>
              {user.email}
            </div>
          </div>
          <div>
            <span className="label">Rôle</span>
            <div style={{ marginTop: 6 }}>
              <span className={`role-badge ${isAdmin ? 'role-badge--admin' : ''}`}>
                {isAdmin ? 'ADMIN' : 'USER'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
