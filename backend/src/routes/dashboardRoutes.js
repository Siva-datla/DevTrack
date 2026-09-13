import { Router } from 'express';
import {
  getStats,
  getHeatmap,
  getTopics,
  getDifficulty
} from '../controllers/dashboardController.js';

const router = Router();

router.get('/stats', getStats);
router.get('/heatmap', getHeatmap);
router.get('/topics', getTopics);
router.get('/difficulty', getDifficulty);

export default router;
