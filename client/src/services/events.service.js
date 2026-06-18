import { api } from './api';

export const eventsService = {
  list: (params = {}) => api.get('/events', { params }).then((r) => r.data.data.items),
  getById: (id) => api.get(`/events/${id}`).then((r) => r.data.data),

  // Кабинет организатора
  mine: () => api.get('/events/mine').then((r) => r.data.data.items),
  create: (data) => api.post('/events', data).then((r) => r.data.data),
  update: (id, data) => api.put(`/events/${id}`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/events/${id}`),
  participants: (id) => api.get(`/events/${id}/participants`).then((r) => r.data.data.items),
  exportParticipants: (id) => api.get(`/events/${id}/participants/export`, { responseType: 'blob' }),
  setAttendance: (eventId, registrationId, attended) =>
    api
      .patch(`/events/${eventId}/participants/${registrationId}`, { attended })
      .then((r) => r.data.data),
};
