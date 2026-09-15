import DashboardService from '../services/dashboardService.js';

export const getStats = async (req, res, next) => {
  try {
    // Looks for /:identifier OR ?username=... OR req.user
    const identifier = req.params.identifier || req.query.username || req.query.userId || req.user?.id;
    const userId = await DashboardService.resolveUserId(identifier);

    if (!userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: `No user found matching "${identifier || 'default'}"` },
      });
    }

    const stats = await DashboardService.getOverviewStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

export const getHeatmap = async (req, res, next) => {
  try {
    const identifier = req.params.identifier || req.query.username || req.query.userId || req.user?.id;
    const userId = await DashboardService.resolveUserId(identifier);

    if (!userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: `No user found matching "${identifier || 'default'}"` },
      });
    }

    const heatmap = await DashboardService.getHeatmapData(userId);

    res.status(200).json({
      success: true,
      data: heatmap,
    });
  } catch (err) {
    next(err);
  }
};

export const getTopics = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Topic analysis endpoint',
  });
};

export const getDifficulty = async (req, res, next) => {
  try {
    const identifier = req.params.identifier || req.query.username || req.query.userId || req.user?.id;
    const userId = await DashboardService.resolveUserId(identifier);

    if (!userId) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: `No user found matching "${identifier || 'default'}"` },
      });
    }

    const stats = await DashboardService.getOverviewStats(userId);

    res.status(200).json({
      success: true,
      data: stats.difficulty,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getStats,
  getHeatmap,
  getTopics,
  getDifficulty,
};