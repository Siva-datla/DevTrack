import CodeforcesService from '../services/platforms/codeforcesService.js';
import LeetCodeService from '../services/platforms/leetcodeService.js';
import HackerRankService from '../services/platforms/hackerrankService.js';
import SyncService from '../services/syncService.js';
import DashboardService from '../services/dashboardService.js';
import PlatformAccount from '../models/PlatformAccount.js';
import Submission from '../models/Submission.js';
import {
  normalizeCodeforcesProfile,
  normalizeCodeforcesSubmission,
  normalizeLeetCodeProfile,
  normalizeLeetCodeContestRanking,
  normalizeHackerRankProfile,
  normalizeHackerRankSubmission,
} from '../utils/normalizer.js';

// --- Codeforces Controllers ---

export const getCodeforcesProfile = async (req, res, next) => {
  try {
    const { handle } = req.params;
    const rawProfile = await CodeforcesService.getUserInfo(handle);
    const profile = normalizeCodeforcesProfile(rawProfile);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

export const getCodeforcesSubmissions = async (req, res, next) => {
  try {
    const { handle } = req.params;
    const count = req.query.count ? parseInt(req.query.count, 10) : 1000;
    const rawSubs = await CodeforcesService.getSubmissions(handle, count);
    const submissions = rawSubs.map((sub) => normalizeCodeforcesSubmission(sub));

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (err) {
    next(err);
  }
};

export const getCodeforcesRatingHistory = async (req, res, next) => {
  try {
    const { handle } = req.params;
    const history = await CodeforcesService.getRatingHistory(handle);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (err) {
    next(err);
  }
};

export const syncCodeforces = async (req, res, next) => {
  try {
    const handle = req.body.handle || req.body.username;
    if (!handle) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Handle or username is required in request body' },
      });
    }

    const result = await SyncService.syncCodeforces(handle);

    res.status(200).json({
      success: true,
      message: 'Codeforces account synced successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// --- LeetCode Controllers ---

export const getLeetCodeProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const rawProfile = await LeetCodeService.getUserProfile(username);
    const profile = normalizeLeetCodeProfile(rawProfile);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

export const getLeetCodeSubmissions = async (req, res, next) => {
  try {
    const { username } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    const submissions = await LeetCodeService.getRecentSubmissions(username, limit);

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (err) {
    next(err);
  }
};

export const getLeetCodeRatingHistory = async (req, res, next) => {
  try {
    const { username } = req.params;
    const rankingData = await LeetCodeService.getContestRanking(username);
    const normalized = normalizeLeetCodeContestRanking(rankingData);

    res.status(200).json({
      success: true,
      data: normalized?.history || rankingData.userContestRankingHistory || [],
    });
  } catch (err) {
    next(err);
  }
};

export const getLeetCodeContestRanking = async (req, res, next) => {
  try {
    const { username } = req.params;
    const rankingData = await LeetCodeService.getContestRanking(username);
    const normalized = normalizeLeetCodeContestRanking(rankingData);

    res.status(200).json({
      success: true,
      data: normalized || rankingData,
    });
  } catch (err) {
    next(err);
  }
};

export const syncLeetCode = async (req, res, next) => {
  try {
    const username = req.body.username || req.body.handle;
    if (!username) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Username is required in request body' },
      });
    }

    const result = await SyncService.syncLeetCode(username);

    res.status(200).json({
      success: true,
      message: 'LeetCode account synced successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// --- HackerRank Controllers ---

export const getHackerRankProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { profile, badges, scores } = await HackerRankService.getUserFullData(username);
    const normalized = normalizeHackerRankProfile(profile, badges, scores);

    res.status(200).json({
      success: true,
      data: normalized,
    });
  } catch (err) {
    next(err);
  }
};

export const getHackerRankBadges = async (req, res, next) => {
  try {
    const { username } = req.params;
    const badges = await HackerRankService.getBadges(username);

    res.status(200).json({
      success: true,
      count: badges.length,
      data: badges,
    });
  } catch (err) {
    next(err);
  }
};

export const getHackerRankScores = async (req, res, next) => {
  try {
    const { username } = req.params;
    const scores = await HackerRankService.getScores(username);

    res.status(200).json({
      success: true,
      data: scores,
    });
  } catch (err) {
    next(err);
  }
};

export const getHackerRankSubmissions = async (req, res, next) => {
  try {
    const { username } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    const challenges = await HackerRankService.getRecentChallenges(username, limit);
    const submissions = challenges.map((ch) => normalizeHackerRankSubmission(ch));

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (err) {
    next(err);
  }
};

export const syncHackerRank = async (req, res, next) => {
  try {
    const username = req.body.username || req.body.handle;
    if (!username) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Username is required in request body' },
      });
    }

    const userId = req.user?._id || req.user?.id || null;
    const result = await SyncService.syncHackerRank(username, userId);

    res.status(200).json({
      success: true,
      message: 'HackerRank account synced successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// --- Platform Account Management Handlers ---

export const getPlatforms = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id || (await DashboardService.resolveUserId());
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const platforms = await PlatformAccount.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: platforms.length,
      data: platforms,
    });
  } catch (err) {
    next(err);
  }
};

export const addPlatform = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id || (await DashboardService.resolveUserId());
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    let { platform, username, handle } = req.body;
    username = (username || handle || '').trim();

    if (!platform || !username) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Platform and username/handle are required.' },
      });
    }

    const normPlatform = String(platform).toUpperCase();
    const validPlatforms = ['CODEFORCES', 'LEETCODE', 'HACKERRANK'];
    if (!validPlatforms.includes(normPlatform)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UNSUPPORTED_PLATFORM',
          message: `Platform "${platform}" is not supported. Supported platforms: ${validPlatforms.join(', ')}.`,
        },
      });
    }

    // Trigger platform sync and validation
    let syncResult;
    if (normPlatform === 'CODEFORCES') {
      syncResult = await SyncService.syncCodeforces(username, userId);
    } else if (normPlatform === 'LEETCODE') {
      syncResult = await SyncService.syncLeetCode(username, userId);
    } else if (normPlatform === 'HACKERRANK') {
      syncResult = await SyncService.syncHackerRank(username, userId);
    }

    const account = await PlatformAccount.findOne({ userId, platform: normPlatform });

    res.status(201).json({
      success: true,
      message: `Successfully linked and synced ${normPlatform} account @${username}`,
      data: {
        account,
        syncResult,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deletePlatform = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id || (await DashboardService.resolveUserId());
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const normPlatform = String(req.params.platform || '').toUpperCase();
    const account = await PlatformAccount.findOneAndDelete({ userId, platform: normPlatform });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PLATFORM_NOT_LINKED',
          message: `No linked account found for platform "${req.params.platform}".`,
        },
      });
    }

    // Also optionally purge synced submissions for that platform and user
    const purge = req.query.purge !== 'false';
    let purgedCount = 0;
    if (purge) {
      const deleteResult = await Submission.deleteMany({ userId, platform: normPlatform });
      purgedCount = deleteResult.deletedCount;
    }

    res.status(200).json({
      success: true,
      message: `Successfully unlinked ${normPlatform} account @${account.username}`,
      purgedSubmissions: purgedCount,
    });
  } catch (err) {
    next(err);
  }
};

