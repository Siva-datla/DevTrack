import CodeforcesService from '../services/platforms/codeforcesService.js';
import LeetCodeService from '../services/platforms/leetcodeService.js';
import SyncService from '../services/syncService.js';
import {
  normalizeCodeforcesProfile,
  normalizeCodeforcesSubmission,
  normalizeLeetCodeProfile,
  normalizeLeetCodeContestRanking,
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

// --- Legacy / Generic Handlers ---

export const getPlatforms = async (req, res) => {
  res.status(200).json({ success: true, message: 'Get linked platforms template' });
};

export const addPlatform = async (req, res) => {
  res.status(200).json({ success: true, message: 'Link new platform template' });
};

export const deletePlatform = async (req, res) => {
  res.status(200).json({ success: true, message: `Unlink platform ${req.params.platform} template` });
};

export const syncPlatform = async (req, res) => {
  res.status(200).json({ success: true, message: `Sync platform ${req.params.platform} template` });
};

export const getPlatformStatus = async (req, res) => {
  res.status(200).json({ success: true, message: `Get platform ${req.params.platform} status template` });
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
  getPlatforms,
  addPlatform,
  deletePlatform,
  syncPlatform,
  getPlatformStatus,
};