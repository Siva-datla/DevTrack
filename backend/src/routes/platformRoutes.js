import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import SyncService from '../services/syncService.js';
import {
  getPlatforms,
  addPlatform,
  deletePlatform,
  syncPlatform,
  getPlatformStatus,
  syncCodeforces,
  getCodeforcesProfile,
  getCodeforcesSubmissions,
  getCodeforcesRatingHistory,
  syncLeetCode,
  getLeetCodeProfile,
  getLeetCodeSubmissions,
  getLeetCodeRatingHistory,
  getLeetCodeContestRanking,
  syncHackerRank,
  getHackerRankProfile,
  getHackerRankBadges,
  getHackerRankScores,
  getHackerRankSubmissions,
} from '../controllers/platformController.js';

const router = Router();

// --- Platform Account Management (Linked Accounts) ---
router.get('/', optionalAuth, getPlatforms);
router.post('/', requireAuth, addPlatform);
router.delete('/:platform', requireAuth, deletePlatform);
router.post('/:platform/sync-account', requireAuth, syncPlatform);
router.get('/:platform/status', optionalAuth, getPlatformStatus);


// --- Codeforces Routes ---
router.get('/codeforces/:handle', getCodeforcesProfile);
router.get('/codeforces/:handle/submissions', getCodeforcesSubmissions);
router.get('/codeforces/:handle/rating-history', getCodeforcesRatingHistory);
router.post('/codeforces/sync', syncCodeforces);

// Browser-friendly sync via GET:
router.get('/codeforces/:handle/sync', async (req, res, next) => {
  try {
    const { handle } = req.params;
    const result = await SyncService.syncCodeforces(handle);
    res.status(200).json({
      success: true,
      message: `Successfully synchronized Codeforces account @${handle}`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});


// --- LeetCode Routes ---
router.get('/leetcode/:username', getLeetCodeProfile);
router.get('/leetcode/:username/submissions', getLeetCodeSubmissions);
router.get('/leetcode/:username/rating-history', getLeetCodeRatingHistory);
router.get('/leetcode/:username/contest-ranking', getLeetCodeContestRanking);
router.post('/leetcode/sync', syncLeetCode);

// Browser-friendly LeetCode sync via GET:
router.get('/leetcode/:username/sync', async (req, res, next) => {
  try {
    const { username } = req.params;
    const result = await SyncService.syncLeetCode(username);
    res.status(200).json({
      success: true,
      message: `Successfully synchronized LeetCode account @${username}`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});


// --- HackerRank Routes ---
router.get('/hackerrank/:username', getHackerRankProfile);
router.get('/hackerrank/:username/badges', getHackerRankBadges);
router.get('/hackerrank/:username/scores', getHackerRankScores);
router.get('/hackerrank/:username/submissions', getHackerRankSubmissions);
router.post('/hackerrank/sync', syncHackerRank);

// Browser-friendly HackerRank sync via GET:
router.get('/hackerrank/:username/sync', async (req, res, next) => {
  try {
    const { username } = req.params;
    const result = await SyncService.syncHackerRank(username);
    res.status(200).json({
      success: true,
      message: `Successfully synchronized HackerRank account @${username}`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

export default router;