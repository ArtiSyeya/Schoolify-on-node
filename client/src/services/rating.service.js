import { api } from './api';

export const ratingService = {
  get: (period = 'all') => api.get('/rating', { params: { period } }).then((r) => r.data.data),
};
