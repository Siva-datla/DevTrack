import api from './client';

export const adminApi = {
  getAdminStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (id, data) => {
    const response = await api.patch(`/admin/users/${id}/status`, data);
    return response.data;
  },

  getSyncLogs: async (params = {}) => {
    const response = await api.get('/admin/sync-logs', { params });
    return response.data;
  },
};

export default adminApi;
