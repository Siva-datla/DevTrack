import api from './client';

export const contestsApi = {
  getContests: async (platform) => {
    const params = platform ? { platform } : {};
    const response = await api.get('/contests', { params });
    return response.data;
  },

  getRatingHistory: async (params = {}) => {
    const response = await api.get('/contests/rating-history', { params });
    return response.data;
  },
};

export default contestsApi;
