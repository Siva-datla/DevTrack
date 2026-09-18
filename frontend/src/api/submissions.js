import api from './client';

export const submissionsApi = {
  getSubmissions: async (params = {}) => {
    const response = await api.get('/submissions', { params });
    return response.data;
  },

  getSubmissionsStats: async (params = {}) => {
    const response = await api.get('/submissions/stats', { params });
    return response.data;
  },

  getSubmissionById: async (id) => {
    const response = await api.get(`/submissions/${id}`);
    return response.data;
  },
};

export default submissionsApi;
