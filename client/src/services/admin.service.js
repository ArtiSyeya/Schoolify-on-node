import { api } from './api';

export const adminService = {
  listUsers: (params = {}) => api.get('/admin/users', { params }).then((r) => r.data.data.items),
  setRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data.data),
  setBlocked: (id, isBlocked) =>
    api.patch(`/admin/users/${id}/block`, { isBlocked }).then((r) => r.data.data),
};
