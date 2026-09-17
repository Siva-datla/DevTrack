import mongoose from 'mongoose';
import User from '../models/User.js';
import PlatformAccount from '../models/PlatformAccount.js';
import Submission from '../models/Submission.js';

/**
 * Admin: Get all users with linked platform counts and pagination.
 * GET /api/admin/users
 */
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    ]);

    const userIds = users.map((u) => u._id);
    const [accounts, subCounts] = await Promise.all([
      PlatformAccount.find({ userId: { $in: userIds } }).select('userId platform username syncStatus rating').lean(),
      Submission.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
      ]),
    ]);

    const accountMap = new Map();
    for (const acc of accounts) {
      const uId = acc.userId.toString();
      if (!accountMap.has(uId)) accountMap.set(uId, []);
      accountMap.get(uId).push(acc);
    }

    const subCountMap = new Map();
    for (const item of subCounts) {
      subCountMap.set(item._id.toString(), item.count);
    }

    const enrichedUsers = users.map((u) => {
      const uId = u._id.toString();
      return {
        ...u,
        platforms: accountMap.get(uId) || [],
        submissionCount: subCountMap.get(uId) || 0,
      };
    });

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
      data: enrichedUsers,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Update user role or status.
 * PATCH /api/admin/users/:id/status
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid user ID format.' },
      });
    }

    if (role && !['USER', 'ADMIN'].includes(role.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE', message: 'Role must be either USER or ADMIN.' },
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found.' },
      });
    }

    if (role) {
      user.role = role.toUpperCase();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User status/role updated successfully.`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get system-wide platform statistics.
 * GET /api/admin/stats
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalAccounts,
      accountsByPlatformAgg,
      totalSubmissions,
      acceptedSubmissions,
      syncStatusAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'ADMIN' }),
      PlatformAccount.countDocuments(),
      PlatformAccount.aggregate([
        { $group: { _id: '$platform', count: { $sum: 1 } } },
      ]),
      Submission.countDocuments(),
      Submission.countDocuments({ verdict: 'ACCEPTED' }),
      PlatformAccount.aggregate([
        { $group: { _id: '$syncStatus', count: { $sum: 1 } } },
      ]),
    ]);

    const accountsByPlatform = {
      CODEFORCES: 0,
      LEETCODE: 0,
      HACKERRANK: 0,
    };
    accountsByPlatformAgg.forEach((item) => {
      accountsByPlatform[item._id] = item.count;
    });

    const syncStatusCounts = {
      SUCCESS: 0,
      FAILED: 0,
      SYNCING: 0,
      PENDING: 0,
    };
    syncStatusAgg.forEach((item) => {
      syncStatusCounts[item._id] = item.count;
    });

    const acceptanceRate = totalSubmissions > 0
      ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          regularUsers: totalUsers - totalAdmins,
        },
        platforms: {
          totalAccounts,
          byPlatform: accountsByPlatform,
          syncStatus: syncStatusCounts,
        },
        submissions: {
          total: totalSubmissions,
          accepted: acceptedSubmissions,
          acceptanceRate: `${acceptanceRate}%`,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get synchronization logs / statuses.
 * GET /api/admin/sync-logs
 */
export const getSyncLogs = async (req, res, next) => {
  try {
    const { limit = 50, platform, status } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

    const filter = {};
    if (platform) filter.platform = platform.toUpperCase();
    if (status) filter.syncStatus = status.toUpperCase();

    const accounts = await PlatformAccount.find(filter)
      .populate('userId', 'name email role')
      .sort({ updatedAt: -1 })
      .limit(limitNum)
      .lean();

    const logs = accounts.map((acc) => ({
      accountId: acc._id,
      user: acc.userId
        ? { id: acc.userId._id, name: acc.userId.name, email: acc.userId.email }
        : null,
      platform: acc.platform,
      username: acc.username,
      syncStatus: acc.syncStatus,
      totalSolved: acc.totalSolved,
      rating: acc.rating,
      lastSyncedAt: acc.lastSyncedAt,
      updatedAt: acc.updatedAt,
    }));

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getUsers,
  updateUserStatus,
  getAdminStats,
  getSyncLogs,
};
