import axios from 'axios';

export const api = axios.create({ baseURL: '/api/v1' });

// Перехватчик: подставляет JWT в каждый запрос.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
