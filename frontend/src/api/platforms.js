import api from './client';

export const platformsApi = {
  getPlatforms: async () => {
    const response = await api.get('/platforms');
    return response.data;
  },

  addPlatform: async (platform, username) => {
    const response = await api.post('/platforms', {
      platform: platform.toUpperCase(),
      username: username.trim(),
    });
    return response.data;
  },

  deletePlatform: async (platform, purge = true) => {
    const response = await api.delete(`/platforms/${platform.toUpperCase()}`, {
      params: { purge },
    });
    return response.data;
  },

  syncPlatform: async (platform) => {
    const response = await api.post(`/platforms/${platform.toUpperCase()}/sync-account`);
    return response.data;
  },

  getPlatformStatus: async (platform) => {
    const response = await api.get(`/platforms/${platform.toUpperCase()}/status`);
    return response.data;
  },
};

export default platformsApi;
