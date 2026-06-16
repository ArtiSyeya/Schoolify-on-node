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
      this.user = data.data.user;
      this.token = data.data.token;
      localStorage.setItem('user', JSON.stringify(this.user));
      localStorage.setItem('token', this.token);
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});
