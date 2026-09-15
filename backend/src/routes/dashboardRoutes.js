import { Router } from 'express';
import {
  getStats,
  getHeatmap,
  getTopics,
  getDifficulty,
} from '../controllers/dashboardController.js';

const router = Router();

// 1. Current / Default User Dashboard
router.get('/stats', getStats);
router.get('/heatmap', getHeatmap);
router.get('/topics', getTopics);
router.get('/difficulty', getDifficulty);

// 2. Specific User Dashboard (by handle or userId)
router.get('/:identifier/stats', getStats);
router.get('/:identifier/heatmap', getHeatmap);
router.get('/:identifier/difficulty', getDifficulty);
router.get('/:identifier', getStats);
export default router;