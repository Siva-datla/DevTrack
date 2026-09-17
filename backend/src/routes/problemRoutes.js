import { Router } from 'express';
import { optionalAuth } from '../middleware/authMiddleware.js';
import {
  getProblems,
  getProblemById
} from '../controllers/problemController.js';

const router = Router();

router.get('/', optionalAuth, getProblems);
router.get('/:id', optionalAuth, getProblemById);

export default router;
