import { Router } from 'express';
import SyncService from '../services/syncService.js';
import {
  syncCodeforces,
  getCodeforcesProfile,
  getCodeforcesSubmissions,
  getCodeforcesRatingHistory,
  syncLeetCode,
  getLeetCodeProfile,
  getLeetCodeSubmissions,
  getLeetCodeRatingHistory,
  getLeetCodeContestRanking,
} from '../controllers/platformController.js';

const router = Router();

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

export default router;