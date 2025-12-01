import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
});

// Récupère les tokens depuis localStorage
function getTokens() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  return { accessToken, refreshToken };
}

// Intercepteur pour ajouter le Bearer token
api.interceptors.request.use((config) => {
  const { accessToken } = getTokens();
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Pour éviter plusieurs refresh en parallèle
let isRefreshing = false;
let pendingRequests: ((token: string | null) => void)[] = [];

// Intercepteur pour gérer les 401 et utiliser /auth/refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si pas de réponse (network error) -> on renvoie l'erreur direct
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // On ne tente pas de refresh sur login/refresh eux-mêmes
    const url: string = originalRequest?.url || '';
    const isAuthRoute =
      url.includes('/auth/login') || url.includes('/auth/refresh');

    // Si ce n'est pas une 401 OU si on est déjà en retry OU route auth -> on renvoie l'erreur
    if (status !== 401 || originalRequest._retry || isAuthRoute) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const { refreshToken } = getTokens();
    if (!refreshToken) {
      // pas de refresh → on renvoie l'erreur et on laisse l'app gérer le logout
      return Promise.reject(error);
    }

    // Si un refresh est déjà en cours, on met la requête en attente
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push((newToken) => {
          if (!newToken) {
            return reject(error);
          }
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    // Sinon, on lance un refresh
    isRefreshing = true;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/refresh`,
        { refreshToken },
      );

      const newAccess = res.data.accessToken as string;
      const newRefresh = res.data.refreshToken as string;

      localStorage.setItem('accessToken', newAccess);
      localStorage.setItem('refreshToken', newRefresh);

      // On rejoue les requêtes en attente
      pendingRequests.forEach((cb) => cb(newAccess));
      pendingRequests = [];
      isRefreshing = false;

      // On rejoue la requête originale
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (e) {
      // refresh ko → on nettoie les tokens + on réveille les requêtes en échec
      pendingRequests.forEach((cb) => cb(null));
      pendingRequests = [];
      isRefreshing = false;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      return Promise.reject(e);
    }
  },
);

export default api;
