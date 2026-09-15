import { Router } from 'express';
import { optionalAuth } from '../middleware/authMiddleware.js';
import {
  getSubmissions,
  getSubmissionsStats,
  getSubmissionById,
} from '../controllers/submissionController.js';

const router = Router();

router.get('/stats', optionalAuth, getSubmissionsStats);
router.get('/', optionalAuth, getSubmissions);
router.get('/:id', optionalAuth, getSubmissionById);

export default router;

