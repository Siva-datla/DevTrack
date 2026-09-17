import { Router } from 'express';
import { optionalAuth } from '../middleware/authMiddleware.js';
import {
 getLeaderboard
} from '../controllers/leaderboardController.js';

const router = Router();

router.get('/', optionalAuth, getLeaderboard);

export default router;
