import axios from 'axios';

export const api = axios.create({ baseURL: '/api/v1' });

// Перехватчик запроса: подставляет JWT в каждый запрос.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Перехватчик ответа: при 401 (токен протух/недействителен) — выходим и уводим на вход.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const onLoginPage = window.location.pathname.startsWith('/auth/');
    if (status === 401 && !onLoginPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.assign('/auth/login');
    }
    return Promise.reject(error);
  },
);