export const syncPlatform = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id || (await DashboardService.resolveUserId());
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const normPlatform = String(req.params.platform || '').toUpperCase();
    const account = await PlatformAccount.findOne({ userId, platform: normPlatform });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PLATFORM_NOT_LINKED',
          message: `No linked account found for platform "${req.params.platform}".`,
        },
      });
    }

    let syncResult;
    if (normPlatform === 'CODEFORCES') {
      syncResult = await SyncService.syncCodeforces(account.username, userId);
    } else if (normPlatform === 'LEETCODE') {
      syncResult = await SyncService.syncLeetCode(account.username, userId);
    } else if (normPlatform === 'HACKERRANK') {
      syncResult = await SyncService.syncHackerRank(account.username, userId);
    }

    const updatedAccount = await PlatformAccount.findOne({ userId, platform: normPlatform });

    res.status(200).json({
      success: true,
      message: `Successfully synchronized ${normPlatform} account @${account.username}`,
      data: {
        account: updatedAccount,
        syncResult,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPlatformStatus = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id || (await DashboardService.resolveUserId());
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const normPlatform = String(req.params.platform || '').toUpperCase();
    const account = await PlatformAccount.findOne({ userId, platform: normPlatform });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PLATFORM_NOT_LINKED',
          message: `No linked account found for platform "${req.params.platform}".`,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getCodeforcesProfile,
  getCodeforcesSubmissions,
  getCodeforcesRatingHistory,
  syncCodeforces,
  getLeetCodeProfile,
  getLeetCodeSubmissions,
  getLeetCodeRatingHistory,
  getLeetCodeContestRanking,
  syncLeetCode,
  getHackerRankProfile,
  getHackerRankBadges,
  getHackerRankScores,
  getHackerRankSubmissions,
  syncHackerRank,
  getPlatforms,
  addPlatform,
  deletePlatform,
  syncPlatform,
  getPlatformStatus,
};