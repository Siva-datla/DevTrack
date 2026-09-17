import User from '../models/User.js';
import PlatformAccount from '../models/PlatformAccount.js';
import Submission from '../models/Submission.js';
import { calculateStreaks } from '../services/dashboardService.js';

/**
 * Leaderboard Controller
 * Handles global and platform-specific ranking leaderboards.
 */
export const getLeaderboard = async (req, res, next) => {
  try {
    const {
      sortBy = 'solved',
      platform = 'ALL',
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const platformUpper = platform.toUpperCase();

    // 1. Fetch users
    const users = await User.find({}).select('name email role createdAt').lean();
    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        pagination: { total: 0, page: pageNum, limit: limitNum, pages: 0 },
        data: [],
      });
    }

    // 2. Fetch platform accounts for all users
    const userIds = users.map((u) => u._id);
    const platformAccounts = await PlatformAccount.find({
      userId: { $in: userIds },
    }).lean();

    const accountsByUser = new Map();
    for (const acc of platformAccounts) {
      const uId = acc.userId.toString();
      if (!accountsByUser.has(uId)) {
        accountsByUser.set(uId, []);
      }
      accountsByUser.get(uId).push(acc);
    }

    // 3. Aggregate unique solved problem counts per user
    const submissionFilter = { verdict: 'ACCEPTED' };
    if (platformUpper !== 'ALL') {
      submissionFilter.platform = platformUpper;
    }

    const solvedAgg = await Submission.aggregate([
      { $match: submissionFilter },
      { $group: { _id: { userId: '$userId', problemId: '$problemId' } } },
      { $group: { _id: '$_id.userId', uniqueSolved: { $sum: 1 } } },
    ]);

    const solvedMap = new Map();
    for (const item of solvedAgg) {
      solvedMap.set(item._id.toString(), item.uniqueSolved);
    }

    // 4. Calculate streaks per user from accepted submissions
    const activeDatesAgg = await Submission.aggregate([
      { $match: { verdict: 'ACCEPTED' } },
      {
        $project: {
          userId: 1,
          dateStr: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
        },
      },
      { $group: { _id: { userId: '$userId', dateStr: '$dateStr' } } },
      { $sort: { '_id.dateStr': 1 } },
      {
        $group: {
          _id: '$_id.userId',
          dates: { $push: '$_id.dateStr' },
        },
      },
    ]);

    const streakMap = new Map();
    for (const item of activeDatesAgg) {
      const { currentStreak, longestStreak } = calculateStreaks(item.dates);
      streakMap.set(item._id.toString(), { currentStreak, longestStreak });
    }

    // 5. Build unified leaderboard entry for each user
    let leaderboard = users.map((user) => {
      const uId = user._id.toString();
      const accounts = accountsByUser.get(uId) || [];

      // Filter accounts if platform-specific
      const filteredAccounts = platformUpper === 'ALL'
        ? accounts
        : accounts.filter((a) => a.platform === platformUpper);

      const ratings = filteredAccounts
        .map((a) => a.rating)
        .filter((r) => typeof r === 'number' && !isNaN(r));
      const highestRating = ratings.length > 0 ? Math.max(...ratings) : null;

      const userStreaks = streakMap.get(uId) || { currentStreak: 0, longestStreak: 0 };
      const uniqueSolved = solvedMap.get(uId) || 0;

      return {
        userId: user._id,
        name: user.name,
        role: user.role,
        platforms: filteredAccounts.map((a) => ({
          platform: a.platform,
          username: a.username,
          rating: a.rating,
          totalSolved: a.totalSolved,
        })),
        totalSolved: uniqueSolved,
        currentStreak: userStreaks.currentStreak,
        longestStreak: userStreaks.longestStreak,
        peakRating: highestRating,
      };
    });

    // If filtering by specific platform, exclude users with zero accounts on that platform
    if (platformUpper !== 'ALL') {
      leaderboard = leaderboard.filter((u) => u.platforms.length > 0);
    }

    // 6. Sort according to sortBy parameter
    const sortField = sortBy.toLowerCase();
    leaderboard.sort((a, b) => {
      if (sortField === 'rating') {
        return (b.peakRating || 0) - (a.peakRating || 0);
      }
      if (sortField === 'streak') {
        return (b.currentStreak || 0) - (a.currentStreak || 0);
      }
      // default: solved
      return (b.totalSolved || 0) - (a.totalSolved || 0);
    });

    // Assign overall rank position before slicing
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    const total = leaderboard.length;
    const paginatedData = leaderboard.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
      sortBy: sortField,
      platform: platformUpper,
      data: paginatedData,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getLeaderboard,
};
