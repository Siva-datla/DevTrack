import api from './client';

export const leaderboardApi = {
  getLeaderboard: async (params = {}) => {
    const response = await api.get('/leaderboard', { params });
    return response.data;
  },
};

export default leaderboardApi;
