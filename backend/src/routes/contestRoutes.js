import { Router } from 'express';
import { optionalAuth } from '../middleware/authMiddleware.js';
import {
  getContests,
  getRatingHistory
} from '../controllers/contestController.js';

const router = Router();

router.get('/', optionalAuth, getContests);
router.get('/rating-history', optionalAuth, getRatingHistory);

export default router;
