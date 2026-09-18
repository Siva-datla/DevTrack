import api from './client';

export const dashboardApi = {
  getStats: async (identifier) => {
    const url = identifier ? `/dashboard/${identifier}/stats` : '/dashboard/stats';
    const response = await api.get(url);
    return response.data;
  },

  getHeatmap: async (identifier) => {
    const url = identifier ? `/dashboard/${identifier}/heatmap` : '/dashboard/heatmap';
    const response = await api.get(url);
    return response.data;
  },

  getTopics: async (identifier) => {
    const url = identifier ? `/dashboard/${identifier}/topics` : '/dashboard/topics';
    const response = await api.get(url);
    return response.data;
  },

  getDifficulty: async (identifier) => {
    const url = identifier ? `/dashboard/${identifier}/difficulty` : '/dashboard/difficulty';
    const response = await api.get(url);
    return response.data;
  },
};

export default dashboardApi;
