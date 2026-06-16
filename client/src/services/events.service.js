import { api } from './api';

export const eventsService = {
  list: () => api.get('/events').then((r) => r.data.data.items),
  getById: (id) => api.get(`/events/${id}`).then((r) => r.data.data),
};
