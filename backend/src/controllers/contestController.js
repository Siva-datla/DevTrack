import ContestService from '../services/contestService.js';
import DashboardService from '../services/dashboardService.js';

/**
 * Contests & Ratings Controller
 * Handles contest tracking and cross-platform rating histories.
 */

export const getContests = async (req, res, next) => {
  try {
    const { platform } = req.query;
    let contests = await ContestService.getContests();

    if (platform) {
      const pUpper = platform.toUpperCase();
      contests = contests.filter((c) => c.platform === pUpper);
    }

    res.status(200).json({
      success: true,
      count: contests.length,
      data: contests,
    });
  } catch (err) {
    next(err);
  }
};

export const getRatingHistory = async (req, res, next) => {
  try {
    const identifier = req.query.username || req.query.userId || req.user?._id || req.user?.id;
    const userId = await DashboardService.resolveUserId(identifier);

    if (!userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: `No user found for rating history query.` },
      });
    }

    const ratingHistoryData = await ContestService.getRatingHistory(userId);

    res.status(200).json({
      success: true,
      data: ratingHistoryData,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getContests,
  getRatingHistory,
};
