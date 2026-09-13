/**
 * Contests & Ratings Controller
 * Handles contest tracking and cross-platform rating histories.
 */

export const getContests = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get contests list template'
  });
};

export const getRatingHistory = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get rating history template'
  });
};

export default {
  getContests,
  getRatingHistory
};
