import { Router } from 'express';
import {
  getContests,
  getRatingHistory
} from '../controllers/contestController.js';

const router = Router();

router.get('/', getContests);
router.get('/rating-history', getRatingHistory);

export default router;
