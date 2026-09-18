import api from './client';

export const problemsApi = {
  getProblems: async (params = {}) => {
    const response = await api.get('/problems', { params });
    return response.data;
  },

  getProblemById: async (id) => {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },
};

export default problemsApi;
