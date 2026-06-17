import { api } from './api';

export const profileService = {
  get: () => api.get('/profile').then((r) => r.data.data),
  getById: (id) => api.get(`/users/${id}`).then((r) => r.data.data),
  update: (data) => api.patch('/profile', data).then((r) => r.data.data),
};
