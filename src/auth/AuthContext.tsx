import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

type User = {
  userId: number;
  email: string;
  role: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Au chargement, on essaie de réhydrater depuis localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    if (savedUser && accessToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }

    if (!accessToken) {
      setLoading(false);
      return;
    }

    // On vérifie que le token est toujours valide (et ça peut déclencher un refresh via l'interceptor)
    api
      .get('/auth/profile')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    // 1) Login → récupère tokens + user
    const res = await api.post('/auth/login', { email, password });
  
    const { accessToken, refreshToken, user } = res.data;
  
    // 2) Stocker les tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  
    // 3) Stocker l'user (celui renvoyé par le backend)
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };
  

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
