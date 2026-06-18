import { defineStore } from 'pinia';
import { api } from '../services/api';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    isAuth: (s) => !!s.token,
    role: (s) => s.user?.role || 'GUEST',
  },
  actions: {
    async login(email, password) {
      const { data } = await api.post('/auth/login', { email, password });
      this.setSession(data.data);
    },
    async register(payload) {
      const { data } = await api.post('/auth/register', payload);
      this.setSession(data.data);
    },
    setSession({ user, token }) {
      this.user = user;
      this.token = token;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});
