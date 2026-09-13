/**
 * Leaderboard Controller
 * Handles global and friend ranking leaderboards.
 */

export const getLeaderboard = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get leaderboard template'
  });
};

export default {
  getLeaderboard
};
