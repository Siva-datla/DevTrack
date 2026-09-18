import api from './client';

export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  logout: async (refreshToken) => {
    try {
      const response = await api.post('/auth/logout', { refreshToken });
      return response.data;
    } catch {
      // Graceful local cleanup even if remote call fails
      return { success: true };
    }
  },

  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateMe: async (userData) => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },
};

export default authApi;
