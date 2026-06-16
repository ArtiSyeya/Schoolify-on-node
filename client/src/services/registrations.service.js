import { api } from './api';

export const registrationsService = {
  register: (eventId) => api.post(`/events/${eventId}/register`).then((r) => r.data.data),
  cancel: (registrationId) => api.delete(`/registrations/${registrationId}`),
  my: () => api.get('/registrations/my').then((r) => r.data.data.items),
};
