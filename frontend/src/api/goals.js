import api from './client';

export const goalsApi = {
  getGoals: async (params = {}) => {
    const response = await api.get('/goals', { params });
    return response.data;
  },

  createGoal: async (goalData) => {
    const response = await api.post('/goals', goalData);
    return response.data;
  },

  getGoalById: async (id) => {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },

  updateGoal: async (id, goalData) => {
    const response = await api.put(`/goals/${id}`, goalData);
    return response.data;
  },

  deleteGoal: async (id) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },
};

export default goalsApi;
