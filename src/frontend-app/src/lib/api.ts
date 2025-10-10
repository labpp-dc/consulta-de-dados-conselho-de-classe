import axios, { type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

// Cria uma instância global do axios para API backend na porta 3000
const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // Útil para CORS com cookies/sessão
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para adicionar automaticamente o token Bearer
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('auth_token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas 401 (token expirado)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Token inválido ou expirado, remover do sessionStorage
      sessionStorage.removeItem('auth_token');
      // Redirecionar para login se não estiver na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
